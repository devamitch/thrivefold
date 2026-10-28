import { Ionicons } from '@expo/vector-icons';
import { Canvas, LinearGradient, Path, Skia, vec } from '@shopify/react-native-skia';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Easing,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { VitalityTier } from '../../domain/analytics/dashboardAnalytics';
import { hapticLight } from '../../services/haptics';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';

const GAUGE_SIZE = 168;
const START_ANGLE = 140; // Degrees
const TOTAL_SWEEP = 260; // Degrees
const NUM_TICKS = 24;

// Concentric ring radii & stroke widths
const R_POINTS = 62;
const W_POINTS = 5.5;

const R_QUESTS = 50;
const W_QUESTS = 4.5;

const R_WATER = 39;
const W_WATER = 3.5;

interface Props {
  score: number;
  tier?: VitalityTier;
  label: string;
  subtext: string;
  hasCheckInToday: boolean;
  energy: number | null;
  mood: number | null;
  sleepHours: number | null;
  hydrationGlasses?: number | null;
  hydrationTargetGlasses?: number;
  questsDone: number;
  questsTotal: number;
  points: number;
  target: number;
  level: number;
  xpToNext: number | null;
  onCheckIn: () => void;
  onRoadmap: () => void;
  eyebrow?: string;
  greeting?: string;
  subtitle?: string;
  onMenuPress?: () => void;
  fullWidth?: boolean;
  topInset?: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));

/**
 * Concentric Gear & Goal Gauge
 *
 * Implements a high-precision, luxury radial dial using React Native Skia:
 * - Outer Perimeter: 24 radial gear teeth / tick marks that illuminate with level & points.
 * - Outer Ring: Daily Points & Level Goal progress (luminous champagne gradient).
 * - Middle Ring: Today's Quests Goal progress (warm terracotta/amber gradient).
 * - Inner Ring: Water Hydration Goal progress (serene cyan/ocean gradient).
 * - Interactive: Tap to switch center readout between Today's Goals and Vitality Readiness.
 * - Micro-metrics row: 5 squircle tiles (Energy, Mood, Quests, Sleep, Water) or Check-in CTA.
 * - Level & Roadmap row.
 * - Performance: Paths are static and memoized; progress uses Skia's native path trimming engine
 *   so zero paths are created during scroll.
 */
export function VitalityRingGauge({
  score,
  label,
  subtext,
  hasCheckInToday,
  energy,
  mood,
  sleepHours,
  hydrationGlasses,
  hydrationTargetGlasses = 8,
  questsDone,
  questsTotal,
  points,
  target,
  level,
  xpToNext,
  onCheckIn,
  onRoadmap,
  eyebrow,
  greeting,
  subtitle,
  onMenuPress,
  fullWidth = false,
  topInset = 0,
}: Props) {
  const { colors, typography, spacing } = useTheme();
  const reduce = useReducedMotion();
  const [displayMode, setDisplayMode] = useState<'goals' | 'vitality'>('goals');

  const cx = GAUGE_SIZE / 2;
  const cy = GAUGE_SIZE / 2;
  const tickStep = TOTAL_SWEEP / (NUM_TICKS - 1);

  // Animated shared values for ring trims
  const progressPoints = useSharedValue(0);
  const progressQuests = useSharedValue(0);
  const progressWater = useSharedValue(0);

  const waterCount = hydrationGlasses ?? 0;
  const showVitality = displayMode === 'vitality' && hasCheckInToday;

  const pOuter = showVitality ? clamp01(score / 100) : clamp01(points / Math.max(1, target));
  const pMiddle = questsTotal > 0 ? clamp01(questsDone / questsTotal) : 0;
  const pInner = clamp01(waterCount / Math.max(1, hydrationTargetGlasses));

  useEffect(() => {
    const go = (v: typeof progressPoints, to: number, duration: number) => {
      v.value = reduce
        ? to
        : withTiming(to, { duration, easing: Easing.out(Easing.cubic) });
    };
    go(progressPoints, pOuter, 1100);
    go(progressQuests, pMiddle, 1000);
    go(progressWater, pInner, 900);
  }, [pOuter, pMiddle, pInner, reduce, progressPoints, progressQuests, progressWater]);

  // 1. Static background gear ticks path (24 notches)
  const bgTicksPath = useMemo(() => {
    const p = Skia.Path.Make();
    for (let i = 0; i < NUM_TICKS; i++) {
      const angleDeg = START_ANGLE + i * tickStep;
      const rad = (angleDeg * Math.PI) / 180;
      const x1 = cx + 72 * Math.cos(rad);
      const y1 = cy + 72 * Math.sin(rad);
      const x2 = cx + 80 * Math.cos(rad);
      const y2 = cy + 80 * Math.sin(rad);
      p.moveTo(x1, y1);
      p.lineTo(x2, y2);
    }
    return p;
  }, [cx, cy, tickStep]);

  // 2. Active illuminated gear ticks (recalculated only on data change)
  const activeTicksPath = useMemo(() => {
    const p = Skia.Path.Make();
    const activeFrac = showVitality ? clamp01(score / 100) : clamp01(points / Math.max(1, target));
    const activeCount = Math.round(NUM_TICKS * activeFrac);
    for (let i = 0; i < activeCount; i++) {
      const angleDeg = START_ANGLE + i * tickStep;
      const rad = (angleDeg * Math.PI) / 180;
      const x1 = cx + 72 * Math.cos(rad);
      const y1 = cy + 72 * Math.sin(rad);
      const x2 = cx + 80 * Math.cos(rad);
      const y2 = cy + 80 * Math.sin(rad);
      p.moveTo(x1, y1);
      p.lineTo(x2, y2);
    }
    return p;
  }, [showVitality, score, points, target, cx, cy, tickStep]);

  // 3. Static background ring track paths (full 260° sweep)
  const trackPointsPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addArc(
      { x: cx - R_POINTS, y: cy - R_POINTS, width: R_POINTS * 2, height: R_POINTS * 2 },
      START_ANGLE,
      TOTAL_SWEEP,
    );
    return p;
  }, [cx, cy]);

  const trackQuestsPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addArc(
      { x: cx - R_QUESTS, y: cy - R_QUESTS, width: R_QUESTS * 2, height: R_QUESTS * 2 },
      START_ANGLE,
      TOTAL_SWEEP,
    );
    return p;
  }, [cx, cy]);

  const trackWaterPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addArc(
      { x: cx - R_WATER, y: cy - R_WATER, width: R_WATER * 2, height: R_WATER * 2 },
      START_ANGLE,
      TOTAL_SWEEP,
    );
    return p;
  }, [cx, cy]);

  const toggleDisplayMode = () => {
    if (!hasCheckInToday) return;
    hapticLight();
    setDisplayMode((m) => (m === 'goals' ? 'vitality' : 'goals'));
  };

  const ContainerComp = fullWidth ? View : SquircleSurface;
  const containerProps = fullWidth
    ? {
        style: [
          styles.card,
          {
            backgroundColor: colors.primary,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            paddingTop: topInset,
            paddingHorizontal: spacing.lg,
            paddingBottom: 22,
            width: '100%' as const,
          },
        ],
      }
    : {
        radius: 28,
        fill: colors.primary,
        style: [styles.card, { padding: spacing.lg }],
      };

  return (
    <ContainerComp {...containerProps}>
      {/* Eyebrow & Hero Header */}
      {eyebrow || (onMenuPress && !fullWidth) ? (
        <View style={styles.heroTopBar}>
          {eyebrow ? (
            <Text
              style={[
                typography.captionBold,
                {
                  color: colors.onPrimaryMuted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontSize: 11,
                },
              ]}
            >
              {eyebrow}
            </Text>
          ) : null}
          {onMenuPress && !fullWidth ? (
            <PressableScale
              onPress={onMenuPress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Open navigation menu"
              style={[styles.menuButton, { backgroundColor: colors.onPrimarySurface }]}
            >
              <Ionicons name="menu-outline" size={20} color={colors.onPrimary} />
            </PressableScale>
          ) : null}
        </View>
      ) : null}

      {greeting ? (
        <View style={styles.greetingBlock}>
          <Text
            style={[
              typography.heading,
              { color: colors.onPrimary, fontSize: 23, lineHeight: 27, letterSpacing: -0.4 },
            ]}
          >
            {greeting}
          </Text>
          {subtitle ? (
            <Text
              style={[
                typography.caption,
                { color: colors.onPrimaryMuted, marginTop: 2, fontSize: 12, lineHeight: 16 },
              ]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Hero Dial & Info Row */}
      <View style={styles.topRow}>
        <View style={styles.headerText}>
          {/* Header Title & Switcher Pill */}
          <View style={styles.modeSwitchRow}>
            <PressableScale
              onPress={toggleDisplayMode}
              disabled={!hasCheckInToday}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Switch mode. Current: ${displayMode === 'goals' ? 'Daily Goals' : 'Vitality Readiness'}`}
            >
              <SquircleSurface
                radius={10}
                fill={colors.onPrimarySurface}
                style={styles.modePill}
              >
                <Ionicons
                  name={displayMode === 'goals' ? 'disc-outline' : 'sparkles-outline'}
                  size={13}
                  color={colors.onPrimary}
                  style={{ marginRight: 5 }}
                />
                <Text style={[typography.captionBold, { color: colors.onPrimary, fontSize: 11 }]}>
                  {displayMode === 'goals' ? 'Today’s Goals' : 'Vitality Score'}
                </Text>
              </SquircleSurface>
            </PressableScale>
          </View>

          {/* Badge & Subtext */}
          <View style={[styles.badgeRow, { marginTop: 6 }]}>
            <View style={[styles.badge, { backgroundColor: colors.onPrimarySurface }]}>
              <View
                style={[
                  styles.indicatorDot,
                  { backgroundColor: displayMode === 'goals' ? colors.accent : colors.onPrimary },
                ]}
              />
              <Text style={[typography.caption, { color: colors.onPrimary, fontWeight: '700' }]}>
                {displayMode === 'goals' ? `Level ${level}` : label}
              </Text>
            </View>
          </View>

          {displayMode === 'vitality' && subtext ? (
            <Text
              style={[typography.caption, { color: colors.onPrimaryMuted, marginTop: 4 }]}
              numberOfLines={2}
            >
              {subtext}
            </Text>
          ) : null}

          {/* Concentric Legend Chips */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.onPrimary }]} />
              <Text style={[typography.caption, { color: colors.onPrimaryMuted, fontSize: 11 }]}>
                {points}/{target} pts
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
              <Text style={[typography.caption, { color: colors.onPrimaryMuted, fontSize: 11 }]}>
                {questsDone}/{questsTotal} q
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.info }]} />
              <Text style={[typography.caption, { color: colors.onPrimaryMuted, fontSize: 11 }]}>
                {waterCount}/{hydrationTargetGlasses} c
              </Text>
            </View>
          </View>
        </View>

        {/* Concentric Gear & Goal Gauge Canvas */}
        <PressableScale
          onPress={toggleDisplayMode}
          disabled={!hasCheckInToday}
          scaleTo={0.97}
          style={styles.gaugeContainer}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Concentric goal gauge: ${points} of ${target} points, ${questsDone} of ${questsTotal} quests, ${waterCount} of ${hydrationTargetGlasses} cups water. Tap to toggle view.`}
        >
          <Canvas style={styles.canvas}>
            {/* 1. Background Gear Notches */}
            <Path
              path={bgTicksPath}
              style="stroke"
              strokeWidth={2}
              color={colors.onPrimarySurface}
            />

            {/* 2. Active Illuminated Gear Notches */}
            <Path
              path={activeTicksPath}
              style="stroke"
              strokeWidth={2.4}
              strokeCap="round"
              color={colors.accent}
            />

            {/* 3. Outer Ring Background & Active Arc (Points / Level) */}
            <Path
              path={trackPointsPath}
              style="stroke"
              strokeWidth={W_POINTS}
              strokeCap="round"
              color={colors.onPrimarySurface}
            />
            <Path
              path={trackPointsPath}
              style="stroke"
              strokeWidth={W_POINTS}
              strokeCap="round"
              start={0}
              end={progressPoints}
            >
              <LinearGradient
                start={vec(cx - R_POINTS, cy - R_POINTS)}
                end={vec(cx + R_POINTS, cy + R_POINTS)}
                colors={[colors.onPrimary, colors.accent]}
              />
            </Path>

            {/* 4. Middle Ring Background & Active Arc (Quests Goal) */}
            <Path
              path={trackQuestsPath}
              style="stroke"
              strokeWidth={W_QUESTS}
              strokeCap="round"
              color={colors.onPrimarySurface}
            />
            <Path
              path={trackQuestsPath}
              style="stroke"
              strokeWidth={W_QUESTS}
              strokeCap="round"
              start={0}
              end={progressQuests}
            >
              <LinearGradient
                start={vec(cx - R_QUESTS, cy - R_QUESTS)}
                end={vec(cx + R_QUESTS, cy + R_QUESTS)}
                colors={[colors.accent, colors.warning]}
              />
            </Path>

            {/* 5. Inner Ring Background & Active Arc (Hydration Goal) */}
            <Path
              path={trackWaterPath}
              style="stroke"
              strokeWidth={W_WATER}
              strokeCap="round"
              color={colors.onPrimarySurface}
            />
            <Path
              path={trackWaterPath}
              style="stroke"
              strokeWidth={W_WATER}
              strokeCap="round"
              start={0}
              end={progressWater}
            >
              <LinearGradient
                start={vec(cx - R_WATER, cy - R_WATER)}
                end={vec(cx + R_WATER, cy + R_WATER)}
                colors={[colors.info, colors.onPrimary]}
              />
            </Path>
          </Canvas>

          {/* Center Readout */}
          <View style={[StyleSheet.absoluteFill, styles.gaugeCenter]}>
            <Text
              style={[
                typography.heading,
                { color: colors.onPrimary, fontSize: 26, lineHeight: 28 },
              ]}
            >
              {displayMode === 'goals' ? points : score}
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.onPrimaryMuted, fontSize: 10, marginTop: 1 },
              ]}
            >
              {displayMode === 'goals' ? `of ${target} pts` : 'Vitality / 100'}
            </Text>
            <View
              style={[
                styles.centerMiniBadge,
                { backgroundColor: colors.onPrimarySurface, marginTop: 4 },
              ]}
            >
              <Text style={{ color: colors.onPrimary, fontSize: 9, fontWeight: '700' }}>
                LVL {level}
              </Text>
            </View>
          </View>
        </PressableScale>
      </View>

      {/* Micro-metrics Row */}
      {hasCheckInToday ? (
        <PressableScale
          onPress={onCheckIn}
          accessibilityRole="button"
          accessibilityLabel="Update today's check-in metrics"
        >
          <View style={[styles.metricsRow, { marginTop: 10 }]}>
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

            <SquircleSurface
              radius={14}
              fill={colors.onPrimarySurface}
              style={styles.metricItem}
            >
              <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>
                {`${waterCount}c`}
              </Text>
              <Text style={[typography.caption, { color: colors.onPrimaryMuted }]}>Water</Text>
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
            style={[styles.cta, { marginTop: 10 }]}
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
        <View style={[styles.levelRow, { marginTop: 8 }]}>
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
    </ContainerComp>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
    marginBottom: 2,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingBlock: {
    marginBottom: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    paddingRight: 10,
  },
  modeSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
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
    paddingTop: 6,
  },
  centerMiniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
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
