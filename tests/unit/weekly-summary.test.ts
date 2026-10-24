import { finishedWeeks, weekStartOf, weeklySummary } from '../../src/domain/sync/weeklySummary';

const data = {
  checkIns: [
    { date: '2026-10-13', energy: 6, mood: 7, stress: 4, sleepHours: 7, notes: 'private', symptoms: ['x'] },
    { date: '2026-10-15', energy: 4, mood: 5, stress: 6, sleepHours: 6 },
  ],
  workouts: [{ date: '2026-10-14', startedAt: '2026-10-14T07:00:00Z', finishedAt: '2026-10-14T07:30:00Z' }],
  activities: [{ date: '2026-10-16', minutes: 20 }],
  poseSessions: [{ date: '2026-10-14' }],
  ledger: [
    { kind: 'task_reward', xp: 15, gameDate: '2026-10-13' },
    { kind: 'workout_reward', xp: 50, gameDate: '2026-10-14' },
    { kind: 'unlock_spend', xp: 0, gameDate: '2026-10-14' },
  ],
};

test('weeks start on Monday', () => {
  expect(weekStartOf('2026-10-15')).toBe('2026-10-12');
  expect(weekStartOf('2026-10-12')).toBe('2026-10-12');
  expect(weekStartOf('2026-10-18')).toBe('2026-10-12');
});

test('summary holds averages and counts only', () => {
  const s = weeklySummary('2026-10-12', data);
  expect(s).toEqual({
    weekStart: '2026-10-12',
    checkIns: 2,
    avgEnergy: 5,
    avgMood: 6,
    avgStress: 5,
    avgSleepHours: 6.5,
    questsDone: 1,
    workouts: 1,
    activeMinutes: 50,
    formCheckedSessions: 1,
    xpEarned: 65,
  });
  expect(JSON.stringify(s)).not.toMatch(/private|symptom/);
});

test('only finished weeks with activity are offered', () => {
  const weeks = finishedWeeks('2026-10-25', data);
  expect(weeks.map((w) => w.weekStart)).toEqual(['2026-10-12']);
  expect(finishedWeeks('2026-10-15', data)).toHaveLength(0);
});
