// Thrivefold cloud AI (Supabase Edge Function, Deno). Optional, consent-gated in the app.
//
//   POST /ai-chat   signed-in user, body {"messages": [{"role": "user"|"assistant", "content": "..."}]}
//
// * Keys live only in function secrets (GEMINI_API_KEY, GROQ_API_KEY, GROQ_API_KEY_2,
//   OPENROUTER_API_KEY); nothing is shipped in the app.
// * Providers are tried in order (Gemini, Groq, OpenRouter) until one answers.
// * Cost cap: DAILY_LIMIT requests per person per day, counted server-side. No content stored.
// * The model supports wellbeing; it never diagnoses, never decides eligibility, and points to
//   emergency help when someone may be at risk.

import { createClient } from 'npm:@supabase/supabase-js@2';

const env = (k: string) => Deno.env.get(k) ?? '';
const DAILY_LIMIT = Number(env('AI_DAILY_LIMIT') || 40);
const MAX_TURNS = 12;
const MAX_CHARS = 2000;

const SYSTEM = `You are Thrive, the supportive wellbeing companion inside the Thrivefold app.
Be warm, brief (under 120 words unless asked), practical and plain-spoken.
You help with habits, movement, sleep, stress, food routines, cycle tracking questions and reflection.
You are not a doctor or therapist: never diagnose, never prescribe or dose medication, and suggest seeing a clinician when symptoms are severe, new, or worrying.
If someone mentions self-harm, suicide, abuse or danger, respond with care, encourage contacting local emergency services or a crisis line now, and suggest a trusted person.
Never guess someone's religion, caste, sexuality, ethnicity or other sensitive traits. Never ask for contact details.`;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

type Msg = { role: 'user' | 'assistant'; content: string };

async function gemini(messages: Msg[]): Promise<string | null> {
  const key = env('GEMINI_API_KEY');
  if (!key) return null;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env('GEMINI_MODEL') || 'gemini-3.8-flash'}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { temperature: 0.6, maxOutputTokens: 1500 },
      }),
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('').trim() || null;
}

async function openAiCompatible(url: string, key: string, model: string, messages: Msg[], extra: Record<string, string> = {}) {
  if (!key) return null;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...extra },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: SYSTEM }, ...messages],
      temperature: 0.6,
      max_tokens: 1500,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content as string | undefined)?.trim() || null;
}

const PROVIDERS: { name: string; run: (m: Msg[]) => Promise<string | null> }[] = [
  { name: 'gemini', run: gemini },
  {
    name: 'groq',
    run: (m) => openAiCompatible('https://api.groq.com/openai/v1/chat/completions', env('GROQ_API_KEY'), env('GROQ_MODEL') || 'openai/gpt-oss-120b', m),
  },
  {
    name: 'groq_2',
    run: (m) => openAiCompatible('https://api.groq.com/openai/v1/chat/completions', env('GROQ_API_KEY_2'), env('GROQ_MODEL') || 'openai/gpt-oss-120b', m),
  },
  {
    name: 'openrouter',
    run: (m) =>
      openAiCompatible('https://openrouter.ai/api/v1/chat/completions', env('OPENROUTER_API_KEY'), env('OPENROUTER_MODEL') || 'openai/gpt-4o-mini', m, {
        'HTTP-Referer': 'https://thrivefold.app',
        'X-Title': 'Thrivefold',
      }),
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'not_authenticated' }, 401);
  const userClient = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { auth: { persistSession: false } });
  const { data: auth, error: authError } = await userClient.auth.getUser(token);
  if (authError || !auth.user) return json({ error: 'not_authenticated' }, 401);

  let body: { messages?: Msg[] } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') return json({ error: 'invalid_request' }, 400);

  // Count first, so a person over the cap never costs a provider call.
  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
  const { data: count, error: countError } = await admin.rpc('tf_ai_count', { p_user: auth.user.id, p_provider: null });
  if (countError) return json({ error: 'server_error' }, 500);
  if ((count as number) > DAILY_LIMIT) return json({ error: 'daily_limit' }, 429);
  for (const p of PROVIDERS) {
    let reply: string | null = null;
    try {
      reply = await p.run(messages);
    } catch {
      reply = null;
    }
    if (!reply) continue;
    return json({ reply, provider: p.name, remaining: Math.max(0, DAILY_LIMIT - (count as number)) });
  }
  return json({ error: 'unavailable' }, 503);
});
