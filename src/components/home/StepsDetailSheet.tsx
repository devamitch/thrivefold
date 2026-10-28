import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { PhoneStepDay } from '../../../modules/step-counter';
import { hourLabel, stepInsights } from '../../domain/activity/stepInsights';
import { getEqualizerBars } from '../../domain/analytics/dashboardAnalytics';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import type { DeviceReading } from '../../domain/interop/readings';
import { stepsByDate } from '../../domain/interop/readings';
import { useTheme } from '../../theme/useTheme';
import { AppBottomSheetModal } from '../ui/AppBottomSheetModal';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { LiveStepsCard } from './LiveStepsCard';
import { MetricBarChart } from './MetricBarChart';
import { BetaStudioEntries } from '../beta/BetaStudioEntries';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Today's phone-measured steps, live (null when phone counting is off). */
  today: PhoneStepDay | null;
  readings: DeviceReading[];
  todayDate: string;
  goal?: number;
  isQuestAssigned?: boolean;
  caloriesFromSteps?: number;
}

const SOURCE_LABEL: Record<string, string> = {
  phone_sensor: 'Phone',
  health_connect: 'Health Connect',
  ble_heart_rate: 'Strap',
};

/** Count consecutive days ending at `endDate` that met the step goal. */
function goalStreak(
  bars: { value: number }[],
  goal: number,
  endIndex: number,
): number {
  let streak = 0;
  for (let i = endIndex; i >= 0; i--) {
    if (bars[i].value >= goal) streak++;
    else break;
  }
  return streak;
}

/**
 * Everything about steps in one place: today live (hourly), week or month by day, and where each
 * number came from. Phone and Health Connect are unified per day by taking the larger total.
 */
export function StepsDetailSheet({
  visible,
  onClose,
  today,
  readings,
  todayDate,
  goal = 8000,
  isQuestAssigned = false,
  caloriesFromSteps,
}: Props) {
  const { colors, typography, spacing } = useTheme();
  const [range, setRange] = useState<7 | 30>(7);

  const bars = useMemo(
    () => (visible ? getEqualizerBars(readings, 'steps', new Date(), range) : []),
    [visible, readings, range],
  );
  const logged = bars.filter((b) => b.value > 0);
  const avg = logged.length
    ? Math.round(logged.reduce((a, b) => a + b.value, 0) / logged.length)
    : null;
  const best = logged.reduce<(typeof logged)[number] | null>(
    (a, b) => (!a || b.value > a.value ? b : a),
    null,
  );
  const goalDays = logged.filter((b) => b.value >= goal).length;
  const currentSteps = today ? Math.round(today.steps) : 0;
  const questCompleted = currentSteps >= goal;

  // Yesterday comparison
  const yesterdayDate = formatLocalDate(new Date(Date.now() - 86_400_000));
  const yesterdayReading = useMemo(() => {
    if (!visible) return null;
    const byDate = stepsByDate(readings);
    return byDate.get(yesterdayDate) ?? null;
  }, [visible, readings, yesterdayDate]);
  const yesterdaySteps = yesterdayReading ? Math.round(yesterdayReading.value) : null;

  // Walking insights from today's steps
  const insights = useMemo(
    () => stepInsights(currentSteps, today?.hours),
    [currentSteps, today?.hours],
  );

  // Goal completion streak
  const streak = useMemo(() => {
    if (!bars.length) return 0;
    return goalStreak(bars, goal, bars.length - 1);
  }, [bars, goal]);

  // Today's value per source, so the person can see how they were unified.
  const todaySources = readings.filter((r) => r.kind === 'steps' && r.date === todayDate);

  return (
    <AppBottomSheetModal
      visible={visible}
      onClose={onClose}
      eyebrow="STEPS"
      title="Your steps"
      subtitle="Live today, and how your days compare"
      maxHeight="92%"
      contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl }}
    >
      {isQuestAssigned ? (
        <Card
          style={{
            marginBottom: spacing.sm,
            backgroundColor: questCompleted ? colors.successSurface : colors.badgeBg,
          }}
        >
          <View style={styles.questRow}>
            <Ionicons
              name={questCompleted ? 'checkmark-circle' : 'trophy-outline'}
              size={20}
              color={questCompleted ? colors.success : colors.primary}
            />
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                {questCompleted ? 'Daily Quest Complete!' : "Today's Step Quest"}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                {questCompleted
                  ? `Goal of ${goal.toLocaleString()} steps reached today.`
                  : `${Math.max(0, goal - currentSteps).toLocaleString()} steps to complete today's movement quest.`}
              </Text>
            </View>
          </View>
        </Card>
      ) : null}

      {today ? (
        <LiveStepsCard
          steps={Math.round(today.steps)}
          hours={today.hours}
          since={today.since}
          goal={goal}
        />
      ) : (
        <Card>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
            Live steps are off
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Tap the Steps tile on Home and allow physical activity to count steps with your phone.
          </Text>
        </Card>
      )}

      {/* Walking insights row */}
      {currentSteps > 0 ? (
        <Card style={{ marginTop: spacing.sm }}>
          <View style={styles.insightRow}>
            <InsightStat
              icon="walk-outline"
              value={`${insights.walkingMinutes} min`}
              label="walking"
            />
            <InsightStat
              icon="navigate-outline"
              value={`${insights.distanceKm} km`}
              label="distance"
            />
            <InsightStat
              icon="time-outline"
              value={insights.peakHour !== null ? hourLabel(insights.peakHour) : '—'}
              label="most active"
            />
            <InsightStat icon="pulse-outline" value={`${insights.activeHours}h`} label="active" />
          </View>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>
            Estimates based on step count
          </Text>
        </Card>
      ) : null}

      {/* Yesterday comparison */}
      {yesterdaySteps !== null ? (
        <Card style={{ marginTop: spacing.sm }}>
          <View style={styles.questRow}>
            <Ionicons
              name={
                currentSteps > yesterdaySteps
                  ? 'trending-up'
                  : currentSteps < yesterdaySteps
                    ? 'trending-down'
                    : 'remove-outline'
              }
              size={20}
              color={currentSteps >= yesterdaySteps ? colors.success : colors.text.secondary}
            />
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                {currentSteps > yesterdaySteps
                  ? `${(currentSteps - yesterdaySteps).toLocaleString()} more than yesterday`
                  : currentSteps < yesterdaySteps
                    ? `${(yesterdaySteps - currentSteps).toLocaleString()} fewer than yesterday`
                    : 'Same as yesterday'}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Yesterday: {yesterdaySteps.toLocaleString()} steps
              </Text>
            </View>
          </View>
        </Card>
      ) : null}

      {caloriesFromSteps !== undefined && caloriesFromSteps > 0 ? (
        <Card style={{ marginTop: spacing.sm }}>
          <View style={styles.questRow}>
            <Ionicons name="flame-outline" size={20} color={colors.primary} />
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                {caloriesFromSteps} kcal burned
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                pad, treadmill and outdoor steps
              </Text>
            </View>
          </View>
        </Card>
      ) : null}

      <View style={[styles.rangeRow, { marginTop: spacing.lg }]}>
        <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>
          By day
        </Text>
        <Chip label="Week" selected={range === 7} onPress={() => setRange(7)} />
        <Chip label="Month" selected={range === 30} onPress={() => setRange(30)} />
      </View>
      <MetricBarChart
        bars={bars}
        title={range === 7 ? 'Last 7 days' : 'Last 30 days'}
        subtitle={`Goal ${goal.toLocaleString()} steps a day`}
        totalDisplay={avg !== null ? `avg ${avg.toLocaleString()}` : 'No data yet'}
      />

      <View style={[styles.statRow, { marginTop: spacing.md }]}>
        <Stat label="days with steps" value={`${logged.length}`} />
        <Stat label="goal reached" value={`${goalDays}`} />
        <Stat label="best day" value={best ? best.value.toLocaleString() : '—'} />
        {streak > 0 ? <Stat label="day streak" value={`${streak}`} /> : null}
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Sources today</Text>
        {todaySources.length ? (
          todaySources.map((r) => (
            <View key={r.key} style={styles.sourceRow}>
              <Text style={[typography.subbody, styles.flex, { color: colors.text.secondary }]}>
                {SOURCE_LABEL[r.source] ?? r.source}
              </Text>
              <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                {Math.round(r.value).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
            No step source yet today.
          </Text>
        )}
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>
          When the phone and Health Connect both count the same walk, Thrivefold shows the larger
          total, never both added.
        </Text>
      </Card>
      <BetaStudioEntries section="steps" onBeforeNavigate={onClose} />
    </AppBottomSheetModal>
  );
}

function InsightStat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.insightStat}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: 4 }]}>
        {value}
      </Text>
      <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface }]}>
      <Text style={[typography.subheading, { color: colors.text.primary }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  questRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center' },
  sourceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  insightRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  insightStat: { flex: 1, alignItems: 'center' },
});
