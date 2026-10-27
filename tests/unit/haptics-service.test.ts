jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
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
  randomUUID: () => 'test-uuid',
}));

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

import * as Haptics from 'expo-haptics';
import {
  isHapticsEnabled,
  hapticSelection,
  hapticLight,
  hapticMedium,
  hapticHeavy,
  hapticSuccess,
  hapticWarning,
  hapticError,
  triggerHaptic,
} from '../../src/services/haptics/hapticFeedback';
import { useRootStore } from '../../src/stores/useRootStore';

describe('Haptics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRootStore.setState({ hapticsEnabled: false });
  });

  it('defaults to disabled and suppresses all haptic triggers', () => {
    expect(isHapticsEnabled()).toBe(false);

    hapticSelection();
    hapticLight();
    hapticMedium();
    hapticHeavy();
    hapticSuccess();
    hapticWarning();
    hapticError();
    triggerHaptic('selection');

    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it('triggers haptics when enabled in store', () => {
    useRootStore.setState({ hapticsEnabled: true });
    expect(isHapticsEnabled()).toBe(true);

    hapticSelection();
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);

    hapticLight();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');

    hapticMedium();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');

    hapticHeavy();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');

    hapticSuccess();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');

    hapticWarning();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('warning');

    hapticError();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
  });

  it('dispatches triggerHaptic correctly', () => {
    useRootStore.setState({ hapticsEnabled: true });

    triggerHaptic('selection');
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);

    triggerHaptic('success');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });
});
