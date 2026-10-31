import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { hapticLight } from '../../services/haptics/hapticFeedback';
import { useTheme } from '../../theme/useTheme';

export const ITEM_H = 44;
export const VISIBLE_ROWS = 5; // odd: the middle row is the selection
const PAD = ((VISIBLE_ROWS - 1) / 2) * ITEM_H;

interface ItemProps {
  label: string;
  i: number;
  scrollY: SharedValue<number>;
  color: string;
  textStyle: object;
}

const Item = memo(function Item({ label, i, scrollY, color, textStyle }: ItemProps) {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(scrollY.value - i * ITEM_H);
    return {
      opacity: interpolate(d, [0, ITEM_H, ITEM_H * 2], [1, 0.45, 0.16], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(d, [0, ITEM_H * 2], [1, 0.8], Extrapolation.CLAMP) }],
    };
  });
  return (
    <Animated.View style={[styles.item, style]}>
      <Text style={[textStyle, { color }]}>{label}</Text>
    </Animated.View>
  );
});

interface Props {
  data: string[];
  index: number;
  onChange: (index: number) => void;
  width: number;
  /** Endless wheel (hours, minutes). Off for AM/PM. */
  loop?: boolean;
  accessibilityLabel: string;
}

/**
 * Snap wheel: native scroll physics, UI-thread fade/scale, a haptic tick per row,
 * and a value that is only committed once the wheel has settled.
 */
export function WheelPicker({ data, index, onChange, width, loop = false, accessibilityLabel }: Props) {
  const { colors, typography } = useTheme();
  const n = data.length;
  // enough copies that a hard fling can't reach the ends before it settles
  const copies = loop ? Math.max(3, 2 * Math.ceil(60 / n) + 1) : 1;
  const mid = (copies - 1) / 2;
  const rows = useMemo(() => Array.from({ length: n * copies }, (_, k) => data[k % n]), [data, n, copies]);
  const offsetFor = useCallback((i: number) => (mid * n + i) * ITEM_H, [mid, n]);

  const ref = useRef<Animated.ScrollView>(null);
  const current = useRef(index);
  const scrollY = useSharedValue(offsetFor(index));
  const lastRaw = useSharedValue(mid * n + index);
  const silent = useSharedValue(false);

  const tick = useCallback(() => hapticLight(), []);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
    const raw = Math.round(e.contentOffset.y / ITEM_H);
    if (silent.value) {
      silent.value = false;
      lastRaw.value = raw;
      return;
    }
    if (raw !== lastRaw.value) {
      lastRaw.value = raw;
      runOnJS(tick)();
    }
  });

  const settle = useCallback(
    (y: number) => {
      const raw = Math.round(y / ITEM_H);
      const value = ((raw % n) + n) % n;
      if (loop) {
        const target = offsetFor(value);
        if (Math.abs(target - raw * ITEM_H) > 1) {
          silent.value = true; // invisible jump back to the middle copy
          ref.current?.scrollTo({ y: target, animated: false });
        }
      }
      if (value !== current.current) {
        current.current = value;
        onChange(value);
      }
    },
    [n, loop, offsetFor, onChange, silent],
  );

  // External changes (chips, voice, edit load): glide to the nearest matching row.
  useEffect(() => {
    if (index === current.current) return;
    current.current = index;
    const curRaw = Math.round(scrollY.value / ITEM_H);
    const base = Math.floor(curRaw / n) * n;
    const best = [base - n + index, base + index, base + n + index]
      .filter((r) => r >= 0 && r < n * copies)
      .sort((a, b) => Math.abs(a - curRaw) - Math.abs(b - curRaw))[0];
    ref.current?.scrollTo({ y: (best ?? mid * n + index) * ITEM_H, animated: true });
    const t = setTimeout(() => {
      if (loop) settle((best ?? mid * n + index) * ITEM_H);
    }, 450);
    return () => clearTimeout(t);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Android ignores contentOffset on first layout, so position explicitly.
  useEffect(() => {
    const id = requestAnimationFrame(() => ref.current?.scrollTo({ y: offsetFor(index), animated: false }));
    return () => cancelAnimationFrame(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const textStyle = useMemo(() => [typography.heading, { fontSize: 26, textAlign: 'center' as const }], [typography]);

  return (
    <View
      style={{ width, height: ITEM_H * VISIBLE_ROWS }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: data[index] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        const step = e.nativeEvent.actionName === 'increment' ? 1 : -1;
        const next = loop ? (index + step + n) % n : Math.min(n - 1, Math.max(0, index + step));
        if (next !== index) onChange(next);
      }}
    >
      <Animated.ScrollView
        ref={ref}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        overScrollMode="never"
        bounces={!loop}
        contentOffset={{ x: 0, y: offsetFor(index) }}
        contentContainerStyle={{ paddingVertical: PAD }}
        onMomentumScrollEnd={(e) => settle(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => {
          if (Math.abs(e.nativeEvent.velocity?.y ?? 0) < 0.1) settle(e.nativeEvent.contentOffset.y);
        }}
      >
        {rows.map((label, i) => (
          <Item key={i} label={label} i={i} scrollY={scrollY} color={colors.text.primary} textStyle={textStyle} />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
});
