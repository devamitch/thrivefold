/**
 * CoachHUD — the bottom heads-up display during live coaching.
 * Shows progress ring with rep count, what's next, and the "set done" button.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import type { TextStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Exercise } from '../../domain/fitness/workouts';
import type { MovementDefinition, RepState } from '../../domain/pose/movement';
import { useTheme } from '../../theme/useTheme';
import { FrostedView } from '../ui/FrostedView';
import { PressableScale } from '../ui/PressableScale';
import { ProgressRing } from '../workout/CoachGlass';

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

  return (
    <View
      style={[
        styles.bottomBar,
        { paddingHorizontal: spacing.base, paddingBottom: insets.bottom + spacing.base },
      ]}
    >
      <FrostedView
        tone="dark"
        tintOpacity={0.84}
        style={[
          styles.hud,
          {
            borderRadius: 28,
            borderColor: 'rgba(255, 255, 255, 0.12)',
            borderWidth: StyleSheet.hairlineWidth,
          },
        ]}
      >
        <View
          style={styles.ringBox}
          accessibilityLabel={`${counted} of ${counted + remaining} ${unit}. ${remaining} to go`}
          accessibilityLiveRegion="polite"
        >
          <ProgressRing
            size={88}
            stroke={7}
            progress={share}
            color={fault ? colors.error : colors.primary}
            track={colors.callSurfaceStrong}
          />
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <Animated.Text
              style={[
                typography.display,
                styles.counterBig,
                { color: colors.callText },
                counterStyle,
              ]}
            >
              {counted}
            </Animated.Text>
          </View>
        </View>

        <View style={[styles.flex, { marginLeft: 14 }]}>
          <Text style={[typography.bodyBold, { color: colors.callText }]} numberOfLines={1}>
            {remaining > 0
              ? `${remaining} ${unit === 's' ? 's' : remaining === 1 ? 'rep' : 'reps'} to go`
              : 'Target reached'}
          </Text>
          <Text
            style={[typography.caption, { color: colors.callMuted, marginTop: 2 }]}
            numberOfLines={2}
          >
            {!movement && cameraMain
              ? 'Not camera-checked: tap done when finished'
              : upNext
                ? `Next: ${upNext.ex?.name ?? 'Exercise'} · set ${upNext.set}/${upNext.of}`
                : 'Last set of the workout'}
          </Text>
        </View>

        <PressableScale
          onPress={onSetDone}
          accessibilityRole="button"
          accessibilityLabel={remaining > 0 ? 'Set done' : 'Next'}
          style={[styles.doneBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="checkmark" size={26} color={colors.onPrimary} />
        </PressableScale>
      </FrostedView>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: { bottom: 0, left: 0, position: 'absolute', right: 0 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  counterBig: { fontSize: 34, lineHeight: 40 },
  doneBtn: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginLeft: 10,
    width: 56,
  },
  flex: { flex: 1 },
  hud: { alignItems: 'center', flexDirection: 'row', padding: 12 },
  ringBox: { height: 88, minWidth: 88, justifyContent: 'center' },
});
