import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter, type Href } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { totals } from '../../domain/nutrition/foods';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

/** Today's meals (each opens its detail) with running calorie and macro totals. */
export function TodayMeals() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const meals = useRootStore((s) => s.mealLogs);
  const today = formatLocalDate(new Date());
  const todays = meals.filter((m) => m.date === today).sort((a, b) => a.at.localeCompare(b.at));
  const sum = totals(todays.flatMap((m) => m.items));
  // Energy share of each macro (4/4/9 kcal per gram); only drawn once something is logged.
  const pk = sum.protein * 4;
  const ck = sum.carbs * 4;
  const fk = sum.fat * 9;
  const all = pk + ck + fk;

  return (
    <Card>
      <View style={styles.head}>
        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Today&apos;s food</Text>
        <Text style={[typography.caption, { color: colors.text.muted }]}>
          {todays.length
            ? `${todays.length} meal${todays.length === 1 ? '' : 's'}`
            : 'Nothing logged'}
        </Text>
      </View>
      <View style={[styles.row, { marginTop: spacing.sm }]}>
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
      {all > 0 ? (
        <View
          style={[styles.bar, { backgroundColor: colors.surface1 }]}
          accessible
          accessibilityLabel={`Energy from protein ${Math.round((pk / all) * 100)}%, carbs ${Math.round((ck / all) * 100)}%, fat ${Math.round((fk / all) * 100)}%`}
        >
          <View style={{ flex: pk, backgroundColor: colors.primary }} />
          <View style={{ flex: ck, backgroundColor: colors.accent }} />
          <View style={{ flex: fk, backgroundColor: colors.surface3 }} />
        </View>
      ) : null}

      {todays.map((m) => {
        const t = totals(m.items);
        return (
          <PressableScale
            key={m.id}
            onPress={() => router.push(`/(app)/health/meal/${m.id}` as Href)}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel={`${m.type} at ${timeOf(m.at)}, ${t.kcal} kcal. Open`}
            style={[styles.meal, { borderTopColor: colors.surface1 }]}
          >
            {m.photoUri ? (
              <Image source={{ uri: m.photoUri }} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.thumb, styles.center, { backgroundColor: colors.primaryAlpha }]}>
                <Ionicons name="restaurant-outline" size={18} color={colors.primary} />
              </View>
            )}
            <View style={styles.flex}>
              <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                {m.type[0].toUpperCase() + m.type.slice(1)} · {timeOf(m.at)}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {m.items.length
                  ? `${t.kcal} kcal · P ${t.protein} g · C ${t.carbs} g · F ${t.fat} g`
                  : 'Photo or note only'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
          </PressableScale>
        );
      })}
      <Link href={'/(app)/health/meal-log' as Href} asChild>
        <Button
          label="Log a meal"
          style={{ marginTop: spacing.md }}
          icon={<Ionicons name="scan-outline" size={18} color={colors.onPrimary} />}
        />
      </Link>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  macro: { alignItems: 'center', flex: 1 },
  bar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 12 },
  meal: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: { flexDirection: 'row' },
  thumb: { borderRadius: 12, height: 44, width: 44 },
});
