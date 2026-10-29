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
import type { LedgerEntry } from '../../src/domain/game/progression';

const entry = (key: string, xp: number): LedgerEntry => ({
  key,
  kind: 'task_reward',
  xp,
  diamonds: 0,
  taskPoints: 0,
  gameDate: '2026-10-28',
  sourceId: key,
  policyVersion: 'test',
  createdAt: `2026-10-28T10:00:0${key.length % 10}.000Z`,
});

describe('mergeRemoteProgress', () => {
  it('restores points from the server and never counts an entry twice', () => {
    useRootStore.setState({ rewardLedger: [entry('a', 10)], isOnboarded: true });
    const added = useRootStore.getState().mergeRemoteProgress([entry('a', 10), entry('bb', 25)], [], ['first']);
    expect(added).toBe(1);
    const s = useRootStore.getState();
    expect(s.rewardLedger.filter((e) => e.key === 'a')).toHaveLength(1);
    expect(s.xp).toBeGreaterThanOrEqual(35);
    expect(s.achievements).toContain('first');
    expect(s.achievementModal).toBeNull();
    expect(useRootStore.getState().mergeRemoteProgress([entry('a', 10)], [], [])).toBe(0);
  });
});
