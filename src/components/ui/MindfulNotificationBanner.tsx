/**
  * Thrivefold Mindful Notification Banner
  * A serene, floating, dismissable banner for purposeful nudges, rewards and alerts.
  * Adapted from Neev sanctuary specifications.
  *
  * Features:
  * - Dismissable via tap on '✕' or swipe gesture
  * - Calming typography and organic squircle styling
  * - Actionable buttons navigating straight to the relevant space
  * - Haptic feedback for tactile mindfulness
  */

import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';

const SWIPE_DISMISS_THRESHOLD = 30;

export function MindfulNotificationBanner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTheme();

  const toasts = useRootStore((s) => s.toasts);
  const hideToast = useRootStore((s) => s.hideToast);

  const activeToast = useMemo(() => {
    if (toasts.length === 0) return null;
    return toasts[toasts.length - 1];
  }, [toasts]);

  const translateY = useSharedValue(-140);
  const opacity = useSharedValue(0);

  const handleDismiss = () => {
    if (activeToast) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      hideToast(activeToast.id);
    }
  };
  // The auto-dismiss timer calls the current handler without restarting on every render.
  const dismissRef = useRef(handleDismiss);
  dismissRef.current = handleDismiss;
  const callDismiss = () => dismissRef.current();

  useEffect(() => {
    if (activeToast) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      translateY.value = withSpring(0, { damping: 24, stiffness: 300, overshootClamping: true });
      opacity.value = withTiming(1, { duration: 180 });

      // Auto dismiss after 4.5s
      const timer = setTimeout(() => {
        translateY.value = withTiming(-140, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(callDismiss)();
        });
      }, 4500);

      return () => clearTimeout(timer);
    } else {
      translateY.value = -140;
      opacity.value = 0;
      return undefined;
    }
  }, [activeToast, opacity, translateY]);

  const pan = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onUpdate((e) => {
      if (e.translationY < 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY < -SWIPE_DISMISS_THRESHOLD || e.velocityY < -400) {
        translateY.value = withTiming(-140, { duration: 180 });
        opacity.value = withTiming(0, { duration: 180 }, () => {
          runOnJS(handleDismiss)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 24, stiffness: 350, overshootClamping: true });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!activeToast) return null;

  const handleAction = () => {
    if (activeToast.actionRoute) {
      try {
        Haptics.selectionAsync();
      } catch {}
      router.push(activeToast.actionRoute as any);
      hideToast(activeToast.id);
    }
  };

  // Tone colours come from the theme, so the banner matches every experience.
  const getTone = (type: string) => {
    switch (type) {
      case 'success':
        return { category: 'DONE', iconName: 'checkmark-circle-outline' as const, color: colors.success, bg: colors.successSurface, defaultTitle: 'Saved' };
      case 'error':
        return { category: 'PROBLEM', iconName: 'alert-circle-outline' as const, color: colors.error, bg: colors.errorSurface, defaultTitle: 'Something went wrong' };
      case 'warning':
        return { category: 'HEADS UP', iconName: 'information-circle-outline' as const, color: colors.warning, bg: colors.warningSurface, defaultTitle: 'Heads up' };
      default:
        return { category: 'NOTE', iconName: 'leaf-outline' as const, color: colors.primary, bg: colors.primaryAlpha, defaultTitle: '' };
    }
  };

  const tone = getTone(activeToast.type);

  return (
    <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.bannerWrapper, animatedStyle]}>
          <SquircleSurface
            radius={20}
            smoothing={0.7}
            fill={colors.surface}
            strokeWidth={1}
            style={styles.surface}
          >
            <View style={styles.contentRow}>
              {/* Tone Icon Tile with SquircleSurface */}
              <SquircleSurface
                radius={12}
                smoothing={1}
                fill={tone.bg}
                style={styles.iconTile}
              >
                <Ionicons name={tone.iconName} size={18} color={tone.color} />
              </SquircleSurface>

              {/* Notification Body */}
              <View style={styles.textColumn}>
                <View style={styles.headerRow}>
                  <Text style={[typography.captionBold, styles.categoryPill, { color: tone.color }]}>
                    {tone.category}
                  </Text>
                </View>

                {activeToast.title || tone.defaultTitle ? (
                  <Text style={[typography.bodyBold, styles.titleText, { color: colors.text.primary }]} numberOfLines={1}>
                    {activeToast.title || tone.defaultTitle}
                  </Text>
                ) : null}

                <Text style={[typography.body, styles.bodyText, { color: colors.text.secondary }]} numberOfLines={2}>
                  {activeToast.message}
                </Text>

                {activeToast.actionLabel && (
                  <PressableScale
                    onPress={handleAction}
                    scaleTo={0.94}
                    style={{ alignSelf: 'flex-start', marginTop: 8 }}
                  >
                    <SquircleSurface
                      radius={8}
                      smoothing={1}
                      fill={tone.bg}
                      style={styles.actionButton}
                    >
                      <Text style={[typography.captionBold, styles.actionText, { color: tone.color }]}>
                        {activeToast.actionLabel}
                      </Text>
                    </SquircleSurface>
                  </PressableScale>
                )}
              </View>

              {/* Dismiss Button */}
              <PressableScale
                onPress={handleDismiss}
                hitSlop={12}
                scaleTo={0.9}
                accessibilityRole="button"
                accessibilityLabel="Dismiss notification"
              >
                <SquircleSurface
                  radius={14}
                  smoothing={1}
                  fill="rgba(0,0,0,0.05)"
                  style={styles.dismissButton}
                >
                  <Ionicons name="close" size={15} color={colors.text.muted} />
                </SquircleSurface>
              </PressableScale>
            </View>
          </SquircleSurface>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  bannerWrapper: {
    width: '100%',
    maxWidth: 440,
  },
  surface: {
    padding: 13,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    marginTop: 2,
  },
  textColumn: {
    flex: 1,
    paddingRight: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 6,
  },
  categoryPill: {
    fontSize: 9.5,
    letterSpacing: 0.7,
  },
  dotSeparator: {
    fontSize: 9,
    color: '#D6D3D1',
  },
  timeText: {
    fontSize: 11,
    color: '#A8A29E',
  },
  titleText: {
    fontSize: 14,
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  actionButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 11,
  },
  dismissButton: {
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 14,
    marginTop: -1,
  },
});

export default MindfulNotificationBanner;
