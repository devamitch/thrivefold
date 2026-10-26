/**
 * CountdownOverlay — the 3-2-1 before each set.
 * Centered ring with the number, exercise name below.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn, useReducedMotion } from 'react-native-reanimated';

import { CoachGlass, ProgressRing } from '../workout/CoachGlass';
import { useTheme } from '../../theme/useTheme';
import type { FramingCue } from '../../domain/pose/movement';

interface CountdownOverlayProps {
  countdown: number;
  introMs: number;
  exerciseName: string;
  target: number;
  unit: string;
  framing: FramingCue | null;
  movementCue?: string;
}

export function CountdownOverlay({
  countdown, introMs, exerciseName, target, unit, framing, movementCue,
}: CountdownOverlayProps) {
  const reduceMotion = useReducedMotion();
  const { colors, typography, spacing } = useTheme();

  return (
    <View pointerEvents="none" style={styles.countWrap}>
      <CoachGlass radius={110} style={styles.countDisc}>
        <View style={StyleSheet.absoluteFill}>
          <ProgressRing
            size={220}
            stroke={8}
            durationMs={countdown === 3 && introMs ? introMs : 900}
            cycle={countdown}
            color={colors.primary}
            track={colors.callSurfaceStrong}
          />
        </View>
        <Animated.Text
          key={countdown}
          entering={reduceMotion ? undefined : ZoomIn.duration(220)}
          style={[typography.display, styles.countNumber, { color: colors.callText }]}
        >
          {countdown}
        </Animated.Text>
      </CoachGlass>
      <CoachGlass radius={22} style={[styles.countInfo, { marginHorizontal: spacing.lg }]}>
        <Text style={[typography.bodyBold, { color: colors.callText, textAlign: 'center' }]}>
          {exerciseName} · {target} {unit === 's' ? 'seconds' : 'reps'}
        </Text>
        <Text
          style={[typography.subbody, { color: colors.callMuted, textAlign: 'center', marginTop: 4 }]}
          numberOfLines={3}
        >
          {framing ? framing.text : (movementCue ?? 'Get into position')}
        </Text>
      </CoachGlass>
    </View>
  );
}

const styles = StyleSheet.create({
  countDisc: { alignItems: 'center', height: 220, justifyContent: 'center', width: 220 },
  countInfo: { marginTop: 18, paddingHorizontal: 18, paddingVertical: 14 },
  countNumber: { fontSize: 96, lineHeight: 104 },
  countWrap: {
    alignItems: 'center', bottom: 0, justifyContent: 'center',
    left: 0, position: 'absolute', right: 0, top: 0,
  },
});
