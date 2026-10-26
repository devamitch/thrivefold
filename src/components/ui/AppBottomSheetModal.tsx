import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/useTheme';
import FrostedView from './FrostedView';
import { PressableScale } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';

const SWIPE_CLOSE_THRESHOLD = 64;
const SWIPE_VELOCITY_THRESHOLD = 600;
const SHEET_RADIUS = 30;
// iOS sheet curves: a fast start that settles softly, no overshoot.
const OPEN = { duration: 340, easing: Easing.bezier(0.2, 0.9, 0.25, 1) };
const CLOSE = { duration: 220, easing: Easing.bezier(0.4, 0, 1, 1) };
const SETTLE = { duration: 240, easing: Easing.out(Easing.cubic) };

export interface AppBottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  children: React.ReactNode;
  /**
   * Pinned below the scrolling body, above the navigation bar: primary actions stay reachable
   * however long the content is. Use `SheetFooterRow` for two buttons.
   */
  footer?: React.ReactNode;
  maxHeight?: number | `${number}%`;
  showHandle?: boolean;
  showCloseButton?: boolean;
  avoidKeyboard?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  headerRight?: React.ReactNode;
}

/**
 * The one bottom sheet (pattern from Neev). On Android the backdrop is a plain scrim: a Modal is
 * its own window, so a blur there has nothing to blur and renders downsampled and pixelated.
 * Drag the handle/header (or a body that does not scroll) down to dismiss; horizontal gestures
 * inside the body are left alone.
 */
export function AppBottomSheetModal({
  visible,
  onClose,
  title,
  subtitle,
  eyebrow,
  children,
  footer,
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
  const reduceMotion = useReducedMotion();

  // When the body is taller than the sheet it scrolls internally and dismissal moves to the
  // handle and header.
  const [bodyViewportH, setBodyViewportH] = useState(0);
  const [bodyContentH, setBodyContentH] = useState(0);
  const bodyScrolls = bodyViewportH > 0 && bodyContentH > bodyViewportH + 1;
  const [scrolled, setScrolled] = useState(false);

  const translateY = useSharedValue(screenHeight);
  const sheetHeight = useSharedValue(screenHeight);

  const startCloseAnimation = useCallback(() => {
    translateY.value = withTiming(
      sheetHeight.value + 40,
      reduceMotion ? { duration: 0 } : CLOSE,
      (finished) => {
        if (finished) runOnJS(onClose)();
      },
    );
  }, [onClose, reduceMotion, sheetHeight, translateY]);

  useEffect(() => {
    if (visible) {
      setScrolled(false);
      translateY.value = screenHeight;
      translateY.value = withTiming(0, reduceMotion ? { duration: 0 } : OPEN);
    }
  }, [visible, reduceMotion, screenHeight, translateY]);

  const SPRING_CONFIG = { damping: 24, stiffness: 260 };

  const makePan = (activeOffsetY: [number, number], failOffsetY: [number, number], enabled: boolean) =>
    Gesture.Pan()
      .activeOffsetY(activeOffsetY)
      .failOffsetY(failOffsetY)
      .failOffsetX([-24, 24])
      .enabled(enabled)
      .shouldCancelWhenOutside(false)
      .onUpdate((e) => {
        // Rubber-band upward, natural drag downward
        translateY.value = e.translationY > 0 ? e.translationY : e.translationY * 0.15;
      })
      .onEnd((e) => {
        if (e.translationY > SWIPE_CLOSE_THRESHOLD || e.velocityY > SWIPE_VELOCITY_THRESHOLD) {
          runOnJS(startCloseAnimation)();
        } else {
          translateY.value = reduceMotion ? withTiming(0, SETTLE) : withSpring(0, SPRING_CONFIG);
        }
      });

  // Body can drag down to dismiss whenever it is at top of scroll offset (!scrolled)
  const bodyPan = makePan([10, 1000], [-15, 0], !scrolled);
  // Header can always drag down to dismiss
  const headerPan = makePan([5, 1000], [-15, 0], true);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, Math.max(1, sheetHeight.value)], [1, 0], 'clamp'),
  }));

  if (!visible) return null;

  const bottomPad = Math.max(insets.bottom, 12) + 8;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={startCloseAnimation}
    >
      <GestureHandlerRootView style={styles.modalRoot}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.scrim },
            backdropAnimatedStyle,
          ]}
        >
          <FrostedView style={StyleSheet.absoluteFill} />

          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={startCloseAnimation}
            accessibilityRole="button"
            accessibilityLabel="Close sheet"
          />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          enabled={avoidKeyboard}
          style={styles.keyboardAvoid}
          pointerEvents="box-none"
        >
          <GestureDetector gesture={bodyPan}>
            <Animated.View
              accessibilityViewIsModal
              onLayout={(e) => {
                sheetHeight.value = e.nativeEvent.layout.height;
              }}
              style={[styles.sheet, { maxHeight }, sheetAnimatedStyle]}
            >
              <SquircleSurface
                fill={colors.surface}
                radius={SHEET_RADIUS}
                style={styles.surfaceBleed}
                pointerEvents="none"
              />

              <GestureDetector gesture={headerPan}>
                <View style={styles.header}>
                  {showHandle ? (
                    <View style={styles.handleContainer}>
                      <View style={[styles.handlePill, { backgroundColor: colors.text.muted }]} />
                    </View>
                  ) : (
                    <View style={styles.handleSpacer} />
                  )}

                  {(Boolean(title) || showCloseButton || Boolean(headerRight)) && (
                    <View style={styles.headerRow}>
                      <View style={styles.titleColumn}>
                        {eyebrow ? (
                          <Text
                            style={[
                              typography.captionBold,
                              { color: colors.accentText, marginBottom: 2 },
                            ]}
                            numberOfLines={1}
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
                            accessibilityRole="header"
                          >
                            {title}
                          </Text>
                        ) : null}
                        {subtitle ? (
                          <Text
                            style={[
                              typography.caption,
                              { color: colors.text.secondary, marginTop: 3 },
                            ]}
                          >
                            {subtitle}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.headerActions}>
                        {headerRight}
                        {showCloseButton && (
                          <PressableScale
                            onPress={startCloseAnimation}
                            hitSlop={8}
                            scaleTo={0.92}
                            accessibilityRole="button"
                            accessibilityLabel="Close"
                          >
                            <SquircleSurface
                              shape="circle"
                              fill={colors.surface2}
                              style={styles.closeButton}
                            >
                              <Ionicons name="close" size={18} color={colors.text.secondary} />
                            </SquircleSurface>
                          </PressableScale>
                        )}
                      </View>
                    </View>
                  )}
                  {scrolled ? (
                    <View style={[styles.divider, { backgroundColor: colors.borderStrong }]} />
                  ) : null}
                </View>
              </GestureDetector>

              <ScrollView
                style={styles.body}
                contentContainerStyle={[
                  footer ? null : { paddingBottom: bottomPad },
                  contentContainerStyle,
                ]}
                scrollEnabled={bodyScrolls}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                overScrollMode="never"
                bounces={false}
                scrollEventThrottle={32}
                onScroll={(e) => {
                  const next = e.nativeEvent.contentOffset.y > 2;
                  if (next !== scrolled) setScrolled(next);
                }}
                onLayout={(e) => setBodyViewportH(Math.round(e.nativeEvent.layout.height))}
                onContentSizeChange={(_w, h) => setBodyContentH(Math.round(h))}
              >
                {children}
              </ScrollView>

              {footer ? (
                <View
                  style={[
                    styles.footer,
                    { paddingBottom: bottomPad },
                    bodyScrolls
                      ? {
                          borderTopColor: colors.borderStrong,
                          borderTopWidth: StyleSheet.hairlineWidth,
                        }
                      : null,
                  ]}
                >
                  {footer}
                </View>
              ) : null}
            </Animated.View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

/** One or two sheet actions side by side (secondary first, primary last), equal widths. */
export function SheetFooterRow({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.footerRow}>
      {React.Children.map(children, (child) =>
        child ? <View style={styles.footerCell}>{child}</View> : null,
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  sheet: {
    width: '100%',
  },
  // The squircle runs past the bottom edge so only the top corners round and an upward drag
  // never shows a gap under the sheet.
  surfaceBleed: {
    bottom: -SHEET_RADIUS * 2,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  header: {
    paddingHorizontal: 20,
  },
  handleContainer: {
    alignItems: 'center',
    height: 22,
    justifyContent: 'center',
    width: '100%',
  },
  handleSpacer: {
    height: 14,
  },
  handlePill: {
    borderRadius: 3,
    height: 5,
    opacity: 0.35,
    width: 40,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingTop: 6,
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
  closeButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: -20,
  },
  // Inset on the scroll view itself, so a caller's contentContainerStyle padding adds to it.
  body: {
    flexShrink: 1,
    paddingHorizontal: 20,
    width: '100%',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  footerCell: {
    flex: 1,
  },
});

export default AppBottomSheetModal;
