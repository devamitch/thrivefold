import { Ionicons } from '@expo/vector-icons';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useRouter, type Href } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';

export interface MetricGridProps {
  /** Latest daily step total (larger of phone sensor and Health Connect for that day). */
  steps: {
    value: number;
    date: string;
    isToday: boolean;
    source: 'phone_sensor' | 'health_connect' | 'ble_heart_rate';
    estimated?: number;
    since?: number;
  } | null;
  /** Phone step counter state; `off` makes the tile an in-context request to turn it on. */
  phoneSteps: 'unsupported' | 'off' | 'on';
  onEnablePhoneSteps: () => void;
  /** Today's hourly phone steps, drawn as a live sparkline on the Steps tile. */
  stepsHours?: number[];
  /** Opens the full steps view. */
  onStepsPress?: () => void;
  stepsGoal?: number;
  sleep: { minutes: number; source: 'health_connect' | 'check_in' } | null;
  heart: { bpm: number; isToday: boolean } | null;
  /** Minutes the person logged today (activities and workouts); null when nothing was logged. */
  activeMinutes: number | null;
  /** Walking minutes estimated from today's measured steps; used when nothing was logged. */
  walkingMinutesFromSteps?: number | null;
  /** Whether any connected source has delivered readings. Drives the empty-state wording. */
  connected: boolean;
}

const DIAL = 40;
const DIAL_STROKE = 4;
const DIAL_R = (DIAL - DIAL_STROKE) / 2 - 1;

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

/**
 * Four compact tiles with real values only. Missing data is shown as missing ("Not connected",
 * "Nothing logged"), never as zero, and each value says where it came from.
 */
export function AnalyticalMetricGrid({
  steps,
  stepsGoal = 8000,
  sleep,
  heart,
  activeMinutes,
  walkingMinutesFromSteps = null,
  connected,
  phoneSteps,
  onEnablePhoneSteps,
  stepsHours,
  onStepsPress,
}: MetricGridProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const notConnected = connected ? 'No reading yet' : 'Not connected';

  const stepsContext = steps
    ? [
        steps.source === 'phone_sensor' ? 'Phone' : 'Health Connect',
        steps.since && steps.isToday
          ? `since ${new Date(steps.since).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
          : `goal ${stepsGoal.toLocaleString()}`,
        steps.estimated ? 'partly estimated' : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : phoneSteps === 'off'
      ? 'Tap to count steps'
      : phoneSteps === 'on'
        ? 'Counting · walk to start'
        : notConnected;

  const sleepValue = sleep
    ? `${Math.floor(sleep.minutes / 60)}h ${Math.round(sleep.minutes % 60)}m`
    : null;

  return (
    <View style={styles.grid}>
      <Tile
        icon="footsteps-outline"
        tint={colors.primary}
        label={steps && !steps.isToday ? `Steps · ${shortDate(steps.date)}` : 'Steps'}
        value={steps ? steps.value.toLocaleString() : null}
        context={stepsContext}
        dial={steps && !stepsHours ? Math.min(1, steps.value / stepsGoal) : null}
        spark={stepsHours}
        onPress={
          phoneSteps === 'off' && !steps
            ? onEnablePhoneSteps
            : (onStepsPress ?? (() => router.push('/(app)/health/activity' as Href)))
        }
        accessibilityHint={
          phoneSteps === 'off' && !steps ? 'Asks to turn on step counting' : 'Opens activity'
        }
      />
      <Tile
        icon="moon-outline"
        tint={colors.primary}
        label="Sleep"
        value={sleepValue}
        context={
          sleep
            ? sleep.source === 'health_connect'
              ? 'Last night · Health Connect'
              : 'Last night · your check-in'
            : 'Nothing logged'
        }
        onPress={() => router.push('/(app)/health/sleep' as Href)}
        accessibilityHint="Opens sleep"
      />
      <Tile
        icon="heart-outline"
        tint={colors.primary}
        label="Heart rate"
        value={heart ? `${Math.round(heart.bpm)} bpm` : null}
        context={heart ? (heart.isToday ? 'Day average' : 'Latest day average') : notConnected}
        onPress={() => router.push('/(app)/health/integrations' as Href)}
        accessibilityHint="Opens connected health sources"
      />
      <Tile
        icon="walk-outline"
        tint={colors.primary}
        label="Movement"
        value={
          activeMinutes !== null
            ? `${Math.max(activeMinutes, walkingMinutesFromSteps ?? 0)} min`
            : walkingMinutesFromSteps
              ? `≈ ${walkingMinutesFromSteps} min`
              : null
        }
        context={
          activeMinutes !== null && walkingMinutesFromSteps
            ? 'Larger of logged and step-measured'
            : activeMinutes !== null
              ? 'Logged today'
              : walkingMinutesFromSteps
                ? 'Walking, measured by steps'
                : 'Nothing yet today'
        }
        onPress={() => router.push('/(app)/health/activity' as Href)}
        accessibilityHint="Opens activity log"
      />
    </View>
  );
}

function Tile({
  icon,
  tint,
  label,
  value,
  context,
  dial = null,
  spark,
  onPress,
  accessibilityHint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  label: string;
  value: string | null;
  context: string;
  dial?: number | null;
  /** Tiny bar sparkline (e.g. steps per hour today). */
  spark?: number[];
  onPress: () => void;
  accessibilityHint: string;
}) {
  const { colors, typography, spacing } = useTheme();
  const { track, arc } = useMemo(() => {
    const t = Skia.Path.Make();
    t.addArc({ x: DIAL / 2 - DIAL_R, y: DIAL / 2 - DIAL_R, width: DIAL_R * 2, height: DIAL_R * 2 }, -90, 359.9);
    return { track: t, arc: t.copy() };
  }, []);

  return (
    <View style={styles.cell}>
      <Card
        onPress={onPress}
        accessibilityLabel={`${label}: ${value ?? context}${value ? `, ${context}` : ''}. ${accessibilityHint}`}
        style={[styles.card, { padding: spacing.md }]}
      >
        <View style={styles.head}>
          <View style={[styles.iconBox, { backgroundColor: colors.primaryAlpha }]}>
            <Ionicons name={icon} size={17} color={tint} />
          </View>
          {spark ? (
            <View style={styles.spark}>
              {spark.map((n, i) => (
                <View
                  key={i}
                  style={[
                    styles.sparkBar,
                    {
                      height: n > 0 ? Math.max(2, (n / Math.max(1, ...spark)) * 26) : 1,
                      backgroundColor: i === new Date().getHours() ? tint : colors.surface3,
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}
          {dial !== null ? (
            <Canvas style={styles.dial}>
              <Path path={track} style="stroke" strokeWidth={DIAL_STROKE} color={colors.surface2} />
              <Path
                path={arc}
                style="stroke"
                strokeWidth={DIAL_STROKE}
                strokeCap="round"
                color={tint}
                start={0}
                end={dial}
              />
            </Canvas>
          ) : null}
        </View>
        <Text numberOfLines={1} style={[typography.caption, { color: colors.text.secondary }]}>
          {label}
        </Text>
        <Text
          numberOfLines={1}
          style={[typography.subheading, { color: value ? colors.text.primary : colors.text.muted }]}
        >
          {value ?? '—'}
        </Text>
        <Text numberOfLines={2} style={[typography.caption, { color: colors.text.muted }]}>
          {context}
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  cell: { width: '48.6%' },
  card: { minHeight: 118 },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    minHeight: DIAL,
  },
  iconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dial: { width: DIAL, height: DIAL },
  spark: { flexDirection: 'row', alignItems: 'flex-end', height: 28, width: 76, gap: 1 },
  sparkBar: { flex: 1, borderRadius: 1 },
});
