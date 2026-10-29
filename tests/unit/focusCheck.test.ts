import { scoreFocusCheck } from '../../src/domain/wellbeing/focusCheck';

test('ASRS Part A scoring uses the shaded thresholds', () => {
  expect(scoreFocusCheck([2, 2, 2, 3, 3, 3])).toEqual({ answered: 6, inRange: 6, flagged: true });
  expect(scoreFocusCheck([2, 2, 2, 2, 2, 2])).toEqual({ answered: 6, inRange: 3, flagged: false });
  expect(scoreFocusCheck([1, 1, 1, 4, 4, 4])).toEqual({ answered: 6, inRange: 3, flagged: false });
  expect(scoreFocusCheck([2, 2, null, 3, 3, 3])).toBeNull();
});
