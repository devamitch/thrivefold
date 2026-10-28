package expo.modules.setubetascanner.contracts

/**
 * Complete result from a beta scanner session
 */
data class BetaResult(
  val sessionId: String,
  val featureId: String,
  val timestampMs: Long,
  val metrics: List<BetaMetric>,
  val feedback: List<BetaFeedback>,
  val warnings: List<String>
)

data class BetaFeedback(
  val id: String,
  val level: String, // "info", "guidance", "warning"
  val title: String,
  val message: String,
  val actionable: Boolean
)
