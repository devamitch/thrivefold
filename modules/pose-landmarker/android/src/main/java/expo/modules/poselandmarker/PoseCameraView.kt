package expo.modules.poselandmarker

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Matrix
import android.os.SystemClock
import android.util.Log
import android.util.Size
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.core.resolutionselector.AspectRatioStrategy
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult
import com.google.mediapipe.tasks.vision.gesturerecognizer.GestureRecognizer
import com.google.mediapipe.tasks.vision.gesturerecognizer.GestureRecognizerResult
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Camera preview plus on-device MediaPipe pose landmarks. Frames are analysed in memory and
 * dropped; only the 33 normalized landmarks (x, y, z, visibility) of one person are sent to
 * JavaScript. Nothing is written to disk or sent over the network.
 *
 * Per-frame cost was cut by: reusing two output bitmaps + one source bitmap (no per-frame
 * allocation / GC), and doing rotation + front-camera mirroring in ONE canvas draw instead of
 * toBitmap() + Bitmap.createBitmap(matrix) (two full-frame allocations).
 */
class PoseCameraView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  companion object {
    const val MODEL_ASSET = "pose_landmarker_lite.task"
    const val MODEL_VERSION = "mediapipe-pose_landmarker_lite-float16-v1"
    const val FACE_ASSET = "face_landmarker.task"
    /** Gesture recognizer bundle: MediaPipe hand landmarker plus the canned gesture classifier. */
    const val HAND_ASSET = "gesture_recognizer.task"
    private const val MIN_EMIT_INTERVAL_MS = 16L
    private const val TAG = "PoseCamera"
    private const val STALE_MS = 500L

    val FACE_INDICES = intArrayOf(
      33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246,
      263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466,
      468, 469, 470, 471, 472, 473, 474, 475, 476, 477,
      70, 63, 105, 66, 107, 55, 65, 52, 53, 46,
      300, 293, 334, 296, 336, 285, 295, 282, 283, 276,
      61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185,
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
      152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
    )
  }

  override val shouldUseAndroidLayout = true

  private val onPose by EventDispatcher()
  private val onPoseError by EventDispatcher()
  private val onPoseReady by EventDispatcher()

  private val previewView = PreviewView(context).also {
    // FIT_CENTER (letterbox) keeps the full body in frame — feet stay visible.
    // FILL_CENTER would crop top/bottom on tall screens hiding feet landmarks.
    it.scaleType = PreviewView.ScaleType.FIT_CENTER
    it.implementationMode = PreviewView.ImplementationMode.PERFORMANCE
    addView(it, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }
  private var executor: ExecutorService? = null
  @Volatile private var landmarker: PoseLandmarker? = null
  private var cameraProvider: ProcessCameraProvider? = null
  private var active = false
  private var frontFacing = true
  private var lastEmit = 0L
  @Volatile private var inFlight = false
  @Volatile private var inFlightSince = 0L
  @Volatile private var usingGpu = false
  private var faceOn = false
  private var handsOn = false
  @Volatile private var faceLandmarker: FaceLandmarker? = null
  @Volatile private var handLandmarker: GestureRecognizer? = null
  private var frameCount = 0L
  @Volatile private var latestFace: List<Double> = emptyList()
  @Volatile private var latestFaceAt = 0L
  @Volatile private var latestHands: List<List<Double>> = emptyList()
  @Volatile private var latestHandsAt = 0L
  @Volatile private var latestGestures: List<Map<String, Any>> = emptyList()
  @Volatile private var frameW = 0
  @Volatile private var frameH = 0

  @Volatile private var minIntervalMs = 0L
  @Volatile private var lastAnalysedAt = 0L

  // ---- Analysis-thread-only reusable buffers (never touched from another thread) ----
  private var srcBmp: Bitmap? = null
  private val outBmps = arrayOfNulls<Bitmap>(2)
  private var outIdx = 0
  private val xform = Matrix()
  private val canvas = Canvas()
  private var convEmaMs = 0.0

  fun setMinInterval(value: Int) {
    minIntervalMs = value.coerceIn(0, 2000).toLong()
  }

  fun setActive(value: Boolean) {
    if (value == active) return
    active = value
    if (value) start() else stop()
  }

  fun setFace(value: Boolean) {
    if (value == faceOn) return
    faceOn = value
    if (!value) {
      faceLandmarker?.close()
      faceLandmarker = null
      latestFace = emptyList()
    } else if (active) {
      executor?.execute { if (faceOn && faceLandmarker == null) faceLandmarker = createFace() }
    }
  }

  fun setHands(value: Boolean) {
    if (value == handsOn) return
    handsOn = value
    if (!value) {
      handLandmarker?.close()
      handLandmarker = null
      latestHands = emptyList()
    } else if (active) {
      executor?.execute { if (handsOn && handLandmarker == null) handLandmarker = createHands() }
    }
  }

  private fun delegateFor(): Delegate = if (usingGpu) Delegate.GPU else Delegate.CPU

  private fun createFace(): FaceLandmarker? = try {
    FaceLandmarker.createFromOptions(
      context,
      FaceLandmarker.FaceLandmarkerOptions.builder()
        .setBaseOptions(BaseOptions.builder().setModelAssetPath(FACE_ASSET).setDelegate(delegateFor()).build())
        .setRunningMode(RunningMode.LIVE_STREAM)
        .setNumFaces(1)
        .setOutputFaceBlendshapes(false)
        .setResultListener { result: FaceLandmarkerResult, _: MPImage -> onFace(result) }
        .setErrorListener { _ -> }
        .build(),
    )
  } catch (_: Exception) {
    null
  }

  private fun createHands(): GestureRecognizer? = try {
    GestureRecognizer.createFromOptions(
      context,
      GestureRecognizer.GestureRecognizerOptions.builder()
        .setBaseOptions(BaseOptions.builder().setModelAssetPath(HAND_ASSET).setDelegate(delegateFor()).build())
        .setRunningMode(RunningMode.LIVE_STREAM)
        .setNumHands(2)
        .setResultListener { result: GestureRecognizerResult, _: MPImage -> onHands(result) }
        .setErrorListener { _ -> }
        .build(),
    )
  } catch (_: Exception) {
    null
  }

  private fun onFace(result: FaceLandmarkerResult) {
    val face = result.faceLandmarks().firstOrNull()
    latestFace = if (face == null || face.size < 478) emptyList() else {
      val out = ArrayList<Double>(FACE_INDICES.size * 2)
      for (i in FACE_INDICES) {
        out.add(face[i].x().toDouble())
        out.add(face[i].y().toDouble())
      }
      out
    }
    latestFaceAt = SystemClock.uptimeMillis()
  }

  private fun onHands(result: GestureRecognizerResult) {
    // Top canned gesture per hand (Thumb_Up, Victory, Open_Palm, Closed_Fist, Pointing_Up, ILoveYou, None).
    latestGestures = result.gestures().map { cats ->
      val top = cats.firstOrNull()
      mapOf("name" to (top?.categoryName() ?: "None"), "score" to (top?.score()?.toDouble() ?: 0.0))
    }
    latestHands = result.landmarks().map { hand ->
      val out = ArrayList<Double>(hand.size * 2)
      for (lm in hand) {
        out.add(lm.x().toDouble())
        out.add(lm.y().toDouble())
      }
      out
    }
    latestHandsAt = SystemClock.uptimeMillis()
  }

  fun setFacing(value: String) {
    val front = value != "back"
    if (front == frontFacing) return
    frontFacing = front
    if (active) {
      stop()
      start()
    }
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    previewView.layout(0, 0, r - l, b - t)
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    super.onMeasure(widthMeasureSpec, heightMeasureSpec)
    previewView.measure(
      MeasureSpec.makeMeasureSpec(measuredWidth, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(measuredHeight, MeasureSpec.EXACTLY),
    )
  }

  private fun start() {
    val owner = appContext.currentActivity as? LifecycleOwner
    if (owner == null) {
      onPoseError(mapOf("code" to "no_activity", "message" to "Camera needs a visible screen"))
      return
    }
    val exec = Executors.newSingleThreadExecutor().also { executor = it }
    inFlight = false
    exec.execute {
      val pose = try {
        createLandmarker(Delegate.GPU).also { usingGpu = true }
      } catch (gpuErr: Throwable) {
        Log.w(TAG, "GPU delegate unavailable, using CPU: ${gpuErr.message}")
        usingGpu = false
        try {
          createLandmarker(Delegate.CPU)
        } catch (e: Throwable) {
          post { onPoseError(mapOf("code" to "model_unavailable", "message" to (e.message ?: "Pose model could not load"))) }
          null
        }
      }
      if (!active) {
        pose?.close()
        return@execute
      }
      landmarker = pose
      if (faceOn) faceLandmarker = createFace()
      if (handsOn) handLandmarker = createHands()
      if (pose != null) post { onPoseReady(mapOf("delegate" to if (usingGpu) "gpu" else "cpu")) }
    }
    val future = ProcessCameraProvider.getInstance(context)
    future.addListener({
      try {
        val provider = future.get().also { cameraProvider = it }
        val sameFov = ResolutionSelector.Builder()
          .setAspectRatioStrategy(AspectRatioStrategy.RATIO_4_3_FALLBACK_AUTO_STRATEGY)
          .build()
        val selector = if (frontFacing) CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA
        val fps = try {
          val ranges = provider.getCameraInfo(selector).supportedFrameRateRanges.filter { it.upper >= 30 && it.upper <= 30 }
          ranges.filter { it.lower in 20..24 }.maxByOrNull { it.lower } ?: ranges.maxByOrNull { it.lower }
        } catch (_: Exception) { null }
        val previewBuilder = Preview.Builder().setResolutionSelector(sameFov)
        if (fps != null) previewBuilder.setTargetFrameRate(fps)
        val preview = previewBuilder.build().also { it.setSurfaceProvider(previewView.surfaceProvider) }
        val analysisSize = ResolutionSelector.Builder()
          .setAspectRatioStrategy(AspectRatioStrategy.RATIO_4_3_FALLBACK_AUTO_STRATEGY)
          .setResolutionStrategy(ResolutionStrategy(Size(640, 480), ResolutionStrategy.FALLBACK_RULE_CLOSEST_HIGHER_THEN_LOWER))
          .build()
        val analysis = ImageAnalysis.Builder()
          .setResolutionSelector(analysisSize)
          .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
          .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
          .build()
        analysis.setAnalyzer(exec) { image -> analyse(image) }
        provider.unbindAll()
        provider.bindToLifecycle(owner, selector, preview, analysis)
        Log.i(TAG, "fps=$fps preview=${preview.resolutionInfo?.resolution} crop=${preview.resolutionInfo?.cropRect} analysis=${analysis.resolutionInfo?.resolution} crop=${analysis.resolutionInfo?.cropRect} rotation=${analysis.resolutionInfo?.rotationDegrees}")
      } catch (e: Exception) {
        onPoseError(mapOf("code" to "camera_unavailable", "message" to (e.message ?: "Camera could not start")))
      }
    }, ContextCompat.getMainExecutor(context))
  }

  private fun createLandmarker(delegate: Delegate): PoseLandmarker {
    val base = BaseOptions.builder().setModelAssetPath(MODEL_ASSET).setDelegate(delegate).build()
    val options = PoseLandmarker.PoseLandmarkerOptions.builder()
      .setBaseOptions(base)
      .setRunningMode(RunningMode.LIVE_STREAM)
      .setNumPoses(1)
      .setMinPoseDetectionConfidence(0.5f)
      .setMinPosePresenceConfidence(0.5f)
      .setMinTrackingConfidence(0.5f)
      .setResultListener { result: PoseLandmarkerResult, _: MPImage -> emit(result) }
      .setErrorListener { e ->
        if (usingGpu) {
          usingGpu = false
          inFlight = false
          Log.w(TAG, "GPU inference failed, falling back to CPU: ${e.message}")
          val old = landmarker
          landmarker = try { createLandmarker(Delegate.CPU) } catch (_: Throwable) { null }
          val exec = executor
          if (exec != null) exec.execute { old?.close() } else old?.close()
        } else {
          inFlight = false
          post { onPoseError(mapOf("code" to "inference_error", "message" to (e.message ?: ""))) }
        }
      }
      .build()
    return PoseLandmarker.createFromOptions(context, options)
  }

  /**
   * Converts the camera frame to an upright (and, for the front camera, mirrored) bitmap
   * using only reused buffers. Must run on the analysis thread.
   */
  private fun uprightBitmap(image: ImageProxy): Bitmap {
    val w = image.width
    val h = image.height
    val plane = image.planes[0]
    val tight = plane.pixelStride == 4 && plane.rowStride == w * 4

    // Tight rows (the normal case for 640x480 RGBA): copy straight into a reused bitmap.
    // Padded rows: fall back to CameraX's own (stride-aware) conversion, correct but allocating.
    val fallback: Bitmap? = if (tight) null else image.toBitmap()
    val src: Bitmap = fallback ?: run {
      var s = srcBmp
      if (s == null || s.width != w || s.height != h) {
        s?.recycle()
        s = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        srcBmp = s
      }
      val buf = plane.buffer
      buf.rewind()
      s!!.copyPixelsFromBuffer(buf)
      s
    }

    val rot = image.imageInfo.rotationDegrees
    val swap = rot == 90 || rot == 270
    val ow = if (swap) h else w
    val oh = if (swap) w else h
    var out = outBmps[outIdx]
    if (out == null || out.width != ow || out.height != oh) {
      out?.recycle()
      out = Bitmap.createBitmap(ow, oh, Bitmap.Config.ARGB_8888)
      outBmps[outIdx] = out
    }
    // Rotate about the source centre, mirror (front camera) about the origin, then move to
    // the centre of the output. One draw replaces the old Bitmap.createBitmap(matrix) copy.
    xform.reset()
    xform.postTranslate(-w / 2f, -h / 2f)
    xform.postRotate(rot.toFloat())
    if (frontFacing) xform.postScale(-1f, 1f)
    xform.postTranslate(ow / 2f, oh / 2f)
    canvas.setBitmap(out)
    canvas.drawBitmap(src, xform, null)
    canvas.setBitmap(null)
    fallback?.recycle()
    // Alternate output buffers so the one handed to MediaPipe is never the one being drawn.
    outIdx = outIdx xor 1
    return out!!
  }

  private fun analyse(image: ImageProxy) {
    val model = landmarker
    val nowMs = SystemClock.uptimeMillis()
    if (model == null || (inFlight && nowMs - inFlightSince < 500L) || nowMs - lastAnalysedAt < minIntervalMs) {
      image.close()
      return
    }
    lastAnalysedAt = nowMs
    try {
      val cap = image.imageInfo.timestamp
      val ageBoot = (SystemClock.elapsedRealtimeNanos() - cap) / 1_000_000L
      val ageUp = (SystemClock.uptimeMillis() * 1_000_000L - cap) / 1_000_000L
      val age = when {
        ageBoot in 0L..400L -> ageBoot
        ageUp in 0L..400L -> ageUp
        else -> 0L
      }
      val t0 = SystemClock.elapsedRealtimeNanos()
      val upright = uprightBitmap(image)
      convEmaMs = convEmaMs * 0.9 + ((SystemClock.elapsedRealtimeNanos() - t0) / 1_000_000.0) * 0.1
      frameW = upright.width
      frameH = upright.height
      val ts = maxOf(lastTs + 1, SystemClock.uptimeMillis() - age)
      lastTs = ts
      val mp = BitmapImageBuilder(upright).build()
      inFlight = true
      inFlightSince = ts
      model.detectAsync(mp, ts)
      frameCount++
      val face = faceLandmarker
      val hands = handLandmarker
      if (face != null && (hands == null || frameCount % 2L == 0L)) face.detectAsync(mp, ts)
      if (hands != null && (face == null || frameCount % 2L == 1L)) hands.recognizeAsync(mp, ts)
    } catch (_: Exception) {
      inFlight = false
    } finally {
      image.close()
    }
  }

  private var emitted = 0L
  private var lastTs = 0L

  private fun emit(result: PoseLandmarkerResult) {
    inFlight = false
    val now = SystemClock.uptimeMillis()
    if (++emitted % 60L == 0L) {
      val n = result.landmarks().firstOrNull()?.size ?: 0
      Log.i(TAG, "result #$emitted landmarks=$n gpu=$usingGpu latencyMs=${now - result.timestampMs()} convertMs=${"%.1f".format(convEmaMs)} frame=${frameW}x$frameH")
    }
    if (now - lastEmit < MIN_EMIT_INTERVAL_MS) return
    lastEmit = now
    val pose = result.landmarks().firstOrNull()
    val points = if (pose == null) DoubleArray(0) else DoubleArray(pose.size * 4).also { out ->
      for (i in pose.indices) {
        val lm = pose[i]
        out[i * 4] = lm.x().toDouble()
        out[i * 4 + 1] = lm.y().toDouble()
        out[i * 4 + 2] = lm.z().toDouble()
        out[i * 4 + 3] = lm.visibility().orElse(0f).toDouble()
      }
    }
    val capturedAt = System.currentTimeMillis() - (now - result.timestampMs())
    val face = if (faceOn && now - latestFaceAt < STALE_MS) latestFace else emptyList()
    val handsFresh = handsOn && now - latestHandsAt < STALE_MS
    val hands = if (handsFresh) latestHands else emptyList()
    val gestures = if (handsFresh) latestGestures else emptyList()
    val w = frameW
    val h = frameH
    post {
      onPose(
        mapOf(
          "timestamp" to result.timestampMs(),
          "capturedAt" to capturedAt.toDouble(),
          "points" to points,
          "frameWidth" to w,
          "frameHeight" to h,
          "face" to face,
          "hands" to hands,
          "gestures" to gestures,
        ),
      )
    }
  }

  private fun stop() {
    try {
      cameraProvider?.unbindAll()
    } catch (_: Exception) {
    }
    cameraProvider = null
    val pose = landmarker
    val face = faceLandmarker
    val hands = handLandmarker
    landmarker = null
    faceLandmarker = null
    handLandmarker = null
    val exec = executor
    executor = null
    val release = {
      pose?.close()
      face?.close()
      hands?.close()
      // Free reusable frame buffers on the analysis thread, after any frame in flight.
      srcBmp?.recycle(); srcBmp = null
      for (i in outBmps.indices) { outBmps[i]?.recycle(); outBmps[i] = null }
    }
    if (exec != null) {
      exec.execute { release() }
      exec.shutdown()
    } else {
      release()
    }
  }

  fun release() {
    active = false
    stop()
  }
}
