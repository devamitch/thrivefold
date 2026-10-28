package expo.modules.setubetascanner.algorithms.vision

import expo.modules.setubetascanner.algorithms.GeometryMath
import expo.modules.setubetascanner.algorithms.Point3D

/**
 * Analyzes reading ergonomics from face landmarks
 * Computes screen distance, gaze angle, and fatigue indicators
 */
class ReadingErgonomicsAnalyzer {
  companion object {
    // MediaPipe Face Landmarker indices
    private const val LEFT_IRIS_CENTER = 468
    private const val RIGHT_IRIS_CENTER = 473
    private const val LEFT_IRIS_LEFT = 469
    private const val LEFT_IRIS_RIGHT = 471
    private const val LEFT_EYE_INNER = 133
    private const val LEFT_EYE_OUTER = 33
    private const val RIGHT_EYE_INNER = 362
    private const val RIGHT_EYE_OUTER = 263
    private const val LEFT_EYE_TOP = 159
    private const val LEFT_EYE_BOTTOM = 145
    private const val RIGHT_EYE_TOP = 386
    private const val RIGHT_EYE_BOTTOM = 374

    // Average human iris diameter in millimeters
    private const val IRIS_DIAMETER_MM = 11.7

    // Typical focal length for mobile cameras (needs calibration)
    private const val DEFAULT_FOCAL_LENGTH_PX = 800.0
  }

  /**
   * Calculate distance from screen in centimeters
   * Uses iris diameter as a calibration reference
   * Formula: Z = (fx * D_iris_real) / d_iris_pixels
   */
  fun calculateDistanceCm(landmarks: List<Point3D>, focalLengthPx: Double = DEFAULT_FOCAL_LENGTH_PX): Double {
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

    // Estimate distance using iris width
    val distanceMm = (focalLengthPx * IRIS_DIAMETER_MM) / irisPixelWidth

    return distanceMm / 10.0 // Convert to cm
  }

  /**
   * Calculate gaze angle in degrees
   * Angle of iris center relative to eye inner/outer corners
   */
  fun calculateGazeAngle(landmarks: List<Point3D>, isLeftEye: Boolean): Double {
    if (landmarks.size <= RIGHT_EYE_BOTTOM) return 0.0

    val irisCenter = if (isLeftEye) landmarks[LEFT_IRIS_CENTER] else landmarks[RIGHT_IRIS_CENTER]
    val innerCorner = if (isLeftEye) landmarks[LEFT_EYE_INNER] else landmarks[RIGHT_EYE_INNER]
    val outerCorner = if (isLeftEye) landmarks[LEFT_EYE_OUTER] else landmarks[RIGHT_EYE_OUTER]

    // Calculate horizontal position (0 = inner, 1 = outer)
    val eyeWidth = GeometryMath.distance3D(innerCorner, outerCorner)
    val innerToIris = GeometryMath.distance3D(innerCorner, irisCenter)

    if (eyeWidth < 0.1) return 0.0

    val normalizedPosition = innerToIris / eyeWidth

    // Convert to angle (±30° range)
    return (normalizedPosition - 0.5) * 60.0
  }

  /**
   * Calculate Eye Aspect Ratio (EAR) for blink detection
   * EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
   */
  fun calculateEyeAspectRatio(landmarks: List<Point3D>, isLeftEye: Boolean): Double {
    if (landmarks.size <= RIGHT_EYE_BOTTOM) return 0.0

    val top = if (isLeftEye) landmarks[LEFT_EYE_TOP] else landmarks[RIGHT_EYE_TOP]
    val bottom = if (isLeftEye) landmarks[LEFT_EYE_BOTTOM] else landmarks[RIGHT_EYE_BOTTOM]
    val inner = if (isLeftEye) landmarks[LEFT_EYE_INNER] else landmarks[RIGHT_EYE_INNER]
    val outer = if (isLeftEye) landmarks[LEFT_EYE_OUTER] else landmarks[RIGHT_EYE_OUTER]

    val verticalDist = GeometryMath.distance3D(top, bottom)
    val horizontalDist = GeometryMath.distance3D(inner, outer)

    if (horizontalDist < 0.1) return 0.0

    return verticalDist / (2.0 * horizontalDist)
  }

  /**
   * Calculate fatigue risk based on distance and blink rate
   */
  fun calculateFatigueRisk(
    distanceCm: Double,
    blinkRatePerMin: Double,
    readingDurationMin: Double
  ): String {
    // Distance risk: too close (<30cm) or too far (>80cm)
    val distanceRisk = when {
      distanceCm < 30.0 -> "high"
      distanceCm > 80.0 -> "medium"
      else -> "low"
    }

    // Blink rate risk: too few blinks (<12/min) indicates dry eye
    val blinkRisk = when {
      blinkRatePerMin < 8.0 -> "high"
      blinkRatePerMin < 12.0 -> "medium"
      else -> "low"
    }

    // Duration risk: >30 min without break
    val durationRisk = if (readingDurationMin > 30.0) "high" else "low"

    // Combined risk
    return when {
      distanceRisk == "high" || blinkRisk == "high" || durationRisk == "high" -> "high"
      distanceRisk == "medium" || blinkRisk == "medium" -> "medium"
      else -> "low"
    }
  }
}
