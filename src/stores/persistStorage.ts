import { MMKV } from 'react-native-mmkv';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';
import type { PersistStorage, StateStorage, StorageValue } from 'zustand/middleware';

/**
 * On-device store for personal data (ADR-004: health records stay local-first).
 *
 * The MMKV file is encrypted at rest (AES via MMKV) with a per-install key generated on the
 * device and kept in the platform keystore through expo-secure-store; it never leaves the
 * phone and is not in backups of the app's files. Installs from before encryption are
 * re-encrypted in place on first launch. Where secure storage is unavailable (tests, web)
 * the store falls back to memory or an unencrypted instance.
 */
const STORE_ID = 'thrivefold-local';
const KEY_NAME = 'thrivefold.mmkv.key.v1';
const MIGRATED_FLAG = 'thrivefold.mmkv.encrypted.v1';
const KEY_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

let mmkv: MMKV | null = null;
let encrypted = false;
const memory = new Map<string, string>();

/** 16 characters (MMKV's maximum key length) from 16 random bytes. */
function newKey(): string {
  const bytes = Crypto.getRandomBytes(16);
  return Array.from(bytes, (b) => KEY_ALPHABET[b % KEY_ALPHABET.length]).join('');
}

function readOrCreateKey(): string | null {
  try {
    const existing = SecureStore.getItem(KEY_NAME);
    if (existing) return existing;
    const key = newKey();
    SecureStore.setItem(KEY_NAME, key);
    return key;
  } catch {
    return null;
  }
}

function storage(): MMKV | null {
  if (mmkv) return mmkv;
  try {
    const key = readOrCreateKey();
    if (!key) {
      mmkv = new MMKV({ id: STORE_ID });
      return mmkv;
    }
    let migrated = false;
    try {
      migrated = SecureStore.getItem(MIGRATED_FLAG) === '1';
    } catch {
      migrated = false;
    }
    if (migrated) {
      mmkv = new MMKV({ id: STORE_ID, encryptionKey: key });
    } else {
      // Older installs stored this file unencrypted: open it as-is, then encrypt in place.
      mmkv = new MMKV({ id: STORE_ID });
      mmkv.recrypt(key);
      SecureStore.setItem(MIGRATED_FLAG, '1');
    }
    encrypted = true;
  } catch {
    mmkv = null; // tests / web without native module: fall back to memory
  }
  return mmkv;
}

/** True when personal records on this device are encrypted at rest. */
export const isStorageEncrypted = () => {
  storage();
  return encrypted;
};

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

/** How long state changes are coalesced before one write. */
const WRITE_DELAY_MS = 300;
let pending: { name: string; value: StorageValue<unknown> } | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

/** Writes the latest state now (also on background, so nothing is lost when the app is killed). */
export function flushPersistedState() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!pending) return;
  const { name, value } = pending;
  pending = null;
  stateStorage.setItem(name, JSON.stringify(value));
}

AppState.addEventListener('change', (next) => {
  if (next !== 'active') flushPersistedState();
});

/**
 * The store persists through this. Serialising the whole state and writing it to encrypted
 * storage on every change blocked the JS thread during busy screens; changes are coalesced
 * and written once, after a short pause or when the app leaves the foreground.
 */
export const localJSONStorage: PersistStorage<unknown> = {
  getItem: (name) => {
    const raw = stateStorage.getItem(name) as string | null;
    return raw ? (JSON.parse(raw) as StorageValue<unknown>) : null;
  },
  setItem: (name, value) => {
    pending = { name, value };
    if (!timer) timer = setTimeout(flushPersistedState, WRITE_DELAY_MS);
  },
  removeItem: (name) => {
    // Erasing must not be undone by a write that was still waiting.
    if (timer) clearTimeout(timer);
    timer = null;
    pending = null;
    stateStorage.removeItem(name);
  },
};

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

/** Deletes every persisted Thrivefold record on this device and rotates the encryption key. */
export function wipeLocalData(): void {
  const s = storage();
  s?.clearAll();
  memory.clear();
  if (s && encrypted) {
    try {
      const key = newKey();
      s.recrypt(key);
      SecureStore.setItem(KEY_NAME, key);
    } catch {
      // Keeping the old key is safe: the store is already empty.
    }
  }
}

/** Synchronous view of the same encrypted store, for the React Query cache persister. */
export const syncKeyValueStorage = {
  getItem: (key: string) => stateStorage.getItem(key) as string | null,
  setItem: (key: string, value: string) => {
    stateStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    stateStorage.removeItem(key);
  },
};
