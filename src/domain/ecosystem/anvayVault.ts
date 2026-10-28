/**
 * Anvay Vault merge rules (AnvayKosh shared profile). Pure; no network.
 *
 * Only basic, non-sensitive profile facts are shared. A merge fills fields that are empty on the
 * receiving side and never overwrites a value that is there. Placeholder names ("Guest",
 * "Friend", "You") count as empty. Every filled field records which app supplied it and when.
 */

export const VAULT_FIELDS = ['display_name', 'avatar_seed', 'photo_url', 'locale', 'time_zone'] as const;
export type VaultField = (typeof VAULT_FIELDS)[number];

export interface FieldSource {
  app: string;
  at: string;
}

export type VaultProfile = Partial<Record<VaultField, string | null>> & {
  sources?: Partial<Record<VaultField, FieldSource>>;
};

const PLACEHOLDER_NAMES = new Set(['guest', 'friend', 'you', 'user']);
const LIMITS: Record<VaultField, number> = {
  display_name: 60,
  avatar_seed: 60,
  photo_url: 500,
  locale: 20,
  time_zone: 60,
};

/** A usable value for the field, or null when it is missing, blank, a placeholder or malformed. */
export function usable(field: VaultField, value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (!v || v.length > LIMITS[field]) return null;
  if (field === 'display_name' && PLACEHOLDER_NAMES.has(v.toLowerCase())) return null;
  if (field === 'photo_url' && !/^https:\/\//i.test(v)) return null;
  return v;
}

/**
 * Fills `target`'s empty fields from `source`. Returns the merged profile and the fields filled.
 * `sourceApp` labels values that `source` itself has no recorded origin for.
 */
export function fillEmpty(
  target: VaultProfile,
  source: VaultProfile,
  sourceApp: string,
  at: string,
): { merged: VaultProfile; filled: VaultField[] } {
  const merged: VaultProfile = { ...target, sources: { ...(target.sources ?? {}) } };
  const filled: VaultField[] = [];
  for (const field of VAULT_FIELDS) {
    if (usable(field, target[field]) !== null) continue;
    const incoming = usable(field, source[field]);
    if (incoming === null) continue;
    merged[field] = incoming;
    merged.sources![field] = source.sources?.[field] ?? { app: sourceApp, at };
    filled.push(field);
  }
  return { merged, filled };
}
