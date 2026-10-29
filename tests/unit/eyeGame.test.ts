import { gameScore, newRound, stepRound, timedOut, ROUND_LIMIT_MS } from '../../src/domain/vision/eyeGame';

const neutral = { brow: 0.4, smile: 0.5, jaw: 0.1, eyeOpen: 0.3, gaze: 0.5 };

describe('eye game', () => {
  it('completes a look-left round after holding the gaze', () => {
    let r = newRound(0);
    const left = { ...neutral, gaze: 0.35 }; // front camera mirrored: looking left lowers the ratio
    r = stepRound(r, 'left', left, neutral, 100);
    expect(r.done).toBe(false);
    r = stepRound(r, 'left', left, neutral, 700);
    expect(r.done).toBe(true);
  });

  it('does not complete a right round when looking left', () => {
    let r = newRound(0);
    r = stepRound(r, 'right', { ...neutral, gaze: 0.35 }, neutral, 100);
    r = stepRound(r, 'right', { ...neutral, gaze: 0.35 }, neutral, 900);
    expect(r.done).toBe(false);
  });

  it('counts two blinks', () => {
    let r = newRound(0);
    for (const [open, t] of [[0.1, 100], [0.3, 200], [0.1, 300], [0.3, 400]] as const) r = stepRound(r, 'blink', { ...neutral, eyeOpen: open }, neutral, t);
    expect(r.done).toBe(true);
    expect(r.blinks).toBe(2);
  });

  it('times out and scores', () => {
    expect(timedOut(newRound(0), ROUND_LIMIT_MS)).toBe(true);
    expect(gameScore([{ done: true, ms: 0 }, { done: false, ms: ROUND_LIMIT_MS }])).toBe(50);
  });
});
