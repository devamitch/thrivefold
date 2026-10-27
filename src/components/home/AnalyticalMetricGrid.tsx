import { Ionicons } from '@expo/vector-icons';
import { Canvas, LinearGradient, Path, Skia, vec } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { useRouter, type Href } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';

interface Props {
  stepsCount: number | null;
  stepsTarget?: number;
  sleepMinutes: number | null;
  heartRateAvg: number | null;
  hydrationCount: number;
  hydrationTarget?: number;
  onIncrementHydration: () => void;
}

const MINI_DIAL_SIZE = 44;
const MINI_STROKE = 4.5;
const MINI_PAD = MINI_STROKE / 2 + 1;
const MINI_RADIUS = (MINI_DIAL_SIZE - MINI_PAD * 2) / 2;

export function AnalyticalMetricGrid({
  stepsCount,
  stepsTarget = 8000,
  sleepMinutes,
  heartRateAvg,
  hydrationCount,
  hydrationTarget = 8,
  onIncrementHydration,
}: Props) {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  // Steps Progress Arc
  const stepsRatio = Math.min(1, (stepsCount ?? 0) / Math.max(1, stepsTarget));
  const { stepsTrackPath, stepsActivePath } = useMemo(() => {
    const track = Skia.Path.Make();
    track.addArc(
      { x: MINI_PAD, y: MINI_PAD, width: MINI_RADIUS * 2, height: MINI_RADIUS * 2 },
      -90,
      360,
    );

    const active = Skia.Path.Make();
    const sweep = Math.max(0.1, 360 * stepsRatio);
    active.addArc(
      { x: MINI_PAD, y: MINI_PAD, width: MINI_RADIUS * 2, height: MINI_RADIUS * 2 },
      -90,
      sweep,
    );

    return { stepsTrackPath: track, stepsActivePath: active };
  }, [stepsRatio]);

  // Sleep Display
  const sleepDisplay = useMemo(() => {
    if (!sleepMinutes || sleepMinutes <= 0) return 'No log yet';
    const h = Math.floor(sleepMinutes / 60);
    const m = Math.round(sleepMinutes % 60);
    return `${h}h ${m}m`;
  }, [sleepMinutes]);

  // Sleep Ratio (target 8h = 480m)
  const sleepRatio = Math.min(1, (sleepMinutes ?? 0) / 480);
  const { sleepTrackPath, sleepActivePath } = useMemo(() => {
    const track = Skia.Path.Make();
    track.addArc(
      { x: MINI_PAD, y: MINI_PAD, width: MINI_RADIUS * 2, height: MINI_RADIUS * 2 },
      140,
      260,
    );

    const active = Skia.Path.Make();
    const sweep = Math.max(0.1, 260 * sleepRatio);
    active.addArc(
      { x: MINI_PAD, y: MINI_PAD, width: MINI_RADIUS * 2, height: MINI_RADIUS * 2 },
      140,
      sweep,
    );

    return { sleepTrackPath: track, sleepActivePath: active };
  }, [sleepRatio]);

  const handleAddWater = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onIncrementHydration();
  };

  return (
    <View style={styles.grid}>
      {/* 1. Steps Card */}
      <View style={styles.cell}>
        <Card
          onPress={() => router.push('/(app)/health/integrations' as Href)}
          style={[styles.metricCard, { padding: spacing.md }]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: colors.surface1 }]}>
              <Ionicons name="footsteps-outline" size={18} color={colors.primary} />
            </View>
            {/* Mini Skia Arc Gauge */}
            <View style={styles.dialBox}>
              <Canvas style={styles.canvas}>
                <Path
                  path={stepsTrackPath}
                  style="stroke"
                  strokeWidth={MINI_STROKE}
                  color={colors.surface2}
                />
                <Path
                  path={stepsActivePath}
                  style="stroke"
                  strokeWidth={MINI_STROKE}
                  strokeCap="round"
                  color={colors.primary}
                />
              </Canvas>
              <Text style={[typography.caption, styles.dialCenterText, { color: colors.text.muted }]}>
                {Math.round(stepsRatio * 100)}%
              </Text>
            </View>
          </View>

          <Text style={[typography.subheading, styles.metricVal, { color: colors.text.primary }]}>
            {stepsCount !== null ? stepsCount.toLocaleString() : '—'}
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            {stepsCount !== null ? `of ${stepsTarget.toLocaleString()} steps` : 'Connect steps'}
          </Text>
        </Card>
      </View>

      {/* 2. Sleep Card */}
      <View style={styles.cell}>
        <Card
          onPress={() => router.push('/(app)/health/integrations' as Href)}
          style={[styles.metricCard, { padding: spacing.md }]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: colors.surface1 }]}>
              <Ionicons name="moon-outline" size={18} color={colors.primary} />
            </View>
            {/* Mini Sleep Arc */}
            <View style={styles.dialBox}>
              <Canvas style={styles.canvas}>
                <Path
                  path={sleepTrackPath}
                  style="stroke"
                  strokeWidth={MINI_STROKE}
                  strokeCap="round"
                  color={colors.surface2}
                />
                <Path
                  path={sleepActivePath}
                  style="stroke"
                  strokeWidth={MINI_STROKE}
                  strokeCap="round"
                  color={colors.accent}
                />
              </Canvas>
              <Text style={[typography.caption, styles.dialCenterText, { color: colors.text.muted }]}>
                {Math.round(sleepRatio * 100)}%
              </Text>
            </View>
          </View>

          <Text style={[typography.subheading, styles.metricVal, { color: colors.text.primary }]}>
            {sleepDisplay}
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            Last night · 8h goal
          </Text>
        </Card>
      </View>

      {/* 3. Resting Heart Rate Card with Equalizer Waveform */}
      <View style={styles.cell}>
        <Card
          onPress={() => router.push('/(app)/health/integrations' as Href)}
          style={[styles.metricCard, { padding: spacing.md }]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: colors.surface1 }]}>
              <Ionicons name="heart-outline" size={18} color={colors.error} />
            </View>
            {/* 7-bar mini pulse equalizer */}
            <View style={styles.equalizerRow}>
              {[12, 22, 16, 26, 14, 20, 10].map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.eqBar,
                    {
                      height: h,
                      backgroundColor: heartRateAvg ? colors.primary : colors.surface2,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <Text style={[typography.subheading, styles.metricVal, { color: colors.text.primary }]}>
            {heartRateAvg !== null ? `${Math.round(heartRateAvg)} bpm` : '—'}
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            {heartRateAvg !== null ? 'Avg heart rate' : 'Connect HR monitor'}
          </Text>
        </Card>
      </View>

      {/* 4. Hydration Card with Interactive Quick-Tap */}
      <View style={styles.cell}>
        <Card style={[styles.metricCard, { padding: spacing.md }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: colors.surface1 }]}>
              <Ionicons name="water-outline" size={18} color={colors.info} />
            </View>
            {/* Interactive + button */}
            <PressableScale
              onPress={handleAddWater}
              style={[styles.addWaterBtn, { backgroundColor: colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Add one glass of water"
            >
              <Ionicons name="add" size={16} color={colors.onPrimary} />
            </PressableScale>
          </View>

          <Text style={[typography.subheading, styles.metricVal, { color: colors.text.primary }]}>
            {hydrationCount} of {hydrationTarget} cups
          </Text>

          {/* 8 mini water droplets / pills */}
          <View style={styles.waterDotsRow}>
            {Array.from({ length: hydrationTarget }).map((_, i) => {
              const isFilled = i < hydrationCount;
              return (
                <View
                  key={i}
                  style={[
                    styles.waterDot,
                    {
                      backgroundColor: isFilled ? colors.info : colors.surface2,
                    },
                  ]}
                />
              );
            })}
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  cell: {
    width: '48.5%',
  },
  metricCard: {
    minHeight: 124,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialBox: {
    width: MINI_DIAL_SIZE,
    height: MINI_DIAL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: MINI_DIAL_SIZE,
    height: MINI_DIAL_SIZE,
  },
  dialCenterText: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '700',
  },
  equalizerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 28,
    gap: 3,
    paddingRight: 4,
  },
  eqBar: {
    width: 3,
    borderRadius: 1.5,
  },
  metricVal: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  addWaterBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterDotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  waterDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
});
