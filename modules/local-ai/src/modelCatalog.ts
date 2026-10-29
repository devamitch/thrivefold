import type { ModelPreset } from './types';

/**
 * Pinned catalog of lightweight mobile GGUF models suitable for Android devices.
 * Models start with ultra-compact instruction-tuned weights (135M / 360M) that
 * execute fast on standard mobile ARM CPUs without triggering memory pressure.
 */
export const MODEL_CATALOG: Record<string, ModelPreset> = {
  // Sizes and SHA-256 are the Hugging Face LFS values (x-linked-size / x-linked-etag), checked 2026-10-29.
  'qwen2.5-0.5b-instruct': {
    id: 'qwen2.5-0.5b-instruct',
    name: 'Qwen 2.5 0.5B Instruct (Q4_K_M)',
    author: 'Alibaba Cloud',
    parameters: '0.5B',
    sizeBytes: 491_400_032,
    sizeMb: 469,
    minRamMb: 3000,
    role: 'chat',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
    expectedSha256: '74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: 'Fast everyday model: short answers, commands, summaries. Multilingual, including Hindi and Bengali.',
  },
  'qwen2.5-1.5b-instruct': {
    id: 'qwen2.5-1.5b-instruct',
    name: 'Qwen 2.5 1.5B Instruct (Q4_K_M)',
    author: 'Alibaba Cloud',
    parameters: '1.5B',
    sizeBytes: 1_117_320_736,
    sizeMb: 1066,
    minRamMb: 5500,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
    expectedSha256: '6a1a2eb6d15622bf3c96857206351ba97e1af16c30d7a74ee38970e434e9407e',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: 'Better reasoning and longer answers for phones with 6 GB RAM or more. Slower to start.',
  },
  'gemma-3-1b-it': {
    id: 'gemma-3-1b-it',
    name: 'Gemma 3 1B Instruct (Q4_K_M)',
    author: 'Google',
    parameters: '1B',
    sizeBytes: 806_058_240,
    sizeMb: 769,
    minRamMb: 4000,
    role: 'assistant',
    // ggml-org GGUF build; size and SHA-256 from the Hugging Face LFS record, checked 2026-10-30.
    downloadUrl: 'https://huggingface.co/ggml-org/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf',
    expectedSha256: '8ccc5cd1f1b3602548715ae25a66ed73fd5dc68a210412eea643eb20eb75a135',
    contextLength: 4096,
    license: 'Gemma Terms of Use',
    description: "Google's small Gemma model: warm, fluent replies and good instruction following.",
  },
};

export const DEFAULT_CHAT_MODEL_ID = 'qwen2.5-0.5b-instruct';

export const MODEL_PRESETS = Object.values(MODEL_CATALOG);

export function getModelPresetById(id: string): ModelPreset | undefined {
  return MODEL_CATALOG[id];
}

export function getRecommendedModelForDevice(totalRamMb: number): ModelPreset {
  return totalRamMb >= 5500 ? MODEL_CATALOG['qwen2.5-1.5b-instruct'] : MODEL_CATALOG['qwen2.5-0.5b-instruct'];
}

export const getRecommendedModel = getRecommendedModelForDevice;
