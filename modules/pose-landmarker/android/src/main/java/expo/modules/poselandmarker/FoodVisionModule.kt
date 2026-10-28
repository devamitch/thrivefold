package expo.modules.poselandmarker

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.Executors

class FoodVisionModule : Module() {
  private val worker = Executors.newSingleThreadExecutor()

  override fun definition() = ModuleDefinition {
    Name("FoodVision")

    Function("isAvailable") {
      val ctx = appContext.reactContext ?: return@Function false
      try {
        ctx.assets.open(FoodClassifier.MODEL_ASSET).close()
        true
      } catch (_: Exception) {
        false
      }
    }

    /** Classifies a saved photo (file:// or content:// URI) on the device. */
    AsyncFunction("classifyImage") { uri: String, promise: Promise ->
      val ctx = appContext.reactContext
      if (ctx == null) {
        promise.reject("no_context", "No React context", null)
        return@AsyncFunction
      }
      worker.execute {
        var classifier: FoodClassifier? = null
        try {
          val bitmap = decode(ctx, Uri.parse(uri)) ?: throw IllegalArgumentException("Unreadable image")
          classifier = FoodClassifier.create(ctx)
          val labels = classifier.classify(bitmap)
          bitmap.recycle()
          promise.resolve(labels)
        } catch (e: Throwable) {
          promise.reject("classify_failed", e.message ?: "Could not analyse the photo", e)
        } finally {
          classifier?.close()
        }
      }
    }

    /** Writes an upright JPEG of at most `maxSide` px to the cache; resolves with its file:// URI. */
    AsyncFunction("resizeForUpload") { uri: String, maxSide: Int, promise: Promise ->
      val ctx = appContext.reactContext
      if (ctx == null) {
        promise.reject("no_context", "No React context", null)
        return@AsyncFunction
      }
      worker.execute {
        try {
          val src = decode(ctx, Uri.parse(uri)) ?: throw IllegalArgumentException("Unreadable image")
          val scale = minOf(1f, maxSide.toFloat() / maxOf(src.width, src.height))
          val out = if (scale < 1f) {
            Bitmap.createScaledBitmap(src, (src.width * scale).toInt(), (src.height * scale).toInt(), true)
          } else src
          val file = java.io.File(ctx.cacheDir, "upload_${System.currentTimeMillis()}.jpg")
          file.outputStream().use { out.compress(Bitmap.CompressFormat.JPEG, 82, it) }
          if (out !== src) out.recycle()
          src.recycle()
          promise.resolve("file://${file.absolutePath}")
        } catch (e: Throwable) {
          promise.reject("resize_failed", e.message ?: "Could not prepare the photo", e)
        }
      }
    }

    View(FoodCameraView::class) {
      Events("onLabels", "onFoodReady", "onFoodError")
      Prop("active") { view: FoodCameraView, active: Boolean -> view.setActive(active) }
      AsyncFunction("capture") { view: FoodCameraView, promise: Promise -> view.capture(promise) }
      OnViewDestroys { view: FoodCameraView -> view.release() }
    }
  }

  /** Decodes at most ~1024 px on the long side, upright per EXIF. */
  private fun decode(ctx: android.content.Context, uri: Uri): Bitmap? {
    val resolver = ctx.contentResolver
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    resolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
    var sample = 1
    while (maxOf(bounds.outWidth, bounds.outHeight) / sample > 2048) sample *= 2
    val bmp = resolver.openInputStream(uri)?.use {
      BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = sample })
    } ?: return null
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
