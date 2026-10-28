package expo.modules.setubetascanner.contracts

/**
 * Describes a beta feature's capability and requirements
 */
data class BetaCapability(
  val id: String,
  val title: String,
  val description: String,
  val status: String, // "available", "experimental", "needs-calibration", etc.
  val reason: String? = null,
  val localOnly: Boolean = true,
  val requiresCamera: Boolean,
  val requiresMicrophone: Boolean,
  val requiresCalibration: Boolean,
  val requiredModels: List<String>
)
