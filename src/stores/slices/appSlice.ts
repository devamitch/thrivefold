import type { StateCreator } from 'zustand';

import type { RootState } from '../rootTypes';

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

export interface AppSlice {
  experience: ProductExperience;
  themeMode: ThemeMode;
  isOnboarded: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string; // e.g. "07:00"
  offlineModeForced: boolean;
  toasts: ToastItem[];
  setExperience: (exp: ProductExperience) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setIsOnboarded: (val: boolean) => void;
  setQuietHours: (enabled: boolean, start?: string, end?: string) => void;
  toggleOfflineMode: () => void;
  showToast: (toast: Omit<ToastItem, 'id'> & { id?: string }) => void;
  hideToast: (id: string) => void;
}

export const createAppSlice: StateCreator<
  RootState,
  [['zustand/persist', unknown]],
  [],
  AppSlice
> = (set) => ({
  experience: 'women_health',
  themeMode: 'system',
  isOnboarded: false,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  offlineModeForced: false,
  toasts: [],
  setExperience: (experience) => set({ experience }),
  setThemeMode: (themeMode) => set({ themeMode }),
  setIsOnboarded: (isOnboarded) => set({ isOnboarded }),
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
});
