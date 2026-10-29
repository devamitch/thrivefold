/**
 * One-tap setup of the on-device brain: pick the model that fits this phone, download it with
 * real byte progress, check its size and SHA-256, load it, and ask it one short question. The
 * model is marked as in use only after that probe answers. Screens subscribe to the progress.
 */
import {
  LocalAI,
  downloadModelWithProgress,
  getRecommendedModel,
  isModelDownloaded,
  type ModelDownloadHandle,
  type ModelPreset,
} from '../../../modules/local-ai';
import { useRootStore } from '../../stores/useRootStore';
import { ensureLocalModel } from './localModel';

export type SetupPhase = 'idle' | 'downloading' | 'verifying' | 'loading' | 'ready' | 'failed' | 'unsupported';

export interface SetupState {
  phase: SetupPhase;
  model: ModelPreset | null;
  progress: number;
  message: string | null;
}

let state: SetupState = { phase: 'idle', model: null, progress: 0, message: null };
let handle: ModelDownloadHandle | null = null;
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
  const setId = useRootStore.getState().setLocalModelId;
  try {
    if (!(await isModelDownloaded(model.id))) {
      emit({ phase: 'downloading', model, progress: 0, message: null });
      const caps = LocalAI.getDeviceCapabilities();
      handle = downloadModelWithProgress(
        model,
        caps.availableStorageBytes,
        (p) => emit({ progress: p.progress ?? 0, phase: (p.progress ?? 0) >= 1 ? 'verifying' : 'downloading' }),
        (path, hash) => LocalAI.verifyModelChecksum(path, hash),
      );
      await handle.promise;
      handle = null;
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
    emit({ phase: 'failed', message: e instanceof Error ? e.message : 'Download failed. Try again on Wi-Fi.' });
    return false;
  }
}

export async function cancelSetup(): Promise<void> {
  await handle?.cancel();
  handle = null;
  emit({ phase: 'idle', progress: 0, message: null });
}
