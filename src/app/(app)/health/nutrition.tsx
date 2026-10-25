import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { Link, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore } from '../../../stores/useRootStore';
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

export default function NutritionScreen() {
  const { colors, typography, spacing } = useTheme();
  const onboarding = useRootStore((s) => s.onboarding);
  const date = formatLocalDate(new Date());
  const waterGlasses = useRootStore((st) => st.hydration[date] ?? 0);
  const setHydration = useRootStore((st) => st.setHydration);
  const setWaterGlasses = (update: (v: number) => number) => setHydration(date, update(waterGlasses));

  const activeDiet = onboarding.diet && onboarding.diet !== 'No preference' ? onboarding.diet : null;
  const meals = activeDiet ? (MEALS_BY_DIET[activeDiet] ?? DEFAULT_MEALS) : DEFAULT_MEALS;

  return (
    <ScreenWrapper scrollable>
      <Header title="Nutrition" subtitle="Water today and meal ideas for your preferences" showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}
      >
        {/* Active Dietary Preference Banner */}
        <Card variant="tinted" style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[typography.captionBold, { color: colors.text.muted }]}>DIETARY RHYTHM</Text>
              <Text style={[typography.heading, { color: colors.primary, marginTop: 2 }]}>
                {activeDiet ? `${activeDiet} Focus` : 'Balanced Whole Foods'}
              </Text>
            </View>
            <Badge label={activeDiet ? 'Personalized' : 'Flexible'} variant="primary" />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
            {activeDiet
              ? `Meal ideas below follow your ${activeDiet} preference.`
              : 'Balanced meal ideas. Set a food preference to tailor them.'}
          </Text>
          <Link href={'/(onboarding)/lifestyle-preferences' as Href} asChild>
            <Button
              label="Edit Food Preferences"
              size="sm"
              variant="outline"
              style={{ marginTop: 12, alignSelf: 'flex-start' }}
            />
          </Link>
        </Card>

        <TodayMeals />

        {/* Hydration Tracker */}
        <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[typography.captionBold, { color: colors.text.muted }]}>DAILY HYDRATION</Text>
              <Text style={[typography.heading, { color: colors.primary, marginTop: 2 }]}>
                {waterGlasses * 250} ml / 2000 ml
              </Text>
            </View>
            <Badge label={`${waterGlasses}/8 Glasses`} variant="primary" />
          </View>

          <View style={styles.glassRow}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Ionicons
                key={i}
                name={i < waterGlasses ? 'water' : 'water-outline'}
                size={28}
                color={i < waterGlasses ? colors.primary : colors.text.muted}
                style={{ marginHorizontal: 4 }}
              />
            ))}
          </View>

          <View style={styles.stepperRow}>
            <Button
              label="- Glass"
              variant="outline"
              size="sm"
              onPress={() => setWaterGlasses((v) => Math.max(0, v - 1))}
            />
            <Button
              label="+ Glass (250ml)"
              variant="primary"
              size="sm"
              onPress={() => setWaterGlasses((v) => Math.min(12, v + 1))}
              style={{ marginLeft: 12 }}
            />
          </View>
        </Card>

        {/* Meal Logs */}
        <View style={styles.headerRow}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            {activeDiet ? `${activeDiet} meal ideas` : 'Meal ideas'}
          </Text>
        </View>

        {meals.map((meal) => (
          <Card key={meal.id} style={{ marginTop: spacing.sm, padding: spacing.md }}>
            <View style={styles.headerRow}>
              <Badge label={meal.type} variant="neutral" />
              <Text style={[typography.caption, { color: colors.text.muted }]}>Idea</Text>
            </View>
            <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
              {meal.title}
            </Text>
            <View style={[styles.tagRow, { marginTop: 6 }]}>
              {meal.tags.map((t) => (
                <Text key={t} style={[typography.caption, { color: colors.primary, marginRight: 8, marginTop: 4 }]}>
                  #{t}
                </Text>
              ))}
            </View>
          </Card>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glassRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
