import { searchFoods, totals } from '../../src/domain/nutrition/foods';

test('meal totals add servings of each food', () => {
  const t = totals([
    { foodId: 'roti', servings: 2 },
    { foodId: 'dal', servings: 1 },
    { foodId: 'unknown', servings: 3 },
  ]);
  expect(t).toEqual({ kcal: 470, protein: 20, carbs: 68, fat: 12.4 });
});

test('search matches names', () => {
  expect(searchFoods('paneer').map((f) => f.id)).toEqual(['paneer']);
  expect(searchFoods('').length).toBeGreaterThan(40);
});
