jest.mock('expo', () => ({
  requireNativeModule: () => null,
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
    withTransactionSync: jest.fn((cb: any) => cb()),
  })),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/data/user/0/app/files/',
  getInfoAsync: jest.fn(async () => ({ exists: false, isDirectory: false })),
  makeDirectoryAsync: jest.fn(async () => {}),
  createDownloadResumable: jest.fn(),
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

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Share: {
    share: jest.fn().mockResolvedValue({ action: 'sharedAction' }),
    sharedAction: 'sharedAction',
    dismissedAction: 'dismissedAction',
  },
  Linking: {
    canOpenURL: jest.fn().mockResolvedValue(true),
    openURL: jest.fn().mockResolvedValue(true),
  },
}));

import {
  shareApp,
  joinAsBetaTester,
  shareBetaInvite,
  THRIVEFOLD_DISTRIBUTION,
} from '../../src/services/distribution/appDistribution';
import { calculateCalibratedConfidence } from '../../src/services/local-ai/rag/hybridRagPipeline';
import { Share, Linking } from 'react-native';

describe('App Distribution & Sharing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shares app invitation with correct play store url', async () => {
    const success = await shareApp(THRIVEFOLD_DISTRIBUTION);
    expect(success).toBe(true);
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Share Thrivefold',
        message: expect.stringContaining(THRIVEFOLD_DISTRIBUTION.playStoreUrl),
      }),
      expect.any(Object)
    );
  });

  it('opens Google Play beta testing URL', async () => {
    const success = await joinAsBetaTester(THRIVEFOLD_DISTRIBUTION);
    expect(success).toBe(true);
    expect(Linking.openURL).toHaveBeenCalledWith(THRIVEFOLD_DISTRIBUTION.betaOptInUrl);
  });

  it('shares beta invitation with testing link', async () => {
    const success = await shareBetaInvite(THRIVEFOLD_DISTRIBUTION);
    expect(success).toBe(true);
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Join Thrivefold Beta',
        message: expect.stringContaining(THRIVEFOLD_DISTRIBUTION.betaOptInUrl),
      }),
      expect.any(Object)
    );
  });
});

describe('Calibrated Evidence Confidence Scoring', () => {
  it('returns 0 when no evidence hits exist', () => {
    const confidence = calculateCalibratedConfidence('how much water', [], false);
    expect(confidence).toBe(0);
  });

  it('calculates calibrated confidence bounded in [0, 1] using geometric formulation', () => {
    const mockHits = [
      {
        document: {
          id: 'doc_1',
          sourceType: 'user_document' as const,
          title: 'Hydration Guidelines',
          content: 'Drink 8 glasses of water daily for optimal biological rhythms.',
        },
        hybridScore: 0.035,
        snippet: 'Drink 8 glasses of water daily',
      },
    ];

    const confidence = calculateCalibratedConfidence('how much water to drink', mockHits, true);
    expect(confidence).toBeGreaterThan(0.5);
    expect(confidence).toBeLessThanOrEqual(1.0);
  });

  it('gives higher confidence to verified exercise catalog over unverified memory', () => {
    const catalogHit = [
      {
        document: {
          id: 'cat_1',
          sourceType: 'exercise_catalog' as const,
          title: 'Squat',
          content: 'Squat movement pattern with bodyweight.',
        },
        hybridScore: 0.035,
        snippet: 'Squat movement',
      },
    ];

    const memoryHit = [
      {
        document: {
          id: 'mem_1',
          sourceType: 'user_memory' as const,
          title: 'Squat memory',
          content: 'Squat movement pattern with bodyweight.',
        },
        hybridScore: 0.035,
        snippet: 'Squat movement',
      },
    ];

    const catConf = calculateCalibratedConfidence('squat movement', catalogHit, false);
    const memConf = calculateCalibratedConfidence('squat movement', memoryHit, false);
    expect(catConf).toBeGreaterThan(memConf);
  });
});
