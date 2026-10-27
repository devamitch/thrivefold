import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SharedValue } from 'react-native-reanimated';

import type { VitalityTier } from '../../domain/analytics/dashboardAnalytics';
import { COMPACT_HEADER_CONTENT_HEIGHT } from './DashboardHeader';
import { VitalityRingGauge } from './VitalityRingGauge';

export interface VitalityHeroProps {
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
  scrollY: SharedValue<number>;
  collapseProgress: SharedValue<number>;
}

/**
 * VitalityHero:
 * - Full-width, data-driven Today/Vitality hero section.
 * - Coordinated scroll-linked parallax, scaling, and fading.
 * - Houses Concentric Skia Radial Dial, Goals / Vitality mode switcher,
 *   Level progression, micro-metrics, and primary action affordance.
 * - Handles transparent status bar and edge-to-edge layout.
 */
export function VitalityHero({
  score,
  tier,
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
}: VitalityHeroProps) {
  const insets = useSafeAreaInsets();
  const topInset = insets.top + COMPACT_HEADER_CONTENT_HEIGHT;

  return (
    <View style={styles.outerWrapper}>
      <View style={styles.motionContainer}>
        <VitalityRingGauge
          score={score}
          tier={tier}
          label={label}
          subtext={subtext}
          hasCheckInToday={hasCheckInToday}
          energy={energy}
          mood={mood}
          sleepHours={sleepHours}
          hydrationGlasses={hydrationGlasses}
          questsDone={questsDone}
          questsTotal={questsTotal}
          points={points}
          target={target}
          level={level}
          xpToNext={xpToNext}
          onCheckIn={onCheckIn}
          onRoadmap={onRoadmap}
          eyebrow={eyebrow}
          greeting={greeting}
          subtitle={subtitle}
          onMenuPress={onMenuPress}
          fullWidth
          topInset={topInset}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  motionContainer: {
    width: '100%',
  },
});
