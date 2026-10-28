import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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

const RING = 20;
const STROKE = 2.8;
const PAD = STROKE / 2 + 0.5;
const ARC = RING - PAD * 2;

export interface DashboardHeaderProps {
  title?: string;
  userName?: string;
  userPhotoUrl?: string | null;
  /** Shown in place of the title once scrolled, e.g. "Vitality 44". */
  statusLabel?: string;
  badgeText?: string;
  onMenuPress: () => void;
  scrollY: SharedValue<number>;
  collapseProgress: SharedValue<number>;
  dockDistance?: SharedValue<number>;
  progress?: number;
  onCompactPress?: () => void;
}

/**
 * Pinned Compact Dashboard Header:
 * - Transparent at top (scrollY = 0), allowing hero to breathe edge-to-edge.
 * - Real User Avatar (photo, monogram initial, or icon) at top-right replacing generic drawer icon.
 * - On scroll (scrollY approaching dockDistance), smoothly fades in solid primary background.
 * - Compact Vitality pill ("Vitality 44", mini progress ring, level badge) smoothly slides up.
 * - Tap on compact pill triggers haptic feedback and smoothly scrolls to top.
 * - Zero distracting progress hairline at the bottom.
 */
export function DashboardHeader({
  title = 'Today',
  userName,
  userPhotoUrl,
  statusLabel,
  badgeText,
  onMenuPress,
  scrollY,
  dockDistance,
  progress,
  onCompactPress,
}: DashboardHeaderProps) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const compactText = statusLabel ?? userName ?? 'Vitality';
  const reduceMotion = useReducedMotion();

  const monogram =
    userName && !['Friend', 'Guest', 'You'].includes(userName.trim())
      ? userName.trim()[0].toUpperCase()
      : null;

  const trackPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addArc({ x: PAD, y: PAD, width: ARC, height: ARC }, -90, 359.9);
    return p;
  }, []);

  const progressRatio = progress !== undefined ? Math.min(1, Math.max(0, progress)) : 0;

  // Solid background smoothly transitions in as hero scrolls up and bottom sheet approaches
  const bgAnimStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: scrollY.value > 80 ? 1 : 0 };
    }
    const d = dockDistance ? dockDistance.value : 140;
    return {
      opacity: interpolate(scrollY.value, [d * 0.35, d * 0.85], [0, 1], Extrapolation.CLAMP),
    };
  });

  // Compact title pill slides in with subtle translation and fade
  const compactAnimStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: scrollY.value > 80 ? 1 : 0 };
    }
    const d = dockDistance ? dockDistance.value : 140;
    return {
      opacity: interpolate(scrollY.value, [d * 0.5, d], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(scrollY.value, [d * 0.5, d], [8, 0], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(scrollY.value, [d * 0.5, d], [0.94, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  // Soft border line below header once fully docked
  const borderAnimStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: scrollY.value > 110 ? 1 : 0 };
    }
    const d = dockDistance ? dockDistance.value : 140;
    return {
      opacity: interpolate(scrollY.value, [d * 0.85, d * 1.05], [0, 1], Extrapolation.CLAMP),
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
        {/* Luxury Compact Vitality Header (slides in on scroll) */}
        <Animated.View pointerEvents="box-none" style={[styles.compactSlot, compactAnimStyle]}>
          <PressableScale
            onPress={() => {
              hapticLight();
              onCompactPress?.();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`${title}, ${compactText}. Tap to scroll to top`}
            style={styles.compactRow}
          >
            <Text
              numberOfLines={1}
              style={[typography.bodyBold, styles.headerTitleText, { color: colors.onPrimary }]}
            >
              {title}
            </Text>

            <View style={[styles.compactPill, { backgroundColor: colors.onPrimarySurface }]}>
              {progress !== undefined ? (
                <Canvas style={styles.ring}>
                  <Path
                    path={trackPath}
                    style="stroke"
                    strokeWidth={STROKE}
                    color="rgba(255, 255, 255, 0.2)"
                  />
                  <Path
                    path={trackPath}
                    style="stroke"
                    strokeWidth={STROKE}
                    strokeCap="round"
                    color={colors.accent}
                    start={0}
                    end={progressRatio}
                  />
                </Canvas>
              ) : null}
              <Text
                numberOfLines={1}
                style={[typography.captionBold, styles.title, { color: colors.onPrimary }]}
              >
                {compactText}
              </Text>
              {badgeText ? (
                <View style={[styles.badge, { backgroundColor: 'rgba(224, 122, 95, 0.22)' }]}>
                  <Text
                    numberOfLines={1}
                    style={[typography.captionBold, { color: colors.accent, fontSize: 10 }]}
                  >
                    {badgeText}
                  </Text>
                </View>
              ) : null}
            </View>
          </PressableScale>
        </Animated.View>

        {/* Real User Avatar Button (replaces generic menu icon) */}
        <PressableScale
          onPress={() => {
            hapticLight();
            onMenuPress();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${userName || 'User'} profile. Open menu`}
          style={[styles.avatarButton, { backgroundColor: colors.onPrimarySurface }]}
        >
          {userPhotoUrl ? (
            <Image
              source={{ uri: userPhotoUrl }}
              style={styles.avatarPhoto}
              contentFit="cover"
              accessibilityIgnoresInvertColors
            />
          ) : monogram ? (
            <Text style={[typography.bodyBold, styles.monogramText, { color: colors.onPrimary }]}>
              {monogram}
            </Text>
          ) : (
            <Ionicons name="person-outline" size={18} color={colors.onPrimary} />
          )}
        </PressableScale>
      </View>

      {/* Subtle border line on scroll */}
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
    elevation: 0,
  },
  content: {
    height: COMPACT_HEADER_CONTENT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  compactSlot: {
    flex: 1,
    height: COMPACT_HEADER_CONTENT_HEIGHT,
    justifyContent: 'center',
    marginRight: 12,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  compactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  title: {
    fontSize: 13,
    letterSpacing: -0.2,
    fontWeight: '600',
  },
  ring: {
    width: RING,
    height: RING,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 1,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  avatarPhoto: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  monogramText: {
    fontSize: 14,
    fontWeight: '700',
  },
  borderLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
});
