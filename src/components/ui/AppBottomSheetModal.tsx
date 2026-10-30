import { useKeyboardInset } from '../../hooks/useKeyboardInset';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
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
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/useTheme';
import FrostedView from './FrostedView';
import { PressableScale } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';

const SWIPE_CLOSE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 400;
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
  // Lifts the sheet above the keyboard on Android too (edge-to-edge: no window resize).
  const keyboardInset = useKeyboardInset();

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

  // One gesture instance per detector: Gesture Handler cannot attach the same object twice, and
  // the old failOffsetY([-15, 0]) failed on every downward drag, so swiping never dismissed.
  const makePan = () =>
    Gesture.Pan()
    .activeOffsetY(10)
    .failOffsetY(-15)
    .failOffsetX([-35, 35])
    .shouldCancelWhenOutside(false)
    .onUpdate((e) => {
      'worklet';
      // Rubber-band upward, natural drag downward
      translateY.value = e.translationY > 0 ? e.translationY : e.translationY * 0.15;
    })
    .onEnd((e) => {
      'worklet';
      if (e.translationY > SWIPE_CLOSE_THRESHOLD || e.velocityY > SWIPE_VELOCITY_THRESHOLD) {
        translateY.value = withTiming(
          sheetHeight.value + 40,
          reduceMotion ? { duration: 0 } : CLOSE,
          (finished) => {
            if (finished) runOnJS(onClose)();
          },
        );
      } else {
        translateY.value = withTiming(0, SETTLE);
      }
    });
  const headerPan = makePan();
  const bodyPan = makePan();

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, Math.max(sheetHeight.value, 1)], [1, 0], 'clamp'),
  }));

  if (!visible) return null;

  const bottomPad = Math.max(insets.bottom, 12) + 8;

  const renderBody = () => (
    <ScrollView
      style={styles.body}
      contentContainerStyle={[
        footer ? null : { paddingBottom: bottomPad },
        contentContainerStyle,
      ]}
      scrollEnabled
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
  );

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
            styles.backdrop,
            backdropAnimatedStyle,
          ]}
        >
          <FrostedView tone="dark" tintOpacity={0.45} intensity={25} style={StyleSheet.absoluteFill} pointerEvents="none" />

          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={startCloseAnimation}
            accessibilityRole="button"
            accessibilityLabel="Close sheet"
          />
        </Animated.View>

        <View
          style={[styles.keyboardAvoid, avoidKeyboard && keyboardInset > 0 ? { paddingBottom: keyboardInset } : null]}
          pointerEvents="box-none"
        >
          <Animated.View
            accessibilityViewIsModal
            onLayout={(e) => {
              sheetHeight.value = e.nativeEvent.layout.height;
            }}
            style={[styles.sheet, { maxHeight }, sheetAnimatedStyle]}
          >
            <FrostedView
              tone="surface"
              intensity={90}
              tintOpacity={Platform.OS === 'android' ? 0.88 : 0.75}
              style={[
                styles.surfaceBleed,
                {
                  borderTopLeftRadius: SHEET_RADIUS,
                  borderTopRightRadius: SHEET_RADIUS,
                  borderTopWidth: 1,
                  borderLeftWidth: 1,
                  borderRightWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              pointerEvents="none"
            />

            <View style={styles.header}>
              <GestureDetector gesture={headerPan}>
                <View style={styles.headerDragArea}>
                  {showHandle ? (
                    <View style={styles.handleContainer} hitSlop={{ top: 12, bottom: 12, left: 30, right: 30 }}>
                      <View style={[styles.handlePill, { backgroundColor: colors.text.muted }]} />
                    </View>
                  ) : (
                    <View style={styles.handleSpacer} />
                  )}

                  {(Boolean(title) || Boolean(eyebrow) || Boolean(subtitle)) && (
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
                      <View style={styles.headerActionsPlaceholder} />
                    </View>
                  )}
                </View>
              </GestureDetector>

              {(showCloseButton || Boolean(headerRight)) && (
                <View style={styles.headerActionsAbsolute} pointerEvents="box-none">
                  {headerRight}
                  {showCloseButton && (
                    <Pressable
                      onPress={startCloseAnimation}
                      hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                      style={({ pressed }) => [
                        styles.closeButton,
                        {
                          backgroundColor: colors.surface2,
                          borderRadius: 17,
                          opacity: pressed ? 0.6 : 1,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Close"
                    >
                      <Ionicons name="close" size={18} color={colors.text.secondary} />
                    </Pressable>
                  )}
                </View>
              )}

              {scrolled ? (
                <View style={[styles.divider, { backgroundColor: colors.borderStrong }]} />
              ) : null}
            </View>

            {bodyScrolls ? (
              renderBody()
            ) : (
              <GestureDetector gesture={bodyPan}>
                {renderBody()}
              </GestureDetector>
            )}

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
        </View>
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
    position: 'relative',
  },
  headerDragArea: {
    width: '100%',
  },
  handleContainer: {
    alignItems: 'center',
    height: 28,
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
    paddingTop: 4,
  },
  titleColumn: {
    flex: 1,
    paddingRight: 12,
  },
  titleText: {
    letterSpacing: -0.2,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.52)',
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  headerActionsAbsolute: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    right: 20,
    top: 26,
    zIndex: 30,
  },
  headerActionsPlaceholder: {
    width: 38,
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
