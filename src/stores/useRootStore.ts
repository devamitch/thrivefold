/**
 * Thrivefold's single app store, composed from domain slices and persisted on-device
 * under one key (ADR-004: personal records stay local-first).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { localJSONStorage } from './persistStorage';
import type { RootState } from './rootTypes';
import { createAiSlice } from './slices/aiSlice';
import { createIntegrationSlice } from './slices/integrationSlice';
import { createAppSlice, EMPTY_ONBOARDING } from './slices/appSlice';
import { createAuthSlice } from './slices/authSlice';
import { createHealthSlice } from './slices/healthSlice';
import { createLetterSlice } from './slices/letterSlice';
import { createPolicySlice } from './slices/policySlice';
import { createQuestSlice, migrateQuestState } from './slices/questSlice';

export { useShallow } from 'zustand/react/shallow';
export type { RootState };

export const useRootStore = create<RootState>()(
  persist(
    (...a) => ({
      ...createAppSlice(...a),
      ...createAuthSlice(...a),
      ...createHealthSlice(...a),
      ...createQuestSlice(...a),
      ...createLetterSlice(...a),
      ...createPolicySlice(...a),
      ...createAiSlice(...a),
      ...createIntegrationSlice(...a),
    }),
    {
      name: 'thrivefold-root',
      version: 4,
      storage: localJSONStorage,
      // v2: rewards moved onto an append-only ledger (see questSlice.migrateQuestState).
      // v3: onboarding answers gained a baseline (body and mind check).
      migrate: (persisted, version) => {
        let state = (persisted ?? {}) as Record<string, unknown>;
        if (version < 2) {
          state = migrateQuestState(state);
          // Earlier builds pre-filled a sample birthday and anniversary; drop those two only.
          if (Array.isArray(state.personalEvents)) {
            state.personalEvents = (state.personalEvents as { id: string }[]).filter(
              (e) => e.id !== 'default_bday_user' && e.id !== 'default_anniversary',
            );
          }
        }
        if (version < 4) {
          // Earlier builds preselected an experience; people who finished setup chose theirs.
          state.experienceConfirmed = Boolean(state.isOnboarded);
        }
        if (version < 3) {
          state.onboarding = { ...EMPTY_ONBOARDING, ...((state.onboarding as object | undefined) ?? {}) };
        }
        return state as unknown as RootState;
      },
      // Data only: actions are recreated, live toasts, alert dialogs and achievement modals are never persisted.
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            // todayQuests is a projection of dailyAssignments and is rebuilt on load.
            ([key, value]) =>
              typeof value !== 'function' &&
              key !== 'toasts' &&
              key !== 'alert' &&
              key !== 'achievementModal' &&
              key !== 'todayQuests' &&
              key !== 'drawerOpen',
          ),
        ) as Partial<RootState>,
    },
  ),
);

export type { UserProfile } from './slices/authSlice';
export type { ToastItem, ThemeMode, AlertOptions } from './slices/appSlice';
export type {
  DailyCheckInRecord,
  CycleData,
  JournalEntry,
  PeriodLogRecord,
  FlowIntensity,
  ReproductiveContext,
  PregnancyDetails,
  PersonalCalendarEvent,
} from './slices/healthSlice';
export type { Quest, AchievementModalPayload, AchievementModalType } from './slices/questSlice';
export { xpForLevel } from './slices/questSlice';
