import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AgendaDayGroup, CalendarEvent } from '../../domain/calendar/universalCalendarEngine';
import { useTheme } from '../../theme/useTheme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';

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
        <Button label="+ Milestone" size="sm" variant="outline" onPress={onOpenMilestoneModal} />
      </View>

      <View style={{ marginTop: spacing.md }}>
        {agendaRangeData.map((dayGroup) => {
          const hasItems =
            dayGroup.events.length > 0 ||
            (dayGroup.personalEvents && dayGroup.personalEvents.length > 0) ||
            dayGroup.holiday;
          if (!hasItems && !dayGroup.isToday) return null;

          return (
            <SquircleSurface
              key={dayGroup.date}
              radius={16}
              smoothing={2}
              fill={dayGroup.isToday ? colors.surface1 : colors.surface}
              strokeWidth={1}
              style={[styles.agendaDayGroupCard, { marginBottom: 10 }]}
            >
              <PressableScale
                onPress={() => onSelectDate(dayGroup.date)}
                scaleTo={0.99}
                style={styles.rowBetween}
                accessibilityRole="button"
                accessibilityLabel={`${dayGroup.date} group`}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                  <SquircleSurface
                    radius={12}
                    smoothing={1}
                    fill={dayGroup.isToday ? colors.primary : colors.surface1}
                    style={styles.agendaDateBadge}
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
                  </SquircleSurface>

                  <View style={{ marginLeft: 10, flexShrink: 1 }}>
                    <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                      {dayGroup.monthName} {dayGroup.dayOfMonth}, {dayGroup.date.slice(0, 4)}
                    </Text>
                    {isWomen && (
                      <Text
                        style={[typography.caption, { color: colors.text.muted, fontSize: 10 }]}
                      >
                        {dayGroup.rangeInfo.phaseLabel}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 4, flexShrink: 0 }}>
                  {dayGroup.holiday && <Badge label={dayGroup.holiday.name} variant="warning" />}
                  {dayGroup.isToday && <Badge label="Today" variant="primary" />}
                </View>
              </PressableScale>

              {/* Milestones on this day */}
              {dayGroup.personalEvents && dayGroup.personalEvents.length > 0 && (
                <View style={{ marginTop: 8, gap: 4 }}>
                  {dayGroup.personalEvents.map((pe) => (
                    <SquircleSurface
                      key={pe.id}
                      radius={10}
                      smoothing={1}
                      fill="rgba(226, 178, 88, 0.15)"
                      strokeWidth={1}
                      style={styles.agendaMilestoneRow}
                    >
                      <Ionicons
                        name="gift-outline"
                        size={13}
                        color={colors.primary}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[typography.captionBold, { color: colors.text.primary, flex: 1 }]}
                      >
                        {pe.title}
                      </Text>
                      <Badge label={pe.category} variant="neutral" />
                    </SquircleSurface>
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
                        accessibilityRole="button"
                        accessibilityLabel={`Task ${ev.title}`}
                      >
                        <SquircleSurface
                          radius={10}
                          smoothing={1}
                          fill={isDone ? colors.surface1 : colors.surface}
                          strokeWidth={1}
                          style={styles.agendaTaskSubRow}
                        >
                          <PressableScale
                            onPress={() => onToggleEvent(ev)}
                            hitSlop={8}
                            scaleTo={0.9}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: isDone }}
                          >
                            <SquircleSurface
                              radius={6}
                              smoothing={1}
                              fill={isDone ? colors.primary : 'transparent'}
                              strokeWidth={1.5}
                              style={styles.checkboxSmall}
                            >
                              {isDone && (
                                <Ionicons name="checkmark" size={11} color={colors.onPrimary} />
                              )}
                            </SquircleSurface>
                          </PressableScale>
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
                        </SquircleSurface>
                      </PressableScale>
                    );
                  })}
                </View>
              ) : (
                <Text
                  style={[
                    typography.caption,
                    { color: colors.text.muted, marginTop: 6, fontStyle: 'italic' },
                  ]}
                >
                  Rest & restore day
                </Text>
              )}
            </SquircleSurface>
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
  },
  agendaDateBadge: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  agendaMilestoneRow: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 8,
  },
  agendaTaskSubRow: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 8,
  },
  checkboxSmall: {
    alignItems: 'center',
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
});

export default ContinuousAgendaView;
