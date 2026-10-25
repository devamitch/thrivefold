import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleProp, StyleSheet, Text, useWindowDimensions, ViewStyle } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/useTheme';
import { PressableScale } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';

const SWIPE_CLOSE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 250;

export interface AppBottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  children: React.ReactNode;
  maxHeight?: number | `${number}%`;
  showHandle?: boolean;
  showCloseButton?: boolean;
  avoidKeyboard?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  headerRight?: React.ReactNode;
}

/**
 * Universal Gesture-Driven Bottom Sheet Modal for Thrivefold.
 * Traced from Neev & BlinkQuest canonical design system.
 *
 * Implements:
 * 1. UI-thread pan gesture to drag down and dismiss with spring physics.
 * 2. Animated frosted backdrop that dismisses on tap.
 * 3. Squircle top corners and centered pill handle.
 * 4. Safe-area bottom padding so buttons are never covered by navigation bars.
 * 5. Hardware back button handling on Android.
 */
export function AppBottomSheetModal({
  visible,
  onClose,
  title,
  subtitle,
  eyebrow,
  children,
  maxHeight = '90%',
  showHandle = true,
  showCloseButton = true,
  avoidKeyboard = true,
  contentContainerStyle,
  headerRight,
}: AppBottomSheetModalProps) {
  const { height: screenHeight } = useWindowDimensions();
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  // When body is taller than the sheet, it scrolls internally;
  // dismissal moves to the handle & header zone.
  const [bodyViewportH, setBodyViewportH] = useState(0);
  const [bodyContentH, setBodyContentH] = useState(0);
  const bodyScrolls = bodyViewportH > 0 && bodyContentH > bodyViewportH + 1;

  const translateY = useSharedValue(screenHeight);
  const backdropOpacity = useSharedValue(0);

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const startCloseAnimation = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 180 });
    translateY.value = withTiming(screenHeight, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(handleDismiss)();
      }
    });
  }, [backdropOpacity, translateY, handleDismiss, screenHeight]);

  useEffect(() => {
    if (visible) {
      translateY.value = screenHeight;
      backdropOpacity.value = 0;
      backdropOpacity.value = withTiming(1, { duration: 220 });
      translateY.value = withSpring(0, { damping: 30, stiffness: 300, overshootClamping: true });
    }
  }, [visible, backdropOpacity, translateY, screenHeight]);

  // Downward drag on body zone (when not scrolled)
  const panGesture = Gesture.Pan()
    .activeOffsetY(14)
    .failOffsetX([-24, 24])
    .enabled(!bodyScrolls)
    .shouldCancelWhenOutside(false)
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > SWIPE_CLOSE_THRESHOLD || e.velocityY > SWIPE_VELOCITY_THRESHOLD) {
        runOnJS(startCloseAnimation)();
      } else {
        translateY.value = withSpring(0, { damping: 30, stiffness: 300, overshootClamping: true });
      }
    });

  // Handle + header always drag the sheet smoothly
  const headerPanGesture = Gesture.Pan()
    .activeOffsetY(6)
    .failOffsetX([-24, 24])
    .shouldCancelWhenOutside(false)
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > SWIPE_CLOSE_THRESHOLD || e.velocityY > SWIPE_VELOCITY_THRESHOLD) {
        runOnJS(startCloseAnimation)();
      } else {
        translateY.value = withSpring(0, { damping: 30, stiffness: 300, overshootClamping: true });
      }
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={startCloseAnimation}
      accessibilityRole="alert"
    >
      <GestureHandlerRootView style={styles.modalRoot}>
        {/* Animated backdrop with tap to close */}
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 35 : 15}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <PressableScale
            scaleTo={1}
            style={StyleSheet.absoluteFill}
            onPress={startCloseAnimation}
            accessibilityRole="button"
            accessibilityLabel="Close sheet"
          />
        </Animated.View>

        {/* Bottom sheet surface container with pan gesture */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          enabled={avoidKeyboard}
          style={styles.keyboardAvoid}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.sheetSurface,
                {
                  backgroundColor: colors.surface,
                  borderTopColor: colors.border,
                  borderLeftColor: colors.border,
                  borderRightColor: colors.border,
                  maxHeight,
                  paddingBottom: Math.max(insets.bottom, 16) + 8,
                },
                sheetAnimatedStyle,
              ]}
            >
              {/* Draggable header zone with direct pan gesture */}
              <GestureDetector gesture={headerPanGesture}>
                <SquircleSurface style={styles.handleAndHeaderArea}>
                  {/* Drag handle pill */}
                  {showHandle && (
                    <SquircleSurface style={styles.handleContainer}>
                      <SquircleSurface style={[styles.handlePill, { backgroundColor: colors.borderStrong || colors.border }]} />
                    </SquircleSurface>
                  )}

                  {/* Sheet header row */}
                  {(Boolean(title) || Boolean(showCloseButton) || Boolean(headerRight)) && (
                    <SquircleSurface style={styles.headerRow}>
                      <SquircleSurface style={styles.titleColumn}>
                        {eyebrow ? (
                          <Text
                            style={[
                              typography.captionBold,
                              { color: colors.primary, marginBottom: 2, letterSpacing: 0.8 },
                            ]}
                          >
                            {eyebrow}
                          </Text>
                        ) : null}
                        {title ? (
                          <Text
                            style={[
                              typography.heading,
                              styles.titleText,
                              { color: colors.text.primary },
                            ]}
                            numberOfLines={2}
                          >
                            {title}
                          </Text>
                        ) : null}
                        {subtitle ? (
                          <Text
                            style={[
                              typography.caption,
                              { color: colors.text.secondary, marginTop: 2 },
                            ]}
                          >
                            {subtitle}
                          </Text>
                        ) : null}
                      </SquircleSurface>

                      <SquircleSurface style={styles.headerActions}>
                        {headerRight}
                        {showCloseButton && (
                          <PressableScale
                            onPress={startCloseAnimation}
                            hitSlop={8}
                            scaleTo={0.92}
                            style={styles.closeBtnScale}
                            accessibilityRole="button"
                            accessibilityLabel="Close modal"
                          >
                            <SquircleSurface
                              radius={16}
                              smoothing={1}
                              fill={colors.surface2}
                              style={styles.closeButton}
                            >
                              <Ionicons name="close" size={18} color={colors.text.primary} />
                            </SquircleSurface>
                          </PressableScale>
                        )}
                      </SquircleSurface>
                    </SquircleSurface>
                  )}
                </SquircleSurface>
              </GestureDetector>

              {/* Sheet body */}
              <ScrollView
                style={styles.body}
                contentContainerStyle={contentContainerStyle}
                scrollEnabled={bodyScrolls}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={bodyScrolls}
                overScrollMode="never"
                bounces={false}
                onLayout={(e) => setBodyViewportH(Math.round(e.nativeEvent.layout.height))}
                onContentSizeChange={(_w, h) => setBodyContentH(Math.round(h))}
              >
                {children}
              </ScrollView>
            </Animated.View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  handleAndHeaderArea: {
    width: '100%',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 18, 16, 0.45)',
  },
  keyboardAvoid: {
    justifyContent: 'flex-end',
    width: '100%',
  },
  sheetSurface: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 20,
    width: '100%',
  },
  handleContainer: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: '100%',
  },
  handlePill: {
    borderRadius: 2.5,
    height: 5,
    width: 38,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  titleColumn: {
    flex: 1,
    paddingRight: 12,
  },
  titleText: {
    letterSpacing: -0.2,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  closeBtnScale: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  body: {
    flexShrink: 1,
    width: '100%',
  },
});

export default AppBottomSheetModal;
