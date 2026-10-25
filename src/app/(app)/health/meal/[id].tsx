import { SquircleSurface } from '@/components/ui';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppHeader } from '../../../../components/ui/AppHeader';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { ScreenContainer } from '../../../../components/ui/ScreenContainer';
import { foodById, totals } from '../../../../domain/nutrition/foods';
import { useRootStore, useShallow } from '../../../../stores/useRootStore';
import { useTheme } from '../../../../theme/useTheme';

/** One saved meal: photo, foods, estimated totals, and delete. */
export default function MealScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { meal, remove, showAlert } = useRootStore(
    useShallow((s) => ({ meal: s.mealLogs.find((m) => m.id === id), remove: s.deleteMealLog, showAlert: s.showAlert })),
  );
  if (!meal) {
    return (
      <ScreenContainer header={<AppHeader title="Meal" showBack />} scrollMode="shell-scroll-view">
        <Text style={[typography.body, { color: colors.text.secondary }]}>This meal is no longer saved.</Text>
      </ScreenContainer>
    );
  }
  const t = totals(meal.items);
  return (
    <ScreenContainer
      header={<AppHeader title={meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} subtitle={new Date(meal.at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} showBack />}
      scrollMode="shell-scroll-view"
    >
      {meal.photoUri ? <Image source={{ uri: meal.photoUri }} style={styles.photo} contentFit="cover" /> : null}
      <Card style={{ padding: spacing.base, marginTop: spacing.md }}>
        <SquircleSurface style={styles.row}>
          {(
            [
              ['kcal', `${t.kcal}`],
              ['Protein', `${t.protein} g`],
              ['Carbs', `${t.carbs} g`],
              ['Fat', `${t.fat} g`],
            ] as const
          ).map(([label, value]) => (
            <SquircleSurface key={label} style={styles.macro}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>{value}</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
            </SquircleSurface>
          ))}
        </SquircleSurface>
        {meal.items.map((i) => {
          const f = foodById(i.foodId);
          return (
            <Text key={i.foodId} style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
              {i.servings} x {f?.name ?? i.foodId} ({f?.serving})
            </Text>
          );
        })}
        {meal.note ? <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>{meal.note}</Text> : null}
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>Estimated from typical values per serving.</Text>
      </Card>
      <Button
        label="Delete this meal"
        variant="ghost"
        onPress={() =>
          showAlert({
            title: 'Delete this meal?',
            message: 'It is removed from your food log and calendar.',
            confirmText: 'Delete',
            destructive: true,
            onConfirm: () => {
              remove(meal.id);
              router.back();
            },
          })
        }
        style={{ marginTop: spacing.lg }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  macro: { alignItems: 'center', flex: 1 },
  photo: { borderRadius: 18, height: 220, width: '100%' },
  row: { flexDirection: 'row' },
});
