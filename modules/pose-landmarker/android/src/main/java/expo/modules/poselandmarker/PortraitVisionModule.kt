package expo.modules.poselandmarker

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.ByteBufferExtractor
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker
import com.google.mediapipe.tasks.vision.imagesegmenter.ImageSegmenter
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.Executors

/**
 * One-shot analysis of a saved photo, on the device: the full 478-point face mesh, the 33-point
 * body pose, and the selfie multiclass segmentation (background, hair, body skin, face skin,
 * clothes, accessories) reduced to numbers: class shares, the body's width at 64 heights, and the
 * average colours of hair and of clothes above and below the hips. The photo and masks never
 * leave this function; nothing is written or sent anywhere.
 */
class PortraitVisionModule : Module() {
  companion object {
    const val SEGMENTER_ASSET = "selfie_multiclass_256x256.tflite"
    private const val BANDS = 64
    private const val CLOTHES = 4
    private const val HAIR = 1
  }

  private val worker = Executors.newSingleThreadExecutor()

  override fun definition() = ModuleDefinition {
    Name("PortraitVision")

    Function("isAvailable") {
      val ctx = appContext.reactContext ?: return@Function false
      try {
        ctx.assets.open(SEGMENTER_ASSET).close()
        true
      } catch (_: Exception) {
        false
      }
    }

    AsyncFunction("analyzePortrait") { uri: String, promise: Promise ->
      val ctx = appContext.reactContext
      if (ctx == null) {
        promise.reject("no_context", "No React context", null)
        return@AsyncFunction
      }
      worker.execute {
        try {
          val bmp = decode(ctx, Uri.parse(uri)) ?: throw IllegalArgumentException("Unreadable image")
          val result = analyse(ctx, bmp)
          bmp.recycle()
          promise.resolve(result)
        } catch (e: Throwable) {
          promise.reject("portrait_failed", e.message ?: "Could not analyse the photo", e)
        }
      }
    }
  }

  private fun analyse(ctx: Context, bmp: Bitmap): Map<String, Any?> {
    val image = BitmapImageBuilder(bmp).build()

    val face: List<Double> = try {
      FaceLandmarker.createFromOptions(
        ctx,
        FaceLandmarker.FaceLandmarkerOptions.builder()
          .setBaseOptions(BaseOptions.builder().setModelAssetPath(PoseCameraView.FACE_ASSET).build())
          .setRunningMode(RunningMode.IMAGE)
          .setNumFaces(1)
          .build(),
      ).use { lm ->
        val pts = lm.detect(image).faceLandmarks().firstOrNull()
        if (pts == null) emptyList() else pts.flatMap { listOf(it.x().toDouble(), it.y().toDouble(), it.z().toDouble()) }
      }
    } catch (_: Throwable) {
      emptyList()
    }

    val pose: List<Double> = try {
      PoseLandmarker.createFromOptions(
        ctx,
        PoseLandmarker.PoseLandmarkerOptions.builder()
          .setBaseOptions(BaseOptions.builder().setModelAssetPath(PoseCameraView.MODEL_ASSET).build())
          .setRunningMode(RunningMode.IMAGE)
          .setNumPoses(1)
          .build(),
      ).use { lm ->
        val pts = lm.detect(image).landmarks().firstOrNull()
        if (pts == null) emptyList() else pts.flatMap { listOf(it.x().toDouble(), it.y().toDouble(), it.visibility().orElse(0f).toDouble()) }
      }
    } catch (_: Throwable) {
      emptyList()
    }

    // Body centre line and hip height from the pose, to follow the torso and split top from bottom.
    fun p(i: Int, k: Int) = pose[i * 3 + k]
    val hasPose = pose.size >= 33 * 3
    val centreX = if (hasPose) (p(11, 0) + p(12, 0) + p(23, 0) + p(24, 0)) / 4 else 0.5
    val hipY = if (hasPose) (p(23, 1) + p(24, 1)) / 2 else 0.55

    val seg: Map<String, Any?> = try {
      ImageSegmenter.createFromOptions(
        ctx,
        ImageSegmenter.ImageSegmenterOptions.builder()
          .setBaseOptions(BaseOptions.builder().setModelAssetPath(SEGMENTER_ASSET).build())
          .setRunningMode(RunningMode.IMAGE)
          .setOutputCategoryMask(true)
          .setOutputConfidenceMasks(false)
          .build(),
      ).use { seg ->
        val maskImage = seg.segment(image).categoryMask().get()
        val mw = maskImage.width
        val mh = maskImage.height
        val buf = ByteBufferExtractor.extract(maskImage)
        val mask = ByteArray(mw * mh)
        buf.rewind()
        buf.get(mask)
        summarise(bmp, mask, mw, mh, centreX, hipY)
      }
    } catch (_: Throwable) {
      emptyMap()
    }

    return mapOf(
      "width" to bmp.width,
      "height" to bmp.height,
      "face" to face,
      "pose" to pose,
      "segmentation" to seg,
    )
  }

  private fun summarise(bmp: Bitmap, mask: ByteArray, mw: Int, mh: Int, centreX: Double, hipY: Double): Map<String, Any?> {
    val counts = IntArray(6)
    for (b in mask) {
      val c = b.toInt() and 0xFF
      if (c < 6) counts[c]++
    }
    val total = mask.size.toDouble()
    val isPerson = { x: Int, y: Int -> (mask[y * mw + x].toInt() and 0xFF).let { it in 1..5 } }

    // Width of the connected run of person pixels through the body's centre line, per band.
    val cx = (centreX * mw).toInt().coerceIn(0, mw - 1)
    val widths = DoubleArray(BANDS)
    for (band in 0 until BANDS) {
      val y = ((band + 0.5) / BANDS * mh).toInt().coerceIn(0, mh - 1)
      if (!isPerson(cx, y)) continue
      var l = cx
      var r = cx
      while (l > 0 && isPerson(l - 1, y)) l--
      while (r < mw - 1 && isPerson(r + 1, y)) r++
      widths[band] = (r - l + 1).toDouble() / mw
    }

    // Average colours, sampled from the photo where the mask says hair or clothes.
    val sx = bmp.width.toDouble() / mw
    val sy = bmp.height.toDouble() / mh
    val hipRow = (hipY * mh).toInt()
    val acc = Array(3) { LongArray(4) } // hair, clothes above hips, clothes below hips: r, g, b, n
    var y = 0
    while (y < mh) {
      var x = 0
      while (x < mw) {
        val c = mask[y * mw + x].toInt() and 0xFF
        val slot = when {
          c == HAIR -> 0
          c == CLOTHES && y < hipRow -> 1
          c == CLOTHES -> 2
          else -> -1
        }
        if (slot >= 0) {
          val px = bmp.getPixel((x * sx).toInt().coerceIn(0, bmp.width - 1), (y * sy).toInt().coerceIn(0, bmp.height - 1))
          acc[slot][0] += (px shr 16) and 0xFF
          acc[slot][1] += (px shr 8) and 0xFF
          acc[slot][2] += px and 0xFF
          acc[slot][3]++
        }
        x += 2
      }
      y += 2
    }
    fun mean(i: Int): List<Int>? = if (acc[i][3] < 40) null else listOf(
      (acc[i][0] / acc[i][3]).toInt(), (acc[i][1] / acc[i][3]).toInt(), (acc[i][2] / acc[i][3]).toInt(),
    )

    return mapOf(
      "shares" to counts.map { it / total },
      "widths" to widths.toList(),
      "hair" to mean(0),
      "clothesTop" to mean(1),
      "clothesBottom" to mean(2),
    )
  }

  /** Decodes at most ~1600 px on the long side, upright per EXIF. */
  private fun decode(ctx: Context, uri: Uri): Bitmap? {
    val resolver = ctx.contentResolver
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    resolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
    var sample = 1
    while (maxOf(bounds.outWidth, bounds.outHeight) / sample > 1600) sample *= 2
    val raw = resolver.openInputStream(uri)?.use {
      BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = sample })
    } ?: return null
    val bmp = if (raw.config == Bitmap.Config.ARGB_8888) raw else raw.copy(Bitmap.Config.ARGB_8888, false).also { raw.recycle() }
    val rotation = try {
      resolver.openInputStream(uri)?.use {
        when (ExifInterface(it).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)) {
          ExifInterface.ORIENTATION_ROTATE_90 -> 90f
          ExifInterface.ORIENTATION_ROTATE_180 -> 180f
          ExifInterface.ORIENTATION_ROTATE_270 -> 270f
          else -> 0f
        }
      } ?: 0f
    } catch (_: Exception) {
      0f
    }
    if (rotation == 0f) return bmp
    val out = Bitmap.createBitmap(bmp, 0, 0, bmp.width, bmp.height, Matrix().apply { postRotate(rotation) }, true)
    bmp.recycle()
    return out
  }
}
