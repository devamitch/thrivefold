import { FACE_ROUTINE, averageMeasures, initialRep, measureFace, movement, stepRep } from '../../src/domain/vision/faceExercises';

/** A synthetic face array: 118 points at 0.5,0.5 with the measured ones placed. */
function face(over: Record<number, [number, number]>): number[] {
  const f = new Array(236).fill(0.5);
  const base: Record<number, [number, number]> = {
    0: [0.3, 0.4], 8: [0.42, 0.4], 12: [0.36, 0.38], 4: [0.36, 0.42],
    16: [0.7, 0.4], 24: [0.58, 0.4], 28: [0.64, 0.38], 20: [0.64, 0.42],
    32: [0.36, 0.4], 37: [0.64, 0.4], 44: [0.36, 0.32], 54: [0.64, 0.32],
    62: [0.4, 0.62], 72: [0.6, 0.62], 77: [0.5, 0.6], 67: [0.5, 0.64],
  };
  for (const [k, [x, y]] of Object.entries({ ...base, ...over })) {
    f[Number(k) * 2] = x;
    f[Number(k) * 2 + 1] = y;
  }
  return f;
}

const neutral = measureFace(face({}))!;

describe('face exercises', () => {
  it('returns null without enough points', () => {
    expect(measureFace([1, 2, 3])).toBeNull();
  });

  it('measures a centred gaze near 0.5 on both eyes', () => {
    expect(neutral.gaze).toBeCloseTo(0.5, 2);
  });

  it('sees a brow lift and a wider smile as positive movement', () => {
    const lifted = measureFace(face({ 44: [0.36, 0.28], 54: [0.64, 0.28] }))!;
    expect(movement('brow', lifted, neutral)).toBeGreaterThan(0.12);
    const smile = measureFace(face({ 62: [0.37, 0.62], 72: [0.63, 0.62] }))!;
    expect(movement('smile', smile, neutral)).toBeGreaterThan(0.1);
  });

  it('moves gaze the same way on both eyes', () => {
    const left = measureFace(face({ 32: [0.33, 0.4], 37: [0.61, 0.4] }))!;
    expect(movement('gazeLeft', left, neutral)).toBeGreaterThan(0.12);
    expect(movement('gazeRight', left, neutral)).toBeLessThan(0);
  });

  it('counts a rep only after the hold, and again only after returning', () => {
    const ex = FACE_ROUTINE.find((e) => e.id === 'brow')!;
    let s = initialRep();
    s = stepRep(s, ex, 0.2, 0);
    s = stepRep(s, ex, 0.2, ex.holdMs);
    expect(s.reps).toBe(1);
    s = stepRep(s, ex, 0.2, ex.holdMs * 3);
    expect(s.reps).toBe(1);
    s = stepRep(s, ex, 0.01, ex.holdMs * 4);
    s = stepRep(s, ex, 0.2, ex.holdMs * 5);
    s = stepRep(s, ex, 0.2, ex.holdMs * 6);
    expect(s.reps).toBe(2);
  });

  it('averages calibration samples', () => {
    expect(averageMeasures([])).toBeNull();
    expect(averageMeasures([neutral, neutral])!.smile).toBeCloseTo(neutral.smile);
  });
});

import { pursuitScore } from '../../src/domain/vision/faceExercises';

test('pursuit score is high when gaze follows the target and low when it does not', () => {
  const follow = Array.from({ length: 120 }, (_, i) => ({ target: Math.sin(i / 10), gaze: 0.5 + 0.1 * Math.sin(i / 10) }));
  expect(pursuitScore(follow)).toBeGreaterThan(95);
  const still = Array.from({ length: 120 }, (_, i) => ({ target: Math.sin(i / 10), gaze: 0.5 + 0.01 * Math.cos(i / 3) }));
  expect(pursuitScore(still)!).toBeLessThan(40);
  expect(pursuitScore(follow.slice(0, 10))).toBeNull();
});
