import type { RootState } from '../stores/rootTypes';

/**
 * Private correspondence (spec §6): only for people whose social path is open AND whose age
 * was confirmed by the age-check provider (server-set, mirrored from tf_my_age_check).
 * Self-entered birthdays never qualify. The server re-checks every letter regardless.
 */
export const canUseCorrespondence = (s: Pick<RootState, 'isSocialPathRevealed' | 'user'>): boolean =>
  Boolean(s.isSocialPathRevealed && s.user?.isAgeVerified);

/** Dating (spec §18): same adult gate as correspondence; the server adds level 20 and its rules. */
export const canUseDating = canUseCorrespondence;
