import { Ionicons } from '@expo/vector-icons';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useRouter, type Href } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';

export interface MetricGridProps {
  /** Latest daily step total from a connected source. */
  steps: { value: number; date: string; isToday: boolean } | null;
  stepsGoal?: number;
  sleep: { minutes: number; source: 'health_connect' | 'check_in' } | null;
  heart: { bpm: number; isToday: boolean } | null;
  /** Minutes the person logged today (activities and workouts); null when nothing was logged. */
  activeMinutes: number | null;
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
  connected,
}: MetricGridProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const notConnected = connected ? 'No reading yet' : 'Not connected';

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
        context={
          steps
            ? `of ${stepsGoal.toLocaleString()} · Health Connect`
            : notConnected
        }
        dial={steps ? Math.min(1, steps.value / stepsGoal) : null}
        onPress={() => router.push('/(app)/health/integrations' as Href)}
        accessibilityHint="Opens connected health sources"
      />
      <Tile
        icon="moon-outline"
        tint={colors.accent}
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
        tint={colors.error}
        label="Heart rate"
        value={heart ? `${Math.round(heart.bpm)} bpm` : null}
        context={heart ? (heart.isToday ? 'Day average' : 'Latest day average') : notConnected}
        onPress={() => router.push('/(app)/health/integrations' as Href)}
        accessibilityHint="Opens connected health sources"
      />
      <Tile
        icon="walk-outline"
        tint={colors.success}
        label="Movement"
        value={activeMinutes !== null ? `${activeMinutes} min` : null}
        context={activeMinutes !== null ? 'Logged today' : 'Nothing logged today'}
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
  onPress,
  accessibilityHint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  label: string;
  value: string | null;
  context: string;
  dial?: number | null;
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
          <View style={[styles.iconBox, { backgroundColor: colors.surface1 }]}>
            <Ionicons name={icon} size={17} color={tint} />
          </View>
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
});
