import { SquircleSurface } from '../ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
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
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Period & Cycle History
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
                Audited bleed records and calculated interval metrics
              </Text>
            </View>
            <Button
              label="+ Log Period"
              size="sm"
              variant="primary"
              onPress={onLogPeriod}
            />
          </View>

          {/* Advanced Metrics Summary */}
          {advancedCycleMetrics && (
            <View style={[styles.statsRow, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
              <View style={styles.statItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Average</Text>
                <Text style={[typography.subheading, { color: colors.primary, marginTop: 2 }]}>
                  {advancedCycleMetrics.averageCycleLength}d
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Median</Text>
                <Text style={[typography.subheading, { color: colors.primary, marginTop: 2 }]}>
                  {advancedCycleMetrics.medianCycleLength}d
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Variability</Text>
                <Text style={[typography.subheading, { color: colors.primary, marginTop: 2 }]}>
                  ±{advancedCycleMetrics.cycleLengthVariabilityDays}d
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Recorded</Text>
                <Text style={[typography.subheading, { color: colors.primary, marginTop: 2 }]}>
                  {cycleData?.periodHistory?.length ?? 0}
                </Text>
              </View>
            </View>
          )}

          {/* Historical Records List */}
          <View style={{ marginTop: spacing.md }}>
            {(!cycleData?.periodHistory || cycleData.periodHistory.length === 0) ? (
              <View style={{ alignItems: 'center', padding: spacing.lg }}>
                <Ionicons name="water-outline" size={32} color={colors.text.muted} />
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                  No Period Records Logged Yet
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center', marginTop: 4 }]}>
                  Tap "+ Log Period" to record bleeding dates, flow intensity, and pain ratings.
                </Text>
              </View>
            ) : (
              cycleData.periodHistory.map((rec) => (
                <View
                  key={rec.id}
                  style={[styles.historyRecordCard, { backgroundColor: colors.surface1, marginTop: 8 }]}
                >
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
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
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
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
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      ) : (
        <>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Milestones & Anniversaries
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 1 }]}>
                Birthdays, family celebrations, and financial reminders
              </Text>
            </View>
            <Button
              label="+ Add Event"
              size="sm"
              variant="primary"
              onPress={onAddMilestone}
            />
          </View>

          <View style={{ marginTop: spacing.md }}>
            {(!personalEvents || personalEvents.length === 0) ? (
              <View style={{ alignItems: 'center', padding: spacing.lg }}>
                <Ionicons name="calendar-outline" size={32} color={colors.text.muted} />
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                  No Milestones Added Yet
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center', marginTop: 4 }]}>
                  Save your spouse's birthday, anniversary, or financial deadlines.
                </Text>
              </View>
            ) : (
              personalEvents.map((pe) => (
                <View
                  key={pe.id}
                  style={[styles.historyRecordCard, { backgroundColor: colors.surface1, marginTop: 8 }]}
                >
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="gift-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          {pe.title}
                        </Text>
                      </View>
                      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                        {pe.date} • {pe.category.toUpperCase()} {pe.recurrence === 'yearly' ? '(Annual)' : ''}
                        {pe.relationship ? ` • ${pe.relationship}` : ''}
                      </Text>
                      {pe.notes ? (
                        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                          {pe.notes}
                        </Text>
                      ) : null}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
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
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
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
