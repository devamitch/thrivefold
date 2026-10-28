/**
 * Meal photo → foods and macros with a cloud vision model, only when the person asks.
 *
 * Route, in order:
 * 1. `server`: signed in → Thrivefold's `meal-vision` function, which holds the provider keys,
 *    caps daily use and stores nothing. No key is on the phone.
 * 2. `byok`: the person's own Gemini key from Settings → AI keys, called directly.
 * Otherwise the reason is returned so the screen can offer sign-in or keys.
 *
 * The photo is downscaled first, sent once and not kept by Thrivefold. Foods the model matches to
 * the food table come back with table servings; the rest are estimates the person reviews.
 */
import * as FileSystem from 'expo-file-system/legacy';

import { resizeForUpload } from '../../../modules/pose-landmarker/food';
import { parseEstimate, type EstimatedFood } from '../../domain/nutrition/estimate';
import { FOODS } from '../../domain/nutrition/foods';
import { useRootStore } from '../../stores/useRootStore';
import { supabase } from '../supabase/supabaseClient';
import { isLocalOnly, pickGeminiKey } from './env';

export type { EstimatedFood };

export type PhotoAiRoute =
  | { route: 'server' | 'byok' }
  | { route: null; reason: string; action: 'sign_in' | 'keys' | null };

const KNOWN_IDS: ReadonlySet<string> = new Set(FOODS.map((f) => f.id));
const CATALOG = FOODS.map((f) => ({ id: f.id, name: f.name, serving: f.serving }));

const userGeminiKey = () =>
  (useRootStore.getState() as unknown as { userApiKeys?: { gemini?: string } }).userApiKeys?.gemini ??
  '';

export async function photoAiRoute(): Promise<PhotoAiRoute> {
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) return { route: 'server' };
    } catch {
      // fall through to the person's own key
    }
  }
  if (userGeminiKey() || (!isLocalOnly() && pickGeminiKey())) return { route: 'byok' };
  return {
    route: null,
    reason: supabase
      ? 'Sign in to analyse photos with Thrivefold AI, or add your own Gemini key.'
      : 'Add your own Gemini key in AI keys to analyse photos.',
    action: supabase ? 'sign_in' : 'keys',
  };
}

const PROMPT = `You are a careful nutrition assistant. Identify each distinct food or drink in this meal photo, including Indian dishes, estimate the portion shown and its nutrition.
If an item matches one of these food-table entries set "catalogId" and "servings" (0.5 steps):
${CATALOG.map((c) => `${c.id}: ${c.name} (${c.serving})`).join('\n')}
Hints (may be wrong): {hints}
Return ONLY JSON: {"items":[{"name":string,"catalogId":string|null,"servings":number|null,"serving":string,"kcal":number,"protein":number,"carbs":number,"fat":number,"confidence":number}]}. If no food is visible return {"items":[]}.`;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

async function viaServer(image: string, hints: string[]): Promise<string> {
  if (!supabase) throw new Error('not_configured');
  const { data, error } = await withTimeout(
    supabase.functions.invoke('meal-vision', { body: { image, hints, catalog: CATALOG } }),
    40_000,
  );
  if (error) {
    const ctx = (error as { context?: Response }).context;
    let code = '';
    try {
      code = ctx ? (((await ctx.json()) as { error?: string }).error ?? '') : '';
    } catch {
      // not JSON
    }
    throw new Error(code || error.message);
  }
  return (data as { raw?: string }).raw ?? '';
}

async function viaOwnKey(image: string, hints: string[]): Promise<string> {
  const key = userGeminiKey() || pickGeminiKey();
  const res = await withTimeout(
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: PROMPT.replace('{hints}', hints.join(', ') || 'none') },
              { inline_data: { mime_type: 'image/jpeg', data: image } },
            ],
          },
        ],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
    }),
    40_000,
  );
  if (!res.ok) throw new Error(res.status === 429 ? 'daily_limit' : 'unavailable');
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
}

export async function analyzeMealPhoto(
  photoUri: string,
  hints: string[],
): Promise<{ items: EstimatedFood[]; route: 'server' | 'byok' } | { error: string }> {
  const route = await photoAiRoute();
  if (!route.route) return { error: route.reason };
  try {
    const small = await resizeForUpload(photoUri, 1280);
    const image = await FileSystem.readAsStringAsync(small, { encoding: FileSystem.EncodingType.Base64 });
    if (small !== photoUri) FileSystem.deleteAsync(small, { idempotent: true }).catch(() => undefined);
    const raw = route.route === 'server' ? await viaServer(image, hints) : await viaOwnKey(image, hints);
    return { items: parseEstimate(raw, KNOWN_IDS), route: route.route };
  } catch (e) {
    const m = e instanceof Error ? e.message : '';
    return {
      error: m.includes('daily_limit')
        ? 'That’s today’s AI limit. It resets tomorrow; you can still add foods yourself.'
        : m.includes('not_authenticated')
          ? 'Your sign-in expired. Sign in again to analyse photos.'
          : m.includes('timeout')
            ? 'The AI took too long. Check your connection and try again.'
            : m.includes('invalid_image')
              ? 'That photo could not be read. Try another one.'
              : 'Could not analyse this photo right now. You can still add foods yourself.',
    };
  }
}
