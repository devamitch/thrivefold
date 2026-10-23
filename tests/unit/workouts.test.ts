import { EXERCISES, PLANS, exerciseById, sessionsThisWeek, suggestNext, weightHistory, type WorkoutSession } from '../../src/domain/fitness/workouts';

const session = (over: Partial<WorkoutSession>): WorkoutSession => ({
  id: 'w1',
  planId: 'gym_full_a',
  date: '2026-10-20',
  startedAt: '2026-10-20T10:00:00Z',
  finishedAt: '2026-10-20T10:40:00Z',
  entries: [],
  painReported: false,
  ...over,
});
const item = { exerciseId: 'goblet_squat', sets: 3, target: 10, restSeconds: 90 };

describe('workouts', () => {
  test('every plan references real exercises with steps and safety notes', () => {
    for (const p of PLANS) for (const i of p.items) {
      const ex = exerciseById(i.exerciseId);
      expect(ex).toBeDefined();
      expect(ex!.steps.length).toBeGreaterThan(0);
      expect(ex!.safety.length).toBeGreaterThan(0);
    }
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
  });

  test('suggestions come only from logged sets', () => {
    expect(suggestNext('goblet_squat', item, []).kind).toBe('first_time');
    const all = session({ entries: [{ exerciseId: 'goblet_squat', sets: [10, 10, 10].map((v) => ({ value: v, weightKg: 12 })) }] });
    expect(suggestNext('goblet_squat', item, [all]).text).toContain('14.5 kg');
    const missed = session({ entries: [{ exerciseId: 'goblet_squat', sets: [{ value: 10 }, { value: 7 }] }] });
    expect(suggestNext('goblet_squat', item, [missed]).kind).toBe('repeat');
    const hurt = session({ ...all, painReported: true });
    expect(suggestNext('goblet_squat', item, [hurt]).kind).toBe('ease_off');
  });

  test('weekly count and weight history', () => {
    const a = session({ date: '2026-10-22', entries: [{ exerciseId: 'goblet_squat', sets: [{ value: 10, weightKg: 12 }] }] });
    const b = session({ date: '2026-10-10', entries: [{ exerciseId: 'goblet_squat', sets: [{ value: 10, weightKg: 10 }] }] });
    expect(sessionsThisWeek([a, b], '2026-10-23')).toBe(1);
    expect(weightHistory('goblet_squat', [a, b])).toEqual([{ date: '2026-10-10', kg: 10 }, { date: '2026-10-22', kg: 12 }]);
  });
});
