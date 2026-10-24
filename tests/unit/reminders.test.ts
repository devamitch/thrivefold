import { inQuietHours, plannedReminders } from '../../src/domain/game/reminders';

const quiet = { enabled: true, start: '22:00', end: '07:00' };

test('quiet hours wrap past midnight', () => {
  expect(inQuietHours(23 * 60, '22:00', '07:00')).toBe(true);
  expect(inQuietHours(6 * 60, '22:00', '07:00')).toBe(true);
  expect(inQuietHours(8 * 60, '22:00', '07:00')).toBe(false);
});

test('one generic reminder per future part of the day with open quests', () => {
  const qs = [
    { category: 'movement', title: 'Movement break' },
    { category: 'sleep', title: 'Sleep wind-down plan' },
    { category: 'sleep', title: 'Sleep log' },
  ];
  const r = plannedReminders(qs, new Date(2026, 9, 25, 9, 0), quiet);
  expect(r.map((x) => x.part)).toEqual(['evening']);
  expect(r[0].body).toMatch(/2 small steps/);
  expect(r[0].body).not.toMatch(/sleep/i);
});

test('evening reminder is dropped when quiet hours start earlier', () => {
  const r = plannedReminders([{ category: 'sleep', title: 'Sleep log' }], new Date(2026, 9, 25, 9, 0), { enabled: true, start: '18:00', end: '07:00' });
  expect(r).toHaveLength(0);
});
