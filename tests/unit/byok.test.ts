jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
  Linking: { canOpenURL: jest.fn(async () => true), openURL: jest.fn(async () => {}) },
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

import { pickGeminiKey, pickGroqKey, pickOpenRouterKey, isLocalOnly, hasAiKeys, setRuntimeUserKeys } from '../../src/services/ai/env';
import { useRootStore } from '../../src/stores/useRootStore';

describe('BYOK & Local-First AI Architecture', () => {
  beforeEach(() => {
    useRootStore.getState().clearAllUserApiKeys();
    useRootStore.getState().setAiDeliveryMode('local_only');
  });

  test('defaults to local_only mode with empty userApiKeys', () => {
    const state = useRootStore.getState();
    expect(state.aiDeliveryMode).toBe('local_only');
    expect(state.userApiKeys).toEqual({});
    expect(isLocalOnly()).toBe(true);
  });

  test('local_only mode suppresses external AI keys', () => {
    expect(isLocalOnly()).toBe(true);
    // In local_only mode without user BYOK keys, pickGeminiKey returns empty string to protect privacy
    expect(pickGeminiKey()).toBe('');
    expect(pickGroqKey()).toBe('');
    expect(pickOpenRouterKey()).toBe('');
    expect(hasAiKeys()).toBe(false);
  });

  test('setUserApiKey persists user credentials and prioritizes user key', () => {
    const store = useRootStore.getState();
    store.setUserApiKey('gemini', 'user_custom_gemini_key_123');
    store.setUserApiKey('groq', 'user_custom_groq_key_456');

    expect(useRootStore.getState().userApiKeys.gemini).toBe('user_custom_gemini_key_123');
    expect(useRootStore.getState().userApiKeys.groq).toBe('user_custom_groq_key_456');

    // When user provides BYOK key, it takes precedence even in getter
    expect(pickGeminiKey()).toBe('user_custom_gemini_key_123');
    expect(pickGroqKey()).toBe('user_custom_groq_key_456');
  });

  test('clearUserApiKey cleanly removes single provider key', () => {
    const store = useRootStore.getState();
    store.setUserApiKey('gemini', 'key_gemini');
    store.setUserApiKey('openrouter', 'key_or');

    store.clearUserApiKey('gemini');
    expect(useRootStore.getState().userApiKeys.gemini).toBeUndefined();
    expect(useRootStore.getState().userApiKeys.openrouter).toBe('key_or');
  });

  test('switching delivery mode between local_only and byok', () => {
    const store = useRootStore.getState();
    store.setAiDeliveryMode('byok');
    expect(useRootStore.getState().aiDeliveryMode).toBe('byok');
    expect(isLocalOnly()).toBe(false);

    store.setAiDeliveryMode('local_only');
    expect(useRootStore.getState().aiDeliveryMode).toBe('local_only');
    expect(isLocalOnly()).toBe(true);
  });
});
