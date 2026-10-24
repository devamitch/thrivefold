import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';
import {
  CalendarEvent,
  AgendaDayGroup,
} from '../../domain/calendar/universalCalendarEngine';

export interface ContinuousAgendaViewProps {
  agendaRangeData: AgendaDayGroup[];
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
  onOpenMilestoneModal: () => void;
  onToggleEvent: (event: CalendarEvent) => void;
  onSelectTaskForVerification: (event: CalendarEvent) => void;
  isWomen: boolean;
}

export const ContinuousAgendaView: React.FC<ContinuousAgendaViewProps> = ({
  agendaRangeData,
  selectedDateStr,
  onSelectDate,
  onOpenMilestoneModal,
  onToggleEvent,
  onSelectTaskForVerification,
  isWomen,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Rolling 30-Day Agenda
          </Text>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
            Starting from {selectedDateStr}
          </Text>
        </View>
        <Button
          label="+ Milestone"
          size="sm"
          variant="outline"
          onPress={onOpenMilestoneModal}
        />
      </View>

      <View style={{ marginTop: spacing.md }}>
        {agendaRangeData.map((dayGroup) => {
          const hasItems =
            dayGroup.events.length > 0 ||
            (dayGroup.personalEvents && dayGroup.personalEvents.length > 0) ||
            dayGroup.holiday;
          if (!hasItems && !dayGroup.isToday) return null;

          return (
            <View
              key={dayGroup.date}
              style={[
                styles.agendaDayGroupCard,
                {
                  backgroundColor: dayGroup.isToday ? colors.surface1 : colors.surface,
                  borderColor: dayGroup.isToday ? colors.primary : colors.surface1,
                },
              ]}
            >
              <PressableScale
                onPress={() => onSelectDate(dayGroup.date)}
                scaleTo={0.99}
                style={styles.rowBetween}
                accessibilityRole="button"
                accessibilityLabel={`${dayGroup.date} group`}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                  <View
                    style={[
                      styles.agendaDateBadge,
                      { backgroundColor: dayGroup.isToday ? colors.primary : colors.surface1 },
                    ]}
                  >
                    <Text
                      style={[
                        typography.captionBold,
                        { color: dayGroup.isToday ? colors.onPrimary : colors.text.primary },
                      ]}
                    >
                      {dayGroup.dayOfMonth}
                    </Text>
                    <Text
                      style={[
                        typography.caption,
                        {
                          color: dayGroup.isToday ? colors.onPrimary : colors.text.muted,
                          fontSize: 9,
                        },
                      ]}
                    >
                      {dayGroup.dayName}
                    </Text>
                  </View>

                  <View style={{ marginLeft: 10, flexShrink: 1 }}>
                    <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                      {dayGroup.monthName} {dayGroup.dayOfMonth}, {dayGroup.date.slice(0, 4)}
                    </Text>
                    {isWomen && (
                      <Text style={[typography.caption, { color: colors.text.muted, fontSize: 10 }]}>
                        {dayGroup.rangeInfo.phaseLabel}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 4, flexShrink: 0 }}>
                  {dayGroup.holiday && (
                    <Badge label={dayGroup.holiday.name} variant="warning" />
                  )}
                  {dayGroup.isToday && (
                    <Badge label="Today" variant="primary" />
                  )}
                </View>
              </PressableScale>

              {/* Milestones on this day */}
              {dayGroup.personalEvents && dayGroup.personalEvents.length > 0 && (
                <View style={{ marginTop: 8, gap: 4 }}>
                  {dayGroup.personalEvents.map((pe) => (
                    <View key={pe.id} style={[styles.agendaMilestoneRow, { backgroundColor: 'rgba(226, 178, 88, 0.15)' }]}>
                      <Ionicons name="gift-outline" size={13} color={colors.primary} style={{ marginRight: 6 }} />
                      <Text style={[typography.captionBold, { color: colors.text.primary, flex: 1 }]}>
                        {pe.title}
                      </Text>
                      <Badge label={pe.category} variant="neutral" />
                    </View>
                  ))}
                </View>
              )}

              {/* Tasks on this day */}
              {dayGroup.events.length > 0 ? (
                <View style={{ marginTop: 8, gap: 6 }}>
                  {dayGroup.events.map((ev) => {
                    const isDone = ev.status === 'completed';
                    return (
                      <PressableScale
                        key={ev.id}
                        onPress={() => {
                          if (ev.kind === 'holiday') return;
                          onSelectTaskForVerification(ev);
                        }}
                        scaleTo={0.98}
                        style={[styles.agendaTaskSubRow, { backgroundColor: isDone ? colors.surface1 : colors.surface }]}
                        accessibilityRole="button"
                        accessibilityLabel={`Task ${ev.title}`}
                      >
                        <Pressable
                          onPress={() => onToggleEvent(ev)}
                          hitSlop={8}
                          style={[
                            styles.checkboxSmall,
                            {
                              borderColor: isDone ? colors.primary : colors.text.muted,
                              backgroundColor: isDone ? colors.primary : 'transparent',
                            },
                          ]}
                        >
                          {isDone && <Ionicons name="checkmark" size={11} color={colors.onPrimary} />}
                        </Pressable>
                        <Text
                          style={[
                            typography.captionBold,
                            {
                              color: isDone ? colors.text.muted : colors.text.primary,
                              textDecorationLine: isDone ? 'line-through' : 'none',
                              flex: 1,
                              marginLeft: 8,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {ev.title}
                        </Text>
                        <Badge label={ev.kind.replace('_', ' ')} variant="neutral" />
                      </PressableScale>
                    );
                  })}
                </View>
              ) : (
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6, fontStyle: 'italic' }]}>
                  Rest & restore day
                </Text>
              )}
            </View>
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
  agendaDayGroupCard: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  agendaDateBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaMilestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
  },
  agendaTaskSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
  },
  checkboxSmall: {
    width: 18,
    height: 18,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
