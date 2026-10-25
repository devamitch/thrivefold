import { SquircleSurface } from '../ui/SquircleSurface';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { totals } from '../../domain/nutrition/foods';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

/** Today's meals with photos and running calorie and macro totals. */
export function TodayMeals() {
  const { colors, typography, spacing } = useTheme();
  const meals = useRootStore((s) => s.mealLogs);
  const today = formatLocalDate(new Date());
  const todays = meals.filter((m) => m.date === today);
  const sum = totals(todays.flatMap((m) => m.items));

  return (
    <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
      <Text style={[typography.captionBold, { color: colors.text.muted }]}>TODAY'S FOOD</Text>
      <View style={[styles.row, { marginTop: 6 }]}>
        {(
          [
            ['kcal', `${sum.kcal}`],
            ['Protein', `${sum.protein} g`],
            ['Carbs', `${sum.carbs} g`],
            ['Fat', `${sum.fat} g`],
          ] as const
        ).map(([label, value]) => (
          <View key={label} style={styles.macro}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>{value}</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
          </View>
        ))}
      </View>
      {todays.map((m) => {
        const t = totals(m.items);
        return (
          <View key={m.id} style={[styles.meal, { borderTopColor: colors.border }]}>
            {m.photoUri ? (
              <Image source={{ uri: m.photoUri }} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.thumb, styles.center, { backgroundColor: colors.surface1 }]}>
                <Ionicons name="restaurant-outline" size={18} color={colors.text.muted} />
              </View>
            )}
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary, textTransform: 'capitalize' }]}>{m.type}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {t.kcal} kcal · P {t.protein} g · C {t.carbs} g · F {t.fat} g
              </Text>
            </View>
          </View>
        );
      })}
      <Link href={'/(app)/health/meal-log' as Href} asChild>
        <Button label="Log a meal" style={{ marginTop: spacing.md }} />
      </Link>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  macro: { alignItems: 'center', flex: 1 },
  meal: { alignItems: 'center', flexDirection: 'row', gap: 12, marginTop: 10, paddingTop: 10 },
  row: { flexDirection: 'row' },
  thumb: { borderRadius: 12, height: 48, width: 48 },
});
