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

test('cycle phase is estimated per date, not today repeated', () => {
  const cycleData = {
    lastPeriodDate: '2026-10-01',
    cycleLengthDays: 28,
    periodLengthDays: 5,
    currentPhase: 'follicular',
    estimatedNextPeriodDate: '2026-10-29',
    periodHistory: [],
  } as never;
  const phase = (d: string) =>
    generateDayAgenda(d, { experience: 'women_health', cycleData }).find((e) => e.kind === 'cycle_phase')?.title;
  expect(phase('2026-10-02')).toMatch(/^Menstrual/);
  expect(phase('2026-10-22')).toMatch(/^Luteal/);
});

test('personal events repeat by their rule and never get an invented time', () => {
  const personalEvents = [
    { id: 'p1', title: 'Rent', date: '2026-01-05', category: 'financial', recurrence: 'monthly' },
    { id: 'p2', title: 'Physio', date: '2026-10-20', category: 'appointment', recurrence: 'weekly', time: '18:00' },
    { id: 'p3', title: 'Mum', date: '1960-03-14', category: 'birthday', recurrence: 'yearly' },
  ] as never;
  const ids = (d: string) => generateDayAgenda(d, { experience: 'men_health', personalEvents }).map((e) => e.id);
  expect(ids('2026-11-05')).toContain('p1');
  expect(ids('2025-12-05')).not.toContain('p1');
  expect(ids('2026-10-27')).toContain('p2');
  expect(ids('2027-03-14')).toContain('p3');
  const rent = generateDayAgenda('2026-11-05', { experience: 'men_health', personalEvents }).find((e) => e.id === 'p1')!;
  expect(rent.startTime).toBeUndefined();
  expect(rent.title).toBe('Rent');
});
