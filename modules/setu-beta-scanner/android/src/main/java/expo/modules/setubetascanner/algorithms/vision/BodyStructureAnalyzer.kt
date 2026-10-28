package expo.modules.setubetascanner.algorithms.vision

import expo.modules.setubetascanner.algorithms.GeometryMath
import expo.modules.setubetascanner.algorithms.Point3D
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult

/**
 * Analyzes body structure and somatotype using pose landmarks
 */
class BodyStructureAnalyzer {

    fun analyze(result: PoseLandmarkerResult): BodyStructureMetrics {
        val landmarks = result.landmarks()[0]

        // Biacromial to Biiliac Ratio: Shoulder width vs Hip width
        val leftShoulder = landmarks[11]
        val rightShoulder = landmarks[12]
        val leftHip = landmarks[23]
        val rightHip = landmarks[24]

        val shoulderWidth = GeometryMath.distance3D(
            Point3D(leftShoulder.x().toDouble(), leftShoulder.y().toDouble(), leftShoulder.z().toDouble()),
            Point3D(rightShoulder.x().toDouble(), rightShoulder.y().toDouble(), rightShoulder.z().toDouble())
        )

        val hipWidth = GeometryMath.distance3D(
            Point3D(leftHip.x().toDouble(), leftHip.y().toDouble(), leftHip.z().toDouble()),
            Point3D(rightHip.x().toDouble(), rightHip.y().toDouble(), rightHip.z().toDouble())
        )

        val biacromialBiiliacRatio = shoulderWidth / (hipWidth + 0.001)

        // Somatotype classification
        val somatotype = classifySomatotype(biacromialBiiliacRatio)

        // Torso to Leg ratio
        val torsoTop = GeometryMath.midpoint3D(
            Point3D(leftShoulder.x().toDouble(), leftShoulder.y().toDouble(), leftShoulder.z().toDouble()),
            Point3D(rightShoulder.x().toDouble(), rightShoulder.y().toDouble(), rightShoulder.z().toDouble())
        )

        val torsoBottom = GeometryMath.midpoint3D(
            Point3D(leftHip.x().toDouble(), leftHip.y().toDouble(), leftHip.z().toDouble()),
            Point3D(rightHip.x().toDouble(), rightHip.y().toDouble(), rightHip.z().toDouble())
        )

        val leftAnkle = landmarks[27]
        val rightAnkle = landmarks[28]
        val legBottom = GeometryMath.midpoint3D(
            Point3D(leftAnkle.x().toDouble(), leftAnkle.y().toDouble(), leftAnkle.z().toDouble()),
            Point3D(rightAnkle.x().toDouble(), rightAnkle.y().toDouble(), rightAnkle.z().toDouble())
        )

        val torsoLength = GeometryMath.distance3D(torsoTop, torsoBottom)
        val legLength = GeometryMath.distance3D(torsoBottom, legBottom)
        val torsoLegRatio = torsoLength / (legLength + 0.001)

        return BodyStructureMetrics(
            biacromialBiiliacRatio = biacromialBiiliacRatio,
            somatotype = somatotype,
            torsoLegRatio = torsoLegRatio,
            shoulderHipRatio = shoulderWidth / hipWidth
        )
    }

    private fun classifySomatotype(ratio: Double): String {
        return when {
            ratio > 1.4 -> "mesomorph" // V-taper
            ratio > 1.0 -> "ectomorph" // H-frame
            else -> "endomorph" // Pear/A-frame
        }
    }
}

data class BodyStructureMetrics(
    val biacromialBiiliacRatio: Double,
    val somatotype: String,
    val torsoLegRatio: Double,
    val shoulderHipRatio: Double
)
