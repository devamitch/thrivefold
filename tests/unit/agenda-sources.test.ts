import { generateDayAgenda } from '../../src/domain/calendar/universalCalendarEngine';

test('the day agenda shows the real saved workouts, meals, check-ins and quests for that date only', () => {
  const day = '2026-10-25';
  const events = generateDayAgenda(day, {
    experience: 'men_health',
    workouts: [
      { id: 'w1', date: day, title: 'Home strength basics', startedAt: '2026-10-25T06:30:00', minutes: 20, verification: 'camera' },
      { id: 'w2', date: '2026-10-24', title: 'Squats', startedAt: '2026-10-24T21:00:00', minutes: 1, verification: 'manual' },
    ],
    meals: [{ id: 'm1', date: day, type: 'breakfast', at: '2026-10-25T08:00:00', kcal: 350, protein: 20 }],
    checkIns: [{ date: day, energy: 6, mood: 7, stress: 4, sleepHours: 7 }],
    quests: [{ id: 'a1', title: 'Take a short movement break', date: day, status: 'verified' }],
  });
  const ids = events.map((e) => e.id);
  expect(ids).toEqual(expect.arrayContaining(['w1', 'm1', 'checkin_2026-10-25', 'a1']));
  expect(ids).not.toContain('w2');
  expect(events.find((e) => e.id === 'w1')!.description).toMatch(/camera-checked/);
  expect(events.find((e) => e.id === 'a1')!.status).toBe('completed');
  // A man's calendar never contains cycle entries.
  expect(events.some((e) => e.category === 'reproductive')).toBe(false);
});
