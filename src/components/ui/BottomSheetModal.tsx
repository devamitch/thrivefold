import React, { useEffect, useCallback } from 'react';
import {
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  type DimensionValue,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { PressableScale } from './PressableScale';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_CLOSE_THRESHOLD = 90;
const SWIPE_VELOCITY_THRESHOLD = 600;

export interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  enableDragToClose?: boolean;
  showCloseButton?: boolean;
  maxHeight?: DimensionValue;
}

/**
 * Neev Sanctuary Gesture-Driven Bottom Sheet Modal
 * Built with Apple fluid motion, zero-shadow hairlines, and continuous squircles.
 */
export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  contentStyle,
  enableDragToClose = true,
  showCloseButton = true,
  maxHeight = '90%',
}) => {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const reduceMotion = useReducedMotion();

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropProgress = useSharedValue(0);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const startCloseAnimation = useCallback(() => {
    if (reduceMotion) {
      translateY.value = SCREEN_HEIGHT;
      backdropProgress.value = 0;
      handleClose();
      return;
    }
    backdropProgress.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      { duration: 240, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(handleClose)();
        }
      },
    );
  }, [reduceMotion, handleClose, translateY, backdropProgress]);

  // Open animation when visible changes to true
  useEffect(() => {
    if (visible) {
      if (reduceMotion) {
        translateY.value = 0;
        backdropProgress.value = 1;
      } else {
        translateY.value = SCREEN_HEIGHT;
        backdropProgress.value = withTiming(1, { duration: 260 });
        translateY.value = withSpring(0, {
          damping: 24,
          stiffness: 260,
          mass: 0.9,
        });
      }
    }
  }, [visible, reduceMotion, translateY, backdropProgress]);

  // Android hardware back button handler
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      startCloseAnimation();
      return true;
    });
    return () => sub.remove();
  }, [visible, startCloseAnimation]);

  // Pan gesture with Neev Sanctuary threshold math
  const panGesture = Gesture.Pan()
    .enabled(enableDragToClose)
    .failOffsetY([-15, 0]) // Upward swipes fail immediately to let child lists scroll freely
    .activeOffsetY([5, 1000]) // Downward swipe captures at 5px
    .shouldCancelWhenOutside(false)
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
        backdropProgress.value = interpolate(
          e.translationY,
          [0, 240],
          [1, 0.2],
          Extrapolation.CLAMP,
        );
      }
    })
    .onEnd((e) => {
      if (e.translationY > SWIPE_CLOSE_THRESHOLD || e.velocityY > SWIPE_VELOCITY_THRESHOLD) {
        runOnJS(startCloseAnimation)();
      } else {
        translateY.value = withSpring(0, { damping: 24, stiffness: 260 });
        backdropProgress.value = withTiming(1, { duration: 180 });
      }
    });

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropProgress.value,
  }));

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(0, translateY.value) }],
  }));

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={startCloseAnimation}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              Haptics.selectionAsync().catch(() => undefined);
              startCloseAnimation();
            }}
            accessibilityRole="button"
            accessibilityLabel="Close overlay"
          />
        </Animated.View>

        {/* Sheet Content with Gesture */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  paddingBottom: Math.max(insets.bottom, 16),
                  maxHeight: maxHeight as DimensionValue,
                },
                animatedSheetStyle,
                contentStyle,
              ]}
            >
              {/* Grabber handle */}
              <View style={styles.handleContainer}>
                <View style={[styles.grabber, { backgroundColor: colors.border }]} />
              </View>

              {/* Header */}
              {title || showCloseButton ? (
                <View style={[styles.headerRow, { paddingHorizontal: spacing.base }]}>
                  <View style={styles.titleColumn}>
                    {title ? (
                      <Text
                        style={[typography.heading, { color: colors.text.primary, fontSize: 19 }]}
                        numberOfLines={1}
                        accessibilityRole="header"
                      >
                        {title}
                      </Text>
                    ) : null}
                    {subtitle ? (
                      <Text
                        style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}
                        numberOfLines={2}
                      >
                        {subtitle}
                      </Text>
                    ) : null}
                  </View>

                  {showCloseButton ? (
                    <PressableScale
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => undefined);
                        startCloseAnimation();
                      }}
                      hitSlop={8}
                      style={[styles.closeButton, { backgroundColor: colors.surface1 }]}
                      accessibilityRole="button"
                      accessibilityLabel="Close"
                    >
                      <Ionicons name="close" size={20} color={colors.text.secondary} />
                    </PressableScale>
                  ) : null}
                </View>
              ) : null}

              {/* Body */}
              <View style={styles.body}>{children}</View>
            </Animated.View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 22, 19, 0.45)',
  },
  keyboardContainer: {
    justifyContent: 'flex-end',
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderCurve: 'continuous',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  grabber: {
    borderRadius: 3,
    height: 4.5,
    width: 38,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  titleColumn: {
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  body: {
    width: '100%',
  },
});
