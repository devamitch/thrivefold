import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';

const W = 52;
const H = 32;
const KNOB = 26;
const PAD = (H - KNOB) / 2;
const TRAVEL = W - KNOB - PAD * 2;
const MOTION = { duration: 220, easing: Easing.bezier(0.25, 0.9, 0.3, 1) };

export interface ToggleProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  /** Accepted for drop-in replacement of RN Switch; colours always come from the theme. */
  trackColor?: unknown;
  thumbColor?: unknown;
  ios_backgroundColor?: unknown;
}

/**
 * The app's switch: theme-coloured track, a knob that slides and stretches slightly while
 * pressed (iOS feel), a light haptic tick. The native Android Switch ignores the theme track
 * colour on this architecture, so it isn't used.
 */
export function Toggle({ value, onValueChange, disabled, accessibilityLabel, style }: ToggleProps) {
  const { colors } = useTheme();
  const reduce = useReducedMotion();
  const on = useSharedValue(value ? 1 : 0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    on.value = reduce ? (value ? 1 : 0) : withTiming(value ? 1 : 0, MOTION);
  }, [value, reduce, on]);

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.value, [0, 1], [colors.surface3, colors.primary]),
  }));
  const knob = useAnimatedStyle(() => {
    const stretch = pressed.value * 6;
    return {
      width: KNOB + stretch,
      transform: [{ translateX: on.value * (TRAVEL - stretch) }],
    };
  });

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        Haptics.selectionAsync().catch(() => undefined);
        onValueChange?.(!value);
      }}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 160 });
      }}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: Boolean(disabled) }}
      style={[{ opacity: disabled ? 0.45 : 1 }, style]}
    >
      <Animated.View style={[styles.track, track]}>
        <Animated.View style={[styles.knob, knob]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: H / 2,
    height: H,
    justifyContent: 'center',
    paddingHorizontal: PAD,
    width: W,
  },
  knob: {
    backgroundColor: '#FFFFFF',
    borderRadius: KNOB / 2,
    height: KNOB,
  },
});

export default Toggle;
