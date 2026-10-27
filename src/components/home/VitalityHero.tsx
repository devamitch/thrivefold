import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { VitalityTier } from '../../domain/analytics/dashboardAnalytics';
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
  collapseProgress,
}: VitalityHeroProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const heroMotionStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return {};
    }
    const progress = collapseProgress.value;
    const translateY = interpolate(progress, [0, 0.75], [0, -14], Extrapolation.CLAMP);
    const scale = interpolate(progress, [-0.5, 0, 0.75], [1.03, 1, 0.97], Extrapolation.CLAMP);
    const opacity = interpolate(progress, [0, 0.85], [1, 0.3], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  return (
    <View style={styles.outerWrapper}>
      <Animated.View style={[styles.motionContainer, heroMotionStyle]}>
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
          topInset={insets.top}
        />
      </Animated.View>
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
