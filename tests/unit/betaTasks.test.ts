import { betaInsights, betaTasksFor } from '../../src/domain/beta/betaTasks';

const at = (d: number, h: number) => new Date(2026, 9, d, h).getTime();

describe('beta tasks', () => {
  it('gives three different tasks a day, stable through the day', () => {
    const a = betaTasksFor(new Date(2026, 9, 29, 8), []);
    const b = betaTasksFor(new Date(2026, 9, 29, 20), []);
    expect(a).toHaveLength(3);
    expect(new Set(a.map((t) => t.id)).size).toBe(3);
    expect(a.map((t) => t.id)).toEqual(b.map((t) => t.id));
  });

  it('marks a task done only by a session of its kind today', () => {
    const tasks = betaTasksFor(new Date(2026, 9, 29, 12), []);
    const kind = tasks[0].kinds[0];
    const today = betaTasksFor(new Date(2026, 9, 29, 12), [{ id: 'x', kind, startedAt: at(29, 9), endedAt: at(29, 9) + 60000, metrics: {} }]);
    expect(today[0].done).toBe(true);
    const yesterday = betaTasksFor(new Date(2026, 9, 29, 12), [{ id: 'y', kind, startedAt: at(28, 9), endedAt: at(28, 9) + 60000, metrics: {} }]);
    expect(yesterday[0].done).toBe(false);
  });

  it('summarises the last seven days', () => {
    const i = betaInsights(new Date(2026, 9, 29, 12), [
      { id: '1', kind: 'eye_pursuit', startedAt: at(29, 9), endedAt: at(29, 9) + 120000, metrics: { score: 80 } },
      { id: '2', kind: 'voice_practice', startedAt: at(27, 9), endedAt: at(27, 9) + 60000, metrics: { seconds: 14 } },
      { id: '3', kind: 'eye_pursuit', startedAt: at(10, 9), endedAt: at(10, 9) + 60000, metrics: { score: 99 } },
    ]);
    expect(i).toMatchObject({ sessions: 2, minutes: 3, bestPursuit: 80, longestHoldS: 14, activeDays: 2 });
  });
});
