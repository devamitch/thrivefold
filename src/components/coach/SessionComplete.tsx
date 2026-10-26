/**
 * SessionComplete — the "workout done" summary screen.
 * Shows XP earned, form score, per-exercise breakdown, and a "Done" button.
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';

import { Button } from '../ui/Button';
import { useTheme } from '../../theme/useTheme';
import { clock, type DoneSummary } from './useCoachSession';

interface SessionCompleteProps {
  done: DoneSummary;
  elapsed: number;
  planTitle: string;
}

export function SessionComplete({ done, elapsed, planTitle }: SessionCompleteProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={[
        styles.flex,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.base,
          paddingBottom: insets.bottom + spacing.base,
        },
      ]}
    >
      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.duration(300)}
        style={styles.flex}
      >
        <Text style={[typography.display, { color: colors.text.primary }]}>Workout done</Text>
        <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.xs }]}>
          {clock(elapsed)} · {planTitle}
        </Text>

        <View style={[styles.xpBox, { backgroundColor: colors.primaryAlpha, marginTop: spacing.lg }]}>
          <Text style={[typography.display, { color: colors.primary }]}>+{done.xp} XP</Text>
          <Text
            style={[typography.subbody, { color: colors.text.secondary, marginTop: 4, textAlign: 'center' }]}
          >
            {done.rewardNote}
          </Text>
        </View>

        {done.lines.map((l) => (
          <View key={l.name} style={styles.summaryRow}>
            <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>
              {l.name}
            </Text>
            <Text style={[typography.subbody, { color: colors.text.secondary }]}>{l.detail}</Text>
          </View>
        ))}
      </Animated.View>

      <Button
        label="Done"
        size="lg"
        onPress={() => router.replace('/(app)/health/exercise' as Href)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summaryRow: { alignItems: 'center', flexDirection: 'row', paddingVertical: 12 },
  xpBox: { alignItems: 'center', borderRadius: 20, marginBottom: 16, padding: 20 },
});
