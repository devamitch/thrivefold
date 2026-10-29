jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
}));

jest.mock('expo', () => ({
  requireNativeModule: () => null,
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

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(() => ({ changes: 1 })),
    getFirstSync: jest.fn(),
    getAllSync: jest.fn(() => []),
  })),
}));

import { resolveScreenCapability } from '../../src/domain/assistant/screenRegistry';
import { executeTool } from '../../src/domain/assistant/toolRegistry';
import { lookupMedicine, analyzePrescriptionText } from '../../src/services/ai/medicineResearch';
import { agentEngine } from '../../src/services/assistant/agentEngine';

describe('Screen Capability Registry', () => {
  it('resolves home tab capability with suggested chips', () => {
    const cap = resolveScreenCapability('/(app)/(tabs)');
    expect(cap.title).toBe('Home Sanctuary');
    expect(cap.supportedTools).toContain('log_water');
    expect(cap.suggestedChips.length).toBeGreaterThan(0);
  });

  it('resolves pose-check capability for workout screen', () => {
    const cap = resolveScreenCapability('/(app)/health/pose-check');
    expect(cap.title).toBe('Coach & Movement Check');
    expect(cap.visibleMetrics).toContain('reps');
  });

  it('falls back safely for unknown paths', () => {
    const cap = resolveScreenCapability('/unknown/random/route');
    expect(cap.title).toBe('Home Sanctuary');
  });
});

describe('Typed Tool Execution Registry', () => {
  it('executes log_water and updates hydration state', async () => {
    const res = await executeTool('log_water', { glasses: 2 }, { userId: 'test_user' });
    expect(res.success).toBe(true);
    expect(res.message).toContain('Logged 2 glasses');
  });

  it('executes get_metrics for water and steps', async () => {
    const resWater = await executeTool('get_metrics', { metric: 'water' }, { userId: 'test_user' });
    expect(resWater.success).toBe(true);

    const resSteps = await executeTool('get_metrics', { metric: 'steps' }, { userId: 'test_user' });
    expect(resSteps.success).toBe(true);
    expect(resSteps.message).toContain('steps today');
  });

  it('executes trigger_urgent_support with crisis hotline info', async () => {
    const res = await executeTool('trigger_urgent_support', {}, { userId: 'test_user' });
    expect(res.success).toBe(true);
    expect(res.routeToOpen).toBe('/(app)/safety/urgent-support');
    expect(res.message).toContain('Tele-MANAS on 14416');
  });

  it('executes lookup_medicine_info for verified entry', async () => {
    const res = await executeTool('lookup_medicine_info', { medicineName: 'Paracetamol' }, { userId: 'test_user' });
    expect(res.success).toBe(true);
    expect(res.message).toContain('Paracetamol');
    expect(res.message).toContain('MedlinePlus');
  });

  it('handles unknown medicine lookup gracefully', async () => {
    const res = await executeTool('lookup_medicine_info', { medicineName: 'FakemedicineXYZ' }, { userId: 'test_user' });
    expect(res.success).toBe(true);
    expect(res.message).toContain('could not find a verified educational entry');
  });
});

describe('Medicine Educational Research & Safety', () => {
  it('looks up metformin with authoritative source and class', () => {
    const med = lookupMedicine('Metformin');
    expect(med).not.toBeNull();
    expect(med?.genericName).toBe('Metformin Hydrochloride');
    expect(med?.authoritativeSource.publisher).toContain('MedlinePlus');
  });

  it('analyzes prescription text with disclaimers and safety notice', () => {
    const analysis = analyzePrescriptionText('Take Paracetamol 500mg twice daily with meals');
    expect(analysis.detectedMedicines.length).toBeGreaterThan(0);
    expect(analysis.detectedMedicines[0].extractedName).toBe('Paracetamol');
    expect(analysis.disclaimer).toContain('not a medical device');
    expect(analysis.safetyNotice).toContain('Always verify exact doses');
  });
});

describe('Agent Execution Engine', () => {
  it('handles fast-path water logging command', async () => {
    const result = await agentEngine.processUserInput('log 2 glasses of water');
    expect(result.text).toContain('Logged 2 glasses');
    expect(result.toolResult?.success).toBe(true);
  });

  it('handles fast-path crisis intervention immediately', async () => {
    const result = await agentEngine.processUserInput('I feel like hurting myself');
    expect(result.text).toContain('Tele-MANAS on 14416');
    expect(result.toolResult?.routeToOpen).toBe('/(app)/safety/urgent-support');
  });

  it('handles medicine question with educational citation', async () => {
    const result = await agentEngine.processUserInput('What is the medicine called Ibuprofen?');
    expect(result.text).toContain('Ibuprofen');
    expect(result.text).toContain('OpenFDA');
  });

  it('falls back to deterministic coach for exercise questions', async () => {
    const result = await agentEngine.processUserInput('How do I do squats?');
    expect(result.text.toLowerCase()).toContain('chest tall');
  });
});
