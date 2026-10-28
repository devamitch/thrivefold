import { HOLD_MS, ROUND_MS, ROUNDS, isFinished, nextTarget, startGame, stepGame } from '../../src/domain/vision/fingerGame';

describe('finger count game', () => {
  it('never repeats the previous target', () => {
    for (let r = 0; r < 1; r += 0.05) expect(nextTarget(3, r)).not.toBe(3);
  });

  it('wins a round only after holding the right count', () => {
    let s = startGame(0, 0); // target 1
    s = stepGame(s, 1, 100, 0);
    expect(s.round).toBe(1);
    s = stepGame(s, 1, 100 + HOLD_MS, 0.5);
    expect(s.round).toBe(2);
    expect(s.score).toBe(1);
    expect(s.last).toBe('hit');
  });

  it('resets the hold when the count changes, and misses after the time limit', () => {
    let s = startGame(0, 0);
    s = stepGame(s, 1, 100, 0);
    s = stepGame(s, 2, 200, 0);
    expect(s.holdSince).toBeNull();
    s = stepGame(s, null, ROUND_MS, 0);
    expect(s.score).toBe(0);
    expect(s.last).toBe('miss');
  });

  it('finishes after the last round', () => {
    let s = startGame(0, 0);
    for (let i = 0; i < ROUNDS; i++) s = stepGame(s, null, (i + 1) * ROUND_MS, 0.3);
    expect(isFinished(s)).toBe(true);
  });
});

import { getPracticeMinuteBars } from '../../src/domain/analytics/dashboardAnalytics';

test('practice minutes are summed per local day', () => {
  const ref = new Date(2026, 9, 29, 12);
  const at = (d: number, h: number) => new Date(2026, 9, d, h).getTime();
  const bars = getPracticeMinuteBars(
    [
      { startedAt: at(29, 9), endedAt: at(29, 9) + 3 * 60000 },
      { startedAt: at(29, 10), endedAt: at(29, 10) + 2 * 60000 },
      { startedAt: at(27, 8), endedAt: at(27, 8) + 5 * 60000 },
    ],
    ref,
  );
  expect(bars).toHaveLength(7);
  expect(bars[6]).toMatchObject({ isToday: true, value: 5 });
  expect(bars[4].value).toBe(5);
  expect(bars[5].value).toBe(0);
});
