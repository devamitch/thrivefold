import React from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { Link, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { PressableScale } from '../../../components/ui/PressableScale';
import { HydrationTrackerCard } from '../../../components/home/HydrationTrackerCard';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { TodayMeals } from '../../../components/home/TodayMeals';

interface MealRecommendation {
  id: string;
  type: string;
  title: string;
  time: string;
  tags: string[];
}

const MEALS_BY_DIET: Record<string, MealRecommendation[]> = {
  Vegetarian: [
    { id: 'm1', type: 'Breakfast', title: 'High-Protein Chia & Almond Spelt Porridge', time: '08:30 AM', tags: ['Plant Protein', 'High Fiber'] },
    { id: 'm2', type: 'Lunch', title: 'Warm Lentil & Sweet Potato Dal with Baby Spinach', time: '01:15 PM', tags: ['Iron Rich', 'Polyphenols'] },
    { id: 'm3', type: 'Dinner', title: 'Grilled Paneer & Roasted Quinoa Bowl with Tahini', time: '07:30 PM', tags: ['Complete Protein', 'Zinc'] },
    { id: 'm4', type: 'Snack', title: 'Raw Walnuts & Pumpkin Seeds with Chamomile Infusion', time: '04:45 PM', tags: ['Omega-3', 'Calming'] },
  ],
  Vegan: [
    { id: 'm1', type: 'Breakfast', title: 'Sprouted Tofu Scramble with Turmeric & Sourdough', time: '08:30 AM', tags: ['Clean Protein', 'Anti-Inflammatory'] },
    { id: 'm2', type: 'Lunch', title: 'Edamame, Chickpea & Wild Rice Bowl with Miso Slaw', time: '01:15 PM', tags: ['Complete Amino Chain', 'Micronutrients'] },
    { id: 'm3', type: 'Dinner', title: 'Lentil & Walnut Bolognese over Gluten-Free Pasta', time: '07:30 PM', tags: ['Sustained Energy', 'High Fiber'] },
    { id: 'm4', type: 'Snack', title: 'Chia Seed Coconut Yogurt with Fresh Berries', time: '04:45 PM', tags: ['Antioxidants', 'Prebiotics'] },
  ],
  Pescatarian: [
    { id: 'm1', type: 'Breakfast', title: 'Poached Eggs over Avocado & Seeded Rye', time: '08:30 AM', tags: ['Choline', 'Healthy Fats'] },
    { id: 'm2', type: 'Lunch', title: 'Wild Alaskan Salmon & Roasted Broccolini Bowl', time: '01:15 PM', tags: ['EPA/DHA Omega-3', 'Cellular Repair'] },
    { id: 'm3', type: 'Dinner', title: 'Mediterranean White Fish with Olive Tapenade & Quinoa', time: '07:30 PM', tags: ['Lean Protein', 'Cardioprotective'] },
    { id: 'm4', type: 'Snack', title: 'Seaweed Thins & Roasted Pumpkin Seeds', time: '04:45 PM', tags: ['Iodine', 'Magnesium'] },
  ],
  'Gluten-free': [
    { id: 'm1', type: 'Breakfast', title: 'Certified GF Rolled Oats with Blueberries & Hemp Hearts', time: '08:30 AM', tags: ['Gluten-Free', 'High Fiber'] },
    { id: 'm2', type: 'Lunch', title: 'Grass-Fed Beef or Tempeh Bowl with Roasted Yams', time: '01:15 PM', tags: ['Iron & Zinc', 'Gut Friendly'] },
    { id: 'm3', type: 'Dinner', title: 'Baked Lemon Herb Salmon with Steamed Asparagus', time: '07:30 PM', tags: ['Omega-3', 'Easy Digest'] },
    { id: 'm4', type: 'Snack', title: 'Green Apple Slices with Almond Butter', time: '04:45 PM', tags: ['Pectin', 'Steady Glucose'] },
  ],
  Halal: [
    { id: 'm1', type: 'Breakfast', title: 'Organic Boiled Eggs with Cucumbers, Feta & Olives', time: '08:30 AM', tags: ['Wholesome', 'Protein Rich'] },
    { id: 'm2', type: 'Lunch', title: 'Za\'atar Grilled Chicken Breast with Brown Basmati & Tahini', time: '01:15 PM', tags: ['Lean Protein', 'Complex Carbs'] },
    { id: 'm3', type: 'Dinner', title: 'Slow-Simmered Lamb & Chickpea Stew with Wilted Greens', time: '07:30 PM', tags: ['Iron Dense', 'Collagen Rich'] },
    { id: 'm4', type: 'Snack', title: 'Medjool Dates & Roasted Almonds', time: '04:45 PM', tags: ['Natural Glucose', 'Magnesium'] },
  ],
  Kosher: [
    { id: 'm1', type: 'Breakfast', title: 'Smoked Salmon over Sprouted Grains with Dill', time: '08:30 AM', tags: ['Omega-3', 'Brain Fuel'] },
    { id: 'm2', type: 'Lunch', title: 'Roasted Turkey Breast Salad with Pumpkin Seeds & Citrus', time: '01:15 PM', tags: ['Lean Protein', 'Antioxidants'] },
    { id: 'm3', type: 'Dinner', title: 'Braised Beef Brisket with Roasted Root Vegetables', time: '07:30 PM', tags: ['Sustained Satiety', 'Micronutrients'] },
    { id: 'm4', type: 'Snack', title: 'Pomegranate Seeds & Raw Walnuts', time: '04:45 PM', tags: ['Polyphenols', 'Cardiovascular'] },
  ],
};

const DEFAULT_MEALS: MealRecommendation[] = [
  { id: 'm1', type: 'Breakfast', title: 'Warm Steel-Cut Oats with Chia, Walnuts & Blueberries', time: '08:30 AM', tags: ['High Fiber', 'Antioxidants'] },
  { id: 'm2', type: 'Lunch', title: 'Mediterranean Bowl with Roasted Veggies, Quinoa & Greens', time: '01:15 PM', tags: ['Clean Fuel', 'Micronutrients'] },
  { id: 'm3', type: 'Dinner', title: 'Wild Salmon or Lentil Power Bowl with Steamed Greens', time: '07:30 PM', tags: ['Omega-3', 'Cellular Repair'] },
  { id: 'm4', type: 'Snack', title: 'Raw Almonds & Calming Chamomile Infusion', time: '04:45 PM', tags: ['Magnesium', 'Nervous Reset'] },
];

const GOALS = [6, 8, 10, 12];

/** Today's food and water in one place, plus meal ideas that follow the person's food preference. */
export default function NutritionScreen() {
  const { colors, typography, spacing } = useTheme();
  const date = formatLocalDate(new Date());
  const s = useRootStore(
    useShallow((st) => ({
      diet: st.onboarding.diet,
      glasses: st.hydration[date] ?? 0,
      target: st.hydrationTargetGlasses ?? 8,
      waterLogs: st.waterLogs,
      addWaterLog: st.addWaterLog,
      undoWaterLog: st.undoWaterLog,
      setTarget: st.setHydrationTargetGlasses,
    })),
  );
  const entries = s.waterLogs.filter((w) => w.date === date);

  const activeDiet = s.diet && s.diet !== 'No preference' ? s.diet : null;
  const meals = activeDiet ? (MEALS_BY_DIET[activeDiet] ?? DEFAULT_MEALS) : DEFAULT_MEALS;

  return (
    <ScreenWrapper scrollable>
      <Header title="Nutrition" subtitle="Today's food, water and ideas" showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}
      >
        <TodayMeals />

        <View style={{ marginTop: spacing.md }}>
          <HydrationTrackerCard
            glasses={s.glasses}
            targetGlasses={s.target}
            entries={entries}
            onAddMl={(ml) => s.addWaterLog(ml, date)}
            onUndo={() => s.undoWaterLog(date)}
            onEditGoal={() => s.setTarget(GOALS[(GOALS.indexOf(s.target) + 1) % GOALS.length] ?? 8)}
          />
        </View>

        <View style={[styles.headerRow, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          <View style={styles.flex}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>Meal ideas</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {activeDiet ? `Following your ${activeDiet} preference` : 'Balanced, no preference set'}
            </Text>
          </View>
          <Link href={'/(onboarding)/lifestyle-preferences' as Href} asChild>
            <PressableScale hitSlop={8} accessibilityRole="button" accessibilityLabel="Edit food preference">
              <Text style={[typography.subbodyBold, { color: colors.primary }]}>Edit</Text>
            </PressableScale>
          </Link>
        </View>

        <Card style={{ paddingVertical: spacing.xs }}>
          {meals.map((meal, i) => (
            <View
              key={meal.id}
              style={[styles.idea, i > 0 ? { borderTopColor: colors.surface1, borderTopWidth: StyleSheet.hairlineWidth } : null]}
            >
              <View style={[styles.ideaIcon, { backgroundColor: colors.primaryAlpha }]}>
                <Ionicons name={ICON_FOR[meal.type] ?? 'restaurant-outline'} size={16} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>{meal.type}</Text>
                <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{meal.title}</Text>
              </View>
            </View>
          ))}
        </Card>
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
          Ideas only, not a meal plan or dietary advice.
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

const ICON_FOR: Record<string, keyof typeof Ionicons.glyphMap> = {
  Breakfast: 'sunny-outline',
  Lunch: 'restaurant-outline',
  Dinner: 'moon-outline',
  Snack: 'cafe-outline',
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
  flex: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  idea: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  ideaIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
