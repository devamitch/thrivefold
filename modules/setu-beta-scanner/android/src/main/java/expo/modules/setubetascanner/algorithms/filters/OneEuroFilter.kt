package expo.modules.setubetascanner.algorithms.filters

/**
 * One Euro Filter
 * Adaptive low-pass filter that reduces jitter while maintaining responsiveness
 * Based on the paper "A Simple Filter to Smooth Noisy Signals" by Casiez et al.
 */
class OneEuroFilter(
  private val minCutoff: Double = 1.0,
  private val beta: Double = 0.007,
  private val dCutoff: Double = 1.0
) {
  private var prevX: Double? = null
  private var prevTimestamp: Long? = null
  private var dx: Double = 0.0

  /**
   * Filter a new sample
   */
  fun update(x: Double, timestampMs: Long): Double {
    if (prevTimestamp == null) {
      prevX = x
      prevTimestamp = timestampMs
      return x
    }

    val dt = (timestampMs - prevTimestamp!!).toDouble() / 1000.0
    if (dt <= 0.0) return x

    val alpha = calculateAlpha(minCutoff, dt)
    val xFiltered = alpha * x + (1 - alpha) * prevX!!

    val dxFiltered = alpha * (x - prevX!!) / dt + (1 - alpha) * dx
    val cutoff = minCutoff + beta * kotlin.math.abs(dxFiltered)
    val alphaD = calculateAlpha(cutoff, dt)

    dx = alphaD * (x - prevX!!) / dt + (1 - alphaD) * dx
    prevX = xFiltered
    prevTimestamp = timestampMs

    return xFiltered
  }

  /**
   * Reset the filter
   */
  fun reset() {
    prevX = null
    prevTimestamp = null
    dx = 0.0
  }

  private fun calculateAlpha(cutoff: Double, dt: Double): Double {
    val tau = 1.0 / (2.0 * kotlin.math.PI * cutoff)
    return 1.0 - kotlin.math.exp(-dt / tau)
  }
}
