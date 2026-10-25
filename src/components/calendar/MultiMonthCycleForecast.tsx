import { SquircleSurface } from '../ui/SquircleSurface';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { PressableScale } from '../ui/PressableScale';
import { CycleData } from '../../stores/useRootStore';

export interface MultiMonthForecastItem {
  monthLabel: string;
  year: number;
  month: number;
  estimatedPeriodStart: string;
  estimatedPeriodEnd: string;
  estimatedFertileStart: string;
  estimatedFertileEnd: string;
  estimatedOvulation: string;
  cycleNumber: number;
}

export interface FollicularStageDef {
  stage: string;
  dayRange: string;
  desc: string;
  hormones: string;
}

export const FOLLICULAR_STAGES: FollicularStageDef[] = [
  {
    stage: 'Primordial Follicle',
    dayRange: 'Baseline Pool',
    desc: 'Microscopic dormant oocyte enclosed in a single flattened layer of pre-granulosa cells.',
    hormones: 'Quiet endocrine state',
  },
  {
    stage: 'Primary & Secondary Follicle',
    dayRange: 'Early Follicular (Days 1–5)',
    desc: 'Follicular growth independent of gonadotropins, transitioning to cuboidal granulosa and zona pellucida.',
    hormones: 'Initial FSH receptors form',
  },
  {
    stage: 'Antral / Tertiary Follicle',
    dayRange: 'Mid Follicular (Days 6–10)',
    desc: 'Fluid-filled antrum cavity forms; granulosa cells actively convert androgens to estradiol.',
    hormones: 'Estrogen rising steadily',
  },
  {
    stage: 'Dominant Graafian Follicle',
    dayRange: 'Late Follicular (Days 11–13)',
    desc: 'Single selected follicle reaches 18–24mm maturity with thick theca interna layer.',
    hormones: 'Peak estradiol triggers LH surge',
  },
  {
    stage: 'Ovulation & Luteal Transition',
    dayRange: 'Ovulation (Day 14 est.)',
    desc: 'Mature oocyte extruded from ovarian wall; remaining follicle luteinizes into corpus luteum.',
    hormones: 'Progesterone production begins',
  },
];

export interface MultiMonthCycleForecastProps {
  cycleData?: CycleData | null;
  twelveMonthForecast: MultiMonthForecastItem[];
  activeStageIndex: number;
  onSelectStageIndex: (idx: number) => void;
  onSelectForecastItem: (item: MultiMonthForecastItem) => void;
}

export const MultiMonthCycleForecast: React.FC<MultiMonthCycleForecastProps> = ({
  cycleData,
  twelveMonthForecast,
  activeStageIndex,
  onSelectStageIndex,
  onSelectForecastItem,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <>
      {/* Cycle Health & Rhythm Overview */}
      <Card variant="tinted" style={{ marginTop: spacing.md, padding: spacing.lg }}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={[typography.captionBold, { color: colors.text.muted }]}>
              CYCLE HEALTH SUMMARY
            </Text>
            <Text style={[typography.heading, { color: colors.primary, marginTop: 2 }]}>
              28-Day Biological Rhythm
            </Text>
          </View>
          <Badge label="Active Pattern" variant="primary" />
        </View>

        <View style={[styles.statsGrid, { marginTop: spacing.md }]}>
          <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Avg Cycle</Text>
            <Text style={[typography.display, { color: colors.primary, marginTop: 2 }]}>
              {cycleData?.cycleLengthDays ?? 28}d
            </Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Normal 21–35d</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Period Flow</Text>
            <Text style={[typography.display, { color: colors.primary, marginTop: 2 }]}>
              {cycleData?.periodLengthDays ?? 5}d
            </Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Regular</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Luteal Phase</Text>
            <Text style={[typography.display, { color: colors.primary, marginTop: 2 }]}>
              14d
            </Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Consistent</Text>
          </View>
        </View>
      </Card>

      {/* 12-Month Calculated Future Calendar Forecast */}
      <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              12-Month Calculated Forecast
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              Deterministic projections extending across the rolling horizon.
            </Text>
          </View>
          <Badge label="12 Months" variant="neutral" />
        </View>

        <View style={{ marginTop: spacing.md }}>
          {twelveMonthForecast.map((item) => (
            <PressableScale
              key={item.estimatedPeriodStart}
              onPress={() => onSelectForecastItem(item)}
              scaleTo={0.97}
              style={[
                styles.forecastItem,
                {
                  backgroundColor: colors.surface,
                  marginBottom: 10,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${item.monthLabel} forecast`}
            >
              <View style={styles.rowBetween}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                    {item.monthLabel}
                  </Text>
                </View>
                <Badge label={`Cycle #${item.cycleNumber}`} variant="primary" />
              </View>

              <View style={[styles.rowBetween, { marginTop: 8 }]}>
                <View>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Predicted Period</Text>
                  <Text style={[typography.captionBold, { color: colors.primary, marginTop: 2 }]}>
                    {item.estimatedPeriodStart} → {item.estimatedPeriodEnd}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Fertile Window</Text>
                  <Text style={[typography.captionBold, { color: colors.accent, marginTop: 2 }]}>
                    {item.estimatedFertileStart} → {item.estimatedFertileEnd}
                  </Text>
                </View>
              </View>

              <View style={[styles.rowBetween, { marginTop: 8 }]}>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Ovulation est. {item.estimatedOvulation}
                </Text>
                <Text style={[typography.captionBold, { color: colors.primary }]}>
                  View in Calendar →
                </Text>
              </View>
            </PressableScale>
          ))}
        </View>
      </Card>

      {/* Biological Follicular Development Arc */}
      <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
        <View style={styles.rowBetween}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Biological Follicular Stages
          </Text>
          <Badge label="Educational" variant="neutral" />
        </View>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.md }]}>
          Cellular development of ovarian follicles from dormant reserve to dominant maturity.
        </Text>

        {FOLLICULAR_STAGES.map((stage, idx) => (
          <PressableScale
            key={stage.stage}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              onSelectStageIndex(idx);
            }}
            scaleTo={0.97}
            style={[
              styles.stageCard,
              {
                backgroundColor: activeStageIndex === idx ? colors.surface1 : colors.surface,
                marginBottom: 8,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${stage.stage} details`}
          >
            <View style={styles.rowBetween}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                {idx + 1}. {stage.stage}
              </Text>
              <Badge label={stage.dayRange} variant="primary" />
            </View>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
              {stage.desc}
            </Text>
            <Text style={[typography.captionBold, { color: colors.primary, marginTop: 4 }]}>
              Endocrine activity: {stage.hormones}
            </Text>
          </PressableScale>
        ))}
      </Card>
    </>
  );
};

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  forecastItem: {
    padding: 14,
    borderRadius: 16,
  },
  stageCard: {
    padding: 14,
    borderRadius: 14,
  },
});
