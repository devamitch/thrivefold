/**
 * Eye game rounds (BlinkQuest style): a ball moves to the left or right and the player looks at it
 * with the eyes only, or the coach asks for two blinks. Judged from face landmarks against the
 * player's own calibrated neutral; pure and time-driven for tests.
 */
import { movement, type FaceMeasures } from './faceExercises';

export type EyeRound = 'left' | 'right' | 'blink';

export const GAME_ROUNDS: EyeRound[] = ['left', 'right', 'blink', 'right', 'left', 'blink', 'left', 'right'];
export const ROUND_LIMIT_MS = 8000;
const GAZE_ENTER = 0.1;
const GAZE_HOLD_MS = 500;

export interface RoundState {
  startedAt: number;
  gazeSince: number | null;
  blinks: number;
  closed: boolean;
  done: boolean;
  completedAt: number | null;
}

export const newRound = (now: number): RoundState => ({ startedAt: now, gazeSince: null, blinks: 0, closed: false, done: false, completedAt: null });

/** Advance one round with a face frame. */
export function stepRound(r: RoundState, round: EyeRound, m: FaceMeasures, neutral: FaceMeasures, now: number): RoundState {
  if (r.done) return r;
  if (round === 'blink') {
    const open = m.eyeOpen / neutral.eyeOpen;
    if (!r.closed && open < 0.55) return { ...r, closed: true };
    if (r.closed && open > 0.8) {
      const blinks = r.blinks + 1;
      return blinks >= 2 ? { ...r, closed: false, blinks, done: true, completedAt: now } : { ...r, closed: false, blinks };
    }
    return r;
  }
  const v = movement(round === 'left' ? 'gazeLeft' : 'gazeRight', m, neutral);
  if (v >= GAZE_ENTER) {
    const since = r.gazeSince ?? now;
    if (now - since >= GAZE_HOLD_MS) return { ...r, gazeSince: since, done: true, completedAt: now };
    return r.gazeSince === null ? { ...r, gazeSince: since } : r;
  }
  return r.gazeSince === null ? r : { ...r, gazeSince: null };
}

export const timedOut = (r: RoundState, now: number) => !r.done && now - r.startedAt >= ROUND_LIMIT_MS;

/** 0–100: completed rounds, with faster completions worth a little more. */
export function gameScore(results: { done: boolean; ms: number }[]): number {
  if (results.length === 0) return 0;
  const pts = results.reduce((n, r) => n + (r.done ? 70 + 30 * Math.max(0, 1 - r.ms / ROUND_LIMIT_MS) : 0), 0);
  return Math.round(pts / results.length);
}
