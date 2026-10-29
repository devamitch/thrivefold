import { longestPhonation, steadiness, wordAccuracy, wordsPerMinute } from '../../src/domain/voice/practice';

const run = (from: number, to: number, level: number, step = 100) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, k) => ({ at: from + k * step, level }));

describe('voice practice', () => {
  it('measures the longest held sound, bridging short dips', () => {
    const s = [...run(0, 3000, 5), { at: 3100, level: -1 }, ...run(3200, 5000, 5)];
    expect(longestPhonation(s)).toBe(5000);
    const broken = [...run(0, 2000, 5), ...run(2100, 3000, -1), ...run(3100, 4000, 5)];
    expect(longestPhonation(broken)).toBe(2000);
  });

  it('reports steadiness inside the loudness band', () => {
    const s = [...run(0, 1900, 5), ...run(2000, 2900, 9)];
    expect(steadiness(s, 4, 7)).toBe(67);
    expect(steadiness(run(0, 500, 5), 4, 7)).toBeNull();
  });

  it('scores words said in order and lists missed ones', () => {
    expect(wordAccuracy('Red lorry yellow lorry', 'red lorry yellow lorry').score).toBe(100);
    const r = wordAccuracy('She sells sea shells by the sea shore', 'she sells shells by the shore');
    expect(r.score).toBe(75);
    expect(r.missed).toEqual(['sea', 'sea']);
  });

  it('computes words per minute', () => {
    expect(wordsPerMinute('one two three four five six', 3000)).toBe(120);
    expect(wordsPerMinute('hi', 500)).toBeNull();
  });
});

import { levelFromDbfs, noteName, pitchSteadiness } from '../../src/domain/voice/practice';

test('pitch helpers', () => {
  expect(noteName(440)).toBe('A4');
  expect(noteName(220)).toBe('A3');
  expect(noteName(0)).toBeNull();
  const steady = pitchSteadiness(new Array(20).fill(220));
  expect(steady).toEqual({ medianHz: 220, spreadCents: 0 });
  const wobbly = pitchSteadiness(Array.from({ length: 20 }, (_, i) => (i % 2 ? 233 : 208)));
  expect(wobbly!.spreadCents).toBeGreaterThan(90);
  expect(pitchSteadiness([220, 0, 0])).toBeNull();
  expect(levelFromDbfs(-55)).toBe(0);
  expect(levelFromDbfs(-15)).toBe(10);
});
