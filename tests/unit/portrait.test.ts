import { analyseBody, analyseColours, analyseFace, analysePosture, bodyNumbers } from '../../src/domain/vision/portrait';

function mesh(pts: Record<number, [number, number]>): number[] {
  const f = new Array(478 * 3).fill(0.5);
  for (const [i, [x, y]] of Object.entries(pts)) {
    f[Number(i) * 3] = x;
    f[Number(i) * 3 + 1] = y;
  }
  return f;
}

const faceBase = {
  10: [0.5, 0.2], 152: [0.5, 0.8], 234: [0.3, 0.5], 454: [0.7, 0.5], 54: [0.33, 0.3], 284: [0.67, 0.3],
  172: [0.35, 0.7], 397: [0.65, 0.7], 468: [0.42, 0.42], 473: [0.58, 0.42], 469: [0.41, 0.42], 471: [0.43, 0.42],
  474: [0.57, 0.42], 476: [0.59, 0.42],
} as Record<number, [number, number]>;

describe('portrait analysis', () => {
  it('reads face proportions in pixels and recommends frames', () => {
    const r = analyseFace(mesh(faceBase), 1000, 1000)!;
    expect(r.ratios.length).toBeCloseTo(1.65, 1);
    expect(r.shape).toBe('oblong');
    expect(r.frames.length).toBeGreaterThan(0);
    expect(r.pdMm).toBe(Math.round((160 / 20) * 11.7) >= 50 && Math.round((160 / 20) * 11.7) <= 76 ? Math.round((160 / 20) * 11.7) : null);
  });

  it('calls a short, wide face with a wide jaw square', () => {
    const r = analyseFace(mesh({ ...faceBase, 10: [0.5, 0.3], 152: [0.5, 0.75], 172: [0.32, 0.7], 397: [0.68, 0.7] }), 1000, 1000)!;
    expect(r.shape).toBe('square');
  });

  it('refuses a face too small to judge', () => {
    expect(analyseFace(mesh({ ...faceBase, 234: [0.49, 0.5], 454: [0.51, 0.5] }), 1000, 1000)).toBeNull();
  });

  const pose = () => {
    const p = new Array(33 * 3).fill(0.9);
    const set = (i: number, x: number, y: number) => ((p[i * 3] = x), (p[i * 3 + 1] = y));
    set(0, 0.5, 0.15);
    set(11, 0.4, 0.3);
    set(12, 0.6, 0.3);
    set(23, 0.43, 0.55);
    set(24, 0.57, 0.55);
    return p;
  };

  it('finds wider shoulders from the width profile', () => {
    const widths = new Array(64).fill(0.2);
    for (let b = 19; b <= 22; b++) widths[b] = 0.3; // shoulders
    for (let b = 34; b <= 36; b++) widths[b] = 0.24; // hips
    expect(analyseBody(widths, pose())!.shape).toBe('shoulders_wider');
  });

  it('scores level posture high and a tilted one lower', () => {
    expect(analysePosture(pose(), 1000, 1000)!.score).toBe(100);
    const tilted = pose();
    tilted[12 * 3 + 1] = 0.36;
    expect(analysePosture(tilted, 1000, 1000)!.score).toBeLessThan(90);
  });

  it('pairs a neutral with anything, and flags competing colours', () => {
    expect(analyseColours([20, 20, 20], [200, 30, 30])!.pairing).toBe('neutral');
    expect(analyseColours([200, 30, 30], [30, 200, 30])!.score).toBeLessThan(70);
  });

  it('computes BMI and targets with sensible bounds', () => {
    const b = bodyNumbers(175, 70, 30, null)!;
    expect(b.bmi).toBeCloseTo(22.9, 1);
    expect(b.category).toBe('healthy');
    expect(b.energy!.low).toBeLessThan(b.energy!.high);
    expect(bodyNumbers(50, 70)).toBeNull();
  });
});
