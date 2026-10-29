# Thrivefold AI Reference Architecture & Adaptation Audit

Single source of truth documenting the audit of **Google AI Edge Gallery**, **Google LiteRT-LM**, and **PocketSage**, and their concrete adaptation into Thrivefold (Anvaykosh AI).

---

## 1. Executive Summary & Technology Matrix

| Subsystem | Google AI Edge Gallery Reference | Google LiteRT-LM Reference | PocketSage Reference | Thrivefold Production Architecture (Anvaykosh AI) |
| :--- | :--- | :--- | :--- | :--- |
| **Native Inference Runtime** | LiteRT-LM Android SDK (`com.google.ai.edge.litert`) with GPU/NPU delegate | C++ core with JNI `LiteRtLmJni`, `Engine.kt`, `Session.kt`, `EmbeddingEngine.kt` | llama.cpp / Gemma 4 E2B `.litertlm` artifact | `modules/local-ai` (`AnvaykoshAiEngine.kt` with Llamatik / llama.cpp GGUF 4-bit) with ARM64 NEON + fallback deterministic coach |
| **Memory & Safety Guard** | Hardcoded RAM checks before loading model | Native memory profiling (`accelerator_memory_android.cc`) | Device capability checks before GGUF allocation | `LlmMemoryGuard.kt`: checks available memory vs model size, refuses unsafe allocation to prevent Android LMK crashes |
| **Voice Speech-to-Text (ASR)** | Provider-based ASR service with offline on-device speech recognizer | N/A (Audio input tokens in multimodal engine) | System Android Speech API | Single-owner `useVoiceInput` via `expo-speech-recognition` with offline-first flag and echo-guarding |
| **Voice Text-to-Speech (TTS)** | Provider-based TTS engine with cancelable audio playback | N/A | System Android TextToSpeech | Centralized `coachVoice` with 3-tier priority arbitration, barge-in interruption, and echo suppression |
| **Tool Calling & Action Engine** | `com.google.ai.edge.gallery.tools` with typed schemas and dispatch | `Tool.kt` and `ResponseFormat.kt` JSON schema constraints | Bounded text prompt without direct app mutations | Strongly typed `toolRegistry.ts` with schema validation, permission checks, confirmation gates, and deterministic execution |
| **Semantic Retrieval (RAG)** | Dense embedding vector search (`services/semanticretrieval`) | `EmbeddingEngine.kt` calculating dense multimodal embeddings | SQLite vector store (`Vec.kt`) + bounded evidence prompt + top-K citations | `knowledgeStore.ts` + `hybridRagPipeline.ts`: Hybrid BM25 sparse + dense embeddings + Reciprocal Rank Fusion (RRF $k=60$) + bounded citation prompt |
| **Document Processing** | File manager & media loader | Text / Image token budget managers | `Chunker.kt` with overlap scanning | `AnvaykoshDocumentProcessor.kt`: Native Kotlin text cleaning, semantic sentence splitting, whitespace scanback, term frequency map |
| **Model Provisioning** | Multi-file background download with temporary staging | Direct file path / file descriptor loading | Atomic promotion from temp storage | `AssetModelExtractor.kt`: app-private directory storage, SHA-256 integrity verification, safe download resume |
| **Global UI Access** | Bottom navigation bar / floating action | CLI / Example benchmark harnesses | Dedicated Chat Activity | Center Thrive Orb in `CustomTabBar.tsx` with haptic long-press triggering `GlobalVoiceAssistant` overlay |

---

## 2. Google AI Edge Gallery Architectural Patterns Studied

### 2.1 Agent & Session Lifecycle (`agent/`, `agent/sessions/`)
- **Key Insight**: Gallery separates session state (multi-turn message history, token usage, tool call results) from the model execution loop.
- **Thrivefold Adaptation**:
  - `agentEngine.ts`: Manages multi-turn conversation state, system prompts, active screen context, and streaming token accumulation.
  - Streaming events (`onToken`, `onStreamComplete`, `onStreamError`) flow from native Kotlin via React Native DeviceEventEmitter into the UI layer with request cancellation support.

### 2.2 Provider-Based Speech Architecture (`services/asr/`, `services/tts/`)
- **Key Insight**: Independent components acquiring the microphone or audio track cause audio focus conflicts, echo loops (TTS output transcribed by ASR), and chopped phrases.
- **Thrivefold Adaptation**:
  - `globalVoiceController.ts`: Single stateful coordinator (`idle` $\rightarrow$ `requesting_permission` $\rightarrow$ `listening` $\rightarrow$ `transcribing` $\rightarrow$ `reasoning` $\rightarrow$ `speaking` $\rightarrow$ `idle`).
  - **Echo-Guard Window**: While TTS is speaking or within 600ms of finishing, ASR results matching the last spoken text are discarded.
  - **Barge-in Interruption**: When user speech is detected (`onPartialTranscript`), TTS playback is aborted immediately (`coachVoice.stop()`), granting conversational initiative to the user.

### 2.3 Tool Registry & Context Awareness (`tools/`, `customtasks/agentchat/`)
- **Key Insight**: Tools must declare strict input parameters, authorization requirements, and human-readable confirmation steps for non-idempotent or sensitive operations.
- **Thrivefold Adaptation**:
  - `toolRegistry.ts`: Every tool defines `name`, `description`, `parameters`, `requiresConfirmation`, and an execute handler.
  - `screenRegistry.ts`: Maps the user's active screen (Home, Today, Progress, You, Pose Check, Journal, etc.) to visible metrics, supported actions, and quick-prompt suggestions.

---

## 3. Google LiteRT-LM Architectural Patterns Studied

### 3.1 Synchronized Handle Lifecycle (`Engine.kt`, `Session.kt`)
- **Key Insight**: `Engine.kt` uses `@Volatile private var handle: Long?` protected by a synchronization monitor lock. It guards against multi-threaded race conditions during model initialization, token generation, and native pointer cleanup (`close()`).
- **Thrivefold Adaptation**:
  - `AnvaykoshAiEngine.kt`: Operates on a dedicated single-threaded dispatcher (`AnvaykoshAi-InferenceWorker`) with `AtomicBoolean` flags (`isModelLoaded`, `isGenerating`, `shouldCancel`), ensuring all JNI native calls execute sequentially without thread contention or SIGSEGV crashes.

### 3.2 Embedding Engine & Dense Vectors (`EmbeddingEngine.kt`, `EmbeddingConfig.kt`)
- **Key Insight**: LiteRT-LM separates the embedding engine from the text generation engine, allowing dense feature extraction without running autoregressive token decoding.
- **Thrivefold Adaptation**:
  - `AnvaykoshAiEngine.embed(text)` provides direct dense vector extraction on device.
  - Results are represented as `FloatArray` (or `number[]` in JS) for fast cosine dot product calculations in SQLite.

### 3.3 Structured Output & Schema Enforcement (`ResponseFormat.kt`, `JsonConverters.kt`)
- **Key Insight**: LiteRT-LM converts tool definitions and response schemas into constrained sampling parameters, ensuring generated tokens conform to JSON syntax.
- **Thrivefold Adaptation**:
  - `LocalAI.generateStructured<T>()` and `LocalAIModule.kt: generateStructured` accept JSON schemas and validate output schemas before returning to the caller.

---

## 4. PocketSage Offline RAG & Bounded Safety Patterns Studied

### 4.1 Document Ingestion & Chunking (`Chunker.kt`)
- **Key Insight**: Chunking arbitrary text across words or sentences destroys context. PocketSage scans backwards within the overlap window to find the nearest whitespace boundary (`text[it - 1].isWhitespace()`).
- **Thrivefold Adaptation**:
  - `AnvaykoshDocumentProcessor.kt` and `jsChunkDocument`: Implements regex sentence splitting (`(?<=[.!?\n])\s+`), sliding window overlap (default 40 characters), and whitespace boundary preservation, producing verified `DocumentChunk` records with exact `startOffset` and `endOffset`.

### 4.2 Cosine Similarity & Binary Vector Storage (`Cosine.kt`, `Vec.kt`, `RetrieverImpl.kt`)
- **Key Insight**: PocketSage normalizes embedding vectors and computes cosine similarity in a tight loop without external heavy libraries, storing raw floats as byte buffers.
- **Thrivefold Adaptation**:
  - `vectorMath.ts`: `cosineSimilarity(a, b)` calculates exact dot product and normalized magnitude.
  - `knowledgeStore.ts`: Persists document metadata and chunks into SQLite (`rag_documents` and `rag_chunks`) with JSON/float arrays, indexing chunks by `document_id` and `user_id`.

### 4.3 Bounded Evidence Prompt & Anti-Hallucination Guardrails (`RagPipelineImpl.kt`)
- **Key Insight**: PocketSage strictly formats prompts: "Use ONLY the context below to answer the question. If the answer is not contained in the context, reply: 'I don't know based on the provided documents.'"
- **Thrivefold Adaptation**:
  - `hybridRagPipeline.ts`: Blends BM25 sparse lexical ranking + dense vector cosine similarity via Reciprocal Rank Fusion ($k=60$).
  - If hybrid score is below confidence threshold ($0.01$), the pipeline returns an honest refusal stating insufficient evidence rather than hallucinating.
  - Evidence context injects citation markers (`[Source 1]`, `[Source 2]`), enabling verifiable traceability.

---

## 5. Verification & Packaging

- **Engine**: `Llamatik/llama.cpp` packaged in `modules/local-ai`.
- **ABIs**: `arm64-v8a` (production standard for Android 64-bit devices).
- **RAM Headroom Guard**: `LlmMemoryGuard.kt` inspects `/proc/meminfo` and `ActivityManager.MemoryInfo`, ensuring at least 1.5x model size of free RAM before allocating native tensors.
- **Graceful Fallback**: If no GGUF model is loaded or device memory is constrained, Thrivefold falls back seamlessly to deterministic on-device intelligence (`localCoachAI.ts`), guaranteeing 100% offline availability on every Android device without crashes.
