import { Ionicons } from '@expo/vector-icons';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { hapticLight } from '../../services/haptics';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';

export const COMPACT_HEADER_CONTENT_HEIGHT = 52;

const RING = 28;
const STROKE = 3.5;
const PAD = STROKE / 2 + 0.5;
const ARC = RING - PAD * 2;

export interface DashboardHeaderProps {
  title: string;
  userName?: string;
  badgeText?: string;
  onMenuPress: () => void;
  scrollY: SharedValue<number>;
  collapseProgress: SharedValue<number>;
  /** 0–1 live progress (e.g. daily points). Omit when unknown; no ring is drawn. */
  progress?: number;
  /** Compact-state label, e.g. "Vitality 72". Falls back to user name / title. */
  statusLabel?: string;
  /** 0–1 whole-page progress for the hairline. */
  pageProgress?: SharedValue<number>;
  /** Tapping the compact chip. Usually scrollToTop. */
  onCompactPress?: () => void;
}

/**
 * Header: one stable bar, two non-overlapping layers.
 * Expanded: brand title. Compact: live progress ring + status, tap to jump to top.
 * Layers never cross-fade at the same time (0→0.45 out, 0.55→1 in), so no title collision.
 * Header height never changes, so the scroll content never reflows.
 */
export function DashboardHeader({
  title,
  userName,
  badgeText,
  onMenuPress,
  scrollY,
  collapseProgress,
  progress,
  statusLabel,
  pageProgress,
  onCompactPress,
}: DashboardHeaderProps) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + COMPACT_HEADER_CONTENT_HEIGHT;
  const compactText = statusLabel ?? (userName && userName !== title ? userName : title);

  // Screen-reader exposure follows the visible layer; flips only on threshold crossing.
  const [compact, setCompact] = useState(false);
  useAnimatedReaction(
    () => collapseProgress.value > 0.5,
    (now, prev) => {
      if (now !== prev) runOnJS(setCompact)(now);
    },
  );

  // Mini ring (UI-thread path from a shared value)
  const frac = useSharedValue(0);
  useEffect(() => {
    frac.value = withTiming(Math.min(1, Math.max(0, progress ?? 0)), {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, frac]);

  const track = useMemo(() => {
    const p = Skia.Path.Make();
    p.addArc({ x: PAD, y: PAD, width: ARC, height: ARC }, -90, 359.9);
    return p;
  }, []);
  const arc = useDerivedValue(() => {
    const p = Skia.Path.Make();
    p.addArc({ x: PAD, y: PAD, width: ARC, height: ARC }, -90, Math.max(0.1, 360 * frac.value));
    return p;
  });

  const brandStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0, 0.45], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(collapseProgress.value, [0, 0.45], [0, -8], Extrapolation.CLAMP) },
    ],
  }));

  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0.55, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(collapseProgress.value, [0.55, 1], [8, 0], Extrapolation.CLAMP) },
      { scale: interpolate(collapseProgress.value, [0.55, 1], [0.94, 1], Extrapolation.CLAMP) },
    ],
  }));

  const hairlineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 24], [0, 1], Extrapolation.CLAMP),
  }));

  const pageBarStyle = useAnimatedStyle(() => ({
    width: `${(pageProgress ? pageProgress.value : 0) * 100}%`,
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        { height: headerHeight, paddingTop: insets.top, backgroundColor: colors.primary },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.slot}>
          {/* Expanded layer */}
          <Animated.View
            pointerEvents="none"
            accessibilityElementsHidden={compact}
            importantForAccessibility={compact ? 'no-hide-descendants' : 'auto'}
            style={[styles.layer, brandStyle]}
          >
            <Text
              style={[typography.bodyBold, styles.title, { color: colors.onPrimary }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </Animated.View>

          {/* Compact layer */}
          <Animated.View
            pointerEvents={compact ? 'auto' : 'none'}
            accessibilityElementsHidden={!compact}
            importantForAccessibility={!compact ? 'no-hide-descendants' : 'auto'}
            style={[styles.layer, compactStyle]}
          >
            <PressableScale
              disabled={!compact || !onCompactPress}
              onPress={() => {
                hapticLight();
                onCompactPress?.();
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${compactText}. Scroll to top`}
              style={styles.chip}
            >
              {progress !== undefined ? (
                <Canvas style={styles.ring}>
                  <Path
                    path={track}
                    style="stroke"
                    strokeWidth={STROKE}
                    color={colors.onPrimarySurface}
                  />
                  <Path
                    path={arc}
                    style="stroke"
                    strokeWidth={STROKE}
                    strokeCap="round"
                    color={colors.onPrimary}
                  />
                </Canvas>
              ) : null}
              <Text
                style={[typography.bodyBold, styles.title, { color: colors.onPrimary }]}
                numberOfLines={1}
              >
                {compactText}
              </Text>
            </PressableScale>
          </Animated.View>
        </View>

        {badgeText ? (
          <View style={[styles.badge, { backgroundColor: colors.onPrimarySurface }]}>
            <Text
              numberOfLines={1}
              style={{ color: colors.onPrimary, fontSize: 11, fontWeight: '700' }}
            >
              {badgeText}
            </Text>
          </View>
        ) : null}

        <PressableScale
          onPress={() => {
            hapticLight();
            onMenuPress();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
          style={[styles.menuBtn, { backgroundColor: colors.onPrimarySurface }]}
        >
          <Ionicons name="menu-outline" size={20} color={colors.onPrimary} />
        </PressableScale>
      </View>

      {/* Hairline fades in once content moves; page progress rides on it. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.hairline, { backgroundColor: colors.onPrimarySurface }, hairlineStyle]}
      >
        <Animated.View style={[styles.pageBar, { backgroundColor: colors.accent }, pageBarStyle]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, elevation: 6 },
  content: {
    height: COMPACT_HEADER_CONTENT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  slot: { flex: 1, height: COMPACT_HEADER_CONTENT_HEIGHT },
  layer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center' },
  title: { fontSize: 17, letterSpacing: -0.3, flexShrink: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  ring: { width: RING, height: RING },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexShrink: 1 },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hairline: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 2 },
  pageBar: { height: 2 },
});
