/**
 * Best guess of a medicine's name and strength from the text on its strip or box (read on the
 * phone). Only a suggestion: the person checks both fields before saving; nothing is guessed when
 * the text has no clear candidate.
 */
const STRENGTH = /\b(\d+(?:\.\d+)?)\s?(mg|mcg|µg|g|ml|iu|%)\b/i;
const NOISE = /\b(tablets?|capsules?|ip|bp|usp|mfg|mfd|exp|batch|b\.?\s?no|lic|store|keep|rx|only|schedule|warning|composition|each|contains|film|coated|manufactured|marketed|by|ltd|pvt|limited|price|mrp|incl|taxes)\b/i;

export interface LabelGuess {
  name: string | null;
  strength: string | null;
}

export function parseMedicineLabel(text: string): LabelGuess {
  const lines = text
    .split('\n')
    .map((l) => l.replace(/[^\p{L}\p{N}\s.%/-]/gu, ' ').replace(/\s+/g, ' ').trim())
    .filter((l) => l.length >= 3);
  const strengthMatch = text.match(STRENGTH);
  const strength = strengthMatch ? `${strengthMatch[1]} ${strengthMatch[2].toLowerCase()}` : null;
  // Brand names are usually a short line of mostly letters near the top, often in capitals.
  const candidates = lines
    .filter((l) => /\p{L}{3,}/u.test(l) && !NOISE.test(l) && l.split(' ').length <= 4)
    .map((l, i) => {
      const letters = (l.match(/\p{L}/gu) ?? []).length;
      const upper = (l.match(/\p{Lu}/gu) ?? []).length;
      return { l, score: letters / l.length + (upper / Math.max(letters, 1)) * 0.5 - i * 0.05 + (STRENGTH.test(l) ? 0.3 : 0) };
    })
    .sort((a, b) => b.score - a.score);
  const best = candidates[0]?.l.replace(STRENGTH, '').trim();
  const name = best && best.length >= 3 ? best.replace(/\b\p{L}+/gu, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()) : null;
  return { name, strength };
}
