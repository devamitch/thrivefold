/**
 * Common foods with typical macros per stated serving, rounded. Values follow USDA
 * FoodData Central and the Indian Food Composition Tables (IFCT 2017) for typical
 * preparations; home cooking varies, so totals are estimates, not measurements.
 */
export interface Food {
  id: string;
  name: string;
  serving: string;
  kcal: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  group: 'grains' | 'protein' | 'dairy' | 'veg' | 'fruit' | 'snack' | 'drink' | 'dish';
}

export const FOODS: Food[] = [
  { id: 'rice', name: 'Cooked rice', serving: '1 cup (160 g)', kcal: 205, protein: 4, carbs: 45, fat: 0.4, group: 'grains' },
  { id: 'brown_rice', name: 'Cooked brown rice', serving: '1 cup (195 g)', kcal: 218, protein: 5, carbs: 46, fat: 1.6, group: 'grains' },
  { id: 'roti', name: 'Roti / chapati', serving: '1 medium (40 g)', kcal: 120, protein: 3, carbs: 18, fat: 3.7, group: 'grains' },
  { id: 'paratha', name: 'Plain paratha', serving: '1 medium (60 g)', kcal: 200, protein: 4, carbs: 26, fat: 9, group: 'grains' },
  { id: 'bread', name: 'Bread, whole wheat', serving: '1 slice (32 g)', kcal: 80, protein: 4, carbs: 14, fat: 1, group: 'grains' },
  { id: 'oats', name: 'Oats, cooked in water', serving: '1 cup (234 g)', kcal: 166, protein: 6, carbs: 28, fat: 3.6, group: 'grains' },
  { id: 'poha', name: 'Poha', serving: '1 plate (150 g)', kcal: 250, protein: 5, carbs: 42, fat: 7, group: 'dish' },
  { id: 'upma', name: 'Upma', serving: '1 plate (150 g)', kcal: 230, protein: 6, carbs: 34, fat: 8, group: 'dish' },
  { id: 'idli', name: 'Idli', serving: '1 piece (40 g)', kcal: 58, protein: 2, carbs: 12, fat: 0.2, group: 'dish' },
  { id: 'dosa', name: 'Plain dosa', serving: '1 medium (90 g)', kcal: 170, protein: 4, carbs: 28, fat: 4.5, group: 'dish' },
  { id: 'pasta', name: 'Cooked pasta', serving: '1 cup (140 g)', kcal: 220, protein: 8, carbs: 43, fat: 1.3, group: 'grains' },
  { id: 'dal', name: 'Dal (cooked lentils)', serving: '1 bowl (200 g)', kcal: 230, protein: 14, carbs: 32, fat: 5, group: 'protein' },
  { id: 'rajma', name: 'Rajma curry', serving: '1 bowl (200 g)', kcal: 250, protein: 13, carbs: 35, fat: 6, group: 'protein' },
  { id: 'chole', name: 'Chole (chickpea curry)', serving: '1 bowl (200 g)', kcal: 280, protein: 13, carbs: 38, fat: 9, group: 'protein' },
  { id: 'egg', name: 'Egg, boiled', serving: '1 large (50 g)', kcal: 78, protein: 6.3, carbs: 0.6, fat: 5.3, group: 'protein' },
  { id: 'omelette', name: 'Omelette (2 eggs)', serving: '1 omelette', kcal: 190, protein: 13, carbs: 1, fat: 15, group: 'protein' },
  { id: 'chicken', name: 'Chicken breast, cooked', serving: '100 g', kcal: 165, protein: 31, carbs: 0, fat: 3.6, group: 'protein' },
  { id: 'chicken_curry', name: 'Chicken curry', serving: '1 bowl (200 g)', kcal: 320, protein: 28, carbs: 8, fat: 19, group: 'dish' },
  { id: 'fish', name: 'Fish, grilled', serving: '100 g', kcal: 130, protein: 26, carbs: 0, fat: 2.7, group: 'protein' },
  { id: 'paneer', name: 'Paneer', serving: '100 g', kcal: 265, protein: 18, carbs: 3.6, fat: 20, group: 'protein' },
  { id: 'tofu', name: 'Tofu, firm', serving: '100 g', kcal: 144, protein: 17, carbs: 3, fat: 9, group: 'protein' },
  { id: 'soya_chunks', name: 'Soya chunks, cooked', serving: '1 cup (100 g)', kcal: 120, protein: 15, carbs: 9, fat: 0.5, group: 'protein' },
  { id: 'sprouts', name: 'Moong sprouts', serving: '1 cup (100 g)', kcal: 30, protein: 3, carbs: 6, fat: 0.2, group: 'protein' },
  { id: 'curd', name: 'Curd / plain yogurt', serving: '1 cup (245 g)', kcal: 150, protein: 8.5, carbs: 11, fat: 8, group: 'dairy' },
  { id: 'greek_yogurt', name: 'Greek yogurt, plain', serving: '170 g', kcal: 100, protein: 17, carbs: 6, fat: 0.7, group: 'dairy' },
  { id: 'milk', name: 'Milk, toned', serving: '1 glass (250 ml)', kcal: 150, protein: 8, carbs: 12, fat: 8, group: 'dairy' },
  { id: 'whey', name: 'Whey protein', serving: '1 scoop (30 g)', kcal: 120, protein: 24, carbs: 3, fat: 1.5, group: 'protein' },
  { id: 'veg_sabzi', name: 'Mixed vegetable sabzi', serving: '1 bowl (150 g)', kcal: 150, protein: 3, carbs: 12, fat: 10, group: 'veg' },
  { id: 'salad', name: 'Green salad', serving: '1 bowl (100 g)', kcal: 20, protein: 1, carbs: 4, fat: 0.2, group: 'veg' },
  { id: 'potato', name: 'Potato, boiled', serving: '1 medium (150 g)', kcal: 130, protein: 3, carbs: 30, fat: 0.2, group: 'veg' },
  { id: 'banana', name: 'Banana', serving: '1 medium (118 g)', kcal: 105, protein: 1.3, carbs: 27, fat: 0.4, group: 'fruit' },
  { id: 'apple', name: 'Apple', serving: '1 medium (182 g)', kcal: 95, protein: 0.5, carbs: 25, fat: 0.3, group: 'fruit' },
  { id: 'mango', name: 'Mango', serving: '1 cup (165 g)', kcal: 99, protein: 1.4, carbs: 25, fat: 0.6, group: 'fruit' },
  { id: 'orange', name: 'Orange', serving: '1 medium (131 g)', kcal: 62, protein: 1.2, carbs: 15, fat: 0.2, group: 'fruit' },
  { id: 'almonds', name: 'Almonds', serving: '10 nuts (14 g)', kcal: 82, protein: 3, carbs: 3, fat: 7, group: 'snack' },
  { id: 'peanuts', name: 'Peanuts, roasted', serving: '30 g', kcal: 170, protein: 7, carbs: 5, fat: 14, group: 'snack' },
  { id: 'peanut_butter', name: 'Peanut butter', serving: '1 tbsp (16 g)', kcal: 95, protein: 3.5, carbs: 3, fat: 8, group: 'snack' },
  { id: 'biscuits', name: 'Biscuits', serving: '2 pieces (20 g)', kcal: 95, protein: 1.4, carbs: 14, fat: 4, group: 'snack' },
  { id: 'samosa', name: 'Samosa', serving: '1 piece (80 g)', kcal: 260, protein: 4, carbs: 28, fat: 15, group: 'snack' },
  { id: 'chai', name: 'Chai with milk and sugar', serving: '1 cup (150 ml)', kcal: 90, protein: 2.5, carbs: 13, fat: 3, group: 'drink' },
  { id: 'coffee_black', name: 'Black coffee', serving: '1 cup', kcal: 2, protein: 0.3, carbs: 0, fat: 0, group: 'drink' },
  { id: 'juice', name: 'Fruit juice', serving: '1 glass (250 ml)', kcal: 115, protein: 1, carbs: 27, fat: 0.3, group: 'drink' },
  { id: 'soft_drink', name: 'Soft drink', serving: '1 can (330 ml)', kcal: 140, protein: 0, carbs: 35, fat: 0, group: 'drink' },
  { id: 'biryani', name: 'Chicken biryani', serving: '1 plate (300 g)', kcal: 500, protein: 25, carbs: 60, fat: 18, group: 'dish' },
  { id: 'veg_biryani', name: 'Veg biryani', serving: '1 plate (300 g)', kcal: 430, protein: 9, carbs: 65, fat: 14, group: 'dish' },
  { id: 'pizza', name: 'Pizza', serving: '1 slice (107 g)', kcal: 285, protein: 12, carbs: 36, fat: 10, group: 'dish' },
  { id: 'burger', name: 'Burger', serving: '1 burger', kcal: 350, protein: 17, carbs: 33, fat: 16, group: 'dish' },
  { id: 'noodles', name: 'Instant noodles', serving: '1 pack (70 g dry)', kcal: 310, protein: 6, carbs: 43, fat: 13, group: 'dish' },
];

export const foodById = (id: string) => FOODS.find((f) => f.id === id);

export interface MealItem {
  foodId: string;
  servings: number;
  /**
   * A food that is not in the table, with its own per-serving values. `ai_estimate` means a
   * model estimated it from a photo and the person accepted it: shown as an estimate.
   */
  custom?: Omit<Food, 'id' | 'group'> & { source: 'ai_estimate' };
}

/** The food facts behind an item: the table entry, or the item's own (estimated) values. */
export function itemFood(item: MealItem): (Omit<Food, 'group'> & { estimated: boolean }) | null {
  if (item.custom) return { id: item.foodId, ...item.custom, estimated: true };
  const f = foodById(item.foodId);
  return f ? { ...f, estimated: false } : null;
}

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

const round = (n: number) => Math.round(n * 10) / 10;

export function totals(items: MealItem[]): Macros {
  const t = items.reduce(
    (acc, it) => {
      const f = itemFood(it);
      if (!f) return acc;
      return {
        kcal: acc.kcal + f.kcal * it.servings,
        protein: acc.protein + f.protein * it.servings,
        carbs: acc.carbs + f.carbs * it.servings,
        fat: acc.fat + f.fat * it.servings,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  return { kcal: Math.round(t.kcal), protein: round(t.protein), carbs: round(t.carbs), fat: round(t.fat) };
}

export function searchFoods(query: string): Food[] {
  const q = query.trim().toLowerCase();
  if (!q) return FOODS;
  return FOODS.filter((f) => f.name.toLowerCase().includes(q) || f.id.includes(q));
}
