package expo.modules.poselandmarker

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.os.SystemClock
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
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
    private const val MIN_EMIT_INTERVAL_MS = 66L
  }

  private val onPose by EventDispatcher()
  private val onPoseError by EventDispatcher()

  private val previewView = PreviewView(context).also {
    it.scaleType = PreviewView.ScaleType.FILL_CENTER
    addView(it, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }
  private var executor: ExecutorService? = null
  private var landmarker: PoseLandmarker? = null
  private var cameraProvider: ProcessCameraProvider? = null
  private var active = false
  private var frontFacing = true
  private var lastEmit = 0L

  fun setActive(value: Boolean) {
    if (value == active) return
    active = value
    if (value) start() else stop()
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

  private fun start() {
    val owner = appContext.currentActivity as? LifecycleOwner
    if (owner == null) {
      onPoseError(mapOf("code" to "no_activity", "message" to "Camera needs a visible screen"))
      return
    }
    try {
      landmarker = createLandmarker()
    } catch (e: Exception) {
      onPoseError(mapOf("code" to "model_unavailable", "message" to (e.message ?: "Pose model could not load")))
      return
    }
    val exec = Executors.newSingleThreadExecutor().also { executor = it }
    val future = ProcessCameraProvider.getInstance(context)
    future.addListener({
      try {
        val provider = future.get().also { cameraProvider = it }
        val preview = Preview.Builder().build().also { it.setSurfaceProvider(previewView.surfaceProvider) }
        val analysis = ImageAnalysis.Builder()
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

  private fun createLandmarker(): PoseLandmarker {
    val base = BaseOptions.builder().setModelAssetPath(MODEL_ASSET).setDelegate(Delegate.CPU).build()
    val options = PoseLandmarker.PoseLandmarkerOptions.builder()
      .setBaseOptions(base)
      .setRunningMode(RunningMode.LIVE_STREAM)
      .setNumPoses(1)
      .setMinPoseDetectionConfidence(0.5f)
      .setMinPosePresenceConfidence(0.5f)
      .setMinTrackingConfidence(0.5f)
      .setResultListener { result: PoseLandmarkerResult, _: MPImage -> emit(result) }
      .setErrorListener { e -> post { onPoseError(mapOf("code" to "inference_error", "message" to (e.message ?: ""))) } }
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
      model.detectAsync(BitmapImageBuilder(upright).build(), SystemClock.uptimeMillis())
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
    post { onPose(mapOf("timestamp" to result.timestampMs(), "landmarks" to landmarks)) }
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
  }

  fun release() {
    active = false
    stop()
  }
}
