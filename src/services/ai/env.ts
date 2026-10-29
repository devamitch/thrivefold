/**
 * Typed environment config — single import for all API keys.
 *
 * Only public values (Supabase URL and publishable key) come from `process.env.EXPO_PUBLIC_*`.
 * Provider keys are never bundled; see the comment on the providers block.
 *
 * Usage:
 *   import { env } from '@/services/ai/env';
 *   const key = env.GEMINI_API_KEY;
 */

export const env = Object.freeze({
  // ── Supabase ──
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '',

  // ── AI providers, voice, search, memory ──
  // Never read from the build environment: EXPO_PUBLIC_* values are copied into the app bundle,
  // where anyone can extract them. Server keys live only in Supabase Edge Function secrets; a
  // person's own key (BYOK) comes from secure storage at runtime.
  GEMINI_API_KEY: '',
  GEMINI_API_KEY_2: '',
  GROQ_API_KEY: '',
  GROQ_API_KEY_2: '',
  OPENROUTER_API_KEY: '',
  CLAUDE_API_KEY: '',
  SARVAM_API_KEY: '',
  SARVAM_API_KEY_2: '',
  ELEVENLABS_API_KEY: '',
  DEEPGRAM_API_KEY: '',
  COHERE_API_KEY: '',
  VOYAGE_API_KEY: '',
  EXA_API_KEY: '',
  MEM0_API_KEY: '',

  // ── Device Testing Override ──
  ENABLE_ALL_FEATURES: process.env.EXPO_PUBLIC_ENABLE_ALL_FEATURES === 'true',
});

export interface UserApiKeys {
  gemini?: string;
  groq?: string;
  openrouter?: string;
  claude?: string;
  sarvam?: string;
  elevenlabs?: string;
}

export type AiDeliveryMode = 'local_only' | 'byok' | 'hybrid';

let runtimeUserKeys: UserApiKeys = {};
let runtimeDeliveryMode: AiDeliveryMode = 'local_only';

export function setRuntimeUserKeys(keys: UserApiKeys, mode?: AiDeliveryMode) {
  runtimeUserKeys = { ...keys };
  if (mode) runtimeDeliveryMode = mode;
}

function getUserKeys(): UserApiKeys {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    const storeKeys = useRootStore.getState()?.userApiKeys;
    if (storeKeys && Object.keys(storeKeys).length > 0) return storeKeys;
  } catch {
    // not inside store context (e.g. unit test or early boot)
  }
  return runtimeUserKeys;
}

export function getAiDeliveryMode(): AiDeliveryMode {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    const storeMode = useRootStore.getState()?.aiDeliveryMode;
    if (storeMode) return storeMode;
  } catch {
    // not inside store context
  }
  return runtimeDeliveryMode;
}

export function isLocalOnly(): boolean {
  return getAiDeliveryMode() === 'local_only';
}

/** True when at least one AI provider is configured and not blocked by local-only mode. */
export function hasAiKeys(): boolean {
  if (isLocalOnly()) return false;
  const userKeys = getUserKeys();
  return !!(
    userKeys.gemini ||
    userKeys.groq ||
    userKeys.openrouter ||
    userKeys.claude ||
    env.GEMINI_API_KEY ||
    env.GROQ_API_KEY ||
    env.OPENROUTER_API_KEY ||
    env.CLAUDE_API_KEY
  );
}

/** Pick Gemini key (User BYOK key takes precedence over build env). */
export function pickGeminiKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.gemini) return userKeys.gemini;
  if (isLocalOnly()) return '';
  return env.GEMINI_API_KEY || env.GEMINI_API_KEY_2;
}

/** Pick Groq key (User BYOK key takes precedence over build env). */
export function pickGroqKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.groq) return userKeys.groq;
  if (isLocalOnly()) return '';
  return env.GROQ_API_KEY || env.GROQ_API_KEY_2;
}

/** Pick OpenRouter key (User BYOK key takes precedence over build env). */
export function pickOpenRouterKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.openrouter) return userKeys.openrouter;
  if (isLocalOnly()) return '';
  return env.OPENROUTER_API_KEY;
}

/** Pick Claude key (User BYOK key takes precedence over build env). */
export function pickClaudeKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.claude) return userKeys.claude;
  if (isLocalOnly()) return '';
  return env.CLAUDE_API_KEY;
}

/** Pick Sarvam key (User BYOK key takes precedence over build env). */
export function pickSarvamKey(): string {
  const userKeys = getUserKeys();
  if (userKeys.sarvam) return userKeys.sarvam;
  if (isLocalOnly()) return '';
  return env.SARVAM_API_KEY || env.SARVAM_API_KEY_2;
}
