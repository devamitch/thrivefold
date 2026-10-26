/**
 * SessionComplete — the "workout done" summary screen.
 * Shows XP earned, form score, per-exercise breakdown, and celebratory next action.
 */

import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { SquircleSurface } from '../ui/SquircleSurface';
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
          paddingTop: insets.top + spacing.base,
          paddingBottom: insets.bottom + spacing.base,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.base,
          paddingBottom: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(280)}
          style={styles.header}
        >
          {/* Celebratory Icon Badge */}
          <View style={[styles.trophyBadge, { backgroundColor: colors.primaryAlpha }]}>
            <Ionicons name="trophy" size={36} color={colors.primary} />
          </View>

          <Text style={[typography.display, styles.title, { color: colors.text.primary }]}>
            Workout Complete!
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={15} color={colors.text.muted} />
            <Text style={[typography.body, { color: colors.text.secondary, marginLeft: 5 }]}>
              {clock(elapsed)}
            </Text>
            <Text style={[typography.body, { color: colors.text.muted, marginHorizontal: 6 }]}>·</Text>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
              {planTitle}
            </Text>
          </View>
        </Animated.View>

        {/* Hero XP & Reward Card */}
        <SquircleSurface
          radius={24}
          fill={colors.surface}
          style={[
            styles.xpCard,
            {
              borderColor: colors.border,
              borderWidth: StyleSheet.hairlineWidth,
              marginTop: spacing.md,
            },
          ]}
        >
          <View style={[styles.xpPill, { backgroundColor: colors.primaryAlpha }]}>
            <Ionicons name="flame-outline" size={16} color={colors.primary} />
            <Text style={[typography.subheading, { color: colors.primary, marginLeft: 6 }]}>
              +{done.xp} XP Earned
            </Text>
          </View>

          <Text
            style={[
              typography.subbody,
              { color: colors.text.secondary, marginTop: 10, textAlign: 'center', lineHeight: 20 },
            ]}
          >
            {done.rewardNote || 'Great effort! Your session has been safely recorded to your history and calendar.'}
          </Text>
        </SquircleSurface>

        {/* Exercise Breakdown */}
        <Text
          style={[
            typography.captionBold,
            { color: colors.text.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: spacing.lg, marginBottom: spacing.xs },
          ]}
        >
          Exercises Finished
        </Text>

        {done.lines.map((l) => (
          <SquircleSurface
            key={l.name}
            radius={18}
            fill={colors.surface}
            style={[
              styles.exerciseItem,
              {
                borderColor: colors.border,
                borderWidth: StyleSheet.hairlineWidth,
                marginBottom: spacing.xs,
              },
            ]}
          >
            <View style={[styles.checkCircle, { backgroundColor: colors.success + '1A' }]}>
              <Ionicons name="checkmark-sharp" size={16} color={colors.success} />
            </View>
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{l.name}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                {l.detail}
              </Text>
            </View>
          </SquircleSurface>
        ))}
      </ScrollView>

      {/* Primary Action Button */}
      <View style={{ paddingHorizontal: spacing.base, paddingTop: spacing.xs }}>
        <Button
          label="Done · Back to Exercises"
          size="lg"
          onPress={() => router.replace('/(app)/health/exercise' as Href)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 12,
  },
  trophyBadge: {
    alignItems: 'center',
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    marginBottom: 16,
    width: 72,
  },
  title: {
    textAlign: 'center',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  xpCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  xpPill: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  exerciseItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  checkCircle: {
    alignItems: 'center',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    marginRight: 12,
    width: 28,
  },
});
