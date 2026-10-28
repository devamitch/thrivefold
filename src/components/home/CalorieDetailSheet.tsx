import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme/useTheme';
import { AppBottomSheetModal } from '../ui/AppBottomSheetModal';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import type { CalorieBreakdown } from '../../domain/activity/calories';

interface Props {
  visible: boolean;
  onClose: () => void;
  breakdown: CalorieBreakdown;
  goal?: number;
  weightKg?: number | null;
}

export function CalorieDetailSheet({
  visible,
  onClose,
  breakdown,
  goal = 500,
  weightKg = 70,
}: Props) {
  const { colors, typography, spacing } = useTheme();
  const pct = Math.min(100, Math.round((breakdown.total / Math.max(1, goal)) * 100));

  const sources = useMemo(
    () => [
      {
        icon: 'footsteps-outline' as const,
        label: 'Steps & Walking Pad',
        value: `${breakdown.fromSteps} kcal`,
        desc: 'Based on step pacing & treadmill sensors',
      },
      {
        icon: 'barbell-outline' as const,
        label: 'Home Dumbbell & Gym',
        value: `${breakdown.fromWorkouts} kcal`,
        desc: 'Active strength & functional resistance sets',
      },
      {
        icon: 'bicycle-outline' as const,
        label: 'Logged & Tracked Sports',
        value: `${breakdown.fromActivities} kcal`,
        desc: 'Running, cycling, swimming & mobility flows',
      },
    ],
    [breakdown],
  );

  return (
    <AppBottomSheetModal
      visible={visible}
      onClose={onClose}
      eyebrow="CALORIES"
      title="Active energy"
      subtitle="Estimated from movement, steps and workouts"
      maxHeight="92%"
      contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl }}
    >
      <Card>
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>TODAY'S BURN</Text>
            <Text style={[typography.hero, { color: colors.primary, marginTop: 4 }]}>
              {breakdown.total}{' '}
              <Text style={[typography.heading, { color: colors.text.secondary }]}>kcal</Text>
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.badgeBg }]}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>{pct}% of goal</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.track, { backgroundColor: colors.surface2, marginTop: spacing.md }]}>
          <View
            style={[
              styles.fill,
              { backgroundColor: colors.primary, width: `${Math.max(4, Math.min(100, pct))}%` },
            ]}
          />
        </View>
        <View style={[styles.targetRow, { marginTop: 6 }]}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>0 kcal</Text>
          <Text style={[typography.caption, { color: colors.text.muted }]}>
            Target: {goal.toLocaleString()} kcal
          </Text>
        </View>
      </Card>

      <View style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
        <Text style={[typography.subheading, { color: colors.text.primary }]}>
          Breakdown by activity
        </Text>
      </View>

      {sources.map((s, idx) => (
        <Card key={idx} style={{ marginTop: spacing.sm }}>
          <View style={styles.sourceRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.surface2 }]}>
              <Ionicons name={s.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{s.label}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                {s.desc}
              </Text>
            </View>
            <Text style={[typography.bodyBold, { color: colors.primary }]}>{s.value}</Text>
          </View>
        </Card>
      ))}

      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={18} color={colors.text.muted} />
          <Text style={[typography.caption, styles.flex, { color: colors.text.secondary }]}>
            {breakdown.weightAssumed
              ? `Estimated using reference 70 kg body weight. Add your weight in profile for calibrated metrics.`
              : `Scaled to your profile weight of ${weightKg ?? 70} kg.`}
          </Text>
        </View>
      </Card>
    </AppBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
