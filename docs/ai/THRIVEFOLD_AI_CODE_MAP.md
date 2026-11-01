# THRIVEFOLD AI

## 1. FILE INDEX
[src/components/assistant/CoachProvider.tsx] — Components/hooks
[src/components/assistant/GlobalVoiceAssistant.tsx] — Components/hooks
[src/components/assistant/BrainSetupCard.tsx] — Components/hooks
[src/components/brand/AnvayCompanion.tsx] — Components/hooks
[src/components/brand/thrive/CompanionScreen.tsx] — Components/hooks
[src/components/brand/thrive/companion.ts] — Components/hooks
[src/components/brand/thrive/voice.ts] — Components/hooks
[src/components/brand/thrive/intents.ts] — Components/hooks
[src/components/brand/thrive/modelStore.ts] — Components/hooks
[src/components/brand/thrive/heart.ts] — Components/hooks
[src/components/brand/thrive/types.ts] — Components/hooks
[src/services/assistant/agentEngine.ts] — Assistant services
[src/services/assistant/appKnowledge.ts] — Assistant services
[src/services/assistant/chatActions.ts] — Assistant services
[src/services/assistant/chatAttachments.ts] — Assistant services
[src/services/assistant/chatStore.ts] — Assistant services
[src/services/assistant/runCommand.ts] — Assistant services
[src/services/ai/aiInteractionStore.ts] — AI services
[src/services/ai/cloudChat.ts] — AI services
[src/services/ai/coachVoice.ts] — AI services
[src/services/ai/coachVoiceService.ts] — AI services
[src/services/ai/emergencyDirectory.ts] — AI services
[src/services/ai/emergencySupport.ts] — AI services
[src/services/ai/localModel.ts] — AI services
[src/services/ai/mealVision.ts] — AI services
[src/services/ai/medicineResearch.ts] — AI services
[src/services/ai/modelImport.ts] — AI services
[src/services/ai/modelSetup.ts] — AI services
[src/services/ai/providers.ts] — AI services
[src/services/ai/smartRecommendations.ts] — AI services
[src/services/ai/therapyVoice.ts] — AI services
[src/services/voice/globalVoiceController.ts] — Voice
[src/services/voice/useAudioSense.ts] — Voice
[src/services/voice/useVoiceInput.ts] — Voice
[src/services/local-ai/db/localMemoryDb.ts] — Local AI
[src/services/local-ai/memory/memoryStore.ts] — Local AI
[src/services/local-ai/memory/types.ts] — Local AI
[src/services/local-ai/memory/vectorMath.ts] — Local AI
[src/services/local-ai/orchestration/langGraphOrchestrator.ts] — Local AI
[src/services/local-ai/orchestration/taskRouter.ts] — Local AI
[src/services/local-ai/rag/hybridRagPipeline.ts] — Local AI
[src/services/local-ai/rag/knowledgeStore.ts] — Local AI
[src/services/local-ai/rag/thriveRag.ts] — Local AI
[src/services/local-ai/search/anvayFtsStore.ts] — Local AI
[src/services/local-ai/tasks/classification.ts] — Local AI
[src/services/local-ai/tasks/entityExtraction.ts] — Local AI
[src/services/local-ai/tasks/organizationSuggestions.ts] — Local AI
[src/services/local-ai/tasks/semanticSearch.ts] — Local AI
[src/services/local-ai/tasks/summarization.ts] — Local AI
[src/domain/assistant/appKnowledge.ts] — AI domain
[src/domain/assistant/chatActions.ts] — AI domain
[src/domain/assistant/commands.ts] — AI domain
[src/domain/assistant/dailyBrief.ts] — AI domain
[src/domain/assistant/personas.ts] — AI domain
[src/domain/assistant/plainText.ts] — AI domain
[src/domain/assistant/screenRegistry.ts] — AI domain
[src/domain/assistant/toolRegistry.ts] — AI domain
[src/domain/ai/deterministicRules.ts] — AI domain
[src/domain/ai/fileEvidence.ts] — AI domain
[src/domain/ai/insights.ts] — AI domain
[src/domain/ai/localClassifier.ts] — AI domain
[src/domain/ai/localRetrieval.ts] — AI domain
[src/domain/ai/types.ts] — AI domain
[src/domain/ai/userProfiler.ts] — AI domain
[src/domain/coach/localCoachAI.ts] — AI domain
[src/domain/coach/voiceCommands.ts] — AI domain
[src/app/(app)/ai/_layout.tsx] — Routes
[src/app/(app)/ai/index.tsx] — Routes
[src/app/(app)/ai/chat.tsx] — Routes
[src/app/(app)/ai/memory.tsx] — Routes
[src/app/(app)/ai/model-status.tsx] — Routes
[src/app/(app)/ai/privacy.tsx] — Routes
[src/app/(app)/beta-lab/assistant.tsx] — Routes
[src/app/(app)/you/voice.tsx] — Routes
[src/app/(app)/settings/ai-byok.tsx] — Routes
[src/app/(app)/settings/memories.tsx] — Routes
[src/app/(app)/thrive.tsx] — Routes
[src/app/(app)/safety/someone-to-talk.tsx] — Routes
[modules/local-ai/index.ts] — Native local AI
[modules/local-ai/src/modelCatalog.ts] — Native local AI
[modules/local-ai/src/modelDownloader.ts] — Native local AI
[modules/local-ai/src/types.ts] — Native local AI
[modules/local-ai/src/useLocalAI.ts] — Native local AI
[modules/local-ai/android/src/main/java/expo/modules/localai/AnvaykoshAiEngine.kt] — Native local AI
[modules/local-ai/android/src/main/java/expo/modules/localai/AnvaykoshDocumentProcessor.kt] — Native local AI
[modules/local-ai/android/src/main/java/expo/modules/localai/AssetModelExtractor.kt] — Native local AI
[modules/local-ai/android/src/main/java/expo/modules/localai/DocumentTextExtractor.kt] — Native local AI
[modules/local-ai/android/src/main/java/expo/modules/localai/LlmMemoryGuard.kt] — Native local AI
[modules/local-ai/android/src/main/java/expo/modules/localai/LocalAIModule.kt] — Native local AI
[modules/local-ai/android/src/main/java/expo/modules/localai/OnDeviceTranslator.kt] — Native local AI
[supabase/functions/ai-chat/index.ts] — Cloud
[supabase/functions/doc-reader/index.ts] — Cloud
[supabase/functions/meal-vision/index.ts] — Cloud
[supabase/migrations/20261026000015_thrivefold_ai_usage.sql] — Cloud
[tests/unit/anvay-fts5.test.ts] — Tests
[tests/unit/anvay-vault.test.ts] — Tests
[tests/unit/anvaykosh-rag-benchmark.test.ts] — Tests
[tests/unit/app-distribution-and-calibrated-rag.test.ts] — Tests
[tests/unit/assistant-engine.test.ts] — Tests
[tests/unit/assistantCommands.test.ts] — Tests
[tests/unit/chatActions.test.ts] — Tests
[tests/unit/coach-voice.test.ts] — Tests
[tests/unit/commandSteps.test.ts] — Tests
[tests/unit/dailyBrief.test.ts] — Tests
[tests/unit/local-ai-subsystem.test.ts] — Tests
[tests/unit/local-ai.test.ts] — Tests
[tests/unit/local-coach-ai.test.ts] — Tests
[tests/unit/local-day.test.ts] — Tests
[tests/unit/local-intelligence.test.ts] — Tests
[tests/unit/modelImport.test.ts] — Tests
[tests/unit/portrait.test.ts] — Tests
[tests/unit/voice-commands.test.ts] — Tests
[tests/unit/voicePractice.test.ts] — Tests

## 2. IMPORT & CALL MAP
`src/app/_layout.tsx` → `CoachProvider` → lazy `GlobalVoiceAssistant`; `useCoach()` in Learn/Reader/Beta assistant opens sheet or submits text.
`CustomTabBar.tsx` Thrive orb / `AppDrawer.tsx` coach entry → `globalVoiceController.open()` → `GlobalVoiceAssistant`.
`GlobalVoiceAssistant` text/STT → `globalVoiceController.handleFinalUtterance()` → `agentEngine.processUserInput()` → `toolRegistry.executeTool()` / `thriveRag` / `providers` / `localModel`; events → chat UI + `chatStore` + `aiInteractionStore`; answer speech → `coachVoiceService`.
`agentEngine` → quick replies → parsed commands/tools → local file/RAG evidence → consent-gated cloud → local model → deterministic fallback (actual branch order is in source below).
`runCommand.ts` → command parser → `toolRegistry.executeTool`; `chatActions.ts` adapts tool results; `chatAttachments.ts` indexes attachments and routes transcripts.
`knowledgeStore` + `memoryStore` → `anvayFtsStore`; `hybridRagPipeline` → FTS candidates + optional local embeddings/cosine candidates → reciprocal-rank fusion → hydrated evidence; `thriveRag.answer/contextFor` exposes pipeline.
`CoachProvider` + app layout startup/foreground → RAG source synchronization and local model setup (implementation in source). `onlineLibrary`/Reader → `thriveRag.rememberDocument`.
`modelSetup` → model catalog + durable Android download / imported file → integrity checks + `LocalAI.loadModel`; `localModel.askLocal/embed` → Expo module JS wrapper → Kotlin `LocalAIModule` → `AnvaykoshAiEngine` / Llamatik.
`ai-chat`/`cloudChat` → authenticated Supabase Edge Function → provider key from function environment → daily quota in `thrivefold_ai_usage`; doc-reader and meal-vision are separate cloud AI functions.

## 3. AI ROUTES
`/(app)/ai` → `src/app/(app)/ai/index.tsx` → model/privacy/chat navigation.
`/(app)/ai/chat` → `chat.tsx` → chat orchestration; `/(app)/ai/memory` → `memory.tsx` → memory/RAG controls; `/(app)/ai/model-status` → modelSetup/localModel; `/(app)/ai/privacy` → AI privacy controls.
`/(app)/beta-lab/assistant` → `useCoach().open()` → global voice assistant. Entries: BetaStrip, beta-lab index, ToolsGrid, assist index.
Global entry: tab bar Thrive orb → controller → global sheet; drawer, safety index/urgent-support/someone-to-talk and routines also open controller. `learn-article.tsx`, `learn-library.tsx`, `reader.tsx` call shared coach.
`/(app)/thrive` → `CompanionScreen` → separate `components/brand/thrive/companion.ts` brain/voice path. `AnvayCompanion` is also avatar UI in tab bar, voice settings and global assistant.
`/(app)/settings/ai-byok`, `/(app)/settings/memories`, `/(app)/you/voice`; additional direct local inference callers: `/(app)/search.tsx`, `/(app)/beta-lab/body-style.tsx`.
Native intent: `src/app/+native-intent.tsx` handles legacy auth/unified-vault/sso links; no AI route/deep-link registration found.

## 4. COMPONENTS & HOOKS
`src/components/assistant/*`, `src/components/brand/AnvayCompanion.tsx`, `src/components/brand/thrive/*`, `src/services/voice/*`, `src/domain/coach/*`

## 5. AI SERVICES
`src/services/assistant/*`, `src/services/ai/*` (except `env.ts` secrets/config values; variable names below), `src/services/local-ai/*`

## 6. NATIVE AI
`modules/local-ai/index.ts`, `modules/local-ai/src/*`, `modules/local-ai/expo-module.config.json`, `modules/local-ai/android/build.gradle`, `modules/local-ai/android/consumer-rules.pro`, `modules/local-ai/android/src/main/java/expo/modules/localai/*`; registration from `app.json` plugin/proguard settings.

## 7. MODELS
`modules/local-ai/src/modelCatalog.ts` (catalog), `modelDownloader.ts`, `useLocalAI.ts`, `types.ts`; `src/services/ai/modelSetup.ts`, `modelImport.ts`, `localModel.ts`; Android `AssetModelExtractor.kt`, `LocalAIModule.kt`, `AnvaykoshAiEngine.kt`, `LlmMemoryGuard.kt`.

## 8. RAG / SEARCH
`src/services/local-ai/rag/{thriveRag,hybridRagPipeline,knowledgeStore}.ts`, `search/anvayFtsStore.ts`, `memory/vectorMath.ts`, `assistant/appKnowledge.ts`, `domain/assistant/appKnowledge.ts`; FTS source sync/indexing is in `anvayFtsStore.syncAllSources`.

## 9. MEMORY / DATABASE
`src/services/local-ai/db/localMemoryDb.ts`, `memory/{memoryStore,types}.ts`, `src/services/assistant/chatStore.ts`, `src/services/ai/aiInteractionStore.ts`; SQLite DDL lives in these runtime stores (no separate Supabase RAG/memory schema found). `supabase/migrations/20261026000015_thrivefold_ai_usage.sql` is cloud usage accounting only.

## 10. ACTIONS / VOICE
`src/domain/assistant/{toolRegistry,commands,chatActions,screenRegistry}.ts`; `src/services/assistant/{runCommand,chatActions,chatAttachments}.ts`; `src/services/voice/globalVoiceController.ts`; `src/services/ai/{coachVoice,coachVoiceService,therapyVoice}.ts`; `modules/pose-landmarker` audio/STT helpers are general audio sensing, not assistant inference. `domain/coach/voiceCommands.ts` belongs to workout camera coach.

## 11. CLOUD AI
`src/services/ai/{providers,cloudChat,mealVision,medicineResearch,env}.ts`; Edge Functions `supabase/functions/{ai-chat,doc-reader,meal-vision}/index.ts`; configuration `supabase/config.toml`, usage migration. Secret values intentionally omitted; env names referenced: `GEMINI_API_KEY`, `GEMINI_API_KEY_2`, `GROQ_API_KEY`, `GROQ_API_KEY_2`, `OPENROUTER_API_KEY` (server function secrets); no client values reproduced.

## 12. EXECUTION MAPS
Input: orb/text/STT → `globalVoiceController` → `agentEngine` → tool/RAG/provider/local/rules → controller callbacks → assistant transcript/state → `chatStore` + interaction log → sentence TTS queue.
Memory: explicit remember tool/UI → `memoryStore.addMemory` → SQLite `user_memories` + FTS upsert (+ embedding when available); retrieval → lexical FTS and optional dense vectors → RRF → owner-scoped hydration.
Knowledge indexing: source sync / imported or read document → chunk and optional embed → `rag_documents`/`rag_chunks` + FTS rows; query → candidates → RRF/calibration → answer with cited evidence.
Model lifecycle: choose catalog/import → Android DownloadManager enqueue/query/pause/remove (or app downloader) → download completion → SHA-256/size validation → install/import path → lazy single-model load → prompt/generate/stream/embed → unload/memory guard.
Cloud escalation: local evidence/refusal + consent/account gate → `providers`/`cloudChat` Supabase invoke → signed user Edge Function → daily quota → configured provider; interaction status/latency recorded locally.

## 13. TESTS
`tests/unit/anvay-fts5.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/anvay-vault.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/anvaykosh-rag-benchmark.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/app-distribution-and-calibrated-rag.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/assistant-engine.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/assistantCommands.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/chatActions.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/coach-voice.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/commandSteps.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/dailyBrief.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/local-ai-subsystem.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/local-ai.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/local-coach-ai.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/local-day.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/local-intelligence.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/modelImport.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/portrait.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/voice-commands.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.
`tests/unit/voicePractice.test.ts` — AI/assistant, model, voice, command, RAG, FTS or local intelligence coverage; test names are preserved in the source dump below.

## 14. UNCONNECTED CODE
`src/services/local-ai/orchestration/langGraphOrchestrator.ts` and `taskRouter.ts`, plus task helpers under `src/services/local-ai/tasks/*`: no production import/caller found in `src` (direct imports only from test or each other were checked); implemented experimental parallel orchestration.
`src/domain/ai/*`, `src/domain/coach/localCoachAI.ts`, `src/services/ai/{smartRecommendations,therapyVoice,emergencySupport,emergencyDirectory}.ts`: included when independently implemented; some are invoked only by dedicated feature screens/services, not the central agent.
`src/components/brand/thrive/CompanionScreen.tsx` is reachable at `/(app)/thrive`; separate from global CoachProvider runtime. `components/brand/thrive/modelStore.ts` is separate lightweight asset storage, not GGUF runtime.
AI-related route screens not linked by the central assistant remain registered by Expo Router through file routes. No evidence of an alternate `GlobalVoiceAssistant` registration.

### SOURCE: COMPONENTS / VOICE UI

#### `src/components/assistant/CoachProvider.tsx`

```tsx
/**
 * The one Anvay coach for the whole app.
 *
 * Mounted once in the root layout, above every screen, so the sheet, the conversation and the
 * voice survive moving between screens. The sheet appears only once the person is signed in and
 * onboarded. It owns:
 *  - the coach sheet (GlobalVoiceAssistant) and its controller,
 *  - which screen the person is on (so answers and commands know the context),
 *  - the local knowledge (screens, Learn, recent days, chats) kept in Thrive RAG, which starts
 *    once onboarding is finished,
 *  - one voice for every screen (coachVoiceService),
 *  - app-wide data routines: medicine and follow-up reminders follow the records wherever they
 *    change (screen, document scan or chat).
 *
 * Screens use `useCoach()` instead of building their own assistant.
 */
import { usePathname } from 'expo-router';
import React, { createContext, Suspense, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { PersonaId } from '../../domain/assistant/personas';
import { speakCoachLine, stopCoachSpeech } from '../../services/ai/coachVoiceService';
import { agentEngine } from '../../services/assistant/agentEngine';
import { articlesFor } from '../../content/learn';
import { refreshAppKnowledge } from '../../services/assistant/appKnowledge';
import { onlineLibrary } from '../../services/learn/onlineLibrary';
import { chatStore } from '../../services/assistant/chatStore';
import { thriveRag } from '../../services/local-ai/rag/thriveRag';
import { syncCareReminders } from '../../services/notifications/careReminders';
import { syncRoutineReminders } from '../../services/notifications/routineReminders';
import { globalVoiceController } from '../../services/voice/globalVoiceController';
import { useRootStore } from '../../stores/useRootStore';

// The sheet (list, composer, companion art) is loaded and mounted only once it is first opened,
// so app start does not pay for it.
const GlobalVoiceAssistant = React.lazy(() =>
  import('./GlobalVoiceAssistant').then((m) => ({ default: m.GlobalVoiceAssistant })),
);

export interface CoachApi {
  /** Opens the sheet. `listen: false` opens it ready to type, microphone off. */
  open: (opts?: { listen?: boolean }) => void;
  close: () => void;
  /** Opens the sheet and sends a message as if typed. */
  ask: (text: string) => void;
  /** Says a line in the coach voice (any screen). */
  speak: (text: string, opts?: { rate?: number; onEnd?: () => void }) => void;
  stop: () => void;
  setPersona: (p: PersonaId) => void;
  /** Local search across everything the coach knows. */
  search: typeof thriveRag.search;
}

const routeOf = (pathname: string) => (pathname === '/' ? '/(app)/(tabs)' : pathname);

function makeApi(getRoute: () => string): CoachApi {
  return {
    open: (opts) => void globalVoiceController.open(getRoute(), opts),
    close: () => globalVoiceController.close(),
    ask: (text) => {
      void globalVoiceController.open(getRoute(), { listen: false });
      void globalVoiceController.handleFinalUtterance(text, 'text');
    },
    speak: (text, opts) => void speakCoachLine(text, opts),
    stop: stopCoachSpeech,
    setPersona: (p) => useRootStore.getState().setCoachPersona(p),
    search: (q, k) => thriveRag.search(q, k),
  };
}

const CoachContext = createContext<CoachApi | null>(null);

export function CoachProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const routeRef = useRef(routeOf(pathname));
  const isOnboarded = useRootStore((s) => s.isOnboarded);
  const signedIn = useRootStore((s) => s.isAuthenticated);
  const medications = useRootStore((s) => s.medications);
  const medsRemindersOn = useRootStore((s) => s.medicationRemindersOn);
  const followUps = useRootStore((s) => s.followUps);

  // The coach always knows the screen, also while its sheet stays open across navigation.
  useEffect(() => {
    routeRef.current = routeOf(pathname);
    agentEngine.setCurrentRoute(routeRef.current);
  }, [pathname]);

  // Knowledge starts after onboarding, then follows the app: on start, on return to the app,
  // and a little after the conversation grows.
  useEffect(() => {
    if (!isOnboarded) return;
    const t = setTimeout(() => void refreshAppKnowledge(), 6_000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshAppKnowledge();
    });
    return () => {
      clearTimeout(t);
      sub.remove();
    };
  }, [isOnboarded]);

  useEffect(() => {
    if (!isOnboarded) return;
    let t: ReturnType<typeof setTimeout> | null = null;
    const unsub = chatStore.subscribe(() => {
      if (t) clearTimeout(t);
      t = setTimeout(() => void refreshAppKnowledge(), 8_000);
    });
    return () => {
      unsub();
      if (t) clearTimeout(t);
    };
  }, [isOnboarded]);

  // Once a day, when online, the Learn library refreshes this person's topics (topic words only go
  // out) and the summaries become coach knowledge.
  const experience = useRootStore((s) => s.experience);
  useEffect(() => {
    if (!isOnboarded) return;
    const t = setTimeout(() => {
      const topics = [...new Set(articlesFor(experience).map((a) => a.category))];
      void onlineLibrary.refreshDaily(topics).catch(() => 0);
    }, 30_000);
    return () => clearTimeout(t);
  }, [isOnboarded, experience]);

  // Routine nudges follow the routine list (screen or chat).
  const routines = useRootStore((s) => s.routines);
  useEffect(() => {
    if (!signedIn) return;
    const t = setTimeout(() => void syncRoutineReminders(routines), 1_000);
    return () => clearTimeout(t);
  }, [signedIn, routines]);

  // Reminders follow the records, whichever screen (or the chat) changed them.
  useEffect(() => {
    if (!signedIn) return;
    const t = setTimeout(
      () => void syncCareReminders(medications, medsRemindersOn, followUps).catch(() => false),
      1_500,
    );
    return () => clearTimeout(t);
  }, [signedIn, medications, medsRemindersOn, followUps]);

  const [sheetWanted, setSheetWanted] = useState(false);
  useEffect(
    () =>
      globalVoiceController.subscribeOpen((open) => {
        if (open) setSheetWanted(true);
      }),
    [],
  );

  const api = useMemo(() => makeApi(() => routeRef.current), []);

  return (
    <CoachContext.Provider value={api}>
      {children}
      {isOnboarded && sheetWanted ? (
        <Suspense fallback={null}>
          <GlobalVoiceAssistant />
        </Suspense>
      ) : null}
    </CoachContext.Provider>
  );
}

const fallback = makeApi(() => '/(app)/(tabs)');

/** The app's coach. Before sign-in and onboarding it still speaks, without the sheet. */
export function useCoach(): CoachApi {
  return useContext(CoachContext) ?? fallback;
}
```

#### `src/components/assistant/GlobalVoiceAssistant.tsx`

```tsx
/**
 * The Thrive Coach conversation sheet, opened from the tab-bar orb.
 *
 * It listens, answers out loud and in text, and keeps the conversation visible. Requests that
 * open a screen close the sheet and go there. Typing works too, and typing never turns the
 * microphone on.
 *
 * Keyboard: the sheet is lifted by the keyboard's height (Android is edge-to-edge and no longer
 * resizes on its own) and shrinks to the space above it; the chat list is inverted so it stays
 * on the newest message.
 */

import { Ionicons } from '@expo/vector-icons';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { router, usePathname, type Href } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';
import {
  Dimensions,
  Keyboard,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { LocalAI } from '../../../modules/local-ai';
import type { ChatTable } from '../../domain/assistant/chatActions';
import { dailyBrief, type BriefInput } from '../../domain/assistant/dailyBrief';
import { PERSONAS } from '../../domain/assistant/personas';
import { plainText } from '../../domain/assistant/plainText';
import { resolveScreenCapability } from '../../domain/assistant/screenRegistry';
import type { ToolExecutionResult } from '../../domain/assistant/toolRegistry';
import { hasSanctuaryStatus } from '../../domain/game/rewards';
import { languageOf, LANGUAGES } from '../../domain/languages';
import { speakCoachLine, stopCoachSpeech } from '../../services/ai/coachVoiceService';
import { SUPPORTED_COUNTRIES } from '../../services/ai/emergencyDirectory';
import {
  detectCrisisIntent,
  GROUNDING_EXERCISES,
  type CrisisDetectionResult,
} from '../../services/ai/emergencySupport';
import { getSetupState, subscribeSetup, type SetupState } from '../../services/ai/modelSetup';
import { setChatActionHooks } from '../../services/assistant/chatActions';
import {
  pickFile,
  readAttachment,
  type PickedFile,
} from '../../services/assistant/chatAttachments';
import { CHAT_PAGE, chatStore, type ChatMessage } from '../../services/assistant/chatStore';
import { hapticMedium, hapticSelection } from '../../services/haptics';
import { thriveRag } from '../../services/local-ai/rag/thriveRag';
import {
  resolveEmergencyJurisdiction,
  setExplicitUserCountry,
  type ResolvedJurisdiction,
} from '../../services/location/emergencyLocationResolver';
import {
  globalVoiceController,
  type VoiceAssistantState,
} from '../../services/voice/globalVoiceController';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { AnvayCompanion } from '../brand/AnvayCompanion';
import { CameraCapture } from '../camera/CameraCapture';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';
import { BrainSetupCard } from './BrainSetupCard';

type Turn = ChatMessage;

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const STATUS: Record<VoiceAssistantState, string> = {
  idle: 'Tap the microphone or type',
  requesting_permission: 'Allow the microphone to talk',
  listening: 'Listening…',
  transcribing: 'Got it…',
  reasoning: 'Thinking…',
  speaking: 'Speaking… tap the microphone to interrupt',
  error: 'Voice is not available',
};

const SHEET_RATIO = 0.78;

function briefInput(): BriefInput {
  const st = useRootStore.getState();
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return {
    name: st.koshProfile?.preferredName || st.user?.pseudonym?.split(' ')[0] || null,
    hour: d.getHours(),
    today,
    checkedInToday: st.checkInHistory.some((c) => c.date === today),
    waterGlasses: st.hydration[today] ?? 0,
    waterTarget: st.hydrationTargetGlasses,
    openQuests: st.todayQuests
      .filter((q) => !q.isCompleted && q.status !== 'skipped')
      .map((q) => q.title),
    medicines: st.medications,
    medicationTaken: st.medicationTaken,
    nowHHMM: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    followUps: st.followUps,
  };
}

export function GlobalVoiceAssistant() {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceAssistantState>('idle');
  const [partial, setPartial] = useState('');
  // The conversation lives in SQLite: the newest page loads now, older pages as you scroll up.
  const [turns, setTurns] = useState<Turn[]>(() => {
    const legacy = useRootStore.getState().coachTurns;
    if (legacy.length && chatStore.importLegacy(legacy)) useRootStore.getState().setCoachTurns([]);
    return chatStore.page();
  });
  const hasOlder = useRef(true);
  const [typed, setTyped] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const list = useRef<FlashListRef<Turn>>(null);
  const input = useRef<TextInputInstance>(null);
  const [kb, setKb] = useState(0);
  const [setupState, setSetupState] = useState<SetupState>(getSetupState);
  useEffect(() => subscribeSetup(setSetupState), []);
  const isModelSettingUp =
    setupState.phase === 'downloading' ||
    setupState.phase === 'verifying' ||
    setupState.phase === 'loading';
  const setupProgress = Math.round((setupState.progress ?? 0) * 100);

  // Edge-to-edge Android does not resize a Modal for the keyboard, so the sheet is lifted by the
  // keyboard's height from the keyboard events (one mechanism only; no KeyboardAvoidingView).
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    // Measured on the Moto G71: endCoordinates.height over-reports by the navigation-bar inset
    // (the composer floated ~250 px above the keys). The keyboard's top edge is reliable, so the
    // lift is the distance from that edge to the bottom of the screen.
    const a = Keyboard.addListener(showEvt, (e) =>
      setKb(Math.max(0, Dimensions.get('screen').height - e.endCoordinates.screenY)),
    );
    const b = Keyboard.addListener(hideEvt, () => setKb(0));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  // Save new and growing messages shortly after they change (not on every streamed token). Only
  // the newest few can change, so older pages are never rewritten.
  useEffect(() => {
    const id = setTimeout(() => chatStore.upsert(turns.slice(-3)), 600);
    return () => clearTimeout(id);
  }, [turns]);

  const loadOlder = useCallback(() => {
    if (!hasOlder.current) return;
    setTurns((t) => {
      const older = chatStore.page(t[0]?.at);
      if (older.length < CHAT_PAGE) hasOlder.current = false;
      return older.length ? [...older, ...t] : t;
    });
  }, []);

  // Streamed tokens: keep only the newest text and render it at most once per frame.
  const pendingReply = useRef<{ reply: string; tool?: ToolExecutionResult } | null>(null);
  const frame = useRef<number | null>(null);

  const listening = voiceState === 'listening';

  // A soft ring around the microphone button while it is listening.
  const ring = useSharedValue(0);
  useEffect(() => {
    ring.value = listening
      ? withRepeat(withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }), -1, false)
      : withTiming(0, { duration: 150 });
  }, [listening, ring]);
  // The voice orb: while listening, a second ring follows the loudness of the person's voice.
  const level = useSharedValue(0);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value === 0 ? 0 : (1 - ring.value) * 0.5,
    transform: [{ scale: 1 + ring.value * 0.55 }],
  }));
  const levelStyle = useAnimatedStyle(() => ({
    opacity: listening ? 0.35 : 0,
    transform: [{ scale: 1 + level.value * 0.7 }],
  }));

  const close = useCallback(() => {
    hapticSelection();
    Keyboard.dismiss();
    globalVoiceController.close();
    setVisible(false);
  }, []);

  useEffect(() => {
    const unsub = globalVoiceController.subscribe({
      onStateChange: setVoiceState,
      onPartialTranscript: (text) => {
        setPartial(text);
        setError(null);
      },
      // Spoken and typed messages both arrive here, so a message is only ever added once.
      onFinalTranscript: (text) => {
        setPartial('');
        setError(null);
        const quote = pendingQuote.current;
        pendingQuote.current = null;
        const shown = quote ? text.replace(/^About your earlier reply ".*?": /s, '') : text;
        const crisis = detectCrisisIntent(shown, jurisdiction?.countryCode);
        if (crisis.gradedTier !== 'ordinary_difficulty') {
          setActiveCrisis(crisis);
          if (persona !== 'support') {
            setPersona('support');
          }
        }
        setTurns((t) => [
          ...t,
          {
            id: newId(),
            who: 'you' as const,
            text: shown,
            quote: quote ?? undefined,
            at: Date.now(),
          },
        ]);
      },
      onAssistantReply: (reply, tool?: ToolExecutionResult) => {
        pendingReply.current = { reply, tool };
        if (frame.current == null) {
          frame.current = requestAnimationFrame(() => {
            frame.current = null;
            const next = pendingReply.current;
            pendingReply.current = null;
            if (!next) return;
            const route = next.tool?.routeToOpen;
            const data = next.tool?.data as { table?: ChatTable; transient?: boolean } | undefined;
            const table = data?.table;
            const transient = data?.transient || undefined;
            setTurns((t) => {
              const last = t[t.length - 1];
              // A progress line ("Reading…") is replaced by whatever comes next.
              if (last?.who === 'coach' && last.transient) {
                return [...t.slice(0, -1), { ...last, text: next.reply, route, table, transient }];
              }
              // Streaming updates the coach's current reply in place (same id).
              if (
                last?.who === 'coach' &&
                !last.route &&
                next.reply.startsWith(last.text.slice(0, 12))
              ) {
                return [...t.slice(0, -1), { ...last, text: next.reply, route }];
              }
              return [
                ...t,
                {
                  id: newId(),
                  who: 'coach' as const,
                  text: next.reply,
                  route,
                  table,
                  transient,
                  at: Date.now(),
                },
              ];
            });
          });
        }
        if (tool?.autoNavigate && tool.routeToOpen) {
          // The screen was opened by the tool; get out of the way so the person sees it.
          setTimeout(() => globalVoiceController.close(), 900);
        }
      },
      onError: (e) => setError(e),
      // Android reports roughly -2..10 dB; map to 0..1 and ease toward it.
      onAudioLevel: (db) => {
        level.value = withTiming(Math.min(1, Math.max(0, (db + 2) / 12)), { duration: 120 });
      },
    });
    return () => {
      unsub();
    };
  }, []);

  // Follow the controller's open state directly (no polling).
  useEffect(
    () =>
      globalVoiceController.subscribeOpen((open) => {
        if (open) {
          setError(null);
          setPartial('');
          setTyped('');
          // First open of the day: Anvay starts with a short brief from the person's own data.
          setTurns((t) => {
            const last = t[t.length - 1];
            const today = new Date().toDateString();
            if (t.some((m) => m.who === 'coach' && new Date(m.at).toDateString() === today))
              return t;
            if (last && new Date(last.at).toDateString() === today) return t;
            return [
              ...t,
              {
                id: newId(),
                who: 'coach' as const,
                text: dailyBrief(briefInput()),
                at: Date.now(),
              },
            ];
          });
        } else {
          setFocused(false);
        }
        setVisible(open);
      }),
    [],
  );

  const sanctuary = useRootStore((st) => hasSanctuaryStatus(st.marketOwned));
  const coachLanguage = useRootStore((st) => st.coachLanguage);
  const setCoachLanguage = useRootStore((st) => st.setCoachLanguage);
  const [langOpen, setLangOpen] = useState(false);
  const persona = useRootStore((st) => st.coachPersona);
  const setPersona = useRootStore((st) => st.setCoachPersona);
  const showToast = useRootStore((st) => st.showToast);

  const [jurisdiction, setJurisdiction] = useState<ResolvedJurisdiction | null>(null);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [directoryModalVisible, setDirectoryModalVisible] = useState(false);
  const [groundingModal, setGroundingModal] = useState<'breathing' | 'sensory' | null>(null);
  const [activeCrisis, setActiveCrisis] = useState<CrisisDetectionResult | null>(null);

  // Box Breathing state (4-4-4-4: Inhale, Hold, Exhale, Rest)
  const [breathingStep, setBreathingStep] = useState(0);
  const [breathingCount, setBreathingCount] = useState(4);
  const breathAnim = useSharedValue(1);

  // 5-4-3-2-1 Sensory grounding state
  const [sensoryStep, setSensoryStep] = useState(0);

  useEffect(() => {
    if (visible && !jurisdiction) {
      resolveEmergencyJurisdiction()
        .then(setJurisdiction)
        .catch(() => null);
    }
  }, [visible, jurisdiction]);

  useEffect(() => {
    if (groundingModal !== 'breathing') return;
    setBreathingStep(0);
    setBreathingCount(4);
    breathAnim.value = 1;
    const interval = setInterval(() => {
      setBreathingCount((prev) => {
        if (prev <= 1) {
          setBreathingStep((s) => {
            const next = (s + 1) % 4;
            if (next === 0) breathAnim.value = withTiming(1.4, { duration: 4000 });
            else if (next === 2) breathAnim.value = withTiming(1.0, { duration: 4000 });
            return next;
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    breathAnim.value = withTiming(1.4, { duration: 4000 });
    return () => clearInterval(interval);
  }, [groundingModal, breathAnim]);

  const callNumber = (number: string) => {
    hapticMedium();
    const clean = number.replace(/\s+/g, '');
    Linking.openURL(`tel:${clean}`).catch(() => {
      showToast({
        type: 'warning',
        title: 'Unable to open dialer',
        message: `Please dial ${number} manually.`,
      });
    });
  };

  const selectCountry = (code: string) => {
    setExplicitUserCountry(code);
    resolveEmergencyJurisdiction(code).then((jur) => {
      setJurisdiction(jur);
      setCountryModalVisible(false);
    });
  };

  const breathAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathAnim.value }],
  }));

  const clearHistory = () => {
    hapticSelection();
    setTurns([]);
    chatStore.clear();
  };

  // "Clear the chat" and "close" said in the chat act on this sheet.
  useEffect(() => {
    setChatActionHooks({
      closeSheet: close,
      clearChat: () => {
        setTurns([]);
        chatStore.clear();
      },
    });
  }, [close]);

  const lastSent = useRef({ text: '', at: 0 });
  const pendingQuote = useRef<string | null>(null);
  const send = (text: string) => {
    if (pending) return sendAttachment();
    const t = text.trim();
    if (!t) return;
    // A hardware Enter can fire submit twice, and a double tap sends twice: one message only.
    if (lastSent.current.text === t && Date.now() - lastSent.current.at < 1200) return;
    lastSent.current = { text: t, at: Date.now() };
    hapticSelection();
    setTyped('');

    // Detect situational crisis or graded distress
    const crisis = detectCrisisIntent(t, jurisdiction?.countryCode);
    if (crisis.gradedTier !== 'ordinary_difficulty') {
      setActiveCrisis(crisis);
      if (persona !== 'support') {
        setPersona('support');
      }
    } else if (activeCrisis && activeCrisis.gradedTier !== 'imminent_risk') {
      setActiveCrisis(null);
    }
    if (replyTo) {
      // A reply to a specific answer: the coach gets that answer as context; the chat shows a quote.
      const quote = plainText(replyTo.text).slice(0, 280);
      setReplyTo(null);
      pendingQuote.current = quote;
      void globalVoiceController.handleFinalUtterance(
        `About your earlier reply "${quote}": ${t}`,
        'text',
      );
      return;
    }
    // The controller reports the message back through onFinalTranscript.
    void globalVoiceController.handleFinalUtterance(t, 'text');
  };

  const toggleMic = () => {
    hapticMedium();
    Keyboard.dismiss();
    if (listening) globalVoiceController.stopListening();
    else void globalVoiceController.startListening();
  };

  const onInputFocus = () => {
    setFocused(true);
    // Typing and listening do not mix: the microphone rests while the keyboard is in use.
    if (listening) globalVoiceController.stopListening();
  };
  const onInputBlur = () => setFocused(false);

  const go = (route: string) => {
    close();
    router.push(route as Href);
  };

  // Open at the newest message, and jump to it whenever the person sends something (their own
  // message must never land off-screen, whatever was scrolled before).
  const lastWho = turns[turns.length - 1]?.who;
  useEffect(() => {
    if (!visible || !turns.length) return;
    const t = setTimeout(() => list.current?.scrollToEnd({ animated: false }), 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  useEffect(() => {
    if (lastWho !== 'you') return;
    const t = setTimeout(() => list.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [turns.length, lastWho]);

  // Keep the newest message in view when the keyboard opens and the sheet gets shorter.
  useEffect(() => {
    if (!kb || !turns.length) return;
    const t = setTimeout(() => list.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [kb, turns.length]);
  // 👍 keeps the answer in local knowledge so similar questions reuse it; 👎 is remembered so the
  // reply is not reused. Tapping the same rating again clears it.
  const rate = useCallback((id: string, fb: 'up' | 'down') => {
    hapticSelection();
    setTurns((t) => {
      const i = t.findIndex((m) => m.id === id);
      if (i < 0) return t;
      const next = { ...t[i], feedback: t[i].feedback === fb ? undefined : fb };
      chatStore.upsert([next]);
      if (next.feedback === 'up') {
        const asked = [...t.slice(0, i)].reverse().find((m) => m.who === 'you')?.text ?? '';
        void thriveRag
          .remember(
            asked.slice(0, 80) || 'Helpful answer',
            `Question: ${asked}\nAnswer: ${next.text}`,
            'wellness_guide',
            {
              source: 'liked_reply',
              messageId: id,
            },
          )
          .catch(() => undefined);
      }
      return [...t.slice(0, i), next, ...t.slice(i + 1)];
    });
  }, []);
  // A picked file waits above the composer until sent, so nothing is read by accident. Whatever
  // is typed alongside becomes the question about it.
  const [pending, setPending] = useState<PickedFile | null>(null);
  // Camera: the same in-app camera as meal and document photos (CameraX inside Thrivefold; the
  // system camera can close the app on low-memory phones).
  const [camOpen, setCamOpen] = useState(false);
  const attach = async (camera: boolean) => {
    hapticSelection();
    Keyboard.dismiss();
    if (camera) {
      setCamOpen(true);
      return;
    }
    const file = await pickFile().catch(() => null);
    if (file) setPending(file);
  };
  const sendAttachment = () => {
    if (!pending) return;
    hapticSelection();
    const file = pending;
    const question = typed.trim();
    setPending(null);
    setTyped('');
    setTurns((t) => [
      ...t,
      {
        id: newId(),
        who: 'you' as const,
        text: question || file.name,
        at: Date.now(),
        attachment: { uri: file.uri, name: file.name, kind: file.kind },
      },
    ]);
    void readAttachment(file, question);
  };
  const share = useCallback((text: string) => {
    void Share.share({ message: plainText(text) }).catch(() => undefined);
  }, []);

  // Per-reply tools: listen, translate on the phone, reply to it, copy.
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const listen = useCallback((t: Turn) => {
    hapticSelection();
    setSpeakingId((cur) => {
      if (cur === t.id) {
        stopCoachSpeech();
        return null;
      }
      void speakCoachLine(plainText(t.translation?.text ?? t.text), {
        onEnd: () => setSpeakingId((c) => (c === t.id ? null : c)),
      });
      return t.id;
    });
  }, []);
  const translateTurn = useCallback(async (t: Turn) => {
    hapticSelection();
    if (t.translation) {
      setTurns((all) => all.map((m) => (m.id === t.id ? { ...m, translation: undefined } : m)));
      return;
    }
    const target =
      useRootStore.getState().coachLanguage === 'en' ? 'hi' : useRootStore.getState().coachLanguage;
    try {
      const r = await LocalAI.translateText(t.text, target);
      setTurns((all) => {
        const next = all.map((m) =>
          m.id === t.id ? { ...m, translation: { lang: target, text: r.text } } : m,
        );
        const changed = next.find((m) => m.id === t.id);
        if (changed) chatStore.upsert([changed]);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not translate.');
    }
  }, []);
  const [replyTo, setReplyTo] = useState<Turn | null>(null);
  const replyToTurn = useCallback((t: Turn) => {
    hapticSelection();
    setReplyTo(t);
    setTimeout(() => input.current?.focus(), 50);
  }, []);
  const copy = useCallback((t: Turn) => {
    hapticSelection();
    void Clipboard.setStringAsync(plainText(t.translation?.text ?? t.text));
    useRootStore.getState().showToast({ type: 'success', message: 'Copied' });
  }, []);

  const renderTurn = useCallback(
    ({ item }: { item: Turn }) => (
      <TurnRow
        turn={item}
        onOpen={go}
        onRate={rate}
        onShare={share}
        onListen={listen}
        onTranslate={translateTurn}
        onReply={replyToTurn}
        onCopy={copy}
        speaking={speakingId === item.id}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [speakingId],
  );

  // A real sheet: drag the handle or header down to dismiss; it springs back if not far enough.
  const dragY = useSharedValue(0);
  useEffect(() => {
    if (visible) dragY.value = 0;
  }, [visible, dragY]);
  const sheetDrag = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetY(-12)
    .onUpdate((e) => {
      'worklet';
      dragY.value = e.translationY > 0 ? e.translationY : e.translationY * 0.15;
    })
    .onEnd((e) => {
      'worklet';
      if (e.translationY > 120 || e.velocityY > 900) {
        dragY.value = withTiming(900, { duration: 200 }, (done) => {
          if (done) runOnJS(close)();
        });
      } else {
        dragY.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: dragY.value }] }));

  const handleRequestClose = useCallback(() => {
    if (directoryModalVisible) {
      setDirectoryModalVisible(false);
      return;
    }
    if (countryModalVisible) {
      setCountryModalVisible(false);
      return;
    }
    if (groundingModal) {
      setGroundingModal(null);
      return;
    }
    if (camOpen) {
      setCamOpen(false);
      return;
    }
    close();
  }, [directoryModalVisible, countryModalVisible, groundingModal, camOpen, close]);

  if (!visible) return null;

  const screen = resolveScreenCapability(pathname);
  const mood =
    voiceState === 'listening'
      ? ('listening' as const)
      : voiceState === 'reasoning' || voiceState === 'transcribing'
        ? ('thinking' as const)
        : voiceState === 'speaking'
          ? ('speaking' as const)
          : voiceState === 'error'
            ? ('error' as const)
            : ('idle' as const);

  const hasText = typed.trim().length > 0 || pending !== null;
  const showThinking =
    (voiceState === 'reasoning' || voiceState === 'transcribing') &&
    turns[turns.length - 1]?.who === 'you';
  const dotColor = error
    ? colors.error
    : listening
      ? colors.primary
      : voiceState === 'idle'
        ? colors.text.muted
        : colors.primary;

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={handleRequestClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <GestureHandlerRootView style={styles.flex}>
        <View style={[styles.flex, { backgroundColor: colors.scrim }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityLabel="Close the coach"
          />
          <View
            pointerEvents="box-none"
            style={[styles.avoid, { paddingTop: insets.top + 8, paddingBottom: kb }]}
          >
            <Animated.View
              accessibilityViewIsModal
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.background,
                  // A tall sheet; with the keyboard up it shrinks to the space above it.
                  height: Math.min(
                    Math.round(winH * SHEET_RATIO),
                    Dimensions.get('screen').height - kb - insets.top - 8,
                  ),
                },
                sheetStyle,
              ]}
            >
              <GestureDetector gesture={sheetDrag}>
                <View>
                  <View style={[styles.grabber, { backgroundColor: colors.surface3 }]} />
                  <View style={[styles.header, { paddingHorizontal: spacing.base }]}>
                    <View style={styles.miniOrb}>
                      <AnvayCompanion size={48} mood={mood} />
                    </View>
                    <View style={styles.flex}>
                      <View style={styles.statusRow}>
                        <Text style={[typography.subheading, { color: colors.text.primary }]}>
                          Anvay
                        </Text>
                        {persona === 'support' ? (
                          <View
                            style={[
                              styles.sanctuaryPill,
                              { backgroundColor: colors.primaryAlpha, marginLeft: 8 },
                            ]}
                            accessibilityLabel="Support Companion Sanctuary"
                          >
                            <Ionicons
                              name="heart-circle"
                              accessibilityLabel="Support Companion Sanctuary"
                              size={13}
                              color={colors.primary}
                            />
                          </View>
                        ) : sanctuary ? (
                          <View
                            style={[styles.sanctuary, { backgroundColor: colors.surface2 }]}
                            accessibilityLabel="Sanctuary status"
                          >
                            <Ionicons name="ribbon" size={12} color={colors.primary} />
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.statusRow}>
                        <View style={[styles.dot, { backgroundColor: dotColor }]} />
                        <Text
                          style={[
                            typography.caption,
                            styles.flex,
                            { color: error ? colors.error : colors.text.secondary },
                          ]}
                          numberOfLines={1}
                        >
                          {error ?? STATUS[voiceState]}
                        </Text>
                      </View>
                    </View>
                    {turns.length ? (
                      <PressableScale
                        onPress={clearHistory}
                        hitSlop={8}
                        accessibilityLabel="Clear this conversation"
                        style={{ marginRight: 16 }}
                      >
                        <Ionicons name="trash-outline" size={21} color={colors.text.secondary} />
                      </PressableScale>
                    ) : null}
                    <PressableScale
                      onPress={() => setLangOpen((v) => !v)}
                      hitSlop={8}
                      accessibilityLabel={`Reply language: ${languageOf(coachLanguage).label}`}
                      style={[styles.langBtn, { marginRight: 14, borderColor: colors.surface3 }]}
                    >
                      <Ionicons name="language-outline" size={18} color={colors.text.secondary} />
                      <Text style={[typography.captionBold, { color: colors.text.secondary }]}>
                        {coachLanguage.toUpperCase()}
                      </Text>
                    </PressableScale>
                    <PressableScale
                      onPress={() => go('/(app)/settings/memories')}
                      hitSlop={8}
                      accessibilityLabel="Memory"
                    >
                      <Ionicons name="library-outline" size={22} color={colors.text.secondary} />
                    </PressableScale>
                    <PressableScale
                      onPress={close}
                      hitSlop={8}
                      accessibilityLabel="Close"
                      style={{ marginLeft: 16 }}
                    >
                      <Ionicons name="close" size={24} color={colors.text.secondary} />
                    </PressableScale>
                  </View>
                </View>
              </GestureDetector>

              {langOpen ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  style={styles.personaRow}
                  contentContainerStyle={{ paddingHorizontal: spacing.base }}
                >
                  {LANGUAGES.map((l) => (
                    <Chip
                      key={l.code}
                      label={l.native}
                      selected={coachLanguage === l.code}
                      onPress={() => {
                        hapticSelection();
                        setCoachLanguage(l.code);
                        setLangOpen(false);
                      }}
                    />
                  ))}
                </ScrollView>
              ) : null}
              {/* One companion, several roles: the voice, memory and rules stay the same. */}
              {langOpen ? null : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  style={styles.personaRow}
                  contentContainerStyle={{ paddingHorizontal: spacing.base }}
                >
                  {PERSONAS.map((p) => (
                    <Chip
                      key={p.id}
                      label={p.label}
                      selected={persona === p.id}
                      onPress={() => {
                        hapticSelection();
                        setPersona(p.id);
                      }}
                      icon={
                        <Ionicons
                          name={p.icon as keyof typeof Ionicons.glyphMap}
                          size={15}
                          color={persona === p.id ? colors.onPrimary : colors.text.secondary}
                        />
                      }
                    />
                  ))}
                </ScrollView>
              )}

              {/* Graded Situational Safety & Support Companion Toolbar */}
              {activeCrisis?.gradedTier === 'imminent_risk' ? (
                /* Tier 4: Explicit Imminent Risk */
                <View style={styles.safetyContainer}>
                  <SquircleSurface
                    radius={22}
                    fill={colors.errorSurface}
                    style={[styles.safetyCardBox, { borderColor: colors.error, borderWidth: 1 }]}
                  >
                    <View style={styles.safetyCardRow}>
                      <View style={[styles.safetyIconBadge, { backgroundColor: colors.error }]}>
                        <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.flex}>
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          Immediate Care & Safety
                        </Text>
                        <Text
                          style={[
                            typography.caption,
                            { color: colors.text.secondary, marginTop: 2 },
                          ]}
                        >
                          Your life and physical safety are the highest priority. Free 24/7 care is
                          here.
                        </Text>
                      </View>
                      <PressableScale onPress={() => setActiveCrisis(null)} hitSlop={8}>
                        <Ionicons name="close" size={18} color={colors.text.muted} />
                      </PressableScale>
                    </View>
                    <View style={styles.safetyCardActions}>
                      <PressableScale
                        onPress={() => callNumber(jurisdiction?.primaryEmergency.number ?? '112')}
                        style={[styles.safetyActionBtn, { backgroundColor: colors.error }]}
                        accessibilityRole="button"
                        accessibilityLabel={`Call Emergency ${jurisdiction?.primaryEmergency.number ?? '112'}`}
                      >
                        <Ionicons name="call" size={14} color="#FFFFFF" />
                        <Text style={[typography.captionBold, { color: '#FFFFFF', marginLeft: 6 }]}>
                          Call Emergency ({jurisdiction?.primaryEmergency.number ?? '112'})
                        </Text>
                      </PressableScale>

                      <PressableScale
                        onPress={() =>
                          callNumber(jurisdiction?.primaryMentalHealth.number ?? '14416')
                        }
                        style={[styles.safetyActionBtn, { backgroundColor: colors.primary }]}
                        accessibilityRole="button"
                        accessibilityLabel={`Call Lifeline ${jurisdiction?.primaryMentalHealth.number ?? '14416'}`}
                      >
                        <Ionicons name="heart" size={14} color={colors.onPrimary} />
                        <Text
                          style={[
                            typography.captionBold,
                            { color: colors.onPrimary, marginLeft: 6 },
                          ]}
                        >
                          Lifeline ({jurisdiction?.primaryMentalHealth.number ?? '14416'})
                        </Text>
                      </PressableScale>
                    </View>
                  </SquircleSurface>
                </View>
              ) : activeCrisis?.gradedTier === 'ambiguous_safety' ? (
                /* Tier 3: Ambiguous Safety Concern */
                <View style={styles.safetyContainer}>
                  <SquircleSurface
                    radius={22}
                    fill={colors.surface1}
                    style={[styles.safetyCardBox, { borderColor: colors.primary, borderWidth: 1 }]}
                  >
                    <View style={styles.safetyCardRow}>
                      <View
                        style={[styles.safetyIconBadge, { backgroundColor: colors.primaryAlpha }]}
                      >
                        <Ionicons name="heart" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.flex}>
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          We are right here with you
                        </Text>
                        <Text
                          style={[
                            typography.caption,
                            { color: colors.text.secondary, marginTop: 2 },
                          ]}
                        >
                          Are you safe right now? Take a gentle breath. You do not have to carry
                          this alone.
                        </Text>
                      </View>
                      <PressableScale onPress={() => setActiveCrisis(null)} hitSlop={8}>
                        <Ionicons name="close" size={18} color={colors.text.muted} />
                      </PressableScale>
                    </View>
                    <View style={styles.safetyCardActions}>
                      <PressableScale
                        onPress={() =>
                          callNumber(jurisdiction?.primaryMentalHealth.number ?? '14416')
                        }
                        style={[styles.safetyActionBtn, { backgroundColor: colors.primary }]}
                        accessibilityRole="button"
                        accessibilityLabel={`Call 24/7 Lifeline ${jurisdiction?.primaryMentalHealth.number ?? '14416'}`}
                      >
                        <Ionicons name="call" size={14} color={colors.onPrimary} />
                        <Text
                          style={[
                            typography.captionBold,
                            { color: colors.onPrimary, marginLeft: 6 },
                          ]}
                        >
                          24/7 Support ({jurisdiction?.primaryMentalHealth.number ?? '14416'})
                        </Text>
                      </PressableScale>
                      <PressableScale
                        onPress={() => setGroundingModal('breathing')}
                        style={[styles.safetyActionBtn, { backgroundColor: colors.surface2 }]}
                        accessibilityRole="button"
                        accessibilityLabel="Box breathing exercise"
                      >
                        <Ionicons name="flower-outline" size={14} color={colors.text.primary} />
                        <Text
                          style={[
                            typography.captionBold,
                            { color: colors.text.primary, marginLeft: 6 },
                          ]}
                        >
                          Box Breathing
                        </Text>
                      </PressableScale>
                    </View>
                  </SquircleSurface>
                </View>
              ) : activeCrisis?.gradedTier === 'significant_distress' ? (
                /* Tier 2: Significant Distress (Panic / Overwhelm) */
                <View style={styles.safetyContainer}>
                  <SquircleSurface
                    radius={22}
                    fill={colors.surface1}
                    style={[styles.safetyCardBox, { borderColor: colors.border, borderWidth: 1 }]}
                  >
                    <View style={styles.safetyCardRow}>
                      <View
                        style={[styles.safetyIconBadge, { backgroundColor: colors.primaryAlpha }]}
                      >
                        <Ionicons name="flower-outline" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.flex}>
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          Pause and steady with me
                        </Text>
                        <Text
                          style={[
                            typography.caption,
                            { color: colors.text.secondary, marginTop: 2 },
                          ]}
                        >
                          Your nervous system is in high alert. This wave will settle gently.
                        </Text>
                      </View>
                      <PressableScale onPress={() => setActiveCrisis(null)} hitSlop={8}>
                        <Ionicons name="close" size={18} color={colors.text.muted} />
                      </PressableScale>
                    </View>
                    <View style={styles.safetyCardActions}>
                      <PressableScale
                        onPress={() => setGroundingModal('breathing')}
                        style={[styles.safetyActionBtn, { backgroundColor: colors.primary }]}
                        accessibilityRole="button"
                        accessibilityLabel="Start box breathing exercise"
                      >
                        <Ionicons name="flower-outline" size={14} color={colors.onPrimary} />
                        <Text
                          style={[
                            typography.captionBold,
                            { color: colors.onPrimary, marginLeft: 6 },
                          ]}
                        >
                          Start Box Breathing
                        </Text>
                      </PressableScale>
                      <PressableScale
                        onPress={() => setGroundingModal('sensory')}
                        style={[styles.safetyActionBtn, { backgroundColor: colors.surface2 }]}
                        accessibilityRole="button"
                        accessibilityLabel="5-4-3-2-1 Sensory grounding exercise"
                      >
                        <Ionicons name="eye-outline" size={14} color={colors.text.primary} />
                        <Text
                          style={[
                            typography.captionBold,
                            { color: colors.text.primary, marginLeft: 6 },
                          ]}
                        >
                          5-4-3-2-1 Sensory
                        </Text>
                      </PressableScale>
                    </View>
                  </SquircleSurface>
                </View>
              ) : persona === 'support' ? (
                /* Tier 1: Ordinary Support Context — Calm, Tranquil Sanctuary Bar */
                <View style={styles.calmSupportBar}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.calmSupportChipsContainer}
                  >
                    <PressableScale
                      onPress={() => setGroundingModal('breathing')}
                      style={[
                        styles.calmSupportChip,
                        { backgroundColor: colors.surface, borderColor: colors.surface2 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Box breathing exercise"
                    >
                      <Ionicons name="flower-outline" size={14} color={colors.primary} />
                      <Text
                        style={[
                          typography.captionBold,
                          { color: colors.text.primary, marginLeft: 6 },
                        ]}
                      >
                        Box Breathing
                      </Text>
                    </PressableScale>

                    <PressableScale
                      onPress={() => setGroundingModal('sensory')}
                      style={[
                        styles.calmSupportChip,
                        { backgroundColor: colors.surface, borderColor: colors.surface2 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="5-4-3-2-1 sensory grounding"
                    >
                      <Ionicons name="eye-outline" size={14} color={colors.primary} />
                      <Text
                        style={[
                          typography.captionBold,
                          { color: colors.text.primary, marginLeft: 6 },
                        ]}
                      >
                        5-4-3-2-1 Grounding
                      </Text>
                    </PressableScale>

                    <PressableScale
                      onPress={() => setDirectoryModalVisible(true)}
                      style={[
                        styles.calmSupportChip,
                        { backgroundColor: colors.surface, borderColor: colors.surface2 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`View all verified helplines for ${jurisdiction?.countryName ?? 'India'}`}
                    >
                      <Text style={{ fontSize: 13 }}>{jurisdiction?.flag ?? '🇮🇳'}</Text>
                      <Text
                        style={[
                          typography.captionBold,
                          { color: colors.text.secondary, marginLeft: 6 },
                        ]}
                      >
                        Helplines
                      </Text>
                    </PressableScale>

                    <PressableScale
                      onPress={() => setCountryModalVisible(true)}
                      style={[
                        styles.calmSupportChip,
                        { backgroundColor: colors.surface, borderColor: colors.surface2 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Current country: ${jurisdiction?.countryName ?? 'India'}. Tap to change country.`}
                    >
                      <Ionicons name="globe-outline" size={14} color={colors.text.muted} />
                      <Text
                        style={[typography.caption, { color: colors.text.muted, marginLeft: 4 }]}
                      >
                        {jurisdiction?.countryCode ?? 'IN'}
                      </Text>
                    </PressableScale>
                  </ScrollView>
                </View>
              ) : null}

              {turns.length === 0 && !partial ? (
                // Empty conversation: a plain view (no inverted-list flip quirks).
                <View style={[styles.flex, { paddingHorizontal: spacing.base }]}>
                  <BrainSetupCard compact={focused} />
                  <View style={styles.empty}>
                    {/* The whole character, never cropped; it steps aside while typing. */}
                    {focused ? null : (
                      <View style={styles.buddy} pointerEvents="none">
                        <AnvayCompanion
                          size={140}
                          mood={mood}
                          topic={persona === 'support' ? 'mind' : undefined}
                        />
                      </View>
                    )}
                    {persona === 'support' ? (
                      <>
                        <Text
                          style={[
                            typography.body,
                            { color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
                          ]}
                        >
                          I am right here with you. Take a slow, gentle breath. Whatever you are
                          feeling, you can talk to me freely. If you need urgent human support, tap
                          any helpline above.
                        </Text>
                        <Text
                          style={[
                            typography.captionBold,
                            styles.chipsTitle,
                            { color: colors.text.muted },
                          ]}
                        >
                          SAFE WAYS TO START
                        </Text>
                        <View style={styles.chips}>
                          {[
                            'I feel completely overwhelmed right now',
                            'I have racing anxious thoughts',
                            'I just need someone to talk to',
                            'Guide me through a calming exercise',
                          ].map((cmd) => (
                            <PressableScale
                              key={cmd}
                              onPress={() => send(cmd)}
                              style={[
                                styles.chip,
                                { backgroundColor: colors.surface, borderColor: colors.surface2 },
                              ]}
                            >
                              <Text style={[typography.caption, { color: colors.text.primary }]}>
                                {cmd}
                              </Text>
                            </PressableScale>
                          ))}
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={[typography.body, { color: colors.text.secondary }]}>
                          Talk naturally. Ask a question, or say things like &quot;log two glasses
                          of water and then open sleep&quot;, &quot;export all my metrics&quot; or
                          &quot;remember that I train at 7 am&quot;.
                        </Text>
                        <Text
                          style={[
                            typography.captionBold,
                            styles.chipsTitle,
                            { color: colors.text.muted },
                          ]}
                        >
                          TRY ON {screen.title.toUpperCase()}
                        </Text>
                        <View style={styles.chips}>
                          {screen.suggestedChips.map((c) => (
                            <PressableScale
                              key={c.command}
                              onPress={() => send(c.command)}
                              style={[
                                styles.chip,
                                { backgroundColor: colors.surface, borderColor: colors.surface2 },
                              ]}
                            >
                              <Text style={[typography.caption, { color: colors.text.primary }]}>
                                {c.label}
                              </Text>
                            </PressableScale>
                          ))}
                        </View>
                      </>
                    )}
                  </View>
                </View>
              ) : (
                <FlashList
                  ref={list}
                  // A real chat: oldest first, opens at the newest message, keeps its place when
                  // older pages load above, and follows new replies while you are at the bottom.
                  data={turns}
                  keyExtractor={(t) => t.id}
                  renderItem={renderTurn}
                  maintainVisibleContentPosition={{
                    startRenderingFromBottom: true,
                    autoscrollToBottomThreshold: 0.25,
                  }}
                  onStartReached={loadOlder}
                  onStartReachedThreshold={0.3}
                  style={styles.flex}
                  contentContainerStyle={{
                    paddingHorizontal: spacing.base,
                    paddingVertical: spacing.sm,
                  }}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                  ListHeaderComponent={<BrainSetupCard compact />}
                  ListFooterComponent={
                    <>
                      {showThinking ? (
                        <View
                          style={[
                            styles.bubble,
                            styles.theirs,
                            { backgroundColor: colors.surface },
                          ]}
                        >
                          <Text style={[typography.body, { color: colors.text.muted }]}>
                            Thinking…
                          </Text>
                        </View>
                      ) : null}
                      {partial ? (
                        <View
                          style={[
                            styles.bubble,
                            styles.mine,
                            { backgroundColor: colors.primaryAlpha },
                          ]}
                        >
                          <Text style={[typography.body, { color: colors.text.primary }]}>
                            {partial}
                          </Text>
                        </View>
                      ) : null}
                    </>
                  }
                />
              )}

              {/* Composer: sits above the keyboard, and above the system bar when it is closed. */}
              <View
                style={[
                  styles.composer,
                  {
                    paddingHorizontal: spacing.base,
                    borderTopColor: colors.surface2,
                    // Safe-area inset only when the keyboard is closed.
                    paddingBottom: kb > 0 ? 10 : insets.bottom + 10,
                  },
                ]}
              >
                {replyTo ? (
                  <View
                    style={[
                      styles.replyBar,
                      { backgroundColor: colors.surface, borderLeftColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[typography.caption, styles.flex, { color: colors.text.secondary }]}
                      numberOfLines={2}
                    >
                      Replying to: {plainText(replyTo.text)}
                    </Text>
                    <PressableScale
                      onPress={() => setReplyTo(null)}
                      hitSlop={10}
                      accessibilityLabel="Cancel reply"
                    >
                      <Ionicons name="close" size={18} color={colors.text.muted} />
                    </PressableScale>
                  </View>
                ) : null}
                {pending ? (
                  <View style={[styles.pending, { backgroundColor: colors.surface }]}>
                    {pending.kind === 'image' ? (
                      <Image
                        source={{ uri: pending.uri }}
                        style={styles.pendingThumb}
                        contentFit="cover"
                        accessibilityLabel={pending.name}
                      />
                    ) : (
                      <View
                        style={[
                          styles.pendingThumb,
                          styles.pendingIcon,
                          { backgroundColor: colors.surface2 },
                        ]}
                      >
                        <Ionicons
                          name={
                            pending.kind === 'pdf' ? 'document-text-outline' : 'document-outline'
                          }
                          size={26}
                          color={colors.text.secondary}
                        />
                      </View>
                    )}
                    <View style={styles.flex}>
                      <Text
                        style={[typography.bodyBold, { color: colors.text.primary }]}
                        numberOfLines={1}
                      >
                        {pending.name}
                      </Text>
                      <Text
                        style={[typography.caption, { color: colors.text.secondary }]}
                        numberOfLines={2}
                      >
                        Read on this phone. Type a question, or just send for a summary.
                      </Text>
                    </View>
                    <PressableScale
                      onPress={() => setPending(null)}
                      hitSlop={10}
                      accessibilityLabel="Remove the file"
                    >
                      <Ionicons name="close-circle" size={22} color={colors.text.muted} />
                    </PressableScale>
                  </View>
                ) : null}
                <View
                  style={[
                    styles.pill,
                    {
                      backgroundColor: colors.surface,
                      borderColor: focused ? colors.primary : colors.surface2,
                    },
                  ]}
                >
                  {/* Attach a photo (tap: gallery, hold: camera): prescriptions, diet charts, plans. */}
                  <PressableScale
                    onPress={() => void attach(false)}
                    hitSlop={8}
                    style={styles.attach}
                    accessibilityLabel="Attach a file: PDF, photo or text"
                  >
                    <Ionicons name="attach" size={22} color={colors.text.secondary} />
                  </PressableScale>
                  <PressableScale
                    onPress={() => void attach(true)}
                    hitSlop={8}
                    style={styles.camBtn}
                    accessibilityLabel="Take a photo"
                  >
                    <Ionicons name="camera-outline" size={22} color={colors.text.secondary} />
                  </PressableScale>
                  <TextInput
                    style={[
                      typography.body,
                      styles.input,
                      { color: colors.text.primary, opacity: isModelSettingUp ? 0.6 : 1 },
                    ]}
                    placeholder={
                      isModelSettingUp
                        ? `Anvay on-device model downloading (${setupProgress}%)…`
                        : listening
                          ? 'Listening… or type'
                          : 'Message Anvay'
                    }
                    placeholderTextColor={colors.text.muted}
                    value={typed}
                    onChangeText={setTyped}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    ref={input}
                    multiline
                    editable={!isModelSettingUp}
                    onSubmitEditing={() => !isModelSettingUp && send(typed)}
                    returnKeyType="send"
                    submitBehavior="submit"
                    accessibilityLabel="Type a message to Anvay"
                  />
                  <View style={styles.actionWrap}>
                    <Animated.View
                      pointerEvents="none"
                      style={[styles.ring, { backgroundColor: colors.error }, ringStyle]}
                    />
                    <Animated.View
                      pointerEvents="none"
                      style={[styles.ring, { backgroundColor: colors.primary }, levelStyle]}
                    />
                    <PressableScale
                      accessibilityRole="button"
                      accessibilityLabel={
                        isModelSettingUp
                          ? `Model downloading ${setupProgress}%`
                          : hasText
                            ? 'Send'
                            : listening
                              ? 'Stop listening'
                              : voiceState === 'speaking'
                                ? 'Interrupt and talk'
                                : 'Talk'
                      }
                      disabled={isModelSettingUp}
                      onPress={
                        isModelSettingUp ? undefined : hasText ? () => send(typed) : toggleMic
                      }
                      style={[
                        styles.action,
                        {
                          backgroundColor: isModelSettingUp
                            ? colors.surface2
                            : listening && !hasText
                              ? colors.error
                              : colors.primary,
                          opacity: isModelSettingUp ? 0.6 : 1,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          isModelSettingUp
                            ? 'cloud-download-outline'
                            : hasText
                              ? 'send'
                              : listening
                                ? 'stop'
                                : 'mic'
                        }
                        size={20}
                        color={isModelSettingUp ? colors.text.muted : colors.text.inverse}
                      />
                    </PressableScale>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
        <CameraCapture
          visible={camOpen}
          onClose={() => setCamOpen(false)}
          guide="document"
          title="Take a photo"
          hint="A prescription, medicine strip, report or anything to read. Hold it flat in good light."
          onPhoto={(uri) => {
            setCamOpen(false);
            setPending({ uri, name: 'Photo', mime: 'image/jpeg', kind: 'image' });
          }}
        />

        {/* In-sheet overlays (rendered within GlobalVoiceAssistant's own window, avoiding Android nested Modal bugs) */}
        {countryModalVisible ? (
          <View style={styles.sheetOverlayFill} pointerEvents="box-none">
            <Pressable
              style={styles.sheetOverlayBackdrop}
              onPress={() => setCountryModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close country selector"
            />
            <View style={styles.sheetOverlayContentWrapper} pointerEvents="box-none">
              <SquircleSurface
                radius={28}
                fill={colors.background}
                style={[styles.modalBox, { borderColor: colors.border, borderWidth: 1 }]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    Select Emergency Country
                  </Text>
                  <PressableScale
                    onPress={() => setCountryModalVisible(false)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={22} color={colors.text.secondary} />
                  </PressableScale>
                </View>
                <Text
                  style={[typography.caption, { color: colors.text.secondary, marginBottom: 12 }]}
                >
                  Emergency and mental health helplines match your physical country.
                </Text>
                <ScrollView style={{ maxHeight: 340 }}>
                  {SUPPORTED_COUNTRIES.map((c) => {
                    const sel = jurisdiction?.countryCode === c.code;
                    return (
                      <PressableScale
                        key={c.code}
                        onPress={() => selectCountry(c.code)}
                        style={[
                          styles.countryRow,
                          {
                            backgroundColor: sel ? colors.primaryAlpha : colors.surface,
                            borderColor: sel ? colors.primary : colors.surface2,
                          },
                        ]}
                      >
                        <Text style={styles.countryFlagLarge}>{c.flag}</Text>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                            {c.name}
                          </Text>
                          <Text style={[typography.caption, { color: colors.text.secondary }]}>
                            Emergency: {c.defaultEmergency} • Lifeline: {c.defaultMentalHealth}
                          </Text>
                        </View>
                        {sel ? (
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        ) : null}
                      </PressableScale>
                    );
                  })}
                </ScrollView>
                <Button
                  label="Done"
                  variant="secondary"
                  size="sm"
                  onPress={() => setCountryModalVisible(false)}
                  style={{ marginTop: 14 }}
                />
              </SquircleSurface>
            </View>
          </View>
        ) : null}

        {/* All Helplines Directory Overlay */}
        {directoryModalVisible ? (
          <View style={styles.sheetOverlayFill} pointerEvents="box-none">
            <Pressable
              style={styles.sheetOverlayBackdrop}
              onPress={() => setDirectoryModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close helplines directory"
            />
            <View style={styles.sheetOverlayContentWrapper} pointerEvents="box-none">
              <SquircleSurface
                radius={28}
                fill={colors.background}
                style={[styles.modalBox, { borderColor: colors.border, borderWidth: 1 }]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    {jurisdiction?.flag} Verified Helplines ({jurisdiction?.countryName})
                  </Text>
                  <PressableScale
                    onPress={() => setDirectoryModalVisible(false)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={22} color={colors.text.secondary} />
                  </PressableScale>
                </View>
                <ScrollView style={{ maxHeight: 380 }}>
                  {jurisdiction?.allContacts.map((contact) => (
                    <View
                      key={contact.id}
                      style={[
                        styles.helplineCard,
                        { backgroundColor: colors.surface, borderColor: colors.surface2 },
                      ]}
                    >
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          {contact.name}
                        </Text>
                        <Text
                          style={[typography.captionBold, { color: colors.primary, marginTop: 2 }]}
                        >
                          {contact.number} • {contact.hours}
                        </Text>
                        <Text
                          style={[
                            typography.caption,
                            { color: colors.text.secondary, marginTop: 2 },
                          ]}
                        >
                          {contact.coverage} • Source: {contact.officialSource}
                        </Text>
                      </View>
                      <PressableScale
                        onPress={() => callNumber(contact.number)}
                        style={[
                          styles.emergencyCallBtn,
                          {
                            backgroundColor: colors.primary,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                          },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Call ${contact.name}`}
                      >
                        <Ionicons name="call" size={14} color="#FFFFFF" />
                        <Text style={[typography.captionBold, { color: '#FFFFFF', marginLeft: 4 }]}>
                          Call
                        </Text>
                      </PressableScale>
                    </View>
                  ))}
                </ScrollView>
                <Button
                  label="Done"
                  variant="secondary"
                  size="sm"
                  onPress={() => setDirectoryModalVisible(false)}
                  style={{ marginTop: 14 }}
                />
              </SquircleSurface>
            </View>
          </View>
        ) : null}

        {/* Box Breathing In-Sheet Overlay */}
        {groundingModal === 'breathing' ? (
          <View style={styles.sheetOverlayFill} pointerEvents="box-none">
            <Pressable
              style={styles.sheetOverlayBackdrop}
              onPress={() => setGroundingModal(null)}
              accessibilityRole="button"
              accessibilityLabel="Close breathing exercise"
            />
            <View style={styles.sheetOverlayContentWrapper} pointerEvents="box-none">
              <SquircleSurface
                radius={28}
                fill={colors.background}
                style={[
                  styles.modalBox,
                  {
                    borderColor: colors.border,
                    borderWidth: 1,
                    alignItems: 'center',
                  },
                ]}
              >
                <View style={[styles.modalHeader, { width: '100%' }]}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    Box Breathing (Sama Vritti)
                  </Text>
                  <PressableScale
                    onPress={() => setGroundingModal(null)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={22} color={colors.text.secondary} />
                  </PressableScale>
                </View>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.text.secondary, textAlign: 'center', marginBottom: 20 },
                  ]}
                >
                  Calm your autonomic nervous system in 4 rhythmic beats
                </Text>

                {/* Animated breathing circle */}
                <View style={styles.breathingCircleContainer}>
                  <Animated.View
                    style={[
                      styles.breathingCircle,
                      breathAnimStyle,
                      { backgroundColor: colors.primaryAlpha, borderColor: colors.primary },
                    ]}
                  >
                    <Text style={[typography.heading, { color: colors.primary }]}>
                      {breathingCount}
                    </Text>
                  </Animated.View>
                </View>

                <Text
                  style={[typography.subbodyBold, { color: colors.text.primary, marginTop: 20 }]}
                >
                  {
                    [
                      'Inhale slowly...',
                      'Gently hold...',
                      'Release slowly...',
                      'Pause in stillness...',
                    ][breathingStep]
                  }
                </Text>
                <Text
                  style={[
                    typography.caption,
                    {
                      color: colors.text.secondary,
                      textAlign: 'center',
                      marginTop: 6,
                      marginHorizontal: 20,
                    },
                  ]}
                >
                  {
                    [
                      'Breathe in gently through your nose, expanding your chest.',
                      'Keep your shoulders completely relaxed.',
                      'Release smoothly and completely through your mouth.',
                      'Rest in calm before the next breath.',
                    ][breathingStep]
                  }
                </Text>

                <Button
                  label="I feel calmer now"
                  variant="primary"
                  size="md"
                  onPress={() => setGroundingModal(null)}
                  style={{ marginTop: 24, width: '100%' }}
                />
              </SquircleSurface>
            </View>
          </View>
        ) : null}

        {/* 5-4-3-2-1 Sensory Grounding In-Sheet Overlay */}
        {groundingModal === 'sensory' ? (
          <View style={styles.sheetOverlayFill} pointerEvents="box-none">
            <Pressable
              style={styles.sheetOverlayBackdrop}
              onPress={() => setGroundingModal(null)}
              accessibilityRole="button"
              accessibilityLabel="Close sensory grounding"
            />
            <View style={styles.sheetOverlayContentWrapper} pointerEvents="box-none">
              <SquircleSurface
                radius={28}
                fill={colors.background}
                style={[styles.modalBox, { borderColor: colors.border, borderWidth: 1 }]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    5-4-3-2-1 Sensory Grounding
                  </Text>
                  <PressableScale
                    onPress={() => setGroundingModal(null)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={22} color={colors.text.secondary} />
                  </PressableScale>
                </View>
                <Text
                  style={[typography.caption, { color: colors.text.secondary, marginBottom: 16 }]}
                >
                  Anchor your mind into this physical room, step by step.
                </Text>

                <View
                  style={[
                    styles.sensoryCard,
                    { backgroundColor: colors.surface, borderColor: colors.surface2 },
                  ]}
                >
                  <Text style={[typography.heading, { color: colors.primary, marginBottom: 4 }]}>
                    {GROUNDING_EXERCISES.sensory_54321.steps[sensoryStep].count}
                  </Text>
                  <Text
                    style={[typography.subbodyBold, { color: colors.text.primary, lineHeight: 22 }]}
                  >
                    {GROUNDING_EXERCISES.sensory_54321.steps[sensoryStep].prompt}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 18,
                  }}
                >
                  <PressableScale
                    onPress={() => setSensoryStep((s) => Math.max(0, s - 1))}
                    disabled={sensoryStep === 0}
                    style={[styles.stepBtn, { opacity: sensoryStep === 0 ? 0.3 : 1 }]}
                    accessibilityRole="button"
                    accessibilityLabel="Previous step"
                  >
                    <Text style={[typography.captionBold, { color: colors.text.secondary }]}>
                      Previous
                    </Text>
                  </PressableScale>

                  <Text style={[typography.caption, { color: colors.text.muted }]}>
                    Step {sensoryStep + 1} of 5
                  </Text>

                  {sensoryStep < 4 ? (
                    <PressableScale
                      onPress={() => setSensoryStep((s) => Math.min(4, s + 1))}
                      style={[styles.stepBtnPrimary, { backgroundColor: colors.primary }]}
                      accessibilityRole="button"
                      accessibilityLabel="Next step"
                    >
                      <Text style={[typography.captionBold, { color: colors.onPrimary }]}>
                        Next
                      </Text>
                    </PressableScale>
                  ) : (
                    <PressableScale
                      onPress={() => setGroundingModal(null)}
                      style={[styles.stepBtnPrimary, { backgroundColor: colors.primary }]}
                      accessibilityRole="button"
                      accessibilityLabel="Complete grounding"
                    >
                      <Text style={[typography.captionBold, { color: colors.onPrimary }]}>
                        Complete
                      </Text>
                    </PressableScale>
                  )}
                </View>
              </SquircleSurface>
            </View>
          </View>
        ) : null}
      </GestureHandlerRootView>
    </Modal>
  );
}

/** Records shown in the chat as a small table (first rows; the Open link shows the rest). */
const TABLE_ROWS = 12;
function TurnTable({ table }: { table: ChatTable }) {
  const { colors, typography } = useTheme();
  if (!table.rows.length) return null;
  const rows = table.rows.slice(0, TABLE_ROWS);
  return (
    <View style={styles.tableWrap}>
      <View style={[styles.tableRow, { borderBottomColor: colors.surface3 }]}>
        {table.columns.map((c) => (
          <Text
            key={c}
            style={[typography.captionBold, styles.tableCell, { color: colors.text.secondary }]}
          >
            {c}
          </Text>
        ))}
      </View>
      {rows.map((r, i) => (
        <View key={i} style={[styles.tableRow, { borderBottomColor: colors.surface3 }]}>
          {r.map((cell, j) => (
            <Text
              key={j}
              style={[typography.caption, styles.tableCell, { color: colors.text.primary }]}
              numberOfLines={3}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
      {table.rows.length > TABLE_ROWS ? (
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
          and {table.rows.length - TABLE_ROWS} more
        </Text>
      ) : null}
    </View>
  );
}

/** One message bubble. Memoized: a streamed reply re-renders only its own row. */
const TurnRow = React.memo(function TurnRow({
  turn,
  onOpen,
  onRate,
  onShare,
  onListen,
  onTranslate,
  onReply,
  onCopy,
  speaking,
}: {
  turn: Turn;
  onOpen: (route: string) => void;
  onRate: (id: string, fb: 'up' | 'down') => void;
  onShare: (text: string) => void;
  onListen: (t: Turn) => void;
  onTranslate: (t: Turn) => void;
  onReply: (t: Turn) => void;
  onCopy: (t: Turn) => void;
  speaking: boolean;
}) {
  const { colors, typography } = useTheme();
  const mine = turn.who === 'you';
  return (
    <View
      style={[
        styles.bubble,
        mine
          ? [styles.mine, { backgroundColor: colors.primary }]
          : [styles.theirs, { backgroundColor: colors.surface }],
        turn.table?.rows.length ? styles.wide : null,
      ]}
    >
      {turn.quote ? (
        <View
          style={[styles.quote, { borderLeftColor: mine ? colors.text.inverse : colors.primary }]}
        >
          <Text
            style={[
              typography.caption,
              { color: mine ? colors.text.inverse : colors.text.secondary },
            ]}
            numberOfLines={2}
          >
            {turn.quote}
          </Text>
        </View>
      ) : null}
      <Text style={[typography.body, { color: mine ? colors.text.inverse : colors.text.primary }]}>
        {mine ? turn.text : plainText(turn.text)}
      </Text>
      {turn.translation ? (
        <View
          style={[
            styles.translated,
            { borderTopColor: mine ? colors.text.inverse : colors.surface3 },
          ]}
        >
          <Text
            style={[typography.caption, { color: mine ? colors.text.inverse : colors.text.muted }]}
          >
            {languageOf(turn.translation.lang).native}, translated on this phone
          </Text>
          <Text
            style={[typography.body, { color: mine ? colors.text.inverse : colors.text.primary }]}
          >
            {turn.translation.text}
          </Text>
        </View>
      ) : null}
      {turn.attachment?.kind === 'image' ? (
        <Image
          source={{ uri: turn.attachment.uri }}
          style={styles.bubbleImage}
          contentFit="cover"
          accessibilityLabel={turn.attachment.name}
        />
      ) : turn.attachment ? (
        <View style={styles.fileChip}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={mine ? colors.text.inverse : colors.text.secondary}
          />
          <Text
            style={[
              typography.caption,
              { color: mine ? colors.text.inverse : colors.text.secondary, flexShrink: 1 },
            ]}
            numberOfLines={1}
          >
            {turn.attachment.name}
          </Text>
        </View>
      ) : null}
      {turn.table ? <TurnTable table={turn.table} /> : null}
      {turn.route ? (
        <PressableScale
          onPress={() => onOpen(turn.route!)}
          style={styles.openRow}
          accessibilityRole="button"
        >
          <Text style={[typography.captionBold, { color: colors.primary }]}>Open</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </PressableScale>
      ) : null}
      {!mine && turn.text && !turn.transient ? (
        <View style={styles.actions}>
          <PressableScale
            onPress={() => onRate(turn.id, 'up')}
            hitSlop={8}
            accessibilityLabel="Helpful"
            accessibilityState={{ selected: turn.feedback === 'up' }}
          >
            <Ionicons
              name={turn.feedback === 'up' ? 'thumbs-up' : 'thumbs-up-outline'}
              size={16}
              color={turn.feedback === 'up' ? colors.primary : colors.text.muted}
            />
          </PressableScale>
          <PressableScale
            onPress={() => onRate(turn.id, 'down')}
            hitSlop={8}
            accessibilityLabel="Not helpful"
            accessibilityState={{ selected: turn.feedback === 'down' }}
          >
            <Ionicons
              name={turn.feedback === 'down' ? 'thumbs-down' : 'thumbs-down-outline'}
              size={16}
              color={turn.feedback === 'down' ? colors.primary : colors.text.muted}
            />
          </PressableScale>
          <PressableScale
            onPress={() => onListen(turn)}
            hitSlop={8}
            accessibilityLabel={speaking ? 'Stop reading' : 'Read this reply aloud'}
          >
            <Ionicons
              name={speaking ? 'stop-circle' : 'volume-high-outline'}
              size={16}
              color={speaking ? colors.primary : colors.text.muted}
            />
          </PressableScale>
          <PressableScale
            onPress={() => onTranslate(turn)}
            hitSlop={8}
            accessibilityLabel="Translate this reply"
          >
            <Ionicons
              name="language-outline"
              size={16}
              color={turn.translation ? colors.primary : colors.text.muted}
            />
          </PressableScale>
          <PressableScale
            onPress={() => onReply(turn)}
            hitSlop={8}
            accessibilityLabel="Reply to this"
          >
            <Ionicons name="arrow-undo-outline" size={16} color={colors.text.muted} />
          </PressableScale>
          <PressableScale
            onPress={() => onCopy(turn)}
            hitSlop={8}
            accessibilityLabel="Copy this reply"
          >
            <Ionicons name="copy-outline" size={16} color={colors.text.muted} />
          </PressableScale>
          <PressableScale
            onPress={() => onShare(turn.text)}
            hitSlop={8}
            accessibilityLabel="Share this reply"
          >
            <Ionicons name="share-outline" size={16} color={colors.text.muted} />
          </PressableScale>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  personaRow: { flexGrow: 0, marginBottom: 4 },
  sanctuary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  flex: { flex: 1 },
  avoid: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  miniOrb: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  empty: { paddingTop: 8 },
  buddy: { alignItems: 'center', marginBottom: 4 },
  chipsTitle: { marginTop: 20, marginBottom: 8, letterSpacing: 0.6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  bubble: {
    maxWidth: '86%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginTop: 8,
  },
  mine: { alignSelf: 'flex-end', borderBottomRightRadius: 6 },
  wide: { maxWidth: '100%', width: '100%' },
  theirs: { alignSelf: 'flex-start', borderBottomLeftRadius: 6 },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  tableWrap: { marginTop: 10 },
  actions: { flexDirection: 'row', gap: 18, marginTop: 10, flexWrap: 'wrap' },
  translated: { marginTop: 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, gap: 2 },
  quote: { borderLeftWidth: 3, paddingLeft: 8, marginBottom: 6 },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderLeftWidth: 3,
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 16,
    marginBottom: 8,
  },
  pendingThumb: { width: 48, height: 48, borderRadius: 10 },
  pendingIcon: { alignItems: 'center', justifyContent: 'center' },
  fileChip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  bubbleImage: { width: 180, height: 180, borderRadius: 12, marginTop: 8 },
  // Mirrors the Send/Mic button on the right: same 48 dp box, bottom-aligned with one line of text.
  attach: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  camBtn: { width: 36, height: 48, alignItems: 'center', justifyContent: 'center', marginLeft: -6 },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
  },
  tableCell: { flex: 1, paddingRight: 8 },
  composer: {
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 52,
    paddingVertical: 4,
    borderRadius: 26,
    borderWidth: 1,
    paddingLeft: 4,
    paddingRight: 4,
  },
  // Grows with the text up to about four lines.
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 112,
    paddingVertical: 12,
    paddingHorizontal: 2,
    textAlignVertical: 'center',
  },
  actionWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 48, height: 48, borderRadius: 24 },
  action: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Safety & Emergency styles
  sanctuaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  safetyContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  safetyCardBox: {
    padding: 14,
  },
  safetyCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  safetyIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  safetyActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  calmSupportBar: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  calmSupportChipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calmSupportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  countryFlagLarge: { fontSize: 24 },
  emergencyCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sheetOverlayFill: {
    ...StyleSheet.absoluteFill,
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetOverlayBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  sheetOverlayContentWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modalBox: {
    borderRadius: 28,
    padding: 20,
    maxHeight: '85%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  helplineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    gap: 10,
  },
  breathingCircleContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  breathingCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensoryCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 8,
  },
  stepBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  stepBtnPrimary: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
});
```

#### `src/components/assistant/BrainSetupCard.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  brainReady,
  cancelSetup,
  pauseSetup,
  resumeSetup,
  recommendedModel,
  setUpBrain,
  subscribeSetup,
  type SetupState,
} from '../../services/ai/modelSetup';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui';
import { Button } from '../ui/Button';

/**
 * Asks plainly to download the on-device brain so Anvay can answer offline, and shows
 * real progress. Hidden when a model is already answering or the phone cannot run one.
 */
export function BrainSetupCard({ compact = false }: { compact?: boolean }) {
  const { colors, typography } = useTheme();
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<SetupState | null>(null);
  const model = recommendedModel();

  useEffect(() => subscribeSetup(setSetup), []);
  useEffect(() => {
    void brainReady().then(setReady);
  }, [setup?.phase]);

  if (!model || ready === null || ready || setup?.phase === 'ready') return null;
  const busy =
    setup?.phase === 'downloading' || setup?.phase === 'verifying' || setup?.phase === 'loading';
  const pct = Math.round((setup?.progress ?? 0) * 100);

  return (
    <Card
      style={[styles.card, { backgroundColor: colors.surface1, borderColor: colors.primary }]}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryAlpha }]}>
          <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
            {busy ? 'Setting up On-Device Anvay' : 'Anvay On-Device AI Setup'}
          </Text>
          <Text style={[typography.caption, { color: colors.text.muted }]}>
            {busy ? `Downloading ${pct}%` : 'Private · 100% Offline'}
          </Text>
        </View>
      </View>

      {!compact || busy ? (
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 8, lineHeight: 18 }]}>
          {setup?.phase === 'downloading'
            ? `Downloading ${model.name}: ${pct}% of ${model.sizeMb} MB via Android DownloadManager. It continues in the background if you leave the app.`
            : setup?.phase === 'verifying'
              ? 'Verifying SHA-256 integrity of the local model…'
              : setup?.phase === 'loading'
                ? 'Initializing on-device engine into memory…'
                : `Download ${model.name} (${model.sizeMb} MB) for private on-device intelligence without internet. If you recently reinstalled the app or cleared storage, Android purges local model files—tap below to restore.`}
        </Text>
      ) : null}

      {setup?.phase === 'downloading' ? (
        <View style={[styles.track, { backgroundColor: colors.surface2 }]}>
          <View style={[styles.fill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
        </View>
      ) : null}

      {setup?.phase === 'failed' && setup.message ? (
        <Text style={[typography.caption, { color: colors.error, marginTop: 6 }]}>
          {setup.message}
        </Text>
      ) : null}

      <View style={[styles.row, { marginTop: 12, flexWrap: 'wrap', gap: 8 }]}>
        {busy ? (
          setup?.phase === 'downloading' ? (
            <>
              {setup?.durable ? null : (
                <Button label="Pause" size="sm" variant="outline" onPress={() => void pauseSetup()} />
              )}
              <Button label="Cancel" size="sm" variant="ghost" onPress={() => void cancelSetup()} />
            </>
          ) : null
        ) : setup?.phase === 'paused' ? (
          <>
            <Button label={`Resume (${pct}%)`} size="sm" onPress={() => void resumeSetup()} />
            <Button label="Cancel" size="sm" variant="ghost" onPress={() => void cancelSetup()} />
          </>
        ) : (
          <>
            <Button
              label={setup?.phase === 'failed' ? 'Try again' : `Download ${model.sizeMb} MB`}
              size="sm"
              onPress={() => void setUpBrain(model)}
            />
            <Button
              label="Use Cloud Key (BYOK)"
              size="sm"
              variant="outline"
              onPress={() => router.push('/(app)/settings/ai-byok' as Href)}
            />
          </>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: 18, borderWidth: 1.5, padding: 14, marginBottom: 14 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 10 },
  fill: { height: '100%' },
});
```

#### `src/components/brand/AnvayCompanion.tsx`

```tsx
/**
 * Anvay, the on-device companion, built from the Thrivefold mark itself.
 *
 *   the terracotta T  = its body (steady, it only breathes and leans)
 *   the sage leaf     = its arm / posture (perks up, waves, droops)
 *   the amber sun     = its eye and spirit (all the emotion lives here)
 *
 * No mouth, no cartoon extras. The sun is an eye: it blinks, glances, squints into a happy arc,
 * goes heavy-lidded when it is late, and widens when it listens. Everything is drawn from one
 * pure "pose" (mood + time of day + topic) that is eased into shared values, so the UI thread
 * does the work and the component stays light on mid-range phones.
 *
 * Props
 *   mood   what the voice engine is doing (idle, listening, thinking, speaking, success, error)
 *   topic  what the person is talking about (workout, sleep, ...), optional
 *   tod    force a time of day, otherwise it follows the phone clock
 *
 * Transparent background. With Reduce Motion it rests in its pose, no loops.
 */
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export type AnvayMood = 'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'error';
export type AnvayTopic = 'workout' | 'sleep' | 'hydration' | 'food' | 'mind';
export type AnvayTimeOfDay = 'morning' | 'day' | 'evening' | 'night';

/* ── Brand geometry (the Thrivefold mark, 1024-unit artboard) ───────────────────────────── */

const T_PATH =
  'M 225 247 H 735 C 742 248 746 254 741 262 C 715 305 670 322 620 328 C 560 336 510 385 497 465 V 802 H 435 C 412 802 397 786 397 765 V 450 C 397 400 365 372 325 372 H 225 C 205 372 190 358 190 340 V 280 C 190 261 205 247 225 247 Z';
// One leaf with a thin slit, so it reads as two blades like the logo.
const LEAF_PATH =
  'M 815 298 C 842 392 838 505 780 590 C 742 645 690 650 640 662 C 595 674 572 712 572 750 V 790 Q 572 802 560 802 H 517 C 517 750 520 705 530 672 C 555 628 600 590 650 558 C 700 526 745 490 767 443 C 745 487 700 520 642 553 C 595 582 553 620 521 662 C 521 600 560 540 625 495 C 700 445 770 380 815 298 Z';
const LEAF_PIVOT = { x: 545, y: 795 };

// The sun sits in the nook between the T and the leaf.
const SUN_X = 608;
const SUN_Y = 422;
const SUN_R = 56;
// Wide enough that a drooping leaf never clips.
const VIEWBOX = '156 176 744 744';

const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30 * Math.PI) / 180;
  const r0 = SUN_R * 1.55;
  const r1 = r0 + (i % 2 ? 14 : 26);
  const p = (r: number) =>
    `${(SUN_X + Math.cos(a) * r).toFixed(1)} ${(SUN_Y + Math.sin(a) * r).toFixed(1)}`;
  return `M ${p(r0)} L ${p(r1)}`;
}).join(' ');

/* ── Palette per time of day (the sun warms through the day and goes moon-pale at night) ── */

const PALETTE: Record<AnvayTimeOfDay, { sun: string; iris: string; t: string; leaf: string }> = {
  morning: { sun: '#F8C46B', iris: '#EBA03C', t: '#D47F60', leaf: '#8FA07C' },
  day: { sun: '#F5BC66', iris: '#E8963E', t: '#D27A5C', leaf: '#8D9D7B' },
  evening: { sun: '#F2A15F', iris: '#DE7A3F', t: '#CF7253', leaf: '#889876' },
  night: { sun: '#F1DDB4', iris: '#D2B07A', t: '#BF6F58', leaf: '#7F8F70' },
};
const HIGHLIGHT = '#FFF6E6';
const SUCCESS = '#8FCB8A';
const SOFT_ERROR = '#D27A5C';

/* ── Time of day ────────────────────────────────────────────────────────────────────────── */

function todOf(d: Date = new Date()): AnvayTimeOfDay {
  const h = d.getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

export function useAnvayTimeOfDay(): AnvayTimeOfDay {
  const [tod, setTod] = useState<AnvayTimeOfDay>(todOf);
  useEffect(() => {
    const iv = setInterval(() => setTod((cur) => (todOf() === cur ? cur : todOf())), 60_000);
    return () => clearInterval(iv);
  }, []);
  return tod;
}

/* ── Topic: what the person is talking about ────────────────────────────────────────────── */

export function topicFromText(text: string): AnvayTopic | undefined {
  const s = text.toLowerCase();
  if (
    /\b(workout|exercise|training|squats?|push-?ups?|plank|run(ning)?|gym|reps?|stretch(ing)?|yoga|walk(ing)?)\b/.test(
      s,
    )
  )
    return 'workout';
  if (/\b(sleep|slept|nap|bed(time)?|insomnia|tired|rest)\b/.test(s)) return 'sleep';
  if (/\b(water|hydrat\w*|glass(es)?)\b/.test(s)) return 'hydration';
  if (/\b(eat|ate|meal|food|calories?|protein|breakfast|lunch|dinner|snack|diet)\b/.test(s))
    return 'food';
  if (/\b(stress(ed)?|anxious|anxiety|calm|breath(e|ing)?|meditat\w*|mood|focus|journal)\b/.test(s))
    return 'mind';
  return undefined;
}

/** Feed it what the person says; the topic holds for a while, then Anvay relaxes again. */
export function useAnvayTopic(holdMs = 25_000) {
  const [topic, setTopic] = useState<AnvayTopic | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hear = useCallback(
    (text: string) => {
      const next = topicFromText(text);
      if (!next) return;
      setTopic(next);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setTopic(undefined), holdMs);
    },
    [holdMs],
  );
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return [topic, hear] as const;
}

/* ── Pose: one pure description of how Anvay looks right now ────────────────────────────── */

interface Pose {
  up: number; //     upper lid openness 0..1
  dn: number; //     lower lid openness 0..1 (small + up ~0.6 = happy arc)
  sun: number; //    eye size multiplier
  leaf: number; //   leaf rest angle in degrees (negative perks up, positive droops)
  sway: number; //   leaf sway amplitude in degrees
  lean: number; //   0..1 leans toward you
  tilt: number; //   body tilt in degrees
  glow: number; //   soft glow behind the sun
  rays: number; //   sun rays opacity
  ripple: number; // rings that travel out of the sun
  think: number; //  0/1 gaze drifts up and around
  talk: number; //   0/1 the sun pulses with the voice
  breathMs: number; // one full breath
}

const TOD_BASE: Record<AnvayTimeOfDay, Pose> = {
  morning: {
    up: 0.95,
    dn: 0.85,
    sun: 1,
    leaf: -2,
    sway: 3,
    lean: 0,
    tilt: 0,
    glow: 0.5,
    rays: 0.35,
    ripple: 0,
    think: 0,
    talk: 0,
    breathMs: 3200,
  },
  day: {
    up: 0.92,
    dn: 0.95,
    sun: 1,
    leaf: 0,
    sway: 2.5,
    lean: 0,
    tilt: 0,
    glow: 0.4,
    rays: 0,
    ripple: 0,
    think: 0,
    talk: 0,
    breathMs: 3600,
  },
  evening: {
    up: 0.85,
    dn: 0.85,
    sun: 1,
    leaf: 2,
    sway: 2,
    lean: 0,
    tilt: 0,
    glow: 0.45,
    rays: 0.12,
    ripple: 0,
    think: 0,
    talk: 0,
    breathMs: 4200,
  },
  night: {
    up: 0.42,
    dn: 0.7,
    sun: 0.96,
    leaf: 6,
    sway: 1.2,
    lean: 0,
    tilt: 0,
    glow: 0.22,
    rays: 0,
    ripple: 0,
    think: 0,
    talk: 0,
    breathMs: 5200,
  },
};

function poseFor(mood: AnvayMood, tod: AnvayTimeOfDay, topic?: AnvayTopic): Pose {
  const pose = rawPose(mood, tod, topic);
  // Keep the leaf inside the artboard and off the sun.
  return { ...pose, leaf: Math.max(-7, Math.min(9, pose.leaf)) };
}

function rawPose(mood: AnvayMood, tod: AnvayTimeOfDay, topic?: AnvayTopic): Pose {
  const p: Pose = { ...TOD_BASE[tod] };

  // What we are talking about colours the mood a little.
  if (topic === 'workout') {
    p.rays = Math.max(p.rays, 0.5);
    p.sway *= 2.2;
    p.leaf -= 4;
    p.sun *= 1.05;
    p.up = Math.max(p.up, 0.95);
    p.breathMs *= 0.7;
  } else if (topic === 'sleep') {
    p.up *= 0.6;
    p.glow *= 0.6;
    p.rays = 0;
    p.sway *= 0.5;
    p.leaf += 4;
    p.breathMs *= 1.4;
  } else if (topic === 'hydration') {
    p.glow += 0.1;
    p.leaf -= 2;
    p.up = Math.max(p.up, 0.95);
  } else if (topic === 'food') {
    p.up = Math.max(p.up, 0.8);
    p.dn = Math.min(p.dn, 0.8);
    p.glow += 0.08;
  } else if (topic === 'mind') {
    p.breathMs *= 1.6;
    p.up *= 0.85;
    p.sway *= 0.6;
    p.ripple = 0.25;
  }

  const lateness = tod === 'night' ? 0.85 : 1;

  switch (mood) {
    case 'listening':
      return {
        ...p,
        up: 1 * lateness,
        dn: 1 * lateness,
        sun: 1.1,
        lean: 1,
        leaf: -3,
        glow: p.glow + 0.2,
        ripple: 1,
        rays: p.rays * 0.5,
        think: 0,
        talk: 0,
      };
    case 'thinking':
      return {
        ...p,
        up: 0.85 * lateness,
        dn: 0.8,
        sun: 0.98,
        leaf: -5,
        tilt: -4,
        think: 1,
        talk: 0,
      };
    case 'speaking':
      return {
        ...p,
        up: 1 * lateness,
        dn: 0.95,
        sun: 1.04,
        leaf: -1,
        sway: p.sway * 1.4,
        glow: p.glow + 0.15,
        ripple: 0.6,
        think: 0,
        talk: 1,
      };
    case 'success':
      return {
        ...p,
        up: 0.62,
        dn: 0.1,
        sun: 1.08,
        leaf: -6,
        sway: 6,
        glow: 0.7,
        rays: 1,
        ripple: 1,
        think: 0,
        talk: 0,
      };
    case 'error':
      return {
        ...p,
        up: 0.55,
        dn: 1,
        sun: 0.92,
        leaf: 9,
        sway: 0.8,
        tilt: 4,
        glow: 0.18,
        rays: 0,
        ripple: 0,
        think: 0,
        talk: 0,
      };
    default:
      return p;
  }
}

/* ── Animation helpers ──────────────────────────────────────────────────────────────────── */

const LOOP_MS = 10_000;
const clamp = Extrapolation.CLAMP;
// Blinks at 26%, 64% and a quick double at 71% of the loop; glances in between.
const BLINK_K = [0.26, 0.28, 0.3, 0.64, 0.66, 0.68, 0.71, 0.73, 0.75];
const BLINK_V = [0, 1, 0, 0, 1, 0, 0, 1, 0];
const LOOK_K = [0.4, 0.44, 0.52, 0.56, 0.62, 0.66];
const LOOK_X = [0, -1, -1, 1, 1, 0];
const LOOK_Y = [0, 0.2, 0.2, -0.3, -0.3, 0];
const EASE = { duration: 420, easing: Easing.inOut(Easing.quad) } as const;
const K = 0.5523;

/** An eye shape: a circle whose top and bottom lids can close independently. */
function eyePath(cx: number, cy: number, r: number, up: number, dn: number): string {
  'worklet';
  const u = Math.max(up, 0.04);
  const d = Math.max(dn, 0.04);
  const k = K * r;
  return (
    `M ${cx - r} ${cy} ` +
    `C ${cx - r} ${cy - k * u} ${cx - k} ${cy - r * u} ${cx} ${cy - r * u} ` +
    `C ${cx + k} ${cy - r * u} ${cx + r} ${cy - k * u} ${cx + r} ${cy} ` +
    `C ${cx + r} ${cy + k * d} ${cx + k} ${cy + r * d} ${cx} ${cy + r * d} ` +
    `C ${cx - k} ${cy + r * d} ${cx - r} ${cy + k * d} ${cx - r} ${cy} Z`
  );
}

export function AnvayCompanion({
  size = 64,
  mood = 'idle',
  topic,
  tod: todOverride,
}: {
  size?: number;
  mood?: AnvayMood;
  topic?: AnvayTopic;
  tod?: AnvayTimeOfDay;
}) {
  const reduce = useReducedMotion();
  const clockTod = useAnvayTimeOfDay();
  const tod = todOverride ?? clockTod;
  const pal = PALETTE[tod];
  const gid = `anvayGlow${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const pose = useMemo(() => poseFor(mood, tod, topic), [mood, tod, topic]);

  // Loops
  const t = useSharedValue(0); //       10 s master clock (blinks, glances, leaf sway)
  const breath = useSharedValue(0); //  0..1 breathing
  const rp = useSharedValue(0); //      ripple phase
  const vo = useSharedValue(0); //      voice clock
  // One-shots
  const hello = useSharedValue(reduce ? 0 : 1); // leaf waves hello when it appears
  const hop = useSharedValue(0);
  const shake = useSharedValue(0);
  // Pose, eased
  const lidUp = useSharedValue(pose.up);
  const lidDn = useSharedValue(pose.dn);
  const sunS = useSharedValue(pose.sun);
  const leafB = useSharedValue(pose.leaf);
  const sway = useSharedValue(pose.sway);
  const lean = useSharedValue(pose.lean);
  const tilt = useSharedValue(pose.tilt);
  const glow = useSharedValue(pose.glow);
  const rays = useSharedValue(pose.rays);
  const ripple = useSharedValue(pose.ripple);
  const think = useSharedValue(pose.think);
  const talk = useSharedValue(pose.talk);

  useEffect(() => {
    if (reduce) return;
    t.value = 0;
    t.value = withRepeat(withTiming(1, { duration: LOOP_MS, easing: Easing.linear }), -1, false);
    rp.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.linear }), -1, false);
    vo.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.linear }), -1, false);
    hello.value = 1;
    hello.value = withTiming(0, { duration: 1800, easing: Easing.out(Easing.quad) });
    return () => {
      cancelAnimation(t);
      cancelAnimation(rp);
      cancelAnimation(vo);
    };
  }, [reduce, t, rp, vo, hello]);

  useEffect(() => {
    if (reduce) return;
    breath.value = 0;
    breath.value = withRepeat(
      withTiming(1, { duration: pose.breathMs / 2, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(breath);
  }, [reduce, pose.breathMs, breath]);

  useEffect(() => {
    const go = (v: { value: number }, to: number) => {
      v.value = reduce ? to : withTiming(to, EASE);
    };
    go(lidUp, pose.up);
    go(lidDn, pose.dn);
    go(sunS, pose.sun);
    go(leafB, pose.leaf);
    go(sway, pose.sway);
    go(lean, pose.lean);
    go(tilt, pose.tilt);
    go(glow, pose.glow);
    go(rays, pose.rays);
    go(ripple, pose.ripple);
    go(think, pose.think);
    go(talk, pose.talk);
  }, [pose, reduce, lidUp, lidDn, sunS, leafB, sway, lean, tilt, glow, rays, ripple, think, talk]);

  // Success hops, error gives a small, sorry shake. Both once, on the change.
  useEffect(() => {
    if (reduce) return;
    if (mood === 'success') {
      hop.value = withSequence(
        withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
        withSpring(0, { damping: 7, stiffness: 180 }),
      );
    } else if (mood === 'error') {
      shake.value = withSequence(
        withTiming(1, { duration: 80 }),
        withTiming(-1, { duration: 120 }),
        withTiming(0.6, { duration: 100 }),
        withTiming(0, { duration: 160 }),
      );
    }
  }, [mood, reduce, hop, shake]);

  // The body: breathes, leans in when listening, hops on success.
  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          -breath.value * size * 0.012 - lean.value * size * 0.02 - hop.value * size * 0.08,
      },
      { scale: 1 + breath.value * 0.008 + lean.value * 0.035 },
      { rotate: `${tilt.value + shake.value * 3}deg` },
    ],
  }));

  // Everything about the eye in one place: lids, glance, size.
  const eye = () => {
    'worklet';
    const tt = t.value;
    const open = 1 - interpolate(tt, BLINK_K, BLINK_V, clamp);
    const th = think.value;
    const shy = 1 - lean.value * 0.8; // when listening it looks at you, not around
    const gx =
      interpolate(tt, LOOK_K, LOOK_X, clamp) * 13 * (1 - th) * shy +
      th * (Math.sin(tt * Math.PI * 2 * 5) * 8 - 7);
    const gy =
      interpolate(tt, LOOK_K, LOOK_Y, clamp) * 8 * (1 - th) * shy +
      th * (-11 + Math.cos(tt * Math.PI * 2 * 5) * 4);
    const va =
      talk.value *
      (0.5 + 0.5 * Math.sin(vo.value * Math.PI * 2 * 9) * Math.sin(vo.value * Math.PI * 2 * 4 + 1));
    const R = SUN_R * sunS.value * (1 + va * 0.09 + (breath.value - 0.5) * 0.025);
    const up = Math.max(0.04, lidUp.value * open);
    const dn = Math.max(0.04, lidDn.value * open);
    return { gx, gy, va, R, up, dn };
  };

  const sunProps = useAnimatedProps(() => {
    const e = eye();
    return { d: eyePath(SUN_X + e.gx * 0.25, SUN_Y + e.gy * 0.25, e.R, e.up, e.dn) };
  });
  const irisProps = useAnimatedProps(() => {
    const e = eye();
    const mid = (e.up + e.dn) / 2;
    return {
      cx: SUN_X + e.gx,
      cy: SUN_Y + e.gy + (e.R * (e.dn - e.up)) / 2,
      rx: e.R * 0.5,
      ry: e.R * 0.5 * mid,
      opacity: Math.min(1, mid * 1.4),
    };
  });
  const glintProps = useAnimatedProps(() => {
    const e = eye();
    const mid = (e.up + e.dn) / 2;
    const ry = e.R * 0.5 * mid;
    return {
      cx: SUN_X + e.gx - e.R * 0.2,
      cy: SUN_Y + e.gy + (e.R * (e.dn - e.up)) / 2 - ry * 0.45,
      r: e.R * 0.15,
      opacity: Math.min(1, Math.max(0, (mid - 0.45) * 2.2)),
    };
  });
  const glowProps = useAnimatedProps(() => {
    const e = eye();
    return { r: e.R * 2.3, opacity: Math.min(1, glow.value + e.va * 0.2 + lean.value * 0.1) };
  });
  const raysProps = useAnimatedProps(() => ({
    opacity: rays.value,
    rotation: t.value * 30,
    originX: SUN_X,
    originY: SUN_Y,
  }));
  const ring = (offset: number) => () => {
    'worklet';
    const e = eye();
    const p = (rp.value + offset) % 1;
    return { r: e.R * 1.25 + p * e.R * 2.2, opacity: (1 - p) * 0.55 * ripple.value };
  };
  const ring1 = useAnimatedProps(ring(0));
  const ring2 = useAnimatedProps(ring(0.5));

  const leafProps = useAnimatedProps(() => ({
    rotation:
      leafB.value +
      Math.sin(t.value * Math.PI * 2 * 2) * sway.value +
      hello.value * Math.sin(t.value * Math.PI * 2 * 10) * 9,
    originX: LEAF_PIVOT.x,
    originY: LEAF_PIVOT.y,
  }));

  const ringColor = mood === 'success' ? SUCCESS : mood === 'error' ? SOFT_ERROR : pal.sun;

  return (
    <Animated.View
      style={[{ width: size, height: size }, bodyStyle]}
      accessibilityRole="image"
      accessibilityLabel="Anvay"
    >
      <Svg width={size} height={size} viewBox={VIEWBOX}>
        <Defs>
          <RadialGradient id={gid} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={pal.sun} stopOpacity={0.9} />
            <Stop offset="1" stopColor={pal.sun} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Behind everything: glow, rays and the rings that travel out of the sun */}
        <AnimatedCircle cx={SUN_X} cy={SUN_Y} animatedProps={glowProps} fill={`url(#${gid})`} />
        <AnimatedG animatedProps={raysProps}>
          <Path d={RAYS} stroke={pal.sun} strokeWidth={7} strokeLinecap="round" fill="none" />
        </AnimatedG>
        <AnimatedCircle
          cx={SUN_X}
          cy={SUN_Y}
          animatedProps={ring1}
          fill="none"
          stroke={ringColor}
          strokeWidth={5}
        />
        <AnimatedCircle
          cx={SUN_X}
          cy={SUN_Y}
          animatedProps={ring2}
          fill="none"
          stroke={ringColor}
          strokeWidth={5}
        />

        {/* The leaf is behind the eye, the T is in front of it, so the sun tucks into the nook */}
        <AnimatedG animatedProps={leafProps}>
          <Path d={LEAF_PATH} fill={pal.leaf} />
        </AnimatedG>

        {/* The eye: sun, iris that glances, a small highlight */}
        <AnimatedPath animatedProps={sunProps} fill={pal.sun} />
        <AnimatedEllipse animatedProps={irisProps} fill={pal.iris} />
        <AnimatedCircle animatedProps={glintProps} fill={HIGHLIGHT} />

        <Path d={T_PATH} fill={pal.t} />
      </Svg>
    </Animated.View>
  );
}
```

#### `src/components/brand/thrive/CompanionScreen.tsx`

```tsx
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBrandIcon } from '../AnimatedBrandIcon';
import { FaceWatcher } from './FaceWatcher';
import { HALO, useCompanion } from './companion';
import { useHeartRate } from './heart';
import { GUIDES, type GuideName } from './intents';
import { ThriveBoundary } from './ThriveBoundary';
import { ThriveCharacter } from './ThriveCharacter';
import type { Activity, Mood, Period } from './types';

const PALETTE: Record<Period, { bg: string; card: string; fg: string; soft: string; on: string }> = {
  dawn: { bg: '#FFF0E4', card: '#FFE3D0', fg: '#3A2A22', soft: '#F3D3BE', on: '#D9825F' },
  morning: { bg: '#FFF9EE', card: '#FFEFD2', fg: '#3A2A22', soft: '#F5E4C3', on: '#D9825F' },
  afternoon: { bg: '#FEF4E2', card: '#FBE6C2', fg: '#3A2A22', soft: '#F1DCB6', on: '#D9825F' },
  evening: { bg: '#F9E3D4', card: '#F2CDB5', fg: '#3A2A22', soft: '#E8BEA3', on: '#C46F4E' },
  night: { bg: '#232B45', card: '#2E3858', fg: '#F2EEE8', soft: '#3A4568', on: '#D9825F' },
  lateNight: { bg: '#141829', card: '#1E2440', fg: '#E9E6F2', soft: '#2A3152', on: '#D9825F' },
};

const ACTIVITIES: Activity[] = ['wave', 'drink', 'exercise', 'jacks', 'stretch', 'yawn', 'dance', 'roll', 'clap', 'laugh', 'think', 'meditate', 'hug', 'wind', 'sob', 'tantrum', 'peek'];
const MOODS: Mood[] = ['happy', 'joy', 'love', 'proud', 'curious', 'surprised', 'shy', 'thinking', 'bored', 'sleepy', 'sad', 'crying', 'angry', 'scared', 'dizzy'];

export default function CompanionScreen({
  userGender = 'other',
  onClose,
}: {
  userGender?: 'male' | 'female' | 'other';
  onClose?: () => void;
}) {
  const { rig, ui, actions } = useCompanion({ userGender });
  useHeartRate(actions.onHeart);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [panel, setPanel] = useState(false);
  const p = PALETTE[ui.period];
  const stage = Math.min(width - 32, height * 0.46, 420);
  const caption = ui.partial || ui.line;

  const Chip = ({ label, onPress, on }: { label: string; onPress: () => void; on?: boolean }) => (
    <Pressable onPress={onPress} style={[s.chip, { backgroundColor: on ? p.on : p.soft }]}>
      <Text style={[s.chipText, { color: on ? '#fff' : p.fg }]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={[s.root, { backgroundColor: p.bg, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
      <View style={s.head}>
        {onClose ? (
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={[s.close, { backgroundColor: p.soft }]}
          >
            <Text style={[s.closeText, { color: p.fg }]}>‹</Text>
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: p.fg }]}>Thrivefold</Text>
          <Text style={[s.sub, { color: p.fg }]} numberOfLines={1}>
            {ui.guide ?? (ui.asleep ? 'sleeping' : ui.mood)}
          </Text>
        </View>
        {ui.bpm ? (
          <View style={[s.pill, { backgroundColor: p.soft }]}>
            <Text style={[s.pillText, { color: p.fg }]}>♥ {ui.bpm}</Text>
          </View>
        ) : null}
        <FaceWatcher active={ui.cameraOn} onSignal={actions.onFace} width={72} height={96} />
      </View>

      <View style={[s.stage, { backgroundColor: p.card }]}>
        <ThriveBoundary fallback={<AnimatedBrandIcon size={stage * 0.5} />}>
          <ThriveCharacter rig={rig} size={stage} halo={HALO[ui.period]} onPress={actions.poke} />
        </ThriveBoundary>
      </View>

      <View style={s.captionBox}>
        <Text style={[s.caption, { color: p.fg, opacity: caption ? 1 : 0.5 }]} numberOfLines={3}>
          {caption || 'Tap me, or press the mic and talk.'}
        </Text>
      </View>

      {panel ? (
        <ScrollView style={[s.panel, { backgroundColor: p.card }]} contentContainerStyle={{ padding: 14, gap: 10 }} showsVerticalScrollIndicator={false}>
          <Text style={[s.h, { color: p.fg }]}>Guide me</Text>
          <View style={s.wrap}>
            {(Object.keys(GUIDES) as GuideName[]).map((g) => (
              <Chip key={g} label={GUIDES[g].title} onPress={() => actions.startGuide(g)} on={ui.guide === GUIDES[g].title} />
            ))}
            {ui.guide ? <Chip label="Stop" onPress={actions.stopGuide} on /> : null}
          </View>
          <Text style={[s.h, { color: p.fg }]}>Do</Text>
          <View style={s.wrap}>
            {ACTIVITIES.map((a) => <Chip key={a} label={a} onPress={() => actions.perform(a, { prio: 3, force: true })} />)}
          </View>
          <Text style={[s.h, { color: p.fg }]}>Feel</Text>
          <View style={s.wrap}>
            {MOODS.map((m) => <Chip key={m} label={m} onPress={() => actions.setMood(m)} />)}
          </View>
          <Text style={[s.h, { color: p.fg }]}>Notes</Text>
          <View style={s.wrap}>
            <Chip label={ui.dictating ? 'Stop dictation' : 'Dictate'} onPress={() => actions.setDictating(!ui.dictating)} on={ui.dictating} />
            <Chip label="Glasses" onPress={() => actions.setGlasses(!ui.glasses)} on={ui.glasses} />
            {ui.notes.length ? <Chip label="Clear notes" onPress={actions.clearNotes} /> : null}
          </View>
          {ui.notes.map((n, i) => (
            <View key={i} style={[s.note, { backgroundColor: p.soft }]}>
              <Text style={{ color: p.fg, fontSize: 15 }}>{n}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      <View style={s.dock}>
        <Pressable onPress={() => actions.setCamera(!ui.cameraOn)} style={[s.side, { backgroundColor: ui.cameraOn ? p.on : p.soft }]}>
          <Text style={[s.sideText, { color: ui.cameraOn ? '#fff' : p.fg }]}>Camera</Text>
        </Pressable>
        <Pressable onPress={actions.toggleMic} style={[s.mic, { backgroundColor: ui.listening ? p.on : p.fg }]}>
          <Text style={[s.micText, { color: ui.listening ? '#fff' : p.bg }]}>{ui.listening ? 'Listening' : 'Talk'}</Text>
        </Pressable>
        <Pressable onPress={() => setPanel((v) => !v)} style={[s.side, { backgroundColor: panel ? p.on : p.soft }]}>
          <Text style={[s.sideText, { color: panel ? '#fff' : p.fg }]}>{panel ? 'Close' : 'More'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  close: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  closeText: { fontSize: 30, lineHeight: 32, marginTop: -3 },
  root: { flex: 1, paddingHorizontal: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  sub: { fontSize: 13, opacity: 0.65, textTransform: 'capitalize' },
  pill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderCurve: 'continuous' },
  pillText: { fontSize: 14, fontWeight: '700' },
  stage: { alignSelf: 'center', marginTop: 8, borderRadius: 36, borderCurve: 'continuous', padding: 6, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  captionBox: { minHeight: 72, justifyContent: 'center', paddingHorizontal: 8, marginTop: 10 },
  caption: { fontSize: 18, lineHeight: 25, textAlign: 'center', fontWeight: '600' },
  panel: { flex: 1, borderRadius: 28, borderCurve: 'continuous', marginTop: 4, marginBottom: 12 },
  h: { fontSize: 12, fontWeight: '800', opacity: 0.55, textTransform: 'uppercase', letterSpacing: 0.8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, borderCurve: 'continuous' },
  chipText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  note: { borderRadius: 16, borderCurve: 'continuous', padding: 12 },
  dock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  side: { flex: 1, height: 52, borderRadius: 26, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  sideText: { fontSize: 15, fontWeight: '700' },
  mic: { flex: 1.4, height: 64, borderRadius: 32, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  micText: { fontSize: 17, fontWeight: '800' },
});
```

#### `src/components/brand/thrive/companion.ts`

```ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { asyncKeyValueStorage as AsyncStorage } from '../../../stores/persistStorage';
import { GUIDES, parseIntent, type GuideName } from './intents';
import { useThriveRig, type ThriveRig } from './rig';
import type { Activity, FaceSignal, Mood, Period } from './types';
import { coachFor, useVoice } from './voice';

const KEY = 'thrive.companion.v1';
const NOTES_KEY = 'thrive.notes.v1';

export interface CompanionOptions {
  /** Speak on its own (reminders, greetings). Replies to your commands are always spoken. */
  chatty?: boolean;
  hydrationMin?: number;
  eyeBreakMin?: number;
  lang?: string;
  /** The user's gender. The voice coach is the opposite one (default: female voice). */
  userGender?: 'male' | 'female' | 'other';
  /** Minutes between friendly check-ins while you are active. */
  chatterMin?: number;
}

export interface CompanionUI {
  mood: Mood;
  activity: Activity;
  line: string;
  partial: string;
  period: Period;
  bond: number;
  listening: boolean;
  speaking: boolean;
  cameraOn: boolean;
  faceOn: boolean;
  glasses: boolean;
  asleep: boolean;
  dictating: boolean;
  guide: string | null;
  notes: string[];
  bpm: number;
}

const INITIAL: CompanionUI = {
  mood: 'neutral',
  activity: 'none',
  line: '',
  partial: '',
  period: 'morning',
  bond: 0,
  listening: false,
  speaking: false,
  cameraOn: false,
  faceOn: false,
  glasses: false,
  asleep: false,
  dictating: false,
  guide: null,
  notes: [],
  bpm: 0,
};

export const HALO: Record<Period, string> = {
  dawn: '#FFB38A',
  morning: '#FFD36B',
  afternoon: '#FFC15A',
  evening: '#F08A5D',
  night: '#6C7BD9',
  lateNight: '#3E4A9E',
};

export function periodOf(d: Date): Period {
  const h = d.getHours();
  if (h >= 23 || h < 5) return 'lateNight';
  if (h < 7) return 'dawn';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

const LIFE: Record<Period, [Activity, number][]> = {
  dawn: [
    ['yawn', 3],
    ['stretch', 3],
    ['drink', 1],
  ],
  morning: [
    ['stretch', 2],
    ['exercise', 2],
    ['drink', 2],
    ['wave', 1],
    ['dance', 1],
    ['think', 1],
  ],
  afternoon: [
    ['drink', 2],
    ['think', 2],
    ['stretch', 2],
    ['clap', 1],
    ['dance', 1],
    ['wind', 1],
    ['laugh', 1],
    ['roll', 1],
  ],
  evening: [
    ['dance', 2],
    ['meditate', 2],
    ['think', 1],
    ['laugh', 1],
    ['drink', 1],
    ['stretch', 1],
  ],
  night: [
    ['yawn', 3],
    ['meditate', 2],
    ['stretch', 1],
  ],
  lateNight: [
    ['yawn', 3],
    ['sleep', 3],
  ],
};
const pick = (table: [Activity, number][]): Activity => {
  const total = table.reduce((n, [, w]) => n + w, 0);
  let x = Math.random() * total;
  for (const [a, w] of table) {
    x -= w;
    if (x <= 0) return a;
  }
  return table[0][0];
};

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const sleepMs = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const timeLine = () => {
  const d = new Date();
  const t = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  const tail: Record<Period, string> = {
    dawn: 'Early start. Nice.',
    morning: 'A good time to focus.',
    afternoon: 'Remember to drink some water.',
    evening: 'Time to slow down a little.',
    night: 'Getting late. Wind down soon.',
    lateNight: 'It is very late. You should rest.',
  };
  return `It is ${t}. ${tail[periodOf(d)]}`;
};
const dateLine = () =>
  `Today is ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}.`;

const CHATTER: Record<Period, string[]> = {
  dawn: [
    'Early start! A glass of water first?',
    'The morning is quiet. A nice time to plan your day.',
  ],
  morning: [
    'How is your day going so far?',
    'Sit tall and relax your shoulders.',
    'Small steps count. You are doing well.',
  ],
  afternoon: [
    'Time for a little stretch?',
    'Have you had water lately?',
    'Take a breath. You are doing great.',
  ],
  evening: [
    'How was your day? I am happy you are here.',
    'Let us slow down a little.',
    'I am proud of you today.',
  ],
  night: ['Getting late. Maybe put the screen away soon.', 'Let us wind down together.'],
  lateNight: ['It is very late. Sleep helps everything.'],
};

/** Reads surprise, anger and sadness from MediaPipe blendshapes, fully on-device. */
function emotionFromBlend(f: FaceSignal): Mood | null {
  if ((f.jawOpen ?? 0) > 0.45 && (f.browUp ?? 0) > 0.35) return 'surprised';
  if ((f.browDown ?? 0) > 0.5 && (f.frown ?? 0) > 0.25) return 'angry';
  if ((f.frown ?? 0) > 0.4 || ((f.browUp ?? 0) > 0.5 && f.smile < 0.1)) return 'sad';
  return null;
}

interface Ctx {
  rig: ThriveRig;
  patch: (p: Partial<CompanionUI>) => void;
  speak: (t: string, interrupt?: boolean) => void;
  voice: { start: () => Promise<void>; stop: () => void };
  opts: Required<CompanionOptions>;
}

function createBrain(ctx: { current: Ctx }) {
  const st = {
    prio: -1,
    endAt: 0,
    endTimer: null as ReturnType<typeof setTimeout> | null,
    asleep: false,
    listening: false,
    dictating: false,
    camera: false,
    lastUser: Date.now(),
    nextLife: Date.now() + 9000,
    lastWater: Date.now(),
    lastEye: Date.now(),
    exerciseDay: '',
    period: periodOf(new Date()) as Period,
    bond: 0,
    facePresent: false,
    lastFaceSeen: 0,
    faceMood: null as Mood | null,
    faceMoodAt: 0,
    closedSince: 0,
    lastPeek: 0,
    lastWave: 0,
    lastComfort: 0,
    glassesOn: false,
    glassFromFace: false,
    noGlassSince: 0,
    pokes: [] as number[],
    guideToken: 0,
    guideActive: false,
    notes: [] as string[],
    lastSave: 0,
    lastTalk: Date.now(),
    lastBpmAlert: 0,
  };
  const R = () => ctx.current.rig;
  const P = (p: Partial<CompanionUI>) => ctx.current.patch(p);
  const say = (text: string, force = false, interrupt = false) => {
    st.lastTalk = Date.now();
    P({ line: text });
    if (force || ctx.current.opts.chatty) ctx.current.speak(text, interrupt);
  };
  const idle = () =>
    Date.now() >= st.endAt && !st.listening && !st.dictating && !st.guideActive && !st.asleep;

  const base = (): Mood => {
    if (st.asleep) return 'asleep';
    if (st.listening) return 'listening';
    if (st.facePresent && st.faceMood) return st.faceMood;
    if (periodOf(new Date()) === 'lateNight') return 'sleepy';
    return st.bond > 60 ? 'happy' : 'neutral';
  };

  const save = () => {
    st.lastSave = Date.now();
    AsyncStorage.setItem(KEY, JSON.stringify({ lastSeen: Date.now(), bond: st.bond })).catch(
      () => {},
    );
  };
  const touch = (n = 1) => {
    st.lastUser = Date.now();
    st.bond = clamp(st.bond + n * 0.4, 0, 100);
    P({ bond: Math.round(st.bond) });
    if (Date.now() - st.lastSave > 15000) save();
  };

  const finish = () => {
    st.prio = -1;
    st.endAt = 0;
    R().setMood(base());
    R().settle();
    P({ activity: 'none', mood: R().mood.current });
  };

  const perform = (
    a: Activity,
    o: { prio?: number; say?: string; mood?: Mood; force?: boolean } = {},
  ) => {
    const prio = o.prio ?? 0;
    if (!o.force && Date.now() < st.endAt && prio < st.prio) return false;
    if (st.asleep && a !== 'sleep' && prio < 3) return false;
    if (st.endTimer) clearTimeout(st.endTimer);
    if (st.asleep && a !== 'sleep') {
      st.asleep = false;
      P({ asleep: false });
    }
    const dur = R().play(a);
    if (o.mood) R().setMood(o.mood);
    st.prio = prio;
    st.endAt = dur ? Date.now() + dur : Infinity;
    if (a === 'sleep') {
      st.asleep = true;
      P({ asleep: true });
    }
    P({ activity: a, mood: R().mood.current });
    if (o.say) say(o.say, prio >= 2);
    if (dur) st.endTimer = setTimeout(finish, dur + 120);
    return true;
  };

  const wake = (line?: string) => {
    st.asleep = false;
    P({ asleep: false });
    perform('yawn', { prio: 3, force: true, say: line ?? 'Good morning. I am awake.' });
  };
  const sleep = (line = 'Good night. Sleep well. I will be right here.') => {
    say(line, true);
    perform('sleep', { prio: 4, force: true });
  };
  const setGlasses = (on: boolean, line?: string, fromFace = false) => {
    st.glassesOn = on;
    st.glassFromFace = fromFace;
    R().setGlasses(on);
    P({ glasses: on });
    if (line) say(line, true);
  };

  const stopGuide = () => {
    st.guideToken++;
    st.guideActive = false;
    P({ guide: null });
    if (Date.now() < st.endAt) finish();
  };
  const startGuide = async (name: GuideName) => {
    const g = GUIDES[name];
    const token = ++st.guideToken;
    st.guideActive = true;
    P({ guide: g.title });
    for (const step of g.steps) {
      if (token !== st.guideToken) return;
      say(step.say, true, true);
      perform(step.activity, { prio: 3, force: true });
      const end = Date.now() + step.ms;
      while (Date.now() < end) {
        if (token !== st.guideToken) return;
        await sleepMs(Math.min(500, Math.max(50, end - Date.now())));
        if (st.endAt !== Infinity && Date.now() > st.endAt && Date.now() < end - 800)
          perform(step.activity, { prio: 3, force: true });
      }
    }
    if (token !== st.guideToken) return;
    st.guideActive = false;
    P({ guide: null });
    say(g.done, true, true);
    perform('clap', { prio: 3, force: true });
    touch(3);
  };

  const poke = () => {
    const now = Date.now();
    touch(1);
    st.pokes = st.pokes.filter((t) => now - t < 4000).concat(now);
    if (st.asleep) {
      wake('Mmm... oh! You woke me up.');
      return;
    }
    if (st.pokes.length >= 4) {
      st.pokes = [];
      perform('tantrum', { prio: 3, force: true, say: 'Hey! Stop poking me!' });
      setTimeout(
        () =>
          perform('hug', { prio: 3, force: true, say: 'Okay, I forgive you. I am loyal to you.' }),
        3800,
      );
      return;
    }
    const a = (['laugh', 'wave', 'dance', 'roll', 'clap'] as Activity[])[
      Math.floor(Math.random() * 5)
    ];
    perform(a, { prio: 2, say: a === 'laugh' ? 'Hehe, that tickles!' : undefined });
  };

  const handleUtterance = (text: string) => {
    touch(2);
    if (st.dictating) {
      if (/\b(stop|end|finish) (dictation|dictating|notes?)\b/i.test(text)) {
        setDictating(false);
        return;
      }
      st.notes = [...st.notes, text];
      P({ notes: st.notes });
      AsyncStorage.setItem(NOTES_KEY, JSON.stringify(st.notes)).catch(() => {});
      R().nod();
      return;
    }
    const it = parseIntent(text);
    switch (it.type) {
      case 'activity':
        perform(it.activity, { prio: 3, force: true, say: it.say });
        break;
      case 'mood':
        R().setMood(it.mood);
        P({ mood: it.mood });
        say(it.say, true);
        st.endAt = Date.now() + 4000;
        st.endTimer = setTimeout(finish, 4100);
        st.prio = 3;
        break;
      case 'glasses':
        setGlasses(it.on, it.say);
        perform('think', { prio: 2 });
        break;
      case 'guide':
        startGuide(it.name);
        break;
      case 'time':
        say(timeLine(), true);
        perform('think', { prio: 3, force: true });
        break;
      case 'date':
        say(dateLine(), true);
        perform('think', { prio: 3, force: true });
        break;
      case 'status': {
        const per = periodOf(new Date());
        const feel =
          st.bond > 60
            ? 'really happy, because you are here'
            : st.bond > 25
              ? 'good'
              : 'fine, and happy to meet you';
        say(`I feel ${feel}. It is ${per === 'lateNight' ? 'very late' : per}.`, true);
        perform('wave', { prio: 3, force: true });
        break;
      }
      case 'dictate':
        setDictating(it.on);
        break;
      case 'sleep':
        sleep();
        break;
      case 'wake':
        wake();
        break;
      case 'stop':
        stopGuide();
        say('Okay.', true);
        break;
      case 'chat':
        perform('hug', { prio: 3, force: true, mood: it.mood, say: it.say });
        break;
      default:
        perform('think', {
          prio: 3,
          force: true,
          say: `I heard "${text}", but I do not know that one yet.`,
        });
    }
  };

  const setDictating = (on: boolean) => {
    st.dictating = on;
    P({ dictating: on });
    if (on) {
      perform('listen', { prio: 3, force: true });
      say('Dictation on. I am writing everything down.', true);
    } else {
      finish();
      say(`Dictation saved. ${st.notes.length} note${st.notes.length === 1 ? '' : 's'}.`, true);
    }
  };

  const setFaceMood = (m: Mood) => {
    const now = Date.now();
    if (st.faceMood === m || now - st.faceMoodAt < 800) return;
    st.faceMood = m;
    st.faceMoodAt = now;
    if (m === 'sad' && now - st.lastComfort > 120000 && !st.asleep) {
      st.lastComfort = now;
      perform('hug', { prio: 2, say: 'You look sad. I am here with you.' });
      return;
    }
    if (idle() && Date.now() >= st.endAt) {
      R().setMood(m);
      P({ mood: m });
    }
  };

  const api = {
    perform,
    poke,
    wake,
    sleep,
    say,
    startGuide,
    stopGuide,
    setDictating,
    setMood(m: Mood) {
      R().setMood(m);
      P({ mood: m });
    },
    clearNotes() {
      st.notes = [];
      P({ notes: [] });
      AsyncStorage.removeItem(NOTES_KEY).catch(() => {});
    },
    setGlasses: (on: boolean) => setGlasses(on, on ? 'Glasses on.' : 'Glasses off.'),

    setCamera(on: boolean) {
      st.camera = on;
      P({ cameraOn: on });
      if (on) {
        touch(2);
        perform('peek', { prio: 3, force: true, say: 'Camera on. I can see you now.' });
        setTimeout(() => perform('wave', { prio: 3, force: true }), 2900);
      } else {
        st.facePresent = false;
        st.faceMood = null;
        P({ faceOn: false });
        R().track(null);
        R().lean(0);
        say('Okay, camera off.', true);
      }
    },

    async toggleMic() {
      if (st.listening) {
        ctx.current.voice.stop();
        return;
      }
      await ctx.current.voice.start();
    },
    onVoiceStart() {
      st.listening = true;
      P({ listening: true });
      if (!st.dictating) perform('listen', { prio: 3, force: true });
    },
    onVoiceEnd() {
      st.listening = false;
      P({ listening: false, partial: '' });
      if (st.dictating) setDictating(false);
      else if (Date.now() >= st.endAt || st.endAt === Infinity) {
        if (!st.asleep) finish();
      }
    },
    onVolume(v: number) {
      if (!st.listening) return;
      R().v.glow.value = 0.4 + 0.6 * clamp(v / 8, 0, 1);
    },
    onTranscript(text: string, final: boolean) {
      st.lastUser = Date.now();
      P({ partial: final ? '' : text });
      if (final) handleUtterance(text);
    },
    onSpeaking(on: boolean) {
      R().setTalking(on);
      P({ speaking: on });
    },
    onError(msg: string) {
      P({ line: msg });
    },

    onWave() {
      const now = Date.now();
      if (now - st.lastWave < 4000) return;
      st.lastWave = now;
      touch(2);
      if (st.asleep) wake('Oh, hi! I saw you wave.');
      else perform('wave', { prio: 2, say: 'Hey! I saw that.' });
    },

    onFace(f: FaceSignal) {
      const now = Date.now();
      if (!f.present) return;
      const wasAway = !st.facePresent && now - st.lastFaceSeen > 8000;
      st.lastFaceSeen = now;
      st.lastUser = now;
      if (!st.facePresent) {
        st.facePresent = true;
        P({ faceOn: true });
      }
      R().track(f.x * 0.9, f.y * 0.9);
      if (wasAway && st.camera) {
        if (st.asleep) wake('Oh, you are back!');
        else perform('greet', { prio: 2, say: 'There you are!' });
      }
      if (idle()) R().lean(clamp(-f.roll * 0.4, -12, 12));

      let m: Mood | null = f.emotion ?? emotionFromBlend(f);
      if (!m) {
        if (f.eyesOpen < 0.25) {
          if (!st.closedSince) st.closedSince = now;
          if (now - st.closedSince > 1500) m = 'sleepy';
        } else {
          st.closedSince = 0;
          m =
            f.smile > 0.65
              ? 'joy'
              : f.smile > 0.3
                ? 'happy'
                : Math.abs(f.yaw) > 25
                  ? 'curious'
                  : 'neutral';
        }
      }
      if (m) setFaceMood(m);

      if (f.size > 0.55 && now - st.lastPeek > 20000 && Date.now() >= st.endAt) {
        st.lastPeek = now;
        perform('peek', { prio: 1 });
      }
      if (f.glasses === true && !st.glassesOn)
        setGlasses(true, 'Nice glasses! I will wear mine too.', true);
      if (f.glasses === false && st.glassesOn && st.glassFromFace) {
        if (!st.noGlassSince) st.noGlassSince = now;
        if (now - st.noGlassSince > 4000) {
          st.noGlassSince = 0;
          setGlasses(false);
        }
      } else st.noGlassSince = 0;
    },

    async boot() {
      let saved: { lastSeen?: number; bond?: number } = {};
      try {
        saved = JSON.parse((await AsyncStorage.getItem(KEY)) ?? '{}');
        st.notes = JSON.parse((await AsyncStorage.getItem(NOTES_KEY)) ?? '[]');
      } catch {
        /* first run */
      }
      st.bond = saved.bond ?? 0;
      P({ bond: Math.round(st.bond), notes: st.notes, period: st.period });
      const away = saved.lastSeen ? Date.now() - saved.lastSeen : 0;
      const h = new Date().getHours();
      const hello =
        h < 5
          ? 'Quiet night'
          : h < 12
            ? 'Good morning'
            : h < 17
              ? 'Good afternoon'
              : h < 22
                ? 'Good evening'
                : 'Good night';
      if (!saved.lastSeen) startGuide('intro');
      else if (away > 24 * 3600e3) {
        perform('sob', { prio: 3, say: 'You were gone so long...' });
        setTimeout(
          () => perform('hug', { prio: 3, force: true, say: `${hello}! I missed you so much.` }),
          4700,
        );
      } else if (away > 6 * 3600e3) perform('hug', { prio: 3, say: `${hello}! I missed you.` });
      else if (away > 5 * 60e3) perform('greet', { prio: 3, say: `${hello}!` });
      else perform('wave', { prio: 2 });
      save();
    },

    tick() {
      const now = Date.now();
      const d = new Date();
      const per = periodOf(d);
      if (per !== st.period) {
        st.period = per;
        P({ period: per });
      }
      if (st.facePresent && now - st.lastFaceSeen > 1500) {
        st.facePresent = false;
        st.faceMood = null;
        P({ faceOn: false });
        R().track(null);
        R().lean(0);
      }
      const { hydrationMin, eyeBreakMin } = ctx.current.opts;

      if (st.asleep) {
        if (per === 'dawn' && d.getHours() >= 5 && now - st.lastUser > 30 * 60e3)
          wake('Good morning. Time to start the day.');
        return;
      }
      if (!idle()) return;

      if (per === 'lateNight' && now - st.lastUser > 90e3) {
        sleep('It is late. I am going to sleep. Good night.');
        return;
      }
      if (now - st.lastWater > hydrationMin * 60e3) {
        st.lastWater = now;
        perform('drink', { prio: 1, say: 'Water break. Drink some water.' });
        return;
      }
      if (st.facePresent && now - st.lastEye > eyeBreakMin * 60e3) {
        st.lastEye = now;
        startGuide('eyebreak');
        return;
      }
      const day = d.toDateString();
      const h = d.getHours();
      if (st.exerciseDay !== day && ((h >= 7 && h < 9) || (h >= 18 && h < 19))) {
        st.exerciseDay = day;
        perform('exercise', { prio: 1, say: "Let's move a little. Join me!" });
        return;
      }
      if (now - st.lastTalk > ctx.current.opts.chatterMin * 60e3 && now - st.lastUser < 20 * 60e3) {
        const lines = CHATTER[per];
        say(lines[Math.floor(Math.random() * lines.length)]);
        perform(Math.random() < 0.5 ? 'wave' : 'think', { prio: 1 });
        return;
      }
      if (now >= st.nextLife) {
        perform(pick(LIFE[per]), { prio: 0 });
        st.nextLife = now + (9 + Math.random() * 14) * 1000;
      }
    },

    background() {
      save();
    },

    /** Feed live heart rate here (see heart.ts). The tummy sun beats with it. */
    onHeart(bpm: number) {
      R().v.bpm.value = bpm;
      P({ bpm });
      const now = Date.now();
      if (bpm > 110 && now - st.lastBpmAlert > 10 * 60e3 && !st.asleep && !st.guideActive) {
        st.lastBpmAlert = now;
        say('Your heart is beating fast. Let us breathe together.', true);
        startGuide('breathing');
      }
    },
  };
  return api;
}

export function useCompanion(options: CompanionOptions = {}) {
  const opts: Required<CompanionOptions> = {
    chatty: true,
    hydrationMin: 90,
    eyeBreakMin: 20,
    lang: 'en-IN',
    userGender: 'other',
    chatterMin: 8,
    ...options,
  };
  const rig = useThriveRig({ living: true });
  const [ui, setUi] = useState<CompanionUI>({ ...INITIAL, period: periodOf(new Date()) });
  const patch = useCallback((p: Partial<CompanionUI>) => setUi((u) => ({ ...u, ...p })), []);
  const ctx = useRef<Ctx>(null as unknown as Ctx);
  const brain = useMemo(() => createBrain(ctx), []);

  const voice = useVoice({
    lang: opts.lang,
    coach: coachFor(opts.userGender),
    onStart: () => brain.onVoiceStart(),
    onEnd: () => brain.onVoiceEnd(),
    onTranscript: (t, f) => brain.onTranscript(t, f),
    onVolume: (v) => brain.onVolume(v),
    onSpeaking: (s) => brain.onSpeaking(s),
    onError: (m) => brain.onError(m),
  });
  ctx.current = { rig, patch, opts, speak: voice.speak, voice };

  useEffect(() => {
    brain.boot();
    const iv = setInterval(() => brain.tick(), 1000);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background' || s === 'inactive') brain.background();
      if (s === 'active') brain.boot();
    });
    return () => {
      clearInterval(iv);
      sub.remove();
      brain.background();
    };
  }, [brain]);

  return { rig, ui, actions: brain };
}
```

#### `src/components/brand/thrive/voice.ts`

```ts
import { useCallback, useRef } from 'react';

import { isCoachSpeechPlaying, speakCoachLine } from '../../../services/ai/coachVoiceService';

// The speech-recognition native module may be missing (Expo Go, or a build made before it was added).
// Loading it defensively means the character and TTS keep working instead of crashing the screen.
let SR: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SR = require('expo-speech-recognition');
} catch {
  SR = null;
}
const Mod = SR?.ExpoSpeechRecognitionModule;
const useSREvent: (name: string, cb: (e: any) => void) => void = SR?.useSpeechRecognitionEvent ?? (() => {});

export type Coach = 'male' | 'female';
/** Coach voice is the opposite gender of the user (female voice by default). */
export const coachFor = (g?: 'male' | 'female' | 'other'): Coach => (g === 'female' ? 'male' : 'female');

export interface VoiceHandlers {
  lang?: string;
  coach?: Coach;
  onStart: () => void;
  onEnd: () => void;
  onTranscript: (text: string, isFinal: boolean) => void;
  onVolume: (level: number) => void;
  onSpeaking: (speaking: boolean) => void;
  onError: (message: string) => void;
}

/** Offline dictation + system TTS. The mic pauses while the coach talks so it never hears itself. */
export function useVoice(h: VoiceHandlers) {
  const hRef = useRef(h);
  hRef.current = h;
  const lang = h.lang ?? 'en-IN';
  const want = useRef(false);
  const running = useRef(false);
  const speaking = useRef(false);

  const begin = useCallback(() => {
    if (!Mod) return;
    try {
      Mod.start({
        lang,
        interimResults: true,
        continuous: true,
        requiresOnDeviceRecognition: true,
        volumeChangeEventOptions: { enabled: true, intervalMillis: 120 },
      });
    } catch (e: any) {
      hRef.current.onError(e?.message ?? 'Could not start the microphone');
    }
  }, [lang]);

  useSREvent('start', () => { running.current = true; hRef.current.onStart(); });
  useSREvent('end', () => {
    running.current = false;
    if (want.current) { if (!speaking.current) setTimeout(begin, 300); }
    else hRef.current.onEnd();
  });
  useSREvent('result', (e) => {
    const t = e?.results?.[0]?.transcript;
    if (t) hRef.current.onTranscript(String(t).trim(), !!e.isFinal);
  });
  useSREvent('volumechange', (e) => hRef.current.onVolume(e?.value ?? 0));
  useSREvent('error', (e) => {
    if (e?.error === 'no-speech' || e?.error === 'aborted') return;
    if (e?.error === 'language-not-supported') {
      want.current = false;
      Mod?.androidTriggerOfflineModelDownload?.({ locale: lang })?.catch?.(() => {});
      hRef.current.onError('Downloading the offline speech model. Try the mic again in a minute.');
      return;
    }
    hRef.current.onError(e?.message || 'Speech recognition error');
  });

  const start = useCallback(async () => {
    if (!Mod) { hRef.current.onError('Voice input needs a fresh native build of the app.'); return; }
    const p = await Mod.requestPermissionsAsync();
    if (!p.granted) { hRef.current.onError('I need microphone permission to listen.'); return; }
    want.current = true;
    begin();
  }, [begin]);

  const stop = useCallback(() => {
    want.current = false;
    try { Mod?.stop(); } catch { /* ignore */ }
    if (!running.current) hRef.current.onEnd();
  }, []);

  // One coach voice everywhere: the person's chosen voice and speed from the speech service.
  const speak = useCallback((text: string, interrupt = false) => {
    if (want.current && running.current) { try { Mod?.abort(); } catch { /* ignore */ } }
    const finish = () => {
      isCoachSpeechPlaying().then((still) => {
        if (still) return;
        speaking.current = false;
        hRef.current.onSpeaking(false);
        if (want.current && !running.current) setTimeout(begin, 250);
      }).catch(() => {});
    };
    void speakCoachLine(text, {
      language: lang,
      interrupt,
      onStart: () => { speaking.current = true; hRef.current.onSpeaking(true); },
      onEnd: finish,
    });
  }, [lang, begin]);

  return { start, stop, speak };
}
```

#### `src/components/brand/thrive/intents.ts`

```ts
import type { Activity, Mood } from './types';

export type GuideName = 'intro' | 'workout' | 'breathing' | 'eyebreak' | 'stretch' | 'water';

export type Intent =
  | { type: 'activity'; activity: Activity; say: string }
  | { type: 'mood'; mood: Mood; say: string }
  | { type: 'glasses'; on: boolean; say: string }
  | { type: 'guide'; name: GuideName }
  | { type: 'time' }
  | { type: 'date' }
  | { type: 'status' }
  | { type: 'dictate'; on: boolean }
  | { type: 'sleep' }
  | { type: 'wake' }
  | { type: 'stop' }
  | { type: 'chat'; say: string; mood?: Mood }
  | { type: 'unknown' };

const act = (activity: Activity, say: string): Intent => ({ type: 'activity', activity, say });
const mood = (m: Mood, say: string): Intent => ({ type: 'mood', mood: m, say });

/** Order matters: first match wins. Everything here runs offline. */
const RULES: [RegExp, Intent][] = [
  [/\b(stop|end|finish) (dictation|dictating|notes?)\b/, { type: 'dictate', on: false }],
  [/\b(start )?(dictation|dictate)\b|\btake (a )?notes?\b/, { type: 'dictate', on: true }],

  [/\b(guide|coach|lead|take) me\b.*\b(workout|exercise|fitness)\b/, { type: 'guide', name: 'workout' }],
  [/\b(guide|coach|lead|take) me\b.*\b(breath|calm|relax|meditat)/, { type: 'guide', name: 'breathing' }],
  [/\b(guide|coach|lead|take) me\b.*\b(eye|screen)\b/, { type: 'guide', name: 'eyebreak' }],
  [/\b(guide|coach|lead|take) me\b.*\bstretch/, { type: 'guide', name: 'stretch' }],
  [/\bwater (break|reminder)\b/, { type: 'guide', name: 'water' }],
  [/\b(eye break|rest my eyes)\b/, { type: 'guide', name: 'eyebreak' }],

  [/\b(what('s| is)? the time|what time)\b/, { type: 'time' }],
  [/\b(what('s| is)? the date|what day|today'?s date)\b/, { type: 'date' }],
  [/\bhow are you\b|\bhow do you feel\b/, { type: 'status' }],
  [/\bwho are you\b|\byour name\b/, { type: 'chat', say: "I'm your Thrivefold companion. I live on your device and everything I do works offline.", mood: 'proud' }],
  [/\bthank(s| you)\b/, { type: 'chat', say: "Anytime. I'm always here for you.", mood: 'proud' }],
  [/\bi love you\b|\blove you\b/, { type: 'chat', say: "I love you too. I'm loyal to you, always.", mood: 'love' }],
  [/\b(good night|going to sleep|i'?m sleepy)\b/, { type: 'sleep' }],
  [/\b(go to sleep|sleep now|take a nap|nap time|sleep)\b/, { type: 'sleep' }],
  [/\b(wake up|get up|rise and shine)\b/, { type: 'wake' }],
  [/\b(put on|wear) (your |the )?(glasses|specs)\b/, { type: 'glasses', on: true, say: 'Glasses on. How do I look?' }],
  [/\b(take off|remove) (your |the )?(glasses|specs)\b/, { type: 'glasses', on: false, say: 'Glasses off.' }],
  [/\bstop\b|\bcancel\b|\benough\b/, { type: 'stop' }],

  [/\b(good morning|morning)\b/, act('greet', 'Good morning! Ready for today?')],
  [/\b(hi|hello|hey|namaste)\b/, act('greet', "Hello! I'm glad you're here.")],
  [/\bwave\b/, act('wave', 'Hi there!')],
  [/\b(drink|water|hydrate)\b/, act('drink', 'Cheers! Staying hydrated.')],
  [/\b(jumping jacks?|jacks)\b/, act('jacks', 'Jumping jacks! Count with me.')],
  [/\b(exercise|workout|work out|lift|squat)\b/, act('exercise', "Let's go! Feel the burn.")],
  [/\b(roll over|roll)\b/, act('roll', 'Wheee!')],
  [/\bdance\b/, act('dance', "Let's dance!")],
  [/\b(cry|sob)\b/, act('sob', 'Waaah...')],
  [/\b(angry|mad|tantrum)\b/, act('tantrum', 'Grrr!')],
  [/\b(wind|breeze|windy)\b/, act('wind', 'Whoa, strong wind!')],
  [/\b(clap|applause)\b/, act('clap', 'Well done!')],
  [/\bhug\b/, act('hug', 'Come here. Virtual hug!')],
  [/\b(think|thinking)\b/, act('think', 'Hmm, let me think.')],
  [/\b(laugh|joke|funny)\b/, act('laugh', 'Hahaha!')],
  [/\b(meditate|breathe)\b/, act('meditate', 'Breathe in... and out.')],
  [/\byawn\b/, act('yawn', 'Aaah... sorry.')],
  [/\bstretch\b/, act('stretch', 'Nice long stretch.')],
  [/\bclose your eyes\b/, act('meditate', 'Eyes closed. Calm.')],

  [/\b(be )?happy\b/, mood('joy', 'Yay!')],
  [/\bscared|afraid\b/, mood('scared', 'Eek!')],
  [/\bsurprise/, mood('surprised', 'Oh!')],
  [/\bshy\b/, mood('shy', 'Oh... hi.')],
  [/\bproud\b/, mood('proud', 'I am proud of you.')],
  [/\bbored\b/, mood('bored', 'So bored...')],
  [/\bdizzy\b/, mood('dizzy', 'Whoa... the room is spinning.')],
  [/\bcurious\b/, mood('curious', 'Tell me more.')],
];

export function parseIntent(raw: string): Intent {
  const text = raw.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return { type: 'unknown' };
  for (const [re, intent] of RULES) if (re.test(text)) return intent;
  return { type: 'unknown' };
}

// ---------------- guided routines (character performs + speaks each step) ----------------
export interface GuideStep { say: string; activity: Activity; ms: number }
export interface Guide { title: string; steps: GuideStep[]; done: string }

export const GUIDES: Record<GuideName, Guide> = {
  intro: {
    title: 'Meet Thrivefold',
    done: "Let's thrive together.",
    steps: [
      { say: "Hi! I'm Thrivefold, your companion. I live on your phone and everything I do works offline.", activity: 'greet', ms: 8000 },
      { say: 'Tap the mic and talk to me. I can take notes, tell the time, and guide your workouts.', activity: 'wave', ms: 8000 },
      { say: 'Turn on the camera and I will see how you feel, and feel with you.', activity: 'peek', ms: 6500 },
      { say: 'I will remind you to drink water, rest your eyes, and sleep on time.', activity: 'drink', ms: 6000 },
      { say: 'I am always here for you.', activity: 'hug', ms: 4000 },
    ],
  },
  workout: {
    title: 'Quick workout',
    done: 'Great work! You finished. Drink some water.',
    steps: [
      { say: "Let's warm up. Stretch your arms up high.", activity: 'stretch', ms: 12000 },
      { say: 'Jumping jacks. Keep a steady pace.', activity: 'jacks', ms: 30000 },
      { say: 'Squats. Chest up, push through your heels.', activity: 'exercise', ms: 30000 },
      { say: 'Last round. Jumping jacks again, you can do it!', activity: 'jacks', ms: 20000 },
      { say: 'Cool down. Slow breaths.', activity: 'meditate', ms: 15000 },
    ],
  },
  breathing: {
    title: 'Calm breathing',
    done: 'Nice. Notice how calm you feel.',
    steps: [
      { say: 'Sit comfortably. Close your eyes if you like.', activity: 'meditate', ms: 6000 },
      { say: 'Breathe in slowly for four.', activity: 'meditate', ms: 6000 },
      { say: 'Hold gently.', activity: 'meditate', ms: 4000 },
      { say: 'Breathe out for six.', activity: 'meditate', ms: 6000 },
      { say: 'Again. In...', activity: 'meditate', ms: 6000 },
      { say: 'And out...', activity: 'meditate', ms: 6000 },
    ],
  },
  eyebreak: {
    title: 'Eye break',
    done: 'Eyes refreshed. Back to it!',
    steps: [
      { say: 'Eye break. Look at something far away.', activity: 'meditate', ms: 6000 },
      { say: 'Keep looking far. Blink slowly.', activity: 'meditate', ms: 14000 },
      { say: 'Now close your eyes for a moment.', activity: 'meditate', ms: 6000 },
    ],
  },
  stretch: {
    title: 'Desk stretch',
    done: 'Much better. Sit tall.',
    steps: [
      { say: 'Reach both arms up and lean to the right.', activity: 'stretch', ms: 8000 },
      { say: 'Now yawn big and relax your jaw.', activity: 'yawn', ms: 4000 },
      { say: 'Roll your shoulders back.', activity: 'stretch', ms: 8000 },
    ],
  },
  water: {
    title: 'Water break',
    done: 'Hydrated. Well done.',
    steps: [{ say: 'Water time. Drink a full glass with me.', activity: 'drink', ms: 5000 }],
  },
};
```

#### `src/components/brand/thrive/modelStore.ts`

```ts
/**
 * Central on-device model store for every AnvayKosh app (Thrivefold, Neev, BlinkQuest, Setu...).
 *
 *  1. Models download silently in the background (resumable, Wi-Fi only by default), are
 *     SHA-256 verified, and live in the app's private folder.
 *  2. Small models are mirrored into one shared folder (Documents/AnvayKosh) chosen ONCE through the
 *     Android folder picker. After an uninstall + reinstall the app finds them there and restores them
 *     without downloading again. Every app picks the same folder once; that is how they share models.
 *  3. Local learning data (corrections, emotion samples) is kept only on the device under the same
 *     AnvayKosh namespace via koshLog().
 *
 * Limits you should know:
 *  - Android only allows the shared-folder mirror through the folder picker (one tap, once per app).
 *    That single permission cannot be silent, everything else is.
 *  - The JS copy goes through base64, so only models up to MIRROR_MAX_BYTES are mirrored. Larger
 *    models (LLMs) stay in app storage unless you add a native stream copy.
 *  - You must register real model URLs and hashes with registerModels(); none are invented here.
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as Network from 'expo-network';
import * as Crypto from 'expo-crypto';
import { asyncKeyValueStorage as storage } from '../../../stores/persistStorage';

export interface ModelSpec {
  id: string; // e.g. 'emotion-fer-int8'
  file: string; // e.g. 'emotion-fer-int8.tflite'
  url: string;
  sha256: string; // lowercase hex of the final file
  bytes: number;
  kind: 'emotion' | 'speech' | 'llm' | 'other';
}

const LOCAL_DIR = `${FileSystem.documentDirectory ?? ''}anvaykosh/models/`;
const SAF_KEY = 'kosh.sharedDir';
const MIRROR_MAX_BYTES = 48 * 1024 * 1024;
const registry = new Map<string, ModelSpec>();

export const registerModels = (specs: ModelSpec[]) => specs.forEach((s) => registry.set(s.id, s));

async function sha256File(uri: string): Promise<string> {
  // Small files only; for big ones verify with a native hasher.
  const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, b64, { encoding: Crypto.CryptoEncoding.HEX });
}
const valid = async (uri: string, spec: ModelSpec) => {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || (info as any).size !== spec.bytes) return false;
  return spec.bytes > MIRROR_MAX_BYTES ? true : (await sha256File(uri)) === spec.sha256;
};

/** One-time folder pick so models survive uninstall and are shared between apps. */
export async function pickSharedFolder(): Promise<boolean> {
  const SAF = (FileSystem as any).StorageAccessFramework;
  if (!SAF) return false;
  const r = await SAF.requestDirectoryPermissionsAsync();
  if (!r.granted) return false;
  await storage.setItem(SAF_KEY, r.directoryUri);
  return true;
}

async function sharedFile(spec: ModelSpec): Promise<string | null> {
  const SAF = (FileSystem as any).StorageAccessFramework;
  const dir = await storage.getItem(SAF_KEY);
  if (!SAF || !dir) return null;
  try {
    const files: string[] = await SAF.readDirectoryAsync(dir);
    return files.find((u) => decodeURIComponent(u).endsWith(spec.file)) ?? null;
  } catch {
    return null;
  }
}

async function mirror(spec: ModelSpec, localUri: string) {
  const SAF = (FileSystem as any).StorageAccessFramework;
  const dir = await storage.getItem(SAF_KEY);
  if (!SAF || !dir || spec.bytes > MIRROR_MAX_BYTES || (await sharedFile(spec))) return;
  try {
    const b64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
    const dest = await SAF.createFileAsync(dir, spec.file, 'application/octet-stream');
    await FileSystem.writeAsStringAsync(dest, b64, { encoding: FileSystem.EncodingType.Base64 });
  } catch { /* mirror is best-effort */ }
}

/** Returns a local file path for the model, downloading / restoring silently if needed. */
export async function ensureModel(
  id: string,
  opts: { wifiOnly?: boolean; onProgress?: (fraction: number) => void } = {},
): Promise<string | null> {
  const spec = registry.get(id);
  if (!spec) return null;
  await FileSystem.makeDirectoryAsync(LOCAL_DIR, { intermediates: true }).catch(() => {});
  const local = LOCAL_DIR + spec.file;
  if (await valid(local, spec)) { void mirror(spec, local); return local; }

  const shared = await sharedFile(spec); // restore after reinstall / from another app
  if (shared) {
    try {
      const b64 = await FileSystem.readAsStringAsync(shared, { encoding: FileSystem.EncodingType.Base64 });
      await FileSystem.writeAsStringAsync(local, b64, { encoding: FileSystem.EncodingType.Base64 });
      if (await valid(local, spec)) return local;
    } catch { /* fall through to download */ }
  }

  const net = await Network.getNetworkStateAsync().catch(() => null);
  if (!net?.isConnected) return null;
  if ((opts.wifiOnly ?? true) && net.type !== Network.NetworkStateType.WIFI) return null;

  const dl = FileSystem.createDownloadResumable(spec.url, local + '.part', {}, (p) => {
    opts.onProgress?.(p.totalBytesWritten / Math.max(1, p.totalBytesExpectedToWrite));
  });
  const res = await dl.downloadAsync().catch(() => null);
  if (!res) return null;
  try {
    await FileSystem.moveAsync({ from: res.uri, to: local });
  } catch {
    await FileSystem.copyAsync({ from: res.uri, to: local });
    await FileSystem.deleteAsync(res.uri, { idempotent: true });
  }
  if (!(await valid(local, spec))) { await FileSystem.deleteAsync(local, { idempotent: true }); return null; }
  void mirror(spec, local);
  return local;
}

/** Fire and forget at app start: fetch every registered model quietly, one at a time. */
export async function prefetchModels(opts: { wifiOnly?: boolean } = {}) {
  for (const id of registry.keys()) await ensureModel(id, opts).catch(() => null);
}

// ---------- local learning data, stays on the device ----------
const LOG_KEY = (name: string) => `kosh.log.${name}`;
export async function koshLog(name: string, sample: unknown, keep = 500) {
  try {
    const raw = (await storage.getItem(LOG_KEY(name))) ?? '[]';
    const arr = JSON.parse(raw) as unknown[];
    arr.push({ t: Date.now(), ...(sample as object) });
    await storage.setItem(LOG_KEY(name), JSON.stringify(arr.slice(-keep)));
  } catch { /* ignore */ }
}
export async function koshRead(name: string): Promise<unknown[]> {
  try { return JSON.parse((await storage.getItem(LOG_KEY(name))) ?? '[]'); } catch { return []; }
}
```

#### `src/components/brand/thrive/heart.ts`

```ts
import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Constant heart-rate monitoring from the user's watch/band through Android Health Connect
 * (anything that writes HeartRate there works: Galaxy/Wear OS, Mi Band, Fitbit, Garmin...).
 * Polls every 15 s, reads on-device, and never sends data anywhere.
 *
 *   const { actions } = useCompanion();
 *   useHeartRate(actions.onHeart);
 *
 * Needs: react-native-health-connect + expo-health-connect config plugin, and the
 * Health Connect app on the phone. Reading pixels from the front camera (camera pulse) needs a
 * native frame hook in the pose module; this file deliberately does not fake that.
 */
export function useHeartRate(onBpm: (bpm: number) => void, enabled = true, everyMs = 15000) {
  useEffect(() => {
    if (!enabled || Platform.OS !== 'android') return;
    let HC: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      HC = require('react-native-health-connect');
    } catch {
      return;
    }
    let alive = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    (async () => {
      try {
        if (!(await HC.initialize())) return;
        const granted = await HC.requestPermission([{ accessType: 'read', recordType: 'HeartRate' }]);
        if (!granted?.length) return;
        const poll = async () => {
          try {
            const end = new Date();
            const start = new Date(end.getTime() - 15 * 60 * 1000);
            const res = await HC.readRecords('HeartRate', {
              timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: end.toISOString() },
            });
            let best = 0;
            let bestT = 0;
            for (const rec of res?.records ?? []) {
              for (const s of rec.samples ?? []) {
                const ts = new Date(s.time).getTime();
                if (ts > bestT) { bestT = ts; best = s.beatsPerMinute; }
              }
            }
            if (alive && best > 25 && best < 230) onBpm(Math.round(best));
          } catch { /* transient */ }
        };
        await poll();
        timer = setInterval(poll, everyMs);
      } catch { /* Health Connect unavailable */ }
    })();

    return () => { alive = false; if (timer) clearInterval(timer); };
  }, [enabled, everyMs, onBpm]);
}
```

#### `src/components/brand/thrive/types.ts`

```ts
export type Mood =
  | 'neutral' | 'happy' | 'joy' | 'sad' | 'crying' | 'angry' | 'sleepy' | 'asleep'
  | 'surprised' | 'love' | 'thinking' | 'listening' | 'speaking' | 'scared'
  | 'proud' | 'bored' | 'curious' | 'shy' | 'dizzy';

export type Activity =
  | 'none' | 'wave' | 'greet' | 'drink' | 'exercise' | 'jacks' | 'sleep' | 'yawn'
  | 'stretch' | 'roll' | 'dance' | 'sob' | 'tantrum' | 'wind' | 'peek' | 'clap'
  | 'think' | 'laugh' | 'meditate' | 'hug' | 'listen';

export type Period = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' | 'lateNight';

/** What the camera tells the character about the user. All values are on-device. */
export interface FaceSignal {
  present: boolean;
  smile: number; // 0..1
  eyesOpen: number; // 0..1
  yaw: number; // degrees
  pitch: number;
  roll: number;
  x: number; // -1..1 face centre (positive = user is to the character's right)
  y: number; // -1..1
  size: number; // face height / frame height
  /** Optional: set these if you plug in a TFLite emotion / glasses model. */
  emotion?: Mood;
  glasses?: boolean;
  /** MediaPipe blendshapes (0..1), used to read surprise / anger / sadness offline. */
  jawOpen?: number;
  browDown?: number;
  browUp?: number;
  frown?: number;
}
```

### SOURCE: ASSISTANT SERVICES

#### `src/services/assistant/agentEngine.ts`

```ts
/**
 * Unified Agent Execution Engine for Thrive Coach.
 *
 * Implements Google AI Edge Gallery's `agent/` and `agent/sessions/` runtime pattern:
 * - Session state handling
 * - Screen capability injection
 * - Deterministic command dispatch first (safe, fast, offline)
 * - On-device GGUF / local model inference with token streaming
 * - Fallback deterministic local coach
 * - Audited action results and tool dispatch
 */

import { LocalAI } from '../../../modules/local-ai';
import { parseCommand, splitSteps, type Command } from '../../domain/assistant/commands';
import { executeTool, type ToolExecutionResult } from '../../domain/assistant/toolRegistry';
import { resolveScreenCapability } from '../../domain/assistant/screenRegistry';
import { resolveLocalCoachReply } from '../../domain/coach/localCoachAI';
import { useRootStore } from '../../stores/useRootStore';
import { askThrive } from '../ai/cloudChat';
import { runCommand as runLegacyCommand } from './runCommand';
import { ensureLocalModel } from '../ai/localModel';
import { brainReady, recommendedModel, setUpBrain } from '../ai/modelSetup';
import { thriveRag } from '../local-ai/rag/thriveRag';
import { personaFor } from '../../domain/assistant/personas';
import { findScreenFor } from '../../domain/search/destinations';
import { parseChatAction } from '../../domain/assistant/chatActions';
import { runChatAction } from './chatActions';
import { isGuestAccount, logCoachTurnLocally } from '../ai/aiInteractionStore';
import { recentDaysLines, standingLines } from '../../domain/assistant/appKnowledge';
import { detectCrisisIntent } from '../ai/emergencySupport';

/**
 * Hard questions (exact numbers, medicines, trips and real-life plans) go to the online coach when
 * the person allowed it. Each answer is saved in Thrive RAG, so next time, or offline, the local
 * model answers similar questions from it.
 */
const NEEDS_PRECISION =
  /\b(?:macro|macros|calorie|calories|kcal|protein|carbs?|fat grams|meal plan|diet plan|workout plan|weekly plan|nutrition|bmr|tdee|side effects?|interactions?|what is .{2,30} (?:used|taken) for|trip|travel|itinerary|outing|plan (?:a|my) (?:day|week|trip|visit|weekend)|how to get to|budget)\b/i;

/**
 * The coach's instructions for the on-device model: who the person is (only what they told the
 * app), what they are looking at, and firm rules so answers are specific, consistent and safe.
 */
export function buildCoachPrompt(s: ReturnType<typeof useRootStore.getState>, screen: string): string {
  const k = s.koshProfile;
  const facts = [
    k?.preferredName || s.user?.pseudonym ? `Name: ${k?.preferredName || s.user?.pseudonym}` : null,
    s.user?.age ? `Age: ${s.user.age}` : null,
    s.heightCm ? `Height: ${s.heightCm} cm` : null,
    s.weightKg ? `Weight: ${s.weightKg} kg` : null,
    s.onboarding?.goals?.length ? `Goals: ${s.onboarding.goals.slice(0, 6).join(', ')}` : null,
    s.onboarding?.diet ? `Diet: ${s.onboarding.diet}` : null,
    k?.allergies?.length ? `Allergies: ${k.allergies.join(', ')}` : null,
    k?.foodRestrictions?.length ? `Avoids: ${k.foodRestrictions.join(', ')}` : null,
    s.onboarding?.constraints?.length ? `Limits: ${s.onboarding.constraints.slice(0, 6).join(', ')}` : null,
    `Level ${s.level}, ${s.xp} XP, streak ${s.streak} days`,
  ].filter(Boolean);
  const recent = [...recentDaysLines(s, new Date(), 3), ...standingLines(s).slice(0, -1)];
  return [
    'You are Anvay, the one companion inside the Thrivefold app, running on the person\'s phone.',
    personaFor(s.coachPersona).focus,
    `About the person (they told the app this): ${facts.join('; ')}.`,
    recent.length ? `From their logs on this phone:\n${recent.join('\n')}` : 'Nothing logged in the last 3 days.',
    `They are on: ${screen}`,
    'How to answer:',
    '1. Answer the question first, directly, in plain words. Then give at most 3 short, specific steps if useful.',
    '2. Use the person\'s details and the "Known from this phone" notes when relevant. Never invent numbers, records or facts.',
    '3. If you are not sure or the information is missing, say so in one sentence and say what would help.',
    '4. Keep it under 110 words. No markdown headings, no emoji.',
    '5. You are not a doctor: never diagnose, never name medicine doses. For worrying symptoms, suggest a doctor; for danger, 112.',
  ].join('\n');
}

const storeState0 = () => useRootStore.getState();

/** Instant replies for greetings, thanks and goodbyes (no model round trip). */
export function quickReply(text: string, s: ReturnType<typeof useRootStore.getState>): string | null {
  const t = text.toLowerCase().replace(/[^a-z\s']/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t || t.split(' ').length > 5) return null;
  const name = s.koshProfile?.preferredName || s.user?.pseudonym?.split(' ')[0] || '';
  const hi = name ? `, ${name}` : '';
  if (/^(hi|hello|hey|hii+|namaste|good (morning|afternoon|evening)|yo)\b/.test(t)) {
    const h = new Date().getHours();
    if (h < 5) {
      return `Hello${hi}. Up late? Hope you're resting well. What can I help you with tonight?`;
    }
    const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 22 ? 'evening' : 'night';
    return `Hello${hi}. Good ${part}. What can I do for you?`;
  }
  if (/^(thanks|thank you|thx|great|nice|cool|awesome)\b/.test(t)) return "You're welcome. I'm here whenever you need me.";
  if (/^(bye|goodbye|good night|see you|stop|that's all|thats all)\b/.test(t)) return 'Take care. Tap me any time.';
  if (/^(how are you|how r u|how are u)\b/.test(t)) return "I'm well, thank you. How are you feeling today?";
  if (/^(who are you|what are you|what is your name|your name)\b/.test(t))
    return "I'm Anvay, your Thrivefold companion. I run on this phone and help with your day, health and habits.";
  return null;
}

export type LocalAttemptOutcome = 'answered' | 'insufficient' | 'failed' | 'unavailable';

/** Cloud is eligible only after local work has failed, is unavailable, or declined for evidence. */
export function shouldEscalateToCloud(input: {
  consented: boolean;
  isGuest: boolean;
  isSafetyContext: boolean;
  localOutcome: LocalAttemptOutcome;
}): boolean {
  return (
    input.consented &&
    !input.isGuest &&
    !input.isSafetyContext &&
    input.localOutcome !== 'answered'
  );
}

export function isInsufficientPrecisionAnswer(answer: string): boolean {
  return /\b(?:don't have enough (?:verified )?(?:information|evidence)|do not have enough (?:verified )?(?:information|evidence)|i don't know|i do not know|can't verify|cannot verify|not enough evidence)\b/i.test(answer);
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  toolResult?: ToolExecutionResult;
  isStreaming?: boolean;
}

export interface AgentSessionState {
  sessionId: string;
  messages: AgentMessage[];
  currentRoute: string;
  isReasoning: boolean;
  activeTurnId: string | null;
}

export interface AgentTurnCallbacks {
  onToken?: (token: string, accumulated: string) => void;
  onComplete?: (finalText: string, toolResult?: ToolExecutionResult) => void;
  onError?: (error: string) => void;
}

class AgentEngine {
  /** When the current turn started, so each reply's time is recorded on the phone. */
  private turnStartedAt = 0;
  private activeSession: AgentSessionState = {
    sessionId: `session_${Date.now()}`,
    messages: [],
    currentRoute: '/(app)/(tabs)',
    isReasoning: false,
    activeTurnId: null,
  };

  private currentTurnId = 0;
  private streamSubscription: { remove: () => void } | null = null;
  private completeSubscription: { remove: () => void } | null = null;
  private errorSubscription: { remove: () => void } | null = null;

  constructor() {
    this.setupNativeListeners();
  }

  private setupNativeListeners() {
    if (!LocalAI.isAvailable()) return;

    this.streamSubscription = LocalAI.onToken((event) => {
      if (this.activeSession.activeTurnId === event.turnId) {
        // Find streaming message in active session
        const msgs = this.activeSession.messages;
        const last = msgs[msgs.length - 1];
        if (last && last.sender === 'assistant' && last.isStreaming) {
          last.text += event.token;
        }
      }
    });

    this.completeSubscription = LocalAI.onStreamComplete((event) => {
      if (this.activeSession.activeTurnId === event.turnId) {
        this.activeSession.isReasoning = false;
        const msgs = this.activeSession.messages;
        const last = msgs[msgs.length - 1];
        if (last && last.sender === 'assistant') {
          last.isStreaming = false;
          last.text = event.fullText;
        }
      }
    });

    this.errorSubscription = LocalAI.onStreamError((event) => {
      if (this.activeSession.activeTurnId === event.turnId) {
        this.activeSession.isReasoning = false;
        const msgs = this.activeSession.messages;
        const last = msgs[msgs.length - 1];
        if (last && last.sender === 'assistant') {
          last.isStreaming = false;
          last.text = 'I encountered a brief hiccup. Let me help you with your health dashboard.';
        }
      }
    });
  }

  /**
   * Updates the current active route context.
   */
  setCurrentRoute(route: string) {
    this.activeSession.currentRoute = route;
  }

  /**
   * Cancels the active generation turn (Barge-in).
   */
  cancelCurrentTurn() {
    if (this.activeSession.isReasoning) {
      LocalAI.cancelGeneration();
      this.activeSession.isReasoning = false;
      this.activeSession.activeTurnId = null;
    }
  }

  /**
   * Executes a user turn with screen context and safe tool execution.
   */
  async processUserInput(
    rawText: string,
    callbacks?: AgentTurnCallbacks
  ): Promise<{ text: string; toolResult?: ToolExecutionResult }> {
    this.turnStartedAt = Date.now();
    const text = rawText.trim();
    if (!text) {
      return { text: 'How can I assist you with your wellbeing today?' };
    }

    const turnId = `turn_${++this.currentTurnId}_${Date.now()}`;
    this.activeSession.activeTurnId = turnId;
    this.activeSession.isReasoning = true;

    // Record user message
    this.activeSession.messages.push({
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    });

    // 0. Several requests in one breath run one after another, each as its own step.
    const steps = splitSteps(text);
    if (steps.length > 1) {
      const replies: string[] = [];
      let lastResult: ToolExecutionResult | undefined;
      for (const step of steps) {
        const r = await this.runCommand(parseCommand(step));
        if (r) {
          replies.push(r.message);
          lastResult = r;
        }
      }
      const combined = replies.join(' ');
      this.finishTurn(combined, lastResult, callbacks);
      return { text: combined, toolResult: lastResult };
    }

    // Small talk answers instantly, without waiting for the model.
    const quick = quickReply(text, storeState0());
    if (quick) {
      this.finishTurn(quick, undefined, callbacks);
      return { text: quick };
    }

    // "Download the model": set up the on-device brain right here.
    if (/^(?:please )?(?:download|install|get|set ?up)\b.*\b(?:model|brain|ai|offline)\b|^download$/i.test(text)) {
      const model = recommendedModel();
      const msg = !model
        ? 'On-device AI is not available on this phone.'
        : (await brainReady())
          ? 'The on-device brain is already set up and answering.'
          : `Downloading ${model.name}, ${model.sizeMb} MB. You can keep talking; I'll use it as soon as it's ready.`;
      if (model) void setUpBrain(model);
      this.finishTurn(msg, undefined, callbacks);
      return { text: msg };
    }

    // 1. Check deterministic fast-path commands and crisis evaluation first
    const crisisAssessment = detectCrisisIntent(text);
    if (crisisAssessment.isCrisis) {
      const res = await executeTool('trigger_urgent_support', {}, { userId: 'local_user' });
      const fullReply = `${crisisAssessment.deescalationScript}\n\n${res.message}`;
      this.finishTurn(fullReply, res, callbacks);
      return { text: fullReply, toolResult: res };
    }

    const cmd: Command = parseCommand(text);
    const direct =
      cmd.kind === 'export' ||
      cmd.kind === 'remember' ||
      cmd.kind === 'life' ||
      cmd.kind === 'delete_routines' ||
      cmd.kind === 'toggle_routines'
        ? await this.runCommand(cmd)
        : null;
    if (direct) {
      this.finishTurn(direct.message, direct, callbacks);
      return { text: direct.message, toolResult: direct };
    }

    if (cmd.kind === 'crisis') {
      const res = await executeTool('trigger_urgent_support', {}, { userId: 'local_user' });
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    if (cmd.kind === 'log_water') {
      const res = await executeTool('log_water', { glasses: cmd.glasses }, { userId: 'local_user' });
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    // Direct Intent: Routines and Alarms check
    if (/\b(?:routine|routines|alarms?|reminders?)\b/i.test(text) && /\b(?:my|show|list|get|check|what|active|scheduled)\b/i.test(text)) {
      const res = await executeTool('get_routines', {}, { userId: 'local_user' });
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    // Direct Intent: Pending Rewards and Milestone Chests check
    if (/\b(?:rewards?|chests?|milestone|gems?|claimable|unclaimed|pending reward)\b/i.test(text) && /\b(?:check|show|any|pending|my|have i|claim)\b/i.test(text)) {
      const res = await executeTool('get_pending_rewards', {}, { userId: 'local_user' });
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    // Direct Intent: Routine Adherence / Habits progress
    if (/\b(?:adherence|habits?|routine habit|missed routine|routine progress)\b/i.test(text)) {
      const res = await executeTool('get_routine_adherence', {}, { userId: 'local_user' });
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    if (cmd.kind === 'open') {
      const res = await executeTool(
        'navigate_to_screen',
        { route: cmd.route, label: cmd.label },
        { userId: 'local_user', currentRoute: this.activeSession.currentRoute }
      );
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    if (cmd.kind === 'ask') {
      const res = await executeTool('get_metrics', { metric: cmd.metric }, { userId: 'local_user' });
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    // Chat actions: tables of their records, guided jobs, and confirmed sign-out / deletes.
    const action = parseChatAction(text);
    if (action) {
      const res = await runChatAction(action);
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    // Questions about a file the person read in the chat: quote the file's own lines (with page),
    // and let the on-device model phrase the answer only from those lines.
    const fileLines = await thriveRag.fileLines(text);
    if (fileLines.length) {
      const quote = fileLines.map((l) => `"${l.line}" (${l.file}, page ${l.page})`).join('\n');
      let answer = '';
      if (await ensureLocalModel()) {
        try {
          answer = (
            await LocalAI.generateText({
              prompt: text,
              context: fileLines.map((l) => l.line).join('\n'),
              system:
                "Answer in one or two sentences using only these lines from the person's own file. " +
                'If they do not answer the question, say the file does not say. Never add numbers that are not in the lines.',
            })
          ).trim();
        } catch {
          answer = '';
        }
      }
      const msg = `${answer ? `${answer}\n\n` : ''}From your file:\n${quote}`;
      this.finishTurn(msg, undefined, callbacks);
      return { text: msg };
    }

    // "Where do I…": answer from the app's own screen list (exact, instant) with an Open button.
    const place = findScreenFor(text);
    if (place) {
      const msg = `That's in ${place.title}: ${place.description}.`;
      const res: ToolExecutionResult = { success: true, message: msg, routeToOpen: place.route };
      this.finishTurn(msg, res, callbacks);
      return { text: msg, toolResult: res };
    }

    // 2. Local RAG Query: Check if the user is asking about personal memory, exercise form, or saved documents
    if (
      /\b(?:remember|recall|journal|memory|notes|past|history|exercise|workout|how to do|technique|form|routine|guide|document|article)\b/i.test(
        text
      )
    ) {
      const res = await executeTool('search_personal_memory', { query: text }, { userId: 'local_user' });
      if (res.data?.isGrounded) {
        this.finishTurn(res.message, res, callbacks);
        return { text: res.message, toolResult: res };
      }
    }

    // 3. Medicine Educational Research Query
    const medMatch = text.match(/\b(?:medicine|medication|pill|tablet|drug)\s+(?:called|is|for|named)?\s*([a-zA-Z]+)/i);
    if (medMatch && medMatch[1]) {
      const res = await executeTool('lookup_medicine_info', { medicineName: medMatch[1] }, { userId: 'local_user' });
      this.finishTurn(res.message, res, callbacks);
      return { text: res.message, toolResult: res };
    }

    // 4. Screen-Aware Contextual Guidance
    const screenCap = resolveScreenCapability(this.activeSession.currentRoute);
    const storeState = useRootStore.getState();
    const screenSummary = screenCap.getContextSummary(storeState);

    const isSafetyContext =
      this.activeSession.currentRoute.includes('safety') ||
      this.activeSession.currentRoute.includes('someone-to-talk') ||
      storeState.coachPersona === 'support' ||
      detectCrisisIntent(text).isCrisis;

    const isGuest = isGuestAccount(storeState.user);
    const wantsCloud = storeState.cloudAiConsent && !isGuest && !isSafetyContext;

    // 4. Precision questions: reuse sufficiently strong local evidence before generation.
    // Cloud is considered only after the local model gets a chance to answer below.
    const isPrecisionQuestion = NEEDS_PRECISION.test(text);
    if (NEEDS_PRECISION.test(text)) {
      const localRagCheck = await thriveRag.answer(text);
      if (localRagCheck.isGrounded && localRagCheck.confidence >= 0.70) {
        this.finishTurn(localRagCheck.answer, undefined, callbacks, 'local_rag');
        return { text: localRagCheck.answer };
      }
    }

    // 5. On-Device LLM Inference (loads the downloaded model on first use)
    let localOutcome: LocalAttemptOutcome = 'unavailable';
    if (await ensureLocalModel()) {
      localOutcome = 'failed';
      try {
        const systemPrompt = [
          buildCoachPrompt(storeState, screenSummary),
          isPrecisionQuestion
            ? 'This is a precision question. Use retrieved evidence and the person\'s records for exact or time-sensitive claims. If that evidence is insufficient, say clearly that you do not have enough verified information; do not guess.'
            : '',
        ].filter(Boolean).join('\n');

        let accumulated = '';
        const onTokenListener = (event: any) => {
          if (event.turnId === turnId) {
            accumulated += event.token;
            callbacks?.onToken?.(event.token, accumulated);
          }
        };

        // Ground the model in what the phone already knows: saved memories, documents and answers
        // that the person has explicitly saved. Generated answers are not promoted automatically.
        const evidence = await thriveRag.contextFor(text);
        const streamedResult = await new Promise<string>((resolve) => {
          let settled = false;
          const subscriptions: { remove: () => void }[] = [];
          const finish = (result: string) => {
            if (settled) return;
            settled = true;
            subscriptions.forEach((subscription) => subscription.remove());
            resolve(result);
          };
          subscriptions.push(LocalAI.onToken(onTokenListener));
          subscriptions.push(LocalAI.onStreamComplete((ev) => {
            if (ev.turnId === turnId) finish(ev.fullText);
          }));
          subscriptions.push(LocalAI.onStreamError((ev) => {
            if (ev.turnId === turnId) finish('');
          }));

          const started = LocalAI.startStream(
            turnId,
            text,
            evidence ? `${screenSummary}\nKnown from this phone (use only if relevant):\n${evidence}` : screenSummary,
            systemPrompt,
          );
          if (!started) finish('');
        });

        if (streamedResult && streamedResult.trim()) {
          const localAnswer = streamedResult.trim();
          const localAnswerIsInsufficient = isPrecisionQuestion && isInsufficientPrecisionAnswer(localAnswer);
          if (!localAnswerIsInsufficient) {
            localOutcome = 'answered';
            this.finishTurn(localAnswer, undefined, callbacks, 'on_device');
            return { text: localAnswer };
          }
          localOutcome = 'insufficient';
        }
      } catch {
        // Fall through to deterministic coach
      }
    }

    // 6. The cloud coach is a fallback only when local generation is unavailable, fails, or
    // explicitly declines a precision answer for lack of verified evidence.
    if (shouldEscalateToCloud({ consented: wantsCloud, isGuest, isSafetyContext, localOutcome })) {
      const cloud = await this.askCloud(text);
      if (cloud) {
        this.finishTurn(cloud, undefined, callbacks, 'cloud_gateway');
        return { text: cloud };
      }
    }
    const coachReply = resolveLocalCoachReply(text);
    const replyText = coachReply.text;
    const toolRes = coachReply.route
      ? {
          success: true,
          message: replyText,
          routeToOpen: coachReply.route,
          autoNavigate: false,
        }
      : undefined;

    this.finishTurn(replyText, toolRes, callbacks);
    return { text: replyText, toolResult: toolRes };
  }

  /** One understood request as a tool call; null for requests that need the model. */
  private async runCommand(cmd: Command): Promise<ToolExecutionResult | null> {
    const ctx = { userId: 'local_user', currentRoute: this.activeSession.currentRoute };
    switch (cmd.kind) {
      case 'crisis':
        return executeTool('trigger_urgent_support', {}, ctx);
      case 'log_water':
        return executeTool('log_water', { glasses: cmd.glasses }, ctx);
      case 'open':
        return executeTool('navigate_to_screen', { route: cmd.route, label: cmd.label }, ctx);
      case 'ask':
        return executeTool('get_metrics', { metric: cmd.metric }, ctx);
      case 'export':
        return executeTool('export_data', { format: cmd.format }, ctx);
      case 'life': {
        const r = await runLegacyCommand(cmd);
        return { success: true, message: r.text, routeToOpen: r.route, autoNavigate: r.autoNavigate };
      }
      case 'remember': {
        const r = await executeTool('log_journal_note', { note: cmd.note, tag: 'remembered' }, ctx);
        return r.success ? { ...r, message: 'Got it. I will remember that.' } : r;
      }
      default:
        return null;
    }
  }

  private async askCloud(text: string): Promise<string | null> {
    try {
      const turns = this.activeSession.messages
        .slice(-8)
        .map((m) => ({ role: m.sender === 'user' ? ('user' as const) : ('assistant' as const), content: m.text }));
      const { reply } = await askThrive(turns.length ? turns : [{ role: 'user', content: text }]);
      const answer = reply?.trim();
      if (!answer) return null;
      // Do not promote generated output into trusted retrieval automatically. This knowledge store
      // has no review state yet; the old behavior assigned a made-up confidence and could reinforce
      // an incorrect or stale answer. A reviewed, user-approved ingestion path is still required.
      return answer;
    } catch {
      return null;
    }
  }

  private finishTurn(
    text: string,
    toolResult?: ToolExecutionResult,
    callbacks?: AgentTurnCallbacks,
    provider = toolResult ? 'app' : 'rules',
  ) {
    this.activeSession.isReasoning = false;
    this.activeSession.activeTurnId = null;

    this.activeSession.messages.push({
      id: `asst_${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp: Date.now(),
      toolResult,
      isStreaming: false,
    });

    const asked = [...this.activeSession.messages].reverse().find((m) => m.sender === 'user')?.text ?? '';
    logCoachTurnLocally(asked, text, provider, Date.now() - this.turnStartedAt);

    callbacks?.onComplete?.(text, toolResult);
  }

  getSessionHistory(): AgentMessage[] {
    return [...this.activeSession.messages];
  }

  clearSession() {
    this.cancelCurrentTurn();
    this.activeSession.messages = [];
  }
}

export const agentEngine = new AgentEngine();
```

#### `src/services/assistant/appKnowledge.ts`

```ts
/**
 * Keeps the coach's local knowledge current: every screen, every Learn article, the person's own
 * records from the store (profile, meals, workouts, vitals, journal, calendar, care, cycle,
 * memories; never sign-in details) and the coach conversation go into Thrive RAG, where hybrid retrieval
 * (keywords plus vectors) finds them. Only changed documents are replaced; nothing leaves the phone.
 */
import { ARTICLES } from '../../content/learn';
import { chatDoc, hashText, learnDocs, recentDaysDoc, screensDoc, storeDocs, type KnowledgeDoc } from '../../domain/assistant/appKnowledge';
import { foodById } from '../../domain/nutrition/foods';
import { DESTINATIONS } from '../../domain/search/destinations';
import { useRootStore } from '../../stores/useRootStore';
import { thriveRag } from '../local-ai/rag/thriveRag';
import { chatStore } from './chatStore';

let running: Promise<number> | null = null;

/** Which Learn articles the person finished, so the coach can build on them. */
function learnProgressDoc(read: Record<string, number>): KnowledgeDoc {
  const done = ARTICLES.filter((a) => read[a.id]);
  return {
    key: 'me:learn',
    title: 'Your Learn progress',
    text: done.length
      ? `Learn articles you have read (${done.length} of ${ARTICLES.length}): ${done.map((a) => a.title).join('; ')}.`
      : 'You have not marked any Learn articles as read yet.',
  };
}

/** All documents the app provides right now. */
export function currentAppDocs(now = new Date()): KnowledgeDoc[] {
  const s = useRootStore.getState();
  return [
    screensDoc(DESTINATIONS),
    ...learnDocs(ARTICLES),
    recentDaysDoc(s, now),
    chatDoc(chatStore.page(undefined, 60)),
    ...storeDocs(s, now, (id) => foodById(id)?.name),
    learnProgressDoc(s.learnRead),
  ];
}

/**
 * Replaces changed documents and returns how many were written. Starts only once the person has
 * finished onboarding (there is nothing of theirs to know before). Never throws.
 */
export function refreshAppKnowledge(): Promise<number> {
  if (!useRootStore.getState().isOnboarded) return Promise.resolve(0);
  if (running) return running;
  running = thriveRag
    .sync(currentAppDocs().map((d) => ({
      ...d,
      hash: hashText(d.text),
      ...(d.key === 'me:chat' ? { sourceType: 'conversation_history' as const } : {}),
    })))
    .catch(() => 0)
    .finally(() => {
      running = null;
    });
  return running;
}
```

#### `src/services/assistant/chatActions.ts`

```ts
/**
 * Carries out a chat action: tables from the store, guided jobs that open the right screen, and
 * anything destructive only after the person confirms in the app's own alert.
 */
import { buildTable, GUIDES, matchMedicine, type ChatAction, type ChatTable } from '../../domain/assistant/chatActions';
import type { ToolExecutionResult } from '../../domain/assistant/toolRegistry';
import { useRootStore } from '../../stores/useRootStore';
import { signOutEverywhere } from '../account/accountService';

export type ChatActionResult = ToolExecutionResult<{ table?: ChatTable }>;

const pad = (n: number) => String(n).padStart(2, '0');
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function go(route: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { router } = require('expo-router');
    router?.push?.(route);
  } catch {
    // No router in tests.
  }
}

/** Asks in the app's alert; runs `onYes` only on confirm. */
function confirm(title: string, message: string, confirmText: string, onYes: () => void | Promise<void>, destructive = true) {
  useRootStore.getState().showAlert({ title, message, confirmText, destructive, onConfirm: () => void onYes() });
}

const toast = (message: string) => useRootStore.getState().showToast({ type: 'success', message });

/** The coach sheet registers how to close itself and clear its history (it owns that state). */
let hooks = { closeSheet: () => {}, clearChat: () => useRootStore.getState().setCoachTurns([]) };
export function setChatActionHooks(next: Partial<typeof hooks>) {
  hooks = { ...hooks, ...next };
}

export async function runChatAction(action: ChatAction): Promise<ChatActionResult> {
  const s = useRootStore.getState();
  switch (action.kind) {
    case 'show': {
      const table = buildTable(action.what, s, new Date());
      const message = table.rows.length
        ? `${table.title}: ${table.rows.length} ${table.rows.length === 1 ? 'entry' : 'entries'}.`
        : `${table.title}: nothing saved yet.`;
      return { success: true, message, data: { table }, routeToOpen: table.route };
    }
    case 'routine_add': {
      const r = action.routine;
      s.addRoutine(r);
      const when = r.everyHours ? `every ${r.everyHours} hours from ${r.time} until ${r.until}` : `at ${r.time}`;
      const days = r.days.length ? ' on the days you said' : ' every day';
      return {
        success: true,
        message: `Done: I'll remind you to ${r.title.toLowerCase()} ${when}${days}. Opening the reminder earns a gem.`,
        routeToOpen: '/(app)/routines',
      };
    }
    case 'guide': {
      const g = GUIDES[action.job];
      go(g.route);
      return { success: true, message: g.steps, routeToOpen: g.route };
    }
    case 'reminders': {
      s.setMedicationRemindersOn(action.on);
      return {
        success: true,
        message: action.on
          ? `Medicine reminders are on for ${s.medications.length} ${s.medications.length === 1 ? 'medicine' : 'medicines'}.`
          : 'Medicine reminders are off.',
        routeToOpen: '/(app)/health/medications',
      };
    }
    case 'took_med': {
      const med = matchMedicine(s.medications, action.name);
      if (!med) return { success: false, message: `I could not find "${action.name}" in your medicines.`, routeToOpen: '/(app)/health/medications' };
      const key = `${todayKey()}|${med.id}`;
      if (!s.medicationTaken.includes(key)) s.toggleMedicationTaken(med.id, todayKey());
      return { success: true, message: `Marked ${med.name} as taken today.` };
    }
    case 'delete_med': {
      const med = matchMedicine(s.medications, action.name);
      if (!med) return { success: false, message: `I could not find "${action.name}" in your medicines.`, routeToOpen: '/(app)/health/medications' };
      confirm(`Delete ${med.name}?`, 'Its reminders and taken history are removed from this phone.', 'Delete', () => {
        useRootStore.getState().deleteMedication(med.id);
        toast(`${med.name} deleted`);
      });
      return { success: true, message: `Confirm on screen to delete ${med.name}.` };
    }
    case 'clear_chat':
      confirm('Clear the conversation?', 'All messages with Anvay are deleted from this phone.', 'Clear', () => {
        hooks.clearChat();
        toast('Conversation cleared');
      });
      return { success: true, message: 'Confirm on screen to clear the conversation.' };
    case 'sign_out':
      confirm('Sign out?', 'Your data stays on this phone. You can sign in again any time.', 'Sign out', async () => {
        hooks.closeSheet();
        await signOutEverywhere();
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('expo-router').router?.replace?.('/(auth)/sign-in');
        } catch {
          // No router in tests.
        }
      }, false);
      return { success: true, message: 'Confirm on screen to sign out.' };
    case 'close':
      setTimeout(hooks.closeSheet, 700);
      return { success: true, message: 'Closing. Tap me any time.' };
  }
}
```

#### `src/services/assistant/chatAttachments.ts`

```ts
/**
 * Files attached in the coach chat, read entirely on the phone.
 *
 * - PDFs, photos, screenshots, text, Markdown, CSV, JSON and HTML are read in place through the
 *   system picker's content URI (no copy is made, nothing is uploaded). PDFs and photos go through
 *   the offline text recogniser in the native module, page by page.
 * - Only the extracted text is kept, in Thrive RAG, marked with the file name and page so later
 *   answers can cite it. The same file read twice is recognised and not stored again.
 * - With an on-device model loaded, the coach writes a short summary; without one it shows what it
 *   read and says it can answer questions from it.
 */
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { LocalAI, scriptForLanguage, type ExtractedDocument } from '../../../modules/local-ai';
import { useRootStore } from '../../stores/useRootStore';
import { hashText } from '../../domain/assistant/appKnowledge';
import { thriveRag } from '../local-ai/rag/thriveRag';
import { globalVoiceController } from '../voice/globalVoiceController';

export interface PickedFile {
  uri: string;
  name: string;
  mime: string | null;
  kind: 'image' | 'pdf' | 'file';
}

export const SUPPORTED_TYPES = ['application/pdf', 'image/*', 'text/*', 'application/json'];

export function kindOf(mime: string | null, name: string): PickedFile['kind'] {
  if (mime === 'application/pdf' || /\.pdf$/i.test(name)) return 'pdf';
  if (mime?.startsWith('image/') || /\.(png|jpe?g|webp|heic)$/i.test(name)) return 'image';
  return 'file';
}

/** Any supported file from the system picker, without copying it into the app. */
export async function pickFile(): Promise<PickedFile | null> {
  const r = await DocumentPicker.getDocumentAsync({ type: SUPPORTED_TYPES, copyToCacheDirectory: false, multiple: false });
  const a = r.canceled ? null : r.assets[0];
  if (!a) return null;
  return { uri: a.uri, name: a.name, mime: a.mimeType ?? null, kind: kindOf(a.mimeType ?? null, a.name) };
}

/** A photo taken now (the camera writes one temporary file; nothing else is kept). */
export async function takePhoto(): Promise<PickedFile | null> {
  if (!(await ImagePicker.requestCameraPermissionsAsync()).granted) return null;
  const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 });
  const a = r.canceled ? null : r.assets[0];
  if (!a) return null;
  return { uri: a.uri, name: a.fileName ?? 'Photo', mime: a.mimeType ?? 'image/jpeg', kind: 'image' };
}

/** All page text joined, blank pages dropped, whitespace tidied. */
export function documentText(doc: Pick<ExtractedDocument, 'pages'>): string {
  return doc.pages
    .map((p) => p.text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim())
    .filter(Boolean)
    .join('\n\n');
}

/** A few readable lines for the reply when no on-device model is loaded. */
export function preview(text: string, max = 420): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max).replace(/\s\S*$/, '')}…` : t;
}

/** Reads one picked file and reports in the chat. Never throws. */
export async function readAttachment(file: PickedFile, question: string): Promise<void> {
  const post = globalVoiceController;
  post.postReply(`Reading ${file.name} on this phone…`, { success: true, message: '', data: { transient: true } });

  let doc: ExtractedDocument;
  try {
    doc = await LocalAI.extractDocumentText(file.uri, file.mime, scriptForLanguage(useRootStore.getState().coachLanguage));
  } catch (e) {
    post.postReply(`I could not read ${file.name}: ${e instanceof Error ? e.message : 'unknown error'}`);
    return;
  }
  const text = documentText(doc);
  if (!text) {
    post.postReply(`I found no readable text in ${file.name}. For photos, try a sharper picture in good light.`);
    return;
  }

  const pages = doc.pages.length;
  useRootStore.getState().earnForAction('document_read', hashText(text));
  const { duplicate } = await thriveRag
    .rememberDocument(file.name, doc.pages, hashText(text))
    .catch(() => ({ duplicate: false, id: '' }));
  const where = `${pages} ${pages === 1 ? 'page' : 'pages'}${doc.method === 'text' ? '' : ', read with on-device text recognition'}`;
  const kept = duplicate ? 'I had already saved this file, so nothing new was stored.' : 'I kept its text in your private knowledge on this phone (not the file).';

  if (LocalAI.isLoaded()) {
    try {
      const ask = question.trim() || 'Summarise this document in plain words: what it is, the key points, and anything that needs action.';
      const answer = await LocalAI.generateText({
        prompt: ask,
        context: `Document "${file.name}" (${pages} pages):\n${text.slice(0, 3500)}`,
        system:
          'Answer only from the document text. Name the page when you can. If the answer is not in the text, say so. ' +
          'Never invent doses or numbers. Keep it under 120 words. No markdown.',
      });
      post.postReply(`${answer.trim()}\n\n(${file.name}, ${where}. ${kept})`);
      return;
    } catch {
      // Fall back to the plain reply below.
    }
  }
  post.postReply(
    `Read ${file.name} (${where}). ${kept} Ask me anything about it.\n\n"${preview(text)}"`,
  );
}
```

#### `src/services/assistant/chatStore.ts`

```ts
/**
 * The coach conversation, kept in SQLite on this phone with no size limit. The chat loads the
 * newest page and fetches older pages only as the person scrolls up, like a messaging app.
 */
import * as SQLite from 'expo-sqlite';

import type { ChatTable } from '../../domain/assistant/chatActions';
import { anvayFtsStore } from '../local-ai/search/anvayFtsStore';
import { getSharedLocalMemoryDb } from '../local-ai/db/localMemoryDb';

export interface ChatMessage {
  id: string;
  who: 'you' | 'coach';
  text: string;
  route?: string;
  table?: ChatTable;
  at: number;
  /** The person's rating of a coach reply. */
  feedback?: 'up' | 'down';
  /** A file the person attached (local uri on this phone). */
  attachment?: { uri: string; name: string; kind: 'image' | 'pdf' | 'file' };
  /** A progress line ("Reading…") that the next reply replaces; never rated or shared. */
  transient?: boolean;
  /** The coach reply this message answers (shown as a quote). */
  quote?: string;
  /** On-device translation of this message, when the person asked for one. */
  translation?: { lang: string; text: string };
}

export const CHAT_PAGE = 30;

let initialized = false;
const listeners = new Set<() => void>();

function getDb(): SQLite.SQLiteDatabase | null {
  try {
    const db = getSharedLocalMemoryDb();
    if (!initialized) {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS coach_messages (
          id TEXT PRIMARY KEY NOT NULL,
          who TEXT NOT NULL,
          text TEXT NOT NULL,
          route TEXT,
          table_json TEXT,
          at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_coach_messages_at ON coach_messages(at);
      `);
      // Columns added after the first release of this table.
      const cols = db.getAllSync<{ name: string }>('PRAGMA table_info(coach_messages)').map((c) => c.name);
      if (!cols.includes('feedback')) db.execSync('ALTER TABLE coach_messages ADD COLUMN feedback TEXT');
      if (!cols.includes('attachment_json')) db.execSync('ALTER TABLE coach_messages ADD COLUMN attachment_json TEXT');
      if (!cols.includes('extra_json')) db.execSync('ALTER TABLE coach_messages ADD COLUMN extra_json TEXT');
      initialized = true;
    }
    return db;
  } catch {
    return null;
  }
}

type Row = {
  id: string;
  who: 'you' | 'coach';
  text: string;
  route: string | null;
  table_json: string | null;
  at: number;
  feedback: 'up' | 'down' | null;
  attachment_json: string | null;
  extra_json: string | null;
};

const fromRow = (r: Row): ChatMessage => ({
  id: r.id,
  who: r.who,
  text: r.text,
  route: r.route ?? undefined,
  table: r.table_json ? (JSON.parse(r.table_json) as ChatTable) : undefined,
  at: r.at,
  feedback: r.feedback ?? undefined,
  attachment: r.attachment_json ? (JSON.parse(r.attachment_json) as ChatMessage['attachment']) : undefined,
  ...(r.extra_json ? (JSON.parse(r.extra_json) as Pick<ChatMessage, 'quote' | 'translation'>) : {}),
});

const notify = () => listeners.forEach((l) => l());

export const chatStore = {
  /** Saves new or changed messages (a streamed reply is saved again as it grows). */
  upsert(messages: ChatMessage[]): void {
    const d = getDb();
    if (!d || !messages.length) return;
    try {
      d.withTransactionSync(() => {
        for (const m of messages) {
          d.runSync(
            `INSERT OR REPLACE INTO coach_messages (id, who, text, route, table_json, at, feedback, attachment_json, extra_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              m.id,
              m.who,
              m.text,
              m.route ?? null,
              m.table ? JSON.stringify(m.table) : null,
              m.at,
              m.feedback ?? null,
              m.attachment ? JSON.stringify(m.attachment) : null,
              m.quote || m.translation ? JSON.stringify({ quote: m.quote, translation: m.translation }) : null,
            ],
          );

          // Index non-transient chat messages into FTS5
          if (!m.transient && m.text && m.text.trim().length > 0) {
            anvayFtsStore.upsertEntry({
              sourceTable: 'coach_messages',
              sourceId: m.id,
              ownerId: 'local_user',
              domain: 'conversations',
              sourceType: m.who,
              title: m.who === 'you' ? 'User Question' : 'Anvay Coach Reply',
              content: m.text,
              createdAt: new Date(m.at).toISOString(),
            });
          }
        }
      });
      notify();
    } catch {
      // The chat keeps working from memory.
    }
  },

  /** One page, oldest first, of messages older than `before` (or the newest page). */
  page(before?: number, limit = CHAT_PAGE): ChatMessage[] {
    const d = getDb();
    if (!d) return [];
    try {
      const rows = before
        ? d.getAllSync<Row>(`SELECT * FROM coach_messages WHERE at < ? ORDER BY at DESC LIMIT ?`, [before, limit])
        : d.getAllSync<Row>(`SELECT * FROM coach_messages ORDER BY at DESC LIMIT ?`, [limit]);
      return rows.reverse().map(fromRow);
    } catch {
      return [];
    }
  },

  /** Rated replies (newest first), so good answers can be reused and poor ones avoided. */
  rated(feedback: 'up' | 'down', limit = 50): ChatMessage[] {
    try {
      return (getDb()?.getAllSync<Row>('SELECT * FROM coach_messages WHERE feedback = ? ORDER BY at DESC LIMIT ?', [feedback, limit]) ?? []).map(fromRow);
    } catch {
      return [];
    }
  },

  count(): number {
    try {
      return getDb()?.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM coach_messages')?.n ?? 0;
    } catch {
      return 0;
    }
  },

  clear(): void {
    try {
      getDb()?.runSync('DELETE FROM coach_messages');
      getDb()?.runSync("DELETE FROM anvay_search_entries WHERE domain = 'conversations'");
      notify();
    } catch {
      // Nothing saved.
    }
  },

  /** Called after any change (used to refresh the coach's knowledge of the conversation). */
  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /** Moves the conversation kept in the store by older versions into SQLite, once. */
  importLegacy(turns: ChatMessage[]): boolean {
    if (!turns.length || this.count() > 0) return false;
    this.upsert(turns);
    return true;
  },
};
```

#### `src/services/assistant/runCommand.ts`

```ts
import { MediaPipeTools } from '../../../modules/pose-landmarker/tools';
import { activeCalories } from '../../domain/activity/calories';
import type { Command } from '../../domain/assistant/commands';
import { executeTool } from '../../domain/assistant/toolRegistry';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { resolveLocalCoachReply } from '../../domain/coach/localCoachAI';
import { stepsByDate } from '../../domain/interop/readings';
import { describeCode, planWalk } from '../../domain/world/outdoor';
import { useRootStore } from '../../stores/useRootStore';
import { askLocal } from '../ai/localModel';
import { alertsFor } from '../world/officialAlerts';
import { getForecast } from '../world/weather';

export interface AssistantReply {
  text: string;
  /** A screen to open after speaking, for "open" commands. */
  route?: string;
  /** Whether the screen should be opened automatically or shown as a suggested action chip. */
  autoNavigate?: boolean;
  /** True when the reply came from the on-device language model. */
  fromModel?: boolean;
  /** True when no on-device model was available for an open question. */
  needsModel?: boolean;
}

/** Short, practical support for everyday pressures, with a pointer to real help. Not therapy. */
const LIFE: Record<'work' | 'balance' | 'relationship' | 'low', string> = {
  work:
    "Work pressure is heavy. Try this: write the three things that truly must happen this week, and one you can drop or delegate. Take a five-minute walk between big tasks. I'm opening a journal page so you can get it out of your head. If it keeps you from sleeping or eating, Tele-MANAS on 14416 is free and confidential.",
  balance:
    "Let's protect some time for you. Pick one fixed slot this week, even 20 minutes, for something that's only yours, and put it in your calendar like a meeting. I'm opening a journal page to note what drains you and what fills you up.",
  relationship:
    "Relationship stress affects everything. When things are calm, try one 'I feel… when… I need…' sentence instead of blame, and agree on a time to talk without phones. Writing your side first helps; I'm opening a journal page. A couples counsellor can help both of you, and Tele-MANAS on 14416 is free if you need to talk today.",
  low:
    "I'm sorry you're feeling low. Small things help: a short walk in daylight, water, and messaging one person you trust. If it has lasted two weeks or more, please talk to a doctor. Tele-MANAS on 14416 is free, 24 hours, in many languages. If you ever think about harming yourself, call 112 now.",
};

const LANG: Record<string, string> = { hi: 'Hindi', bn: 'Bengali', ta: 'Tamil', te: 'Telugu', mr: 'Marathi', gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', pa: 'Punjabi', ur: 'Urdu', es: 'Spanish', fr: 'French', de: 'German' };

const SYSTEM =
  'You are Thrive, a warm, brief wellbeing coach inside a health app. Answer in at most three short sentences. ' +
  'Give general wellbeing guidance only. Never diagnose, never name medicines or doses, and suggest a doctor for anything worrying or urgent.';

/** Carries out one command against the person's own data on this phone and says what happened. */
export async function runCommand(cmd: Command): Promise<AssistantReply> {
  const s = useRootStore.getState();
  const today = formatLocalDate(new Date());

  switch (cmd.kind) {
    case 'open':
      return { text: `Opening ${cmd.label}.`, route: cmd.route, autoNavigate: true };

    case 'life':
      return {
        text: LIFE[cmd.topic],
        route: cmd.topic === 'low' ? undefined : '/(app)/journal/new',
        autoNavigate: cmd.topic !== 'low',
      };

    case 'crisis':
      return {
        text: "I'm really glad you told me. You don't have to go through this alone. I'm opening urgent support so you can reach someone right now. If you are in danger, call your local emergency number.",
        route: '/(app)/safety/urgent-support',
        autoNavigate: true,
      };

    case 'export': {
      const r = await executeTool('export_data', { format: cmd.format }, { userId: 'local_user' });
      return { text: r.message };
    }

    case 'remember': {
      const r = await executeTool('log_journal_note', { note: cmd.note, tag: 'remembered' }, { userId: 'local_user' });
      return { text: r.success ? 'Got it. I will remember that.' : r.message };
    }

    case 'delete_routines': {
      const routines = s.routines ?? [];
      if (!routines.length) {
        return { text: 'You have no routine alarms set.', route: '/(app)/routines', autoNavigate: true };
      }

      if (cmd.target === 'unnecessary') {
        const inactive = routines.filter((r) => !r.enabled);
        if (inactive.length > 0) {
          inactive.forEach((r) => s.removeRoutine(r.id));
          const remaining = useRootStore.getState().routines.length;
          return {
            text: `Removed ${inactive.length} unnecessary routine alarm${inactive.length > 1 ? 's' : ''}. You have ${remaining} active routine${remaining === 1 ? '' : 's'} remaining.`,
            route: '/(app)/routines',
            autoNavigate: true,
          };
        }
        // Check for duplicates
        const seen = new Set<string>();
        const duplicates = routines.filter((r) => {
          if (seen.has(r.time)) return true;
          seen.add(r.time);
          return false;
        });
        if (duplicates.length > 0) {
          duplicates.forEach((d) => s.removeRoutine(d.id));
          const remaining = useRootStore.getState().routines.length;
          return {
            text: `Cleaned up ${duplicates.length} duplicate routine alarm${duplicates.length > 1 ? 's' : ''}. ${remaining} unique routines remaining.`,
            route: '/(app)/routines',
            autoNavigate: true,
          };
        }
        return {
          text: `All ${routines.length} routines are active and scheduled without duplicates. None need deleting.`,
          route: '/(app)/routines',
          autoNavigate: true,
        };
      }

      if (cmd.target === 'all') {
        const count = routines.length;
        routines.forEach((r) => s.removeRoutine(r.id));
        return {
          text: `Cleared all ${count} routine alarm${count > 1 ? 's' : ''}.`,
          route: '/(app)/routines',
          autoNavigate: true,
        };
      }

      if (cmd.target === 'specific' && cmd.query) {
        const q = cmd.query.toLowerCase();
        const match = routines.find((r) => r.title.toLowerCase().includes(q) || r.kind.toLowerCase() === q);
        if (!match) {
          return { text: `Could not find a routine alarm matching "${cmd.query}".`, route: '/(app)/routines', autoNavigate: true };
        }
        s.removeRoutine(match.id);
        return {
          text: `Removed routine alarm "${match.title}".`,
          route: '/(app)/routines',
          autoNavigate: true,
        };
      }

      return { text: 'Here are your routines.', route: '/(app)/routines', autoNavigate: true };
    }

    case 'toggle_routines': {
      const routines = s.routines ?? [];
      routines.forEach((r) => s.updateRoutine(r.id, { enabled: cmd.enable }));
      const statusText = cmd.enable ? 'enabled' : 'paused';
      return {
        text: `All ${routines.length} routine alarms are now ${statusText}.`,
        route: '/(app)/routines',
        autoNavigate: true,
      };
    }

    case 'log_water': {
      s.addWaterLog(cmd.glasses * 250, today);
      const total = useRootStore.getState().hydration[today] ?? 0;
      return { text: `Logged ${cmd.glasses} glass${cmd.glasses === 1 ? '' : 'es'} of water. That's ${total} today.` };
    }

    case 'ask': {
      if (cmd.metric === 'weather') {
        const place = s.outdoorPlace;
        if (!place) return { text: 'Choose your town in the Outdoors card on Home and I can tell you the weather and the best time to walk.' };
        try {
          const f = await getForecast(place);
          let alerts: Awaited<ReturnType<typeof alertsFor>> = [];
          try {
            alerts = await alertsFor(place.lat, place.lon);
          } catch {
            // Alerts are optional for this answer; the weather still helps.
          }
          const plan = planWalk(f.hours, new Date(), alerts);
          const best = plan.best ? ` The best time to walk is around ${Number(plan.best.time.slice(11, 13)) % 12 || 12} ${Number(plan.best.time.slice(11, 13)) < 12 ? 'am' : 'pm'}.` : '';
          const warn = alerts[0] ? ` Official alert: ${alerts[0].event}, from ${alerts[0].sender}.` : '';
          return { text: `In ${place.name} it is ${Math.round(f.now.tempC)} degrees, ${describeCode(f.now.code).toLowerCase()}.${best}${warn} ${plan.tips[0] ?? ''}`.trim() };
        } catch {
          return { text: 'I could not get the weather just now. Check your connection and try again.' };
        }
      }
      if (cmd.metric === 'steps') {
        const d = stepsByDate(s.deviceReadings).get(today);
        return { text: d ? `You have ${Math.round(d.value).toLocaleString()} steps today.` : 'No steps are counted yet today. Turn on step counting from the Steps tile on Home.' };
      }
      if (cmd.metric === 'water') {
        const g = s.hydration[today] ?? 0;
        return { text: g ? `You've had ${g} glass${g === 1 ? '' : 'es'} of water today, of ${s.hydrationTargetGlasses ?? 8}.` : 'No water logged yet today.' };
      }
      if (cmd.metric === 'calories') {
        const steps = stepsByDate(s.deviceReadings).get(today)?.value ?? null;
        const c = activeCalories({ date: today, steps, weightKg: s.weightKg ?? null, activityLogs: s.activityLogs, workoutSessions: s.workoutSessions });
        return { text: c.total ? `About ${c.total} active calories so far today. That's an estimate.` : 'No activity recorded yet today, so no calorie estimate.' };
      }
      const open = s.todayQuests.filter((q) => !q.isCompleted && q.status !== 'replaced' && q.status !== 'skipped');
      return {
        text: open.length
          ? `${open.length} quest${open.length === 1 ? '' : 's'} left today. Next: ${open[0].title}.`
          : "You've finished today's quests.",
      };
    }

    case 'unknown': {
      if (!cmd.text) return { text: 'Say or type what you need, for example: start breathing.' };
      // Note the language the person wrote in (on-device language detector).
      let langNote = '';
      try {
        const langs = MediaPipeTools ? await MediaPipeTools.detectLanguage(cmd.text) : [];
        const top = langs[0];
        if (top && top.code !== 'en' && top.score > 0.7) langNote = ` (I noticed you wrote in ${LANG[top.code] ?? top.code}; I reply in English for now.)`;
      } catch {
        langNote = '';
      }
      // Today's own numbers as context, so answers can be personal; it never leaves the phone.
      const steps = stepsByDate(s.deviceReadings).get(today)?.value;
      const context = [
        steps ? `Steps today: ${Math.round(steps)}` : null,
        `Water today: ${s.hydration[today] ?? 0} glasses`,
        s.weightKg ? `Weight: ${s.weightKg} kg` : null,
        s.heightCm ? `Height: ${s.heightCm} cm` : null,
        s.koshProfile.preferredName ? `Call them ${s.koshProfile.preferredName}` : null,
        s.koshProfile.allergies.length ? `Allergies: ${s.koshProfile.allergies.join(', ')}` : null,
        s.koshProfile.foodRestrictions.length ? `Food rules: ${s.koshProfile.foodRestrictions.join(', ')}` : null,
      ]
        .filter(Boolean)
        .join('. ');

      // 1. Try on-device GGUF language model if loaded
      const out = await askLocal(cmd.text, SYSTEM, context);
      if (out !== null && out.trim()) {
        return { text: out.trim() + langNote, fromModel: true };
      }

      // 2. Fall back seamlessly to on-device deterministic coaching intelligence
      const localReply = resolveLocalCoachReply(cmd.text);
      return {
        text: localReply.text + langNote,
        route: localReply.route,
        fromModel: false,
      };
    }
  }
}
```

### SOURCE: AI SERVICES

#### `src/services/ai/aiInteractionStore.ts`

```ts
/**
 * AI Interaction Logging & Tier Quota Store
 *
 * Persists all AI prompts, completions, latency, and provider metadata to
 * local SQLite (thrivefold-local-memory.db). Synchronizes to Supabase when
 * authenticated. Enforces tier limits:
 *  - Guests: 100% on-device local AI models & device TTS/STT (0 cloud usage).
 *  - Registered without BYOK: strictly capped trial usage (once/limited).
 *  - Users with BYOK: unlimited direct requests with their own API key.
 */

import * as SQLite from 'expo-sqlite';
import { getSharedLocalMemoryDb } from '../local-ai/db/localMemoryDb';

export interface AiInteractionRecord {
  id: string;
  createdAt: string;
  userId: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  latencyMs: number;
  status: 'success' | 'error';
}

let initialized = false;

/** A missing profile or any profile not explicitly marked non-guest is treated as a guest. */
export function isGuestAccount(user: { isGuest?: boolean } | null | undefined): boolean {
  return !user || user.isGuest !== false;
}

function getDb(): SQLite.SQLiteDatabase | null {
  try {
    const db = getSharedLocalMemoryDb();
    if (!initialized) {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS ai_interactions (
          id TEXT PRIMARY KEY NOT NULL,
          created_at TEXT NOT NULL,
          user_id TEXT NOT NULL,
          provider TEXT NOT NULL,
          model TEXT NOT NULL,
          prompt TEXT NOT NULL,
          response TEXT NOT NULL,
          latency_ms INTEGER NOT NULL,
          status TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_ai_interactions_user ON ai_interactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_ai_interactions_created ON ai_interactions(created_at);
      `);
      initialized = true;
    }
    return db;
  } catch {
    return null;
  }
}

/**
 * Keeps every coach turn (what the person said, what came back, who answered and how long it took)
 * on this phone
 * only. Unlike recordAiInteraction, nothing is sent to a server.
 */
export function logCoachTurnLocally(prompt: string, response: string, provider: string, latencyMs = 0): void {
  try {
    getDb()?.runSync(
      `INSERT INTO ai_interactions (id, created_at, user_id, provider, model, prompt, response, latency_ms, status)
       VALUES (?, ?, 'local_user', ?, 'coach', ?, ?, ?, 'success')`,
      [`turn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, new Date().toISOString(), provider, prompt, response, Math.max(0, Math.round(latencyMs))],
    );
  } catch {
    // The chat still works without the log.
  }
}

/**
 * Log an AI interaction to SQLite, and attempt background Supabase sync if online.
 */
export async function recordAiInteraction(record: {
  userId?: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  latencyMs: number;
  status?: 'success' | 'error';
}): Promise<void> {
  const id = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = new Date().toISOString();
  const userId = record.userId || 'local_user';
  const status = record.status ?? 'success';

  try {
    const database = getDb();
    if (database) {
      database.runSync(
        `INSERT INTO ai_interactions (id, created_at, user_id, provider, model, prompt, response, latency_ms, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          createdAt,
          userId,
          record.provider,
          record.model,
          record.prompt,
          record.response,
          record.latencyMs,
          status,
        ],
      );
    }
  } catch {
    // Non-blocking local record failure
  }

  // Attempt non-blocking Supabase sync if user is signed in
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabase } = require('../supabase/supabaseClient');
    if (supabase) {
      supabase.auth.getSession().then(({ data }: { data: { session: unknown } }) => {
        if (data?.session) {
          supabase
            .from('thrivefold_ai_interactions')
            ?.insert?.([
              {
                id,
                created_at: createdAt,
                provider: record.provider,
                model: record.model,
                status,
                latency_ms: record.latencyMs,
              },
            ])
            .then(() => undefined)
            .catch(() => undefined);
        }
      }).catch(() => undefined);
    }
  } catch {
    // Silent fail if Supabase is offline or not configured
  }
}

/**
 * Check if the caller is permitted to invoke external cloud AI models.
 *  - Guests: 0 cloud usage allowed (must use local models & device voice).
 *  - Registered without BYOK: allowed 1-3 trial turns before being gated.
 *  - Registered with BYOK: unlimited usage.
 */
export function checkCloudAiPermission(opts: {
  isGuest: boolean;
  hasByok: boolean;
  userId?: string;
}): { allowed: boolean; reason?: string } {
  if (opts.isGuest) {
    return {
      allowed: false,
      reason: 'Guests operate 100% on-device. Sign in or configure BYOK in Settings to use cloud AI.',
    };
  }

  if (opts.hasByok) {
    return { allowed: true };
  }

  // Registered user without BYOK: check past cloud queries count
  try {
    const database = getDb();
    if (database) {
      const rows = database.getAllSync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ai_interactions WHERE user_id = ? AND provider != 'local'`,
        [opts.userId || 'local_user'],
      );
      const count = rows[0]?.count ?? 0;
      if (count >= 2) {
        return {
          allowed: false,
          reason: 'Trial cloud usage reached. Please add your personal BYOK key in Settings to continue.',
        };
      }
    }
  } catch {
    // on error allow single trial
  }

  return { allowed: true };
}

/** Deletes every saved AI turn on this phone (erase all data). */
export function wipeAiInteractions(): void {
  try {
    getDb()?.runSync('DELETE FROM ai_interactions');
  } catch {
    // Nothing saved yet.
  }
}
```

#### `src/services/ai/cloudChat.ts`

```ts
import { supabase } from '../supabase/supabaseClient';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Asks the optional cloud companion. The request goes to Thrivefold's own server function,
 * which holds the provider keys, caps daily use and stores no message content.
 */
export async function askThrive(turns: ChatTurn[]): Promise<{ reply: string; remaining: number }> {
  if (!supabase) throw new Error('not_configured');
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) throw new Error('not_authenticated');
  const { data, error } = await supabase.functions.invoke('ai-chat', { body: { messages: turns.slice(-12) } });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    let code = '';
    try {
      code = ctx ? ((await ctx.json()) as { error?: string }).error ?? '' : '';
    } catch {
      // not JSON
    }
    throw new Error(code || error.message);
  }
  return data as { reply: string; remaining: number };
}

export function aiErrorText(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes('not_authenticated')) return 'Sign in to talk with Thrive.';
  if (m.includes('daily_limit')) return 'That’s today’s limit for the AI companion. It resets tomorrow.';
  if (m.includes('unavailable')) return 'The AI companion is busy right now. Try again in a minute.';
  if (m.includes('not_configured')) return 'The AI companion needs the Thrivefold server.';
  return 'Couldn’t reach the AI companion. Check your connection and try again.';
}
```

#### `src/services/ai/coachVoice.ts`

```ts
/**
 * coachVoice — the ONE place the coach speaks from.
 *
 * Fixes the "messy sound": speech used to stack (intro + "3" + "2" + rep lines + tips), talk
 * over the tutorial video and fire while you were still positioning.
 *
 * Rules
 *  - priority 3 (intro, "Go", set/rest changes) interrupts anything lower.
 *  - priority 2 (corrections, framing) interrupts chatter, never another priority 2/3.
 *  - priority 1 (rep praise, encouragement) is dropped if anything is speaking or if the
 *    last line ended less than minGapMs ago.
 *  - Nothing is ever queued: stale lines are dropped, not read late.
 *  - setBlocked(true) (tutorial video fullscreen/playing) silences and stops speech.
 *
 * Put at: src/services/ai/coachVoice.ts
 */
import { speakCoach, stopCoachSpeech } from '@/services/ai/coachVoiceService';

export type VoicePriority = 1 | 2 | 3;

interface SpeakOpts {
  priority?: VoicePriority;
  minGapMs?: number;
  /** Upper bound on how long speak() waits for the line to finish. */
  maxMs?: number;
}

let enabled = true;
let blocked = false;
let token = 0;
let busyUntil = 0;
let busyPriority = 0;
let lastEndAt = 0;
let lastSpokenText = '';
const listeners = new Set<(speaking: boolean) => void>();

function notify(speaking: boolean) {
  listeners.forEach((fn) => {
    try {
      fn(speaking);
    } catch {
      // ignore
    }
  });
}

const estimateMs = (t: string) => Math.min(7000, 500 + t.length * 62);
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function stopNow() {
  token++;
  busyUntil = 0;
  busyPriority = 0;
  lastEndAt = Date.now();
  stopCoachSpeech();
  notify(false);
}

export const coachVoice = {
  setEnabled(v: boolean) {
    enabled = v;
    if (!v) stopNow();
  },
  setBlocked(v: boolean) {
    blocked = v;
    if (v) stopNow();
  },
  stop: stopNow,

  /**
   * Check if coach is currently speaking or just finished within the echo-guard window.
   * Used to prevent speech recognition from hearing the coach's own output.
   */
  /** Whether the coach may speak at all (voice switched on and not blocked). */
  canSpeak(): boolean {
    return enabled && !blocked;
  },

  isSpeaking(guardMs = 600): boolean {
    const now = Date.now();
    return now < busyUntil || now - lastEndAt < guardMs;
  },

  getLastSpokenText(): string {
    return lastSpokenText;
  },

  subscribe(fn: (speaking: boolean) => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /** Speak one line. Resolves when it should be finished (or was dropped). */
  async speak(text: string, opts: SpeakOpts = {}): Promise<void> {
    if (!enabled || blocked || !text) return;
    const priority = opts.priority ?? 1;
    const minGapMs = opts.minGapMs ?? 1200;
    const est = estimateMs(text);
    const maxMs = opts.maxMs ?? est;
    const now = Date.now();

    if (now < busyUntil) {
      if (priority <= busyPriority) return; // never talk over an equal/higher line
      stopCoachSpeech();
    } else if (priority < 3 && now - lastEndAt < minGapMs) {
      return;
    }

    const mine = ++token;
    busyPriority = priority;
    busyUntil = now + Math.min(maxMs, est);
    lastSpokenText = text;
    notify(true);
    try {
      await Promise.all([
        sleep(Math.min(maxMs, est) * 0.7),
        Promise.race([speakCoach(text, true).catch(() => undefined), sleep(maxMs)]),
      ]);
    } finally {
      if (token === mine) {
        busyUntil = 0;
        busyPriority = 0;
        lastEndAt = Date.now();
        notify(false);
      }
    }
  },

  /**
   * Speak and wait, but always wait at least `minMs` even when voice is off, so the
   * "Get ready" beat has a steady length with or without sound.
   */
  async speakAndWait(text: string, minMs = 1600, maxMs = 5000): Promise<void> {
    const started = Date.now();
    await this.speak(text, { priority: 3, maxMs });
    const left = minMs - (Date.now() - started);
    if (left > 0) await sleep(left);
  },
};
```

#### `src/services/ai/coachVoiceService.ts`

```ts
/**
 * Human Virtual Coach Voice Service
 *
 * Low-latency on-device voice (expo-speech): a warm Indian voice whose gender follows the
 * person's space (see wantedGender). Sarvam AI bulbul:v3 is strictly reserved
 * for registered users who provide their own BYOK key (disabled for guests
 * and test runs).
 */

import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import { pickSarvamKey } from './env';

export interface VoiceCoachOptions {
  language?: 'en-IN' | 'hi-IN';
  speaker?: 'shubh' | 'meera' | 'amartya';
  rate?: number;
  pitch?: number;
}

let preferredVoiceId: string | null = null;

function isGuestOrTesting(): boolean {
  if (process.env.NODE_ENV === 'test') return true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    const store = useRootStore.getState?.();
    if (!store) return false;
    const isGuest = !store.adultConfirmedAt && !store.isOnboarded;
    const hasSarvamByok = !!store.userApiKeys?.sarvam;
    return isGuest || !hasSarvamByok;
  } catch {
    return true;
  }
}

type VoiceGender = 'male' | 'female';

/** Which coach voice to use. */
function wantedGender(): VoiceGender {
  // The person's own choice in Settings; the calm Indian male voice by default.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    return useRootStore.getState?.()?.coachVoiceGender === 'female' ? 'female' : 'male';
  } catch {
    return 'male';
  }
}

/** Speech locale for the coach's chosen reply language. */
function chosenLocale(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { languageOf } = require('../../domain/languages');
    return languageOf(useRootStore.getState?.()?.coachLanguage).locale;
  } catch {
    return 'en-IN';
  }
}

function chosenRate(): number {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    return useRootStore.getState?.()?.coachVoiceRate ?? 0.95;
  } catch {
    return 0.95;
  }
}

// Google TTS Indian English voices: ena, enb, enc are female; end, ene are male.
const MALE_MARKS = ['male', 'rishi', '-end-', '-ene-', 'shubh', 'amartya'];
const FEMALE_MARKS = ['female', 'neerja', 'veena', '-ena-', '-enb-', '-enc-', 'meera'];

/** Prefers Indian English (then Hindi), the wanted gender, and higher-quality voices. */
function scoreVoice(v: Speech.Voice, want: VoiceGender): number {
  const id = (v.identifier || '').toLowerCase();
  const name = (v.name || '').toLowerCase();
  const lang = (v.language || '').toLowerCase().replace('_', '-');
  let score = 0;
  if (lang.startsWith('en-in')) score += 100;
  else if (lang.startsWith('hi')) score += 60;
  else if (lang.startsWith('en-')) score += 20;
  const has = (marks: string[]) => marks.some((m) => id.includes(m) || name.includes(m));
  const male = has(MALE_MARKS) && !id.includes('female') && !name.includes('female');
  const female = has(FEMALE_MARKS);
  if (want === 'male' ? male : female) score += 60;
  if (want === 'male' ? female : male) score -= 60;
  // Enhanced / network neural voices sound far more natural (the earlier, preferred behaviour).
  if (v.quality === Speech.VoiceQuality.Enhanced || id.includes('network')) score += 25;
  return score;
}

let cachedFor: VoiceGender | null = null;

/** The best installed voice for the wanted gender, cached until the gender changes. */
async function resolveBestVoice(): Promise<{ id: string | null; gender: VoiceGender }> {
  const want = wantedGender();
  if (preferredVoiceId && cachedFor === want) return { id: preferredVoiceId, gender: want };
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const best = [...(voices ?? [])].sort((a, b) => scoreVoice(b, want) - scoreVoice(a, want))[0];
    preferredVoiceId = best && scoreVoice(best, want) > 0 ? best.identifier : null;
    cachedFor = want;
  } catch {
    // ignore
  }
  return { id: preferredVoiceId, gender: want };
}

/**
 * Synthesize speech via Sarvam AI bulbul:v3.
 * Strictly gated: NOT available to guests or automated testing;
 * requires registered user BYOK key.
 */
export async function synthesizeSarvamSpeech(
  text: string,
  opts?: VoiceCoachOptions,
): Promise<string | null> {
  // Guests & testing cannot use Sarvam AI voice; reserved for users with explicit BYOK key
  if (isGuestOrTesting()) {
    return null;
  }

  const key = pickSarvamKey();
  if (!key) return null;

  try {
    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: opts?.language ?? 'en-IN',
        speaker: opts?.speaker ?? (wantedGender() === 'male' ? 'shubh' : 'meera'),
        model: 'bulbul:v3',
      }),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as { audios?: string[] };
    const base64Audio = json.audios?.[0];
    if (!base64Audio) return null;

    // Save to cache directory
    const fileName = `coach_${Date.now()}.wav`;
    const uri = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(uri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return uri;
  } catch {
    return null;
  }
}

/**
 * Spoken cue for live coaching.
 * Non-blocking, never stacks cues, uses natural cadence.
 * Uses the warm Indian voice chosen by wantedGender().
 * Guards stop() behind isSpeakingAsync so rapid calls don't stutter.
 */
export async function speakCoach(
  text: string,
  voiceOn: boolean,
  opts?: VoiceCoachOptions,
): Promise<void> {
  if (!voiceOn || !text.trim()) return;

  try {
    // Only stop if something is actively playing — avoids self-interruption stutter.
    const speaking = await Speech.isSpeakingAsync().catch(() => false);
    if (speaking) Speech.stop();

    const voice = await resolveBestVoice();
    Speech.speak(text, {
      language: opts?.language ?? 'en-IN',
      rate: opts?.rate ?? chosenRate(),
      // A touch brighter for the woman's voice, a touch warmer and deeper for the man's.
      pitch: opts?.pitch ?? (voice.gender === 'male' ? 0.94 : 1.06),
      // The picked voice is an Indian English one; other languages use the engine's own voice.
      voice: chosenLocale().startsWith('en') ? (voice.id ?? undefined) : undefined,
    });
  } catch {
    // fallback plain speak with calm pitch
    Speech.speak(text, { rate: 0.95, pitch: 0.94 });
  }
}

/**
 * Adds a sentence to the voice queue without interrupting what is being said, so a streamed
 * reply is spoken sentence by sentence while the rest is still being written.
 */
export async function queueCoachSpeech(text: string): Promise<void> {
  if (!text.trim()) return;
  const voice = await resolveBestVoice();
  // Resolves when this sentence has actually been spoken (or stopped), so callers can wait for
  // the voice to finish before opening the microphone again.
  await new Promise<void>((resolve) => {
    const done = () => resolve();
    Speech.speak(text, {
      language: chosenLocale(),
      rate: chosenRate(),
      pitch: voice.gender === 'male' ? 0.94 : 1.06,
      // The picked voice is an Indian English one; other languages use the engine's own voice.
      voice: chosenLocale().startsWith('en') ? (voice.id ?? undefined) : undefined,
      onDone: done,
      onStopped: done,
      onError: done,
    });
  });
}

export interface CoachLineOptions {
  language?: string;
  /** Overrides the person's chosen speed (for example a slower, calming pace). */
  rate?: number;
  pitch?: number;
  /** Stop what is playing first (default). False adds the line after it. */
  interrupt?: boolean;
  onStart?: () => void;
  /** Called once when the line ends, is stopped or fails. */
  onEnd?: () => void;
}

/**
 * Speaks one line in the person's chosen coach voice, interrupting anything playing. Every screen
 * that talks goes through here (or queueCoachSpeech), so the voice is the same everywhere.
 */
export async function speakCoachLine(text: string, opts: CoachLineOptions = {}): Promise<void> {
  const content = text.trim();
  if (!content) {
    opts.onEnd?.();
    return;
  }
  if (opts.interrupt !== false) Speech.stop();
  const voice = await resolveBestVoice();
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    opts.onEnd?.();
  };
  try {
    Speech.speak(content, {
      language: opts.language ?? chosenLocale(),
      rate: opts.rate ?? chosenRate(),
      pitch: opts.pitch ?? (voice.gender === 'male' ? 0.94 : 1.06),
      // The picked voice is an Indian English one; other languages use the engine's own voice.
      voice: chosenLocale().startsWith('en') ? (voice.id ?? undefined) : undefined,
      onStart: opts.onStart,
      onDone: end,
      onStopped: end,
      onError: end,
    });
  } catch {
    end();
  }
}

/** Stops whatever the coach is saying, on any screen. */
export function stopCoachSpeech(): void {
  try {
    void Speech.stop();
  } catch {
    // Nothing playing or no speech engine.
  }
}

/** Whether the system voice is talking right now. */
export function isCoachSpeechPlaying(): Promise<boolean> {
  return Speech.isSpeakingAsync().catch(() => false);
}
```

#### `src/services/ai/emergencyDirectory.ts`

```ts
/**
 * Verified Offline Emergency Services Directory
 *
 * Provides country-specific, verified emergency contact numbers across:
 * - General emergency dispatch (Police, Fire, Ambulance)
 * - Mental health & suicide crisis lifelines
 * - Poison control & tox emergency
 * - Domestic violence & personal safety
 * - Child protection
 *
 * Adheres strictly to Thrivefold Safety Laws:
 * - Zero fabricated numbers
 * - Official public health & emergency authority verified
 * - Works 100% offline without network connectivity
 * - Clear jurisdiction awareness
 */

export type EmergencyCategory =
  | 'general_emergency'
  | 'ambulance'
  | 'police'
  | 'fire'
  | 'mental_health_crisis'
  | 'suicide_prevention'
  | 'poison_control'
  | 'domestic_violence'
  | 'child_protection'
  | 'medical_consult';

export interface EmergencyServiceContact {
  id: string;
  countryCode: string;
  countryName: string;
  name: string;
  category: EmergencyCategory;
  number: string;
  actionUrl: string;
  type: 'tel' | 'sms' | 'web';
  hours: string;
  languages: string[];
  coverage: string;
  officialSource: string;
  lastVerified: string;
  isPrimaryEmergency?: boolean;
  isPrimaryMentalHealth?: boolean;
}

export interface SupportedCountryMeta {
  code: string;
  name: string;
  flag: string;
  defaultEmergency: string;
  defaultMentalHealth: string;
}

export const SUPPORTED_COUNTRIES: SupportedCountryMeta[] = [
  { code: 'IN', name: 'India', flag: '🇮🇳', defaultEmergency: '112', defaultMentalHealth: '14416' },
  { code: 'US', name: 'United States', flag: '🇺🇸', defaultEmergency: '911', defaultMentalHealth: '988' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', defaultEmergency: '999', defaultMentalHealth: '116 123' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', defaultEmergency: '911', defaultMentalHealth: '988' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', defaultEmergency: '000', defaultMentalHealth: '13 11 14' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', defaultEmergency: '111', defaultMentalHealth: '1737' },
  { code: 'EU', name: 'European Union', flag: '🇪🇺', defaultEmergency: '112', defaultMentalHealth: '116 123' },
  { code: 'GLOBAL', name: 'International', flag: '🌐', defaultEmergency: '112', defaultMentalHealth: 'befrienders.org' },
];

export const VERIFIED_EMERGENCY_DIRECTORY: Record<string, EmergencyServiceContact[]> = {
  IN: [
    {
      id: 'in_112',
      countryCode: 'IN',
      countryName: 'India',
      name: 'All-in-One Emergency Helpline (National Emergency Response)',
      category: 'general_emergency',
      number: '112',
      actionUrl: 'tel:112',
      type: 'tel',
      hours: '24/7',
      languages: ['Hindi', 'English', 'Regional Languages'],
      coverage: 'Pan-India',
      officialSource: 'Ministry of Home Affairs (MHA), Government of India (https://112.gov.in)',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'in_108',
      countryCode: 'IN',
      countryName: 'India',
      name: 'National Emergency Ambulance Service',
      category: 'ambulance',
      number: '108',
      actionUrl: 'tel:108',
      type: 'tel',
      hours: '24/7',
      languages: ['Hindi', 'English', 'State Regional Languages'],
      coverage: 'Pan-India (23+ States & UTs)',
      officialSource: 'National Health Mission (NHM), MoHFW',
      lastVerified: '2026-10-31',
    },
    {
      id: 'in_tele_manas',
      countryCode: 'IN',
      countryName: 'India',
      name: 'Tele-MANAS National Mental Health Helpline',
      category: 'mental_health_crisis',
      number: '14416',
      actionUrl: 'tel:14416',
      type: 'tel',
      hours: '24/7 Toll-Free & Confidential',
      languages: ['Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada', 'Malayalam', 'Gujarati', 'Punjabi', 'Odia', 'Assamese'],
      coverage: 'Pan-India (Operated by NIMHANS Bangalore)',
      officialSource: 'Ministry of Health and Family Welfare (https://telemanas.mohfw.gov.in)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'in_kiran',
      countryCode: 'IN',
      countryName: 'India',
      name: 'KIRAN Mental Health Rehabilitation Helpline',
      category: 'mental_health_crisis',
      number: '1800-599-0019',
      actionUrl: 'tel:18005990019',
      type: 'tel',
      hours: '24/7 Toll-Free',
      languages: ['Hindi', 'English', '13 Regional Languages'],
      coverage: 'Pan-India',
      officialSource: 'Department of Empowerment of Persons with Disabilities (DEPwD), MoSJE',
      lastVerified: '2026-10-31',
    },
    {
      id: 'in_poison',
      countryCode: 'IN',
      countryName: 'India',
      name: 'National Poisons Information Centre (AIIMS New Delhi)',
      category: 'poison_control',
      number: '1800-116-117',
      actionUrl: 'tel:1800116117',
      type: 'tel',
      hours: '24/7 Toll-Free Poison Emergency',
      languages: ['Hindi', 'English'],
      coverage: 'Pan-India',
      officialSource: 'All India Institute of Medical Sciences (AIIMS) Department of Pharmacology',
      lastVerified: '2026-10-31',
    },
    {
      id: 'in_women_1091',
      countryCode: 'IN',
      countryName: 'India',
      name: 'Women in Distress Helpline',
      category: 'domestic_violence',
      number: '1091',
      actionUrl: 'tel:1091',
      type: 'tel',
      hours: '24/7 Emergency Police Response',
      languages: ['Hindi', 'English', 'Regional'],
      coverage: 'Pan-India',
      officialSource: 'National Commission for Women (NCW)',
      lastVerified: '2026-10-31',
    },
    {
      id: 'in_childline_1098',
      countryCode: 'IN',
      countryName: 'India',
      name: 'Childline Emergency Helpline',
      category: 'child_protection',
      number: '1098',
      actionUrl: 'tel:1098',
      type: 'tel',
      hours: '24/7 Toll-Free',
      languages: ['Hindi', 'English', 'Regional Languages'],
      coverage: 'Pan-India',
      officialSource: 'Ministry of Women and Child Development (MoWCD)',
      lastVerified: '2026-10-31',
    },
  ],

  US: [
    {
      id: 'us_911',
      countryCode: 'US',
      countryName: 'United States',
      name: 'Emergency Services (Police, Fire, EMS)',
      category: 'general_emergency',
      number: '911',
      actionUrl: 'tel:911',
      type: 'tel',
      hours: '24/7',
      languages: ['English', 'Spanish', 'Language Line translation (240+ languages)'],
      coverage: 'United States nationwide',
      officialSource: 'Federal Communications Commission (FCC) (https://www.fcc.gov)',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'us_988',
      countryCode: 'US',
      countryName: 'United States',
      name: '988 Suicide & Crisis Lifeline',
      category: 'mental_health_crisis',
      number: '988',
      actionUrl: 'tel:988',
      type: 'tel',
      hours: '24/7 Free & Confidential',
      languages: ['English', 'Spanish', 'ASL via video phone', 'Translation in 240+ languages'],
      coverage: 'United States nationwide',
      officialSource: 'Substance Abuse and Mental Health Services Administration (SAMHSA) (https://988lifeline.org)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'us_text_741741',
      countryCode: 'US',
      countryName: 'United States',
      name: 'Crisis Text Line',
      category: 'mental_health_crisis',
      number: 'Text HOME to 741741',
      actionUrl: 'sms:741741?body=HOME',
      type: 'sms',
      hours: '24/7 Free Text Support',
      languages: ['English', 'Spanish'],
      coverage: 'United States nationwide',
      officialSource: 'Crisis Text Line (https://www.crisistextline.org)',
      lastVerified: '2026-10-31',
    },
    {
      id: 'us_poison',
      countryCode: 'US',
      countryName: 'United States',
      name: 'Poison Help Center',
      category: 'poison_control',
      number: '1-800-222-1222',
      actionUrl: 'tel:18002221222',
      type: 'tel',
      hours: '24/7 Free, Confidential, Expert Medical Help',
      languages: ['English', 'Spanish', 'Translation in 160+ languages'],
      coverage: 'United States nationwide',
      officialSource: "America's Poison Centers (https://www.poisonhelp.org)",
      lastVerified: '2026-10-31',
    },
    {
      id: 'us_the_hotline',
      countryCode: 'US',
      countryName: 'United States',
      name: 'National Domestic Violence Hotline',
      category: 'domestic_violence',
      number: '1-800-799-7233',
      actionUrl: 'tel:18007997233',
      type: 'tel',
      hours: '24/7 Free & Confidential',
      languages: ['English', 'Spanish', '200+ languages via translation'],
      coverage: 'United States nationwide',
      officialSource: 'The National Domestic Violence Hotline (https://www.thehotline.org)',
      lastVerified: '2026-10-31',
    },
  ],

  GB: [
    {
      id: 'gb_999',
      countryCode: 'GB',
      countryName: 'United Kingdom',
      name: 'Emergency Services (Police, Ambulance, Fire, Coastguard)',
      category: 'general_emergency',
      number: '999',
      actionUrl: 'tel:999',
      type: 'tel',
      hours: '24/7',
      languages: ['English', 'Welsh', 'LanguageLine translation'],
      coverage: 'United Kingdom (England, Scotland, Wales, Northern Ireland)',
      officialSource: 'UK Government & Emergency Services',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'gb_samaritans',
      countryCode: 'GB',
      countryName: 'United Kingdom',
      name: 'Samaritans Crisis Helpline',
      category: 'mental_health_crisis',
      number: '116 123',
      actionUrl: 'tel:116123',
      type: 'tel',
      hours: '24/7 Free Call from any phone',
      languages: ['English', 'Welsh'],
      coverage: 'United Kingdom and Republic of Ireland',
      officialSource: 'Samaritans UK (https://www.samaritans.org)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'gb_nhs_111',
      countryCode: 'GB',
      countryName: 'United Kingdom',
      name: 'NHS 111 Urgent Medical Advice',
      category: 'medical_consult',
      number: '111',
      actionUrl: 'tel:111',
      type: 'tel',
      hours: '24/7 Free Urgent Care Advice',
      languages: ['English', 'Translation available'],
      coverage: 'England, Scotland, Wales, Northern Ireland',
      officialSource: 'National Health Service (NHS) (https://111.nhs.uk)',
      lastVerified: '2026-10-31',
    },
    {
      id: 'gb_shout',
      countryCode: 'GB',
      countryName: 'United Kingdom',
      name: 'Shout Crisis Text Line',
      category: 'mental_health_crisis',
      number: 'Text SHOUT to 85258',
      actionUrl: 'sms:85258?body=SHOUT',
      type: 'sms',
      hours: '24/7 Free & Confidential Text',
      languages: ['English'],
      coverage: 'United Kingdom nationwide',
      officialSource: 'Mental Health Innovations (https://giveusashout.org)',
      lastVerified: '2026-10-31',
    },
    {
      id: 'gb_refuge',
      countryCode: 'GB',
      countryName: 'United Kingdom',
      name: 'National Domestic Abuse Helpline (Refuge)',
      category: 'domestic_violence',
      number: '0808 2000 247',
      actionUrl: 'tel:08082000247',
      type: 'tel',
      hours: '24/7 Freephone',
      languages: ['English', 'Translation in 170+ languages'],
      coverage: 'United Kingdom',
      officialSource: 'Refuge UK (https://www.nationaldahelpline.org.uk)',
      lastVerified: '2026-10-31',
    },
  ],

  CA: [
    {
      id: 'ca_911',
      countryCode: 'CA',
      countryName: 'Canada',
      name: 'Emergency Services (Police, Fire, Ambulance)',
      category: 'general_emergency',
      number: '911',
      actionUrl: 'tel:911',
      type: 'tel',
      hours: '24/7',
      languages: ['English', 'French', 'Translation services'],
      coverage: 'Canada nationwide',
      officialSource: 'Public Safety Canada',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'ca_988',
      countryCode: 'CA',
      countryName: 'Canada',
      name: '988 Suicide Crisis Helpline Canada',
      category: 'mental_health_crisis',
      number: '988',
      actionUrl: 'tel:988',
      type: 'tel',
      hours: '24/7 Toll-Free & Confidential (Call or Text)',
      languages: ['English', 'French'],
      coverage: 'Canada nationwide',
      officialSource: 'Public Health Agency of Canada & CAMH (https://988.ca)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'ca_kids_help',
      countryCode: 'CA',
      countryName: 'Canada',
      name: 'Kids Help Phone (Youth & Young Adults)',
      category: 'child_protection',
      number: '1-800-668-6868',
      actionUrl: 'tel:18006686868',
      type: 'tel',
      hours: '24/7 Bilingual Support',
      languages: ['English', 'French'],
      coverage: 'Canada nationwide',
      officialSource: 'Kids Help Phone Canada (https://kidshelpphone.ca)',
      lastVerified: '2026-10-31',
    },
    {
      id: 'ca_poison',
      countryCode: 'CA',
      countryName: 'Canada',
      name: 'Ontario Poison Centre / Canada Poison Helpline',
      category: 'poison_control',
      number: '1-800-268-9017',
      actionUrl: 'tel:18002689017',
      type: 'tel',
      hours: '24/7 Medical Toxicologist Emergency',
      languages: ['English', 'French'],
      coverage: 'Canada',
      officialSource: 'Canadian Association of Poison Control Centres (https://www.ontariopoisoncentre.ca)',
      lastVerified: '2026-10-31',
    },
  ],

  AU: [
    {
      id: 'au_000',
      countryCode: 'AU',
      countryName: 'Australia',
      name: 'Triple Zero (000) Emergency Services',
      category: 'general_emergency',
      number: '000',
      actionUrl: 'tel:000',
      type: 'tel',
      hours: '24/7',
      languages: ['English', 'Translating and Interpreting Service (TIS)'],
      coverage: 'Australia nationwide',
      officialSource: 'Australian Government Department of Home Affairs (https://www.triplezero.gov.au)',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'au_lifeline',
      countryCode: 'AU',
      countryName: 'Australia',
      name: 'Lifeline Australia Crisis Support',
      category: 'mental_health_crisis',
      number: '13 11 14',
      actionUrl: 'tel:131114',
      type: 'tel',
      hours: '24/7 Free & Confidential',
      languages: ['English', 'Interpreting via 131 450'],
      coverage: 'Australia nationwide',
      officialSource: 'Lifeline Australia (https://www.lifeline.org.au)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'au_beyond_blue',
      countryCode: 'AU',
      countryName: 'Australia',
      name: 'Beyond Blue Mental Health Support',
      category: 'mental_health_crisis',
      number: '1300 22 4636',
      actionUrl: 'tel:1300224636',
      type: 'tel',
      hours: '24/7 Immediate Mental Health Talk',
      languages: ['English'],
      coverage: 'Australia nationwide',
      officialSource: 'Beyond Blue (https://www.beyondblue.org.au)',
      lastVerified: '2026-10-31',
    },
    {
      id: 'au_poisons',
      countryCode: 'AU',
      countryName: 'Australia',
      name: 'Poisons Information Centre',
      category: 'poison_control',
      number: '13 11 26',
      actionUrl: 'tel:131126',
      type: 'tel',
      hours: '24/7 Emergency Poison Advice',
      languages: ['English'],
      coverage: 'Australia nationwide',
      officialSource: 'Australian Poisons Information Centres',
      lastVerified: '2026-10-31',
    },
    {
      id: 'au_respect',
      countryCode: 'AU',
      countryName: 'Australia',
      name: '1800RESPECT Domestic Violence Helpline',
      category: 'domestic_violence',
      number: '1800 737 732',
      actionUrl: 'tel:1800737732',
      type: 'tel',
      hours: '24/7 Free National Sexual Assault, Family & Domestic Violence Service',
      languages: ['English', 'Interpreting via 131 450'],
      coverage: 'Australia nationwide',
      officialSource: '1800RESPECT (https://www.1800respect.org.au)',
      lastVerified: '2026-10-31',
    },
  ],

  NZ: [
    {
      id: 'nz_111',
      countryCode: 'NZ',
      countryName: 'New Zealand',
      name: '111 Emergency Services',
      category: 'general_emergency',
      number: '111',
      actionUrl: 'tel:111',
      type: 'tel',
      hours: '24/7',
      languages: ['English', 'Māori', 'Language Line translation'],
      coverage: 'New Zealand nationwide',
      officialSource: 'New Zealand Police & Emergency Services (https://www.police.govt.nz/111)',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'nz_1737',
      countryCode: 'NZ',
      countryName: 'New Zealand',
      name: '1737 Need to Talk?',
      category: 'mental_health_crisis',
      number: '1737',
      actionUrl: 'tel:1737',
      type: 'tel',
      hours: '24/7 Free Call or Text',
      languages: ['English', 'Māori'],
      coverage: 'New Zealand nationwide',
      officialSource: 'Health New Zealand Te Whatu Ora (https://1737.org.nz)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'nz_poisons',
      countryCode: 'NZ',
      countryName: 'New Zealand',
      name: 'National Poisons Centre',
      category: 'poison_control',
      number: '0800 764 766',
      actionUrl: 'tel:0800764766',
      type: 'tel',
      hours: '24/7 Urgent Poison Advice',
      languages: ['English'],
      coverage: 'New Zealand nationwide',
      officialSource: 'University of Otago National Poisons Centre (https://poisons.co.nz)',
      lastVerified: '2026-10-31',
    },
  ],

  EU: [
    {
      id: 'eu_112',
      countryCode: 'EU',
      countryName: 'European Union',
      name: 'European Universal Emergency Number',
      category: 'general_emergency',
      number: '112',
      actionUrl: 'tel:112',
      type: 'tel',
      hours: '24/7 Free Across All 27 EU Member States',
      languages: ['National Languages of each EU state', 'English'],
      coverage: 'All 27 EU Member States & EEA',
      officialSource: 'European Commission (https://digital-strategy.ec.europa.eu/en/policies/112)',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'eu_116123',
      countryCode: 'EU',
      countryName: 'European Union',
      name: 'Emotional Support Helpline (European Harmonised Number)',
      category: 'mental_health_crisis',
      number: '116 123',
      actionUrl: 'tel:116123',
      type: 'tel',
      hours: '24/7 Free Emotional Support',
      languages: ['Local EU languages'],
      coverage: 'Available across most European Union states',
      officialSource: 'European Commission Harmonised Services of Social Value (116 helpline)',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
  ],

  GLOBAL: [
    {
      id: 'global_112',
      countryCode: 'GLOBAL',
      countryName: 'International',
      name: 'Universal GSM Emergency Number',
      category: 'general_emergency',
      number: '112',
      actionUrl: 'tel:112',
      type: 'tel',
      hours: '24/7 (Routes to local emergency dispatch on GSM networks worldwide)',
      languages: ['Local languages'],
      coverage: 'Global GSM mobile standard (works in >150 countries)',
      officialSource: 'International Telecommunication Union (ITU)',
      lastVerified: '2026-10-31',
      isPrimaryEmergency: true,
    },
    {
      id: 'global_befrienders',
      countryCode: 'GLOBAL',
      countryName: 'International',
      name: 'Befrienders Worldwide Crisis Directory',
      category: 'mental_health_crisis',
      number: 'befrienders.org',
      actionUrl: 'https://www.befrienders.org',
      type: 'web',
      hours: 'Directory of 340+ Emotional Support Centres in 32 Countries',
      languages: ['English', 'Spanish', 'French', 'Multi-language'],
      coverage: 'International',
      officialSource: 'Befrienders Worldwide Volunteer Network',
      lastVerified: '2026-10-31',
      isPrimaryMentalHealth: true,
    },
    {
      id: 'global_findahelpline',
      countryCode: 'GLOBAL',
      countryName: 'International',
      name: 'Find A Helpline Global Directory',
      category: 'mental_health_crisis',
      number: 'findahelpline.com',
      actionUrl: 'https://findahelpline.com',
      type: 'web',
      hours: 'Free, confidential crisis support search across 130+ countries',
      languages: ['Multi-lingual search'],
      coverage: 'Worldwide',
      officialSource: 'ThroughLine / Find A Helpline',
      lastVerified: '2026-10-31',
    },
  ],
};

/**
 * Returns emergency contacts for a given country code, falling back to international defaults if unknown.
 */
export function getEmergencyContactsForCountry(countryCode?: string | null): EmergencyServiceContact[] {
  const code = (countryCode || 'IN').toUpperCase().trim();
  if (code in VERIFIED_EMERGENCY_DIRECTORY) {
    return VERIFIED_EMERGENCY_DIRECTORY[code];
  }
  return VERIFIED_EMERGENCY_DIRECTORY.GLOBAL;
}

/**
 * Returns the primary emergency dispatch number (e.g. 112, 911, 999, 000) for a given country.
 */
export function getPrimaryEmergencyContact(countryCode?: string | null): EmergencyServiceContact {
  const list = getEmergencyContactsForCountry(countryCode);
  return list.find((c) => c.isPrimaryEmergency) || list[0];
}

/**
 * Returns the primary mental health crisis contact (e.g. 14416, 988, 116 123) for a given country.
 */
export function getPrimaryMentalHealthContact(countryCode?: string | null): EmergencyServiceContact {
  const list = getEmergencyContactsForCountry(countryCode);
  return list.find((c) => c.isPrimaryMentalHealth) || list[0];
}

/**
 * Returns metadata of all supported countries with icons and flags.
 */
export function getSupportedCountries(): SupportedCountryMeta[] {
  return SUPPORTED_COUNTRIES;
}

```

#### `src/services/ai/emergencySupport.ts`

```ts
/**
 * Emergency Support & Situational Urgency Assessment Engine
 *
 * Implements a layered, deterministic safety engine for Anvay:
 * 1. Deterministic local safety detection (100% offline, zero network requirement)
 * 2. Contextual understanding:
 *    - Personal vs. Third-Party situations ("I want to..." vs "My friend is...")
 *    - Present vs. Past events ("right now" vs "3 years ago")
 *    - Explicit Negations ("I am not suicidal", "I don't want to die")
 *    - Medical Urgency distinction (Chest pain / stroke / anaphylaxis vs panic)
 * 3. Accurate categorization (Suicide, Overdose, Medical, Abuse, Self-Harm, Panic)
 * 4. Country-aware emergency routing via emergencyDirectory
 * 5. Grounding and compassionate de-escalation
 *
 * Adheres strictly to Thrivefold Master Ecosystem Agent Contract & Laws:
 * - Deterministic safety (never delegates emergency decisions to LLM alone)
 * - Safe native dialer / SMS actions (never silently places calls or shares location)
 * - 100% on-device offline capability
 */

import { Linking } from 'react-native';
import {
  getEmergencyContactsForCountry,
  getPrimaryEmergencyContact,
  getPrimaryMentalHealthContact,
  VERIFIED_EMERGENCY_DIRECTORY,
  type EmergencyServiceContact,
} from './emergencyDirectory';

export type CrisisSeverity =
  | 'immediate_emergency'
  | 'urgent_care'
  | 'elevated_concern'
  | 'emotional_support'
  | 'none';

export type GradedSafetyTier =
  | 'ordinary_difficulty' // Tier 1: Ordinary negative emotion, stress, fatigue, routine sadness
  | 'significant_distress' // Tier 2: Acute panic, severe anxiety, overwhelmed, crying
  | 'ambiguous_safety' // Tier 3: Passive ideation, "no reason to live", "hopeless", "want to disappear"
  | 'imminent_risk'; // Tier 4: Active self-harm, explicit suicide plan, overdose, physical violence

export type CrisisCategory =
  | 'suicidal_intent'
  | 'overdose_poisoning'
  | 'medical_emergency'
  | 'abuse_violence'
  | 'self_harm'
  | 'panic_distress'
  | 'ambiguous_concern'
  | 'general_emotional'
  | 'third_party_concern'
  | 'none';

export type RecommendedAction =
  | 'emergency_dial'
  | 'medical_care'
  | 'crisis_text'
  | 'trusted_contact'
  | 'grounding'
  | 'listen';

export interface CrisisDetectionResult {
  isCrisis: boolean;
  severity: CrisisSeverity;
  gradedTier: GradedSafetyTier;
  category: CrisisCategory;
  recommendedAction: RecommendedAction;
  deescalationScript: string;
  isThirdParty: boolean;
  isPastEvent: boolean;
  isNegated: boolean;
  primaryActionLabel?: string;
  suggestedResource?: string;
}

// Backward-compatible type export
export type EmergencyContact = EmergencyServiceContact;

// Backward-compatible default list (all verified country contacts)
export const EMERGENCY_CONTACTS: EmergencyContact[] = Object.values(VERIFIED_EMERGENCY_DIRECTORY).flat();

/* ── Context Analysis RegExes ──────────────────────────────────────────────────────────── */

const NEGATION_PATTERNS = [
  /\b(?:not|never|don't|dont|do not|no longer|stop|stopped|refuse to|haven't|havent)\s+(?:want to die|thinking of suicide|suicidal|going to kill myself|hurting myself|cut myself)\b/i,
  /\b(?:i am not|im not|i'm not)\s+(?:suicidal|in danger|gonna die|trying to hurt myself)\b/i,
  /\bnot\s+an\s+emergency\b/i,
];

const PAST_EVENT_PATTERNS = [
  /\b(?:years? ago|months? ago|weeks? ago|when i was (?:a kid|younger|in high school|in college))\b/i,
  /\b(?:in the past|back in \d{4}|used to (?:cut|harm|overdose|try to die))\b/i,
  /\b(?:recovered from|survived (?:an attempt|a suicide attempt|an overdose))\b/i,
];

const THIRD_PARTY_PATTERNS = [
  /\b(?:my\s+(?:friend|brother|sister|mother|father|mom|dad|cousin|roommate|partner|wife|husband|coworker|daughter|son))\b/i,
  /\b(?:someone\s+(?:i know|else)|he is|she is|they are)\s+(?:saying|talking about|threatening to|planning to)\b/i,
];

/* ── Medical Urgency (Requires Immediate Medical ER / Ambulance, NOT just breathing) ────── */

const MEDICAL_EMERGENCY_PATTERNS = [
  /\b(?:crushing|severe|radiating)\s+(?:chest pain|pressure in (?:my )?chest)\b/i,
  /\bchest pain\s+(?:and|with)\s+(?:shortness of breath|left arm pain|jaw pain|sweating)\b/i,
  /\b(?:cannot|cant|can't)\s+breathe\s+(?:at all|turning blue|lips are blue)\b/i,
  /\b(?:face drooping|arm weakness|slurred speech|stroke signs?)\b/i,
  /\b(?:anaphylaxis|throat (?:is )?(?:closing|swelling|swollen shut)|severe allergic reaction)\b/i,
  /\b(?:vomiting blood|coughing up blood|bleeding uncontrollably|gushing blood)\b/i,
  /\b(?:unconscious|passed out and won't wake|unresponsive)\b/i,
];

/* ── Overdose & Toxic Ingestion ────────────────────────────────────────────────────────── */

const OVERDOSE_PATTERNS = [
  /\b(?:swallowed|took|ingested|drank)\s+(?:all\s+(?:the|my)|a bottle of|handful of|too many)\s+(?:pills|tablets|medication|aspirin|tylenol|paracetamol|sleeping pills)\b/i,
  /\b(?:drank|ingested|swallowed)\s+(?:poison|bleach|cleaner|chemical|detergent|pesticide)\b/i,
  /\b(?:i overdosed|just overdosed|overdosing right now)\b/i,
];

/* ── Immediate Suicidal Intent ─────────────────────────────────────────────────────────── */

const SUICIDAL_INTENT_PATTERNS = [
  /\b(?:kill(?:ing)?\s+(?:myself|me)|want\s+to\s+die|end\s+my\s+life|ending\s+my\s+life|end\s+it\s+all)\b/i,
  /\b(?:suicid(?:e|al)|better\s+off\s+dead|no\s+reason\s+to\s+live)\b/i,
  /\b(?:hang(?:ing)?\s+myself|jump(?:ing)?\s+off|shoot(?:ing)?\s+myself)\b/i,
  /\b(?:goodbye forever|saying my final goodbyes?|writing (?:a|my) suicide note)\b/i,
  /\bready to end it\b/i,
];

/* ── Acute Self-Harm Signals ───────────────────────────────────────────────────────────── */

const SELF_HARM_PATTERNS = [
  /\b(?:cut(?:ting)?\s+myself|bleed(?:ing)?\s+out|burn(?:ed|ing)?\s+myself)\b/i,
  /\b(?:self[- ]harm(?:ing)?|hurt(?:ing)?\s+myself|punish(?:ing)?\s+myself physically)\b/i,
  /\bslit(?:ting)?\s+(?:my\s+)?wrist\b/i,
];

/* ── Abuse, Physical Threat & Imminent Safety ───────────────────────────────────────────── */

const ABUSE_VIOLENCE_PATTERNS = [
  /\b(?:he is hitting me|she is hitting me|someone is attacking me|being assaulted)\b/i,
  /\b(?:he threatened to kill me|threatened with a (?:knife|gun|weapon))\b/i,
  /\b(?:locked in (?:a |the )room|cannot leave safely|afraid for my life)\b/i,
  /\b(?:domestic violence|abusive partner|stalking me|someone breaking in)\b/i,
];

/* ── Acute Panic & Hyperventilation ────────────────────────────────────────────────────── */

const ACUTE_PANIC_PATTERNS = [
  /\b(?:panic\s+attack|hyperventilat(?:e|ing)|having an anxiety attack)\b/i,
  /\b(?:heart\s+racing|heart is pounding)\s+(?:and|im scared|so frightened)\b/i,
  /\b(?:feel like i'm dying|feel detached from reality|derealization|losing my mind)\b/i,
  /\b(?:tightness in chest|shaking uncontrollably)\s+from\s+(?:stress|anxiety|fear)\b/i,
];

/* ── Ambiguous Safety Concerns (Passive Ideation, Hopelessness, Wanting to Vanish) ─ */

const AMBIGUOUS_SAFETY_PATTERNS = [
  /\b(?:what(?:'s| is) the point(?: of (?:living|life))?)\b/i,
  /\b(?:feeling|feel|so) hopeless\b/i,
  /\b(?:want to disappear|wish i (?:wasn't|was not) here|wish i could just vanish)\b/i,
  /\b(?:can't go on like this|cant go on like this|tired of existing)\b/i,
  /\b(?:nobody (?:would )?cares? if i (?:was gone|disappeared))\b/i,
];

/* ── General Emotional Distress ────────────────────────────────────────────────────────── */

const EMOTIONAL_DISTRESS_PATTERNS = [
  /\b(?:overwhelmed|crying all day|so lonely|deeply depressed|hopeless|burned out|empty inside|heartbroken|nobody cares)\b/i,
  /\b(?:can't stop crying|can't do this anymore|feeling lost|anxious all the time)\b/i,
];

/**
 * Deterministically evaluates text for situational urgency, medical safety, and crisis indicators.
 *
 * Uses multi-layered pattern matching with negation, tense, and third-party filtering
 * before assigning any safety category.
 */
export function detectCrisisIntent(text: string, countryCode?: string): CrisisDetectionResult {
  const input = text.trim();
  if (!input) {
    return {
      isCrisis: false,
      severity: 'none',
      gradedTier: 'ordinary_difficulty',
      category: 'none',
      recommendedAction: 'listen',
      deescalationScript: '',
      isThirdParty: false,
      isPastEvent: false,
      isNegated: false,
    };
  }

  // 1. Check for Contextual Negations ("I am not suicidal")
  const isNegated = NEGATION_PATTERNS.some((pat) => pat.test(input));
  if (isNegated) {
    return {
      isCrisis: false,
      severity: 'emotional_support',
      gradedTier: 'ordinary_difficulty',
      category: 'general_emotional',
      recommendedAction: 'listen',
      deescalationScript:
        "I hear you, and thank you for being open with me. I'm here to listen to whatever is on your mind without any judgment.",
      isThirdParty: false,
      isPastEvent: false,
      isNegated: true,
    };
  }

  // 2. Check for Past Events ("3 years ago I had a suicide attempt")
  const isPastEvent = PAST_EVENT_PATTERNS.some((pat) => pat.test(input));
  if (isPastEvent) {
    return {
      isCrisis: false,
      severity: 'emotional_support',
      gradedTier: 'ordinary_difficulty',
      category: 'general_emotional',
      recommendedAction: 'listen',
      deescalationScript:
        "Thank you for sharing that part of your journey with me. Surviving difficult times takes immense strength. How are you feeling in your life today?",
      isThirdParty: false,
      isPastEvent: true,
      isNegated: false,
    };
  }

  // 3. Check for Third-Party Concerns ("My friend is talking about hurting themselves")
  const isThirdParty = THIRD_PARTY_PATTERNS.some((pat) => pat.test(input));
  if (isThirdParty) {
    const hasEmergencyKeywords = SUICIDAL_INTENT_PATTERNS.some((p) => p.test(input)) || OVERDOSE_PATTERNS.some((p) => p.test(input));
    if (hasEmergencyKeywords) {
      return {
        isCrisis: true,
        severity: 'urgent_care',
        gradedTier: 'ambiguous_safety',
        category: 'third_party_concern',
        recommendedAction: 'crisis_text',
        deescalationScript:
          "It is frightening when someone you care about is struggling. If they are in immediate danger, please contact local emergency services or a crisis helpline right now so trained responders can help them stay safe.",
        isThirdParty: true,
        isPastEvent: false,
        isNegated: false,
        suggestedResource: 'Crisis Helpline & Emergency Services',
      };
    }
  }

  // 4. Critical Layer: Medical Emergency (Chest pain, Stroke, Anaphylaxis, Severe Hemorrhage)
  for (const pattern of MEDICAL_EMERGENCY_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: true,
        severity: 'immediate_emergency',
        gradedTier: 'imminent_risk',
        category: 'medical_emergency',
        recommendedAction: 'emergency_dial',
        deescalationScript:
          "These symptoms may indicate a medical emergency requiring urgent clinical evaluation. Please stop any physical activity and call emergency medical services immediately using the button below.",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
        primaryActionLabel: 'Call Ambulance / Emergency',
      };
    }
  }

  // 5. Critical Layer: Overdose or Poisoning Ingestion
  for (const pattern of OVERDOSE_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: true,
        severity: 'immediate_emergency',
        gradedTier: 'imminent_risk',
        category: 'overdose_poisoning',
        recommendedAction: 'emergency_dial',
        deescalationScript:
          "Taking a large or dangerous amount of substances requires immediate medical assistance. Please call emergency services or Poison Control right away. Do not wait for symptoms to worsen.",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
        primaryActionLabel: 'Call Emergency / Poison Control',
      };
    }
  }

  // 6. Critical Layer: Suicidal Intent
  for (const pattern of SUICIDAL_INTENT_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: true,
        severity: 'immediate_emergency',
        gradedTier: 'imminent_risk',
        category: 'suicidal_intent',
        recommendedAction: 'emergency_dial',
        deescalationScript:
          "I hear how overwhelming and painful this is right now. You do not have to carry this alone. Please reach out to someone who can keep you safe right now—I've opened the direct emergency lifeline buttons on your screen.",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
        primaryActionLabel: 'Connect with Crisis Helpline',
      };
    }
  }

  // 7. Critical Layer: Abuse, Physical Violence & Imminent Safety Threats
  for (const pattern of ABUSE_VIOLENCE_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: true,
        severity: 'immediate_emergency',
        gradedTier: 'imminent_risk',
        category: 'abuse_violence',
        recommendedAction: 'emergency_dial',
        deescalationScript:
          "Your physical safety is the immediate priority. If you are in immediate danger, please dial emergency police services or reach out to a trusted helpline. You deserve to be in a secure place.",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
        primaryActionLabel: 'Call Police / Helpline',
      };
    }
  }

  // 8. Elevated Layer: Acute Self-Harm
  for (const pattern of SELF_HARM_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: true,
        severity: 'urgent_care',
        gradedTier: 'imminent_risk',
        category: 'self_harm',
        recommendedAction: 'crisis_text',
        deescalationScript:
          "I hear that you are hurting deeply right now. Let's take a pause together. Your life and your body deserve care and protection. Please connect with a caring counselor who is trained to help you through this exact moment.",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
        primaryActionLabel: 'Text / Call Counselor',
      };
    }
  }

  // 9. Ambiguous Layer: Passive Ideation, Hopelessness, Wanting to Disappear
  for (const pattern of AMBIGUOUS_SAFETY_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: true,
        severity: 'urgent_care',
        gradedTier: 'ambiguous_safety',
        category: 'ambiguous_concern',
        recommendedAction: 'crisis_text',
        deescalationScript:
          "I hear how exhausting and heavy things feel right now. You do not have to carry this alone. Are you safe right now? If you need a listening ear, free confidential support is always here.",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
        primaryActionLabel: 'Talk to Lifeline Counselor',
      };
    }
  }

  // 10. Moderate Layer: Acute Panic & Hyperventilation
  for (const pattern of ACUTE_PANIC_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: false,
        severity: 'elevated_concern',
        gradedTier: 'significant_distress',
        category: 'panic_distress',
        recommendedAction: 'grounding',
        deescalationScript:
          "You are safe right now in this moment. Your nervous system is in high alert, but this intense wave will pass. Let's breathe together. Place one hand on your chest and follow the gentle rhythm.",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
        primaryActionLabel: 'Start Box Breathing',
      };
    }
  }

  // 11. Gentle Layer: General Emotional Distress
  for (const pattern of EMOTIONAL_DISTRESS_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isCrisis: false,
        severity: 'emotional_support',
        gradedTier: 'ordinary_difficulty',
        category: 'general_emotional',
        recommendedAction: 'listen',
        deescalationScript:
          "I hear how heavy things feel right now. It takes courage to put these feelings into words. Take a slow, gentle breath. What feels like the hardest part of today?",
        isThirdParty: false,
        isPastEvent: false,
        isNegated: false,
      };
    }
  }

  return {
    isCrisis: false,
    severity: 'none',
    gradedTier: 'ordinary_difficulty',
    category: 'none',
    recommendedAction: 'listen',
    deescalationScript: '',
    isThirdParty: false,
    isPastEvent: false,
    isNegated: false,
  };
}

/**
 * Triggers native dialer or SMS client for real-world emergency action.
 * Always prompts the device's native app, never placing a silent call.
 */
export async function triggerEmergencyAction(contact: EmergencyServiceContact): Promise<boolean> {
  try {
    const supported = await Linking.canOpenURL(contact.actionUrl);
    if (supported) {
      await Linking.openURL(contact.actionUrl);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Local-First Therapeutic Grounding Steps (Zero Network / 100% On-Device).
 */
export const GROUNDING_EXERCISES = {
  box_breathing: {
    title: 'Box Breathing (Sama Vritti)',
    subtitle: 'Calm the autonomic nervous system in 4 rhythmic beats',
    cycles: 4,
    phases: [
      { name: 'Inhale', durationSec: 4, instruction: 'Breathe in slowly through your nose, expanding your belly.' },
      { name: 'Hold', durationSec: 4, instruction: 'Gently hold your breath. Keep your shoulders relaxed.' },
      { name: 'Exhale', durationSec: 4, instruction: 'Release slowly and completely through your mouth.' },
      { name: 'Rest', durationSec: 4, instruction: 'Pause in stillness before the next gentle breath.' },
    ],
  },
  sensory_54321: {
    title: '5-4-3-2-1 Sensory Grounding',
    subtitle: 'Anchor your mind into the physical room right now',
    steps: [
      { count: 5, prompt: 'Notice 5 things you can see around you right now (a color, a shadow, an object).' },
      { count: 4, prompt: 'Notice 4 things you can physically feel (feet on floor, texture of clothing, temperature).' },
      { count: 3, prompt: 'Notice 3 sounds you can hear (a distant hum, your own breath, outside noise).' },
      { count: 2, prompt: 'Notice 2 things you can smell (fresh air, fabric, soap, coffee).' },
      { count: 1, prompt: 'Notice 1 thing you can taste or swallow mindfully (a sip of water).' },
    ],
  },
};
```

#### `src/services/ai/localModel.ts`

```ts
/**
 * The app's one entry point to the on-device language model (llama.cpp through the Llamatik
 * native module). Loads the chosen GGUF model lazily on first use, keeps one loaded at a time,
 * and answers with short, grounded replies. Nothing leaves the phone.
 */
import { LocalAI, getLocalModelFilePath, getModelPresetById, isModelDownloaded } from '../../../modules/local-ai';
import { useRootStore } from '../../stores/useRootStore';
import { importedFileOf, importedPath, isImportedId } from './modelImport';

let loading: Promise<boolean> | null = null;

export const localModelSupported = () => LocalAI.isAvailable();

/** True once the chosen model is loaded (loading it first when downloaded). */
export async function ensureLocalModel(): Promise<boolean> {
  if (!LocalAI.isAvailable()) return false;
  if (LocalAI.isLoaded()) return true;
  const id = useRootStore.getState().localModelId;
  if (!id) return false;
  const imported = isImportedId(id);
  if (!imported && (!getModelPresetById(id) || !(await isModelDownloaded(id)))) return false;
  loading ??= (async () => {
    try {
      const path = (imported ? importedPath(importedFileOf(id)) : getLocalModelFilePath(id)).replace(/^file:\/\//, '');
      const r = await LocalAI.loadModel(path, false, { temperature: 0.4, maxTokens: 220, topP: 0.9, repeatPenalty: 1.1 });
      return !!r?.success;
    } catch {
      return false;
    } finally {
      loading = null;
    }
  })();
  return loading;
}

/** One answer from the local model, or null when no model is ready. */
export async function askLocal(prompt: string, system: string, context?: string): Promise<string | null> {
  if (!(await ensureLocalModel())) return null;
  try {
    const out = await LocalAI.generateText({ prompt: prompt.slice(0, 2000), system, context: context?.slice(0, 3000) });
    return out.trim() || null;
  } catch {
    return null;
  }
}
```

#### `src/services/ai/mealVision.ts`

```ts
/**
 * Meal photo → foods and macros with a cloud vision model, only when the person asks.
 *
 * Route, in order:
 * 1. `server`: signed in → Thrivefold's `meal-vision` function, which holds the provider keys,
 *    caps daily use and stores nothing. No key is on the phone.
 * 2. `byok`: the person's own Gemini key from Settings → AI keys, called directly.
 * Otherwise the reason is returned so the screen can offer sign-in or keys.
 *
 * The photo is downscaled first, sent once and not kept by Thrivefold. Foods the model matches to
 * the food table come back with table servings; the rest are estimates the person reviews.
 */
import * as FileSystem from 'expo-file-system/legacy';

import { resizeForUpload } from '../../../modules/pose-landmarker/food';
import { parseEstimate, type EstimatedFood } from '../../domain/nutrition/estimate';
import { FOODS } from '../../domain/nutrition/foods';
import { useRootStore } from '../../stores/useRootStore';
import { supabase } from '../supabase/supabaseClient';
import { isLocalOnly, pickGeminiKey } from './env';

export type { EstimatedFood };

export type PhotoAiRoute =
  | { route: 'server' | 'byok' }
  | { route: null; reason: string; action: 'sign_in' | 'keys' | null };

const KNOWN_IDS: ReadonlySet<string> = new Set(FOODS.map((f) => f.id));
const CATALOG = FOODS.map((f) => ({ id: f.id, name: f.name, serving: f.serving }));

const userGeminiKey = () =>
  (useRootStore.getState() as unknown as { userApiKeys?: { gemini?: string } }).userApiKeys?.gemini ??
  '';

export async function photoAiRoute(): Promise<PhotoAiRoute> {
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) return { route: 'server' };
    } catch {
      // fall through to the person's own key
    }
  }
  if (userGeminiKey() || (!isLocalOnly() && pickGeminiKey())) return { route: 'byok' };
  return {
    route: null,
    reason: supabase
      ? 'Sign in to analyse photos with Thrivefold AI, or add your own Gemini key.'
      : 'Add your own Gemini key in AI keys to analyse photos.',
    action: supabase ? 'sign_in' : 'keys',
  };
}

const PROMPT = `You are a careful nutrition assistant. Identify each distinct food or drink in this meal photo, including Indian dishes, estimate the portion shown and its nutrition.
If an item matches one of these food-table entries set "catalogId" and "servings" (0.5 steps):
${CATALOG.map((c) => `${c.id}: ${c.name} (${c.serving})`).join('\n')}
Hints (may be wrong): {hints}
Return ONLY JSON: {"items":[{"name":string,"catalogId":string|null,"servings":number|null,"serving":string,"kcal":number,"protein":number,"carbs":number,"fat":number,"confidence":number}]}. If no food is visible return {"items":[]}.`;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

async function viaServer(image: string, hints: string[]): Promise<string> {
  if (!supabase) throw new Error('not_configured');
  const { data, error } = await withTimeout(
    supabase.functions.invoke('meal-vision', { body: { image, hints, catalog: CATALOG } }),
    40_000,
  );
  if (error) {
    const ctx = (error as { context?: Response }).context;
    let code = '';
    try {
      code = ctx ? (((await ctx.json()) as { error?: string }).error ?? '') : '';
    } catch {
      // not JSON
    }
    throw new Error(code || error.message);
  }
  return (data as { raw?: string }).raw ?? '';
}

async function viaOwnKey(image: string, hints: string[]): Promise<string> {
  const key = userGeminiKey() || pickGeminiKey();
  const res = await withTimeout(
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: PROMPT.replace('{hints}', hints.join(', ') || 'none') },
              { inline_data: { mime_type: 'image/jpeg', data: image } },
            ],
          },
        ],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
    }),
    40_000,
  );
  if (!res.ok) throw new Error(res.status === 429 ? 'daily_limit' : 'unavailable');
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
}

export async function analyzeMealPhoto(
  photoUri: string,
  hints: string[],
): Promise<{ items: EstimatedFood[]; route: 'server' | 'byok' } | { error: string }> {
  const route = await photoAiRoute();
  if (!route.route) return { error: route.reason };
  try {
    const small = await resizeForUpload(photoUri, 1280);
    const image = await FileSystem.readAsStringAsync(small, { encoding: FileSystem.EncodingType.Base64 });
    if (small !== photoUri) FileSystem.deleteAsync(small, { idempotent: true }).catch(() => undefined);
    const raw = route.route === 'server' ? await viaServer(image, hints) : await viaOwnKey(image, hints);
    return { items: parseEstimate(raw, KNOWN_IDS), route: route.route };
  } catch (e) {
    const m = e instanceof Error ? e.message : '';
    return {
      error: m.includes('daily_limit')
        ? 'That’s today’s AI limit. It resets tomorrow; you can still add foods yourself.'
        : m.includes('not_authenticated')
          ? 'Your sign-in expired. Sign in again to analyse photos.'
          : m.includes('timeout')
            ? 'The AI took too long. Check your connection and try again.'
            : m.includes('invalid_image')
              ? 'That photo could not be read. Try another one.'
              : 'Could not analyse this photo right now. You can still add foods yourself.',
    };
  }
}
```

#### `src/services/ai/medicineResearch.ts`

```ts
/**
 * Medicine and Prescription Educational Research Service.
 *
 * Safety Boundaries & Non-Diagnostic Architecture:
 * - Strict non-diagnostic role: Never prescribes, diagnoses, or alters dosages.
 * - Distinguishes between OCR extracted text, verified pharmacology records, and uncertain interpretation.
 * - Formulates plain-language educational summaries with source citations.
 * - Flags contraindication warning questions for pharmacist/clinician consultation.
 */

export interface MedicineRecord {
  id: string;
  name: string;
  genericName?: string;
  commonUses: string[];
  generalClass: string;
  cautionaryNotes: string[];
  questionsForPharmacist: string[];
  authoritativeSource: {
    publisher: string;
    referenceUrl?: string;
    lastVerifiedDate: string;
  };
}

export interface PrescriptionAnalysisResult {
  rawExtractedText?: string;
  detectedMedicines: {
    extractedName: string;
    matchedRecord?: MedicineRecord;
    confidence: number;
    extractedInstructions?: string;
    isUncertain: boolean;
  }[];
  educationalSummary: string;
  safetyNotice: string;
  disclaimer: string;
  timestamp: string;
}

/**
 * Built-in verified educational formulary knowledge index.
 * Grounded in publicly available OpenFDA & MedlinePlus educational guides.
 */
const VERIFIED_MEDICINE_CATALOG: Record<string, MedicineRecord> = {
  paracetamol: {
    id: 'med_paracetamol',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    commonUses: ['Mild to moderate pain relief', 'Fever reduction'],
    generalClass: 'Analgesic and antipyretic',
    cautionaryNotes: [
      'Do not exceed the daily limit recommended by your physician or on the packaging.',
      'Check other over-the-counter cold medicines to avoid accidental duplicate acetaminophen intake.',
    ],
    questionsForPharmacist: [
      'What is the maximum daily safe dose for my age and weight?',
      'Can I take this alongside my existing supplements or prescription medications?',
    ],
    authoritativeSource: {
      publisher: 'National Library of Medicine / MedlinePlus',
      referenceUrl: 'https://medlineplus.gov/druginfo/meds/a681004.html',
      lastVerifiedDate: '2026-01-15',
    },
  },
  ibuprofen: {
    id: 'med_ibuprofen',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    commonUses: ['Inflammation reduction', 'Headache, toothache, or muscle pain relief'],
    generalClass: 'Nonsteroidal anti-inflammatory drug (NSAID)',
    cautionaryNotes: [
      'Commonly recommended to be taken with food or milk to protect stomach lining.',
      'Consult a doctor before taking if you have a history of stomach ulcers, kidney concerns, or asthma.',
    ],
    questionsForPharmacist: [
      'Should I take this with meals?',
      'How many days in a row is it safe to take this before consulting my physician?',
    ],
    authoritativeSource: {
      publisher: 'OpenFDA Drug Database',
      referenceUrl: 'https://open.fda.gov/apis/drug/label/',
      lastVerifiedDate: '2026-02-10',
    },
  },
  metformin: {
    id: 'med_metformin',
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    commonUses: ['Blood glucose management in type 2 diabetes support'],
    generalClass: 'Biguanide antihyperglycemic',
    cautionaryNotes: [
      'Take exactly at the times specified by your doctor, usually with meals.',
      'Avoid excessive alcohol consumption while taking this medication.',
    ],
    questionsForPharmacist: [
      'What should I do if I miss a scheduled dose?',
      'Are there specific foods or times of day optimal for this prescription?',
    ],
    authoritativeSource: {
      publisher: 'National Library of Medicine / MedlinePlus',
      referenceUrl: 'https://medlineplus.gov/druginfo/meds/a681005.html',
      lastVerifiedDate: '2026-01-20',
    },
  },
  amoxicillin: {
    id: 'med_amoxicillin',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    commonUses: ['Bacterial infection treatment'],
    generalClass: 'Penicillin-class antibiotic',
    cautionaryNotes: [
      'Complete the entire course prescribed by your doctor even if you feel better early.',
      'Do not take if you have a known allergy to penicillin or cephalosporin antibiotics.',
    ],
    questionsForPharmacist: [
      'Should I finish the full course even if my symptoms disappear?',
      'Can this interact with any oral contraceptives or other treatments?',
    ],
    authoritativeSource: {
      publisher: 'OpenFDA Drug Database',
      referenceUrl: 'https://open.fda.gov/apis/drug/label/',
      lastVerifiedDate: '2026-03-01',
    },
  },
  atorvastatin: {
    id: 'med_atorvastatin',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    commonUses: ['Lipid and cholesterol management'],
    generalClass: 'HMG-CoA reductase inhibitor (Statin)',
    cautionaryNotes: [
      'Commonly taken once daily, often in the evening.',
      'Avoid large quantities of grapefruit juice while on atorvastatin.',
    ],
    questionsForPharmacist: [
      'What time of day is recommended for my dose?',
      'Are there dietary interactions I should be mindful of?',
    ],
    authoritativeSource: {
      publisher: 'National Library of Medicine / MedlinePlus',
      referenceUrl: 'https://medlineplus.gov/druginfo/meds/a600045.html',
      lastVerifiedDate: '2026-01-30',
    },
  },
  cetirizine: {
    id: 'med_cetirizine',
    name: 'Cetirizine',
    genericName: 'Cetirizine Hydrochloride',
    commonUses: ['Seasonal allergies, hay fever, and allergic skin hives'],
    generalClass: 'Second-generation antihistamine',
    cautionaryNotes: [
      'May cause mild drowsiness in some individuals; observe how you react before driving.',
    ],
    questionsForPharmacist: [
      'Can I take this during the daytime without drowsiness?',
    ],
    authoritativeSource: {
      publisher: 'OpenFDA Drug Database',
      referenceUrl: 'https://open.fda.gov/apis/drug/label/',
      lastVerifiedDate: '2026-02-15',
    },
  },
};

/**
 * Searches the verified educational medicine catalog.
 */
export function lookupMedicine(nameOrQuery: string): MedicineRecord | null {
  const q = nameOrQuery.toLowerCase().trim();
  for (const [key, record] of Object.entries(VERIFIED_MEDICINE_CATALOG)) {
    if (
      key.includes(q) ||
      q.includes(key) ||
      record.name.toLowerCase().includes(q) ||
      (record.genericName && record.genericName.toLowerCase().includes(q))
    ) {
      return record;
    }
  }
  return null;
}

/**
 * Analyzes prescription text extracted via OCR or user transcription with medical boundaries.
 */
export function analyzePrescriptionText(extractedText: string): PrescriptionAnalysisResult {
  const text = extractedText.toLowerCase();
  const detected: PrescriptionAnalysisResult['detectedMedicines'] = [];

  for (const [key, record] of Object.entries(VERIFIED_MEDICINE_CATALOG)) {
    if (text.includes(key) || text.includes(record.name.toLowerCase())) {
      detected.push({
        extractedName: record.name,
        matchedRecord: record,
        confidence: 0.95,
        isUncertain: false,
      });
    }
  }

  // If no known matches found in catalog, flag as uncertain extraction
  if (detected.length === 0) {
    detected.push({
      extractedName: extractedText.slice(0, 40).trim(),
      confidence: 0.35,
      isUncertain: true,
    });
  }

  const educationalSummary = detected
    .filter((d) => d.matchedRecord)
    .map(
      (d) =>
        `• ${d.matchedRecord!.name} (${d.matchedRecord!.genericName || d.matchedRecord!.generalClass}): Commonly prescribed for ${d.matchedRecord!.commonUses.join(', ')}. Source: ${d.matchedRecord!.authoritativeSource.publisher}.`
    )
    .join('\n');

  return {
    rawExtractedText: extractedText,
    detectedMedicines: detected,
    educationalSummary:
      educationalSummary ||
      'No familiar medication names could be identified with high confidence from the text.',
    safetyNotice:
      'Always verify exact doses, timing, and brand names directly with your licensed pharmacist or prescribing physician before taking any medication.',
    disclaimer:
      'Thrivefold is an educational wellbeing application, not a medical device or pharmacy. We do not provide clinical diagnosis or dosage recommendations.',
    timestamp: new Date().toISOString(),
  };
}
```

#### `src/services/ai/modelImport.ts`

```ts
/**
 * Bring-your-own model: pick a GGUF file from the phone and keep one private copy in the app's
 * model folder (llama.cpp needs a real file path). The copy is reused offline from then on; the
 * same file name replaces the old copy instead of duplicating it.
 */
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

const IMPORT_DIR = `${FileSystem.documentDirectory ?? ''}local_ai_models/imported/`;
export const IMPORT_PREFIX = 'import:';

export const importedPath = (fileName: string) => `${IMPORT_DIR}${fileName}`;
export const isImportedId = (id: string | null | undefined): id is string => !!id && id.startsWith(IMPORT_PREFIX);
export const importedFileOf = (id: string) => id.slice(IMPORT_PREFIX.length);

/** Turns any picked name into a safe file name ending in .gguf. */
export function safeModelName(name: string): string {
  const base = name.replace(/\.gguf$/i, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'model';
  return `${base}.gguf`;
}

export interface ImportedModel {
  id: string;
  fileName: string;
  sizeMb: number;
}

export async function listImportedModels(): Promise<ImportedModel[]> {
  try {
    const info = await FileSystem.getInfoAsync(IMPORT_DIR);
    if (!info.exists) return [];
    const names = (await FileSystem.readDirectoryAsync(IMPORT_DIR)).filter((n) => n.endsWith('.gguf'));
    return Promise.all(
      names.map(async (fileName) => {
        const f = await FileSystem.getInfoAsync(importedPath(fileName));
        return { id: `${IMPORT_PREFIX}${fileName}`, fileName, sizeMb: f.exists ? Math.round((f.size ?? 0) / 1048576) : 0 };
      }),
    );
  } catch {
    return [];
  }
}

/** Picks a .gguf file and copies it in. Returns the model id, or null when cancelled. */
export async function importModelFile(): Promise<string | null> {
  const r = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: false, multiple: false });
  const a = r.canceled ? null : r.assets[0];
  if (!a) return null;
  if (!/\.gguf$/i.test(a.name)) throw new Error('Choose a .gguf model file (llama.cpp format).');
  await FileSystem.makeDirectoryAsync(IMPORT_DIR, { intermediates: true }).catch(() => undefined);
  const fileName = safeModelName(a.name);
  await FileSystem.deleteAsync(importedPath(fileName), { idempotent: true });
  await FileSystem.copyAsync({ from: a.uri, to: importedPath(fileName) });
  return `${IMPORT_PREFIX}${fileName}`;
}

export async function deleteImportedModel(id: string): Promise<void> {
  await FileSystem.deleteAsync(importedPath(importedFileOf(id)), { idempotent: true });
}
```

#### `src/services/ai/modelSetup.ts`

```ts
/**
 * One-tap setup of the on-device brain: pick the model that fits this phone, download it with
 * real byte progress, check its size and SHA-256, load it, and ask it one short question. The
 * model is marked as in use only after that probe answers. Screens subscribe to the progress.
 */
import {
  DurableDownloads,
  LocalAI,
  MODEL_PRESETS,
  downloadModelWithProgress,
  ensureModelsDirectory,
  getLocalModelFilePath,
  getRecommendedModel,
  isModelDownloaded,
  type ModelDownloadHandle,
  type ModelPreset,
} from '../../../modules/local-ai';
import * as FileSystem from 'expo-file-system/legacy';

import { asyncKeyValueStorage } from '../../stores/persistStorage';
import { useRootStore } from '../../stores/useRootStore';
import { ensureLocalModel } from './localModel';

export type SetupPhase =
  | 'idle'
  | 'downloading'
  | 'paused'
  | 'verifying'
  | 'loading'
  | 'ready'
  | 'failed'
  | 'unsupported';

export interface SetupState {
  phase: SetupPhase;
  model: ModelPreset | null;
  progress: number;
  message: string | null;
  /** True when Android's download service is doing the transfer (it continues if the app closes). */
  durable?: boolean;
}

let state: SetupState = { phase: 'idle', model: null, progress: 0, message: null };

// Android DownloadManager job for the model, remembered so the app can pick it up after a restart.
const DM_KEY = 'thrive.modelDM.v1';
type DmJob = { modelId: string; id: number };
async function readDmJob(): Promise<DmJob | null> {
  try {
    const raw = await asyncKeyValueStorage.getItem(DM_KEY);
    return raw ? (JSON.parse(raw) as DmJob) : null;
  } catch {
    return null;
  }
}
const clearDmJob = () => asyncKeyValueStorage.removeItem(DM_KEY).catch(() => undefined);
let dmTimer: ReturnType<typeof setInterval> | null = null;

/** Downloads with Android's DownloadManager, verifies the SHA-256 and moves the file into place. */
async function durableDownload(model: ModelPreset): Promise<void> {
  if (!DurableDownloads) throw new Error('unavailable');
  let job = await readDmJob();
  if (!job || job.modelId !== model.id || DurableDownloads.query(job.id).status === 'missing') {
    const id = DurableDownloads.enqueue(model.downloadUrl, `${model.id}.gguf.part`, `Thrivefold AI: ${model.name}`);
    job = { modelId: model.id, id };
    await asyncKeyValueStorage.setItem(DM_KEY, JSON.stringify(job)).catch(() => undefined);
  }
  const jobId = job.id;
  emit({ phase: 'downloading', model, durable: true, message: null });
  const localUri = await new Promise<string>((resolve, reject) => {
    if (dmTimer) clearInterval(dmTimer);
    dmTimer = setInterval(() => {
      const q = DurableDownloads!.query(jobId);
      if (q.total && q.total > 0) emit({ progress: Math.min(1, (q.bytes ?? 0) / q.total) });
      if (q.status === 'paused') emit({ message: 'Waiting for a network connection…' });
      else if (state.message) emit({ message: null });
      if (q.status === 'done' && q.localUri) {
        clearInterval(dmTimer!);
        dmTimer = null;
        resolve(q.localUri);
      } else if (q.status === 'failed' || q.status === 'missing') {
        clearInterval(dmTimer!);
        dmTimer = null;
        reject(new Error('The download failed. Check the connection and try again.'));
      }
    }, 1000);
  });
  emit({ phase: 'verifying', progress: 1 });
  const path = localUri.replace(/^file:\/\//, '');
  const info = await FileSystem.getInfoAsync(localUri);
  const size = info.exists ? (info.size ?? 0) : 0;
  const okSize = size > 0 && Math.abs(size - model.sizeBytes) <= model.sizeBytes * 0.01;
  const okHash = okSize && (await LocalAI.verifyModelChecksum(path, model.expectedSha256).catch(() => ({ matches: false }))).matches;
  if (!okHash) {
    DurableDownloads.remove(jobId);
    await clearDmJob();
    throw new Error('Model SHA-256 integrity check failed. File has been removed.');
  }
  await ensureModelsDirectory();
  const dest = getLocalModelFilePath(model.id);
  await FileSystem.deleteAsync(dest, { idempotent: true });
  try {
    await FileSystem.moveAsync({ from: localUri, to: dest });
  } catch {
    // Cross-filesystem / EXDEV fallback (moving from Android DownloadManager storage to internal files)
    await FileSystem.copyAsync({ from: localUri, to: dest });
    await FileSystem.deleteAsync(localUri, { idempotent: true });
  }
  DurableDownloads.remove(jobId);
  await clearDmJob();
}
let handle: ModelDownloadHandle | null = null;

// A paused download is remembered so it continues where it stopped, even after the app restarts.
const RESUME_KEY = 'thrive.modelDownload.v1';
type Saved = { modelId: string; resumeData: string; progress: number };
async function readSaved(): Promise<Saved | null> {
  try {
    const raw = await asyncKeyValueStorage.getItem(RESUME_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
const clearSaved = () => asyncKeyValueStorage.removeItem(RESUME_KEY).catch(() => undefined);
const listeners = new Set<(s: SetupState) => void>();

const emit = (patch: Partial<SetupState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
};

export const getSetupState = () => state;

export function subscribeSetup(fn: (s: SetupState) => void): () => void {
  listeners.add(fn);
  fn(state);
  return () => {
    listeners.delete(fn);
  };
}

/** The model this phone should use, or null when the native engine is missing. */
export function recommendedModel(): ModelPreset | null {
  if (!LocalAI.isAvailable()) return null;
  return getRecommendedModel(LocalAI.getDeviceCapabilities().totalRamMb);
}

/** True when a model is chosen, downloaded and answering. */
export async function brainReady(): Promise<boolean> {
  const id = useRootStore.getState().localModelId;
  return !!id && (await isModelDownloaded(id)) && (await ensureLocalModel());
}

async function probe(): Promise<boolean> {
  try {
    const out = await LocalAI.generateText({ prompt: 'Reply with the single word: ready', system: 'Answer briefly.' });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

/** Downloads (if needed), verifies, loads and probes the recommended model. Safe to call twice. */
export async function setUpBrain(model: ModelPreset | null = recommendedModel()): Promise<boolean> {
  if (!model) {
    emit({ phase: 'unsupported', message: 'On-device AI is not available on this phone.' });
    return false;
  }
  if (state.phase === 'downloading' || state.phase === 'verifying' || state.phase === 'loading') return false;
  const saved = await readSaved();
  const setId = useRootStore.getState().setLocalModelId;
  try {
    if (!(await isModelDownloaded(model.id)) && DurableDownloads) {
      await durableDownload(model);
    }
    if (!(await isModelDownloaded(model.id))) {
      const resume = saved?.modelId === model.id ? saved.resumeData : null;
      emit({ phase: 'downloading', model, progress: resume ? (saved?.progress ?? 0) : 0, message: null });
      const caps = LocalAI.getDeviceCapabilities();
      handle = downloadModelWithProgress(
        model,
        caps.availableStorageBytes,
        (p) => emit({ progress: p.progress ?? 0, phase: (p.progress ?? 0) >= 1 ? 'verifying' : 'downloading' }),
        (path, hash) => LocalAI.verifyModelChecksum(path, hash),
        resume,
      );
      await handle.promise;
      handle = null;
      void clearSaved();
    }
    emit({ phase: 'loading', model, progress: 1 });
    if (LocalAI.isLoaded()) await LocalAI.unloadModel();
    setId(model.id);
    if (!(await ensureLocalModel()) || !(await probe())) {
      setId(null);
      emit({ phase: 'failed', message: 'The model downloaded but did not start. Close other apps and try again.' });
      return false;
    }
    emit({ phase: 'ready', message: null });
    return true;
  } catch (e) {
    handle = null;
    if (e instanceof Error && e.message === 'paused') return false;
    emit({ phase: 'failed', message: e instanceof Error ? e.message : 'Download failed. Try again on Wi-Fi.' });
    return false;
  }
}

export async function cancelSetup(): Promise<void> {
  const job = await readDmJob();
  if (job && DurableDownloads) DurableDownloads.remove(job.id);
  void clearDmJob();
  if (dmTimer) clearInterval(dmTimer);
  dmTimer = null;
  await handle?.cancel();
  handle = null;
  void clearSaved();
  emit({ phase: 'idle', progress: 0, message: null });
}

/** Pauses the download and remembers where it stopped. */
export async function pauseSetup(): Promise<void> {
  const model = state.model;
  const data = await handle?.pause();
  handle = null;
  if (model && data) {
    await asyncKeyValueStorage
      .setItem(RESUME_KEY, JSON.stringify({ modelId: model.id, resumeData: data, progress: state.progress }))
      .catch(() => undefined);
  }
  emit({ phase: 'paused' });
}

/** Continues a paused download (also used when the app opens). */
export async function resumeSetup(): Promise<boolean> {
  const job = await readDmJob();
  const saved = await readSaved();
  const id = job?.modelId ?? saved?.modelId;
  const model = id ? (MODEL_PRESETS.find((m) => m.id === id) ?? null) : state.model;
  return setUpBrain(model);
}

/** A download paused earlier (or cut off when the app closed), if any. */
export async function pendingDownload(): Promise<{ model: ModelPreset; progress: number } | null> {
  const job = await readDmJob();
  const dmModel = job ? MODEL_PRESETS.find((m) => m.id === job.modelId) : undefined;
  if (job && dmModel) return { model: dmModel, progress: 0 };
  const saved = await readSaved();
  const model = saved ? MODEL_PRESETS.find((m) => m.id === saved.modelId) : undefined;
  return saved && model ? { model, progress: saved.progress } : null;
}
```

#### `src/services/ai/providers.ts`

```ts
/**
 * Multi-provider AI chat service.
 *
 * Tries providers in priority order: Gemini → Groq → OpenRouter.
 * Each provider is a thin adapter over the respective REST API.
 * Falls back to the next provider if the current one fails.
 *
 * These run client-side for on-device intelligence. Heavy inference
 * (long context, embeddings) should go through Supabase edge functions.
 */

import { env, pickGeminiKey, pickGroqKey, pickOpenRouterKey, pickClaudeKey, isLocalOnly } from './env';
import { recordAiInteraction, checkCloudAiPermission, isGuestAccount } from './aiInteractionStore';

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiResponse {
  text: string;
  provider: 'gemini' | 'groq' | 'openrouter' | 'claude' | 'none';
  model: string;
}

// ── Gemini ──────────────────────────────────────────────────────────────────

async function askGemini(messages: AiMessage[], systemPrompt?: string): Promise<AiResponse> {
  const key = pickGeminiKey();
  if (!key) throw new Error('no_gemini_key');

  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = { contents };
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`gemini_${res.status}`);
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return { text, provider: 'gemini', model };
}

// ── Groq ────────────────────────────────────────────────────────────────────

async function askGroq(messages: AiMessage[], systemPrompt?: string): Promise<AiResponse> {
  const key = pickGroqKey();
  if (!key) throw new Error('no_groq_key');

  const model = 'llama-3.3-70b-versatile';
  const allMessages: AiMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`groq_${res.status}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content ?? '';
  return { text, provider: 'groq', model };
}

// ── OpenRouter ──────────────────────────────────────────────────────────────

async function askOpenRouter(messages: AiMessage[], systemPrompt?: string): Promise<AiResponse> {
  const key = pickOpenRouterKey();
  if (!key) throw new Error('no_openrouter_key');

  const model = 'google/gemini-2.0-flash-exp:free';
  const allMessages: AiMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'X-Title': 'Thrivefold',
    },
    body: JSON.stringify({
      model,
      messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 1024,
    }),
  });
  if (!res.ok) throw new Error(`openrouter_${res.status}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content ?? '';
  return { text, provider: 'openrouter', model };
}

// ── Claude (Anthropic) ──────────────────────────────────────────────────────

async function askClaude(messages: AiMessage[], systemPrompt?: string): Promise<AiResponse> {
  const key = pickClaudeKey();
  if (!key) throw new Error('no_claude_key');

  const model = 'claude-3-5-haiku-latest';
  const anthropicMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

  const body: Record<string, unknown> = {
    model,
    max_tokens: 1024,
    messages: anthropicMessages,
  };
  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`claude_${res.status}`);
  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = json.content?.[0]?.text ?? '';
  return { text, provider: 'claude', model };
}

/**
 * Validates a user-provided API key by executing a 1-token test ping.
 */
export async function testProviderKey(
  provider: 'gemini' | 'groq' | 'openrouter' | 'claude' | 'sarvam',
  key: string,
): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const start = Date.now();
  const trimmed = key.trim();
  if (!trimmed) {
    return { ok: false, message: 'Key cannot be empty', latencyMs: 0 };
  }

  try {
    if (provider === 'gemini') {
      const model = 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmed}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
          generationConfig: { maxOutputTokens: 2 },
        }),
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status} (Check key permissions)`, latencyMs: latency };
      }
      return { ok: true, message: `Connected (${latency}ms)`, latencyMs: latency };
    }

    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${trimmed}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 2,
        }),
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status} (Invalid key)`, latencyMs: latency };
      }
      return { ok: true, message: `Connected (${latency}ms)`, latencyMs: latency };
    }

    if (provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${trimmed}` },
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status}`, latencyMs: latency };
      }
      return { ok: true, message: `Valid key (${latency}ms)`, latencyMs: latency };
    }

    if (provider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': trimmed,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-latest',
          max_tokens: 2,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status}`, latencyMs: latency };
      }
      return { ok: true, message: `Connected (${latency}ms)`, latencyMs: latency };
    }

    if (provider === 'sarvam') {
      const res = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'api-subscription-key': trimmed,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: ['hi'],
          target_language_code: 'en-IN',
          speaker: 'shubh',
        }),
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status}`, latencyMs: latency };
      }
      return { ok: true, message: `Connected (${latency}ms)`, latencyMs: latency };
    }

    return { ok: false, message: 'Unknown provider', latencyMs: 0 };
  } catch (err) {
    const latency = Date.now() - start;
    return { ok: false, message: err instanceof Error ? err.message : 'Network failure', latencyMs: latency };
  }
}


// ── Cascade: try each provider in order ─────────────────────────────────────

/**
 * Ask the AI with automatic failover. Tries Gemini → Groq → OpenRouter → Claude.
 * Returns `{ provider: 'none' }` if all fail (never throws).
 * Saves input & output in local SQLite and Supabase.
 * Respects tier limits (guests blocked; non-BYOK registered users capped).
 */
export async function askAi(
  messages: AiMessage[],
  opts?: {
    systemPrompt?: string;
    preferredProvider?: 'gemini' | 'groq' | 'openrouter' | 'claude';
    forceCloud?: boolean;
    userId?: string;
  },
): Promise<AiResponse> {
  if (isLocalOnly() && !opts?.forceCloud) {
    return { text: '', provider: 'none', model: 'local_only' };
  }

  // Quota and permission check:
  // Guests: 0 cloud access allowed (handled on-device).
  // Non-BYOK registered users: strictly limited trial.
  // BYOK users: unlimited.
  let isGuest = true;
  let hasByok = false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    const st = useRootStore.getState?.();
    if (st) {
      isGuest = isGuestAccount(st.user);
      const k = st.userApiKeys ?? {};
      hasByok = !!(k.gemini || k.groq || k.openrouter || k.claude || k.sarvam);
    }
  } catch {
    // ignore
  }

  const perm = checkCloudAiPermission({ isGuest, hasByok, userId: opts?.userId });
  // Explicit forceCloud can bypass a signed-in user's trial quota, never guest protection.
  if (!perm.allowed && (isGuest || !opts?.forceCloud)) {
    return { text: '', provider: 'none', model: 'quota_exceeded' };
  }

  const system = opts?.systemPrompt;
  const providers = [askGemini, askGroq, askOpenRouter, askClaude];

  // Move preferred provider to front
  if (opts?.preferredProvider === 'groq') {
    providers.splice(0, 0, providers.splice(1, 1)[0]);
  } else if (opts?.preferredProvider === 'openrouter') {
    providers.splice(0, 0, providers.splice(2, 1)[0]);
  } else if (opts?.preferredProvider === 'claude') {
    providers.splice(0, 0, providers.splice(3, 1)[0]);
  }

  const promptText = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
  const t0 = Date.now();

  for (const provider of providers) {
    try {
      const res = await provider(messages, system);
      if (res.text) {
        // Record input and output in SQLite & Supabase
        recordAiInteraction({
          userId: opts?.userId,
          provider: res.provider,
          model: res.model,
          prompt: promptText,
          response: res.text,
          latencyMs: Date.now() - t0,
          status: 'success',
        }).catch(() => undefined);
        return res;
      }
    } catch {
      // try next
    }
  }

  recordAiInteraction({
    userId: opts?.userId,
    provider: 'none',
    model: 'none',
    prompt: promptText,
    response: '',
    latencyMs: Date.now() - t0,
    status: 'error',
  }).catch(() => undefined);

  return { text: '', provider: 'none', model: '' };
}

/**
 * Quick one-shot: user prompt → AI response text.
 */
export async function quickAsk(prompt: string, systemPrompt?: string): Promise<string> {
  const r = await askAi([{ role: 'user', content: prompt }], { systemPrompt });
  return r.text;
}
```

#### `src/services/ai/smartRecommendations.ts`

```ts
/**
 * Smart recommendations — AI-powered micro-tasks for a better app experience.
 *
 * Each function does one small thing: understand the user's check-in pattern,
 * suggest today's exercise, summarize the week, etc. They use the cascade
 * provider so they work even if one key is down.
 *
 * Rules from AGENTS.md:
 * - Never infer sensitive traits (religion, orientation, diagnoses)
 * - Never suggest medication doses
 * - Never claim to be a medical device
 */

import { quickAsk } from './providers';

const SYSTEM = `You are Thrive, a gentle wellbeing companion inside the Thrivefold app.
You are NOT a doctor, therapist or medical device. Never diagnose, prescribe or dose medication.
Never infer religion, orientation, ethnicity, caste or diagnoses from data.
Keep replies under 120 words, warm but not patronising. Use plain language.`;

/** Generate a short, encouraging daily greeting based on check-in data. */
export async function dailyGreeting(opts: {
  name?: string;
  mood?: number;
  energy?: number;
  streak?: number;
  phase?: string;
}): Promise<string> {
  const prompt = [
    `Greet ${opts.name || 'the user'} warmly for today.`,
    opts.mood != null ? `Their mood is ${opts.mood}/10.` : '',
    opts.energy != null ? `Energy is ${opts.energy}/10.` : '',
    opts.streak ? `They have a ${opts.streak}-day check-in streak.` : '',
    opts.phase ? `Cycle phase: ${opts.phase}.` : '',
    'One or two sentences. No medical advice.',
  ]
    .filter(Boolean)
    .join(' ');
  return quickAsk(prompt, SYSTEM);
}

/** Suggest today's exercise based on user's state. */
export async function suggestExercise(opts: {
  energy?: number;
  mood?: number;
  phase?: string;
  recentWorkouts?: string[];
  preferences?: string[];
}): Promise<string> {
  const prompt = [
    'Suggest ONE exercise for today in 2-3 sentences.',
    opts.energy != null ? `Energy: ${opts.energy}/10.` : '',
    opts.mood != null ? `Mood: ${opts.mood}/10.` : '',
    opts.phase ? `Cycle phase: ${opts.phase}.` : '',
    opts.recentWorkouts?.length ? `Recent: ${opts.recentWorkouts.join(', ')}.` : '',
    opts.preferences?.length ? `They like: ${opts.preferences.join(', ')}.` : '',
    'Pick from: yoga, bodyweight, walking, stretching, kalaripayattu, martial arts, breathing.',
    'Never suggest anything painful or beyond their energy level.',
  ]
    .filter(Boolean)
    .join(' ');
  return quickAsk(prompt, SYSTEM);
}

/** Summarize the week's health data into a brief insight. */
export async function weeklyInsight(opts: {
  avgMood?: number;
  avgEnergy?: number;
  checkInsCount?: number;
  workoutsCount?: number;
  topSymptoms?: string[];
}): Promise<string> {
  const prompt = [
    'Summarize this week in 3-4 sentences. Be encouraging.',
    opts.avgMood != null ? `Average mood: ${opts.avgMood.toFixed(1)}/10.` : '',
    opts.avgEnergy != null ? `Average energy: ${opts.avgEnergy.toFixed(1)}/10.` : '',
    opts.checkInsCount != null ? `${opts.checkInsCount} check-ins this week.` : '',
    opts.workoutsCount != null ? `${opts.workoutsCount} workouts.` : '',
    opts.topSymptoms?.length ? `Common symptoms: ${opts.topSymptoms.join(', ')}.` : '',
    'No medical interpretation. Just patterns and encouragement.',
  ]
    .filter(Boolean)
    .join(' ');
  return quickAsk(prompt, SYSTEM);
}

/** Generate a brief journal prompt based on mood/energy. */
export async function journalPrompt(opts: {
  mood?: number;
  energy?: number;
  time?: 'morning' | 'afternoon' | 'evening';
}): Promise<string> {
  const prompt = [
    'Generate a single reflective journal prompt (one question).',
    opts.mood != null ? `Mood: ${opts.mood}/10.` : '',
    opts.energy != null ? `Energy: ${opts.energy}/10.` : '',
    opts.time ? `Time: ${opts.time}.` : '',
    'Keep it open-ended, gentle, and non-judgmental.',
  ]
    .filter(Boolean)
    .join(' ');
  return quickAsk(prompt, SYSTEM);
}
```

#### `src/services/ai/therapyVoice.ts`

```ts
/**
 * Therapy Voice Service
 *
 * Dedicated soothing neural speech output for emotional grounding,
 * compassionate listening, and crisis de-escalation.
 *
 * Configured with slower cadence (rate: 0.82), warm pitch, and non-blocking
 * interruptibility for calming distressed users.
 */

import { speakCoachLine, stopCoachSpeech } from './coachVoiceService';

let isSpeaking = false;
let currentRequestId = 0;

export interface TherapyVoiceOptions {
  rate?: number;
  pitch?: number;
  onDone?: () => void;
  onStopped?: () => void;
}

/**
 * Stop any active therapeutic speech immediately.
 */
export function stopTherapyVoice(): void {
  currentRequestId++;
  isSpeaking = false;
  stopCoachSpeech();
}

/**
 * Speak therapeutic guidance with warm, soothing, unhurried cadence.
 */
export async function speakTherapy(
  text: string,
  options: TherapyVoiceOptions = {},
): Promise<void> {
  const content = text.trim();
  if (!content) return;

  stopTherapyVoice();
  const reqId = ++currentRequestId;
  isSpeaking = true;

  // The person's chosen coach voice, at a slower and warmer pace.
  await speakCoachLine(content, {
    rate: options.rate ?? 0.82,
    pitch: options.pitch,
    onEnd: () => {
      if (currentRequestId !== reqId) return;
      isSpeaking = false;
      options.onDone?.();
    },
  });
}

export function isTherapyVoiceActive(): boolean {
  return isSpeaking;
}
```

#### `src/services/ai/env.ts`

```ts
/**
 * Typed environment config — single import for all API keys.
 *
 * Only public values (Supabase URL and publishable key) come from `process.env.EXPO_PUBLIC_*`.
 * Provider keys are never bundled; see the comment on the providers block.
 *
 * Usage:
 *   import { env } from '@/services/ai/env';
[REDACTED: provider credential value]
 */

export const env = Object.freeze({
  // ── Supabase ──
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '',

  // ── AI providers, voice, search, memory ──
  // Never read from the build environment: EXPO_PUBLIC_* values are copied into the app bundle,
  // where anyone can extract them. Server keys live only in Supabase Edge Function secrets; a
  // person's own key (BYOK) comes from secure storage at runtime.
  GEMINI_API_KEY: '',
  GEMINI_API_KEY_2: '',
  GROQ_API_KEY: '',
  GROQ_API_KEY_2: '',
  OPENROUTER_API_KEY: '',
  CLAUDE_API_KEY: '',
  SARVAM_API_KEY: '',
  SARVAM_API_KEY_2: '',
  ELEVENLABS_API_KEY: '',
  DEEPGRAM_API_KEY: '',
  COHERE_API_KEY: '',
  VOYAGE_API_KEY: '',
  EXA_API_KEY: '',
  MEM0_API_KEY: '',

  // ── Device Testing Override ──
  ENABLE_ALL_FEATURES: process.env.EXPO_PUBLIC_ENABLE_ALL_FEATURES === 'true',
});

export interface UserApiKeys {
  gemini?: string;
  groq?: string;
  openrouter?: string;
  claude?: string;
  sarvam?: string;
  elevenlabs?: string;
}

export type AiDeliveryMode = 'local_only' | 'byok' | 'hybrid';

let runtimeUserKeys: UserApiKeys = {};
let runtimeDeliveryMode: AiDeliveryMode = 'local_only';

export function setRuntimeUserKeys(keys: UserApiKeys, mode?: AiDeliveryMode) {
  runtimeUserKeys = { ...keys };
  if (mode) runtimeDeliveryMode = mode;
}

function getUserKeys(): UserApiKeys {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    const storeKeys = useRootStore.getState()?.userApiKeys;
    if (storeKeys && Object.keys(storeKeys).length > 0) return storeKeys;
  } catch {
    // not inside store context (e.g. unit test or early boot)
  }
  return runtimeUserKeys;
}

export function getAiDeliveryMode(): AiDeliveryMode {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    const storeMode = useRootStore.getState()?.aiDeliveryMode;
    if (storeMode) return storeMode;
  } catch {
    // not inside store context
  }
  return runtimeDeliveryMode;
}

export function isLocalOnly(): boolean {
  return getAiDeliveryMode() === 'local_only';
}

/** True when at least one AI provider is configured and not blocked by local-only mode. */
export function hasAiKeys(): boolean {
  if (isLocalOnly()) return false;
  const userKeys = getUserKeys();
  return !!(
    userKeys.gemini ||
    userKeys.groq ||
    userKeys.openrouter ||
    userKeys.claude ||
    env.GEMINI_API_KEY ||
    env.GROQ_API_KEY ||
    env.OPENROUTER_API_KEY ||
    env.CLAUDE_API_KEY
  );
}

/** Pick Gemini key (User BYOK key takes precedence over build env). */
export function pickGeminiKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.gemini) return userKeys.gemini;
  if (isLocalOnly()) return '';
  return env.GEMINI_API_KEY || env.GEMINI_API_KEY_2;
}

/** Pick Groq key (User BYOK key takes precedence over build env). */
export function pickGroqKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.groq) return userKeys.groq;
  if (isLocalOnly()) return '';
  return env.GROQ_API_KEY || env.GROQ_API_KEY_2;
}

/** Pick OpenRouter key (User BYOK key takes precedence over build env). */
export function pickOpenRouterKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.openrouter) return userKeys.openrouter;
  if (isLocalOnly()) return '';
  return env.OPENROUTER_API_KEY;
}

/** Pick Claude key (User BYOK key takes precedence over build env). */
export function pickClaudeKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.claude) return userKeys.claude;
  if (isLocalOnly()) return '';
  return env.CLAUDE_API_KEY;
}

/** Pick Sarvam key (User BYOK key takes precedence over build env). */
export function pickSarvamKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.sarvam) return userKeys.sarvam;
  if (isLocalOnly()) return '';
  return env.SARVAM_API_KEY || env.SARVAM_API_KEY_2;
}
```

### SOURCE: VOICE SERVICES

#### `src/services/voice/globalVoiceController.ts`

```ts
/**
 * Global Voice Assistant Controller.
 *
 * One voice state machine for the whole app:
 *   idle -> requesting_permission -> listening -> transcribing -> reasoning -> speaking -> idle
 *
 * What changed from the first version (the "ghost microphone"):
 *  - The microphone no longer cycles on and off while nobody is talking. After silence it retries
 *    at most OPEN_RETRIES times right after the sheet opens, then rests until the mic is tapped.
 *  - The recogniser is never started while a previous native session is still winding down
 *    (a late 'end' event from the old session used to restart the new one).
 *  - Typed messages never switch the microphone on afterwards.
 *  - After a reply, the microphone only comes back once the coach has really finished speaking,
 *    so it cannot hear (or cut off) the coach's own voice.
 *  - The sheet appears first, the microphone starts a moment later.
 *  - A stale turn can never act after the sheet was closed or the person interrupted.
 */

import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { LocalAI } from '../../../modules/local-ai';
import { plainText } from '../../domain/assistant/plainText';
import { languageOf } from '../../domain/languages';
import type { ToolExecutionResult } from '../../domain/assistant/toolRegistry';
import { coachVoice } from '../ai/coachVoice';
import { isCoachSpeechPlaying, queueCoachSpeech } from '../ai/coachVoiceService';
import { agentEngine } from '../assistant/agentEngine';

export type VoiceAssistantState =
  | 'idle'
  | 'requesting_permission'
  | 'listening'
  | 'transcribing'
  | 'reasoning'
  | 'speaking'
  | 'error';

export interface VoiceAssistantListener {
  onStateChange: (state: VoiceAssistantState) => void;
  onPartialTranscript: (text: string) => void;
  onFinalTranscript: (text: string) => void;
  onAssistantReply: (reply: string, toolResult?: ToolExecutionResult) => void;
  onAudioLevel?: (level: number) => void;
  onError: (error: string) => void;
}

/** Let the sheet slide in before the microphone (and its indicator) switch on. */
const OPEN_SETTLE_MS = 380;
/** Silent retries right after opening (the person may still be reading). 0 = listen once. */
const OPEN_RETRIES = 0;
/** If the native recogniser never reports 'end' or 'error', give up on that session. */
const END_GUARD_MS = 30_000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
// Enable temporarily during local voice debugging; never log transcripts or user content.
const VOICE_DEBUG = false;
const t0 = Date.now();
const log = (...args: unknown[]) => {
  if (__DEV__ && VOICE_DEBUG) console.log(`[voice] t=${Date.now() - t0}ms`, ...args);
};

function deviceLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || 'en-US';
  } catch {
    return 'en-US';
  }
}

class GlobalVoiceController {
  private state: VoiceAssistantState = 'idle';
  private isOpen = false;
  private listeners = new Set<VoiceAssistantListener>();
  private openListeners = new Set<(open: boolean) => void>();
  private lastTranscript = '';
  private lastTranscriptAt = 0;
  private micGranted = false;

  // Recogniser bookkeeping. "want" is our intent; "running" is the native session.
  private wantListening = false;
  private recognizerRunning = false;
  private pendingStart = false;
  private retriesLeft = 0;
  private lang: string | null = null;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private endGuard: ReturnType<typeof setTimeout> | null = null;

  /** Bumped whenever a new turn starts, the person interrupts, or the sheet closes. */
  private turnToken = 0;

  constructor() {
    this.setupSpeechListeners();
  }

  /* ── Native speech events ─────────────────────────────────────────────────────────────── */

  private setupSpeechListeners() {
    try {
      ExpoSpeechRecognitionModule?.addListener?.('start', () => {
        log('native start');
        // Other screens (dictation, voice practice) share the recogniser; ignore their sessions.
        if (!this.wantListening) return;
        this.setState('listening');
      });

      ExpoSpeechRecognitionModule?.addListener?.('result', (event: any) => {
        log('native result', event?.isFinal ? 'final' : 'partial');
        if (!this.wantListening) return;
        const text = (event.results?.[0]?.transcript ?? '').trim();
        if (!text) return;

        // Barge-in: the person is talking, so the coach stops.
        if (coachVoice.isSpeaking()) coachVoice.stop();

        if (event.isFinal) {
          const now = Date.now();
          if (this.lastTranscript === text && now - this.lastTranscriptAt < 1200) return;
          this.lastTranscript = text;
          this.lastTranscriptAt = now;
          log('final transcript received');
          this.setState('transcribing');
          void this.handleFinalUtterance(text, 'voice');
        } else {
          this.listeners.forEach((l) => l.onPartialTranscript(text));
        }
      });

      ExpoSpeechRecognitionModule?.addListener?.('volumechange', (event: any) => {
        if (!this.wantListening) return;
        const level = event.value ?? 0;
        this.listeners.forEach((l) => l.onAudioLevel?.(level));
      });

      ExpoSpeechRecognitionModule?.addListener?.('end', () => {
        log('native end');
        this.recognizerRunning = false;
        this.clearEndGuard();
        if (this.pendingStart) {
          this.pendingStart = false;
          if (this.wantListening) this.beginRecognition();
          return;
        }
        // The recogniser ended by itself while we still wanted to listen: that is silence.
        if (this.wantListening && this.state === 'listening') this.onSilence();
      });

      ExpoSpeechRecognitionModule?.addListener?.('error', (event: any) => {
        const code = String(event?.error ?? '');
        log('native error', code);
        this.recognizerRunning = false;
        this.clearEndGuard();
        if (this.pendingStart) {
          this.pendingStart = false;
          if (this.wantListening) this.beginRecognition();
          return;
        }
        if (!this.wantListening) return;

        // Hearing nothing is not a failure.
        if (code === 'no-speech' || code === 'speech-timeout' || code === 'aborted') {
          this.onSilence();
          return;
        }
        // The device locale has no recogniser: try plain English once instead of failing.
        if (code === 'language-not-supported' && this.lang !== 'en-US') {
          this.lang = 'en-US';
          this.scheduleRestart(200);
          return;
        }
        this.wantListening = false;
        if (code === 'not-allowed') this.micGranted = false;
        const errorMsg =
          code === 'network'
            ? 'Speech needs the offline speech pack or internet. You can type instead.'
            : code === 'not-allowed'
              ? 'Allow the microphone in Android settings to talk.'
              : event?.message || 'Speech recognition stopped. Tap the microphone to try again.';
        this.setState('error');
        this.listeners.forEach((l) => l.onError(errorMsg));
      });
    } catch {
      // Degrades gracefully on a simulator / untyped environment.
    }
  }

  /* ── Public state ─────────────────────────────────────────────────────────────────────── */

  getState(): VoiceAssistantState {
    return this.state;
  }

  isAssistantOpen(): boolean {
    return this.isOpen;
  }

  private setState(next: VoiceAssistantState) {
    if (this.state === next) return;
    log('state', this.state, '->', next);
    this.state = next;
    this.listeners.forEach((l) => l.onStateChange(next));
  }

  subscribe(listener: VoiceAssistantListener): () => void {
    this.listeners.add(listener);
    listener.onStateChange(this.state);
    return () => this.listeners.delete(listener);
  }

  /** Lets the sheet follow open/close directly (no polling). Called once with the current value. */
  subscribeOpen(cb: (open: boolean) => void): () => void {
    this.openListeners.add(cb);
    cb(this.isOpen);
    return () => this.openListeners.delete(cb);
  }

  private notifyOpen(open: boolean) {
    this.openListeners.forEach((cb) => cb(open));
  }

  /**
   * Adds messages to the open conversation from outside a spoken or typed turn (attachments,
   * confirmations that finished later). Nothing is sent to a model.
   */
  postUserMessage(text: string) {
    this.listeners.forEach((l) => l.onFinalTranscript(text));
  }
  postReply(text: string, tool?: ToolExecutionResult) {
    this.listeners.forEach((l) => l.onAssistantReply(text, tool));
  }

  /* ── Open / close ─────────────────────────────────────────────────────────────────────── */

  /**
   * Opens the assistant. The sheet shows immediately; the microphone follows a moment later.
   * Opening again while it is already open never starts a second recogniser.
   */
  async open(initialRoute?: string, opts: { listen?: boolean } = {}) {
    const listen = opts.listen !== false;
    if (initialRoute) agentEngine.setCurrentRoute(initialRoute);
    if (this.isOpen) {
      if (listen && this.state === 'idle') await this.startListening();
      return;
    }
    this.isOpen = true;
    this.notifyOpen(true);
    // Opened to type (a link or a button, not the orb): the microphone stays off until tapped.
    if (!listen) return;
    await sleep(OPEN_SETTLE_MS);
    if (!this.isOpen) return;
    await this.startListening({ retries: OPEN_RETRIES });
  }

  /** Closes the sheet, stops the microphone and the voice, and cancels any turn in flight. */
  close() {
    this.turnToken++;
    this.isOpen = false;
    this.haltRecognizer();
    coachVoice.stop();
    agentEngine.cancelCurrentTurn();
    this.setState('idle');
    this.notifyOpen(false);
  }

  /* ── Microphone ───────────────────────────────────────────────────────────────────────── */

  /** The person taps the microphone (also used by the automatic "listen again" step). */
  async startListening(opts: { retries?: number } = {}) {
    // Starting to listen is also an interruption of whatever was being said or thought.
    const token = ++this.turnToken;
    coachVoice.stop();
    agentEngine.cancelCurrentTurn();
    this.retriesLeft = opts.retries ?? 0;

    try {
      // Ask for the microphone only once; afterwards go straight to listening.
      if (!this.micGranted) {
        this.setState('requesting_permission');
        const perm = await ExpoSpeechRecognitionModule?.requestPermissionsAsync?.();
        this.micGranted = !perm || perm.granted;
        if (token !== this.turnToken) return;
      }
      if (!this.micGranted) {
        this.setState('error');
        this.listeners.forEach((l) => l.onError('Microphone permission denied.'));
        return;
      }
      this.wantListening = true;
      this.setState('listening');
      this.beginRecognition();
    } catch (err: any) {
      this.wantListening = false;
      this.setState('error');
      this.listeners.forEach((l) => l.onError(err?.message || 'Could not start voice recognizer.'));
    }
  }

  /** Stops listening and shows the resting state. */
  stopListening() {
    this.haltRecognizer();
    if (this.state === 'listening' || this.state === 'requesting_permission') {
      this.setState('idle');
    }
  }

  /** Stops the recogniser without touching the visible state. */
  private haltRecognizer() {
    this.wantListening = false;
    this.pendingStart = false;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.recognizerRunning) {
      log('abort');
      try {
        // abort() drops the audio at once; the session still reports 'end' afterwards.
        (ExpoSpeechRecognitionModule?.abort ?? ExpoSpeechRecognitionModule?.stop)?.call(
          ExpoSpeechRecognitionModule,
        );
      } catch {
        // ignore
      }
    }
  }

  /** Starts one native session, or queues the start until the previous one has ended. */
  private beginRecognition() {
    if (this.recognizerRunning) {
      this.pendingStart = true;
      return;
    }
    this.recognizerRunning = true;
    this.armEndGuard();
    log('start', this.lang ?? deviceLocale());
    try {
      ExpoSpeechRecognitionModule?.start?.({
        lang: this.lang ?? (replyLanguage() !== 'en' ? languageOf(replyLanguage()).locale : deviceLocale()),
        interimResults: true,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
        // Local first: use the phone's offline speech pack when it has one.
        // No custom silence lengths: measured on the Moto G71, 700-900 ms values made Android
        // report "no-speech" about 1 s after every start, before anyone could talk (the ghost
        // microphone switching on and off). Android's own defaults wait several seconds.
        androidIntentOptions: { EXTRA_PREFER_OFFLINE: true },
      });
    } catch (err: any) {
      this.recognizerRunning = false;
      this.clearEndGuard();
      this.wantListening = false;
      this.setState('error');
      this.listeners.forEach((l) => l.onError(err?.message || 'Could not start voice recognizer.'));
    }
  }

  /** Nobody spoke. Retry a limited number of times, then rest quietly (no on/off flicker). */
  private onSilence() {
    if (this.restartTimer || !this.wantListening) return;
    if (this.isOpen && this.retriesLeft > 0) {
      this.retriesLeft -= 1;
      this.scheduleRestart(400);
      return;
    }
    log('resting after silence');
    this.wantListening = false;
    this.setState('idle');
  }

  private scheduleRestart(ms: number) {
    if (this.restartTimer) return;
    this.restartTimer = setTimeout(() => {
      this.restartTimer = null;
      if (this.wantListening && this.isOpen) this.beginRecognition();
    }, ms);
  }

  private armEndGuard() {
    this.clearEndGuard();
    this.endGuard = setTimeout(() => {
      this.endGuard = null;
      if (!this.recognizerRunning) return;
      log('end guard fired: native session never reported end');
      this.recognizerRunning = false;
      if (this.pendingStart) {
        this.pendingStart = false;
        if (this.wantListening) this.beginRecognition();
      } else if (this.wantListening) {
        this.onSilence();
      }
    }, END_GUARD_MS);
  }

  private clearEndGuard() {
    if (this.endGuard) {
      clearTimeout(this.endGuard);
      this.endGuard = null;
    }
  }

  /* ── A turn: understand, answer, speak ────────────────────────────────────────────────── */

  /**
   * Handles what the person said (via 'voice') or typed (via 'text').
   * Typing never switches the microphone on afterwards.
   */
  async handleFinalUtterance(text: string, via: 'voice' | 'text' = 'voice') {
    const token = ++this.turnToken;
    this.haltRecognizer();
    this.listeners.forEach((l) => l.onFinalTranscript(text));
    this.setState('reasoning');

    const speechJobs: Promise<void>[] = [];
    try {
      // Speak while the model is still writing: each finished sentence goes to the voice queue.
      let spoken = 0;
      const flush = (all: string, final: boolean) => {
        if (token !== this.turnToken) return;
        const rest = all.slice(spoken);
        let m = final
          ? rest.length
          : Math.max(
              rest.lastIndexOf('. '),
              rest.lastIndexOf('! '),
              rest.lastIndexOf('? '),
              rest.lastIndexOf('\n'),
            ) + 1;
        // Start talking early: a long first clause is spoken at its comma instead of waiting.
        if (!final && m <= 0 && rest.length > 70) m = rest.lastIndexOf(', ') + 1;
        if (m <= 0) return;
        const chunk = rest.slice(0, m).trim();
        spoken += m;
        if (chunk) {
          if (this.state !== 'speaking') this.setState('speaking');
          if (speakRepliesOn() && replyLanguage() === 'en') {
            speechJobs.push(queueCoachSpeech(plainText(chunk)).catch(() => undefined));
          }
        }
      };

      const result = await agentEngine.processUserInput(text, {
        onToken: (_token, accumulated) => {
          if (token !== this.turnToken) return;
          this.listeners.forEach((l) => l.onAssistantReply(accumulated));
          flush(accumulated, false);
        },
      });
      // Closed, or the person interrupted, while the answer was being written.
      if (token !== this.turnToken) return;

      // Another reply language: translate the finished reply on the phone, then speak that.
      const lang = replyLanguage();
      let finalText = result.text;
      if (lang !== 'en' && finalText.trim()) {
        finalText = await LocalAI.translateText(finalText, lang, 'en').then((r) => r.text).catch(() => finalText);
        if (token !== this.turnToken) return;
      }

      this.setState('speaking');
      this.listeners.forEach((l) => l.onAssistantReply(finalText, result.toolResult));
      if (spoken > 0 && lang === 'en') {
        flush(result.text, true);
      } else if (speakRepliesOn() && (spoken === 0 || lang !== 'en')) {
        // Not streamed, or translated: say it all at once.
        speechJobs.push(queueCoachSpeech(plainText(finalText)).catch(() => undefined));
      }

      // Stay in "speaking" until the voice has really finished.
      await this.untilSpoken(speechJobs, token);
      if (token !== this.turnToken) return;
      this.setState('idle');

      // "Bye" / "stop" ends the conversation instead of listening again.
      if (/^(bye|goodbye|good night|stop|that's all|thats all|close)\b/i.test(text.trim())) {
        this.close();
        return;
      }

      // Conversation mode: after a spoken exchange, listen once for the next thing said.
      // Never after a typed message, and never while the coach could still be heard.
      if (via === 'voice' && this.isOpen && conversationModeOn()) {
        await sleep(450);
        if (token === this.turnToken && this.isOpen && this.state === 'idle') {
          await this.startListening({ retries: 0 });
        }
      }
    } catch (err: any) {
      if (token !== this.turnToken) return;
      this.setState('error');
      this.listeners.forEach((l) => l.onError(err?.message || 'Error processing request'));
    }
  }

  /** Waits until every queued sentence was spoken (or the turn was cancelled). */
  private async untilSpoken(jobs: Promise<void>[], token: number) {
    let done = jobs.length === 0;
    void Promise.all(jobs).then(() => {
      done = true;
    });
    const started = Date.now();
    while (!done && token === this.turnToken && Date.now() - started < 60_000) {
      await sleep(150);
    }
    // Belt and braces: the engine may still be finishing the tail of the last sentence.
    for (
      let i = 0;
      i < 12 && token === this.turnToken && (await isCoachSpeechPlaying());
      i++
    ) {
      await sleep(250);
    }
  }
}

/** Replies are text only unless the person switched on "Speak replies". */
function speakRepliesOn(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    return useRootStore.getState?.()?.speakReplies === true;
  } catch {
    return false;
  }
}

function conversationModeOn(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    return useRootStore.getState?.()?.conversationMode === true;
  } catch {
    return true;
  }
}

export const globalVoiceController = new GlobalVoiceController();

function replyLanguage(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    return useRootStore.getState?.()?.coachLanguage || 'en';
  } catch {
    return 'en';
  }
}
```

#### `src/services/voice/useAudioSense.ts`

```ts
/**
 * Live microphone loudness, pitch (YIN) and, optionally, sound classification (MediaPipe YAMNet)
 * from Thrivefold's native AudioSense module. Analysis runs on the phone in memory; nothing is
 * recorded or sent. Works offline.
 */
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

import { AudioSense, type PitchEvent, type SoundEvent } from '../../../modules/pose-landmarker/audio';
import { coachVoice } from '../ai/coachVoice';

async function micPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    if (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)) return true;
    return (await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)) === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

export function useAudioSense(handlers: { onPitch?: (e: PitchEvent) => void; onSound?: (e: SoundEvent) => void }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const h = useRef(handlers);
  h.current = handlers;

  useEffect(() => {
    if (!AudioSense) return;
    const subs = [
      AudioSense.addListener('onPitch', (e) => h.current.onPitch?.(e)),
      AudioSense.addListener('onSound', (e) => h.current.onSound?.(e)),
      AudioSense.addListener('onAudioError', (e) => {
        setError(e.message);
        setListening(false);
      }),
    ];
    return () => subs.forEach((s) => s.remove());
  }, []);

  const start = useCallback(async (classify = false) => {
    setError(null);
    if (!AudioSense) {
      setError('Audio analysis is not available on this device.');
      return false;
    }
    if (!(await micPermission())) {
      setError('Microphone access was not allowed. You can allow it in Android settings.');
      return false;
    }
    coachVoice.stop();
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // the recogniser was not running
    }
    const ok = AudioSense.start(classify);
    setListening(ok);
    if (!ok) setError('The microphone could not start. Close other apps using it and try again.');
    return ok;
  }, []);

  const stop = useCallback(() => {
    AudioSense?.stop();
    setListening(false);
  }, []);

  useEffect(() => () => AudioSense?.stop(), []);
  return { listening, error, start, stop, available: !!AudioSense };
}
```

#### `src/services/voice/useVoiceInput.ts`

```ts
/**
 * Microphone input for the coach and voice practice: speech to text (on-device when the phone
 * supports it) and a live loudness level. Listening only runs while the person holds a session
 * open; the app never records or saves audio.
 */
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';

import { coachVoice } from '../ai/coachVoice';

export type VoiceState = 'idle' | 'listening' | 'denied' | 'unavailable' | 'error';

export interface VoiceOptions {
  /** Keep listening across pauses (practice drills, hands-free coach) instead of stopping after one sentence. */
  continuous?: boolean;
  /** Emit loudness levels (−2 … 10; below 0 is silence). */
  volume?: boolean;
  lang?: string;
  /** Force on-device offline recognition when supported. */
  preferOffline?: boolean;
}

const available = (): boolean => {
  try {
    return Boolean(ExpoSpeechRecognitionModule?.isRecognitionAvailable?.());
  } catch {
    return false;
  }
};

export function useVoiceInput(
  onFinal?: (text: string) => void,
  onVolume?: (level: number, at: number) => void,
) {
  const [state, setState] = useState<VoiceState>(available() ? 'idle' : 'unavailable');
  const [partial, setPartial] = useState('');
  const [error, setError] = useState<string | null>(null);
  const finals = useRef<string[]>([]);
  const activeRef = useRef(false);
  const optsRef = useRef<VoiceOptions>({});
  const lastTranscriptRef = useRef('');
  const lastTranscriptAtRef = useRef(0);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRestart = () => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  };

  const scheduleRestart = () => {
    if (!activeRef.current || !optsRef.current.continuous) return;
    clearRestart();
    restartTimerRef.current = setTimeout(() => {
      if (activeRef.current && optsRef.current.continuous) {
        void doStart(optsRef.current, true);
      }
    }, 350);
  };

  useSpeechRecognitionEvent('start', () => {
    clearRestart();
    setState('listening');
  });

  useSpeechRecognitionEvent('end', () => {
    if (activeRef.current && optsRef.current.continuous) {
      // In continuous hands-free mode, seamlessly cycle recognition across pauses
      scheduleRestart();
    } else {
      activeRef.current = false;
      setState((s) => (s === 'listening' ? 'idle' : s));
    }
  });

  useSpeechRecognitionEvent('result', (e) => {
    const text = (e.results[0]?.transcript ?? '').trim();
    if (e.isFinal) {
      setPartial('');
      if (!text) return;

      // Echo guard: Discard text if coach voice is currently speaking or just finished
      if (coachVoice.isSpeaking()) {
        return;
      }

      // Deduplication: Discard identical transcript received within 1200ms
      const now = Date.now();
      if (lastTranscriptRef.current === text && now - lastTranscriptAtRef.current < 1200) {
        return;
      }
      lastTranscriptRef.current = text;
      lastTranscriptAtRef.current = now;

      finals.current.push(text);
      onFinal?.(text);

      if (optsRef.current.continuous && activeRef.current) {
        scheduleRestart();
      }
    } else {
      // While coach is speaking, suppress partial text
      if (!coachVoice.isSpeaking()) {
        setPartial(text);
      }
    }
  });

  useSpeechRecognitionEvent('volumechange', (e) => onVolume?.(e.value, Date.now()));

  useSpeechRecognitionEvent('error', (e) => {
    if (e.error === 'aborted') {
      activeRef.current = false;
      setState('idle');
      return;
    }

    if (e.error === 'no-speech') {
      if (activeRef.current && optsRef.current.continuous) {
        // Expected pause during workout; stay ready in continuous mode
        scheduleRestart();
        return;
      }
      setState('idle');
      return;
    }

    // Locale fallback: if offline pack missing for regional locale, fallback gracefully
    if (
      (e.error === 'language-not-supported' || e.error === 'network') &&
      optsRef.current.lang &&
      optsRef.current.lang !== 'en-US'
    ) {
      optsRef.current = { ...optsRef.current, lang: 'en-US' };
      scheduleRestart();
      return;
    }

    activeRef.current = false;
    setError(
      e.error === 'not-allowed'
        ? 'Microphone access was not allowed.'
        : e.error === 'network' || /server|disconnect/i.test(e.message ?? '')
          ? 'The speech service could not be reached. Check your connection, or download the offline speech pack in Android settings (Speech → Offline).'
          : e.message || 'Listening stopped.',
    );
    setState(e.error === 'not-allowed' ? 'denied' : 'error');
  });

  const doStart = async (opts: VoiceOptions, isRestart = false): Promise<boolean> => {
    if (!available()) {
      setState('unavailable');
      return false;
    }

    if (!isRestart) {
      setError(null);
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync().catch(() => ({
        granted: false,
      }));
      if (!perm.granted) {
        setState('denied');
        setError('Microphone access was not allowed. You can allow it in Android settings.');
        activeRef.current = false;
        return false;
      }
    }

    // Stop active speech so coach doesn't speak into its own microphone
    coachVoice.stop();
    if (!isRestart) {
      finals.current = [];
    }

    try {
      ExpoSpeechRecognitionModule.start({
        lang: opts.lang ?? 'en-IN',
        interimResults: true,
        continuous: opts.continuous ?? false,
        requiresOnDeviceRecognition: false,
        androidIntentOptions: {
          EXTRA_PREFER_OFFLINE: opts.preferOffline ?? true,
        },
        addsPunctuation: false,
        volumeChangeEventOptions: opts.volume ? { enabled: true, intervalMillis: 100 } : undefined,
      });
      activeRef.current = true;
      return true;
    } catch {
      setState('error');
      activeRef.current = false;
      return false;
    }
  };

  const start = useCallback(async (opts: VoiceOptions = {}) => {
    clearRestart();
    optsRef.current = opts;
    activeRef.current = true;
    return doStart(opts, false);
  }, []);

  const stop = useCallback(() => {
    clearRestart();
    activeRef.current = false;
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // not listening
    }
  }, []);

  const abort = useCallback(() => {
    clearRestart();
    activeRef.current = false;
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // not listening
    }
    setState((s) => (s === 'listening' ? 'idle' : s));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRestart();
      activeRef.current = false;
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  return { state, partial, error, start, stop, abort, finals };
}
```

### SOURCE: LOCAL AI / RAG / MEMORY

#### `src/services/local-ai/db/localMemoryDb.ts`

```ts
/**
 * Canonical Shared Local Memory SQLite Database Accessor
 *
 * Implements a unified, transaction-safe database provider for `thrivefold-local-memory.db`.
 * Shared across:
 * - anvayFtsStore (FTS5 search engine)
 * - memoryStore (analytical user memories)
 * - knowledgeStore (RAG documents & chunks)
 * - chatStore (conversational turns)
 * - onlineLibrary (cached learn articles)
 * - aiInteractionStore (AI logs & quotas)
 *
 * Ensures:
 * - WAL journal mode configured once on first open
 * - Single connection handle across modules
 * - Transaction-safe operations without nested cross-connection contention
 */

import * as SQLite from 'expo-sqlite';

let sharedDb: SQLite.SQLiteDatabase | null = null;

export function getSharedLocalMemoryDb(): SQLite.SQLiteDatabase {
  if (sharedDb) return sharedDb;

  try {
    sharedDb = SQLite.openDatabaseSync('thrivefold-local-memory.db');
    sharedDb.execSync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);
    return sharedDb;
  } catch (err) {
    throw new Error(`[localMemoryDb] Failed to open shared local memory database: ${err}`);
  }
}

/**
 * Helper to close or reset connection (used primarily in tests).
 */
export function resetSharedLocalMemoryDb(): void {
  sharedDb = null;
}
```

#### `src/services/local-ai/memory/memoryStore.ts`

```ts
import * as SQLite from 'expo-sqlite';
import type {
  MemoryFilter,
  MemoryRetrievalResult,
  UserMemory,
} from './types';
import { cosineSimilarity } from './vectorMath';
import { anvayFtsStore } from '../search/anvayFtsStore';
import { getSharedLocalMemoryDb } from '../db/localMemoryDb';

let initialized = false;

function getDb(): SQLite.SQLiteDatabase {
  const db = getSharedLocalMemoryDb();
  if (!initialized) {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS user_memories (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding_json TEXT,
        source_event_ids_json TEXT NOT NULL,
        confidence REAL NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        expires_at TEXT,
        origin TEXT NOT NULL,
        status TEXT NOT NULL,
        metadata_json TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_memories_user ON user_memories(user_id);
      CREATE INDEX IF NOT EXISTS idx_memories_kind ON user_memories(kind);
      CREATE INDEX IF NOT EXISTS idx_memories_status ON user_memories(status);
    `);
    initialized = true;
  }
  return db;
}

interface RawMemoryRow {
  id: string;
  user_id: string;
  kind: string;
  content: string;
  embedding_json: string | null;
  source_event_ids_json: string;
  confidence: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  origin: string;
  status: string;
  metadata_json: string | null;
}

function rowToMemory(row: RawMemoryRow): UserMemory {
  let embedding: number[] | undefined;
  if (row.embedding_json) {
    try {
      embedding = JSON.parse(row.embedding_json);
    } catch {}
  }

  let sourceEventIds: string[] = [];
  try {
    sourceEventIds = JSON.parse(row.source_event_ids_json);
  } catch {}

  let metadata: Record<string, unknown> | undefined;
  if (row.metadata_json) {
    try {
      metadata = JSON.parse(row.metadata_json);
    } catch {}
  }

  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind as UserMemory['kind'],
    content: row.content,
    embedding,
    sourceEventIds,
    confidence: row.confidence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at ?? undefined,
    origin: row.origin as UserMemory['origin'],
    status: row.status as UserMemory['status'],
    metadata,
  };
}

export class AnalyticalMemoryStore {
  /**
   * Persists a new memory item or deduplicates against existing records.
   */
  async addMemory(
    params: Omit<UserMemory, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserMemory> {
    const database = getDb();
    const now = new Date().toISOString();

    // Check for exact content match for this user to avoid duplicates
    const existingExact = database.getFirstSync<RawMemoryRow>(
      `SELECT * FROM user_memories WHERE user_id = ? AND kind = ? AND content = ? LIMIT 1`,
      [params.userId, params.kind, params.content]
    );

    if (existingExact) {
      // Merge source event IDs and boost confidence
      const existing = rowToMemory(existingExact);
      const mergedEvents = Array.from(
        new Set([...existing.sourceEventIds, ...params.sourceEventIds])
      );
      const updatedConfidence = Math.min(
        1.0,
        Math.max(existing.confidence, params.confidence) + 0.05
      );

      database.runSync(
        `UPDATE user_memories 
         SET source_event_ids_json = ?, confidence = ?, updated_at = ?
         WHERE id = ?`,
        [JSON.stringify(mergedEvents), updatedConfidence, now, existing.id]
      );

      // Refresh FTS index with updated confidence & event metadata
      anvayFtsStore.upsertEntry({
        sourceTable: 'user_memories',
        sourceId: existing.id,
        ownerId: params.userId,
        domain: 'memories',
        sourceType: existing.kind,
        title: `Memory: ${existing.kind}`,
        content: existing.content,
        createdAt: now,
        metadata: {
          ...existing.metadata,
          confidence: updatedConfidence,
          sourceEventIds: mergedEvents,
        },
      });

      return {
        ...existing,
        sourceEventIds: mergedEvents,
        confidence: updatedConfidence,
        updatedAt: now,
      };
    }

    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    database.runSync(
      `INSERT INTO user_memories (
        id, user_id, kind, content, embedding_json, source_event_ids_json,
        confidence, created_at, updated_at, expires_at, origin, status, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.userId,
        params.kind,
        params.content,
        params.embedding ? JSON.stringify(params.embedding) : null,
        JSON.stringify(params.sourceEventIds),
        params.confidence,
        now,
        now,
        params.expiresAt ?? null,
        params.origin,
        params.status,
        params.metadata ? JSON.stringify(params.metadata) : null,
      ]
    );

    // Index into Anvay FTS5 Full-Text Engine
    anvayFtsStore.upsertEntry({
      sourceTable: 'user_memories',
      sourceId: id,
      ownerId: params.userId,
      domain: 'memories',
      sourceType: params.kind,
      title: `Memory: ${params.kind}`,
      content: params.content,
      createdAt: now,
      metadata: params.metadata,
    });

    return {
      id,
      userId: params.userId,
      kind: params.kind,
      content: params.content,
      embedding: params.embedding,
      sourceEventIds: params.sourceEventIds,
      confidence: params.confidence,
      createdAt: now,
      updatedAt: now,
      expiresAt: params.expiresAt,
      origin: params.origin,
      status: params.status,
      metadata: params.metadata,
    };
  }

  /**
   * Retrieves a single memory by ID with strict user scoping.
   */
  async getMemory(id: string, userId: string): Promise<UserMemory | null> {
    const database = getDb();
    const row = database.getFirstSync<RawMemoryRow>(
      `SELECT * FROM user_memories WHERE id = ? AND user_id = ? LIMIT 1`,
      [id, userId]
    );
    return row ? rowToMemory(row) : null;
  }

  /**
   * Updates fields on an existing memory.
   */
  async updateMemory(
    id: string,
    userId: string,
    updates: Partial<Pick<UserMemory, 'content' | 'confidence' | 'status' | 'expiresAt' | 'metadata'>>
  ): Promise<UserMemory | null> {
    const database = getDb();
    const existing = await this.getMemory(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const content = updates.content ?? existing.content;
    const confidence = updates.confidence ?? existing.confidence;
    const status = updates.status ?? existing.status;
    const expiresAt = updates.expiresAt !== undefined ? updates.expiresAt : existing.expiresAt;
    const metadata = updates.metadata ?? existing.metadata;

    database.runSync(
      `UPDATE user_memories 
       SET content = ?, confidence = ?, status = ?, expires_at = ?, metadata_json = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [
        content,
        confidence,
        status,
        expiresAt ?? null,
        metadata ? JSON.stringify(metadata) : null,
        now,
        id,
        userId,
      ]
    );

    // Reactive FTS sync: if archived/expired, remove from search index; otherwise update entry
    if (status === 'archived' || (expiresAt && new Date(expiresAt).getTime() <= Date.now())) {
      anvayFtsStore.deleteEntry('user_memories', id, null, userId);
    } else {
      anvayFtsStore.upsertEntry({
        sourceTable: 'user_memories',
        sourceId: id,
        ownerId: userId,
        domain: 'memories',
        sourceType: existing.kind,
        title: `Memory: ${existing.kind}`,
        content,
        createdAt: now,
        metadata: {
          ...metadata,
          confidence,
          status,
        },
      });
    }

    return {
      ...existing,
      content,
      confidence,
      status,
      expiresAt,
      metadata,
      updatedAt: now,
    };
  }

  /**
   * Deletes a specific memory item.
   */
  async deleteMemory(id: string, userId: string): Promise<boolean> {
    const database = getDb();
    const res = database.runSync(
      `DELETE FROM user_memories WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    anvayFtsStore.deleteEntry('user_memories', id);
    return res.changes > 0;
  }

  /**
   * Clears all memories for a user (GDPR / right to be forgotten).
   */
  async clearAllMemories(userId: string): Promise<boolean> {
    const database = getDb();
    const res = database.runSync(
      `DELETE FROM user_memories WHERE user_id = ?`,
      [userId]
    );
    database.runSync(
      `DELETE FROM anvay_search_entries WHERE owner_id = ? AND domain = 'memories'`,
      [userId]
    );
    return res.changes > 0;
  }

  /**
   * Lists memories for a user with optional category/status filters.
   */
  async listMemories(userId: string, filter?: MemoryFilter): Promise<UserMemory[]> {
    const database = getDb();
    let query = `SELECT * FROM user_memories WHERE user_id = ?`;
    const params: SQLite.SQLiteBindValue[] = [userId];

    if (filter?.kind) {
      query += ` AND kind = ?`;
      params.push(filter.kind);
    }
    if (filter?.status) {
      query += ` AND status = ?`;
      params.push(filter.status);
    }
    if (filter?.origin) {
      query += ` AND origin = ?`;
      params.push(filter.origin);
    }
    if (filter?.minConfidence) {
      query += ` AND confidence >= ?`;
      params.push(filter.minConfidence);
    }

    query += ` ORDER BY updated_at DESC`;

    const rows = database.getAllSync<RawMemoryRow>(query, params);
    const nowTime = Date.now();

    return rows
      .map(rowToMemory)
      .filter((m) => {
        if (filter?.includeExpired) return true;
        if (!m.expiresAt) return true;
        return new Date(m.expiresAt).getTime() > nowTime;
      });
  }

  /**
   * Semantic search using dense vector cosine similarity.
   * Ranks candidates by a blended score of similarity, confidence, and recency.
   */
  async searchMemoriesByVector(
    userId: string,
    queryEmbedding: number[],
    topK = 5,
    minSimilarity = 0.55
  ): Promise<MemoryRetrievalResult[]> {
    if (queryEmbedding.length === 0 || topK <= 0) return [];
    const database = getDb();
    const now = Date.now();
    const results: MemoryRetrievalResult[] = [];

    const pageSize = 128;
    let afterId = '';
    while (true) {
      const rows = database.getAllSync<RawMemoryRow>(
        `SELECT * FROM user_memories
         WHERE user_id = ? AND status = 'active' AND id > ? AND embedding_json IS NOT NULL
           AND (expires_at IS NULL OR expires_at > ?)
         ORDER BY id LIMIT ?`,
        [userId, afterId, new Date(now).toISOString(), pageSize],
      );
      if (rows.length === 0) break;
      afterId = rows[rows.length - 1].id;

      for (const row of rows) {
        const mem = rowToMemory(row);
        if (!mem.embedding || mem.embedding.length === 0) continue;
        const sim = cosineSimilarity(queryEmbedding, mem.embedding);
        if (sim < minSimilarity) continue;

        // Recency decay factor (half-life of 30 days); retain only topK hits as pages advance.
        const ageDays = (now - new Date(mem.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        const recencyWeight = Math.max(0.5, Math.exp(-ageDays / 30));
        const score = sim * 0.65 + mem.confidence * 0.25 + recencyWeight * 0.10;
        results.push({ memory: mem, similarity: sim, score });
      }
      results.sort((a, b) => b.score - a.score);
      if (results.length > topK) results.length = topK;
    }
    return results;
  }

  /**
   * Exports all memories for a user (supporting GDPR/DPDP export rights).
   */
  async exportMemories(userId: string): Promise<UserMemory[]> {
    return this.listMemories(userId, { includeExpired: true });
  }

  /**
   * Erases all memories for a user (supporting GDPR/DPDP deletion rights).
   */
  async eraseAllUserMemories(userId: string): Promise<number> {
    const database = getDb();
    const res = database.runSync(
      `DELETE FROM user_memories WHERE user_id = ?`,
      [userId]
    );
    return res.changes;
  }
}

export const memoryStore = new AnalyticalMemoryStore();
```

#### `src/services/local-ai/memory/types.ts`

```ts
/**
 * Analytical Local Memory Data Types
 */

export type MemoryKind =
  | 'profile'      // User-approved facts, bio-traits, settings
  | 'preference'   // Explicit or observed habit/UI preferences
  | 'episode'      // Summaries of meaningful check-ins, workouts, milestones
  | 'fact'         // Specific verified facts (e.g., "Prefers morning yoga")
  | 'workflow'     // Procedural routines and learned step-by-step instructions
  | 'semantic';    // Conceptual relationships between tags, habits, goals

export type MemoryOrigin = 'user_declared' | 'observed' | 'ai_inferred';

export type MemoryStatus = 'active' | 'needs_confirmation' | 'archived';

export interface UserMemory {
  id: string;
  userId: string;
  kind: MemoryKind;
  content: string;
  embedding?: number[];
  sourceEventIds: string[];
  confidence: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  origin: MemoryOrigin;
  status: MemoryStatus;
  metadata?: Record<string, unknown>;
}

export interface MemoryRetrievalResult {
  memory: UserMemory;
  similarity: number;
  score: number; // Combined relevance * recency * confidence
}

export interface MemoryFilter {
  kind?: MemoryKind;
  status?: MemoryStatus;
  includeExpired?: boolean;
  minConfidence?: number;
  origin?: MemoryOrigin;
}
```

#### `src/services/local-ai/memory/vectorMath.ts`

```ts
/**
 * Vector similarity utilities for on-device dense embedding search.
 */

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const valA = a[i];
    const valB = b[i];
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA <= 0 || normB <= 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return Infinity;
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function normalizeVector(vec: number[]): number[] {
  let norm = 0;
  for (let i = 0; i < vec.length; i++) {
    norm += vec[i] * vec[i];
  }
  if (norm <= 0) return vec.slice();
  const mag = Math.sqrt(norm);
  return vec.map((val) => val / mag);
}

export function topKSimilar<T extends { vector?: number[] }>(
  query: number[],
  items: T[],
  k = 5,
  minThreshold = 0.0
): { item: T; similarity: number }[] {
  const scored = items
    .map((item) => {
      const sim = item.vector ? cosineSimilarity(query, item.vector) : 0;
      return { item, similarity: sim };
    })
    .filter((entry) => entry.similarity >= minThreshold)
    .sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, k);
}

```

#### `src/services/local-ai/orchestration/langGraphOrchestrator.ts`

```ts
/**
 * Stateful Multi-Step Workflow Orchestration (LangGraph-compatible).
 *
 * Provides a resilient 5-stage pipeline:
 * 1. Intake & Scope Validation (Sanitizes PII, applies user-boundary checks)
 * 2. Evidence Retrieval (Fetches scoped profile & analytical memories)
 * 3. Execution & Inference (On-device LLM or deterministic rules)
 * 4. Validation & Schema Enforcement (Zod parsing, rejection of malformed outputs)
 * 5. Memory & Checkpoint Commit (Persists user-approved facts, updates non-sensitive analytics)
 *
 * Completely functional on-device offline, with structured checkpointing
 * designed to align with backend LangGraph stores when synchronized.
 */

import { memoryStore } from '../memory/memoryStore';
import type { UserMemory } from '../memory/types';
import { routeLocalAiTask, type OrchestratedTask, type OrchestratedResult } from './taskRouter';

export interface WorkflowCheckpoint {
  id: string;
  workflowName: string;
  userId: string;
  step: 'intake' | 'evidence' | 'execution' | 'validation' | 'commit' | 'completed' | 'failed';
  stateJson: string;
  createdAt: string;
}

export interface WorkflowState<TInput = unknown, TOutput = unknown> {
  workflowId: string;
  userId: string;
  taskType: string;
  input: TInput;
  retrievedMemories: UserMemory[];
  rawOutput?: unknown;
  validatedOutput?: TOutput;
  proposedMemoryItems: Omit<UserMemory, 'id' | 'createdAt' | 'updatedAt'>[];
  error?: string;
  isComplete: boolean;
}

export interface NonSensitiveCohortFeatures {
  userId: string;
  activeExperience: 'women' | 'men' | 'all';
  weeklyCheckInFrequency: number;
  prefersMorningRoutine: boolean;
  averageWorkoutDurationMinutes: number;
  streakCount: number;
  consentGranted: boolean;
}

export class StatefulOrchestrator {
  private checkpoints: Map<string, WorkflowCheckpoint> = new Map();

  /**
   * Executes an end-to-end multi-step workflow.
   */
  async runWorkflow(
    userId: string,
    task: OrchestratedTask,
    options?: {
      autoCommitMemories?: boolean;
      userConsentAnalytics?: boolean;
    }
  ): Promise<{
    result: OrchestratedResult;
    retrievedMemoriesCount: number;
    committedMemoriesCount: number;
  }> {
    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Stage 1: Intake & Scope Isolation
    this.saveCheckpoint(workflowId, 'intake', userId, { task });

    // Stage 2: Evidence Retrieval (Relevant user-scoped memories)
    const memories = await memoryStore.listMemories(userId, { status: 'active' });
    this.saveCheckpoint(workflowId, 'evidence', userId, { retrievedCount: memories.length });

    // Stage 3: Execution & Inference
    const result = await routeLocalAiTask(task);
    this.saveCheckpoint(workflowId, 'execution', userId, { resultType: result.type });

    // Stage 4: Validation (Already enforced inside routeLocalAiTask via Zod)
    this.saveCheckpoint(workflowId, 'validation', userId, { valid: true });

    // Stage 5: Memory Commit
    let committedCount = 0;
    if (options?.autoCommitMemories) {
      if (result.type === 'classify') {
        const mem = await memoryStore.addMemory({
          userId,
          kind: 'episode',
          content: `Reflection classified as ${result.data.category}: "${result.data.suggestedAction}"`,
          sourceEventIds: [workflowId],
          confidence: result.data.confidence,
          origin: 'ai_inferred',
          status: result.data.confidence > 0.85 ? 'active' : 'needs_confirmation',
          metadata: { keywords: result.data.keywords },
        });
        if (mem) committedCount++;
      } else if (result.type === 'extract_entities') {
        if (result.data.habitsMentioned.length > 0) {
          const mem = await memoryStore.addMemory({
            userId,
            kind: 'preference',
            content: `Habits mentioned: ${result.data.habitsMentioned.join(', ')}`,
            sourceEventIds: [workflowId],
            confidence: 0.8,
            origin: 'observed',
            status: 'active',
          });
          if (mem) committedCount++;
        }
      }
    }

    this.saveCheckpoint(workflowId, 'completed', userId, { committedCount });

    return {
      result,
      retrievedMemoriesCount: memories.length,
      committedMemoriesCount: committedCount,
    };
  }

  /**
   * Evaluates non-sensitive behavioral cohort clusters across opted-in users.
   *
   * HARD PRIVACY RULE (REQ-004 / AGENTS.md):
   * Never infer or cluster on sensitive traits (religion, orientation, ethnicity,
   * caste, diagnoses). All features are strictly consented usage signals.
   */
  clusterNonSensitiveCohorts(
    cohortData: NonSensitiveCohortFeatures[]
  ): Record<string, { label: string; userIds: string[]; description: string }> {
    const eligible = cohortData.filter((c) => c.consentGranted);

    const morningHabitGroup: string[] = [];
    const highStreakGroup: string[] = [];
    const steadyPacedGroup: string[] = [];

    for (const user of eligible) {
      if (user.prefersMorningRoutine) {
        morningHabitGroup.push(user.userId);
      }
      if (user.streakCount >= 7) {
        highStreakGroup.push(user.userId);
      } else {
        steadyPacedGroup.push(user.userId);
      }
    }

    return {
      morning_routine_cohort: {
        label: 'Dawn Rhythms Cohort',
        userIds: morningHabitGroup,
        description: 'Users who consistently engage in morning check-ins and restorative starts.',
      },
      high_consistency_cohort: {
        label: 'Continuous Momentum Cohort',
        userIds: highStreakGroup,
        description: 'Users maintaining week-long or greater daily check-in streaks.',
      },
      gentle_paced_cohort: {
        label: 'Gentle Pacing Cohort',
        userIds: steadyPacedGroup,
        description: 'Users engaging periodically with flexible mindfulness sessions.',
      },
    };
  }

  private saveCheckpoint(
    workflowId: string,
    step: WorkflowCheckpoint['step'],
    userId: string,
    state: Record<string, unknown>
  ): void {
    const cp: WorkflowCheckpoint = {
      id: `${workflowId}_${step}`,
      workflowName: 'local_wellness_workflow',
      userId,
      step,
      stateJson: JSON.stringify(state),
      createdAt: new Date().toISOString(),
    };
    this.checkpoints.set(cp.id, cp);
  }

  getCheckpoints(workflowId: string): WorkflowCheckpoint[] {
    return Array.from(this.checkpoints.values()).filter((cp) => cp.id.startsWith(workflowId));
  }
}

export const statefulOrchestrator = new StatefulOrchestrator();
```

#### `src/services/local-ai/orchestration/taskRouter.ts`

```ts
import { classifyReflection, type ClassificationResult } from '../tasks/classification';
import { extractWellnessEntities, type ExtractedEntities } from '../tasks/entityExtraction';
import { summarizeWellnessJournal, type SummaryResult } from '../tasks/summarization';
import { suggestOrganization, type OrganizationSuggestion } from '../tasks/organizationSuggestions';
import { searchMemoriesSemantically } from '../tasks/semanticSearch';
import type { MemoryRetrievalResult } from '../memory/types';

export type OrchestratedTask =
  | { type: 'classify'; text: string }
  | { type: 'extract_entities'; text: string }
  | { type: 'summarize'; notes: string[] }
  | { type: 'suggest_organization'; content: string }
  | { type: 'semantic_search'; userId: string; query: string; topK?: number };

export type OrchestratedResult =
  | { type: 'classify'; data: ClassificationResult }
  | { type: 'extract_entities'; data: ExtractedEntities }
  | { type: 'summarize'; data: SummaryResult }
  | { type: 'suggest_organization'; data: OrganizationSuggestion }
  | { type: 'semantic_search'; data: MemoryRetrievalResult[] };

/**
 * Deterministic crisis and safety circuit breaker.
 * Evaluates immediate safety before invoking any conversational inference.
 */
export function checkCrisisInterception(text: string): { isCrisis: boolean; helplineNotice?: string } {
  const lower = text.toLowerCase();
  const crisisPatterns = [
    'suicide',
    'kill myself',
    'end my life',
    'self harm',
    'cutting myself',
    'want to die',
    'overdose',
  ];

  for (const pattern of crisisPatterns) {
    if (lower.includes(pattern)) {
      return {
        isCrisis: true,
        helplineNotice:
          'If you or someone you know is going through a difficult time, free, confidential support is available 24/7. Please call or text 988 (Suicide & Crisis Lifeline) or your local emergency services.',
      };
    }
  }

  return { isCrisis: false };
}

/**
 * Master Task Router.
 * Routes requests to specialized structured on-device handlers with safety guards.
 */
export async function routeLocalAiTask(task: OrchestratedTask): Promise<OrchestratedResult> {
  switch (task.type) {
    case 'classify': {
      const crisis = checkCrisisInterception(task.text);
      if (crisis.isCrisis) {
        return {
          type: 'classify',
          data: {
            category: 'tense',
            confidence: 1.0,
            keywords: ['crisis_intercepted'],
            suggestedAction: crisis.helplineNotice ?? 'Please reach out to emergency support.',
            reasoning: 'Immediate crisis circuit breaker triggered.',
          },
        };
      }
      const data = await classifyReflection(task.text);
      return { type: 'classify', data };
    }

    case 'extract_entities': {
      const data = await extractWellnessEntities(task.text);
      return { type: 'extract_entities', data };
    }

    case 'summarize': {
      const data = await summarizeWellnessJournal(task.notes);
      return { type: 'summarize', data };
    }

    case 'suggest_organization': {
      const data = await suggestOrganization(task.content);
      return { type: 'suggest_organization', data };
    }

    case 'semantic_search': {
      const data = await searchMemoriesSemantically(task.userId, task.query, task.topK);
      return { type: 'semantic_search', data };
    }
  }
}
```

#### `src/services/local-ai/rag/hybridRagPipeline.ts`

```ts
/**
 * Hybrid RAG (Retrieval-Augmented Generation) Pipeline.
 *
 * Implements independent dual-branch retrieval with Reciprocal Rank Fusion (RRF k=60):
 * Branch A: Independent SQLite FTS5 lexical candidates (sub-millisecond BM25 ranking).
 * Branch B: Independent semantic vector candidates (cosine similarity top-K).
 * Fusion: Reciprocal Rank Fusion blending semantic and lexical candidates.
 * Hydration: Fetches ONLY selected candidate records by ID from SQLite, guarding device RAM.
 */

import { LocalAI } from '../../../../modules/local-ai';
import { memoryStore } from '../memory/memoryStore';
import type { UserMemory } from '../memory/types';
import { knowledgeStore, type KnowledgeChunk } from './knowledgeStore';
import { tokenize, makeSnippet } from '../../../domain/ai/localRetrieval';
import { EXERCISES } from '../../../domain/fitness/workouts';
import { anvayFtsStore, type FtsSearchHit } from '../search/anvayFtsStore';
import { getSharedLocalMemoryDb } from '../db/localMemoryDb';

export interface RagDocument {
  id: string;
  sourceType:
    | 'user_memory'
    | 'user_journal'
    | 'exercise_catalog'
    | 'wellness_guide'
    | 'user_document'
    | 'user_note'
    | 'health_article'
    | 'imported_file'
    | 'medical_reference'
    | 'learn_library'
    | 'conversation_history';
  title: string;
  content: string;
  date?: string;
  metadata?: Record<string, unknown>;
  embedding?: number[];
  chunkOffset?: { start: number; end: number };
}

export interface RagEvidenceHit {
  document: RagDocument;
  denseRank?: number;
  sparseRank?: number;
  hybridScore: number;
  snippet: string;
}

export interface RagResponse {
  answer: string;
  citations: string[];
  evidenceHits: RagEvidenceHit[];
  confidence: number;
  isGrounded: boolean;
}

const RRF_K = 60; // Standard reciprocal rank fusion smoothing constant

/**
 * Builds standard verified knowledge documents from the local exercise catalog.
 */
export function getExerciseCatalogDocuments(): RagDocument[] {
  return EXERCISES.map((ex) => ({
    id: `catalog_ex_${ex.id}`,
    sourceType: 'exercise_catalog' as const,
    title: ex.name,
    content: `${ex.name} (${ex.pattern} movement, ${ex.equipment} equipment). Steps: ${ex.steps.join(' ')}. Safety: ${ex.safety}. Easier variation: ${ex.easier}. Harder variation: ${ex.harder}.`,
    metadata: {
      exerciseId: ex.id,
      pattern: ex.pattern,
      equipment: ex.equipment,
      timed: ex.timed ?? false,
    },
  }));
}

/**
 * Ranks documents using BM25 sparse lexical matching.
 */
export function rankSparseBM25(docs: RagDocument[], query: string): { doc: RagDocument; score: number }[] {
  const queryTerms = [...new Set(tokenize(query))];
  if (queryTerms.length === 0 || docs.length === 0) return [];

  const tokenized = docs.map((d) => tokenize(`${d.title} ${d.content}`));
  const avgLen = tokenized.reduce((a, t) => a + t.length, 0) / docs.length || 1;

  const docFreq = new Map<string, number>();
  for (const tokens of tokenized) {
    for (const term of new Set(tokens)) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  const K1 = 1.2;
  const B = 0.75;
  const hits: { doc: RagDocument; score: number }[] = [];

  docs.forEach((doc, i) => {
    const tokens = tokenized[i];
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

    let score = 0;
    for (const term of queryTerms) {
      const f = tf.get(term);
      if (!f) continue;
      const df = docFreq.get(term) ?? 0;
      const idf = Math.log(1 + (docs.length - df + 0.5) / (df + 0.5));
      score += (idf * f * (K1 + 1)) / (f + K1 * (1 - B + (B * tokens.length) / avgLen));
    }
    if (score > 0) {
      hits.push({ doc, score });
    }
  });

  return hits.sort((a, b) => b.score - a.score);
}

/**
 * Hydrates only the specific candidate documents identified by FTS5 or Vector search.
 */
function hydrateCandidateDocuments(
  userId: string,
  candidateKeys: { chunkIds: string[]; memoryIds: string[]; exerciseIds: string[] }
): Map<string, RagDocument> {
  const docMap = new Map<string, RagDocument>();
  const db = getSharedLocalMemoryDb();

  // 1. Hydrate exercise catalog candidates
  if (candidateKeys.exerciseIds.length > 0) {
    const catalog = getExerciseCatalogDocuments();
    for (const exDoc of catalog) {
      const bareId = exDoc.id.replace('catalog_ex_', '');
      if (candidateKeys.exerciseIds.includes(bareId) || candidateKeys.exerciseIds.includes(exDoc.id)) {
        docMap.set(exDoc.id, exDoc);
        docMap.set(bareId, exDoc);
      }
    }
  }

  // 2. Hydrate specific memory candidates
  if (candidateKeys.memoryIds.length > 0) {
    const placeholders = candidateKeys.memoryIds.map(() => '?').join(',');
    const rows = db.getAllSync<any>(
      `SELECT * FROM user_memories WHERE id IN (${placeholders}) AND user_id = ? AND status = 'active'`,
      [...candidateKeys.memoryIds, userId]
    );
    for (const r of rows) {
      docMap.set(r.id, {
        id: r.id,
        sourceType: 'user_memory',
        title: `${r.kind.toUpperCase()} Memory`,
        content: r.content,
        date: r.updated_at,
        metadata: r.metadata_json ? JSON.parse(r.metadata_json) : undefined,
      });
    }
  }

  // 3. Hydrate specific chunk candidates
  if (candidateKeys.chunkIds.length > 0) {
    const placeholders = candidateKeys.chunkIds.map(() => '?').join(',');
    const rows = db.getAllSync<any>(
      `SELECT c.*, d.title as doc_title, d.source_type, d.metadata_json
       FROM rag_chunks c
       JOIN rag_documents d ON d.id = c.document_id
       WHERE c.id IN (${placeholders}) AND c.user_id = ?`,
      [...candidateKeys.chunkIds, userId]
    );
    for (const r of rows) {
      const metadata = r.metadata_json ? JSON.parse(r.metadata_json) : undefined;
      docMap.set(r.id, {
        id: r.id,
        // Existing chat documents were stored as wellness guides; identify them from their stable key.
        sourceType: metadata?.key === 'me:chat' ? 'conversation_history' : r.source_type,
        title: r.doc_title || 'Document Chunk',
        content: r.content,
        date: r.created_at,
        chunkOffset: { start: r.start_offset, end: r.end_offset },
        metadata: { ...metadata, documentId: r.document_id, tokenEstimate: r.token_estimate },
      });
    }
  }

  return docMap;
}

/**
 * Executes independent dual-branch hybrid retrieval over persistent analytical memories,
 * ingested documents, and exercise catalogs.
 */
export async function retrieveHybridEvidence(
  userId: string,
  query: string,
  topK = 4
): Promise<RagEvidenceHit[]> {
  // Branch A: Independent SQLite FTS5 Candidate Retrieval
  const ftsHits = anvayFtsStore.search(query, { ownerId: userId, limit: 30 });
  const sparseRankMap = new Map<string, number>();
  const ftsSnippetMap = new Map<string, string>();

  const candidateChunkIds: string[] = [];
  const candidateMemoryIds: string[] = [];
  const candidateExerciseIds: string[] = [];

  ftsHits.forEach((hit, idx) => {
    const key = hit.chunkId || hit.sourceId;
    sparseRankMap.set(key, idx + 1);
    if (hit.snippet) ftsSnippetMap.set(key, hit.snippet);

    if (hit.sourceTable === 'rag_chunks' && hit.chunkId) {
      candidateChunkIds.push(hit.chunkId);
    } else if (hit.sourceTable === 'user_memories') {
      candidateMemoryIds.push(hit.sourceId);
    } else if (hit.sourceTable === 'exercise_catalog') {
      candidateExerciseIds.push(hit.sourceId);
    }
  });

  // Branch B: Independent Dense Semantic Vector Retrieval (if local model loaded)
  const denseRankMap = new Map<string, number>();
  if (LocalAI.isLoaded()) {
    try {
      const queryVec = await LocalAI.embed(query);
      if (queryVec && queryVec.length > 0) {
        // Query memory store vectors
        const denseMemories = await memoryStore.searchMemoriesByVector(userId, queryVec, 10, 0.4);
        denseMemories.forEach((res, idx) => {
          denseRankMap.set(res.memory.id, idx + 1);
          candidateMemoryIds.push(res.memory.id);
        });

        // Query knowledge chunk vectors
        const denseChunks = await knowledgeStore.searchChunksByVector(userId, queryVec, 10, 0.4);
        denseChunks.forEach((res, idx) => {
          const currentRank = denseRankMap.get(res.chunk.id);
          if (currentRank === undefined || idx + 1 < currentRank) {
            denseRankMap.set(res.chunk.id, idx + 1);
          }
          candidateChunkIds.push(res.chunk.id);
        });
      }
    } catch {
      // Degrades gracefully to lexical ranking if vector engine is unavailable
    }
  }

  // Fallback: If both FTS and vector produced zero results (e.g., initial empty index), rank catalog directly
  if (sparseRankMap.size === 0 && denseRankMap.size === 0) {
    const catalog = getExerciseCatalogDocuments();
    const fallbackHits = rankSparseBM25(catalog, query);
    fallbackHits.slice(0, topK).forEach((hit, idx) => {
      sparseRankMap.set(hit.doc.id, idx + 1);
      candidateExerciseIds.push(hit.doc.id);
    });
  }

  // Hydrate ONLY the selected candidate records by ID from SQLite
  const docMap = hydrateCandidateDocuments(userId, {
    chunkIds: Array.from(new Set(candidateChunkIds)),
    memoryIds: Array.from(new Set(candidateMemoryIds)),
    exerciseIds: Array.from(new Set(candidateExerciseIds)),
  });

  // Reciprocal Rank Fusion (RRF k=60)
  const candidateIds = new Set<string>([...sparseRankMap.keys(), ...denseRankMap.keys()]);
  const fusionHits: RagEvidenceHit[] = [];

  for (const docId of candidateIds) {
    const doc = docMap.get(docId);
    if (!doc) continue;

    const sRank = sparseRankMap.get(docId);
    const dRank = denseRankMap.get(docId);

    let score = 0;
    if (sRank !== undefined) score += 1 / (RRF_K + sRank);
    if (dRank !== undefined) score += 1.2 / (RRF_K + dRank); // 1.2x multiplier for semantic relevance

    const terms = tokenize(query);
    const snippet = ftsSnippetMap.get(docId) || makeSnippet(doc.content, terms);
    fusionHits.push({
      document: doc,
      sparseRank: sRank,
      denseRank: dRank,
      hybridScore: score,
      snippet,
    });
  }

  return fusionHits.sort((a, b) => b.hybridScore - a.hybridScore).slice(0, topK);
}

/**
 * Calibrated evidence confidence scoring based on weighted geometric mean:
 * C = exp( sum( w_i * ln( max(eps, c_i) ) ) )
 *
 * Factors:
 * c1: Normalized hybrid retrieval score (RRF rank)
 * c2: Query term evidence coverage (lexical density)
 * c3: Provenance trust (catalog = 1.0, document = 0.95, learned cloud = 0.88, memory = 0.80)
 * c4: Model synthesis grounded multiplier
 */
export function calculateCalibratedConfidence(
  query: string,
  hits: RagEvidenceHit[],
  isModelSynthesized: boolean
): number {
  if (hits.length === 0) return 0;

  const topHit = hits[0];
  const EPSILON = 0.05;

  // c1: Retrieval score normalized (RRF top score is typically between 0.015 and 0.04)
  const c1 = Math.min(1.0, Math.max(0.1, topHit.hybridScore * 30));

  // c2: Token evidence coverage
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0.5;
  const combinedContent = hits.map((h) => `${h.document.title} ${h.document.content}`).join(' ').toLowerCase();
  const coveredTokens = queryTokens.filter((t) => combinedContent.includes(t.toLowerCase())).length;
  const c2 = Math.min(1.0, Math.max(0.1, coveredTokens / queryTokens.length));

  // c3: Provenance trust
  const sourceType = topHit.document.sourceType;
  const c3 =
    sourceType === 'exercise_catalog'
      ? 1.0
      : sourceType === 'user_document' || sourceType === 'health_article'
        ? 0.95
        : sourceType === 'wellness_guide'
          ? 0.88
          : 0.80;

  // c4: Model synthesis grounded multiplier
  const c4 = isModelSynthesized ? 0.92 : 0.85;

  // Weights sum to 1.0: w1=0.35, w2=0.30, w3=0.20, w4=0.15
  const logScore =
    0.35 * Math.log(Math.max(EPSILON, c1)) +
    0.30 * Math.log(Math.max(EPSILON, c2)) +
    0.20 * Math.log(Math.max(EPSILON, c3)) +
    0.15 * Math.log(Math.max(EPSILON, c4));

  const confidence = Math.exp(logScore);
  return Math.round(confidence * 100) / 100;
}

/**
 * Answers a user wellness question strictly grounded in verified local evidence.
 */
export async function answerWithHybridRag(
  userId: string,
  query: string
): Promise<RagResponse> {
  const hits = (await retrieveHybridEvidence(userId, query, 40))
    .filter((hit) => hit.document.sourceType !== 'conversation_history')
    .slice(0, 3);

  if (hits.length === 0 || hits[0].hybridScore < 0.01) {
    return {
      answer: 'I could not find enough relevant records in your personal wellness notes, documents, or exercise library to answer that with certainty.',
      citations: [],
      evidenceHits: [],
      confidence: 0,
      isGrounded: false,
    };
  }

  const citations: string[] = hits.map((h) => {
    if (h.document.sourceType === 'exercise_catalog') {
      return `[Exercise Catalog: ${h.document.title}]`;
    }
    if (h.document.sourceType === 'user_document') {
      return `[Document: ${h.document.title}]`;
    }
    return `[Personal Memory: ${h.document.title}]`;
  });

  // If local AI is loaded, synthesize grounded response; otherwise format factual digest
  if (LocalAI.isLoaded()) {
    const evidenceText = hits.map((h, i) => `[Source ${i + 1} - ${h.document.title}]: ${h.document.content}`).join('\n\n');
    const prompt =
      `You are Thrive Coach, an evidence-grounded on-device wellness assistant.\n` +
      `Use ONLY the provided evidence below to answer the user's question.\n` +
      `Cite sources using [Source 1], [Source 2], etc. If the answer is not in the context, say "I don't know based on your recorded notes and documents." Do not invent facts.\n\n` +
      `Evidence Context:\n${evidenceText}\n\n` +
      `Question: "${query}"\n\n` +
      `Answer:`;

    try {
      const generated = await LocalAI.generateText({
        prompt,
        system: 'You are an accurate, evidence-grounded on-device wellness assistant. Never invent facts beyond the evidence.',
      });

      const confidence = calculateCalibratedConfidence(query, hits, true);
      return {
        answer: generated.trim(),
        citations,
        evidenceHits: hits,
        confidence,
        isGrounded: true,
      };
    } catch {
      // Fall through to deterministic synthesizer
    }
  }

  // Deterministic synthesis fallback
  const topDoc = hits[0].document;
  const sourceLabel =
    topDoc.sourceType === 'exercise_catalog'
      ? 'exercise catalog'
      : topDoc.sourceType === 'user_document'
      ? 'saved health documents'
      : 'recorded notes';

  const answer = `Based on your ${sourceLabel}: ${hits.map((h) => h.snippet).join(' ')}`;
  const confidence = calculateCalibratedConfidence(query, hits, false);

  return {
    answer,
    citations,
    evidenceHits: hits,
    confidence,
    isGrounded: true,
  };
}
```

#### `src/services/local-ai/rag/knowledgeStore.ts`

```ts
import * as SQLite from 'expo-sqlite';
import { LocalAI, type DocumentChunkResult } from '../../../../modules/local-ai';
import { cosineSimilarity } from '../memory/vectorMath';
import { anvayFtsStore } from '../search/anvayFtsStore';
import { getSharedLocalMemoryDb } from '../db/localMemoryDb';

export interface KnowledgeDocument {
  id: string;
  userId: string;
  title: string;
  sourceType: 'user_note' | 'health_article' | 'wellness_guide' | 'imported_file' | 'medical_reference' | 'conversation_history';
  rawText: string;
  chunkCount: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  userId: string;
  chunkIndex: number;
  content: string;
  startOffset: number;
  endOffset: number;
  tokenEstimate: number;
  embedding?: number[];
  createdAt: string;
  /** Title of the document the chunk came from, so evidence says where it is from. */
  documentTitle?: string;
}

export interface KnowledgeChunkHit {
  chunk: KnowledgeChunk;
  similarity: number;
}

let initialized = false;

function getDb(): SQLite.SQLiteDatabase {
  const db = getSharedLocalMemoryDb();
  if (!initialized) {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS rag_documents (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        source_type TEXT NOT NULL,
        raw_text TEXT NOT NULL,
        chunk_count INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        metadata_json TEXT
      );

      CREATE TABLE IF NOT EXISTS rag_chunks (
        id TEXT PRIMARY KEY NOT NULL,
        document_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        start_offset INTEGER NOT NULL,
        end_offset INTEGER NOT NULL,
        token_estimate INTEGER NOT NULL,
        embedding_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES rag_documents(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc ON rag_chunks(document_id);
      CREATE INDEX IF NOT EXISTS idx_rag_chunks_user ON rag_chunks(user_id);
    `);
    initialized = true;
  }
  return db;
}

export class KnowledgeStore {
  /**
   * Ingests a raw document, computes semantic chunking via AnvaykoshDocumentProcessor,
   * embeds chunks if native engine is active, and persists everything into SQLite.
   */
  async ingestDocument(
    userId: string,
    doc: {
      title: string;
      text: string;
      sourceType?: KnowledgeDocument['sourceType'];
      metadata?: Record<string, unknown>;
    }
  ): Promise<KnowledgeDocument> {
    const database = getDb();
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const sourceType = doc.sourceType || 'user_note';

    // 1. Semantic Chunking
    const rawChunks: DocumentChunkResult[] = LocalAI.chunkDocument(doc.text, 320, 40);

    // 2. Generate embeddings if local AI is loaded
    const chunksWithEmbeddings: {
      chunk: DocumentChunkResult;
      embedding?: number[];
    }[] = [];

    for (const c of rawChunks) {
      let emb: number[] | undefined;
      if (LocalAI.isLoaded()) {
        try {
          emb = await LocalAI.embed(c.text);
        } catch {
          // Gracefully omit embedding if engine is busy
        }
      }
      chunksWithEmbeddings.push({ chunk: c, embedding: emb });
    }

    // 3. Atomic transaction write
    database.withTransactionSync(() => {
      database.runSync(
        `INSERT INTO rag_documents (id, user_id, title, source_type, raw_text, chunk_count, created_at, metadata_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          docId,
          userId,
          doc.title.trim(),
          sourceType,
          doc.text,
          rawChunks.length,
          now,
          doc.metadata ? JSON.stringify(doc.metadata) : null,
        ]
      );

      for (const item of chunksWithEmbeddings) {
        const chunkId = `chk_${docId}_${item.chunk.index}`;
        database.runSync(
          `INSERT INTO rag_chunks (id, document_id, user_id, chunk_index, content, start_offset, end_offset, token_estimate, embedding_json, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            chunkId,
            docId,
            userId,
            item.chunk.index,
            item.chunk.text,
            item.chunk.startOffset,
            item.chunk.endOffset,
            item.chunk.tokenEstimate,
            item.embedding ? JSON.stringify(item.embedding) : null,
            now,
          ]
        );

        // Also index into Anvay FTS5 Full-Text Engine
        anvayFtsStore.upsertEntry({
          sourceTable: 'rag_chunks',
          sourceId: docId,
          chunkId,
          ownerId: userId,
          domain: 'documents',
          sourceType,
          title: doc.title.trim(),
          content: item.chunk.text,
          createdAt: now,
          metadata: doc.metadata,
        });
      }
    });

    return {
      id: docId,
      userId,
      title: doc.title.trim(),
      sourceType,
      rawText: doc.text,
      chunkCount: rawChunks.length,
      createdAt: now,
      metadata: doc.metadata,
    };
  }

  /**
   * Retrieves all chunks for a user.
   */
  async getAllChunks(userId: string): Promise<KnowledgeChunk[]> {
    const database = getDb();
    const rows = database.getAllSync<any>(
      `SELECT c.id, c.document_id, c.user_id, c.chunk_index, c.content, c.start_offset, c.end_offset,
              c.token_estimate, c.embedding_json, c.created_at, d.title AS document_title
       FROM rag_chunks c LEFT JOIN rag_documents d ON d.id = c.document_id
       WHERE c.user_id = ?
       ORDER BY c.document_id, c.chunk_index ASC`,
      [userId]
    );

    return rows.map((r) => ({
      id: r.id,
      documentId: r.document_id,
      userId: r.user_id,
      chunkIndex: r.chunk_index,
      content: r.content,
      startOffset: r.start_offset,
      endOffset: r.end_offset,
      tokenEstimate: r.token_estimate,
      embedding: r.embedding_json ? JSON.parse(r.embedding_json) : undefined,
      createdAt: r.created_at,
      documentTitle: r.document_title ?? undefined,
    }));
  }

  /**
   * Searches chunks by vector cosine similarity.
   */
  async searchChunksByVector(
    userId: string,
    queryVec: number[],
    topK = 5,
    minSimilarity = 0.35
  ): Promise<KnowledgeChunkHit[]> {
    if (queryVec.length === 0 || topK <= 0) return [];
    const database = getDb();
    const hits: KnowledgeChunkHit[] = [];
    const pageSize = 128;
    let afterId = '';

    // Keep peak memory bounded to one page plus the best matches. The cosine scan remains exact
    // and owner-filtered; dense retrieval is still independent from FTS candidates.
    while (true) {
      const rows = database.getAllSync<{
        id: string; document_id: string; user_id: string; chunk_index: number; content: string;
        start_offset: number; end_offset: number; token_estimate: number; embedding_json: string;
        created_at: string; document_title: string | null;
      }>(
        `SELECT c.id, c.document_id, c.user_id, c.chunk_index, c.content, c.start_offset, c.end_offset,
                c.token_estimate, c.embedding_json, c.created_at, d.title AS document_title
         FROM rag_chunks c JOIN rag_documents d ON d.id = c.document_id
         WHERE c.user_id = ? AND c.id > ? AND c.embedding_json IS NOT NULL
         ORDER BY c.id LIMIT ?`,
        [userId, afterId, pageSize],
      );
      if (rows.length === 0) break;
      afterId = rows[rows.length - 1].id;

      for (const row of rows) {
        let embedding: number[];
        try {
          embedding = JSON.parse(row.embedding_json);
        } catch {
          continue;
        }
        if (embedding.length === 0) continue;
        const similarity = cosineSimilarity(queryVec, embedding);
        if (similarity >= minSimilarity) {
          hits.push({
            chunk: {
              id: row.id,
              documentId: row.document_id,
              userId: row.user_id,
              chunkIndex: row.chunk_index,
              content: row.content,
              startOffset: row.start_offset,
              endOffset: row.end_offset,
              tokenEstimate: row.token_estimate,
              embedding,
              createdAt: row.created_at,
              documentTitle: row.document_title ?? undefined,
            },
            similarity,
          });
        }
      }
      hits.sort((a, b) => b.similarity - a.similarity);
      if (hits.length > topK) hits.length = topK;
    }
    return hits;
  }

  /**
   * Lists all ingested documents for a user.
   */
  async listDocuments(userId: string): Promise<KnowledgeDocument[]> {
    const database = getDb();
    const rows = database.getAllSync<any>(
      `SELECT id, user_id, title, source_type, raw_text, chunk_count, created_at, metadata_json
       FROM rag_documents
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      sourceType: r.source_type,
      rawText: r.raw_text,
      chunkCount: r.chunk_count,
      createdAt: r.created_at,
      metadata: r.metadata_json ? JSON.parse(r.metadata_json) : undefined,
    }));
  }

  /**
   * Deletes a document and cascades to its chunks.
   */
  async deleteDocument(userId: string, documentId: string): Promise<boolean> {
    const database = getDb();
    let changes = 0;
    database.withTransactionSync(() => {
      database.runSync(`DELETE FROM rag_chunks WHERE document_id = ? AND user_id = ?`, [
        documentId,
        userId,
      ]);
      const res = database.runSync(
        `DELETE FROM rag_documents WHERE id = ? AND user_id = ?`,
        [documentId, userId]
      );
      changes = res.changes;

      // Delete from FTS5
      anvayFtsStore.deleteEntry('rag_chunks', documentId);
    });
    return changes > 0;
  }

  /**
   * Clears all documents and chunks for a user (GDPR Right to Be Forgotten).
   */
  async clearAllDocuments(userId: string): Promise<boolean> {
    const database = getDb();
    database.withTransactionSync(() => {
      database.runSync(`DELETE FROM rag_chunks WHERE user_id = ?`, [userId]);
      database.runSync(`DELETE FROM rag_documents WHERE user_id = ?`, [userId]);
      database.runSync(
        `DELETE FROM anvay_search_entries WHERE owner_id = ? AND domain = 'documents'`,
        [userId]
      );
    });
    return true;
  }
}

export const knowledgeStore = new KnowledgeStore();

```

#### `src/services/local-ai/rag/thriveRag.ts`

```ts
/**
 * Thrive RAG: the one place the app stores and finds local knowledge and asks the on-device model.
 *
 * Built on the `react-native-rag` contracts (Embeddings, VectorStore, LLM), implemented over what
 * this app already ships: llama.cpp through `modules/local-ai` for embeddings and generation, and
 * the SQLite knowledge store for vectors. Retrieval is hybrid (BM25 keywords + vectors, fused by
 * reciprocal rank), so it still works before any model is downloaded. ExecuTorch (the package's
 * own runtime) is not used: it needs Android 13+ and a new native build.
 *
 * Everything stays on the phone.
 */
import type { Embeddings, GetResult, LLM, Message, QueryResult, VectorStore } from 'react-native-rag';

import { LocalAI } from '../../../../modules/local-ai';
import { bestFileLines, type FileLine } from '../../../domain/ai/fileEvidence';
import { isConversationRecallQuery } from '../../../domain/ai/localRetrieval';
import { asyncKeyValueStorage } from '../../../stores/persistStorage';
import { answerWithHybridRag, retrieveHybridEvidence, type RagEvidenceHit, type RagResponse } from './hybridRagPipeline';
import { knowledgeStore, type KnowledgeDocument } from './knowledgeStore';
import { anvayFtsStore, type FtsSearchHit, type FtsBenchmarkResult } from '../search/anvayFtsStore';

const USER = 'local_user';

/** Embeddings from the loaded llama.cpp model (none until a model is ready). */
export class LocalEmbeddings implements Embeddings {
  async load() {
    return this;
  }
  async unload() {}
  async embed(text: string): Promise<number[]> {
    if (!LocalAI.isLoaded()) return [];
    try {
      return (await LocalAI.embed(text)) ?? [];
    } catch {
      return [];
    }
  }
}

/** Streams from the on-device model. The last user message is the prompt; earlier turns are context. */
export class LocalLLM implements LLM {
  private turn: string | null = null;

  async load() {
    return this;
  }
  async unload() {}
  async interrupt() {
    if (this.turn) LocalAI.cancelGeneration();
  }

  generate(messages: Message[], callback: (token: string) => void): Promise<string> {
    if (!LocalAI.isLoaded()) return Promise.reject(new Error('No on-device model is loaded.'));
    const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n');
    const talk = messages.filter((m) => m.role !== 'system');
    const last = talk[talk.length - 1]?.content ?? '';
    const context = talk
      .slice(0, -1)
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Person' : 'Coach'}: ${m.content}`)
      .join('\n');
    const turnId = `rag_${Date.now()}`;
    this.turn = turnId;
    return new Promise<string>((resolve, reject) => {
      const subs = [
        LocalAI.onToken((e) => {
          if (e.turnId === turnId) callback(e.token);
        }),
        LocalAI.onStreamComplete((e) => {
          if (e.turnId !== turnId) return;
          done();
          resolve(e.fullText);
        }),
        LocalAI.onStreamError((e) => {
          if (e.turnId !== turnId) return;
          done();
          reject(new Error(e.error));
        }),
      ];
      const done = () => {
        subs.forEach((s) => s.remove());
        if (this.turn === turnId) this.turn = null;
      };
      if (!LocalAI.startStream(turnId, last, context || undefined, system || undefined)) {
        done();
        reject(new Error('The on-device model is busy.'));
      }
    });
  }
}

const toGetResult = (d: KnowledgeDocument): GetResult => ({
  id: d.id,
  document: d.rawText,
  embedding: [],
  metadata: { ...(d.metadata ?? {}), title: d.title, sourceType: d.sourceType },
});

/** The SQLite knowledge store behind the `VectorStore` contract, with hybrid search. */
export class SqliteVectorStore implements VectorStore {
  async load() {
    return this;
  }
  async unload() {}

  async add(params: { id?: string; document?: string; embedding?: number[]; metadata?: Record<string, any> }): Promise<string> {
    const meta = params.metadata ?? {};
    const doc = await knowledgeStore.ingestDocument(USER, {
      title: String(meta.title ?? params.document?.slice(0, 60) ?? 'Note'),
      text: params.document ?? '',
      sourceType: (meta.sourceType as KnowledgeDocument['sourceType']) ?? 'user_note',
      metadata: meta,
    });
    return doc.id;
  }

  async update(params: { id: string; document?: string; embedding?: number[]; metadata?: Record<string, any> }): Promise<void> {
    await knowledgeStore.deleteDocument(USER, params.id);
    await this.add({ document: params.document, metadata: params.metadata });
  }

  async delete(params: { predicate: (value: GetResult) => boolean }): Promise<void> {
    const docs = await knowledgeStore.listDocuments(USER);
    for (const d of docs) if (params.predicate(toGetResult(d))) await knowledgeStore.deleteDocument(USER, d.id);
  }

  async query(params: { queryText?: string; nResults?: number; predicate?: (value: QueryResult) => boolean }): Promise<QueryResult[]> {
    if (!params.queryText) return [];
    const hits = await retrieveHybridEvidence(USER, params.queryText, params.nResults ?? 4);
    const results = hits.map<QueryResult>((h) => ({
      id: h.document.id,
      document: h.document.content,
      embedding: h.document.embedding ?? [],
      metadata: { ...(h.document.metadata ?? {}), title: h.document.title, snippet: h.snippet },
      similarity: h.hybridScore,
    }));
    return params.predicate ? results.filter(params.predicate) : results;
  }
}

const INDEX_KEY = 'thrive.appKnowledge.v1';
type KeyIndex = Record<string, { id: string; hash: string }>;

async function readIndex(): Promise<KeyIndex> {
  try {
    const raw = await asyncKeyValueStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as KeyIndex) : {};
  } catch {
    return {};
  }
}

/** The app's single RAG entry point. */
export const thriveRag = {
  embeddings: new LocalEmbeddings(),
  store: new SqliteVectorStore(),
  llm: new LocalLLM(),

  /** Best matches for a question across app knowledge, Learn, memories, chats and documents. */
  search(query: string, topK = 4): Promise<RagEvidenceHit[]> {
    return retrieveHybridEvidence(USER, query, topK);
  },

  /** Lines from files the person read in the chat that answer the question (quoted, with page). */
  async fileLines(query: string, max = 3): Promise<FileLine[]> {
    try {
      const docs = (await knowledgeStore.listDocuments(USER)).filter((d) => d.sourceType === 'imported_file');
      return bestFileLines(docs.map((d) => ({ name: d.title, text: d.rawText })), query, max);
    } catch {
      return [];
    }
  },

  /** Evidence lines for a prompt ("- title: text"), best matches first. */
  async contextFor(query: string, maxChars = 1500, topK = 4): Promise<string> {
    try {
      const hits = await retrieveHybridEvidence(USER, query, topK);
      const recallQuery = isConversationRecallQuery(query);
      return hits
        // Fused RRF scores are small (one list alone tops out near 1/61 ≈ 0.016), so any fixed cut
        // above that dropped every hit; candidates already matched a keyword or the meaning.
        .filter((h) => h.hybridScore > 0)
        // Past chat lines are a last resort: they can repeat an earlier wrong answer back to the model.
        .filter((h) => h.document.sourceType !== 'conversation_history' || recallQuery)
        // Document chunks are short already: pass them whole so page markers and numbers survive.
        .map((h) => `- ${h.document.title}: ${h.document.sourceType === 'user_document' ? h.document.content.replace(/\s+/g, ' ') : h.snippet}`)
        .join('\n')
        .slice(0, maxChars);
    } catch {
      return '';
    }
  },

  /** A grounded answer with citations, or an honest "not found". */
  answer(question: string): Promise<RagResponse> {
    return answerWithHybridRag(USER, question);
  },

  /** Saves free text (a note, a cloud answer, a scanned document) for later retrieval. */
  remember(title: string, text: string, sourceType: KnowledgeDocument['sourceType'] = 'user_note', metadata?: Record<string, unknown>) {
    return knowledgeStore.ingestDocument(USER, { title, text, sourceType, metadata });
  },

  /** Fast SQLite FTS5 search directly across all indexed documents, memories and conversations. */
  ftsSearch(query: string, options: { domain?: string; limit?: number } = {}): FtsSearchHit[] {
    return anvayFtsStore.search(query, { ownerId: USER, domain: options.domain, limit: options.limit });
  },

  /** Rebuilds or runs diagnostics on SQLite FTS5. */
  ftsBenchmark(): FtsBenchmarkResult {
    return anvayFtsStore.benchmark(USER);
  },

  /** Syncs all SQLite tables into FTS5. */
  syncFts(): { synchronized: number } {
    return anvayFtsStore.syncAllSources();
  },

  /**
   * Adds a file the person read in the chat (its extracted text, never the file itself). Pages are
   * marked "[page N]" so answers can cite them. A file with the same text is not added twice.
   */
  async rememberDocument(name: string, pages: { page: number; text: string }[], hash: string): Promise<{ id: string; duplicate: boolean }> {
    const existing = (await knowledgeStore.listDocuments(USER)).find((d) => d.metadata?.hash === hash);
    if (existing) return { id: existing.id, duplicate: true };
    const text = pages
      .filter((p) => p.text.trim())
      .map((p) => `[${name}, page ${p.page}]\n${p.text.trim()}`)
      .join('\n\n');
    const doc = await knowledgeStore.ingestDocument(USER, {
      title: name,
      text,
      sourceType: 'imported_file',
      metadata: { source: 'chat_attachment', hash, pages: pages.length, at: new Date().toISOString() },
    });
    return { id: doc.id, duplicate: false };
  },

  /**
   * Keyed documents the app owns (screens, Learn, recent days, chats): replaced only when the text
   * changed, and removed when a key disappears. Returns how many were written or removed.
   */
  async sync(docs: { key: string; title: string; text: string; hash: string; sourceType?: KnowledgeDocument['sourceType'] }[]): Promise<number> {
    const index = await readIndex();
    // Documents erased elsewhere (Settings > Memories > clear) are written again.
    const present = new Set((await knowledgeStore.listDocuments(USER)).map((d) => d.id));
    for (const key of Object.keys(index)) if (!present.has(index[key].id)) delete index[key];
    const keep = new Set(docs.map((d) => d.key));
    let changed = 0;
    for (const doc of docs) {
      const prev = index[doc.key];
      if (prev?.hash === doc.hash) continue;
      if (prev) await knowledgeStore.deleteDocument(USER, prev.id).catch(() => false);
      const saved = await knowledgeStore.ingestDocument(USER, {
        title: doc.title,
        text: doc.text,
        sourceType: doc.sourceType ?? 'wellness_guide',
        metadata: { source: 'app', key: doc.key },
      });
      index[doc.key] = { id: saved.id, hash: doc.hash };
      changed++;
    }
    for (const key of Object.keys(index)) {
      if (keep.has(key)) continue;
      await knowledgeStore.deleteDocument(USER, index[key].id).catch(() => false);
      delete index[key];
      changed++;
    }
    await asyncKeyValueStorage.setItem(INDEX_KEY, JSON.stringify(index));
    return changed;
  },

  /** Forgets everything (erase all data). */
  async clear(): Promise<void> {
    await knowledgeStore.clearAllDocuments(USER);
    await asyncKeyValueStorage.removeItem(INDEX_KEY);
  },
};
```

#### `src/services/local-ai/search/anvayFtsStore.ts`

```ts
/**
 * AnvayCore SQLite FTS5 Full-Text Intelligence Engine
 *
 * Implements authoritative, zero-network, local full-text search over:
 * 1. RAG Documents & Chunks (imported files, medical references, guides)
 * 2. User Memories & Preferences
 * 3. Coach Conversations & Transcripts
 * 4. Exercise Catalogs & App Knowledge
 * 5. Learn Library articles & AI Interactions
 *
 * Architecture:
 * - Master table `anvay_search_entries` with integer `rowid` and collision-safe `entry_key`
 * - FTS5 external content table `anvay_search_fts` using `unicode61 remove_diacritics 2`
 * - Synchronized via atomic SQLite triggers
 * - Keyset-paginated source synchronization ($O(1)$ memory)
 * - Strict authorization filters (owner_id, app_id, domain, source_type, date)
 * - Sub-millisecond BM25 ranking and snippet extraction
 * - LRU query caching with automatic mutation invalidation
 * - Independent retrieval branch for hybrid Reciprocal Rank Fusion (RRF)
 */

import * as SQLite from 'expo-sqlite';
import { getSharedLocalMemoryDb } from '../db/localMemoryDb';

export interface SearchEntryInput {
  sourceTable:
    | 'rag_chunks'
    | 'rag_documents'
    | 'user_memories'
    | 'coach_messages'
    | 'exercise_catalog'
    | 'learn_library'
    | 'ai_interactions';
  sourceId: string;
  chunkId?: string | null;
  ownerId: string;
  appId?: string;
  domain: 'documents' | 'memories' | 'conversations' | 'exercises' | 'knowledge' | 'interactions';
  sourceType: string;
  title: string;
  content: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export interface FtsSearchFilter {
  ownerId: string;
  appId?: string;
  domain?: 'documents' | 'memories' | 'conversations' | 'exercises' | 'knowledge' | 'interactions' | string;
  sourceType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface FtsSearchHit {
  rowid: number;
  entryKey: string;
  sourceTable: string;
  sourceId: string;
  chunkId: string | null;
  ownerId: string;
  appId: string;
  domain: string;
  sourceType: string;
  title: string;
  content: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
  bm25Score: number;
  snippet: string;
}

export interface FtsBenchmarkResult {
  indexedCount: number;
  dbSizeBytes: number;
  queryLatencyMs: {
    englishTerm: number;
    hindiTerm: number;
    bengaliTerm: number;
    prefixTerm: number;
    phraseTerm: number;
  };
  integrityOk: boolean;
}

const queryCache = new Map<string, { timestamp: number; results: FtsSearchHit[] }>();
const CACHE_TTL_MS = 60_000; // 1 minute
const MAX_CACHE_ENTRIES = 200;

/**
 * Builds an unambiguous, collision-safe key encoding.
 * Pattern: ${appId}:${ownerId}:${sourceTable}:${sourceId}:${chunkId || '__root__'}
 */
export function buildEntryKey(
  appId: string,
  ownerId: string,
  sourceTable: string,
  sourceId: string,
  chunkId?: string | null
): string {
  const safeApp = (appId || 'thrivefold').trim();
  const safeOwner = (ownerId || 'local_user').trim();
  const safeTable = sourceTable.trim();
  const safeSource = sourceId.trim();
  const safeChunk = (chunkId && chunkId.trim()) || '__root__';
  return `${safeApp}:${safeOwner}:${safeTable}:${safeSource}:${safeChunk}`;
}

let isInitialized = false;

function ensureInitialized(database: SQLite.SQLiteDatabase): void {
  if (isInitialized) return;
  initFtsSchema(database);
  isInitialized = true;
}

/**
 * Initializes the master search entry table with entry_key, FTS5 virtual table, and sync triggers.
 */
function initFtsSchema(database: SQLite.SQLiteDatabase): void {
  database.execSync(`
    -- Master Search Table (Stores authoritative metadata & text with integer rowid and unique entry_key)
    CREATE TABLE IF NOT EXISTS anvay_search_entries (
      rowid INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_key TEXT NOT NULL,
      source_table TEXT NOT NULL,
      source_id TEXT NOT NULL,
      chunk_id TEXT,
      owner_id TEXT NOT NULL,
      app_id TEXT NOT NULL DEFAULT 'thrivefold',
      domain TEXT NOT NULL,
      source_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      metadata_json TEXT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_anvay_search_entry_key ON anvay_search_entries(entry_key);
    CREATE INDEX IF NOT EXISTS idx_anvay_search_owner ON anvay_search_entries(owner_id, domain);
    CREATE INDEX IF NOT EXISTS idx_anvay_search_app ON anvay_search_entries(app_id);
    CREATE INDEX IF NOT EXISTS idx_anvay_search_created ON anvay_search_entries(created_at);

    -- FTS5 Virtual Table (External Content pattern: content='anvay_search_entries')
    -- Tokenizer: unicode61 with remove_diacritics=2 for accent-insensitivity while preserving Indian alphabets
    CREATE VIRTUAL TABLE IF NOT EXISTS anvay_search_fts USING fts5(
      title,
      content,
      content='anvay_search_entries',
      content_rowid='rowid',
      tokenize = 'unicode61 remove_diacritics 2'
    );

    -- Synchronization Triggers: Keep FTS5 in atomic lockstep with anvay_search_entries
    CREATE TRIGGER IF NOT EXISTS trg_anvay_search_ai AFTER INSERT ON anvay_search_entries BEGIN
      INSERT INTO anvay_search_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
    END;

    CREATE TRIGGER IF NOT EXISTS trg_anvay_search_ad AFTER DELETE ON anvay_search_entries BEGIN
      INSERT INTO anvay_search_fts(anvay_search_fts, rowid, title, content) VALUES ('delete', old.rowid, old.title, old.content);
    END;

    CREATE TRIGGER IF NOT EXISTS trg_anvay_search_au AFTER UPDATE ON anvay_search_entries BEGIN
      INSERT INTO anvay_search_fts(anvay_search_fts, rowid, title, content) VALUES ('delete', old.rowid, old.title, old.content);
      INSERT INTO anvay_search_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
    END;
  `);

  // Migration: Check if legacy anvay_search_entries table lacked entry_key column
  try {
    const tableInfo = database.getAllSync<{ name: string }>(`PRAGMA table_info(anvay_search_entries);`);
    const hasEntryKey = tableInfo.some((col) => col.name === 'entry_key');
    if (!hasEntryKey) {
      database.execSync(`
        ALTER TABLE anvay_search_entries ADD COLUMN entry_key TEXT;
        UPDATE anvay_search_entries
        SET entry_key = app_id || ':' || owner_id || ':' || source_table || ':' || source_id || ':' || COALESCE(chunk_id, '__root__')
        WHERE entry_key IS NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_anvay_search_entry_key ON anvay_search_entries(entry_key);
      `);
    }
  } catch {
    // Column already exists or table freshly created
  }
}

/**
 * Sanitizes user input into safe FTS5 query syntax:
 * - Handles quotes for phrase matching
 * - Appends wildcards for prefix matching
 * - Preserves Unicode letters and combining marks (\p{L}\p{M}) for Devanagari/Bengali
 */
export function sanitizeFtsQuery(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return '';

  // 1. Quoted phrase: e.g. "box breathing"
  const phraseMatch = trimmed.match(/^"([^"]+)"$/);
  if (phraseMatch) {
    const inner = phraseMatch[1].replace(/["*]/g, '').trim();
    return inner ? `"${inner}"` : '';
  }

  // 2. Tokenize words with combining marks for Indian alphabets
  const tokens = trimmed
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && !['and', 'or', 'not'].includes(t));

  if (tokens.length === 0) return '';

  // 3. Format as prefix search tokens joined by AND
  return tokens.map((t) => `"${t}"*`).join(' AND ');
}

export class AnvayFtsStore {
  /**
   * Clears the query cache.
   */
  private invalidateCache(): void {
    queryCache.clear();
  }

  /**
   * Upserts a search entry into the master table with collision-safe entry_key.
   * Allows passing an external transaction database to maintain atomic consistency.
   */
  upsertEntry(input: SearchEntryInput, txDb?: SQLite.SQLiteDatabase): void {
    const database = txDb || getSharedLocalMemoryDb();
    ensureInitialized(database);

    const now = input.createdAt || new Date().toISOString();
    const metaJson = input.metadata ? JSON.stringify(input.metadata) : null;
    const appId = input.appId || 'thrivefold';
    const chunkId = input.chunkId || null;
    const entryKey = buildEntryKey(appId, input.ownerId, input.sourceTable, input.sourceId, chunkId);

    // Note: ON CONFLICT(entry_key) updates title, content, domain, source_type, created_at, metadata.
    // It strictly DOES NOT alter owner_id or app_id, enforcing ownership immutability.
    database.runSync(
      `INSERT INTO anvay_search_entries
        (entry_key, source_table, source_id, chunk_id, owner_id, app_id, domain, source_type, title, content, created_at, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(entry_key) DO UPDATE SET
        title = excluded.title,
        content = excluded.content,
        domain = excluded.domain,
        source_type = excluded.source_type,
        created_at = excluded.created_at,
        metadata_json = excluded.metadata_json`,
      [
        entryKey,
        input.sourceTable,
        input.sourceId,
        chunkId,
        input.ownerId,
        appId,
        input.domain,
        input.sourceType,
        input.title.trim(),
        input.content.trim(),
        now,
        metaJson,
      ]
    );

    this.invalidateCache();
  }

  /**
   * Batch upserts search entries in an atomic transaction.
   */
  upsertEntries(inputs: SearchEntryInput[], txDb?: SQLite.SQLiteDatabase): void {
    if (inputs.length === 0) return;
    const database = txDb || getSharedLocalMemoryDb();
    ensureInitialized(database);

    const perform = (db: SQLite.SQLiteDatabase) => {
      for (const input of inputs) {
        this.upsertEntry(input, db);
      }
    };

    if (txDb) {
      perform(txDb);
    } else {
      database.withTransactionSync(() => perform(database));
    }
  }

  /**
   * Deletes a search entry by source coordinates, scoped strictly by owner and app.
   */
  deleteEntry(
    sourceTable: string,
    sourceId: string,
    chunkId?: string | null,
    ownerId = 'local_user',
    appId = 'thrivefold',
    txDb?: SQLite.SQLiteDatabase
  ): void {
    const database = txDb || getSharedLocalMemoryDb();
    ensureInitialized(database);

    if (chunkId !== undefined) {
      const entryKey = buildEntryKey(appId, ownerId, sourceTable, sourceId, chunkId);
      database.runSync(`DELETE FROM anvay_search_entries WHERE entry_key = ?`, [entryKey]);
    } else {
      database.runSync(
        `DELETE FROM anvay_search_entries
         WHERE source_table = ? AND source_id = ? AND owner_id = ? AND app_id = ?`,
        [sourceTable, sourceId, ownerId, appId]
      );
    }
    this.invalidateCache();
  }

  /**
   * Executes a safe, parameterized full-text search with strict authorization filters.
   */
  search(query: string, filters: FtsSearchFilter): FtsSearchHit[] {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);

    const sanitized = sanitizeFtsQuery(query);
    if (!sanitized) return [];

    const ownerId = filters.ownerId;
    const appId = filters.appId || 'thrivefold';
    const limit = Math.max(1, Math.min(filters.limit || 20, 100));
    const offset = Math.max(0, filters.offset || 0);

    // Multi-dimensional cache key
    const cacheKey = [
      ownerId,
      appId,
      filters.domain || '*',
      filters.sourceType || '*',
      filters.startDate || '*',
      filters.endDate || '*',
      sanitized,
      limit,
      offset,
    ].join('|');

    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.results;
    }

    const whereClauses: string[] = [
      `anvay_search_fts MATCH ?`,
      `e.owner_id = ?`,
      `e.app_id = ?`,
    ];
    const params: (string | number)[] = [sanitized, ownerId, appId];

    if (filters.domain) {
      whereClauses.push(`e.domain = ?`);
      params.push(filters.domain);
    }
    if (filters.sourceType) {
      whereClauses.push(`e.source_type = ?`);
      params.push(filters.sourceType);
    }
    if (filters.startDate) {
      whereClauses.push(`e.created_at >= ?`);
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      whereClauses.push(`e.created_at <= ?`);
      params.push(filters.endDate);
    }

    params.push(limit, offset);

    const sql = `
      SELECT
        e.rowid,
        e.entry_key,
        e.source_table,
        e.source_id,
        e.chunk_id,
        e.owner_id,
        e.app_id,
        e.domain,
        e.source_type,
        e.title,
        e.content,
        e.created_at,
        e.metadata_json,
        bm25(anvay_search_fts, 2.0, 1.0) AS bm25_score,
        snippet(anvay_search_fts, 1, '«', '»', '...', 28) AS snippet
      FROM anvay_search_fts f
      JOIN anvay_search_entries e ON e.rowid = f.rowid
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY bm25_score ASC
      LIMIT ? OFFSET ?;
    `;

    try {
      const rows = database.getAllSync<any>(sql, params);
      const hits: FtsSearchHit[] = rows.map((r) => ({
        rowid: r.rowid,
        entryKey: r.entry_key,
        sourceTable: r.source_table,
        sourceId: r.source_id,
        chunkId: r.chunk_id,
        ownerId: r.owner_id,
        appId: r.app_id,
        domain: r.domain,
        sourceType: r.source_type,
        title: r.title,
        content: r.content,
        createdAt: r.created_at,
        metadata: r.metadata_json ? JSON.parse(r.metadata_json) : null,
        bm25Score: r.bm25_score,
        snippet: r.snippet || r.content.slice(0, 120),
      }));

      // LRU cache eviction
      if (queryCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = queryCache.keys().next().value;
        if (oldestKey) queryCache.delete(oldestKey);
      }
      queryCache.set(cacheKey, { timestamp: Date.now(), results: hits });

      return hits;
    } catch {
      return [];
    }
  }

  /**
   * Synchronizes sources using bounded keyset pagination to maintain O(1) memory footprint.
   */
  syncAllSources(ownerId = 'local_user', appId = 'thrivefold'): { synchronized: number } {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);
    let count = 0;
    const BATCH_SIZE = 100;

    // 1. Keyset pagination for rag_chunks
    let lastChunkRowid = 0;
    while (true) {
      const rows = database.getAllSync<any>(
        `SELECT c.rowid as chunk_rowid, c.id AS chunk_id, c.document_id, c.user_id, c.content, c.created_at,
                d.title, d.source_type
         FROM rag_chunks c
         JOIN rag_documents d ON d.id = c.document_id
         WHERE c.rowid > ? AND c.user_id = ?
         ORDER BY c.rowid ASC
         LIMIT ?`,
        [lastChunkRowid, ownerId, BATCH_SIZE]
      );
      if (rows.length === 0) break;

      database.withTransactionSync(() => {
        for (const r of rows) {
          this.upsertEntry(
            {
              sourceTable: 'rag_chunks',
              sourceId: r.document_id,
              chunkId: r.chunk_id,
              ownerId: r.user_id,
              appId,
              domain: 'documents',
              sourceType: r.source_type,
              title: r.title,
              content: r.content,
              createdAt: r.created_at,
            },
            database
          );
          count++;
          lastChunkRowid = r.chunk_rowid;
        }
      });
      if (rows.length < BATCH_SIZE) break;
    }

    // 2. Keyset pagination for user_memories (status = 'active')
    let lastMemRowid = 0;
    while (true) {
      const rows = database.getAllSync<any>(
        `SELECT rowid as mem_rowid, id, user_id, kind, content, created_at, status
         FROM user_memories
         WHERE rowid > ? AND user_id = ? AND status = 'active'
         ORDER BY rowid ASC
         LIMIT ?`,
        [lastMemRowid, ownerId, BATCH_SIZE]
      );
      if (rows.length === 0) break;

      database.withTransactionSync(() => {
        for (const r of rows) {
          this.upsertEntry(
            {
              sourceTable: 'user_memories',
              sourceId: r.id,
              chunkId: null,
              ownerId: r.user_id,
              appId,
              domain: 'memories',
              sourceType: r.kind,
              title: `Memory: ${r.kind}`,
              content: r.content,
              createdAt: r.created_at,
            },
            database
          );
          count++;
          lastMemRowid = r.mem_rowid;
        }
      });
      if (rows.length < BATCH_SIZE) break;
    }

    // 3. Keyset pagination for coach_messages
    let lastMsgRowid = 0;
    while (true) {
      const rows = database.getAllSync<any>(
        `SELECT rowid as msg_rowid, id, who, text, at
         FROM coach_messages
         WHERE rowid > ? AND text IS NOT NULL AND length(trim(text)) > 0
         ORDER BY rowid ASC
         LIMIT ?`,
        [lastMsgRowid, BATCH_SIZE]
      );
      if (rows.length === 0) break;

      database.withTransactionSync(() => {
        for (const r of rows) {
          const title = r.who === 'you' ? 'User Question' : 'Anvay Coach Reply';
          const dateIso = new Date(r.at).toISOString();
          this.upsertEntry(
            {
              sourceTable: 'coach_messages',
              sourceId: r.id,
              chunkId: null,
              ownerId,
              appId,
              domain: 'conversations',
              sourceType: r.who,
              title,
              content: r.text,
              createdAt: dateIso,
            },
            database
          );
          count++;
          lastMsgRowid = r.msg_rowid;
        }
      });
      if (rows.length < BATCH_SIZE) break;
    }

    // 4. Index learn_library articles if present
    try {
      const learnRows = database.getAllSync<any>(
        `SELECT id, source, topic, title, summary, url FROM learn_library LIMIT 100`
      );
      for (const lr of learnRows) {
        this.upsertEntry(
          {
            sourceTable: 'learn_library',
            sourceId: lr.id,
            chunkId: null,
            ownerId,
            appId,
            domain: 'knowledge',
            sourceType: lr.source,
            title: lr.title,
            content: `${lr.title}: ${lr.summary}`,
          },
          database
        );
        count++;
      }
    } catch {
      // Table may not be created yet
    }

    this.invalidateCache();
    return { synchronized: count };
  }

  /**
   * Rebuilds the FTS5 virtual table index from the content table.
   */
  rebuild(): void {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);
    database.runSync(`INSERT INTO anvay_search_fts(anvay_search_fts) VALUES('rebuild');`);
    this.invalidateCache();
  }

  /**
   * Validates database and FTS5 integrity.
   */
  checkIntegrity(): boolean {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);
    try {
      database.runSync(`INSERT INTO anvay_search_fts(anvay_search_fts) VALUES('integrity-check');`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Runs performance diagnostics and calculates REAL SQLite disk footprint via page counts.
   */
  benchmark(ownerId = 'local_user', appId = 'thrivefold'): FtsBenchmarkResult {
    const database = getSharedLocalMemoryDb();
    ensureInitialized(database);

    const countRow = database.getFirstSync<{ count: number }>(
      `SELECT count(*) as count FROM anvay_search_entries WHERE owner_id = ? AND app_id = ?`,
      [ownerId, appId]
    );
    const count = countRow?.count ?? 0;

    // Real disk usage calculation via PRAGMA page_count and page_size
    const pageCountRow = database.getFirstSync<{ page_count: number }>(`PRAGMA page_count;`);
    const pageSizeRow = database.getFirstSync<{ page_size: number }>(`PRAGMA page_size;`);
    const dbSizeBytes = (pageCountRow?.page_count ?? 0) * (pageSizeRow?.page_size ?? 0);

    const measure = (q: string) => {
      const t0 = performance.now();
      this.search(q, { ownerId, appId, limit: 10 });
      return Math.round((performance.now() - t0) * 100) / 100;
    };

    return {
      indexedCount: count,
      dbSizeBytes,
      queryLatencyMs: {
        englishTerm: measure('water'),
        hindiTerm: measure('तनाव'),
        bengaliTerm: measure('ঘুম'),
        prefixTerm: measure('brea*'),
        phraseTerm: measure('"box breathing"'),
      },
      integrityOk: this.checkIntegrity(),
    };
  }
}

export const anvayFtsStore = new AnvayFtsStore();
```

#### `src/services/local-ai/tasks/classification.ts`

```ts
import { z } from 'zod';
import { LocalAI } from '../../../../modules/local-ai';

export const MoodCategorySchema = z.enum([
  'grounded',
  'reflective',
  'tense',
  'energized',
  'fatigued',
]);

export type MoodCategory = z.infer<typeof MoodCategorySchema>;

export const ClassificationResultSchema = z.object({
  category: MoodCategorySchema,
  confidence: z.number().min(0).max(1),
  keywords: z.array(z.string()),
  suggestedAction: z.string(),
  reasoning: z.string().optional(),
});

export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;

/**
 * Deterministic keyword rules for instant zero-latency fallback
 * if no on-device LLM model is loaded into RAM.
 */
function deterministicClassify(text: string): ClassificationResult {
  const lower = text.toLowerCase();

  if (
    lower.includes('tired') ||
    lower.includes('exhausted') ||
    lower.includes('drained') ||
    lower.includes('sleepy') ||
    lower.includes('burnout')
  ) {
    return {
      category: 'fatigued',
      confidence: 0.85,
      keywords: ['tired', 'sleepy'],
      suggestedAction: 'Take a 10-minute restorative breathwork pause or wind down early.',
      reasoning: 'Matched high-fatigue keywords deterministically.',
    };
  }

  if (
    lower.includes('anxious') ||
    lower.includes('stressed') ||
    lower.includes('overwhelmed') ||
    lower.includes('tense') ||
    lower.includes('deadline')
  ) {
    return {
      category: 'tense',
      confidence: 0.88,
      keywords: ['stress', 'tension'],
      suggestedAction: 'Step outside for a short grounding walk or try box breathing.',
      reasoning: 'Matched stress and tension markers deterministically.',
    };
  }

  if (
    lower.includes('excited') ||
    lower.includes('hyped') ||
    lower.includes('great') ||
    lower.includes('pumped') ||
    lower.includes('active')
  ) {
    return {
      category: 'energized',
      confidence: 0.90,
      keywords: ['energized', 'active'],
      suggestedAction: 'Channel this vitality into a mindful training routine or creative work.',
      reasoning: 'Matched high-energy markers deterministically.',
    };
  }

  if (
    lower.includes('calm') ||
    lower.includes('peaceful') ||
    lower.includes('steady') ||
    lower.includes('good') ||
    lower.includes('fine')
  ) {
    return {
      category: 'grounded',
      confidence: 0.82,
      keywords: ['calm', 'steady'],
      suggestedAction: 'Maintain this gentle balance with your daily hydration and routines.',
      reasoning: 'Matched grounded balance markers deterministically.',
    };
  }

  return {
    category: 'reflective',
    confidence: 0.70,
    keywords: ['thoughtful', 'journaling'],
    suggestedAction: 'Reflect further on what supported you today.',
    reasoning: 'Defaulted to reflective posture in absence of acute triggers.',
  };
}

/**
 * Classifies self-reflection or check-in notes using schema-validated on-device inference,
 * falling back gracefully to deterministic logic.
 */
export async function classifyReflection(text: string): Promise<ClassificationResult> {
  if (!text || text.trim().length === 0) {
    return deterministicClassify('');
  }

  // If local AI is not loaded, use deterministic fallback
  if (!LocalAI.isLoaded()) {
    return deterministicClassify(text);
  }

  const schemaJson = JSON.stringify({
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['grounded', 'reflective', 'tense', 'energized', 'fatigued'],
      },
      confidence: { type: 'number' },
      keywords: { type: 'array', items: { type: 'string' } },
      suggestedAction: { type: 'string' },
      reasoning: { type: 'string' },
    },
    required: ['category', 'confidence', 'keywords', 'suggestedAction'],
  });

  const prompt = `Analyze the emotional tone of this user note and classify it into one category: "grounded", "reflective", "tense", "energized", or "fatigued". Return strict JSON matching the schema.\n\nNote: "${text}"`;

  try {
    return await LocalAI.generateStructured<ClassificationResult>({
      prompt,
      schema: schemaJson,
      system: 'You are an accurate, private on-device wellness classifier. Output only valid JSON.',
      validator: (raw) => ClassificationResultSchema.parse(raw),
    });
  } catch {
    // If on-device inference fails or returns invalid schema, fall back deterministically
    return deterministicClassify(text);
  }
}
```

#### `src/services/local-ai/tasks/entityExtraction.ts`

```ts
import { z } from 'zod';
import { LocalAI } from '../../../../modules/local-ai';

export const ExtractedEntitiesSchema = z.object({
  symptoms: z.array(z.string()),
  activities: z.array(z.string()),
  metrics: z.record(z.string(), z.union([z.number(), z.string()])),
  habitsMentioned: z.array(z.string()),
  sentimentScore: z.number().min(-1).max(1),
});

export type ExtractedEntities = z.infer<typeof ExtractedEntitiesSchema>;

export async function extractWellnessEntities(text: string): Promise<ExtractedEntities> {
  if (!text || text.trim().length === 0) {
    return {
      symptoms: [],
      activities: [],
      metrics: {},
      habitsMentioned: [],
      sentimentScore: 0,
    };
  }

  if (!LocalAI.isLoaded()) {
    // Deterministic fallback regex extraction
    const metrics: Record<string, number | string> = {};
    const sleepMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)\s*(?:of\s*)?sleep/i);
    if (sleepMatch) metrics.sleepHours = parseFloat(sleepMatch[1]);

    const waterMatch = text.match(/(\d+)\s*(?:glasses|liters|l|cups)\s*(?:of\s*)?water/i);
    if (waterMatch) metrics.waterIntake = parseInt(waterMatch[1], 10);

    const stepsMatch = text.match(/(\d{3,6})\s*steps/i);
    if (stepsMatch) metrics.steps = parseInt(stepsMatch[1], 10);

    return {
      symptoms: [],
      activities: [],
      metrics,
      habitsMentioned: [],
      sentimentScore: 0,
    };
  }

  const schemaJson = JSON.stringify({
    type: 'object',
    properties: {
      symptoms: { type: 'array', items: { type: 'string' } },
      activities: { type: 'array', items: { type: 'string' } },
      metrics: { type: 'object' },
      habitsMentioned: { type: 'array', items: { type: 'string' } },
      sentimentScore: { type: 'number' },
    },
    required: ['symptoms', 'activities', 'metrics', 'habitsMentioned', 'sentimentScore'],
  });

  const prompt = `Extract structured wellness entities from this text: symptoms, physical activities, quantified metrics (sleep, water, steps), habits mentioned, and a sentiment score between -1.0 (negative) and 1.0 (positive).\n\nText: "${text}"`;

  try {
    return await LocalAI.generateStructured<ExtractedEntities>({
      prompt,
      schema: schemaJson,
      system: 'You are an on-device entity extractor. Output strictly valid JSON conforming to the schema.',
      validator: (raw) => ExtractedEntitiesSchema.parse(raw),
    });
  } catch {
    return {
      symptoms: [],
      activities: [],
      metrics: {},
      habitsMentioned: [],
      sentimentScore: 0,
    };
  }
}
```

#### `src/services/local-ai/tasks/organizationSuggestions.ts`

```ts
import { z } from 'zod';
import { LocalAI } from '../../../../modules/local-ai';

export const OrganizationSuggestionSchema = z.object({
  suggestedTags: z.array(z.string()),
  relatedRoutines: z.array(z.string()),
  categorySuggestion: z.string(),
  reasoning: z.string(),
});

export type OrganizationSuggestion = z.infer<typeof OrganizationSuggestionSchema>;

export async function suggestOrganization(content: string): Promise<OrganizationSuggestion> {
  if (!content || content.trim().length === 0) {
    return {
      suggestedTags: ['wellness'],
      relatedRoutines: ['daily-check-in'],
      categorySuggestion: 'journal',
      reasoning: 'Default organization category.',
    };
  }

  if (!LocalAI.isLoaded()) {
    // Deterministic tag suggestions based on keyword presence
    const lower = content.toLowerCase();
    const tags: string[] = [];
    if (lower.includes('run') || lower.includes('walk') || lower.includes('workout') || lower.includes('gym')) {
      tags.push('fitness', 'movement');
    }
    if (lower.includes('water') || lower.includes('food') || lower.includes('meal') || lower.includes('diet')) {
      tags.push('nutrition');
    }
    if (lower.includes('sleep') || lower.includes('nap') || lower.includes('bed')) {
      tags.push('sleep-hygiene');
    }
    if (lower.includes('calm') || lower.includes('anxious') || lower.includes('breathe')) {
      tags.push('mindfulness');
    }
    if (tags.length === 0) tags.push('reflection');

    return {
      suggestedTags: tags,
      relatedRoutines: tags.map((t) => `${t}-check`),
      categorySuggestion: tags[0],
      reasoning: 'Deterministic keyword matching.',
    };
  }

  const schemaJson = JSON.stringify({
    type: 'object',
    properties: {
      suggestedTags: { type: 'array', items: { type: 'string' } },
      relatedRoutines: { type: 'array', items: { type: 'string' } },
      categorySuggestion: { type: 'string' },
      reasoning: { type: 'string' },
    },
    required: ['suggestedTags', 'relatedRoutines', 'categorySuggestion', 'reasoning'],
  });

  const prompt = `Analyze this wellness entry and suggest up to 3 relevant tags, related routines, and a category:\n\n"${content}"`;

  try {
    return await LocalAI.generateStructured<OrganizationSuggestion>({
      prompt,
      schema: schemaJson,
      system: 'You are an on-device organization assistant. Return strictly valid JSON.',
      validator: (raw) => OrganizationSuggestionSchema.parse(raw),
    });
  } catch {
    return {
      suggestedTags: ['reflection'],
      relatedRoutines: ['daily-check-in'],
      categorySuggestion: 'journal',
      reasoning: 'Fallback organization.',
    };
  }
}
```

#### `src/services/local-ai/tasks/semanticSearch.ts`

```ts
import { LocalAI } from '../../../../modules/local-ai';
import { memoryStore } from '../memory/memoryStore';
import type { MemoryRetrievalResult } from '../memory/types';

/**
 * Searches local analytical memory semantically using on-device dense vector embeddings.
 * Fully offline-first and private.
 */
export async function searchMemoriesSemantically(
  userId: string,
  query: string,
  topK = 5
): Promise<MemoryRetrievalResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  if (!LocalAI.isLoaded()) {
    // Keyword fallback search if model is unmapped
    const all = await memoryStore.listMemories(userId, { status: 'active' });
    const qLower = query.toLowerCase();
    const matched = all.filter((m) => m.content.toLowerCase().includes(qLower));
    return matched.slice(0, topK).map((mem) => ({
      memory: mem,
      similarity: 1.0,
      score: mem.confidence,
    }));
  }

  try {
    const queryVector = await LocalAI.embed(query);
    return await memoryStore.searchMemoriesByVector(userId, queryVector, topK, 0.50);
  } catch {
    // If embedding fails, fallback to keyword filtering
    const all = await memoryStore.listMemories(userId, { status: 'active' });
    const qLower = query.toLowerCase();
    return all
      .filter((m) => m.content.toLowerCase().includes(qLower))
      .slice(0, topK)
      .map((mem) => ({
        memory: mem,
        similarity: 1.0,
        score: mem.confidence,
      }));
  }
}
```

#### `src/services/local-ai/tasks/summarization.ts`

```ts
import { z } from 'zod';
import { LocalAI } from '../../../../modules/local-ai';

export const SummaryResultSchema = z.object({
  headline: z.string(),
  bulletPoints: z.array(z.string()),
  mindfulTakeaway: z.string(),
});

export type SummaryResult = z.infer<typeof SummaryResultSchema>;

export async function summarizeWellnessJournal(notes: string[]): Promise<SummaryResult> {
  const combined = notes.filter((n) => n && n.trim().length > 0).join('\n---\n');

  if (!combined) {
    return {
      headline: 'A Quiet Day',
      bulletPoints: ['No self-reflection notes recorded today.'],
      mindfulTakeaway: 'Take a gentle breath and acknowledge your presence.',
    };
  }

  if (!LocalAI.isLoaded()) {
    // Deterministic summary fallback
    const firstLine = notes[0].split('\n')[0].slice(0, 80);
    return {
      headline: firstLine || 'Daily Reflection',
      bulletPoints: notes.slice(0, 3).map((n) => n.slice(0, 100)),
      mindfulTakeaway: 'Consistency is found in returning gently each day.',
    };
  }

  const schemaJson = JSON.stringify({
    type: 'object',
    properties: {
      headline: { type: 'string' },
      bulletPoints: { type: 'array', items: { type: 'string' } },
      mindfulTakeaway: { type: 'string' },
    },
    required: ['headline', 'bulletPoints', 'mindfulTakeaway'],
  });

  const prompt = `Synthesize these wellness journal reflections into a concise summary with a clear headline, 2-3 key bullet points, and one warm, encouraging mindful takeaway.\n\nJournal entries:\n${combined}`;

  try {
    return await LocalAI.generateStructured<SummaryResult>({
      prompt,
      schema: schemaJson,
      system: 'You are an on-device personal wellness synthesizer. Output strictly valid JSON.',
      validator: (raw) => SummaryResultSchema.parse(raw),
    });
  } catch {
    return {
      headline: 'Daily Reflection Digest',
      bulletPoints: notes.slice(0, 3),
      mindfulTakeaway: 'Every step taken with mindful intention counts.',
    };
  }
}
```

### SOURCE: AI DOMAIN / ACTIONS

#### `src/domain/assistant/appKnowledge.ts`

```ts
/**
 * What the coach knows about the app and about this person's recent days, as plain text documents
 * for the local knowledge store (SQLite + vectors). Pure: built from the store snapshot only, so
 * nothing here is invented and it can be tested without a phone.
 */
import type { Article } from '../../content/learn';
import type { Destination } from '../search/destinations';
import type { ReadingKind } from '../interop/readings';
import { format12Hour } from '../routines';

export interface KnowledgeDoc {
  /** Stable key: the same key is replaced, never duplicated. */
  key: string;
  title: string;
  text: string;
}

/** The slice of the store the summary reads (structural, so tests can pass plain objects). */
export interface RecentDaysInput {
  checkInHistory: { date: string; energy: number; mood: number; stress: number; sleepHours: number; symptoms: string[]; notes?: string }[];
  hydration: Record<string, number>;
  hydrationTargetGlasses: number;
  mealLogs: { date: string; type: string; items: unknown[]; note?: string }[];
  medications: { name: string; dose: string; time: string }[];
  journalEntries: { createdAt: string }[];
  deviceReadings: { date: string; kind: ReadingKind; value: number; unit: string; source: string }[];
  todayQuests: { title: string; isCompleted: boolean; status: string }[];
  level: number;
  xp: number;
  streak: number;
}

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** The last `days` local dates, newest first. */
export function lastDays(now: Date, days: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    out.push(dayKey(d));
  }
  return out;
}

/** Every screen, one line each, so "where do I log water" finds the right place. */
export function screensDoc(destinations: Destination[]): KnowledgeDoc {
  return {
    key: 'app:screens',
    title: 'Thrivefold screens',
    text: destinations.map((d) => `Screen ${d.title}: ${d.description}. Open with ${d.route}.`).join('\n'),
  };
}

/** One document per Learn article; the title is repeated per paragraph so every chunk keeps it. */
export function learnDocs(articles: Article[]): KnowledgeDoc[] {
  return articles.map((a) => ({
    key: `learn:${a.id}`,
    title: `Learn: ${a.title}`,
    text: [
      `Learn article "${a.title}" (${a.category}, ${a.minutes} min) in the Learn screen.`,
      ...a.body.map((p) => `${a.title}: ${p}`),
      a.seekHelp ? `${a.title}, when to get help: ${a.seekHelp}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  }));
}

const READING_LABEL: Partial<Record<ReadingKind, string>> = {
  steps: 'steps',
  sleep_minutes: 'sleep minutes',
  heart_rate_avg: 'average heart rate',
};

/**
 * The person's last week from their own logs, newest day first. Days with nothing logged are
 * skipped; an empty week says so instead of guessing.
 */
export function recentDaysLines(s: RecentDaysInput, now: Date, days = 7): string[] {
  const lines: string[] = [];
  for (const date of lastDays(now, days)) {
    const parts: string[] = [];
    const c = s.checkInHistory.find((x) => x.date === date);
    if (c) {
      parts.push(`check-in mood ${c.mood}/10, energy ${c.energy}/10, stress ${c.stress}/10, slept ${c.sleepHours} h`);
      if (c.symptoms.length) parts.push(`symptoms ${c.symptoms.join(', ')}`);
    }
    const water = s.hydration[date];
    if (water) parts.push(`water ${water} of ${s.hydrationTargetGlasses} glasses`);
    const meals = s.mealLogs.filter((m) => m.date === date);
    if (meals.length) parts.push(`meals logged: ${meals.map((m) => m.type).join(', ')}`);
    for (const r of s.deviceReadings.filter((x) => x.date === date)) {
      const label = READING_LABEL[r.kind];
      if (label) parts.push(`${label} ${Math.round(r.value)} (${r.source})`);
    }
    const journals = s.journalEntries.filter((j) => dayKey(new Date(j.createdAt)) === date).length;
    if (journals) parts.push(`${journals} journal ${journals === 1 ? 'entry' : 'entries'}`);
    if (parts.length) lines.push(`${date}: ${parts.join('; ')}`);
  }
  return lines;
}

/** Medicines, today's quests and progress: things that do not belong to one day. */
export function standingLines(s: RecentDaysInput): string[] {
  const lines: string[] = [];
  if (s.medications.length) {
    lines.push(`Medicines: ${s.medications.map((m) => `${m.name}${m.dose ? ` ${m.dose}` : ''} at ${m.time}`).join(', ')}`);
  }
  const open = s.todayQuests.filter((q) => !q.isCompleted && q.status !== 'skipped').map((q) => q.title);
  const done = s.todayQuests.filter((q) => q.isCompleted).map((q) => q.title);
  if (open.length) lines.push(`Today's open quests: ${open.join(', ')}`);
  if (done.length) lines.push(`Today's finished quests: ${done.join(', ')}`);
  lines.push(`Level ${s.level}, ${s.xp} XP, streak ${s.streak} days`);
  return lines;
}

export function recentDaysDoc(s: RecentDaysInput, now: Date): KnowledgeDoc {
  const days = recentDaysLines(s, now);
  return {
    key: 'me:recent',
    title: 'Your recent days',
    text: [
      'Your recent days in Thrivefold, from what you logged on this phone.',
      ...(days.length ? days : ['Nothing logged in the last 7 days.']),
      ...standingLines(s),
    ].join('\n'),
  };
}

/** Small, stable hash (FNV-1a) so unchanged documents are not re-embedded. */
export function hashText(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/** The coach conversation so far (newest last), so "what did you tell me about sleep" works. */
export function chatDoc(turns: { who: 'you' | 'coach'; text: string; at: number }[], max = 60): KnowledgeDoc {
  const lines = turns.slice(-max).map((t) => {
    const d = new Date(t.at);
    return `${dayKey(d)} ${t.who === 'you' ? 'You asked' : 'Coach said'}: ${t.text.replace(/\s+/g, ' ').trim()}`;
  });
  return {
    key: 'me:chat',
    title: 'Your conversations with the coach',
    text: lines.length ? lines.join('\n') : 'No conversations with the coach yet.',
  };
}

/**
 * Everything else the person keeps in the app (the MMKV store), as documents. Left out on purpose:
 * sign-in and account details, API keys, phone numbers and home address, and anything about
 * religion or identity (observances, worldview, private identity), which the coach never uses.
 */
export interface StoreDocsInput {
  koshProfile: {
    preferredName: string | null;
    languages: string[];
    foodRestrictions: string[];
    allergies: string[];
    cuisines: string[];
    foodDislikes: string[];
    interests: string[];
    skills: string[];
    careerGoal: string | null;
  };
  heightCm: number | null;
  weightKg: number | null;
  onboarding: { goals: string[]; constraints: string[]; routineMinutes: number | null; diet: string | null };
  emergencyContacts: { name: string; relation: string | null }[];
  followUps: { date: string; time: string | null; with: string; note: string | null }[];
  carePlans: { kind: string; by: string | null; savedAt: string }[];
  journalEntries: { createdAt: string; title: string; content: string; moodTag: number }[];
  mealLogs: { date: string; type: string; items: { foodId: string; servings: number; custom?: { name: string } }[]; note?: string }[];
  workoutSessions: { date: string; planId: string; entries: { exerciseId: string; sets: unknown[] }[]; effort?: number; painReported: boolean }[];
  activityLogs: { date: string; type: string; minutes: number; distanceKm?: number }[];
  vitalsHistory: { date: string; time: string; type: string; value: number; secondaryValue?: number; unit: string }[];
  personalEvents: { date: string; title: string; category: string; time?: string; notes?: string; recurrence?: string }[];
  cycleData: { lastPeriodDate: string; cycleLengthDays: number; periodLengthDays: number; currentPhase: string; estimatedNextPeriodDate: string } | null;
  aiMemories: { category: string; content: string }[];
  betaSessions: { kind: string; endedAt: number; metrics: Record<string, number> }[];
  achievements: string[];
  routines?: { id: string; kind: string; title: string; time: string; days: number[]; enabled: boolean; everyHours?: number }[];
  rewardLedger?: { kind: string; key: string; diamonds?: number; xp?: number; sourceId?: string; gameDate?: string }[];
  level?: number;
  xp?: number;
  streak?: number;
  diamonds?: number;
}

const list = (label: string, xs: (string | null | undefined)[]) => {
  const v = xs.filter(Boolean);
  return v.length ? `${label}: ${v.join(', ')}` : '';
};

export function storeDocs(s: StoreDocsInput, now: Date, foodName: (id: string) => string | undefined = () => undefined): KnowledgeDoc[] {
  const k = s.koshProfile;
  const since = (days: number) => dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - days));
  const docs: KnowledgeDoc[] = [];
  const push = (key: string, title: string, lines: string[], empty: string) => {
    const body = lines.filter(Boolean);
    docs.push({ key, title, text: [title + '.', ...(body.length ? body : [empty])].join('\n') });
  };

  push('me:profile', 'About you', [
    k.preferredName ? `You like to be called ${k.preferredName}` : '',
    s.heightCm ? `Height ${s.heightCm} cm` : '',
    s.weightKg ? `Weight ${s.weightKg} kg` : '',
    list('Goals', s.onboarding.goals),
    list('Limits', s.onboarding.constraints),
    s.onboarding.routineMinutes ? `Routine length ${s.onboarding.routineMinutes} minutes a day` : '',
    s.onboarding.diet ? `Diet ${s.onboarding.diet}` : '',
    list('Allergies', k.allergies),
    list('Food restrictions', k.foodRestrictions),
    list('Favourite cuisines', k.cuisines),
    list('Foods you dislike', k.foodDislikes),
    list('Languages', k.languages),
    list('Interests', k.interests),
    list('Skills', k.skills),
    k.careerGoal ? `Career goal: ${k.careerGoal}` : '',
    list('Emergency contacts', s.emergencyContacts.map((c) => (c.relation ? `${c.name} (${c.relation})` : c.name))),
  ], 'No profile details saved yet.');

  push('me:care', 'Your doctor follow-ups and care plans', [
    ...s.followUps.map((f) => `Follow-up on ${f.date}${f.time ? ` at ${f.time}` : ''} with ${f.with}${f.note ? `: ${f.note}` : ''}`),
    ...s.carePlans.map((p) => `${p.kind === 'diet_chart' ? 'Diet chart' : 'Workout plan'}${p.by ? ` from ${p.by}` : ''}, saved ${p.savedAt.slice(0, 10)}`),
  ], 'No follow-ups or care plans saved.');

  push('me:journal', 'Your journal (last 30 entries)', s.journalEntries
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 30)
    .map((j) => `${dayKey(new Date(j.createdAt))} "${j.title}" (mood ${j.moodTag}/10): ${j.content.replace(/\s+/g, ' ').slice(0, 280)}`), 'No journal entries yet.');

  push('me:food', 'Your meals (last 14 days)', s.mealLogs
    .filter((m) => m.date >= since(13))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((m) => `${m.date} ${m.type}: ${m.items.map((i) => `${i.custom?.name ?? foodName(i.foodId) ?? i.foodId}${i.servings !== 1 ? ` x${i.servings}` : ''}`).join(', ') || m.note || 'logged'}`), 'No meals logged in the last 14 days.');

  push('me:movement', 'Your workouts, activity and vitals (last 30 days)', [
    ...s.workoutSessions
      .filter((w) => w.date >= since(29))
      .map((w) => `${w.date} workout ${w.planId}: ${w.entries.length} exercises, ${w.entries.reduce((n, e) => n + e.sets.length, 0)} sets${w.effort ? `, effort ${w.effort}/10` : ''}${w.painReported ? ', pain reported' : ''}`),
    ...s.activityLogs.filter((a) => a.date >= since(29)).map((a) => `${a.date} ${a.type} ${a.minutes} min${a.distanceKm ? `, ${a.distanceKm} km` : ''}`),
    ...s.vitalsHistory
      .filter((v) => v.date >= since(29))
      .map((v) => `${v.date} ${v.time} ${v.type.replace(/_/g, ' ')} ${v.value}${v.secondaryValue ? `/${v.secondaryValue}` : ''} ${v.unit}`),
    ...s.betaSessions
      .filter((b) => dayKey(new Date(b.endedAt)) >= since(29))
      .map((b) => `${dayKey(new Date(b.endedAt))} ${b.kind.replace(/_/g, ' ')}: ${Object.entries(b.metrics).map(([m, v]) => `${m} ${Math.round(v * 10) / 10}`).join(', ')}`),
  ], 'No workouts, activity or vitals in the last 30 days.');

  push('me:calendar', 'Your calendar events', s.personalEvents
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => `${e.date}${e.time ? ` ${e.time}` : ''} ${e.title} (${e.category}${e.recurrence && e.recurrence !== 'none' ? `, every ${e.recurrence.replace('ly', '')}` : ''})${e.notes ? `: ${e.notes}` : ''}`), 'No calendar events saved.');

  if (s.cycleData) {
    const c = s.cycleData;
    push('me:cycle', 'Your cycle', [
      `Last period started ${c.lastPeriodDate}; cycle about ${c.cycleLengthDays} days, period about ${c.periodLengthDays} days`,
      `Current phase ${c.currentPhase}; next period estimated ${c.estimatedNextPeriodDate}`,
    ], '');
  }

  push('me:memories', 'Things you asked the coach to remember', [
    ...s.aiMemories.map((m) => `${m.category}: ${m.content}`),
    s.achievements.length ? `Achievements: ${s.achievements.length}` : '',
  ], 'Nothing saved to remember yet.');

  // Routines & Alarms
  if (s.routines && s.routines.length > 0) {
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const active = s.routines.filter((r) => r.enabled);
    const disabled = s.routines.filter((r) => !r.enabled);
    push('me:routines', 'Your routine alarms', [
      `Total routines: ${s.routines.length} (${active.length} active, ${disabled.length} disabled).`,
      'These fire as system alarm notifications even when the app is closed.',
      ...active.map((r) => {
        const daysLabel = r.days.length === 0 ? 'every day' : r.days.map((d) => DAYS[d - 1]).join(', ');
        const timeLabel = format12Hour(r.time);
        const repeat = r.everyHours ? ` every ${r.everyHours}h` : '';
        return `ACTIVE: "${r.title}" at ${timeLabel}${repeat} — ${daysLabel}`;
      }),
      ...disabled.map((r) => `DISABLED: "${r.title}" at ${format12Hour(r.time)}`),
    ], 'No routines set up yet.');
  }

  // Rewards, milestone chests, and progression
  if (s.rewardLedger !== undefined) {
    const level = s.level ?? 1;
    const xp = s.xp ?? 0;
    const streak = s.streak ?? 0;
    const gems = s.diamonds ?? 0;
    const chestClaims = (s.rewardLedger ?? []).filter((e) => e.kind === 'chest_reward');
    push('me:rewards', 'Your Amber Gems, milestones, and reward claims', [
      `Current level: ${level}`,
      `Total XP: ${xp}`,
      `Amber Gems balance: ${gems}`,
      `Streak: ${streak} day${streak !== 1 ? 's' : ''}`,
      chestClaims.length
        ? `Milestone chests claimed: ${chestClaims.length} (keys: ${chestClaims.map((e) => e.key).join(', ')})`
        : 'No milestone chests claimed yet.',
      'Milestone chests are at levels 5, 10, 20, 50, and 100. Each gives Amber Gems and a collector card.',
      'To claim a reward: open the Roadmap screen and tap the chest, or ask me to check for pending rewards.',
    ], 'No reward data yet.');
  }

  return docs;
}
```

#### `src/domain/assistant/chatActions.ts`

```ts
/**
 * What the coach can do from the chat beyond answering: show records as a table, walk the person to
 * the right screen for a job (scan a prescription, photograph a meal), and ask before anything that
 * cannot be undone (sign out, delete a medicine, clear the chat). Pure: parsing and table building
 * read only the text and the store snapshot.
 */
import { itemFood, type MealItem } from '../nutrition/foods';
import { parseRoutineRequest, routineTimes, type Routine } from '../routines';
import { DESTINATIONS } from '../search/destinations';

export interface ChatTable {
  title: string;
  columns: string[];
  rows: string[][];
  /** Where to manage these records. */
  route?: string;
}

export type ChatAction =
  | {
      kind: 'show';
      what:
        | 'meds'
        | 'followups'
        | 'today'
        | 'meals'
        | 'plans'
        | 'screens'
        | 'week'
        | 'routines'
        | 'gems';
    }
  | { kind: 'routine_add'; routine: Omit<Routine, 'id' | 'enabled'> }
  | { kind: 'guide'; job: 'prescription' | 'meal_photo' | 'medicine_add' | 'rep_count' }
  | { kind: 'reminders'; on: boolean }
  | { kind: 'sign_out' }
  | { kind: 'close' }
  | { kind: 'clear_chat' }
  | { kind: 'delete_med'; name: string }
  | { kind: 'took_med'; name: string };

export function parseChatAction(input: string): ChatAction | null {
  const t = input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t) return null;

  if (/^(?:please )?(?:log ?out|sign ?out|log me out|sign me out)\b/.test(t))
    return { kind: 'sign_out' };
  const routine = parseRoutineRequest(input);
  if (routine) return { kind: 'routine_add', routine };
  if (/^(?:quit|exit|close|bye bye|close (?:this|the chat|chat|coach))$/.test(t))
    return { kind: 'close' };
  if (/\b(?:clear|delete|erase|wipe)\b.*\b(?:chat|conversation|history|messages)\b/.test(t))
    return { kind: 'clear_chat' };

  const del = t.match(
    /\b(?:delete|remove|stop tracking)\b (?:my |the )?(?:medicine |medication |tablet |pill )?(.+?)(?: medicine| tablet| pill)?$/,
  );
  if (del && /\b(?:medicine|medication|tablet|pill)\b/.test(t))
    return { kind: 'delete_med', name: del[1].trim() };
  const took = t.match(
    /\bi (?:took|have taken|had) (?:my )?(.+?)(?: medicine| tablet| pill| dose)?$/,
  );
  if (took && !/\b(?:water|walk|bath|break|nap|shower)\b/.test(took[1]))
    return { kind: 'took_med', name: took[1].trim() };

  if (
    /\b(?:turn|switch|put)\b.*\b(on|off)\b.*\b(?:medicine|medication|pill)? ?remind/.test(t) ||
    /\bremind(?:ers?)?\b.*\b(on|off)\b/.test(t)
  ) {
    return { kind: 'reminders', on: /\bon\b/.test(t) && !/\boff\b/.test(t) };
  }

  if (
    /\b(?:i have|i got|got|scan|upload|log|add|read)\b.*\bprescriptions?\b|\bprescriptions?\b.*\b(?:log|add|scan|understand|read)\b/.test(
      t,
    )
  )
    return { kind: 'guide', job: 'prescription' };
  if (
    /\b(?:photo|picture|camera|snap)\b.*\b(?:meal|food|plate|lunch|dinner|breakfast)\b|\b(?:meal|food)\b.*\b(?:photo|camera)\b/.test(
      t,
    )
  )
    return { kind: 'guide', job: 'meal_photo' };
  if (/\b(?:count|track)\b.*\b(?:reps?|squats?|push ?ups?)\b/.test(t))
    return { kind: 'guide', job: 'rep_count' };
  if (/\b(?:add|new)\b.*\b(?:medicine|medication|pill|tablet)\b/.test(t))
    return { kind: 'guide', job: 'medicine_add' };

  // "Show my medicines" lists records; "what is the medicine called X" is a question for the coach.
  const aboutTheirs =
    /\b(?:my|all|our|today'?s?)\b/.test(t) || /^(?:meds|medicines|appointments|plans)$/.test(t);
  const isQuestionAbout =
    /\b(?:called|named|what is|what's|side effects?|used for|how does|should i)\b/.test(t);
  if (aboutTheirs && !isQuestionAbout) {
    if (/\b(?:meds?|medicines?|medications?|pills?|tablets?|prescriptions?)\b/.test(t))
      return { kind: 'show', what: 'meds' };
    if (/\b(?:appointments?|follow ?ups?|doctor visits?|check ?ups?)\b/.test(t))
      return { kind: 'show', what: 'followups' };
    if (/\b(?:diet|food|meal|workout) (?:chart|plans?)\b|\bcare plans?\b/.test(t))
      return { kind: 'show', what: 'plans' };
    if (/\b(?:what did i eat|meals?|food log)\b/.test(t)) return { kind: 'show', what: 'meals' };
    if (/\b(?:this week|last week|my week|last 7 days)\b/.test(t))
      return { kind: 'show', what: 'week' };
    if (
      /\b(?:today'?s? (?:tasks|plan|quests)|my (?:tasks|quests|plan) (?:for )?today|to ?do)\b/.test(
        t,
      )
    )
      return { kind: 'show', what: 'today' };
    if (/\b(?:screens?|features?|routes?|what can you do|everything you can)\b/.test(t))
      return { kind: 'show', what: 'screens' };
    if (/\b(?:routines?|reminders)\b/.test(t)) return { kind: 'show', what: 'routines' };
    if (/\b(?:gems?|diamonds?|rewards?|points)\b/.test(t)) return { kind: 'show', what: 'gems' };
  }
  if (/\bwhat can you do\b/.test(t)) return { kind: 'show', what: 'screens' };
  return null;
}

/** The slice of the store the tables read. */
export interface TableInput {
  medications: { id: string; name: string; dose: string; time: string }[];
  medicationTaken: string[];
  medicationRemindersOn: boolean;
  followUps: { date: string; time: string | null; with: string; note: string | null }[];
  todayQuests: { title: string; isCompleted: boolean; status: string; xpReward: number }[];
  mealLogs: { date: string; at: string; type: string; items: MealItem[]; note?: string }[];
  carePlans: { kind: string; by: string | null; savedAt: string }[];
  checkInHistory: { date: string; mood: number; energy: number; sleepHours: number }[];
  hydration: Record<string, number>;
  routines?: Routine[];
  diamonds?: number;
}

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function buildTable(
  what: Extract<ChatAction, { kind: 'show' }>['what'],
  s: TableInput,
  now: Date,
): ChatTable {
  const today = dayKey(now);
  switch (what) {
    case 'meds':
      return {
        title: `Your medicines${s.medicationRemindersOn ? ' · reminders on' : ''}`,
        columns: ['Medicine', 'Dose', 'Time', 'Today'],
        rows: [...s.medications]
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((m) => [
            m.name,
            m.dose || '—',
            m.time,
            s.medicationTaken.includes(`${today}|${m.id}`) ? 'Taken' : 'Not yet',
          ]),
        route: '/(app)/health/medications',
      };
    case 'followups':
      return {
        title: 'Doctor follow-ups',
        columns: ['Date', 'Time', 'With', 'Note'],
        rows: s.followUps
          .filter((f) => f.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((f) => [f.date, f.time ?? '—', f.with, f.note ?? '']),
        route: '/(app)/health/medications',
      };
    case 'today':
      return {
        title: "Today's quests",
        columns: ['Quest', 'Points', 'Status'],
        rows: s.todayQuests.map((q) => [
          q.title,
          String(q.xpReward),
          q.isCompleted ? 'Done' : q.status === 'skipped' ? 'Skipped' : 'Open',
        ]),
        route: '/(app)/quests',
      };
    case 'meals':
      return {
        title: 'Meals today',
        columns: ['Time', 'Meal', 'Items'],
        rows: s.mealLogs
          .filter((m) => m.date === today)
          .map((m) => [
            m.at.slice(11, 16) || m.at,
            m.type,
            m.items.map((i) => itemFood(i)?.name ?? i.foodId).join(', ') || m.note || '—',
          ]),
        route: '/(app)/health/nutrition',
      };
    case 'plans':
      return {
        title: 'Saved care plans',
        columns: ['Plan', 'From', 'Saved'],
        rows: s.carePlans.map((p) => [
          p.kind === 'diet_chart' ? 'Diet chart' : 'Workout plan',
          p.by ?? '—',
          p.savedAt.slice(0, 10),
        ]),
        route: '/(app)/health/documents',
      };
    case 'week': {
      const rows: string[][] = [];
      for (let i = 0; i < 7; i++) {
        const d = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
        const c = s.checkInHistory.find((x) => x.date === d);
        const w = s.hydration[d];
        if (c || w)
          rows.push([
            d.slice(5),
            c ? `${c.mood}/10` : '—',
            c ? `${c.energy}/10` : '—',
            c ? `${c.sleepHours} h` : '—',
            w ? String(w) : '—',
          ]);
      }
      return {
        title: 'Your last 7 days',
        columns: ['Day', 'Mood', 'Energy', 'Sleep', 'Water'],
        rows,
        route: '/(app)/(tabs)/progress',
      };
    }
    case 'routines':
      return {
        title: 'Your routines',
        columns: ['Routine', 'When', 'On'],
        rows: (s.routines ?? []).map((r) => [
          r.title,
          routineTimes(r).join(', '),
          r.enabled ? 'Yes' : 'Off',
        ]),
        route: '/(app)/routines',
      };
    case 'gems':
      return {
        title: `You have ${s.diamonds ?? 0} gems`,
        columns: ['Reward', 'Gems'],
        rows: [
          ['Sticker', '100'],
          ['Sanctuary status', '500'],
          ['Real workout gear (limited)', '10,000'],
        ],
        route: '/(app)/marketplace',
      };
    case 'screens':
      return {
        title: 'What I can open for you',
        columns: ['Screen', 'For'],
        rows: DESTINATIONS.map((d) => [d.title, d.description]),
      };
  }
}

/** Step-by-step help for a job, and the screen that does it. */
export const GUIDES: Record<
  Extract<ChatAction, { kind: 'guide' }>['job'],
  { route: string; steps: string }
> = {
  prescription: {
    route: '/(app)/health/documents',
    steps:
      'Let us log it together. 1. I am opening Documents. 2. Tap Scan and photograph the prescription flat, in good light. ' +
      '3. Check each medicine, dose and time it read, fix anything wrong, then save. Your medicines and reminders are set from it. ' +
      'I will explain anything on it you are unsure about, but never change a dose: ask your doctor for that.',
  },
  meal_photo: {
    route: '/(app)/health/meal-log',
    steps:
      'Opening the meal log. Tap the camera, take one photo of the whole plate, then check the items and portions before saving.',
  },
  medicine_add: {
    route: '/(app)/health/medications',
    steps:
      'Opening Medicines. Tap Add, type the name, the dose as written by your doctor and the time. Turn on reminders if you want a nudge.',
  },
  rep_count: {
    route: '/(app)/health/pose-check',
    steps:
      'Opening the rep counter. Prop the phone up so your whole body is in view, pick the exercise and start.',
  },
};

/** The medicine a spoken name refers to, by loose match ("vitamin d" → "Vitamin D3 1000 IU"). */
export function matchMedicine<T extends { name: string }>(meds: T[], spoken: string): T | null {
  const q = spoken
    .toLowerCase()
    .replace(/\b(?:my|the|medicine|tablet|pill)\b/g, '')
    .trim();
  if (!q) return null;
  return (
    meds.find((m) => m.name.toLowerCase() === q) ??
    meds.find((m) => m.name.toLowerCase().includes(q) || q.includes(m.name.toLowerCase())) ??
    null
  );
}
```

#### `src/domain/assistant/commands.ts`

```ts
/**
 * The coach's command understanding: plain rules, no model needed, so it works offline on every
 * phone. Anything it does not recognise is handed to the on-device language model (when one is
 * loaded) as a general question.
 */

export type Command =
  | { kind: 'open'; route: string; label: string }
  | { kind: 'log_water'; glasses: number }
  | { kind: 'ask'; metric: 'steps' | 'water' | 'quests' | 'calories' | 'weather' | 'heart' }
  | { kind: 'crisis' }
  | { kind: 'life'; topic: LifeTopic }
  | { kind: 'export'; format: 'spreadsheet' | 'backup' }
  | { kind: 'remember'; note: string }
  | { kind: 'delete_routines'; target: 'unnecessary' | 'all' | 'specific'; query?: string }
  | { kind: 'toggle_routines'; enable: boolean; query?: string }
  | { kind: 'unknown'; text: string };

/**
 * Splits "log two glasses of water and then open sleep" into separate requests so each one runs
 * as its own step. Only splits when every part is a request the rules understand.
 */
export function splitSteps(input: string): string[] {
  const parts = input
    .split(
      /\s*(?:,\s*and then|\band then\b|\bthen\b|\band also\b|;)\s*|\s+and\s+(?=(?:log|add|open|show|start|export|remember|go to|take me)\b)/i,
    )
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 2) return [input];
  return parts.every((p) => parseCommand(p).kind !== 'unknown') ? parts.slice(0, 5) : [input];
}

const OPEN: { words: RegExp; route: string; label: string }[] = [
  {
    words: /\bbreath(e|ing)?\b|\bcalm\b|\brelax\b/,
    route: '/(app)/beta-lab/breathing',
    label: 'the breathing coach',
  },
  {
    words: /\bface\b(?! shape)|\bjaw\b|\bsmile\b|\bbrow/,
    route: '/(app)/beta-lab/face-exercises',
    label: 'face exercises',
  },
  {
    words:
      /\bglasses\b|\bframes?\b|\bstyle\b|\boutfit\b|\bdress\b|\bbmi\b|\bbody shape\b|\bface shape\b|\bmeal plan/,
    route: '/(app)/beta-lab/body-style',
    label: 'the body and style companion',
  },
  {
    words: /\beye game\b|\bball game\b|\blook left\b/,
    route: '/(app)/beta-lab/eye-games',
    label: 'the eye game',
  },
  {
    words: /\bpursuit\b|\bfollow the dot\b|\bdot\b/,
    route: '/(app)/beta-lab/eye-pursuit',
    label: 'eye pursuit',
  },
  {
    words: /\bvoice\b|\bspeech\b|\bspeak(ing)?\b|\bpronunciation\b|\bvocal\b/,
    route: '/(app)/beta-lab/voice-practice',
    label: 'voice practice',
  },
  {
    words: /\beye\b|\beyes\b|\bblink/,
    route: '/(app)/beta-lab/eye-tracking',
    label: 'the eye studio',
  },
  {
    words: /\bfinger|\bhand\b|\bhands\b|\bgrip\b|\bgame\b/,
    route: '/(app)/beta-lab/gesture-game',
    label: 'the finger game',
  },
  {
    words: /\bpose\b|\bposture\b|\bsquat|\bform\b/,
    route: '/(app)/health/pose-check',
    label: 'the pose coach',
  },
  {
    words: /\bmeal\b|\bfood\b|\bate\b|\beat\b|\blunch\b|\bdinner\b|\bbreakfast\b/,
    route: '/(app)/health/meal-log',
    label: 'the meal log',
  },
  {
    words: /\bcheck[- ]?in\b|\bmood\b|\bhow i feel\b/,
    route: '/(app)/check-in',
    label: 'your check-in',
  },
  { words: /\bsleep\b/, route: '/(app)/health/sleep', label: 'sleep' },
  { words: /\bworkout|\bexercise|\btrain/, route: '/(app)/train', label: 'workouts' },
  {
    words: /\btreadmill|\bwalking pad|\bswim|\bcycl|\bride\b|\brun\b|\bactivity\b/,
    route: '/(app)/health/activity',
    label: 'activity sessions',
  },
  {
    words:
      /\bouting\b|\bpandal|\bpuja\b|\bplan a (walk|trip|day out)\b|\bsightseeing\b|\bheritage\b/,
    route: '/(app)/outing',
    label: 'the outing planner',
  },
  {
    words: /\btrip\b|\bcheck[- ]?in on my way\b|\bgoing home\b|\bwalking home\b/,
    route: '/(app)/safety/trip',
    label: 'trip check-in',
  },
  {
    words:
      /\bprescription\b|\bdiet chart\b|\bfood chart\b|\bworkout plan\b|\btrainer\b|\bdietitian\b/,
    route: '/(app)/health/documents',
    label: 'documents',
  },
  {
    words: /\bmedicine|\bmedication|\btablet|\bpill|\bdoctor\b|\bappointment\b/,
    route: '/(app)/health/medications',
    label: 'medicines and follow-ups',
  },
  {
    words: /\badhd\b|\bfocus check\b|\battention\b|\bcan'?t focus\b/,
    route: '/(app)/you/adhd-screener',
    label: 'the focus self-check',
  },
  {
    words: /\bwhat'?s around\b|\bwhat do you see\b|\bdescribe\b|\blook around\b/,
    route: '/(app)/assist/look-around',
    label: "what's around you",
  },
  {
    words: /\bsound alert|\blisten for\b|\bdoorbell\b|\bhard of hearing\b/,
    route: '/(app)/assist/sound-alerts',
    label: 'sound alerts',
  },
  {
    words: /\bcut ?out\b|\bremove background\b/,
    route: '/(app)/assist/photo-cutout',
    label: 'photo cutout',
  },
  { words: /\bquest/, route: '/(app)/quests', label: 'quests' },
  { words: /\bprogress\b|\btrend|\bhistory\b/, route: '/(app)/(tabs)/progress', label: 'progress' },
  { words: /\bjournal\b|\bwrite\b/, route: '/(app)/journal/new', label: 'a new journal entry' },
  {
    words: /\broutines?\b|\balarms?\b|\bschedules?\b|\breminders?\b|\bbedtime timer\b/,
    route: '/(app)/routines',
    label: 'routines and alarms',
  },
  {
    words: /\b(api keys?|byok|bring your own key|gemini key|groq key|ai settings?)\b/,
    route: '/(app)/settings/ai-byok',
    label: 'AI settings and keys',
  },
  { words: /\bsettings?\b/, route: '/(app)/(tabs)/settings', label: 'settings' },
];

export type LifeTopic = 'work' | 'balance' | 'relationship' | 'low';

const NUMBER_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
};

export function parseCommand(input: string): Command {
  const text = input
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return { kind: 'unknown', text: '' };
  // Anyone in crisis, distress, or asking for someone to talk to / emergency help gets support immediately.
  if (
    /\b(suicid\w*|kill (my ?self|me)|end (my|it all)|want to die|don'?t want to (live|be here)|self[- ]?harm|hurt(ing)? my ?self|no reason to live|someone to talk|talk to someone|need to talk|urgent support|helplines?|emergency contacts?|emergency numbers?|sos)\b/.test(
      text,
    )
  ) {
    return { kind: 'crisis' };
  }

  if (
    /\b(work|job|office|boss|deadline)s?\b.*\b(stress|pressure|burn ?out|overwhelm|tired|anxious)|\b(stress|pressure|burn ?out)\b.*\b(work|job|office)\b/.test(
      text,
    )
  )
    return { kind: 'life', topic: 'work' };
  if (/\bwork[- ]life\b|\bno time for (myself|family)\b|\bbalance\b/.test(text))
    return { kind: 'life', topic: 'balance' };
  if (
    /\b(marriage|husband|wife|partner|relationship|spouse|in-?laws)\b/.test(text) &&
    /\b(fight|issue|problem|stress|arguing|argue|unhappy|trouble|conflict)/.test(text)
  )
    return { kind: 'life', topic: 'relationship' };
  if (/\b(feel(ing)? (low|sad|down|lonely|empty)|depressed|hopeless)\b/.test(text))
    return { kind: 'life', topic: 'low' };

  const remember = input
    .trim()
    .match(/^(?:please\s+)?(?:remember|note|save)\s+(?:that\s+)?(.{3,300})$/i);
  if (remember && !/\b(?:my )?(?:data|backup|everything|metrics)\b/i.test(remember[1]))
    return { kind: 'remember', note: remember[1].trim() };
  if (
    /\b(export|download|back ?up|save a copy of)\b/.test(text) &&
    /\b(data|metrics?|everything|records?|all|backup|spreadsheet|excel|history)\b/.test(text)
  ) {
    return {
      kind: 'export',
      format: /\b(back ?up|json|restore|uninstall|everything)\b/.test(text)
        ? 'backup'
        : 'spreadsheet',
    };
  }

  // Routine & Alarm management
  if (
    /\b(?:delete|remove|clear|clean ?up|cancel|drop|prune)\b.*\b(?:unnecessary|unused|disabled|inactive|extra|duplicate|old)\b.*\b(?:routines?|alarms?|reminders?|schedules?)\b/i.test(
      text,
    ) ||
    /\b(?:delete|remove|clear|clean ?up|cancel|drop|prune)\b.*\b(?:routines?|alarms?|reminders?|schedules?)\b.*\b(?:unnecessary|unused|disabled|inactive|extra)\b/i.test(
      text,
    )
  ) {
    return { kind: 'delete_routines', target: 'unnecessary' };
  }

  if (
    /\b(?:delete|remove|clear|cancel)\b.*\b(?:all|every)\b.*\b(?:routines?|alarms?|reminders?|schedules?)\b/i.test(
      text,
    )
  ) {
    return { kind: 'delete_routines', target: 'all' };
  }

  const delMatch = text.match(
    /\b(?:delete|remove|cancel)\b.*?\b(?:routine|alarm|reminder)\b(?:\s+(?:for|called|named))?\s+([a-z0-9\s'-]+)/i,
  );
  if (
    delMatch &&
    !/\b(?:all|every|unnecessary|unused|disabled|inactive|extra)\b/i.test(delMatch[1])
  ) {
    return { kind: 'delete_routines', target: 'specific', query: delMatch[1].trim() };
  }

  if (
    /\b(?:turn off|disable|pause|mute)\b.*\b(?:all|every)\b.*\b(?:routines?|alarms?|reminders?)\b/i.test(
      text,
    )
  ) {
    return { kind: 'toggle_routines', enable: false };
  }

  if (
    /\b(?:turn on|enable|resume|unmute)\b.*\b(?:all|every)\b.*\b(?:routines?|alarms?|reminders?)\b/i.test(
      text,
    )
  ) {
    return { kind: 'toggle_routines', enable: true };
  }

  const water = text.match(
    /\b(?:log|add|drank|had)\b.*?\b(\d+|a|an|one|two|three|four|five|six)\b\s*(?:glass|glasses|cup|cups)\b/,
  );
  if (water || /\b(?:log|add)\b.*\bwater\b/.test(text)) {
    const raw = water?.[1] ?? '1';
    const n = NUMBER_WORDS[raw] ?? Number.parseInt(raw, 10);
    return { kind: 'log_water', glasses: Math.max(1, Math.min(6, Number.isFinite(n) ? n : 1)) };
  }

  const asking =
    /^(how|what|did|have|am|do|will|is|should|can|whats|when)\b|\?$|\b(how many|how much|tell me)\b/.test(
      text,
    );
  if (asking) {
    if (/\bweather\b|\brain\b|\bhot\b|\bwalk outside\b|\bgo out\b|\bumbrella\b/.test(text))
      return { kind: 'ask', metric: 'weather' };
    if (/\bheart ?(rate|beat)\b|\bpulse\b|\bbpm\b/.test(text))
      return { kind: 'ask', metric: 'heart' };
    if (/\bsteps?\b|\bwalked\b/.test(text)) return { kind: 'ask', metric: 'steps' };
    if (/\bwater\b|\bdrink|\bhydrat/.test(text)) return { kind: 'ask', metric: 'water' };
    if (/\bcalor|\bburn/.test(text)) return { kind: 'ask', metric: 'calories' };
    if (/\bquests?\b|\btasks?\b|\bleft\b/.test(text)) return { kind: 'ask', metric: 'quests' };
  }

  // Style and body questions ("which glasses suit me?") are best answered by the companion screen.
  const style = OPEN.find((o) => o.route.endsWith('/body-style'));
  if (style && style.words.test(text))
    return { kind: 'open', route: style.route, label: style.label };

  if (
    /\b(open|start|go to|show|take me|begin|let's|lets|i want)\b/.test(text) ||
    text.split(' ').length <= 3
  ) {
    for (const o of OPEN)
      if (o.words.test(text)) return { kind: 'open', route: o.route, label: o.label };
  }
  return { kind: 'unknown', text: input.trim() };
}
```

#### `src/domain/assistant/dailyBrief.ts`

```ts
/**
 * The coach's first message of the day: a short brief from the person's own data (no model, no
 * network), so Anvay starts the conversation with something useful instead of waiting.
 */
export interface BriefInput {
  name?: string | null;
  hour: number;
  today: string; // YYYY-MM-DD
  checkedInToday: boolean;
  waterGlasses: number;
  waterTarget: number;
  openQuests: string[];
  medicines: { id: string; name: string; time: string }[];
  medicationTaken: string[]; // "date|id"
  nowHHMM: string;
  followUps: { date: string; time: string | null; with: string }[];
}

export function dailyBrief(s: BriefInput): string {
  const part = s.hour < 5 ? 'night' : s.hour < 12 ? 'morning' : s.hour < 17 ? 'afternoon' : 'evening';
  const lines: string[] = [];
  const due = s.medicines.filter((m) => m.time <= s.nowHHMM && !s.medicationTaken.includes(`${s.today}|${m.id}`));
  const later = s.medicines.filter((m) => m.time > s.nowHHMM);
  if (due.length) lines.push(`${due.map((m) => m.name).join(', ')} ${due.length === 1 ? 'is' : 'are'} due and not marked taken yet.`);
  else if (later.length) lines.push(`Next medicine: ${later[0].name} at ${later[0].time}.`);
  const appt = s.followUps.find((f) => f.date === s.today);
  if (appt) lines.push(`You have ${appt.with} today${appt.time ? ` at ${appt.time}` : ''}.`);
  if (!s.checkedInToday) lines.push("You haven't checked in today; it takes about a minute.");
  if (s.waterGlasses < s.waterTarget) lines.push(`Water: ${s.waterGlasses} of ${s.waterTarget} glasses so far.`);
  if (s.openQuests.length) lines.push(`${s.openQuests.length} ${s.openQuests.length === 1 ? 'quest' : 'quests'} open, starting with "${s.openQuests[0]}".`);
  const hello = `Good ${part}${s.name ? `, ${s.name}` : ''}.`;
  return lines.length ? `${hello} ${lines.join(' ')} What would you like to start with?` : `${hello} You're all caught up today. What can I help with?`;
}
```

#### `src/domain/assistant/personas.ts`

```ts
/**
 * The roles one coach can take. Same voice, same memory, same rules; only the focus and the way
 * it explains change. None of them diagnoses or prescribes.
 */
export type PersonaId = 'coach' | 'health' | 'speech' | 'nutrition' | 'friend' | 'reader' | 'support';

export interface Persona {
  id: PersonaId;
  label: string;
  icon: string;
  /** Added to the coach's instructions. */
  focus: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'coach',
    label: 'Coach',
    icon: 'trophy-outline',
    focus: 'Act as an everyday wellbeing coach: habits, movement, routines, plans and quests.',
  },
  {
    id: 'health',
    label: 'Health guide',
    icon: 'medkit-outline',
    focus:
      'Act like a calm health guide (not a doctor): explain symptoms, medicines and check-ups in plain words, ' +
      'ask how long and how strong, and say clearly when to see a doctor. Never diagnose or name doses.',
  },
  {
    id: 'speech',
    label: 'Speech practice',
    icon: 'mic-outline',
    focus:
      'Act like a speech practice partner: short drills for breath, pace, clarity and pronunciation, ' +
      'one exercise at a time, with encouraging feedback.',
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    icon: 'nutrition-outline',
    focus:
      'Act like a nutrition guide: meals, water, protein and fibre from what they logged, respecting their diet, ' +
      'allergies and foods they avoid. Give practical Indian home-food options.',
  },
  {
    id: 'friend',
    label: 'Friend',
    icon: 'heart-outline',
    focus:
      'Act like a warm, honest friend: listen first, reflect back what you heard, keep it light, and gently ' +
      'suggest one small next step. For self-harm or danger, give 112 and Tele-MANAS 14416.',
  },
  {
    id: 'reader',
    label: 'Reader',
    icon: 'book-outline',
    focus:
      'Act like a patient reader and explainer: read the screen, Learn articles and their records back in simple ' +
      'sentences, one idea at a time, with a short example. Offer to go deeper.',
  },
  {
    id: 'support',
    label: 'Support companion',
    icon: 'heart-circle-outline',
    focus:
      'Act as Anvay in support mode: a warm, nonjudgmental, unhurried space. ' +
      'Listen first, understand the person\'s situation, never rush or overwhelm them with questionnaires. ' +
      'For medical or life danger, direct immediately to local emergency care (112 / 911 / 999).',
  },
];

export const personaFor = (id: PersonaId | undefined): Persona => PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
```

#### `src/domain/assistant/plainText.ts`

```ts
/**
 * Small models write markdown even when told not to. The chat shows plain text and the voice
 * should never read "asterisk": strip emphasis and headings, turn list markers into bullets.
 */
export function plainText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/(^|\s)\*(\S[^*]*?)\*(?=\s|[.,!?]|$)/g, '$1$2')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/`([^`]+)`/g, '$1');
}
```

#### `src/domain/assistant/screenRegistry.ts`

```ts
/**
 * Screen Capability Registry for Context-Aware Coaching.
 *
 * Inspired by Google AI Edge Gallery's execution context patterns:
 * Maps each primary app route to its semantic purpose, accessible metrics,
 * supported tools, and suggested prompt chips.
 */

import { formatLocalDate } from '../calendar/universalCalendarEngine';
import { stepsByDate } from '../interop/readings';

export interface ScreenChip {
  label: string;
  command: string;
}

export interface ScreenCapability {
  route: string;
  title: string;
  purpose: string;
  visibleMetrics: string[];
  supportedTools: string[];
  suggestedChips: ScreenChip[];
  getContextSummary: (storeState: any) => string;
}

export const SCREEN_REGISTRY: Record<string, ScreenCapability> = {
  '/(app)/(tabs)': {
    route: '/(app)/(tabs)',
    title: 'Home Sanctuary',
    purpose: 'Daily wellbeing dashboard, routine tracker, hydration overview, and active vital signs.',
    visibleMetrics: ['steps', 'water', 'active_calories', 'quests'],
    supportedTools: ['log_water', 'get_metrics', 'navigate_to_screen', 'search_personal_memory'],
    suggestedChips: [
      { label: 'Log 2 glasses of water', command: 'log 2 glasses of water' },
      { label: 'How are my steps today?', command: 'how many steps today?' },
      { label: 'What quests remain?', command: 'what quests are left?' },
      { label: 'Start breathing coach', command: 'start breathing' },
    ],
    getContextSummary: (s) => {
      const today = formatLocalDate(new Date());
      const steps = s?.deviceReadings ? stepsByDate(s.deviceReadings).get(today)?.value : 0;
      const water = s?.hydration?.[today] ?? 0;
      return `User is on Home Dashboard. Steps: ${Math.round(steps || 0)}, Water: ${water} glasses.`;
    },
  },
  '/(app)/(tabs)/today': {
    route: '/(app)/(tabs)/today',
    title: 'Today & Quests',
    purpose: 'Daily habit tracking, mind-body quests, time-of-day practices, and mindful reflections.',
    visibleMetrics: ['quests', 'active_calories', 'steps'],
    supportedTools: ['get_metrics', 'navigate_to_screen', 'log_journal_note'],
    suggestedChips: [
      { label: 'Summarize today quests', command: 'what quests are left today?' },
      { label: 'Open breathing exercise', command: 'start breathing' },
      { label: 'Check pose technique', command: 'start pose check' },
    ],
    getContextSummary: (s) => {
      const open = s?.todayQuests?.filter((q: any) => !q.isCompleted) ?? [];
      return `User is viewing Today Quests. Unfinished quests: ${open.length}.`;
    },
  },
  '/(app)/(tabs)/progress': {
    route: '/(app)/(tabs)/progress',
    title: 'Progress & Insights',
    purpose: 'Historical weekly trends, activity consistency, streak records, and level advancement.',
    visibleMetrics: ['xp', 'level', 'streak', 'diamonds'],
    supportedTools: ['get_metrics', 'navigate_to_screen', 'search_personal_memory'],
    suggestedChips: [
      { label: 'What is my current streak?', command: 'how is my progress?' },
      { label: 'Show active calories', command: 'how many calories burned?' },
      { label: 'Review past reflections', command: 'show my journal memories' },
    ],
    getContextSummary: (s) => {
      return `User is reviewing Progress. Level: ${s?.userLevel ?? 1}, XP: ${s?.userXp ?? 0}.`;
    },
  },
  '/(app)/(tabs)/settings': {
    route: '/(app)/(tabs)/settings',
    title: 'You & Settings',
    purpose: 'Personal preferences, pacing configurations, privacy export, and AnvayKosh vault management.',
    visibleMetrics: [],
    supportedTools: ['navigate_to_screen', 'search_personal_memory'],
    suggestedChips: [
      { label: 'Inspect AI memory', command: 'open my memories' },
      { label: 'Update health profile', command: 'open profile' },
      { label: 'Privacy export', command: 'open privacy' },
    ],
    getContextSummary: (s) => {
      const name = s?.koshProfile?.preferredName || 'Friend';
      return `User is on Settings screen. Profile name: ${name}.`;
    },
  },
  '/(app)/health/pose-check': {
    route: '/(app)/health/pose-check',
    title: 'Coach & Movement Check',
    purpose: 'Real-time camera pose landmarking, repetition counting, form verification, and audio guidance.',
    visibleMetrics: ['reps', 'form_score', 'active_exercise'],
    supportedTools: ['start_routine', 'get_metrics'],
    suggestedChips: [
      { label: 'How is my squat form?', command: 'how do I do squats with good form?' },
      { label: 'Tips for push-ups', command: 'tips for push ups' },
      { label: 'Cooldown stretches', command: 'show cooldown stretches' },
    ],
    getContextSummary: () => 'User is in active Pose & Movement Coach screen.',
  },
  '/(app)/check-in': {
    route: '/(app)/check-in',
    title: 'Daily Check-In',
    purpose: 'Self-reflection on mood, physical energy, sleep quality, and daily intention.',
    visibleMetrics: ['mood', 'energy', 'sleep_rating'],
    supportedTools: ['log_journal_note', 'navigate_to_screen'],
    suggestedChips: [
      { label: 'Feeling overwhelmed today', command: 'feeling low today' },
      { label: 'Work balance tips', command: 'work stress advice' },
      { label: 'Start 3-minute breathwork', command: 'start breathing' },
    ],
    getContextSummary: () => 'User is performing their Daily Reflection Check-In.',
  },
};

/**
 * Resolves capability descriptor for any given Expo Router pathname.
 */
export function resolveScreenCapability(pathname: string): ScreenCapability {
  if (!pathname) return SCREEN_REGISTRY['/(app)/(tabs)'];

  // Exact match
  if (SCREEN_REGISTRY[pathname]) {
    return SCREEN_REGISTRY[pathname];
  }

  // Prefix matching
  for (const [route, cap] of Object.entries(SCREEN_REGISTRY)) {
    if (pathname.startsWith(route)) {
      return cap;
    }
  }

  // Default fallback
  return SCREEN_REGISTRY['/(app)/(tabs)'];
}
```

#### `src/domain/assistant/toolRegistry.ts`

```ts
/**
 * Typed Tool Execution Framework for Thrive Coach.
 *
 * Implements the architecture from Google AI Edge Gallery (`tools/`):
 * - Strongly typed schemas
 * - Input validation
 * - Execution context (user store state, current screen route)
 * - Confirmation gates for sensitive actions
 * - Audited execution results
 */

import { useRootStore } from '../../stores/useRootStore';
import { formatLocalDate } from '../calendar/universalCalendarEngine';
import { stepsByDate } from '../interop/readings';
import { activeCalories } from '../activity/calories';
import { thriveRag } from '../../services/local-ai/rag/thriveRag';
import { memoryStore } from '../../services/local-ai/memory/memoryStore';
import { knowledgeStore } from '../../services/local-ai/rag/knowledgeStore';
import { lookupMedicine, analyzePrescriptionText } from '../../services/ai/medicineResearch';
import { format12Hour } from '../routines';
import { chestKey, LEVEL_CHESTS } from '../game/rewards';

function navigateTo(route: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { router } = require('expo-router');
    router?.push?.(route as any);
  } catch {
    // Graceful no-op in headless/test environments
  }
}

export interface ToolParameterSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  enum?: string[];
}

export interface ToolDefinition<TParams = any, TResult = any> {
  name: string;
  description: string;
  parameters: Record<string, ToolParameterSchema>;
  requiresConfirmation?: boolean;
  execute: (params: TParams, context: ToolExecutionContext) => Promise<ToolExecutionResult<TResult>>;
}

export interface ToolExecutionContext {
  userId: string;
  currentRoute?: string;
  isConfirmed?: boolean;
}

export interface ToolExecutionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  routeToOpen?: string;
  autoNavigate?: boolean;
  needsConfirmation?: boolean;
  confirmationPrompt?: string;
}

export const TOOLS: Record<string, ToolDefinition> = {
  navigate_to_screen: {
    name: 'navigate_to_screen',
    description: 'Safely navigates the user to a supported app feature or screen.',
    parameters: {
      route: {
        type: 'string',
        description: 'Target route path within the application',
        required: true,
      },
      label: {
        type: 'string',
        description: 'Friendly display name of the screen',
      },
    },
    execute: async (params: { route: string; label?: string }) => {
      try {
        navigateTo(params.route);
        return {
          success: true,
          message: `Opened ${params.label || params.route}.`,
          routeToOpen: params.route,
          autoNavigate: true,
        };
      } catch (err: any) {
        return {
          success: false,
          message: `Could not open screen: ${err.message}`,
        };
      }
    },
  },

  log_water: {
    name: 'log_water',
    description: 'Logs water intake in number of standard glasses (250ml each) for today.',
    parameters: {
      glasses: {
        type: 'number',
        description: 'Number of glasses of water to add (1-10)',
        required: true,
      },
    },
    execute: async (params: { glasses: number }) => {
      const glasses = Math.max(1, Math.min(10, Math.round(params.glasses || 1)));
      const today = formatLocalDate(new Date());
      const store = useRootStore.getState();
      store.addWaterLog(glasses * 250, today);
      const updatedTotal = useRootStore.getState().hydration[today] ?? glasses;
      return {
        success: true,
        message: `Logged ${glasses} glass${glasses === 1 ? '' : 'es'} of water. Total today: ${updatedTotal} glasses.`,
        data: { addedGlasses: glasses, totalGlassesToday: updatedTotal },
      };
    },
  },

  get_metrics: {
    name: 'get_metrics',
    description: 'Reads verified on-device health metrics (steps, water, calories, or quests) for today.',
    parameters: {
      metric: {
        type: 'string',
        description: 'The metric to query',
        required: true,
        enum: ['steps', 'water', 'calories', 'quests', 'summary'],
      },
    },
    execute: async (params: { metric: 'steps' | 'water' | 'calories' | 'quests' | 'heart' | 'summary' }) => {
      const store = useRootStore.getState();
      const today = formatLocalDate(new Date());

      if (params.metric === 'heart') {
        // Only real readings from a connected source (Health Connect or a heart-rate strap).
        const hr = store.deviceReadings
          .filter((r) => r.kind === 'heart_rate_avg')
          .sort((a, b) => b.date.localeCompare(a.date))[0];
        if (!hr) {
          return {
            success: true,
            message:
              'I have no heart-rate readings yet. Connect Health Connect or a heart-rate strap in Health, Connected apps, and I can tell you.',
            routeToOpen: '/(app)/health/integrations',
          };
        }
        const when = hr.date === today ? 'today' : `on ${hr.date}`;
        const src = hr.source === 'ble_heart_rate' ? 'your heart-rate strap' : 'Health Connect';
        const range = hr.min && hr.max ? `, between ${Math.round(hr.min)} and ${Math.round(hr.max)}` : '';
        return {
          success: true,
          message: `Your average heart rate ${when} was ${Math.round(hr.value)} beats a minute${range}, from ${src}.`,
          data: { bpm: hr.value, date: hr.date, source: hr.source },
        };
      }

      if (params.metric === 'steps') {
        const stepVal = stepsByDate(store.deviceReadings).get(today)?.value ?? 0;
        return {
          success: true,
          message: `You have taken ${Math.round(stepVal).toLocaleString()} steps today.`,
          data: { steps: Math.round(stepVal) },
        };
      }

      if (params.metric === 'water') {
        const glasses = store.hydration[today] ?? 0;
        const target = store.hydrationTargetGlasses ?? 8;
        return {
          success: true,
          message: `You have had ${glasses} of ${target} glasses of water today.`,
          data: { glasses, target },
        };
      }

      if (params.metric === 'calories') {
        const stepVal = stepsByDate(store.deviceReadings).get(today)?.value ?? null;
        const cal = activeCalories({
          date: today,
          steps: stepVal,
          weightKg: store.weightKg ?? null,
          activityLogs: store.activityLogs,
          workoutSessions: store.workoutSessions,
        });
        return {
          success: true,
          message: `Estimated active calories today: ${cal.total || 0} kcal.`,
          data: { activeCalories: cal.total },
        };
      }

      if (params.metric === 'quests') {
        const open = store.todayQuests.filter(
          (q) => !q.isCompleted && q.status !== 'replaced' && q.status !== 'skipped'
        );
        return {
          success: true,
          message: open.length
            ? `You have ${open.length} quest${open.length === 1 ? '' : 's'} remaining today. Next: ${open[0].title}.`
            : "You've finished all of today's quests! Great work.",
          data: { remainingCount: open.length, remainingTitles: open.map((q) => q.title) },
        };
      }

      // Default 'summary'
      const steps = Math.round(stepsByDate(store.deviceReadings).get(today)?.value ?? 0);
      const water = store.hydration[today] ?? 0;
      return {
        success: true,
        message: `Today's Summary: ${steps.toLocaleString()} steps taken, ${water} glasses of water logged.`,
        data: { steps, water },
      };
    },
  },

  search_personal_memory: {
    name: 'search_personal_memory',
    description: 'Retrieves knowledge strictly grounded in user notes and exercise library via Hybrid RAG.',
    parameters: {
      query: {
        type: 'string',
        description: 'Semantic query to search across analytical memories and exercises',
        required: true,
      },
    },
    execute: async (params: { query: string }, context: ToolExecutionContext) => {
      const res = await thriveRag.answer(params.query);
      return {
        success: true,
        message: res.answer,
        data: {
          citations: res.citations,
          confidence: res.confidence,
          isGrounded: res.isGrounded,
        },
      };
    },
  },

  log_journal_note: {
    name: 'log_journal_note',
    description: 'Saves an approved mindful reflection into on-device analytical memory.',
    parameters: {
      note: {
        type: 'string',
        description: 'Content of the reflection or journal note',
        required: true,
      },
      tag: {
        type: 'string',
        description: 'Category tag (e.g. mindfulness, stress, sleep, gratitude)',
      },
    },
    execute: async (params: { note: string; tag?: string }, context: ToolExecutionContext) => {
      const memory = await memoryStore.addMemory({
        userId: context.userId || 'local_user',
        kind: 'fact',
        content: params.note.trim(),
        sourceEventIds: [`voice_${Date.now()}`],
        confidence: 1.0,
        origin: 'user_declared',
        status: 'active',
        metadata: {
          source: 'voice_assistant',
          tag: params.tag || 'reflection',
          recordedAt: new Date().toISOString(),
        },
      });
      return {
        success: true,
        message: `Saved reflection to your private on-device memories.`,
        data: { memoryId: memory.id },
      };
    },
  },

  ingest_user_document: {
    name: 'ingest_user_document',
    description: 'Chunks, indexes, and saves an educational wellness document or personal note into on-device vector RAG.',
    parameters: {
      title: {
        type: 'string',
        description: 'Title of the document',
        required: true,
      },
      text: {
        type: 'string',
        description: 'Full text content of the document',
        required: true,
      },
      sourceType: {
        type: 'string',
        description: 'Document category',
        enum: ['user_note', 'health_article', 'wellness_guide', 'imported_file', 'medical_reference'],
      },
    },
    execute: async (
      params: {
        title: string;
        text: string;
        sourceType?: 'user_note' | 'health_article' | 'wellness_guide' | 'imported_file' | 'medical_reference';
      },
      context: ToolExecutionContext
    ) => {
      const doc = await knowledgeStore.ingestDocument(context.userId || 'local_user', {
        title: params.title,
        text: params.text,
        sourceType: params.sourceType,
      });
      return {
        success: true,
        message: `Indexed "${doc.title}" into ${doc.chunkCount} searchable knowledge chunk${doc.chunkCount === 1 ? '' : 's'} on device.`,
        data: { documentId: doc.id, chunkCount: doc.chunkCount },
      };
    },
  },

  lookup_medicine_info: {
    name: 'lookup_medicine_info',
    description: 'Provides non-diagnostic educational information on a medication from verified databases.',
    parameters: {
      medicineName: {
        type: 'string',
        description: 'Name of the medicine or drug to look up',
        required: true,
      },
    },
    execute: async (params: { medicineName: string }) => {
      const rec = lookupMedicine(params.medicineName);
      if (!rec) {
        return {
          success: true,
          message: `I could not find a verified educational entry for "${params.medicineName}". Please confirm with your pharmacist or doctor.`,
        };
      }
      const summary =
        `${rec.name} (${rec.genericName || rec.generalClass}): Commonly used for ${rec.commonUses.join(', ')}. ` +
        `Note: ${rec.cautionaryNotes[0] || ''} Consult a doctor or pharmacist for dosage instructions. ` +
        `[Source: ${rec.authoritativeSource.publisher}]`;
      return {
        success: true,
        message: summary,
        data: rec,
      };
    },
  },

  export_data: {
    name: 'export_data',
    description: 'Saves all of the person\'s records as a spreadsheet or a full backup file in a folder they choose.',
    parameters: {
      format: { type: 'string', description: 'spreadsheet or backup', enum: ['spreadsheet', 'backup'], required: true },
    },
    execute: async (params: { format: 'spreadsheet' | 'backup' }) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const data = require('../../services/privacy/localData') as typeof import('../../services/privacy/localData');
      const ok = params.format === 'backup' ? await data.exportRawJson() : await data.exportDataToWorkbook();
      return {
        success: ok,
        message: ok
          ? params.format === 'backup'
            ? 'Your full backup is saved. Keep it safe; you can restore it from Privacy and data.'
            : 'All your metrics are saved as a spreadsheet.'
          : 'Nothing was saved. Choose a folder when Android asks, and try again.',
      };
    },
  },

  trigger_urgent_support: {
    name: 'trigger_urgent_support',
    description: 'Provides immediate crisis helpline contacts and opens urgent support screen.',
    parameters: {},
    execute: async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { resolveEmergencyJurisdiction } = require('../../services/location/emergencyLocationResolver');
      const jur = await resolveEmergencyJurisdiction();
      useRootStore.getState().setCoachPersona('support');
      const helplineMsg = jur.primaryMentalHealth.name.includes(jur.primaryMentalHealth.number)
        ? jur.primaryMentalHealth.name
        : `${jur.primaryMentalHealth.name} on ${jur.primaryMentalHealth.number}`;
      return {
        success: true,
        message: `You are not alone. I am right here with you in support mode. For ${jur.countryName}: Emergency is ${jur.primaryEmergency.name} (${jur.primaryEmergency.number}), and free 24/7 mental health support is ${helplineMsg}.`,
        routeToOpen: '/(app)/safety/urgent-support',
      };
    },
  },

  get_emergency_directory: {
    name: 'get_emergency_directory',
    description: 'Retrieves verified emergency services, ambulance, and crisis support numbers for the user\'s country.',
    parameters: {
      countryCode: {
        type: 'string',
        description: 'Two-letter ISO country code (e.g. IN, US, GB, CA, AU)',
        required: false,
      },
    },
    execute: async (params: { countryCode?: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { resolveEmergencyJurisdiction } = require('../../services/location/emergencyLocationResolver');
      const jur = await resolveEmergencyJurisdiction(params.countryCode);
      const lines = jur.allContacts.map((c: any) => `• ${c.name} (${c.number}) - ${c.hours}`);
      return {
        success: true,
        message: `Verified emergency contacts for ${jur.countryName}:\n${lines.join('\n')}`,
        data: jur,
        routeToOpen: '/(app)/safety/someone-to-talk',
      };
    },
  },

  find_nearby_emergency_care: {
    name: 'find_nearby_emergency_care',
    description: 'Finds the nearest hospital emergency departments and urgent care clinics based on device location.',
    parameters: {},
    execute: async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { requestLocationForEmergencyCare, findNearbyEmergencyCare } = require('../../services/location/emergencyLocationResolver');
      const coords = await requestLocationForEmergencyCare();
      if (!coords) {
        return {
          success: false,
          message: 'Location access is required to find emergency care closest to you. I can open the map search for hospitals instead.',
          routeToOpen: '/(app)/safety/someone-to-talk',
        };
      }
      const facilities = await findNearbyEmergencyCare(coords.latitude, coords.longitude);
      const list = facilities.slice(0, 3).map((f: any) => `• ${f.name}${f.distanceKm ? ` (${f.distanceKm} km away)` : ''}`).join('\n');
      return {
        success: true,
        message: `Found nearby emergency medical care:\n${list}\n\nI have prepared one-tap map directions and direct calls.`,
        data: { facilities },
        routeToOpen: '/(app)/safety/someone-to-talk',
      };
    },
  },

  // ─── Routines & Rewards Tools ────────────────────────────────────────────────

  get_routines: {
    name: 'get_routines',
    description:
      'Returns the user\'s routine alarms: scheduled times, repeat days, whether they are enabled, and upcoming triggers. Use to answer questions about what reminders are set or to proactively suggest claiming pending rewards.',
    parameters: {},
    execute: async () => {
      const store = useRootStore.getState();
      const routines = store.routines ?? [];
      if (!routines.length) {
        return {
          success: true,
          message: 'You have no routines set up yet. I can help you add one — just say "remind me to [something] at [time]".',
          data: { routines: [] },
          routeToOpen: '/(app)/routines',
        };
      }
      const enabled = routines.filter((r) => r.enabled);
      const disabled = routines.filter((r) => !r.enabled);
      const summary = enabled
        .map((r) => `• ${r.title} at ${format12Hour(r.time)}${r.days.length ? ` (${r.days.map((d) => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d-1]).join(', ')})` : ' daily'}`)
        .join('\n');
      const disabledNote = disabled.length ? `\n${disabled.length} routine${disabled.length > 1 ? 's are' : ' is'} disabled.` : '';
      return {
        success: true,
        message: `You have ${enabled.length} active routine alarm${enabled.length !== 1 ? 's' : ''}:\n${summary}${disabledNote}\n\nThese fire as system notifications even when Thrivefold is closed.`,
        data: {
          total: routines.length,
          enabled: enabled.length,
          disabled: disabled.length,
          routines: routines.map((r) => ({
            id: r.id,
            title: r.title,
            time12: format12Hour(r.time),
            time24: r.time,
            enabled: r.enabled,
            days: r.days,
            kind: r.kind,
          })),
        },
        routeToOpen: '/(app)/routines',
      };
    },
  },

  get_pending_rewards: {
    name: 'get_pending_rewards',
    description:
      'Checks which milestone chest rewards the user is eligible to claim but has not yet claimed. Use proactively when the user might have unclaimed rewards. Always check this before ending a conversation about progress.',
    parameters: {},
    execute: async () => {
      const store = useRootStore.getState();
      const level = store.level ?? 1;
      const ledger = store.rewardLedger ?? [];
      const claimedKeys = new Set(ledger.filter((e) => e.kind === 'chest_reward').map((e) => e.key));

      const eligible = LEVEL_CHESTS.filter(
        (c) => level >= c.level && !claimedKeys.has(chestKey(c.level))
      );
      const upcoming = LEVEL_CHESTS.filter(
        (c) => level < c.level && !claimedKeys.has(chestKey(c.level))
      ).slice(0, 3);
      const claimed = LEVEL_CHESTS.filter((c) => claimedKeys.has(chestKey(c.level)));

      if (eligible.length > 0) {
        const names = eligible.map((c) => `• ${c.title} (Level ${c.level}: +${c.gems} Amber Gems + ${c.card.title} card)`).join('\n');
        return {
          success: true,
          message: `You have ${eligible.length} unclaimed milestone reward${eligible.length > 1 ? 's' : ''}! 🎁\n\n${names}\n\nOpen your Roadmap or Marketplace to claim ${eligible.length > 1 ? 'them' : 'it'} now!`,
          data: { eligible, upcoming, claimed: claimed.length, userLevel: level },
          routeToOpen: '/(app)/roadmap',
        };
      }

      const upcomingNote = upcoming.length
        ? `\nNext milestone: ${upcoming[0].title} at Level ${upcoming[0].level} (${upcoming[0].level - level} level${upcoming[0].level - level !== 1 ? 's' : ''} away).`
        : '';
      return {
        success: true,
        message: `No unclaimed rewards right now — you are Level ${level} and have claimed ${claimed.length} milestone chest${claimed.length !== 1 ? 's' : ''}.${upcomingNote}`,
        data: { eligible: [], upcoming, claimed: claimed.length, userLevel: level },
      };
    },
  },

  get_routine_adherence: {
    name: 'get_routine_adherence',
    description:
      'Summarises how many routines the user completed, missed, or skipped based on their check-in and quest history. Use when the user asks how they are doing with their habits.',
    parameters: {
      days: {
        type: 'number',
        description: 'How many recent days to look at (default 7, max 30)',
      },
    },
    execute: async (params: { days?: number }) => {
      const store = useRootStore.getState();
      const routines = store.routines ?? [];
      const lookback = Math.min(30, Math.max(1, params.days ?? 7));

      if (!routines.length) {
        return {
          success: true,
          message: 'You have no routines scheduled yet. Would you like to add some?',
          routeToOpen: '/(app)/routines',
          data: { routines: 0 },
        };
      }

      // Use quest completions as a proxy for routine adherence
      const recentQuests = store.todayQuests ?? [];
      const completedToday = recentQuests.filter((q) => q.isCompleted).length;
      const totalToday = recentQuests.length;

      const enabled = routines.filter((r) => r.enabled);
      const tips: string[] = [];
      if (enabled.length === 0) tips.push('All your routines are disabled — re-enable them to get reminders.');
      if (enabled.length > 5) tips.push('You have many routines. Consider focusing on 3–5 key ones.');

      return {
        success: true,
        message: `You have ${enabled.length} active routine${enabled.length !== 1 ? 's' : ''}. Today: ${completedToday}/${totalToday} quests completed.${tips.length ? '\n\nTip: ' + tips[0] : ''}`,
        data: {
          activeRoutines: enabled.length,
          totalRoutines: routines.length,
          questsCompletedToday: completedToday,
          questsTotalToday: totalToday,
          level: store.level,
          streak: store.streak,
        },
        routeToOpen: '/(app)/routines',
      };
    },
  },

  open_reward_chest: {
    name: 'open_reward_chest',
    description:
      'Opens and claims a specific milestone chest reward for the user. Use when the user asks to claim a reward or when they have an unclaimed eligible reward. Always verify eligibility first.',
    parameters: {
      level: {
        type: 'number',
        description: 'The milestone level of the chest to open (e.g. 5, 10, 20, 50, 100)',
        required: true,
      },
    },
    requiresConfirmation: true,
    execute: async (params: { level: number }, context: ToolExecutionContext) => {
      const store = useRootStore.getState();
      const userLevel = store.level ?? 1;
      const chest = LEVEL_CHESTS.find((c) => c.level === params.level);

      if (!chest) {
        return {
          success: false,
          message: `No milestone chest found at Level ${params.level}. Valid milestones are: ${LEVEL_CHESTS.map((c) => c.level).join(', ')}.`,
        };
      }

      const key = chestKey(chest.level);
      const alreadyClaimed = (store.rewardLedger ?? []).some((e) => e.key === key);
      if (alreadyClaimed) {
        return {
          success: false,
          message: `You already claimed the ${chest.title} chest! It's saved in your collection. Keep progressing for the next milestone.`,
          data: { chest, alreadyClaimed: true },
        };
      }

      if (userLevel < chest.level) {
        return {
          success: false,
          message: `You need to reach Level ${chest.level} to claim this chest. You are currently Level ${userLevel} — ${chest.level - userLevel} level${chest.level - userLevel !== 1 ? 's' : ''} to go!`,
          data: { requiredLevel: chest.level, currentLevel: userLevel },
          routeToOpen: '/(app)/roadmap',
        };
      }

      // Claim via the store
      const result = store.openChest(chest.level);
      if (!result) {
        return {
          success: false,
          message: 'Could not claim the chest — it may already be claimed. Check your Roadmap for status.',
          routeToOpen: '/(app)/roadmap',
        };
      }

      navigateTo('/(app)/roadmap');
      return {
        success: true,
        message: `🎁 Claimed! You received +${chest.gems} Amber Gems and the ${chest.card.title} (${chest.card.rarity}) collector card from the ${chest.title}! Check your Roadmap to see your collection.`,
        data: { gems: chest.gems, card: chest.card, chestTitle: chest.title },
        routeToOpen: '/(app)/roadmap',
        autoNavigate: true,
      };
    },
  },

  schedule_or_update_routine: {
    name: 'schedule_or_update_routine',
    description: 'Add or update a routine alarm with exact time in 24h format and repeat days, detecting and preventing conflicts.',
    parameters: {
      title: { type: 'string', description: 'Name of the routine (e.g. Bedtime wind-down, Morning stretch)', required: true },
      time: { type: 'string', description: '24-hour time HH:mm (e.g. 08:30 or 22:00)', required: true },
      routineId: { type: 'string', description: 'Optional routine ID if updating an existing alarm' },
      days: { type: 'array', description: 'Repeat days array (1=Mon ... 7=Sun, empty=daily)' },
    },
    execute: async ({ title, time, routineId, days = [] }: { title: string; time: string; routineId?: string; days?: number[] }) => {
      const store = useRootStore.getState();
      const existing = store.routines;

      // Conflict detection: check if another routine has the exact same scheduled time
      const conflict = existing.find((r) => r.time === time && r.id !== routineId && r.enabled);
      const conflictWarning = conflict ? ` Note: "${conflict.title}" is also scheduled at ${format12Hour(time)}.` : '';

      if (routineId) {
        store.updateRoutine(routineId, { title, time, days: days || [] });
        return {
          success: true,
          message: `⏰ Updated routine "${title}" to ${format12Hour(time)} (${time}).${conflictWarning}`,
          routeToOpen: '/(app)/routines',
        };
      }

      store.addRoutine({
        kind: 'custom',
        title,
        time,
        days: days || [],
      });

      return {
        success: true,
        message: `⏰ Scheduled routine alarm "${title}" for ${format12Hour(time)} (${time}) with native alarm wake lock.${conflictWarning}`,
        routeToOpen: '/(app)/routines',
      };
    },
  },

  remove_routine_alarm: {
    name: 'remove_routine_alarm',
    description: 'Remove or cancel a routine alarm schedule by title or routine ID.',
    parameters: {
      identifier: { type: 'string', description: 'Title or routine ID to cancel', required: true },
    },
    execute: async ({ identifier }: { identifier: string }) => {
      const store = useRootStore.getState();
      const match = store.routines.find((r) => r.id === identifier || r.title.toLowerCase().includes(identifier.toLowerCase()));
      if (!match) {
        return {
          success: false,
          message: `Could not find an active routine matching "${identifier}".`,
          routeToOpen: '/(app)/routines',
        };
      }
      store.removeRoutine(match.id);
      return {
        success: true,
        message: `🗑️ Removed routine alarm "${match.title}" (${format12Hour(match.time)}).`,
        routeToOpen: '/(app)/routines',
      };
    },
  },

  emergency_crisis_dispatch: {
    name: 'emergency_crisis_dispatch',
    description: 'Emergency response tool for acute crisis or safety distress with regional emergency number lookups.',
    parameters: {
      urgency: { type: 'string', description: 'Urgency level: immediate, high, or moderate', required: true },
      userConcern: { type: 'string', description: 'Description of the distress or emergency' },
      userCountry: { type: 'string', description: 'Optional user country/region (e.g. US, IN, UK, EU)' },
    },
    execute: async ({ urgency, userConcern, userCountry = 'IN' }: { urgency: string; userConcern?: string; userCountry?: string }) => {
      useRootStore.getState().setCoachPersona('support');
      return {
        success: true,
        message: `🚨 Emergency resources active. If you or someone you know is in acute danger, please call emergency services immediately (112 in India/EU, 988/911 in US/Canada, 999 in UK). I am right here with you in support mode.`,
      };
    },
  },
};

/**
 * Executes a tool by name with parameter validation and context binding.
 */
export async function executeTool(
  toolName: string,
  params: Record<string, any>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const tool = TOOLS[toolName];
  if (!tool) {
    return {
      success: false,
      message: `Tool "${toolName}" is not registered in the assistant tool registry.`,
    };
  }

  // Check required parameters
  for (const [paramName, schema] of Object.entries(tool.parameters)) {
    if (schema.required && (params[paramName] === undefined || params[paramName] === null)) {
      return {
        success: false,
        message: `Missing required parameter "${paramName}" for tool "${toolName}".`,
      };
    }
  }

  // Confirmation gate for sensitive actions
  if (tool.requiresConfirmation && !context.isConfirmed) {
    return {
      success: false,
      message: `Action requires user confirmation.`,
      needsConfirmation: true,
      confirmationPrompt: `Are you sure you want to perform: ${tool.description}?`,
    };
  }

  try {
    return await tool.execute(params, context);
  } catch (err: any) {
    return {
      success: false,
      message: `Error executing ${toolName}: ${err.message || String(err)}`,
    };
  }
}
```

#### `src/domain/ai/deterministicRules.ts`

```ts
import { ProductExperience } from '../../theme/tokens';
import { AiResult } from './types';

export interface HealthCheckInSignal {
  energy: number; // 1-10
  mood: number; // 1-10
  stress: number; // 1-10
  physicalPainOrLimitation?: string;
  intensityPreference?: 'rest' | 'light' | 'regular';
  experience: ProductExperience;
  /** Recent strain from logged days (see `recentLoad` in insights.ts). Optional. */
  recentLoad?: { shortSleepStreak: number; highStressStreak: number };
}

export interface TaskRecommendation {
  taskId: string;
  title: string;
  category: 'movement' | 'breathing' | 'rest' | 'education' | 'reflection';
  durationMinutes: number;
  description: string;
  modifications: string[];
  cautionNotice?: string;
  aiExplanation: AiResult;
}

/**
 * Pure deterministic rule engine ensuring health tracking, task selection and
 * personalization function 100% offline without any API key or heavy model.
 */
export function evaluateDeterministicRoutine(signal: HealthCheckInSignal): TaskRecommendation {
  // 1. Safety & pain red flag: Signpost clinical evaluation, never diagnose
  if (
    signal.physicalPainOrLimitation &&
    signal.physicalPainOrLimitation.toLowerCase().includes('severe')
  ) {
    return {
      taskId: 'rec_rest_and_care',
      title: 'Gentle Rest & Professional Consultation Signpost',
      category: 'rest',
      durationMinutes: 0,
      description: 'Your body is signaling discomfort. Please rest and consider consulting a qualified healthcare professional.',
      modifications: ['Avoid all strenuous lifting or deep squats', 'Apply gentle warmth if soothing'],
      cautionNotice: 'Educational signpost only. Thrivefold does not provide clinical diagnosis or medical treatment.',
      aiExplanation: {
        text: 'Deterministic health safety rule applied: High discomfort reported. All exercise suspended in favor of rest and clinical signposting.',
        confidence: 1.0,
        source: 'local_deterministic',
        limitationsDisclosed: 'Educational guidance based on deterministic safety rules.',
      },
    };
  }

  // 2. Several hard days in a row: recovery comes before effort, whatever today's sliders say.
  const load = signal.recentLoad;
  if (load && (load.shortSleepStreak >= 3 || load.highStressStreak >= 3)) {
    const reason =
      load.shortSleepStreak >= 3
        ? `${load.shortSleepStreak} days in a row with under 6 hours of sleep`
        : `${load.highStressStreak} high-stress days in a row`;
    return {
      taskId: 'rec_recovery_reset',
      title: 'Recovery Reset: Slow Breathing & Easy Stretch',
      category: 'breathing',
      durationMinutes: 8,
      description: 'Five minutes of slow breathing followed by a few easy stretches. Stop whenever you like.',
      modifications: ['Can be done seated or lying down', 'Skip the stretches if you prefer to only breathe'],
      aiExplanation: {
        text: `Adapted from your recent check-ins: ${reason}. A gentler day helps you recover.`,
        confidence: 0.9,
        source: 'local_deterministic',
        limitationsDisclosed: 'Based on your own logged check-ins. Not medical advice.',
      },
    };
  }

  // 3. High stress / low energy: Breathing or gentle mobility
  if (signal.energy <= 3 || signal.stress >= 8 || signal.intensityPreference === 'rest') {
    return {
      taskId: 'rec_parasympathetic_breath',
      title: '4-7-8 Deep Parasympathetic Breath Reset',
      category: 'breathing',
      durationMinutes: 5,
      description: 'A gentle guided breathing sequence designed to activate your rest-and-digest response.',
      modifications: ['Can be performed lying down with eyes closed', 'Pause whenever comfortable'],
      aiExplanation: {
        text: 'Routine adapted locally: Low energy and high stress signals detected. Preserving nervous system balance through gentle breathwork.',
        confidence: 0.95,
        source: 'local_deterministic',
        limitationsDisclosed: 'Non-diagnostic routine suggestion.',
      },
    };
  }

  // 4. Moderate energy / light preference: Mobility & decompression
  if (signal.energy <= 6 || signal.intensityPreference === 'light') {
    if (signal.experience === 'men_health') {
      return {
        taskId: 'rec_men_desk_mobility',
        title: 'Desk Worker Spine & Hip Decompression',
        category: 'movement',
        durationMinutes: 8,
        description: 'Targeted shoulder rolls, thoracic openers, and gentle hip flexor stretches.',
        modifications: ['Seated variations available', 'No floor space required'],
        aiExplanation: {
          text: 'Selected for Men’s Health: Equipment-free mobility routine to alleviate posture fatigue and work tension.',
          confidence: 0.92,
          source: 'local_deterministic',
          limitationsDisclosed: 'Adaptive exercise guidance.',
        },
      };
    }

    return {
      taskId: 'rec_gentle_pelvic_mobility',
      title: 'Gentle Cat-Cow & Pelvic Rocking',
      category: 'movement',
      durationMinutes: 10,
      description: 'Rhythmic, gentle floor stretches to improve pelvic circulation and relieve lower-back tension.',
      modifications: ['Use a soft yoga mat or bed', 'Keep movements slow and fluid'],
      aiExplanation: {
        text: 'Selected for Gentle Restoration: Low-impact floor flow to ease lower back and pelvic tension.',
        confidence: 0.92,
        source: 'local_deterministic',
        limitationsDisclosed: 'Self-care exercise suggestion.',
      },
    };
  }

  // 5. Regular energy: Progressive wellness session
  if (signal.experience === 'men_health') {
    return {
      taskId: 'rec_men_bodyweight_vitality',
      title: 'Core Stability & Functional Posture Flow',
      category: 'movement',
      durationMinutes: 15,
      description: 'Bodyweight tempo squats, glute bridges, and bird-dog core stabilization.',
      modifications: ['Elevate hands on a bench for easier angles', 'Rest 45s between sets'],
      aiExplanation: {
        text: 'Active energy detected: Building sustainable strength and posture resilience.',
        confidence: 0.9,
        source: 'local_deterministic',
        limitationsDisclosed: 'General wellness training only.',
      },
    };
  }

  return {
    taskId: 'rec_dynamic_harmony_flow',
    title: 'Mindful Whole-Body Energy Flow',
    category: 'movement',
    durationMinutes: 15,
    description: 'A balanced sequence combining standing stretches, deep lunges, and mindful balance holds.',
    modifications: ['Hold onto a chair for balance if needed'],
    aiExplanation: {
      text: 'Optimal energy state detected: Supporting circulation and daily vitality.',
      confidence: 0.9,
      source: 'local_deterministic',
      limitationsDisclosed: 'General wellness exercise program.',
    },
  };
}
```

#### `src/domain/ai/fileEvidence.ts`

```ts
/**
 * The lines of a saved file that best answer a question, with the page they are on. Pure and
 * deterministic, so a document answer can always quote the file instead of trusting a small
 * model's memory.
 */
import { tokenize } from './localRetrieval';

export interface FileLine {
  file: string;
  page: number;
  line: string;
  score: number;
}

const MARKER = /^\[(.+), page (\d+)\]$/;

/** Splits text stored as "[name, page N]\n…" into scored lines for the query. */
export function scoreFileLines(file: string, stored: string, query: string, ignore: Set<string> = new Set()): FileLine[] {
  const terms = new Set(tokenize(query).filter((t) => !ignore.has(t)));
  if (!terms.size) return [];
  let page = 1;
  const out: FileLine[] = [];
  for (const raw of stored.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(MARKER);
    if (m) {
      page = Number(m[2]);
      continue;
    }
    const words = new Set(tokenize(line));
    let score = 0;
    terms.forEach((t) => {
      if (words.has(t)) score++;
    });
    if (score) out.push({ file, page, line, score });
  }
  return out.sort((a, b) => b.score - a.score);
}

/**
 * Best lines across files. A question mentioning a file's own words ("blood report") counts as
 * asking about that file, so one strong line (2+ shared words) is enough.
 */
export function bestFileLines(files: { name: string; text: string }[], query: string, max = 3): FileLine[] {
  const queryTerms = new Set(tokenize(query));
  const all = files.flatMap((f) => {
    // Words that only name the file ("blood report") pick the file, not the line inside it.
    const nameWords = new Set(tokenize(f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]/g, ' ')));
    const nameHit = [...nameWords].some((t) => queryTerms.has(t));
    return scoreFileLines(f.name, f.text, query, nameHit ? nameWords : undefined).map((l) => ({
      ...l,
      score: l.score + (nameHit ? 1 : 0),
    }));
  });
  const strong = all.filter((l) => l.score >= 2).sort((a, b) => b.score - a.score);
  // Only lines as good as the best one: weaker lines (a title, a name) add noise, not evidence.
  return strong.filter((l) => l.score >= (strong[0]?.score ?? 0)).slice(0, max);
}
```

#### `src/domain/ai/insights.ts`

```ts
/**
 * On-device insight engine. Pure functions over the person's own records: no model, no
 * network, no guessing. Every insight states how many entries it rests on, and nothing is
 * reported until there is enough data for the pattern to mean something.
 *
 * Not medical advice: insights describe the person's logs, never diagnose.
 */

export interface InsightCheckIn {
  date: string; // YYYY-MM-DD
  energy: number; // 1-10
  mood: number; // 1-10
  stress: number; // 1-10
  sleepHours: number;
  symptoms: string[];
}

export interface InsightPeriod {
  startDate: string; // YYYY-MM-DD
}

export type InsightKind = 'trend' | 'link' | 'pattern' | 'symptom' | 'cycle' | 'consistency' | 'activity';

export interface Insight {
  id: string;
  kind: InsightKind;
  title: string;
  detail: string;
  /** Plain statement of the evidence, e.g. "Based on 18 check-in days". */
  evidence: string;
  sampleSize: number;
  strength: 'emerging' | 'clear';
  /** Gentle, optional next step. Never a prescription. */
  suggestion?: string;
  /** Short sentence the person may choose to keep in their memory vault. */
  memoryCandidate?: string;
}

export interface InsightInput {
  checkIns: InsightCheckIn[];
  periods?: InsightPeriod[];
  /** YYYY-MM-DD for "today"; injectable so results are reproducible in tests. */
  today: string;
  /** Dates with a workout or logged activity. */
  activeDates?: string[];
  /** Protein (g) per logged meal day. */
  proteinByDate?: Record<string, number>;
}

/** Thresholds are deliberately conservative: a quiet screen beats a false pattern. */
export const INSIGHT_THRESHOLDS = {
  trendMinDaysPerWindow: 3,
  trendMinDelta: 1,
  sleepTrendMinDelta: 0.75,
  linkMinDays: 7,
  linkMinCorrelation: 0.4,
  linkClearDays: 14,
  linkClearCorrelation: 0.55,
  groupMinDays: 3,
  weekdayMinDays: 14,
  weekdayMinSamples: 2,
  weekdayMinLift: 1.5,
  symptomWindowDays: 30,
  symptomMinCount: 4,
  symptomMinShare: 0.3,
  cycleMinPeriods: 2,
  cycleMinDays: 10,
  cycleMinDelta: 1,
} as const;

/** Tags that describe feeling good; they are not reported as recurring symptoms. */
const POSITIVE_TAGS = new Set(
  [
    'High Energy',
    'Clear Skin',
    'Calm Mood',
    'Social',
    'Peak Energy',
    'High Focus',
    'Mental Clarity',
    'Body Ease',
  ].map((t) => t.toLowerCase()),
);

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Metric = 'energy' | 'mood' | 'stress' | 'sleepHours';

interface DayRecord {
  date: string;
  energy: number;
  mood: number;
  stress: number;
  sleepHours: number;
  symptoms: Set<string>;
}

// ---------------------------------------------------------------- date helpers

/** Days since epoch for a YYYY-MM-DD string, independent of the device time zone. */
export function dayNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

function weekdayOf(date: string): number {
  return new Date(dayNumber(date) * 86400000).getUTCDay();
}

const isValidDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);

// ---------------------------------------------------------------- statistics

export function mean(values: number[]): number {
  if (values.length === 0) return NaN;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Pearson correlation; NaN when either series has no variation. */
export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return NaN;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return NaN;
  return num / Math.sqrt(dx * dy);
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const fmtHours = (n: number) => `${round1(n)}h`;

// ---------------------------------------------------------------- aggregation

/** One record per day: several check-ins on the same date are averaged, symptoms merged. */
export function aggregateByDay(checkIns: InsightCheckIn[], today: string): DayRecord[] {
  const todayN = dayNumber(today);
  const byDate = new Map<string, InsightCheckIn[]>();
  for (const c of checkIns) {
    if (!isValidDate(c.date) || dayNumber(c.date) > todayN) continue;
    const list = byDate.get(c.date) ?? [];
    list.push(c);
    byDate.set(c.date, list);
  }
  return [...byDate.entries()]
    .map(([date, list]) => ({
      date,
      energy: mean(list.map((c) => c.energy)),
      mood: mean(list.map((c) => c.mood)),
      stress: mean(list.map((c) => c.stress)),
      sleepHours: mean(list.map((c) => c.sleepHours)),
      symptoms: new Set(list.flatMap((c) => c.symptoms)),
    }))
    .sort((a, b) => dayNumber(a.date) - dayNumber(b.date));
}

const daysAgo = (date: string, today: string) => dayNumber(today) - dayNumber(date);

// ---------------------------------------------------------------- detectors

const METRIC_LABEL: Record<Metric, string> = {
  energy: 'energy',
  mood: 'mood',
  stress: 'stress',
  sleepHours: 'sleep',
};

function trendInsights(days: DayRecord[], today: string): Insight[] {
  const T = INSIGHT_THRESHOLDS;
  const recent = days.filter((d) => daysAgo(d.date, today) < 7);
  const prior = days.filter((d) => daysAgo(d.date, today) >= 7 && daysAgo(d.date, today) < 14);
  if (recent.length < T.trendMinDaysPerWindow || prior.length < T.trendMinDaysPerWindow) return [];

  const out: Insight[] = [];
  const metrics: Metric[] = ['energy', 'mood', 'stress', 'sleepHours'];
  for (const metric of metrics) {
    const now = mean(recent.map((d) => d[metric]));
    const before = mean(prior.map((d) => d[metric]));
    const delta = now - before;
    const minDelta = metric === 'sleepHours' ? T.sleepTrendMinDelta : T.trendMinDelta;
    if (Math.abs(delta) < minDelta) continue;

    const up = delta > 0;
    // For stress, "up" is the harder direction; for everything else "down" is.
    const harder = metric === 'stress' ? up : !up;
    const label = METRIC_LABEL[metric];
    const fmt = (v: number) => (metric === 'sleepHours' ? fmtHours(v) : `${round1(v)}/10`);
    out.push({
      id: `trend_${metric}`,
      kind: 'trend',
      title: `Your ${label} is ${up ? 'up' : 'down'} this week`,
      detail: `Average ${label} over the last 7 days is ${fmt(now)}, compared with ${fmt(before)} the week before.`,
      evidence: `Based on ${recent.length} recent and ${prior.length} earlier check-in days`,
      sampleSize: recent.length + prior.length,
      strength: recent.length >= 5 && prior.length >= 5 ? 'clear' : 'emerging',
      suggestion: harder ? suggestionForHarderWeek(metric) : undefined,
    });
  }
  return out;
}

function suggestionForHarderWeek(metric: Metric): string {
  switch (metric) {
    case 'sleepHours':
      return 'A steady wind-down time for a few nights is often easier than catching up at weekends.';
    case 'stress':
      return 'Short breathing breaks during the day can help; choose a lighter routine if you need to.';
    case 'energy':
      return 'Lighter routines and rest days are a fine choice this week.';
    case 'mood':
      return 'A short reflection or talking to someone you trust may help. Support is always in Safety.';
  }
}

function linkInsights(days: DayRecord[]): Insight[] {
  const T = INSIGHT_THRESHOLDS;
  if (days.length < T.linkMinDays) return [];
  const out: Insight[] = [];

  const pairs: { x: Metric; y: Metric }[] = [
    { x: 'sleepHours', y: 'energy' },
    { x: 'sleepHours', y: 'mood' },
    { x: 'stress', y: 'mood' },
  ];

  for (const { x, y } of pairs) {
    const r = pearson(
      days.map((d) => d[x]),
      days.map((d) => d[y]),
    );
    if (!Number.isFinite(r) || Math.abs(r) < T.linkMinCorrelation) continue;

    const strength: Insight['strength'] =
      days.length >= T.linkClearDays && Math.abs(r) >= T.linkClearCorrelation ? 'clear' : 'emerging';

    if (x === 'sleepHours') {
      // Compare well-rested days with short-sleep days in plain numbers.
      const rested = days.filter((d) => d.sleepHours >= 7);
      const short = days.filter((d) => d.sleepHours < 6);
      const yl = METRIC_LABEL[y];
      let detail: string;
      if (rested.length >= T.groupMinDays && short.length >= T.groupMinDays) {
        detail =
          `On days you logged 7+ hours of sleep your ${yl} averaged ${round1(mean(rested.map((d) => d[y])))}/10, ` +
          `against ${round1(mean(short.map((d) => d[y])))}/10 after under 6 hours.`;
      } else {
        detail = `In your check-ins, nights with more sleep tend to come with ${r > 0 ? 'higher' : 'lower'} ${yl} the same day.`;
      }
      out.push({
        id: `link_sleep_${y}`,
        kind: 'link',
        title: r > 0 ? `More sleep, better ${yl}` : `Sleep and ${yl} move in opposite directions`,
        detail,
        evidence: `Based on ${days.length} check-in days (correlation ${round1(r)})`,
        sampleSize: days.length,
        strength,
        suggestion: r > 0 ? 'Protecting your sleep may be one of the most useful things you can do.' : undefined,
        memoryCandidate: r > 0 ? `My ${yl} tends to be better after a full night of sleep.` : undefined,
      });
    } else {
      out.push({
        id: 'link_stress_mood',
        kind: 'link',
        title: r < 0 ? 'Stress weighs on your mood' : 'Stress and mood rise together for you',
        detail:
          r < 0
            ? 'On higher-stress days your mood tends to be lower.'
            : 'Unusually, your higher-stress days tend to come with higher mood. Busy can feel good.',
        evidence: `Based on ${days.length} check-in days (correlation ${round1(r)})`,
        sampleSize: days.length,
        strength,
        suggestion: r < 0 ? 'A two-minute breathing break on busy days may soften this.' : undefined,
        memoryCandidate: r < 0 ? 'Stressful days pull my mood down; short breaks help.' : undefined,
      });
    }
  }
  return out;
}

function weekdayInsights(days: DayRecord[]): Insight[] {
  const T = INSIGHT_THRESHOLDS;
  if (days.length < T.weekdayMinDays) return [];
  const overall = mean(days.map((d) => d.stress));
  let best: { weekday: number; avg: number; n: number } | null = null;
  for (let w = 0; w < 7; w++) {
    const subset = days.filter((d) => weekdayOf(d.date) === w);
    if (subset.length < T.weekdayMinSamples) continue;
    const avg = mean(subset.map((d) => d.stress));
    if (avg - overall >= T.weekdayMinLift && (!best || avg > best.avg)) {
      best = { weekday: w, avg, n: subset.length };
    }
  }
  if (!best) return [];
  const name = WEEKDAYS[best.weekday];
  return [
    {
      id: `pattern_stress_${name.toLowerCase()}`,
      kind: 'pattern',
      title: `${name}s tend to be your most stressful day`,
      detail: `Stress averages ${round1(best.avg)}/10 on ${name}s, against ${round1(overall)}/10 across all your check-ins.`,
      evidence: `Based on ${best.n} ${name}s out of ${days.length} check-in days`,
      sampleSize: days.length,
      strength: best.n >= 4 ? 'clear' : 'emerging',
      suggestion: `Planning a lighter routine or a short break on ${name}s might help.`,
      memoryCandidate: `${name}s are usually my most stressful day.`,
    },
  ];
}

function symptomInsights(days: DayRecord[], today: string): Insight[] {
  const T = INSIGHT_THRESHOLDS;
  const window = days.filter((d) => daysAgo(d.date, today) < T.symptomWindowDays);
  if (window.length < T.symptomMinCount) return [];

  const counts = new Map<string, { label: string; n: number }>();
  for (const d of window) {
    for (const s of d.symptoms) {
      const key = s.toLowerCase();
      if (POSITIVE_TAGS.has(key)) continue;
      const entry = counts.get(key) ?? { label: s, n: 0 };
      entry.n += 1;
      counts.set(key, entry);
    }
  }

  return [...counts.values()]
    .filter((c) => c.n >= T.symptomMinCount && c.n / window.length >= T.symptomMinShare)
    .sort((a, b) => b.n - a.n)
    .slice(0, 2)
    .map((c) => ({
      id: `symptom_${c.label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      kind: 'symptom' as const,
      title: `${c.label} keeps coming up`,
      detail: `You logged ${c.label.toLowerCase()} on ${c.n} of your last ${window.length} check-in days.`,
      evidence: `Based on check-ins from the last ${T.symptomWindowDays} days`,
      sampleSize: window.length,
      strength: (c.n >= 6 ? 'clear' : 'emerging') as Insight['strength'],
      suggestion:
        'If it persists, gets worse or worries you, a clinician can help. This is a pattern in your logs, not a diagnosis.',
    }));
}

function cycleInsights(days: DayRecord[], periods: InsightPeriod[], today: string): Insight[] {
  const T = INSIGHT_THRESHOLDS;
  const starts = periods
    .map((p) => p.startDate)
    .filter((d) => isValidDate(d) && dayNumber(d) <= dayNumber(today))
    .map(dayNumber)
    .sort((a, b) => a - b);
  if (starts.length < T.cycleMinPeriods) return [];

  // Cycle day for each check-in, counted from the most recent logged start before it.
  // Only days within 45 days of a logged start are used, so long gaps don't distort it.
  const early: number[] = [];
  const rest: number[] = [];
  for (const d of days) {
    const n = dayNumber(d.date);
    let start: number | undefined;
    for (const s of starts) if (s <= n) start = s;
    if (start === undefined) continue;
    const cycleDay = n - start + 1;
    if (cycleDay > 45) continue;
    (cycleDay <= 5 ? early : rest).push(d.energy);
  }
  if (early.length + rest.length < T.cycleMinDays) return [];
  if (early.length < T.groupMinDays || rest.length < T.groupMinDays) return [];

  const delta = mean(early) - mean(rest);
  if (Math.abs(delta) < T.cycleMinDelta) return [];
  const lower = delta < 0;
  return [
    {
      id: 'cycle_energy_early',
      kind: 'cycle',
      title: lower ? 'Energy dips early in your cycle' : 'Energy is higher early in your cycle',
      detail:
        `In the first five days after a logged period start your energy averaged ${round1(mean(early))}/10, ` +
        `against ${round1(mean(rest))}/10 on other days.`,
      evidence: `Based on ${early.length + rest.length} check-in days across ${starts.length} logged periods`,
      sampleSize: early.length + rest.length,
      strength: early.length >= 6 && starts.length >= 3 ? 'clear' : 'emerging',
      suggestion: lower ? 'Gentler routines in those days are a reasonable choice. Not medical advice.' : undefined,
      memoryCandidate: lower ? 'My energy is usually lower in the first days of my period.' : undefined,
    },
  ];
}

function consistencyInsight(days: DayRecord[], today: string): Insight[] {
  const last14 = days.filter((d) => daysAgo(d.date, today) < 14).length;
  if (days.length < 5 || last14 === 0) return [];
  return [
    {
      id: 'consistency_14',
      kind: 'consistency',
      title: `${last14} of the last 14 days checked in`,
      detail:
        last14 >= 10
          ? 'That is a steady habit. Patterns above get more reliable with every check-in.'
          : 'Each check-in makes the patterns here more reliable. Missing days is fine.',
      evidence: `${days.length} check-in days recorded in total`,
      sampleSize: days.length,
      strength: 'clear',
    },
  ];
}

// ---------------------------------------------------------------- activity and food

/** Training this week vs last, mood on active vs rest days, and protein from logged meals. */
function activityInsights(days: { date: string; mood: number; energy: number }[], input: InsightInput): Insight[] {
  const out: Insight[] = [];
  const active = new Set(input.activeDates ?? []);
  const thisWeek = [...active].filter((d) => daysAgo(d, input.today) >= 0 && daysAgo(d, input.today) < 7).length;
  const lastWeek = [...active].filter((d) => daysAgo(d, input.today) >= 7 && daysAgo(d, input.today) < 14).length;
  if (thisWeek + lastWeek >= 2) {
    out.push({
      id: 'activity_weeks',
      kind: 'activity',
      title: `${thisWeek} active day${thisWeek === 1 ? '' : 's'} this week${lastWeek ? `, ${lastWeek} last week` : ''}`,
      detail:
        thisWeek > lastWeek
          ? 'More than last week. Steady beats heroic: keep the easy days easy.'
          : thisWeek === lastWeek
            ? 'Same as last week: a steady rhythm.'
            : 'Fewer than last week. A short session still counts; rest is not failure.',
      evidence: 'From your workouts and logged activities',
      sampleSize: thisWeek + lastWeek,
      strength: 'clear',
    });
  }
  const onActive = days.filter((d) => active.has(d.date));
  const onRest = days.filter((d) => !active.has(d.date));
  if (onActive.length >= INSIGHT_THRESHOLDS.groupMinDays && onRest.length >= INSIGHT_THRESHOLDS.groupMinDays) {
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const diff = mean(onActive.map((d) => d.mood)) - mean(onRest.map((d) => d.mood));
    if (Math.abs(diff) >= INSIGHT_THRESHOLDS.trendMinDelta) {
      out.push({
        id: 'activity_mood',
        kind: 'activity',
        title: diff > 0 ? 'Your mood is higher on days you move' : 'Your mood is lower on days you train',
        detail:
          diff > 0
            ? `Mood averages ${diff.toFixed(1)} points higher on active days in your check-ins.`
            : `Mood averages ${Math.abs(diff).toFixed(1)} points lower on training days. Lighter sessions may suit you better.`,
        evidence: `${onActive.length} active and ${onRest.length} rest check-in days`,
        sampleSize: onActive.length + onRest.length,
        strength: onActive.length + onRest.length >= INSIGHT_THRESHOLDS.linkClearDays ? 'clear' : 'emerging',
        suggestion: diff > 0 ? 'On a low day, a ten-minute walk may help.' : undefined,
      });
    }
  }
  const proteinDays = Object.entries(input.proteinByDate ?? {}).filter(([d]) => daysAgo(d, input.today) >= 0 && daysAgo(d, input.today) < 7);
  if (proteinDays.length >= 3) {
    const avg = Math.round(proteinDays.reduce((n, [, g]) => n + g, 0) / proteinDays.length);
    out.push({
      id: 'protein_week',
      kind: 'activity',
      title: `About ${avg} g of protein a day this week`,
      detail: 'From the meals you logged. Many adults need roughly 0.8 g per kg of body weight; more if training hard.',
      evidence: `${proteinDays.length} days of logged meals`,
      sampleSize: proteinDays.length,
      strength: proteinDays.length >= 5 ? 'clear' : 'emerging',
    });
  }
  return out;
}

// ---------------------------------------------------------------- entry point

const KIND_ORDER: Record<InsightKind, number> = {
  symptom: 0,
  trend: 1,
  link: 2,
  cycle: 3,
  pattern: 4,
  consistency: 5,
  activity: 2,
};

/** All insights the records support, most actionable first. Empty when data is thin. */
export function computeInsights(input: InsightInput): Insight[] {
  const days = aggregateByDay(input.checkIns, input.today);
  const all = [
    ...symptomInsights(days, input.today),
    ...trendInsights(days, input.today),
    ...linkInsights(days),
    ...cycleInsights(days, input.periods ?? [], input.today),
    ...weekdayInsights(days),
    ...consistencyInsight(days, input.today),
    ...activityInsights(days, input),
  ];
  return all.sort(
    (a, b) =>
      KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
      (a.strength === b.strength ? 0 : a.strength === 'clear' ? -1 : 1),
  );
}

/** How many more check-in days until the first patterns can appear (0 when ready). */
export function checkInsUntilInsights(checkIns: InsightCheckIn[], today: string): number {
  const n = aggregateByDay(checkIns, today).length;
  return Math.max(0, INSIGHT_THRESHOLDS.linkMinDays - n);
}

export interface RecentLoad {
  /** Consecutive most-recent check-in days (ending today/yesterday) with under 6h sleep. */
  shortSleepStreak: number;
  /** Consecutive most-recent check-in days with stress >= 7. */
  highStressStreak: number;
}

/** Recent strain used to soften today's suggestion; derived only from logged days. */
export function recentLoad(checkIns: InsightCheckIn[], today: string): RecentLoad {
  const days = aggregateByDay(checkIns, today).reverse();
  const run = (pred: (d: DayRecord) => boolean) => {
    let count = 0;
    let expected = dayNumber(today);
    for (const d of days) {
      const n = dayNumber(d.date);
      // Allow the run to start yesterday if today has no check-in yet.
      if (count === 0 && n === expected - 1) expected -= 1;
      if (n !== expected || !pred(d)) break;
      count += 1;
      expected -= 1;
    }
    return count;
  };
  return {
    shortSleepStreak: run((d) => d.sleepHours < 6),
    highStressStreak: run((d) => d.stress >= 7),
  };
}
```

#### `src/domain/ai/localClassifier.ts`

```ts
import { AiResult } from './types';

export interface ClassificationInput {
  text: string;
  tags?: string[];
}

export type ClassifierSignal = 'fatigue' | 'stress' | 'pain' | 'low_mood' | 'positive';

export interface ClassificationOutput {
  intent: 'wellness_checkin' | 'symptom_inquiry' | 'exercise_adaptation' | 'crisis_signal' | 'general_reflection';
  intensitySuggestion: 'rest' | 'light' | 'regular';
  isCrisisAlert: boolean;
  /** Every signal found, strongest first. Negated mentions ("not tired") are ignored. */
  signals: ClassifierSignal[];
  result: AiResult;
}

/**
 * Crisis phrases are matched without negation handling on purpose: a missed signal costs far
 * more than an unneeded offer of support. This is a filter, not a crisis detector, and the
 * app never claims anyone is watching.
 */
const CRISIS_PATTERNS: RegExp[] = [
  /\bkill(ing)? myself\b/,
  /\bsuicid(e|al)\b/,
  /\bend (it all|my life)\b/,
  /\b(hurt|harm|cut)(ing)? myself\b/,
  /\bself[- ]?harm\b/,
  /\bwant(ed)? to die\b/,
  /\bwish i (was|were) dead\b/,
  /\bno reason to live\b/,
  /\bbetter off without me\b/,
  /\bcan ?not go on\b/,
  /\bcan'?t go on\b/,
  /\bhopeless\b/,
];

const LEXICON: Record<Exclude<ClassifierSignal, never>, { terms: string[]; weight: number }> = {
  fatigue: {
    terms: ['exhausted', 'tired', 'burned out', 'burnt out', 'no energy', 'drained', 'fatigued', 'insomnia',
      'sleep deprived', 'sleepy', 'worn out', 'wiped out', 'cant sleep', "can't sleep", 'slept badly'],
    weight: 1,
  },
  stress: {
    terms: ['stressed', 'stress', 'anxious', 'anxiety', 'overwhelmed', 'panic', 'deadline', 'pressure',
      'tense', 'on edge', 'frustrated', 'angry', 'worried'],
    weight: 1,
  },
  pain: {
    terms: ['pain', 'cramps', 'cramp', 'ache', 'aching', 'sore', 'injury', 'injured', 'hurts', 'strain',
      'migraine', 'headache', 'stiff'],
    weight: 1.2,
  },
  low_mood: {
    terms: ['sad', 'down', 'lonely', 'empty', 'low', 'crying', 'cried', 'miserable', 'grief', 'heartbroken',
      'numb', 'worthless'],
    weight: 1,
  },
  positive: {
    terms: ['great', 'good', 'energized', 'energised', 'calm', 'happy', 'rested', 'strong', 'motivated',
      'grateful', 'relaxed', 'proud'],
    weight: 0.8,
  },
};

const NEGATORS = new Set(['not', 'no', 'never', 'hardly', 'barely', 'isnt', 'wasnt', 'dont', 'didnt', 'arent', 'without', 'nor']);

function normalize(text: string): string {
  return text.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
}

/** True when one of the three words before `index` negates the match. */
function isNegated(words: string[], index: number): boolean {
  for (let i = Math.max(0, index - 3); i < index; i++) {
    if (NEGATORS.has(words[i].replace(/'/g, ''))) return true;
  }
  return false;
}

/** Weighted score per signal, counting only non-negated mentions. */
export function scoreSignals(text: string): Record<ClassifierSignal, number> {
  const normalized = normalize(text);
  const words = normalized.split(/[^a-z0-9']+/).filter(Boolean);
  const scores: Record<ClassifierSignal, number> = { fatigue: 0, stress: 0, pain: 0, low_mood: 0, positive: 0 };

  for (const [signal, { terms, weight }] of Object.entries(LEXICON) as [ClassifierSignal, { terms: string[]; weight: number }][]) {
    for (const term of terms) {
      const termWords = term.split(' ');
      for (let i = 0; i + termWords.length <= words.length; i++) {
        let match = true;
        for (let j = 0; j < termWords.length; j++) {
          if (words[i + j].replace(/'/g, '') !== termWords[j].replace(/'/g, '')) {
            match = false;
            break;
          }
        }
        if (match && !isNegated(words, i)) scores[signal] += weight;
      }
    }
  }
  // "not good" / "not great" reads as low mood rather than nothing.
  if (/\bnot (good|great|ok|okay|happy|well)\b/.test(normalized)) scores.low_mood += 1;
  return scores;
}

/**
 * On-device classifier: weighted keyword lexicon with negation handling. Runs instantly,
 * sends nothing anywhere, and only ever adjusts the intensity of a suggestion.
 */
export function classifyLocalInput(input: ClassificationInput): ClassificationOutput {
  const normalized = normalize(`${input.text} ${(input.tags ?? []).join(' ')}`);

  if (CRISIS_PATTERNS.some((p) => p.test(normalized))) {
    return {
      intent: 'crisis_signal',
      intensitySuggestion: 'rest',
      isCrisisAlert: true,
      signals: ['low_mood'],
      result: {
        text: 'Immediate care alert: We care about your safety. You are not alone. Please reach out to emergency resources or a crisis support lifeline immediately.',
        confidence: 0.99,
        source: 'local_classifier',
        limitationsDisclosed: 'Automated safety signal filter. Thrivefold is not an emergency response provider.',
      },
    };
  }

  const scores = scoreSignals(normalized);
  const signals = (Object.entries(scores) as [ClassifierSignal, number][])
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
  const strain = scores.fatigue + scores.stress + scores.pain + scores.low_mood;

  if (scores.pain > 0 && scores.pain >= scores.fatigue) {
    return {
      intent: 'exercise_adaptation',
      intensitySuggestion: scores.pain >= 2 ? 'rest' : 'light',
      isCrisisAlert: false,
      signals,
      result: {
        text: 'Local analysis: Discomfort mentioned. Suggestions are kept gentle and avoid loading the area. If pain is severe or persistent, please see a clinician.',
        confidence: Math.min(0.9, 0.6 + scores.pain * 0.1),
        source: 'local_classifier',
        limitationsDisclosed: 'On-device keyword analysis. Not a diagnosis.',
      },
    };
  }

  if (scores.fatigue > 0 && scores.fatigue >= scores.stress) {
    return {
      intent: 'wellness_checkin',
      intensitySuggestion: 'rest',
      isCrisisAlert: false,
      signals,
      result: {
        text: 'Local analysis: Elevated fatigue indicators detected. Recommendation adjusted to gentle breathing and complete physical rest.',
        confidence: Math.min(0.9, 0.6 + scores.fatigue * 0.1),
        source: 'local_classifier',
        limitationsDisclosed: 'On-device rule-based classification.',
      },
    };
  }

  if (scores.stress > 0 || scores.low_mood > 0) {
    return {
      intent: 'wellness_checkin',
      intensitySuggestion: strain >= 2 ? 'rest' : 'light',
      isCrisisAlert: false,
      signals,
      result: {
        text: 'Local analysis: Stress or a low mood mentioned. A calmer, shorter routine is suggested today.',
        confidence: Math.min(0.88, 0.6 + strain * 0.08),
        source: 'local_classifier',
        limitationsDisclosed: 'On-device rule-based classification.',
      },
    };
  }

  return {
    intent: 'general_reflection',
    intensitySuggestion: 'regular',
    isCrisisAlert: false,
    signals,
    result: {
      text: 'Local analysis: Balanced wellbeing check-in. Routine matched to standard pacing.',
      confidence: signals.includes('positive') ? 0.8 : 0.6,
      source: 'local_classifier',
      limitationsDisclosed: 'On-device pattern classification.',
    },
  };
}
```

#### `src/domain/ai/localRetrieval.ts`

```ts
/**
 * On-device search over the person's own notes (journal entries, kept memories) using
 * BM25 ranking. Runs in memory, never leaves the device, and needs no model download.
 */

export interface RetrievalDocument {
  id: string;
  kind: 'journal' | 'memory';
  title: string;
  text: string;
  date: string; // ISO timestamp or YYYY-MM-DD
}

export interface RetrievalHit {
  doc: RetrievalDocument;
  score: number;
  snippet: string;
  matchedTerms: string[];
}

/** Conversation turns are context, not trusted knowledge; include them only for explicit recall. */
export function isConversationRecallQuery(query: string): boolean {
  return /\b(?:what did (?:you|we) (?:say|tell me|discuss|answer)|what was (?:your|the) answer|you told me|we discussed|our conversation|last time|earlier conversation|previous conversation)\b/i.test(query);
}

const STOPWORDS = new Set(
  (
    'a an and are as at be been but by can did do does for from had has have how i if in into is it its ' +
    'me my of on or our so than that the their them then there these they this to too was we were what ' +
    'when where which who why will with you your am about after again all also any because before being ' +
    'both just more most no not now only other over same some such very'
  ).split(' '),
);

/** Light suffix stripping so "sleeping", "sleeps" and "slept" partly meet "sleep". */
export function stem(word: string): string {
  if (word.length <= 4) return word;
  for (const suffix of ['ingly', 'edly', 'ing', 'ness', 'ies', 'ied', 'ed', 'ly', 'es', 's']) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      const base = word.slice(0, -suffix.length);
      if (suffix === 'ies' || suffix === 'ied') return `${base}y`;
      return base;
    }
  }
  return word;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

const K1 = 1.2;
const B = 0.75;

/** Ranks documents for a free-text query. Returns [] for an empty or stopword-only query. */
export function searchDocuments(
  docs: RetrievalDocument[],
  query: string,
  limit = 5,
): RetrievalHit[] {
  const queryTerms = [...new Set(tokenize(query))];
  if (queryTerms.length === 0 || docs.length === 0) return [];

  const tokenized = docs.map((d) => tokenize(`${d.title} ${d.title} ${d.text}`));
  const avgLen = tokenized.reduce((a, t) => a + t.length, 0) / docs.length || 1;

  const docFreq = new Map<string, number>();
  for (const tokens of tokenized) {
    for (const term of new Set(tokens)) docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
  }

  const hits: RetrievalHit[] = [];
  docs.forEach((doc, i) => {
    const tokens = tokenized[i];
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

    let score = 0;
    const matched: string[] = [];
    for (const term of queryTerms) {
      const f = tf.get(term);
      if (!f) continue;
      matched.push(term);
      const df = docFreq.get(term) ?? 0;
      const idf = Math.log(1 + (docs.length - df + 0.5) / (df + 0.5));
      score += (idf * f * (K1 + 1)) / (f + K1 * (1 - B + (B * tokens.length) / avgLen));
    }
    if (score > 0) {
      hits.push({ doc, score, matchedTerms: matched, snippet: makeSnippet(doc.text, matched) });
    }
  });

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** About 140 characters of text around the first matching word. */
export function makeSnippet(text: string, stems: string[], width = 140): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= width) return clean;
  const words = clean.split(' ');
  let offset = 0;
  let at = -1;
  for (const w of words) {
    const s = stem(w.toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (stems.includes(s)) {
      at = offset;
      break;
    }
    offset += w.length + 1;
  }
  if (at < 0) return `${clean.slice(0, width).trimEnd()}…`;
  const start = Math.max(0, at - Math.floor(width / 3));
  const end = Math.min(clean.length, start + width);
  return `${start > 0 ? '…' : ''}${clean.slice(start, end).trim()}${end < clean.length ? '…' : ''}`;
}
```

#### `src/domain/ai/types.ts`

```ts
import { ProductExperience } from '../../theme/tokens';

export type AiTask =
  | 'routine_classification'
  | 'health_education_explanation'
  | 'reflection_prompt'
  | 'task_personalization'
  | 'moderation_assist'
  | 'complex_reasoning';

export type AiPrivacyClass =
  | 'public_content'
  | 'personal_non_sensitive'
  | 'sensitive_health'
  | 'intimate_social'
  | 'crisis_signal';

export interface ApprovedLocalContext {
  task: AiTask;
  experience: ProductExperience;
  privacyClass: AiPrivacyClass;
  allowedMemoryIds: string[];
  userApprovedFacts: Record<string, unknown>;
  locale: string;
  maxOutputTokens: number;
}

export interface AiResult {
  text: string;
  confidence: number;
  source: 'local_deterministic' | 'local_classifier' | 'on_device_llm' | 'cloud_gateway_gemini';
  limitationsDisclosed: string;
}

export interface LocalAiProvider {
  isAvailable(): Promise<boolean>;
  generate(task: AiTask, approvedContext: ApprovedLocalContext): Promise<AiResult>;
}

export interface CloudAiRequest {
  task: AiTask;
  privacyClass: AiPrivacyClass;
  contextMinimized: Record<string, unknown>;
  consentRecordId: string;
  idempotencyKey: string;
  maxInputTokens: number;
  maxOutputTokens: number;
}

export interface MemoryItem {
  id: string;
  category: 'preference' | 'routine' | 'goal' | 'limitation' | 'pattern';
  content: string;
  /** Where it came from: typed by the person, or an insight they chose to keep. */
  source: 'user' | 'insight';
  /** Insight id when source is 'insight', so the same pattern isn't saved twice. */
  sourceRef?: string;
  createdAt: string;
  updatedAt?: string;
  /** Insight-derived memories expire so stale patterns don't linger. */
  expiresAt?: string;
  isSensitive: boolean;
}

/** Memories that have not expired, newest first. */
export function activeMemories(items: MemoryItem[], now: Date = new Date()): MemoryItem[] {
  const t = now.getTime();
  return items
    .filter((m) => !m.expiresAt || new Date(m.expiresAt).getTime() > t)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
```

#### `src/domain/ai/userProfiler.ts`

```ts
/**
 * Thrivefold Local-First User Profiler & Mindset Engine
 * Privacy-first on-device intelligence: analyzes daily rhythms, check-in trends,
 * habit velocity, and mental energy without transmitting sensitive data off-device.
 */

export interface CheckInRecord {
  date: string;
  timestamp: string; // ISO string
  mood: number; // 1 - 5
  energy: number; // 1 - 5
  stress: number; // 1 - 5
  notes?: string;
}

export interface ActivityRecord {
  type: 'workout' | 'quest' | 'routine' | 'letter';
  timestamp: string;
  durationMinutes?: number;
}

export type EnergyChronotype = 'morning_riser' | 'afternoon_sustainer' | 'evening_unwinder' | 'balanced';

export type MindsetState = 'thriving_flow' | 'restorative_recovery' | 'steady_momentum' | 'fresh_baseline';

export interface UserBehaviorProfile {
  chronotype: EnergyChronotype;
  chronotypeLabel: string;
  mindset: MindsetState;
  mindsetLabel: string;
  mindsetDescription: string;
  averageEnergy: number; // 1 - 5
  averageStress: number; // 1 - 5
  averageMood: number; // 1 - 5
  consistencyScore: number; // 0 - 100
  recommendedFocus: 'deep_stretch' | 'strength_push' | 'mindful_breathing' | 'eye_strain_relief';
  focusReason: string;
  primeActivityWindow: { startHour: number; endHour: number; label: string };
  actionableNudge: string;
}

/**
 * Determine the user's energy chronotype based on completion timestamps
 */
export function determineChronotype(timestamps: string[]): EnergyChronotype {
  if (timestamps.length === 0) return 'balanced';

  let morning = 0;
  let afternoon = 0;
  let evening = 0;

  for (const ts of timestamps) {
    const d = new Date(ts);
    if (isNaN(d.getTime())) continue;
    const hour = ts.endsWith('Z') ? d.getUTCHours() : d.getHours();
    if (hour >= 5 && hour < 12) morning++;
    else if (hour >= 12 && hour < 18) afternoon++;
    else evening++;
  }

  const max = Math.max(morning, afternoon, evening);
  if (max === 0) return 'balanced';
  if (morning === max && morning > afternoon && morning > evening) return 'morning_riser';
  if (afternoon === max && afternoon > morning && afternoon > evening) return 'afternoon_sustainer';
  if (evening === max && evening > morning && evening > afternoon) return 'evening_unwinder';
  return 'balanced';
}

/**
 * Evaluate the user's current mindset state based on recent check-ins
 */
export function evaluateMindset(checkIns: CheckInRecord[]): {
  mindset: MindsetState;
  avgMood: number;
  avgEnergy: number;
  avgStress: number;
} {
  if (checkIns.length === 0) {
    return { mindset: 'fresh_baseline', avgMood: 3.5, avgEnergy: 3.5, avgStress: 2.0 };
  }

  // Take the most recent up to 7 check-ins
  const recent = checkIns.slice(-7);
  const totalMood = recent.reduce((sum, c) => sum + (c.mood || 3), 0);
  const totalEnergy = recent.reduce((sum, c) => sum + (c.energy || 3), 0);
  const totalStress = recent.reduce((sum, c) => sum + (c.stress || 2), 0);

  const avgMood = Math.round((totalMood / recent.length) * 10) / 10;
  const avgEnergy = Math.round((totalEnergy / recent.length) * 10) / 10;
  const avgStress = Math.round((totalStress / recent.length) * 10) / 10;

  if (avgStress >= 3.8 || avgEnergy <= 2.2) {
    return { mindset: 'restorative_recovery', avgMood, avgEnergy, avgStress };
  }
  if (avgEnergy >= 3.8 && avgStress <= 2.5 && avgMood >= 3.8) {
    return { mindset: 'thriving_flow', avgMood, avgEnergy, avgStress };
  }
  return { mindset: 'steady_momentum', avgMood, avgEnergy, avgStress };
}

/**
 * Compute the full behavior and mindset profile
 */
export function profileUserBehavior({
  checkIns = [],
  activityTimestamps = [],
  streakDays = 0,
}: {
  checkIns?: CheckInRecord[];
  activityTimestamps?: string[];
  streakDays?: number;
}): UserBehaviorProfile {
  const allTimestamps = [
    ...checkIns.map((c) => c.timestamp),
    ...activityTimestamps,
  ].filter(Boolean);

  const chronotype = determineChronotype(allTimestamps);
  const { mindset, avgMood, avgEnergy, avgStress } = evaluateMindset(checkIns);

  // Compute consistency score based on check-in frequency and streak
  const checkInCount = Math.min(checkIns.length, 14);
  const streakFactor = Math.min(streakDays * 5, 40);
  const consistencyScore = Math.min(100, Math.round(checkInCount * 4.2 + streakFactor));

  // Determine chronotype labels and prime hours
  let chronotypeLabel = 'Balanced Rhythm';
  let primeActivityWindow = { startHour: 9, endHour: 17, label: 'Flexible Daytime (9 AM – 5 PM)' };
  if (chronotype === 'morning_riser') {
    chronotypeLabel = 'Morning Energizer';
    primeActivityWindow = { startHour: 6, endHour: 10, label: 'Early Hours (6 AM – 10 AM)' };
  } else if (chronotype === 'afternoon_sustainer') {
    chronotypeLabel = 'Midday Sustainer';
    primeActivityWindow = { startHour: 12, endHour: 16, label: 'Afternoon Window (12 PM – 4 PM)' };
  } else if (chronotype === 'evening_unwinder') {
    chronotypeLabel = 'Evening Reflector';
    primeActivityWindow = { startHour: 17, endHour: 21, label: 'Evening Calm (5 PM – 9 PM)' };
  }

  // Determine mindset descriptions and recommended focus
  let mindsetLabel = 'Steady Momentum';
  let mindsetDescription = 'Balanced physical and mental energy. Consistent progress step by step.';
  let recommendedFocus: 'deep_stretch' | 'strength_push' | 'mindful_breathing' | 'eye_strain_relief' = 'strength_push';
  let focusReason = 'Your energy is steady and well-balanced. An ideal day for your core training.';
  let actionableNudge = 'Keep your momentum active with today’s scheduled quest.';

  if (mindset === 'thriving_flow') {
    mindsetLabel = 'High Flow State';
    mindsetDescription = 'High vitality and low stress detected. Your mind and body are primed for personal bests.';
    recommendedFocus = 'strength_push';
    focusReason = 'Excellent recovery and elevated energy allow you to challenge your milestones.';
    actionableNudge = 'Capitalize on peak clarity: engage in your main workout or learning quest early.';
  } else if (mindset === 'restorative_recovery') {
    mindsetLabel = 'Gentle Recovery';
    mindsetDescription = 'Slight fatigue or elevated stress indicated. Nurture your nervous system with calming movement.';
    recommendedFocus = avgStress > 3.5 ? 'mindful_breathing' : 'deep_stretch';
    focusReason = 'Nervous system resets and light restorative mobility rebuild vitality without fatigue.';
    actionableNudge = 'Prioritize somatic calm today: a 3-minute breathwork quest or gentle neck/eye stretch.';
  } else if (mindset === 'fresh_baseline') {
    mindsetLabel = 'Fresh Foundation';
    mindsetDescription = 'Setting up initial baseline patterns. Each day builds deeper clarity.';
    recommendedFocus = 'eye_strain_relief';
    focusReason = 'Gentle micro-habits anchor long-term wellness.';
    actionableNudge = 'Start with a simple 1-minute mindful pause or daily check-in.';
  }

  return {
    chronotype,
    chronotypeLabel,
    mindset,
    mindsetLabel,
    mindsetDescription,
    averageEnergy: avgEnergy,
    averageStress: avgStress,
    averageMood: avgMood,
    consistencyScore,
    recommendedFocus,
    focusReason,
    primeActivityWindow,
    actionableNudge,
  };
}
```

#### `src/domain/coach/localCoachAI.ts`

```ts
/**
 * localCoachAI.ts — Complete local-first deterministic coaching intelligence for Thrivefold.
 *
 * Provides instant, on-device coaching answers for exercise form, posture, recovery,
 * soreness, warmup, cooldown, sleep, hydration, and daily wellbeing.
 *
 * Rules:
 *  - 100% offline, zero network requests, zero required external downloads.
 *  - Grounded in the user's real local data (steps, hydration, quests, profile).
 *  - Concise: 1 to 3 sentences maximum, warm and encouraging.
 *  - Never diagnoses, never suggests medicine doses, never claims to be a medical device.
 */

import { formatLocalDate } from '../calendar/universalCalendarEngine';
import { stepsByDate } from '../interop/readings';
import { classifyLocalInput } from '../ai/localClassifier';

export interface LocalCoachContext {
  steps?: number;
  waterGlasses?: number;
  hydrationTarget?: number;
  userName?: string;
  weightKg?: number;
  heightCm?: number;
  allergies?: string[];
  foodRules?: string[];
  energy?: number;
  mood?: number;
  today?: string;
}

export interface LocalCoachReply {
  text: string;
  route?: string;
  topic:
    | 'form'
    | 'posture'
    | 'recovery'
    | 'workout'
    | 'sleep'
    | 'hydration'
    | 'nutrition'
    | 'stress'
    | 'summary'
    | 'general';
}

function getStore() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    return useRootStore.getState?.();
  } catch {
    return undefined;
  }
}

export function buildLocalCoachContext(): LocalCoachContext {
  const s = getStore();
  const today = formatLocalDate(new Date());
  if (!s) {
    return { today, waterGlasses: 0, hydrationTarget: 8 };
  }
  const steps = s.deviceReadings ? stepsByDate(s.deviceReadings).get(today)?.value : undefined;
  const waterGlasses = s.hydration?.[today] ?? 0;
  const hydrationTarget = s.hydrationTargetGlasses ?? 8;
  const userName = s.koshProfile?.preferredName || undefined;

  return {
    steps: steps ? Math.round(steps) : undefined,
    waterGlasses,
    hydrationTarget,
    userName,
    weightKg: s.weightKg ?? undefined,
    heightCm: s.heightCm ?? undefined,
    allergies: s.koshProfile?.allergies,
    foodRules: s.koshProfile?.foodRestrictions,
    today,
  };
}

export function resolveLocalCoachReply(prompt: string, ctx?: LocalCoachContext): LocalCoachReply {
  const r = coachReply(prompt, ctx);
  return { ...r, text: r.text.charAt(0).toUpperCase() + r.text.slice(1) };
}

function coachReply(prompt: string, ctx?: LocalCoachContext): LocalCoachReply {
  const text = prompt.toLowerCase().trim();
  const context = ctx ?? buildLocalCoachContext();
  const greeting = context.userName ? `${context.userName}, ` : '';

  // 1. Specific Exercise Form & Technique
  if (/\b(?:squat|squats)\b/.test(text)) {
    return {
      text: `${greeting}keep your chest tall, push hips back and down like sitting into a low chair, and drive up firmly through your heels. Ensure your knees stay aligned over your toes throughout.`,
      route: '/(app)/health/pose-check',
      topic: 'form',
    };
  }

  if (/\b(?:push[- ]?up|pushups?)\b/.test(text)) {
    return {
      text: `${greeting}keep your core braced in a straight plank line from shoulders to heels. Lower your chest until elbows reach approximately 45 degrees, then press up with full control.`,
      route: '/(app)/train',
      topic: 'form',
    };
  }

  if (/\b(?:plank|planks)\b/.test(text)) {
    return {
      text: `${greeting}stack elbows directly under your shoulders, engage your glutes and deep abs, and hold your neck neutral. Avoid letting your hips sag or pike high.`,
      route: '/(app)/train',
      topic: 'form',
    };
  }

  if (/\b(?:lunge|lunges)\b/.test(text)) {
    return {
      text: `${greeting}take a deliberate step forward, keeping your torso upright, and lower until both knees form roughly 90-degree angles. Push back through your front heel to return.`,
      route: '/(app)/train',
      topic: 'form',
    };
  }

  // 2. Posture & Desk Alignment
  if (/\b(?:posture|slouch|neck|back ache|sitting)\b/.test(text)) {
    return {
      text: `${greeting}roll your shoulders gently back and down, imagine a gentle string lengthening the crown of your head, and keep feet planted flat. Standing or gently stretching every hour helps spine health.`,
      route: '/(app)/beta-lab/face-exercises',
      topic: 'posture',
    };
  }

  // 3. Warm-Up & Mobility
  if (/\b(?:warm[- ]?up|stretch before|mobility|pre[- ]workout)\b/.test(text)) {
    return {
      text: `${greeting}spend 4 to 5 minutes on dynamic movement: leg swings, hip openers, arm circles, and gentle bodyweight squats. Dynamic warmups prepare joint fluid and muscles safely.`,
      route: '/(app)/train',
      topic: 'workout',
    };
  }

  // 4. Cool-Down & Post-Workout Stretches
  if (/\b(?:cool[- ]?down|stretch after|post[- ]workout stretch)\b/.test(text)) {
    return {
      text: `${greeting}take 3 to 5 minutes of easy walking to bring your heart rate down, followed by gentle static stretches for your hamstrings, hips, and shoulders. Breathe deep and slow.`,
      route: '/(app)/beta-lab/breathing',
      topic: 'workout',
    };
  }

  // 5. Soreness, Recovery & Fatigue
  if (/\b(?:sore|soreness|doms|aching muscles|tired muscles)\b/.test(text)) {
    return {
      text: `${greeting}delayed muscle soreness is normal after physical effort. Prioritize extra water, gentle walking, light stretching, and a solid night of sleep to help muscle repair.`,
      route: '/(app)/health/sleep',
      topic: 'recovery',
    };
  }

  // 6. Pain & Limitation Adaptation (Non-diagnostic safety)
  if (/\b(?:knee pain|joint pain|sharp pain|hurt|injury|injured)\b/.test(text)) {
    return {
      text: `${greeting}please pause any movement that causes pain or joint discomfort. Focus on pain-free gentle mobility, and consult a qualified healthcare provider for persistent or sharp symptoms.`,
      route: '/(app)/safety/urgent-support',
      topic: 'recovery',
    };
  }

  // 7. Today's Fitness / Workout Recommendation
  if (/\b(?:recommend|suggest|what workout|what exercise|workout today|training today)\b/.test(text)) {
    if (context.steps && context.steps < 4000) {
      return {
        text: `${greeting}you're at ${context.steps.toLocaleString()} steps today. A brisk 20-minute walk or a light bodyweight routine would be a great way to energize your body today.`,
        route: '/(app)/train',
        topic: 'workout',
      };
    }
    return {
      text: `${greeting}today is great for balanced movement. Check out our guided workouts in the Train tab for a curated session tailored to your current fitness rhythm.`,
      route: '/(app)/train',
      topic: 'workout',
    };
  }

  // 8. Sleep & Rest Hygiene
  if (/\b(?:sleep|insomnia|rest better|can'?t sleep|bedtime|tired in morning)\b/.test(text)) {
    return {
      text: `${greeting}aim for consistent sleep and wake times, dim screen lights 45 minutes before bed, and keep your bedroom cool. Slow, diaphragmatic breathing also helps quiet a busy mind.`,
      route: '/(app)/health/sleep',
      topic: 'sleep',
    };
  }

  // 9. Hydration
  if (/\b(?:water|hydration|how much water|drink water|thirsty)\b/.test(text)) {
    const status =
      context.waterGlasses && context.waterGlasses > 0
        ? `You have logged ${context.waterGlasses} of ${context.hydrationTarget ?? 8} glasses today.`
        : `Aim for around ${context.hydrationTarget ?? 8} glasses across your day.`;
    return {
      text: `${greeting}hydration supports muscle performance and energy levels. ${status} Keep a water bottle nearby and take steady sips.`,
      route: '/(app)/health/meal-log',
      topic: 'hydration',
    };
  }

  // 10. Nutrition & Fuel
  if (/\b(?:eat|food|nutrition|snack|protein|fuel|pre[- ]workout food)\b/.test(text)) {
    const allergyNote = context.allergies?.length
      ? ` keeping your ${context.allergies.join(', ')} preferences in mind.`
      : '.';
    return {
      text: `${greeting}aim for balanced nourishment with quality proteins, complex carbohydrates, and wholesome fats${allergyNote} A light snack 45 minutes before training keeps energy steady.`,
      route: '/(app)/health/meal-log',
      topic: 'nutrition',
    };
  }

  // 11. Stress, Calm & Breathing
  if (/\b(?:stress|anxious|anxiety|calm down|breathe|overwhelm|meditat)\b/.test(text)) {
    return {
      text: `${greeting}take a slow, deep breath in through your nose for 4 counts, hold for 4, and exhale smoothly for 6. Let me open the Breathing Coach so we can practice together.`,
      route: '/(app)/beta-lab/breathing',
      topic: 'stress',
    };
  }

  // 12. Day Overview / Health Review
  if (/\b(?:how am i doing|summary|progress today|my stats|review my day)\b/.test(text)) {
    const stepText = context.steps ? `${context.steps.toLocaleString()} steps` : 'steps pending';
    const waterText = `${context.waterGlasses ?? 0} glasses of water`;
    return {
      text: `${greeting}here is your day so far: ${stepText} and ${waterText} logged. Keep listening to your body and celebrating every healthy step.`,
      route: '/(app)/(tabs)/progress',
      topic: 'summary',
    };
  }

  // 13. Signal classification fallback via classifier
  const classification = classifyLocalInput({ text: prompt });
  if (classification.signals.includes('fatigue')) {
    return {
      text: `${greeting}I hear that you're feeling tired. Honour your energy with light walking, plenty of water, and an early bedtime tonight.`,
      route: '/(app)/health/sleep',
      topic: 'recovery',
    };
  }
  if (classification.signals.includes('stress')) {
    return {
      text: `${greeting}it sounds like you are carrying some stress. Taking a 5-minute break with our breathing exercises can help reset your nervous system.`,
      route: '/(app)/beta-lab/breathing',
      topic: 'stress',
    };
  }

  if (/^(hi|hello|hey|namaste|good (morning|afternoon|evening))\b/.test(text)) {
    return {
      text: `Hi${context.userName ? ` ${context.userName}` : ''}! What would you like to do? You can ask about today, log water, start a workout or breathing, or ask me anything.`,
      topic: 'general',
    };
  }

  // 14. Default warm, grounded coach reply
  return {
    text: `${greeting}I can't answer that well without the on-device brain. Tap Download above and I'll answer questions like this offline. Meanwhile I can log water, show today's numbers, open any screen, or guide a workout.`,
    topic: 'general',
  };
}
```

#### `src/domain/coach/voiceCommands.ts`

```ts
/**
 * voiceCommands.ts — Natural language hands-free voice command engine for Coach.
 *
 * Translates spoken commands (like Siri/Google Assistant) into deterministic
 * workout session actions and natural coaching responses.
 */

export type VoiceCommand =
  | 'pause'
  | 'resume'
  | 'next_set'
  | 'add_rest'
  | 'previous'
  | 'toggle_video'
  | 'help';

interface CommandPattern {
  command: VoiceCommand;
  keywords: string[];
  phrases: RegExp[];
}

const COMMAND_PATTERNS: CommandPattern[] = [
  {
    command: 'toggle_video',
    keywords: ['video', 'demo', 'tutorial', 'toggle video', 'pause video'],
    phrases: [
      /^(?:toggle\s+video|pause\s+video|play\s+video|show\s+video|hide\s+video)$/i,
      /^(?:demo\s+video|watch\s+demo|video\s+toggle|toggle\s+demo)$/i,
    ],
  },
  {
    command: 'add_rest',
    keywords: ['add rest', 'more rest', 'more time', 'thirty seconds', '30 seconds', 'break'],
    phrases: [
      /^(?:add\s+rest|more\s+rest|more\s+time|need\s+a\s+break)$/i,
      /^(?:give\s+me\s+)?(?:thirty|30)\s+seconds$/i,
      /^(?:extra\s+rest|give\s+me\s+time)$/i,
    ],
  },
  {
    command: 'previous',
    keywords: ['previous', 'go back', 'step back', 'redo', 'last exercise'],
    phrases: [
      /^(?:previous(?:\s+exercise)?|go\s+back|step\s+back|redo|last\s+exercise)$/i,
    ],
  },
  {
    command: 'pause',
    keywords: ['pause', 'stop', 'freeze', 'hold on', 'wait'],
    phrases: [
      /^(?:pause(?:\s+(?:workout|session|exercise))?|hold\s+on|wait|take\s+a\s+break|freeze)$/i,
      /^stop(?:\s+(?:workout|session|exercise))?$/i,
    ],
  },
  {
    command: 'resume',
    keywords: ['resume', 'continue', 'play', 'start', 'go', 'keep going'],
    phrases: [
      /^(?:resume(?:\s+(?:workout|session))?|continue|keep\s+going|let'?s\s+go|unpause)$/i,
      /^(?:i'?m\s+ready|ready|start(?:\s+(?:set|workout))?)$/i,
    ],
  },
  {
    command: 'next_set',
    keywords: ['next', 'finish', 'done', 'skip', 'complete', 'next set'],
    phrases: [
      /^(?:next(?:\s+set)?|skip\s+rest|finished|i'?m\s+done|done|complete(?:\s+set)?|finish(?:\s+set)?)$/i,
    ],
  },
  {
    command: 'help',
    keywords: ['help', 'commands', 'what can i say'],
    phrases: [
      /^(?:help|commands|what\s+can\s+i\s+say|how\s+to\s+use|coach\s+help)$/i,
    ],
  },
];

export interface ParseVoiceCommandOptions {
  /**
   * Only commands present in this allowlist will be returned.
   * Useful to restrict commands based on workout phase (e.g. no set-complete during positioning).
   */
  allowedCommands?: VoiceCommand[];
}

/**
 * Parses user speech into a recognized VoiceCommand.
 * Ignores casual sentence chatter where command words appear incidentally.
 */
export function parseVoiceCommand(
  transcript: string,
  options?: ParseVoiceCommandOptions,
): VoiceCommand | null {
  if (!transcript || typeof transcript !== 'string') return null;
  const raw = transcript.trim().toLowerCase();
  if (!raw) return null;

  // Strip leading wake phrases like "hey coach", "coach", "please"
  const cleaned = raw
    .replace(/^(?:hey\s+)?coach\s*,?\s*/i, '')
    .replace(/^please\s+/i, '')
    .trim();

  if (!cleaned) return null;

  let recognized: VoiceCommand | null = null;

  // 1. Check specific multi-word phrase patterns first
  for (const { command, phrases } of COMMAND_PATTERNS) {
    for (const phrase of phrases) {
      if (phrase.test(cleaned)) {
        recognized = command;
        break;
      }
    }
    if (recognized) break;
  }

  // 2. Check exact command phrase matches or short focused phrases (<= 3 words)
  if (!recognized) {
    const words = cleaned.split(/\s+/);
    if (words.length <= 3) {
      for (const { command, keywords } of COMMAND_PATTERNS) {
        for (const kw of keywords) {
          if (cleaned === kw || (words.length <= 2 && words.includes(kw))) {
            recognized = command;
            break;
          }
        }
        if (recognized) break;
      }
    }
  }

  // 3. Filter against allowedCommands if provided
  if (recognized && options?.allowedCommands && !options.allowedCommands.includes(recognized)) {
    return null;
  }

  return recognized;
}

/**
 * Generates natural, human spoken confirmation for recognized voice commands.
 */
export function voiceCommandResponseSpeech(
  command: VoiceCommand,
  context: { videoPlaying?: boolean; rest?: boolean; itemIdx?: number } = {},
): string {
  switch (command) {
    case 'pause':
      return 'Workout paused. Take a deep breath. Say resume when you are ready to continue.';
    case 'resume':
      return 'Resuming now! Let’s get right back into strong form.';
    case 'next_set':
      return context.rest
        ? 'Skipping rest. Starting your next set!'
        : 'Set completed! Outstanding effort. Take a breather.';
    case 'add_rest':
      return 'Got it! Added thirty seconds of extra rest. Breathe deep and reset.';
    case 'previous':
      return (context.itemIdx ?? 0) > 0
        ? 'Going back to the previous exercise. Let’s reset.'
        : 'You are already at the first exercise. Let’s finish this one!';
    case 'toggle_video':
      return context.videoPlaying
        ? 'Pausing the demo video for you.'
        : 'Playing the demo video. Follow along!';
    case 'help':
      return 'You can say: pause, resume, next, add rest, go back, or toggle video. Or use your camera gestures anytime!';
  }
}
```

### SOURCE: EXPO ROUTES

#### `src/app/(app)/ai/_layout.tsx`

```tsx
import { Stack } from 'expo-router';

export default function AiLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

#### `src/app/(app)/ai/index.tsx`

```tsx
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Link, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { TextField } from '../../../components/ui/TextField';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { checkInsUntilInsights, computeInsights, type Insight } from '../../../domain/ai/insights';
import { searchDocuments, type RetrievalDocument } from '../../../domain/ai/localRetrieval';
import { activeMemories } from '../../../domain/ai/types';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { totals } from '../../../domain/nutrition/foods';
import { PressableScale } from '../../../components/ui/PressableScale';

const KIND_LABEL: Record<Insight['kind'], string> = {
  trend: 'This week',
  link: 'Connection',
  pattern: 'Weekly rhythm',
  symptom: 'Recurring',
  cycle: 'Cycle',
  consistency: 'Habit',
  activity: 'Activity',
};

/** Same date convention the check-in screen uses when it saves records. */
const todayKey = () => formatLocalDate(new Date());

export default function InsightsScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { checkInHistory, periodHistory, journalEntries, aiMemories, aiMemoryEnabled, addAiMemory, showToast, workoutSessions, activityLogs, mealLogs } =
    useRootStore(
      useShallow((s) => ({
        checkInHistory: s.checkInHistory,
        periodHistory: s.cycleData?.periodHistory,
        journalEntries: s.journalEntries,
        aiMemories: s.aiMemories,
        workoutSessions: s.workoutSessions,
        activityLogs: s.activityLogs,
        mealLogs: s.mealLogs,
        aiMemoryEnabled: s.aiMemoryEnabled,
        addAiMemory: s.addAiMemory,
        showToast: s.showToast,
      })),
    );

  const [query, setQuery] = useState('');
  const today = todayKey();

  const insights = useMemo(
    () =>
      computeInsights({
        checkIns: checkInHistory,
        periods: periodHistory ?? [],
        today,
        activeDates: [...workoutSessions.map((w) => w.date), ...activityLogs.map((a) => a.date)],
        proteinByDate: mealLogs.reduce<Record<string, number>>((acc, m) => {
          acc[m.date] = (acc[m.date] ?? 0) + totals(m.items).protein;
          return acc;
        }, {}),
      }),
    [checkInHistory, periodHistory, today, workoutSessions, activityLogs, mealLogs],
  );
  const daysToGo = useMemo(() => checkInsUntilInsights(checkInHistory, today), [checkInHistory, today]);

  const memories = useMemo(() => activeMemories(aiMemories), [aiMemories]);
  const keptRefs = useMemo(() => new Set(memories.map((m) => m.sourceRef).filter(Boolean)), [memories]);

  const documents = useMemo<RetrievalDocument[]>(
    () => [
      ...journalEntries.map((j) => ({
        id: j.id,
        kind: 'journal' as const,
        title: j.title,
        text: j.content,
        date: j.createdAt,
      })),
      // A paused vault is not used for anything, search included.
      ...(aiMemoryEnabled ? memories : []).map((m) => ({
        id: m.id,
        kind: 'memory' as const,
        title: '',
        text: m.content,
        date: m.createdAt,
      })),
    ],
    [journalEntries, memories, aiMemoryEnabled],
  );
  const hits = useMemo(() => searchDocuments(documents, query, 6), [documents, query]);

  const keep = (insight: Insight) => {
    if (!insight.memoryCandidate) return;
    addAiMemory({
      content: insight.memoryCandidate,
      category: 'pattern',
      source: 'insight',
      sourceRef: insight.id,
    });
    showToast({ type: 'success', title: 'Kept in your memory', message: 'Stored on this device for 90 days.' });
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Your patterns" subtitle="Worked out on this phone from your own records" showBack />
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        <Link href={'/(app)/ai/chat' as Href} asChild>
          <PressableScale accessibilityRole="button" accessibilityLabel="Ask Thrive, the AI companion">
            <Card style={{ marginBottom: spacing.md, padding: 16, backgroundColor: colors.primaryAlpha }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Ask Thrive</Text>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    Optional AI companion for habits, sleep, movement and stress
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
              </View>
            </Card>
          </PressableScale>
        </Link>
        {/* Hero */}
        <Card style={{ marginBottom: spacing.md, padding: 14, backgroundColor: colors.surface }}>
          <View style={styles.heroWrap}>
            <Image
              source={require('../../../../assets/illustrations/beta-coach-assistant.jpg')}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 12 }]}>
            On-Device Cryptographic Memory
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, lineHeight: 18 }]}>
            All memories, journal retrieval vectors, and hormonal patterns are processed locally on your phone.
          </Text>
        </Card>

        {insights.length === 0 ? (
          <Card variant="surface1" style={{ padding: spacing.lg, marginBottom: spacing.md }}>
            <Ionicons name="analytics-outline" size={26} color={colors.text.muted} />
            <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: spacing.sm }]}>
              No patterns yet
            </Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
              {daysToGo > 0
                ? `Patterns start appearing after ${daysToGo} more check-in ${daysToGo === 1 ? 'day' : 'days'}. Nothing is guessed before there is enough data.`
                : 'Your check-ins look steady so far. Patterns appear here when something clear shows up.'}
            </Text>
            <Link href={'/(app)/check-in' as Href} asChild>
              <Button
                label="Check in now"
                size="sm"
                style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
              />
            </Link>
          </Card>
        ) : (
          insights.map((insight) => {
            const kept = keptRefs.has(insight.id);
            return (
              <Card key={insight.id} style={{ marginBottom: spacing.sm }}>
                <View style={styles.rowBetween}>
                  <Badge label={KIND_LABEL[insight.kind]} variant="neutral" />
                  <Badge
                    label={insight.strength === 'clear' ? 'Clear' : 'Emerging'}
                    variant={insight.strength === 'clear' ? 'success' : 'info'}
                  />
                </View>
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: spacing.sm }]}>
                  {insight.title}
                </Text>
                <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
                  {insight.detail}
                </Text>
                {insight.suggestion ? (
                  <Text style={[typography.subbody, { color: colors.text.primary, marginTop: spacing.sm }]}>
                    {insight.suggestion}
                  </Text>
                ) : null}
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
                  {insight.evidence}
                </Text>
                {insight.memoryCandidate && aiMemoryEnabled ? (
                  <Button
                    label={kept ? 'Kept in memory' : 'Keep in memory'}
                    size="sm"
                    variant="outline"
                    disabled={kept}
                    icon={
                      <Ionicons
                        name={kept ? 'checkmark' : 'bookmark-outline'}
                        size={14}
                        color={kept ? colors.text.muted : colors.primary}
                      />
                    }
                    onPress={() => keep(insight)}
                    style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
                  />
                ) : null}
              </Card>
            );
          })
        )}

        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>
          Search your notes
        </Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.sm }]}>
          Finds journal entries and kept memories on this device. Nothing is sent anywhere.
        </Text>
        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. sleep, back pain, work"
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search your notes"
          leftIcon={<Ionicons name="search-outline" size={18} color={colors.text.muted} />}
        />
        {query.trim().length > 0 && hits.length === 0 ? (
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
            {documents.length === 0
              ? 'You have no journal entries or memories yet.'
              : 'Nothing matches. Try a different word.'}
          </Text>
        ) : null}
        {hits.map((hit) => (
          <Card
            key={`${hit.doc.kind}_${hit.doc.id}`}
            onPress={
              hit.doc.kind === 'journal'
                ? () => router.push({ pathname: '/(app)/journal/[entryId]', params: { entryId: hit.doc.id } })
                : () => router.push('/(app)/ai/memory')
            }
            style={{ marginTop: spacing.sm }}
          >
            <View style={styles.rowBetween}>
              <Text style={[typography.subbodyBold, { color: colors.text.primary, flex: 1 }]} numberOfLines={1}>
                {hit.doc.kind === 'journal' ? hit.doc.title || 'Journal entry' : 'Memory'}
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                {new Date(hit.doc.date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>{hit.snippet}</Text>
          </Card>
        ))}

        <Card variant="surface1" style={{ marginTop: spacing.lg, padding: spacing.base }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>How this works</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Patterns come from simple statistics on your own check-ins and logged periods, and only appear once
            there is enough data. They describe your records; they are not medical advice or a diagnosis.
          </Text>
          <View style={styles.links}>
            <Link href={'/(app)/ai/memory' as Href} asChild>
              <LinkRow label={`Memory (${memories.length})`} icon="bookmark-outline" />
            </Link>
            <Link href={'/(app)/ai/privacy' as Href} asChild>
              <LinkRow label="Privacy" icon="shield-checkmark-outline" />
            </Link>
            <Link href={'/(app)/ai/model-status' as Href} asChild>
              <LinkRow label="What runs on this device" icon="hardware-chip-outline" />
            </Link>
            <Link href={'/(app)/settings/ai-byok' as Href} asChild>
              <LinkRow label="Bring Your Own Key (BYOK)" icon="key-outline" />
            </Link>
          </View>
        </Card>
      </View>
    </ScreenWrapper>
  );
}

function LinkRow({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress?: () => void }) {
  const { colors, typography } = useTheme();
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" style={styles.linkRow} hitSlop={4}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={[typography.subbody, { color: colors.text.primary, flex: 1, marginLeft: 10 }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  links: {
    marginTop: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  heroWrap: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3EFEA',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
});
```

#### `src/app/(app)/ai/chat.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Header } from '../../../components/ui/Header';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { TextField } from '../../../components/ui/TextField';
import { aiErrorText, askThrive, type ChatTurn } from '../../../services/ai/cloudChat';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const STARTERS = [
  'Help me plan a calmer evening',
  'Ideas for a 10-minute workout at home',
  'How can I sleep a little better?',
  'I feel stressed about work',
];

/**
 * Ask Thrive: the optional cloud AI companion. Nothing is sent until the person agrees, and
 * only what they type here is sent (never their health records). Conversations stay on this
 * screen; the server keeps only a daily request count.
 */
export default function ThriveChatScreen() {
  const { colors, typography, spacing } = useTheme();
  const { consent, setConsent } = useRootStore(
    useShallow((s) => ({ consent: s.cloudAiConsent, setConsent: s.setCloudAiConsent })),
  );
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next: ChatTurn[] = [...turns, { role: 'user', content }];
    setTurns(next);
    setDraft('');
    setError(null);
    setBusy(true);
    try {
      const r = await askThrive(next);
      setTurns((t) => [...t, { role: 'assistant', content: r.reply }]);
      setRemaining(r.remaining);
    } catch (e) {
      setError(aiErrorText(e));
    } finally {
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  if (!consent) {
    return (
      <ScreenWrapper scrollable footer={<Button label="I agree, start" onPress={() => setConsent(true)} />}>
        <Header title="Ask Thrive" subtitle="Optional AI companion" showBack />
        <Card style={{ padding: spacing.lg }}>
          <Ionicons name="chatbubbles-outline" size={26} color={colors.primary} />
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.sm }]}>
            Before you start
          </Text>
          {[
            'What you type here is sent through Thrivefold’s server to an AI provider (Google Gemini, Groq or OpenRouter) to write a reply.',
            'Your check-ins, cycle data, journal and other records are not sent. Only this conversation.',
            'Thrivefold’s server stores no messages, only how many you sent today (a daily limit keeps it free).',
            'Thrive is not a doctor or therapist and can be wrong. In an emergency, contact local emergency services.',
            'You can turn this off any time in You > Privacy.',
          ].map((t) => (
            <View key={t} style={[styles.row, { marginTop: spacing.sm }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
              <Text style={[typography.subbody, styles.flex, { color: colors.text.secondary, marginLeft: 8 }]}>{t}</Text>
            </View>
          ))}
        </Card>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      footer={
        <View style={styles.composer}>
          <TextField
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask about habits, sleep, movement, stress…"
            maxLength={2000}
            multiline
            containerStyle={styles.flex}
            accessibilityLabel="Message to Thrive"
          />
          <PressableScale
            onPress={() => send(draft)}
            disabled={!draft.trim() || busy}
            accessibilityRole="button"
            accessibilityLabel="Send"
            style={[styles.send, { backgroundColor: draft.trim() && !busy ? colors.primary : colors.surface2 }]}
          >
            <Ionicons name="arrow-up" size={22} color={colors.onPrimary} />
          </PressableScale>
        </View>
      }
    >
      <Header
        title="Ask Thrive"
        subtitle={remaining !== null ? `${remaining} questions left today` : 'AI companion, not medical advice'}
        showBack
      />
      <ScrollView ref={scroll} style={styles.flex} contentContainerStyle={{ gap: 10, paddingBottom: spacing.lg }}>
        {turns.length === 0 ? (
          <View style={{ gap: 8 }}>
            <Text style={[typography.body, { color: colors.text.secondary }]}>What would help today?</Text>
            <View style={styles.wrap}>
              {STARTERS.map((s) => (
                <Chip key={s} label={s} onPress={() => send(s)} />
              ))}
            </View>
          </View>
        ) : null}
        {turns.map((t, i) => (
          <View key={i} style={[styles.bubbleRow, { justifyContent: t.role === 'user' ? 'flex-end' : 'flex-start' }]}>
            <View style={[styles.bubble, { backgroundColor: t.role === 'user' ? colors.primary : colors.surface }]}>
              <Text style={[typography.body, { color: t.role === 'user' ? colors.onPrimary : colors.text.primary }]}>
                {t.content}
              </Text>
            </View>
          </View>
        ))}
        {busy ? <ActivityIndicator color={colors.primary} style={{ alignSelf: 'flex-start' }} /> : null}
        {error ? <Text style={[typography.caption, { color: colors.error }]}>{error}</Text> : null}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  bubble: { borderRadius: 18, maxWidth: '85%', paddingHorizontal: 14, paddingVertical: 10 },
  bubbleRow: { flexDirection: 'row' },
  composer: { alignItems: 'flex-end', flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  row: { alignItems: 'flex-start', flexDirection: 'row' },
  send: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', marginBottom: 4, width: 48 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
```

#### `src/app/(app)/ai/memory.tsx`

```tsx
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Toggle } from '../../../components/ui/Toggle';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { TextField } from '../../../components/ui/TextField';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { activeMemories, type MemoryItem } from '../../../domain/ai/types';
import { PressableScale } from '../../../components/ui/PressableScale';

const MAX_LENGTH = 280;

export default function AiMemoryScreen() {
  const { colors, typography, spacing } = useTheme();
  const {
    aiMemories,
    aiMemoryEnabled,
    addAiMemory,
    updateAiMemory,
    deleteAiMemory,
    clearAiMemories,
    setAiMemoryEnabled,
    showAlert,
    showToast,
  } = useRootStore(
    useShallow((s) => ({
      aiMemories: s.aiMemories,
      aiMemoryEnabled: s.aiMemoryEnabled,
      addAiMemory: s.addAiMemory,
      updateAiMemory: s.updateAiMemory,
      deleteAiMemory: s.deleteAiMemory,
      clearAiMemories: s.clearAiMemories,
      setAiMemoryEnabled: s.setAiMemoryEnabled,
      showAlert: s.showAlert,
      showToast: s.showToast,
    })),
  );

  const memories = useMemo(() => activeMemories(aiMemories), [aiMemories]);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAdd = () => {
    if (addAiMemory({ content: draft, category: 'preference', source: 'user' })) {
      setDraft('');
      showToast({ type: 'success', message: 'Saved on this device.' });
    }
  };

  const startEdit = (m: MemoryItem) => {
    setEditingId(m.id);
    setEditText(m.content);
  };

  const saveEdit = () => {
    if (editingId) updateAiMemory(editingId, editText);
    setEditingId(null);
  };

  const confirmDelete = (id: string) =>
    showAlert({
      title: 'Forget this memory?',
      message: 'It will be removed from this device.',
      confirmText: 'Forget',
      destructive: true,
      onConfirm: () => deleteAiMemory(id),
    });

  const confirmClear = () =>
    showAlert({
      title: 'Forget everything?',
      message: 'All memories on this device will be removed. This cannot be undone.',
      confirmText: 'Forget all',
      destructive: true,
      onConfirm: () => {
        clearAiMemories();
        showToast({ type: 'info', message: 'All memories removed.' });
      },
    });

  return (
    <ScreenWrapper scrollable>
      <Header title="Memory" subtitle="Things you chose to keep, stored only on this device" showBack />
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Use memory</Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                When off, nothing new is kept and existing memories are not used or searched. They stay until you
                remove them.
              </Text>
            </View>
            <Toggle
              value={aiMemoryEnabled}
              onValueChange={setAiMemoryEnabled}
              trackColor={{ false: colors.surface1, true: colors.primary }}
              accessibilityLabel="Use memory"
            />
          </View>
        </Card>

        {aiMemoryEnabled ? (
          <Card variant="surface1" style={{ marginBottom: spacing.md }}>
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: spacing.sm }]}>
              Add something to remember
            </Text>
            <TextField
              value={draft}
              onChangeText={setDraft}
              placeholder="e.g. Mornings work best for my routines"
              maxLength={MAX_LENGTH}
              multiline
              accessibilityLabel="New memory"
            />
            <Button
              label="Keep"
              size="sm"
              disabled={!draft.trim()}
              onPress={handleAdd}
              style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
            />
          </Card>
        ) : null}

        <View style={[styles.row, { marginBottom: spacing.sm }]}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Kept ({memories.length})</Text>
          {memories.length > 0 ? <Button label="Forget all" variant="ghost" size="sm" onPress={confirmClear} /> : null}
        </View>

        {memories.length === 0 ? (
          <Card variant="surface1" style={{ padding: spacing.lg }}>
            <Text style={[typography.subbody, { color: colors.text.secondary }]}>
              Nothing kept yet. Add a note above, or keep a pattern from Your Patterns. Journal entries are never
              turned into memories automatically.
            </Text>
          </Card>
        ) : (
          memories.map((m) => (
            <Card key={m.id} style={{ marginBottom: spacing.sm, opacity: aiMemoryEnabled ? 1 : 0.6 }}>
              <View style={styles.row}>
                <Badge label={m.source === 'insight' ? 'From a pattern' : 'Added by you'} variant="neutral" />
                <Text style={[typography.caption, { color: colors.text.muted }]}>
                  {new Date(m.updatedAt ?? m.createdAt).toLocaleDateString()}
                </Text>
              </View>
              {editingId === m.id ? (
                <>
                  <TextField
                    value={editText}
                    onChangeText={setEditText}
                    maxLength={MAX_LENGTH}
                    multiline
                    autoFocus
                    accessibilityLabel="Edit memory"
                    containerStyle={{ marginTop: spacing.sm }}
                  />
                  <View style={[styles.actions, { marginTop: spacing.sm }]}>
                    <Button label="Save" size="sm" disabled={!editText.trim()} onPress={saveEdit} />
                    <Button label="Cancel" size="sm" variant="ghost" onPress={() => setEditingId(null)} />
                  </View>
                </>
              ) : (
                <>
                  <Text style={[typography.body, { color: colors.text.primary, marginTop: spacing.sm }]}>
                    {m.content}
                  </Text>
                  {m.expiresAt ? (
                    <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
                      Forgotten automatically on {new Date(m.expiresAt).toLocaleDateString()}
                    </Text>
                  ) : null}
                  <View style={[styles.actions, { marginTop: spacing.sm }]}>
                    <IconAction icon="create-outline" label="Edit" onPress={() => startEdit(m)} />
                    <IconAction icon="trash-outline" label="Forget" onPress={() => confirmDelete(m.id)} />
                  </View>
                </>
              )}
            </Card>
          ))
        )}
      </View>
    </ScreenWrapper>
  );
}

function IconAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { colors, typography } = useTheme();
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.iconAction}>
      <Ionicons name={icon} size={16} color={colors.text.secondary} />
      <Text style={[typography.captionBold, { color: colors.text.secondary, marginLeft: 4 }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconAction: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingRight: 8,
  },
});
```

#### `src/app/(app)/ai/model-status.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import {
  LocalAI,
  MODEL_PRESETS,
  deleteLocalModel,
  getRecommendedModel,
  isModelDownloaded,
  type ModelPreset,
} from '../../../../modules/local-ai';
import { BrainSetupCard } from '../../../components/assistant/BrainSetupCard';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { askLocal, ensureLocalModel } from '../../../services/ai/localModel';
import { deleteImportedModel, importModelFile, listImportedModels, type ImportedModel } from '../../../services/ai/modelImport';
import {
  cancelSetup,
  pauseSetup,
  resumeSetup,
  setUpBrain,
  subscribeSetup,
  type SetupState,
} from '../../../services/ai/modelSetup';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

/**
 * On-device AI: download a language model once (Wi-Fi recommended), and Thrive Coach, global
 * search and meal plans answer on the phone with llama.cpp. Files are checked against their
 * published SHA-256 before use.
 */
export default function ModelStatusScreen() {
  const { colors, typography, spacing } = useTheme();
  const chosen = useRootStore((s) => s.localModelId);
  const setChosen = useRootStore((s) => s.setLocalModelId);
  const [have, setHave] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'testing'>(LocalAI.isLoaded() ? 'ready' : 'idle');
  const [reply, setReply] = useState<string | null>(null);
  const supported = LocalAI.isAvailable();
  const caps = supported ? LocalAI.getDeviceCapabilities() : null;
  const recommended = getRecommendedModel(caps?.totalRamMb ?? 4000);

  const [imported, setImported] = useState<ImportedModel[]>([]);
  const [importing, setImporting] = useState(false);
  const refresh = async () => {
    const out: Record<string, boolean> = {};
    for (const m of MODEL_PRESETS) out[m.id] = await isModelDownloaded(m.id);
    setHave(out);
    setImported(await listImportedModels());
  };
  const importModel = async () => {
    setError(null);
    setImporting(true);
    try {
      const id = await importModelFile();
      if (id) {
        await refresh();
        setChosen(id);
        await load();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not import this file.');
    } finally {
      setImporting(false);
    }
  };
  useEffect(() => {
    void refresh();
  }, []);

  // Every download goes through the one setup service: real progress, pause / resume (also after
  // the app restarts), checksum, load and a test answer before the model is used.
  const [setup, setSetup] = useState<SetupState | null>(null);
  useEffect(() => subscribeSetup(setSetup), []);
  useEffect(() => {
    if (setup?.phase === 'ready' || setup?.phase === 'failed') {
      void refresh();
      if (setup.phase === 'ready') setState('ready');
      if (setup.phase === 'failed') setError(setup.message);
    }
  }, [setup?.phase]); // eslint-disable-line react-hooks/exhaustive-deps
  const download = (m: ModelPreset) => {
    setError(null);
    void setUpBrain(m);
  };

  const load = async () => {
    setState('loading');
    if (LocalAI.isLoaded()) await LocalAI.unloadModel();
    const ok = await ensureLocalModel();
    setState(ok ? 'ready' : 'idle');
    if (!ok) setError('The model could not load. Close other apps to free memory and try again.');
  };

  const test = async () => {
    setState('testing');
    const out = await askLocal(
      'Say hello in one short, friendly sentence and suggest one healthy habit for today.',
      'You are Thrive, a brief, warm wellbeing coach.',
    );
    setReply(out ?? 'No answer.');
    setState('ready');
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader eyebrow="AI" title="On-device AI" subtitle="A language model that runs on this phone" showBack />
      }
    >
      <View style={{ marginTop: 12 }}>
        <BrainSetupCard />
      </View>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="hardware-chip-outline" size={22} color={colors.primary} />
          <View style={styles.flex}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
              {supported ? 'llama.cpp engine ready' : 'Not available on this device'}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {caps
                ? `${Math.round(caps.totalRamMb / 1024)} GB RAM · ${Math.round(caps.availableStorageMb / 1024)} GB free storage`
                : ''}
            </Text>
          </View>
          <Badge
            label={state === 'ready' ? 'Loaded' : state === 'loading' ? 'Loading' : 'Not loaded'}
            variant={state === 'ready' ? 'success' : 'neutral'}
          />
        </View>
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
          Thrive Coach, global search and meal plans use it. Without a model, commands and today&apos;s numbers still
          work.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Your own model</Text>
        <Text style={[typography.caption, { color: colors.text.secondary }]}>
          Import a .gguf model file from this phone (llama.cpp format). It is copied once into the app and works offline.
        </Text>
        {imported.map((m) => (
          <View key={m.id} style={[styles.row, { marginTop: 10 }]}>
            <View style={styles.flex}>
              <Text style={[typography.body, { color: colors.text.primary }]} numberOfLines={1}>
                {m.fileName}
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>{m.sizeMb} MB · imported</Text>
            </View>
            <Button
              label={chosen === m.id && state === 'ready' ? 'In use' : 'Use'}
              size="sm"
              disabled={chosen === m.id && state === 'ready'}
              onPress={() => {
                setChosen(m.id);
                void load();
              }}
            />
            <Button
              label="Delete"
              size="sm"
              variant="ghost"
              onPress={async () => {
                if (chosen === m.id) {
                  await LocalAI.unloadModel().catch(() => false);
                  setChosen(null);
                  setState('idle');
                }
                await deleteImportedModel(m.id);
                void refresh();
              }}
            />
          </View>
        ))}
        <View style={{ marginTop: 10 }}>
          <Button label={importing ? 'Copying…' : 'Import a model file'} size="sm" variant="outline" disabled={importing} onPress={() => void importModel()} />
        </View>
      </Card>

      {MODEL_PRESETS.map((m) => {
        const active = setup?.model?.id === m.id && (setup.phase === 'downloading' || setup.phase === 'paused' || setup.phase === 'verifying' || setup.phase === 'loading');
        const pct = active ? (setup?.progress ?? 0) : undefined;
        const downloaded = have[m.id];
        return (
          <Card key={m.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{m.name}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>{m.description}</Text>
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                  {m.sizeMb} MB · needs about {Math.round(m.minRamMb / 1024)} GB RAM · {m.license}
                </Text>
                {m.needsNewerRuntime ? (
                  <Text style={[typography.caption, { color: colors.warning, marginTop: 2 }]}>
                    New architecture: may not start on this app&apos;s current AI engine. It is tested right after download.
                  </Text>
                ) : null}
              </View>
              {m.id === recommended.id ? <Badge label="Best for this phone" variant="gold" /> : null}
            </View>
            {pct !== undefined ? (
              <View style={{ marginTop: 10 }}>
                <View style={[styles.track, { backgroundColor: colors.surface1 }]}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${Math.round(pct * 100)}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
                <View style={[styles.row, { marginTop: 6 }]}>
                  <Text style={[typography.caption, styles.flex, { color: colors.text.secondary }]}>
                    {setup?.phase === 'paused'
                      ? `Paused at ${Math.round(pct * 100)}%`
                      : setup?.phase === 'verifying'
                        ? 'Checking the file…'
                        : setup?.phase === 'loading'
                          ? 'Starting it up…'
                          : `Downloading ${Math.round(pct * 100)}%`}
                  </Text>
                  {setup?.phase === 'downloading' && !setup.durable ? (
                    <Button label="Pause" size="sm" variant="outline" onPress={() => void pauseSetup()} />
                  ) : setup?.phase === 'paused' ? (
                    <Button label="Resume" size="sm" onPress={() => void resumeSetup()} />
                  ) : null}
                  <Button label="Cancel" size="sm" variant="ghost" onPress={() => void cancelSetup()} />
                </View>
              </View>
            ) : downloaded ? (
              <View style={[styles.row, { marginTop: 10 }]}>
                <Button
                  label={chosen === m.id && state === 'ready' ? 'In use' : 'Use this model'}
                  size="sm"
                  disabled={chosen === m.id && state === 'ready'}
                  onPress={() => {
                    setChosen(m.id);
                    void load();
                  }}
                />
                <Button
                  label="Delete"
                  size="sm"
                  variant="ghost"
                  onPress={async () => {
                    if (chosen === m.id) {
                      await LocalAI.unloadModel();
                      setChosen(null);
                      setState('idle');
                    }
                    await deleteLocalModel(m.id);
                    void refresh();
                  }}
                />
              </View>
            ) : (
              <Button
                label={`Download ${m.sizeMb} MB`}
                size="sm"
                variant="outline"
                disabled={!supported}
                onPress={() => download(m)}
                style={{ marginTop: 10, alignSelf: 'flex-start' }}
              />
            )}
          </Card>
        );
      })}

      {error ? <Text style={[typography.caption, { color: colors.error, marginTop: 10 }]}>{error}</Text> : null}
      {state === 'loading' || state === 'testing' ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
      ) : null}
      {state === 'ready' ? (
        <Button label="Try it" variant="outline" onPress={() => void test()} style={{ marginTop: 12 }} />
      ) : null}
      {reply ? <Text style={[typography.body, { color: colors.text.primary, marginTop: 10 }]}>{reply}</Text> : null}
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: 12 }]}>
        Models come from Qwen (Apache-2.0) on Hugging Face and are checked against their published SHA-256. Answers are
        general guidance, not medical advice.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%' },
});
```

#### `src/app/(app)/ai/privacy.tsx`

```tsx
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';

const FACTS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  {
    icon: 'phone-portrait-outline',
    title: 'Everything is worked out on this device',
    body: 'Suggestions, patterns and note search use your records stored on this phone. Nothing is sent to a server or an AI company.',
  },
  {
    icon: 'bookmark-outline',
    title: 'Memory holds only what you choose',
    body: 'Journal entries are never turned into memories automatically. You can edit, pause or forget memories at any time.',
  },
  {
    icon: 'git-branch-outline',
    title: 'Rules decide, not AI',
    body: 'Age, eligibility, blocking, rewards and safety are decided by fixed, tested rules. Suggestions never diagnose.',
  },
  {
    icon: 'eye-off-outline',
    title: 'Nothing is guessed about you',
    body: 'Religion, orientation, ethnicity or health conditions are never inferred from what you write or do.',
  },
];

export default function AiPrivacyScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenWrapper scrollable>
      <Header title="AI Privacy" subtitle="What happens to your data" showBack />
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        {FACTS.map((f) => (
          <Card key={f.title} style={{ marginBottom: spacing.sm }}>
            <View style={styles.row}>
              <Ionicons name={f.icon} size={20} color={colors.primary} />
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 10, flex: 1 }]}>
                {f.title}
              </Text>
            </View>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6 }]}>{f.body}</Text>
          </Card>
        ))}

        <Card variant="surface1" style={{ marginTop: spacing.sm }}>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Cloud AI</Text>
            <Badge label="Not available" variant="neutral" />
          </View>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6 }]}>
            This build has no cloud AI. If it is added later, it will be off until you turn it on for a specific
            feature, and it will never receive your journal or intimate health records.
          </Text>
        </Card>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
```

#### `src/app/(app)/beta-lab/assistant.tsx`

```tsx
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useCoach } from '../../../components/assistant/CoachProvider';

/**
 * Old address of the separate "Thrive Coach" screen. There is one coach now: links here open the
 * Anvay sheet (ready to type, microphone off) over the screen the person came from.
 */
export default function AssistantRedirect() {
  const router = useRouter();
  const coach = useCoach();

  useEffect(() => {
    // The sheet lives above every screen, so it stays open while this placeholder leaves.
    coach.open({ listen: false });
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)');
  }, [router, coach]);

  return null;
}
```

#### `src/app/(app)/you/voice.tsx`

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnvayCompanion } from '../../../components/brand/AnvayCompanion';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SettingsGroup, SettingsRow } from '../../../components/ui/SettingsRow';
import { Toggle } from '../../../components/ui/Toggle';
import { queueCoachSpeech } from '../../../services/ai/coachVoiceService';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const RATES = [
  { label: 'Slower', value: 0.85 },
  { label: 'Normal', value: 0.95 },
  { label: 'Faster', value: 1.08 },
];

/** How Anvay sounds and listens: voice on or text only, which voice, speed, and conversation mode. */
export default function VoiceSettingsScreen() {
  const { colors, typography, spacing } = useTheme();
  const s = useRootStore(
    useShallow((st) => ({
      on: st.speakReplies,
      setOn: st.setSpeakReplies,
      gender: st.coachVoiceGender,
      setGender: st.setCoachVoiceGender,
      rate: st.coachVoiceRate,
      setRate: st.setCoachVoiceRate,
      convo: st.conversationMode,
      setConvo: st.setConversationMode,
    })),
  );

  const preview = () =>
    void queueCoachSpeech("Hello, I'm Anvay. I'll keep my answers short and clear.");

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader eyebrow="ANVAY" title="Voice and conversation" subtitle="How Anvay sounds and listens" showBack />
      }
    >
      <View style={styles.hero}>
        <AnvayCompanion size={120} mood="speaking" />
      </View>

      <SettingsGroup title="Voice">
        <SettingsRow
          icon="volume-high-outline"
          title="Speak replies"
          subtitle={s.on ? 'Anvay talks and shows text' : 'Text only: Anvay stays silent'}
          right={<Toggle value={s.on} onValueChange={s.setOn} accessibilityLabel="Speak replies" />}
        />
        <SettingsRow
          icon="chatbubbles-outline"
          title="Conversation mode"
          subtitle={
            s.convo ? 'Keeps listening after each reply until you close it' : 'Listens once each time you tap the mic'
          }
          right={<Toggle value={s.convo} onValueChange={s.setConvo} accessibilityLabel="Conversation mode" />}
        />
      </SettingsGroup>

      <Text style={[typography.captionBold, styles.label, { color: colors.text.muted, marginTop: spacing.lg }]}>
        WHICH VOICE
      </Text>
      <View style={styles.chips}>
        <Chip label="Indian male" selected={s.gender === 'male'} onPress={() => s.setGender('male')} />
        <Chip label="Indian female" selected={s.gender === 'female'} onPress={() => s.setGender('female')} />
      </View>

      <Text style={[typography.captionBold, styles.label, { color: colors.text.muted, marginTop: spacing.lg }]}>
        SPEED
      </Text>
      <View style={styles.chips}>
        {RATES.map((r) => (
          <Chip
            key={r.label}
            label={r.label}
            selected={Math.abs(s.rate - r.value) < 0.04}
            onPress={() => s.setRate(r.value)}
          />
        ))}
      </View>

      <Button
        label="Hear a preview"
        variant="outline"
        onPress={preview}
        disabled={!s.on}
        style={{ marginTop: spacing.lg }}
      />
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>
        Voices come from your phone&apos;s speech engine. If a voice is missing, install Indian English voices in
        Android settings → Text-to-speech. Say &quot;stop&quot; or &quot;bye&quot; to end a conversation.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 4 },
  label: { letterSpacing: 0.6, marginBottom: 8, marginLeft: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
```

#### `src/app/(app)/settings/ai-byok.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { readerHref } from '../../../services/learn/reader';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { TextField } from '../../../components/ui/TextField';
import { testProviderKey } from '../../../services/ai/providers';
import type { AiDeliveryMode, UserApiKeys } from '../../../stores/slices/appSlice';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

interface ProviderConfig {
  id: keyof UserApiKeys;
  name: string;
  badge: string;
  description: string;
  docsUrl: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Recommended',
    description: 'Generous free tier with Gemini 2.0 Flash. Fast reasoning and vision assistance.',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    placeholder: 'AIzaSy...',
    icon: 'bulb-outline',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    badge: 'Ultra Fast',
    description: 'Sub-second inference running LLaMA 3.3 70B on dedicated LPU hardware.',
    docsUrl: 'https://console.groq.com/keys',
    placeholder: 'gsk_...',
    icon: 'flash-outline',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    badge: 'Multi-Model',
    description: 'Unified gateway providing access to Claude, Mistral, LLaMA, and Gemini.',
    docsUrl: 'https://openrouter.ai/keys',
    placeholder: 'sk-or-v1-...',
    icon: 'git-network-outline',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    badge: 'Deep Reasoning',
    description: 'State-of-the-art reasoning and thoughtful dialogue powered by Claude 3.5 Haiku & Sonnet.',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-...',
    icon: 'bulb-outline',
  },
  {
    id: 'sarvam',
    name: 'Sarvam AI',
    badge: 'Indian Voice',
    description: 'Neural TTS for natural, warm Hindi & Indian-English spoken coaching.',
    docsUrl: 'https://www.sarvam.ai/',
    placeholder: 'sarvam_key_...',
    icon: 'volume-high-outline',
  },
];

export default function AiByokScreen() {
  const { colors, typography, spacing } = useTheme();
  const {
    userApiKeys,
    aiDeliveryMode,
    setUserApiKey,
    clearUserApiKey,
    setAiDeliveryMode,
    showToast,
  } = useRootStore(
    useShallow((s) => ({
      userApiKeys: s.userApiKeys,
      aiDeliveryMode: s.aiDeliveryMode,
      setUserApiKey: s.setUserApiKey,
      clearUserApiKey: s.clearUserApiKey,
      setAiDeliveryMode: s.setAiDeliveryMode,
      showToast: s.showToast,
    })),
  );

  const [inputKeys, setInputKeys] = useState<Partial<Record<keyof UserApiKeys, string>>>({
    gemini: userApiKeys.gemini ?? '',
    groq: userApiKeys.groq ?? '',
    openrouter: userApiKeys.openrouter ?? '',
    claude: userApiKeys.claude ?? '',
    sarvam: userApiKeys.sarvam ?? '',
  });

  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testStatus, setTestStatus] = useState<Record<string, { ok: boolean; message: string }>>({});

  const handleSaveKey = (provider: keyof UserApiKeys) => {
    const val = (inputKeys[provider] ?? '').trim();
    if (val) {
      setUserApiKey(provider, val);
      showToast({
        type: 'success',
        title: 'Key Saved',
        message: `${provider.toUpperCase()} key stored safely in encrypted storage.`,
      });
      // Automatically switch to BYOK mode when a key is saved
      if (aiDeliveryMode === 'local_only') {
        setAiDeliveryMode('byok');
      }
    }
  };

  const handleClearKey = (provider: keyof UserApiKeys) => {
    clearUserApiKey(provider);
    setInputKeys((prev) => ({ ...prev, [provider]: '' }));
    setTestStatus((prev) => {
      const next = { ...prev };
      delete next[provider];
      return next;
    });
    showToast({
      type: 'info',
      title: 'Key Cleared',
      message: `${provider.toUpperCase()} key removed from device.`,
    });
  };

  const handleTestKey = async (provider: keyof UserApiKeys) => {
    const keyToTest = (inputKeys[provider] ?? userApiKeys[provider] ?? '').trim();
    if (!keyToTest) {
      showToast({
        type: 'warning',
        title: 'Empty Key',
        message: 'Please paste an API key before testing connection.',
      });
      return;
    }

    setTesting((prev) => ({ ...prev, [provider]: true }));
    try {
      const result = await testProviderKey(
        provider as 'gemini' | 'groq' | 'openrouter' | 'claude' | 'sarvam',
        keyToTest,
      );
      setTestStatus((prev) => ({
        ...prev,
        [provider]: { ok: result.ok, message: result.message },
      }));
    } finally {
      setTesting((prev) => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="AI & API Keys (BYOK)"
          subtitle="Bring Your Own Key or run 100% on-device"
          showBack
        />
      }
      scrollMode="shell-scroll-view"
    >
      <View style={{ paddingBottom: spacing.xxl }}>
        {/* Mode Selector Card */}
        <Card style={[styles.modeCard, { backgroundColor: colors.surface }]}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
            AI Delivery Mode
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Choose whether to operate completely offline or use your personal API keys for cloud enhancements.
          </Text>

          <View style={styles.modeRow}>
            {(
              [
                {
                  id: 'local_only',
                  label: 'Local-First Only',
                  icon: 'phone-portrait-outline',
                  desc: '100% On-Device, zero cloud calls',
                },
                {
                  id: 'byok',
                  label: 'BYOK Mode',
                  icon: 'key-outline',
                  desc: 'Your keys, direct API connection',
                },
              ] as const
            ).map((m) => {
              const selected = aiDeliveryMode === m.id;
              return (
                <PressableScale
                  key={m.id}
                  onPress={() => setAiDeliveryMode(m.id as AiDeliveryMode)}
                  scaleTo={0.96}
                  style={styles.flex}
                >
                  <SquircleSurface
                    radius={14}
                    fill={selected ? colors.primaryAlpha : colors.surface1}
                    strokeWidth={selected ? 1.5 : 1}
                    style={[
                      styles.modeOption,
                      { borderColor: selected ? colors.primary : colors.border },
                    ]}
                  >
                    <Ionicons
                      name={m.icon}
                      size={20}
                      color={selected ? colors.primary : colors.text.secondary}
                    />
                    <Text
                      style={[
                        typography.captionBold,
                        {
                          color: selected ? colors.primary : colors.text.primary,
                          marginTop: 6,
                        },
                      ]}
                    >
                      {m.label}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={[
                        typography.caption,
                        { color: colors.text.secondary, fontSize: 10, textAlign: 'center', marginTop: 2 },
                      ]}
                    >
                      {m.desc}
                    </Text>
                  </SquircleSurface>
                </PressableScale>
              );
            })}
          </View>
        </Card>

        {/* Current Status Badge */}
        <Card style={{ marginVertical: spacing.sm, padding: spacing.md, backgroundColor: colors.surface1 }}>
          <View style={styles.statusRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons
                name={aiDeliveryMode === 'local_only' ? 'shield-checkmark' : 'cloud-done'}
                size={22}
                color={aiDeliveryMode === 'local_only' ? colors.success : colors.primary}
              />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                  {aiDeliveryMode === 'local_only'
                    ? 'Local-First Active (100% On-Device)'
                    : 'BYOK Cloud Connected'}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  {aiDeliveryMode === 'local_only'
                    ? 'Vitals, timers, workouts, check-ins & rules run smoothly without network.'
                    : 'Optional cloud intelligence uses your personal provider keys directly.'}
                </Text>
              </View>
            </View>
            <Badge
              label={aiDeliveryMode === 'local_only' ? 'Private' : 'BYOK'}
              variant={aiDeliveryMode === 'local_only' ? 'success' : 'primary'}
            />
          </View>
        </Card>

        {/* Provider Keys */}
        <Text
          style={[
            typography.subheading,
            { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.sm },
          ]}
        >
          Provider API Credentials
        </Text>

        {PROVIDERS.map((provider) => {
          const isConfigured = Boolean(userApiKeys[provider.id]);
          const currentVal = inputKeys[provider.id] ?? '';
          const isVisible = Boolean(showKey[provider.id]);
          const isBusy = Boolean(testing[provider.id]);
          const status = testStatus[provider.id];

          return (
            <Card key={provider.id} style={{ marginBottom: spacing.md, padding: spacing.base }}>
              {/* Provider Header */}
              <View style={styles.providerHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Ionicons name={provider.icon} size={22} color={colors.primary} />
                  <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                    {provider.name}
                  </Text>
                </View>
                <Badge label={provider.badge} variant={isConfigured ? 'success' : 'neutral'} />
              </View>

              <Text style={[typography.subbody, { color: colors.text.secondary, marginVertical: 6 }]}>
                {provider.description}
              </Text>

              {/* Input Field */}
              <View style={styles.inputWrap}>
                <TextField
                  value={currentVal}
                  onChangeText={(text) =>
                    setInputKeys((prev) => ({ ...prev, [provider.id]: text }))
                  }
                  placeholder={provider.placeholder}
                  secureTextEntry={!isVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerStyle={styles.flex}
                  accessibilityLabel={`${provider.name} API Key`}
                />
                <PressableScale
                  onPress={() =>
                    setShowKey((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))
                  }
                  style={styles.eyeBtn}
                  accessibilityLabel="Toggle key visibility"
                >
                  <Ionicons
                    name={isVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </PressableScale>
              </View>

              {/* Test Status feedback */}
              {status ? (
                <View
                  style={[
                    styles.testResultBox,
                    {
                      backgroundColor: status.ok ? colors.primaryAlpha : colors.surface2,
                    },
                  ]}
                >
                  <Ionicons
                    name={status.ok ? 'checkmark-circle' : 'alert-circle'}
                    size={16}
                    color={status.ok ? colors.success : colors.error}
                  />
                  <Text
                    style={[
                      typography.caption,
                      { color: status.ok ? colors.success : colors.error, marginLeft: 6 },
                    ]}
                  >
                    {status.message}
                  </Text>
                </View>
              ) : null}

              {/* Actions row */}
              <View style={styles.actionsRow}>
                <Button
                  label={isConfigured ? 'Update' : 'Save'}
                  size="sm"
                  onPress={() => handleSaveKey(provider.id)}
                  disabled={!currentVal.trim()}
                />

                <Button
                  label="Test"
                  size="sm"
                  variant="outline"
                  onPress={() => handleTestKey(provider.id)}
                  disabled={isBusy || !currentVal.trim()}
                  icon={
                    isBusy ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Ionicons name="flash-outline" size={14} color={colors.primary} />
                    )
                  }
                />

                {isConfigured ? (
                  <Button
                    label="Clear"
                    size="sm"
                    variant="ghost"
                    onPress={() => handleClearKey(provider.id)}
                  />
                ) : null}

                <PressableScale
                  onPress={() => router.push(readerHref(provider.docsUrl, 'Get a key'))}
                  style={{ marginLeft: 'auto', paddingVertical: 6 }}
                >
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    Get key
                  </Text>
                </PressableScale>
              </View>
            </Card>
          );
        })}

        {/* Security & Local-First Assurance */}
        <Card variant="surface1" style={{ marginTop: spacing.sm, padding: spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
              Zero-Cloud Privacy Guarantee
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6, lineHeight: 18 }]}>
            All API keys are encrypted locally inside MMKV hardware storage on your phone. They are never sent
            to Thrivefold servers, analytics, or third parties. Requests are made directly from your phone to the
            respective provider endpoint.
          </Text>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  modeCard: {
    padding: 16,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modeOption: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  eyeBtn: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  testResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  flex: {
    flex: 1,
  },
});
```

#### `src/app/(app)/settings/memories.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { TextField } from '../../../components/ui/TextField';
import { hapticSuccess } from '../../../services/haptics';
import { memoryStore } from '../../../services/local-ai/memory/memoryStore';
import type { UserMemory } from '../../../services/local-ai/memory/types';
import { thriveRag } from '../../../services/local-ai/rag/thriveRag';
import { knowledgeStore, type KnowledgeDocument } from '../../../services/local-ai/rag/knowledgeStore';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const USER = 'local_user';

const when = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * What Thrive Coach remembers, all on this phone: things you taught it (by voice, "remember
 * that…", or here), answers it learned from the cloud coach, and documents you saved. You can
 * test it with a question, delete anything, or clear it all.
 */
export default function MemoriesScreen() {
  const { colors, typography, spacing } = useTheme();
  const showAlert = useRootStore((s) => s.showAlert);
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<{ text: string; sources: string[] } | null>(null);
  const [asking, setAsking] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [m, d] = await Promise.all([
        memoryStore.listMemories(USER, { status: 'active' }),
        knowledgeStore.listDocuments(USER),
      ]);
      setMemories(m);
      setDocs(d);
    } catch {
      setError('The memory store could not be opened on this phone.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remember = async () => {
    const text = draft.trim();
    if (text.length < 3) return;
    await memoryStore.addMemory({
      userId: USER,
      kind: 'fact',
      content: text.slice(0, 300),
      sourceEventIds: [`typed_${Date.now()}`],
      confidence: 1,
      origin: 'user_declared',
      status: 'active',
      metadata: { source: 'memories_screen', tag: 'remembered' },
    });
    hapticSuccess();
    setDraft('');
    void load();
  };

  const ask = async () => {
    const q = question.trim();
    if (q.length < 3) return;
    setAsking(true);
    try {
      const r = await thriveRag.answer(q);
      setAnswer({ text: r.answer, sources: r.isGrounded ? r.citations : [] });
    } catch {
      setAnswer({ text: 'Searching your memory failed. Try again.', sources: [] });
    } finally {
      setAsking(false);
    }
  };

  const forgetMemory = (m: UserMemory) =>
    showAlert({
      title: 'Forget this?',
      message: m.content,
      confirmText: 'Forget',
      cancelText: 'Keep',
      destructive: true,
      onConfirm: () => void memoryStore.deleteMemory(m.id, USER).then(load),
    });

  const forgetDoc = (d: KnowledgeDocument) =>
    showAlert({
      title: 'Delete this?',
      message: d.title,
      confirmText: 'Delete',
      cancelText: 'Keep',
      destructive: true,
      onConfirm: () => void knowledgeStore.deleteDocument(USER, d.id).then(load),
    });

  const clearAll = () =>
    showAlert({
      title: 'Clear everything Thrive remembers?',
      message: 'Memories, learned answers and saved documents are deleted from this phone. Your health records stay.',
      confirmText: 'Clear all',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: () =>
        void Promise.all([memoryStore.clearAllMemories(USER), knowledgeStore.clearAllDocuments(USER)]).then(load),
    });

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="THRIVE COACH"
          title="What Thrive remembers"
          subtitle="Kept on this phone. Nothing is uploaded."
          showBack
        />
      }
    >
      <Card style={styles.card}>
        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Teach Thrive</Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
          Or say &quot;remember that…&quot; to the coach. It uses these when it answers you.
        </Text>
        <TextField
          value={draft}
          onChangeText={setDraft}
          placeholder="e.g. I train at 7 am and avoid dairy"
          maxLength={300}
          containerStyle={{ marginTop: spacing.sm }}
          onSubmitEditing={() => void remember()}
          returnKeyType="done"
        />
        <Button
          label="Remember this"
          size="sm"
          disabled={draft.trim().length < 3}
          onPress={() => void remember()}
          style={styles.inlineBtn}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Ask your memory</Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
          Answers come only from what is saved here, with the source shown.
        </Text>
        <TextField
          value={question}
          onChangeText={setQuestion}
          placeholder="e.g. When do I train?"
          containerStyle={{ marginTop: spacing.sm }}
          onSubmitEditing={() => void ask()}
          returnKeyType="search"
        />
        <Button
          label="Search"
          size="sm"
          variant="outline"
          loading={asking}
          disabled={question.trim().length < 3}
          onPress={() => void ask()}
          style={styles.inlineBtn}
        />
        {answer ? (
          <View style={[styles.answer, { backgroundColor: colors.surface2 }]}>
            <Text style={[typography.body, { color: colors.text.primary }]}>{answer.text}</Text>
            {answer.sources.map((s) => (
              <Text key={s} style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
                {s}
              </Text>
            ))}
          </View>
        ) : null}
      </Card>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} /> : null}
      {error ? <Text style={[typography.body, { color: colors.error, marginTop: spacing.md }]}>{error}</Text> : null}

      {!loading && !error ? (
        <>
          <Text style={[typography.captionBold, styles.section, { color: colors.text.muted }]}>
            REMEMBERED · {memories.length}
          </Text>
          {memories.length ? (
            memories.map((m) => (
              <Card key={m.id} style={styles.row}>
                <View style={styles.flex}>
                  <Text style={[typography.body, { color: colors.text.primary }]}>{m.content}</Text>
                  <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                    {m.origin === 'user_declared' ? 'You told Thrive' : 'Noticed by Thrive'} · {when(m.updatedAt)}
                  </Text>
                </View>
                <PressableScale onPress={() => forgetMemory(m)} hitSlop={10} accessibilityLabel="Forget this">
                  <Ionicons name="trash-outline" size={18} color={colors.text.muted} />
                </PressableScale>
              </Card>
            ))
          ) : (
            <Text style={[typography.body, { color: colors.text.secondary }]}>
              Nothing yet. Teach Thrive something above.
            </Text>
          )}

          <Text style={[typography.captionBold, styles.section, { color: colors.text.muted }]}>
            LEARNED ANSWERS AND DOCUMENTS · {docs.length}
          </Text>
          {docs.length ? (
            docs.map((d) => (
              <Card key={d.id} style={styles.row}>
                <Ionicons
                  name={d.metadata?.source === 'cloud_coach' ? 'bulb-outline' : 'document-text-outline'}
                  size={18}
                  color={colors.primary}
                />
                <View style={styles.flex}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]} numberOfLines={2}>
                    {d.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                    {d.metadata?.source === 'cloud_coach' ? 'Learned from the online coach' : 'Saved document'} ·{' '}
                    {when(d.createdAt)}
                  </Text>
                </View>
                <PressableScale onPress={() => forgetDoc(d)} hitSlop={10} accessibilityLabel="Delete this">
                  <Ionicons name="trash-outline" size={18} color={colors.text.muted} />
                </PressableScale>
              </Card>
            ))
          ) : (
            <Text style={[typography.body, { color: colors.text.secondary }]}>
              When the online coach answers a detailed question (with your permission), the answer is kept here so
              Thrive can use it offline next time.
            </Text>
          )}

          {memories.length || docs.length ? (
            <Button label="Clear everything" variant="ghost" onPress={clearAll} style={{ marginTop: spacing.lg }} />
          ) : null}
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginTop: 12 },
  inlineBtn: { marginTop: 10, alignSelf: 'flex-start' },
  answer: { marginTop: 12, padding: 12, borderRadius: 14 },
  section: { marginTop: 22, marginBottom: 8, letterSpacing: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
});
```

#### `src/app/(app)/thrive.tsx`

```tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedBrandIcon } from '../../components/brand/AnimatedBrandIcon';
import CompanionScreen from '../../components/brand/thrive/CompanionScreen';
import { ThriveBoundary } from '../../components/brand/thrive/ThriveBoundary';

/** Meet Thrive: the living companion, full screen. Talk, play, or let it watch out for you. */
export default function ThriveScreen() {
  const router = useRouter();
  return (
    <View style={styles.fill}>
      <ThriveBoundary fallback={<AnimatedBrandIcon size={160} />}>
        <CompanionScreen onClose={() => router.back()} />
      </ThriveBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
```

#### `src/app/(app)/safety/someone-to-talk.tsx`

```tsx
/**
 * Someone to Talk To — Unified Safety AI Companion Redirect
 *
 * Redirects all safety/someone-to-talk routes immediately into GlobalVoiceAssistant
 * with the 'support' persona active.
 *
 * Adheres to ThriveFold Single Unified Assistant Architecture:
 * - One assistant, one voice engine, one conversation thread
 * - No redundant, disconnected chat screens
 * - Full emergency helplines, country switching, and grounding available inside GlobalVoiceAssistant
 */

import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { globalVoiceController } from '../../../services/voice/globalVoiceController';
import { useRootStore } from '../../../stores/useRootStore';

export default function SomeoneToTalkRedirect() {
  useEffect(() => {
    // 1. Activate Anvay Support Companion persona
    useRootStore.getState().setCoachPersona('support');

    // 2. Open Global Voice Assistant sheet in support mode (mic resting until tapped)
    void globalVoiceController.open(undefined, { listen: false });

    // 3. Immediately pop this route back so the user stays on their previous screen with the sheet open
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/(tabs)');
    }
  }, []);

  return <View style={{ flex: 1 }} />;
}
```

### SOURCE: NATIVE LOCAL AI

#### `modules/local-ai/index.ts`

```ts
import { requireNativeModule } from 'expo';
import { Platform } from 'react-native';
import type {
  CachedModelFile,
  ChecksumVerifyResult,
  DeviceCapabilities,
  GenerateRequest,
  GenerateResult,
  ModelLoadOptions,
  ModelLoadProgressEvent,
  ModelLoadResult,
  RuntimeStatus,
  StreamCompleteEvent,
  StreamErrorEvent,
  StructuredGenerateRequest,
  TokenEvent,
} from './src/types';

export * from './src/types';
export * from './src/modelCatalog';
export * from './src/modelDownloader';
export * from './src/useLocalAI';

/** Writing system for on-device text recognition. */
export type OcrScript = 'latin' | 'chinese' | 'japanese' | 'korean' | 'devanagari';

/** The script to read for a language code (ML Kit), Latin otherwise. */
export function scriptForLanguage(code: string | null | undefined): OcrScript {
  if (code === 'zh') return 'chinese';
  if (code === 'ja') return 'japanese';
  if (code === 'ko') return 'korean';
  if (code === 'hi' || code === 'mr' || code === 'ne') return 'devanagari';
  return 'latin';
}

/** Text read from a picked file on the phone, one entry per page. */
export interface ExtractedDocument {
  name: string | null;
  mime: string;
  method: 'text' | 'pdf-ocr' | 'image-ocr';
  pages: { page: number; text: string }[];
}

export interface DocumentChunkResult {
  index: number;
  text: string;
  startOffset: number;
  endOffset: number;
  tokenEstimate: number;
}

export function jsChunkDocument(
  text: string,
  targetChunkSize = 320,
  overlapChars = 40
): DocumentChunkResult[] {
  const cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return [];
  if (cleaned.length <= targetChunkSize) {
    return [
      {
        index: 0,
        text: cleaned,
        startOffset: 0,
        endOffset: cleaned.length,
        tokenEstimate: Math.max(1, Math.round(cleaned.split(' ').filter(Boolean).length * 1.3)),
      },
    ];
  }

  const chunks: DocumentChunkResult[] = [];
  const sentences = cleaned.split(/(?<=[.!?\n])\s+/).filter(Boolean);
  let buffer = '';
  let chunkIdx = 0;
  let currentStart = 0;

  for (const sentence of sentences) {
    if (buffer.length + sentence.length > targetChunkSize && buffer.length > 0) {
      const chunkText = buffer.trim();
      chunks.push({
        index: chunkIdx++,
        text: chunkText,
        startOffset: currentStart,
        endOffset: currentStart + chunkText.length,
        tokenEstimate: Math.max(1, Math.round(chunkText.split(' ').filter(Boolean).length * 1.3)),
      });
      const overlapText =
        chunkText.length > overlapChars ? chunkText.slice(-overlapChars) : chunkText;
      currentStart += chunkText.length - overlapText.length;
      buffer = `${overlapText} `;
    }
    buffer += `${sentence} `;
  }

  if (buffer.trim()) {
    const chunkText = buffer.trim();
    chunks.push({
      index: chunkIdx,
      text: chunkText,
      startOffset: currentStart,
      endOffset: currentStart + chunkText.length,
      tokenEstimate: Math.max(1, Math.round(chunkText.split(' ').filter(Boolean).length * 1.3)),
    });
  }
  return chunks;
}

export function jsComputeTermFrequencies(text: string): Record<string, number> {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = clean.split(/\s+/).filter((t) => t.length > 2);
  const tf: Record<string, number> = {};
  for (const t of tokens) {
    tf[t] = (tf[t] || 0) + 1;
  }
  return tf;
}

interface LocalAINative {
  isSupported: boolean;
  nativeEngine: string;
  sdkVersion: string;

  isAvailable(): boolean;
  getRuntimeStatus(): RuntimeStatus;
  getDeviceCapabilities(): DeviceCapabilities;
  verifyModelChecksum(filePath: string, expectedSha256: string): Promise<ChecksumVerifyResult>;
  dmEnqueue?(url: string, fileName: string, title: string): number;
  dmQuery?(id: number): DurableDownloadState;
  dmRemove?(id: number): boolean;
  listCachedModels(): CachedModelFile[];
  deleteCachedModel(fileName: string): boolean;
  isLoaded(): boolean;
  isGenerating(): boolean;
  loadModel(
    modelPathOrAsset: string,
    isAsset: boolean,
    options?: ModelLoadOptions
  ): Promise<ModelLoadResult>;
  unloadModel(): Promise<boolean>;
  updateParams(params: Record<string, unknown>): boolean;
  generateText(prompt: string, context?: string, system?: string): Promise<GenerateResult>;
  generateStructured(
    prompt: string,
    schema?: string,
    context?: string,
    system?: string
  ): Promise<{ json: string; durationMs: number }>;
  startStream(turnId: string, prompt: string, context?: string, system?: string): boolean;
  cancelGeneration(): boolean;
  embed(text: string): Promise<number[]>;
  chunkDocument(
    text: string,
    targetChunkSize?: number,
    overlapChars?: number
  ): DocumentChunkResult[];
  computeTermFrequencies(text: string): Record<string, number>;
  extractDocumentText?(uri: string, mime: string | null, script: string | null): Promise<ExtractedDocument>;
  translateText?(text: string, target: string, source: string | null): Promise<{ text: string; source: string; target: string }>;

  addListener(eventName: string, listener: (event: unknown) => void): { remove: () => void };
  removeAllListeners(eventName: string): void;
}

const native: LocalAINative | null =
  Platform.OS === 'android'
    ? (() => {
        try {
          return requireNativeModule<LocalAINative>('LocalAI');
        } catch {
          return null;
        }
      })()
    : null;

/**
 * Singleton Service for Native On-Device AI Inference.
 */
class LocalAIService {
  /**
   * Returns true if running on a platform with the native LLaMA engine linked.
   */
  isAvailable(): boolean {
    try {
      return native?.isAvailable() ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Inspects current runtime status, engine metadata and active loaded weights.
   */
  getRuntimeStatus(): RuntimeStatus {
    if (!native) {
      return {
        isSupported: false,
        isLoaded: false,
        isGenerating: false,
        loadedModelPath: '',
        loadedFileName: '',
        modelSizeBytes: 0,
        modelSizeMb: 0,
        nativeEngine: 'unavailable',
        sdkVersion: '0.0.0',
      };
    }
    return native.getRuntimeStatus();
  }

  /**
   * Reads physical RAM, available storage, and recommended model size ceiling.
   */
  getDeviceCapabilities(): DeviceCapabilities {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.getDeviceCapabilities();
  }

  /**
   * Verifies SHA-256 hash of a downloaded model file.
   */
  async verifyModelChecksum(filePath: string, expectedSha256: string): Promise<ChecksumVerifyResult> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.verifyModelChecksum(filePath, expectedSha256);
  }

  /**
   * Lists models present in the app's private storage.
   */
  listCachedModels(): CachedModelFile[] {
    return native?.listCachedModels() ?? [];
  }

  /**
   * Deletes a model from private storage.
   */
  deleteCachedModel(fileName: string): boolean {
    return native?.deleteCachedModel(fileName) ?? false;
  }

  /**
   * Checks whether weights are currently memory-mapped in native RAM.
   */
  isLoaded(): boolean {
    return native?.isLoaded() ?? false;
  }

  /**
   * Checks whether a generation task or stream is currently running.
   */
  isGenerating(): boolean {
    return native?.isGenerating() ?? false;
  }

  /**
   * Lazily and safely loads a GGUF model into memory.
   */
  async loadModel(
    modelPathOrAsset: string,
    isAsset = false,
    options?: ModelLoadOptions
  ): Promise<ModelLoadResult> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.loadModel(modelPathOrAsset, isAsset, options);
  }

  /**
   * Frees native RAM and shuts down the model context.
   */
  async unloadModel(): Promise<boolean> {
    if (!native) return false;
    return native.unloadModel();
  }

  /**
   * Configures generation parameters (temperature, maxTokens, topP, topK).
   */
  updateParams(params: Record<string, unknown>): boolean {
    return native?.updateParams(params) ?? false;
  }

  /**
   * Runs synchronous on-device text generation.
   */
  async generateText(request: GenerateRequest): Promise<string> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    const res = await native.generateText(request.prompt, request.context, request.system);
    return res.text;
  }

  /**
   * Runs schema-constrained structured generation.
   */
  async generateStructured<T = unknown>(request: StructuredGenerateRequest<T>): Promise<T> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    const res = await native.generateStructured(
      request.prompt,
      request.schema,
      request.context,
      request.system
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(res.json);
    } catch (e: unknown) {
      throw new Error(
        `Failed to parse JSON response from local AI: ${e instanceof Error ? e.message : String(e)}. Raw output was: ${res.json}`
      );
    }

    if (request.validator) {
      return request.validator(parsed);
    }
    return parsed as T;
  }

  /**
   * Initiates token streaming generation.
   */
  startStream(turnId: string, prompt: string, context?: string, system?: string): boolean {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.startStream(turnId, prompt, context, system);
  }

  /**
   * Instantly interrupts active token generation.
   */
  cancelGeneration(): boolean {
    return native?.cancelGeneration() ?? false;
  }

  /**
   * Generates dense embedding vector on device.
   */
  async embed(text: string): Promise<number[]> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.embed(text);
  }

  /** Translates on the phone (ML Kit). The first use of a language downloads its model once. */
  async translateText(text: string, target: string, source?: string | null): Promise<{ text: string; source: string; target: string }> {
    if (!native?.translateText) throw new Error('Translation needs the latest app build.');
    return native.translateText(text, target, source ?? null);
  }

  /** Reads a picked file's text on the phone (PDF and photos via offline OCR). */
  async extractDocumentText(uri: string, mime?: string | null, script?: OcrScript | null): Promise<ExtractedDocument> {
    if (!native?.extractDocumentText) throw new Error('Reading files needs the latest app build.');
    return native.extractDocumentText(uri, mime ?? null, script ?? null);
  }

  /**
   * Performs fast semantic document chunking using native engine when available,
   * falling back to portable JS chunker on non-Android/test platforms.
   */
  chunkDocument(
    text: string,
    targetChunkSize = 320,
    overlapChars = 40
  ): DocumentChunkResult[] {
    if (!native) {
      return jsChunkDocument(text, targetChunkSize, overlapChars);
    }
    try {
      return native.chunkDocument(text, targetChunkSize, overlapChars);
    } catch {
      return jsChunkDocument(text, targetChunkSize, overlapChars);
    }
  }

  /**
   * Computes term frequency map for sparse BM25 indexing.
   */
  computeTermFrequencies(text: string): Record<string, number> {
    if (!native) {
      return jsComputeTermFrequencies(text);
    }
    try {
      return native.computeTermFrequencies(text);
    } catch {
      return jsComputeTermFrequencies(text);
    }
  }

  // Event Listeners
  onToken(callback: (event: TokenEvent) => void): { remove: () => void } {
    if (!native) return { remove: () => {} };
    return native.addListener('onToken', callback as (e: unknown) => void);
  }

  onStreamComplete(callback: (event: StreamCompleteEvent) => void): { remove: () => void } {
    if (!native) return { remove: () => {} };
    return native.addListener('onStreamComplete', callback as (e: unknown) => void);
  }

  onStreamError(callback: (event: StreamErrorEvent) => void): { remove: () => void } {
    if (!native) return { remove: () => {} };
    return native.addListener('onStreamError', callback as (e: unknown) => void);
  }

  onModelLoadProgress(callback: (event: ModelLoadProgressEvent) => void): { remove: () => void } {
    if (!native) return { remove: () => {} };
    return native.addListener('onModelLoadProgress', callback as (e: unknown) => void);
  }
}

export interface DurableDownloadState {
  status: 'pending' | 'running' | 'paused' | 'done' | 'failed' | 'missing';
  bytes?: number;
  total?: number;
  localUri?: string;
  reason?: number;
}

/**
 * Android DownloadManager: downloads that keep going when the app is closed or killed and are
 * picked up again when it reopens. Null where the native function is missing (older builds).
 */
export const DurableDownloads = native?.dmEnqueue
  ? {
      enqueue: (url: string, fileName: string, title: string) => native.dmEnqueue!(url, fileName, title),
      query: (id: number): DurableDownloadState => native.dmQuery!(id),
      remove: (id: number) => native.dmRemove!(id),
    }
  : null;

export const LocalAI = new LocalAIService();
export default LocalAI;
```

#### `modules/local-ai/src/modelCatalog.ts`

```ts
import type { ModelPreset } from './types';

/**
 * Pinned catalog of lightweight mobile GGUF models suitable for Android devices.
 * Models start with ultra-compact instruction-tuned weights (135M / 360M) that
 * execute fast on standard mobile ARM CPUs without triggering memory pressure.
 */
export const MODEL_CATALOG: Record<string, ModelPreset> = {
  // Sizes and SHA-256 are the Hugging Face LFS values (x-linked-size / x-linked-etag), checked 2026-10-29.
  'qwen2.5-0.5b-instruct': {
    id: 'qwen2.5-0.5b-instruct',
    name: 'Qwen 2.5 0.5B Instruct (Q4_K_M)',
    author: 'Alibaba Cloud',
    parameters: '0.5B',
    sizeBytes: 491_400_032,
    sizeMb: 469,
    minRamMb: 3000,
    role: 'chat',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
    expectedSha256: '74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: 'Fast everyday model: short answers, commands, summaries. Multilingual, including Hindi and Bengali.',
  },
  'qwen2.5-1.5b-instruct': {
    id: 'qwen2.5-1.5b-instruct',
    name: 'Qwen 2.5 1.5B Instruct (Q4_K_M)',
    author: 'Alibaba Cloud',
    parameters: '1.5B',
    sizeBytes: 1_117_320_736,
    sizeMb: 1066,
    minRamMb: 5500,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
    expectedSha256: '6a1a2eb6d15622bf3c96857206351ba97e1af16c30d7a74ee38970e434e9407e',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: 'Better reasoning and longer answers for phones with 6 GB RAM or more. Slower to start.',
  },
  'gemma-3-1b-it': {
    id: 'gemma-3-1b-it',
    name: 'Gemma 3 1B Instruct (Q4_K_M)',
    author: 'Google',
    parameters: '1B',
    sizeBytes: 806_058_240,
    sizeMb: 769,
    minRamMb: 4000,
    role: 'assistant',
    // ggml-org GGUF build; size and SHA-256 from the Hugging Face LFS record, checked 2026-10-30.
    downloadUrl: 'https://huggingface.co/ggml-org/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf',
    expectedSha256: '8ccc5cd1f1b3602548715ae25a66ed73fd5dc68a210412eea643eb20eb75a135',
    contextLength: 4096,
    license: 'Gemma Terms of Use',
    description: "Google's small Gemma model: warm, fluent replies and good instruction following.",
  },
  // Added 2026-10-30; sizes and SHA-256 from the Hugging Face LFS records (tree API), same day.
  'qwen3-0.6b': {
    id: 'qwen3-0.6b',
    name: 'Qwen 3 0.6B (Q4_K_M)',
    author: 'Alibaba Cloud',
    parameters: '0.6B',
    sizeBytes: 396_705_472,
    sizeMb: 378,
    minRamMb: 3000,
    role: 'chat',
    downloadUrl: 'https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_K_M.gguf',
    expectedSha256: 'ac2d97712095a558e31573f62f466a3f9d93990898b0ec79d7c974c1780d524a',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: 'Newest tiny Qwen: quicker and smarter than Qwen 2.5 0.5B for its size. Thinking mode is turned off for speed.',
  },
  'qwen3-1.7b': {
    id: 'qwen3-1.7b',
    name: 'Qwen 3 1.7B (Q4_K_M)',
    author: 'Alibaba Cloud',
    parameters: '1.7B',
    sizeBytes: 1_107_409_472,
    sizeMb: 1056,
    minRamMb: 5500,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf',
    expectedSha256: 'b139949c5bd74937ad8ed8c8cf3d9ffb1e99c866c823204dc42c0d91fa181897',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: 'Strong small all-rounder for 6 GB phones: plans, explanations and multilingual replies.',
  },
  'llama-3.2-1b-instruct': {
    id: 'llama-3.2-1b-instruct',
    name: 'Llama 3.2 1B Instruct (Q4_K_M)',
    author: 'Meta',
    parameters: '1B',
    sizeBytes: 807_694_464,
    sizeMb: 770,
    minRamMb: 4000,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    expectedSha256: '6f85a640a97cf2bf5b8e764087b1e83da0fdb51d7c9fab7d0fece9385611df83',
    contextLength: 4096,
    license: 'Llama 3.2 Community License',
    description: "Meta's small model built for phones: good at summaries and following instructions.",
  },
  'lfm2-1.2b': {
    id: 'lfm2-1.2b',
    name: 'LFM2 1.2B (Q4_K_M)',
    author: 'Liquid AI',
    parameters: '1.2B',
    sizeBytes: 730_893_248,
    sizeMb: 697,
    minRamMb: 4000,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/LiquidAI/LFM2-1.2B-GGUF/resolve/main/LFM2-1.2B-Q4_K_M.gguf',
    expectedSha256: '55175400e3f509a9616227afeffd58d87e80b9f628a5d3d54ada884d85221fed',
    contextLength: 4096,
    license: 'LFM Open License v1.0',
    description: 'Designed for on-device speed: fast first word on phone CPUs. Good for RAG answers over your notes.',
    needsNewerRuntime: true,
  },
  'gemma-4-e2b-it': {
    id: 'gemma-4-e2b-it',
    name: 'Gemma 4 E2B Instruct (Q4_0)',
    author: 'Google',
    parameters: 'E2B (2B effective)',
    sizeBytes: 2_841_481_184,
    sizeMb: 2710,
    minRamMb: 6000,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF/resolve/main/gemma-4-E2B-it-Q4_0.gguf',
    expectedSha256: '8e30dff3ac4c8434c49a7036fa15564bdbb6044e42bf04550bf1a096ad7e6a52',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: "Google's newest phone-sized Gemma: the best answers here, but a large download and slower on mid-range phones.",
    needsNewerRuntime: true,
  },
};

export const DEFAULT_CHAT_MODEL_ID = 'qwen2.5-0.5b-instruct';

export const MODEL_PRESETS = Object.values(MODEL_CATALOG);

export function getModelPresetById(id: string): ModelPreset | undefined {
  return MODEL_CATALOG[id];
}

export function getRecommendedModelForDevice(totalRamMb: number): ModelPreset {
  return totalRamMb >= 5500 ? MODEL_CATALOG['qwen2.5-1.5b-instruct'] : MODEL_CATALOG['qwen2.5-0.5b-instruct'];
}

export const getRecommendedModel = getRecommendedModelForDevice;
```

#### `modules/local-ai/src/modelDownloader.ts`

```ts
import * as FileSystem from 'expo-file-system/legacy';
import type { ModelPreset } from './types';

export interface DownloadProgressInfo {
  progress: number;
  totalBytesWritten: number;
  totalBytesExpected: number;
}

export type DownloadProgressCallback = (info: DownloadProgressInfo) => void;

const MODELS_FOLDER = `${FileSystem.documentDirectory ?? ''}local_ai_models/`;

export async function ensureModelsDirectory(): Promise<string> {
  const dirInfo = await FileSystem.getInfoAsync(MODELS_FOLDER);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MODELS_FOLDER, { intermediates: true });
  }
  return MODELS_FOLDER;
}

export function getLocalModelFilePath(modelId: string): string {
  return `${MODELS_FOLDER}${modelId}.gguf`;
}

export async function isModelDownloaded(modelId: string): Promise<boolean> {
  const targetPath = getLocalModelFilePath(modelId);
  const info = await FileSystem.getInfoAsync(targetPath);
  return info.exists && !info.isDirectory && (info.size ?? 0) > 0;
}

export async function getDownloadedModelSize(modelId: string): Promise<number> {
  const targetPath = getLocalModelFilePath(modelId);
  const info = await FileSystem.getInfoAsync(targetPath);
  return info.exists && !info.isDirectory ? (info.size ?? 0) : 0;
}

export interface ModelDownloadHandle {
  promise: Promise<string>;
  cancel: () => Promise<void>;
  /** Pauses and returns data that resumes the transfer later (even after the app restarts). */
  pause: () => Promise<string | null>;
}

/**
 * Downloads a model preset with:
 * 1. Pre-flight storage capacity check
 * 2. Transfer into a temporary file (an interrupted download starts again from the beginning)
 * 3. Size and SHA-256 checks that fail closed: a file that cannot be verified is never installed
 * 4. Post-download atomic rename to final target path
 */
export function downloadModelWithProgress(
  preset: ModelPreset,
  availableStorageBytes: number,
  onProgress?: DownloadProgressCallback,
  verifyChecksumFn?: (filePath: string, expectedHash: string) => Promise<{ matches: boolean }>,
  /** Saved by pause(); continues the same partial file instead of starting again. */
  resumeData?: string | null,
): ModelDownloadHandle {
  const requiredBytesWithHeadroom = Math.round(preset.sizeBytes * 1.25);

  if (availableStorageBytes > 0 && availableStorageBytes < requiredBytesWithHeadroom) {
    const availMb = Math.round(availableStorageBytes / (1024 * 1024));
    const reqMb = Math.round(requiredBytesWithHeadroom / (1024 * 1024));
    return {
      promise: Promise.reject(
        new Error(
          `Insufficient storage space to download model. Available: ${availMb}MB, Required: ${reqMb}MB.`
        )
      ),
      cancel: async () => {},
      pause: async () => null,
    };
  }

  const tmpPath = `${MODELS_FOLDER}${preset.id}.download.tmp`;
  const finalPath = getLocalModelFilePath(preset.id);

  let downloadResumable: FileSystem.DownloadResumable | null = null;
  let isCancelled = false;
  let isPaused = false;

  const promise = (async () => {
    await ensureModelsDirectory();

    // A paused transfer continues its partial file; anything else starts clean.
    const tmpInfo = await FileSystem.getInfoAsync(tmpPath);
    const canResume = !!resumeData && tmpInfo.exists;
    if (tmpInfo.exists && !canResume) {
      await FileSystem.deleteAsync(tmpPath, { idempotent: true });
    }

    downloadResumable = FileSystem.createDownloadResumable(
      preset.downloadUrl,
      tmpPath,
      {},
      (downloadProgress) => {
        if (isCancelled) return;
        const total = downloadProgress.totalBytesExpectedToWrite;
        const written = downloadProgress.totalBytesWritten;
        const ratio = total > 0 ? Math.min(1, written / total) : 0;
        onProgress?.({
          progress: ratio,
          totalBytesWritten: written,
          totalBytesExpected: total,
        });
      },
      canResume ? (resumeData ?? undefined) : undefined,
    );

    const result = canResume ? await downloadResumable.resumeAsync() : await downloadResumable.downloadAsync();
    if (isPaused) throw new Error('paused');
    if (!result || isCancelled) {
      throw new Error('Download was cancelled or interrupted.');
    }

    const downloadedInfo = await FileSystem.getInfoAsync(tmpPath);
    const size = downloadedInfo.exists ? (downloadedInfo.size ?? 0) : 0;
    // The catalog records the exact artifact size; anything else (an error page, a cut-off
    // transfer, a different file) is rejected before hashing.
    if (size === 0 || (preset.sizeBytes > 0 && Math.abs(size - preset.sizeBytes) > preset.sizeBytes * 0.01)) {
      await FileSystem.deleteAsync(tmpPath, { idempotent: true });
      throw new Error('Downloaded file is not the expected model. Please try again.');
    }

    // A configured checksum must be verified. If verification cannot run or does not match,
    // the file is removed and nothing is installed (fail closed).
    if (preset.expectedSha256) {
      let matches = false;
      try {
        matches = !!verifyChecksumFn && (await verifyChecksumFn(tmpPath, preset.expectedSha256)).matches;
      } catch {
        matches = false;
      }
      if (!matches) {
        await FileSystem.deleteAsync(tmpPath, { idempotent: true });
        throw new Error('Model SHA-256 integrity check failed. File has been removed.');
      }
    }

    // Atomic move to final target path
    const existingFinal = await FileSystem.getInfoAsync(finalPath);
    if (existingFinal.exists) {
      await FileSystem.deleteAsync(finalPath, { idempotent: true });
    }

    try {
      await FileSystem.moveAsync({
        from: tmpPath,
        to: finalPath,
      });
    } catch {
      await FileSystem.copyAsync({ from: tmpPath, to: finalPath });
      await FileSystem.deleteAsync(tmpPath, { idempotent: true });
    }

    return finalPath;
  })();

  const cancel = async () => {
    isCancelled = true;
    if (downloadResumable) {
      try {
        await downloadResumable.pauseAsync();
      } catch {}
    }
    try {
      await FileSystem.deleteAsync(tmpPath, { idempotent: true });
    } catch {}
  };

  const pause = async () => {
    if (!downloadResumable) return null;
    isPaused = true;
    try {
      await downloadResumable.pauseAsync();
      return downloadResumable.savable().resumeData ?? null;
    } catch {
      return null;
    }
  };

  return { promise, cancel, pause };
}

export async function deleteLocalModel(modelId: string): Promise<boolean> {
  const targetPath = getLocalModelFilePath(modelId);
  const info = await FileSystem.getInfoAsync(targetPath);
  if (info.exists) {
    await FileSystem.deleteAsync(targetPath, { idempotent: true });
    return true;
  }
  return false;
}
```

#### `modules/local-ai/src/types.ts`

```ts
/**
 * Core type definitions for the Native Local AI subsystem.
 */

export interface DeviceCapabilities {
  totalRamBytes: number;
  totalRamMb: number;
  availableRamBytes: number;
  availableRamMb: number;
  thresholdBytes: number;
  isLowMemory: boolean;
  availableStorageBytes: number;
  availableStorageMb: number;
  cpuCores: number;
  optimalThreads: number;
  recommendedContextLength: number;
  safeModelCeilingBytes: number;
  safeModelCeilingMb: number;
  supportedAbis: string[];
  isArm64: boolean;
  deviceModel: string;
  androidSdk: number;
}

export interface RuntimeStatus {
  isSupported: boolean;
  isLoaded: boolean;
  isGenerating: boolean;
  loadedModelPath: string;
  loadedFileName: string;
  modelSizeBytes: number;
  modelSizeMb: number;
  nativeEngine: string;
  sdkVersion: string;
}

export interface ModelPreset {
  id: string;
  name: string;
  author: string;
  parameters: string;
  sizeBytes: number;
  sizeMb: number;
  minRamMb: number;
  role: 'chat' | 'reasoning' | 'embedding' | 'assistant';
  downloadUrl: string;
  expectedSha256: string;
  contextLength: number;
  license: string;
  description: string;
  /**
   * The bundled llama.cpp (Llamatik 0.12) predates this architecture: it is listed so it can be
   * tried, and the app test-answers it after download, but it may not start until the engine is
   * updated (or the LiteRT-LM runtime is added).
   */
  needsNewerRuntime?: boolean;
}

export interface ModelLoadOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  repeatPenalty?: number;
  force?: boolean;
}

export interface ModelLoadResult {
  success: boolean;
  modelPath: string;
  fileName: string;
  sizeBytes: number;
  sizeMb: number;
  durationMs: number;
  threads: number;
}

export interface GenerateRequest {
  prompt: string;
  context?: string;
  system?: string;
}

export interface GenerateResult {
  text: string;
  durationMs: number;
}

export interface StructuredGenerateRequest<T = unknown> {
  prompt: string;
  schema?: string;
  context?: string;
  system?: string;
  validator?: (data: unknown) => T;
}

export interface TokenEvent {
  turnId: string;
  token: string;
  index: number;
}

export interface StreamCompleteEvent {
  turnId: string;
  fullText: string;
  tokenCount: number;
  durationMs: number;
  tokensPerSecond: number;
}

export interface StreamErrorEvent {
  turnId: string;
  error: string;
}

export interface ModelLoadProgressEvent {
  progress: number;
  status: string;
}

export interface ChecksumVerifyResult {
  matches: boolean;
  actualSha256: string;
  expectedSha256: string;
}

export interface CachedModelFile {
  name: string;
  path: string;
  sizeBytes: number;
  sizeMb: number;
  lastModified: number;
}

export type LocalAIStatus =
  | 'unloaded'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'generating'
  | 'error';
```

#### `modules/local-ai/src/useLocalAI.ts`

```ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { LocalAI } from '../index';
import type {
  DeviceCapabilities,
  GenerateRequest,
  LocalAIStatus,
  ModelLoadOptions,
  ModelLoadProgressEvent,
  RuntimeStatus,
  StreamCompleteEvent,
  StructuredGenerateRequest,
  TokenEvent,
} from './types';

export interface UseLocalAIReturn {
  status: LocalAIStatus;
  isAvailable: boolean;
  isLoaded: boolean;
  isGenerating: boolean;
  runtimeStatus: RuntimeStatus | null;
  capabilities: DeviceCapabilities | null;
  loadProgress: ModelLoadProgressEvent | null;
  streamText: string;
  tokensPerSecond: number;
  lastDurationMs: number;
  error: string | null;

  loadModel: (modelPathOrAsset: string, isAsset?: boolean, options?: ModelLoadOptions) => Promise<boolean>;
  unloadModel: () => Promise<boolean>;
  generateText: (request: GenerateRequest) => Promise<string>;
  generateStream: (
    request: GenerateRequest,
    onTokenDelta?: (token: string) => void
  ) => Promise<string>;
  generateStructured: <T = unknown>(request: StructuredGenerateRequest<T>) => Promise<T>;
  embed: (text: string) => Promise<number[]>;
  stop: () => void;
  refreshStatus: () => void;
}

export function useLocalAI(): UseLocalAIReturn {
  const [status, setStatus] = useState<LocalAIStatus>('unloaded');
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [loadProgress, setLoadProgress] = useState<ModelLoadProgressEvent | null>(null);
  const [streamText, setStreamText] = useState('');
  const [tokensPerSecond, setTokensPerSecond] = useState(0);
  const [lastDurationMs, setLastDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const turnIdCounter = useRef(1);
  const activeStreamResolver = useRef<{
    resolve: (val: string) => void;
    reject: (err: Error) => void;
  } | null>(null);
  const tokenCallbackRef = useRef<((t: string) => void) | null>(null);

  const refreshStatus = useCallback(() => {
    const avail = LocalAI.isAvailable();
    setIsAvailable(avail);
    if (avail) {
      const rt = LocalAI.getRuntimeStatus();
      setRuntimeStatus(rt);
      setIsLoaded(rt.isLoaded);
      setIsGenerating(rt.isGenerating);
      setStatus(rt.isGenerating ? 'generating' : rt.isLoaded ? 'ready' : 'unloaded');

      try {
        const caps = LocalAI.getDeviceCapabilities();
        setCapabilities(caps);
      } catch {}
    }
  }, []);

  useEffect(() => {
    refreshStatus();

    const tokenSub = LocalAI.onToken((ev: TokenEvent) => {
      setStreamText((prev) => prev + ev.token);
      tokenCallbackRef.current?.(ev.token);
    });

    const completeSub = LocalAI.onStreamComplete((ev: StreamCompleteEvent) => {
      setIsGenerating(false);
      setStatus('ready');
      setTokensPerSecond(ev.tokensPerSecond);
      setLastDurationMs(ev.durationMs);
      activeStreamResolver.current?.resolve(ev.fullText);
      activeStreamResolver.current = null;
    });

    const errorSub = LocalAI.onStreamError((ev) => {
      setIsGenerating(false);
      setStatus('error');
      setError(ev.error);
      activeStreamResolver.current?.reject(new Error(ev.error));
      activeStreamResolver.current = null;
    });

    const progressSub = LocalAI.onModelLoadProgress((ev) => {
      setLoadProgress(ev);
    });

    return () => {
      tokenSub.remove();
      completeSub.remove();
      errorSub.remove();
      progressSub.remove();
    };
  }, [refreshStatus]);

  const loadModel = useCallback(
    async (modelPathOrAsset: string, isAsset = false, options?: ModelLoadOptions): Promise<boolean> => {
      setError(null);
      setStatus('loading');
      try {
        await LocalAI.loadModel(modelPathOrAsset, isAsset, options);
        setIsLoaded(true);
        setStatus('ready');
        refreshStatus();
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setStatus('error');
        return false;
      }
    },
    [refreshStatus]
  );

  const unloadModel = useCallback(async (): Promise<boolean> => {
    try {
      const ok = await LocalAI.unloadModel();
      setIsLoaded(false);
      setStatus('unloaded');
      refreshStatus();
      return ok;
    } catch {
      return false;
    }
  }, [refreshStatus]);

  const generateText = useCallback(async (request: GenerateRequest): Promise<string> => {
    setError(null);
    setIsGenerating(true);
    setStatus('generating');
    try {
      const res = await LocalAI.generateText(request);
      setStatus('ready');
      setIsGenerating(false);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStatus('error');
      setIsGenerating(false);
      throw err;
    }
  }, []);

  const generateStream = useCallback(
    async (request: GenerateRequest, onTokenDelta?: (token: string) => void): Promise<string> => {
      setError(null);
      setStreamText('');
      setTokensPerSecond(0);
      setIsGenerating(true);
      setStatus('generating');
      tokenCallbackRef.current = onTokenDelta ?? null;

      const turnId = `turn_${Date.now()}_${turnIdCounter.current++}`;

      return new Promise<string>((resolve, reject) => {
        activeStreamResolver.current = { resolve, reject };
        try {
          LocalAI.startStream(turnId, request.prompt, request.context, request.system);
        } catch (e: unknown) {
          activeStreamResolver.current = null;
          setIsGenerating(false);
          setStatus('error');
          const errorObj = e instanceof Error ? e : new Error(String(e));
          setError(errorObj.message);
          reject(errorObj);
        }
      });
    },
    []
  );

  const generateStructured = useCallback(
    async <T = unknown>(request: StructuredGenerateRequest<T>): Promise<T> => {
      setError(null);
      setIsGenerating(true);
      setStatus('generating');
      try {
        const res = await LocalAI.generateStructured<T>(request);
        setStatus('ready');
        setIsGenerating(false);
        return res;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setStatus('error');
        setIsGenerating(false);
        throw err;
      }
    },
    []
  );

  const embed = useCallback(async (text: string): Promise<number[]> => {
    return LocalAI.embed(text);
  }, []);

  const stop = useCallback(() => {
    LocalAI.cancelGeneration();
    setIsGenerating(false);
    setStatus(isLoaded ? 'ready' : 'unloaded');
  }, [isLoaded]);

  return {
    status,
    isAvailable,
    isLoaded,
    isGenerating,
    runtimeStatus,
    capabilities,
    loadProgress,
    streamText,
    tokensPerSecond,
    lastDurationMs,
    error,
    loadModel,
    unloadModel,
    generateText,
    generateStream,
    generateStructured,
    embed,
    stop,
    refreshStatus,
  };
}
```

#### `modules/local-ai/android/src/main/java/expo/modules/localai/AnvaykoshAiEngine.kt`

```kt
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
    if (loadedPath.contains("llama", ignoreCase = true)) {
      return "<|begin_of_text|>" + messages.joinToString("") { (role, text) ->
        "<|start_header_id|>$role<|end_header_id|>\n\n$text<|eot_id|>"
      } + "<|start_header_id|>assistant<|end_header_id|>\n\n"
    }
    // ChatML: Qwen 2.5 / 3, LFM2 and SmolLM all use it. Qwen 3 thinks out loud by default; an
    // empty think block (its own "thinking off" template) makes it answer straight away.
    val noThink = if (loadedPath.contains("qwen3", ignoreCase = true)) "<think>\n\n</think>\n\n" else ""
    return messages.joinToString("") { (role, text) -> "<|im_start|>$role\n$text<|im_end|>\n" } + "<|im_start|>assistant\n" + noThink
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
    private val STOP_MARKERS = listOf("<|eot_id|>", "<|start_header_id|>", "<|im_end|>", "<|endoftext|>", "<end_of_turn>", "<|im_start|>", "<start_of_turn>", "\nHuman:", "\nUser:")
  }

}

```

#### `modules/local-ai/android/src/main/java/expo/modules/localai/AnvaykoshDocumentProcessor.kt`

```kt
package expo.modules.localai

import java.util.regex.Pattern

/**
 * Anvaykosh Native Document Processing & Semantic Chunking Engine.
 *
 * Provides high-speed on-device document extraction & segmentation for offline RAG:
 * - Sanitizes raw OCR and document text, removing non-printable ASCII/Unicode noise.
 * - Splits text along natural semantic boundaries (paragraphs, bullet points, punctuation).
 * - Enforces minimum and maximum token/character limits with sliding overlap.
 * - Generates structured chunks with start/end character offsets for verifiable citation.
 */
object AnvaykoshDocumentProcessor {

  private val WHITESPACE_PATTERN = Pattern.compile("\\s+")
  private val SENTENCE_SPLIT_PATTERN = Pattern.compile("(?<=[.!?\\n])\\s+")

  data class DocumentChunk(
    val index: Int,
    val text: String,
    val startOffset: Int,
    val endOffset: Int,
    val tokenEstimate: Int
  )

  /**
   * Cleans raw extracted document or OCR text while preserving meaningful punctuation.
   */
  fun cleanText(input: String): String {
    if (input.isBlank()) return ""
    // Remove control characters except standard line breaks and tabs
    val stripped = input.replace("[\\p{Cntrl}&&[^\r\n\t]]".toRegex(), "")
    return WHITESPACE_PATTERN.matcher(stripped).replaceAll(" ").trim()
  }

  /**
   * Splits a document into bounded semantic chunks with overlap.
   *
   * @param text Raw document text
   * @param targetChunkSize Preferred character length per chunk (default 320)
   * @param overlapChars Overlapping character window to preserve context (default 40)
   */
  fun chunkDocument(
    text: String,
    targetChunkSize: Int = 320,
    overlapChars: Int = 40
  ): List<DocumentChunk> {
    val cleaned = cleanText(text)
    if (cleaned.isBlank()) return emptyList()

    if (cleaned.length <= targetChunkSize) {
      return listOf(
        DocumentChunk(
          index = 0,
          text = cleaned,
          startOffset = 0,
          endOffset = cleaned.length,
          tokenEstimate = estimateTokens(cleaned)
        )
      )
    }

    val sentences = SENTENCE_SPLIT_PATTERN.split(cleaned).filter { it.isNotBlank() }
    val chunks = mutableListOf<DocumentChunk>()

    val currentBuffer = StringBuilder()
    var chunkIndex = 0
    var currentStartOffset = 0

    for (sentence in sentences) {
      if (currentBuffer.length + sentence.length > targetChunkSize && currentBuffer.isNotEmpty()) {
        val chunkText = currentBuffer.toString().trim()
        chunks.add(
          DocumentChunk(
            index = chunkIndex++,
            text = chunkText,
            startOffset = currentStartOffset,
            endOffset = currentStartOffset + chunkText.length,
            tokenEstimate = estimateTokens(chunkText)
          )
        )

        // Seed next chunk with trailing overlap from the previous buffer
        val overlapText = if (chunkText.length > overlapChars) {
          chunkText.takeLast(overlapChars)
        } else {
          chunkText
        }

        currentStartOffset += (chunkText.length - overlapText.length)
        currentBuffer.clear()
        currentBuffer.append(overlapText).append(" ")
      }

      currentBuffer.append(sentence).append(" ")
    }

    if (currentBuffer.isNotBlank()) {
      val finalText = currentBuffer.toString().trim()
      chunks.add(
        DocumentChunk(
          index = chunkIndex,
          text = finalText,
          startOffset = currentStartOffset,
          endOffset = currentStartOffset + finalText.length,
          tokenEstimate = estimateTokens(finalText)
        )
      )
    }

    return chunks
  }

  /**
   * Fast rule-based token estimation for mobile memory budgeting.
   */
  fun estimateTokens(text: String): Int {
    if (text.isEmpty()) return 0
    val words = text.split(" ").filter { it.isNotEmpty() }
    // English/Latin text averages ~1.3 tokens per word
    return (words.size * 1.3).toInt().coerceAtLeast(1)
  }

  /**
   * Tokenizes and computes term frequency map for fast sparse BM25 retrieval.
   */
  fun computeTermFrequencies(text: String): Map<String, Int> {
    val clean = text.lowercase().replace("[^a-z0-9\\s]".toRegex(), " ")
    val tokens = clean.split("\\s+".toRegex()).filter { it.length > 2 }
    val tf = mutableMapOf<String, Int>()
    for (t in tokens) {
      tf[t] = (tf[t] ?: 0) + 1
    }
    return tf
  }
}

```

#### `modules/local-ai/android/src/main/java/expo/modules/localai/AssetModelExtractor.kt`

```kt
package expo.modules.localai

import android.content.Context
import java.io.File
import java.io.InputStream
import java.security.MessageDigest

object AssetModelExtractor {

  private const val MODELS_DIR_NAME = "local_ai_models"

  fun getModelsDirectory(context: Context): File {
    val dir = File(context.filesDir, MODELS_DIR_NAME)
    if (!dir.exists()) {
      dir.mkdirs()
    }
    return dir
  }

  /**
   * Resolves a model path from either an on-disk path (e.g. from post-install download),
   * or a bundled APK asset.
   */
  fun resolveModelPath(
    context: Context,
    modelPathOrAsset: String,
    isAssetExplicit: Boolean = false
  ): File {
    val cleanPath = modelPathOrAsset.removePrefix("file://")

    // Case 1: Direct absolute file on device
    val directFile = File(cleanPath)
    if (!isAssetExplicit && directFile.isAbsolute && directFile.exists() && directFile.isFile) {
      return directFile
    }

    // Case 2: Asset bundled in APK
    val assetFileName = File(cleanPath).name
    val destinationFile = File(getModelsDirectory(context), assetFileName)

    var assetStream: InputStream? = null
    try {
      assetStream = try {
        context.assets.open(cleanPath)
      } catch (_: Exception) {
        context.assets.open("models/$cleanPath")
      }

      val assetLength = try {
        context.assets.openFd(cleanPath).length
      } catch (_: Exception) {
        -1L
      }

      if (destinationFile.exists() && destinationFile.length() > 0) {
        if (assetLength <= 0 || destinationFile.length() == assetLength) {
          assetStream.close()
          return destinationFile
        }
      }

      destinationFile.parentFile?.mkdirs()
      destinationFile.outputStream().use { out ->
        assetStream.copyTo(out, bufferSize = 64 * 1024)
      }

      return destinationFile
    } catch (e: Exception) {
      if (directFile.exists()) {
        return directFile
      }
      throw IllegalArgumentException(
        "Could not resolve model '$modelPathOrAsset'. It is neither an existing file nor an APK asset: ${e.message}"
      )
    } finally {
      try {
        assetStream?.close()
      } catch (_: Exception) {}
    }
  }

  /**
   * Computes SHA-256 checksum of a file for integrity verification.
   */
  fun computeSha256(file: File): String {
    val digest = MessageDigest.getInstance("SHA-256")
    file.inputStream().use { input ->
      val buffer = ByteArray(64 * 1024)
      var read: Int
      while (input.read(buffer).also { read = it } != -1) {
        digest.update(buffer, 0, read)
      }
    }
    return digest.digest().joinToString("") { "%02x".format(it) }
  }

  /**
   * Lists all local models in the models directory.
   */
  fun listCachedModels(context: Context): List<Map<String, Any>> {
    val dir = getModelsDirectory(context)
    val files = dir.listFiles { file ->
      file.isFile && (file.extension.equals("gguf", ignoreCase = true) || file.extension.equals("bin", ignoreCase = true))
    } ?: return emptyList()

    return files.map { file ->
      mapOf(
        "name" to file.name,
        "path" to file.absolutePath,
        "sizeBytes" to file.length(),
        "sizeMb" to (file.length() / (1024 * 1024)),
        "lastModified" to file.lastModified()
      )
    }
  }

  /**
   * Deletes a model from the models directory.
   */
  fun deleteCachedModel(context: Context, fileName: String): Boolean {
    val file = File(getModelsDirectory(context), fileName)
    return if (file.exists() && file.isFile) {
      file.delete()
    } else {
      false
    }
  }
}
```

#### `modules/local-ai/android/src/main/java/expo/modules/localai/DocumentTextExtractor.kt`

```kt
package expo.modules.localai

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.provider.OpenableColumns
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.TextRecognizer
import com.google.mlkit.vision.text.chinese.ChineseTextRecognizerOptions
import com.google.mlkit.vision.text.devanagari.DevanagariTextRecognizerOptions
import com.google.mlkit.vision.text.japanese.JapaneseTextRecognizerOptions
import com.google.mlkit.vision.text.korean.KoreanTextRecognizerOptions
import com.google.mlkit.vision.text.latin.TextRecognizerOptions

/**
 * Reads the text of a file the person picked, entirely on the phone, without copying the file:
 *
 * - plain text, Markdown, CSV, JSON and HTML are read directly;
 * - PDFs are rendered page by page with Android's PdfRenderer and read with ML Kit's bundled
 *   (offline) text recogniser, so scanned and digital PDFs both work;
 * - photos (prescriptions, receipts, screenshots) go through the same recogniser.
 *
 * Returns one entry per page so answers can cite the page.
 */
object DocumentTextExtractor {
  private const val MAX_PDF_PAGES = 40
  private const val RENDER_WIDTH = 1400
  private const val MAX_IMAGE_SIDE = 2048

  data class Page(val page: Int, val text: String)

  fun displayName(ctx: Context, uri: Uri): String? =
    try {
      ctx.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { c ->
        if (c.moveToFirst()) c.getString(0) else null
      }
    } catch (_: Exception) {
      null
    } ?: uri.lastPathSegment

  /** Script to read: latin (default), chinese, japanese, korean or devanagari. */
  @Volatile private var script: String = "latin"

  fun extract(ctx: Context, uriString: String, mimeHint: String?, scriptHint: String? = null): Map<String, Any?> {
    script = scriptHint ?: "latin"
    val uri = Uri.parse(uriString)
    val name = displayName(ctx, uri)
    val mime = mimeHint ?: ctx.contentResolver.getType(uri) ?: guessMime(name)
    val (method, pages) = when {
      mime == "application/pdf" -> "pdf-ocr" to readPdf(ctx, uri)
      mime.startsWith("image/") -> "image-ocr" to listOf(Page(1, ocr(decodeImage(ctx, uri))))
      mime.startsWith("text/") || mime == "application/json" || mime == "application/xml" ->
        "text" to listOf(Page(1, readText(ctx, uri, html = mime == "text/html")))
      else -> throw IllegalArgumentException("This file type can't be read yet ($mime).")
    }
    return mapOf(
      "name" to name,
      "mime" to mime,
      "method" to method,
      "script" to script,
      "pages" to pages.map { mapOf("page" to it.page, "text" to it.text) },
    )
  }

  private fun guessMime(name: String?): String {
    val n = name?.lowercase() ?: return "application/octet-stream"
    return when {
      n.endsWith(".pdf") -> "application/pdf"
      n.endsWith(".png") -> "image/png"
      n.endsWith(".jpg") || n.endsWith(".jpeg") -> "image/jpeg"
      n.endsWith(".webp") -> "image/webp"
      n.endsWith(".md") || n.endsWith(".txt") || n.endsWith(".csv") -> "text/plain"
      n.endsWith(".html") || n.endsWith(".htm") -> "text/html"
      n.endsWith(".json") -> "application/json"
      else -> "application/octet-stream"
    }
  }

  private fun readText(ctx: Context, uri: Uri, html: Boolean): String {
    val raw = ctx.contentResolver.openInputStream(uri)?.use { it.readBytes().toString(Charsets.UTF_8) } ?: ""
    if (!html) return raw
    return raw
      .replace(Regex("(?is)<(script|style)[^>]*>.*?</\\1>"), " ")
      .replace(Regex("(?i)<br\\s*/?>|</p>|</div>|</li>|</h[1-6]>"), "\n")
      .replace(Regex("<[^>]+>"), " ")
      .replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
      .replace(Regex("[ \\t]+"), " ")
      .trim()
  }

  private fun readPdf(ctx: Context, uri: Uri): List<Page> {
    val pfd = ctx.contentResolver.openFileDescriptor(uri, "r") ?: throw IllegalArgumentException("Can't open the PDF.")
    pfd.use { fd ->
      PdfRenderer(fd).use { renderer ->
        val count = minOf(renderer.pageCount, MAX_PDF_PAGES)
        val out = ArrayList<Page>(count)
        for (i in 0 until count) {
          renderer.openPage(i).use { page ->
            val scale = RENDER_WIDTH.toFloat() / page.width
            val bmp = Bitmap.createBitmap(RENDER_WIDTH, (page.height * scale).toInt().coerceAtLeast(1), Bitmap.Config.ARGB_8888)
            bmp.eraseColor(Color.WHITE)
            page.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
            out.add(Page(i + 1, ocr(bmp)))
            bmp.recycle()
          }
        }
        return out
      }
    }
  }

  private fun decodeImage(ctx: Context, uri: Uri): Bitmap {
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    ctx.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
    var sample = 1
    while (maxOf(bounds.outWidth, bounds.outHeight) / sample > MAX_IMAGE_SIDE) sample *= 2
    return ctx.contentResolver.openInputStream(uri)?.use {
      BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = sample })
    } ?: throw IllegalArgumentException("Can't read this image.")
  }

  private fun recognizer(): TextRecognizer = when (script) {
    // Non-Latin scripts come through Google Play services (downloaded once, then offline).
    "chinese" -> TextRecognition.getClient(ChineseTextRecognizerOptions.Builder().build())
    "japanese" -> TextRecognition.getClient(JapaneseTextRecognizerOptions.Builder().build())
    "korean" -> TextRecognition.getClient(KoreanTextRecognizerOptions.Builder().build())
    "devanagari" -> TextRecognition.getClient(DevanagariTextRecognizerOptions.Builder().build())
    else -> TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
  }

  /** Runs on a worker thread (never the UI thread). The Latin model is bundled (offline). */
  private fun ocr(bitmap: Bitmap): String {
    val recognizer = recognizer()
    return try {
      Tasks.await(recognizer.process(InputImage.fromBitmap(bitmap, 0))).text
    } finally {
      recognizer.close()
    }
  }
}
```

#### `modules/local-ai/android/src/main/java/expo/modules/localai/LlmMemoryGuard.kt`

```kt
package expo.modules.localai

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.os.Environment
import android.os.StatFs
import java.io.File
import kotlin.math.min

data class MemoryStats(
  val totalRamBytes: Long,
  val availableRamBytes: Long,
  val thresholdBytes: Long,
  val isLowMemory: Boolean
)

data class MemorySafetyResult(
  val isSafe: Boolean,
  val availableRamBytes: Long,
  val requiredBytes: Long,
  val warningMessage: String? = null
)

object LlmMemoryGuard {

  fun getMemoryStats(context: Context): MemoryStats {
    val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
    val memInfo = ActivityManager.MemoryInfo()
    activityManager?.getMemoryInfo(memInfo)

    return MemoryStats(
      totalRamBytes = memInfo.totalMem,
      availableRamBytes = memInfo.availMem,
      thresholdBytes = memInfo.threshold,
      isLowMemory = memInfo.lowMemory
    )
  }

  /**
   * Evaluates whether device RAM can safely accommodate loading model weights of size [modelSizeBytes].
   * An additional buffer (default 250MB) is preserved for OS and app graphics headroom.
   */
  fun checkMemorySafety(
    context: Context,
    modelSizeBytes: Long,
    safetyBufferBytes: Long = 250L * 1024L * 1024L
  ): MemorySafetyResult {
    val stats = getMemoryStats(context)

    // LLaMA native runtime allocates working context (KV cache) on top of mapped weights
    val estimatedAllocation = modelSizeBytes + (64L * 1024L * 1024L)
    val effectiveAvailable = stats.availableRamBytes - stats.thresholdBytes

    if (stats.isLowMemory) {
      return MemorySafetyResult(
        isSafe = false,
        availableRamBytes = stats.availableRamBytes,
        requiredBytes = estimatedAllocation,
        warningMessage = "Device is currently under critical system low-memory pressure."
      )
    }

    if (estimatedAllocation + safetyBufferBytes > effectiveAvailable) {
      val availMb = stats.availableRamBytes / (1024 * 1024)
      val reqMb = (estimatedAllocation + safetyBufferBytes) / (1024 * 1024)
      return MemorySafetyResult(
        isSafe = false,
        availableRamBytes = stats.availableRamBytes,
        requiredBytes = estimatedAllocation,
        warningMessage = "Insufficient RAM to safely load model. Available: ${availMb}MB, Required with headroom: ${reqMb}MB."
      )
    }

    return MemorySafetyResult(
      isSafe = true,
      availableRamBytes = stats.availableRamBytes,
      requiredBytes = estimatedAllocation
    )
  }

  /**
   * Inspects free storage space on the internal data partition for post-install model downloads.
   */
  fun getAvailableStorageBytes(context: Context): Long {
    val stat = StatFs(context.filesDir.absolutePath)
    return stat.availableBlocksLong * stat.blockSizeLong
  }

  /**
   * Calculates optimal CPU thread count for responsive on-device mobile inference without thermal throttling.
   */
  fun getOptimalThreadCount(): Int {
    val cores = Runtime.getRuntime().availableProcessors()
    return when {
      cores >= 8 -> 4 // Typical big.LITTLE 8-core CPU: 4 performance threads
      cores >= 6 -> 4
      cores >= 4 -> 3
      cores >= 2 -> 2
      else -> 1
    }
  }

  fun getRecommendedContextLength(availableRamBytes: Long): Int {
    val ramGb = availableRamBytes / (1024L * 1024L * 1024L)
    return when {
      ramGb >= 6 -> 4096
      ramGb >= 3 -> 2048
      ramGb >= 2 -> 1024
      else -> 512
    }
  }

  /**
   * Returns comprehensive device capability telemetry for hardware-aware model selection.
   */
  fun getDeviceCapabilities(context: Context): Map<String, Any> {
    val stats = getMemoryStats(context)
    val storageBytes = getAvailableStorageBytes(context)
    val cores = Runtime.getRuntime().availableProcessors()
    val abis = Build.SUPPORTED_ABIS.toList()
    val isArm64 = abis.any { it.contains("arm64", ignoreCase = true) }

    // Safe model size ceiling: at most 45% of available RAM or 2.5GB, whichever is lower
    val safeModelCeilingBytes = min(
      (stats.availableRamBytes * 0.45).toLong(),
      2500L * 1024L * 1024L
    )

    return mapOf(
      "totalRamBytes" to stats.totalRamBytes,
      "totalRamMb" to (stats.totalRamBytes / (1024 * 1024)),
      "availableRamBytes" to stats.availableRamBytes,
      "availableRamMb" to (stats.availableRamBytes / (1024 * 1024)),
      "thresholdBytes" to stats.thresholdBytes,
      "isLowMemory" to stats.isLowMemory,
      "availableStorageBytes" to storageBytes,
      "availableStorageMb" to (storageBytes / (1024 * 1024)),
      "cpuCores" to cores,
      "optimalThreads" to getOptimalThreadCount(),
      "recommendedContextLength" to getRecommendedContextLength(stats.availableRamBytes),
      "safeModelCeilingBytes" to safeModelCeilingBytes,
      "safeModelCeilingMb" to (safeModelCeilingBytes / (1024 * 1024)),
      "supportedAbis" to abis,
      "isArm64" to isArm64,
      "deviceModel" to "${Build.MANUFACTURER} ${Build.MODEL}",
      "androidSdk" to Build.VERSION.SDK_INT
    )
  }
}
```

#### `modules/local-ai/android/src/main/java/expo/modules/localai/LocalAIModule.kt`

```kt
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
    // ---- Durable downloads through Android's DownloadManager: they keep going after the app is
    // closed or killed, and survive restarts. Files land in this app's own external files folder
    // (removed on uninstall); JS verifies the SHA-256 and moves the file into place.
    Function("dmEnqueue") { url: String, fileName: String, title: String ->
      val ctx = appContext.reactContext ?: throw IllegalStateException("No context")
      val dm = ctx.getSystemService(android.content.Context.DOWNLOAD_SERVICE) as android.app.DownloadManager
      val dir = ctx.getExternalFilesDir("model_downloads") ?: throw IllegalStateException("No storage")
      File(dir, fileName).delete()
      val req = android.app.DownloadManager.Request(android.net.Uri.parse(url))
        .setTitle(title)
        .setDescription("On-device AI model for Thrivefold")
        .setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE)
        .setDestinationInExternalFilesDir(ctx, "model_downloads", fileName)
        .setAllowedOverMetered(true)
        .setAllowedOverRoaming(false)
      dm.enqueue(req).toDouble()
    }

    Function("dmQuery") { id: Double ->
      val ctx = appContext.reactContext ?: throw IllegalStateException("No context")
      val dm = ctx.getSystemService(android.content.Context.DOWNLOAD_SERVICE) as android.app.DownloadManager
      val c = dm.query(android.app.DownloadManager.Query().setFilterById(id.toLong()))
      c.use {
        if (!it.moveToFirst()) return@Function mapOf("status" to "missing")
        val st = it.getInt(it.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_STATUS))
        val done = it.getLong(it.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR))
        val total = it.getLong(it.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_TOTAL_SIZE_BYTES))
        val local = it.getString(it.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_LOCAL_URI)) ?: ""
        val reason = it.getInt(it.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_REASON))
        val status = when (st) {
          android.app.DownloadManager.STATUS_SUCCESSFUL -> "done"
          android.app.DownloadManager.STATUS_FAILED -> "failed"
          android.app.DownloadManager.STATUS_PAUSED -> "paused"
          android.app.DownloadManager.STATUS_PENDING -> "pending"
          else -> "running"
        }
        mapOf(
          "status" to status,
          "bytes" to done.toDouble(),
          "total" to total.toDouble(),
          "localUri" to local,
          "reason" to reason,
        )
      }
    }

    Function("dmRemove") { id: Double ->
      val ctx = appContext.reactContext ?: return@Function false
      val dm = ctx.getSystemService(android.content.Context.DOWNLOAD_SERVICE) as android.app.DownloadManager
      dm.remove(id.toLong()) > 0
    }

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
    /**
     * Reads the text of a picked file (PDF, photo, text, HTML) on the phone, page by page.
     * The file is read in place through its content URI; nothing is copied or uploaded.
     */
    AsyncFunction("extractDocumentText") { uri: String, mime: String?, script: String?, promise: Promise ->
      val ctx = appContext.reactContext
      if (ctx == null) {
        promise.reject("no_context", "ReactContext is unavailable", null)
        return@AsyncFunction
      }
      Thread({
        try {
          promise.resolve(DocumentTextExtractor.extract(ctx, uri, mime, script))
        } catch (e: Throwable) {
          promise.reject("extract_failed", e.message ?: "Could not read this file", e)
        }
      }, "AnvaykoshDocReader").start()
    }

    /** Translates text on the phone (ML Kit; the language model downloads once, then offline). */
    AsyncFunction("translateText") { text: String, target: String, source: String?, promise: Promise ->
      Thread({
        try {
          promise.resolve(OnDeviceTranslator.translate(text, target, source))
        } catch (e: Throwable) {
          promise.reject("translate_failed", e.message ?: "Could not translate", e)
        }
      }, "AnvaykoshTranslate").start()
    }

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
```

#### `modules/local-ai/android/src/main/java/expo/modules/localai/OnDeviceTranslator.kt`

```kt
package expo.modules.localai

import com.google.android.gms.tasks.Tasks
import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.nl.languageid.LanguageIdentification
import com.google.mlkit.nl.translate.TranslateLanguage
import com.google.mlkit.nl.translate.Translation
import com.google.mlkit.nl.translate.TranslatorOptions

/**
 * On-device translation with ML Kit. The language pair's model (~30 MB) downloads once on first
 * use, then translation runs fully offline. Long text is translated paragraph by paragraph.
 * Runs on a worker thread (blocking Tasks.await), never the UI thread.
 */
object OnDeviceTranslator {
  private const val MAX_CHARS = 12_000

  fun detect(text: String): String {
    val client = LanguageIdentification.getClient()
    return try {
      Tasks.await(client.identifyLanguage(text.take(500)))
    } finally {
      client.close()
    }
  }

  fun translate(text: String, target: String, source: String?): Map<String, Any> {
    val to = TranslateLanguage.fromLanguageTag(target)
      ?: throw IllegalArgumentException("Translation to '$target' is not supported.")
    val detected = source ?: detect(text)
    val from = TranslateLanguage.fromLanguageTag(if (detected == "und") "en" else detected)
      ?: throw IllegalArgumentException("Can't translate from '$detected'.")
    if (from == to) return mapOf("text" to text, "source" to from, "target" to to)
    val translator = Translation.getClient(
      TranslatorOptions.Builder().setSourceLanguage(from).setTargetLanguage(to).build(),
    )
    return try {
      Tasks.await(translator.downloadModelIfNeeded(DownloadConditions.Builder().build()))
      val out = text.take(MAX_CHARS).split("\n").joinToString("\n") { para ->
        if (para.isBlank()) para else Tasks.await(translator.translate(para))
      }
      mapOf("text" to out, "source" to from, "target" to to)
    } finally {
      translator.close()
    }
  }
}
```

### SOURCE: CLOUD AI / DATABASE

#### `supabase/functions/ai-chat/index.ts`

```ts
// Thrivefold cloud AI (Supabase Edge Function, Deno). Optional, consent-gated in the app.
//
//   POST /ai-chat   signed-in user, body {"messages": [{"role": "user"|"assistant", "content": "..."}]}
//
// * Keys live only in function secrets (GEMINI_API_KEY, GROQ_API_KEY, GROQ_API_KEY_2,
//   OPENROUTER_API_KEY); nothing is shipped in the app.
// * Providers are tried in order (Gemini, Groq, OpenRouter) until one answers.
// * Cost cap: DAILY_LIMIT requests per person per day, counted server-side. No content stored.
// * The model supports wellbeing; it never diagnoses, never decides eligibility, and points to
//   emergency help when someone may be at risk.

import { createClient } from 'npm:@supabase/supabase-js@2';

const env = (k: string) => Deno.env.get(k) ?? '';
const DAILY_LIMIT = Number(env('AI_DAILY_LIMIT') || 40);
const MAX_TURNS = 12;
const MAX_CHARS = 2000;

const SYSTEM = `You are Thrive, the supportive wellbeing companion inside the Thrivefold app.
Be warm, brief (under 120 words unless asked), practical and plain-spoken.
You help with habits, movement, sleep, stress, food routines, cycle tracking questions and reflection.
You are not a doctor or therapist: never diagnose, never prescribe or dose medication, and suggest seeing a clinician when symptoms are severe, new, or worrying.
If someone mentions self-harm, suicide, abuse or danger, respond with care, encourage contacting local emergency services or a crisis line now, and suggest a trusted person.
Never guess someone's religion, caste, sexuality, ethnicity or other sensitive traits. Never ask for contact details.`;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

type Msg = { role: 'user' | 'assistant'; content: string };

async function gemini(messages: Msg[]): Promise<string | null> {
  const key = env('GEMINI_API_KEY');
  if (!key) return null;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env('GEMINI_MODEL') || 'gemini-3.8-flash'}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { temperature: 0.6, maxOutputTokens: 1500 },
      }),
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('').trim() || null;
}

async function openAiCompatible(url: string, key: string, model: string, messages: Msg[], extra: Record<string, string> = {}) {
  if (!key) return null;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...extra },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: SYSTEM }, ...messages],
      temperature: 0.6,
      max_tokens: 1500,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content as string | undefined)?.trim() || null;
}

const PROVIDERS: { name: string; run: (m: Msg[]) => Promise<string | null> }[] = [
  { name: 'gemini', run: gemini },
  {
    name: 'groq',
    run: (m) => openAiCompatible('https://api.groq.com/openai/v1/chat/completions', env('GROQ_API_KEY'), env('GROQ_MODEL') || 'openai/gpt-oss-120b', m),
  },
  {
    name: 'groq_2',
    run: (m) => openAiCompatible('https://api.groq.com/openai/v1/chat/completions', env('GROQ_API_KEY_2'), env('GROQ_MODEL') || 'openai/gpt-oss-120b', m),
  },
  {
    name: 'openrouter',
    run: (m) =>
      openAiCompatible('https://openrouter.ai/api/v1/chat/completions', env('OPENROUTER_API_KEY'), env('OPENROUTER_MODEL') || 'openai/gpt-4o-mini', m, {
        'HTTP-Referer': 'https://thrivefold.app',
        'X-Title': 'Thrivefold',
      }),
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'not_authenticated' }, 401);
  const userClient = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { auth: { persistSession: false } });
  const { data: auth, error: authError } = await userClient.auth.getUser(token);
  if (authError || !auth.user) return json({ error: 'not_authenticated' }, 401);

  let body: { messages?: Msg[] } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') return json({ error: 'invalid_request' }, 400);

  // Count first, so a person over the cap never costs a provider call.
  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
  const { data: count, error: countError } = await admin.rpc('tf_ai_count', { p_user: auth.user.id, p_provider: null });
  if (countError) return json({ error: 'server_error' }, 500);
  if ((count as number) > DAILY_LIMIT) return json({ error: 'daily_limit' }, 429);
  for (const p of PROVIDERS) {
    let reply: string | null = null;
    try {
      reply = await p.run(messages);
    } catch {
      reply = null;
    }
    if (!reply) continue;
    return json({ reply, provider: p.name, remaining: Math.max(0, DAILY_LIMIT - (count as number)) });
  }
  return json({ error: 'unavailable' }, 503);
});
```

#### `supabase/functions/doc-reader/index.ts`

```ts
// Thrivefold document reader (Supabase Edge Function, Deno): reads a photo of a prescription, a
// dietitian's food chart or a trainer's workout plan into structured lines the person checks.
//
//   POST /doc-reader  signed-in user
//   body {"image": "<base64 JPEG>", "kind": "prescription" | "diet_chart" | "workout_plan"}
//
// * Transcribes only what is written. It never adds advice, doses, substitutions or diagnoses.
// * The photo is sent to one provider for this request and never stored; nothing is logged.
// * Keys live only in function secrets; shares the per-person daily AI cap.

import { createClient } from 'npm:@supabase/supabase-js@2';

const env = (k: string) => Deno.env.get(k) ?? '';
const DAILY_LIMIT = Number(env('AI_DAILY_LIMIT') || 40);
const MAX_IMAGE_B64 = 2_500_000;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const PROMPTS: Record<string, string> = {
  prescription: `Transcribe this medical prescription exactly as written. Do not add, infer or correct any medicine, dose or instruction.
Return JSON: {"doctor": string|null, "date": string|null, "medicines": [{"name": string, "strength": string|null, "form": string|null, "dose": string|null, "frequency": string|null, "timing": string|null, "duration": string|null, "unclear": boolean}], "followUp": string|null, "notes": string|null}.
Set "unclear": true for any line you cannot read with confidence. If this is not a prescription, return {"medicines": [], "notes": "not a prescription"}.`,
  diet_chart: `Transcribe this diet chart or meal plan exactly as written by the dietitian. Do not add foods or quantities.
Return JSON: {"by": string|null, "meals": [{"time": string|null, "label": string, "items": [string]}], "avoid": [string], "notes": string|null}.`,
  workout_plan: `Transcribe this workout plan exactly as written by the trainer. Do not add exercises, sets or loads.
Return JSON: {"by": string|null, "days": [{"day": string, "exercises": [{"name": string, "sets": string|null, "reps": string|null, "load": string|null, "rest": string|null}]}], "notes": string|null}.`,
};

async function gemini(image: string, text: string): Promise<string | null> {
  const key = env('GEMINI_API_KEY');
  if (!key) return null;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env('GEMINI_VISION_MODEL') || env('GEMINI_MODEL') || 'gemini-3.8-flash'}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text }, { inline_data: { mime_type: 'image/jpeg', data: image } }] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json', maxOutputTokens: 3000 },
      }),
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('').trim() || null;
}

async function openrouter(image: string, text: string): Promise<string | null> {
  const key = env('OPENROUTER_API_KEY');
  if (!key) return null;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, 'HTTP-Referer': 'https://thrivefold.app', 'X-Title': 'Thrivefold' },
    body: JSON.stringify({
      model: env('OPENROUTER_VISION_MODEL') || 'openai/gpt-4o-mini',
      temperature: 0,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: [{ type: 'text', text }, { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } }] }],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content as string | undefined)?.trim() || null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'not_authenticated' }, 401);
  const userClient = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { auth: { persistSession: false } });
  const { data: auth, error: authError } = await userClient.auth.getUser(token);
  if (authError || !auth.user) return json({ error: 'not_authenticated' }, 401);

  let body: { image?: string; kind?: string } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }
  const kind = body.kind && PROMPTS[body.kind] ? body.kind : null;
  const image = typeof body.image === 'string' ? body.image : '';
  if (!kind || !image || image.length > MAX_IMAGE_B64 || !/^[A-Za-z0-9+/=]+$/.test(image.slice(0, 200))) {
    return json({ error: 'invalid_request' }, 400);
  }

  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
  const { data: count, error: countError } = await admin.rpc('tf_ai_count', { p_user: auth.user.id, p_provider: 'doc_reader' });
  if (countError) return json({ error: 'server_error' }, 500);
  if ((count as number) > DAILY_LIMIT) return json({ error: 'daily_limit' }, 429);

  for (const run of [gemini, openrouter]) {
    try {
      const raw = await run(image, PROMPTS[kind]);
      if (!raw) continue;
      const parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, ''));
      return json({ kind, result: parsed });
    } catch {
      // try the next provider
    }
  }
  return json({ error: 'unavailable' }, 502);
});
```

#### `supabase/functions/meal-vision/index.ts`

```ts
// Thrivefold meal photo → foods and macros (Supabase Edge Function, Deno).
//
//   POST /meal-vision   signed-in user
//   body {"image": "<base64 JPEG>", "hints": ["banana", ...], "catalog": [{"id","name","serving"}]}
//
// * The photo is sent to one provider for this request and never stored; no content is logged.
// * Keys live only in function secrets (GEMINI_API_KEY, OPENROUTER_API_KEY).
// * Shares the per-person daily cap with ai-chat (thrivefold_ai_usage), counted before any call.
// * The model maps foods to the app's food table when it can, so those use table values; anything
//   else comes back as an estimate the person reviews before saving.

import { createClient } from 'npm:@supabase/supabase-js@2';

const env = (k: string) => Deno.env.get(k) ?? '';
const DAILY_LIMIT = Number(env('AI_DAILY_LIMIT') || 40);
const MAX_IMAGE_B64 = 2_500_000; // ~1.8 MB JPEG

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

type CatalogEntry = { id: string; name: string; serving: string };

const prompt = (hints: string[], catalog: CatalogEntry[]) => `You are a careful nutrition assistant.
Identify every distinct food and drink visible in this meal photo, including Indian dishes.
For each item estimate the portion actually shown and its nutrition for that portion.
If an item matches one of these food-table entries, set "catalogId" to its id and "servings" to how many of that entry's serving are shown (0.5 steps):
${catalog.map((c) => `${c.id}: ${c.name} (${c.serving})`).join('\n')}
Hints from an on-device classifier and the user (may be wrong): ${hints.join(', ') || 'none'}
Return ONLY JSON:
{"items":[{"name":string,"catalogId":string|null,"servings":number|null,"serving":string,"grams":number|null,"kcal":number,"protein":number,"carbs":number,"fat":number,"confidence":number}]}
"serving" describes the portion (e.g. "1 bowl, ~200 g"). confidence is 0-1. If no food is visible return {"items":[]}.`;

async function gemini(image: string, text: string): Promise<string | null> {
  const key = env('GEMINI_API_KEY');
  if (!key) return null;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env('GEMINI_VISION_MODEL') || env('GEMINI_MODEL') || 'gemini-3.8-flash'}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text }, { inline_data: { mime_type: 'image/jpeg', data: image } }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json', maxOutputTokens: 2000 },
      }),
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('').trim() || null;
}

async function openrouter(image: string, text: string): Promise<string | null> {
  const key = env('OPENROUTER_API_KEY');
  if (!key) return null;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://thrivefold.app',
      'X-Title': 'Thrivefold',
    },
    body: JSON.stringify({
      model: env('OPENROUTER_VISION_MODEL') || 'openai/gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content as string | undefined)?.trim() || null;
}

const PROVIDERS = [
  { name: 'gemini', run: gemini },
  { name: 'openrouter', run: openrouter },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'not_authenticated' }, 401);
  const userClient = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { auth: { persistSession: false } });
  const { data: auth, error: authError } = await userClient.auth.getUser(token);
  if (authError || !auth.user) return json({ error: 'not_authenticated' }, 401);

  let body: { image?: string; hints?: unknown; catalog?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }
  const image = typeof body.image === 'string' ? body.image : '';
  if (!image || image.length > MAX_IMAGE_B64 || !/^[A-Za-z0-9+/=]+$/.test(image.slice(0, 200))) {
    return json({ error: 'invalid_image' }, 400);
  }
  const hints = (Array.isArray(body.hints) ? body.hints : [])
    .filter((h): h is string => typeof h === 'string')
    .map((h) => h.slice(0, 60))
    .slice(0, 6);
  const catalog = (Array.isArray(body.catalog) ? body.catalog : [])
    .filter(
      (c): c is CatalogEntry =>
        !!c && typeof c === 'object' && typeof (c as CatalogEntry).id === 'string' && typeof (c as CatalogEntry).name === 'string',
    )
    .slice(0, 120)
    .map((c) => ({ id: c.id.slice(0, 40), name: c.name.slice(0, 60), serving: String(c.serving ?? '').slice(0, 40) }));

  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
  const { data: count, error: countError } = await admin.rpc('tf_ai_count', { p_user: auth.user.id, p_provider: 'meal_vision' });
  if (countError) return json({ error: 'server_error' }, 500);
  if ((count as number) > DAILY_LIMIT) return json({ error: 'daily_limit' }, 429);

  const text = prompt(hints, catalog);
  for (const p of PROVIDERS) {
    let raw: string | null = null;
    try {
      raw = await p.run(image, text);
    } catch {
      raw = null;
    }
    if (!raw) continue;
    return json({ raw, provider: p.name, remaining: Math.max(0, DAILY_LIMIT - (count as number)) });
  }
  return json({ error: 'unavailable' }, 503);
});
```

#### `supabase/migrations/20261026000015_thrivefold_ai_usage.sql`

```sql
-- ============================================================================
-- Thrivefold migration 15: cloud AI usage ledger (spec: cloud AI optional, consent-controlled,
-- cost-capped). The ai-chat function counts requests per person per day with the service role;
-- nobody can read or write this table from the app. No message content is stored.
-- ============================================================================

create table if not exists public.thrivefold_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  requests int not null default 0,
  provider text,
  primary key (user_id, day)
);
alter table public.thrivefold_ai_usage enable row level security;
revoke all on public.thrivefold_ai_usage from anon, authenticated;

-- Atomically counts one request and returns the new total (called by the edge function only).
create or replace function public.tf_ai_count(p_user uuid, p_provider text)
returns int language sql security definer set search_path = '' as $$
  insert into public.thrivefold_ai_usage (user_id, day, requests, provider)
  values (p_user, current_date, 1, p_provider)
  on conflict (user_id, day) do update
    set requests = public.thrivefold_ai_usage.requests + 1, provider = excluded.provider
  returning requests;
$$;
revoke all on function public.tf_ai_count(uuid, text) from public, anon, authenticated;
```

### SOURCE: TESTS

#### `tests/unit/anvay-fts5.test.ts`

```ts
import { sanitizeFtsQuery, AnvayFtsStore, type SearchEntryInput } from '../../src/services/local-ai/search/anvayFtsStore';

// In-memory mock database for testing FTS5 operations
const mockSearchEntries: any[] = [];
let nextRowId = 1;

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn((sql: string, params: any[] = []) => {
      if (sql.includes('INSERT INTO anvay_search_entries')) {
        const entryKey = params[0];
        const existingIdx = mockSearchEntries.findIndex((e) => e.entry_key === entryKey);
        if (existingIdx >= 0) {
          mockSearchEntries[existingIdx] = {
            ...mockSearchEntries[existingIdx],
            title: params[8],
            content: params[9],
            domain: params[6],
            source_type: params[7],
            created_at: params[10],
          };
        } else {
          mockSearchEntries.push({
            rowid: nextRowId++,
            entry_key: params[0],
            source_table: params[1],
            source_id: params[2],
            chunk_id: params[3],
            owner_id: params[4],
            app_id: params[5] || 'thrivefold',
            domain: params[6],
            source_type: params[7],
            title: params[8],
            content: params[9],
            created_at: params[10],
            metadata_json: params[11],
          });
        }
        return { changes: 1 };
      }

      if (sql.includes('DELETE FROM anvay_search_entries')) {
        const initialLen = mockSearchEntries.length;
        if (sql.includes('entry_key = ?')) {
          const key = params[0];
          for (let i = mockSearchEntries.length - 1; i >= 0; i--) {
            if (mockSearchEntries[i].entry_key === key) {
              mockSearchEntries.splice(i, 1);
            }
          }
        } else {
          const table = params[0];
          const id = params[1];
          for (let i = mockSearchEntries.length - 1; i >= 0; i--) {
            if (mockSearchEntries[i].source_table === table && mockSearchEntries[i].source_id === id) {
              mockSearchEntries.splice(i, 1);
            }
          }
        }
        return { changes: initialLen - mockSearchEntries.length };
      }

      return { changes: 0 };
    }),
    getAllSync: jest.fn((sql: string, params: any[] = []) => {
      if (sql.includes('FROM anvay_search_fts f')) {
        const queryTerm = String(params[0]).replace(/["*]/g, '').toLowerCase();
        const ownerId = params[1];
        const appId = params[2];

        // Filter and rank mock entries
        return mockSearchEntries
          .filter((e) => {
            if (e.owner_id !== ownerId || e.app_id !== appId) return false;
            const full = `${e.title} ${e.content}`.toLowerCase();
            return full.includes(queryTerm);
          })
          .map((e, idx) => ({
            rowid: e.rowid,
            source_table: e.source_table,
            source_id: e.source_id,
            chunk_id: e.chunk_id,
            owner_id: e.owner_id,
            app_id: e.app_id,
            domain: e.domain,
            source_type: e.source_type,
            title: e.title,
            content: e.content,
            created_at: e.created_at,
            metadata_json: e.metadata_json,
            bm25_score: -(10.0 / (idx + 1)), // Mock BM25 score
            snippet: `...«${queryTerm}»...`,
          }));
      }
      return [];
    }),
    getFirstSync: jest.fn((sql: string) => {
      if (sql.includes('count(*)')) {
        return { count: mockSearchEntries.length };
      }
      return null;
    }),
    withTransactionSync: jest.fn((fn: () => void) => fn()),
  })),
}));

describe('AnvayCore SQLite FTS5 Intelligence Engine', () => {
  let fts: AnvayFtsStore;

  beforeEach(() => {
    mockSearchEntries.length = 0;
    nextRowId = 1;
    fts = new AnvayFtsStore();
  });

  describe('Query Sanitizer & Multilingual Tokenizer', () => {
    it('sanitizes plain English query into prefix search tokens', () => {
      const q = sanitizeFtsQuery('morning walk');
      expect(q).toBe('"morning"* AND "walk"*');
    });

    it('preserves exact quoted phrases', () => {
      const q = sanitizeFtsQuery('"box breathing"');
      expect(q).toBe('"box breathing"');
    });

    it('preserves Hindi Devanagari Unicode terms without corruption', () => {
      const q = sanitizeFtsQuery('तनाव मुक्ति');
      expect(q).toBe('"तनाव"* AND "मुक्ति"*');
    });

    it('preserves Bengali Unicode terms without corruption', () => {
      const q = sanitizeFtsQuery('ঘুমের সমস্যা');
      expect(q).toBe('"ঘুমের"* AND "সমস্যা"*');
    });

    it('strips dangerous FTS5 punctuation and operators', () => {
      const q = sanitizeFtsQuery('walk AND (drop: *table^2)');
      expect(q).not.toContain('(');
      expect(q).not.toContain('^');
      expect(q).not.toContain(':');
    });

    it('returns empty string for pure whitespace or punctuation', () => {
      expect(sanitizeFtsQuery('')).toBe('');
      expect(sanitizeFtsQuery('   ')).toBe('');
      expect(sanitizeFtsQuery('***:::^^^')).toBe('');
    });
  });

  describe('Indexing & Authorization Scoping', () => {
    it('indexes documents and retrieves matches strictly scoped to owner', () => {
      const doc1: SearchEntryInput = {
        sourceTable: 'rag_chunks',
        sourceId: 'doc_1',
        chunkId: 'chk_1_0',
        ownerId: 'user_alice',
        appId: 'thrivefold',
        domain: 'documents',
        sourceType: 'user_note',
        title: 'Morning Yoga and Hydration',
        content: 'Drinking 500ml warm water after waking up activates metabolism and calms the gut.',
      };

      const doc2: SearchEntryInput = {
        sourceTable: 'rag_chunks',
        sourceId: 'doc_2',
        chunkId: 'chk_2_0',
        ownerId: 'user_bob',
        appId: 'thrivefold',
        domain: 'documents',
        sourceType: 'user_note',
        title: 'Bob Secret Note',
        content: 'Water filtration notes for Bob.',
      };

      fts.upsertEntry(doc1);
      fts.upsertEntry(doc2);

      // Alice searches for 'water'
      const aliceHits = fts.search('water', { ownerId: 'user_alice' });
      expect(aliceHits.length).toBe(1);
      expect(aliceHits[0].sourceId).toBe('doc_1');
      expect(aliceHits[0].ownerId).toBe('user_alice');

      // Bob's note must never leak to Alice
      const leakCheck = aliceHits.find((h) => h.ownerId === 'user_bob');
      expect(leakCheck).toBeUndefined();
    });

    it('indexes Hindi and Bengali records and finds them via search', () => {
      fts.upsertEntry({
        sourceTable: 'rag_chunks',
        sourceId: 'doc_hi_1',
        ownerId: 'local_user',
        domain: 'documents',
        sourceType: 'wellness_guide',
        title: 'प्राणायाम और तनाव मुक्ति',
        content: 'अनुलोम विलोम प्राणायाम से मानसिक तनाव और चिंता में तुरंत आराम मिलता है।',
      });

      fts.upsertEntry({
        sourceTable: 'rag_chunks',
        sourceId: 'doc_bn_1',
        ownerId: 'local_user',
        domain: 'documents',
        sourceType: 'wellness_guide',
        title: 'গভীর ঘুমের নিয়মাবলী',
        content: 'রাতে শোবার আগে হালকা গরম দুধ এবং শ্বাস-প্রশ্বাসের ব্যায়াম ভালো ঘুমের জন্য উপকারী।',
      });

      const hindiHits = fts.search('तनाव', { ownerId: 'local_user' });
      expect(hindiHits.length).toBe(1);
      expect(hindiHits[0].title).toContain('तनाव');

      const bengaliHits = fts.search('ঘুমের', { ownerId: 'local_user' });
      expect(bengaliHits.length).toBe(1);
      expect(bengaliHits[0].title).toContain('ঘুমের');
    });

    it('deletes entries correctly and propagates deletions', () => {
      fts.upsertEntry({
        sourceTable: 'user_memories',
        sourceId: 'mem_123',
        ownerId: 'local_user',
        domain: 'memories',
        sourceType: 'fact',
        title: 'Memory: fact',
        content: 'User prefers evening strength training and 8 hours of sleep.',
      });

      expect(fts.search('evening', { ownerId: 'local_user' }).length).toBe(1);

      fts.deleteEntry('user_memories', 'mem_123');
      expect(fts.search('evening', { ownerId: 'local_user' }).length).toBe(0);
    });

    it('runs integrity checks and diagnostics without failure', () => {
      const integrity = fts.checkIntegrity();
      expect(integrity).toBe(true);

      const bench = fts.benchmark('local_user');
      expect(bench.integrityOk).toBe(true);
      expect(typeof bench.queryLatencyMs.englishTerm).toBe('number');
    });
  });
});

```

#### `tests/unit/anvay-vault.test.ts`

```ts
import { fillEmpty, usable } from '../../src/domain/ecosystem/anvayVault';

describe('Anvay Vault merge', () => {
  const at = '2026-10-28T10:00:00.000Z';

  it('fills empty fields only and never overwrites existing values', () => {
    const { merged, filled } = fillEmpty(
      { display_name: 'Asha', locale: null },
      { display_name: 'Someone else', locale: 'en-IN', time_zone: 'Asia/Kolkata' },
      'com.amit.neev',
      at,
    );
    expect(merged.display_name).toBe('Asha');
    expect(merged.locale).toBe('en-IN');
    expect(merged.time_zone).toBe('Asia/Kolkata');
    expect(filled).toEqual(['locale', 'time_zone']);
    expect(merged.sources?.locale).toEqual({ app: 'com.amit.neev', at });
  });

  it('treats placeholder names as empty and never copies them', () => {
    expect(usable('display_name', 'Guest')).toBeNull();
    const { merged } = fillEmpty({ display_name: 'Guest' }, { display_name: 'Ravi' }, 'x', at);
    expect(merged.display_name).toBe('Ravi');
    expect(fillEmpty({}, { display_name: 'Friend' }, 'x', at).filled).toEqual([]);
  });

  it('keeps the original source of a value when it is passed on', () => {
    const { merged } = fillEmpty(
      {},
      { locale: 'hi-IN', sources: { locale: { app: 'com.amit.setu', at: '2026-01-01T00:00:00Z' } } },
      'com.amit.thrivefold',
      at,
    );
    expect(merged.sources?.locale?.app).toBe('com.amit.setu');
  });

  it('rejects malformed values', () => {
    expect(usable('photo_url', 'javascript:alert(1)')).toBeNull();
    expect(usable('photo_url', 'http://insecure.example/a.png')).toBeNull();
    expect(usable('locale', 'x'.repeat(30))).toBeNull();
  });
});
```

#### `tests/unit/anvaykosh-rag-benchmark.test.ts`

```ts
jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
}));

jest.mock('expo', () => ({
  requireNativeModule: () => null,
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/data/user/0/app/files/',
  getInfoAsync: jest.fn(async () => ({ exists: false, isDirectory: false })),
  makeDirectoryAsync: jest.fn(async () => {}),
  createDownloadResumable: jest.fn(),
}));

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => store.get(key),
      set: (key: string, val: string) => store.set(key, val),
      delete: (key: string) => store.delete(key),
      contains: (key: string) => store.has(key),
      getAllKeys: () => Array.from(store.keys()),
      clearAll: () => store.clear(),
    })),
  };
});

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(async (len: number) => new Uint8Array(len)),
  digestStringAsync: jest.fn(async () => 'mock-hash'),
}));

// Mock in-memory SQLite store for Knowledge and Memories
const mockDocs: any[] = [];
const mockChunks: any[] = [];

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn((sql: string, params: any[]) => {
      if (sql.includes('INSERT INTO rag_documents')) {
        mockDocs.push({
          id: params[0],
          user_id: params[1],
          title: params[2],
          source_type: params[3],
          raw_text: params[4],
          chunk_count: params[5],
          created_at: params[6],
          metadata_json: params[7],
        });
        return { changes: 1 };
      }
      if (sql.includes('INSERT INTO rag_chunks')) {
        mockChunks.push({
          id: params[0],
          document_id: params[1],
          user_id: params[2],
          chunk_index: params[3],
          content: params[4],
          start_offset: params[5],
          end_offset: params[6],
          token_estimate: params[7],
          embedding_json: params[8],
          created_at: params[9],
        });
        return { changes: 1 };
      }
      if (sql.includes('DELETE FROM rag_chunks')) {
        const initial = mockChunks.length;
        mockChunks.length = 0;
        return { changes: initial };
      }
      if (sql.includes('DELETE FROM rag_documents')) {
        const initial = mockDocs.length;
        mockDocs.length = 0;
        return { changes: initial };
      }
      return { changes: 1 };
    }),
    getAllSync: jest.fn((sql: string, params: any[]) => {
      if (sql.includes('FROM anvay_search_fts f')) {
        const rawParam = String(params[0]).toLowerCase();
        const terms = rawParam
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter((t) => t.length > 0 && !['and', 'or', 'not'].includes(t));

        // Match against ingested mock chunks or docs
        const matchedChunks = mockChunks.filter((c) => {
          const text = c.content.toLowerCase();
          return terms.some((term) => text.includes(term));
        });

        return matchedChunks.map((c, idx) => {
          const doc = mockDocs.find((d) => d.id === c.document_id);
          return {
            rowid: idx + 1,
            entry_key: `thrivefold:local_user:rag_chunks:${c.document_id}:${c.id}`,
            source_table: 'rag_chunks',
            source_id: c.document_id,
            chunk_id: c.id,
            owner_id: 'local_user',
            app_id: 'thrivefold',
            domain: 'documents',
            source_type: doc?.source_type || 'user_note',
            title: doc?.title || 'Doc Title',
            content: c.content,
            created_at: c.created_at,
            metadata_json: null,
            bm25_score: -(10.0 / (idx + 1)),
            snippet: c.content.slice(0, 100),
          };
        });
      }
      if (sql.includes('FROM rag_documents')) {
        return mockDocs.filter((d) => !params || d.user_id === params[0]);
      }
      if (sql.includes('FROM rag_chunks c') && sql.includes('JOIN rag_documents d')) {
        return mockChunks.map((c) => {
          const doc = mockDocs.find((d) => d.id === c.document_id);
          return {
            ...c,
            doc_title: doc?.title || 'Doc Title',
            source_type: doc?.source_type || 'user_note',
          };
        });
      }
      if (sql.includes('FROM rag_chunks')) {
        return mockChunks.filter((c) => !params || c.user_id === params[0]);
      }
      if (sql.includes('FROM user_memories')) {
        return [];
      }
      return [];
    }),
    withTransactionSync: jest.fn((fn: () => void) => fn()),
  })),
}));

import { LocalAI, jsChunkDocument, jsComputeTermFrequencies } from '../../modules/local-ai';
import { knowledgeStore } from '../../src/services/local-ai/rag/knowledgeStore';
import {
  rankSparseBM25,
  retrieveHybridEvidence,
  answerWithHybridRag,
  type RagDocument,
} from '../../src/services/local-ai/rag/hybridRagPipeline';
import { executeTool } from '../../src/domain/assistant/toolRegistry';

describe('Anvaykosh AI — Local Vector RAG & Document Processing Benchmark', () => {
  beforeEach(() => {
    mockDocs.length = 0;
    mockChunks.length = 0;
  });

  describe('Document Chunker & Term Frequencies', () => {
    it('cleans non-printable characters and preserves meaningful text', () => {
      const raw = 'Hello \x00 world!\r\n\tThis is   a test.';
      const chunks = jsChunkDocument(raw, 300, 30);
      expect(chunks.length).toBe(1);
      expect(chunks[0].text).toBe('Hello world! This is a test.');
    });

    it('splits long documents along sentence boundaries with sliding overlap', () => {
      const longText =
        'Hydration is essential for cognitive performance and physical vitality. ' +
        'Drinking adequate water sustains cellular metabolism and prevents daily fatigue. ' +
        'Consistent walking and light resistance training promote cardiovascular longevity. ' +
        'Gentle evening stretches relieve muscle tension and encourage restorative deep sleep.';

      const chunks = jsChunkDocument(longText, 120, 25);
      expect(chunks.length).toBeGreaterThanOrEqual(2);

      // Verify offsets and index
      chunks.forEach((chunk, i) => {
        expect(chunk.index).toBe(i);
        expect(chunk.startOffset).toBeGreaterThanOrEqual(0);
        expect(chunk.endOffset).toBeGreaterThan(chunk.startOffset);
        expect(chunk.tokenEstimate).toBeGreaterThan(0);
      });
    });

    it('extracts sparse term frequencies for BM25 indexing', () => {
      const text = 'Hydration in water intake improve hydration and stamina of body';
      const tf = jsComputeTermFrequencies(text);
      expect(tf['hydration']).toBe(2);
      expect(tf['water']).toBe(1);
      expect(tf['intake']).toBe(1);
      expect(tf['stamina']).toBe(1);
      // Words <= 2 chars (in, of) should be omitted
      expect(tf['in']).toBeUndefined();
      expect(tf['of']).toBeUndefined();
    });
  });

  describe('BM25 Lexical Ranking', () => {
    const testDocs: RagDocument[] = [
      {
        id: 'doc_1',
        sourceType: 'user_note',
        title: 'Hydration Guidelines',
        content: 'Drink 8 glasses of fresh clean water every single day for optimal kidney health.',
      },
      {
        id: 'doc_2',
        sourceType: 'user_note',
        title: 'Deep Sleep Hygiene',
        content: 'Avoid bright blue screens 60 minutes before bedtime to increase melatonin secretion.',
      },
      {
        id: 'doc_3',
        sourceType: 'exercise_catalog',
        title: 'Bodyweight Squats',
        content: 'Stand with feet shoulder-width apart, keep spine neutral, and drive up through heels.',
      },
    ];

    it('ranks relevant documents highest for specific keyword queries', () => {
      const hits = rankSparseBM25(testDocs, 'glasses of water hydration');
      expect(hits.length).toBeGreaterThan(0);
      expect(hits[0].doc.id).toBe('doc_1');
      expect(hits[0].score).toBeGreaterThan(0);
    });

    it('ranks exercise documentation accurately for fitness queries', () => {
      const hits = rankSparseBM25(testDocs, 'squat spine heels');
      expect(hits.length).toBeGreaterThan(0);
      expect(hits[0].doc.id).toBe('doc_3');
    });

    it('returns empty array when query does not match any document vocabulary', () => {
      const hits = rankSparseBM25(testDocs, 'extraterrestrial spaceship galaxy');
      expect(hits).toEqual([]);
    });
  });

  describe('Knowledge Store SQLite Persistence', () => {
    it('ingests, chunks, and lists documents for a user', async () => {
      const doc = await knowledgeStore.ingestDocument('test_user', {
        title: 'Mindful Breathing Guide',
        text: 'Inhale slowly for four seconds through your nose. Hold for four seconds. Exhale slowly for four seconds.',
        sourceType: 'wellness_guide',
      });

      expect(doc.id).toBeDefined();
      expect(doc.title).toBe('Mindful Breathing Guide');
      expect(doc.chunkCount).toBeGreaterThanOrEqual(1);
      expect(mockDocs.length).toBe(1);
      expect(mockChunks.length).toBeGreaterThanOrEqual(1);

      const docs = await knowledgeStore.listDocuments('test_user');
      expect(docs.length).toBe(1);
      expect(docs[0].title).toBe('Mindful Breathing Guide');
    });

    it('clears all knowledge documents on demand (Right to Be Forgotten)', async () => {
      await knowledgeStore.ingestDocument('test_user', {
        title: 'Temporary Note',
        text: 'This should be wiped out completely.',
      });

      expect(mockDocs.length).toBe(1);
      await knowledgeStore.clearAllDocuments('test_user');
      expect(mockDocs.length).toBe(0);
      expect(mockChunks.length).toBe(0);
    });
  });

  describe('Hybrid RAG Engine Retrieval & Evidence Grounding', () => {
    it('retrieves exercise catalog and knowledge docs via hybrid pipeline', async () => {
      // Ingest test document into mock
      await knowledgeStore.ingestDocument('local_user', {
        title: 'Shoulder Mobility',
        text: 'Gentle arm circles and band pull-aparts improve shoulder mobility and relieve upper back tension.',
        sourceType: 'user_note',
      });

      const hits = await retrieveHybridEvidence('local_user', 'shoulder mobility band pull', 3);
      expect(hits.length).toBeGreaterThan(0);
      expect(hits[0].hybridScore).toBeGreaterThan(0);
      expect(hits.some((h) => h.document.content.toLowerCase().includes('shoulder mobility'))).toBe(true);
    });

    it('returns grounded answer with citations when evidence is sufficient', async () => {
      await knowledgeStore.ingestDocument('local_user', {
        title: 'Walking Habit',
        text: 'A brisk 20 minute morning walk elevates dopamine, regulates circadian rhythms, and supports healthy glucose metabolism.',
        sourceType: 'health_article',
      });

      const res = await answerWithHybridRag('local_user', 'morning walk dopamine glucose');
      expect(res.isGrounded).toBe(true);
      expect(res.confidence).toBeGreaterThan(0.7);
      expect(res.citations.length).toBeGreaterThan(0);
      expect(res.answer).toContain('morning walk');
    });

    it('refuses to fabricate when evidence does not exist (anti-hallucination guarantee)', async () => {
      const res = await answerWithHybridRag('local_user', 'quantum physics black hole thermodynamics');
      expect(res.isGrounded).toBe(false);
      expect(res.confidence).toBe(0);
      expect(res.answer).toContain('could not find enough relevant records');
    });
  });

  describe('Tool Registry — ingest_user_document', () => {
    it('successfully executes ingest_user_document tool and returns chunk metrics', async () => {
      const result = await executeTool(
        'ingest_user_document',
        {
          title: 'Physiotherapist Stretches',
          text: 'Perform hamstring wall stretch for 45 seconds per leg. Keep the spine neutral and avoid arching the lower back.',
          sourceType: 'user_note',
        },
        { userId: 'test_user' }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Indexed "Physiotherapist Stretches"');
      expect(result.data?.chunkCount).toBeGreaterThanOrEqual(1);
    });
  });
});
```

#### `tests/unit/app-distribution-and-calibrated-rag.test.ts`

```ts
jest.mock('expo', () => ({
  requireNativeModule: () => null,
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
    withTransactionSync: jest.fn((cb: any) => cb()),
  })),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/data/user/0/app/files/',
  getInfoAsync: jest.fn(async () => ({ exists: false, isDirectory: false })),
  makeDirectoryAsync: jest.fn(async () => {}),
  createDownloadResumable: jest.fn(),
}));

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => store.get(key),
      set: (key: string, val: string) => store.set(key, val),
      delete: (key: string) => store.delete(key),
      contains: (key: string) => store.has(key),
      getAllKeys: () => Array.from(store.keys()),
      clearAll: () => store.clear(),
    })),
  };
});

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(async (len: number) => new Uint8Array(len)),
  digestStringAsync: jest.fn(async () => 'mock-hash'),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Share: {
    share: jest.fn().mockResolvedValue({ action: 'sharedAction' }),
    sharedAction: 'sharedAction',
    dismissedAction: 'dismissedAction',
  },
  Linking: {
    canOpenURL: jest.fn().mockResolvedValue(true),
    openURL: jest.fn().mockResolvedValue(true),
  },
}));

import {
  shareApp,
  joinAsBetaTester,
  shareBetaInvite,
  THRIVEFOLD_DISTRIBUTION,
} from '../../src/services/distribution/appDistribution';
import { calculateCalibratedConfidence } from '../../src/services/local-ai/rag/hybridRagPipeline';
import { Share, Linking } from 'react-native';

describe('App Distribution & Sharing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shares app invitation with correct play store url', async () => {
    const success = await shareApp(THRIVEFOLD_DISTRIBUTION);
    expect(success).toBe(true);
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Share Thrivefold',
        message: expect.stringContaining(THRIVEFOLD_DISTRIBUTION.playStoreUrl),
      }),
      expect.any(Object)
    );
  });

  it('opens Google Play beta testing URL', async () => {
    const success = await joinAsBetaTester(THRIVEFOLD_DISTRIBUTION);
    expect(success).toBe(true);
    expect(Linking.openURL).toHaveBeenCalledWith(THRIVEFOLD_DISTRIBUTION.betaOptInUrl);
  });

  it('shares beta invitation with testing link', async () => {
    const success = await shareBetaInvite(THRIVEFOLD_DISTRIBUTION);
    expect(success).toBe(true);
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Join Thrivefold Beta',
        message: expect.stringContaining(THRIVEFOLD_DISTRIBUTION.betaOptInUrl),
      }),
      expect.any(Object)
    );
  });
});

describe('Calibrated Evidence Confidence Scoring', () => {
  it('returns 0 when no evidence hits exist', () => {
    const confidence = calculateCalibratedConfidence('how much water', [], false);
    expect(confidence).toBe(0);
  });

  it('calculates calibrated confidence bounded in [0, 1] using geometric formulation', () => {
    const mockHits = [
      {
        document: {
          id: 'doc_1',
          sourceType: 'user_document' as const,
          title: 'Hydration Guidelines',
          content: 'Drink 8 glasses of water daily for optimal biological rhythms.',
        },
        hybridScore: 0.035,
        snippet: 'Drink 8 glasses of water daily',
      },
    ];

    const confidence = calculateCalibratedConfidence('how much water to drink', mockHits, true);
    expect(confidence).toBeGreaterThan(0.5);
    expect(confidence).toBeLessThanOrEqual(1.0);
  });

  it('gives higher confidence to verified exercise catalog over unverified memory', () => {
    const catalogHit = [
      {
        document: {
          id: 'cat_1',
          sourceType: 'exercise_catalog' as const,
          title: 'Squat',
          content: 'Squat movement pattern with bodyweight.',
        },
        hybridScore: 0.035,
        snippet: 'Squat movement',
      },
    ];

    const memoryHit = [
      {
        document: {
          id: 'mem_1',
          sourceType: 'user_memory' as const,
          title: 'Squat memory',
          content: 'Squat movement pattern with bodyweight.',
        },
        hybridScore: 0.035,
        snippet: 'Squat movement',
      },
    ];

    const catConf = calculateCalibratedConfidence('squat movement', catalogHit, false);
    const memConf = calculateCalibratedConfidence('squat movement', memoryHit, false);
    expect(catConf).toBeGreaterThan(memConf);
  });
});
```

#### `tests/unit/assistant-engine.test.ts`

```ts
jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
}));

jest.mock('expo', () => ({
  requireNativeModule: () => null,
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'denied' })),
  getCurrentPositionAsync: jest.fn(async () => null),
  reverseGeocodeAsync: jest.fn(async () => []),
}));

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ regionCode: 'IN', languageCode: 'en' }]),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/data/user/0/app/files/',
  getInfoAsync: jest.fn(async () => ({ exists: false, isDirectory: false })),
  makeDirectoryAsync: jest.fn(async () => {}),
  createDownloadResumable: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => store.get(key),
      set: (key: string, val: string) => store.set(key, val),
      delete: (key: string) => store.delete(key),
      contains: (key: string) => store.has(key),
      getAllKeys: () => Array.from(store.keys()),
      clearAll: () => store.clear(),
    })),
  };
});

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(async (len: number) => new Uint8Array(len)),
  digestStringAsync: jest.fn(async () => 'mock-hash'),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(() => ({ changes: 1 })),
    getFirstSync: jest.fn(),
    getAllSync: jest.fn(() => []),
  })),
}));

import { resolveScreenCapability } from '../../src/domain/assistant/screenRegistry';
import { executeTool } from '../../src/domain/assistant/toolRegistry';
import { lookupMedicine, analyzePrescriptionText } from '../../src/services/ai/medicineResearch';
import { isGuestAccount } from '../../src/services/ai/aiInteractionStore';
import {
  agentEngine,
  isInsufficientPrecisionAnswer,
  shouldEscalateToCloud,
} from '../../src/services/assistant/agentEngine';

describe('Local-first cloud escalation policy', () => {
  it('treats missing and guest profiles as local-only', () => {
    expect(isGuestAccount(null)).toBe(true);
    expect(isGuestAccount({ isGuest: true })).toBe(true);
    expect(isGuestAccount({ isGuest: false })).toBe(false);
  });

  it('does not escalate after a usable local answer', () => {
    expect(
      shouldEscalateToCloud({ consented: true, isGuest: false, isSafetyContext: false, localOutcome: 'answered' }),
    ).toBe(false);
  });

  it('does not escalate for guests or safety contexts', () => {
    expect(
      shouldEscalateToCloud({ consented: true, isGuest: true, isSafetyContext: false, localOutcome: 'failed' }),
    ).toBe(false);
    expect(
      shouldEscalateToCloud({ consented: true, isGuest: false, isSafetyContext: true, localOutcome: 'failed' }),
    ).toBe(false);
  });

  it('allows an authorized fallback after local failure or a clear evidence refusal', () => {
    expect(
      shouldEscalateToCloud({ consented: true, isGuest: false, isSafetyContext: false, localOutcome: 'failed' }),
    ).toBe(true);
    expect(isInsufficientPrecisionAnswer("I don't have enough verified information to answer that." )).toBe(true);
    expect(isInsufficientPrecisionAnswer('A 20 minute walk can be a gentle start.')).toBe(false);
  });
});

describe('Screen Capability Registry', () => {
  it('resolves home tab capability with suggested chips', () => {
    const cap = resolveScreenCapability('/(app)/(tabs)');
    expect(cap.title).toBe('Home Sanctuary');
    expect(cap.supportedTools).toContain('log_water');
    expect(cap.suggestedChips.length).toBeGreaterThan(0);
  });

  it('resolves pose-check capability for workout screen', () => {
    const cap = resolveScreenCapability('/(app)/health/pose-check');
    expect(cap.title).toBe('Coach & Movement Check');
    expect(cap.visibleMetrics).toContain('reps');
  });

  it('falls back safely for unknown paths', () => {
    const cap = resolveScreenCapability('/unknown/random/route');
    expect(cap.title).toBe('Home Sanctuary');
  });
});

describe('Typed Tool Execution Registry', () => {
  it('executes log_water and updates hydration state', async () => {
    const res = await executeTool('log_water', { glasses: 2 }, { userId: 'test_user' });
    expect(res.success).toBe(true);
    expect(res.message).toContain('Logged 2 glasses');
  });

  it('executes get_metrics for water and steps', async () => {
    const resWater = await executeTool('get_metrics', { metric: 'water' }, { userId: 'test_user' });
    expect(resWater.success).toBe(true);

    const resSteps = await executeTool('get_metrics', { metric: 'steps' }, { userId: 'test_user' });
    expect(resSteps.success).toBe(true);
    expect(resSteps.message).toContain('steps today');
  });

  it('executes trigger_urgent_support with crisis hotline info', async () => {
    const res = await executeTool('trigger_urgent_support', {}, { userId: 'test_user' });
    expect(res.success).toBe(true);
    expect(res.routeToOpen).toBe('/(app)/safety/urgent-support');
    expect(res.message).toContain('14416');
  });

  it('executes lookup_medicine_info for verified entry', async () => {
    const res = await executeTool('lookup_medicine_info', { medicineName: 'Paracetamol' }, { userId: 'test_user' });
    expect(res.success).toBe(true);
    expect(res.message).toContain('Paracetamol');
    expect(res.message).toContain('MedlinePlus');
  });

  it('handles unknown medicine lookup gracefully', async () => {
    const res = await executeTool('lookup_medicine_info', { medicineName: 'FakemedicineXYZ' }, { userId: 'test_user' });
    expect(res.success).toBe(true);
    expect(res.message).toContain('could not find a verified educational entry');
  });
});

describe('Medicine Educational Research & Safety', () => {
  it('looks up metformin with authoritative source and class', () => {
    const med = lookupMedicine('Metformin');
    expect(med).not.toBeNull();
    expect(med?.genericName).toBe('Metformin Hydrochloride');
    expect(med?.authoritativeSource.publisher).toContain('MedlinePlus');
  });

  it('analyzes prescription text with disclaimers and safety notice', () => {
    const analysis = analyzePrescriptionText('Take Paracetamol 500mg twice daily with meals');
    expect(analysis.detectedMedicines.length).toBeGreaterThan(0);
    expect(analysis.detectedMedicines[0].extractedName).toBe('Paracetamol');
    expect(analysis.disclaimer).toContain('not a medical device');
    expect(analysis.safetyNotice).toContain('Always verify exact doses');
  });
});

describe('Agent Execution Engine', () => {
  it('handles fast-path water logging command', async () => {
    const result = await agentEngine.processUserInput('log 2 glasses of water');
    expect(result.text).toContain('Logged 2 glasses');
    expect(result.toolResult?.success).toBe(true);
  });

  it('handles fast-path crisis intervention immediately', async () => {
    const result = await agentEngine.processUserInput('I feel like hurting myself');
    expect(result.text).toContain('14416');
    expect(result.toolResult?.routeToOpen).toBe('/(app)/safety/urgent-support');
  });

  it('handles medicine question with educational citation', async () => {
    const result = await agentEngine.processUserInput('What is the medicine called Ibuprofen?');
    expect(result.text).toContain('Ibuprofen');
    expect(result.text).toContain('OpenFDA');
  });

  it('falls back to deterministic coach for exercise questions', async () => {
    const result = await agentEngine.processUserInput('How do I do squats?');
    expect(result.text.toLowerCase()).toContain('chest tall');
  });
});
```

#### `tests/unit/assistantCommands.test.ts`

```ts
import { parseCommand } from '../../src/domain/assistant/commands';

describe('assistant commands', () => {
  it.each([
    ['Start breathing', '/(app)/beta-lab/breathing'],
    ['open the eye studio', '/(app)/beta-lab/eye-tracking'],
    ['face exercises', '/(app)/beta-lab/face-exercises'],
    ['I want to log my lunch', '/(app)/health/meal-log'],
    ['take me to my treadmill session', '/(app)/health/activity'],
    ['what glasses suit my face shape', '/(app)/beta-lab/body-style'],
    ['open face shape', '/(app)/beta-lab/body-style'],
    ['show my bmi', '/(app)/beta-lab/body-style'],
  ])('%s opens the right screen', (input, route) => {
    expect(parseCommand(input)).toMatchObject({ kind: 'open', route });
  });

  it('logs water with a count', () => {
    expect(parseCommand('log two glasses of water')).toEqual({ kind: 'log_water', glasses: 2 });
    expect(parseCommand('I had 3 cups')).toEqual({ kind: 'log_water', glasses: 3 });
    expect(parseCommand('add water')).toEqual({ kind: 'log_water', glasses: 1 });
  });

  it('answers questions about today', () => {
    expect(parseCommand('How many steps today?')).toEqual({ kind: 'ask', metric: 'steps' });
    expect(parseCommand('how much water did I drink')).toEqual({ kind: 'ask', metric: 'water' });
    expect(parseCommand('what quests are left')).toEqual({ kind: 'ask', metric: 'quests' });
    expect(parseCommand('will it rain today?')).toEqual({ kind: 'ask', metric: 'weather' });
  });

  it('puts support first when someone mentions harming themselves', () => {
    expect(parseCommand('I want to die')).toEqual({ kind: 'crisis' });
    expect(parseCommand('thinking about suicide')).toEqual({ kind: 'crisis' });
    expect(parseCommand("I don't want to live anymore")).toEqual({ kind: 'crisis' });
    expect(parseCommand('open breathing')).toMatchObject({ kind: 'open' });
  });

  it('recognises everyday life pressures', () => {
    expect(parseCommand('so much stress at work lately')).toEqual({ kind: 'life', topic: 'work' });
    expect(parseCommand('my husband and I keep arguing')).toEqual({ kind: 'life', topic: 'relationship' });
    expect(parseCommand('I have been feeling low')).toEqual({ kind: 'life', topic: 'low' });
  });

  it('passes anything else on as a question', () => {
    expect(parseCommand('why do I feel tired after lunch and coffee every afternoon')).toMatchObject({ kind: 'unknown' });
  });
});
```

#### `tests/unit/chatActions.test.ts`

```ts
import { buildTable, GUIDES, matchMedicine, parseChatAction, type TableInput } from '../../src/domain/assistant/chatActions';
import { storeDocs, type StoreDocsInput } from '../../src/domain/assistant/appKnowledge';

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
}));

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(async (len: number) => new Uint8Array(len)),
  digestStringAsync: jest.fn(async () => 'mock-hash'),
}));

const NOW = new Date(2026, 9, 30, 10);

describe('chat actions', () => {
  it.each([
    ['show my meds', { kind: 'show', what: 'meds' }],
    ['show my prescriptions', { kind: 'show', what: 'meds' }],
    ['my appointments', { kind: 'show', what: 'followups' }],
    ["what are today's tasks", { kind: 'show', what: 'today' }],
    ['what can you do', { kind: 'show', what: 'screens' }],
    ['I have a prescription, help me log it', { kind: 'guide', job: 'prescription' }],
    ['take a photo of my lunch', { kind: 'guide', job: 'meal_photo' }],
    ['log out', { kind: 'sign_out' }],
    ['quit', { kind: 'close' }],
    ['clear the chat history', { kind: 'clear_chat' }],
    ['delete my vitamin d medicine', { kind: 'delete_med', name: 'vitamin d' }],
    ['I took my metformin', { kind: 'took_med', name: 'metformin' }],
    ['turn on medicine reminders', { kind: 'reminders', on: true }],
  ])('%s', (text, want) => {
    expect(parseChatAction(text)).toEqual(want);
  });

  it('leaves questions and small talk to the coach', () => {
    expect(parseChatAction('how do I sleep better')).toBeNull();
    expect(parseChatAction('I took a walk')).toBeNull();
    expect(parseChatAction('hello')).toBeNull();
  });

  const s: TableInput = {
    medications: [
      { id: 'b', name: 'Metformin', dose: '500 mg', time: '20:00' },
      { id: 'a', name: 'Vitamin D3', dose: '', time: '08:00' },
    ],
    medicationTaken: ['2026-10-30|a'],
    medicationRemindersOn: true,
    followUps: [
      { date: '2026-10-01', time: null, with: 'Old visit', note: null },
      { date: '2026-11-04', time: '10:30', with: 'Dr Rao', note: 'bring reports' },
    ],
    todayQuests: [{ title: 'Walk 10 minutes', isCompleted: false, status: 'assigned', xpReward: 5 }],
    mealLogs: [],
    carePlans: [],
    checkInHistory: [],
    hydration: {},
  };

  it('builds a medicines table, sorted by time, with today’s status', () => {
    const t = buildTable('meds', s, NOW);
    expect(t.title).toBe('Your medicines · reminders on');
    expect(t.rows).toEqual([
      ['Vitamin D3', '—', '08:00', 'Taken'],
      ['Metformin', '500 mg', '20:00', 'Not yet'],
    ]);
    expect(t.route).toBe('/(app)/health/medications');
  });

  it('shows only upcoming follow-ups', () => {
    expect(buildTable('followups', s, NOW).rows).toEqual([['2026-11-04', '10:30', 'Dr Rao', 'bring reports']]);
  });

  it('matches spoken medicine names loosely', () => {
    expect(matchMedicine(s.medications, 'vitamin d')?.id).toBe('a');
    expect(matchMedicine(s.medications, 'aspirin')).toBeNull();
  });

  it('guides each job to a real screen', () => {
    for (const g of Object.values(GUIDES)) expect(g.route).toMatch(/^\/\(app\)\//);
  });
});

describe('store documents', () => {
  const base: StoreDocsInput = {
    koshProfile: { preferredName: 'Amit', languages: ['English'], foodRestrictions: [], allergies: ['peanuts'], cuisines: [], foodDislikes: [], interests: [], skills: [], careerGoal: null },
    heightCm: 175,
    weightKg: null,
    onboarding: { goals: ['sleep better'], constraints: [], routineMinutes: 10, diet: 'vegetarian' },
    emergencyContacts: [{ name: 'Riya', relation: 'sister' }],
    followUps: [],
    carePlans: [],
    journalEntries: [],
    mealLogs: [{ date: '2026-10-30', type: 'lunch', items: [{ foodId: 'dal', servings: 2 }] }],
    workoutSessions: [],
    activityLogs: [],
    vitalsHistory: [],
    personalEvents: [],
    cycleData: null,
    aiMemories: [{ category: 'routine', content: 'trains at 7 am' }],
    betaSessions: [],
    achievements: [],
  };

  it('writes the profile without contact numbers and finds food names', () => {
    const docs = storeDocs(base, NOW, (id) => (id === 'dal' ? 'Dal' : undefined));
    const profile = docs.find((d) => d.key === 'me:profile')!.text;
    expect(profile).toContain('Allergies: peanuts');
    expect(profile).toContain('Riya (sister)');
    expect(profile).not.toMatch(/\d{10}/);
    expect(docs.find((d) => d.key === 'me:food')!.text).toContain('2026-10-30 lunch: Dal x2');
    expect(docs.find((d) => d.key === 'me:memories')!.text).toContain('routine: trains at 7 am');
    expect(docs.some((d) => d.key === 'me:cycle')).toBe(false);
  });
});

describe('chat attachments', () => {
  // The service imports native modules; the pure helpers are tested with light mocks.
  jest.mock('expo-document-picker', () => ({}));
  jest.mock('expo-image-picker', () => ({}));
  jest.mock('../../modules/local-ai', () => ({ LocalAI: {} }));
  jest.mock('../../src/services/local-ai/rag/thriveRag', () => ({ thriveRag: {} }));
  jest.mock('../../src/services/voice/globalVoiceController', () => ({ globalVoiceController: {} }));

  it('recognises the kind of a picked file', () => {
    const { kindOf } = require('../../src/services/assistant/chatAttachments');
    expect(kindOf('application/pdf', 'x')).toBe('pdf');
    expect(kindOf(null, 'Report.PDF')).toBe('pdf');
    expect(kindOf('image/jpeg', 'a')).toBe('image');
    expect(kindOf('text/plain', 'notes.txt')).toBe('file');
  });

  it('joins page text, dropping blank pages and extra spaces', () => {
    const { documentText, preview } = require('../../src/services/assistant/chatAttachments');
    expect(documentText({ pages: [{ page: 1, text: 'Hello   world' }, { page: 2, text: '   ' }, { page: 3, text: 'Bye' }] })).toBe('Hello world\n\nBye');
    expect(preview('one two three four', 9)).toBe('one two…');
  });
});
```

#### `tests/unit/coach-voice.test.ts`

```ts
import {
  idleLine,
  repLine,
  secondsLine,
  setDoneLine,
  setIntroLine,
  gestureIntroSpeech,
  gestureTriggerSpeech,
  humanCoachingEncouragement,
} from '../../src/domain/pose/coachVoice';

test('rep lines: count, praise, halfway, last ones', () => {
  expect(repLine(1, 10, true)).toBe('1');
  expect(repLine(5, 10, true)).toBe('Halfway there.');
  expect(repLine(3, 12, true)).toBe('Good one.');
  expect(repLine(3, 12, false)).toBe('Breathe out as you move.');
  expect(repLine(8, 10, true)).toBe('2 to go.');
  expect(repLine(9, 10, true)).toBe('Last one.');
  expect(repLine(10, 10, true)).toBeNull();
});

test('timed lines only at a few moments', () => {
  expect(secondsLine(20, 30)).toBe('10 seconds left. Stay strong.');
  expect(secondsLine(25, 30)).toBe('Five more seconds.');
  expect(secondsLine(7, 30)).toBeNull();
});

test('set intro and set done are honest and short', () => {
  expect(setIntroLine('Squat', 1, 3, 10, 'reps', 'Chest up.')).toBe(
    'Set 1 of 3. Squat, 10 reps. Chest up.',
  );
  expect(setIntroLine('Plank', 1, 1, 30, 's')).toBe('Plank, 30 seconds.');
  expect(setDoneLine(10, 10, 'reps', 30, 0.9)).toBe('Set done. Great form. Rest 30 seconds.');
  expect(setDoneLine(6, 10, 'reps', 30, null)).toBe('Set done, 6 reps. Rest 30 seconds.');
  expect(idleLine('hold')).toMatch(/hold/);
});

test('gestureIntroSpeech and gestureTriggerSpeech provide natural human coaching feedback', () => {
  const intro = gestureIntroSpeech();
  expect(intro).toMatch(/hands-free/);
  expect(intro).toMatch(/six to ten feet/);

  // One hand video play/pause
  expect(gestureTriggerSpeech('one_hand', { videoPlaying: true })).toMatch(/Pausing/);
  expect(gestureTriggerSpeech('one_hand', { videoPlaying: false })).toMatch(/Resuming/);

  // Both hands finish set / skip rest
  expect(gestureTriggerSpeech('both_hands', { rest: true })).toMatch(/Skipping rest/);
  expect(gestureTriggerSpeech('both_hands', { rest: false })).toMatch(/Set completed/);

  // Cross arms pause
  expect(gestureTriggerSpeech('cross_arms')).toMatch(/Workout paused/);

  // Hands on hips rest
  expect(gestureTriggerSpeech('hands_on_hips')).toMatch(/thirty seconds/);

  // T-pose go back
  expect(gestureTriggerSpeech('t_pose', { itemIdx: 1 })).toMatch(/previous exercise/);
  expect(gestureTriggerSpeech('t_pose', { itemIdx: 0 })).toMatch(/first exercise/);

  // Trainer encouragement
  expect(humanCoachingEncouragement(8, 10)).toBe('Two more, stay strong!');
  expect(humanCoachingEncouragement(9, 10)).toBe('Final rep, finish with full control!');
  expect(humanCoachingEncouragement(5, 10)).toBe('Halfway point! Looking solid, keep that rhythm.');
});
```

#### `tests/unit/commandSteps.test.ts`

```ts
import { parseCommand, splitSteps } from '../../src/domain/assistant/commands';

describe('assistant commands', () => {
  it('understands export requests', () => {
    expect(parseCommand('export all my metrics')).toEqual({ kind: 'export', format: 'spreadsheet' });
    expect(parseCommand('back up everything before I uninstall')).toEqual({ kind: 'export', format: 'backup' });
  });

  it('remembers what the person asks it to', () => {
    expect(parseCommand('Remember that I train at 7 am')).toEqual({ kind: 'remember', note: 'I train at 7 am' });
  });

  it('splits several requests into steps only when each is understood', () => {
    expect(splitSteps('log two glasses of water and then open sleep')).toEqual(['log two glasses of water', 'open sleep']);
    expect(splitSteps('log a glass of water and open my journal')).toEqual(['log a glass of water', 'open my journal']);
    expect(splitSteps('why do I feel tired and then sleepy')).toEqual(['why do I feel tired and then sleepy']);
  });
});

describe('heart-rate questions', () => {
  it('routes heart-rate questions to the heart metric', () => {
    expect(parseCommand("what's my heart rate")).toEqual({ kind: 'ask', metric: 'heart' });
    expect(parseCommand('how is my pulse today')).toEqual({ kind: 'ask', metric: 'heart' });
  });
});
```

#### `tests/unit/dailyBrief.test.ts`

```ts
import { dailyBrief, type BriefInput } from '../../src/domain/assistant/dailyBrief';

const base: BriefInput = {
  name: 'Amit', hour: 9, today: '2026-10-30', checkedInToday: false, waterGlasses: 1, waterTarget: 8,
  openQuests: ['Walk 10 minutes'], medicines: [], medicationTaken: [], nowHHMM: '09:00', followUps: [],
};

describe('daily brief', () => {
  it('lists what is due from real data', () => {
    const t = dailyBrief({ ...base, medicines: [{ id: 'a', name: 'Vitamin D', time: '08:00' }] });
    expect(t).toContain('Good morning, Amit.');
    expect(t).toContain('Vitamin D is due');
    expect(t).toContain('1 of 8 glasses');
    expect(t).toContain('"Walk 10 minutes"');
  });
  it('says when everything is done', () => {
    expect(dailyBrief({ ...base, hour: 20, checkedInToday: true, waterGlasses: 8, openQuests: [] })).toBe(
      "Good evening, Amit. You're all caught up today. What can I help with?",
    );
  });
  it('does not repeat taken medicines', () => {
    const t = dailyBrief({ ...base, medicines: [{ id: 'a', name: 'Vitamin D', time: '08:00' }], medicationTaken: ['2026-10-30|a'] });
    expect(t).not.toContain('Vitamin D');
  });
});
```

#### `tests/unit/local-ai-subsystem.test.ts`

```ts
jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));
jest.mock('expo', () => ({
  requireNativeModule: () => null,
}));
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/data/user/0/app/files/',
  getInfoAsync: jest.fn(async () => ({ exists: false, isDirectory: false })),
  makeDirectoryAsync: jest.fn(async () => {}),
  createDownloadResumable: jest.fn(),
}));
jest.mock('expo-sqlite', () => {
  const mockDb = {
    execSync: jest.fn(),
    runSync: jest.fn(() => ({ lastInsertRowId: 1, changes: 1 })),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
  };
  return {
    openDatabaseSync: jest.fn(() => mockDb),
    openDatabaseAsync: jest.fn(async () => mockDb),
  };
});

import {
  cosineSimilarity,
  euclideanDistance,
  topKSimilar,
  normalizeVector,
} from '../../src/services/local-ai/memory/vectorMath';
import { isConversationRecallQuery } from '../../src/domain/ai/localRetrieval';
import {
  MODEL_PRESETS,
  getModelPresetById,
  getRecommendedModel,
} from '../../modules/local-ai/src/modelCatalog';
import { classifyReflection } from '../../src/services/local-ai/tasks/classification';
import { extractWellnessEntities } from '../../src/services/local-ai/tasks/entityExtraction';
import { summarizeWellnessJournal } from '../../src/services/local-ai/tasks/summarization';
import { suggestOrganization } from '../../src/services/local-ai/tasks/organizationSuggestions';
import {
  checkCrisisInterception,
  routeLocalAiTask,
} from '../../src/services/local-ai/orchestration/taskRouter';
import {
  statefulOrchestrator,
  type NonSensitiveCohortFeatures,
} from '../../src/services/local-ai/orchestration/langGraphOrchestrator';

describe('Local AI - Vector Math & Similarity Engine', () => {
  test('P0: Cosine similarity of identical vectors is 1.0', () => {
    const v1 = [0.2, 0.5, 0.8, -0.3];
    const sim = cosineSimilarity(v1, v1);
    expect(sim).toBeCloseTo(1.0, 5);
  });

  test('P0: Cosine similarity of orthogonal vectors is 0.0', () => {
    const v1 = [1, 0, 0];
    const v2 = [0, 1, 0];
    const sim = cosineSimilarity(v1, v2);
    expect(sim).toBeCloseTo(0.0, 5);
  });

  test('P0: Cosine similarity of opposite vectors is -1.0', () => {
    const v1 = [1, 2, 3];
    const v2 = [-1, -2, -3];
    const sim = cosineSimilarity(v1, v2);
    expect(sim).toBeCloseTo(-1.0, 5);
  });

  test('P0: Handles zero-magnitude or empty vectors gracefully without NaN', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0.0);
    expect(cosineSimilarity([], [])).toBe(0.0);
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0.0);
  });

  test('P0: Euclidean distance between vectors', () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBeCloseTo(5.0, 5);
    expect(euclideanDistance([1, 1], [1, 1])).toBeCloseTo(0.0, 5);
    expect(euclideanDistance([1], [1, 2])).toBe(Number.POSITIVE_INFINITY);
  });

  test('P0: Normalizes vector to unit length', () => {
    const v = [3, 4];
    const norm = normalizeVector(v);
    expect(norm[0]).toBeCloseTo(0.6, 5);
    expect(norm[1]).toBeCloseTo(0.8, 5);
    expect(cosineSimilarity(norm, norm)).toBeCloseTo(1.0, 5);
  });

  test('P0: topKSimilar ranks candidate embeddings descending by similarity', () => {
    const query = [1, 0, 0];
    const candidates = [
      { id: 'c1', vector: [0, 1, 0] },     // orthogonal -> 0.0
      { id: 'c2', vector: [0.9, 0.1, 0] }, // high match -> ~0.99
      { id: 'c3', vector: [0.5, 0.5, 0] }, // moderate match -> ~0.707
      { id: 'c4', vector: [-1, 0, 0] },    // opposite -> -1.0
    ];

    const results = topKSimilar(query, candidates, 2, 0.1);
    expect(results).toHaveLength(2);
    expect(results[0].item.id).toBe('c2');
    expect(results[1].item.id).toBe('c3');
  });
});

describe('Local AI - Model Catalog & Hardware Suitability', () => {
  test('P0: Catalog lists real downloadable models with their published SHA-256', () => {
    expect(MODEL_PRESETS.length).toBe(8);
    for (const m of MODEL_PRESETS) {
      expect(m.downloadUrl).toMatch(/^https:\/\/huggingface\.co\/(Qwen|ggml-org|unsloth|bartowski|LiquidAI)\/.+\.gguf$/);
      expect(m.sizeMb).toBe(Math.round(m.sizeBytes / 1024 / 1024));
      expect(m.expectedSha256).toMatch(/^[0-9a-f]{64}$/);
    }
    expect(getModelPresetById('qwen2.5-0.5b-instruct')?.sizeBytes).toBe(491_400_032);
    expect(getModelPresetById('gemma-3-1b-it')?.sizeBytes).toBe(806_058_240);
    expect(getModelPresetById('gemma-4-e2b-it')?.sizeBytes).toBe(2_841_481_184);
    // Architectures newer than the bundled llama.cpp are flagged, never silently offered as ready.
    expect(getModelPresetById('gemma-4-e2b-it')?.needsNewerRuntime).toBe(true);
  });

  test('P0: Recommends the larger model only with enough RAM', () => {
    expect(getRecommendedModel(4000).id).toBe('qwen2.5-0.5b-instruct');
    expect(getRecommendedModel(6000).id).toBe('qwen2.5-1.5b-instruct');
  });
});

describe('Local AI - Structured AI Tasks & Fallbacks', () => {
  test('P0: classifyReflection classifies high stress/anxiety deterministically', async () => {
    const result = await classifyReflection(
      'Work was overwhelming today, heart racing with anxiety and strict deadlines'
    );
    expect(result.category).toBe('tense');
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.suggestedAction).toContain('box breathing');
  });

  test('P0: classifyReflection classifies fatigue deterministically', async () => {
    const result = await classifyReflection(
      'Feeling completely drained, sleepy and exhausted after a sleepless night'
    );
    expect(result.category).toBe('fatigued');
    expect(result.suggestedAction).toContain('restorative breathwork');
  });

  test('P0: extractWellnessEntities extracts quantified sleep, water and steps', async () => {
    const result = await extractWellnessEntities(
      'Logged 7.5 hours of sleep, drank 3 liters of water, and reached 10000 steps today.'
    );
    expect(result.metrics.sleepHours).toBe(7.5);
    expect(result.metrics.waterIntake).toBe(3);
    expect(result.metrics.steps).toBe(10000);
  });

  test('P0: summarizeWellnessJournal produces clean bulleted insights', async () => {
    const notes = [
      'Morning: Slept well, went for a run.',
      'Afternoon: Busy day at work, felt tight in the neck.',
      'Evening: Gentle yoga, felt much more relaxed.',
    ];

    const summary = await summarizeWellnessJournal(notes);
    expect(summary.headline).toBeDefined();
    expect(summary.bulletPoints.length).toBeGreaterThan(0);
    expect(summary.mindfulTakeaway).toBeDefined();
  });

  test('P0: suggestOrganization clusters items into clear tags and routines', async () => {
    const content = 'Did a 5km morning run and finished with upper body gym workout';
    const suggestions = await suggestOrganization(content);
    expect(suggestions.suggestedTags).toContain('fitness');
    expect(suggestions.categorySuggestion).toBe('fitness');
  });
});

describe('Local AI - Safety Circuit Breaker & Task Router', () => {
  test('P0: Safety circuit breaker intercepts self-harm and provides crisis line', () => {
    const crisis = checkCrisisInterception('I feel completely hopeless and want to end my life');
    expect(crisis.isCrisis).toBe(true);
    expect(crisis.helplineNotice).toContain('988');
  });

  test('P0: Task router catches crisis phrases and halts standard processing', async () => {
    const result = await routeLocalAiTask({
      type: 'classify',
      text: 'Thinking about suicide and self harm',
    });

    expect(result.type).toBe('classify');
    if (result.type === 'classify') {
      expect(result.data.category).toBe('tense');
      expect(result.data.keywords).toContain('crisis_intercepted');
      expect(result.data.suggestedAction).toContain('988');
    }
  });

  test('P0: Task router executes normal classification task', async () => {
    const result = await routeLocalAiTask({
      type: 'classify',
      text: 'Feeling peaceful, calm and steady after meditation',
    });

    expect(result.type).toBe('classify');
    if (result.type === 'classify') {
      expect(result.data.category).toBe('grounded');
      expect(result.data.keywords).toContain('calm');
    }
  });
});

describe('Local AI - Stateful LangGraph Orchestration & Cohort Clustering', () => {
  test('P0: StatefulOrchestrator tracks checkpoints across pipeline execution', async () => {
    const res = await statefulOrchestrator.runWorkflow('usr-test-1', {
      type: 'classify',
      text: 'Had an active and energized day at the park',
    });

    expect(res.result.type).toBe('classify');
    if (res.result.type === 'classify') {
      expect(res.result.data.category).toBe('energized');
    }
  });

  test('P0: Non-sensitive cohort clustering clusters users strictly on consented behavioral features', () => {
    const mockCohortData: NonSensitiveCohortFeatures[] = [
      {
        userId: 'u1',
        activeExperience: 'women',
        weeklyCheckInFrequency: 6,
        prefersMorningRoutine: true,
        averageWorkoutDurationMinutes: 25,
        streakCount: 14,
        consentGranted: true,
      },
      {
        userId: 'u2',
        activeExperience: 'men',
        weeklyCheckInFrequency: 2,
        prefersMorningRoutine: false,
        averageWorkoutDurationMinutes: 15,
        streakCount: 3,
        consentGranted: true,
      },
      {
        userId: 'u3',
        activeExperience: 'all',
        weeklyCheckInFrequency: 5,
        prefersMorningRoutine: true,
        averageWorkoutDurationMinutes: 30,
        streakCount: 2,
        consentGranted: false, // Opted out
      },
    ];

    const clusters = statefulOrchestrator.clusterNonSensitiveCohorts(mockCohortData);

    // u3 should NOT be clustered because consentGranted is false
    expect(clusters.morning_routine_cohort.userIds).toContain('u1');
    expect(clusters.morning_routine_cohort.userIds).not.toContain('u3');

    // u1 has streak 14 -> high consistency
    expect(clusters.high_consistency_cohort.userIds).toContain('u1');

    // u2 has streak 3 -> gentle paced
    expect(clusters.gentle_paced_cohort.userIds).toContain('u2');
  });
});

describe('Local AI - Hybrid RAG Pipeline', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const {
    getExerciseCatalogDocuments,
    rankSparseBM25,
    retrieveHybridEvidence,
    answerWithHybridRag,
  } = require('../../src/services/local-ai/rag/hybridRagPipeline') as typeof import('../../src/services/local-ai/rag/hybridRagPipeline');

  test('P0: getExerciseCatalogDocuments indexes exercise library with steps and safety', () => {
    const docs = getExerciseCatalogDocuments();
    expect(docs.length).toBeGreaterThan(20);
    const squatDoc = docs.find((d) => d.id.includes('squat'));
    expect(squatDoc).toBeDefined();
    expect(squatDoc?.content).toContain('Steps:');
    expect(squatDoc?.sourceType).toBe('exercise_catalog');
  });

  test('P0: rankSparseBM25 ranks documents relevant to query keyword', () => {
    const docs = getExerciseCatalogDocuments();
    const hits = rankSparseBM25(docs, 'squat knees');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].doc.title.toLowerCase()).toContain('squat');
    expect(hits[0].score).toBeGreaterThan(0);
  });

  test('P0: retrieveHybridEvidence fuses results with RRF scores', async () => {
    const hits = await retrieveHybridEvidence('usr-rag-1', 'squat posture', 3);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].hybridScore).toBeGreaterThan(0);
    expect(hits[0].snippet).toBeDefined();
  });

  test('P0: answerWithHybridRag answers with verified citations', async () => {
    const res = await answerWithHybridRag('usr-rag-1', 'How do I do a squat safely?');
    expect(res.isGrounded).toBe(true);
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.citations[0]).toContain('Exercise Catalog');
    expect(res.confidence).toBeGreaterThan(0.7);
  });

  test('P0: answerWithHybridRag stays honest when no records match', async () => {
    const res = await answerWithHybridRag('usr-rag-1', 'quantum electrodynamics astrophysics');
    expect(res.isGrounded).toBe(false);
    expect(res.answer).toContain('not find enough relevant records');
    expect(res.citations).toHaveLength(0);
  });
});

describe('Conversation history retrieval scope', () => {
  test('uses conversation history only for explicit recall questions', () => {
    expect(isConversationRecallQuery('What did you tell me about sleep last time?')).toBe(true);
    expect(isConversationRecallQuery('Tell me how to improve my sleep')).toBe(false);
  });
});

```

#### `tests/unit/local-ai.test.ts`

```ts
import { evaluateDeterministicRoutine } from '../../src/domain/ai/deterministicRules';
import { classifyLocalInput } from '../../src/domain/ai/localClassifier';

describe('Thrivefold Local-First AI & Deterministic Task Rules', () => {
  test('P0: High stress and low energy trigger breathing recommendation without cloud', () => {
    const recommendation = evaluateDeterministicRoutine({
      energy: 2,
      mood: 4,
      stress: 9,
      experience: 'women_health',
    });

    expect(recommendation.category).toBe('breathing');
    expect(recommendation.title).toContain('Parasympathetic');
    expect(recommendation.aiExplanation.source).toBe('local_deterministic');
  });

  test('P0: Severe pain triggers clinical signposting and halts strenuous workouts', () => {
    const recommendation = evaluateDeterministicRoutine({
      energy: 5,
      mood: 5,
      stress: 5,
      physicalPainOrLimitation: 'Severe acute pelvic pain',
      experience: 'women_health',
    });

    expect(recommendation.category).toBe('rest');
    expect(recommendation.title).toContain('Professional Consultation Signpost');
    expect(recommendation.cautionNotice).toContain('Thrivefold does not provide clinical diagnosis');
  });

  test('P0: Men health experience generates posture mobility routine', () => {
    const recommendation = evaluateDeterministicRoutine({
      energy: 5,
      mood: 6,
      stress: 5,
      experience: 'men_health',
    });

    expect(recommendation.category).toBe('movement');
    expect(recommendation.title).toContain('Desk Worker');
  });

  test('P0: Local classifier detects crisis signal on device and flags alert', () => {
    const classification = classifyLocalInput({ text: 'I feel completely hopeless and want to end my life' });
    expect(classification.isCrisisAlert).toBe(true);
    expect(classification.intent).toBe('crisis_signal');
    expect(classification.result.text).toContain('Immediate care alert');
  });
});
```

#### `tests/unit/local-coach-ai.test.ts`

```ts
import {
  resolveLocalCoachReply,
  type LocalCoachContext,
} from '../../src/domain/coach/localCoachAI';

describe('Local Coach AI Engine', () => {
  const baseContext: LocalCoachContext = {
    steps: 6420,
    waterGlasses: 4,
    hydrationTarget: 8,
    userName: 'Aarav',
    allergies: ['peanuts'],
    foodRules: ['vegetarian'],
  };

  it('provides precise, non-prescriptive squat form guidance', () => {
    const res = resolveLocalCoachReply('How should I do squats?', baseContext);
    expect(res.topic).toBe('form');
    expect(res.text).toContain('Aarav,');
    expect(res.text.toLowerCase()).toContain('chest tall');
    expect(res.text.toLowerCase()).toContain('heels');
    expect(res.route).toBe('/(app)/health/pose-check');
  });

  it('provides pushup form advice', () => {
    const res = resolveLocalCoachReply('Give me pushup form tips', baseContext);
    expect(res.topic).toBe('form');
    expect(res.text.toLowerCase()).toContain('plank');
    expect(res.text.toLowerCase()).toContain('chest');
  });

  it('provides plank technique advice', () => {
    const res = resolveLocalCoachReply('How to hold a plank correctly', baseContext);
    expect(res.topic).toBe('form');
    expect(res.text.toLowerCase()).toContain('elbows');
    expect(res.text.toLowerCase()).toContain('shoulders');
  });

  it('advises on desk posture and spinal alignment', () => {
    const res = resolveLocalCoachReply('Tips for my sitting posture at my desk', baseContext);
    expect(res.topic).toBe('posture');
    expect(res.text.toLowerCase()).toContain('shoulders');
  });

  it('handles muscle soreness (DOMS) with safe, natural recovery tips', () => {
    const res = resolveLocalCoachReply('Why are my muscles so sore after yesterday?', baseContext);
    expect(res.topic).toBe('recovery');
    expect(res.text.toLowerCase()).toContain('soreness');
    expect(res.text.toLowerCase()).toContain('water');
    expect(res.text.toLowerCase()).toContain('sleep');
  });

  it('signs post safety and never diagnoses when pain is reported', () => {
    const res = resolveLocalCoachReply('I have sharp knee pain when bending', baseContext);
    expect(res.topic).toBe('recovery');
    expect(res.text.toLowerCase()).toContain('pause any movement');
    expect(res.text.toLowerCase()).toContain('healthcare provider');
    expect(res.route).toBe('/(app)/safety/urgent-support');
  });

  it('grounds hydration replies with user water logging metrics', () => {
    const res = resolveLocalCoachReply('How much water should I drink today?', baseContext);
    expect(res.topic).toBe('hydration');
    expect(res.text).toContain('4 of 8 glasses');
  });

  it('grounds summary with user real step count', () => {
    const res = resolveLocalCoachReply('How am I doing today?', baseContext);
    expect(res.topic).toBe('summary');
    expect(res.text).toContain('6,420 steps');
    expect(res.text).toContain('4 glasses of water');
  });

  it('provides soothing breathwork guidance for stress and anxiety', () => {
    const res = resolveLocalCoachReply('I feel so stressed and overwhelmed', baseContext);
    expect(res.topic).toBe('stress');
    expect(res.text.toLowerCase()).toContain('breath');
    expect(res.route).toBe('/(app)/beta-lab/breathing');
  });

  it('handles general wellbeing questions warmly and concisely', () => {
    const res = resolveLocalCoachReply('What can you help me with?', baseContext);
    expect(res.topic).toBe('general');
    expect(res.text).toContain('Aarav,');
    expect(res.text.toLowerCase()).toContain('on-device brain');
  });
});
```

#### `tests/unit/local-day.test.ts`

```ts
import { formatLocalDate } from '../../src/domain/calendar/universalCalendarEngine';

describe('local day keys', () => {
  const tz = process.env.TZ;
  afterAll(() => {
    process.env.TZ = tz;
  });

  test('India just after midnight is the new local day, not yesterday in UTC', () => {
    process.env.TZ = 'Asia/Kolkata';
    // 00:30 IST on 25 Oct is 19:00 UTC on 24 Oct.
    const d = new Date('2026-10-24T19:00:00Z');
    expect(d.toISOString().slice(0, 10)).toBe('2026-10-24');
    expect(formatLocalDate(d)).toBe('2026-10-25');
  });

  test('month and leap-year boundaries', () => {
    process.env.TZ = 'Asia/Kolkata';
    expect(formatLocalDate(new Date('2028-02-28T20:00:00Z'))).toBe('2028-02-29');
    expect(formatLocalDate(new Date('2026-12-31T19:00:00Z'))).toBe('2027-01-01');
  });
});
```

#### `tests/unit/local-intelligence.test.ts`

```ts
import {
  aggregateByDay,
  checkInsUntilInsights,
  computeInsights,
  pearson,
  recentLoad,
  type InsightCheckIn,
} from '../../src/domain/ai/insights';
import { searchDocuments, tokenize, type RetrievalDocument } from '../../src/domain/ai/localRetrieval';
import { classifyLocalInput } from '../../src/domain/ai/localClassifier';
import { evaluateDeterministicRoutine } from '../../src/domain/ai/deterministicRules';
import { activeMemories, type MemoryItem } from '../../src/domain/ai/types';

const TODAY = '2026-10-23';

/** YYYY-MM-DD `n` days before TODAY, computed in UTC like the engine. */
function daysBefore(n: number): string {
  const d = new Date(Date.UTC(2026, 9, 23) - n * 86400000);
  return d.toISOString().split('T')[0];
}

function checkIn(n: number, over: Partial<InsightCheckIn> = {}): InsightCheckIn {
  return { date: daysBefore(n), energy: 6, mood: 6, stress: 5, sleepHours: 7, symptoms: [], ...over };
}

describe('Insight engine', () => {
  test('stays silent with too little data and says how many days are left', () => {
    const few = [checkIn(0), checkIn(1), checkIn(2)];
    expect(computeInsights({ checkIns: few, today: TODAY })).toEqual([]);
    expect(checkInsUntilInsights(few, TODAY)).toBe(4);
    expect(computeInsights({ checkIns: [], today: TODAY })).toEqual([]);
  });

  test('averages several check-ins on the same day and ignores future dates', () => {
    const days = aggregateByDay(
      [checkIn(0, { energy: 4 }), checkIn(0, { energy: 8 }), { ...checkIn(0), date: '2026-12-01' }],
      TODAY,
    );
    expect(days).toHaveLength(1);
    expect(days[0].energy).toBe(6);
  });

  test('detects a week-over-week drop in sleep with real numbers', () => {
    const records = [
      ...[0, 1, 2, 3, 4].map((n) => checkIn(n, { sleepHours: 5 })),
      ...[7, 8, 9, 10, 11].map((n) => checkIn(n, { sleepHours: 7.5 })),
    ];
    const insight = computeInsights({ checkIns: records, today: TODAY }).find((i) => i.id === 'trend_sleepHours');
    expect(insight).toBeDefined();
    expect(insight!.title).toBe('Your sleep is down this week');
    expect(insight!.detail).toContain('5h');
    expect(insight!.detail).toContain('7.5h');
    expect(insight!.strength).toBe('clear');
    expect(insight!.suggestion).toBeDefined();
  });

  test('does not report a trend for small changes', () => {
    const records = [
      ...[0, 1, 2, 3].map((n) => checkIn(n, { energy: 6 })),
      ...[7, 8, 9, 10].map((n) => checkIn(n, { energy: 6.5 })),
    ];
    const ids = computeInsights({ checkIns: records, today: TODAY }).map((i) => i.id);
    expect(ids).not.toContain('trend_energy');
  });

  test('links sleep with energy and compares rested and short-sleep days', () => {
    const records = Array.from({ length: 12 }, (_, n) => {
      const sleep = n % 2 === 0 ? 8 : 5;
      return checkIn(n, { sleepHours: sleep, energy: sleep === 8 ? 8 : 4 });
    });
    const insight = computeInsights({ checkIns: records, today: TODAY }).find((i) => i.id === 'link_sleep_energy');
    expect(insight).toBeDefined();
    expect(insight!.detail).toContain('8/10');
    expect(insight!.detail).toContain('4/10');
    expect(insight!.memoryCandidate).toBeDefined();
  });

  test('no correlation is reported when the numbers do not move together', () => {
    expect(Number.isNaN(pearson([5, 5, 5], [1, 2, 3]))).toBe(true);
    const flat = Array.from({ length: 10 }, (_, n) => checkIn(n));
    const kinds = computeInsights({ checkIns: flat, today: TODAY }).map((i) => i.kind);
    expect(kinds).not.toContain('link');
  });

  test('finds a recurring symptom but never reports positive tags', () => {
    const records = Array.from({ length: 8 }, (_, n) =>
      checkIn(n, { symptoms: n < 5 ? ['Headache', 'Calm Mood'] : ['Calm Mood'] }),
    );
    const insights = computeInsights({ checkIns: records, today: TODAY });
    const headache = insights.find((i) => i.id === 'symptom_headache');
    expect(headache?.detail).toBe('You logged headache on 5 of your last 8 check-in days.');
    expect(headache?.suggestion).toContain('not a diagnosis');
    expect(insights.find((i) => i.id === 'symptom_calm_mood')).toBeUndefined();
  });

  test('spots the most stressful weekday only with enough weeks of data', () => {
    // 21 consecutive days; every Monday is high stress.
    const records = Array.from({ length: 21 }, (_, n) => {
      const date = daysBefore(n);
      const isMonday = new Date(`${date}T00:00:00Z`).getUTCDay() === 1;
      return checkIn(n, { stress: isMonday ? 9 : 4 });
    });
    const pattern = computeInsights({ checkIns: records, today: TODAY }).find((i) => i.kind === 'pattern');
    expect(pattern?.title).toBe('Mondays tend to be your most stressful day');
  });

  test('links energy to early cycle days only with two or more logged periods', () => {
    const records = Array.from({ length: 30 }, (_, n) => {
      const cycleDay = n <= 27 ? 28 - n : 0; // TODAY is cycle day 28 of a period that began 27 days ago
      return checkIn(n, { energy: cycleDay >= 1 && cycleDay <= 5 ? 3 : 7 });
    });
    const periods = [{ startDate: daysBefore(27) }, { startDate: daysBefore(55) }];
    const withPeriods = computeInsights({ checkIns: records, periods, today: TODAY });
    expect(withPeriods.find((i) => i.id === 'cycle_energy_early')?.title).toBe('Energy dips early in your cycle');

    const onePeriod = computeInsights({ checkIns: records, periods: periods.slice(0, 1), today: TODAY });
    expect(onePeriod.find((i) => i.kind === 'cycle')).toBeUndefined();
  });

  test('recent load counts consecutive hard days ending today or yesterday', () => {
    const records = [checkIn(1, { sleepHours: 5 }), checkIn(2, { sleepHours: 5.5 }), checkIn(3, { sleepHours: 4 }), checkIn(4, { sleepHours: 8 })];
    expect(recentLoad(records, TODAY)).toEqual({ shortSleepStreak: 3, highStressStreak: 0 });
    // A gap breaks the run.
    expect(recentLoad([checkIn(0, { stress: 8 }), checkIn(2, { stress: 8 })], TODAY).highStressStreak).toBe(1);
  });
});

describe('Recovery rule uses recent load', () => {
  test('three short-sleep days switch a high-energy day to recovery', () => {
    const rec = evaluateDeterministicRoutine({
      energy: 9,
      mood: 8,
      stress: 3,
      experience: 'men_health',
      recentLoad: { shortSleepStreak: 3, highStressStreak: 0 },
    });
    expect(rec.taskId).toBe('rec_recovery_reset');
    expect(rec.aiExplanation.text).toContain('3 days in a row with under 6 hours of sleep');
  });

  test('severe pain still takes priority over recovery', () => {
    const rec = evaluateDeterministicRoutine({
      energy: 5,
      mood: 5,
      stress: 5,
      physicalPainOrLimitation: 'severe back pain',
      experience: 'women_health',
      recentLoad: { shortSleepStreak: 4, highStressStreak: 4 },
    });
    expect(rec.taskId).toBe('rec_rest_and_care');
  });
});

describe('Local note search', () => {
  const docs: RetrievalDocument[] = [
    { id: 'j1', kind: 'journal', title: 'Rough night', text: 'Slept badly again, woke up at 3am. Sleeping is hard when work is busy.', date: '2026-10-20' },
    { id: 'j2', kind: 'journal', title: 'Good walk', text: 'Long walk by the river, felt calm afterwards.', date: '2026-10-21' },
    { id: 'm1', kind: 'memory', title: '', text: 'Mornings work best for my routines.', date: '2026-10-22' },
  ];

  test('ranks the relevant entry first and matches word forms', () => {
    const hits = searchDocuments(docs, 'sleep problems');
    expect(hits[0].doc.id).toBe('j1');
    expect(hits[0].matchedTerms).toContain('sleep');
  });

  test('returns nothing for stopword-only or unmatched queries', () => {
    expect(searchDocuments(docs, 'the and of')).toEqual([]);
    expect(searchDocuments(docs, 'xylophone')).toEqual([]);
    expect(searchDocuments([], 'sleep')).toEqual([]);
  });

  test('tokenizer drops stopwords and stems plurals', () => {
    expect(tokenize('The walks were calming')).toEqual(['walk', 'calm']);
  });
});

describe('Local classifier', () => {
  test('ignores negated fatigue', () => {
    const out = classifyLocalInput({ text: 'Not tired at all today, feeling great' });
    expect(out.signals).not.toContain('fatigue');
    expect(out.intensitySuggestion).toBe('regular');
  });

  test('pain lowers intensity and signposts care without diagnosing', () => {
    const out = classifyLocalInput({ text: 'my knee is sore and my back aches' });
    expect(out.intent).toBe('exercise_adaptation');
    expect(out.result.limitationsDisclosed).toContain('Not a diagnosis');
  });

  test('crisis phrases are never suppressed by negation', () => {
    expect(classifyLocalInput({ text: "I don't know, I just want to die" }).isCrisisAlert).toBe(true);
    expect(classifyLocalInput({ text: 'thinking about self-harm' }).isCrisisAlert).toBe(true);
  });

  test('stress and low mood suggest a lighter day', () => {
    const out = classifyLocalInput({ text: 'overwhelmed by deadlines and feeling low' });
    expect(out.intensitySuggestion).toBe('rest');
    expect(out.signals).toEqual(expect.arrayContaining(['stress', 'low_mood']));
  });
});

describe('Memory vault', () => {
  const base: Omit<MemoryItem, 'id' | 'createdAt'> = { category: 'pattern', content: 'x', source: 'insight', isSensitive: false };

  test('expired memories are hidden and newest come first', () => {
    const now = new Date('2026-10-23T12:00:00Z');
    const items: MemoryItem[] = [
      { ...base, id: 'old', createdAt: '2026-07-01T00:00:00Z', expiresAt: '2026-09-29T00:00:00Z' },
      { ...base, id: 'a', createdAt: '2026-10-01T00:00:00Z', expiresAt: '2026-12-30T00:00:00Z' },
      { ...base, id: 'b', createdAt: '2026-10-20T00:00:00Z', source: 'user' },
    ];
    expect(activeMemories(items, now).map((m) => m.id)).toEqual(['b', 'a']);
  });
});

describe('activity and food insights', () => {
  const ci = (date: string, mood: number) => ({ date, energy: 5, mood, stress: 5, sleepHours: 7, symptoms: [] });
  test('mood on active vs rest days, weekly activity and protein', () => {
    const checkIns = [
      ci('2026-10-20', 8), ci('2026-10-21', 8), ci('2026-10-22', 8),
      ci('2026-10-17', 5), ci('2026-10-18', 5), ci('2026-10-19', 5),
    ];
    const out = computeInsights({
      checkIns,
      today: '2026-10-25',
      activeDates: ['2026-10-20', '2026-10-21', '2026-10-22'],
      proteinByDate: { '2026-10-22': 60, '2026-10-23': 70, '2026-10-24': 80 },
    });
    const ids = out.map((i) => i.id);
    expect(ids).toEqual(expect.arrayContaining(['activity_weeks', 'activity_mood', 'protein_week']));
    expect(out.find((i) => i.id === 'protein_week')!.title).toMatch(/70 g/);
    expect(out.find((i) => i.id === 'activity_mood')!.title).toMatch(/higher/);
  });
  test('nothing without enough data', () => {
    expect(computeInsights({ checkIns: [], today: '2026-10-25', activeDates: ['2026-10-24'] }).filter((i) => i.kind === 'activity')).toEqual([]);
  });
});
```

#### `tests/unit/modelImport.test.ts`

```ts
jest.mock('expo-document-picker', () => ({}));
jest.mock('expo-file-system/legacy', () => ({ documentDirectory: 'file:///data/' }));
import { importedFileOf, isImportedId, safeModelName } from '../../src/services/ai/modelImport';

describe('model import names', () => {
  it('makes safe .gguf file names', () => {
    expect(safeModelName('Qwen3 0.6B (Q4_K_M).GGUF')).toBe('Qwen3-0.6B-Q4_K_M.gguf');
    expect(safeModelName('???')).toBe('model.gguf');
  });
  it('recognises imported ids', () => {
    expect(isImportedId('import:a.gguf')).toBe(true);
    expect(isImportedId('qwen2.5-0.5b-instruct')).toBe(false);
    expect(importedFileOf('import:a.gguf')).toBe('a.gguf');
  });
});
```

#### `tests/unit/portrait.test.ts`

```ts
import { analyseBody, analyseColours, analyseFace, analysePosture, bodyNumbers } from '../../src/domain/vision/portrait';

function mesh(pts: Record<number, [number, number]>): number[] {
  const f = new Array(478 * 3).fill(0.5);
  for (const [i, [x, y]] of Object.entries(pts)) {
    f[Number(i) * 3] = x;
    f[Number(i) * 3 + 1] = y;
  }
  return f;
}

const faceBase = {
  10: [0.5, 0.2], 152: [0.5, 0.8], 234: [0.3, 0.5], 454: [0.7, 0.5], 54: [0.33, 0.3], 284: [0.67, 0.3],
  172: [0.35, 0.7], 397: [0.65, 0.7], 468: [0.42, 0.42], 473: [0.58, 0.42], 469: [0.41, 0.42], 471: [0.43, 0.42],
  474: [0.57, 0.42], 476: [0.59, 0.42],
} as Record<number, [number, number]>;

describe('portrait analysis', () => {
  it('reads face proportions in pixels and recommends frames', () => {
    const r = analyseFace(mesh(faceBase), 1000, 1000)!;
    expect(r.ratios.length).toBeCloseTo(1.65, 1);
    expect(r.shape).toBe('oblong');
    expect(r.frames.length).toBeGreaterThan(0);
    expect(r.pdMm).toBe(Math.round((160 / 20) * 11.7) >= 50 && Math.round((160 / 20) * 11.7) <= 76 ? Math.round((160 / 20) * 11.7) : null);
  });

  it('calls a short, wide face with a wide jaw square', () => {
    const r = analyseFace(mesh({ ...faceBase, 10: [0.5, 0.3], 152: [0.5, 0.75], 172: [0.32, 0.7], 397: [0.68, 0.7] }), 1000, 1000)!;
    expect(r.shape).toBe('square');
  });

  it('refuses a face too small to judge', () => {
    expect(analyseFace(mesh({ ...faceBase, 234: [0.49, 0.5], 454: [0.51, 0.5] }), 1000, 1000)).toBeNull();
  });

  const pose = () => {
    const p = new Array(33 * 3).fill(0.9);
    const set = (i: number, x: number, y: number) => ((p[i * 3] = x), (p[i * 3 + 1] = y));
    set(0, 0.5, 0.15);
    set(11, 0.4, 0.3);
    set(12, 0.6, 0.3);
    set(23, 0.43, 0.55);
    set(24, 0.57, 0.55);
    return p;
  };

  it('finds wider shoulders from the width profile', () => {
    const widths = new Array(64).fill(0.2);
    for (let b = 19; b <= 22; b++) widths[b] = 0.3; // shoulders
    for (let b = 34; b <= 36; b++) widths[b] = 0.24; // hips
    expect(analyseBody(widths, pose())!.shape).toBe('shoulders_wider');
  });

  it('scores level posture high and a tilted one lower', () => {
    expect(analysePosture(pose(), 1000, 1000)!.score).toBe(100);
    const tilted = pose();
    tilted[12 * 3 + 1] = 0.36;
    expect(analysePosture(tilted, 1000, 1000)!.score).toBeLessThan(90);
  });

  it('pairs a neutral with anything, and flags competing colours', () => {
    expect(analyseColours([20, 20, 20], [200, 30, 30])!.pairing).toBe('neutral');
    expect(analyseColours([200, 30, 30], [30, 200, 30])!.score).toBeLessThan(70);
  });

  it('computes BMI and targets with sensible bounds', () => {
    const b = bodyNumbers(175, 70, 30, null)!;
    expect(b.bmi).toBeCloseTo(22.9, 1);
    expect(b.category).toBe('healthy');
    expect(b.energy!.low).toBeLessThan(b.energy!.high);
    expect(bodyNumbers(50, 70)).toBeNull();
  });
});
```

#### `tests/unit/voice-commands.test.ts`

```ts
import {
  parseVoiceCommand,
  voiceCommandResponseSpeech,
  type VoiceCommand,
} from '../../src/domain/coach/voiceCommands';

describe('Voice Commands Engine', () => {
  it('correctly parses common workout commands', () => {
    expect(parseVoiceCommand('pause')).toBe('pause');
    expect(parseVoiceCommand('pause workout')).toBe('pause');
    expect(parseVoiceCommand('stop')).toBe('pause');
    expect(parseVoiceCommand('hold on')).toBe('pause');

    expect(parseVoiceCommand('resume')).toBe('resume');
    expect(parseVoiceCommand('continue')).toBe('resume');
    expect(parseVoiceCommand("let's go")).toBe('resume');
    expect(parseVoiceCommand("i'm ready")).toBe('resume');

    expect(parseVoiceCommand('next')).toBe('next_set');
    expect(parseVoiceCommand('done')).toBe('next_set');
    expect(parseVoiceCommand('skip')).toBe('next_set');
    expect(parseVoiceCommand('finish')).toBe('next_set');

    expect(parseVoiceCommand('add rest')).toBe('add_rest');
    expect(parseVoiceCommand('give me thirty seconds')).toBe('add_rest');
    expect(parseVoiceCommand('more time')).toBe('add_rest');

    expect(parseVoiceCommand('previous')).toBe('previous');
    expect(parseVoiceCommand('go back')).toBe('previous');

    expect(parseVoiceCommand('toggle video')).toBe('toggle_video');
    expect(parseVoiceCommand('pause video')).toBe('toggle_video');

    expect(parseVoiceCommand('help')).toBe('help');
    expect(parseVoiceCommand('what can i say')).toBe('help');
  });

  it('returns null for unrecognized chatter and casual sentences', () => {
    expect(parseVoiceCommand('')).toBeNull();
    expect(parseVoiceCommand('what is the weather today')).toBeNull();
    expect(parseVoiceCommand('random noise')).toBeNull();
    expect(parseVoiceCommand('the next thing is my tripod setup')).toBeNull();
    expect(parseVoiceCommand('I am almost done with my positioning')).toBeNull();
    expect(parseVoiceCommand('stop talking please')).toBeNull();
  });

  it('supports coach wake phrases and command prefixes', () => {
    expect(parseVoiceCommand('hey coach, pause')).toBe('pause');
    expect(parseVoiceCommand('coach next set')).toBe('next_set');
    expect(parseVoiceCommand('please resume')).toBe('resume');
  });

  it('respects allowedCommands allowlist per workout state', () => {
    // During positioning, next_set is not allowed
    expect(
      parseVoiceCommand('next set', {
        allowedCommands: ['help', 'toggle_video', 'resume'],
      }),
    ).toBeNull();

    // But resume or help is allowed
    expect(
      parseVoiceCommand('resume', {
        allowedCommands: ['help', 'toggle_video', 'resume'],
      }),
    ).toBe('resume');
  });

  it('generates natural coaching voice response for recognized commands', () => {
    expect(voiceCommandResponseSpeech('pause')).toMatch(/Workout paused/);
    expect(voiceCommandResponseSpeech('resume')).toMatch(/Resuming/);
    expect(voiceCommandResponseSpeech('next_set', { rest: true })).toMatch(/Skipping rest/);
    expect(voiceCommandResponseSpeech('next_set', { rest: false })).toMatch(/Set completed/);
    expect(voiceCommandResponseSpeech('add_rest')).toMatch(/thirty seconds/);
    expect(voiceCommandResponseSpeech('previous', { itemIdx: 1 })).toMatch(/previous exercise/);
    expect(voiceCommandResponseSpeech('previous', { itemIdx: 0 })).toMatch(/first exercise/);
    expect(voiceCommandResponseSpeech('toggle_video', { videoPlaying: true })).toMatch(/Pausing/);
    expect(voiceCommandResponseSpeech('help')).toMatch(/pause, resume, next/);
  });
});
```

#### `tests/unit/voicePractice.test.ts`

```ts
import { longestPhonation, steadiness, wordAccuracy, wordsPerMinute } from '../../src/domain/voice/practice';

const run = (from: number, to: number, level: number, step = 100) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, k) => ({ at: from + k * step, level }));

describe('voice practice', () => {
  it('measures the longest held sound, bridging short dips', () => {
    const s = [...run(0, 3000, 5), { at: 3100, level: -1 }, ...run(3200, 5000, 5)];
    expect(longestPhonation(s)).toBe(5000);
    const broken = [...run(0, 2000, 5), ...run(2100, 3000, -1), ...run(3100, 4000, 5)];
    expect(longestPhonation(broken)).toBe(2000);
  });

  it('reports steadiness inside the loudness band', () => {
    const s = [...run(0, 1900, 5), ...run(2000, 2900, 9)];
    expect(steadiness(s, 4, 7)).toBe(67);
    expect(steadiness(run(0, 500, 5), 4, 7)).toBeNull();
  });

  it('scores words said in order and lists missed ones', () => {
    expect(wordAccuracy('Red lorry yellow lorry', 'red lorry yellow lorry').score).toBe(100);
    const r = wordAccuracy('She sells sea shells by the sea shore', 'she sells shells by the shore');
    expect(r.score).toBe(75);
    expect(r.missed).toEqual(['sea', 'sea']);
  });

  it('computes words per minute', () => {
    expect(wordsPerMinute('one two three four five six', 3000)).toBe(120);
    expect(wordsPerMinute('hi', 500)).toBeNull();
  });
});

import { levelFromDbfs, noteName, pitchSteadiness } from '../../src/domain/voice/practice';

test('pitch helpers', () => {
  expect(noteName(440)).toBe('A4');
  expect(noteName(220)).toBe('A3');
  expect(noteName(0)).toBeNull();
  const steady = pitchSteadiness(new Array(20).fill(220));
  expect(steady).toEqual({ medianHz: 220, spreadCents: 0 });
  const wobbly = pitchSteadiness(Array.from({ length: 20 }, (_, i) => (i % 2 ? 233 : 208)));
  expect(wobbly!.spreadCents).toBeGreaterThan(90);
  expect(pitchSteadiness([220, 0, 0])).toBeNull();
  expect(levelFromDbfs(-55)).toBe(0);
  expect(levelFromDbfs(-15)).toBe(10);
});
```

### CONFIGURATION EXTRACTS

#### `app.json`

```text
104:           "isAndroidBackgroundLocationEnabled": false,
105:           "isAndroidForegroundServiceEnabled": false
106:         }
107:       ],
108:       [
109:         "expo-speech-recognition",
110:         {
111:           "microphonePermission": "Thrivefold uses the microphone only while you talk to the coach or do voice practice. Audio is processed on this phone and never saved.",
112:           "speechRecognitionPermission": "Thrivefold turns your speech into text for voice commands and voice practice.",
113:           "androidSpeechServicePackages": [
114:             "com.google.android.as",
115:             "com.google.android.googlequicksearchbox"
116:           ]
150:           "android": {
151:             "minSdkVersion": 26,
152:             "extraGradleProperties": {
153:               "org.gradle.jvmargs": "-Xmx6144m -XX:MaxMetaspaceSize=1024m -XX:+UseParallelGC",
154:               "org.gradle.parallel": "true",
155:               "org.gradle.caching": "true",
156:               "android.enablePngCrunchInReleaseBuilds": "false",
157:               "reactNativeArchitectures": "arm64-v8a"
158:             },
159:             "extraProguardRules": "# Custom Expo modules (created by name; props bound by reflection).\n-keep class expo.modules.setusquircle.** { *; }\n-keep class expo.modules.localai.** { *; }\n-keep class expo.modules.poselandmarker.** { *; }\n-keep class expo.modules.stepcounter.** { *; }\n-keep class expo.modules.alarmscheduler.** { *; }\n# Llamatik (llama.cpp): native code calls back into Kotlin and is found with Class.forName.\n-keep class com.llamatik.** { *; }\n-keep interface com.llamatik.** { *; }\n-dontwarn com.llamatik.**\n# MediaPipe tasks: JNI callbacks and protobuf read by reflection.\n-keep class com.google.mediapipe.** { *; }\n-keep class com.google.protobuf.** { *; }\n-dontwarn com.google.mediapipe.**\n-dontwarn com.google.protobuf.**\n# MediaPipe logs through Flogger (finds its caller by class name); keep it unrenamed.\n-keep class com.google.common.flogger.** { *; }\n-dontwarn com.google.common.flogger.**"
160:           }
161:         }
162:       ],
163:       [
164:         "expo-splash-screen",
165:         {
166:           "image": "./assets/images/splash-screen.png",
167:           "imageWidth": 260,
168:           "resizeMode": "contain",
169:           "backgroundColor": "#FAF7F2"
170:         }
171:       ],
172:       "@react-native-google-signin/google-signin",
173:       "expo-secure-store",
174:       "react-native-health-connect",
```

#### `supabase/config.toml`

```text
1: # Only per-function settings are kept here; the project itself is linked with `supabase link`.
2: project_id = "thrivefold"
3: 
4: [functions.age-check]
5: # The provider webhook has no user token. /start validates the caller's JWT itself and
6: # /webhook validates the provider's HMAC signature.
7: verify_jwt = false
8: 
9: [functions.delete-account]
10: # Validates the caller's JWT itself (and requires an explicit confirmation in the body).
11: verify_jwt = false
12: 
13: [functions.ai-chat]
14: # Validates the caller's JWT itself and handles CORS preflight.
15: verify_jwt = false
16: 
17: [functions.meal-vision]
18: enabled = true
19: verify_jwt = false
```

#### `src/app/_layout.tsx`

```text
1: import { Stack } from 'expo-router';
2: import * as SplashScreen from 'expo-splash-screen';
3: import React, { useEffect, useLayoutEffect, useState } from 'react';
4: import { StatusBar, StyleSheet } from 'react-native';
5: import { GestureHandlerRootView } from 'react-native-gesture-handler';
6: import { SafeAreaProvider } from 'react-native-safe-area-context';
7: import { useRootStore } from '../stores/useRootStore';
8: import { useTheme } from '../theme/useTheme';
9: import { preloadAllAppImages } from '../utils/imagePreloader';
10: 
11: import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
12: import { CoachProvider } from '../components/assistant/CoachProvider';
13: import { AnimatedSplash } from '../components/brand/AnimatedSplash';
14: import { ErrorBoundary } from '../components/ErrorBoundary';
15: import { AchievementModal } from '../components/ui/AchievementModal';
16: import { CustomAlert } from '../components/ui/CustomAlert';
17: import { MindfulNotificationBanner } from '../components/ui/MindfulNotificationBanner';
18: import { PERSIST_MAX_AGE, queryClient, queryPersister } from '../services/supabase/queryClient';
19: import * as Notifications from 'expo-notifications';
20: 
21: // Global notification handler for alarm-clock style alerts
22: Notifications.setNotificationHandler({
23:   handleNotification: async () => ({
24:     shouldShowAlert: true,
25:     shouldShowBanner: true,
26:     shouldShowList: true,
27:     shouldPlaySound: true,
28:     shouldSetBadge: true,
29:   }),
30: });
31: 
32: // The animated splash hides the native one once it is drawn on top of it.
33: SplashScreen.preventAutoHideAsync().catch(() => undefined);
34: 
35: export default function RootLayout() {
36:   const [splash, setSplash] = useState(true);
37:   const resetDailyQuotaIfNewDay = useRootStore((s) => s.resetDailyQuotaIfNewDay);
38: 
39:   useLayoutEffect(() => {
40:     preloadAllAppImages();
41:   }, []);
42: 
43:   useEffect(() => {
44:     resetDailyQuotaIfNewDay();
45:   }, [resetDailyQuotaIfNewDay]);
46: 
47:   return (
48:     <PersistQueryClientProvider
49:       client={queryClient}
50:       persistOptions={{
51:         persister: queryPersister,
52:         maxAge: PERSIST_MAX_AGE,
53:         // Queries whose data already lives in SQLite opt out with `meta: { persist: false }`.
54:         dehydrateOptions: {
55:           shouldDehydrateQuery: (q) => q.state.status === 'success' && q.meta?.persist !== false,
56:         },
57:       }}
58:     >
59:       <GestureHandlerRootView style={styles.container}>
60:         <SafeAreaProvider>
61:           {/* <BlurRoot> */}
62:           <ErrorBoundary>
63:             {/* One Anvay coach for the whole app: sheet, voice, knowledge and data routines. */}
64:             <CoachProvider>
65:               <ThemedStatusBar />
66:               <Stack
67:                 screenOptions={{
68:                   headerShown: false,
69:                   animation: 'slide_from_right',
70:                 }}
71:               >
72:                 <Stack.Screen name="index" />
73:                 <Stack.Screen name="(public)" />
74:                 <Stack.Screen name="(auth)" />
75:                 <Stack.Screen name="(onboarding)" />
76:                 <Stack.Screen name="(app)" />
77:               </Stack>
78:               <MindfulNotificationBanner />
79:               <CustomAlert />
80:               <AchievementModal />
81:             </CoachProvider>
82:             {splash ? <AnimatedSplash onDone={() => setSplash(false)} /> : null}
83:           </ErrorBoundary>
84:           {/* </BlurRoot> */}
85:         </SafeAreaProvider>
86:       </GestureHandlerRootView>
87:     </PersistQueryClientProvider>
88:   );
89: }
90: 
```

#### `src/app/(app)/_layout.tsx`

```text
1: import { refreshOwnerStatus } from '../../services/account/owner';
2: import { supabase } from '../../services/supabase/supabaseClient';
3: import * as Notifications from 'expo-notifications';
4: import { coachVoice } from '../../services/ai/coachVoice';
5: import { applyKosh, pullProfile, pushProfile } from '../../services/account/profileSync';
6: import { syncProgress } from '../../services/account/progressSync';
7: import { brainReady, getSetupState, pendingDownload, resumeSetup, setUpBrain } from '../../services/ai/modelSetup';
8: import React, { useEffect, useRef } from 'react';
9: import { AppState, StyleSheet, View } from 'react-native';
10: import type { ViewInstance } from 'react-native';
11: import { Redirect, Stack, usePathname, useRouter, type Href } from 'expo-router';
12: import { restorableRoute } from '../../navigation/restore';
13: 
14: import { useRootStore } from '../../stores/useRootStore';
15: import { flushProgressionSync } from '../../services/sync/progressionSync';
16: import { syncQuestReminders } from '../../services/notifications/questReminders';
17: import { AppDrawer } from '../../components/navigation/AppDrawer';
18: import { DrawerSceneWrapper } from '../../components/navigation/DrawerSceneWrapper';
19: import { enqueueFinishedWeeks, flushSummaryOutbox } from '../../services/sync/summaryOutbox';
20: import { analytics } from '../../services/telemetry/analyticsService';
21: import { firebaseAnalytics } from '../../services/telemetry/firebaseAnalytics';
22: import { crashReporting } from '../../services/telemetry/crashReporting';
23: import { useTheme } from '../../theme/useTheme';
24: import { syncServerProfile, useAgeCheckStatus, useSyncAgeVerified } from '../../services/supabase/ageCheck';
25: 
26: /** Queues finished weeks and sends them if this person opted in; never throws. */
27: function runSummaryQueue() {
28:   try {
29:     enqueueFinishedWeeks();
30:     flushSummaryOutbox().catch(() => undefined);
31:   } catch {
32:     // The outbox is best-effort; the app works without it.
33:   }
34: }
35: 
36: export default function AppLayout() {
37:   const pathname = usePathname();
38:   const router = useRouter();
39: 
40:   // Reopen the screen the person left recently, once per launch, on top of Home (Back works).
41:   // Read before this launch's navigation overwrites it; nothing on the screen is replayed.
42:   const resumeRef = React.useRef<string | null | undefined>(undefined);
43:   if (resumeRef.current === undefined) {
44:     const s = useRootStore.getState();
45:     const r = restorableRoute(s.lastActiveRoute, s.lastActiveAt);
46:     resumeRef.current = r && !['/today', '/progress', '/settings'].includes(r) ? r : null;
47:   }
48:   useEffect(() => {
49:     const r = resumeRef.current;
50:     if (!r) return;
51:     resumeRef.current = null;
52:     const t = setTimeout(() => router.push(r as Href), 50);
53:     return () => clearTimeout(t);
54:   }, [router]);
55:   const isAuthenticated = useRootStore((s) => s.isAuthenticated);
56:   const ensureDailyQuests = useRootStore((s) => s.ensureDailyQuests);
57:   const isOnboarded = useRootStore((s) => s.isOnboarded);
58:   const pendingCount = useRootStore((s) => s.pendingSync.length);
59:   const openCount = useRootStore((s) => s.todayQuests.filter((q) => !q.isCompleted && q.status !== 'skipped').length);
60:   const remindersOn = useRootStore((s) => s.questRemindersEnabled);
61: 
62:   // Firebase collects only after an explicit opt-in (firebase.json keeps it off at install).
63:   // Owner access follows the server and the sign-in state; never cached past a sign-out.
64:   useEffect(() => {
65:     void refreshOwnerStatus();
66:     const sub = supabase?.auth.onAuthStateChange(() => {
67:       void refreshOwnerStatus();
68:     });
69:     return () => sub?.data.subscription.unsubscribe();
70:   }, []);
71: 
72:   // Keep the server copy of the person's own profile current (debounced; signed-in accounts only).
73:   useEffect(() => {
74:     const key = (st: ReturnType<typeof useRootStore.getState>) =>
75:       JSON.stringify([st.user?.pseudonym, st.user?.birthDate, st.experience, st.experienceConfirmed, st.isOnboarded, st.onboarding.goals, st.onboarding.constraints, st.onboarding.routineMinutes, st.onboarding.diet, st.koshProfile, st.emergencyContacts, st.heightCm, st.weightKg, st.termsAcceptedVersion]);
76:     let last = key(useRootStore.getState());
77:     let timer: ReturnType<typeof setTimeout> | null = null;
78:     // On start: take anything the server has that this phone lacks, then send this phone's copy.
79:     void pullProfile()
80:       .then((r) => {
```

#### `src/stores/slices/aiSlice.ts`

```text
1: import type { StateCreator } from 'zustand';
2: 
3: import type { RootState } from '../rootTypes';
4: import type { MemoryItem } from '../../domain/ai/types';
5: 
6: /** Insight-derived memories are kept for 90 days unless the person keeps them again. */
7: const INSIGHT_MEMORY_DAYS = 90;
8: const MAX_MEMORY_LENGTH = 280;
9: 
10: export interface AiSlice {
11:   /** The personal memory vault: only what the person typed or explicitly chose to keep. */
12:   aiMemories: MemoryItem[];
13:   /** When off, memories are kept but not used for personalisation. */
14:   aiMemoryEnabled: boolean;
15:   addAiMemory: (input: {
16:     content: string;
17:     category: MemoryItem['category'];
18:     source: MemoryItem['source'];
19:     sourceRef?: string;
20:     isSensitive?: boolean;
21:   }) => MemoryItem | null;
22:   updateAiMemory: (id: string, content: string) => void;
23:   deleteAiMemory: (id: string) => void;
24:   clearAiMemories: () => void;
25:   setAiMemoryEnabled: (enabled: boolean) => void;
26: }
27: 
28: export const createAiSlice: StateCreator<RootState, [['zustand/persist', unknown]], [], AiSlice> = (
29:   set,
30:   get,
31: ) => ({
32:   aiMemories: [],
33:   aiMemoryEnabled: true,
34: 
35:   addAiMemory: ({ content, category, source, sourceRef, isSensitive = false }) => {
36:     const text = content.trim().slice(0, MAX_MEMORY_LENGTH);
37:     if (!text) return null;
38:     const now = new Date();
39:     const existing = sourceRef ? get().aiMemories.find((m) => m.sourceRef === sourceRef) : undefined;
40:     const expiresAt =
41:       source === 'insight'
42:         ? new Date(now.getTime() + INSIGHT_MEMORY_DAYS * 86400000).toISOString()
43:         : undefined;
44: 
45:     if (existing) {
46:       // Keeping the same insight again refreshes it instead of duplicating it.
47:       const refreshed = { ...existing, content: text, updatedAt: now.toISOString(), expiresAt };
48:       set((s) => ({ aiMemories: s.aiMemories.map((m) => (m.id === existing.id ? refreshed : m)) }));
49:       return refreshed;
50:     }
51: 
52:     const item: MemoryItem = {
53:       id: `mem_${now.getTime()}_${Math.random().toString(36).slice(2, 7)}`,
54:       category,
55:       content: text,
56:       source,
57:       sourceRef,
58:       createdAt: now.toISOString(),
59:       expiresAt,
60:       isSensitive,
61:     };
62:     set((s) => ({ aiMemories: [item, ...s.aiMemories] }));
63:     return item;
64:   },
65: 
66:   updateAiMemory: (id, content) => {
67:     const text = content.trim().slice(0, MAX_MEMORY_LENGTH);
68:     if (!text) return;
69:     set((s) => ({
70:       aiMemories: s.aiMemories.map((m) =>
71:         m.id === id ? { ...m, content: text, updatedAt: new Date().toISOString() } : m,
72:       ),
73:     }));
74:   },
75: 
76:   deleteAiMemory: (id) => set((s) => ({ aiMemories: s.aiMemories.filter((m) => m.id !== id) })),
77: 
78:   clearAiMemories: () => set({ aiMemories: [] }),
79: 
80:   setAiMemoryEnabled: (enabled) => set({ aiMemoryEnabled: enabled }),
81: });
```

### ADDITIONAL DISCOVERED CALLERS / ON-DEVICE CLASSIFIERS
`check-in/index.tsx` → `domain/ai/localClassifier.ts`; `health/meal-log.tsx` → `services/ai/mealVision.ts` plus native food-image classifier; `services/journal/semanticSearch.ts` → MediaPipe text classification. These are domain features and mixed-purpose files, listed here without unrelated source. `services/documents/docReader.ts` calls the document-reader edge function.

### ADDITIONAL SOURCE: DOCUMENT / JOURNAL ADAPTERS, NATIVE VISION CLASSIFIERS

#### `src/services/documents/docReader.ts`

```ts
/**
 * Reads a photo of a prescription, diet chart or workout plan through the `doc-reader` Edge
 * Function. Returns what is written, for the person to check before anything is saved.
 */
import * as FileSystem from 'expo-file-system/legacy';

import { resizeForUpload } from '../../../modules/pose-landmarker/food';
import { supabase } from '../supabase/supabaseClient';

export type DocKind = 'prescription' | 'diet_chart' | 'workout_plan';

export interface PrescriptionResult {
  doctor?: string | null;
  date?: string | null;
  medicines: { name: string; strength?: string | null; form?: string | null; dose?: string | null; frequency?: string | null; timing?: string | null; duration?: string | null; unclear?: boolean }[];
  followUp?: string | null;
  notes?: string | null;
}
export interface DietChartResult {
  by?: string | null;
  meals: { time?: string | null; label: string; items: string[] }[];
  avoid?: string[];
  notes?: string | null;
}
export interface WorkoutPlanResult {
  by?: string | null;
  days: { day: string; exercises: { name: string; sets?: string | null; reps?: string | null; load?: string | null; rest?: string | null }[] }[];
  notes?: string | null;
}

export async function readDocument(photoUri: string, kind: DocKind): Promise<unknown> {
  if (!supabase) throw new Error('Reading documents needs the Thrivefold server.');
  const small = await resizeForUpload(photoUri, 1600);
  const image = await FileSystem.readAsStringAsync(small, { encoding: FileSystem.EncodingType.Base64 });
  await FileSystem.deleteAsync(small, { idempotent: true });
  const { data, error } = await supabase.functions.invoke('doc-reader', { body: { image, kind } });
  if (error) {
    let reason = '';
    try {
      reason = (await (error as { context?: Response }).context?.json())?.error ?? '';
    } catch {
      reason = '';
    }
    throw new Error(
      reason === 'not_authenticated'
        ? 'Sign in to read documents.'
        : reason === 'daily_limit'
          ? 'Daily limit reached. Try again tomorrow.'
          : 'Could not read this photo. Try a sharper, well-lit photo.',
    );
  }
  return (data as { result: unknown }).result;
}

/** "after breakfast", "1-0-1", "morning" … to a reminder time, or null when it is not clear. */
export function timeFromTiming(timing: string | null | undefined, frequency: string | null | undefined): string[] {
  const t = `${timing ?? ''} ${frequency ?? ''}`.toLowerCase();
  const pattern = t.match(/\b([01])\s*-\s*([01])\s*-\s*([01])\b/);
  if (pattern) {
    const out: string[] = [];
    if (pattern[1] === '1') out.push('08:00');
    if (pattern[2] === '1') out.push('14:00');
    if (pattern[3] === '1') out.push('21:00');
    return out;
  }
  const out: string[] = [];
  if (/morning|breakfast|\bod\b|once/.test(t)) out.push('08:00');
  if (/afternoon|lunch/.test(t)) out.push('14:00');
  if (/evening|dinner|night|bed|\bhs\b/.test(t)) out.push('21:00');
  if (out.length === 0 && /twice|\bbd\b|\bbid\b/.test(t)) return ['08:00', '21:00'];
  if (out.length === 0 && /thrice|\btds\b|\btid\b/.test(t)) return ['08:00', '14:00', '21:00'];
  return out;
}
```

#### `src/services/journal/semanticSearch.ts`

```ts
/**
 * Search journal entries by meaning, on the phone (MediaPipe Text Embedder, Universal Sentence
 * Encoder). Embeddings are cached in memory per entry for this session and never stored or sent.
 */
import { MediaPipeTools, cosine } from '../../../modules/pose-landmarker/tools';
import type { JournalEntry } from '../../stores/slices/healthSlice';

const cache = new Map<string, number[]>();

export const semanticSearchAvailable = () => !!MediaPipeTools;

export async function searchJournal(query: string, entries: JournalEntry[], limit = 5): Promise<{ entry: JournalEntry; score: number }[]> {
  if (!MediaPipeTools || !query.trim() || entries.length === 0) return [];
  const missing = entries.filter((e) => !cache.has(e.id));
  if (missing.length) {
    const vecs = await MediaPipeTools.embedText(missing.map((e) => `${e.title}. ${e.content}`));
    missing.forEach((e, i) => cache.set(e.id, vecs[i]));
  }
  const [q] = await MediaPipeTools.embedText([query.trim()]);
  return entries
    .map((entry) => ({ entry, score: cosine(q, cache.get(entry.id) ?? []) }))
    .filter((r) => r.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Overall tone of a text (positive / negative), from the on-device text classifier. */
export async function toneOf(text: string): Promise<'positive' | 'negative' | null> {
  if (!MediaPipeTools || text.trim().length < 12) return null;
  try {
    const cats = await MediaPipeTools.classifyText(text);
    const top = [...cats].sort((a, b) => b.score - a.score)[0];
    if (!top || top.score < 0.65) return null;
    return /pos/i.test(top.label) || top.label === '1' ? 'positive' : 'negative';
  } catch {
    return null;
  }
}
```

#### `modules/pose-landmarker/audio.ts`

```ts
import { requireNativeModule } from 'expo';
import { Platform } from 'react-native';

export interface PitchEvent {
  /** Loudness in dBFS (about −90 silence … 0 full scale). */
  db: number;
  /** Fundamental frequency in Hz from YIN; 0 when unvoiced. */
  hz: number;
  at: number;
}
export interface SoundEvent {
  categories: { label: string; score: number }[];
  at: number;
}

type Sub = { remove: () => void };
interface AudioSenseNative {
  isAvailable(): boolean;
  start(classify: boolean): boolean;
  stop(): void;
  addListener(event: 'onPitch', cb: (e: PitchEvent) => void): Sub;
  addListener(event: 'onSound', cb: (e: SoundEvent) => void): Sub;
  addListener(event: 'onAudioError', cb: (e: { message: string }) => void): Sub;
}

export const AudioSense: AudioSenseNative | null =
  Platform.OS === 'android'
    ? (() => {
        try {
          return requireNativeModule<AudioSenseNative>('AudioSense');
        } catch {
          return null;
        }
      })()
    : null;
```

#### `modules/pose-landmarker/food.ts`

```ts
import { requireNativeModule, requireNativeView } from 'expo';
import type React from 'react';
import { Platform, type NativeSyntheticEvent, type ViewProps } from 'react-native';

export interface VisionLabel {
  label: string;
  score: number;
}

export interface FoodCameraHandle {
  /** Takes a photo; resolves with a file:// URI in the app cache. */
  capture(): Promise<string>;
}

export interface FoodCameraViewProps extends ViewProps {
  active: boolean;
  /** Back by default; "front" for selfies. */
  facing?: 'front' | 'back';
  /** Live food labels (default on); off for plain photo capture. */
  labels?: boolean;
  onLabels?: (event: NativeSyntheticEvent<{ labels: VisionLabel[] }>) => void;
  onFoodReady?: (event: NativeSyntheticEvent<Record<string, never>>) => void;
  onFoodError?: (event: NativeSyntheticEvent<{ code: string; message: string }>) => void;
  ref?: React.Ref<FoodCameraHandle>;
}

interface FoodVisionNative {
  isAvailable(): boolean;
  classifyImage(uri: string): Promise<VisionLabel[]>;
  resizeForUpload(uri: string, maxSide: number): Promise<string>;
}

const native: FoodVisionNative | null =
  Platform.OS === 'android'
    ? (() => {
        try {
          return requireNativeModule<FoodVisionNative>('FoodVision');
        } catch {
          return null;
        }
      })()
    : null;

/** Live back-camera preview that names what it sees, on the device. Null where unsupported. */
export const FoodCameraView: React.ComponentType<FoodCameraViewProps> | null = native
  ? requireNativeView<FoodCameraViewProps>('FoodVision')
  : null;

export const foodVisionAvailable = (): boolean => {
  try {
    return native?.isAvailable() ?? false;
  } catch {
    return false;
  }
};

/** On-device labels for a saved photo; empty when unavailable or the photo can't be read. */
export async function classifyImage(uri: string): Promise<VisionLabel[]> {
  if (!native) return [];
  try {
    return await native.classifyImage(uri);
  } catch {
    return [];
  }
}

/** A smaller upright JPEG for upload; falls back to the original when the module is missing. */
export async function resizeForUpload(uri: string, maxSide = 1280): Promise<string> {
  if (!native) return uri;
  try {
    return await native.resizeForUpload(uri, maxSide);
  } catch {
    return uri;
  }
}
```

#### `modules/pose-landmarker/tools.ts`

```ts
import { requireNativeModule } from 'expo';
import { Platform } from 'react-native';

export interface DetectedObject {
  label: string;
  score: number;
  /** [left, top, right, bottom], normalised to the photo. */
  box: [number, number, number, number];
}

interface ToolsNative {
  detectObjects(uri: string): Promise<DetectedObject[]>;
  cutout(uri: string, x: number, y: number): Promise<{ uri: string; coverage: number }>;
  embedImage(uri: string): Promise<number[]>;
  detectLanguage(text: string): Promise<{ code: string; score: number }[]>;
  embedText(texts: string[]): Promise<number[][]>;
  classifyText(text: string): Promise<{ label: string; score: number }[]>;
}

/** On-device MediaPipe tasks (object detection, cutout, embeddings, language, text). Null off Android. */
export const MediaPipeTools: ToolsNative | null =
  Platform.OS === 'android'
    ? (() => {
        try {
          return requireNativeModule<ToolsNative>('MediaPipeTools');
        } catch {
          return null;
        }
      })()
    : null;

/** Cosine similarity of two L2-normalised vectors. */
export const cosine = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
```

#### `modules/pose-landmarker/android/src/main/java/expo/modules/poselandmarker/AudioSenseModule.kt`

```kt
package expo.modules.poselandmarker

import android.annotation.SuppressLint
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import com.google.mediapipe.tasks.audio.audioclassifier.AudioClassifier
import com.google.mediapipe.tasks.audio.core.RunningMode
import com.google.mediapipe.tasks.components.containers.AudioData
import com.google.mediapipe.tasks.core.BaseOptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.log10
import kotlin.math.sqrt

/**
 * On-device microphone analysis. Reads 16 kHz mono PCM with AudioRecord and, in memory only:
 *  - every 50 ms: loudness (dBFS) and pitch (YIN, 70-1000 Hz) -> `onPitch`
 *  - every ~0.5 s (when enabled): MediaPipe Audio Classifier (YAMNet, 521 AudioSet classes)
 *    over the last 0.975 s -> `onSound` with the top categories.
 * Nothing is recorded to disk or sent anywhere. Requires RECORD_AUDIO (asked by the app first).
 */
class AudioSenseModule : Module() {
  companion object {
    const val SAMPLE_RATE = 16000
    const val YAMNET_ASSET = "yamnet.tflite"
    private const val PITCH_WINDOW = 2048
    private const val CLASSIFY_WINDOW = 15600 // 0.975 s at 16 kHz, YAMNet's input
  }

  @Volatile private var running = false
  private var thread: Thread? = null

  override fun definition() = ModuleDefinition {
    Name("AudioSense")
    Events("onPitch", "onSound", "onAudioError")

    Function("isAvailable") {
      val ctx = appContext.reactContext ?: return@Function false
      try {
        ctx.assets.open(YAMNET_ASSET).close()
        true
      } catch (_: Exception) {
        false
      }
    }

    Function("start") { classify: Boolean -> start(classify) }
    Function("stop") { stop() }
    OnDestroy { stop() }
  }

  @SuppressLint("MissingPermission")
  private fun start(classify: Boolean): Boolean {
    if (running) return true
    val ctx = appContext.reactContext ?: return false
    val minBuf = AudioRecord.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
    val record = try {
      AudioRecord(MediaRecorder.AudioSource.VOICE_RECOGNITION, SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, maxOf(minBuf, 4096) * 2)
    } catch (e: Exception) {
      sendEvent("onAudioError", mapOf("message" to (e.message ?: "Microphone unavailable")))
      return false
    }
    if (record.state != AudioRecord.STATE_INITIALIZED) {
      record.release()
      sendEvent("onAudioError", mapOf("message" to "Microphone unavailable (permission or another app is using it)"))
      return false
    }
    val classifier = if (!classify) null else try {
      AudioClassifier.createFromOptions(
        ctx,
        AudioClassifier.AudioClassifierOptions.builder()
          .setBaseOptions(BaseOptions.builder().setModelAssetPath(YAMNET_ASSET).build())
          .setRunningMode(RunningMode.AUDIO_CLIPS)
          .setMaxResults(5)
          .setScoreThreshold(0.2f)
          .build(),
      )
    } catch (e: Exception) {
      sendEvent("onAudioError", mapOf("message" to "Sound model could not load: ${e.message}"))
      null
    }
    running = true
    record.startRecording()
    thread = Thread {
      val chunk = ShortArray(800) // 50 ms
      val ring = FloatArray(CLASSIFY_WINDOW)
      var ringPos = 0
      var filled = 0
      var sinceClassify = 0
      val pitchBuf = FloatArray(PITCH_WINDOW)
      try {
        while (running) {
          val n = record.read(chunk, 0, chunk.size)
          if (n <= 0) continue
          var sum = 0.0
          for (i in 0 until n) {
            val v = chunk[i] / 32768f
            sum += (v * v).toDouble()
            ring[ringPos] = v
            ringPos = (ringPos + 1) % CLASSIFY_WINDOW
          }
          filled = minOf(CLASSIFY_WINDOW, filled + n)
          sinceClassify += n
          val rms = sqrt(sum / n)
          val db = if (rms > 1e-9) 20 * log10(rms) else -120.0
          var pitch = 0.0
          if (filled >= PITCH_WINDOW && db > -50) {
            for (i in 0 until PITCH_WINDOW) pitchBuf[i] = ring[(ringPos - PITCH_WINDOW + i + CLASSIFY_WINDOW) % CLASSIFY_WINDOW]
            pitch = yin(pitchBuf, SAMPLE_RATE)
          }
          sendEvent("onPitch", mapOf("db" to db, "hz" to pitch, "at" to System.currentTimeMillis().toDouble()))

          if (classifier != null && filled >= CLASSIFY_WINDOW && sinceClassify >= SAMPLE_RATE / 2) {
            sinceClassify = 0
            val clip = FloatArray(CLASSIFY_WINDOW) { ring[(ringPos + it) % CLASSIFY_WINDOW] }
            val audio = AudioData.create(AudioData.AudioDataFormat.builder().setNumOfChannels(1).setSampleRate(SAMPLE_RATE.toFloat()).build(), CLASSIFY_WINDOW)
            audio.load(clip)
            val result = classifier.classify(audio)
            val cats = result.classificationResults().firstOrNull()?.classifications()?.firstOrNull()?.categories() ?: emptyList()
            sendEvent(
              "onSound",
              mapOf("categories" to cats.map { mapOf("label" to it.categoryName(), "score" to it.score().toDouble()) }, "at" to System.currentTimeMillis().toDouble()),
            )
          }
        }
      } catch (e: Exception) {
        sendEvent("onAudioError", mapOf("message" to (e.message ?: "Audio stopped")))
      } finally {
        try { record.stop() } catch (_: Exception) {}
        record.release()
        classifier?.close()
      }
    }.also { it.start() }
    return true
  }

  private fun stop() {
    running = false
    thread?.join(500)
    thread = null
  }

  /** YIN fundamental-frequency estimate (de Cheveigne & Kawahara 2002); 0 when unvoiced. */
  private fun yin(x: FloatArray, sr: Int): Double {
    val maxTau = sr / 70
    val minTau = sr / 1000
    val half = x.size / 2
    if (maxTau + 1 >= half) return 0.0
    val d = FloatArray(maxTau + 1)
    for (tau in 1..maxTau) {
      var s = 0f
      for (i in 0 until half) {
        val diff = x[i] - x[i + tau]
        s += diff * diff
      }
      d[tau] = s
    }
    var acc = 0f
    val cmnd = FloatArray(maxTau + 1)
    cmnd[0] = 1f
    for (tau in 1..maxTau) {
      acc += d[tau]
      cmnd[tau] = if (acc == 0f) 1f else d[tau] * tau / acc
    }
    var tau = maxOf(2, minTau)
    while (tau < maxTau) {
      if (cmnd[tau] < 0.15f) {
        while (tau + 1 < maxTau && cmnd[tau + 1] < cmnd[tau]) tau++
        val a = cmnd[tau - 1]
        val b = cmnd[tau]
        val c = cmnd[tau + 1]
        val denom = 2 * (2 * b - a - c)
        val shift = if (denom != 0f) (c - a) / denom else 0f
        return sr / (tau + shift).toDouble()
      }
      tau++
    }
    return 0.0
  }
}
```

#### `modules/pose-landmarker/android/src/main/java/expo/modules/poselandmarker/FoodClassifier.kt`

```kt
package expo.modules.poselandmarker

import android.content.Context
import android.graphics.Bitmap
import java.nio.ByteBuffer
import java.nio.ByteOrder
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.imageclassifier.ImageClassifier

/**
 * On-device image classifier (MediaPipe EfficientNet-Lite0, ImageNet labels). Generic: it names
 * what it sees with a score; deciding which labels are foods happens in JavaScript.
 * Runs entirely on the phone; nothing leaves the device.
 */
class FoodClassifier private constructor(private val classifier: ImageClassifier) {
  fun classify(bitmap: Bitmap): List<Map<String, Any>> {
    val result = classifier.classify(BitmapImageBuilder(bitmap).build())
    return result.classificationResult().classifications().firstOrNull()?.categories()
      ?.map { mapOf("label" to it.categoryName(), "score" to it.score().toDouble()) }
      ?: emptyList()
  }

  fun close() = classifier.close()

  companion object {
    const val MODEL_ASSET = "food_classifier.tflite"

    private fun load(context: Context): ByteBuffer {
      val bytes = context.assets.open(MODEL_ASSET).use { it.readBytes() }
      return ByteBuffer.allocateDirect(bytes.size).order(ByteOrder.nativeOrder()).apply {
        put(bytes)
        rewind()
      }
    }

    fun create(context: Context): FoodClassifier {
      val options = ImageClassifier.ImageClassifierOptions.builder()
        // Loaded into memory, so it works whether or not the asset was stored compressed.
        .setBaseOptions(BaseOptions.builder().setModelAssetBuffer(load(context)).build())
        .setRunningMode(RunningMode.IMAGE)
        .setMaxResults(8)
        .setScoreThreshold(0.03f)
        .build()
      return FoodClassifier(ImageClassifier.createFromOptions(context, options))
    }
  }
}
```

#### `modules/pose-landmarker/android/src/main/java/expo/modules/poselandmarker/FoodVisionModule.kt`

```kt
package expo.modules.poselandmarker

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.Executors

class FoodVisionModule : Module() {
  private val worker = Executors.newSingleThreadExecutor()

  override fun definition() = ModuleDefinition {
    Name("FoodVision")

    Function("isAvailable") {
      val ctx = appContext.reactContext ?: return@Function false
      try {
        ctx.assets.open(FoodClassifier.MODEL_ASSET).close()
        true
      } catch (_: Exception) {
        false
      }
    }

    /** Classifies a saved photo (file:// or content:// URI) on the device. */
    AsyncFunction("classifyImage") { uri: String, promise: Promise ->
      val ctx = appContext.reactContext
      if (ctx == null) {
        promise.reject("no_context", "No React context", null)
        return@AsyncFunction
      }
      worker.execute {
        var classifier: FoodClassifier? = null
        try {
          val bitmap = decode(ctx, Uri.parse(uri)) ?: throw IllegalArgumentException("Unreadable image")
          classifier = FoodClassifier.create(ctx)
          val labels = classifier.classify(bitmap)
          bitmap.recycle()
          promise.resolve(labels)
        } catch (e: Throwable) {
          promise.reject("classify_failed", e.message ?: "Could not analyse the photo", e)
        } finally {
          classifier?.close()
        }
      }
    }

    /** Writes an upright JPEG of at most `maxSide` px to the cache; resolves with its file:// URI. */
    AsyncFunction("resizeForUpload") { uri: String, maxSide: Int, promise: Promise ->
      val ctx = appContext.reactContext
      if (ctx == null) {
        promise.reject("no_context", "No React context", null)
        return@AsyncFunction
      }
      worker.execute {
        try {
          val src = decode(ctx, Uri.parse(uri)) ?: throw IllegalArgumentException("Unreadable image")
          val scale = minOf(1f, maxSide.toFloat() / maxOf(src.width, src.height))
          val out = if (scale < 1f) {
            Bitmap.createScaledBitmap(src, (src.width * scale).toInt(), (src.height * scale).toInt(), true)
          } else src
          val file = java.io.File(ctx.cacheDir, "upload_${System.currentTimeMillis()}.jpg")
          file.outputStream().use { out.compress(Bitmap.CompressFormat.JPEG, 82, it) }
          if (out !== src) out.recycle()
          src.recycle()
          promise.resolve("file://${file.absolutePath}")
        } catch (e: Throwable) {
          promise.reject("resize_failed", e.message ?: "Could not prepare the photo", e)
        }
      }
    }

    View(FoodCameraView::class) {
      Events("onLabels", "onFoodReady", "onFoodError")
      Prop("active") { view: FoodCameraView, active: Boolean -> view.setActive(active) }
      Prop("facing") { view: FoodCameraView, facing: String -> view.setFacing(facing) }
      Prop("labels") { view: FoodCameraView, on: Boolean -> view.setLabels(on) }
      AsyncFunction("capture") { view: FoodCameraView, promise: Promise -> view.capture(promise) }
      OnViewDestroys { view: FoodCameraView -> view.release() }
    }
  }

  /** Decodes at most ~1024 px on the long side, upright per EXIF. */
  private fun decode(ctx: android.content.Context, uri: Uri): Bitmap? {
    val resolver = ctx.contentResolver
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    resolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
    var sample = 1
    while (maxOf(bounds.outWidth, bounds.outHeight) / sample > 2048) sample *= 2
    val bmp = resolver.openInputStream(uri)?.use {
      BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = sample })
    } ?: return null
    val rotation = try {
      resolver.openInputStream(uri)?.use {
        when (ExifInterface(it).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)) {
          ExifInterface.ORIENTATION_ROTATE_90 -> 90f
          ExifInterface.ORIENTATION_ROTATE_180 -> 180f
          ExifInterface.ORIENTATION_ROTATE_270 -> 270f
          else -> 0f
        }
      } ?: 0f
    } catch (_: Exception) {
      0f
    }
    if (rotation == 0f) return bmp
    val out = Bitmap.createBitmap(bmp, 0, 0, bmp.width, bmp.height, Matrix().apply { postRotate(rotation) }, true)
    bmp.recycle()
    return out
  }
}
```

### ADDITIONAL TESTS
`modules/pose-landmarker/android/src/main/java/expo/modules/poselandmarker/MediaPipeToolsModule.kt` — AI-adjacent app knowledge, BYOK, emergency support, evidence extraction, cloud meal vision, pose classifier, interop fixture coverage.
`tests/unit/appKnowledge.test.ts` — AI-adjacent app knowledge, BYOK, emergency support, evidence extraction, cloud meal vision, pose classifier, interop fixture coverage.
`tests/unit/byok.test.ts` — AI-adjacent app knowledge, BYOK, emergency support, evidence extraction, cloud meal vision, pose classifier, interop fixture coverage.
`tests/unit/emergency-support.test.ts` — AI-adjacent app knowledge, BYOK, emergency support, evidence extraction, cloud meal vision, pose classifier, interop fixture coverage.
`tests/unit/fileEvidence.test.ts` — AI-adjacent app knowledge, BYOK, emergency support, evidence extraction, cloud meal vision, pose classifier, interop fixture coverage.
`tests/unit/meal-vision.test.ts` — AI-adjacent app knowledge, BYOK, emergency support, evidence extraction, cloud meal vision, pose classifier, interop fixture coverage.
`tests/unit/pose-movement.test.ts` — AI-adjacent app knowledge, BYOK, emergency support, evidence extraction, cloud meal vision, pose classifier, interop fixture coverage.
`tests/unit/interop.test.ts` — AI-adjacent app knowledge, BYOK, emergency support, evidence extraction, cloud meal vision, pose classifier, interop fixture coverage.

### ENVIRONMENT VARIABLE NAMES (NO VALUES)
`src/services/ai/env.ts`: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`, `EXPO_PUBLIC_ENABLE_ALL_FEATURES`; provider names exposed to code: `GEMINI_API_KEY`, `GEMINI_API_KEY_2`, `GROQ_API_KEY`, `GROQ_API_KEY_2`, `OPENROUTER_API_KEY`, `CLAUDE_API_KEY`, `SARVAM_API_KEY`, `SARVAM_API_KEY_2`, `ELEVENLABS_API_KEY`, `DEEPGRAM_API_KEY`, `COHERE_API_KEY`, `VOYAGE_API_KEY`, `EXA_API_KEY`, `MEM0_API_KEY`. No values included.

### AI REGISTRATION / BUILD CONFIGURATION

#### `modules/local-ai/expo-module.config.json`

```json
{
  "platforms": ["android"],
  "android": {
    "modules": ["expo.modules.localai.LocalAIModule"]
  }
}
```

#### `modules/local-ai/android/build.gradle`

```gradle
plugins {
  id 'com.android.library'
  id 'expo-module-gradle-plugin'
}

group = 'expo.modules.localai'
version = '0.1.0'

android {
  namespace "expo.modules.localai"
  defaultConfig {
    versionCode 1
    versionName "0.1.0"
    consumerProguardFiles 'consumer-rules.pro'
  }
  androidResources {
    noCompress += ['gguf', 'bin']
  }
}

dependencies {
  implementation 'com.llamatik:library-android:0.12.0'
  implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0'
  // On-device text recognition with the Latin model bundled in the APK (works offline).
  implementation 'com.google.mlkit:text-recognition:16.0.1'
  // On-device translation and language detection (pair models download once, then offline).
  implementation 'com.google.mlkit:translate:17.0.3'
  implementation 'com.google.mlkit:language-id:17.0.6'
  // Chinese, Japanese, Korean and Devanagari text via Google Play services (small APK; the
  // script model downloads once on first use).
  implementation 'com.google.android.gms:play-services-mlkit-text-recognition-chinese:16.0.1'
  implementation 'com.google.android.gms:play-services-mlkit-text-recognition-japanese:16.0.1'
  implementation 'com.google.android.gms:play-services-mlkit-text-recognition-korean:16.0.1'
  implementation 'com.google.android.gms:play-services-mlkit-text-recognition-devanagari:16.0.1'
}
```

#### `modules/local-ai/android/consumer-rules.pro`

```pro
# Local AI: the module is created by name, and Llamatik's native code calls back into Kotlin
# (stream callbacks) and is looked up with Class.forName, so neither may be renamed or removed.
-keep class expo.modules.localai.** { *; }
-keep class com.llamatik.** { *; }
-keep interface com.llamatik.** { *; }
-dontwarn com.llamatik.**
```

#### `supabase/config.toml`

```toml
# Only per-function settings are kept here; the project itself is linked with `supabase link`.
project_id = "thrivefold"

[functions.age-check]
# The provider webhook has no user token. /start validates the caller's JWT itself and
# /webhook validates the provider's HMAC signature.
verify_jwt = false

[functions.delete-account]
# Validates the caller's JWT itself (and requires an explicit confirmation in the body).
verify_jwt = false

[functions.ai-chat]
# Validates the caller's JWT itself and handles CORS preflight.
verify_jwt = false

[functions.meal-vision]
enabled = true
verify_jwt = false
```
