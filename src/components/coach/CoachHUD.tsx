/**
 * CoachHUD — bottom card during a set.
 * Big numeral + "/ target", one thin progress bar, one status line, the glass done orb.
 * Plain translucent glass (no backdrop blur over the camera).
 */

import React from 'react';
import type { TextStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Exercise } from '../../domain/fitness/workouts';
import type { MovementDefinition, RepState } from '../../domain/pose/movement';
import { useTheme } from '../../theme/useTheme';
import { GlassIconButton, GlassMarks } from '../ui/GlassOrbButton';
import { CoachGlass } from '../workout/CoachGlass';

interface UpNext {
  ex: Exercise | undefined;
  set: number;
  of: number;
}

interface CoachHUDProps {
  counted: number;
  remaining: number;
  unit: string;
  share: number;
  fault: RepState['fault'];
  cameraMain: boolean;
  movement: MovementDefinition | undefined;
  upNext: UpNext | null;
  counterStyle: AnimatedStyle<TextStyle>;
  onSetDone: () => void;
}

/** Height of the card above the safe-area inset; the banner sits above it. */
export const COACH_HUD_HEIGHT = 88;

export function CoachHUD({
  counted,
  remaining,
  unit,
  share,
  fault,
  cameraMain,
  movement,
  upNext,
  counterStyle,
  onSetDone,
}: CoachHUDProps) {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const target = counted + remaining;
  const unitLabel = unit === 's' ? 'seconds' : 'reps';
  const status =
    !movement && cameraMain
      ? 'Not camera-checked · tap ✓ when done'
      : upNext
        ? `Next · ${upNext.ex?.name ?? 'Exercise'} · set ${upNext.set}/${upNext.of}`
        : 'Last set';

  return (
    <View
      style={[styles.bar, { paddingHorizontal: spacing.base, paddingBottom: insets.bottom + 8 }]}
    >
      <CoachGlass radius={28} style={styles.card}>
        <View
          style={styles.left}
          accessibilityLiveRegion="polite"
          accessibilityLabel={`${counted} of ${target} ${unitLabel}`}
        >
          <Animated.Text
            style={[typography.display, styles.num, { color: colors.callText }, counterStyle]}
          >
            {counted}
          </Animated.Text>
          <Text style={[typography.caption, { color: colors.callMuted }]}>/ {target}</Text>
        </View>

        <View style={styles.mid}>
          <Text
            style={[typography.captionBold, { color: colors.callMuted, letterSpacing: 0.6 }]}
            numberOfLines={1}
          >
            {unitLabel.toUpperCase()}
          </Text>
          <View style={[styles.track, { backgroundColor: colors.callSurfaceStrong }]}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.round(share * 100)}%`,
                  backgroundColor: fault ? colors.error : colors.callText,
                },
              ]}
            />
          </View>
          <Text style={[typography.caption, { color: colors.callMuted }]} numberOfLines={1}>
            {status}
          </Text>
        </View>

        <GlassIconButton
          path={GlassMarks.check}
          accessibilityLabel={remaining > 0 ? 'Set done' : 'Next'}
          onPress={onSetDone}
          size={48}
          tone="primary"
        />
      </CoachGlass>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { bottom: 0, left: 0, position: 'absolute', right: 0 },
  card: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12 },
  fill: { borderRadius: 2, height: 4 },
  left: { alignItems: 'flex-start', minWidth: 64 },
  mid: { flex: 1, gap: 5, marginHorizontal: 12 },
  num: { fontSize: 38, lineHeight: 42 },
  track: { borderRadius: 2, height: 4, overflow: 'hidden' },
});
