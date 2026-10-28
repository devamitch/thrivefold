import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { CalorieBreakdown } from '../../domain/activity/calories';
import type { EqualizerBar } from '../../domain/analytics/dashboardAnalytics';
import { useTheme } from '../../theme/useTheme';
import { AppBottomSheetModal } from '../ui/AppBottomSheetModal';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { MetricBarChart } from './MetricBarChart';

interface Props {
  visible: boolean;
  onClose: () => void;
  burned: CalorieBreakdown;
  eaten: number;
  mealsToday: number;
  goal: number;
  onSetGoal: (kcal: number) => void;
  week: EqualizerBar[];
}

const GOALS = [200, 300, 450, 600];

/**
 * Active calories today: estimated burn from steps, workouts and logged activities against the
 * person's goal, and calories eaten from the meal log. Resting energy is not included, so no
 * "net" figure is shown: it would be misleading.
 */
export function CaloriesDetailSheet({ visible, onClose, burned, eaten, mealsToday, goal, onSetGoal, week }: Props) {
  const { colors, typography, spacing } = useTheme();
  const share = Math.min(1, burned.total / Math.max(1, goal));
  const rows: [string, number][] = [
    ['Steps', burned.fromSteps],
    ['Workouts (camera coach, home gym)', burned.fromWorkouts],
    ['Logged activities (swim, cycle, sport…)', burned.fromActivities],
  ];

  return (
    <AppBottomSheetModal
      visible={visible}
      onClose={onClose}
      eyebrow="ENERGY"
      title="Calories"
      subtitle="Active burn today, estimated, and what you ate"
      maxHeight="92%"
      contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl }}
    >
      <Card>
        <Text style={[typography.caption, { color: colors.text.muted }]}>Active calories today</Text>
        <View style={styles.totalRow}>
          <Text style={[typography.heading, styles.total, { color: colors.text.primary }]}>≈ {burned.total}</Text>
          <Text style={[typography.caption, { color: colors.text.muted, marginLeft: 6 }]}>of {goal} kcal</Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.surface1 }]}>
          <View style={[styles.fill, { width: `${share * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        {rows.map(([label, value]) => (
          <View key={label} style={[styles.row, { borderTopColor: colors.surface1 }]}>
            <Text style={[typography.subbody, styles.flex, { color: colors.text.secondary }]}>{label}</Text>
            <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{value} kcal</Text>
          </View>
        ))}
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
          Estimates from steps and typical activity intensity
          {burned.weightAssumed ? ', assuming 70 kg. Add your weight in Health for a closer estimate' : ' and your weight'}.
          Walks the phone counted are not added again.
        </Text>
      </Card>

      <Text style={[typography.label, { color: colors.text.muted, marginTop: spacing.md, marginBottom: 6 }]}>Daily goal</Text>
      <View style={styles.chips}>
        {GOALS.map((g) => (
          <Chip key={g} label={`${g} kcal`} selected={goal === g} onPress={() => onSetGoal(g)} />
        ))}
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={[typography.caption, { color: colors.text.muted }]}>Eaten today</Text>
        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 2 }]}>
          {mealsToday ? `${eaten} kcal` : 'No meals logged'}
        </Text>
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
          {mealsToday ? `From ${mealsToday} meal${mealsToday === 1 ? '' : 's'} in your food log.` : 'Log a meal to see what you ate.'}
        </Text>
      </Card>

      <MetricBarChart
        bars={week}
        title="Active calories, last 7 days"
        subtitle="Estimated from steps, workouts and activities"
        totalDisplay={`goal ${goal}`}
      />
    </AppBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  totalRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  total: { fontSize: 32, lineHeight: 38 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 8, marginBottom: 6 },
  fill: { height: '100%', borderRadius: 3 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
