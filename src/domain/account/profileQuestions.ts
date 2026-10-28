/**
 * Asks for one missing profile detail at a time, at most once a day, so the profile grows
 * without a long form. Only details that make the app's own features work better are asked:
 * birthday (to restore the account on a new phone), height and weight (BMI, calorie estimates),
 * eating style (meal ideas) and routine length (quest fit). "Not now" waits a week.
 */

export type ProfileQuestion = 'birthday' | 'height' | 'weight' | 'diet' | 'routine';

export interface ProfileState {
  signedIn: boolean;
  birthDate: string | null | undefined;
  heightCm: number | null;
  weightKg: number | null;
  diet: string | null;
  routineMinutes: number | null;
  /** When each question may be asked again (ms), after "Not now". */
  snoozedUntil: Partial<Record<ProfileQuestion, number>>;
  /** When any question was last shown (ms). */
  lastAskedAt: number | null;
}

const ORDER: ProfileQuestion[] = ['birthday', 'height', 'weight', 'diet', 'routine'];
export const SNOOZE_MS = 7 * 86_400_000;
const DAY_MS = 86_400_000;

export function missing(q: ProfileQuestion, s: ProfileState): boolean {
  switch (q) {
    case 'birthday':
      return s.signedIn && !s.birthDate;
    case 'height':
      return !s.heightCm;
    case 'weight':
      return !s.weightKg;
    case 'diet':
      return !s.diet;
    case 'routine':
      return !s.routineMinutes;
  }
}

/** The question to show now, or null. A question already on screen today stays until answered. */
export function nextProfileQuestion(s: ProfileState, now: number, showingToday = false): ProfileQuestion | null {
  if (!showingToday && s.lastAskedAt !== null && now - s.lastAskedAt < DAY_MS) return null;
  return ORDER.find((q) => missing(q, s) && (s.snoozedUntil[q] ?? 0) <= now) ?? null;
}

/** Share of the five details filled in, 0–100. */
export function profileCompleteness(s: ProfileState): number {
  const relevant = ORDER.filter((q) => q !== 'birthday' || s.signedIn);
  return Math.round((relevant.filter((q) => !missing(q, s)).length / relevant.length) * 100);
}
