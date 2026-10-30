/**
 * Full-screen image viewer that grows out of the tapped thumbnail and shrinks back into it (a
 * shared-element style transition without a new navigation stack). Pinch to zoom, double-tap to
 * zoom in or out, drag down to close, or use the back button.
 */
import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';
import React, { useEffect } from 'react';
import { Modal, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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

import { PressableScale } from './PressableScale';

export interface ViewerOrigin {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageViewer({
  source,
  origin,
  caption,
  aspectRatio = 16 / 9,
  onClose,
}: {
  source: ImageSource | number | null;
  origin: ViewerOrigin | null;
  caption?: string;
  /** Width / height of the image, so it fits the screen without stretching. */
  aspectRatio?: number;
  onClose: () => void;
}) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const open = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const dragY = useSharedValue(0);

  const visible = !!source && !!origin;
  const targetW = W;
  const targetH = Math.min(H, W / aspectRatio);
  const targetY = (H - targetH) / 2;

  useEffect(() => {
    if (!visible) return;
    scale.value = 1;
    savedScale.value = 1;
    dragY.value = 0;
    open.value = reduce ? 1 : withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [visible, reduce, open, scale, savedScale, dragY]);

  const close = () => {
    open.value = reduce
      ? 0
      : withTiming(0, { duration: 220, easing: Easing.in(Easing.cubic) }, (done) => {
          if (done) runOnJS(onClose)();
        });
    if (reduce) onClose();
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(4, Math.max(1, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const next = scale.value > 1.2 ? 1 : 2.2;
      scale.value = withTiming(next, { duration: 200 });
      savedScale.value = next;
    });
  const pan = Gesture.Pan()
    .activeOffsetY([-12, 12])
    .onUpdate((e) => {
      if (scale.value <= 1.05) dragY.value = e.translationY;
    })
    .onEnd((e) => {
      if (scale.value <= 1.05 && (Math.abs(e.translationY) > 120 || Math.abs(e.velocityY) > 1000)) {
        runOnJS(close)();
      } else {
        dragY.value = withSpring(0, { damping: 18, stiffness: 200 });
      }
    });
  const gesture = Gesture.Simultaneous(pinch, pan, doubleTap);

  const ox = origin?.x ?? 0;
  const oy = origin?.y ?? 0;
  const ow = origin?.width ?? targetW;
  const oh = origin?.height ?? targetH;

  const frame = useAnimatedStyle(() => {
    const p = open.value;
    return {
      left: interpolate(p, [0, 1], [ox, 0]),
      top: interpolate(p, [0, 1], [oy, targetY]) + dragY.value,
      width: interpolate(p, [0, 1], [ow, targetW]),
      height: interpolate(p, [0, 1], [oh, targetH]),
      borderRadius: interpolate(p, [0, 1], [16, 0]),
      transform: [{ scale: scale.value }],
    };
  });
  const backdrop = useAnimatedStyle(() => ({
    opacity: open.value * (1 - Math.min(1, Math.abs(dragY.value) / 400)),
  }));
  const chrome = useAnimatedStyle(() => ({ opacity: open.value }));

  if (!visible) return null;
  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <GestureHandlerRootView style={styles.fill}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]} />
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.frame, frame]}>
            <Image
              source={source}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              accessibilityLabel={caption}
              accessibilityIgnoresInvertColors
            />
          </Animated.View>
        </GestureDetector>
        <Animated.View style={[styles.top, { paddingTop: insets.top + 8 }, chrome]} pointerEvents="box-none">
          <PressableScale onPress={close} style={styles.close} accessibilityLabel="Close image" hitSlop={10}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </PressableScale>
        </Animated.View>
        {caption ? (
          <Animated.View style={[styles.caption, { paddingBottom: insets.bottom + 16 }, chrome]} pointerEvents="none">
            <Text style={styles.captionText}>{caption}</Text>
          </Animated.View>
        ) : null}
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // A dark backdrop for photos regardless of theme (image-viewer convention).
  backdrop: { backgroundColor: '#0B0F0C' },
  frame: { position: 'absolute', overflow: 'hidden' },
  top: { position: 'absolute', top: 0, right: 12 },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  caption: { position: 'absolute', left: 20, right: 20, bottom: 0 },
  captionText: { color: '#FFFFFF', fontSize: 15, lineHeight: 21, textAlign: 'center' },
});
