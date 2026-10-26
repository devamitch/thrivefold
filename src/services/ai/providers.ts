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

import { env, pickGeminiKey, pickGroqKey, pickOpenRouterKey, isLocalOnly } from './env';

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiResponse {
  text: string;
  provider: 'gemini' | 'groq' | 'openrouter' | 'none';
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

/**
 * Validates a user-provided API key by executing a 1-token test ping.
 */
export async function testProviderKey(
  provider: 'gemini' | 'groq' | 'openrouter' | 'sarvam',
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
 * Ask the AI with automatic failover. Tries Gemini → Groq → OpenRouter.
 * Returns `{ provider: 'none' }` if all fail (never throws).
 */
export async function askAi(
  messages: AiMessage[],
  opts?: { systemPrompt?: string; preferredProvider?: 'gemini' | 'groq' | 'openrouter'; forceCloud?: boolean },
): Promise<AiResponse> {
  if (isLocalOnly() && !opts?.forceCloud) {
    return { text: '', provider: 'none', model: 'local_only' };
  }
  const system = opts?.systemPrompt;
  const providers = [askGemini, askGroq, askOpenRouter];

  // Move preferred provider to front
  if (opts?.preferredProvider === 'groq') {
    providers.splice(0, 0, providers.splice(1, 1)[0]);
  } else if (opts?.preferredProvider === 'openrouter') {
    providers.splice(0, 0, providers.splice(2, 1)[0]);
  }

  for (const provider of providers) {
    try {
      return await provider(messages, system);
    } catch {
      // try next
    }
  }
  return { text: '', provider: 'none', model: '' };
}

/**
 * Quick one-shot: user prompt → AI response text.
 */
export async function quickAsk(prompt: string, systemPrompt?: string): Promise<string> {
  const r = await askAi([{ role: 'user', content: prompt }], { systemPrompt });
  return r.text;
}
