import { requireNativeModule } from 'expo';
import { Platform } from 'react-native';
import type {
  CachedModelFile,
  ChecksumVerifyResult,
  DeviceCapabilities,
  GenerateRequest,
  GenerateResult,
  ModelLoadOptions,
  ModelLoadProgressEvent,
  ModelLoadResult,
  RuntimeStatus,
  StreamCompleteEvent,
  StreamErrorEvent,
  StructuredGenerateRequest,
  TokenEvent,
} from './src/types';

export * from './src/types';
export * from './src/modelCatalog';
export * from './src/modelDownloader';
export * from './src/useLocalAI';

export interface DocumentChunkResult {
  index: number;
  text: string;
  startOffset: number;
  endOffset: number;
  tokenEstimate: number;
}

export function jsChunkDocument(
  text: string,
  targetChunkSize = 320,
  overlapChars = 40
): DocumentChunkResult[] {
  const cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return [];
  if (cleaned.length <= targetChunkSize) {
    return [
      {
        index: 0,
        text: cleaned,
        startOffset: 0,
        endOffset: cleaned.length,
        tokenEstimate: Math.max(1, Math.round(cleaned.split(' ').filter(Boolean).length * 1.3)),
      },
    ];
  }

  const chunks: DocumentChunkResult[] = [];
  const sentences = cleaned.split(/(?<=[.!?\n])\s+/).filter(Boolean);
  let buffer = '';
  let chunkIdx = 0;
  let currentStart = 0;

  for (const sentence of sentences) {
    if (buffer.length + sentence.length > targetChunkSize && buffer.length > 0) {
      const chunkText = buffer.trim();
      chunks.push({
        index: chunkIdx++,
        text: chunkText,
        startOffset: currentStart,
        endOffset: currentStart + chunkText.length,
        tokenEstimate: Math.max(1, Math.round(chunkText.split(' ').filter(Boolean).length * 1.3)),
      });
      const overlapText =
        chunkText.length > overlapChars ? chunkText.slice(-overlapChars) : chunkText;
      currentStart += chunkText.length - overlapText.length;
      buffer = `${overlapText} `;
    }
    buffer += `${sentence} `;
  }

  if (buffer.trim()) {
    const chunkText = buffer.trim();
    chunks.push({
      index: chunkIdx,
      text: chunkText,
      startOffset: currentStart,
      endOffset: currentStart + chunkText.length,
      tokenEstimate: Math.max(1, Math.round(chunkText.split(' ').filter(Boolean).length * 1.3)),
    });
  }
  return chunks;
}

export function jsComputeTermFrequencies(text: string): Record<string, number> {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = clean.split(/\s+/).filter((t) => t.length > 2);
  const tf: Record<string, number> = {};
  for (const t of tokens) {
    tf[t] = (tf[t] || 0) + 1;
  }
  return tf;
}

interface LocalAINative {
  isSupported: boolean;
  nativeEngine: string;
  sdkVersion: string;

  isAvailable(): boolean;
  getRuntimeStatus(): RuntimeStatus;
  getDeviceCapabilities(): DeviceCapabilities;
  verifyModelChecksum(filePath: string, expectedSha256: string): Promise<ChecksumVerifyResult>;
  dmEnqueue?(url: string, fileName: string, title: string): number;
  dmQuery?(id: number): DurableDownloadState;
  dmRemove?(id: number): boolean;
  listCachedModels(): CachedModelFile[];
  deleteCachedModel(fileName: string): boolean;
  isLoaded(): boolean;
  isGenerating(): boolean;
  loadModel(
    modelPathOrAsset: string,
    isAsset: boolean,
    options?: ModelLoadOptions
  ): Promise<ModelLoadResult>;
  unloadModel(): Promise<boolean>;
  updateParams(params: Record<string, unknown>): boolean;
  generateText(prompt: string, context?: string, system?: string): Promise<GenerateResult>;
  generateStructured(
    prompt: string,
    schema?: string,
    context?: string,
    system?: string
  ): Promise<{ json: string; durationMs: number }>;
  startStream(turnId: string, prompt: string, context?: string, system?: string): boolean;
  cancelGeneration(): boolean;
  embed(text: string): Promise<number[]>;
  chunkDocument(
    text: string,
    targetChunkSize?: number,
    overlapChars?: number
  ): DocumentChunkResult[];
  computeTermFrequencies(text: string): Record<string, number>;

  addListener(eventName: string, listener: (event: unknown) => void): { remove: () => void };
  removeAllListeners(eventName: string): void;
}

const native: LocalAINative | null =
  Platform.OS === 'android'
    ? (() => {
        try {
          return requireNativeModule<LocalAINative>('LocalAI');
        } catch {
          return null;
        }
      })()
    : null;

/**
 * Singleton Service for Native On-Device AI Inference.
 */
class LocalAIService {
  /**
   * Returns true if running on a platform with the native LLaMA engine linked.
   */
  isAvailable(): boolean {
    try {
      return native?.isAvailable() ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Inspects current runtime status, engine metadata and active loaded weights.
   */
  getRuntimeStatus(): RuntimeStatus {
    if (!native) {
      return {
        isSupported: false,
        isLoaded: false,
        isGenerating: false,
        loadedModelPath: '',
        loadedFileName: '',
        modelSizeBytes: 0,
        modelSizeMb: 0,
        nativeEngine: 'unavailable',
        sdkVersion: '0.0.0',
      };
    }
    return native.getRuntimeStatus();
  }

  /**
   * Reads physical RAM, available storage, and recommended model size ceiling.
   */
  getDeviceCapabilities(): DeviceCapabilities {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.getDeviceCapabilities();
  }

  /**
   * Verifies SHA-256 hash of a downloaded model file.
   */
  async verifyModelChecksum(filePath: string, expectedSha256: string): Promise<ChecksumVerifyResult> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.verifyModelChecksum(filePath, expectedSha256);
  }

  /**
   * Lists models present in the app's private storage.
   */
  listCachedModels(): CachedModelFile[] {
    return native?.listCachedModels() ?? [];
  }

  /**
   * Deletes a model from private storage.
   */
  deleteCachedModel(fileName: string): boolean {
    return native?.deleteCachedModel(fileName) ?? false;
  }

  /**
   * Checks whether weights are currently memory-mapped in native RAM.
   */
  isLoaded(): boolean {
    return native?.isLoaded() ?? false;
  }

  /**
   * Checks whether a generation task or stream is currently running.
   */
  isGenerating(): boolean {
    return native?.isGenerating() ?? false;
  }

  /**
   * Lazily and safely loads a GGUF model into memory.
   */
  async loadModel(
    modelPathOrAsset: string,
    isAsset = false,
    options?: ModelLoadOptions
  ): Promise<ModelLoadResult> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.loadModel(modelPathOrAsset, isAsset, options);
  }

  /**
   * Frees native RAM and shuts down the model context.
   */
  async unloadModel(): Promise<boolean> {
    if (!native) return false;
    return native.unloadModel();
  }

  /**
   * Configures generation parameters (temperature, maxTokens, topP, topK).
   */
  updateParams(params: Record<string, unknown>): boolean {
    return native?.updateParams(params) ?? false;
  }

  /**
   * Runs synchronous on-device text generation.
   */
  async generateText(request: GenerateRequest): Promise<string> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    const res = await native.generateText(request.prompt, request.context, request.system);
    return res.text;
  }

  /**
   * Runs schema-constrained structured generation.
   */
  async generateStructured<T = unknown>(request: StructuredGenerateRequest<T>): Promise<T> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    const res = await native.generateStructured(
      request.prompt,
      request.schema,
      request.context,
      request.system
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(res.json);
    } catch (e: unknown) {
      throw new Error(
        `Failed to parse JSON response from local AI: ${e instanceof Error ? e.message : String(e)}. Raw output was: ${res.json}`
      );
    }

    if (request.validator) {
      return request.validator(parsed);
    }
    return parsed as T;
  }

  /**
   * Initiates token streaming generation.
   */
  startStream(turnId: string, prompt: string, context?: string, system?: string): boolean {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.startStream(turnId, prompt, context, system);
  }

  /**
   * Instantly interrupts active token generation.
   */
  cancelGeneration(): boolean {
    return native?.cancelGeneration() ?? false;
  }

  /**
   * Generates dense embedding vector on device.
   */
  async embed(text: string): Promise<number[]> {
    if (!native) {
      throw new Error('LocalAI native module is unavailable on this platform.');
    }
    return native.embed(text);
  }

  /**
   * Performs fast semantic document chunking using native engine when available,
   * falling back to portable JS chunker on non-Android/test platforms.
   */
  chunkDocument(
    text: string,
    targetChunkSize = 320,
    overlapChars = 40
  ): DocumentChunkResult[] {
    if (!native) {
      return jsChunkDocument(text, targetChunkSize, overlapChars);
    }
    try {
      return native.chunkDocument(text, targetChunkSize, overlapChars);
    } catch {
      return jsChunkDocument(text, targetChunkSize, overlapChars);
    }
  }

  /**
   * Computes term frequency map for sparse BM25 indexing.
   */
  computeTermFrequencies(text: string): Record<string, number> {
    if (!native) {
      return jsComputeTermFrequencies(text);
    }
    try {
      return native.computeTermFrequencies(text);
    } catch {
      return jsComputeTermFrequencies(text);
    }
  }

  // Event Listeners
  onToken(callback: (event: TokenEvent) => void): { remove: () => void } {
    if (!native) return { remove: () => {} };
    return native.addListener('onToken', callback as (e: unknown) => void);
  }

  onStreamComplete(callback: (event: StreamCompleteEvent) => void): { remove: () => void } {
    if (!native) return { remove: () => {} };
    return native.addListener('onStreamComplete', callback as (e: unknown) => void);
  }

  onStreamError(callback: (event: StreamErrorEvent) => void): { remove: () => void } {
    if (!native) return { remove: () => {} };
    return native.addListener('onStreamError', callback as (e: unknown) => void);
  }

  onModelLoadProgress(callback: (event: ModelLoadProgressEvent) => void): { remove: () => void } {
    if (!native) return { remove: () => {} };
    return native.addListener('onModelLoadProgress', callback as (e: unknown) => void);
  }
}

export interface DurableDownloadState {
  status: 'pending' | 'running' | 'paused' | 'done' | 'failed' | 'missing';
  bytes?: number;
  total?: number;
  localUri?: string;
  reason?: number;
}

/**
 * Android DownloadManager: downloads that keep going when the app is closed or killed and are
 * picked up again when it reopens. Null where the native function is missing (older builds).
 */
export const DurableDownloads = native?.dmEnqueue
  ? {
      enqueue: (url: string, fileName: string, title: string) => native.dmEnqueue!(url, fileName, title),
      query: (id: number): DurableDownloadState => native.dmQuery!(id),
      remove: (id: number) => native.dmRemove!(id),
    }
  : null;

export const LocalAI = new LocalAIService();
export default LocalAI;
