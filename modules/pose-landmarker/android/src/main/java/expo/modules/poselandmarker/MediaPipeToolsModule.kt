package expo.modules.poselandmarker

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.ByteBufferExtractor
import com.google.mediapipe.tasks.components.containers.NormalizedKeypoint
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.text.languagedetector.LanguageDetector
import com.google.mediapipe.tasks.text.textclassifier.TextClassifier
import com.google.mediapipe.tasks.text.textembedder.TextEmbedder
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.imageembedder.ImageEmbedder
import com.google.mediapipe.tasks.vision.interactivesegmenter.InteractiveSegmenter
import com.google.mediapipe.tasks.vision.objectdetector.ObjectDetector
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.util.concurrent.Executors

/**
 * One-shot MediaPipe tasks on the device, each loading its bundled model on demand:
 *  - detectObjects(uri): Object Detector (EfficientDet-Lite0, COCO labels)
 *  - cutout(uri, x, y): Interactive Segmenter (MagicTouch) -> transparent PNG of the tapped object
 *  - embedImage(uri): Image Embedder (MobileNet-V3 small) -> vector for local similarity
 *  - detectLanguage(text): Language Detector
 *  - embedText(texts): Text Embedder (Universal Sentence Encoder) -> vectors for semantic search
 *  - classifyText(text): Text Classifier (average-word sentiment)
 * Inputs never leave the phone.
 */
class MediaPipeToolsModule : Module() {
  private val worker = Executors.newSingleThreadExecutor()

  override fun definition() = ModuleDefinition {
    Name("MediaPipeTools")

    AsyncFunction("detectObjects") { uri: String, promise: Promise ->
      run(promise) { ctx ->
        val bmp = decode(ctx, Uri.parse(uri)) ?: throw IllegalArgumentException("Unreadable image")
        ObjectDetector.createFromOptions(
          ctx,
          ObjectDetector.ObjectDetectorOptions.builder()
            .setBaseOptions(BaseOptions.builder().setModelAssetPath("efficientdet_lite0.tflite").build())
            .setRunningMode(RunningMode.IMAGE)
            .setMaxResults(10)
            .setScoreThreshold(0.35f)
            .build(),
        ).use { det ->
          val res = det.detect(BitmapImageBuilder(bmp).build())
          val w = bmp.width.toFloat()
          val h = bmp.height.toFloat()
          bmp.recycle()
          res.detections().map { d ->
            val c = d.categories().first()
            val b = d.boundingBox()
            mapOf(
              "label" to c.categoryName(),
              "score" to c.score().toDouble(),
              "box" to listOf(b.left / w, b.top / h, b.right / w, b.bottom / h).map { it.toDouble() },
            )
          }
        }
      }
    }

    AsyncFunction("cutout") { uri: String, x: Double, y: Double, promise: Promise ->
      run(promise) { ctx ->
        val bmp = decode(ctx, Uri.parse(uri)) ?: throw IllegalArgumentException("Unreadable image")
        InteractiveSegmenter.createFromOptions(
          ctx,
          InteractiveSegmenter.InteractiveSegmenterOptions.builder()
            .setBaseOptions(BaseOptions.builder().setModelAssetPath("magic_touch.tflite").build())
            .setOutputCategoryMask(false)
            .setOutputConfidenceMasks(true)
            .build(),
        ).use { seg ->
          val roi = InteractiveSegmenter.RegionOfInterest.create(NormalizedKeypoint.create(x.toFloat(), y.toFloat()))
          val res = seg.segment(BitmapImageBuilder(bmp).build(), roi)
          val mask = res.confidenceMasks().get().first()
          val mw = mask.width
          val mh = mask.height
          val buf = ByteBufferExtractor.extract(mask).asFloatBuffer()
          val conf = FloatArray(mw * mh)
          buf.rewind()
          buf.get(conf)
          val out = Bitmap.createBitmap(bmp.width, bmp.height, Bitmap.Config.ARGB_8888)
          val px = IntArray(bmp.width * bmp.height)
          bmp.getPixels(px, 0, bmp.width, 0, 0, bmp.width, bmp.height)
          var kept = 0
          for (yy in 0 until bmp.height) {
            val my = (yy.toLong() * mh / bmp.height).toInt().coerceIn(0, mh - 1)
            for (xx in 0 until bmp.width) {
              val mx = (xx.toLong() * mw / bmp.width).toInt().coerceIn(0, mw - 1)
              val a = conf[my * mw + mx]
              val i = yy * bmp.width + xx
              if (a > 0.5f) {
                kept++
              } else {
                px[i] = 0
              }
            }
          }
          out.setPixels(px, 0, bmp.width, 0, 0, bmp.width, bmp.height)
          bmp.recycle()
          val file = File(ctx.cacheDir, "cutout_${System.currentTimeMillis()}.png")
          file.outputStream().use { out.compress(Bitmap.CompressFormat.PNG, 100, it) }
          out.recycle()
          mapOf("uri" to "file://${file.absolutePath}", "coverage" to kept.toDouble() / (px.size.coerceAtLeast(1)))
        }
      }
    }

    AsyncFunction("embedImage") { uri: String, promise: Promise ->
      run(promise) { ctx ->
        val bmp = decode(ctx, Uri.parse(uri)) ?: throw IllegalArgumentException("Unreadable image")
        ImageEmbedder.createFromOptions(
          ctx,
          ImageEmbedder.ImageEmbedderOptions.builder()
            .setBaseOptions(BaseOptions.builder().setModelAssetPath("mobilenet_v3_small.tflite").build())
            .setL2Normalize(true)
            .setQuantize(false)
            .build(),
        ).use { emb ->
          val r = emb.embed(BitmapImageBuilder(bmp).build())
          bmp.recycle()
          r.embeddingResult().embeddings().first().floatEmbedding().map { it.toDouble() }
        }
      }
    }

    AsyncFunction("detectLanguage") { text: String, promise: Promise ->
      run(promise) { ctx ->
        LanguageDetector.createFromOptions(
          ctx,
          LanguageDetector.LanguageDetectorOptions.builder()
            .setBaseOptions(BaseOptions.builder().setModelAssetPath("language_detector.tflite").build())
            .setMaxResults(3)
            .build(),
        ).use { det ->
          det.detect(text.take(2000)).languagesAndScores().map { mapOf("code" to it.languageCode(), "score" to it.probability().toDouble()) }
        }
      }
    }

    AsyncFunction("embedText") { texts: List<String>, promise: Promise ->
      run(promise) { ctx ->
        TextEmbedder.createFromOptions(
          ctx,
          TextEmbedder.TextEmbedderOptions.builder()
            .setBaseOptions(BaseOptions.builder().setModelAssetPath("universal_sentence_encoder.tflite").build())
            .setL2Normalize(true)
            .build(),
        ).use { emb ->
          texts.take(500).map { t -> emb.embed(t.take(2000)).embeddingResult().embeddings().first().floatEmbedding().map { it.toDouble() } }
        }
      }
    }

    AsyncFunction("classifyText") { text: String, promise: Promise ->
      run(promise) { ctx ->
        TextClassifier.createFromOptions(
          ctx,
          TextClassifier.TextClassifierOptions.builder()
            .setBaseOptions(BaseOptions.builder().setModelAssetPath("average_word_classifier.tflite").build())
            .build(),
        ).use { cls ->
          cls.classify(text.take(2000)).classificationResult().classifications().first().categories()
            .map { mapOf("label" to it.categoryName(), "score" to it.score().toDouble()) }
        }
      }
    }
  }

  private fun run(promise: Promise, block: (Context) -> Any) {
    val ctx = appContext.reactContext
    if (ctx == null) {
      promise.reject("no_context", "No React context", null)
      return
    }
    worker.execute {
      try {
        promise.resolve(block(ctx))
      } catch (e: Throwable) {
        promise.reject("mediapipe_failed", e.message ?: "On-device model failed", e)
      }
    }
  }

  /** Decodes at most ~1280 px on the long side, upright per EXIF. */
  private fun decode(ctx: Context, uri: Uri): Bitmap? {
    val resolver = ctx.contentResolver
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    resolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
    var sample = 1
    while (maxOf(bounds.outWidth, bounds.outHeight) / sample > 1280) sample *= 2
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
