import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  CalendarEvent,
  DayCalendarCell,
  getDayRangeInfo,
} from '../../domain/calendar/universalCalendarEngine';
import { CycleData, PersonalCalendarEvent } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';

export interface MonthGridViewProps {
  currentMonthDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToday: () => void;
  monthGrid: DayCalendarCell[];
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
  cycleData?: CycleData | null;
  agendaEvents: CalendarEvent[];
  personalEvents: PersonalCalendarEvent[];
  isWomen: boolean;
}

export const MonthGridView: React.FC<MonthGridViewProps> = ({
  currentMonthDate,
  onPrevMonth,
  onNextMonth,
  onJumpToday,
  monthGrid,
  selectedDateStr,
  onSelectDate,
  cycleData,
  agendaEvents,
  personalEvents,
  isWomen,
}) => {
  const { colors, typography, spacing } = useTheme();

  const monthName = currentMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
      {/* Month Navigation Row */}
      <View style={styles.calendarNavRow}>
        <PressableScale
          onPress={() => {
            try {
              Haptics.selectionAsync();
            } catch {}
            onPrevMonth();
          }}
          scaleTo={0.9}
          style={[styles.monthNavBtn, { backgroundColor: colors.surface1 }]}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <Ionicons name="chevron-back" size={18} color={colors.text.primary} />
        </PressableScale>

        <View style={{ alignItems: 'center' }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>{monthName}</Text>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
            {isWomen
              ? !cycleData?.lastPeriodDate
                ? 'Log a period to see estimates'
                : (cycleData.periodHistory?.length ?? 0) < 2
                  ? 'Rough estimate: log more periods for accuracy'
                  : `Estimate from your ${cycleData.periodHistory.length} logged periods`
              : 'Monthly milestones & habit calendar'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <PressableScale
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              onJumpToday();
            }}
            scaleTo={0.93}
            style={[styles.todayJumpBtn, { backgroundColor: colors.surface1, marginRight: 6 }]}
            accessibilityRole="button"
            accessibilityLabel="Jump to today"
          >
            <Text style={[typography.captionBold, { color: colors.primary }]}>Today</Text>
          </PressableScale>

          <PressableScale
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              onNextMonth();
            }}
            scaleTo={0.9}
            style={[styles.monthNavBtn, { backgroundColor: colors.surface1 }]}
            accessibilityRole="button"
            accessibilityLabel="Next month"
          >
            <Ionicons name="chevron-forward" size={18} color={colors.text.primary} />
          </PressableScale>
        </View>
      </View>

      {/* Weekday Labels (Monday to Sunday) */}
      <View style={[styles.weekDaysRow, { marginTop: spacing.md }]}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
          <Text key={idx} style={[styles.weekDayHeader, { color: colors.text.muted }]}>
            {day}
          </Text>
        ))}
      </View>

      {/* 42-Cell Month Grid with Continuous Date Range Highlights */}
      <View style={styles.monthGrid}>
        {monthGrid.map((cell, cellIdx) => {
          const isSelected = cell.date === selectedDateStr;
          const rangeInfo = getDayRangeInfo(
            cell.date,
            cellIdx,
            cycleData,
            agendaEvents,
            personalEvents,
          );

          return (
            <PressableScale
              key={cell.date}
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {}
                onSelectDate(cell.date);
              }}
              style={[styles.gridCellContainer, { opacity: cell.isCurrentMonth ? 1 : 0.32 }]}
              accessibilityRole="button"
              accessibilityLabel={`${cell.date}${rangeInfo.holiday ? `, ${rangeInfo.holiday.name}` : ''}`}
            >
              {/* Multi-day connected continuous range highlight bar */}
              {rangeInfo.rangeType !== 'none' && (
                <View
                  style={[
                    styles.rangeHighlightBar,
                    rangeInfo.rangePosition === 'start' && styles.rangeBarStart,
                    rangeInfo.rangePosition === 'middle' && styles.rangeBarMiddle,
                    rangeInfo.rangePosition === 'end' && styles.rangeBarEnd,
                    rangeInfo.rangePosition === 'single' && styles.rangeBarSingle,
                    {
                      backgroundColor: rangeInfo.isRecordedPeriod
                        ? 'rgba(218, 119, 86, 0.44)' // Solid terracotta for confirmed recorded period
                        : rangeInfo.rangeType === 'period'
                          ? 'rgba(218, 119, 86, 0.22)' // Soft terracotta for predicted period
                          : rangeInfo.rangeType === 'ovulation'
                            ? 'rgba(226, 178, 88, 0.38)' // Golden ovulation highlight
                            : rangeInfo.rangeType === 'fertile'
                              ? 'rgba(226, 178, 88, 0.18)' // Fertile window highlight
                              : rangeInfo.rangeType === 'follicular'
                                ? 'rgba(132, 175, 142, 0.22)' // Calm pista green for follicular phase
                                : 'rgba(176, 150, 195, 0.20)', // Soft mauve for luteal phase
                    },
                  ]}
                />
              )}

              {/* Date Circle / Selection Squircle */}
              <View
                style={[
                  styles.datePill,
                  isSelected && { backgroundColor: colors.primary },
                  !isSelected &&
                    cell.isToday && {
                      backgroundColor: colors.surface1,
                      borderColor: colors.primary,
                    },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    {
                      color: isSelected
                        ? colors.onPrimary
                        : cell.isToday
                          ? colors.primary
                          : colors.text.primary,
                    },
                  ]}
                >
                  {cell.dayOfMonth}
                </Text>
              </View>

              {/* Bottom Cell Markers: Personal milestone icon, holiday icon, or ovulation sparkles */}
              {/* <View style={styles.cellBottomRow}>
                {rangeInfo.personalEvents && rangeInfo.personalEvents.length > 0 ? (
                  <Ionicons name="gift-outline" size={8} color={colors.primary} />
                ) : rangeInfo.holiday ? (
                  <Ionicons name="flag-outline" size={8} color={colors.warning} />
                ) : isWomen && rangeInfo.isOvulationPeak ? (
                  <Ionicons name="ellipse" size={7} color={colors.warning} />
                ) : rangeInfo.taskStats && rangeInfo.taskStats.total > 0 ? (
                  <View
                    style={[
                      styles.taskMiniDot,
                      {
                        backgroundColor:
                          rangeInfo.taskStats.percent === 100
                            ? colors.success
                            : colors.text.muted,
                      },
                    ]}
                  />
                ) : null}
              </View> */}
            </PressableScale>
          );
        })}
      </View>

      {/* Continuous Range Legend */}
      <View style={[styles.legendRow, { borderTopColor: colors.surface1, marginTop: spacing.md }]}>
        {isWomen && (
          <>
            <View style={styles.legendItem}>
              <View style={[styles.legendPill, { backgroundColor: 'rgba(218, 119, 86, 0.44)' }]} />
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Recorded</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendPill, { backgroundColor: 'rgba(218, 119, 86, 0.22)' }]} />
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Predicted</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendPill, { backgroundColor: 'rgba(132, 175, 142, 0.36)' }]} />
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Follicular</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendPill, { backgroundColor: 'rgba(226, 178, 88, 0.38)' }]} />
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Fertile</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendPill, { backgroundColor: 'rgba(176, 150, 195, 0.36)' }]} />
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Luteal</Text>
            </View>
          </>
        )}
        <View style={styles.legendItem}>
          <Ionicons
            name="gift-outline"
            size={11}
            color={colors.primary}
            style={{ marginRight: 4 }}
          />
          <Text style={[typography.caption, { color: colors.text.secondary }]}>Milestone</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="flag-outline" size={11} color={colors.warning} style={{ marginRight: 4 }} />
          <Text style={[typography.caption, { color: colors.text.secondary }]}>Holiday</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.taskMiniDot, { backgroundColor: colors.success, marginRight: 4 }]} />
          <Text style={[typography.caption, { color: colors.text.secondary }]}>Done</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  calendarNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayJumpBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 6,
  },
  weekDayHeader: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCellContainer: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rangeHighlightBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 6,
    bottom: 6,
    zIndex: 1,
  },
  rangeBarStart: {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    left: 4,
  },
  rangeBarMiddle: {
    borderRadius: 0,
  },
  rangeBarEnd: {
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    right: 4,
  },
  rangeBarSingle: {
    borderRadius: 18,
    left: 4,
    right: 4,
  },
  datePill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  cellBottomRow: {
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginTop: 1,
  },
  taskMiniDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendPill: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
});
