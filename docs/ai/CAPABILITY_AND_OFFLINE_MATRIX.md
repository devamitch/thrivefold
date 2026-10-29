# Capability and Offline Support Matrix

What Thrivefold's coach can actually do, where it lives, and how far it has been verified.
Status labels follow the master prompt (section 21). Updated 2026-10-29.

No item below is `DEVICE VERIFIED` for the 2026-10-29 changes: the test phone was disconnected
(its camera service had hung and needed a restart) after these were built. The release APK builds.

| Capability | Path | Offline | Fallback | Status |
| :--- | :--- | :--- | :--- | :--- |
| Orb opens the coach (tap); hold for check-in | `components/navigation/CustomTabBar.tsx` | Yes | Home "Check in" button | BUILD VERIFIED |
| Animated Thrive mark in the orb, showing listening / thinking / speaking | `components/brand/AnimatedThrivefoldMark.tsx` | Yes | Static mark with Reduce Motion | BUILD VERIFIED |
| Conversation sheet: running transcript, streamed replies, typing | `components/assistant/GlobalVoiceAssistant.tsx` | Yes | Typing | BUILD VERIFIED |
| Continuous listening (re-listens after replies and short silences, barge-in) | `services/voice/globalVoiceController.ts` | Needs the phone's offline speech pack; else network ASR | Typing; plain error text | BUILD VERIFIED |
| Rule commands: open screens, log water, today's numbers, crisis support, life topics | `domain/assistant/commands.ts`, `toolRegistry.ts` | Yes | — | AUTOMATED TESTED |
| Multi-step requests ("log water and then open sleep") | `splitSteps` in `commands.ts`, `agentEngine.ts` | Yes | Treated as one question | AUTOMATED TESTED |
| "Export all my metrics" / "back up everything" by voice | `export_data` tool → `services/privacy/localData.ts` | Yes (folder picker) | Privacy screen buttons | AUTOMATED TESTED (parsing) |
| "Remember that …" and the Teach box | `log_journal_note` tool, `settings/memories.tsx` | Yes | — | AUTOMATED TESTED (parsing) |
| Memory screen: teach, ask your memory with sources, delete, clear | `app/(app)/settings/memories.tsx` | Yes | — | BUILD VERIFIED |
| On-device LLM (llama.cpp via Llamatik, Qwen2.5 0.5B/1.5B GGUF, SHA-256 checked) | `modules/local-ai`, `services/ai/localModel.ts`, `ai/model-status.tsx` | Yes after download | Rule-based coach (`localCoachAI.ts`) | BUILD VERIFIED |
| Local answers grounded in saved memories, documents and learned answers | `agentEngine.ts` + `retrieveHybridEvidence` | Yes | Screen context only | BUILD VERIFIED |
| Hybrid retrieval (BM25 + vectors when the model can embed) | `services/local-ai/rag/hybridRagPipeline.ts` | Yes | BM25 only when no embeddings | AUTOMATED TESTED |
| Cloud escalation for macros, calories and plans (with consent) | `agentEngine.askCloud` → `ai-chat` edge function | No | Local model, then rule coach | BUILD VERIFIED |
| Cloud answers kept locally for later offline use | `knowledgeStore.ingestDocument` (source `cloud_coach`) | Yes once saved | — | BUILD VERIFIED |
| Points, level, streaks follow the account | `services/account/progressSync.ts`, migrations 23–24 | Local always; sync online | Next sync | AUTOMATED TESTED, BACKEND VERIFIED (migrations applied) |
| Backup file and non-destructive restore | `services/privacy/localData.ts`, `domain/privacy/backupMerge.ts` | Yes | — | AUTOMATED TESTED (merge) |
| Camera start timeout shown on eye screens | `PoseCameraView.kt`, `eye-games.tsx`, `EyeTrackingStudio.tsx` | Yes | Message to restart the phone | BUILD VERIFIED |

## Not available, and why

| Request | Status |
| :--- | :--- |
| Retraining or fine-tuning a model on the phone | NOT APPLICABLE — phones cannot train these models in practice. Improvement comes from retrieval over approved memories and saved answers. |
| Asking Claude or Grok directly | BLOCKED — the `ai-chat` server function uses its configured providers; adding others needs a server change and keys held as Edge Function secrets. |
| Prompting for a backup at uninstall | NOT APPLICABLE — Android gives apps no uninstall hook. The Privacy screen and the coach offer a backup instead. |
| One agent across all AnvayKosh apps | TODO — Thrivefold only; cross-app exchange must follow the AnvayKosh laws (OAuth + PKCE, server registry, per-category consent). |
| On-device OCR for documents | TODO — documents use the `doc-reader` server function today. |
