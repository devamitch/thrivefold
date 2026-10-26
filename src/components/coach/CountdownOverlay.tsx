/**
 * CountdownOverlay — countdown === 4 is the "Get ready" beat (the coach reads the set intro),
 * then 3, 2, 1. Numbers have no disc: just a thin ring and a big numeral so the person
 * stays visible. Haptic ticks, spoken "Go" only (set up in useCoachSession).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';

import type { FramingCue } from '../../domain/pose/movement';
import { useTheme } from '../../theme/useTheme';
import { CoachGlass, ProgressRing } from '../workout/CoachGlass';

interface CountdownOverlayProps {
  countdown: number; // 4 = get ready, 3..1 = numbers
  exerciseName: string;
  target: number;
  unit: string;
  framing: FramingCue | null;
  movementCue?: string;
  introMs?: number; // unused, kept for compatibility
}

export function CountdownOverlay({
  countdown,
  exerciseName,
  target,
  unit,
  framing,
  movementCue,
}: CountdownOverlayProps) {
  const reduceMotion = useReducedMotion();
  const { colors, typography, spacing } = useTheme();
  const getReady = countdown >= 4;
  const detail = `${target} ${unit === 's' ? 'seconds' : 'reps'}`;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      {getReady ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(180)}
          exiting={reduceMotion ? undefined : FadeOut.duration(120)}
        >
          <CoachGlass radius={26} strong style={[styles.card, { marginHorizontal: spacing.lg }]}>
            <Text
              style={[
                typography.captionBold,
                { color: colors.callMuted, letterSpacing: 1, textAlign: 'center' },
              ]}
            >
              GET READY
            </Text>
            <Text
              style={[
                typography.subheading,
                { color: colors.callText, textAlign: 'center', marginTop: 4 },
              ]}
              numberOfLines={2}
            >
              {exerciseName}
            </Text>
            <Text
              style={[
                typography.subbody,
                { color: colors.callMuted, textAlign: 'center', marginTop: 2 },
              ]}
            >
              {detail}
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.callMuted, textAlign: 'center', marginTop: 10 },
              ]}
              numberOfLines={3}
            >
              {framing ? framing.text : (movementCue ?? 'Get into position')}
            </Text>
          </CoachGlass>
        </Animated.View>
      ) : (
        <View style={styles.numBox}>
          <View style={StyleSheet.absoluteFill}>
            <ProgressRing
              size={180}
              stroke={4}
              durationMs={1000}
              cycle={countdown}
              color={colors.callText}
              track={colors.callSurfaceStrong}
            />
          </View>
          <Animated.Text
            key={countdown}
            entering={reduceMotion ? undefined : FadeIn.duration(140)}
            style={[typography.display, styles.num, { color: colors.callText }]}
          >
            {countdown}
          </Animated.Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 22, paddingVertical: 18 },
  num: {
    fontSize: 88,
    lineHeight: 96,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  numBox: { alignItems: 'center', height: 180, justifyContent: 'center', width: 180 },
  wrap: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
