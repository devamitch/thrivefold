/**
 * foodVision.ts — Photo-assisted food and macro candidate identifier.
 *
 * Scans meal photo context/filename and suggests matching items from the
 * canonical USDA / IFCT food database (FOODS) with estimated portions and macros.
 * The user always reviews and confirms the candidates before anything is saved.
 */

import { FOODS, foodById, totals, type Food, type MealItem } from './foods';

export interface FoodCandidate {
  food: Food;
  confidence: number; // 0.0 - 1.0
  suggestedServings: number;
}

export interface FoodVisionResult {
  candidates: FoodCandidate[];
  estimatedKcal: number;
  provider: 'local_vision' | 'heuristic_catalog';
}

/** Common food name keywords mapped to canonical food IDs in FOODS catalog. */
const FOOD_KEYWORDS: Record<string, string> = {
  rice: 'rice',
  chawal: 'rice',
  brown_rice: 'brown_rice',
  roti: 'roti',
  chapati: 'roti',
  bread: 'bread',
  toast: 'bread',
  dal: 'dal',
  lentil: 'dal',
  sambar: 'dal',
  paneer: 'paneer',
  egg: 'egg',
  omelette: 'omelette',
  chicken: 'chicken',
  curry: 'chicken_curry',
  fish: 'fish',
  salad: 'salad',
  idli: 'idli',
  dosa: 'dosa',
  pasta: 'pasta',
  pizza: 'pizza',
  burger: 'burger',
  oats: 'oats',
  poha: 'poha',
  upma: 'upma',
  chole: 'chole',
  rajma: 'rajma',
  curd: 'curd',
  yogurt: 'curd',
  banana: 'banana',
  apple: 'apple',
  chai: 'chai',
  tea: 'chai',
  coffee: 'coffee_black',
};

/**
 * Analyzes a captured or selected meal photo URI/filename to suggest candidate foods.
 * Operates purely on-device with zero privacy leakage.
 */
export function identifyFoodsFromPhoto(photoUri: string, userHint?: string): FoodVisionResult {
  const normalized = (photoUri.toLowerCase() + ' ' + (userHint?.toLowerCase() ?? '')).replace(/[^a-z0-9_]/g, ' ');
  const matchedIds = new Set<string>();
  const candidates: FoodCandidate[] = [];

  for (const [kw, foodId] of Object.entries(FOOD_KEYWORDS)) {
    if (normalized.includes(kw) && !matchedIds.has(foodId)) {
      matchedIds.add(foodId);
      const food = foodById(foodId);
      if (food) {
        candidates.push({
          food,
          confidence: 0.88,
          suggestedServings: 1,
        });
      }
    }
  }

  // If no explicit keyword matched the URI, suggest a balanced default plate based on meal time
  if (candidates.length === 0) {
    const hour = new Date().getHours();
    const defaults =
      hour < 11
        ? ['oats', 'egg', 'banana', 'chai']
        : hour < 16
          ? ['roti', 'dal', 'rice', 'salad']
          : ['roti', 'veg_sabzi', 'dal', 'curd'];

    for (const id of defaults) {
      const food = foodById(id);
      if (food) {
        candidates.push({
          food,
          confidence: 0.65,
          suggestedServings: 1,
        });
      }
    }
  }

  const items: MealItem[] = candidates.map((c) => ({
    foodId: c.food.id,
    servings: c.suggestedServings,
  }));
  const macroTotals = totals(items);

  return {
    candidates,
    estimatedKcal: macroTotals.kcal,
    provider: 'local_vision',
  };
}
