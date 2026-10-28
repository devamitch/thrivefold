/**
 * Photo → foods and macros with a cloud vision model (Gemini), only when the person asks.
 *
 * The photo leaves the phone only on an explicit tap, only with a configured key and cloud AI
 * permission, and is not stored by Thrivefold. The result is an estimate the person reviews
 * item by item; nothing is saved without their confirmation.
 */
import * as FileSystem from 'expo-file-system/legacy';

import { useRootStore } from '../../stores/useRootStore';
import { checkCloudAiPermission } from './aiInteractionStore';
import { isLocalOnly, pickGeminiKey } from './env';
import { parseEstimate, type EstimatedFood } from '../../domain/nutrition/estimate';

export type { EstimatedFood };

export type PhotoAiAvailability = { ok: true } | { ok: false; reason: string };

export function photoAiAvailability(): PhotoAiAvailability {
  if (isLocalOnly()) return { ok: false, reason: 'AI is set to on-device only.' };
  if (!pickGeminiKey()) return { ok: false, reason: 'Add a Gemini key in Settings → AI keys to analyse photos.' };
  const st = useRootStore.getState() as unknown as {
    adultConfirmedAt?: string | null;
    isOnboarded?: boolean;
    userApiKeys?: Record<string, string | undefined>;
  };
  const perm = checkCloudAiPermission({
    isGuest: !st.adultConfirmedAt && !st.isOnboarded,
    hasByok: Boolean(st.userApiKeys?.gemini),
  });
  return perm.allowed ? { ok: true } : { ok: false, reason: perm.reason ?? 'Cloud AI is not available.' };
}

const PROMPT = `You are a nutrition assistant. Identify each distinct food or drink visible in this meal photo.
For each, estimate the portion shown and typical nutrition for that portion.
Hints from an on-device classifier and the user (may be wrong): {hints}
Return ONLY JSON: {"items":[{"name":string,"serving":string,"kcal":number,"protein":number,"carbs":number,"fat":number,"confidence":number}]}
Use grams in "serving" when you can. If no food is visible return {"items":[]}.`;

export async function analyzeMealPhoto(
  photoUri: string,
  hints: string[],
  timeoutMs = 25_000,
): Promise<{ items: EstimatedFood[] } | { error: string }> {
  const avail = photoAiAvailability();
  if (!avail.ok) return { error: avail.reason };
  const key = pickGeminiKey();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const data = await FileSystem.readAsStringAsync(photoUri, { encoding: FileSystem.EncodingType.Base64 });
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: PROMPT.replace('{hints}', hints.join(', ') || 'none') },
                { inline_data: { mime_type: 'image/jpeg', data } },
              ],
            },
          ],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
        }),
      },
    );
    if (!res.ok) return { error: res.status === 429 ? 'AI limit reached. Try again later.' : 'The AI service could not analyse this photo.' };
    const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    return { items: parseEstimate(text) };
  } catch (e) {
    return {
      error: (e as Error)?.name === 'AbortError' ? 'The AI took too long. Check your connection and try again.' : 'Could not reach the AI service. You can still add foods yourself.',
    };
  } finally {
    clearTimeout(timer);
  }
}
