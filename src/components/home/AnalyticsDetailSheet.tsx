import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { hapticLight, hapticSuccess } from '../../services/haptics';
import { AppBottomSheetModal } from '../ui/AppBottomSheetModal';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';
import { MetricBarChart } from './MetricBarChart';
import { TrendAreaChart } from './TrendAreaChart';
import type { DayTrendPoint, EqualizerBar } from '../../domain/analytics/dashboardAnalytics';

export interface AnalyticsDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  trendPoints: DayTrendPoint[];
  stepBars: EqualizerBar[];
  hydrationBars: EqualizerBar[];
  targetGlasses?: number;
  onSetTargetGlasses?: (target: number) => void;
  totalHydrationGlasses: number;
  onCheckIn: () => void;
}

const TARGET_OPTIONS = [6, 8, 10, 12];

/**
 * AnalyticsDetailSheet
 *
 * Dedicated, gesture-driven bottom sheet modal revealing full 7-day health trends,
 * weekly hydration rhythm, physical activity distribution, and goal configuration.
 */
export function AnalyticsDetailSheet({
  visible,
  onClose,
  trendPoints,
  stepBars,
  hydrationBars,
  targetGlasses = 8,
  onSetTargetGlasses,
  totalHydrationGlasses,
  onCheckIn,
}: AnalyticsDetailSheetProps) {
  const { colors, typography, spacing } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'vitality' | 'water' | 'activity'>('all');

  const totalSteps = stepBars.reduce((sum, b) => sum + b.value, 0);
  const totalWater = hydrationBars.reduce((sum, b) => sum + b.value, 0);
  const avgDailyWater = Math.round((totalWater / 7) * 10) / 10;

  const handleSelectTarget = (target: number) => {
    hapticSuccess();
    onSetTargetGlasses?.(target);
  };

  return (
    <AppBottomSheetModal
      visible={visible}
      onClose={onClose}
      eyebrow="ANALYTICS & TRENDS"
      title="Personal Health Insights"
      subtitle="7-day trajectory across vitality, hydration rhythm and activity"
      maxHeight="92%"
      contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl }}
    >
      {/* Category Filter Chips */}
      <View style={styles.tabRow}>
        {(
          [
            { id: 'all', label: 'Overview' },
            { id: 'vitality', label: 'Vitality' },
            { id: 'water', label: 'Hydration' },
            { id: 'activity', label: 'Activity' },
          ] as const
        ).map((t) => {
          const isSelected = activeTab === t.id;
          return (
            <PressableScale
              key={t.id}
              onPress={() => {
                hapticLight();
                setActiveTab(t.id);
              }}
              style={[
                styles.tabChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface1,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Show ${t.label} analytics`}
            >
              <Text
                style={[
                  typography.captionBold,
                  { color: isSelected ? colors.onPrimary : colors.text.secondary },
                ]}
              >
                {t.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      {/* 1. Vitality Trajectory Section */}
      {(activeTab === 'all' || activeTab === 'vitality') && (
        <View style={{ marginTop: spacing.md }}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="sparkles" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Vitality Trajectory
              </Text>
            </View>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Last 7 Days</Text>
          </View>

          <TrendAreaChart points={trendPoints} onCheckIn={onCheckIn} />
        </View>
      )}

      {/* 2. Hydration Rhythm & Target Goal Configuration */}
      {(activeTab === 'all' || activeTab === 'water') && (
        <View style={{ marginTop: spacing.lg }}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="water" size={16} color={colors.info} style={{ marginRight: 6 }} />
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Hydration Rhythm
              </Text>
            </View>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              {totalWater} glasses · {(totalWater * 250).toLocaleString()} ml
            </Text>
          </View>

          <MetricBarChart
            bars={hydrationBars}
            title="Hydration Rhythm"
            subtitle={`Daily average: ${avgDailyWater} glasses (${Math.round(avgDailyWater * 250)} ml)`}
            totalDisplay={`${totalWater} glasses`}
          />

          {/* Configurable Water Goal Selector */}
          <Card style={[styles.targetCard, { padding: spacing.base, marginTop: spacing.sm }]}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                  Daily Water Baseline Target
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Configures your personal dashboard ring & reminders
                </Text>
              </View>
              <View style={[styles.targetBadge, { backgroundColor: colors.surface2 }]}>
                <Text style={[typography.captionBold, { color: colors.primary }]}>
                  {targetGlasses * 250} ml
                </Text>
              </View>
            </View>

            <View style={styles.optionsRow}>
              {TARGET_OPTIONS.map((g) => {
                const isSelected = targetGlasses === g;
                return (
                  <PressableScale
                    key={g}
                    onPress={() => handleSelectTarget(g)}
                    style={[
                      styles.targetOption,
                      {
                        backgroundColor: isSelected ? colors.primaryAlpha : colors.surface1,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Set daily goal to ${g} glasses (${g * 250} ml)`}
                  >
                    <Text
                      style={[
                        typography.captionBold,
                        { color: isSelected ? colors.primary : colors.text.primary },
                      ]}
                    >
                      {g} cups
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.muted, fontSize: 10 }]}>
                      {g * 250} ml
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </Card>
        </View>
      )}

      {/* 3. Physical Activity & Steps Distribution */}
      {(activeTab === 'all' || activeTab === 'activity') && (
        <View style={{ marginTop: spacing.lg }}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="walk" size={16} color={colors.success} style={{ marginRight: 6 }} />
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Steps & Movement
              </Text>
            </View>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              {totalSteps > 0 ? `${totalSteps.toLocaleString()} steps` : 'Local records'}
            </Text>
          </View>

          <MetricBarChart
            bars={stepBars}
            title="Steps Distribution"
            subtitle="Recorded steps across the week"
            totalDisplay={totalSteps > 0 ? `${(totalSteps / 1000).toFixed(1)}k steps` : undefined}
          />
        </View>
      )}

      {/* Honest Privacy & Data Ethics Affirmation */}
      <SquircleSurface
        radius={14}
        fill={colors.surface1}
        style={[styles.privacyBox, { marginTop: spacing.lg }]}
      >
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.text.muted} />
        <Text style={[typography.caption, { color: colors.text.secondary, marginLeft: 8, flex: 1 }]}>
          Calculated purely from your local encrypted records. Thrivefold never fabricates health
          history or shares your personal wellbeing trajectory.
        </Text>
      </SquircleSurface>
    </AppBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetCard: {
    overflow: 'hidden',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  targetOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
});
