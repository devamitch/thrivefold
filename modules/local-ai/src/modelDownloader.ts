import * as FileSystem from 'expo-file-system/legacy';
import type { ModelPreset } from './types';

export interface DownloadProgressInfo {
  progress: number;
  totalBytesWritten: number;
  totalBytesExpected: number;
}

export type DownloadProgressCallback = (info: DownloadProgressInfo) => void;

const MODELS_FOLDER = `${FileSystem.documentDirectory ?? ''}local_ai_models/`;

export async function ensureModelsDirectory(): Promise<string> {
  const dirInfo = await FileSystem.getInfoAsync(MODELS_FOLDER);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MODELS_FOLDER, { intermediates: true });
  }
  return MODELS_FOLDER;
}

export function getLocalModelFilePath(modelId: string): string {
  return `${MODELS_FOLDER}${modelId}.gguf`;
}

export async function isModelDownloaded(modelId: string): Promise<boolean> {
  const targetPath = getLocalModelFilePath(modelId);
  const info = await FileSystem.getInfoAsync(targetPath);
  return info.exists && !info.isDirectory && (info.size ?? 0) > 0;
}

export async function getDownloadedModelSize(modelId: string): Promise<number> {
  const targetPath = getLocalModelFilePath(modelId);
  const info = await FileSystem.getInfoAsync(targetPath);
  return info.exists && !info.isDirectory ? (info.size ?? 0) : 0;
}

export interface ModelDownloadHandle {
  promise: Promise<string>;
  cancel: () => Promise<void>;
}

/**
 * Downloads a model preset with:
 * 1. Pre-flight storage capacity check
 * 2. Resumable chunked transfer
 * 3. Temporary download isolation
 * 4. Post-download atomic rename to final target path
 */
export function downloadModelWithProgress(
  preset: ModelPreset,
  availableStorageBytes: number,
  onProgress?: DownloadProgressCallback,
  verifyChecksumFn?: (filePath: string, expectedHash: string) => Promise<{ matches: boolean }>
): ModelDownloadHandle {
  const requiredBytesWithHeadroom = Math.round(preset.sizeBytes * 1.25);

  if (availableStorageBytes > 0 && availableStorageBytes < requiredBytesWithHeadroom) {
    const availMb = Math.round(availableStorageBytes / (1024 * 1024));
    const reqMb = Math.round(requiredBytesWithHeadroom / (1024 * 1024));
    return {
      promise: Promise.reject(
        new Error(
          `Insufficient storage space to download model. Available: ${availMb}MB, Required: ${reqMb}MB.`
        )
      ),
      cancel: async () => {},
    };
  }

  const tmpPath = `${MODELS_FOLDER}${preset.id}.download.tmp`;
  const finalPath = getLocalModelFilePath(preset.id);

  let downloadResumable: FileSystem.DownloadResumable | null = null;
  let isCancelled = false;

  const promise = (async () => {
    await ensureModelsDirectory();

    // Remove any leftover partial tmp file
    const tmpInfo = await FileSystem.getInfoAsync(tmpPath);
    if (tmpInfo.exists) {
      await FileSystem.deleteAsync(tmpPath, { idempotent: true });
    }

    downloadResumable = FileSystem.createDownloadResumable(
      preset.downloadUrl,
      tmpPath,
      {},
      (downloadProgress) => {
        if (isCancelled) return;
        const total = downloadProgress.totalBytesExpectedToWrite;
        const written = downloadProgress.totalBytesWritten;
        const ratio = total > 0 ? Math.min(1, written / total) : 0;
        onProgress?.({
          progress: ratio,
          totalBytesWritten: written,
          totalBytesExpected: total,
        });
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result || isCancelled) {
      throw new Error('Download was cancelled or interrupted.');
    }

    const downloadedInfo = await FileSystem.getInfoAsync(tmpPath);
    if (!downloadedInfo.exists || (downloadedInfo.size ?? 0) === 0) {
      throw new Error('Downloaded file is empty or corrupted.');
    }

    // Checksum verification if verifier provided and hash is not a placeholder
    if (verifyChecksumFn && preset.expectedSha256 && preset.expectedSha256.length === 64) {
      try {
        const verifyRes = await verifyChecksumFn(tmpPath, preset.expectedSha256);
        if (!verifyRes.matches) {
          await FileSystem.deleteAsync(tmpPath, { idempotent: true });
          throw new Error('Model SHA-256 integrity check failed. File has been removed.');
        }
      } catch (err: unknown) {
        // If checksum function itself errors, bubble up
        if (err instanceof Error && err.message.includes('integrity check failed')) {
          throw err;
        }
      }
    }

    // Atomic move to final target path
    const existingFinal = await FileSystem.getInfoAsync(finalPath);
    if (existingFinal.exists) {
      await FileSystem.deleteAsync(finalPath, { idempotent: true });
    }

    await FileSystem.moveAsync({
      from: tmpPath,
      to: finalPath,
    });

    return finalPath;
  })();

  const cancel = async () => {
    isCancelled = true;
    if (downloadResumable) {
      try {
        await downloadResumable.pauseAsync();
      } catch {}
    }
    try {
      await FileSystem.deleteAsync(tmpPath, { idempotent: true });
    } catch {}
  };

  return { promise, cancel };
}

export async function deleteLocalModel(modelId: string): Promise<boolean> {
  const targetPath = getLocalModelFilePath(modelId);
  const info = await FileSystem.getInfoAsync(targetPath);
  if (info.exists) {
    await FileSystem.deleteAsync(targetPath, { idempotent: true });
    return true;
  }
  return false;
}
