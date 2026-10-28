package expo.modules.setubetascanner.algorithms.vision

import expo.modules.setubetascanner.algorithms.GeometryMath
import expo.modules.setubetascanner.algorithms.Point3D

/**
 * Analyzes facial geometry from landmarks
 * Computes pupillary distance, face shape, asymmetry, and golden ratio
 */
class FaceGeometryAnalyzer {
  companion object {
    // Average human iris diameter in millimeters
    private const val IRIS_DIAMETER_MM = 11.7

    // Landmark indices (MediaPipe Face Landmarker)
    private const val LEFT_IRIS_CENTER = 468
    private const val RIGHT_IRIS_CENTER = 473
    private const val LEFT_IRIS_LEFT = 469
    private const val LEFT_IRIS_RIGHT = 471
    private const val FOREHEAD_TOP = 10
    private const val GLABELLA = 168
    private const val NOSE_TIP = 4
    private const val CHIN = 152
    private const val LEFT_CANTHUS = 33
    private const val RIGHT_CANTHUS = 263
    private const val LEFT_MALAR = 116
    private const val RIGHT_MALAR = 345
    private const val LEFT_JAW = 58
    private const val RIGHT_JAW = 288
  }

  /**
   * Calculate pupillary distance in millimeters
   * Uses iris diameter as a calibration reference
   */
  fun calculatePupillaryDistance(landmarks: List<Point3D>): Double {
    if (landmarks.size <= RIGHT_IRIS_CENTER) return 0.0

    val leftIris = landmarks[LEFT_IRIS_CENTER]
    val rightIris = landmarks[RIGHT_IRIS_CENTER]

    // Pixel distance between iris centers
    val pixelDistance = GeometryMath.distance3D(leftIris, rightIris)

    // Pixel width of left iris for calibration
    val leftIrisLeft = landmarks[LEFT_IRIS_LEFT]
    val leftIrisRight = landmarks[LEFT_IRIS_RIGHT]
    val irisPixelWidth = GeometryMath.distance3D(leftIrisLeft, leftIrisRight)

    if (irisPixelWidth < 0.1) return 0.0

    // Scale to millimeters
    return (pixelDistance / irisPixelWidth) * IRIS_DIAMETER_MM
  }

  /**
   * Classify face shape based on proportions
   */
  fun classifyFaceShape(landmarks: List<Point3D>): String {
    if (landmarks.size <= RIGHT_JAW) return "unknown"

    val cheekboneWidth = GeometryMath.distance3D(landmarks[LEFT_MALAR], landmarks[RIGHT_MALAR])
    val jawWidth = GeometryMath.distance3D(landmarks[LEFT_JAW], landmarks[RIGHT_JAW])
    val faceHeight = GeometryMath.distance3D(landmarks[FOREHEAD_TOP], landmarks[CHIN])

    val cheekboneToJawRatio = cheekboneWidth / jawWidth
    val heightToWidthRatio = faceHeight / cheekboneWidth

    return when {
      heightToWidthRatio > 1.3 && cheekboneToJawRatio > 1.1 -> "oval"
      heightToWidthRatio < 1.1 && cheekboneToJawRatio < 1.05 -> "square"
      cheekboneToJawRatio > 1.2 && jawWidth < cheekboneWidth * 0.8 -> "heart"
      heightToWidthRatio < 1.2 && cheekboneToJawRatio < 1.1 -> "round"
      else -> "oval" // Default
    }
  }

  /**
   * Calculate facial asymmetry score
   * Returns 0.0 (perfectly symmetric) to 1.0 (highly asymmetric)
   */
  fun calculateAsymmetryScore(landmarks: List<Point3D>): Double {
    if (landmarks.size <= RIGHT_MALAR) return 0.0

    // Orbital cant asymmetry
    val leftCanthus = landmarks[LEFT_CANTHUS]
    val rightCanthus = landmarks[RIGHT_CANTHUS]
    val yDiff = kotlin.math.abs(leftCanthus.y - rightCanthus.y)
    val faceHeight = GeometryMath.distance3D(landmarks[FOREHEAD_TOP], landmarks[CHIN])
    val orbitalAsymmetry = yDiff / faceHeight

    // Malar Z-depth asymmetry
    val leftMalar = landmarks[LEFT_MALAR]
    val rightMalar = landmarks[RIGHT_MALAR]
    val zDiff = kotlin.math.abs(leftMalar.z - rightMalar.z)
    val maxZ = kotlin.math.max(kotlin.math.abs(leftMalar.z), kotlin.math.abs(rightMalar.z))
    val malarAsymmetry = if (maxZ > 0.01) zDiff / maxZ else 0.0

    // Combined asymmetry score
    return (orbitalAsymmetry + malarAsymmetry) / 2.0
  }

  /**
   * Calculate golden ratio score
   * Compares facial proportions to the golden ratio (1.618)
   */
  fun calculateGoldenRatioScore(landmarks: List<Point3D>): Double {
    if (landmarks.size <= CHIN) return 0.0

    // Rule of thirds: forehead to glabella, glabella to nose, nose to chin
    val foreheadToGlabella = GeometryMath.distance3D(landmarks[FOREHEAD_TOP], landmarks[GLABELLA])
    val glabellaToNose = GeometryMath.distance3D(landmarks[GLABELLA], landmarks[NOSE_TIP])
    val noseToChin = GeometryMath.distance3D(landmarks[NOSE_TIP], landmarks[CHIN])

    val total = foreheadToGlabella + glabellaToNose + noseToChin
    if (total < 0.1) return 0.0

    // Ideal: each segment is 1/3 of total
    val foreheadRatio = foreheadToGlabella / total
    val glabellaRatio = glabellaToNose / total
    val noseRatio = noseToChin / total

    // Deviation from ideal (1/3)
    val deviation = kotlin.math.abs(foreheadRatio - 1.0 / 3.0) +
      kotlin.math.abs(glabellaRatio - 1.0 / 3.0) +
      kotlin.math.abs(noseRatio - 1.0 / 3.0)

    // Convert to score (0 = poor, 1 = perfect)
    return (1.0 - deviation).coerceIn(0.0, 1.0)
  }
}
