import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';
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
              {isToday ? 'Today' : 'Selected day'}
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
              accessibilityRole="button"
              accessibilityLabel="Previous day"
            >
              <SquircleSurface
                radius={14}
                smoothing={1}
                fill={colors.surface1}
                strokeWidth={1}
                style={styles.dateNavBtn}
              >
                <Ionicons name="chevron-back" size={16} color={colors.text.primary} />
              </SquircleSurface>
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
                style={{ marginHorizontal: 4 }}
                accessibilityRole="button"
                accessibilityLabel="Jump to today"
              >
                <SquircleSurface
                  radius={10}
                  smoothing={1}
                  fill={colors.surface1}
                  strokeWidth={1}
                  style={styles.todayJumpPill}
                >
                  <Text style={[typography.captionBold, { color: colors.primary }]}>Today</Text>
                </SquircleSurface>
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
              accessibilityRole="button"
              accessibilityLabel="Next day"
            >
              <SquircleSurface
                radius={14}
                smoothing={1}
                fill={colors.surface1}
                strokeWidth={1}
                style={styles.dateNavBtn}
              >
                <Ionicons name="chevron-forward" size={16} color={colors.text.primary} />
              </SquircleSurface>
            </PressableScale>
          </View>
        </View>

        {/* Phase Badge & Biological Summary (For Women) */}
        {isWomen && (
          <SquircleSurface
            radius={14}
            smoothing={1}
            fill={colors.surface1}
            strokeWidth={1}
            style={[styles.phaseDetailCard, { marginTop: spacing.md }]}
          >
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, paddingRight: 6 }}>
                <SquircleSurface
                  radius={6}
                  smoothing={1}
                  fill={
                    selectedDateRangeInfo.isRecordedPeriod
                      ? colors.primary
                      : selectedDateRangeInfo.isOvulationPeak
                      ? colors.warning
                      : selectedDateRangeInfo.isFollicular
                      ? colors.success
                      : colors.primary
                  }
                  style={styles.phaseIndicatorRing}
                />
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                  {selectedDateRangeInfo.phaseLabel}
                </Text>
              </View>
              {selectedDateRangeInfo.rangeType !== 'none' ? (
                <Badge
                  label={
                    selectedDateRangeInfo.isFollicular && selectedDateRangeInfo.isRecordedPeriod
                      ? 'Follicular overlap'
                      : phaseConfig.label
                  }
                  variant="neutral"
                />
              ) : null}
            </View>
            {/* Without a logged period there is no phase: say so instead of describing one. */}
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
              {selectedDateRangeInfo.rangeType === 'none'
                ? 'Log the first day of a period to see phase estimates for each day.'
                : `${phaseConfig.energyDesc} • ${phaseConfig.description}`}
            </Text>
          </SquircleSurface>
        )}

        {/* Holiday Banner if present */}
        {selectedDateHoliday && (
          <SquircleSurface
            radius={12}
            smoothing={1}
            fill={colors.warningSurface}
            strokeWidth={1}
            style={[styles.milestoneNotice, { marginTop: spacing.sm }]}
          >
            <Ionicons name="flag" size={16} color={colors.warning} style={{ marginRight: 8 }} />
            <Text style={[typography.captionBold, { color: colors.warning, flex: 1 }]}>
              {selectedDateHoliday.name}
            </Text>
          </SquircleSurface>
        )}

        {/* Personal Milestones (Birthdays, Anniversaries) */}
        {selectedDateMilestones.length > 0 && (
          <View style={{ marginTop: spacing.sm, gap: 6 }}>
            {selectedDateMilestones.map((ms) => (
              <SquircleSurface
                key={ms.id}
                radius={12}
                smoothing={1}
                fill="rgba(226, 178, 88, 0.16)"
                strokeWidth={1}
                style={styles.milestoneNotice}
              >
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
              </SquircleSurface>
            ))}
          </View>
        )}

        {/* Bleeding Log summary if already recorded on this date */}
        {isWomen && existingPeriodRecord && (
          <SquircleSurface
            radius={14}
            smoothing={1}
            fill="rgba(218, 119, 86, 0.12)"
            strokeWidth={1}
            style={[styles.recordedBleedBanner, { marginTop: spacing.sm }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="water" size={16} color={colors.primary} style={{ marginRight: 8 }} />
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
                accessibilityRole="button"
                accessibilityLabel="Edit recorded bleed"
              >
                <SquircleSurface
                  radius={8}
                  smoothing={1}
                  fill={colors.surface}
                  strokeWidth={1}
                  style={styles.editBleedBtn}
                >
                  <Text style={[typography.captionBold, { color: colors.primary }]}>Edit</Text>
                </SquircleSurface>
              </PressableScale>
            </View>
          </SquircleSurface>
        )}

        {/* Action Buttons: Log Period Bleeding & Add Personal Milestone */}
        <View style={[styles.actionRow, { marginTop: spacing.md }]}>
          {isWomen && (
            <Button
              label={existingPeriodRecord ? 'Edit period' : 'Log period'}
              size="sm"
              variant={existingPeriodRecord ? 'outline' : 'primary'}
              onPress={onLogPeriod}
              style={{ flex: 1, marginRight: 8 }}
            />
          )}
          <Button
            label="Add event"
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
              Tasks for {selectedDateStr}
            </Text>
            <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 2 }]}>
              Tasks and habits
            </Text>
          </View>
          <Badge
            label={`${agendaEvents.filter((e) => e.status === 'completed').length}/${agendaEvents.length} Done`}
            variant="primary"
          />
        </View>

        {/* Progress Track */}
        {agendaEvents.length > 0 && (
          <SquircleSurface
            radius={3}
            smoothing={1}
            fill={colors.surface1}
            style={styles.taskProgressBarTrack}
          >
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
          </SquircleSurface>
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
                style={{ marginBottom: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Task: ${event.title}, ${isDone ? 'Completed' : 'Pending'}`}
              >
                <SquircleSurface
                  radius={14}
                  smoothing={1}
                  fill={isDone ? colors.surface1 : colors.surface}
                  strokeWidth={1}
                  style={styles.agendaTaskCard}
                >
                  <View style={styles.agendaCheckRow}>
                    <PressableScale
                      onPress={() => onToggleEvent(event)}
                      hitSlop={8}
                      scaleTo={0.9}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isDone }}
                    >
                      <SquircleSurface
                        radius={7}
                        smoothing={1}
                        fill={isDone ? colors.primary : 'transparent'}
                        strokeWidth={1.5}
                        style={styles.checkbox}
                      >
                        {isDone && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
                      </SquircleSurface>
                    </PressableScale>

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
                </SquircleSurface>
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
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  todayJumpPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  phaseDetailCard: {
    padding: 12,
  },
  phaseIndicatorRing: {
    height: 12,
    width: 12,
  },
  milestoneNotice: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
  },
  recordedBleedBanner: {
    padding: 12,
  },
  editBleedBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  taskProgressBarTrack: {
    height: 6,
    marginTop: 10,
    overflow: 'hidden',
  },
  taskProgressBarFill: {
    height: '100%',
  },
  agendaTaskCard: {
    padding: 12,
  },
  agendaCheckRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  checkbox: {
    alignItems: 'center',
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
});

export default SelectedDateOverviewCard;
