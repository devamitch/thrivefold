import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { hourLabel, stepInsights } from '../../domain/activity/stepInsights';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';

interface Props {
  steps: number;
  /** 24 hourly counts for today; missing on data saved before hourly tracking. */
  hours?: number[];
  goal?: number;
  /** Tracking started today at this time (ms); earlier steps are unknown. */
  since?: number | null;
  onPress?: () => void;
}

const CHART_H = 64;

/**
 * Today's steps from the phone's own counter, updating while the screen is open: the live total
 * against the goal, steps per hour (when you moved), and clearly labelled estimates.
 */
export function LiveStepsCard({ steps, hours, goal = 8000, since, onPress }: Props) {
  const { colors, typography, spacing } = useTheme();
  const reduce = useReducedMotion();
  const nowHour = new Date().getHours();
  const info = stepInsights(steps, hours);
  const max = Math.max(1, ...(hours ?? [0]));
  const share = Math.min(1, steps / Math.max(1, goal));

  // A small pulse on the live dot; one gentle loop, off under reduced motion.
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (reduce) return;
    pulse.value = withRepeat(
      withSequence(withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 900 })),
      -1,
    );
  }, [pulse, reduce]);
  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Card onPress={onPress} accessibilityLabel={`Steps today ${steps} of ${goal}, live from your phone`}>
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: colors.primaryAlpha }]}>
          <Ionicons name="footsteps-outline" size={17} color={colors.primary} />
        </View>
        <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>Steps today</Text>
        <Animated.View style={[styles.liveDot, { backgroundColor: colors.success }, dotStyle]} />
        <Text style={[typography.captionBold, { color: colors.success }]}>Live</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={[typography.heading, styles.total, { color: colors.text.primary }]}>
          {steps.toLocaleString()}
        </Text>
        <Text style={[typography.caption, { color: colors.text.muted, marginLeft: 6 }]}>
          of {goal.toLocaleString()}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surface1 }]}>
        <View style={[styles.fill, { width: `${share * 100}%`, backgroundColor: colors.primary }]} />
      </View>

      {hours ? (
        <>
          <View style={styles.chart} accessible accessibilityLabel="Steps per hour today">
            {hours.map((n, h) => (
              <View key={h} style={styles.slot}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: n > 0 ? Math.max(3, (n / max) * CHART_H) : 2,
                      backgroundColor:
                        h === nowHour ? colors.primary : h > nowHour ? colors.surface1 : n > 0 ? colors.accent : colors.surface2,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.axis}>
            {['12 am', '6 am', '12 pm', '6 pm', ''].map((l, i) => (
              <Text key={i} style={[typography.caption, styles.axisLabel, { color: colors.text.muted }]}>
                {l}
              </Text>
            ))}
          </View>
        </>
      ) : null}

      <View style={[styles.stats, { marginTop: spacing.sm }]}>
        <Stat label="walking" value={`≈ ${info.walkingMinutes} min`} />
        <Stat label="distance" value={`≈ ${info.distanceKm} km`} />
        <Stat
          label="most active"
          value={info.peakHour !== null ? hourLabel(info.peakHour) : '—'}
        />
      </View>
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>
        Phone step counter{since ? ` · counting since ${new Date(since).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : ''} · ≈ values are estimates
      </Text>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  totalRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 10 },
  total: { fontSize: 34, lineHeight: 40 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  fill: { height: '100%', borderRadius: 3 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: CHART_H, marginTop: 14, gap: 2 },
  slot: { flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 2 },
  axis: { flexDirection: 'row', marginTop: 4 },
  axisLabel: { flex: 1, fontSize: 10 },
  stats: { flexDirection: 'row' },
  stat: { flex: 1 },
});
