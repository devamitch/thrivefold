import { EXERCISES, PLANS, exerciseById, sessionsThisWeek, suggestNext, suggestPlans, weightHistory, type WorkoutSession } from '../../src/domain/fitness/workouts';

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

describe('exercise library breadth and activity minutes', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const w = require('../../src/domain/fitness/workouts');
  test('covers strength, cardio, HIIT, yoga, Pilates, balance, seated and stretch plans', () => {
    const settings = new Set(w.PLANS.map((p: { setting: string }) => p.setting));
    for (const s of ['home', 'gym', 'cardio', 'hiit', 'yoga', 'pilates', 'balance', 'seated', 'recovery', 'desk']) {
      expect(settings.has(s)).toBe(true);
    }
  });
  test('weekly active minutes add plan sessions and logged activities', () => {
    const sessions = [{ date: '2026-10-22', startedAt: '2026-10-22T10:00:00Z', finishedAt: '2026-10-22T10:30:00Z' }];
    const activities = [
      { id: 'a', type: 'Running', date: '2026-10-23', minutes: 25 },
      { id: 'b', type: 'Cycling', date: '2026-10-01', minutes: 60 },
    ];
    expect(w.activeMinutesThisWeek(sessions, activities, '2026-10-23')).toBe(55);
    expect(w.activitiesThisWeek(activities, '2026-10-23')).toBe(1);
  });
});

describe('plan suggestions', () => {
  const base = { constraints: [] as string[], sessions: [], today: '2026-10-24' };
  test('rest day suggests recovery only', () => {
    const s = suggestPlans({ ...base, capacity: 'strong', restDay: true });
    expect(s.length).toBeGreaterThan(0);
    s.forEach((x) => expect(x.plan.setting).toBe('recovery'));
  });
  test('gentle never suggests intermediate plans; joint limits drop HIIT', () => {
    suggestPlans({ ...base, capacity: 'gentle', restDay: false }).forEach((x) => expect(x.plan.level).toBe('beginner'));
    const strongKnees = suggestPlans({ ...base, capacity: 'strong', restDay: false, constraints: ['Knees or joints'] });
    strongKnees.forEach((x) => expect(x.plan.setting).not.toBe('hiit'));
  });
  test('desk sitters get the desk reset first', () => {
    expect(suggestPlans({ ...base, capacity: 'steady', restDay: false, constraints: ['Mostly sitting all day'] })[0].plan.id).toBe('desk_reset');
  });
});
