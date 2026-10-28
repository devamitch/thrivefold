package expo.modules.setubetascanner.algorithms.vision

import expo.modules.setubetascanner.algorithms.GeometryMath
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult

/**
 * Analyzes facial asymmetry using bilateral Euclidean vectors
 */
class FaceAsymmetryAnalyzer {

    fun analyze(result: FaceLandmarkerResult): FaceAsymmetryMetrics {
        val landmarks = result.faceLandmarks()[0]

        // Orbital Cant: Line between lateral canthi (33 left, 263 right) vs horizontal axis
        val leftCanthus = landmarks[33]
        val rightCanthus = landmarks[263]
        val orbitalCant = GeometryMath.signedAngle2D(
            leftCanthus.x(),
            leftCanthus.y(),
            rightCanthus.x(),
            rightCanthus.y()
        )

        // Lip Tilt: Oral commissures (61 left, 291 right)
        val leftCommissure = landmarks[61]
        val rightCommissure = landmarks[291]
        val lipTilt = GeometryMath.signedAngle2D(
            leftCommissure.x(),
            leftCommissure.y(),
          rightCommissure.x(),
          rightCommissure.y()
        )

        // Malar/Cheek Asymmetry: Z-depth differential between landmarks 116 and 345
        val leftCheek = landmarks[116]
        val rightCheek = landmarks[345]
        val malarAsymmetry = kotlin.math.abs(leftCheek.z() - rightCheek.z()).toDouble()

        // Overall asymmetry index (0 = perfectly symmetric, 1 = highly asymmetric)
        val overallAsymmetryIndex = (kotlin.math.abs(orbitalCant) +
            kotlin.math.abs(lipTilt) +
            malarAsymmetry) / 3.0

        return FaceAsymmetryMetrics(
            orbitalCant = orbitalCant,
            lipTilt = lipTilt,
            malarAsymmetry = malarAsymmetry,
            overallAsymmetryIndex = overallAsymmetryIndex
        )
    }
}

data class FaceAsymmetryMetrics(
    val orbitalCant: Double,
    val lipTilt: Double,
    val malarAsymmetry: Double,
    val overallAsymmetryIndex: Double
)
