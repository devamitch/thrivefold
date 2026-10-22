/**
 * Thrivefold's single app store, composed from domain slices and persisted on-device
 * under one key (ADR-004: personal records stay local-first).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { localJSONStorage } from './persistStorage';
import type { RootState } from './rootTypes';
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
    }),
    {
      name: 'thrivefold-root',
      version: 1,
      storage: localJSONStorage,
      // Data only: actions are recreated, live toasts are never persisted.
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key, value]) => typeof value !== 'function' && key !== 'toasts'),
        ) as Partial<RootState>,
    },
  ),
);

export type { UserProfile } from './slices/authSlice';
export type { ToastItem, ThemeMode } from './slices/appSlice';
export type { DailyCheckInRecord, CycleData, JournalEntry } from './slices/healthSlice';
export type { Quest } from './slices/questSlice';
export { xpForLevel } from './slices/questSlice';
