package expo.modules.setubetascanner.vision

import android.content.Context
import com.google.mediapipe.framework.image.MPImage
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult

/**
 * Wrapper for MediaPipe Face Landmarker
 * Handles initialization, inference, and result processing
 */
class FaceLandmarkerEngine(private val context: Context) {
  private var landmarker: FaceLandmarker? = null
  private var delegate: String = "none"
  private var loadTimeMs: Long = 0

  /**
   * Initialize the face landmarker with GPU fallback to CPU
   */
  fun initialize(): Boolean {
    if (landmarker != null) return true

    val started = System.currentTimeMillis()
    return try {
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath("face_landmarker.task")
        .setDelegate(Delegate.GPU)
        .build()

      val options = FaceLandmarker.FaceLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(RunningMode.LIVE_STREAM)
        .setNumFaces(1)
        .setMinFaceDetectionConfidence(0.4f)
        .setMinFacePresenceConfidence(0.4f)
        .setMinTrackingConfidence(0.4f)
        .setOutputFaceBlendshapes(true)
        .setOutputFacialTransformationMatrixes(true)
        .setResultListener { result: FaceLandmarkerResult, _: MPImage -> onResult(result) }
        .setErrorListener { error: RuntimeException -> onError(error) }
        .build()

      landmarker = FaceLandmarker.createFromOptions(context, options)
      delegate = "gpu"
      loadTimeMs = System.currentTimeMillis() - started
      true
    } catch (gpuError: Exception) {
      android.util.Log.w("FaceLandmarkerEngine", "GPU delegate unavailable, using CPU: ${gpuError.message}")
      try {
        val baseOptions = BaseOptions.builder()
          .setModelAssetPath("face_landmarker.task")
          .setDelegate(Delegate.CPU)
          .build()

        val options = FaceLandmarker.FaceLandmarkerOptions.builder()
          .setBaseOptions(baseOptions)
          .setRunningMode(RunningMode.LIVE_STREAM)
          .setNumFaces(1)
          .setMinFaceDetectionConfidence(0.4f)
          .setMinFacePresenceConfidence(0.4f)
          .setMinTrackingConfidence(0.4f)
          .setOutputFaceBlendshapes(true)
          .setOutputFacialTransformationMatrixes(true)
          .setResultListener { result: FaceLandmarkerResult, _: MPImage -> onResult(result) }
          .setErrorListener { error: RuntimeException -> onError(error) }
          .build()

        landmarker = FaceLandmarker.createFromOptions(context, options)
        delegate = "cpu"
        loadTimeMs = System.currentTimeMillis() - started
        true
      } catch (cpuError: Exception) {
        android.util.Log.e("FaceLandmarkerEngine", "Failed to initialize", cpuError)
        false
      }
    }
  }

  /**
   * Process a frame asynchronously
   */
  fun processFrame(image: MPImage, timestampMs: Long) {
    landmarker?.detectAsync(image, timestampMs)
  }

  /**
   * Check if engine is initialized
   */
  fun isInitialized(): Boolean = landmarker != null

  /**
   * Get delegate type
   */
  fun getDelegate(): String = delegate

  /**
   * Get load time
   */
  fun getLoadTimeMs(): Long = loadTimeMs

  /**
   * Release resources
   */
  fun close() {
    landmarker?.close()
    landmarker = null
    delegate = "none"
    loadTimeMs = 0
  }

  private fun onResult(result: FaceLandmarkerResult) {
    // TODO: Emit result to JavaScript
    android.util.Log.d("FaceLandmarkerEngine", "Face detected: ${result.faceLandmarks().size}")
  }

  private fun onError(error: Exception) {
    android.util.Log.e("FaceLandmarkerEngine", "Inference error", error)
  }
}
