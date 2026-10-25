import { SquircleSurface } from '@/components/ui';
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';
import { CycleData, PersonalCalendarEvent, PeriodLogRecord } from '../../stores/useRootStore';

export interface CycleHistoryViewProps {
  isWomen: boolean;
  cycleData?: CycleData | null;
  personalEvents: PersonalCalendarEvent[];
  advancedCycleMetrics: any;
  onLogPeriod: () => void;
  onAddMilestone: () => void;
  onEditPeriod: (rec: PeriodLogRecord) => void;
  onDeletePeriod: (recordId: string, dateStr: string) => void;
  onEditMilestone: (event: PersonalCalendarEvent) => void;
  onDeleteMilestone: (eventId: string, title: string) => void;
}

export const CycleHistoryView: React.FC<CycleHistoryViewProps> = ({
  isWomen,
  cycleData,
  personalEvents,
  advancedCycleMetrics,
  onLogPeriod,
  onAddMilestone,
  onEditPeriod,
  onDeletePeriod,
  onEditMilestone,
  onDeleteMilestone,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
      {isWomen ? (
        <>
          <SquircleSurface style={styles.rowBetween}>
            <SquircleSurface style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Period & Cycle History
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
                Audited bleed records and calculated interval metrics
              </Text>
            </SquircleSurface>
            <Button
              label="+ Log Period"
              size="sm"
              variant="primary"
              onPress={onLogPeriod}
            />
          </SquircleSurface>

          {/* Advanced Metrics Summary */}
          {advancedCycleMetrics && (
            <SquircleSurface style={[styles.statsRow, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
              <SquircleSurface style={styles.statItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Average</Text>
                <Text style={[typography.subheading, { color: colors.primary, marginTop: 2 }]}>
                  {advancedCycleMetrics.averageCycleLength}d
                </Text>
              </SquircleSurface>
              <SquircleSurface style={styles.statItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Median</Text>
                <Text style={[typography.subheading, { color: colors.primary, marginTop: 2 }]}>
                  {advancedCycleMetrics.medianCycleLength}d
                </Text>
              </SquircleSurface>
              <SquircleSurface style={styles.statItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Variability</Text>
                <Text style={[typography.subheading, { color: colors.primary, marginTop: 2 }]}>
                  ±{advancedCycleMetrics.cycleLengthVariabilityDays}d
                </Text>
              </SquircleSurface>
              <SquircleSurface style={styles.statItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Recorded</Text>
                <Text style={[typography.subheading, { color: colors.primary, marginTop: 2 }]}>
                  {cycleData?.periodHistory?.length ?? 0}
                </Text>
              </SquircleSurface>
            </SquircleSurface>
          )}

          {/* Historical Records List */}
          <SquircleSurface style={{ marginTop: spacing.md }}>
            {(!cycleData?.periodHistory || cycleData.periodHistory.length === 0) ? (
              <SquircleSurface style={{ alignItems: 'center', padding: spacing.lg }}>
                <Ionicons name="water-outline" size={32} color={colors.text.muted} />
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                  No Period Records Logged Yet
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center', marginTop: 4 }]}>
                  Tap "+ Log Period" to record bleeding dates, flow intensity, and pain ratings.
                </Text>
              </SquircleSurface>
            ) : (
              cycleData.periodHistory.map((rec) => (
                <SquircleSurface
                  key={rec.id}
                  style={[styles.historyRecordCard, { backgroundColor: colors.surface1, marginTop: 8 }]}
                >
                  <SquircleSurface style={styles.rowBetween}>
                    <SquircleSurface style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                        {rec.startDate} {rec.isOngoing ? '— Ongoing' : rec.endDate ? `— ${rec.endDate}` : ''}
                      </Text>
                      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                        Flow: {rec.flowIntensity} • Pain: {rec.painLevel !== undefined ? `${rec.painLevel}/10` : 'None'}
                      </Text>
                      {rec.notes ? (
                        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                          "{rec.notes}"
                        </Text>
                      ) : null}
                    </SquircleSurface>
                    <SquircleSurface style={{ flexDirection: 'row', gap: 6 }}>
                      <PressableScale
                        onPress={() => onEditPeriod(rec)}
                        scaleTo={0.9}
                        style={[styles.actionIconBtn, { backgroundColor: colors.surface }]}
                        accessibilityRole="button"
                        accessibilityLabel="Edit period"
                      >
                        <Ionicons name="pencil" size={14} color={colors.primary} />
                      </PressableScale>
                      <PressableScale
                        onPress={() => onDeletePeriod(rec.id, rec.startDate)}
                        scaleTo={0.9}
                        style={[styles.actionIconBtn, { backgroundColor: colors.surface }]}
                        accessibilityRole="button"
                        accessibilityLabel="Delete period"
                      >
                        <Ionicons name="trash-outline" size={14} color={colors.error} />
                      </PressableScale>
                    </SquircleSurface>
                  </SquircleSurface>
                </SquircleSurface>
              ))
            )}
          </SquircleSurface>
        </>
      ) : (
        <>
          <SquircleSurface style={styles.rowBetween}>
            <SquircleSurface style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Milestones & Anniversaries
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
                Birthdays, family celebrations, and financial reminders
              </Text>
            </SquircleSurface>
            <Button
              label="+ Add Event"
              size="sm"
              variant="primary"
              onPress={onAddMilestone}
            />
          </SquircleSurface>

          <SquircleSurface style={{ marginTop: spacing.md }}>
            {(!personalEvents || personalEvents.length === 0) ? (
              <SquircleSurface style={{ alignItems: 'center', padding: spacing.lg }}>
                <Ionicons name="calendar-outline" size={32} color={colors.text.muted} />
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                  No Milestones Added Yet
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center', marginTop: 4 }]}>
                  Save your spouse's birthday, anniversary, or financial deadlines.
                </Text>
              </SquircleSurface>
            ) : (
              personalEvents.map((pe) => (
                <SquircleSurface
                  key={pe.id}
                  style={[styles.historyRecordCard, { backgroundColor: colors.surface1, marginTop: 8 }]}
                >
                  <SquircleSurface style={styles.rowBetween}>
                    <SquircleSurface style={{ flex: 1, paddingRight: 8 }}>
                      <SquircleSurface style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="gift-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          {pe.title}
                        </Text>
                      </SquircleSurface>
                      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                        {pe.date} • {pe.category.toUpperCase()} {pe.recurrence === 'yearly' ? '(Annual)' : ''}
                        {pe.relationship ? ` • ${pe.relationship}` : ''}
                      </Text>
                      {pe.notes ? (
                        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                          {pe.notes}
                        </Text>
                      ) : null}
                    </SquircleSurface>
                    <SquircleSurface style={{ flexDirection: 'row', gap: 6 }}>
                      <PressableScale
                        onPress={() => onEditMilestone(pe)}
                        scaleTo={0.9}
                        style={[styles.actionIconBtn, { backgroundColor: colors.surface }]}
                        accessibilityRole="button"
                        accessibilityLabel="Edit milestone"
                      >
                        <Ionicons name="pencil" size={14} color={colors.primary} />
                      </PressableScale>
                      <PressableScale
                        onPress={() => onDeleteMilestone(pe.id, pe.title)}
                        scaleTo={0.9}
                        style={[styles.actionIconBtn, { backgroundColor: colors.surface }]}
                        accessibilityRole="button"
                        accessibilityLabel="Delete milestone"
                      >
                        <Ionicons name="trash-outline" size={14} color={colors.error} />
                      </PressableScale>
                    </SquircleSurface>
                  </SquircleSurface>
                </SquircleSurface>
              ))
            )}
          </SquircleSurface>
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  historyRecordCard: {
    padding: 12,
    borderRadius: 14,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
