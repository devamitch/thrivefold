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
  // Added 2026-10-30; sizes and SHA-256 from the Hugging Face LFS records (tree API), same day.
  'qwen3-0.6b': {
    id: 'qwen3-0.6b',
    name: 'Qwen 3 0.6B (Q4_K_M)',
    author: 'Alibaba Cloud',
    parameters: '0.6B',
    sizeBytes: 396_705_472,
    sizeMb: 378,
    minRamMb: 3000,
    role: 'chat',
    downloadUrl: 'https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_K_M.gguf',
    expectedSha256: 'ac2d97712095a558e31573f62f466a3f9d93990898b0ec79d7c974c1780d524a',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: 'Newest tiny Qwen: quicker and smarter than Qwen 2.5 0.5B for its size. Thinking mode is turned off for speed.',
  },
  'qwen3-1.7b': {
    id: 'qwen3-1.7b',
    name: 'Qwen 3 1.7B (Q4_K_M)',
    author: 'Alibaba Cloud',
    parameters: '1.7B',
    sizeBytes: 1_107_409_472,
    sizeMb: 1056,
    minRamMb: 5500,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf',
    expectedSha256: 'b139949c5bd74937ad8ed8c8cf3d9ffb1e99c866c823204dc42c0d91fa181897',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: 'Strong small all-rounder for 6 GB phones: plans, explanations and multilingual replies.',
  },
  'llama-3.2-1b-instruct': {
    id: 'llama-3.2-1b-instruct',
    name: 'Llama 3.2 1B Instruct (Q4_K_M)',
    author: 'Meta',
    parameters: '1B',
    sizeBytes: 807_694_464,
    sizeMb: 770,
    minRamMb: 4000,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    expectedSha256: '6f85a640a97cf2bf5b8e764087b1e83da0fdb51d7c9fab7d0fece9385611df83',
    contextLength: 4096,
    license: 'Llama 3.2 Community License',
    description: "Meta's small model built for phones: good at summaries and following instructions.",
  },
  'lfm2-1.2b': {
    id: 'lfm2-1.2b',
    name: 'LFM2 1.2B (Q4_K_M)',
    author: 'Liquid AI',
    parameters: '1.2B',
    sizeBytes: 730_893_248,
    sizeMb: 697,
    minRamMb: 4000,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/LiquidAI/LFM2-1.2B-GGUF/resolve/main/LFM2-1.2B-Q4_K_M.gguf',
    expectedSha256: '55175400e3f509a9616227afeffd58d87e80b9f628a5d3d54ada884d85221fed',
    contextLength: 4096,
    license: 'LFM Open License v1.0',
    description: 'Designed for on-device speed: fast first word on phone CPUs. Good for RAG answers over your notes.',
    needsNewerRuntime: true,
  },
  'gemma-4-e2b-it': {
    id: 'gemma-4-e2b-it',
    name: 'Gemma 4 E2B Instruct (Q4_0)',
    author: 'Google',
    parameters: 'E2B (2B effective)',
    sizeBytes: 2_841_481_184,
    sizeMb: 2710,
    minRamMb: 6000,
    role: 'assistant',
    downloadUrl: 'https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF/resolve/main/gemma-4-E2B-it-Q4_0.gguf',
    expectedSha256: '8e30dff3ac4c8434c49a7036fa15564bdbb6044e42bf04550bf1a096ad7e6a52',
    contextLength: 4096,
    license: 'Apache-2.0',
    description: "Google's newest phone-sized Gemma: the best answers here, but a large download and slower on mid-range phones.",
    needsNewerRuntime: true,
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
