package expo.modules.setubetascanner

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.setubetascanner.contracts.*
import expo.modules.setubetascanner.lifecycle.BetaSessionCoordinator
import expo.modules.setubetascanner.models.ModelRegistry
import expo.modules.setubetascanner.vision.VisionTaskFactory
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * Main Expo module for Setu Beta Scanner
 * Provides MediaPipe-powered vision and audio features
 */
class SetuBetaScannerModule : Module() {
  private val moduleScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
  private lateinit var sessionCoordinator: BetaSessionCoordinator
  private lateinit var modelRegistry: ModelRegistry
  private lateinit var visionFactory: VisionTaskFactory

  override fun definition() = ModuleDefinition {
    Name("SetuBetaScanner")
    Events("onSessionStateChanged", "onResult", "onSessionError", "onSessionWarning")

    // Initialize on module load
    OnCreate {
      val context = appContext.reactContext?.applicationContext ?: return@OnCreate
      visionFactory = VisionTaskFactory(context)
      sessionCoordinator = BetaSessionCoordinator(context) { eventName, payload ->
        this@SetuBetaScannerModule.sendEvent(eventName, payload)
      }
      modelRegistry = ModelRegistry(context)
      SetuBetaScannerPluginRegistration.register {
        if (::sessionCoordinator.isInitialized) sessionCoordinator else null
      }
    }

      // Get available capabilities
      AsyncFunction("getCapabilities") {
        val capabilities = listOf(
          BetaCapability(
            id = "reading-ergonomics",
            title = "Reading Ergonomics",
            description = "Track screen distance, gaze angle, and reading fatigue with 20-20-20 rule enforcement",
            status = "available",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = true,
            requiredModels = listOf("face_landmarker.task")
          ),
          BetaCapability(
            id = "posture-correction",
            title = "Posture Correction",
            description = "Monitor forward head posture, rounded shoulders, and pelvic tilt with real-time feedback",
            status = "available",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = false,
            requiredModels = listOf("pose_landmarker.task")
          ),
          BetaCapability(
            id = "meditation-biofeedback",
            title = "Meditation Biofeedback",
            description = "Heart rate, breathing rate, and relaxation depth monitoring for guided meditation",
            status = "available",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = false,
            requiredModels = listOf("face_landmarker.task", "pose_landmarker.task")
          ),
          BetaCapability(
            id = "facial-geometry",
            title = "Facial Geometry & Eyewear",
            description = "Pupillary distance measurement, face shape classification, and asymmetry analysis",
            status = "available",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = true,
            requiredModels = listOf("face_landmarker.task")
          ),
          BetaCapability(
            id = "face-asymmetry",
            title = "Facial Asymmetry Analysis",
            description = "Detect facial construction issues and asymmetry using bilateral Euclidean vectors",
            status = "available",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = false,
            requiredModels = listOf("face_landmarker.task")
          ),
          BetaCapability(
            id = "eyewear-preview",
            title = "Suitable Eye Frames",
            description = "Calculate pupillary distance and recommend frame shapes based on face geometry",
            status = "available",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = true,
            requiredModels = listOf("face_landmarker.task")
          ),
          BetaCapability(
            id = "jawline-analysis",
            title = "Jawline & Color Analysis",
            description = "Compute gonial angle and identify personal color palette from skin undertones",
            status = "available",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = false,
            requiredModels = listOf("face_landmarker.task")
          ),
          BetaCapability(
            id = "teeth-alignment",
            title = "Teeth Alignment Screening",
            description = "Anterior teeth alignment detection using lip landmarks and HSV thresholding",
            status = "experimental",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = false,
            requiredModels = listOf("face_landmarker.task")
          ),
          BetaCapability(
            id = "body-structure",
            title = "Body Structure Analysis",
            description = "Somatotype classification using biacromial to biiliac ratios and torso-leg proportions",
            status = "available",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = false,
            requiredModels = listOf("pose_landmarker.task")
          ),
          BetaCapability(
            id = "exercise-coaching",
            title = "Live Exercise Identification",
            description = "Rep counting and form validation for squats, pushups, and lunges",
            status = "available",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = false,
            requiredModels = listOf("pose_landmarker.task")
          ),
          BetaCapability(
            id = "voice-training",
            title = "Deep Voice Training",
            description = "Pitch tracking and formant analysis for voice resonance improvement",
            status = "available",
            localOnly = true,
            requiresCamera = false,
            requiresMicrophone = true,
            requiresCalibration = false,
            requiredModels = emptyList()
          ),
          BetaCapability(
            id = "handwriting-practice",
            title = "Handwriting Improvement",
            description = "Dynamic tripod grip validation and pen angle tracking",
            status = "available",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = false,
            requiredModels = listOf("hand_landmarker.task")
          ),
          BetaCapability(
            id = "gesture-control",
            title = "Hand Gesture Control",
            description = "Touchless UI with pinch-to-click and spatial gestures",
            status = "available",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = false,
            requiredModels = listOf("hand_landmarker.task", "gesture_recognizer.task")
          ),
          BetaCapability(
            id = "motor-analysis",
            title = "Motor & Neurological Analysis",
            description = "Tremor frequency extraction and facial palsy detection",
            status = "experimental",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = false,
            requiredModels = listOf("hand_landmarker.task", "face_landmarker.task")
          ),
          BetaCapability(
            id = "breathing-guide",
            title = "Guided Breathing",
            description = "Paced respiration with visual and audio cues for relaxation",
            status = "available",
            localOnly = true,
            requiresCamera = false,
            requiresMicrophone = false,
            requiresCalibration = false,
            requiredModels = emptyList()
          ),
          BetaCapability(
            id = "color-style",
            title = "Color Style Analysis",
            description = "Clothing color extraction and skin undertone matching for outfit recommendations",
            status = "available",
            localOnly = true,
            requiresCamera = true,
            requiresMicrophone = false,
            requiresCalibration = false,
            requiredModels = listOf("face_landmarker.task", "image_segmenter.task")
          )
        )
        capabilities
      }

      // Get model status
      AsyncFunction("getModelStatus") {
        sessionCoordinator.getModelStatus()
      }

      // Start a new session
      AsyncFunction("startSession") { config: Map<String, Any> ->
        val featureId = config["featureId"] as String
        val cameraPosition = config["cameraPosition"] as? String ?: "front"
        val enableAudio = config["enableAudio"] as? Boolean ?: false
        val sampleRateHz = config["sampleRateHz"] as? Int ?: 16000

        val sessionConfig = BetaSessionConfig(
          featureId = featureId,
          cameraPosition = cameraPosition,
          enableAudio = enableAudio,
          sampleRateHz = sampleRateHz
        )

        sessionCoordinator.startSession(sessionConfig)
      }

      // Pause a session
      AsyncFunction("pauseSession") { sessionId: String ->
        sessionCoordinator.pauseSession(sessionId)
      }

      // Resume a session
      AsyncFunction("resumeSession") { sessionId: String ->
        sessionCoordinator.resumeSession(sessionId)
      }

      // Stop a session
      AsyncFunction("stopSession") { sessionId: String ->
        sessionCoordinator.stopSession(sessionId)
      }

      // Release all resources
      AsyncFunction("releaseResources") {
        sessionCoordinator.releaseResources()
      }

      // Get model information
      AsyncFunction("getModelInfo") { modelId: String ->
        modelRegistry.getModelInfo(modelId)?.let { info ->
          mapOf(
            "id" to info.id,
            "assetPath" to info.assetPath,
            "version" to info.version,
            "license" to info.license,
            "requiredDelegate" to info.requiredDelegate,
            "estimatedSizeBytes" to info.estimatedSizeBytes
          )
        }
      }

      // Check feature availability
      AsyncFunction("checkFeatureAvailability") { featureId: String ->
        when (val availability = modelRegistry.getFeatureAvailability(featureId)) {
          is expo.modules.setubetascanner.models.FeatureAvailability.AVAILABLE -> mapOf("status" to "available")
          is expo.modules.setubetascanner.models.FeatureAvailability.MODEL_UNAVAILABLE -> mapOf("status" to "unavailable")
          is expo.modules.setubetascanner.models.FeatureAvailability.PARTIALLY_AVAILABLE -> mapOf(
            "status" to "partially_available",
            "missingModels" to availability.missingModels
          )
        }
      }

      // Process a camera frame (called from VisionCamera frame processor)
      Function("processFrame") { sessionId: String, width: Int, height: Int, bytes: ByteArray ->
        val bitmap = android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
        if (bitmap != null) {
          sessionCoordinator.processFrame(sessionId, bitmap, System.currentTimeMillis())
        }
      }

      // Cleanup on module destroy
      OnDestroy {
        moduleScope.launch {
          sessionCoordinator.releaseResources()
          visionFactory.releaseResources()
        }
      }
    }
}
