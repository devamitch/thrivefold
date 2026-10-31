import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  format12Hour,
  isHHMM,
  to24Hour,
  type Routine,
} from '../../domain/routines';
import { hapticLight, hapticSuccess, hapticWarning } from '../../services/haptics/hapticFeedback';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { AppBottomSheetModal } from '../ui/AppBottomSheetModal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { PressableScale } from '../ui/PressableScale';
import { TextField } from '../ui/TextField';
import { Toggle } from '../ui/Toggle';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface EditRoutineModalProps {
  routine: Routine | null;
  visible: boolean;
  onClose: () => void;
  onUpdated?: (routine: Routine) => void;
  onDeleted?: (routineId: string) => void;
}

export function EditRoutineModal({
  routine,
  visible,
  onClose,
  onUpdated,
  onDeleted,
}: EditRoutineModalProps) {
  const { colors, typography, spacing } = useTheme();
  const routines = useRootStore((s) => s.routines);
  const updateRoutine = useRootStore((s) => s.updateRoutine);
  const removeRoutine = useRootStore((s) => s.removeRoutine);

  const [title, setTitle] = useState('');
  const [selectedHour, setSelectedHour] = useState<number>(8);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [days, setDays] = useState<number[]>([]);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    if (routine) {
      setTitle(routine.title);
      setEnabled(routine.enabled);
      setDays(routine.days || []);
      setConfirmDelete(false);

      if (isHHMM(routine.time)) {
        const [h, m] = routine.time.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        setSelectedHour(hour12);
        setSelectedMinute(m);
        setSelectedPeriod(period);
      }
    }
  }, [routine]);

  const time24 = useMemo(
    () => to24Hour(selectedHour, selectedMinute, selectedPeriod),
    [selectedHour, selectedMinute, selectedPeriod],
  );

  const conflictingRoutine = useMemo(() => {
    if (!routine) return null;
    return routines.find((r) => r.time === time24 && r.id !== routine.id && r.enabled);
  }, [routines, time24, routine]);

  if (!routine) return null;

  const handleSave = () => {
    if (!title.trim() || !isHHMM(time24)) return;
    hapticSuccess();
    updateRoutine(routine.id, {
      title: title.trim(),
      time: time24,
      days,
      enabled,
    });
    if (onUpdated) {
      onUpdated({
        ...routine,
        title: title.trim(),
        time: time24,
        days,
        enabled,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    hapticWarning();
    removeRoutine(routine.id);
    if (onDeleted) onDeleted(routine.id);
    onClose();
  };

  return (
    <AppBottomSheetModal
      visible={visible}
      onClose={onClose}
      eyebrow="EDIT ROUTINE ALARM"
      title="Edit Alarm"
      subtitle={`Currently set for ${format12Hour(routine.time)}`}
    >
      <View style={styles.container}>
        {/* Active Toggle Status Card */}
        <Card variant="surface1" style={[styles.statusCard, { marginBottom: spacing.md }]}>
          <View style={styles.statusRow}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Alarm Status
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                {enabled ? 'Active · triggers background alarm' : 'Paused · notification silenced'}
              </Text>
            </View>
            <Toggle
              value={enabled}
              onValueChange={(val) => {
                hapticLight();
                setEnabled(val);
              }}
            />
          </View>
        </Card>

        {/* Routine Name Input */}
        <View style={{ marginBottom: spacing.md }}>
          <TextField
            label="Routine Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Routine name"
          />
        </View>

        {/* 12-Hour AM/PM Time Picker Card */}
        <View style={[styles.timeCard, { backgroundColor: colors.surface1 }]}>
          <View style={styles.timeCardHeader}>
            <Text style={[typography.captionBold, { color: colors.text.primary }]}>
              ALARM TIME
            </Text>
            <Badge label={`${time24} (24H)`} variant="primary" />
          </View>

          {/* Large Digital Clock Display */}
          <View style={styles.digitalClockRow}>
            <View style={[styles.clockDigitBox, { backgroundColor: colors.surface2 }]}>
              <Text style={[typography.heading, { fontSize: 34, color: colors.primary }]}>
                {String(selectedHour).padStart(2, '0')}
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>HOUR</Text>
            </View>

            <Text style={[typography.heading, { fontSize: 30, color: colors.text.muted, marginHorizontal: 8 }]}>
              :
            </Text>

            <View style={[styles.clockDigitBox, { backgroundColor: colors.surface2 }]}>
              <Text style={[typography.heading, { fontSize: 34, color: colors.primary }]}>
                {String(selectedMinute).padStart(2, '0')}
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>MIN</Text>
            </View>

            {/* AM / PM Segmented Controls */}
            <View style={styles.ampmWrap}>
              {(['AM', 'PM'] as const).map((p) => {
                const isActive = selectedPeriod === p;
                return (
                  <PressableScale
                    key={p}
                    onPress={() => {
                      hapticLight();
                      setSelectedPeriod(p);
                    }}
                    style={[
                      styles.ampmBtn,
                      {
                        backgroundColor: isActive ? colors.primary : colors.surface2,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.captionBold,
                        { color: isActive ? '#FFFFFF' : colors.text.secondary },
                      ]}
                    >
                      {p}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>

          {/* Hour Grid (1-12) */}
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 12, marginBottom: 6 }]}>
            Hour (1-12):
          </Text>
          <View style={styles.hoursGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
              const isSelected = selectedHour === h;
              return (
                <PressableScale
                  key={h}
                  onPress={() => {
                    hapticLight();
                    setSelectedHour(h);
                  }}
                  style={[
                    styles.hourChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: isSelected ? '#FFFFFF' : colors.text.primary },
                    ]}
                  >
                    {h}
                  </Text>
                </PressableScale>
              );
            })}
          </View>

          {/* Minute Options */}
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 12, marginBottom: 6 }]}>
            Minutes:
          </Text>
          <View style={styles.minutesRow}>
            {[0, 15, 30, 45].map((m) => {
              const isSelected = selectedMinute === m;
              return (
                <PressableScale
                  key={m}
                  onPress={() => {
                    hapticLight();
                    setSelectedMinute(m);
                  }}
                  style={[
                    styles.minuteChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: isSelected ? '#FFFFFF' : colors.text.primary },
                    ]}
                  >
                    :{String(m).padStart(2, '0')}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* Repeat Days Configuration */}
        <View style={{ marginTop: spacing.md }}>
          <View style={styles.repeatHeaderRow}>
            <Text style={[typography.captionBold, { color: colors.text.primary }]}>
              REPEAT SCHEDULE
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <PressableScale
                onPress={() => {
                  hapticLight();
                  setDays([]);
                }}
              >
                <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                  Every Day
                </Text>
              </PressableScale>
              <PressableScale
                onPress={() => {
                  hapticLight();
                  setDays([1, 2, 3, 4, 5]);
                }}
              >
                <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                  Weekdays
                </Text>
              </PressableScale>
              <PressableScale
                onPress={() => {
                  hapticLight();
                  setDays([6, 7]);
                }}
              >
                <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                  Weekends
                </Text>
              </PressableScale>
            </View>
          </View>

          <View style={styles.daysRow}>
            {DAYS.map((d, i) => {
              const dayNum = i + 1;
              const isSelected = days.includes(dayNum);
              return (
                <Chip
                  key={d}
                  label={d}
                  selected={isSelected}
                  onPress={() => {
                    hapticLight();
                    setDays((cur) =>
                      cur.includes(dayNum) ? cur.filter((x) => x !== dayNum) : [...cur, dayNum].sort(),
                    );
                  }}
                />
              );
            })}
          </View>
        </View>

        {/* Conflict Notice Banner */}
        {conflictingRoutine ? (
          <Card
            variant="surface2"
            style={[styles.conflictCard, { marginTop: spacing.md }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="notifications-outline" size={18} color={colors.accent} style={{ marginTop: 2 }} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={[typography.captionBold, { color: colors.accent }]}>
                  Coinciding Alarm Notice
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, lineHeight: 16 }]}>
                  &quot;{conflictingRoutine.title}&quot; is already set for {format12Hour(conflictingRoutine.time)}. Both alarms will trigger on schedule.
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        {/* Action Buttons */}
        <View style={{ marginTop: spacing.lg, gap: 10 }}>
          <Button
            label={`Update Alarm for ${selectedHour}:${String(selectedMinute).padStart(2, '0')} ${selectedPeriod}`}
            variant="primary"
            disabled={!title.trim()}
            onPress={handleSave}
            icon={<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
          />

          {confirmDelete ? (
            <View style={[styles.confirmDeleteBox, { backgroundColor: colors.surface2 }]}>
              <Text style={[typography.caption, { color: colors.error, marginBottom: 8, textAlign: 'center' }]}>
                Permanently delete &quot;{routine.title}&quot; alarm?
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Cancel"
                    variant="secondary"
                    size="sm"
                    onPress={() => setConfirmDelete(false)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Yes, Delete"
                    variant="danger"
                    size="sm"
                    onPress={handleDelete}
                  />
                </View>
              </View>
            </View>
          ) : (
            <PressableScale
              onPress={() => {
                hapticLight();
                setConfirmDelete(true);
              }}
              style={styles.deleteLink}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
              <Text style={[typography.captionBold, { color: colors.error, marginLeft: 6 }]}>
                Delete this routine alarm
              </Text>
            </PressableScale>
          )}
        </View>
      </View>
    </AppBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  statusCard: {
    padding: 12,
    borderRadius: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeCard: {
    borderRadius: 18,
    padding: 14,
  },
  timeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  digitalClockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  clockDigitBox: {
    width: 74,
    height: 66,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ampmWrap: {
    marginLeft: 12,
    gap: 6,
  },
  ampmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  hourChip: {
    width: 44,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minutesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  minuteChip: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  conflictCard: {
    padding: 12,
    borderRadius: 14,
  },
  confirmDeleteBox: {
    padding: 12,
    borderRadius: 14,
  },
  deleteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
