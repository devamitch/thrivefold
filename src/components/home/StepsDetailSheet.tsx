import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { PhoneStepDay } from '../../../modules/step-counter';
import { getEqualizerBars } from '../../domain/analytics/dashboardAnalytics';
import type { DeviceReading } from '../../domain/interop/readings';
import { useTheme } from '../../theme/useTheme';
import { AppBottomSheetModal } from '../ui/AppBottomSheetModal';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { LiveStepsCard } from './LiveStepsCard';
import { MetricBarChart } from './MetricBarChart';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Today's phone-measured steps, live (null when phone counting is off). */
  today: PhoneStepDay | null;
  readings: DeviceReading[];
  todayDate: string;
  goal?: number;
}

const SOURCE_LABEL: Record<string, string> = {
  phone_sensor: 'Phone',
  health_connect: 'Health Connect',
  ble_heart_rate: 'Strap',
};

/**
 * Everything about steps in one place: today live (hourly), week or month by day, and where each
 * number came from. Phone and Health Connect are unified per day by taking the larger total.
 */
export function StepsDetailSheet({ visible, onClose, today, readings, todayDate, goal = 8000 }: Props) {
  const { colors, typography, spacing } = useTheme();
  const [range, setRange] = useState<7 | 30>(7);

  const bars = useMemo(
    () => (visible ? getEqualizerBars(readings, 'steps', new Date(), range) : []),
    [visible, readings, range],
  );
  const logged = bars.filter((b) => b.value > 0);
  const avg = logged.length ? Math.round(logged.reduce((a, b) => a + b.value, 0) / logged.length) : null;
  const best = logged.reduce<(typeof logged)[number] | null>((a, b) => (!a || b.value > a.value ? b : a), null);
  const goalDays = logged.filter((b) => b.value >= goal).length;

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
      {today ? (
        <LiveStepsCard steps={Math.round(today.steps)} hours={today.hours} since={today.since} goal={goal} />
      ) : (
        <Card>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Live steps are off</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Tap the Steps tile on Home and allow physical activity to count steps with your phone.
          </Text>
        </Card>
      )}

      <View style={[styles.rangeRow, { marginTop: spacing.lg }]}>
        <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>By day</Text>
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
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>No step source yet today.</Text>
        )}
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>
          When the phone and Health Connect both count the same walk, Thrivefold shows the larger total, never
          both added.
        </Text>
      </Card>
    </AppBottomSheetModal>
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
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center' },
  sourceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
});
