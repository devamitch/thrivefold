import type { StateCreator } from 'zustand';

import type { RootState } from '../rootTypes';

import { EMPTY_BASELINE, type Baseline } from '../../domain/game/setupProfile';
import { ProductExperience } from '../../theme/tokens';
import { normaliseWorldviewProfile, type WorldviewProfile } from '../../domain/identity/worldview';
import { EMPTY_KOSH, type EmergencyContact, type KoshProfile } from '../../domain/account/koshProfile';

export type ThemeMode = 'system' | 'light' | 'dark';

export type BetaSessionKind = 'eye_scan' | 'blink_bloom' | 'hand_grip' | 'finger_game' | 'breathing' | 'face_exercise' | 'voice_practice' | 'portrait_scan' | 'eye_pursuit' | 'eye_game';

export interface BetaSession {
  id: string;
  kind: BetaSessionKind;
  startedAt: number;
  endedAt: number;
  /** Measured or counted values for the session, e.g. blinksPerMin, reps, score, cycles. */
  metrics: Record<string, number>;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  actionLabel?: string;
  actionRoute?: string;
}

/** Answers from onboarding. Every field is optional and editable later (REQ-004). */
export interface OnboardingAnswers {
  goals: string[];
  constraints: string[];
  routineMinutes: 5 | 10 | 20 | null;
  diet: string | null;
  observances: string[];
  /** How the person describes their body and mind today; shapes quest fit, never points. */
  baseline: Baseline;
}

export const EMPTY_ONBOARDING: OnboardingAnswers = {
  goals: [],
  constraints: [],
  routineMinutes: null,
  diet: null,
  observances: [],
  baseline: EMPTY_BASELINE,
};

export interface AlertOptions {
  title: string;
  message?: string;
  confirmText?: string;
  /** null hides the cancel button. */
  cancelText?: string | null;
  onConfirm?: () => void;
  onCancel?: () => void;
  destructive?: boolean;
}

export interface UserApiKeys {
  gemini?: string;
  groq?: string;
  openrouter?: string;
  claude?: string;
  sarvam?: string;
  elevenlabs?: string;
}

export type AiDeliveryMode = 'local_only' | 'byok' | 'hybrid';

export interface AdhdProfile {
  answers: Record<string, number>;
  completedAt: string | null;
  focusStyle: string | null;
  score: number;
}

export const EMPTY_ADHD_PROFILE: AdhdProfile = {
  answers: {},
  completedAt: null,
  focusStyle: null,
  score: 0,
};

export interface AppSlice {
  experience: ProductExperience;
  /** True once the person picked (or confirmed a suggested) experience; nothing is preselected. */
  experienceConfirmed: boolean;
  /** First-run intro slides were finished or skipped; they are not shown again. */
  introSeen: boolean;
  setIntroSeen: (seen: boolean) => void;
  /** Optional, private, never shared or used for eligibility. */
  privateIdentity: { pronouns: string; genderDescription: string };
  setPrivateIdentity: (identity: { pronouns: string; genderDescription: string }) => void;
  themeMode: ThemeMode;
  isOnboarded: boolean;
  onboarding: OnboardingAnswers;
  /** Last onboarding screen reached, so a closed app resumes where it left off. */
  onboardingStep: string | null;
  /** When the person stated they are 18+ (a self-declaration, not verification). */
  adultConfirmedAt: string | null;
  /** Version of the Terms and Privacy policy the person agreed to, and when. */
  termsAcceptedVersion: string | null;
  termsAcceptedAt: string | null;
  /** Beliefs and culture, chosen by the person; on this phone only, never used for access. */
  worldviewProfile: WorldviewProfile | null;
  quietHoursEnabled: boolean;
  /** Opt-in, generic reminders for open quests (off by default). */
  questRemindersEnabled: boolean;
  /** The first-run "how it works" guide on Home was dismissed. */
  homeGuideDone: boolean;
  /** App drawer visibility (not persisted). */
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  setHomeGuideDone: () => void;
  /** Signed-in only, opt-in: weekly averages and counts backed up to the account. */
  shareWeeklySummaries: boolean;
  /** Opt-in: anonymous usage analytics (screens and feature use, never health data). Off by default. */
  usageAnalytics: boolean;
  /** Crash reports (stack traces, device model, app version; no personal content). Opt-out. */
  crashReports: boolean;
  setCrashReports: (on: boolean) => void;
  /** Explicit consent to send typed questions to the cloud AI companion. Off by default. */
  cloudAiConsent: boolean;
  setCloudAiConsent: (on: boolean) => void;
  /** BYOK: User-provided API keys (Gemini, Groq, OpenRouter, Sarvam) stored securely on-device. */
  userApiKeys: UserApiKeys;
  /** AI Delivery Mode: 'local_only' (100% on-device, default), 'byok' (user keys), or 'hybrid'. */
  aiDeliveryMode: AiDeliveryMode;
  setUserApiKey: (provider: keyof UserApiKeys, key: string) => void;
  clearUserApiKey: (provider: keyof UserApiKeys) => void;
  clearAllUserApiKeys: () => void;
  setAiDeliveryMode: (mode: AiDeliveryMode) => void;
  /** Opt-in experimental Beta Mode: unlocks Beta Lab, experimental pose, and motion blur. Off by default. */
  betaMode: boolean;
  setBetaMode: (on: boolean) => void;
  /** Anvay Kosh profile (typed or confirmed by the person) and their emergency contacts. */
  koshProfile: KoshProfile;
  updateKoshProfile: (patch: Partial<KoshProfile>, source?: 'user' | 'google') => void;
  emergencyContacts: EmergencyContact[];
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  /** An active trip check-in, or null. */
  trip: { destination: string; startedAt: number; dueAt: number; contactIds: string[]; notificationId: string | null } | null;
  setTrip: (trip: AppSlice['trip']) => void;
  /** The town the person chose for weather and official alerts (searched by name, never GPS). */
  outdoorPlace: { name: string; region: string | null; country: string | null; lat: number; lon: number } | null;
  setOutdoorPlace: (place: AppSlice['outdoorPlace']) => void;
  /** HIPAA-aligned, local-first ADHD & focus self-reflection screener profile. */
  adhdProfile: AdhdProfile;
  setAdhdProfile: (profile: AdhdProfile) => void;
  /** Profile questions on Home: when each may be asked again, and when one was last shown. */
  profileAsk: { snoozedUntil: Partial<Record<'birthday' | 'height' | 'weight' | 'diet' | 'routine', number>>; lastAskedAt: number | null };
  snoozeProfileQuestion: (q: 'birthday' | 'height' | 'weight' | 'diet' | 'routine', until: number) => void;
  markProfileAsked: (at: number) => void;
  /** The on-device language model the person downloaded and chose (llama.cpp via Llamatik), or null. */
  localModelId: string | null;
  setLocalModelId: (id: string | null) => void;
  /** Spoken coach cues in workouts and beta studios. On by default; off silences every line. */
  coachVoiceEnabled: boolean;
  setCoachVoiceEnabled: (on: boolean) => void;
  /** The coach voice the person chose (never inferred from anything else). */
  coachVoiceGender: 'male' | 'female';
  setCoachVoiceGender: (g: 'male' | 'female') => void;
  /** Speech rate, 0.8 (slower) to 1.15 (faster). */
  coachVoiceRate: number;
  setCoachVoiceRate: (r: number) => void;
  /** Keep listening after each reply until the conversation is closed. */
  conversationMode: boolean;
  /** Read Anvay's replies aloud. Off by default: replies are text unless the person turns this on. */
  speakReplies: boolean;
  setSpeakReplies: (on: boolean) => void;
  /** The coach conversation, kept across closing the sheet and restarts (newest last, ≤100). */
  coachTurns: { id: string; who: 'you' | 'coach'; text: string; route?: string; at: number }[];
  setCoachTurns: (turns: AppSlice['coachTurns']) => void;
  setConversationMode: (on: boolean) => void;
  /** Finished beta studio sessions (derived numbers only, never frames), newest first. */
  betaSessions: BetaSession[];
  addBetaSession: (session: Omit<BetaSession, 'id'>) => void;
  /** Server-confirmed project owner (tf_is_owner): unlocks Beta Lab and developer tools. */
  isOwner: boolean;
  /** Owner defaults (Beta Mode on) applied once on this phone. */
  ownerBootstrapped: boolean;
  setIsOwner: (on: boolean) => void;
  /** Daily active-calorie goal (estimated activity burn, not including resting energy). */
  activeCalorieGoal: number;
  setActiveCalorieGoal: (kcal: number) => void;
  setUsageAnalytics: (on: boolean) => void;
  setShareWeeklySummaries: (enabled: boolean) => void;
  setQuestRemindersEnabled: (enabled: boolean) => void;
  /** Tactile haptic feedback on touches and milestones. Off by default. */
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string; // e.g. "07:00"
  offlineModeForced: boolean;
  toasts: ToastItem[];
  alert: AlertOptions | null;
  /** Restores previous active screen on forceful app restart */
  lastActiveRoute: string | null;
  lastActiveAt: string | null;
  lastActiveParams?: Record<string, string>;
  navigationHistory: string[];
  lastScrollPositions: Record<string, number>;
  appStateHistory: Array<{ state: 'active' | 'background' | 'inactive'; timestamp: string }>;
  setLastActiveRoute: (route: string, params?: Record<string, string>) => void;
  recordNavigation: (route: string) => void;
  setLastScrollPosition: (screenKey: string, offsetY: number) => void;
  recordAppStateChange: (state: 'active' | 'background' | 'inactive') => void;
  setExperience: (exp: ProductExperience) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setIsOnboarded: (val: boolean) => void;
  setOnboardingAnswers: (answers: Partial<OnboardingAnswers>) => void;
  setOnboardingStep: (step: string | null) => void;
  confirmAdult: () => void;
  acceptTerms: (version: string) => void;
  setWorldviewProfile: (input: { ids: string[]; selfDescribed?: string | null; observanceReminders?: boolean }) => void;
  clearWorldviewProfile: () => void;
  resetOnboarding: () => void;
  setQuietHours: (enabled: boolean, start?: string, end?: string) => void;
  toggleOfflineMode: () => void;
  showToast: (toast: Omit<ToastItem, 'id'> & { id?: string }) => void;
  hideToast: (id: string) => void;
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

export const createAppSlice: StateCreator<
  RootState,
  [['zustand/persist', unknown]],
  [],
  AppSlice
> = (set, get) => ({
  experience: 'women_health',
  experienceConfirmed: false,
  introSeen: false,
  setIntroSeen: (introSeen) => set({ introSeen }),
  privateIdentity: { pronouns: '', genderDescription: '' },
  themeMode: 'system',
  isOnboarded: false,
  onboarding: EMPTY_ONBOARDING,
  onboardingStep: null,
  adultConfirmedAt: null,
  termsAcceptedVersion: null,
  termsAcceptedAt: null,
  worldviewProfile: null,
  quietHoursEnabled: true,
  questRemindersEnabled: false,
  homeGuideDone: false,
  drawerOpen: false,
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
  setHomeGuideDone: () => set({ homeGuideDone: true }),
  shareWeeklySummaries: false,
  usageAnalytics: false,
  crashReports: true,
  setCrashReports: (crashReports) => set({ crashReports }),
  cloudAiConsent: false,
  setCloudAiConsent: (cloudAiConsent) => set({ cloudAiConsent }),
  userApiKeys: {},
  aiDeliveryMode: 'local_only',
  setUserApiKey: (provider, key) =>
    set((state) => ({
      userApiKeys: {
        ...state.userApiKeys,
        [provider]: key.trim(),
      },
    })),
  clearUserApiKey: (provider) =>
    set((state) => {
      const next = { ...state.userApiKeys };
      delete next[provider];
      return { userApiKeys: next };
    }),
  clearAllUserApiKeys: () => set({ userApiKeys: {} }),
  setAiDeliveryMode: (aiDeliveryMode) => set({ aiDeliveryMode }),
  betaMode: false,
  setBetaMode: (betaMode) => set({ betaMode }),
  koshProfile: EMPTY_KOSH,
  updateKoshProfile: (patch, source = 'user') =>
    set((state) => {
      const at = new Date().toISOString();
      const sources = { ...state.koshProfile.fieldSources };
      for (const k of Object.keys(patch)) if (k !== 'fieldSources') (sources as Record<string, unknown>)[k] = { source, at };
      return { koshProfile: { ...state.koshProfile, ...patch, fieldSources: sources } };
    }),
  emergencyContacts: [],
  setEmergencyContacts: (emergencyContacts) => set({ emergencyContacts: emergencyContacts.slice(0, 5) }),
  trip: null,
  setTrip: (trip) => set({ trip }),
  outdoorPlace: null,
  setOutdoorPlace: (outdoorPlace) => set({ outdoorPlace }),
  adhdProfile: EMPTY_ADHD_PROFILE,
  setAdhdProfile: (adhdProfile) => set({ adhdProfile }),
  profileAsk: { snoozedUntil: {}, lastAskedAt: null },
  snoozeProfileQuestion: (q, until) =>
    set((state) => ({ profileAsk: { ...state.profileAsk, snoozedUntil: { ...state.profileAsk.snoozedUntil, [q]: until } } })),
  markProfileAsked: (at) => set((state) => ({ profileAsk: { ...state.profileAsk, lastAskedAt: at } })),
  localModelId: null,
  setLocalModelId: (localModelId) => set({ localModelId }),
  coachVoiceEnabled: true,
  setCoachVoiceEnabled: (coachVoiceEnabled) => set({ coachVoiceEnabled }),
  coachVoiceGender: 'male',
  setCoachVoiceGender: (coachVoiceGender) => set({ coachVoiceGender }),
  coachVoiceRate: 0.95,
  setCoachVoiceRate: (r) => set({ coachVoiceRate: Math.min(1.15, Math.max(0.8, r)) }),
  // Off by default: an automatic "listen again" without spoken replies feels like a ghost mic.
  conversationMode: false,
  speakReplies: false,
  setSpeakReplies: (speakReplies) => set({ speakReplies }),
  coachTurns: [],
  setCoachTurns: (coachTurns) => set({ coachTurns: coachTurns.slice(-100) }),
  setConversationMode: (conversationMode) => set({ conversationMode }),
  betaSessions: [],
  addBetaSession: (session) =>
    set((state) => ({
      betaSessions: [{ ...session, id: `${session.kind}-${session.endedAt}` }, ...state.betaSessions].slice(0, 300),
    })),
  isOwner: false,
  ownerBootstrapped: false,
  setIsOwner: (isOwner) => set({ isOwner }),
  activeCalorieGoal: 300,
  setActiveCalorieGoal: (kcal) => set({ activeCalorieGoal: Math.max(100, Math.min(2000, Math.round(kcal))) }),
  setUsageAnalytics: (usageAnalytics) => set({ usageAnalytics }),
  setShareWeeklySummaries: (shareWeeklySummaries) => set({ shareWeeklySummaries }),
  setQuestRemindersEnabled: (questRemindersEnabled) => set({ questRemindersEnabled }),
  hapticsEnabled: false,
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  offlineModeForced: false,
  toasts: [],
  alert: null,
  lastActiveRoute: null,
  lastActiveAt: null,
  lastActiveParams: {},
  navigationHistory: [],
  lastScrollPositions: {},
  appStateHistory: [],
  setLastActiveRoute: (lastActiveRoute, lastActiveParams = {}) =>
    set({ lastActiveRoute, lastActiveParams }),
  recordNavigation: (route) =>
    set((state) => ({
      lastActiveRoute: route,
      lastActiveAt: new Date().toISOString(),
      navigationHistory: [...state.navigationHistory.slice(-49), route],
    })),
  setLastScrollPosition: (screenKey, offsetY) =>
    set((state) => ({
      lastScrollPositions: { ...state.lastScrollPositions, [screenKey]: offsetY },
    })),
  recordAppStateChange: (appState) =>
    set((state) => ({
      appStateHistory: [
        ...state.appStateHistory.slice(-49),
        { state: appState, timestamp: new Date().toISOString() },
      ],
    })),
  setExperience: (experience) => {
    set({ experience, experienceConfirmed: true });
    get().autoClaimAnsweredSetupRewards();
    if (get().isOnboarded) get().refitDailyQuests();
  },
  setPrivateIdentity: (privateIdentity) =>
    set({ privateIdentity: { pronouns: privateIdentity.pronouns.trim().slice(0, 40), genderDescription: privateIdentity.genderDescription.trim().slice(0, 80) } }),
  setThemeMode: (themeMode) => set({ themeMode }),
  setIsOnboarded: (isOnboarded) => {
    set(isOnboarded ? { isOnboarded, onboardingStep: null } : { isOnboarded });
    if (isOnboarded) {
      get().autoClaimAnsweredSetupRewards();
    }
  },
  setOnboardingAnswers: (answers) => {
    set((state) => ({ onboarding: { ...EMPTY_ONBOARDING, ...state.onboarding, ...answers } }));
    // Automatically reward any answered setup sections
    get().autoClaimAnsweredSetupRewards();
    // Changed goals, limits or baseline re-fit today's open quests straight away.
    if (get().isOnboarded) get().refitDailyQuests();
  },
  setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
  confirmAdult: () => set({ adultConfirmedAt: new Date().toISOString() }),
  acceptTerms: (version) => set({ termsAcceptedVersion: version, termsAcceptedAt: new Date().toISOString() }),
  setWorldviewProfile: (input) => set({ worldviewProfile: normaliseWorldviewProfile(input) }),
  clearWorldviewProfile: () => set({ worldviewProfile: null }),
  // Starts onboarding again with blank answers; health records are untouched.
  resetOnboarding: () =>
    set({ isOnboarded: false, onboarding: EMPTY_ONBOARDING, onboardingStep: null }),
  setQuietHours: (quietHoursEnabled, start, end) =>
    set((state) => ({
      quietHoursEnabled,
      quietHoursStart: start ?? state.quietHoursStart,
      quietHoursEnd: end ?? state.quietHoursEnd,
    })),
  toggleOfflineMode: () => set((state) => ({ offlineModeForced: !state.offlineModeForced })),
  showToast: (toast) =>
    set((state) => {
      const id = toast.id || `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      return { toasts: [...state.toasts, { ...toast, id }] };
    }),
  hideToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  showAlert: (options) => set({ alert: options }),
  hideAlert: () => set({ alert: null }),
});
