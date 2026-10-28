package expo.modules.setubetascanner.algorithms.filters

/**
 * Simple Low-Pass Filter
 * Attenuates high-frequency noise
 */
class LowPassFilter(private val alpha: Double) {
  private var smoothedValue: Double? = null

  /**
   * Add a new sample and get the filtered value
   */
  fun update(value: Double): Double {
    return if (smoothedValue == null) {
      smoothedValue = value
      value
    } else {
      smoothedValue = smoothedValue!! + alpha * (value - smoothedValue!!)
      smoothedValue!!
    }
  }

  /**
   * Get the current filtered value
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
