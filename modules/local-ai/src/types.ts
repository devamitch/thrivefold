/**
 * Core type definitions for the Native Local AI subsystem.
 */

export interface DeviceCapabilities {
  totalRamBytes: number;
  totalRamMb: number;
  availableRamBytes: number;
  availableRamMb: number;
  thresholdBytes: number;
  isLowMemory: boolean;
  availableStorageBytes: number;
  availableStorageMb: number;
  cpuCores: number;
  optimalThreads: number;
  recommendedContextLength: number;
  safeModelCeilingBytes: number;
  safeModelCeilingMb: number;
  supportedAbis: string[];
  isArm64: boolean;
  deviceModel: string;
  androidSdk: number;
}

export interface RuntimeStatus {
  isSupported: boolean;
  isLoaded: boolean;
  isGenerating: boolean;
  loadedModelPath: string;
  loadedFileName: string;
  modelSizeBytes: number;
  modelSizeMb: number;
  nativeEngine: string;
  sdkVersion: string;
}

export interface ModelPreset {
  id: string;
  name: string;
  author: string;
  parameters: string;
  sizeBytes: number;
  sizeMb: number;
  minRamMb: number;
  role: 'chat' | 'reasoning' | 'embedding' | 'assistant';
  downloadUrl: string;
  expectedSha256: string;
  contextLength: number;
  license: string;
  description: string;
  /**
   * The bundled llama.cpp (Llamatik 0.12) predates this architecture: it is listed so it can be
   * tried, and the app test-answers it after download, but it may not start until the engine is
   * updated (or the LiteRT-LM runtime is added).
   */
  needsNewerRuntime?: boolean;
}

export interface ModelLoadOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  repeatPenalty?: number;
  force?: boolean;
}

export interface ModelLoadResult {
  success: boolean;
  modelPath: string;
  fileName: string;
  sizeBytes: number;
  sizeMb: number;
  durationMs: number;
  threads: number;
}

export interface GenerateRequest {
  prompt: string;
  context?: string;
  system?: string;
}

export interface GenerateResult {
  text: string;
  durationMs: number;
}

export interface StructuredGenerateRequest<T = unknown> {
  prompt: string;
  schema?: string;
  context?: string;
  system?: string;
  validator?: (data: unknown) => T;
}

export interface TokenEvent {
  turnId: string;
  token: string;
  index: number;
}

export interface StreamCompleteEvent {
  turnId: string;
  fullText: string;
  tokenCount: number;
  durationMs: number;
  tokensPerSecond: number;
}

export interface StreamErrorEvent {
  turnId: string;
  error: string;
}

export interface ModelLoadProgressEvent {
  progress: number;
  status: string;
}

export interface ChecksumVerifyResult {
  matches: boolean;
  actualSha256: string;
  expectedSha256: string;
}

export interface CachedModelFile {
  name: string;
  path: string;
  sizeBytes: number;
  sizeMb: number;
  lastModified: number;
}

export type LocalAIStatus =
  | 'unloaded'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'generating'
  | 'error';
