package expo.modules.blinkquestvision

import android.content.Context
import android.graphics.Bitmap
import android.os.SystemClock
import androidx.camera.core.ImageProxy
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult
import com.mrousavy.camera.frameprocessors.Frame
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicLong

/**
 * Owns the single MediaPipe Face Landmarker instance and turns VisionCamera
 * frames into compact landmark events for JavaScript.
 *
 * This layer deliberately does NOT compute blink, PERCLOS or any other
 * temporal metric. It only reports what the model returned for each frame
 * (landmarks, blendshape scores, transformation matrix) plus timing, so the
 * TypeScript observation engine (src/core/vision/observation-engine.ts) is the
 * single source of metric truth.
 */
object BlinkQuestVisionRuntime {
  private const val MODEL_FILE = "face_landmarker.task"
  const val MODEL_ID = "mediapipe-face-landmarker-v2-float16"

  // ~20 Hz inference: blinks last 100–300 ms, so this sees 2–6 frames of each
  // (the earlier 8 Hz cadence often saw a blink on zero or one frame).
  private const val MIN_FRAME_INTERVAL_MS = 50L
  // Frames are inferred at the camera's 720p as-is: at smaller sizes the eye
  // region loses detail and blink scores flatten.
  // Frames darker than this mean luma (0–255) get a brightness gain.
  private const val LOW_LIGHT_LUMA = 85.0
  private const val TARGET_LUMA = 120.0
  private const val MAX_GAIN = 2.6

  @Volatile private var lastMeanLuma = 0.0
  private val lowLightFrames = java.util.concurrent.atomic.AtomicLong(0)



  // If a detectAsync() call never reports back we stop waiting after this.
  private const val IN_FLIGHT_TIMEOUT_MS = 500L

  /**
   * Landmark indices sent to JS, in this exact order, as flat [x0, y0, x1, y1, ...]
   * normalised coordinates of the upright (rotated) frame. The order is mirrored
   * in src/core/vision/landmark-topology.ts — keep the two in sync.
   */
  private val TRACKED_INDICES = intArrayOf(
    // Face oval (36)
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
    152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
    // Image-left eye contour (subject's right eye) (16)
    33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7,
    // Image-right eye contour (subject's left eye) (16)
    263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249,
    // Brows (5 + 5)
    70, 63, 105, 66, 107,
    300, 293, 334, 296, 336,
    // Outer lips (20)
    61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146,
    // Nose bridge and tip (7)
    168, 6, 197, 195, 5, 4, 1,
    // Irises: centre + 4 ring points each (5 + 5)
    468, 469, 470, 471, 472,
    473, 474, 475, 476, 477,
  )

  private val BLENDSHAPES_OF_INTEREST = setOf(
    "eyeBlinkLeft", "eyeBlinkRight", "eyeSquintLeft", "eyeSquintRight", "eyeWideLeft", "eyeWideRight",
    // Eye-in-head gaze direction, used by the eye-controlled games.
    "eyeLookInLeft", "eyeLookOutLeft", "eyeLookUpLeft", "eyeLookDownLeft",
    "eyeLookInRight", "eyeLookOutRight", "eyeLookUpRight", "eyeLookDownRight",
  )

  private val lock = Any()
  private val frameInFlight = AtomicBoolean(false)

  @Volatile
  private var landmarker: FaceLandmarker? = null

  @Volatile
  private var eventSink: ((String, Map<String, Any>) -> Unit)? = null

  private var generation = 0L
  private var lastSubmittedTimestampMs = 0L


  // Runtime counters (reset on initialize). Read by getRuntimeStats().
  private val framesReceived = AtomicLong(0)
  private val framesThrottled = AtomicLong(0)
  private val framesDroppedBusy = AtomicLong(0)
  private val framesSubmitted = AtomicLong(0)
  private val resultsReceived = AtomicLong(0)
  private val facesDetected = AtomicLong(0)
  private val inferenceErrors = AtomicLong(0)
  private val latencySumMs = AtomicLong(0)
  @Volatile private var lastLatencyMs = 0L
  @Volatile private var modelInitMs = 0L
  @Volatile private var activeDelegate = "none"
  @Volatile private var lastFrameWidth = 0
  @Volatile private var lastFrameHeight = 0
  @Volatile private var lastError: String? = null

  /**
   * Whether leaving the app may enter system PiP. Set from JS only while a
   * scan is actively running; cleared on pause/stop so Home never opens an
   * empty PiP window after the user ended the session.
   */
  @Volatile
  var autoPipEnabled: Boolean = false

  fun attach(sink: (String, Map<String, Any>) -> Unit) {
    eventSink = sink
  }

  fun detach() {
    eventSink = null
  }

  fun isActive(): Boolean = synchronized(lock) { landmarker != null }

  fun initialize(context: Context): Boolean {
    val taskGeneration: Long
    synchronized(lock) {
      if (landmarker != null) return true
      generation += 1
      taskGeneration = generation
      lastSubmittedTimestampMs = 0L
    }
    frameInFlight.set(false)
    resetCounters()
    emitStatus("initializing")

    val started = SystemClock.uptimeMillis()
    return try {
      fun build(delegate: Delegate): FaceLandmarker {
        val baseOptions = BaseOptions.builder()
          .setModelAssetPath(MODEL_FILE)
          .setDelegate(delegate)
          .build()
        val options = FaceLandmarker.FaceLandmarkerOptions.builder()
          .setBaseOptions(baseOptions)
          .setRunningMode(RunningMode.LIVE_STREAM)
          .setNumFaces(1)
          // Lowered from the MediaPipe defaults (0.5/0.5/0.5): glasses frames and
          // lens glare reduce the model's own confidence near the eyes even when
          // the face is genuinely tracked, and this runtime's own blink detector
          // (observation-engine.ts) already adapts its threshold per person, so a
          // slightly less confident but present face is still useful to it.
          .setMinFaceDetectionConfidence(0.4f)
          .setMinFacePresenceConfidence(0.4f)
          .setMinTrackingConfidence(0.4f)
          .setOutputFaceBlendshapes(true)
          .setOutputFacialTransformationMatrixes(true)
          .setResultListener { result: FaceLandmarkerResult, _ -> onResult(taskGeneration, result) }
          .setErrorListener { error -> onError(taskGeneration, error) }
          .build()
        return FaceLandmarker.createFromOptions(context, options)
      }
      // GPU inference takes the heaviest work off the CPU (and off the threads
      // the UI competes with). Some GPUs/drivers can't run the delegate; those
      // fall back to the CPU (XNNPACK) path that was used before.
      val task = try {
        build(Delegate.GPU).also { activeDelegate = "gpu" }
      } catch (gpuError: Throwable) {
        android.util.Log.w("BlinkQuestVision", "GPU delegate unavailable, using CPU: ${gpuError.message}")
        build(Delegate.CPU).also { activeDelegate = "cpu" }
      }

      synchronized(lock) {
        if (taskGeneration != generation) {
          task.close()
          return false
        }
        landmarker = task
      }
      modelInitMs = SystemClock.uptimeMillis() - started
      emitStatus("ready")
      true
    } catch (error: Exception) {
      lastError = error.message
      emitStatus("error", error.message ?: "Face Landmarker initialization failed")
      false
    }
  }

  fun stop() {
    val task = synchronized(lock) {
      generation += 1
      val current = landmarker
      landmarker = null
      lastSubmittedTimestampMs = 0L
      current
    }
    frameInFlight.set(false)
    autoPipEnabled = false
    try {
      task?.close()
    } catch (_: Exception) {
      // Best-effort native cleanup; camera shutdown must still complete.
    }
    // Drop the pooled frames; they're never recycled (see frameToBitmap), so a
    // detectAsync() call still finishing can't touch freed pixels.
    synchronized(lock) {
      for (i in bitmapPool.indices) bitmapPool[i] = null
    }
    emitStatus("stopped")
  }

  fun processFrame(frame: Frame) {
    framesReceived.incrementAndGet()
    val nowMs = SystemClock.uptimeMillis()
    val task = synchronized(lock) {
      val activeLandmarker = landmarker ?: return
      if (nowMs - lastSubmittedTimestampMs < MIN_FRAME_INTERVAL_MS) {
        framesThrottled.incrementAndGet()
        return
      }
      if (!frameInFlight.compareAndSet(false, true)) {
        if (nowMs - lastSubmittedTimestampMs > IN_FLIGHT_TIMEOUT_MS) {
          frameInFlight.set(true)
        } else {
          framesDroppedBusy.incrementAndGet()
          return
        }
      }
      lastSubmittedTimestampMs = nowMs
      activeLandmarker
    }

    try {
      val imageProxy: ImageProxy = frame.imageProxy
      val bitmap = frameToBitmap(imageProxy, imageProxy.imageInfo.rotationDegrees)
      lastFrameWidth = bitmap.width
      lastFrameHeight = bitmap.height
      val image = BitmapImageBuilder(bitmap).build()
      framesSubmitted.incrementAndGet()
      task.detectAsync(image, nowMs)
    } catch (error: Exception) {
      frameInFlight.set(false)
      inferenceErrors.incrementAndGet()
      lastError = error.message
      android.util.Log.e("BlinkQuestVision", "Frame inference failed: ${error.message}", error)
      emitStatus("error", error.message ?: "Frame inference failed")
    }
  }

  // ── Allocation-free frame conversion ──────────────────────────────────
  // ImageProxy.toBitmap() plus a rotated copy (plus a brightened copy in dim
  // light) allocated 2–3 full 720p bitmaps per inference, ~20 times a second.
  // That garbage kept the GC busy and made the whole app stutter on phones
  // short of memory. Frames are now converted straight from YUV into one of a
  // few reused bitmaps, rotated and brightened in the same pass. Pooled bitmaps
  // are never recycled, so MediaPipe can't read freed pixels; three slots plus
  // the one-frame-in-flight rule mean a slot is never rewritten mid-read.
  private const val POOL_SIZE = 3
  private val bitmapPool = arrayOfNulls<Bitmap>(POOL_SIZE)
  private var poolIndex = 0
  private var argb = IntArray(0)
  private var yBytes = ByteArray(0)
  private var uBytes = ByteArray(0)
  private var vBytes = ByteArray(0)

  private fun copyPlane(buffer: java.nio.ByteBuffer, into: ByteArray): ByteArray {
    val b = buffer.duplicate()
    b.rewind()
    val target = if (into.size >= b.remaining()) into else ByteArray(b.remaining())
    b.get(target, 0, b.remaining())
    return target
  }

  private fun frameToBitmap(image: ImageProxy, rotation: Int): Bitmap {
    val w = image.width
    val h = image.height
    val planes = image.planes
    val yRow = planes[0].rowStride
    val yPix = planes[0].pixelStride
    val uvRow = planes[1].rowStride
    val uvPix = planes[1].pixelStride
    yBytes = copyPlane(planes[0].buffer, yBytes)
    uBytes = copyPlane(planes[1].buffer, uBytes)
    vBytes = copyPlane(planes[2].buffer, vBytes)

    // Mean luminance from a sparse 20×20 grid of the Y plane.
    var sum = 0L
    var n = 0
    val stepX = maxOf(1, w / 20)
    val stepY = maxOf(1, h / 20)
    var sy = stepY / 2
    while (sy < h) {
      var sx = stepX / 2
      while (sx < w) {
        sum += yBytes[sy * yRow + sx * yPix].toInt() and 0xFF
        n++
        sx += stepX
      }
      sy += stepY
    }
    val luma = if (n > 0) sum.toDouble() / n else 0.0
    lastMeanLuma = luma
    // Low light: brighten dim frames so the face model keeps finding the eyes.
    val gain = if (luma in 1.0..LOW_LIGHT_LUMA) (TARGET_LUMA / luma).coerceAtMost(MAX_GAIN) else 1.0
    val gainQ = (gain * 256).toInt()
    val boost = gainQ > 256
    if (boost) lowLightFrames.incrementAndGet()

    val rotated = rotation == 90 || rotation == 270
    val outW = if (rotated) h else w
    val outH = if (rotated) w else h
    if (argb.size != outW * outH) argb = IntArray(outW * outH)
    val px = argb

    // Destination index = base + y·perY + x·perX, matching Matrix.postRotate.
    val base: Int
    val perX: Int
    val perY: Int
    when (rotation) {
      90 -> { base = outW - 1; perX = outW; perY = -1 }
      180 -> { base = outW * outH - 1; perX = -1; perY = -outW }
      270 -> { base = (outH - 1) * outW; perX = -outW; perY = 1 }
      else -> { base = 0; perX = 1; perY = outW }
    }

    for (y in 0 until h) {
      val yOff = y * yRow
      val uvOff = (y shr 1) * uvRow
      var di = base + y * perY
      for (x in 0 until w) {
        val yy = yBytes[yOff + x * yPix].toInt() and 0xFF
        val ui = uvOff + (x shr 1) * uvPix
        val u = (uBytes[ui].toInt() and 0xFF) - 128
        val v = (vBytes[ui].toInt() and 0xFF) - 128
        var r = yy + ((1436 * v) shr 10)
        var g = yy - ((352 * u + 731 * v) shr 10)
        var b = yy + ((1815 * u) shr 10)
        if (boost) {
          r = ((r * gainQ) shr 8) + 8
          g = ((g * gainQ) shr 8) + 8
          b = ((b * gainQ) shr 8) + 8
        }
        if (r < 0) r = 0 else if (r > 255) r = 255
        if (g < 0) g = 0 else if (g > 255) g = 255
        if (b < 0) b = 0 else if (b > 255) b = 255
        px[di] = (0xFF shl 24) or (r shl 16) or (g shl 8) or b
        di += perX
      }
    }

    val slot = poolIndex
    poolIndex = (poolIndex + 1) % POOL_SIZE
    var bitmap = bitmapPool[slot]
    if (bitmap == null || bitmap.width != outW || bitmap.height != outH) {
      bitmap = Bitmap.createBitmap(outW, outH, Bitmap.Config.ARGB_8888)
      bitmapPool[slot] = bitmap
    }
    bitmap!!.setPixels(px, 0, outW, 0, 0, outW, outH)
    return bitmap
  }

  @Volatile
  var isInPictureInPicture: Boolean = false
    private set

  fun onPictureInPictureModeChanged(inPip: Boolean) {
    isInPictureInPicture = inPip
    emit(
      "onPictureInPictureChange",
      mapOf(
        "isInPictureInPicture" to inPip,
        "isInPictureInPictureMode" to inPip,
      ),
    )
  }

  fun getRuntimeStats(): Map<String, Any> {
    val results = resultsReceived.get()
    val stats = mutableMapOf<String, Any>(
      "modelId" to MODEL_ID,
      "modelLoaded" to isActive(),
      "modelInitMs" to modelInitMs.toDouble(),
      "delegate" to activeDelegate,
      "framesReceived" to framesReceived.get().toDouble(),
      "framesThrottled" to framesThrottled.get().toDouble(),
      "framesDroppedBusy" to framesDroppedBusy.get().toDouble(),
      "framesSubmitted" to framesSubmitted.get().toDouble(),
      "resultsReceived" to results.toDouble(),
      "facesDetected" to facesDetected.get().toDouble(),
      "inferenceErrors" to inferenceErrors.get().toDouble(),
      "lastLatencyMs" to lastLatencyMs.toDouble(),
      "meanLatencyMs" to (if (results > 0) latencySumMs.get().toDouble() / results else 0.0),
      "frameWidth" to lastFrameWidth.toDouble(),
      "frameHeight" to lastFrameHeight.toDouble(),
      "minFrameIntervalMs" to MIN_FRAME_INTERVAL_MS.toDouble(),
      "meanLuma" to lastMeanLuma,
      "lowLightFrames" to lowLightFrames.get().toDouble(),
      "isInPictureInPicture" to isInPictureInPicture,
      "autoPipEnabled" to autoPipEnabled,
    )
    lastError?.let { stats["lastError"] = it }
    return stats
  }

  private fun resetCounters() {
    framesReceived.set(0)
    framesThrottled.set(0)
    framesDroppedBusy.set(0)
    framesSubmitted.set(0)
    resultsReceived.set(0)
    facesDetected.set(0)
    inferenceErrors.set(0)
    latencySumMs.set(0)
    lastLatencyMs = 0L
    lastError = null
  }

  private fun onResult(taskGeneration: Long, result: FaceLandmarkerResult) {
    val timestampMs = result.timestampMs()
    if (taskGeneration != synchronized(lock) { generation }) {
      return
    }
    frameInFlight.set(false)

    val latency = (SystemClock.uptimeMillis() - timestampMs).coerceAtLeast(0L)
    lastLatencyMs = latency
    latencySumMs.addAndGet(latency)
    resultsReceived.incrementAndGet()

    val base = mutableMapOf<String, Any>(
      "timestampMs" to timestampMs.toDouble(),
      "inferenceMs" to latency.toDouble(),
      "frameWidth" to lastFrameWidth.toDouble(),
      "frameHeight" to lastFrameHeight.toDouble(),
    )

    val faces = result.faceLandmarks()
    if (faces.isEmpty()) {
      base["status"] = "no_face"
      base["faceCount"] = 0.0
      emit("onEyeLandmarks", base)
      return
    }

    val landmarks = faces.first()
    if (landmarks.size < 478) {
      // The bundled model always returns 478 points (468 mesh + 10 iris). Anything
      // else means an unexpected model or a corrupted result: report, don't guess.
      base["status"] = "invalid"
      base["faceCount"] = faces.size.toDouble()
      base["message"] = "Unexpected landmark count: ${landmarks.size}"
      emit("onEyeLandmarks", base)
      return
    }
    facesDetected.incrementAndGet()

    // Primitive array: no boxed Double per coordinate, ~20 times a second.
    val points = DoubleArray(TRACKED_INDICES.size * 2)
    var pi = 0
    for (index in TRACKED_INDICES) {
      val point = landmarks[index]
      points[pi++] = point.x().toDouble()
      points[pi++] = point.y().toDouble()
    }

    var minX = 1.0
    var maxX = 0.0
    var minY = 1.0
    var maxY = 0.0
    for (pt in landmarks) {
      val x = pt.x().toDouble()
      val y = pt.y().toDouble()
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }

    base["status"] = "face_detected"
    base["faceCount"] = faces.size.toDouble()
    base["points"] = points
    base["faceBounds"] = mapOf("xMin" to minX, "yMin" to minY, "xMax" to maxX, "yMax" to maxY)

    val blendshapes = result.faceBlendshapes()
    if (blendshapes.isPresent && blendshapes.get().isNotEmpty()) {
      val scores = mutableMapOf<String, Double>()
      for (category in blendshapes.get().first()) {
        val name = category.categoryName()
        if (name in BLENDSHAPES_OF_INTEREST) scores[name] = category.score().toDouble()
      }
      if (scores.isNotEmpty()) base["blendshapes"] = scores
    }

    val matrixes = result.facialTransformationMatrixes()
    if (matrixes.isPresent && matrixes.get().isNotEmpty()) {
      val matrix = matrixes.get().first()
      if (matrix.size == 16) base["transformMatrix"] = matrix.map { it.toDouble() }
    }

    emit("onEyeLandmarks", base)
  }

  private fun onError(taskGeneration: Long, error: RuntimeException) {
    frameInFlight.set(false)
    inferenceErrors.incrementAndGet()
    lastError = error.message
    if (taskGeneration != synchronized(lock) { generation }) return
    emitStatus("error", error.message ?: "Face Landmarker inference failed")
  }

  private fun emitStatus(status: String, message: String? = null) {
    val payload = if (message == null) mapOf("status" to status)
    else mapOf("status" to status, "message" to message)
    emit("onVisionStatus", payload)
  }

  private fun emit(eventName: String, payload: Map<String, Any>) {
    eventSink?.invoke(eventName, payload)
  }
}
