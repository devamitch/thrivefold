import React, { memo, type ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

export interface MotionBlurAdapterProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  enabled?: boolean;
  intensity?: number;
  samples?: number;
  live?: boolean;
  speedForMaxBlur?: number;
}

// Safe dynamic resolution of expo-motion-blur if linked in the native build
let NativeMotionBlurView: React.ComponentType<any> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const module = require('expo-motion-blur');
  NativeMotionBlurView = module.MotionBlurView ?? null;
} catch {
  NativeMotionBlurView = null;
}

export const isMotionBlurSupported = (): boolean => {
  if (Platform.OS !== 'android') return false;
  return Boolean(NativeMotionBlurView);
};

export const MotionBlurAdapter = memo(function MotionBlurAdapter({
  children,
  style,
  enabled = true,
  intensity = 0.5,
  samples = 6,
  live = false,
  speedForMaxBlur = 1000,
}: MotionBlurAdapterProps) {
  const reduceMotion = useReducedMotion();

  // If reduced motion is requested, disabled, or native module is absent, fall back to plain View
  if (!enabled || reduceMotion || !NativeMotionBlurView) {
    return <View style={style}>{children}</View>;
  }

  return (
    <NativeMotionBlurView
      style={style}
      enabled={enabled}
      intensity={intensity}
      samples={samples}
      live={live}
      speedForMaxBlur={speedForMaxBlur}
    >
      {children}
    </NativeMotionBlurView>
  );
});

export default MotionBlurAdapter;
