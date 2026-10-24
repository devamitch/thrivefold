import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';
import {
  CalendarEvent,
  DayRangeInfo,
  parseLocalDate,
  formatLocalDate,
} from '../../domain/calendar/universalCalendarEngine';
import { PHASE_CONFIG, CyclePhase } from '../../domain/health/cycleCalculations';
import { PersonalCalendarEvent, PeriodLogRecord } from '../../stores/useRootStore';

export type PhaseConfig = (typeof PHASE_CONFIG)[CyclePhase];

export interface SelectedDateOverviewCardProps {
  selectedDateStr: string;
  selectedDateRangeInfo: DayRangeInfo;
  phaseConfig: PhaseConfig;
  selectedDateHoliday?: { name: string } | null;
  selectedDateMilestones: PersonalCalendarEvent[];
  existingPeriodRecord?: PeriodLogRecord | null;
  agendaEvents: CalendarEvent[];
  isWomen: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onJumpToday: () => void;
  onLogPeriod: () => void;
  onAddMilestone: () => void;
  onToggleEvent: (event: CalendarEvent) => void;
  onSelectTask: (event: CalendarEvent) => void;
}

export const SelectedDateOverviewCard: React.FC<SelectedDateOverviewCardProps> = ({
  selectedDateStr,
  selectedDateRangeInfo,
  phaseConfig,
  selectedDateHoliday,
  selectedDateMilestones,
  existingPeriodRecord,
  agendaEvents,
  isWomen,
  onPrevDay,
  onNextDay,
  onJumpToday,
  onLogPeriod,
  onAddMilestone,
  onToggleEvent,
  onSelectTask,
}) => {
  const { colors, typography, spacing } = useTheme();

  const formattedDate = parseLocalDate(selectedDateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = selectedDateStr === formatLocalDate(new Date());

  return (
    <>
      <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[typography.captionBold, { color: colors.text.muted }]}>
              {isToday ? "TODAY'S RHYTHM & FOCUS" : 'DAY FOCUS'}
            </Text>
            <Text style={[typography.heading, { color: colors.text.primary, marginTop: 2 }]}>
              {formattedDate}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PressableScale
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {}
                onPrevDay();
              }}
              scaleTo={0.9}
              style={[styles.dateNavBtn, { backgroundColor: colors.surface1 }]}
              accessibilityRole="button"
              accessibilityLabel="Previous day"
            >
              <Ionicons name="chevron-back" size={16} color={colors.text.primary} />
            </PressableScale>
            {!isToday && (
              <PressableScale
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  onJumpToday();
                }}
                scaleTo={0.93}
                style={[styles.todayJumpPill, { backgroundColor: colors.surface1, marginHorizontal: 4 }]}
                accessibilityRole="button"
                accessibilityLabel="Jump to today"
              >
                <Text style={[typography.captionBold, { color: colors.primary }]}>Today</Text>
              </PressableScale>
            )}
            <PressableScale
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {}
                onNextDay();
              }}
              scaleTo={0.9}
              style={[styles.dateNavBtn, { backgroundColor: colors.surface1 }]}
              accessibilityRole="button"
              accessibilityLabel="Next day"
            >
              <Ionicons name="chevron-forward" size={16} color={colors.text.primary} />
            </PressableScale>
          </View>
        </View>

        {/* Phase Badge & Biological Summary (For Women) */}
        {isWomen && (
          <View style={[styles.phaseDetailCard, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, paddingRight: 6 }}>
                <View
                  style={[
                    styles.phaseIndicatorRing,
                    {
                      backgroundColor: selectedDateRangeInfo.isRecordedPeriod
                        ? '#DA7756'
                        : selectedDateRangeInfo.isOvulationPeak
                        ? '#E2B258'
                        : selectedDateRangeInfo.isFollicular
                        ? '#84AF8E'
                        : colors.primary,
                    },
                  ]}
                />
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                  {selectedDateRangeInfo.phaseLabel}
                </Text>
              </View>
              <Badge
                label={
                  selectedDateRangeInfo.isFollicular && selectedDateRangeInfo.isRecordedPeriod
                    ? 'Follicular Overlap'
                    : phaseConfig.label
                }
                variant="neutral"
              />
            </View>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
              {phaseConfig.energyDesc} • {phaseConfig.description}
            </Text>
          </View>
        )}

        {/* Holiday Banner if present */}
        {selectedDateHoliday && (
          <View style={[styles.milestoneNotice, { backgroundColor: '#FEF3C7', marginTop: spacing.sm }]}>
            <Ionicons name="flag" size={16} color="#D97706" style={{ marginRight: 8 }} />
            <Text style={[typography.captionBold, { color: '#92400E', flex: 1 }]}>
              {selectedDateHoliday.name}
            </Text>
          </View>
        )}

        {/* Personal Milestones (Birthdays, Anniversaries) */}
        {selectedDateMilestones.length > 0 && (
          <View style={{ marginTop: spacing.sm, gap: 6 }}>
            {selectedDateMilestones.map((ms) => (
              <View key={ms.id} style={[styles.milestoneNotice, { backgroundColor: 'rgba(226, 178, 88, 0.20)' }]}>
                <Ionicons name="gift" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                    {ms.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, fontSize: 11 }]}>
                    {ms.category.toUpperCase()} {ms.relationship ? `• ${ms.relationship}` : ''}
                    {ms.notes ? ` • "${ms.notes}"` : ''}
                  </Text>
                </View>
                <Badge label={ms.recurrence === 'yearly' ? 'Annual' : 'Milestone'} variant="neutral" />
              </View>
            ))}
          </View>
        )}

        {/* Bleeding Log summary if already recorded on this date */}
        {isWomen && existingPeriodRecord && (
          <View style={[styles.recordedBleedBanner, { backgroundColor: 'rgba(218, 119, 86, 0.15)', marginTop: spacing.sm }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="water" size={16} color="#DA7756" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                  Recorded Menstrual Bleeding
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 1 }]}>
                  {existingPeriodRecord.flowIntensity.toUpperCase()} flow • Pain {existingPeriodRecord.painLevel ?? 0}/10
                </Text>
              </View>
              <PressableScale
                onPress={onLogPeriod}
                scaleTo={0.92}
                style={[styles.editBleedBtn, { backgroundColor: colors.surface }]}
                accessibilityRole="button"
                accessibilityLabel="Edit recorded bleed"
              >
                <Text style={[typography.captionBold, { color: colors.primary }]}>Edit</Text>
              </PressableScale>
            </View>
          </View>
        )}

        {/* Action Buttons: Log Period Bleeding & Add Personal Milestone */}
        <View style={[styles.actionRow, { marginTop: spacing.md }]}>
          {isWomen && (
            <Button
              label={existingPeriodRecord ? 'Edit Period Entry' : 'Log Period Bleeding'}
              size="sm"
              variant={existingPeriodRecord ? 'outline' : 'primary'}
              onPress={onLogPeriod}
              style={{ flex: 1, marginRight: 8 }}
            />
          )}
          <Button
            label="+ Add Milestone"
            size="sm"
            variant="outline"
            onPress={onAddMilestone}
            style={{ flex: 1 }}
          />
        </View>
      </Card>

      {/* Daily Tasks & Verification Checklist */}
      <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[typography.captionBold, { color: colors.text.muted }]}>
              TASKS & VERIFICATIONS FOR {selectedDateStr}
            </Text>
            <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 2 }]}>
              Daily Tasks, Rituals & Habits
            </Text>
          </View>
          <Badge
            label={`${agendaEvents.filter((e) => e.status === 'completed').length}/${agendaEvents.length} Done`}
            variant="primary"
          />
        </View>

        {/* Progress Track */}
        {agendaEvents.length > 0 && (
          <View style={[styles.taskProgressBarTrack, { backgroundColor: colors.surface1 }]}>
            <View
              style={[
                styles.taskProgressBarFill,
                {
                  backgroundColor: colors.primary,
                  width: `${Math.round(
                    (agendaEvents.filter((e) => e.status === 'completed').length /
                      agendaEvents.length) *
                      100
                  )}%`,
                },
              ]}
            />
          </View>
        )}

        <View style={{ marginTop: spacing.md }}>
          {agendaEvents.map((event) => {
            const isDone = event.status === 'completed';
            return (
              <PressableScale
                key={event.id}
                onPress={() => {
                  if (event.kind === 'holiday') return;
                  onSelectTask(event);
                }}
                scaleTo={0.98}
                style={[
                  styles.agendaTaskCard,
                  {
                    backgroundColor: isDone ? colors.surface1 : colors.surface,
                    marginBottom: 8,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Task: ${event.title}, ${isDone ? 'Completed' : 'Pending'}`}
              >
                <View style={styles.agendaCheckRow}>
                  <Pressable
                    onPress={() => onToggleEvent(event)}
                    hitSlop={8}
                    style={[
                      styles.checkbox,
                      {
                        borderColor: isDone ? colors.primary : colors.text.muted,
                        backgroundColor: isDone ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isDone && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
                  </Pressable>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={[
                        typography.bodyBold,
                        {
                          color: isDone ? colors.text.muted : colors.text.primary,
                          textDecorationLine: isDone ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {event.title}
                    </Text>
                    {event.description ? (
                      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]} numberOfLines={2}>
                        {event.description}
                      </Text>
                    ) : null}
                    {event.startTime ? (
                      <Text style={[typography.caption, { color: colors.primary, marginTop: 4 }]}>
                        Scheduled: {event.startTime} {event.endTime ? `– ${event.endTime}` : ''}
                      </Text>
                    ) : null}
                  </View>

                  <View style={{ alignItems: 'flex-end', flexShrink: 0, marginLeft: 8 }}>
                    <Badge label={event.kind.replace('_', ' ')} variant="neutral" />
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Ionicons name="chevron-forward" size={14} color={colors.text.muted} />
                    </View>
                  </View>
                </View>
              </PressableScale>
            );
          })}
        </View>
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
  dateNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayJumpPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  phaseDetailCard: {
    padding: 12,
    borderRadius: 14,
  },
  phaseIndicatorRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  milestoneNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
  },
  recordedBleedBanner: {
    padding: 12,
    borderRadius: 14,
  },
  editBleedBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  taskProgressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  taskProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  agendaTaskCard: {
    padding: 12,
    borderRadius: 14,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  agendaCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
