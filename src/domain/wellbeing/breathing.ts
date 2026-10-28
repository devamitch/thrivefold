/** Paced-breathing patterns and a pure phase clock, so the screen and tests agree on timing. */

export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export interface BreathPattern {
  id: 'box' | 'calm' | 'coherent';
  name: string;
  note: string;
  /** Seconds per phase, in order; 0 skips the phase. */
  phases: Record<BreathPhase, number>;
}

export const PATTERNS: BreathPattern[] = [
  { id: 'calm', name: 'Calm 4 · 6', note: 'Longer out-breath to settle', phases: { inhale: 4, hold: 0, exhale: 6, rest: 0 } },
  { id: 'box', name: 'Box 4 · 4 · 4 · 4', note: 'Even and steady', phases: { inhale: 4, hold: 4, exhale: 4, rest: 4 } },
  { id: 'coherent', name: 'Even 5 · 5', note: 'About six breaths a minute', phases: { inhale: 5, hold: 0, exhale: 5, rest: 0 } },
];

const ORDER: BreathPhase[] = ['inhale', 'hold', 'exhale', 'rest'];

export const cycleSeconds = (p: BreathPattern) => ORDER.reduce((a, k) => a + p.phases[k], 0);

/** Where `elapsedMs` falls: cycle index (0-based), phase, and seconds left in that phase. */
export function breathAt(p: BreathPattern, elapsedMs: number): { cycle: number; phase: BreathPhase; secondsLeft: number; phaseLength: number } {
  const total = cycleSeconds(p) * 1000;
  const cycle = Math.floor(elapsedMs / total);
  let t = elapsedMs - cycle * total;
  for (const k of ORDER) {
    const len = p.phases[k] * 1000;
    if (len === 0) continue;
    if (t < len) return { cycle, phase: k, secondsLeft: Math.ceil((len - t) / 1000), phaseLength: p.phases[k] };
    t -= len;
  }
  return { cycle: cycle + 1, phase: 'inhale', secondsLeft: p.phases.inhale, phaseLength: p.phases.inhale };
}
