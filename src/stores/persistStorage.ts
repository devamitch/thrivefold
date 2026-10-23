import { MMKV } from 'react-native-mmkv';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/**
 * On-device store for personal data (ADR-004: health records stay local-first).
 * Each store persists under its own key; `wipeLocalData` removes all of them.
 */
let mmkv: MMKV | null = null;
const memory = new Map<string, string>();

function storage(): MMKV | null {
  if (mmkv) return mmkv;
  try {
    mmkv = new MMKV({ id: 'thrivefold-local' });
  } catch {
    mmkv = null; // tests / web without native module: fall back to memory
  }
  return mmkv;
}

const stateStorage: StateStorage = {
  getItem: (key) => storage()?.getString(key) ?? memory.get(key) ?? null,
  setItem: (key, value) => {
    const s = storage();
    if (s) s.set(key, value);
    else memory.set(key, value);
  },
  removeItem: (key) => {
    storage()?.delete(key);
    memory.delete(key);
  },
};

export const localJSONStorage = createJSONStorage(() => stateStorage);

/** Async key-value view of the same device store, for the Supabase auth session. */
export const asyncKeyValueStorage = {
  getItem: async (key: string) => stateStorage.getItem(key) as string | null,
  setItem: async (key: string, value: string) => {
    stateStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    stateStorage.removeItem(key);
  },
};

/** Deletes every persisted Thrivefold store on this device. */
export function wipeLocalData(): void {
  storage()?.clearAll();
  memory.clear();
}
