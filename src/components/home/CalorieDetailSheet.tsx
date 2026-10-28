import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme/useTheme';
import { AppBottomSheetModal } from '../ui/AppBottomSheetModal';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { MetricBarChart } from './MetricBarChart';
import { getWeeklyCalorieBars } from '../../domain/analytics/dashboardAnalytics';
import { activeCalories, type CalorieBreakdown } from '../../domain/activity/calories';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import type { DeviceReading } from '../../domain/interop/readings';
import { stepsByDate } from '../../domain/interop/readings';

interface Props {
  visible: boolean;
  onClose: () => void;
  breakdown: CalorieBreakdown;
  goal?: number;
  weightKg?: number | null;
  workoutSessions?: { date: string; startedAt: string; finishedAt: string }[];
  activityLogs?: { date: string; type: string; minutes: number }[];
  readings?: DeviceReading[];
  todayDate?: string;
}

export function CalorieDetailSheet({
  visible,
  onClose,
  breakdown,
  goal = 500,
  weightKg = 70,
  workoutSessions = [],
  activityLogs = [],
  readings = [],
  todayDate = formatLocalDate(new Date()),
}: Props) {
  const { colors, typography, spacing } = useTheme();
  const [range, setRange] = useState<7 | 30>(7);
  const pct = Math.min(100, Math.round((breakdown.total / Math.max(1, goal)) * 100));

  // ── Yesterday Comparison ──
  const yesterdayDate = formatLocalDate(new Date(Date.now() - 86_400_000));
  const yesterdayBreakdown = useMemo(() => {
    if (!visible) return null;
    const byDate = stepsByDate(readings);
    const yesterdaySteps = byDate.get(yesterdayDate);
    return activeCalories({
      date: yesterdayDate,
      weightKg: weightKg ?? null,
      steps: yesterdaySteps ? yesterdaySteps.value : null,
      workoutSessions,
      activityLogs,
    });
  }, [visible, yesterdayDate, weightKg, readings, workoutSessions, activityLogs]);

  // ── Historical Calorie Bars ──
  const stepMap = useMemo(() => stepsByDate(readings), [readings]);
  const bars = useMemo(() => {
    if (!visible) return [];
    return getWeeklyCalorieBars(
      (d) => {
        const s = stepMap.get(d);
        const res = activeCalories({
          date: d,
          weightKg: weightKg ?? null,
          steps: s ? s.value : null,
          workoutSessions,
          activityLogs,
        });
        return res.total;
      },
      new Date(),
      goal,
      range,
    );
  }, [visible, stepMap, weightKg, workoutSessions, activityLogs, goal, range]);

  const loggedDays = bars.filter((b) => b.value > 0);
  const avgKcal = loggedDays.length
    ? Math.round(loggedDays.reduce((a, b) => a + b.value, 0) / loggedDays.length)
    : null;

  const total = Math.max(1, breakdown.total);
  const sources = useMemo(
    () => [
      {
        icon: 'footsteps-outline' as const,
        label: 'Steps & Walking Pad',
        value: `${breakdown.fromSteps} kcal`,
        pct: Math.round((breakdown.fromSteps / total) * 100),
        desc: 'Based on step pacing & treadmill sensors',
      },
      {
        icon: 'barbell-outline' as const,
        label: 'Home Dumbbell & Gym',
        value: `${breakdown.fromWorkouts} kcal`,
        pct: Math.round((breakdown.fromWorkouts / total) * 100),
        desc: 'Active strength & functional resistance sets',
      },
      {
        icon: 'bicycle-outline' as const,
        label: 'Logged & Tracked Sports',
        value: `${breakdown.fromActivities} kcal`,
        pct: Math.round((breakdown.fromActivities / total) * 100),
        desc: 'Running, cycling, swimming & mobility flows',
      },
    ],
    [breakdown, total],
  );

  return (
    <AppBottomSheetModal
      visible={visible}
      onClose={onClose}
      eyebrow="CALORIES"
      title="Active energy"
      subtitle="Estimated from movement, steps and workouts"
      maxHeight="92%"
      contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl }}
    >
      <Card>
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>TODAY'S BURN</Text>
            <Text style={[typography.hero, { color: colors.primary, marginTop: 4 }]}>
              {breakdown.total}{' '}
              <Text style={[typography.heading, { color: colors.text.secondary }]}>kcal</Text>
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.badgeBg }]}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>{pct}% of goal</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.track, { backgroundColor: colors.surface2, marginTop: spacing.md }]}>
          <View
            style={[
              styles.fill,
              { backgroundColor: colors.primary, width: `${Math.max(4, Math.min(100, pct))}%` },
            ]}
          />
        </View>
        <View style={[styles.targetRow, { marginTop: 6 }]}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>0 kcal</Text>
          <Text style={[typography.caption, { color: colors.text.muted }]}>
            Target: {goal.toLocaleString()} kcal
          </Text>
        </View>
      </Card>

      {/* Yesterday Comparison Card */}
      {yesterdayBreakdown !== null ? (
        <Card style={{ marginTop: spacing.sm }}>
          <View style={styles.comparisonRow}>
            <Ionicons
              name={
                breakdown.total > yesterdayBreakdown.total
                  ? 'trending-up'
                  : breakdown.total < yesterdayBreakdown.total
                    ? 'trending-down'
                    : 'remove-outline'
              }
              size={20}
              color={breakdown.total >= yesterdayBreakdown.total ? colors.success : colors.text.secondary}
            />
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                {breakdown.total > yesterdayBreakdown.total
                  ? `${breakdown.total - yesterdayBreakdown.total} kcal more than yesterday`
                  : breakdown.total < yesterdayBreakdown.total
                    ? `${yesterdayBreakdown.total - breakdown.total} kcal fewer than yesterday`
                    : 'Same as yesterday'}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Yesterday: {yesterdayBreakdown.total} kcal burned
              </Text>
            </View>
          </View>
        </Card>
      ) : null}

      {/* History Equalizer Chart */}
      <View style={[styles.rangeRow, { marginTop: spacing.lg }]}>
        <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>
          Daily Burn
        </Text>
        <Chip label="Week" selected={range === 7} onPress={() => setRange(7)} />
        <Chip label="Month" selected={range === 30} onPress={() => setRange(30)} />
      </View>
      <MetricBarChart
        bars={bars}
        title={range === 7 ? 'Last 7 days' : 'Last 30 days'}
        subtitle={`Daily burn vs ${goal} kcal target`}
        totalDisplay={avgKcal !== null ? `avg ${avgKcal} kcal/day` : 'No data yet'}
      />

      <View style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
        <Text style={[typography.subheading, { color: colors.text.primary }]}>
          Breakdown by activity
        </Text>
      </View>

      {sources.map((s, idx) => (
        <Card key={idx} style={{ marginTop: spacing.sm }}>
          <View style={styles.sourceRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.surface2 }]}>
              <Ionicons name={s.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{s.label}</Text>
                <Text style={[typography.caption, { color: colors.text.muted }]}>({s.pct}%)</Text>
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                {s.desc}
              </Text>
            </View>
            <Text style={[typography.bodyBold, { color: colors.primary }]}>{s.value}</Text>
          </View>
        </Card>
      ))}

      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={18} color={colors.text.muted} />
          <Text style={[typography.caption, styles.flex, { color: colors.text.secondary }]}>
            {breakdown.weightAssumed
              ? `Estimated using reference 70 kg body weight. Add your weight in profile for calibrated metrics.`
              : `Scaled to your profile weight of ${weightKg ?? 70} kg.`}
          </Text>
        </View>
      </Card>
    </AppBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
