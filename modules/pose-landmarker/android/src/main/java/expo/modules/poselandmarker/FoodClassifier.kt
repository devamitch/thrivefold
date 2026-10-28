package expo.modules.poselandmarker

import android.content.Context
import android.graphics.Bitmap
import java.nio.ByteBuffer
import java.nio.ByteOrder
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.imageclassifier.ImageClassifier

/**
 * On-device image classifier (MediaPipe EfficientNet-Lite0, ImageNet labels). Generic: it names
 * what it sees with a score; deciding which labels are foods happens in JavaScript.
 * Runs entirely on the phone; nothing leaves the device.
 */
class FoodClassifier private constructor(private val classifier: ImageClassifier) {
  fun classify(bitmap: Bitmap): List<Map<String, Any>> {
    val result = classifier.classify(BitmapImageBuilder(bitmap).build())
    return result.classificationResult().classifications().firstOrNull()?.categories()
      ?.map { mapOf("label" to it.categoryName(), "score" to it.score().toDouble()) }
      ?: emptyList()
  }

  fun close() = classifier.close()

  companion object {
    const val MODEL_ASSET = "food_classifier.tflite"

    private fun load(context: Context): ByteBuffer {
      val bytes = context.assets.open(MODEL_ASSET).use { it.readBytes() }
      return ByteBuffer.allocateDirect(bytes.size).order(ByteOrder.nativeOrder()).apply {
        put(bytes)
        rewind()
      }
    }

    fun create(context: Context): FoodClassifier {
      val options = ImageClassifier.ImageClassifierOptions.builder()
        // Loaded into memory, so it works whether or not the asset was stored compressed.
        .setBaseOptions(BaseOptions.builder().setModelAssetBuffer(load(context)).build())
        .setRunningMode(RunningMode.IMAGE)
        .setMaxResults(8)
        .setScoreThreshold(0.03f)
        .build()
      return FoodClassifier(ImageClassifier.createFromOptions(context, options))
    }
  }
}
