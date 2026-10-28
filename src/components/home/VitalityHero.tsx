import React from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { VitalityTier } from '../../domain/analytics/dashboardAnalytics';
import { COMPACT_HEADER_CONTENT_HEIGHT } from './DashboardHeader';
import { VitalityRingGauge } from './VitalityRingGauge';

export interface VitalityHeroProps {
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
  scrollY?: SharedValue<number>;
  collapseProgress?: SharedValue<number>;
}

const FADE_DISTANCE = 220;

/** Full-width Today hero with smooth parallax depth translation. */
export function VitalityHero(props: VitalityHeroProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  // Full physical parallax depth translation:
  // - Scrolling down: content drifts at ~0.54x of scroll speed (translateY = y * 0.46)
  //   retaining rich, solid aesthetic colors without muddy opacity fading, while
  //   the squircle surface smoothly slides and rolls over it.
  // - Pulling down (iOS/Android): elastic translation & gentle scale (up to +15%) with solid cap fill.
  const animStyle = useAnimatedStyle(() => {
    if (reduceMotion || !props.scrollY) return {};
    const y = props.scrollY.value;
    const pull = Math.min(Math.max(0, -y), 160);
    return {
      opacity: interpolate(y, [0, 280], [1, 0.9], Extrapolation.CLAMP),
      transform: [
        { translateY: y > 0 ? y * 0.46 : y * 0.5 },
        {
          scale:
            y < 0
              ? 1 + pull / 850
              : interpolate(y, [0, 280], [1, 0.98], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <Animated.View style={animStyle}>
      <VitalityRingGauge
        {...props}
        fullWidth
        topInset={insets.top + 10}
      />
    </Animated.View>
  );
}
