package expo.modules.setubetascanner.algorithms.vision

import expo.modules.setubetascanner.algorithms.GeometryMath
import expo.modules.setubetascanner.algorithms.Point3D

/**
 * Analyzes meditation biofeedback from face and pose landmarks
 * Computes heart rate (rPPG), breathing rate, and relaxation depth
 */
class MeditationAnalyzer {
  companion object {
    // MediaPipe Face Landmarker indices
    private const val FOREHEAD_TOP = 10
    private const val FOREHEAD_LEFT = 109
    private const val FOREHEAD_RIGHT = 338
    private const val FOREHEAD_BOTTOM = 151

    // MediaPipe Pose Landmarker indices
    private const val LEFT_SHOULDER = 11
    private const val RIGHT_SHOULDER = 12
    private const val LEFT_EYE_TOP = 159
    private const val LEFT_EYE_BOTTOM = 145
    private const val RIGHT_EYE_TOP = 386
    private const val RIGHT_EYE_BOTTOM = 374
    private const val LEFT_EYE_INNER = 133
    private const val LEFT_EYE_OUTER = 33
    private const val RIGHT_EYE_INNER = 362
    private const val RIGHT_EYE_OUTER = 263
  }

  // For rPPG heart rate estimation (simplified version)
  private val foreheadLumaHistory = mutableListOf<Double>()
  private val maxHistorySize = 180 // 6 seconds at 30fps

  // For breathing rate estimation
  private val shoulderPositionHistory = mutableListOf<Double>()
  private val maxShoulderHistory = 600 // 20 seconds at 30fps

  /**
   * Add forehead luminance for rPPG processing
   * In production, this would process actual pixel values from the frame
   */
  fun addForeheadLuma(luma: Double) {
    foreheadLumaHistory.add(luma)
    if (foreheadLumaHistory.size > maxHistorySize) {
      foreheadLumaHistory.removeAt(0)
    }
  }

  /**
   * Estimate heart rate from rPPG signal
   * This is a simplified version - production would use FFT on the luma signal
   */
  fun estimateHeartRate(): Double {
    if (foreheadLumaHistory.size < 60) return 0.0

    // Simplified: count peaks in the signal
    // In production, use FFT to find dominant frequency
    val peaks = countPeaks(foreheadLumaHistory)
    val durationSec = foreheadLumaHistory.size / 30.0
    val peaksPerSec = peaks / durationSec
    val bpm = peaksPerSec * 60.0

    return bpm.coerceIn(40.0, 180.0)
  }

  /**
   * Add shoulder position for breathing rate estimation
   */
  fun addShoulderPosition(y: Double) {
    shoulderPositionHistory.add(y)
    if (shoulderPositionHistory.size > maxShoulderHistory) {
      shoulderPositionHistory.removeAt(0)
    }
  }

  /**
   * Estimate breathing rate from shoulder oscillation
   */
  fun estimateBreathingRate(): Double {
    if (shoulderPositionHistory.size < 120) return 0.0

    // Count peaks in shoulder position
    val peaks = countPeaks(shoulderPositionHistory)
    val durationSec = shoulderPositionHistory.size / 30.0
    val peaksPerMin = (peaks / durationSec) * 60.0

    return peaksPerMin.coerceIn(6.0, 30.0)
  }

  /**
   * Calculate relaxation depth from eye closure and posture
   */
  fun calculateRelaxationDepth(
    faceLandmarks: List<Point3D>,
    blinkRatePerMin: Double
  ): Double {
    if (faceLandmarks.size <= RIGHT_EYE_BOTTOM) return 0.0

    // Calculate Eye Aspect Ratio
    val leftEAR = calculateEyeAspectRatio(faceLandmarks, true)
    val rightEAR = calculateEyeAspectRatio(faceLandmarks, false)
    val avgEAR = (leftEAR + rightEAR) / 2.0

    // Lower EAR = more closed eyes = more relaxed
    // Normal EAR ~0.25-0.30, closed ~0.10-0.15
    val eyeRelaxation = when {
      avgEAR < 0.15 -> 1.0
      avgEAR < 0.20 -> 0.7
      avgEAR < 0.25 -> 0.4
      else -> 0.1
    }

    // Blink rate: slower = more relaxed
    // Normal ~15-20/min, relaxed ~8-12/min
    val blinkRelaxation = when {
      blinkRatePerMin < 10.0 -> 1.0
      blinkRatePerMin < 15.0 -> 0.7
      blinkRatePerMin < 20.0 -> 0.4
      else -> 0.1
    }

    // Combined relaxation score
    return (eyeRelaxation * 0.6 + blinkRelaxation * 0.4)
  }

  /**
   * Clear history buffers
   */
  fun clearHistory() {
    foreheadLumaHistory.clear()
    shoulderPositionHistory.clear()
  }

  private fun countPeaks(signal: List<Double>): Int {
    if (signal.size < 3) return 0

    var peaks = 0
    val threshold = 0.1 // Minimum peak height

    for (i in 1 until signal.size - 1) {
      val prev = signal[i - 1]
      val current = signal[i]
      val next = signal[i + 1]

      if (current > prev + threshold && current > next + threshold) {
        peaks++
      }
    }

    return peaks
  }

  private fun calculateEyeAspectRatio(landmarks: List<Point3D>, isLeftEye: Boolean): Double {
    val top = if (isLeftEye) landmarks[LEFT_EYE_TOP] else landmarks[RIGHT_EYE_TOP]
    val bottom = if (isLeftEye) landmarks[LEFT_EYE_BOTTOM] else landmarks[RIGHT_EYE_BOTTOM]
    val inner = if (isLeftEye) landmarks[LEFT_EYE_INNER] else landmarks[RIGHT_EYE_INNER]
    val outer = if (isLeftEye) landmarks[LEFT_EYE_OUTER] else landmarks[RIGHT_EYE_OUTER]

    val verticalDist = GeometryMath.distance3D(top, bottom)
    val horizontalDist = GeometryMath.distance3D(inner, outer)

    if (horizontalDist < 0.1) return 0.0

    return verticalDist / (2.0 * horizontalDist)
  }
}
