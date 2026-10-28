import { activeCalories } from '../../src/domain/activity/calories';

const base = { date: '2026-10-28', steps: null, weightKg: null, activityLogs: [], workoutSessions: [] };

describe('active calories (estimates)', () => {
  it('estimates from steps, scaled by weight, and flags an assumed weight', () => {
    const r = activeCalories({ ...base, steps: 5000 });
    expect(r.fromSteps).toBe(200);
    expect(r.weightAssumed).toBe(true);
    expect(activeCalories({ ...base, steps: 5000, weightKg: 84 }).fromSteps).toBe(240);
  });

  it('counts a home dumbbell workout by duration', () => {
    const r = activeCalories({
      ...base,
      weightKg: 70,
      workoutSessions: [{ date: '2026-10-28', startedAt: '2026-10-28T07:00:00Z', finishedAt: '2026-10-28T07:30:00Z' }],
    });
    expect(r.fromWorkouts).toBe(175); // 5 MET x 70 kg x 0.5 h
  });

  it('does not count a logged walk twice when the phone counted the steps', () => {
    const logs = [{ date: '2026-10-28', type: 'Walking', minutes: 30 }, { date: '2026-10-28', type: 'Swimming', minutes: 30 }];
    const withSteps = activeCalories({ ...base, weightKg: 70, steps: 3000, activityLogs: logs });
    expect(withSteps.fromActivities).toBe(245); // swimming only: 7 x 70 x 0.5
    const noSteps = activeCalories({ ...base, weightKg: 70, activityLogs: logs });
    expect(noSteps.fromActivities).toBe(368); // walking 122.5 + swimming 245
  });

  it('ignores other days', () => {
    expect(activeCalories({ ...base, activityLogs: [{ date: '2026-10-27', type: 'Running', minutes: 60 }] }).total).toBe(0);
  });
});
