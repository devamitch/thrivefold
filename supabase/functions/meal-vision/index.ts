// Thrivefold meal photo → foods and macros (Supabase Edge Function, Deno).
//
//   POST /meal-vision   signed-in user
//   body {"image": "<base64 JPEG>", "hints": ["banana", ...], "catalog": [{"id","name","serving"}]}
//
// * The photo is sent to one provider for this request and never stored; no content is logged.
// * Keys live only in function secrets (GEMINI_API_KEY, OPENROUTER_API_KEY).
// * Shares the per-person daily cap with ai-chat (thrivefold_ai_usage), counted before any call.
// * The model maps foods to the app's food table when it can, so those use table values; anything
//   else comes back as an estimate the person reviews before saving.

import { createClient } from 'npm:@supabase/supabase-js@2';

const env = (k: string) => Deno.env.get(k) ?? '';
const DAILY_LIMIT = Number(env('AI_DAILY_LIMIT') || 40);
const MAX_IMAGE_B64 = 2_500_000; // ~1.8 MB JPEG

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

type CatalogEntry = { id: string; name: string; serving: string };

const prompt = (hints: string[], catalog: CatalogEntry[]) => `You are a careful nutrition assistant.
Identify every distinct food and drink visible in this meal photo, including Indian dishes.
For each item estimate the portion actually shown and its nutrition for that portion.
If an item matches one of these food-table entries, set "catalogId" to its id and "servings" to how many of that entry's serving are shown (0.5 steps):
${catalog.map((c) => `${c.id}: ${c.name} (${c.serving})`).join('\n')}
Hints from an on-device classifier and the user (may be wrong): ${hints.join(', ') || 'none'}
Return ONLY JSON:
{"items":[{"name":string,"catalogId":string|null,"servings":number|null,"serving":string,"grams":number|null,"kcal":number,"protein":number,"carbs":number,"fat":number,"confidence":number}]}
"serving" describes the portion (e.g. "1 bowl, ~200 g"). confidence is 0-1. If no food is visible return {"items":[]}.`;

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
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json', maxOutputTokens: 2000 },
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
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://thrivefold.app',
      'X-Title': 'Thrivefold',
    },
    body: JSON.stringify({
      model: env('OPENROUTER_VISION_MODEL') || 'openai/gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content as string | undefined)?.trim() || null;
}

const PROVIDERS = [
  { name: 'gemini', run: gemini },
  { name: 'openrouter', run: openrouter },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'not_authenticated' }, 401);
  const userClient = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { auth: { persistSession: false } });
  const { data: auth, error: authError } = await userClient.auth.getUser(token);
  if (authError || !auth.user) return json({ error: 'not_authenticated' }, 401);

  let body: { image?: string; hints?: unknown; catalog?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }
  const image = typeof body.image === 'string' ? body.image : '';
  if (!image || image.length > MAX_IMAGE_B64 || !/^[A-Za-z0-9+/=]+$/.test(image.slice(0, 200))) {
    return json({ error: 'invalid_image' }, 400);
  }
  const hints = (Array.isArray(body.hints) ? body.hints : [])
    .filter((h): h is string => typeof h === 'string')
    .map((h) => h.slice(0, 60))
    .slice(0, 6);
  const catalog = (Array.isArray(body.catalog) ? body.catalog : [])
    .filter(
      (c): c is CatalogEntry =>
        !!c && typeof c === 'object' && typeof (c as CatalogEntry).id === 'string' && typeof (c as CatalogEntry).name === 'string',
    )
    .slice(0, 120)
    .map((c) => ({ id: c.id.slice(0, 40), name: c.name.slice(0, 60), serving: String(c.serving ?? '').slice(0, 40) }));

  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
  const { data: count, error: countError } = await admin.rpc('tf_ai_count', { p_user: auth.user.id, p_provider: 'meal_vision' });
  if (countError) return json({ error: 'server_error' }, 500);
  if ((count as number) > DAILY_LIMIT) return json({ error: 'daily_limit' }, 429);

  const text = prompt(hints, catalog);
  for (const p of PROVIDERS) {
    let raw: string | null = null;
    try {
      raw = await p.run(image, text);
    } catch {
      raw = null;
    }
    if (!raw) continue;
    return json({ raw, provider: p.name, remaining: Math.max(0, DAILY_LIMIT - (count as number)) });
  }
  return json({ error: 'unavailable' }, 503);
});
