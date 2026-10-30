/**
 * One-tap setup of the on-device brain: pick the model that fits this phone, download it with
 * real byte progress, check its size and SHA-256, load it, and ask it one short question. The
 * model is marked as in use only after that probe answers. Screens subscribe to the progress.
 */
import {
  DurableDownloads,
  LocalAI,
  MODEL_PRESETS,
  downloadModelWithProgress,
  ensureModelsDirectory,
  getLocalModelFilePath,
  getRecommendedModel,
  isModelDownloaded,
  type ModelDownloadHandle,
  type ModelPreset,
} from '../../../modules/local-ai';
import * as FileSystem from 'expo-file-system/legacy';

import { asyncKeyValueStorage } from '../../stores/persistStorage';
import { useRootStore } from '../../stores/useRootStore';
import { ensureLocalModel } from './localModel';

export type SetupPhase =
  | 'idle'
  | 'downloading'
  | 'paused'
  | 'verifying'
  | 'loading'
  | 'ready'
  | 'failed'
  | 'unsupported';

export interface SetupState {
  phase: SetupPhase;
  model: ModelPreset | null;
  progress: number;
  message: string | null;
  /** True when Android's download service is doing the transfer (it continues if the app closes). */
  durable?: boolean;
}

let state: SetupState = { phase: 'idle', model: null, progress: 0, message: null };

// Android DownloadManager job for the model, remembered so the app can pick it up after a restart.
const DM_KEY = 'thrive.modelDM.v1';
type DmJob = { modelId: string; id: number };
async function readDmJob(): Promise<DmJob | null> {
  try {
    const raw = await asyncKeyValueStorage.getItem(DM_KEY);
    return raw ? (JSON.parse(raw) as DmJob) : null;
  } catch {
    return null;
  }
}
const clearDmJob = () => asyncKeyValueStorage.removeItem(DM_KEY).catch(() => undefined);
let dmTimer: ReturnType<typeof setInterval> | null = null;

/** Downloads with Android's DownloadManager, verifies the SHA-256 and moves the file into place. */
async function durableDownload(model: ModelPreset): Promise<void> {
  if (!DurableDownloads) throw new Error('unavailable');
  let job = await readDmJob();
  if (!job || job.modelId !== model.id || DurableDownloads.query(job.id).status === 'missing') {
    const id = DurableDownloads.enqueue(model.downloadUrl, `${model.id}.gguf.part`, `Thrivefold AI: ${model.name}`);
    job = { modelId: model.id, id };
    await asyncKeyValueStorage.setItem(DM_KEY, JSON.stringify(job)).catch(() => undefined);
  }
  const jobId = job.id;
  emit({ phase: 'downloading', model, durable: true, message: null });
  const localUri = await new Promise<string>((resolve, reject) => {
    if (dmTimer) clearInterval(dmTimer);
    dmTimer = setInterval(() => {
      const q = DurableDownloads!.query(jobId);
      if (q.total && q.total > 0) emit({ progress: Math.min(1, (q.bytes ?? 0) / q.total) });
      if (q.status === 'paused') emit({ message: 'Waiting for a network connection…' });
      else if (state.message) emit({ message: null });
      if (q.status === 'done' && q.localUri) {
        clearInterval(dmTimer!);
        dmTimer = null;
        resolve(q.localUri);
      } else if (q.status === 'failed' || q.status === 'missing') {
        clearInterval(dmTimer!);
        dmTimer = null;
        reject(new Error('The download failed. Check the connection and try again.'));
      }
    }, 1000);
  });
  emit({ phase: 'verifying', progress: 1 });
  const path = localUri.replace(/^file:\/\//, '');
  const info = await FileSystem.getInfoAsync(localUri);
  const size = info.exists ? (info.size ?? 0) : 0;
  const okSize = size > 0 && Math.abs(size - model.sizeBytes) <= model.sizeBytes * 0.01;
  const okHash = okSize && (await LocalAI.verifyModelChecksum(path, model.expectedSha256).catch(() => ({ matches: false }))).matches;
  if (!okHash) {
    DurableDownloads.remove(jobId);
    await clearDmJob();
    throw new Error('Model SHA-256 integrity check failed. File has been removed.');
  }
  await ensureModelsDirectory();
  const dest = getLocalModelFilePath(model.id);
  await FileSystem.deleteAsync(dest, { idempotent: true });
  await FileSystem.moveAsync({ from: localUri, to: dest });
  DurableDownloads.remove(jobId);
  await clearDmJob();
}
let handle: ModelDownloadHandle | null = null;

// A paused download is remembered so it continues where it stopped, even after the app restarts.
const RESUME_KEY = 'thrive.modelDownload.v1';
type Saved = { modelId: string; resumeData: string; progress: number };
async function readSaved(): Promise<Saved | null> {
  try {
    const raw = await asyncKeyValueStorage.getItem(RESUME_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
const clearSaved = () => asyncKeyValueStorage.removeItem(RESUME_KEY).catch(() => undefined);
const listeners = new Set<(s: SetupState) => void>();

const emit = (patch: Partial<SetupState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
};

export const getSetupState = () => state;

export function subscribeSetup(fn: (s: SetupState) => void): () => void {
  listeners.add(fn);
  fn(state);
  return () => {
    listeners.delete(fn);
  };
}

/** The model this phone should use, or null when the native engine is missing. */
export function recommendedModel(): ModelPreset | null {
  if (!LocalAI.isAvailable()) return null;
  return getRecommendedModel(LocalAI.getDeviceCapabilities().totalRamMb);
}

/** True when a model is chosen, downloaded and answering. */
export async function brainReady(): Promise<boolean> {
  const id = useRootStore.getState().localModelId;
  return !!id && (await isModelDownloaded(id)) && (await ensureLocalModel());
}

async function probe(): Promise<boolean> {
  try {
    const out = await LocalAI.generateText({ prompt: 'Reply with the single word: ready', system: 'Answer briefly.' });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

/** Downloads (if needed), verifies, loads and probes the recommended model. Safe to call twice. */
export async function setUpBrain(model: ModelPreset | null = recommendedModel()): Promise<boolean> {
  if (!model) {
    emit({ phase: 'unsupported', message: 'On-device AI is not available on this phone.' });
    return false;
  }
  if (state.phase === 'downloading' || state.phase === 'verifying' || state.phase === 'loading') return false;
  const saved = await readSaved();
  const setId = useRootStore.getState().setLocalModelId;
  try {
    if (!(await isModelDownloaded(model.id)) && DurableDownloads) {
      await durableDownload(model);
    }
    if (!(await isModelDownloaded(model.id))) {
      const resume = saved?.modelId === model.id ? saved.resumeData : null;
      emit({ phase: 'downloading', model, progress: resume ? (saved?.progress ?? 0) : 0, message: null });
      const caps = LocalAI.getDeviceCapabilities();
      handle = downloadModelWithProgress(
        model,
        caps.availableStorageBytes,
        (p) => emit({ progress: p.progress ?? 0, phase: (p.progress ?? 0) >= 1 ? 'verifying' : 'downloading' }),
        (path, hash) => LocalAI.verifyModelChecksum(path, hash),
        resume,
      );
      await handle.promise;
      handle = null;
      void clearSaved();
    }
    emit({ phase: 'loading', model, progress: 1 });
    if (LocalAI.isLoaded()) await LocalAI.unloadModel();
    setId(model.id);
    if (!(await ensureLocalModel()) || !(await probe())) {
      setId(null);
      emit({ phase: 'failed', message: 'The model downloaded but did not start. Close other apps and try again.' });
      return false;
    }
    emit({ phase: 'ready', message: null });
    return true;
  } catch (e) {
    handle = null;
    if (e instanceof Error && e.message === 'paused') return false;
    emit({ phase: 'failed', message: e instanceof Error ? e.message : 'Download failed. Try again on Wi-Fi.' });
    return false;
  }
}

export async function cancelSetup(): Promise<void> {
  const job = await readDmJob();
  if (job && DurableDownloads) DurableDownloads.remove(job.id);
  void clearDmJob();
  if (dmTimer) clearInterval(dmTimer);
  dmTimer = null;
  await handle?.cancel();
  handle = null;
  void clearSaved();
  emit({ phase: 'idle', progress: 0, message: null });
}

/** Pauses the download and remembers where it stopped. */
export async function pauseSetup(): Promise<void> {
  const model = state.model;
  const data = await handle?.pause();
  handle = null;
  if (model && data) {
    await asyncKeyValueStorage
      .setItem(RESUME_KEY, JSON.stringify({ modelId: model.id, resumeData: data, progress: state.progress }))
      .catch(() => undefined);
  }
  emit({ phase: 'paused' });
}

/** Continues a paused download (also used when the app opens). */
export async function resumeSetup(): Promise<boolean> {
  const job = await readDmJob();
  const saved = await readSaved();
  const id = job?.modelId ?? saved?.modelId;
  const model = id ? (MODEL_PRESETS.find((m) => m.id === id) ?? null) : state.model;
  return setUpBrain(model);
}

/** A download paused earlier (or cut off when the app closed), if any. */
export async function pendingDownload(): Promise<{ model: ModelPreset; progress: number } | null> {
  const job = await readDmJob();
  const dmModel = job ? MODEL_PRESETS.find((m) => m.id === job.modelId) : undefined;
  if (job && dmModel) return { model: dmModel, progress: 0 };
  const saved = await readSaved();
  const model = saved ? MODEL_PRESETS.find((m) => m.id === saved.modelId) : undefined;
  return saved && model ? { model, progress: saved.progress } : null;
}
