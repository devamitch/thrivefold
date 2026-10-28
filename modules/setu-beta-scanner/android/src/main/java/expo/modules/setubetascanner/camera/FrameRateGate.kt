package expo.modules.setubetascanner.camera

import android.os.SystemClock

/**
 * Gates frame processing to a maximum rate
 * Prevents overwhelming the inference pipeline
 */
class FrameRateGate(private val minIntervalMs: Long) {
  private var lastProcessedTimeMs = 0L

  /**
   * Check if a frame should be processed based on time since last frame
   * @return true if frame should be processed, false if it should be skipped
   */
  fun shouldProcess(): Boolean {
    val now = SystemClock.uptimeMillis()
    if (now - lastProcessedTimeMs < minIntervalMs) {
      return false
    }
    lastProcessedTimeMs = now
    return true
  }

  /**
   * Reset the gate
   */
  fun reset() {
    lastProcessedTimeMs = 0L
  }
}
