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
  getRandomBytesAsync: jest.fn(async (len: number) => new Uint8Array(len)),
  digestStringAsync: jest.fn(async () => 'mock-hash'),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(() => ({ lastInsertRowId: 1, changes: 1 })),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
  })),
}));

import { useRootStore } from '../../src/stores/useRootStore';
import type { AchievementModalPayload } from '../../src/stores/slices/questSlice';

describe('Achievement Modal & Onboarding Lifecycle', () => {
  beforeEach(() => {
    useRootStore.setState({
      isOnboarded: false,
      achievementModal: null,
      rewardLedger: [],
      xp: 0,
      level: 1,
      onboarding: {
        goals: ['energy'],
        constraints: [],
        routineMinutes: 10,
        diet: null,
        observances: [],
        baseline: { activity: 'most_days', energy: 'good', sleep: 'good', stress: 'calm' },
      },
    });
  });

  it('suppresses showAchievementModal when onboarding is not yet complete', () => {
    const store = useRootStore.getState();
    const payload: AchievementModalPayload = {
      type: 'level_clear',
      title: 'Level 2 Cleared',
      subtitle: 'You advanced to Level 2',
      details: 'Steady consistency creates lasting change.',
      level: 2,
      diamondsEarned: 1,
    };

    store.showAchievementModal(payload);
    expect(useRootStore.getState().achievementModal).toBeNull();
  });

  it('suppresses automatic milestone modals during onboarding while properly recording ledger XP', () => {
    const store = useRootStore.getState();
    expect(useRootStore.getState().isOnboarded).toBe(false);

    // Earning setup reward during onboarding
    const res = store.claimSetupReward('goals');
    expect(res.awarded).toBe(true);

    const state = useRootStore.getState();
    // XP progression is recorded
    expect(state.xp).toBeGreaterThan(0);
    // But modal must remain suppressed during onboarding
    expect(state.achievementModal).toBeNull();
  });

  it('allows showAchievementModal and hideAchievementModal once onboarding is completed', () => {
    useRootStore.setState({ isOnboarded: true });
    const store = useRootStore.getState();

    const payload: AchievementModalPayload = {
      type: 'daily_goal',
      title: 'Daily Goal Achieved',
      subtitle: '20 points reached today',
      details: 'Great job maintaining consistency!',
      dailyPoints: 20,
      dailyPointsTarget: 20,
      diamondsEarned: 1,
    };

    store.showAchievementModal(payload);
    expect(useRootStore.getState().achievementModal).toEqual(payload);

    store.hideAchievementModal();
    expect(useRootStore.getState().achievementModal).toBeNull();
  });
});
