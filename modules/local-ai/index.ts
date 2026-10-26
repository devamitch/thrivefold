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

interface LocalAINative {
  isSupported: boolean;
  nativeEngine: string;
  sdkVersion: string;

  isAvailable(): boolean;
  getRuntimeStatus(): RuntimeStatus;
  getDeviceCapabilities(): DeviceCapabilities;
  verifyModelChecksum(filePath: string, expectedSha256: string): Promise<ChecksumVerifyResult>;
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

export const LocalAI = new LocalAIService();
export default LocalAI;
