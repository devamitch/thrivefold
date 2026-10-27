import { Canvas, LinearGradient, Path, Skia, vec } from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
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
import { hapticLight } from '../../services/haptics';

const GAUGE_SIZE = 196;
const START_ANGLE = 140; // Degrees
const TOTAL_SWEEP = 260; // Degrees
const NUM_TICKS = 24;

// Concentric ring radii & stroke widths
const R_POINTS = 73;
const W_POINTS = 6.5;

const R_QUESTS = 59;
const W_QUESTS = 5.5;

const R_WATER = 46;
const W_WATER = 4.5;

interface Props {
  score: number;
  tier: VitalityTier;
  label: string;
  subtext: string;
  hasCheckInToday: boolean;
  energy: number | null;
  mood: number | null;
  sleepHours: number | null;
  hydrationGlasses?: number | null;
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

/**
 * Concentric Gear & Goal Gauge
 *
 * Implements a high-precision, luxury radial dial using React Native Skia & Reanimated:
 * - Outer Perimeter: 24 radial gear teeth / tick marks that illuminate with level & points.
 * - Outer Ring: Daily Points & Level Goal progress (luminous champagne gradient).
 * - Middle Ring: Today's Quests Goal progress (warm terracotta/amber gradient).
 * - Inner Ring: Water Hydration Goal progress (serene cyan/ocean gradient).
 * - Interactive: Tap to switch center readout between Today's Goals and Vitality Readiness.
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
  const [displayMode, setDisplayMode] = useState<'goals' | 'vitality'>('goals');

  const cx = GAUGE_SIZE / 2;
  const cy = GAUGE_SIZE / 2;
  const tickStep = TOTAL_SWEEP / (NUM_TICKS - 1);

  // Animated shared values
  const progressPoints = useSharedValue(0);
  const progressQuests = useSharedValue(0);
  const progressWater = useSharedValue(0);
  const progressVitality = useSharedValue(0);

  useEffect(() => {
    const pPts = Math.min(1, Math.max(0, points / Math.max(1, target)));
    const pQst = questsTotal > 0 ? Math.min(1, Math.max(0, questsDone / questsTotal)) : 0;
    const pWat = Math.min(1, Math.max(0, (hydrationGlasses ?? 0) / 8));
    const pVit = Math.min(1, Math.max(0, score / 100));

    progressPoints.value = withTiming(pPts, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
    progressQuests.value = withTiming(pQst, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
    progressWater.value = withTiming(pWat, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
    progressVitality.value = withTiming(pVit, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [points, target, questsDone, questsTotal, hydrationGlasses, score, progressPoints, progressQuests, progressWater, progressVitality]);

  // 1. Static background gear ticks path
  const bgTicksPath = useMemo(() => {
    const p = Skia.Path.Make();
    for (let i = 0; i < NUM_TICKS; i++) {
      const angleDeg = START_ANGLE + i * tickStep;
      const rad = (angleDeg * Math.PI) / 180;
      const x1 = cx + 84 * Math.cos(rad);
      const y1 = cy + 84 * Math.sin(rad);
      const x2 = cx + 92 * Math.cos(rad);
      const y2 = cy + 92 * Math.sin(rad);
      p.moveTo(x1, y1);
      p.lineTo(x2, y2);
    }
    return p;
  }, [cx, cy, tickStep]);

  // 2. Active illuminated gear ticks
  const activeTicksPath = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const activeFrac = displayMode === 'goals' ? progressPoints.value : progressVitality.value;
    const activeCount = Math.round(NUM_TICKS * activeFrac);
    for (let i = 0; i < activeCount; i++) {
      const angleDeg = START_ANGLE + i * tickStep;
      const rad = (angleDeg * Math.PI) / 180;
      const x1 = cx + 84 * Math.cos(rad);
      const y1 = cy + 84 * Math.sin(rad);
      const x2 = cx + 92 * Math.cos(rad);
      const y2 = cy + 92 * Math.sin(rad);
      p.moveTo(x1, y1);
      p.lineTo(x2, y2);
    }
    return p;
  }, [displayMode]);

  // 3. Static background tracks for the 3 concentric rings
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

  // 4. Animated foreground concentric arcs
  const activePointsArc = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const frac = displayMode === 'goals' ? progressPoints.value : progressVitality.value;
    const sweep = Math.max(0.1, TOTAL_SWEEP * frac);
    p.addArc(
      { x: cx - R_POINTS, y: cy - R_POINTS, width: R_POINTS * 2, height: R_POINTS * 2 },
      START_ANGLE,
      sweep,
    );
    return p;
  }, [displayMode]);

  const activeQuestsArc = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const sweep = Math.max(0.1, TOTAL_SWEEP * progressQuests.value);
    p.addArc(
      { x: cx - R_QUESTS, y: cy - R_QUESTS, width: R_QUESTS * 2, height: R_QUESTS * 2 },
      START_ANGLE,
      sweep,
    );
    return p;
  });

  const activeWaterArc = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const sweep = Math.max(0.1, TOTAL_SWEEP * progressWater.value);
    p.addArc(
      { x: cx - R_WATER, y: cy - R_WATER, width: R_WATER * 2, height: R_WATER * 2 },
      START_ANGLE,
      sweep,
    );
    return p;
  });

  const toggleDisplayMode = () => {
    hapticLight();
    setDisplayMode((m) => (m === 'goals' ? 'vitality' : 'goals'));
  };

  const waterCount = hydrationGlasses ?? 0;

  const ContainerComp = fullWidth ? View : SquircleSurface;
  const containerProps = fullWidth
    ? {
        style: [
          styles.card,
          {
            backgroundColor: colors.primary,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            paddingTop: topInset + 10,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg + 34,
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
      {eyebrow || onMenuPress ? (
        <View style={styles.heroTopBar}>
          <Text
            style={[
              typography.captionBold,
              { color: colors.onPrimaryMuted, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11 },
            ]}
          >
            {eyebrow}
          </Text>
          {onMenuPress ? (
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
              { color: colors.onPrimary, fontSize: 26, lineHeight: 30, letterSpacing: -0.5 },
            ]}
          >
            {greeting}
          </Text>
          {subtitle ? (
            <Text
              style={[
                typography.caption,
                { color: colors.onPrimaryMuted, marginTop: 4, fontSize: 13, lineHeight: 18 },
              ]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.topRow}>
        <View style={styles.headerText}>
          {/* Header Title & Switcher Pill */}
          <View style={styles.modeSwitchRow}>
            <PressableScale
              onPress={toggleDisplayMode}
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
                  { backgroundColor: displayMode === 'goals' ? '#FCD34D' : colors.onPrimary },
                ]}
              />
              <Text style={[typography.caption, { color: colors.onPrimary, fontWeight: '700' }]}>
                {displayMode === 'goals' ? `Level ${level}` : label}
              </Text>
            </View>
          </View>

          <Text
            style={[typography.caption, { color: colors.onPrimaryMuted, marginTop: 6 }]}
            numberOfLines={2}
          >
            {displayMode === 'goals'
              ? `${questsDone} of ${questsTotal} quests · ${waterCount}/8 cups water`
              : subtext}
          </Text>

          {/* Concentric Legend Chips */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFFFFF' }]} />
              <Text style={[typography.caption, { color: colors.onPrimaryMuted, fontSize: 11 }]}>
                {points}/{target} pts
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
              <Text style={[typography.caption, { color: colors.onPrimaryMuted, fontSize: 11 }]}>
                {questsDone}/{questsTotal} q
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
              <Text style={[typography.caption, { color: colors.onPrimaryMuted, fontSize: 11 }]}>
                {waterCount}/8 c
              </Text>
            </View>
          </View>
        </View>

        {/* Concentric Gear & Goal Gauge Canvas */}
        <PressableScale
          onPress={toggleDisplayMode}
          scaleTo={0.97}
          style={styles.gaugeContainer}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Concentric goal gauge: ${points} of ${target} points, ${questsDone} of ${questsTotal} quests, ${waterCount} of 8 cups water. Tap to toggle view.`}
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
              color="#FCD34D"
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
              path={activePointsArc}
              style="stroke"
              strokeWidth={W_POINTS}
              strokeCap="round"
            >
              <LinearGradient
                start={vec(cx - R_POINTS, cy - R_POINTS)}
                end={vec(cx + R_POINTS, cy + R_POINTS)}
                colors={['#FFFFFF', '#FEF3C7']}
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
              path={activeQuestsArc}
              style="stroke"
              strokeWidth={W_QUESTS}
              strokeCap="round"
            >
              <LinearGradient
                start={vec(cx - R_QUESTS, cy - R_QUESTS)}
                end={vec(cx + R_QUESTS, cy + R_QUESTS)}
                colors={['#FBBF24', '#F97316']}
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
              path={activeWaterArc}
              style="stroke"
              strokeWidth={W_WATER}
              strokeCap="round"
            >
              <LinearGradient
                start={vec(cx - R_WATER, cy - R_WATER)}
                end={vec(cx + R_WATER, cy + R_WATER)}
                colors={['#38BDF8', '#0284C7']}
              />
            </Path>
          </Canvas>

          {/* Center Readout */}
          <View style={[StyleSheet.absoluteFill, styles.gaugeCenter]}>
            <Text style={[typography.heading, { color: colors.onPrimary, fontSize: 26, lineHeight: 28 }]}>
              {displayMode === 'goals' ? points : score}
            </Text>
            <Text style={[typography.caption, { color: colors.onPrimaryMuted, fontSize: 10, marginTop: 1 }]}>
              {displayMode === 'goals' ? `of ${target} pts` : 'Vitality / 100'}
            </Text>
            <View style={[styles.centerMiniBadge, { backgroundColor: colors.onPrimarySurface, marginTop: 4 }]}>
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
    minHeight: 40,
    marginBottom: 4,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingBlock: {
    marginBottom: 12,
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
    paddingVertical: 8,
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
