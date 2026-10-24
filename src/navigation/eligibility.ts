import type { RootState } from '../stores/rootTypes';

/**
 * Private correspondence (spec §6): only for people whose social path is open AND whose age
 * was checked by a real age-assurance provider. Self-entered birthdays never qualify. Until
 * a provider exists, nobody qualifies, so the feature stays out of sight and out of reach.
 */
export const canUseCorrespondence = (s: Pick<RootState, 'isSocialPathRevealed' | 'user'>): boolean =>
  Boolean(s.isSocialPathRevealed && s.user?.isAgeVerified);
