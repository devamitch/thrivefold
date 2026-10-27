/**
 * Thrivefold Centralized Haptic Feedback Service
 *
 * All tactile haptic events across the app route through this service.
 * - Haptics are DISABLED BY DEFAULT per user preferences and settings.
 * - Checks `useRootStore.getState().hapticsEnabled` before triggering any physical feedback.
 * - Handles errors silently (Expo Haptics throws on web or unsupported devices).
 */

import * as Haptics from 'expo-haptics';
import { useRootStore } from '../../stores/useRootStore';

export function isHapticsEnabled(): boolean {
  try {
    return Boolean(useRootStore.getState().hapticsEnabled);
  } catch {
    return false;
  }
}

export function hapticSelection(): void {
  if (!isHapticsEnabled()) return;
  Haptics.selectionAsync().catch(() => undefined);
}

export function hapticLight(): void {
  if (!isHapticsEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

export function hapticMedium(): void {
  if (!isHapticsEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
}

export function hapticHeavy(): void {
  if (!isHapticsEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
}

export function hapticSuccess(): void {
  if (!isHapticsEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

export function hapticWarning(): void {
  if (!isHapticsEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
}

export function hapticError(): void {
  if (!isHapticsEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
}

export type HapticType =
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error';

export function triggerHaptic(type: HapticType = 'selection'): void {
  switch (type) {
    case 'selection':
      return hapticSelection();
    case 'light':
      return hapticLight();
    case 'medium':
      return hapticMedium();
    case 'heavy':
      return hapticHeavy();
    case 'success':
      return hapticSuccess();
    case 'warning':
      return hapticWarning();
    case 'error':
      return hapticError();
  }
}
