/**
 * Turns on-device image labels (ImageNet classes from the MediaPipe classifier) into food
 * suggestions. Only labels that are foods count; containers, cookware and scenes are ignored.
 * A label maps to a food in our table when there is a clear match; otherwise it is shown as a
 * plain description the person can search for or hand to the AI. Nothing is added on its own.
 */

/** ImageNet food labels → food id in FOODS (null: a food we have no table entry for). */
const FOOD_LABELS: Record<string, string | null> = {
  pizza: 'pizza',
  cheeseburger: 'burger',
  hotdog: null,
  banana: 'banana',
  'granny smith': 'apple',
  orange: 'orange',
  lemon: null,
  strawberry: null,
  pineapple: null,
  pomegranate: null,
  fig: null,
  jackfruit: null,
  'custard apple': null,
  broccoli: 'veg_sabzi',
  cauliflower: 'veg_sabzi',
  'head cabbage': 'veg_sabzi',
  zucchini: 'veg_sabzi',
  cucumber: 'salad',
  'bell pepper': 'veg_sabzi',
  mushroom: 'veg_sabzi',
  artichoke: null,
  'butternut squash': null,
  'acorn squash': null,
  'spaghetti squash': null,
  corn: null,
  ear: null,
  'french loaf': 'bread',
  bagel: 'bread',
  pretzel: null,
  burrito: null,
  guacamole: null,
  carbonara: 'pasta',
  consomme: null,
  'hot pot': null,
  'mashed potato': 'potato',
  'meat loaf': null,
  potpie: null,
  trifle: null,
  'ice cream': null,
  'ice lolly': null,
  'chocolate sauce': null,
  dough: null,
  espresso: 'coffee_black',
  eggnog: null,
  'red wine': null,
};

export interface FoodSuggestion {
  label: string;
  score: number;
  foodId: string | null;
}

/** Food-only suggestions, best first; at most `limit`, each with score ≥ `minScore`. */
export function foodSuggestions(
  labels: { label: string; score: number }[],
  minScore = 0.08,
  limit = 3,
): FoodSuggestion[] {
  const out: FoodSuggestion[] = [];
  for (const l of [...labels].sort((a, b) => b.score - a.score)) {
    const key = l.label.trim().toLowerCase();
    if (!(key in FOOD_LABELS) || l.score < minScore) continue;
    if (out.some((o) => o.label === key)) continue;
    out.push({ label: key, score: l.score, foodId: FOOD_LABELS[key] });
    if (out.length >= limit) break;
  }
  return out;
}
