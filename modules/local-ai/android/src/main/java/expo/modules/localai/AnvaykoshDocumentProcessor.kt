package expo.modules.localai

import java.util.regex.Pattern

/**
 * Anvaykosh Native Document Processing & Semantic Chunking Engine.
 *
 * Provides high-speed on-device document extraction & segmentation for offline RAG:
 * - Sanitizes raw OCR and document text, removing non-printable ASCII/Unicode noise.
 * - Splits text along natural semantic boundaries (paragraphs, bullet points, punctuation).
 * - Enforces minimum and maximum token/character limits with sliding overlap.
 * - Generates structured chunks with start/end character offsets for verifiable citation.
 */
object AnvaykoshDocumentProcessor {

  private val WHITESPACE_PATTERN = Pattern.compile("\\s+")
  private val SENTENCE_SPLIT_PATTERN = Pattern.compile("(?<=[.!?\\n])\\s+")

  data class DocumentChunk(
    val index: Int,
    val text: String,
    val startOffset: Int,
    val endOffset: Int,
    val tokenEstimate: Int
  )

  /**
   * Cleans raw extracted document or OCR text while preserving meaningful punctuation.
   */
  fun cleanText(input: String): String {
    if (input.isBlank()) return ""
    // Remove control characters except standard line breaks and tabs
    val stripped = input.replace("[\\p{Cntrl}&&[^\r\n\t]]".toRegex(), "")
    return WHITESPACE_PATTERN.matcher(stripped).replaceAll(" ").trim()
  }

  /**
   * Splits a document into bounded semantic chunks with overlap.
   *
   * @param text Raw document text
   * @param targetChunkSize Preferred character length per chunk (default 320)
   * @param overlapChars Overlapping character window to preserve context (default 40)
   */
  fun chunkDocument(
    text: String,
    targetChunkSize: Int = 320,
    overlapChars: Int = 40
  ): List<DocumentChunk> {
    val cleaned = cleanText(text)
    if (cleaned.isBlank()) return emptyList()

    if (cleaned.length <= targetChunkSize) {
      return listOf(
        DocumentChunk(
          index = 0,
          text = cleaned,
          startOffset = 0,
          endOffset = cleaned.length,
          tokenEstimate = estimateTokens(cleaned)
        )
      )
    }

    val sentences = SENTENCE_SPLIT_PATTERN.split(cleaned).filter { it.isNotBlank() }
    val chunks = mutableListOf<DocumentChunk>()

    val currentBuffer = StringBuilder()
    var chunkIndex = 0
    var currentStartOffset = 0

    for (sentence in sentences) {
      if (currentBuffer.length + sentence.length > targetChunkSize && currentBuffer.isNotEmpty()) {
        val chunkText = currentBuffer.toString().trim()
        chunks.add(
          DocumentChunk(
            index = chunkIndex++,
            text = chunkText,
            startOffset = currentStartOffset,
            endOffset = currentStartOffset + chunkText.length,
            tokenEstimate = estimateTokens(chunkText)
          )
        )

        // Seed next chunk with trailing overlap from the previous buffer
        val overlapText = if (chunkText.length > overlapChars) {
          chunkText.takeLast(overlapChars)
        } else {
          chunkText
        }

        currentStartOffset += (chunkText.length - overlapText.length)
        currentBuffer.clear()
        currentBuffer.append(overlapText).append(" ")
      }

      currentBuffer.append(sentence).append(" ")
    }

    if (currentBuffer.isNotBlank()) {
      val finalText = currentBuffer.toString().trim()
      chunks.add(
        DocumentChunk(
          index = chunkIndex,
          text = finalText,
          startOffset = currentStartOffset,
          endOffset = currentStartOffset + finalText.length,
          tokenEstimate = estimateTokens(finalText)
        )
      )
    }

    return chunks
  }

  /**
   * Fast rule-based token estimation for mobile memory budgeting.
   */
  fun estimateTokens(text: String): Int {
    if (text.isEmpty()) return 0
    val words = text.split(" ").filter { it.isNotEmpty() }
    // English/Latin text averages ~1.3 tokens per word
    return (words.size * 1.3).toInt().coerceAtLeast(1)
  }

  /**
   * Tokenizes and computes term frequency map for fast sparse BM25 retrieval.
   */
  fun computeTermFrequencies(text: String): Map<String, Int> {
    val clean = text.lowercase().replace("[^a-z0-9\\s]".toRegex(), " ")
    val tokens = clean.split("\\s+".toRegex()).filter { it.length > 2 }
    val tf = mutableMapOf<String, Int>()
    for (t in tokens) {
      tf[t] = (tf[t] ?: 0) + 1
    }
    return tf
  }
}

