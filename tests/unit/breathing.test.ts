import { PATTERNS, breathAt, cycleSeconds } from '../../src/domain/wellbeing/breathing';

const box = PATTERNS.find((p) => p.id === 'box')!;
const calm = PATTERNS.find((p) => p.id === 'calm')!;

describe('breathing clock', () => {
  it('walks through the phases of a box breath', () => {
    expect(cycleSeconds(box)).toBe(16);
    expect(breathAt(box, 0)).toMatchObject({ cycle: 0, phase: 'inhale', secondsLeft: 4 });
    expect(breathAt(box, 4500)).toMatchObject({ phase: 'hold', secondsLeft: 4 });
    expect(breathAt(box, 12_000)).toMatchObject({ phase: 'rest' });
    expect(breathAt(box, 16_000)).toMatchObject({ cycle: 1, phase: 'inhale' });
  });

  it('skips phases with no time', () => {
    expect(breathAt(calm, 4000).phase).toBe('exhale');
    expect(breathAt(calm, 10_000)).toMatchObject({ cycle: 1, phase: 'inhale' });
  });
});
