import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/useTheme';

interface Props {
  visible: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Sheet for forms with wheels and fields.
 * The sheet only drags from its header, so nothing in the body (wheels, chips, scrolling)
 * can ever move it. Keyboard overlap is measured, so it works with or without window resize.
 */
export function RoutineBottomSheet({ visible, onClose, eyebrow, title, subtitle, children }: Props) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();

  const [mounted, setMounted] = useState(visible);
  const ty = useSharedValue(winH);
  const kb = useSharedValue(0);
  const sheetRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      ty.value = winH;
      ty.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
    } else if (mounted) {
      Keyboard.dismiss();
      ty.value = withTiming(winH, { duration: 220, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvt, (e) => {
      // measure what is actually covered instead of trusting the window mode
      setTimeout(() => {
        (sheetRef.current as any)?.measureInWindow?.((_x: number, y: number, _w: number, h: number) => {
          const overlap = Math.max(0, y + h - e.endCoordinates.screenY);
          kb.value = withTiming(overlap, { duration: 180 });
        });
      }, 60);
    });
    const hide = Keyboard.addListener(hideEvt, () => {
      kb.value = withTiming(0, { duration: 160 });
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [kb]);

  const drag = Gesture.Pan()
    .activeOffsetY([-4, 4])
    .onUpdate((e) => {
      ty.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 110 || e.velocityY > 900) runOnJS(onClose)();
      else ty.value = withTiming(0, { duration: 180 });
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value - kb.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ty.value, [0, winH], [0.45, 0]),
  }));

  if (!mounted) return null;

  return (
    <Modal transparent visible statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>

        <Animated.View
          ref={sheetRef}
          collapsable={false}
          style={[styles.sheet, { backgroundColor: colors.surface1, maxHeight: winH * 0.94 }, sheetStyle]}
        >
          <GestureDetector gesture={drag}>
            <View style={styles.header}>
              <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
              <View style={styles.titleRow}>
                <View style={{ flex: 1 }}>
                  {eyebrow ? (
                    <Text style={[typography.captionBold, { color: colors.primary, letterSpacing: 0.8 }]}>{eyebrow}</Text>
                  ) : null}
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>{title}</Text>
                  {subtitle ? (
                    <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{subtitle}</Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={onClose}
                  hitSlop={10}
                  style={[styles.close, { backgroundColor: colors.surface2 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Ionicons name="close" size={18} color={colors.text.secondary} />
                </Pressable>
              </View>
            </View>
          </GestureDetector>

          <ScrollView
            nestedScrollEnabled
            bounces={false}
            overScrollMode="never"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: insets.bottom + 16 }}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: 10, marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  close: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
