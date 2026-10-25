import { SquircleSurface } from '../ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';
import {
  DayCalendarCell,
  getDayRangeInfo,
  } from '../../domain/calendar/universalCalendarEngine';
import { CycleData, PersonalCalendarEvent } from '../../stores/useRootStore';

export interface WeekTimelineViewProps {
  weekGrid: DayCalendarCell[];
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
  cycleData?: CycleData | null;
  personalEvents: PersonalCalendarEvent[];
  isWomen: boolean;
}

export const WeekTimelineView: React.FC<WeekTimelineViewProps> = ({
  weekGrid,
  selectedDateStr,
  onSelectDate,
  cycleData,
  personalEvents,
  isWomen,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
      <View style={styles.rowBetween}>
        <Text style={[typography.subheading, { color: colors.text.primary }]}>
          Week Overview
        </Text>
        <Text style={[typography.caption, { color: colors.text.muted }]}>
          Selected: {selectedDateStr}
        </Text>
      </View>
      <View style={[styles.weekStripRow, { marginTop: spacing.md }]}>
        {weekGrid.map((dayCell, idx) => {
          const isSelected = dayCell.date === selectedDateStr;
          const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx];
          const rangeInfo = getDayRangeInfo(dayCell.date, idx, cycleData, undefined, personalEvents);

          return (
            <PressableScale
              key={dayCell.date}
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {}
                onSelectDate(dayCell.date);
              }}
              scaleTo={0.93}
              style={[
                styles.weekStripCell,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${dayName} ${dayCell.dayOfMonth}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  typography.caption,
                  {
                    color: isSelected ? colors.onPrimary : colors.text.muted,
                    fontSize: 11,
                  },
                ]}
              >
                {dayName}
              </Text>
              <Text
                style={[
                  typography.subheading,
                  {
                    color: isSelected ? colors.onPrimary : colors.text.primary,
                    marginTop: 2,
                  },
                ]}
              >
                {dayCell.dayOfMonth}
              </Text>
              <View style={{ height: 14, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                {rangeInfo.personalEvents && rangeInfo.personalEvents.length > 0 ? (
                  <Ionicons name="gift-outline" size={9} color={isSelected ? colors.onPrimary : colors.primary} />
                ) : isWomen && rangeInfo.isRecordedPeriod ? (
                  <View style={[styles.weekMiniDot, { backgroundColor: isSelected ? colors.onPrimary : '#DA7756' }]} />
                ) : isWomen && rangeInfo.isFertile ? (
                  <View style={[styles.weekMiniDot, { backgroundColor: isSelected ? colors.onPrimary : '#E2B258' }]} />
                ) : null}
              </View>
            </PressableScale>
          );
        })}
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
  weekStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  weekStripCell: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekMiniDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
