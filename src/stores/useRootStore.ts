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
import { createAppSlice } from './slices/appSlice';
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
      version: 2,
      storage: localJSONStorage,
      // v2: rewards moved onto an append-only ledger (see questSlice.migrateQuestState).
      migrate: (persisted, version) => {
        if (version >= 2) return persisted as RootState;
        const state = migrateQuestState((persisted ?? {}) as Record<string, unknown>);
        // Earlier builds pre-filled a sample birthday and anniversary; drop those two only.
        if (Array.isArray(state.personalEvents)) {
          state.personalEvents = (state.personalEvents as { id: string }[]).filter(
            (e) => e.id !== 'default_bday_user' && e.id !== 'default_anniversary',
          );
        }
        return state as unknown as RootState;
      },
      // Data only: actions are recreated, live toasts and alert dialogs are never persisted.
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            // todayQuests is a projection of dailyAssignments and is rebuilt on load.
            ([key, value]) =>
              typeof value !== 'function' && key !== 'toasts' && key !== 'alert' && key !== 'todayQuests',
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
export type { Quest } from './slices/questSlice';
export { xpForLevel } from './slices/questSlice';
