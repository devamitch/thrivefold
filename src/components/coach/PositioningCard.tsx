/**
 * PositioningCard — shown while the camera is on and the workout has not begun. Passive: it says
 * what the camera needs and nothing starts until the person taps Start.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FramingCue } from '../../domain/pose/movement';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import { CoachGlass } from '../workout/CoachGlass';

interface Props {
  trackingReady: boolean;
  hasPerson: boolean;
  framing: FramingCue | null;
  canStartAnyway: boolean;
  onStartAnyway: () => void;
}

export function PositioningCard({
  trackingReady,
  hasPerson,
  framing,
  canStartAnyway,
  onStartAnyway,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const title = !trackingReady
    ? 'Starting camera'
    : !hasPerson
      ? 'Step into view'
      : framing
        ? framing.text
        : 'You’re in view';

  return (
    <View
      style={[styles.wrap, { paddingHorizontal: spacing.base, paddingBottom: insets.bottom + 8 }]}
    >
      <CoachGlass radius={28} strong style={styles.card}>
        <View style={styles.copy}>
          <Text style={[typography.captionBold, { color: colors.callMuted, letterSpacing: 0.8 }]}>
            POSITIONING
          </Text>
          <Text
            style={[typography.bodyBold, { color: colors.callText, marginTop: 2 }]}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text style={[typography.caption, { color: colors.callMuted, marginTop: 2 }]}>
            Whole body in view, about two metres back. Tap Start when you’re ready.
          </Text>
        </View>
        {canStartAnyway ? (
          <PressableScale
            onPress={onStartAnyway}
            accessibilityRole="button"
            accessibilityLabel="Start the workout"
            style={[styles.btn, { backgroundColor: colors.callText }]}
          >
            <Text style={[typography.subbodyBold, { color: colors.callBackground }]}>Start</Text>
          </PressableScale>
        ) : null}
      </CoachGlass>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginLeft: 12,
    paddingHorizontal: 18,
  },
  card: { alignItems: 'center', flexDirection: 'row', padding: 16 },
  copy: { flex: 1 },
  wrap: { bottom: 0, left: 0, position: 'absolute', right: 0 },
});
