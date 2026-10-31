# Thrivefold — Product Completion Plan

Audit date 2026-10-30. Based on the actual repository (152 route files under `src/app`), the native
modules, the Moto G71 (ZD2225KYKD) device sessions of 29–30 Oct, and `docs/REQUIREMENTS_STATUS.md`
(the line-by-line requirement list with statuses). This plan orders the remaining work; it does not
repeat every requirement.

## 1. Architecture (as built)

| Layer      | Implementation                                                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App shell  | expo sdk 58, React Native 0.83, Expo Router (`src/app`), tabs Base · Plan · [Anvay orb] · Metrics · Profile                                                                                              |
| State      | One Zustand store (`useRootStore`, slices in `src/stores/slices`), encrypted MMKV                                                                                                                        |
| Local data | expo-sqlite: memory (`thrivefold-local-memory.db`), RAG knowledge store, analytics, outbox                                                                                                               |
| Server     | Supabase project `lymbgfzngpkvcadrkvui`: profiles, progress ledger (migrations 23–24), vault, edge functions `ai-chat`, `maps`, `doc-reader`, `meal-vision`, `age-check`, `delete-account`               |
| Local AI   | `modules/local-ai` (Llamatik 0.12 / llama.cpp), catalog Qwen2.5 0.5B / 1.5B, Gemma 3 1B; setup + probe in `src/services/ai/modelSetup.ts`                                                                |
| Agent      | `src/services/assistant/agentEngine.ts` (quick replies → commands/multi-step → RAG → cloud with consent → local LLM → rules), tools in `src/domain/assistant/toolRegistry.ts`                            |
| Voice      | `src/services/voice/globalVoiceController.ts` (expo-speech-recognition, streaming sentence TTS via `coachVoiceService.queueCoachSpeech`), settings `you/voice.tsx`                                       |
| Companion  | `src/components/brand/AnvayCompanion.tsx` (AnvayKosh mark with face), coach sheet `components/assistant/GlobalVoiceAssistant.tsx`; full character set in `components/brand/thrive/` (Meet Thrive screen) |
| Camera     | `modules/pose-landmarker` (CameraX + MediaPipe pose, face + blendshapes, gestures, audio, objects); eye scanner `components/vision/EyeScanFullScreen.tsx`                                                |

## 2. Work by category (priority order)

### Critical blockers

1. **Rotate the 13 provider API keys** that shipped in earlier builds (owner action). Code no longer bundles them.
2. Device-verify the latest build: microphone steadiness, streaming speech timing, sheet gestures, eye overlay alignment facing the camera, blink rate.

### Broken / unverified existing features

- Voice latency: measure mic-on → first partial → final → first audio on the phone; tune silence lengths.
- Eye overlay: offset fix (measured view size) needs a face-on check.
- Coach-sheet streaming: verify that sentence-level speech starts before the text finishes.

### Incomplete features

- Learn tab: per-item images (men / women / general), external articles with attribution, voice intro, shared-element image viewer.
- Heart rate from Health Connect into Anvay (`brand/thrive/heart.ts` exists; needs wiring and permission UI).
- Durable downloads after the app closes (Android DownloadManager or WorkManager); shared model storage across AnvayKosh apps (SAF folder, documented limits).
- Companion states "action done", "waiting" and "unavailable" on `AnvayCompanion`.

### UX and visual quality

- Beta hero, Learn, Train and Health screens: image use per colour and subject; card hierarchy.
- Dashboard animation smoothness (measure dropped frames first).
- Pals (social) screens audit; they depend on the server features that are gated.

### Performance and stability

- Measure render counts on Home and the coach sheet; camera thermal behaviour in long eye sessions.

### Data and persistence

- Done: ledger sync, profile sync, backup/restore. Pending: download history; memory export.

### Documentation and release

- Keep `REQUIREMENTS_STATUS.md` current; refresh `docs/ai/CAPABILITY_AND_OFFLINE_MATRIX.md` after device checks; release runbook unchanged (publishing handled by the owner's release agent).

## 3. Dependencies

Voice timing measurements → tuning. Learn images → asset generation/licensing decision (owner: which illustration source is acceptable). Shared model storage → AnvayKosh app-registry decision (needs Neev / HarmonyBloom changes, owner approval). Heart rate → Health Connect permission strings in app.json (prebuild).

## 4. Verification standard

A feature is DONE only when seen working on the Moto G71 release build, with the screenshot or log noted in `REQUIREMENTS_STATUS.md`. Type checks, unit tests and builds are recorded separately and are not treated as device proof.

## 5. Known limits (recorded, not hidden)

- Miss Minutes is Marvel's character; Anvay is an original design from the AnvayKosh mark.
- Phones cannot practically fine-tune these models; "learning" is retrieval over approved memories and saved answers.
- Android has no uninstall hook; models and data survive reinstall only through a user-chosen folder or the account backup.
- Phone-camera heart rate is not implemented and is not claimed.
