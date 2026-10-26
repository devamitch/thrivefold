package expo.modules.poselandmarker

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.os.SystemClock
import android.util.Log
import android.util.Range
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.core.resolutionselector.AspectRatioStrategy
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import android.util.Size
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
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Camera preview plus on-device MediaPipe pose landmarks. Frames are analysed in memory and
 * dropped; only the 33 normalized landmarks (x, y, z, visibility) of one person are sent to
 * JavaScript, at most ~15 times a second. Nothing is written to disk or sent over the network.
 */
class PoseCameraView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  companion object {
    const val MODEL_ASSET = "pose_landmarker_lite.task"
    const val MODEL_VERSION = "mediapipe-pose_landmarker_lite-float16-v1"
    const val FACE_ASSET = "face_landmarker.task"
    const val HAND_ASSET = "hand_landmarker.task"
    /** ~60 results a second: deliver detections immediately as they finish. */
    private const val MIN_EMIT_INTERVAL_MS = 16L
    private const val TAG = "PoseCamera"
    /** Face and hand results older than this are dropped rather than drawn in the wrong place. */
    private const val STALE_MS = 500L

    /**
     * The face points sent to JS, in this order (must match FACE_GROUPS in index.ts): eyes,
     * irises, brows, outer lips, face outline. ~110 of the model's 478 points.
     */
    val FACE_INDICES = intArrayOf(
      // left eye (16)
      33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246,
      // right eye (16)
      263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466,
      // irises: left centre + 4, right centre + 4 (10)
      468, 469, 470, 471, 472, 473, 474, 475, 476, 477,
      // left brow (10), right brow (10)
      70, 63, 105, 66, 107, 55, 65, 52, 53, 46,
      300, 293, 334, 296, 336, 285, 295, 282, 283, 276,
      // outer lips (20)
      61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185,
      // face outline (36)
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
      152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
    )
  }

  // React Native does not lay out native children on its own; without this the camera
  // preview never gets a size, its surface is never created and CameraX times out.
  override val shouldUseAndroidLayout = true

  private val onPose by EventDispatcher()
  private val onPoseError by EventDispatcher()
  private val onPoseReady by EventDispatcher()

  private val previewView = PreviewView(context).also {
    it.scaleType = PreviewView.ScaleType.FILL_CENTER
    // SurfaceView-backed preview: composited by the system, so camera frames never pass through
    // the app's own rendering (the TextureView mode cost a lot of frame time and CPU that pose
    // inference needs). It doesn't clip to rounded corners; the JS overlay draws a corner mask.
    it.implementationMode = PreviewView.ImplementationMode.PERFORMANCE
    addView(it, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }
  private var executor: ExecutorService? = null
  @Volatile private var landmarker: PoseLandmarker? = null
  private var cameraProvider: ProcessCameraProvider? = null
  private var active = false
  private var frontFacing = true
  private var lastEmit = 0L
  /** An inference is running; camera frames that arrive meanwhile are dropped before any work. */
  @Volatile private var inFlight = false
  @Volatile private var inFlightSince = 0L
  private var usingGpu = false
  private var faceOn = false
  private var handsOn = false
  @Volatile private var faceLandmarker: FaceLandmarker? = null
  @Volatile private var handLandmarker: HandLandmarker? = null
  private var frameCount = 0L
  @Volatile private var latestFace: List<Double> = emptyList()
  @Volatile private var latestFaceAt = 0L
  @Volatile private var latestHands: List<List<Double>> = emptyList()
  @Volatile private var latestHandsAt = 0L
  @Volatile private var frameW = 0
  @Volatile private var frameH = 0

  /** Minimum ms between analysed frames; raised during rests to save battery and heat. */
  @Volatile private var minIntervalMs = 0L
  @Volatile private var lastAnalysedAt = 0L

  fun setMinInterval(value: Int) {
    minIntervalMs = value.coerceIn(0, 2000).toLong()
  }

  fun setActive(value: Boolean) {
    if (value == active) return
    active = value
    if (value) start() else stop()
  }

  /** Track the face (eyes, irises, brows, lips, outline). Off by default to save battery. */
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

  /** Track up to two hands (21 points each). */
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

  private fun createHands(): HandLandmarker? = try {
    HandLandmarker.createFromOptions(
      context,
      HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(BaseOptions.builder().setModelAssetPath(HAND_ASSET).setDelegate(delegateFor()).build())
        .setRunningMode(RunningMode.LIVE_STREAM)
        .setNumHands(2)
        .setResultListener { result: HandLandmarkerResult, _: MPImage -> onHands(result) }
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

  private fun onHands(result: HandLandmarkerResult) {
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
    // Models load on the analysis thread, never the main thread (loading three models with GPU
    // set-up froze the app for seconds). The preview starts at once; frames that arrive before
    // the models are ready are simply skipped.
    exec.execute {
      // CPU: on a Moto G71 the GPU delegate loaded but returned no body with a person clearly
      // in frame. The lite model at 640x480 runs ~30-40 ms on CPU, fast enough for 25+ fps.
      val pose = try {
        createLandmarker(Delegate.CPU).also { usingGpu = false }
      } catch (e: Exception) {
        post { onPoseError(mapOf("code" to "model_unavailable", "message" to (e.message ?: "Pose model could not load"))) }
        null
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
        // Preview and analysis must see the same field of view, or landmarks drawn over the
        // preview drift and scale wrongly. Both use the sensor's full 4:3 frame.
        val sameFov = ResolutionSelector.Builder()
          .setAspectRatioStrategy(AspectRatioStrategy.RATIO_4_3_FALLBACK_AUTO_STRATEGY)
          .build()
        val selector = if (frontFacing) CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA
        // Ask for up to 30 fps with a floor of ~24: indoors many front cameras otherwise drop to
        // 15 fps, which halves how often the skeleton can follow the body.
        val fps = try {
          val ranges = provider.getCameraInfo(selector).supportedFrameRateRanges.filter { it.upper >= 30 && it.upper <= 30 }
          ranges.filter { it.lower in 20..24 }.maxByOrNull { it.lower } ?: ranges.maxByOrNull { it.lower }
        } catch (_: Exception) { null }
        val previewBuilder = Preview.Builder().setResolutionSelector(sameFov)
        if (fps != null) previewBuilder.setTargetFrameRate(fps)
        val preview = previewBuilder.build().also { it.setSurfaceProvider(previewView.surfaceProvider) }
        // The lite model looks at ~256 px; analysing 640x480 instead of the full sensor frame
        // cuts bitmap conversion and rotation work by ~6x. Same 4:3 ratio, same field of view.
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
        // Diagnostics: the overlay is only aligned if both streams show the same field of view.
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
          // Some GPUs accept the model but fail at run time: switch to CPU once and carry on.
          usingGpu = false
          val old = landmarker
          landmarker = try { createLandmarker(Delegate.CPU) } catch (_: Exception) { null }
          old?.close()
        } else {
          inFlight = false
          post { onPoseError(mapOf("code" to "inference_error", "message" to (e.message ?: ""))) }
        }
      }
      .build()
    return PoseLandmarker.createFromOptions(context, options)
  }

  private fun analyse(image: ImageProxy) {
    val model = landmarker
    // The model would drop this frame anyway while busy, but only after we had paid for the
    // bitmap conversion and rotation (and the garbage they leave). Skip it up front.
    val nowMs = SystemClock.uptimeMillis()
    if (model == null || (inFlight && nowMs - inFlightSince < 500L) || nowMs - lastAnalysedAt < minIntervalMs) {
      image.close()
      return
    }
    lastAnalysedAt = nowMs
    try {
      // How long ago the sensor captured this frame. The sensor clock is either boot time or
      // uptime depending on the device; use whichever gives a plausible age.
      val cap = image.imageInfo.timestamp
      val ageBoot = (SystemClock.elapsedRealtimeNanos() - cap) / 1_000_000L
      val ageUp = (SystemClock.uptimeMillis() * 1_000_000L - cap) / 1_000_000L
      val age = when {
        ageBoot in 0L..400L -> ageBoot
        ageUp in 0L..400L -> ageUp
        else -> 0L
      }
      val bitmap = image.toBitmap()
      val matrix = Matrix().apply {
        postRotate(image.imageInfo.rotationDegrees.toFloat())
        // Mirror the front camera so landmarks match what the person sees.
        if (frontFacing) postScale(-1f, 1f, bitmap.width / 2f, bitmap.height / 2f)
      }
      val upright = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
      if (upright != bitmap) {
        bitmap.recycle()
      }
      frameW = upright.width
      frameH = upright.height
      val ts = maxOf(lastTs + 1, SystemClock.uptimeMillis() - age)
      lastTs = ts
      val mp = BitmapImageBuilder(upright).build()
      inFlight = true
      inFlightSince = ts
      model.detectAsync(mp, ts)
      // Face and hands share the remaining budget: alternate frames when both are on.
      frameCount++
      val face = faceLandmarker
      val hands = handLandmarker
      if (face != null && (hands == null || frameCount % 2L == 0L)) face.detectAsync(mp, ts)
      if (hands != null && (face == null || frameCount % 2L == 1L)) hands.detectAsync(mp, ts)
    } catch (_: Exception) {
      // A dropped frame is fine; the next one is analysed.
    } finally {
      image.close()
    }
  }

  private var emitted = 0L
  /** MediaPipe needs strictly increasing timestamps. */
  private var lastTs = 0L

  private fun emit(result: PoseLandmarkerResult) {
    inFlight = false
    val now = SystemClock.uptimeMillis()
    // Diagnostics (no image data): how often results arrive and whether a body is in them.
    if (++emitted % 30L == 0L) {
      val nose = result.landmarks().firstOrNull()?.firstOrNull()
      Log.i(TAG, "result #$emitted landmarks=${result.landmarks().firstOrNull()?.size ?: 0} gpu=$usingGpu latencyMs=${now - result.timestampMs()} frame=${frameW}x$frameH nose=${nose?.x()},${nose?.y()}")
    }
    if (now - lastEmit < MIN_EMIT_INTERVAL_MS) return
    lastEmit = now
    val pose = result.landmarks().firstOrNull()
    // One flat array [x, y, z, visibility] * 33: far cheaper to hand to JS than 33 objects.
    val points = if (pose == null) DoubleArray(0) else DoubleArray(pose.size * 4).also { out ->
      for (i in pose.indices) {
        val lm = pose[i]
        out[i * 4] = lm.x().toDouble()
        out[i * 4 + 1] = lm.y().toDouble()
        out[i * 4 + 2] = lm.z().toDouble()
        out[i * 4 + 3] = lm.visibility().orElse(0f).toDouble()
      }
    }
    // Wall-clock time the frame was captured, so the overlay can predict where joints are by
    // the time they are drawn (JS and the UI thread share this clock).
    val capturedAt = System.currentTimeMillis() - (now - result.timestampMs())
    val face = if (faceOn && now - latestFaceAt < STALE_MS) latestFace else emptyList()
    val hands = if (handsOn && now - latestHandsAt < STALE_MS) latestHands else emptyList()
    post {
      onPose(
        mapOf(
          "timestamp" to result.timestampMs(),
          "capturedAt" to capturedAt.toDouble(),
          "points" to points,
          "frameWidth" to frameW,
          "frameHeight" to frameH,
          "face" to face,
          "hands" to hands,
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
    // Close the models on the analysis thread, after any frame in flight, never under it.
    val pose = landmarker
    val face = faceLandmarker
    val hands = handLandmarker
    landmarker = null
    faceLandmarker = null
    handLandmarker = null
    val exec = executor
    executor = null
    if (exec != null) {
      exec.execute {
        pose?.close()
        face?.close()
        hands?.close()
      }
      exec.shutdown()
    } else {
      pose?.close()
      face?.close()
      hands?.close()
    }
  }

  fun release() {
    active = false
    stop()
  }
}
