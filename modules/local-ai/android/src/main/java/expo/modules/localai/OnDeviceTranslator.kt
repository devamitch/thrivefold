package expo.modules.localai

import com.google.android.gms.tasks.Tasks
import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.nl.languageid.LanguageIdentification
import com.google.mlkit.nl.translate.TranslateLanguage
import com.google.mlkit.nl.translate.Translation
import com.google.mlkit.nl.translate.TranslatorOptions

/**
 * On-device translation with ML Kit. The language pair's model (~30 MB) downloads once on first
 * use, then translation runs fully offline. Long text is translated paragraph by paragraph.
 * Runs on a worker thread (blocking Tasks.await), never the UI thread.
 */
object OnDeviceTranslator {
  private const val MAX_CHARS = 12_000

  fun detect(text: String): String {
    val client = LanguageIdentification.getClient()
    return try {
      Tasks.await(client.identifyLanguage(text.take(500)))
    } finally {
      client.close()
    }
  }

  fun translate(text: String, target: String, source: String?): Map<String, Any> {
    val to = TranslateLanguage.fromLanguageTag(target)
      ?: throw IllegalArgumentException("Translation to '$target' is not supported.")
    val detected = source ?: detect(text)
    val from = TranslateLanguage.fromLanguageTag(if (detected == "und") "en" else detected)
      ?: throw IllegalArgumentException("Can't translate from '$detected'.")
    if (from == to) return mapOf("text" to text, "source" to from, "target" to to)
    val translator = Translation.getClient(
      TranslatorOptions.Builder().setSourceLanguage(from).setTargetLanguage(to).build(),
    )
    return try {
      Tasks.await(translator.downloadModelIfNeeded(DownloadConditions.Builder().build()))
      val out = text.take(MAX_CHARS).split("\n").joinToString("\n") { para ->
        if (para.isBlank()) para else Tasks.await(translator.translate(para))
      }
      mapOf("text" to out, "source" to from, "target" to to)
    } finally {
      translator.close()
    }
  }
}
