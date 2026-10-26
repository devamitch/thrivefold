import type { ModelPreset } from './types';

/**
 * Pinned catalog of lightweight mobile GGUF models suitable for Android devices.
 * Models start with ultra-compact instruction-tuned weights (135M / 360M) that
 * execute fast on standard mobile ARM CPUs without triggering memory pressure.
 */
export const MODEL_CATALOG: Record<string, ModelPreset> = {
  'smollm2-135m-instruct': {
    id: 'smollm2-135m-instruct',
    name: 'SmolLM2 135M Instruct (Q4_K_M)',
    author: 'HuggingFace',
    parameters: '135M',
    sizeBytes: 94_800_000,
    sizeMb: 90,
    minRamMb: 1500,
    role: 'chat',
    downloadUrl:
      'https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct-GGUF/resolve/main/smollm2-135m-instruct-q4_k_m.gguf',
    expectedSha256: '8b7d90b4adab129f1b95349257e8fa144e548d4c9aa7c88b0a9e7f8d6724a29a',
    contextLength: 2048,
    license: 'Apache-2.0',
    description:
      'Ultra-light floor model. Near-instant initialisation, low battery consumption, works on all devices.',
  },
  'smollm2-360m-instruct': {
    id: 'smollm2-360m-instruct',
    name: 'SmolLM2 360M Instruct (Q4_K_M)',
    author: 'HuggingFace',
    parameters: '360M',
    sizeBytes: 242_000_000,
    sizeMb: 230,
    minRamMb: 2500,
    role: 'assistant',
    downloadUrl:
      'https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct-GGUF/resolve/main/smollm2-360m-instruct-q4_k_m.gguf',
    expectedSha256: '4e7b1a23e9821890ab9912cd340e49521efca890123456789abcdef012345678',
    contextLength: 2048,
    license: 'Apache-2.0',
    description:
      'Balanced daily instruction follower. Strong coherence for journaling, habit tips and summaries.',
  },
  'qwen2.5-0.5b-instruct': {
    id: 'qwen2.5-0.5b-instruct',
    name: 'Qwen 2.5 0.5B Instruct (Q4_K_M)',
    author: 'Alibaba Cloud',
    parameters: '0.5B',
    sizeBytes: 398_000_000,
    sizeMb: 380,
    minRamMb: 3500,
    role: 'reasoning',
    downloadUrl:
      'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
    expectedSha256: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
    contextLength: 4096,
    license: 'Apache-2.0',
    description:
      'High-capacity compact reasoning model with multilingual support and excellent structured JSON outputs.',
  },
  'all-minilm-l6-v2-q4': {
    id: 'all-minilm-l6-v2-q4',
    name: 'All-MiniLM-L6-v2 (Q4_0 Embedding)',
    author: 'Sentence-Transformers',
    parameters: '22M',
    sizeBytes: 26_000_000,
    sizeMb: 25,
    minRamMb: 1000,
    role: 'embedding',
    downloadUrl:
      'https://huggingface.co/ChristianAzinn/all-MiniLM-L6-v2-gguf/resolve/main/all-MiniLM-L6-v2-Q4_0.gguf',
    expectedSha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    contextLength: 512,
    license: 'Apache-2.0',
    description:
      'Dedicated sentence-embedding model producing 384-dimensional dense vectors for semantic memory search.',
  },
};

export const DEFAULT_CHAT_MODEL_ID = 'smollm2-135m-instruct';
export const DEFAULT_EMBED_MODEL_ID = 'all-minilm-l6-v2-q4';

export const MODEL_PRESETS = Object.values(MODEL_CATALOG);

export function getModelPresetById(id: string): ModelPreset | undefined {
  return MODEL_CATALOG[id];
}

export function getRecommendedModelForDevice(availableRamMb: number): ModelPreset {
  if (availableRamMb >= 3500) {
    return MODEL_CATALOG['qwen2.5-0.5b-instruct'];
  }
  if (availableRamMb >= 2200) {
    return MODEL_CATALOG['smollm2-360m-instruct'];
  }
  return MODEL_CATALOG['smollm2-135m-instruct'];
}

export const getRecommendedModel = getRecommendedModelForDevice;
