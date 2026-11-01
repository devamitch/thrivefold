/**
 * Thrivefold's single app store, composed from domain slices and persisted on-device
 * under one key (ADR-004: personal records stay local-first).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { localJSONStorage } from './persistStorage';
import { migrateRootState, ROOT_STORE_VERSION } from './migrateRootState';
import type { RootState } from './rootTypes';
import { createAiSlice } from './slices/aiSlice';
import { createIntegrationSlice } from './slices/integrationSlice';
import { createAppSlice } from './slices/appSlice';
import { createAuthSlice } from './slices/authSlice';
import { createHealthSlice } from './slices/healthSlice';
import { createLetterSlice } from './slices/letterSlice';
import { createPolicySlice } from './slices/policySlice';
import { createQuestSlice } from './slices/questSlice';

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
      version: ROOT_STORE_VERSION,
      storage: localJSONStorage,
      // v2: rewards ledger. v3: onboarding baseline. v4: confirmed experience. v5: crash reports off.
      migrate: migrateRootState,
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
