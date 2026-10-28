package expo.modules.setubetascanner.contracts

/**
 * Possible states of a beta scanner session
 */
enum class BetaSessionState {
  IDLE,
  REQUESTING_PERMISSION,
  INITIALIZING,
  RUNNING,
  PAUSED,
  STOPPING,
  COMPLETED,
  ERROR
}
