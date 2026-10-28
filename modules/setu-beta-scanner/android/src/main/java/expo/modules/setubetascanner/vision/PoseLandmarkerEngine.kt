package expo.modules.setubetascanner.vision

import android.content.Context
import com.google.mediapipe.framework.image.MPImage
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult

/**
 * Wrapper for MediaPipe Pose Landmarker
 * Handles initialization, inference, and result processing
 */
class PoseLandmarkerEngine(private val context: Context) {
  private var landmarker: PoseLandmarker? = null
  private var delegate: String = "none"
  private var loadTimeMs: Long = 0

  /**
   * Initialize the pose landmarker with GPU fallback to CPU
   */
  fun initialize(): Boolean {
    if (landmarker != null) return true

    val started = System.currentTimeMillis()
    return try {
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath("pose_landmarker.task")
        .setDelegate(Delegate.GPU)
        .build()

      val options = PoseLandmarker.PoseLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(RunningMode.LIVE_STREAM)
        .setMinPoseDetectionConfidence(0.4f)
        .setMinPosePresenceConfidence(0.4f)
        .setMinTrackingConfidence(0.4f)
        .setOutputSegmentationMasks(false)
        .setResultListener { result: PoseLandmarkerResult, _ -> onResult(result) }
        .setErrorListener { error: RuntimeException -> onError(error) }
        .build()

      landmarker = PoseLandmarker.createFromOptions(context, options)
      delegate = "gpu"
      loadTimeMs = System.currentTimeMillis() - started
      true
    } catch (gpuError: Exception) {
      android.util.Log.w("PoseLandmarkerEngine", "GPU delegate unavailable, using CPU: ${gpuError.message}")
      try {
        val baseOptions = BaseOptions.builder()
          .setModelAssetPath("pose_landmarker.task")
          .setDelegate(Delegate.CPU)
          .build()

        val options = PoseLandmarker.PoseLandmarkerOptions.builder()
          .setBaseOptions(baseOptions)
          .setRunningMode(RunningMode.LIVE_STREAM)
          .setMinPoseDetectionConfidence(0.4f)
          .setMinPosePresenceConfidence(0.4f)
          .setMinTrackingConfidence(0.4f)
          .setOutputSegmentationMasks(false)
          .setResultListener { result: PoseLandmarkerResult, _ -> onResult(result) }
          .setErrorListener { error: RuntimeException -> onError(error) }
          .build()

        landmarker = PoseLandmarker.createFromOptions(context, options)
        delegate = "cpu"
        loadTimeMs = System.currentTimeMillis() - started
        true
      } catch (cpuError: Exception) {
        android.util.Log.e("PoseLandmarkerEngine", "Failed to initialize", cpuError)
        false
      }
    }
  }

  /**
   * Detect pose in a single frame asynchronously
   */
  fun detectAsync(image: MPImage, timestampMs: Long) {
    landmarker?.detectAsync(image, timestampMs)
  }

  /**
   * Close the landmarker and release resources
   */
  fun close() {
    landmarker?.close()
    landmarker = null
    delegate = "none"
    loadTimeMs = 0
  }

  private fun onResult(result: PoseLandmarkerResult) {
    android.util.Log.d("PoseLandmarkerEngine", "Pose detected: ${result.landmarks().size}")
  }

  private fun onError(error: Exception) {
    android.util.Log.e("PoseLandmarkerEngine", "Inference error", error)
  }
}
