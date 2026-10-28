package expo.modules.setubetascanner.algorithms.vision

import expo.modules.setubetascanner.algorithms.GeometryMath
import expo.modules.setubetascanner.algorithms.Point3D
import expo.modules.setubetascanner.algorithms.AngleResult

/**
 * Analyzes posture from pose landmarks
 * Computes forward head posture, rounded shoulders, and pelvic tilt
 */
class PostureAnalyzer {
  companion object {
    // MediaPipe Pose Landmarker indices
    private const val LEFT_EAR = 7
    private const val RIGHT_EAR = 8
    private const val LEFT_SHOULDER = 11
    private const val RIGHT_SHOULDER = 12
    private const val LEFT_HIP = 23
    private const val RIGHT_HIP = 24
    private const val NOSE = 0
  }

  /**
   * Calculate forward head posture angle
   * Angle between horizontal and line from ear to shoulder
   * Ideal: 0° (head aligned with spine), Poor: <50° indicates strain
   */
  fun calculateForwardHeadAngle(landmarks: List<Point3D>, isLeftSide: Boolean): AngleResult {
    if (landmarks.size <= RIGHT_SHOULDER) {
      return AngleResult.Invalid("Insufficient landmarks")
    }

    val ear = if (isLeftSide) landmarks[LEFT_EAR] else landmarks[RIGHT_EAR]
    val shoulder = if (isLeftSide) landmarks[LEFT_SHOULDER] else landmarks[RIGHT_SHOULDER]

    // Create a horizontal reference point at the shoulder's height
    val horizontalRef = Point3D(shoulder.x + 100.0, shoulder.y, shoulder.z)

    return GeometryMath.angleDegrees3D(horizontalRef, ear, shoulder)
  }

  /**
   * Calculate rounded shoulders indicator
   * Uses Z-depth difference between shoulders and nose reference plane
   */
  fun calculateRoundedShoulders(landmarks: List<Point3D>): Double {
    if (landmarks.size <= RIGHT_SHOULDER) return 0.0

    val leftShoulder = landmarks[LEFT_SHOULDER]
    val rightShoulder = landmarks[RIGHT_SHOULDER]
    val nose = landmarks[NOSE]

    // Average shoulder Z-depth
    val avgShoulderZ = (leftShoulder.z + rightShoulder.z) / 2.0

    // Z-depth difference from nose reference
    val zDiff = kotlin.math.abs(avgShoulderZ - nose.z)

    // Normalize to 0-1 range (higher = more rounded)
    return (zDiff / 0.5).coerceIn(0.0, 1.0)
  }

  /**
   * Calculate pelvic tilt angle
   * Slope of vector between left and right hip
   * Ideal: 0° (level hips), Positive = left higher, Negative = right higher
   */
  fun calculatePelvicTilt(landmarks: List<Point3D>): AngleResult {
    if (landmarks.size <= RIGHT_HIP) {
      return AngleResult.Invalid("Insufficient landmarks")
    }

    val leftHip = landmarks[LEFT_HIP]
    val rightHip = landmarks[RIGHT_HIP]

    // Create a horizontal reference
    val horizontalRef = Point3D(rightHip.x + 100.0, rightHip.y, rightHip.z)

    return GeometryMath.angleDegrees3D(horizontalRef, leftHip, rightHip)
  }

  /**
   * Calculate overall posture score
   * Combines all metrics into a single score (0-100)
   */
  fun calculateOverallPostureScore(
    landmarks: List<Point3D>
  ): PostureScore {
    val leftHeadAngle = calculateForwardHeadAngle(landmarks, true)
    val rightHeadAngle = calculateForwardHeadAngle(landmarks, false)
    val roundedShoulders = calculateRoundedShoulders(landmarks)
    val pelvicTilt = calculatePelvicTilt(landmarks)

    val headScore = when {
      leftHeadAngle is AngleResult.Valid && rightHeadAngle is AngleResult.Valid -> {
        val avgAngle = (leftHeadAngle.degrees + rightHeadAngle.degrees) / 2.0
        // 0° = 100, 50° = 0
        ((50.0 - avgAngle) / 50.0 * 100).coerceIn(0.0, 100.0)
      }
      else -> 50.0 // Neutral if invalid
    }

    val shoulderScore = (1.0 - roundedShoulders) * 100.0

    val pelvicScore = when {
      pelvicTilt is AngleResult.Valid -> {
        // 0° = 100, 10° = 0
        ((10.0 - kotlin.math.abs(pelvicTilt.degrees)) / 10.0 * 100).coerceIn(0.0, 100.0)
      }
      else -> 50.0
    }

    val overallScore = (headScore * 0.4 + shoulderScore * 0.3 + pelvicScore * 0.3)

    return PostureScore(
      overall = overallScore,
      head = headScore,
      shoulders = shoulderScore,
      pelvis = pelvicScore
    )
  }

  data class PostureScore(
    val overall: Double,
    val head: Double,
    val shoulders: Double,
    val pelvis: Double
  )
}
