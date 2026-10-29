import { DESTINATIONS, keywordScore } from '../../src/domain/search/destinations';

const top = (q: string) => [...DESTINATIONS].sort((a, b) => keywordScore(q, b) - keywordScore(q, a))[0].route;

test('global search keyword ranking', () => {
  expect(top('prescription')).toBe('/(app)/health/documents');
  expect(top('pandal')).toBe('/(app)/outing');
  expect(top('eye games')).toBe('/(app)/beta-lab/eye-games');
  expect(top('water')).toBe('/(app)/health/nutrition');
  expect(keywordScore('', DESTINATIONS[0])).toBe(0);
});
