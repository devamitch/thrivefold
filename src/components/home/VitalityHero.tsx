import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { VitalityTier } from '../../domain/analytics/dashboardAnalytics';
import { useTheme } from '../../theme/useTheme';
import { COMPACT_HEADER_CONTENT_HEIGHT } from './DashboardHeader';
import { useDashboardScroll } from './DashboardScreenContainer';
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
  hydrationTargetGlasses?: number | null;
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

const FADE_DISTANCE = 220;

/**
 * VitalityHero (scroll-linked, same props as before):
 * - Scrolling up: content drifts at ~0.68x of scroll speed (depth), fades to 25% as it
 *   slides under the header/squircle. Colour never changes, so nothing detaches.
 * - Pulling down (iOS): hero eases up to +12.7% scale; the container's navy cap fills the gap.
 * - Mount: one soft rise-in. Reduced motion: static.
 * The hero background is the gauge's own navy; the wrapper behind it is navy too, so
 * translating the content never exposes the page colour.
 */
export function VitalityHero({ scrollY, ...gauge }: VitalityHeroProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { reduceMotion } = useDashboardScroll();
  const topInset = insets.top + COMPACT_HEADER_CONTENT_HEIGHT;

  const motion = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    const y = scrollY.value;
    const pull = Math.min(Math.max(0, -y), 140);
    return {
      opacity: interpolate(y, [0, FADE_DISTANCE], [1, 0.25], Extrapolation.CLAMP),
      transform: [{ translateY: y > 0 ? y * 0.32 : 0 }, { scale: 1 + pull / 1100 }],
    };
  });

  return (
    <View style={[styles.outer, { backgroundColor: colors.primary }]}>
      <Animated.View
        entering={
          reduceMotion
            ? undefined
            : FadeInDown.duration(480).easing(Easing.out(Easing.cubic)).withInitialValues({
                transform: [{ translateY: 16 }],
              })
        }
        style={[styles.motion, motion]}
      >
        <VitalityRingGauge
          score={gauge.score}
          tier={gauge.tier}
          label={gauge.label}
          subtext={gauge.subtext}
          hasCheckInToday={gauge.hasCheckInToday}
          energy={gauge.energy}
          mood={gauge.mood}
          sleepHours={gauge.sleepHours}
          hydrationGlasses={gauge.hydrationGlasses}
          hydrationTargetGlasses={gauge.hydrationTargetGlasses ?? 8}
          questsDone={gauge.questsDone}
          questsTotal={gauge.questsTotal}
          points={gauge.points}
          target={gauge.target}
          level={gauge.level}
          xpToNext={gauge.xpToNext}
          onCheckIn={gauge.onCheckIn}
          onRoadmap={gauge.onRoadmap}
          eyebrow={gauge.eyebrow}
          greeting={gauge.greeting}
          subtitle={gauge.subtitle}
          onMenuPress={gauge.onMenuPress}
          fullWidth
          topInset={topInset}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { width: '100%' },
  motion: { width: '100%' },
});
