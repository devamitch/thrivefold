package expo.modules.poselandmarker

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.os.SystemClock
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
    private const val MIN_EMIT_INTERVAL_MS = 66L
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

  private val previewView = PreviewView(context).also {
    it.scaleType = PreviewView.ScaleType.FILL_CENTER
    // TextureView-backed preview: clips to rounded corners and animates with the call layout.
    it.implementationMode = PreviewView.ImplementationMode.COMPATIBLE
    addView(it, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }
  private var executor: ExecutorService? = null
  private var landmarker: PoseLandmarker? = null
  private var cameraProvider: ProcessCameraProvider? = null
  private var active = false
  private var frontFacing = true
  private var lastEmit = 0L
  private var usingGpu = false
  private var faceOn = false
  private var handsOn = false
  private var faceLandmarker: FaceLandmarker? = null
  private var handLandmarker: HandLandmarker? = null
  private var frameCount = 0L
  @Volatile private var latestFace: List<Double> = emptyList()
  @Volatile private var latestFaceAt = 0L
  @Volatile private var latestHands: List<List<Double>> = emptyList()
  @Volatile private var latestHandsAt = 0L
  @Volatile private var frameW = 0
  @Volatile private var frameH = 0

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
      faceLandmarker = createFace()
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
      handLandmarker = createHands()
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
    // GPU inference is several times faster where supported; fall back to CPU otherwise.
    landmarker = try {
      createLandmarker(Delegate.GPU).also { usingGpu = true }
    } catch (_: Exception) {
      try {
        createLandmarker(Delegate.CPU).also { usingGpu = false }
      } catch (e: Exception) {
        onPoseError(mapOf("code" to "model_unavailable", "message" to (e.message ?: "Pose model could not load")))
        return
      }
    }
    if (faceOn) faceLandmarker = createFace()
    if (handsOn) handLandmarker = createHands()
    val exec = Executors.newSingleThreadExecutor().also { executor = it }
    val future = ProcessCameraProvider.getInstance(context)
    future.addListener({
      try {
        val provider = future.get().also { cameraProvider = it }
        // Preview and analysis must see the same field of view, or landmarks drawn over the
        // preview drift and scale wrongly. Both use the sensor's full 4:3 frame.
        val sameFov = ResolutionSelector.Builder()
          .setAspectRatioStrategy(AspectRatioStrategy.RATIO_4_3_FALLBACK_AUTO_STRATEGY)
          .build()
        val preview = Preview.Builder().setResolutionSelector(sameFov).build().also { it.setSurfaceProvider(previewView.surfaceProvider) }
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
        val selector = if (frontFacing) CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA
        provider.unbindAll()
        provider.bindToLifecycle(owner, selector, preview, analysis)
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
          post { onPoseError(mapOf("code" to "inference_error", "message" to (e.message ?: ""))) }
        }
      }
      .build()
    return PoseLandmarker.createFromOptions(context, options)
  }

  private fun analyse(image: ImageProxy) {
    val model = landmarker
    if (model == null) {
      image.close()
      return
    }
    try {
      val bitmap = image.toBitmap()
      val matrix = Matrix().apply {
        postRotate(image.imageInfo.rotationDegrees.toFloat())
        // Mirror the front camera so landmarks match what the person sees.
        if (frontFacing) postScale(-1f, 1f, bitmap.width / 2f, bitmap.height / 2f)
      }
      val upright = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
      frameW = upright.width
      frameH = upright.height
      val ts = SystemClock.uptimeMillis()
      val mp = BitmapImageBuilder(upright).build()
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

  private fun emit(result: PoseLandmarkerResult) {
    val now = SystemClock.uptimeMillis()
    if (now - lastEmit < MIN_EMIT_INTERVAL_MS) return
    lastEmit = now
    val pose = result.landmarks().firstOrNull()
    val landmarks = pose?.map { lm ->
      mapOf(
        "x" to lm.x().toDouble(),
        "y" to lm.y().toDouble(),
        "z" to lm.z().toDouble(),
        "visibility" to lm.visibility().orElse(0f).toDouble(),
      )
    } ?: emptyList()
    val face = if (faceOn && now - latestFaceAt < STALE_MS) latestFace else emptyList()
    val hands = if (handsOn && now - latestHandsAt < STALE_MS) latestHands else emptyList()
    post {
      onPose(
        mapOf(
          "timestamp" to result.timestampMs(),
          "landmarks" to landmarks,
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
    executor?.shutdown()
    executor = null
    landmarker?.close()
    landmarker = null
    faceLandmarker?.close()
    faceLandmarker = null
    handLandmarker?.close()
    handLandmarker = null
  }

  fun release() {
    active = false
    stop()
  }
}
