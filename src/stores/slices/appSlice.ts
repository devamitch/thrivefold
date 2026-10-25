import type { StateCreator } from 'zustand';

import type { RootState } from '../rootTypes';

import { EMPTY_BASELINE, type Baseline } from '../../domain/game/setupProfile';
import { ProductExperience } from '../../theme/tokens';

export type ThemeMode = 'system' | 'light' | 'dark';

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
  setUsageAnalytics: (on: boolean) => void;
  setShareWeeklySummaries: (enabled: boolean) => void;
  setQuestRemindersEnabled: (enabled: boolean) => void;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string; // e.g. "07:00"
  offlineModeForced: boolean;
  toasts: ToastItem[];
  alert: AlertOptions | null;
  /** Restores previous active screen on forceful app restart */
  lastActiveRoute: string | null;
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
  quietHoursEnabled: true,
  questRemindersEnabled: false,
  homeGuideDone: false,
  drawerOpen: false,
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
  setHomeGuideDone: () => set({ homeGuideDone: true }),
  shareWeeklySummaries: false,
  usageAnalytics: false,
  setUsageAnalytics: (usageAnalytics) => set({ usageAnalytics }),
  setShareWeeklySummaries: (shareWeeklySummaries) => set({ shareWeeklySummaries }),
  setQuestRemindersEnabled: (questRemindersEnabled) => set({ questRemindersEnabled }),
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  offlineModeForced: false,
  toasts: [],
  alert: null,
  lastActiveRoute: null,
  lastActiveParams: {},
  navigationHistory: [],
  lastScrollPositions: {},
  appStateHistory: [],
  setLastActiveRoute: (lastActiveRoute, lastActiveParams = {}) =>
    set({ lastActiveRoute, lastActiveParams }),
  recordNavigation: (route) =>
    set((state) => ({
      lastActiveRoute: route,
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
