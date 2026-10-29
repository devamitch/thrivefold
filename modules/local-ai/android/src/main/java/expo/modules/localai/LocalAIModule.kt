package expo.modules.localai

import android.os.Bundle
import android.util.Log
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.launch
import java.io.File

private const val TAG = "AnvaykoshAIModule"

/**
 * Anvaykosh AI Native Expo Module.
 *
 * Provides the unified Kotlin bridge for on-device mobile AI in Thrivefold:
 * - On-device GGUF quantized model execution via AnvaykoshAiEngine
 * - Memory headroom safety validation via LlmMemoryGuard
 * - Model download integrity and atomic promotion via AssetModelExtractor
 * - Native semantic text chunking & BM25 preprocessing via AnvaykoshDocumentProcessor
 * - Reactive token streaming with tokens-per-second (TPS) metrics
 * - Conversational barge-in cancellation
 */
class LocalAIModule : Module() {

  private val engine = AnvaykoshAiEngine()

  override fun definition() = ModuleDefinition {
    Name("LocalAI")

    Events(
      "onToken",
      "onStreamComplete",
      "onStreamError",
      "onModelLoadProgress"
    )

    Constant("isSupported") { true }
    Constant("nativeEngine") { "Anvaykosh AI (Llamatik/llama.cpp)" }
    Constant("engineBranding") { "Anvaykosh AI" }
    Constant("sdkVersion") { "1.0.0" }

    /**
     * Checks if native shared libraries are linked and operational.
     */
    Function("isAvailable") {
      try {
        Class.forName("com.llamatik.library.platform.LlamaBridge") != null
      } catch (e: Throwable) {
        Log.e(TAG, "LlamaBridge is unavailable: ${e.message}", e)
        false
      }
    }

    /**
     * Returns runtime diagnostics and active model metadata.
     */
    Function("getRuntimeStatus") {
      mapOf(
        "isSupported" to true,
        "isLoaded" to engine.isModelLoaded.get(),
        "isGenerating" to engine.isGenerating.get(),
        "loadedModelPath" to (engine.loadedModelPath ?: ""),
        "loadedFileName" to (engine.loadedFileName ?: ""),
        "modelSizeBytes" to engine.loadedModelSizeBytes,
        "modelSizeMb" to (engine.loadedModelSizeBytes / (1024 * 1024)),
        "nativeEngine" to "Anvaykosh AI (Llamatik/llama.cpp)",
        "sdkVersion" to "1.0.0"
      )
    }

    /**
     * Inspects device RAM, CPU cores, ARM64 capability, and storage capacity.
     */
    Function("getDeviceCapabilities") {
      val ctx = appContext.reactContext ?: throw IllegalStateException("ReactContext is unavailable")
      LlmMemoryGuard.getDeviceCapabilities(ctx)
    }

    /**
     * Verifies post-download file integrity against an expected SHA-256 hash.
     */
    AsyncFunction("verifyModelChecksum") { filePath: String, expectedSha256: String, promise: Promise ->
      engine.scope.launch {
        try {
          val cleanPath = filePath.removePrefix("file://")
          val file = File(cleanPath)
          if (!file.exists() || !file.isFile) {
            promise.reject("FILE_NOT_FOUND", "File does not exist at $cleanPath", null)
            return@launch
          }
          val actualHash = AssetModelExtractor.computeSha256(file)
          val matches = actualHash.equals(expectedSha256.trim(), ignoreCase = true)
          promise.resolve(
            mapOf(
              "matches" to matches,
              "actualSha256" to actualHash,
              "expectedSha256" to expectedSha256
            )
          )
        } catch (e: Throwable) {
          promise.reject("CHECKSUM_ERROR", e.message ?: "Failed to verify checksum", e)
        }
      }
    }

    /**
     * Lists models stored locally in app-private storage.
     */
    Function("listCachedModels") {
      val ctx = appContext.reactContext ?: return@Function emptyList<Map<String, Any>>()
      AssetModelExtractor.listCachedModels(ctx)
    }

    /**
     * Deletes a model file from app-private storage.
     */
    Function("deleteCachedModel") { fileName: String ->
      val ctx = appContext.reactContext ?: return@Function false
      AssetModelExtractor.deleteCachedModel(ctx, fileName)
    }

    Function("isLoaded") {
      engine.isModelLoaded.get()
    }

    Function("isGenerating") {
      engine.isGenerating.get()
    }

    /**
     * Lazily loads a quantized GGUF model into native memory:
     * - Validates RAM headroom via LlmMemoryGuard
     * - Runs on background thread to prevent UI jank
     */
    AsyncFunction("loadModel") { modelPathOrAsset: String, isAsset: Boolean, options: Map<String, Any>?, promise: Promise ->
      val ctx = appContext.reactContext
      if (ctx == null) {
        promise.reject("CONTEXT_NULL", "ReactContext is not available", null)
        return@AsyncFunction
      }

      engine.scope.launch {
        try {
          sendProgress(0.2f, "Resolving model path...")
          val file = AssetModelExtractor.resolveModelPath(ctx, modelPathOrAsset, isAsset)
          val fileSize = file.length()

          if (!file.exists() || fileSize == 0L) {
            promise.reject("MODEL_NOT_FOUND", "Model file at ${file.absolutePath} is missing or empty.", null)
            return@launch
          }

          // RAM Headroom safety check
          val force = options?.get("force") as? Boolean ?: false
          val memCheck = LlmMemoryGuard.checkMemorySafety(ctx, fileSize)

          if (!memCheck.isSafe && !force) {
            promise.reject(
              "INSUFFICIENT_MEMORY",
              memCheck.warningMessage ?: "Model requires more RAM than safely available.",
              null
            )
            return@launch
          }

          sendProgress(0.6f, "Loading model weights into Anvaykosh AI engine...")

          val temperature = (options?.get("temperature") as? Number)?.toFloat() ?: 0.7f
          val maxTokens = (options?.get("maxTokens") as? Number)?.toInt() ?: 512
          val topP = (options?.get("topP") as? Number)?.toFloat() ?: 0.9f
          val topK = (options?.get("topK") as? Number)?.toInt() ?: 40
          val repeatPenalty = (options?.get("repeatPenalty") as? Number)?.toFloat() ?: 1.1f

          val result = engine.loadModel(
            modelFile = file,
            temperature = temperature,
            maxTokens = maxTokens,
            topP = topP,
            topK = topK,
            repeatPenalty = repeatPenalty
          )

          result.onSuccess { durationMs ->
            sendProgress(1.0f, "Ready")
            promise.resolve(
              mapOf(
                "success" to true,
                "modelPath" to file.absolutePath,
                "fileName" to file.name,
                "sizeBytes" to fileSize,
                "sizeMb" to (fileSize / (1024 * 1024)),
                "durationMs" to durationMs,
                "engine" to "Anvaykosh AI"
              )
            )
          }.onFailure { err ->
            promise.reject("LOAD_FAILED", err.message ?: "Failed to initialize Anvaykosh AI model", err)
          }
        } catch (e: Throwable) {
          Log.e(TAG, "Failed to load model: ${e.message}", e)
          promise.reject("LOAD_EXCEPTION", e.message ?: "Unknown model loading exception", e)
        }
      }
    }

    /**
     * Unloads model from RAM.
     */
    AsyncFunction("unloadModel") { promise: Promise ->
      engine.scope.launch {
        val success = engine.unload()
        promise.resolve(success)
      }
    }

    /**
     * Synchronous complete text generation.
     */
    AsyncFunction("generateText") { prompt: String, context: String?, system: String?, promise: Promise ->
      engine.scope.launch {
        val startTime = System.currentTimeMillis()
        val res = engine.generateText(prompt, context, system)
        val elapsed = System.currentTimeMillis() - startTime
        res.onSuccess { text ->
          promise.resolve(
            mapOf(
              "text" to text,
              "durationMs" to elapsed
            )
          )
        }.onFailure { err ->
          promise.reject("GENERATE_FAILED", err.message ?: "Inference error", err)
        }
      }
    }

    /**
     * Structured JSON generation with schema constraint.
     */
    AsyncFunction("generateStructured") { prompt: String, schema: String?, context: String?, system: String?, promise: Promise ->
      engine.scope.launch {
        val startTime = System.currentTimeMillis()
        val res = engine.generateJson(prompt, schema, context, system)
        val elapsed = System.currentTimeMillis() - startTime
        res.onSuccess { json ->
          promise.resolve(
            mapOf(
              "json" to json,
              "durationMs" to elapsed
            )
          )
        }.onFailure { err ->
          promise.reject("GENERATE_JSON_FAILED", err.message ?: "JSON Inference error", err)
        }
      }
    }

    /**
     * Token-by-token streaming inference.
     */
    Function("startStream") { turnId: String, prompt: String, context: String?, system: String? ->
      engine.startStream(
        prompt = prompt,
        context = context,
        system = system,
        onDelta = { token ->
          val bundle = Bundle().apply {
            putString("turnId", turnId)
            putString("token", token)
          }
          sendEvent("onToken", bundle)
        },
        onComplete = { fullText, tokenCount, durationMs, tps ->
          val bundle = Bundle().apply {
            putString("turnId", turnId)
            putString("fullText", fullText)
            putInt("tokenCount", tokenCount)
            putLong("durationMs", durationMs)
            putDouble("tokensPerSecond", tps)
          }
          sendEvent("onStreamComplete", bundle)
        },
        onError = { err ->
          val bundle = Bundle().apply {
            putString("turnId", turnId)
            putString("error", err)
          }
          sendEvent("onStreamError", bundle)
        }
      )
      true
    }

    /**
     * Cancels an ongoing generation (barge-in interruption).
     */
    Function("cancelGeneration") {
      engine.cancel()
    }

    /**
     * Generates dense embedding vector on device.
     */
    AsyncFunction("embed") { text: String, promise: Promise ->
      engine.scope.launch {
        val res = engine.embed(text)
        res.onSuccess { floatArray ->
          val list = floatArray.map { it.toDouble() }
          promise.resolve(list)
        }.onFailure { err ->
          promise.reject("EMBED_FAILED", err.message ?: "Embedding error", err)
        }
      }
    }

    /**
     * Fast native semantic chunking for document ingestion & offline RAG.
     */
    Function("chunkDocument") { text: String, targetChunkSize: Int?, overlapChars: Int? ->
      val chunks = AnvaykoshDocumentProcessor.chunkDocument(
        text = text,
        targetChunkSize = targetChunkSize ?: 320,
        overlapChars = overlapChars ?: 40
      )
      chunks.map { c ->
        mapOf(
          "index" to c.index,
          "text" to c.text,
          "startOffset" to c.startOffset,
          "endOffset" to c.endOffset,
          "tokenEstimate" to c.tokenEstimate
        )
      }
    }

    /**
     * Fast native term frequency computation for BM25 ranking.
     */
    Function("computeTermFrequencies") { text: String ->
      AnvaykoshDocumentProcessor.computeTermFrequencies(text)
    }

    OnActivityDestroys {
      engine.scope.launch {
        engine.unload()
      }
    }
  }

  private fun sendProgress(progress: Float, status: String) {
    val bundle = Bundle().apply {
      putFloat("progress", progress)
      putString("status", status)
    }
    sendEvent("onModelLoadProgress", bundle)
  }
}
