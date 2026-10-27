/**
 * Multi-provider AI chat service.
 *
 * Tries providers in priority order: Gemini → Groq → OpenRouter.
 * Each provider is a thin adapter over the respective REST API.
 * Falls back to the next provider if the current one fails.
 *
 * These run client-side for on-device intelligence. Heavy inference
 * (long context, embeddings) should go through Supabase edge functions.
 */

import { env, pickGeminiKey, pickGroqKey, pickOpenRouterKey, pickClaudeKey, isLocalOnly } from './env';
import { recordAiInteraction, checkCloudAiPermission } from './aiInteractionStore';

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiResponse {
  text: string;
  provider: 'gemini' | 'groq' | 'openrouter' | 'claude' | 'none';
  model: string;
}

// ── Gemini ──────────────────────────────────────────────────────────────────

async function askGemini(messages: AiMessage[], systemPrompt?: string): Promise<AiResponse> {
  const key = pickGeminiKey();
  if (!key) throw new Error('no_gemini_key');

  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = { contents };
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`gemini_${res.status}`);
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return { text, provider: 'gemini', model };
}

// ── Groq ────────────────────────────────────────────────────────────────────

async function askGroq(messages: AiMessage[], systemPrompt?: string): Promise<AiResponse> {
  const key = pickGroqKey();
  if (!key) throw new Error('no_groq_key');

  const model = 'llama-3.3-70b-versatile';
  const allMessages: AiMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`groq_${res.status}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content ?? '';
  return { text, provider: 'groq', model };
}

// ── OpenRouter ──────────────────────────────────────────────────────────────

async function askOpenRouter(messages: AiMessage[], systemPrompt?: string): Promise<AiResponse> {
  const key = pickOpenRouterKey();
  if (!key) throw new Error('no_openrouter_key');

  const model = 'google/gemini-2.0-flash-exp:free';
  const allMessages: AiMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'X-Title': 'Thrivefold',
    },
    body: JSON.stringify({
      model,
      messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 1024,
    }),
  });
  if (!res.ok) throw new Error(`openrouter_${res.status}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content ?? '';
  return { text, provider: 'openrouter', model };
}

// ── Claude (Anthropic) ──────────────────────────────────────────────────────

async function askClaude(messages: AiMessage[], systemPrompt?: string): Promise<AiResponse> {
  const key = pickClaudeKey();
  if (!key) throw new Error('no_claude_key');

  const model = 'claude-3-5-haiku-latest';
  const anthropicMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

  const body: Record<string, unknown> = {
    model,
    max_tokens: 1024,
    messages: anthropicMessages,
  };
  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`claude_${res.status}`);
  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = json.content?.[0]?.text ?? '';
  return { text, provider: 'claude', model };
}

/**
 * Validates a user-provided API key by executing a 1-token test ping.
 */
export async function testProviderKey(
  provider: 'gemini' | 'groq' | 'openrouter' | 'claude' | 'sarvam',
  key: string,
): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const start = Date.now();
  const trimmed = key.trim();
  if (!trimmed) {
    return { ok: false, message: 'Key cannot be empty', latencyMs: 0 };
  }

  try {
    if (provider === 'gemini') {
      const model = 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmed}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
          generationConfig: { maxOutputTokens: 2 },
        }),
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status} (Check key permissions)`, latencyMs: latency };
      }
      return { ok: true, message: `Connected (${latency}ms)`, latencyMs: latency };
    }

    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${trimmed}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 2,
        }),
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status} (Invalid key)`, latencyMs: latency };
      }
      return { ok: true, message: `Connected (${latency}ms)`, latencyMs: latency };
    }

    if (provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${trimmed}` },
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status}`, latencyMs: latency };
      }
      return { ok: true, message: `Valid key (${latency}ms)`, latencyMs: latency };
    }

    if (provider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': trimmed,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-latest',
          max_tokens: 2,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status}`, latencyMs: latency };
      }
      return { ok: true, message: `Connected (${latency}ms)`, latencyMs: latency };
    }

    if (provider === 'sarvam') {
      const res = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'api-subscription-key': trimmed,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: ['hi'],
          target_language_code: 'en-IN',
          speaker: 'shubh',
        }),
      });
      const latency = Date.now() - start;
      if (!res.ok) {
        return { ok: false, message: `API Error ${res.status}`, latencyMs: latency };
      }
      return { ok: true, message: `Connected (${latency}ms)`, latencyMs: latency };
    }

    return { ok: false, message: 'Unknown provider', latencyMs: 0 };
  } catch (err) {
    const latency = Date.now() - start;
    return { ok: false, message: err instanceof Error ? err.message : 'Network failure', latencyMs: latency };
  }
}


// ── Cascade: try each provider in order ─────────────────────────────────────

/**
 * Ask the AI with automatic failover. Tries Gemini → Groq → OpenRouter → Claude.
 * Returns `{ provider: 'none' }` if all fail (never throws).
 * Saves input & output in local SQLite and Supabase.
 * Respects tier limits (guests blocked; non-BYOK registered users capped).
 */
export async function askAi(
  messages: AiMessage[],
  opts?: {
    systemPrompt?: string;
    preferredProvider?: 'gemini' | 'groq' | 'openrouter' | 'claude';
    forceCloud?: boolean;
    userId?: string;
  },
): Promise<AiResponse> {
  if (isLocalOnly() && !opts?.forceCloud) {
    return { text: '', provider: 'none', model: 'local_only' };
  }

  // Quota and permission check:
  // Guests: 0 cloud access allowed (handled on-device).
  // Non-BYOK registered users: strictly limited trial.
  // BYOK users: unlimited.
  let isGuest = true;
  let hasByok = false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRootStore } = require('../../stores/useRootStore');
    const st = useRootStore.getState?.();
    if (st) {
      isGuest = !st.adultConfirmedAt && !st.isOnboarded;
      const k = st.userApiKeys ?? {};
      hasByok = !!(k.gemini || k.groq || k.openrouter || k.claude || k.sarvam);
    }
  } catch {
    // ignore
  }

  const perm = checkCloudAiPermission({ isGuest, hasByok, userId: opts?.userId });
  if (!perm.allowed && !opts?.forceCloud) {
    return { text: '', provider: 'none', model: 'quota_exceeded' };
  }

  const system = opts?.systemPrompt;
  const providers = [askGemini, askGroq, askOpenRouter, askClaude];

  // Move preferred provider to front
  if (opts?.preferredProvider === 'groq') {
    providers.splice(0, 0, providers.splice(1, 1)[0]);
  } else if (opts?.preferredProvider === 'openrouter') {
    providers.splice(0, 0, providers.splice(2, 1)[0]);
  } else if (opts?.preferredProvider === 'claude') {
    providers.splice(0, 0, providers.splice(3, 1)[0]);
  }

  const promptText = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
  const t0 = Date.now();

  for (const provider of providers) {
    try {
      const res = await provider(messages, system);
      if (res.text) {
        // Record input and output in SQLite & Supabase
        recordAiInteraction({
          userId: opts?.userId,
          provider: res.provider,
          model: res.model,
          prompt: promptText,
          response: res.text,
          latencyMs: Date.now() - t0,
          status: 'success',
        }).catch(() => undefined);
        return res;
      }
    } catch {
      // try next
    }
  }

  recordAiInteraction({
    userId: opts?.userId,
    provider: 'none',
    model: 'none',
    prompt: promptText,
    response: '',
    latencyMs: Date.now() - t0,
    status: 'error',
  }).catch(() => undefined);

  return { text: '', provider: 'none', model: '' };
}

/**
 * Quick one-shot: user prompt → AI response text.
 */
export async function quickAsk(prompt: string, systemPrompt?: string): Promise<string> {
  const r = await askAi([{ role: 'user', content: prompt }], { systemPrompt });
  return r.text;
}
