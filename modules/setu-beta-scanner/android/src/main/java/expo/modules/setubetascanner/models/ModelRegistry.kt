package expo.modules.setubetascanner.models

import android.content.Context
import android.util.Log

/**
 * Registry for MediaPipe model assets
 * Manages model availability, validation, and asset paths
 */
class ModelRegistry(private val context: Context) {

    data class ModelInfo(
        val id: String,
        val assetPath: String,
        val version: String,
        val license: String,
        val requiredDelegate: String = "gpu",
        val estimatedSizeBytes: Long = 0L
    )

    private val models = mapOf(
        "face_landmarker.task" to ModelInfo(
            id = "face_landmarker.task",
            assetPath = "models/face_landmarker.task",
            version = "2.0",
            license = "Apache 2.0",
            requiredDelegate = "gpu",
            estimatedSizeBytes = 10_000_000L
        ),
        "pose_landmarker.task" to ModelInfo(
            id = "pose_landmarker.task",
            assetPath = "models/pose_landmarker.task",
            version = "1.0",
            license = "Apache 2.0",
            requiredDelegate = "gpu",
            estimatedSizeBytes = 15_000_000L
        ),
        "hand_landmarker.task" to ModelInfo(
            id = "hand_landmarker.task",
            assetPath = "models/hand_landmarker.task",
            version = "1.0",
            license = "Apache 2.0",
            requiredDelegate = "gpu",
            estimatedSizeBytes = 8_000_000L
        ),
        "gesture_recognizer.task" to ModelInfo(
            id = "gesture_recognizer.task",
            assetPath = "models/gesture_recognizer.task",
            version = "1.0",
            license = "Apache 2.0",
            requiredDelegate = "gpu",
            estimatedSizeBytes = 12_000_000L
        ),
        "selfie_multiclass_256x256.tflite" to ModelInfo(
            id = "selfie_multiclass_256x256.tflite",
            assetPath = "models/selfie_multiclass_256x256.tflite",
            version = "1.0",
            license = "Apache 2.0",
            requiredDelegate = "gpu",
            estimatedSizeBytes = 5_000_000L
        )
    )

    fun getModelInfo(modelId: String): ModelInfo? {
        return models[modelId]
    }

    fun getAllModels(): List<ModelInfo> {
        return models.values.toList()
    }

    fun getRequiredModelsForFeature(featureId: String): List<String> {
        return when (featureId) {
            "reading-ergonomics", "meditation-biofeedback", "facial-geometry",
            "face-asymmetry", "eyewear-preview", "jawline-analysis", "teeth-alignment",
            "color-style" -> listOf("face_landmarker.task")
            "posture-correction", "body-structure", "exercise-coaching" -> listOf("pose_landmarker.task")
            "handwriting-practice", "motor-analysis" -> listOf("hand_landmarker.task", "face_landmarker.task")
            "gesture-control" -> listOf("hand_landmarker.task", "gesture_recognizer.task")
            "voice-training", "breathing-guide" -> emptyList()
            else -> emptyList()
        }
    }

    fun validateModelAvailability(modelId: String): Boolean {
        val modelInfo = models[modelId] ?: return false

        return try {
            val assetFile = context.assets.open(modelInfo.assetPath)
            assetFile.close()
            true
        } catch (e: Exception) {
            Log.w("ModelRegistry", "Model not available: $modelId", e)
            false
        }
    }

    fun getFeatureAvailability(featureId: String): FeatureAvailability {
        val requiredModels = getRequiredModelsForFeature(featureId)

        if (requiredModels.isEmpty()) {
            return FeatureAvailability.AVAILABLE
        }

        val missingModels = requiredModels.filterNot { validateModelAvailability(it) }

        return when {
            missingModels.isEmpty() -> FeatureAvailability.AVAILABLE
            missingModels.size == requiredModels.size -> FeatureAvailability.MODEL_UNAVAILABLE
            else -> FeatureAvailability.PARTIALLY_AVAILABLE(missingModels)
        }
    }

    fun getTotalEstimatedSize(): Long {
        return models.values.sumOf { it.estimatedSizeBytes }
    }
}

sealed class FeatureAvailability {
    object AVAILABLE : FeatureAvailability()
    object MODEL_UNAVAILABLE : FeatureAvailability()
    data class PARTIALLY_AVAILABLE(val missingModels: List<String>) : FeatureAvailability()
}
