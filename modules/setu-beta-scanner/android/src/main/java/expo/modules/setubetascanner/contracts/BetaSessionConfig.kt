package expo.modules.setubetascanner.contracts

/**
 * Configuration for a beta scanner session
 */
data class BetaSessionConfig(
  val featureId: String,
  val cameraPosition: String = "front",
  val enableAudio: Boolean = false,
  val sampleRateHz: Int = 16000,
  val requiresCamera: Boolean = true
)
