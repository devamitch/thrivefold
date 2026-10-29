// Thrivefold document reader (Supabase Edge Function, Deno): reads a photo of a prescription, a
// dietitian's food chart or a trainer's workout plan into structured lines the person checks.
//
//   POST /doc-reader  signed-in user
//   body {"image": "<base64 JPEG>", "kind": "prescription" | "diet_chart" | "workout_plan"}
//
// * Transcribes only what is written. It never adds advice, doses, substitutions or diagnoses.
// * The photo is sent to one provider for this request and never stored; nothing is logged.
// * Keys live only in function secrets; shares the per-person daily AI cap.

import { createClient } from 'npm:@supabase/supabase-js@2';

const env = (k: string) => Deno.env.get(k) ?? '';
const DAILY_LIMIT = Number(env('AI_DAILY_LIMIT') || 40);
const MAX_IMAGE_B64 = 2_500_000;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const PROMPTS: Record<string, string> = {
  prescription: `Transcribe this medical prescription exactly as written. Do not add, infer or correct any medicine, dose or instruction.
Return JSON: {"doctor": string|null, "date": string|null, "medicines": [{"name": string, "strength": string|null, "form": string|null, "dose": string|null, "frequency": string|null, "timing": string|null, "duration": string|null, "unclear": boolean}], "followUp": string|null, "notes": string|null}.
Set "unclear": true for any line you cannot read with confidence. If this is not a prescription, return {"medicines": [], "notes": "not a prescription"}.`,
  diet_chart: `Transcribe this diet chart or meal plan exactly as written by the dietitian. Do not add foods or quantities.
Return JSON: {"by": string|null, "meals": [{"time": string|null, "label": string, "items": [string]}], "avoid": [string], "notes": string|null}.`,
  workout_plan: `Transcribe this workout plan exactly as written by the trainer. Do not add exercises, sets or loads.
Return JSON: {"by": string|null, "days": [{"day": string, "exercises": [{"name": string, "sets": string|null, "reps": string|null, "load": string|null, "rest": string|null}]}], "notes": string|null}.`,
};

async function gemini(image: string, text: string): Promise<string | null> {
  const key = env('GEMINI_API_KEY');
  if (!key) return null;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env('GEMINI_VISION_MODEL') || env('GEMINI_MODEL') || 'gemini-3.8-flash'}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text }, { inline_data: { mime_type: 'image/jpeg', data: image } }] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json', maxOutputTokens: 3000 },
      }),
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('').trim() || null;
}

async function openrouter(image: string, text: string): Promise<string | null> {
  const key = env('OPENROUTER_API_KEY');
  if (!key) return null;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, 'HTTP-Referer': 'https://thrivefold.app', 'X-Title': 'Thrivefold' },
    body: JSON.stringify({
      model: env('OPENROUTER_VISION_MODEL') || 'openai/gpt-4o-mini',
      temperature: 0,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: [{ type: 'text', text }, { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } }] }],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content as string | undefined)?.trim() || null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'not_authenticated' }, 401);
  const userClient = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { auth: { persistSession: false } });
  const { data: auth, error: authError } = await userClient.auth.getUser(token);
  if (authError || !auth.user) return json({ error: 'not_authenticated' }, 401);

  let body: { image?: string; kind?: string } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }
  const kind = body.kind && PROMPTS[body.kind] ? body.kind : null;
  const image = typeof body.image === 'string' ? body.image : '';
  if (!kind || !image || image.length > MAX_IMAGE_B64 || !/^[A-Za-z0-9+/=]+$/.test(image.slice(0, 200))) {
    return json({ error: 'invalid_request' }, 400);
  }

  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
  const { data: count, error: countError } = await admin.rpc('tf_ai_count', { p_user: auth.user.id, p_provider: 'doc_reader' });
  if (countError) return json({ error: 'server_error' }, 500);
  if ((count as number) > DAILY_LIMIT) return json({ error: 'daily_limit' }, 429);

  for (const run of [gemini, openrouter]) {
    try {
      const raw = await run(image, PROMPTS[kind]);
      if (!raw) continue;
      const parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, ''));
      return json({ kind, result: parsed });
    } catch {
      // try the next provider
    }
  }
  return json({ error: 'unavailable' }, 502);
});
