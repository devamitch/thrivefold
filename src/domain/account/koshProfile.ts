/**
 * Anvay Kosh profile: what the person tells Thrivefold about themselves, grouped by purpose.
 * Every field is typed in by the person (or confirmed from their Google account) and carries its
 * source. Nothing here is guessed from a name, face, location or behaviour.
 */

export type KoshSource = 'user' | 'google';

export interface KoshProfile {
  preferredName: string | null;
  phone: string | null;
  languages: string[];
  /** Medical or chosen restrictions, e.g. "no pork", "Jain", "no onion or garlic". */
  foodRestrictions: string[];
  allergies: string[];
  cuisines: string[];
  foodDislikes: string[];
  interests: string[];
  skills: string[];
  careerGoal: string | null;
  accessibility: { screenReader?: boolean; largeText?: boolean; voiceFirst?: boolean };
  fieldSources: Partial<Record<keyof Omit<KoshProfile, 'fieldSources'>, { source: KoshSource; at: string }>>;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string | null;
}

export const EMPTY_KOSH: KoshProfile = {
  preferredName: null,
  phone: null,
  languages: [],
  foodRestrictions: [],
  allergies: [],
  cuisines: [],
  foodDislikes: [],
  interests: [],
  skills: [],
  careerGoal: null,
  accessibility: {},
  fieldSources: {},
};

export const PHONE_RE = /^\+?[0-9 ()-]{6,20}$/;

/** "a, b ,, c" → ["a", "b", "c"], trimmed, de-duplicated (case-insensitive), capped. */
export function splitList(text: string, max = 20): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/[,\n]/)) {
    const v = raw.trim().slice(0, 60);
    if (!v || seen.has(v.toLowerCase())) continue;
    seen.add(v.toLowerCase());
    out.push(v);
    if (out.length >= max) break;
  }
  return out;
}

const empty = (v: unknown) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);

/**
 * Fills fields that are empty in `local` from `remote`, never replacing what the person already
 * has on this phone. Returns the merged profile and which fields came from `remote`.
 */
export function mergeKosh(local: KoshProfile, remote: Partial<KoshProfile>): { merged: KoshProfile; filled: string[] } {
  const merged: KoshProfile = { ...local, accessibility: { ...remote.accessibility, ...local.accessibility }, fieldSources: { ...remote.fieldSources, ...local.fieldSources } };
  const filled: string[] = [];
  for (const k of Object.keys(EMPTY_KOSH) as (keyof KoshProfile)[]) {
    if (k === 'accessibility' || k === 'fieldSources') continue;
    if (empty(local[k]) && !empty(remote[k])) {
      (merged as unknown as Record<string, unknown>)[k] = remote[k];
      filled.push(k);
    }
  }
  return { merged, filled };
}

/** Share of the profile's main fields that are filled, 0–100. */
export function koshCompleteness(p: KoshProfile, contacts: number): number {
  const checks = [
    !!p.preferredName,
    !!p.phone,
    p.languages.length > 0,
    p.foodRestrictions.length + p.cuisines.length > 0,
    p.allergies.length > 0 || p.fieldSources.allergies !== undefined,
    p.interests.length > 0,
    !!p.careerGoal || p.skills.length > 0,
    contacts > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
