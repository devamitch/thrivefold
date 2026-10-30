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
import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';

import type { PersonaId } from '../../domain/assistant/personas';
import { speakCoachLine, stopCoachSpeech } from '../../services/ai/coachVoiceService';
import { agentEngine } from '../../services/assistant/agentEngine';
import { refreshAppKnowledge } from '../../services/assistant/appKnowledge';
import { thriveRag } from '../../services/local-ai/rag/thriveRag';
import { syncCareReminders } from '../../services/notifications/careReminders';
import { globalVoiceController } from '../../services/voice/globalVoiceController';
import { useRootStore } from '../../stores/useRootStore';
import { GlobalVoiceAssistant } from './GlobalVoiceAssistant';

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
  const turnCount = useRootStore((s) => s.coachTurns.length);
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
    if (!isOnboarded || turnCount === 0) return;
    const t = setTimeout(() => void refreshAppKnowledge(), 8_000);
    return () => clearTimeout(t);
  }, [isOnboarded, turnCount]);

  // Reminders follow the records, whichever screen (or the chat) changed them.
  useEffect(() => {
    if (!signedIn) return;
    const t = setTimeout(
      () => void syncCareReminders(medications, medsRemindersOn, followUps).catch(() => false),
      1_500,
    );
    return () => clearTimeout(t);
  }, [signedIn, medications, medsRemindersOn, followUps]);

  const api = useMemo(() => makeApi(() => routeRef.current), []);

  return (
    <CoachContext.Provider value={api}>
      {children}
      {signedIn && isOnboarded ? <GlobalVoiceAssistant /> : null}
    </CoachContext.Provider>
  );
}

const fallback = makeApi(() => '/(app)/(tabs)');

/** The app's coach. Before sign-in and onboarding it still speaks, without the sheet. */
export function useCoach(): CoachApi {
  return useContext(CoachContext) ?? fallback;
}
