package expo.modules.setubetascanner.camera

import android.graphics.Bitmap
import androidx.camera.core.ImageProxy
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage

/**
 * Adapts camera frames to MediaPipe image format
 * Handles conversion and metadata extraction
 */
class NativeFrameAdapter {
  /**
   * Convert ImageProxy to MPImage for MediaPipe processing
   */
  fun toMPImage(imageProxy: ImageProxy): MPImage {
    val bitmap = imageProxyToBitmap(imageProxy)
    return BitmapImageBuilder(bitmap).build()
  }

  /**
   * Extract metadata from ImageProxy
   */
  fun extractMetadata(imageProxy: ImageProxy): CameraFrameMetadata {
    return CameraFrameMetadata(
      timestampMs = imageProxy.imageInfo.timestamp,
      width = imageProxy.width,
      height = imageProxy.height,
      rotationDegrees = imageProxy.imageInfo.rotationDegrees,
      isMirrored = false, // Will be set based on camera position
      format = imageProxy.format.toString()
    )
  }

  private fun imageProxyToBitmap(imageProxy: ImageProxy): Bitmap {
    val nv21Buffer = yuv420ThreePlanesToNV21(imageProxy.image!!.planes, imageProxy.width, imageProxy.height)
    val yuvImage = android.graphics.YuvImage(
      nv21Buffer,
      android.graphics.ImageFormat.NV21,
      imageProxy.width,
      imageProxy.height,
      null
    )
    val out = java.io.ByteArrayOutputStream()
    yuvImage.compressToJpeg(android.graphics.Rect(0, 0, imageProxy.width, imageProxy.height), 90, out)
    val imageBytes = out.toByteArray()
    return android.graphics.BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
  }

  private fun yuv420ThreePlanesToNV21(
    yuv420888planes: Array<android.media.Image.Plane>,
    width: Int,
    height: Int
  ): ByteArray {
    val imageSize = width * height
    val out = ByteArray(imageSize * 3 / 2)
    val yBuffer = yuv420888planes[0].buffer
    val uBuffer = yuv420888planes[1].buffer
    val vBuffer = yuv420888planes[2].buffer

    // Y channel
    yBuffer.get(out, 0, imageSize)

    // U and V channels
    val pixelStride = yuv420888planes[1].pixelStride
    val rowStride = yuv420888planes[1].rowStride

    val padding = rowStride - width * pixelStride
    var position = imageSize

    for (row in 0 until height / 2) {
      for (col in 0 until width / 2) {
        val u = uBuffer.get().toInt() and 0xFF
        val v = vBuffer.get().toInt() and 0xFF
        out[position++] = v.toByte()
        out[position++] = u.toByte()
        if (pixelStride > 1) {
          uBuffer.position(uBuffer.position() + pixelStride - 1)
          vBuffer.position(vBuffer.position() + pixelStride - 1)
        }
      }
      if (padding > 0) {
        uBuffer.position(uBuffer.position() + padding)
        vBuffer.position(vBuffer.position() + padding)
      }
    }

    return out
  }
}
