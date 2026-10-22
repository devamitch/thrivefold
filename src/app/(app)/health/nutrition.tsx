import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';

export default function NutritionScreen() {
  const { colors, typography, spacing } = useTheme();
  const [waterGlasses, setWaterGlasses] = useState(5);

  const meals = [
    { id: 'm1', type: 'Breakfast', title: 'Warm Steel-Cut Oats with Chia & Blueberries', time: '08:30 AM', tags: ['High Fiber', 'Antioxidants'] },
    { id: 'm2', type: 'Lunch', title: 'Quinoa Bowl with Roasted Veggies & Tahini', time: '01:15 PM', tags: ['Plant Protein', 'Micronutrients'] },
    { id: 'm3', type: 'Snack', title: 'Raw Walnuts & Chamomile Infusion', time: '04:45 PM', tags: ['Omega-3', 'Calming'] },
  ];

  return (
    <ScreenWrapper scrollable>
      <Header title="Nutrition & Hydration" subtitle="Nourishment & Cellular Balance" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Hydration Tracker */}
        <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[typography.caption, { color: colors.text.muted }]}>DAILY HYDRATION</Text>
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
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Today's Nourishment</Text>
          <Button label="+ Log Meal" variant="outline" size="sm" />
        </View>

        {meals.map((meal) => (
          <Card key={meal.id} style={{ marginTop: spacing.sm }}>
            <View style={styles.headerRow}>
              <Badge label={meal.type} variant="neutral" />
              <Text style={[typography.caption, { color: colors.text.muted }]}>{meal.time}</Text>
            </View>
            <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
              {meal.title}
            </Text>
            <View style={styles.tagRow}>
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
    flex: 1,
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
