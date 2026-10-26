/**
 * Typed environment config — single import for all API keys.
 *
 * Every key reads from `process.env.EXPO_PUBLIC_*` which Expo injects at
 * build time from `.env.local`. Keys are never hardcoded.
 *
 * Usage:
 *   import { env } from '@/services/ai/env';
 *   const key = env.GEMINI_API_KEY;
 */

export const env = Object.freeze({
  // ── Supabase ──
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '',

  // ── AI providers ──
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '',
  GEMINI_API_KEY_2: process.env.EXPO_PUBLIC_GEMINI_API_KEY_2 ?? '',
  GROQ_API_KEY: process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '',
  GROQ_API_KEY_2: process.env.EXPO_PUBLIC_GROQ_API_KEY_2 ?? '',
  OPENROUTER_API_KEY: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ?? '',

  // ── Voice & Speech ──
  SARVAM_API_KEY: process.env.EXPO_PUBLIC_SARVAM_API_KEY ?? '',
  SARVAM_API_KEY_2: process.env.EXPO_PUBLIC_SARVAM_API_KEY_2 ?? '',
  ELEVENLABS_API_KEY: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ?? '',
  DEEPGRAM_API_KEY: process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY ?? '',

  // ── Search & Embeddings ──
  COHERE_API_KEY: process.env.EXPO_PUBLIC_COHERE_API_KEY ?? '',
  VOYAGE_API_KEY: process.env.EXPO_PUBLIC_VOYAGE_API_KEY ?? '',
  EXA_API_KEY: process.env.EXPO_PUBLIC_EXA_API_KEY ?? '',

  // ── Memory / RAG ──
  MEM0_API_KEY: process.env.EXPO_PUBLIC_MEM0_API_KEY ?? '',

  // ── Device Testing Override ──
  ENABLE_ALL_FEATURES: process.env.EXPO_PUBLIC_ENABLE_ALL_FEATURES === 'true',
});

/** True when at least one AI provider is configured. */
export function hasAiKeys(): boolean {
  return !!(env.GEMINI_API_KEY || env.GROQ_API_KEY || env.OPENROUTER_API_KEY);
}

/** Pick the first available key from a preferred order. */
export function pickGeminiKey(): string {
  return env.GEMINI_API_KEY || env.GEMINI_API_KEY_2;
}

export function pickGroqKey(): string {
  return env.GROQ_API_KEY || env.GROQ_API_KEY_2;
}
