package expo.modules.localai

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.provider.OpenableColumns
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.TextRecognizer
import com.google.mlkit.vision.text.chinese.ChineseTextRecognizerOptions
import com.google.mlkit.vision.text.devanagari.DevanagariTextRecognizerOptions
import com.google.mlkit.vision.text.japanese.JapaneseTextRecognizerOptions
import com.google.mlkit.vision.text.korean.KoreanTextRecognizerOptions
import com.google.mlkit.vision.text.latin.TextRecognizerOptions

/**
 * Reads the text of a file the person picked, entirely on the phone, without copying the file:
 *
 * - plain text, Markdown, CSV, JSON and HTML are read directly;
 * - PDFs are rendered page by page with Android's PdfRenderer and read with ML Kit's bundled
 *   (offline) text recogniser, so scanned and digital PDFs both work;
 * - photos (prescriptions, receipts, screenshots) go through the same recogniser.
 *
 * Returns one entry per page so answers can cite the page.
 */
object DocumentTextExtractor {
  private const val MAX_PDF_PAGES = 40
  private const val RENDER_WIDTH = 1400
  private const val MAX_IMAGE_SIDE = 2048

  data class Page(val page: Int, val text: String)

  fun displayName(ctx: Context, uri: Uri): String? =
    try {
      ctx.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { c ->
        if (c.moveToFirst()) c.getString(0) else null
      }
    } catch (_: Exception) {
      null
    } ?: uri.lastPathSegment

  /** Script to read: latin (default), chinese, japanese, korean or devanagari. */
  @Volatile private var script: String = "latin"

  fun extract(ctx: Context, uriString: String, mimeHint: String?, scriptHint: String? = null): Map<String, Any?> {
    script = scriptHint ?: "latin"
    val uri = Uri.parse(uriString)
    val name = displayName(ctx, uri)
    val mime = mimeHint ?: ctx.contentResolver.getType(uri) ?: guessMime(name)
    val (method, pages) = when {
      mime == "application/pdf" -> "pdf-ocr" to readPdf(ctx, uri)
      mime.startsWith("image/") -> "image-ocr" to listOf(Page(1, ocr(decodeImage(ctx, uri))))
      mime.startsWith("text/") || mime == "application/json" || mime == "application/xml" ->
        "text" to listOf(Page(1, readText(ctx, uri, html = mime == "text/html")))
      else -> throw IllegalArgumentException("This file type can't be read yet ($mime).")
    }
    return mapOf(
      "name" to name,
      "mime" to mime,
      "method" to method,
      "script" to script,
      "pages" to pages.map { mapOf("page" to it.page, "text" to it.text) },
    )
  }

  private fun guessMime(name: String?): String {
    val n = name?.lowercase() ?: return "application/octet-stream"
    return when {
      n.endsWith(".pdf") -> "application/pdf"
      n.endsWith(".png") -> "image/png"
      n.endsWith(".jpg") || n.endsWith(".jpeg") -> "image/jpeg"
      n.endsWith(".webp") -> "image/webp"
      n.endsWith(".md") || n.endsWith(".txt") || n.endsWith(".csv") -> "text/plain"
      n.endsWith(".html") || n.endsWith(".htm") -> "text/html"
      n.endsWith(".json") -> "application/json"
      else -> "application/octet-stream"
    }
  }

  private fun readText(ctx: Context, uri: Uri, html: Boolean): String {
    val raw = ctx.contentResolver.openInputStream(uri)?.use { it.readBytes().toString(Charsets.UTF_8) } ?: ""
    if (!html) return raw
    return raw
      .replace(Regex("(?is)<(script|style)[^>]*>.*?</\\1>"), " ")
      .replace(Regex("(?i)<br\\s*/?>|</p>|</div>|</li>|</h[1-6]>"), "\n")
      .replace(Regex("<[^>]+>"), " ")
      .replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
      .replace(Regex("[ \\t]+"), " ")
      .trim()
  }

  private fun readPdf(ctx: Context, uri: Uri): List<Page> {
    val pfd = ctx.contentResolver.openFileDescriptor(uri, "r") ?: throw IllegalArgumentException("Can't open the PDF.")
    pfd.use { fd ->
      PdfRenderer(fd).use { renderer ->
        val count = minOf(renderer.pageCount, MAX_PDF_PAGES)
        val out = ArrayList<Page>(count)
        for (i in 0 until count) {
          renderer.openPage(i).use { page ->
            val scale = RENDER_WIDTH.toFloat() / page.width
            val bmp = Bitmap.createBitmap(RENDER_WIDTH, (page.height * scale).toInt().coerceAtLeast(1), Bitmap.Config.ARGB_8888)
            bmp.eraseColor(Color.WHITE)
            page.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
            out.add(Page(i + 1, ocr(bmp)))
            bmp.recycle()
          }
        }
        return out
      }
    }
  }

  private fun decodeImage(ctx: Context, uri: Uri): Bitmap {
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    ctx.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
    var sample = 1
    while (maxOf(bounds.outWidth, bounds.outHeight) / sample > MAX_IMAGE_SIDE) sample *= 2
    return ctx.contentResolver.openInputStream(uri)?.use {
      BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = sample })
    } ?: throw IllegalArgumentException("Can't read this image.")
  }

  private fun recognizer(): TextRecognizer = when (script) {
    // Non-Latin scripts come through Google Play services (downloaded once, then offline).
    "chinese" -> TextRecognition.getClient(ChineseTextRecognizerOptions.Builder().build())
    "japanese" -> TextRecognition.getClient(JapaneseTextRecognizerOptions.Builder().build())
    "korean" -> TextRecognition.getClient(KoreanTextRecognizerOptions.Builder().build())
    "devanagari" -> TextRecognition.getClient(DevanagariTextRecognizerOptions.Builder().build())
    else -> TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
  }

  /** Runs on a worker thread (never the UI thread). The Latin model is bundled (offline). */
  private fun ocr(bitmap: Bitmap): String {
    val recognizer = recognizer()
    return try {
      Tasks.await(recognizer.process(InputImage.fromBitmap(bitmap, 0))).text
    } finally {
      recognizer.close()
    }
  }
}
