# Thrivefold AI Reference Architecture & Adaptation Audit

Single source of truth documenting the audit of **Google AI Edge Gallery**, **Google LiteRT-LM**, and **PocketSage**, and their concrete adaptation into Thrivefold.

---

## 1. Executive Summary & Technology Matrix

| Subsystem | Google AI Edge Gallery Reference | PocketSage Reference | Thrivefold Production Architecture |
| :--- | :--- | :--- | :--- |
| **Native Inference Runtime** | LiteRT-LM Android SDK (`com.google.ai.edge.litert`) with GPU/NPU delegate | llama.cpp / Gemma 4 E2B `.litertlm` artifact | `modules/local-ai` (Llamatik / llama.cpp GGUF 4-bit) with ARM64 NEON + fallback deterministic coach |
| **Memory & Safety Guard** | Hardcoded RAM checks before loading model | Device capability checks before GGUF allocation | `LlmMemoryGuard.kt`: checks available memory vs model size, refuses unsafe allocation to prevent Android LMK crashes |
| **Voice Speech-to-Text (ASR)** | Provider-based ASR service with offline on-device speech recognizer | System Android Speech API | Single-owner `useVoiceInput` via `expo-speech-recognition` with offline-first flag and echo-guarding |
| **Voice Text-to-Speech (TTS)** | Provider-based TTS engine with cancelable audio playback | System Android TextToSpeech | Centralized `coachVoice` with 3-tier priority arbitration, barge-in interruption, and echo suppression |
| **Tool Calling & Action Engine** | `com.google.ai.edge.gallery.tools` with typed schemas and dispatch | Bounded text prompt without direct app mutations | Strongly typed `toolRegistry.ts` with schema validation, permission checks, confirmation gates, and deterministic execution |
| **Semantic Retrieval (RAG)** | Dense embedding vector search (`services/semanticretrieval`) | SQLite vector store + bounded evidence prompt + top-K citations | `hybridRagPipeline.ts`: Hybrid BM25 sparse + dense embeddings + Reciprocal Rank Fusion (RRF $k=60$) + bounded citation prompt |
| **Model Provisioning** | Multi-file background download with temporary staging | Atomic promotion from temp storage | `AssetModelExtractor.kt`: app-private directory storage, SHA-256 integrity verification, safe download resume |
| **Global UI Access** | Bottom navigation bar / floating action | Dedicated Chat Activity | Center Thrive Orb in `CustomTabBar.tsx` with haptic long-press triggering `GlobalVoiceAssistant` overlay |

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

## 3. PocketSage Offline RAG & Bounded Safety Patterns Studied

### 3.1 Document Ingestion & Chunking
- **Key Insight**: Chunking arbitrary text across sentence boundaries destroys context and induces hallucination.
- **Thrivefold Adaptation**:
  - Semantic boundary chunking for user notes, journal entries, and exercise catalog records.
  - Metadata preservation: timestamps, source type (`user_memory`, `exercise_catalog`, `health_guide`), and parent document references.

### 3.2 Bounded Evidence Prompt & Anti-Hallucination Guardrails
- **Key Insight**: PocketSage enforces that if top-K retrieval similarity falls below confidence threshold $\tau$, the assistant responds with an honest "insufficient evidence" statement rather than fabricating answers.
- **Thrivefold Adaptation**:
  - When similarity is below threshold, `hybridRagPipeline.ts` returns a truthful fallback notice.
  - Context is injected with numbered markers (`[Source 1]`, `[Source 2]`), and the prompt strictly directs the LLM to ground assertions in those sources.

---

## 4. Native Kotlin Runtime & Packaging Verification

- **Engine**: `Llamatik/llama.cpp` packaged in `modules/local-ai`.
- **ABIs**: `arm64-v8a` (production standard for Android 64-bit devices).
- **RAM Headroom Guard**: `LlmMemoryGuard.kt` inspects `/proc/meminfo` and `ActivityManager.MemoryInfo`, ensuring at least 1.5x model size of free RAM before allocating native tensors.
- **Graceful Fallback**: If no GGUF model is loaded or device memory is constrained, Thrivefold falls back seamlessly to deterministic on-device intelligence (`localCoachAI.ts`), guaranteeing 100% offline availability on every Android device without crashes.
