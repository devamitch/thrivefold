/**
 * RestOverlay — the glass rest screen between sets.
 * Shows countdown ring, what's coming next, "+15s" and "I'm ready" buttons.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '../ui/PressableScale';
import { CoachGlass, ProgressRing } from '../workout/CoachGlass';
import { exerciseById } from '../../domain/fitness/workouts';
import { movementForExercise } from '../../domain/pose/movement';
import { useTheme } from '../../theme/useTheme';
import type { PlanItem } from '../../domain/fitness/workouts';

interface RestOverlayProps {
  rest: number;
  restTotal: number;
  nextItem: PlanItem | null;
  setIdx: number;
  onAddRest: () => void;
  onSkipRest: () => void;
}

export function RestOverlay({ rest, restTotal, nextItem, setIdx, onAddRest, onSkipRest }: RestOverlayProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { colors, typography, spacing } = useTheme();

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(240)}
      exiting={reduceMotion ? undefined : FadeOut.duration(200)}
      style={[
        styles.restWrap,
        { paddingHorizontal: spacing.base, paddingBottom: insets.bottom + spacing.base },
      ]}
    >
      <CoachGlass radius={30} strong style={styles.restCard}>
        <View style={styles.row}>
          <View style={styles.ringBox}>
            <ProgressRing
              size={96}
              stroke={7}
              progress={restTotal ? rest / restTotal : 0}
              color={colors.primary}
              track={colors.callSurfaceStrong}
            />
            <View style={[StyleSheet.absoluteFill, styles.center]}>
              <Text style={[typography.display, styles.counterBig, { color: colors.callText }]}>
                {rest}
              </Text>
            </View>
          </View>
          <View style={[styles.flex, { marginLeft: 16 }]}>
            <Text style={[typography.label, { color: colors.callMuted }]}>Rest and breathe</Text>
            {nextItem ? (
              <>
                <Text
                  style={[typography.subheading, { color: colors.callText, marginTop: 2 }]}
                  numberOfLines={2}
                >
                  {exerciseById(nextItem.exerciseId)?.name}
                </Text>
                <Text style={[typography.caption, { color: colors.callMuted }]}>
                  Set {setIdx + 1} of {nextItem.sets} · {nextItem.target}{' '}
                  {exerciseById(nextItem.exerciseId)?.timed ? 'seconds' : 'reps'}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {nextItem && movementForExercise(nextItem.exerciseId)?.cue ? (
          <Text style={[typography.subbody, { color: colors.callText, marginTop: 12 }]} numberOfLines={3}>
            {movementForExercise(nextItem.exerciseId)?.cue}
          </Text>
        ) : null}

        <View style={[styles.row, { gap: 10, marginTop: 14 }]}>
          <PressableScale
            onPress={onAddRest}
            accessibilityRole="button"
            accessibilityLabel="Add 15 seconds of rest"
            style={[styles.restBtn, styles.flex, { backgroundColor: colors.callSurfaceStrong }]}
          >
            <Text style={[typography.bodyBold, { color: colors.callText }]}>+15 s</Text>
          </PressableScale>
          <PressableScale
            onPress={onSkipRest}
            accessibilityRole="button"
            style={[styles.restBtn, styles.flex, { backgroundColor: colors.primary }]}
          >
            <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>I'm ready</Text>
          </PressableScale>
        </View>
      </CoachGlass>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  counterBig: { fontSize: 34, lineHeight: 40 },
  flex: { flex: 1 },
  restBtn: { alignItems: 'center', borderRadius: 22, height: 48, justifyContent: 'center' },
  restCard: { padding: 18 },
  restWrap: { bottom: 0, left: 0, position: 'absolute', right: 0 },
  ringBox: { height: 88, minWidth: 88, justifyContent: 'center' },
  row: { alignItems: 'center', flexDirection: 'row' },
});
