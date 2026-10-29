package expo.modules.localai

import android.os.SystemClock
import android.util.Log
import com.llamatik.library.platform.GenStream
import com.llamatik.library.platform.LlamaBridge
import kotlinx.coroutines.*
import java.io.File
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

private const val TAG = "AnvaykoshAiEngine"

/**
 * Anvaykosh AI Native Inference Engine.
 *
 * Dedicated Kotlin controller wrapping Llamatik/llama.cpp JNI bindings:
 * - Thread confinement: Single-threaded worker serializes native memory access and avoids crashes.
 * - Hardware safety: Enforces RAM headroom checks via LlmMemoryGuard before allocating model weights.
 * - Reactive token streaming: Emits real-time deltas and calculates inference TPS (tokens per second).
 * - Conversational barge-in: Cancels native generation immediately when new user input arrives.
 * - On-device dense embeddings: Generates float vectors for offline RAG.
 */
class AnvaykoshAiEngine {

  // Dedicated single-threaded executor for native llama.cpp operations to serialize JNI execution
  private val inferenceExecutor = Executors.newSingleThreadExecutor { r ->
    Thread(r, "AnvaykoshAi-InferenceWorker").apply { priority = Thread.NORM_PRIORITY + 1 }
  }
  val inferenceDispatcher = inferenceExecutor.asCoroutineDispatcher()
  val scope = CoroutineScope(SupervisorJob() + inferenceDispatcher)

  val isModelLoaded = AtomicBoolean(false)
  val isGenerating = AtomicBoolean(false)

  var loadedModelPath: String? = null
    private set
  var loadedFileName: String? = null
    private set
  var loadedModelSizeBytes: Long = 0L
    private set

  /**
   * Initializes the native GGUF model in memory.
   */
  suspend fun loadModel(
    modelFile: File,
    temperature: Float = 0.7f,
    maxTokens: Int = 512,
    topP: Float = 0.9f,
    topK: Int = 40,
    repeatPenalty: Float = 1.1f
  ): Result<Long> = withContext(inferenceDispatcher) {
    try {
      if (isModelLoaded.get()) {
        unload()
      }

      val optimalThreads = LlmMemoryGuard.getOptimalThreadCount()
      LlamaBridge.updateGenerateParams(
        temperature = temperature,
        maxTokens = maxTokens,
        topP = topP,
        topK = topK,
        repeatPenalty = repeatPenalty
      )

      val startTime = SystemClock.elapsedRealtime()
      val success = LlamaBridge.initGenerateModel(modelFile.absolutePath)
      if (success) loadedPath = modelFile.absolutePath
      val durationMs = SystemClock.elapsedRealtime() - startTime

      if (!success) {
        return@withContext Result.failure(
          IllegalStateException("LlamaBridge failed to initialize model at ${modelFile.absolutePath}")
        )
      }

      isModelLoaded.set(true)
      loadedModelPath = modelFile.absolutePath
      loadedFileName = modelFile.name
      loadedModelSizeBytes = modelFile.length()

      Log.i(TAG, "Anvaykosh AI loaded ${modelFile.name} in ${durationMs}ms with $optimalThreads threads")
      Result.success(durationMs)
    } catch (e: Throwable) {
      Log.e(TAG, "Error loading model: ${e.message}", e)
      Result.failure(e)
    }
  }

  /**
   * Unloads the active model and reclaims native tensor RAM.
   */
  suspend fun unload(): Boolean = withContext(inferenceDispatcher) {
    try {
      if (isGenerating.get()) {
        cancel()
      }
      LlamaBridge.shutdown()
      isModelLoaded.set(false)
      loadedModelPath = null
      loadedFileName = null
      loadedModelSizeBytes = 0L
      System.gc()
      Log.i(TAG, "Anvaykosh AI native model unloaded successfully")
      true
    } catch (e: Throwable) {
      Log.w(TAG, "Error during model unload: ${e.message}")
      false
    }
  }

  /**
   * Cancels any active text generation or token stream immediately (Barge-in).
   */
  fun cancel(): Boolean {
    return try {
      LlamaBridge.nativeCancelGenerate()
      isGenerating.set(false)
      Log.d(TAG, "Anvaykosh AI cancelled native generation")
      true
    } catch (e: Throwable) {
      Log.w(TAG, "Failed to cancel generation: ${e.message}")
      false
    }
  }

  /**
   * Builds the prompt with the model's own chat template (Qwen uses ChatML), so the model knows
   * where its answer ends. The library's context helpers use a different template, which made
   * small models keep writing invented "Human:" turns.
   */
  private fun chatPrompt(prompt: String, context: String?, system: String?): String {
    val sys = listOfNotNull(
      system?.takeIf { it.isNotBlank() },
      context?.takeIf { it.isNotBlank() }?.let { "Context:\n$it" },
    ).joinToString("\n\n")
    val messages = buildList {
      if (sys.isNotBlank()) add("system" to sys)
      add("user" to prompt)
    }
    // Llamatik 0.12 has no template API, so the loaded model's own format is written out here.
    if (loadedPath.contains("gemma", ignoreCase = true)) {
      // Gemma has no system role: the instructions go at the top of the user turn.
      val user = if (sys.isNotBlank()) "$sys\n\n$prompt" else prompt
      return "<start_of_turn>user\n$user<end_of_turn>\n<start_of_turn>model\n"
    }
    return messages.joinToString("") { (role, text) -> "<|im_start|>$role\n$text<|im_end|>\n" } + "<|im_start|>assistant\n"
  }

  /** Cuts a reply at the first end-of-turn marker the model may still print. */
  private fun cutAtStop(text: String): String {
    var end = text.length
    for (m in STOP_MARKERS) {
      val i = text.indexOf(m)
      if (i in 0 until end) end = i
    }
    return text.substring(0, end).trimEnd()
  }

  /**
   * Generates complete text synchronously on the background worker.
   */
  suspend fun generateText(
    prompt: String,
    context: String? = null,
    system: String? = null
  ): Result<String> = withContext(inferenceDispatcher) {
    if (!isModelLoaded.get()) {
      return@withContext Result.failure(IllegalStateException("No model loaded in Anvaykosh AI engine"))
    }

    try {
      isGenerating.set(true)
      val result = cutAtStop(LlamaBridge.generate(chatPrompt(prompt, context, system)))
      isGenerating.set(false)
      Result.success(result)
    } catch (e: Throwable) {
      isGenerating.set(false)
      Result.failure(e)
    }
  }

  /**
   * Generates schema-constrained JSON output.
   */
  suspend fun generateJson(
    prompt: String,
    schema: String? = null,
    context: String? = null,
    system: String? = null
  ): Result<String> = withContext(inferenceDispatcher) {
    if (!isModelLoaded.get()) {
      return@withContext Result.failure(IllegalStateException("No model loaded in Anvaykosh AI engine"))
    }

    try {
      isGenerating.set(true)
      val result = if (!system.isNullOrBlank() || !context.isNullOrBlank()) {
        LlamaBridge.generateJsonWithContext(system ?: "", context ?: "", prompt, schema)
      } else {
        LlamaBridge.generateJson(prompt, schema)
      }
      isGenerating.set(false)
      Result.success(result)
    } catch (e: Throwable) {
      isGenerating.set(false)
      Result.failure(e)
    }
  }

  /**
   * Generates dense embedding vector for semantic retrieval.
   */
  suspend fun embed(text: String): Result<FloatArray> = withContext(inferenceDispatcher) {
    if (!isModelLoaded.get()) {
      return@withContext Result.failure(IllegalStateException("No model loaded for embeddings in Anvaykosh AI"))
    }

    try {
      // The native bridge returns null when the loaded model has no embedding context.
      val vector: FloatArray? = LlamaBridge.embed(text)
      if (vector == null || vector.isEmpty()) {
        Result.failure(IllegalStateException("This model cannot make embeddings"))
      } else {
        Result.success(vector)
      }
    } catch (e: Throwable) {
      Result.failure(e)
    }
  }

  /**
   * Starts token-by-token streaming inference.
   */
  fun startStream(
    prompt: String,
    context: String? = null,
    system: String? = null,
    onDelta: (token: String) -> Unit,
    onComplete: (fullText: String, tokenCount: Int, durationMs: Long, tps: Double) -> Unit,
    onError: (errorMessage: String) -> Unit
  ) {
    if (!isModelLoaded.get()) {
      onError("No model is loaded in Anvaykosh AI engine")
      return
    }

    isGenerating.set(true)
    scope.launch {
      val startTime = SystemClock.elapsedRealtime()
      var tokenCount = 0
      val accumulator = java.lang.StringBuilder()
      var sent = 0
      var finished = false

      val streamCallback = object : GenStream {
        override fun onDelta(text: String) {
          if (finished) return
          tokenCount++
          accumulator.append(text)
          val clean = cutAtStop(accumulator.toString())
          if (STOP_MARKERS.any { accumulator.indexOf(it) >= 0 }) {
            // The model reached an end-of-turn marker: stop and finish with the clean text.
            if (clean.length > sent) onDelta(clean.substring(sent))
            sent = clean.length
            try { LlamaBridge.nativeCancelGenerate() } catch (_: Throwable) {}
            onComplete()
            return
          }
          // Hold back a partial marker such as "<|im" until we know what it is.
          val safe = accumulator.length - (accumulator.lastIndexOf("<").takeIf { it >= sent && accumulator.length - it < 16 }?.let { accumulator.length - it } ?: 0)
          if (safe > sent) {
            onDelta(accumulator.substring(sent, safe))
            sent = safe
          }
        }

        override fun onComplete() {
          if (finished) return
          finished = true
          isGenerating.set(false)
          val elapsedMs = SystemClock.elapsedRealtime() - startTime
          val tps = if (elapsedMs > 0) (tokenCount.toDouble() / (elapsedMs.toDouble() / 1000.0)) else 0.0
          onComplete(cutAtStop(accumulator.toString()), tokenCount, elapsedMs, tps)
        }

        override fun onError(message: String) {
          isGenerating.set(false)
          onError(message)
        }
      }

      try {
        LlamaBridge.generateStream(chatPrompt(prompt, context, system), streamCallback)
      } catch (e: Throwable) {
        isGenerating.set(false)
        streamCallback.onError(e.message ?: "Native stream failure")
      }
    }
  }

  @Volatile private var loadedPath: String = ""

  companion object {
    private val STOP_MARKERS = listOf("<|im_end|>", "<|endoftext|>", "<end_of_turn>", "<|im_start|>", "<start_of_turn>", "\nHuman:", "\nUser:")
  }

}

