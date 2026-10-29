# Capability and Offline Support Matrix

Authoritative inventory of on-device AI, voice, retrieval, vision, and tool capabilities in Thrivefold.

---

## 1. Capability Status Inventory

| Capability | Implementation Path | Offline Status | Fallback Strategy | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **Global Voice Assistant** | `src/services/voice/globalVoiceController.ts` & `GlobalVoiceAssistant.tsx` | Supported via system ASR; typed input fallback | Keyboard text input modal | **IMPLEMENTED & AUTOMATED TESTED** |
| **Navigation Orb Long-Press** | `src/components/navigation/CustomTabBar.tsx` | 100% Offline | Short tap for check-in | **IMPLEMENTED & AUTOMATED TESTED** |
| **Screen Capability Registry** | `src/domain/assistant/screenRegistry.ts` | 100% Offline | Default Home capability | **IMPLEMENTED & AUTOMATED TESTED** |
| **Typed Tool Execution Layer** | `src/domain/assistant/toolRegistry.ts` | 100% Offline | Controlled tool error notice | **IMPLEMENTED & AUTOMATED TESTED** |
| **On-Device GGUF Inference** | `modules/local-ai` (Llamatik / llama.cpp) | 100% Offline | Deterministic local coach (`localCoachAI.ts`) | **IMPLEMENTED & BUILD VERIFIED** |
| **RAM Headroom Safety Guard** | `LlmMemoryGuard.kt` | 100% Offline | Refuse model allocation safely | **IMPLEMENTED & BUILD VERIFIED** |
| **Hybrid RAG Pipeline** | `src/services/local-ai/rag/hybridRagPipeline.ts` | 100% Offline | Bounded sparse BM25 ranking | **IMPLEMENTED & AUTOMATED TESTED** |
| **Analytical Memory Store** | `src/services/local-ai/memory/memoryStore.ts` | 100% Offline | Ephemeral session context | **IMPLEMENTED & AUTOMATED TESTED** |
| **Private Memory Management UI** | `src/app/(app)/settings/memories.tsx` | 100% Offline | None needed | **IMPLEMENTED & AUTOMATED TESTED** |
| **Medicine Educational Lookup** | `src/services/ai/medicineResearch.ts` | 100% Offline | Flag uncertain match & doctor referral | **IMPLEMENTED & AUTOMATED TESTED** |
| **Urgent Crisis Safety Escalation** | `trigger_urgent_support` tool | 100% Offline | Show Tele-MANAS (14416) & 112 directly | **IMPLEMENTED & AUTOMATED TESTED** |
| **Supabase Cloud Progress Sync** | `src/services/supabase/` | Online only | Local SQLite persistence & outbox queue | **BACKEND VERIFIED (175 tests pass)** |

---

## 2. Tested Failure Scenarios

1. **No GGUF Model Loaded**: Automatically executes deterministic coaching rules (`localCoachAI.ts`); zero latency spike, 100% functional.
2. **Microphone Permission Denied**: Switches to typed keyboard input mode seamlessly; error banner is presented non-disruptively.
3. **Barge-in During Speech**: Speech synthesis terminates immediately when the user speaks, re-centering conversational turn on the user.
4. **Echo Suppression**: ASR results matching the last spoken text received within 1200ms are discarded to prevent self-transcription.
5. **Low Device RAM**: Native `LlmMemoryGuard` blocks model weight allocation when available RAM $< 1.5\times$ file size.
6. **Network Completely Disconnected**: All navigation, water logging, memory inspection, exercise coaching, and local RAG continue without degradation.
