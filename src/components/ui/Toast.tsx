import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { useRootStore, ToastItem } from '../../stores/useRootStore';
import { SquircleSurface } from './SquircleSurface';

export function Toast() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTheme();
  const toasts = useRootStore((s) => s.toasts);
  const hideToast = useRootStore((s) => s.hideToast);

  const currentToast = useMemo(() => {
    if (toasts.length === 0) return null;
    return toasts[toasts.length - 1];
  }, [toasts]);

  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  const handleDismiss = () => {
    if (currentToast) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      hideToast(currentToast.id);
    }
  };

  useEffect(() => {
    if (currentToast) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      translateY.value = withSpring(0, { damping: 20, stiffness: 320 });
      opacity.value = withTiming(1, { duration: 180 });

      const timer = setTimeout(() => {
        translateY.value = withTiming(-120, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(handleDismiss)();
        });
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      translateY.value = -120;
      opacity.value = 0;
      return undefined;
    }
  }, [currentToast]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!currentToast) return null;

  const getTone = (type: string) => {
    switch (type) {
      case 'success':
        return {
          category: 'THRIVEFOLD UPDATE',
          pillColor: '#10B981',
          strokeColor: 'rgba(16, 185, 129, 0.25)',
          icon: 'checkmark-circle' as const,
          iconBg: 'rgba(16, 185, 129, 0.12)',
          title: 'Action Complete',
        };
      case 'error':
        return {
          category: 'SECURITY NOTICE',
          pillColor: '#EF4444',
          strokeColor: 'rgba(239, 68, 68, 0.25)',
          icon: 'alert-circle' as const,
          iconBg: 'rgba(239, 68, 68, 0.12)',
          title: 'Attention Required',
        };
      case 'warning':
        return {
          category: 'COMMUNITY NOTICE',
          pillColor: '#D97706',
          strokeColor: 'rgba(217, 119, 6, 0.25)',
          icon: 'warning' as const,
          iconBg: 'rgba(217, 119, 6, 0.12)',
          title: 'Gentle Notice',
        };
      default:
        return {
          category: 'TELEMETRY STATUS',
          pillColor: '#B45309',
          strokeColor: 'rgba(180, 83, 9, 0.25)',
          icon: 'shield-checkmark' as const,
          iconBg: 'rgba(180, 83, 9, 0.12)',
          title: 'Status Update',
        };
    }
  };

  const tone = getTone(currentToast.type);

  return (
    <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
      <Animated.View style={[styles.bannerWrapper, animatedStyle]}>
        <SquircleSurface
          radius={20}
          smoothing={0.7}
          fill={colors.surface}
          stroke={tone.strokeColor}
          strokeWidth={1}
          style={styles.surface}
        >
          <View style={styles.contentRow}>
            <View style={[styles.iconTile, { backgroundColor: tone.iconBg }]}>
              <Ionicons name={tone.icon} size={18} color={tone.pillColor} />
            </View>

            <View style={styles.textColumn}>
              <View style={styles.headerRow}>
                <Text style={[styles.categoryPill, { color: tone.pillColor }]}>
                  {tone.category}
                </Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={[typography.caption, styles.timeText]}>Just now</Text>
              </View>

              <Text style={[typography.bodyBold, styles.titleText, { color: colors.text.primary }]}>
                {currentToast.title || tone.title}
              </Text>

              <Text style={[typography.body, styles.bodyText, { color: colors.text.secondary }]}>
                {currentToast.message}
              </Text>

              {currentToast.actionLabel ? (
                <Pressable
                  onPress={() => {
                    if (currentToast.actionRoute) {
                      try {
                        router.push(currentToast.actionRoute as any);
                      } catch {}
                    }
                    handleDismiss();
                  }}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: tone.pillColor },
                    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <Text style={styles.actionButtonText}>{currentToast.actionLabel}</Text>
                  <Ionicons name="arrow-forward" size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
                </Pressable>
              ) : null}
            </View>

            <Pressable
              onPress={handleDismiss}
              hitSlop={12}
              style={({ pressed }) => [
                styles.dismissButton,
                pressed && { opacity: 0.6, transform: [{ scale: 0.92 }] },
              ]}
              accessibilityLabel="Dismiss notification"
            >
              <Ionicons name="close" size={15} color={colors.text.muted} />
            </Pressable>
          </View>
        </SquircleSurface>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: 'center',
  },
  bannerWrapper: {
    width: '100%',
    maxWidth: 440,
    elevation: 0,
    shadowOpacity: 0,
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
    fontWeight: '700',
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
  dismissButton: {
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 14,
    marginTop: -1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9,
    marginTop: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
});

export default Toast;
