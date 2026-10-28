package expo.modules.setubetascanner.algorithms.filters

/**
 * Exponential Moving Average (EMA) filter
 * Smooths noisy measurements by weighting recent values more heavily
 */
class ExponentialMovingAverage(private val alpha: Double) {
  private var smoothedValue: Double? = null

  /**
   * Add a new sample and get the smoothed value
   */
  fun update(value: Double): Double {
    return if (smoothedValue == null) {
      smoothedValue = value
      value
    } else {
      smoothedValue = alpha * value + (1 - alpha) * smoothedValue!!
      smoothedValue!!
    }
  }

  /**
   * Get the current smoothed value
   */
  fun getValue(): Double? = smoothedValue

  /**
   * Reset the filter
   */
  fun reset() {
    smoothedValue = null
  }

  /**
   * Check if filter has been initialized
   */
  fun isInitialized(): Boolean = smoothedValue != null
}
