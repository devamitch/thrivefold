# Thrivefold — Authoritative Infrastructure Map

**Generated & Verified**: 2026-10-26  
**Status**: Authoritative Reference for AI Agents & Engineers  

---

## 1. Responsibility Boundaries & Data Ownership

| Existing Subsystem | Canonical Responsibility | Data Scope & Storage Engine | Lifecycle Owner |
|---|---|---|---|
| **Expo SQLite (`expo-sqlite`)** | Offline-first durable local records, local health event queues, offline outbox, and private on-device analytical vector memory | Local device file system (`.db` files in app sandbox) | Native SQLite engine via `SQLite.openDatabaseSync` |
| **Supabase / Postgres** | Authoritative multi-device user identity, account progression, age assurance webhooks, chip letters, community groups, and RLS-enforced queries | Remote PostgreSQL database with row-level security (RLS) | `src/services/supabase/supabaseClient.ts` |
| **TanStack React Query** | Remote server state cache, query deduplication, background re-validation, optimistic mutation handling | Encrypted MMKV cache via `querySyncStoragePersister` (`thrivefold.query-cache.v1`) | `src/services/supabase/queryClient.ts` |
| **Zustand (`useRootStore`)** | Client-side reactive UI state, active theme/palette, transient navigation selections, level modals, and local store slices | Encrypted MMKV storage (`thrivefold.store.v1`) | `src/stores/useRootStore.ts` & `src/stores/slices/*` |
| **Native Local AI Module (`modules/local-ai`)** | Zero-cloud, on-device LLaMA inference (Llamatik / `llama.cpp` ARM NEON), token streaming, and dense embeddings | On-device memory & private GGUF models (`context.filesDir/local_ai_models`) | `expo.modules.localai.LocalAIModule` via `inferenceDispatcher` |
| **Local Vector & Analytical Memory** | Long-term profile, preference, episodic, and semantic memory retrieval using 384-dimensional cosine similarity embeddings | `thrivefold-local-memory.db` SQLite database | `src/services/local-ai/memory/memoryStore.ts` |
| **Camera & Pose Landmarker (`modules/pose-landmarker`)** | High-throughput asynchronous live-stream MediaPipe pose, face, and hand tracking | Android `SurfaceView` & MediaPipe native vision runtime | `expo.modules.poselandmarker.PoseCameraView` |
| **Skia Pose Overlay (`@shopify/react-native-skia`)** | 60 FPS UI-thread skeleton rendering, depth-scaled joint rendering, angle arcs, and form fault pulses | Hardware-accelerated Skia Canvas | `src/components/workout/PoseOverlay.tsx` |
| **Firebase Analytics & Crashlytics** | Consented, non-sensitive product telemetry and native unhandled exception crash logging | Remote Firebase project (when available in native builds) | `src/services/telemetry/firebaseAnalytics.ts` & `crashReporting.ts` |
| **Local Telemetry Outbox** | Bounded local diagnostic event queue with exponential backoff retry | `thrivefold-analytics.db` SQLite database | `src/services/telemetry/sqliteAnalyticsStore.ts` |

---

## 2. Real Module Paths & File Inventory

### 2.1 Storage & Databases
- **Analytical Memory Store**: `src/services/local-ai/memory/memoryStore.ts` (`thrivefold-local-memory.db`)
- **Telemetry Event Store**: `src/services/telemetry/sqliteAnalyticsStore.ts` (`thrivefold-analytics.db`)
- **Sync Outbox Store**: `src/services/sync/summaryOutbox.ts` (`thrivefold-outbox.db`)
- **MMKV Key-Value Persister**: `src/stores/persistStorage.ts` (Handles encrypted sync storage for Zustand & React Query)

### 2.2 Remote Services & Backend
- **Supabase Client**: `src/services/supabase/supabaseClient.ts`
- **React Query Client**: `src/services/supabase/queryClient.ts`
- **Letters Service**: `src/services/supabase/letters.ts`
- **Groups Service**: `src/services/supabase/groups.ts`
- **Dating Service**: `src/services/supabase/dating.ts`
- **Age Assurance**: `src/services/supabase/ageCheck.ts` & `supabase/functions/age-check`
- **AI Usage Tracking**: `supabase/migrations/20261026000015_thrivefold_ai_usage.sql`

### 2.3 Local AI & Memory Subsystem
- **Native Android Module**: `modules/local-ai/android/src/main/java/expo/modules/localai/LocalAIModule.kt`
- **Native Memory Guard**: `modules/local-ai/android/src/main/java/expo/modules/localai/LlmMemoryGuard.kt`
- **Model Extractor & SHA-256**: `modules/local-ai/android/src/main/java/expo/modules/localai/AssetModelExtractor.kt`
- **TypeScript Native Wrapper**: `modules/local-ai/index.ts`
- **Model Catalog**: `modules/local-ai/src/modelCatalog.ts` (SmolLM2-135M, SmolLM2-360M, Qwen2.5-0.5B, MiniLM)
- **Model Downloader**: `modules/local-ai/src/modelDownloader.ts` (Resumable chunked downloads via `expo-file-system/legacy`)
- **Analytical Memory**: `src/services/local-ai/memory/memoryStore.ts` & `types.ts`
- **Dense Vector Similarity**: `src/services/local-ai/memory/vectorMath.ts`
- **Task Handlers**: `src/services/local-ai/tasks/` (`classification.ts`, `entityExtraction.ts`, `summarization.ts`, `semanticSearch.ts`, `organizationSuggestions.ts`)
- **Safety Circuit Breaker & Task Router**: `src/services/local-ai/orchestration/taskRouter.ts`
- **LangGraph-Compatible Orchestrator**: `src/services/local-ai/orchestration/langGraphOrchestrator.ts`

### 2.4 Live Vision, Pose & Coach
- **Native Vision Module**: `modules/pose-landmarker/android/src/main/java/expo/modules/poselandmarker/PoseCameraView.kt`
- **Landmark Data Types**: `modules/pose-landmarker/index.ts` (`PoseFrame`, `PoseLandmark`, `FACE_GROUPS`, `HAND_BONES`)
- **Live Skia Skeleton**: `src/components/workout/PoseOverlay.tsx`
- **Exercise State Machine**: `src/domain/pose/movement.ts` (Angle calculations, hysteresis, debounce, holds, and rep transitions)
- **Gestures Engine**: `src/domain/pose/gestures.ts` (Hands-free hold, pause, skip, wave detection)
- **Coach Voice Feedback**: `src/domain/pose/coachVoice.ts` (Priority queue: safety > fault > count > praise)
- **Coach Stage Controller**: `src/components/coach/CoachVideoStage.tsx`
- **Coach Session Hook**: `src/components/coach/useCoachSession.ts`
- **Glass HUD & Controls**: `src/components/workout/CoachGlass.tsx`
- **Coach Main Route**: `src/app/(app)/health/coach/[planId].tsx`

---

## 3. Duplication Audit & Resolution Decisions

1. **Backup Source Files Cleaned**:
   - Redundant `.backup.tsx` and `.backup.ts` files scattered across `src/` were relocated to `.local-backups/thrivefold-repair-20261026-202000/src-backups/` and ignored via `.gitignore` to prevent duplicate code compilation and tree pollution.
2. **Deterministic Rules vs LLM**:
   - `src/domain/ai/deterministicRules.ts` remains the canonical clinical safety and load-based routine recommender.
   - Local AI structured tasks (`src/services/local-ai/tasks/`) wrap this deterministic logic as an instantaneous fallback when weights are unmapped.
3. **Single Store Rule**:
   - `useRootStore` remains the sole Zustand store. Redundant local state copies are strictly prohibited.
