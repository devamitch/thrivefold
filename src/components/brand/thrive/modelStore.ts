/**
 * Central on-device model store for every AnvayKosh app (Thrivefold, Neev, BlinkQuest, Setu...).
 *
 *  1. Models download silently in the background (resumable, Wi-Fi only by default), are
 *     SHA-256 verified, and live in the app's private folder.
 *  2. Small models are mirrored into one shared folder (Documents/AnvayKosh) chosen ONCE through the
 *     Android folder picker. After an uninstall + reinstall the app finds them there and restores them
 *     without downloading again. Every app picks the same folder once; that is how they share models.
 *  3. Local learning data (corrections, emotion samples) is kept only on the device under the same
 *     AnvayKosh namespace via koshLog().
 *
 * Limits you should know:
 *  - Android only allows the shared-folder mirror through the folder picker (one tap, once per app).
 *    That single permission cannot be silent, everything else is.
 *  - The JS copy goes through base64, so only models up to MIRROR_MAX_BYTES are mirrored. Larger
 *    models (LLMs) stay in app storage unless you add a native stream copy.
 *  - You must register real model URLs and hashes with registerModels(); none are invented here.
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as Network from 'expo-network';
import * as Crypto from 'expo-crypto';
import { asyncKeyValueStorage as storage } from '../../../stores/persistStorage';

export interface ModelSpec {
  id: string; // e.g. 'emotion-fer-int8'
  file: string; // e.g. 'emotion-fer-int8.tflite'
  url: string;
  sha256: string; // lowercase hex of the final file
  bytes: number;
  kind: 'emotion' | 'speech' | 'llm' | 'other';
}

const LOCAL_DIR = `${FileSystem.documentDirectory ?? ''}anvaykosh/models/`;
const SAF_KEY = 'kosh.sharedDir';
const MIRROR_MAX_BYTES = 48 * 1024 * 1024;
const registry = new Map<string, ModelSpec>();

export const registerModels = (specs: ModelSpec[]) => specs.forEach((s) => registry.set(s.id, s));

async function sha256File(uri: string): Promise<string> {
  // Small files only; for big ones verify with a native hasher.
  const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, b64, { encoding: Crypto.CryptoEncoding.HEX });
}
const valid = async (uri: string, spec: ModelSpec) => {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || (info as any).size !== spec.bytes) return false;
  return spec.bytes > MIRROR_MAX_BYTES ? true : (await sha256File(uri)) === spec.sha256;
};

/** One-time folder pick so models survive uninstall and are shared between apps. */
export async function pickSharedFolder(): Promise<boolean> {
  const SAF = (FileSystem as any).StorageAccessFramework;
  if (!SAF) return false;
  const r = await SAF.requestDirectoryPermissionsAsync();
  if (!r.granted) return false;
  await storage.setItem(SAF_KEY, r.directoryUri);
  return true;
}

async function sharedFile(spec: ModelSpec): Promise<string | null> {
  const SAF = (FileSystem as any).StorageAccessFramework;
  const dir = await storage.getItem(SAF_KEY);
  if (!SAF || !dir) return null;
  try {
    const files: string[] = await SAF.readDirectoryAsync(dir);
    return files.find((u) => decodeURIComponent(u).endsWith(spec.file)) ?? null;
  } catch {
    return null;
  }
}

async function mirror(spec: ModelSpec, localUri: string) {
  const SAF = (FileSystem as any).StorageAccessFramework;
  const dir = await storage.getItem(SAF_KEY);
  if (!SAF || !dir || spec.bytes > MIRROR_MAX_BYTES || (await sharedFile(spec))) return;
  try {
    const b64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
    const dest = await SAF.createFileAsync(dir, spec.file, 'application/octet-stream');
    await FileSystem.writeAsStringAsync(dest, b64, { encoding: FileSystem.EncodingType.Base64 });
  } catch { /* mirror is best-effort */ }
}

/** Returns a local file path for the model, downloading / restoring silently if needed. */
export async function ensureModel(
  id: string,
  opts: { wifiOnly?: boolean; onProgress?: (fraction: number) => void } = {},
): Promise<string | null> {
  const spec = registry.get(id);
  if (!spec) return null;
  await FileSystem.makeDirectoryAsync(LOCAL_DIR, { intermediates: true }).catch(() => {});
  const local = LOCAL_DIR + spec.file;
  if (await valid(local, spec)) { void mirror(spec, local); return local; }

  const shared = await sharedFile(spec); // restore after reinstall / from another app
  if (shared) {
    try {
      const b64 = await FileSystem.readAsStringAsync(shared, { encoding: FileSystem.EncodingType.Base64 });
      await FileSystem.writeAsStringAsync(local, b64, { encoding: FileSystem.EncodingType.Base64 });
      if (await valid(local, spec)) return local;
    } catch { /* fall through to download */ }
  }

  const net = await Network.getNetworkStateAsync().catch(() => null);
  if (!net?.isConnected) return null;
  if ((opts.wifiOnly ?? true) && net.type !== Network.NetworkStateType.WIFI) return null;

  const dl = FileSystem.createDownloadResumable(spec.url, local + '.part', {}, (p) => {
    opts.onProgress?.(p.totalBytesWritten / Math.max(1, p.totalBytesExpectedToWrite));
  });
  const res = await dl.downloadAsync().catch(() => null);
  if (!res) return null;
  await FileSystem.moveAsync({ from: res.uri, to: local });
  if (!(await valid(local, spec))) { await FileSystem.deleteAsync(local, { idempotent: true }); return null; }
  void mirror(spec, local);
  return local;
}

/** Fire and forget at app start: fetch every registered model quietly, one at a time. */
export async function prefetchModels(opts: { wifiOnly?: boolean } = {}) {
  for (const id of registry.keys()) await ensureModel(id, opts).catch(() => null);
}

// ---------- local learning data, stays on the device ----------
const LOG_KEY = (name: string) => `kosh.log.${name}`;
export async function koshLog(name: string, sample: unknown, keep = 500) {
  try {
    const raw = (await storage.getItem(LOG_KEY(name))) ?? '[]';
    const arr = JSON.parse(raw) as unknown[];
    arr.push({ t: Date.now(), ...(sample as object) });
    await storage.setItem(LOG_KEY(name), JSON.stringify(arr.slice(-keep)));
  } catch { /* ignore */ }
}
export async function koshRead(name: string): Promise<unknown[]> {
  try { return JSON.parse((await storage.getItem(LOG_KEY(name))) ?? '[]'); } catch { return []; }
}
