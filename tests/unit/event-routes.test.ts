import { routeForEvent } from '../../src/navigation/eventRoutes';

const base = { title: 'x', date: '2026-10-25', status: 'recorded', category: 'health', privacy: 'private' } as const;

test('calendar items open their real records', () => {
  expect(routeForEvent({ ...base, id: 'w1', kind: 'exercise', metadata: { workoutId: 'w1' } })).toBe('/(app)/train/session/w1');
  expect(routeForEvent({ ...base, id: 'm1', kind: 'habit', metadata: { mealId: 'm1' } })).toBe('/(app)/health/meal/m1');
  expect(routeForEvent({ ...base, id: 'checkin_2026-10-25', kind: 'habit' })).toBe('/(app)/health/history');
  expect(routeForEvent({ ...base, id: 'p', kind: 'period' })).toBe('/(app)/health/cycle');
  expect(routeForEvent({ ...base, id: 'asg_1', kind: 'task' })).toBeNull();
});
