package expo.modules.setubetascanner.contracts

/**
 * A single metric measurement from the beta scanner
 */
data class BetaMetric(
  val id: String,
  val value: Any, // Double, String, or Boolean
  val unit: String? = null,
  val confidence: Double? = null,
  val quality: String, // "good", "limited", "invalid"
  val timestampMs: Long,
  val explanation: String
)
