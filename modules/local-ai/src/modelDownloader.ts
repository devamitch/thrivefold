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
  /** Pauses and returns data that resumes the transfer later (even after the app restarts). */
  pause: () => Promise<string | null>;
}

/**
 * Downloads a model preset with:
 * 1. Pre-flight storage capacity check
 * 2. Transfer into a temporary file (an interrupted download starts again from the beginning)
 * 3. Size and SHA-256 checks that fail closed: a file that cannot be verified is never installed
 * 4. Post-download atomic rename to final target path
 */
export function downloadModelWithProgress(
  preset: ModelPreset,
  availableStorageBytes: number,
  onProgress?: DownloadProgressCallback,
  verifyChecksumFn?: (filePath: string, expectedHash: string) => Promise<{ matches: boolean }>,
  /** Saved by pause(); continues the same partial file instead of starting again. */
  resumeData?: string | null,
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
      pause: async () => null,
    };
  }

  const tmpPath = `${MODELS_FOLDER}${preset.id}.download.tmp`;
  const finalPath = getLocalModelFilePath(preset.id);

  let downloadResumable: FileSystem.DownloadResumable | null = null;
  let isCancelled = false;
  let isPaused = false;

  const promise = (async () => {
    await ensureModelsDirectory();

    // A paused transfer continues its partial file; anything else starts clean.
    const tmpInfo = await FileSystem.getInfoAsync(tmpPath);
    const canResume = !!resumeData && tmpInfo.exists;
    if (tmpInfo.exists && !canResume) {
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
      },
      canResume ? (resumeData ?? undefined) : undefined,
    );

    const result = canResume ? await downloadResumable.resumeAsync() : await downloadResumable.downloadAsync();
    if (isPaused) throw new Error('paused');
    if (!result || isCancelled) {
      throw new Error('Download was cancelled or interrupted.');
    }

    const downloadedInfo = await FileSystem.getInfoAsync(tmpPath);
    const size = downloadedInfo.exists ? (downloadedInfo.size ?? 0) : 0;
    // The catalog records the exact artifact size; anything else (an error page, a cut-off
    // transfer, a different file) is rejected before hashing.
    if (size === 0 || (preset.sizeBytes > 0 && Math.abs(size - preset.sizeBytes) > preset.sizeBytes * 0.01)) {
      await FileSystem.deleteAsync(tmpPath, { idempotent: true });
      throw new Error('Downloaded file is not the expected model. Please try again.');
    }

    // A configured checksum must be verified. If verification cannot run or does not match,
    // the file is removed and nothing is installed (fail closed).
    if (preset.expectedSha256) {
      let matches = false;
      try {
        matches = !!verifyChecksumFn && (await verifyChecksumFn(tmpPath, preset.expectedSha256)).matches;
      } catch {
        matches = false;
      }
      if (!matches) {
        await FileSystem.deleteAsync(tmpPath, { idempotent: true });
        throw new Error('Model SHA-256 integrity check failed. File has been removed.');
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

  const pause = async () => {
    if (!downloadResumable) return null;
    isPaused = true;
    try {
      await downloadResumable.pauseAsync();
      return downloadResumable.savable().resumeData ?? null;
    } catch {
      return null;
    }
  };

  return { promise, cancel, pause };
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
