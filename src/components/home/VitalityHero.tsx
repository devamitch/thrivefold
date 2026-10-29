import { Ionicons } from '@expo/vector-icons';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Easing, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../../theme/useTheme';
import { useRouter, type Href } from 'expo-router';
import { Avatar } from '../ui/Avatar';
import { PressableScale } from '../ui/PressableScale';

const RING = 104;
const START = 135;
const SWEEP = 270;
/** Outer to inner: points, quests, water. */
const ARCS = [
  { r: 46, w: 6 },
  { r: 36, w: 5 },
  { r: 27, w: 4 },
] as const;

export interface HeroAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel?: string;
}

export interface VitalityHeroProps {
  topInset: number;
  eyebrow: string;
  greeting: string;
  /** Only for something the legend does not already say (e.g. a welcome back after a gap). */
  note?: string | null;
  userName?: string | null;
  userPhotoUrl?: string | null;
  onAvatarPress: () => void;
  points: number;
  target: number;
  questsDone: number;
  questsTotal: number;
  waterGlasses: number;
  waterTarget: number;
  /** Present only when today's check-in exists; never a placeholder number. */
  vitality: { score: number; label: string } | null;
  level: number;
  xpToNext: number | null;
  onRoadmap: () => void;
  action: HeroAction;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));
const fmtGlasses = (g: number) => (Number.isInteger(g) ? `${g}` : g.toFixed(1));

/**
 * Today at a glance: greeting, one concentric ring (points, quests, water) with a plain-language
 * legend, and the single most useful next action. Sized to leave room for metrics in the first
 * viewport.
 */
export function VitalityHero({
  topInset,
  eyebrow,
  greeting,
  note,
  userName,
  userPhotoUrl,
  onAvatarPress,
  points,
  target,
  questsDone,
  questsTotal,
  waterGlasses,
  waterTarget,
  vitality,
  level,
  xpToNext,
  onRoadmap,
  action,
}: VitalityHeroProps) {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const reduce = useReducedMotion();

  const ringColors = [colors.onPrimary, colors.onPrimaryAccent, colors.onPrimaryInfo];
  const fractions = [
    clamp01(points / Math.max(1, target)),
    questsTotal > 0 ? clamp01(questsDone / questsTotal) : 0,
    clamp01(waterGlasses / Math.max(1, waterTarget)),
  ];

  const p0 = useSharedValue(0);
  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);
  const progress = [p0, p1, p2];
  const [f0, f1, f2] = fractions;

  // Rings animate only when the underlying numbers change.
  useEffect(() => {
    [p0, p1, p2].forEach((v, i) => {
      const to = [f0, f1, f2][i];
      v.value = reduce ? to : withTiming(to, { duration: 700, easing: Easing.out(Easing.cubic) });
    });
  }, [f0, f1, f2, reduce, p0, p1, p2]);

  const paths = useMemo(
    () =>
      ARCS.map(({ r }) => {
        const p = Skia.Path.Make();
        p.addArc({ x: RING / 2 - r, y: RING / 2 - r, width: r * 2, height: r * 2 }, START, SWEEP);
        return p;
      }),
    [],
  );

  const legend = [
    { label: 'Points', value: `${points} of ${target}` },
    {
      label: 'Quests',
      value: questsTotal > 0 ? `${questsDone} of ${questsTotal}` : 'None yet',
    },
    { label: 'Water', value: `${fmtGlasses(waterGlasses)} of ${waterTarget} glasses` },
  ];

  return (
    <View style={{ paddingTop: topInset + 6, paddingHorizontal: spacing.lg }}>
      <View style={styles.topRow}>
        <View style={styles.flex}>
          <Text
            numberOfLines={1}
            style={[typography.captionBold, styles.eyebrow, { color: colors.onPrimaryMuted }]}
          >
            {eyebrow}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={[typography.heading, styles.greeting, { color: colors.onPrimary }]}
          >
            {greeting}
          </Text>
          {note ? (
            <Text
              numberOfLines={2}
              style={[typography.caption, { color: colors.onPrimaryMuted, marginTop: 2 }]}
            >
              {note}
            </Text>
          ) : null}
        </View>
        <PressableScale
          onPress={() => router.push('/(app)/search' as Href)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Search or ask anything"
          style={[styles.searchHit, { backgroundColor: colors.onPrimarySurface }]}
        >
          <Ionicons name="search" size={18} color={colors.onPrimary} />
        </PressableScale>
        <PressableScale
          onPress={onAvatarPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${userName || 'Your'} profile. Open menu`}
          style={styles.avatarHit}
        >
          <Avatar
            photoUrl={userPhotoUrl}
            name={userName}
            size={38}
            fill={colors.onPrimarySurface}
            ink={colors.onPrimary}
          />
        </PressableScale>
      </View>

      <View style={styles.summaryRow}>
        <View
          style={styles.ring}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Today: ${legend.map((l) => `${l.label} ${l.value}`).join(', ')}`}
        >
          <Canvas style={StyleSheet.absoluteFill}>
            {paths.map((path, i) => (
              <React.Fragment key={i}>
                <Path
                  path={path}
                  style="stroke"
                  strokeWidth={ARCS[i].w}
                  strokeCap="round"
                  color={colors.onPrimarySurface}
                />
                <Path
                  path={path}
                  style="stroke"
                  strokeWidth={ARCS[i].w}
                  strokeCap="round"
                  color={ringColors[i]}
                  start={0}
                  end={progress[i]}
                />
              </React.Fragment>
            ))}
          </Canvas>
          <Text style={[typography.subheading, { color: colors.onPrimary }]}>{points}</Text>
          <Text style={[typography.caption, styles.ringUnit, { color: colors.onPrimaryMuted }]}>
            pts
          </Text>
        </View>

        <View style={styles.legend}>
          {legend.map((l, i) => (
            <View key={l.label} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: ringColors[i] }]} />
              <Text style={[typography.caption, styles.legendLabel, { color: colors.onPrimaryMuted }]}>
                {l.label}
              </Text>
              <Text
                numberOfLines={1}
                style={[typography.captionBold, styles.flex, { color: colors.onPrimary }]}
              >
                {l.value}
              </Text>
            </View>
          ))}
          <PressableScale
            onPress={onRoadmap}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Level ${level}${xpToNext !== null ? `, ${xpToNext} XP to next level` : ''}${vitality ? `, vitality ${vitality.score}, ${vitality.label}` : ''}. Open roadmap`}
            style={styles.levelRow}
          >
            <Text numberOfLines={2} style={[typography.caption, styles.flex, { color: colors.onPrimaryMuted }]}>
              <Text style={{ color: colors.onPrimary }}>Level {level}</Text>
              {xpToNext !== null ? ` · ${xpToNext} XP to next` : ''}
              {vitality ? ` · Vitality ${vitality.score}` : ''}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.onPrimaryMuted} />
          </PressableScale>
        </View>
      </View>

      <PressableScale
        onPress={action.onPress}
        accessibilityRole="button"
        accessibilityLabel={action.accessibilityLabel ?? action.label}
        style={[styles.action, { backgroundColor: colors.onPrimarySurface }]}
      >
        <Ionicons name={action.icon} size={18} color={colors.onPrimary} />
        <Text numberOfLines={1} style={[typography.subbodyBold, styles.actionText, { color: colors.onPrimary }]}>
          {action.label}
        </Text>
      </PressableScale>
    </View>
  );
}

/** Two faint concentric arcs behind the hero; drawn on the container's slower parallax plane. */
export function VitalityHeroDecor() {
  const { colors } = useTheme();
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Circle cx="88%" cy="18%" r={150} stroke={colors.onPrimarySurface} strokeWidth={1} fill="none" />
      <Circle cx="88%" cy="18%" r={210} stroke={colors.onPrimarySurface} strokeWidth={1} fill="none" opacity={0.6} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  searchHit: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  flex: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start' },
  eyebrow: { textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11 },
  greeting: { fontSize: 23, lineHeight: 28, letterSpacing: -0.4, marginTop: 2 },
  avatarHit: { width: 44, height: 44, alignItems: 'flex-end', justifyContent: 'center', marginLeft: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  ring: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  ringUnit: { marginTop: -2 },
  legend: { flex: 1, marginLeft: 18, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 8 },
  legendLabel: { minWidth: 52, marginRight: 8 },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 30,
  },
  action: {
    marginTop: 16,
    height: 46,
    borderRadius: 16,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  actionText: { flexShrink: 1 },
});
