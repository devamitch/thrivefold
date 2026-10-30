/**
 * The app's one entry point to the on-device language model (llama.cpp through the Llamatik
 * native module). Loads the chosen GGUF model lazily on first use, keeps one loaded at a time,
 * and answers with short, grounded replies. Nothing leaves the phone.
 */
import { LocalAI, getLocalModelFilePath, getModelPresetById, isModelDownloaded } from '../../../modules/local-ai';
import { useRootStore } from '../../stores/useRootStore';
import { importedFileOf, importedPath, isImportedId } from './modelImport';

let loading: Promise<boolean> | null = null;

export const localModelSupported = () => LocalAI.isAvailable();

/** True once the chosen model is loaded (loading it first when downloaded). */
export async function ensureLocalModel(): Promise<boolean> {
  if (!LocalAI.isAvailable()) return false;
  if (LocalAI.isLoaded()) return true;
  const id = useRootStore.getState().localModelId;
  if (!id) return false;
  const imported = isImportedId(id);
  if (!imported && (!getModelPresetById(id) || !(await isModelDownloaded(id)))) return false;
  loading ??= (async () => {
    try {
      const path = (imported ? importedPath(importedFileOf(id)) : getLocalModelFilePath(id)).replace(/^file:\/\//, '');
      const r = await LocalAI.loadModel(path, false, { temperature: 0.4, maxTokens: 220, topP: 0.9, repeatPenalty: 1.1 });
      return !!r?.success;
    } catch {
      return false;
    } finally {
      loading = null;
    }
  })();
  return loading;
}

/** One answer from the local model, or null when no model is ready. */
export async function askLocal(prompt: string, system: string, context?: string): Promise<string | null> {
  if (!(await ensureLocalModel())) return null;
  try {
    const out = await LocalAI.generateText({ prompt: prompt.slice(0, 2000), system, context: context?.slice(0, 3000) });
    return out.trim() || null;
  } catch {
    return null;
  }
}
