import { Ionicons } from '@expo/vector-icons';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { hapticLight } from '../../services/haptics';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';

export const COMPACT_HEADER_CONTENT_HEIGHT = 52;

const RING = 22;
const STROKE = 3;
const PAD = STROKE / 2 + 0.5;
const ARC = RING - PAD * 2;

export interface DashboardHeaderProps {
  title?: string;
  userName?: string;
  /** Shown in place of the title once scrolled, e.g. "Vitality 44". */
  statusLabel?: string;
  badgeText?: string;
  onMenuPress: () => void;
  scrollY: SharedValue<number>;
  collapseProgress: SharedValue<number>;
  progress?: number;
  onCompactPress?: () => void;
}

/**
 * Pinned Compact Dashboard Header:
 * - Transparent at top (scrollY = 0), allowing hero to breathe edge-to-edge.
 * - On scroll (scrollY > 70), smoothly fades in solid primary background.
 * - Compact title ("Vitality 44", mini progress ring, level badge) smoothly slides up into view.
 * - Tap on compact title triggers haptic feedback and smoothly scrolls to top.
 * - Menu button is always accessible and rock-solid at top right.
 * - No distracting progress hairline at the bottom.
 */
export function DashboardHeader({
  userName,
  statusLabel,
  badgeText,
  onMenuPress,
  scrollY,
  progress,
  onCompactPress,
}: DashboardHeaderProps) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const compactText = statusLabel ?? userName ?? 'Vitality';
  const reduceMotion = useReducedMotion();

  const trackPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addArc({ x: PAD, y: PAD, width: ARC, height: ARC }, -90, 359.9);
    return p;
  }, []);

  const progressRatio = progress !== undefined ? Math.min(1, Math.max(0, progress)) : 0;

  // Solid background smoothly transitions in as hero scrolls up
  const bgAnimStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: scrollY.value > 80 ? 1 : 0 };
    }
    return {
      opacity: interpolate(scrollY.value, [60, 130], [0, 1], Extrapolation.CLAMP),
    };
  });

  // Compact title & ring slide in with subtle translation and fade
  const compactAnimStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: scrollY.value > 80 ? 1 : 0 };
    }
    return {
      opacity: interpolate(scrollY.value, [70, 130], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(scrollY.value, [70, 130], [8, 0], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(scrollY.value, [70, 130], [0.94, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  // Soft border line below header once fully scrolled
  const borderAnimStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: scrollY.value > 120 ? 1 : 0 };
    }
    return {
      opacity: interpolate(scrollY.value, [100, 150], [0, 1], Extrapolation.CLAMP),
    };
  });

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          height: insets.top + COMPACT_HEADER_CONTENT_HEIGHT,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Dynamic solid background layer */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: colors.primary },
          bgAnimStyle,
        ]}
      />

      <View style={styles.content}>
        {/* Compact Title Row (fades in on scroll) */}
        <Animated.View pointerEvents="box-none" style={[styles.compactSlot, compactAnimStyle]}>
          <PressableScale
            onPress={() => {
              hapticLight();
              onCompactPress?.();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`${compactText}. Tap to scroll to top`}
            style={styles.compactRow}
          >
            {progress !== undefined ? (
              <Canvas style={styles.ring}>
                <Path
                  path={trackPath}
                  style="stroke"
                  strokeWidth={STROKE}
                  color={colors.onPrimarySurface}
                />
                <Path
                  path={trackPath}
                  style="stroke"
                  strokeWidth={STROKE}
                  strokeCap="round"
                  color={colors.onPrimary}
                  start={0}
                  end={progressRatio}
                />
              </Canvas>
            ) : null}
            <Text
              numberOfLines={1}
              style={[typography.bodyBold, styles.title, { color: colors.onPrimary }]}
            >
              {compactText}
            </Text>
            {badgeText ? (
              <View style={[styles.badge, { backgroundColor: colors.onPrimarySurface }]}>
                <Text
                  numberOfLines={1}
                  style={[typography.captionBold, { color: colors.onPrimary, fontSize: 11 }]}
                >
                  {badgeText}
                </Text>
              </View>
            ) : null}
          </PressableScale>
        </Animated.View>

        {/* Rock-solid navigation menu button */}
        <PressableScale
          onPress={() => {
            hapticLight();
            onMenuPress();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
          style={[styles.menu, { backgroundColor: colors.onPrimarySurface }]}
        >
          <Ionicons name="menu-outline" size={20} color={colors.onPrimary} />
        </PressableScale>
      </View>

      {/* Subtle border line on scroll — NO progress line */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.borderLine,
          { backgroundColor: colors.onPrimarySurface },
          borderAnimStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 4,
  },
  content: {
    height: COMPACT_HEADER_CONTENT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  compactSlot: {
    flex: 1,
    height: COMPACT_HEADER_CONTENT_HEIGHT,
    justifyContent: 'center',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 17,
    letterSpacing: -0.3,
  },
  ring: {
    width: RING,
    height: RING,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexShrink: 1,
  },
  menu: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
});
