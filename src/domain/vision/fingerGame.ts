/**
 * Finger Count Challenge: the coach calls a number from 1 to 5 and the player shows that many
 * extended fingers. A round is won when the count is held steady for HOLD_MS; it is missed after
 * ROUND_MS. Pure and time-driven so it can be tested without a camera.
 */

export const ROUNDS = 8;
export const HOLD_MS = 700;
export const ROUND_MS = 8000;

export interface FingerGameState {
  round: number; // 1-based; > ROUNDS when finished
  target: number;
  score: number;
  roundStartedAt: number;
  holdSince: number | null;
  /** Reaction times (ms) of won rounds. */
  reactions: number[];
  last: 'hit' | 'miss' | null;
}

/** Next target, never the same number twice in a row. `rand` in [0, 1). */
export function nextTarget(prev: number, rand: number): number {
  const options = [1, 2, 3, 4, 5].filter((n) => n !== prev);
  return options[Math.min(options.length - 1, Math.floor(rand * options.length))];
}

export function startGame(now: number, rand: number): FingerGameState {
  return { round: 1, target: nextTarget(0, rand), score: 0, roundStartedAt: now, holdSince: null, reactions: [], last: null };
}

export const isFinished = (s: FingerGameState) => s.round > ROUNDS;

/** Advance with one hand reading (`fingers` null when no hand is in view). */
export function stepGame(s: FingerGameState, fingers: number | null, now: number, rand: number): FingerGameState {
  if (isFinished(s)) return s;
  const advance = (hit: boolean): FingerGameState => ({
    round: s.round + 1,
    target: nextTarget(s.target, rand),
    score: s.score + (hit ? 1 : 0),
    roundStartedAt: now,
    holdSince: null,
    reactions: hit ? [...s.reactions, now - s.roundStartedAt] : s.reactions,
    last: hit ? 'hit' : 'miss',
  });

  if (fingers === s.target) {
    const holdSince = s.holdSince ?? now;
    if (now - holdSince >= HOLD_MS) return advance(true);
    if (s.holdSince === null) return { ...s, holdSince };
  } else if (s.holdSince !== null) {
    return { ...s, holdSince: null };
  }
  if (now - s.roundStartedAt >= ROUND_MS) return advance(false);
  return s;
}
