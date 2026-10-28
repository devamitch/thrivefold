import { foodSuggestions } from '../../src/domain/nutrition/foodLabels';
import { itemFood, totals } from '../../src/domain/nutrition/foods';

import { parseEstimate } from '../../src/domain/nutrition/estimate';

describe('on-device food labels', () => {
  it('keeps only food labels above the threshold, best first, mapped where we have a table entry', () => {
    const s = foodSuggestions([
      { label: 'plate', score: 0.6 },
      { label: 'banana', score: 0.3 },
      { label: 'pizza', score: 0.5 },
      { label: 'burrito', score: 0.22 },
      { label: 'pretzel', score: 0.12 },
      { label: 'lemon', score: 0.02 },
    ]);
    expect(s.map((x) => x.label)).toEqual(['pizza', 'banana', 'burrito']);
    expect(s[0].foodId).toBe('pizza');
    expect(s[2].foodId).toBeNull();
  });
});

describe('AI estimate parsing', () => {
  it('accepts plausible items and drops broken ones', () => {
    const items = parseEstimate(
      'ok {"items":[{"name":"Dal","serving":"1 bowl (200 g)","kcal":230,"protein":14,"carbs":32,"fat":5,"confidence":0.8},' +
        '{"name":"","kcal":10,"protein":1,"carbs":1,"fat":1},{"name":"Rice","kcal":"lots","protein":1,"carbs":1,"fat":1}]}',
    );
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ name: 'Dal', kcal: 230, confidence: 0.8 });
  });
});

describe('estimated plate items', () => {
  it('counts AI-estimated items in totals and marks them as estimates', () => {
    const items = [
      { foodId: 'roti', servings: 2 },
      {
        foodId: 'ai:paneer_tikka:1',
        servings: 1,
        custom: { name: 'Paneer tikka', serving: '150 g', kcal: 300, protein: 20, carbs: 8, fat: 20, source: 'ai_estimate' as const },
      },
    ];
    expect(totals(items).kcal).toBe(540);
    expect(itemFood(items[1])?.estimated).toBe(true);
    expect(itemFood(items[0])?.estimated).toBe(false);
  });
});

describe('food-table matches from the AI', () => {
  it('keeps a known table id with servings rounded to 0.5, and ignores unknown ids', () => {
    const items = parseEstimate(
      '{"items":[{"name":"Dal","catalogId":"dal","servings":1.3,"serving":"1 bowl","kcal":230,"protein":14,"carbs":32,"fat":5,"confidence":0.9},' +
        '{"name":"Mystery curry","catalogId":"made_up","servings":1,"serving":"1 bowl","kcal":300,"protein":10,"carbs":20,"fat":18,"confidence":0.6}]}',
      new Set(['dal']),
    );
    expect(items[0]).toMatchObject({ catalogId: 'dal', servings: 1.5 });
    expect(items[1]).toMatchObject({ catalogId: null, servings: null, kcal: 300 });
  });
});
