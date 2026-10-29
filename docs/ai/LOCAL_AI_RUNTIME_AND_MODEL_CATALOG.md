# Local AI Runtime & Model Catalog Specification

Authoritative documentation of on-device AI runtime, memory guardrails, and model catalog for Thrivefold.

---

## 1. Local Runtime Engine Architecture

Thrivefold uses `modules/local-ai`, an Android native module built on `Llamatik` and `llama.cpp` compiled for `arm64-v8a` architectures with ARM NEON SIMD vector extensions.

```
React Native JavaScript / TypeScript Layer
  │
  ├── LocalAIService (modules/local-ai/index.ts)
  │     ├── startStream(turnId, prompt, context, system)
  │     ├── generateText(prompt, context, system)
  │     ├── generateStructured(prompt, schema)
  │     ├── embed(text)  [Local RAG Embeddings]
  │     └── cancelGeneration()  [Barge-in Interruption]
  │
Native Kotlin Layer (modules/local-ai/android)
  │
  ├── LocalAIModule.kt (Expo Module Interface)
  ├── LlmMemoryGuard.kt (Hardware & Memory Pressure Safety)
  ├── AssetModelExtractor.kt (Atomic Download & Checksum Verification)
  └── LlamaBridge.kt (JNI bindings into libllama.so)
```

---

## 2. Hardware Capability Tiers & Adaptive Execution

| Tier | Available RAM | Target Architecture | Execution Strategy |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Flagship / Modern)** | $\ge 6$ GB | 8-core ARM64 | Full local GGUF model execution (SmolLM2-1.7B / Gemma-2-2B-Q4_K_M) with token streaming & vector embeddings |
| **Tier 2 (Mid-range)** | $3$ to $6$ GB | 8-core ARM64 | Compact quantized model (SmolLM2-360M / Qwen2.5-0.5B-Q4_K_M) + local BM25 + dense hybrid RAG |
| **Tier 3 (Budget / Constrained)** | $< 3$ GB or High Memory Pressure | ARM64 / Low RAM | Deterministic On-Device Coach (`localCoachAI.ts`) + BM25 Sparse Search ($0$ MB native RAM used, zero crash risk) |

### Memory Guardrail (`LlmMemoryGuard.kt`)
Before loading any model weights into RAM:
1. Native `checkMemorySafety` inspects `ActivityManager.MemoryInfo.availMem`.
2. Free RAM must exceed $\text{Model Size} \times 1.5$.
3. If memory is insufficient, loading is aborted with `INSUFFICIENT_MEMORY` error, avoiding Android Out-Of-Memory (LMK) app terminations.

---

## 3. Canonical Model Catalog

| Model ID | Provider & Family | Format & Quant | Disk Size | SHA-256 Checksum | Min RAM | Offline Capability |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `smollm2-360m-instruct-q4` | HuggingFace / Loubser | GGUF Q4_K_M | 240 MB | `e4b3c...` | 2.5 GB | Intent reasoning, coaching tips, structured extraction |
| `smollm2-1.7b-instruct-q4` | HuggingFace / Loubser | GGUF Q4_K_M | 1.05 GB | `9fa1b...` | 4.0 GB | Full conversational reasoning, grounded RAG synthesis |
| `bge-small-en-v1.5-q8` | BAAI | GGUF Q8_0 | 45 MB | `7c82a...` | 1.5 GB | Dense vector embeddings (384 dimensions) for semantic retrieval |
| `deterministic-coach-v1` | Thrivefold Core | Deterministic TypeScript | 0 MB | N/A | 0 MB | 100% offline rule-based coaching, form tips, metric summaries |

---

## 4. Download, Verification & Atomic Promotion Lifecycle

1. **Staging**: Model files download to `cacheDir/models/.downloading_<fileName>`.
2. **Byte Progress**: Native download tracks exact bytes received and total content length.
3. **Checksum Verification**: On completion, `verifyModelChecksum` runs SHA-256 over the temporary file.
4. **Atomic Promotion**: If hash matches, file is atomically moved to `filesDir/models/<fileName>`.
5. **Rollback**: If corrupted or interrupted, partial files are purged immediately.
