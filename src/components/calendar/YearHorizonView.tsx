import { SquircleSurface } from '../ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';
import { PersonalCalendarEvent } from '../../stores/useRootStore';

export interface YearForecastMonth {
  monthIndex: number;
  monthName: string;
  year: number;
  estimatedPeriodStart: string;
  estimatedPeriodEnd: string;
  milestones: PersonalCalendarEvent[];
}

export interface YearHorizonViewProps {
  currentYear: number;
  yearForecastData: YearForecastMonth[];
  isWomen: boolean;
  onSelectMonthDate: (targetDate: Date) => void;
  onAddMilestone: () => void;
}

export const YearHorizonView: React.FC<YearHorizonViewProps> = ({
  currentYear,
  yearForecastData,
  isWomen,
  onSelectMonthDate,
  onAddMilestone,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            {currentYear} Annual Horizon
          </Text>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
            {isWomen
              ? 'Precalculated period ranges & annual personal milestones'
              : 'Year-at-a-glance milestones and focal dates'}
          </Text>
        </View>
        <Button
          label="+ Milestone"
          size="sm"
          variant="primary"
          onPress={onAddMilestone}
        />
      </View>

      <View style={[styles.yearGrid, { marginTop: spacing.md }]}>
        {yearForecastData.map((yf) => (
          <PressableScale
            key={yf.monthIndex}
            onPress={() => {
              const targetDate = new Date(yf.year, yf.monthIndex, 1);
              onSelectMonthDate(targetDate);
              try {
                Haptics.selectionAsync();
              } catch {}
            }}
            scaleTo={0.96}
            style={[styles.yearMonthCard, { backgroundColor: colors.surface1 }]}
            accessibilityRole="button"
            accessibilityLabel={`${yf.monthName} ${yf.year}`}
          >
            <View style={styles.rowBetween}>
              <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                {yf.monthName.slice(0, 3)}
              </Text>
              <Ionicons name="chevron-forward" size={12} color={colors.text.muted} />
            </View>
            {isWomen ? (
              <Text style={[typography.caption, { color: colors.primary, marginTop: 4, fontSize: 10 }]}>
                Cycle: {yf.estimatedPeriodStart.slice(5)} – {yf.estimatedPeriodEnd.slice(5)}
              </Text>
            ) : (
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4, fontSize: 10 }]}>
                {yf.milestones.length} Milestones
              </Text>
            )}
            {yf.milestones.length > 0 ? (
              <View style={{ marginTop: 4 }}>
                {yf.milestones.slice(0, 2).map((m: PersonalCalendarEvent) => (
                  <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
                    <Ionicons name="gift-outline" size={8} color={colors.primary} style={{ marginRight: 3 }} />
                    <Text
                      style={[typography.caption, { color: colors.text.secondary, fontSize: 9, flex: 1 }]}
                      numberOfLines={1}
                    >
                      {m.title}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </PressableScale>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearMonthCard: {
    width: '31.3%',
    padding: 10,
    borderRadius: 14,
  },
});
