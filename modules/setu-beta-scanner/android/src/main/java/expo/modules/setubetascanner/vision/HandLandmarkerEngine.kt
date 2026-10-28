package expo.modules.setubetascanner.vision

import android.content.Context
import com.google.mediapipe.framework.image.MPImage
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult

/**
 * MediaPipe Hand Landmarker engine wrapper
 * Handles hand detection and 21-point landmark tracking with GPU fallback
 */
class HandLandmarkerEngine(private val context: Context) : AutoCloseable {
    private var handLandmarker: HandLandmarker? = null
    private var delegate: String = "none"
    private var loadTimeMs: Long = 0
    private var isInitialized = false

    fun initialize(): Boolean {
        if (isInitialized && handLandmarker != null) return true

        val started = System.currentTimeMillis()
        return try {
            val baseOptions = BaseOptions.builder()
                .setModelAssetPath("hand_landmarker.task")
                .setDelegate(Delegate.GPU)
                .build()

            val options = HandLandmarker.HandLandmarkerOptions.builder()
                .setBaseOptions(baseOptions)
                .setRunningMode(RunningMode.LIVE_STREAM)
                .setNumHands(2)
                .setMinHandDetectionConfidence(0.5f)
                .setMinHandPresenceConfidence(0.5f)
                .setMinTrackingConfidence(0.5f)
                .setResultListener { result: HandLandmarkerResult, _: MPImage -> onResult(result) }
                .setErrorListener { error: RuntimeException -> onError(error) }
                .build()

            handLandmarker = HandLandmarker.createFromOptions(context, options)
            delegate = "gpu"
            loadTimeMs = System.currentTimeMillis() - started
            isInitialized = true
            true
        } catch (gpuError: Exception) {
            android.util.Log.w("HandLandmarkerEngine", "GPU delegate unavailable, using CPU: ${gpuError.message}")
            try {
                val baseOptions = BaseOptions.builder()
                    .setModelAssetPath("hand_landmarker.task")
                    .setDelegate(Delegate.CPU)
                    .build()

                val options = HandLandmarker.HandLandmarkerOptions.builder()
                    .setBaseOptions(baseOptions)
                    .setRunningMode(RunningMode.LIVE_STREAM)
                    .setNumHands(2)
                    .setMinHandDetectionConfidence(0.5f)
                    .setMinHandPresenceConfidence(0.5f)
                    .setMinTrackingConfidence(0.5f)
                    .setResultListener { result: HandLandmarkerResult, _: MPImage -> onResult(result) }
                    .setErrorListener { error: RuntimeException -> onError(error) }
                    .build()

                handLandmarker = HandLandmarker.createFromOptions(context, options)
                delegate = "cpu"
                loadTimeMs = System.currentTimeMillis() - started
                isInitialized = true
                true
            } catch (cpuError: Exception) {
                android.util.Log.e("HandLandmarkerEngine", "Failed to initialize", cpuError)
                false
            }
        }
    }

    fun detectAsync(image: MPImage, timestampMs: Long) {
        if (!isInitialized || handLandmarker == null) {
            android.util.Log.w("HandLandmarkerEngine", "Engine not initialized")
            return
        }

        handLandmarker?.detectAsync(image, timestampMs)
    }

    private fun onResult(result: HandLandmarkerResult) {
        android.util.Log.d("HandLandmarkerEngine", "Hands detected: ${result.landmarks().size}")
    }

    private fun onError(error: Exception) {
        android.util.Log.e("HandLandmarkerEngine", "Inference error", error)
    }

    override fun close() {
        handLandmarker?.close()
        handLandmarker = null
        isInitialized = false
        delegate = "none"
        loadTimeMs = 0
    }

    fun isReady(): Boolean = isInitialized && handLandmarker != null
}
