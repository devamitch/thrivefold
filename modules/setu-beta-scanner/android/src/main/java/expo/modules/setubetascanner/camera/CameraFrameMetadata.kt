package expo.modules.setubetascanner.camera

/**
 * Metadata for camera frames
 */
data class CameraFrameMetadata(
  val timestampMs: Long,
  val width: Int,
  val height: Int,
  val rotationDegrees: Int,
  val isMirrored: Boolean,
  val format: String
)
