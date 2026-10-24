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
import { StyleSheet, View, Text, Pressable } from 'react-native';
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
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
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
        translateY.value = withSpring(0, { damping: 20, stiffness: 350 });
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

  const getTone = (type: string) => {
    switch (type) {
      case 'success':
        return {
          category: 'THRIVEFOLD UPDATE',
          pillColor: '#2E7D32',
          iconName: 'checkmark-circle-outline' as any,
          iconColor: '#2E7D32',
          iconBg: 'rgba(46, 125, 50, 0.12)',
          defaultTitle: 'Habit & Health Harmony',
        };
      case 'error':
        return {
          category: 'SECURITY NOTICE',
          pillColor: '#C62828',
          iconName: 'shield' as any,
          iconColor: '#C62828',
          iconBg: 'rgba(198, 40, 40, 0.12)',
          defaultTitle: 'Attention Required',
        };
      case 'warning':
        return {
          category: 'COMMUNITY NOTICE',
          pillColor: '#D97706',
          iconName: 'alert-circle' as const,
          iconColor: '#D97706',
          iconBg: 'rgba(217, 119, 6, 0.12)',
          defaultTitle: 'Gentle Notice',
        };
      default:
        return {
          category: 'MINDFUL NUDGE',
          pillColor: colors.primary,
          iconName: 'heart-outline' as const,
          iconColor: colors.primary,
          iconBg: colors.primaryAlpha,
          defaultTitle: 'Daily Check-In',
        };
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
            fill="#FFFDF9"
            stroke="rgba(218, 119, 86, 0.22)"
            strokeWidth={1}
            style={styles.surface}
          >
            <View style={styles.contentRow}>
              {/* Tone Icon Tile */}
              <View style={[styles.iconTile, { backgroundColor: tone.iconBg }]}>
                <Ionicons name={tone.iconName} size={18} color={tone.iconColor} />
              </View>

              {/* Notification Body */}
              <View style={styles.textColumn}>
                <View style={styles.headerRow}>
                  <Text style={[typography.captionBold, styles.categoryPill, { color: tone.pillColor }]}>
                    {tone.category}
                  </Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={[typography.caption, styles.timeText]}>
                    Mindful Nudge
                  </Text>
                </View>

                <Text style={[typography.bodyBold, styles.titleText, { color: '#1C1917' }]} numberOfLines={1}>
                  {activeToast.title || tone.defaultTitle}
                </Text>

                <Text style={[typography.body, styles.bodyText, { color: '#57534E' }]} numberOfLines={2}>
                  {activeToast.message}
                </Text>

                {activeToast.actionLabel && (
                  <Pressable
                    onPress={handleAction}
                    style={({ pressed }) => [
                      styles.actionButton,
                      { backgroundColor: tone.iconBg },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={[typography.captionBold, styles.actionText, { color: tone.pillColor }]}>
                      {activeToast.actionLabel} →
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Dismiss Button */}
              <Pressable
                onPress={handleDismiss}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.dismissButton,
                  pressed && { opacity: 0.6, transform: [{ scale: 0.92 }] },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Dismiss notification"
              >
                <Ionicons name="close" size={15} color="#78716C" />
              </Pressable>
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
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
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
