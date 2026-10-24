import { bestDayPart, dayPartAt, splitByTime } from '../../src/domain/game/timeOfDay';

const at = (h: number) => new Date(2026, 9, 25, h, 0, 0);

test('day parts', () => {
  expect(dayPartAt(at(7))).toBe('morning');
  expect(dayPartAt(at(13))).toBe('midday');
  expect(dayPartAt(at(19))).toBe('evening');
  expect(dayPartAt(at(23))).toBe('night');
});

test('wording and family decide the best time', () => {
  expect(bestDayPart({ category: 'sleep', title: 'Sleep wind-down plan' })).toBe('evening');
  expect(bestDayPart({ category: 'movement', title: 'Movement break' })).toBe('morning');
  expect(bestDayPart({ category: 'nutrition', title: 'Balanced meal plan' })).toBe('midday');
});

test('morning shows morning quests now and keeps evening ones for later; night shows all', () => {
  const qs = [
    { category: 'movement', title: 'Movement break' },
    { category: 'sleep', title: 'Sleep wind-down plan' },
  ];
  const morning = splitByTime(qs, at(8));
  expect(morning.now.map((q) => q.title)).toEqual(['Movement break']);
  expect(morning.later[0].part).toBe('evening');
  expect(splitByTime(qs, at(23)).now).toHaveLength(2);
});
