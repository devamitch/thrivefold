package expo.modules.setubetascanner.algorithms.vision

import expo.modules.setubetascanner.algorithms.GeometryMath
import expo.modules.setubetascanner.algorithms.Point3D
import expo.modules.setubetascanner.algorithms.AngleResult
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark

/**
 * Analyzes exercise form and counts repetitions using state machines
 */
class ExerciseAnalyzer {

    private var currentExercise: String = "none"
    private var state: ExerciseState = ExerciseState.WAITING
    private var repCount: Int = 0
    private var formDefects: MutableList<String> = mutableListOf()

    enum class ExerciseState {
        WAITING,
        STARTING,
        ECCENTRIC,
        BOTTOM,
        CONCENTRIC,
        COMPLETED
    }

    fun analyze(result: PoseLandmarkerResult, exerciseType: String): ExerciseMetrics {
        val landmarks = result.landmarks()[0]

        return when (exerciseType) {
            "squat" -> analyzeSquat(landmarks)
            "pushup" -> analyzePushup(landmarks)
            "lunge" -> analyzeLunge(landmarks)
            else -> ExerciseMetrics(
                exerciseType = exerciseType,
                repCount = 0,
                formQuality = 0.0,
                formDefects = emptyList(),
                jointAngles = emptyMap()
            )
        }
    }

    private fun analyzeSquat(landmarks: List<NormalizedLandmark>): ExerciseMetrics {
        // Squat: Hip (23/25), Knee (25/26), Ankle (27/28)
        val leftHip = landmarks[23]
        val leftKnee = landmarks[25]
        val leftAnkle = landmarks[27]

        val hipPoint = Point3D(leftHip.x().toDouble(), leftHip.y().toDouble(), leftHip.z().toDouble())
        val kneePoint = Point3D(leftKnee.x().toDouble(), leftKnee.y().toDouble(), leftKnee.z().toDouble())
        val anklePoint = Point3D(leftAnkle.x().toDouble(), leftAnkle.y().toDouble(), leftAnkle.z().toDouble())

        val kneeAngleResult = GeometryMath.angleDegrees3D(hipPoint, kneePoint, anklePoint)
        val kneeAngle = if (kneeAngleResult is AngleResult.Valid) kneeAngleResult.degrees else 0.0

        // State machine for squat repetition
        updateSquatState(kneeAngle)

        // Check for valgus knees (knees caving inward)
        val rightKnee = landmarks[26]
        val valgusRatio = kotlin.math.abs(leftKnee.x() - rightKnee.x()) /
            kotlin.math.abs(leftAnkle.x() - landmarks[28].x())

        if (valgusRatio < 0.8 && state == ExerciseState.BOTTOM) {
            formDefects.add("Knee valgus detected - keep knees tracking over toes")
        }

        val formQuality = calculateFormQuality(kneeAngle, valgusRatio.toDouble())

        return ExerciseMetrics(
            exerciseType = "squat",
            repCount = repCount,
            formQuality = formQuality,
            formDefects = formDefects.toList(),
            jointAngles = mapOf("left_knee" to kneeAngle)
        )
    }

    private fun updateSquatState(kneeAngle: Double) {
        when (state) {
            ExerciseState.WAITING -> {
                if (kneeAngle > 165) {
                    state = ExerciseState.STARTING
                }
            }
            ExerciseState.STARTING -> {
                if (kneeAngle < 150) {
                    state = ExerciseState.ECCENTRIC
                }
            }
            ExerciseState.ECCENTRIC -> {
                if (kneeAngle < 90) {
                    state = ExerciseState.BOTTOM
                }
            }
            ExerciseState.BOTTOM -> {
                if (kneeAngle > 100) {
                    state = ExerciseState.CONCENTRIC
                }
            }
            ExerciseState.CONCENTRIC -> {
                if (kneeAngle > 165) {
                    state = ExerciseState.COMPLETED
                    repCount++
                    formDefects.clear()
                    state = ExerciseState.STARTING
                }
            }
            ExerciseState.COMPLETED -> {
                state = ExerciseState.STARTING
            }
        }
    }

    private fun analyzePushup(landmarks: List<NormalizedLandmark>): ExerciseMetrics {
        // Pushup: Shoulder (11/12), Elbow (13/14), Wrist (15/16)
        val leftShoulder = landmarks[11]
        val leftElbow = landmarks[13]
        val leftWrist = landmarks[15]

        val shoulderPoint = Point3D(leftShoulder.x().toDouble(), leftShoulder.y().toDouble(), leftShoulder.z().toDouble())
        val elbowPoint = Point3D(leftElbow.x().toDouble(), leftElbow.y().toDouble(), leftElbow.z().toDouble())
        val wristPoint = Point3D(leftWrist.x().toDouble(), leftWrist.y().toDouble(), leftWrist.z().toDouble())

        val elbowAngleResult = GeometryMath.angleDegrees3D(shoulderPoint, elbowPoint, wristPoint)
        val elbowAngle = if (elbowAngleResult is AngleResult.Valid) elbowAngleResult.degrees else 0.0

        return ExerciseMetrics(
            exerciseType = "pushup",
            repCount = 0, // State machine not implemented for pushup yet
            formQuality = if (elbowAngle > 90) 0.5 else 0.8,
            formDefects = emptyList(),
            jointAngles = mapOf("left_elbow" to elbowAngle)
        )
    }

    private fun analyzeLunge(landmarks: List<NormalizedLandmark>): ExerciseMetrics {
        return ExerciseMetrics(
            exerciseType = "lunge",
            repCount = 0,
            formQuality = 0.0,
            formDefects = emptyList(),
            jointAngles = emptyMap()
        )
    }

    private fun calculateFormQuality(kneeAngle: Double, valgusRatio: Double): Double {
        var quality = 1.0

        // Penalize incomplete depth
        if (kneeAngle > 100) quality -= 0.3

        // Penalize valgus
        if (valgusRatio < 0.8) quality -= 0.4

        return quality.coerceIn(0.0, 1.0)
    }

    fun reset() {
        currentExercise = "none"
        state = ExerciseState.WAITING
        repCount = 0
        formDefects.clear()
    }
}

data class ExerciseMetrics(
    val exerciseType: String,
    val repCount: Int,
    val formQuality: Double,
    val formDefects: List<String>,
    val jointAngles: Map<String, Double>
)
