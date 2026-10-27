import { Canvas, LinearGradient, Path, Skia, vec } from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { VitalityTier } from '../../domain/analytics/dashboardAnalytics';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';

const GAUGE_SIZE = 190;
const STROKE_WIDTH = 13;
const PADDING = STROKE_WIDTH / 2 + 4;
const RADIUS = (GAUGE_SIZE - PADDING * 2) / 2;
const START_ANGLE = 145; // Degrees
const TOTAL_SWEEP = 250; // Degrees

interface Props {
  score: number;
  tier: VitalityTier;
  label: string;
  subtext: string;
  hasCheckInToday: boolean;
  energy: number | null;
  mood: number | null;
  sleepHours: number | null;
  questsDone: number;
  questsTotal: number;
  points: number;
  target: number;
  level: number;
  xpToNext: number | null;
  onCheckIn: () => void;
  onRoadmap: () => void;
}

export function VitalityRingGauge({
  score,
  label,
  subtext,
  hasCheckInToday,
  energy,
  mood,
  sleepHours,
  questsDone,
  questsTotal,
  points,
  target,
  level,
  xpToNext,
  onCheckIn,
  onRoadmap,
}: Props) {
  const { colors, typography, spacing } = useTheme();

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(1, score / 100)), {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [score, progress]);

  // Track arc (background)
  const trackPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addArc(
      {
        x: PADDING,
        y: PADDING,
        width: RADIUS * 2,
        height: RADIUS * 2,
      },
      START_ANGLE,
      TOTAL_SWEEP,
    );
    return p;
  }, []);

  // Animated active arc
  const activePath = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const currentSweep = Math.max(0.1, TOTAL_SWEEP * progress.value);
    p.addArc(
      {
        x: PADDING,
        y: PADDING,
        width: RADIUS * 2,
        height: RADIUS * 2,
      },
      START_ANGLE,
      currentSweep,
    );
    return p;
  }, [progress]);

  return (
    <SquircleSurface
      radius={28}
      fill={colors.primary}
      style={[styles.card, { padding: spacing.lg }]}
    >
      <View style={styles.topRow}>
        <View style={styles.headerText}>
          <Text style={[typography.label, { color: colors.onPrimaryMuted }]}>Vitality Score</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.onPrimarySurface }]}>
              <View style={[styles.indicatorDot, { backgroundColor: colors.onPrimary }]} />
              <Text style={[typography.caption, { color: colors.onPrimary, fontWeight: '700' }]}>
                {label}
              </Text>
            </View>
          </View>
          <Text
            style={[typography.caption, { color: colors.onPrimaryMuted, marginTop: 6 }]}
            numberOfLines={2}
          >
            {subtext}
          </Text>
        </View>

        {/* Circular Gauge */}
        <View
          style={styles.gaugeContainer}
          accessible
          accessibilityLabel={`Vitality score: ${score} out of 100, ${label}`}
        >
          <Canvas style={styles.canvas}>
            {/* Background Track */}
            <Path
              path={trackPath}
              style="stroke"
              strokeWidth={STROKE_WIDTH}
              strokeCap="round"
              color={colors.onPrimarySurface}
            />
            {/* Active Foreground Progress Arc */}
            <Path
              path={activePath}
              style="stroke"
              strokeWidth={STROKE_WIDTH}
              strokeCap="round"
            >
              <LinearGradient
                start={vec(PADDING, PADDING)}
                end={vec(GAUGE_SIZE - PADDING, GAUGE_SIZE - PADDING)}
                colors={[colors.onPrimary, colors.onPrimaryMuted]}
              />
            </Path>
          </Canvas>

          {/* Center Score Readout */}
          <View style={[StyleSheet.absoluteFill, styles.gaugeCenter]}>
            <Text style={[typography.display, { color: colors.onPrimary, lineHeight: 38 }]}>
              {score}
            </Text>
            <Text style={[typography.caption, { color: colors.onPrimaryMuted, marginTop: -2 }]}>
              Out of 100
            </Text>
          </View>
        </View>
      </View>

      {/* Micro-metrics Row */}
      {hasCheckInToday ? (
        <PressableScale
          onPress={onCheckIn}
          accessibilityRole="button"
          accessibilityLabel="Update today's check-in metrics"
        >
          <View style={[styles.metricsRow, { marginTop: spacing.md }]}>
            <SquircleSurface
              radius={14}
              fill={colors.onPrimarySurface}
              style={styles.metricItem}
            >
              <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>
                {energy !== null ? `${energy}/10` : '—'}
              </Text>
              <Text style={[typography.caption, { color: colors.onPrimaryMuted }]}>Energy</Text>
            </SquircleSurface>

            <SquircleSurface
              radius={14}
              fill={colors.onPrimarySurface}
              style={styles.metricItem}
            >
              <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>
                {mood !== null ? `${mood}/10` : '—'}
              </Text>
              <Text style={[typography.caption, { color: colors.onPrimaryMuted }]}>Mood</Text>
            </SquircleSurface>

            <SquircleSurface
              radius={14}
              fill={colors.onPrimarySurface}
              style={styles.metricItem}
            >
              <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>
                {questsTotal > 0 ? `${questsDone}/${questsTotal}` : `${points} pts`}
              </Text>
              <Text style={[typography.caption, { color: colors.onPrimaryMuted }]}>Quests</Text>
            </SquircleSurface>

            <SquircleSurface
              radius={14}
              fill={colors.onPrimarySurface}
              style={styles.metricItem}
            >
              <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>
                {sleepHours !== null ? `${sleepHours}h` : '—'}
              </Text>
              <Text style={[typography.caption, { color: colors.onPrimaryMuted }]}>Sleep</Text>
            </SquircleSurface>
          </View>
        </PressableScale>
      ) : (
        <PressableScale
          onPress={onCheckIn}
          accessibilityRole="button"
          accessibilityLabel="Start check-in to complete today's vitality score"
        >
          <SquircleSurface
            radius={16}
            fill={colors.onPrimary}
            style={[styles.cta, { marginTop: spacing.md }]}
          >
            <Ionicons name="sunny-outline" size={18} color={colors.primary} />
            <Text style={[typography.bodyBold, { color: colors.primary }]}>
              Check in · 1 minute
            </Text>
          </SquircleSurface>
        </PressableScale>
      )}

      {/* Level & Roadmap Bar */}
      <PressableScale
        onPress={onRoadmap}
        accessibilityRole="button"
        accessibilityLabel={`Level ${level}. Open roadmap`}
      >
        <View style={[styles.levelRow, { marginTop: spacing.md }]}>
          <Text style={[typography.subbodyBold, { color: colors.onPrimary }]}>Level {level}</Text>
          <Text
            style={[typography.caption, styles.flex, { color: colors.onPrimaryMuted }]}
            numberOfLines={1}
          >
            {xpToNext !== null
              ? ` · ${xpToNext} XP to next level · ${points}/${target} pts`
              : ` · ${points}/${target} daily points`}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.onPrimaryMuted} />
        </View>
      </PressableScale>
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  gaugeContainer: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
  },
  gaugeCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  cta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
  },
  levelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 32,
  },
  flex: {
    flex: 1,
    marginLeft: 4,
  },
});
