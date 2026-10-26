package expo.modules.localai

import android.os.Bundle
import android.os.SystemClock
import android.util.Log
import com.llamatik.library.platform.GenStream
import com.llamatik.library.platform.LlamaBridge
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.*
import java.io.File
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

private const val TAG = "LocalAIModule"

class LocalAIModule : Module() {

  // Dedicated single-threaded executor for native llama.cpp operations to serialize inference
  private val inferenceExecutor = Executors.newSingleThreadExecutor()
  private val inferenceDispatcher = inferenceExecutor.asCoroutineDispatcher()
  private val moduleScope = CoroutineScope(SupervisorJob() + inferenceDispatcher)

  private val isModelLoaded = AtomicBoolean(false)
  private val isGenerating = AtomicBoolean(false)

  private var loadedModelPath: String? = null
  private var loadedFileName: String? = null
  private var loadedModelSizeBytes: Long = 0L

  override fun definition() = ModuleDefinition {
    Name("LocalAI")

    Events(
      "onToken",
      "onStreamComplete",
      "onStreamError",
      "onModelLoadProgress"
    )

    Constant("isSupported") { true }
    Constant("nativeEngine") { "Llamatik/llama.cpp" }
    Constant("sdkVersion") { "0.12.0" }

    /**
     * Checks if the native llama.cpp shared libraries are linked and operational.
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
     * Returns comprehensive runtime status for health monitoring and diagnostics.
     */
    Function("getRuntimeStatus") {
      mapOf(
        "isSupported" to true,
        "isLoaded" to isModelLoaded.get(),
        "isGenerating" to isGenerating.get(),
        "loadedModelPath" to (loadedModelPath ?: ""),
        "loadedFileName" to (loadedFileName ?: ""),
        "modelSizeBytes" to loadedModelSizeBytes,
        "modelSizeMb" to (loadedModelSizeBytes / (1024 * 1024)),
        "nativeEngine" to "Llamatik/llama.cpp",
        "sdkVersion" to "0.12.0"
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
      moduleScope.launch {
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
      isModelLoaded.get()
    }

    Function("isGenerating") {
      isGenerating.get()
    }

    /**
     * Lazily and safely loads a quantized GGUF model into native memory:
     * - Checks device RAM headroom (refuses loading if memory pressure will cause OS LMK crash)
     * - Configures optimal performance threads
     * - Releases previous model from RAM if one is already open
     * - Runs entirely on background worker thread to prevent UI freezing (ANR)
     */
    AsyncFunction("loadModel") { modelPathOrAsset: String, isAsset: Boolean, options: Map<String, Any>?, promise: Promise ->
      val ctx = appContext.reactContext
      if (ctx == null) {
        promise.reject("CONTEXT_NULL", "ReactContext is not available", null)
        return@AsyncFunction
      }

      moduleScope.launch {
        try {
          // Unload any active model first to avoid double allocation
          if (isModelLoaded.get()) {
            try {
              LlamaBridge.shutdown()
            } catch (t: Throwable) {
              Log.w(TAG, "Error shutting down previous model: ${t.message}")
            }
            isModelLoaded.set(false)
            loadedModelPath = null
            System.gc()
          }

          sendProgress(0.15f, "Resolving model path...")

          val file = AssetModelExtractor.resolveModelPath(ctx, modelPathOrAsset, isAsset)
          val fileSize = file.length()

          if (!file.exists() || fileSize == 0L) {
            promise.reject("MODEL_NOT_FOUND", "Model file at ${file.absolutePath} is missing or empty.", null)
            return@launch
          }

          // RAM Headroom check
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

          sendProgress(0.45f, "Configuring native generation parameters...")

          val optimalThreads = LlmMemoryGuard.getOptimalThreadCount()
          val temperature = (options?.get("temperature") as? Number)?.toFloat() ?: 0.7f
          val maxTokens = (options?.get("maxTokens") as? Number)?.toInt() ?: 512
          val topP = (options?.get("topP") as? Number)?.toFloat() ?: 0.9f
          val topK = (options?.get("topK") as? Number)?.toInt() ?: 40
          val repeatPenalty = (options?.get("repeatPenalty") as? Number)?.toFloat() ?: 1.1f

          LlamaBridge.updateGenerateParams(
            temperature = temperature,
            maxTokens = maxTokens,
            topP = topP,
            topK = topK,
            repeatPenalty = repeatPenalty
          )

          sendProgress(0.70f, "Loading model weights into native memory...")

          val startTime = SystemClock.elapsedRealtime()
          val success = LlamaBridge.initGenerateModel(file.absolutePath)
          val elapsedMs = SystemClock.elapsedRealtime() - startTime

          if (!success) {
            promise.reject(
              "INIT_FAILED",
              "LlamaBridge failed to initialize model at ${file.absolutePath}. File format may be incompatible or corrupt.",
              null
            )
            return@launch
          }

          isModelLoaded.set(true)
          loadedModelPath = file.absolutePath
          loadedFileName = file.name
          loadedModelSizeBytes = fileSize

          sendProgress(1.0f, "Ready")

          promise.resolve(
            mapOf(
              "success" to true,
              "modelPath" to file.absolutePath,
              "fileName" to file.name,
              "sizeBytes" to fileSize,
              "sizeMb" to (fileSize / (1024 * 1024)),
              "durationMs" to elapsedMs,
              "threads" to optimalThreads
            )
          )
        } catch (e: Throwable) {
          Log.e(TAG, "Failed to load model: ${e.message}", e)
          promise.reject("LOAD_EXCEPTION", e.message ?: "Unknown model loading exception", e)
        }
      }
    }

    /**
     * Unloads the model and reclaims native memory.
     */
    AsyncFunction("unloadModel") { promise: Promise ->
      moduleScope.launch {
        try {
          if (isGenerating.get()) {
            LlamaBridge.nativeCancelGenerate()
            isGenerating.set(false)
          }

          LlamaBridge.shutdown()
          isModelLoaded.set(false)
          loadedModelPath = null
          loadedFileName = null
          loadedModelSizeBytes = 0L

          System.gc()
          promise.resolve(true)
        } catch (e: Throwable) {
          Log.e(TAG, "Error unloading model: ${e.message}", e)
          promise.resolve(false)
        }
      }
    }

    /**
     * Updates dynamic generation parameters.
     */
    Function("updateParams") { params: Map<String, Any> ->
      val temperature = (params["temperature"] as? Number)?.toFloat() ?: 0.7f
      val maxTokens = (params["maxTokens"] as? Number)?.toInt() ?: 512
      val topP = (params["topP"] as? Number)?.toFloat() ?: 0.9f
      val topK = (params["topK"] as? Number)?.toInt() ?: 40
      val repeatPenalty = (params["repeatPenalty"] as? Number)?.toFloat() ?: 1.1f

      LlamaBridge.updateGenerateParams(
        temperature = temperature,
        maxTokens = maxTokens,
        topP = topP,
        topK = topK,
        repeatPenalty = repeatPenalty
      )
      true
    }

    /**
     * Synchronous / complete text generation.
     */
    AsyncFunction("generateText") { prompt: String, context: String?, system: String?, promise: Promise ->
      if (!isModelLoaded.get()) {
        promise.reject("NOT_LOADED", "No local AI model is currently loaded.", null)
        return@AsyncFunction
      }

      moduleScope.launch {
        try {
          isGenerating.set(true)
          val startTime = SystemClock.elapsedRealtime()

          val result = if (!system.isNullOrBlank() || !context.isNullOrBlank()) {
            LlamaBridge.generateWithContext(system ?: "", context ?: "", prompt)
          } else {
            LlamaBridge.generate(prompt)
          }

          val elapsedMs = SystemClock.elapsedRealtime() - startTime
          isGenerating.set(false)

          promise.resolve(
            mapOf(
              "text" to result,
              "durationMs" to elapsedMs
            )
          )
        } catch (e: Throwable) {
          isGenerating.set(false)
          Log.e(TAG, "Generation error: ${e.message}", e)
          promise.reject("GENERATE_FAILED", e.message ?: "Inference error", e)
        }
      }
    }

    /**
     * Structured JSON generation with schema constraint.
     */
    AsyncFunction("generateStructured") { prompt: String, schema: String?, context: String?, system: String?, promise: Promise ->
      if (!isModelLoaded.get()) {
        promise.reject("NOT_LOADED", "No local AI model is currently loaded.", null)
        return@AsyncFunction
      }

      moduleScope.launch {
        try {
          isGenerating.set(true)
          val startTime = SystemClock.elapsedRealtime()

          val result = if (!system.isNullOrBlank() || !context.isNullOrBlank()) {
            LlamaBridge.generateJsonWithContext(system ?: "", context ?: "", prompt, schema)
          } else {
            LlamaBridge.generateJson(prompt, schema)
          }

          val elapsedMs = SystemClock.elapsedRealtime() - startTime
          isGenerating.set(false)

          promise.resolve(
            mapOf(
              "json" to result,
              "durationMs" to elapsedMs
            )
          )
        } catch (e: Throwable) {
          isGenerating.set(false)
          Log.e(TAG, "JSON Generation error: ${e.message}", e)
          promise.reject("GENERATE_JSON_FAILED", e.message ?: "JSON Inference error", e)
        }
      }
    }

    /**
     * Starts token streaming generation.
     * Emits `onToken`, `onStreamComplete`, and `onStreamError` events.
     */
    Function("startStream") { turnId: String, prompt: String, context: String?, system: String? ->
      if (!isModelLoaded.get()) {
        throw IllegalStateException("No local AI model is currently loaded.")
      }

      isGenerating.set(true)

      moduleScope.launch {
        val startTime = SystemClock.elapsedRealtime()
        var tokenIndex = 0
        val textAccumulator = StringBuilder()

        val callback = object : GenStream {
          override fun onDelta(text: String) {
            textAccumulator.append(text)
            val bundle = Bundle().apply {
              putString("turnId", turnId)
              putString("token", text)
              putInt("index", tokenIndex++)
            }
            sendEvent("onToken", bundle)
          }

          override fun onComplete() {
            isGenerating.set(false)
            val elapsedMs = SystemClock.elapsedRealtime() - startTime
            val tps = if (elapsedMs > 0) (tokenIndex.toDouble() / (elapsedMs.toDouble() / 1000.0)) else 0.0

            val bundle = Bundle().apply {
              putString("turnId", turnId)
              putString("fullText", textAccumulator.toString())
              putInt("tokenCount", tokenIndex)
              putLong("durationMs", elapsedMs)
              putDouble("tokensPerSecond", tps)
            }
            sendEvent("onStreamComplete", bundle)
          }

          override fun onError(message: String) {
            isGenerating.set(false)
            Log.e(TAG, "Streaming error: $message")
            val bundle = Bundle().apply {
              putString("turnId", turnId)
              putString("error", message)
            }
            sendEvent("onStreamError", bundle)
          }
        }

        try {
          if (!system.isNullOrBlank() || !context.isNullOrBlank()) {
            LlamaBridge.generateStreamWithContext(system ?: "", context ?: "", prompt, callback)
          } else {
            LlamaBridge.generateStream(prompt, callback)
          }
        } catch (e: Throwable) {
          isGenerating.set(false)
          callback.onError(e.message ?: "Unknown streaming exception")
        }
      }

      true
    }

    /**
     * Cancels an ongoing generation or stream.
     */
    Function("cancelGeneration") {
      try {
        LlamaBridge.nativeCancelGenerate()
        isGenerating.set(false)
        true
      } catch (e: Throwable) {
        Log.e(TAG, "Error cancelling generation: ${e.message}", e)
        false
      }
    }

    /**
     * Generates embedding vector for text on device (for offline RAG / semantic similarity).
     */
    AsyncFunction("embed") { text: String, promise: Promise ->
      if (!isModelLoaded.get()) {
        promise.reject("NOT_LOADED", "No local AI model is currently loaded.", null)
        return@AsyncFunction
      }

      moduleScope.launch {
        try {
          val floatArray = LlamaBridge.embed(text)
          val list = floatArray.map { it.toDouble() }
          promise.resolve(list)
        } catch (e: Throwable) {
          Log.e(TAG, "Embedding error: ${e.message}", e)
          promise.reject("EMBED_FAILED", e.message ?: "Embedding error", e)
        }
      }
    }

    OnActivityDestroys {
      try {
        if (isGenerating.get()) {
          LlamaBridge.nativeCancelGenerate()
        }
        LlamaBridge.shutdown()
      } catch (_: Throwable) {}
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
