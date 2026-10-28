package expo.modules.setubetascanner.vision

import android.content.Context
import com.google.mediapipe.framework.image.MPImage
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import com.google.mediapipe.tasks.vision.gesturerecognizer.GestureRecognizer

/**
 * Factory for creating and managing MediaPipe vision tasks
 * Handles model loading, delegate selection, and resource cleanup
 */
class VisionTaskFactory(private val context: Context) {
  private var faceLandmarker: FaceLandmarker? = null
  private var poseLandmarker: PoseLandmarker? = null
  private var handLandmarker: HandLandmarker? = null
  private var gestureRecognizer: GestureRecognizer? = null
  private var faceDelegate: String = "none"
  private var poseDelegate: String = "none"
  private var handDelegate: String = "none"
  private var gestureDelegate: String = "none"
  private var faceLoadTimeMs: Long = 0
  private var poseLoadTimeMs: Long = 0
  private var handLoadTimeMs: Long = 0
  private var gestureLoadTimeMs: Long = 0

  fun initializeFaceLandmarker(): Boolean {
    if (faceLandmarker != null) return true

    val started = System.currentTimeMillis()
    return try {
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath("face_landmarker.task")
        .setDelegate(Delegate.GPU)
        .build()

      val options = FaceLandmarker.FaceLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(RunningMode.IMAGE)
        .setNumFaces(1)
        .setMinFaceDetectionConfidence(0.4f)
        .setMinFacePresenceConfidence(0.4f)
        .setMinTrackingConfidence(0.4f)
        .setOutputFaceBlendshapes(true)
        .setOutputFacialTransformationMatrixes(true)
        .build()

      faceLandmarker = FaceLandmarker.createFromOptions(context, options)
      faceDelegate = "gpu"
      faceLoadTimeMs = System.currentTimeMillis() - started
      true
    } catch (gpuError: Exception) {
      android.util.Log.w("VisionTaskFactory", "GPU delegate unavailable for Face Landmarker, using CPU: ${gpuError.message}")
      try {
        val baseOptions = BaseOptions.builder()
          .setModelAssetPath("face_landmarker.task")
          .setDelegate(Delegate.CPU)
          .build()

        val options = FaceLandmarker.FaceLandmarkerOptions.builder()
          .setBaseOptions(baseOptions)
          .setRunningMode(RunningMode.IMAGE)
          .setNumFaces(1)
          .setMinFaceDetectionConfidence(0.4f)
          .setMinFacePresenceConfidence(0.4f)
          .setMinTrackingConfidence(0.4f)
          .setOutputFaceBlendshapes(true)
          .setOutputFacialTransformationMatrixes(true)
          .build()

        faceLandmarker = FaceLandmarker.createFromOptions(context, options)
        faceDelegate = "cpu"
        faceLoadTimeMs = System.currentTimeMillis() - started
        true
      } catch (cpuError: Exception) {
        android.util.Log.e("VisionTaskFactory", "Failed to initialize Face Landmarker", cpuError)
        false
      }
    }
  }

  fun initializePoseLandmarker(): Boolean {
    if (poseLandmarker != null) return true

    val started = System.currentTimeMillis()
    return try {
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath("pose_landmarker.task")
        .setDelegate(Delegate.GPU)
        .build()

      val options = PoseLandmarker.PoseLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(RunningMode.IMAGE)
        .setMinPoseDetectionConfidence(0.4f)
        .setMinPosePresenceConfidence(0.4f)
        .setMinTrackingConfidence(0.4f)
        .setOutputSegmentationMasks(false)
        .build()

      poseLandmarker = PoseLandmarker.createFromOptions(context, options)
      poseDelegate = "gpu"
      poseLoadTimeMs = System.currentTimeMillis() - started
      true
    } catch (gpuError: Exception) {
      android.util.Log.w("VisionTaskFactory", "GPU delegate unavailable for Pose Landmarker, using CPU: ${gpuError.message}")
      try {
        val baseOptions = BaseOptions.builder()
          .setModelAssetPath("pose_landmarker.task")
          .setDelegate(Delegate.CPU)
          .build()

        val options = PoseLandmarker.PoseLandmarkerOptions.builder()
          .setBaseOptions(baseOptions)
          .setRunningMode(RunningMode.IMAGE)
          .setMinPoseDetectionConfidence(0.4f)
          .setMinPosePresenceConfidence(0.4f)
          .setMinTrackingConfidence(0.4f)
          .setOutputSegmentationMasks(false)
          .build()

        poseLandmarker = PoseLandmarker.createFromOptions(context, options)
        poseDelegate = "cpu"
        poseLoadTimeMs = System.currentTimeMillis() - started
        true
      } catch (cpuError: Exception) {
        android.util.Log.e("VisionTaskFactory", "Failed to initialize Pose Landmarker", cpuError)
        false
      }
    }
  }

  fun getFaceLandmarker(): FaceLandmarker? = faceLandmarker

  fun getPoseLandmarker(): PoseLandmarker? = poseLandmarker

  fun getHandLandmarker(): HandLandmarker? = handLandmarker

  fun getGestureRecognizer(): GestureRecognizer? = gestureRecognizer

  /**
   * Synchronous face detection for a single frame
   */
  fun detectFace(image: MPImage): FaceLandmarkerResult? {
    return faceLandmarker?.detect(image)
  }

  /**
   * Synchronous pose detection for a single frame
   */
  fun detectPose(image: MPImage): PoseLandmarkerResult? {
    return poseLandmarker?.detect(image)
  }

  /**
   * Synchronous hand detection for a single frame
   */
  fun detectHand(image: MPImage): HandLandmarkerResult? {
    return handLandmarker?.detect(image)
  }

  fun initializeHandLandmarker(): Boolean {
    if (handLandmarker != null) return true

    val started = System.currentTimeMillis()
    return try {
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath("hand_landmarker.task")
        .setDelegate(Delegate.GPU)
        .build()

      val options = HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(RunningMode.IMAGE)
        .setNumHands(2)
        .setMinHandDetectionConfidence(0.5f)
        .setMinHandPresenceConfidence(0.5f)
        .setMinTrackingConfidence(0.5f)
        .build()

      handLandmarker = HandLandmarker.createFromOptions(context, options)
      handDelegate = "gpu"
      handLoadTimeMs = System.currentTimeMillis() - started
      true
    } catch (gpuError: Exception) {
      android.util.Log.w("VisionTaskFactory", "GPU delegate unavailable for Hand Landmarker, using CPU: ${gpuError.message}")
      try {
        val baseOptions = BaseOptions.builder()
          .setModelAssetPath("hand_landmarker.task")
          .setDelegate(Delegate.CPU)
          .build()

        val options = HandLandmarker.HandLandmarkerOptions.builder()
          .setBaseOptions(baseOptions)
          .setRunningMode(RunningMode.IMAGE)
          .setNumHands(2)
          .setMinHandDetectionConfidence(0.5f)
          .setMinHandPresenceConfidence(0.5f)
          .setMinTrackingConfidence(0.5f)
          .build()

        handLandmarker = HandLandmarker.createFromOptions(context, options)
        handDelegate = "cpu"
        handLoadTimeMs = System.currentTimeMillis() - started
        true
      } catch (cpuError: Exception) {
        android.util.Log.e("VisionTaskFactory", "Failed to initialize Hand Landmarker", cpuError)
        false
      }
    }
  }

  fun initializeGestureRecognizer(): Boolean {
    if (gestureRecognizer != null) return true

    val started = System.currentTimeMillis()
    return try {
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath("gesture_recognizer.task")
        .setDelegate(Delegate.GPU)
        .build()

      val options = GestureRecognizer.GestureRecognizerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(RunningMode.IMAGE)
        .setNumHands(2)
        .setMinHandDetectionConfidence(0.5f)
        .setMinHandPresenceConfidence(0.5f)
        .setMinTrackingConfidence(0.5f)
        .build()

      gestureRecognizer = GestureRecognizer.createFromOptions(context, options)
      gestureDelegate = "gpu"
      gestureLoadTimeMs = System.currentTimeMillis() - started
      true
    } catch (gpuError: Exception) {
      android.util.Log.w("VisionTaskFactory", "GPU delegate unavailable for Gesture Recognizer, using CPU: ${gpuError.message}")
      try {
        val baseOptions = BaseOptions.builder()
          .setModelAssetPath("gesture_recognizer.task")
          .setDelegate(Delegate.CPU)
          .build()

        val options = GestureRecognizer.GestureRecognizerOptions.builder()
          .setBaseOptions(baseOptions)
          .setRunningMode(RunningMode.IMAGE)
          .setNumHands(2)
          .setMinHandDetectionConfidence(0.5f)
          .setMinHandPresenceConfidence(0.5f)
          .setMinTrackingConfidence(0.5f)
          .build()

        gestureRecognizer = GestureRecognizer.createFromOptions(context, options)
        gestureDelegate = "cpu"
        gestureLoadTimeMs = System.currentTimeMillis() - started
        true
      } catch (cpuError: Exception) {
        android.util.Log.e("VisionTaskFactory", "Failed to initialize Gesture Recognizer", cpuError)
        false
      }
    }
  }

  fun getModelStatus(): List<Map<String, Any?>> {
    return listOf(
      mapOf(
        "modelId" to "face_landmarker.task",
        "isLoaded" to (faceLandmarker != null),
        "loadTimeMs" to faceLoadTimeMs,
        "delegate" to faceDelegate,
        "error" to (if (faceLandmarker == null) "Not loaded" else null)
      ),
      mapOf(
        "modelId" to "pose_landmarker.task",
        "isLoaded" to (poseLandmarker != null),
        "loadTimeMs" to poseLoadTimeMs,
        "delegate" to poseDelegate,
        "error" to (if (poseLandmarker == null) "Not loaded" else null)
      ),
      mapOf(
        "modelId" to "hand_landmarker.task",
        "isLoaded" to (handLandmarker != null),
        "loadTimeMs" to handLoadTimeMs,
        "delegate" to handDelegate,
        "error" to (if (handLandmarker == null) "Not loaded" else null)
      ),
      mapOf(
        "modelId" to "gesture_recognizer.task",
        "isLoaded" to (gestureRecognizer != null),
        "loadTimeMs" to gestureLoadTimeMs,
        "delegate" to gestureDelegate,
        "error" to (if (gestureRecognizer == null) "Not loaded" else null)
      )
    )
  }

  fun releaseResources() {
    faceLandmarker?.close()
    faceLandmarker = null
    poseLandmarker?.close()
    poseLandmarker = null
    handLandmarker?.close()
    handLandmarker = null
    gestureRecognizer?.close()
    gestureRecognizer = null
    faceDelegate = "none"
    poseDelegate = "none"
    handDelegate = "none"
    gestureDelegate = "none"
    faceLoadTimeMs = 0
    poseLoadTimeMs = 0
    handLoadTimeMs = 0
    gestureLoadTimeMs = 0
  }
}
