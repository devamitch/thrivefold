import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  format12Hour,
  isHHMM,
  ROUTINE_PRESETS,
  to24Hour,
  type Routine,
  type RoutineKind,
} from '../../domain/routines';
import { hapticLight, hapticSuccess } from '../../services/haptics/hapticFeedback';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { AppBottomSheetModal } from '../ui/AppBottomSheetModal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { PressableScale } from '../ui/PressableScale';
import { TextField } from '../ui/TextField';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface QuickTemplate {
  kind: RoutineKind;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  defaultHour: number;
  defaultMinute: number;
  defaultPeriod: 'AM' | 'PM';
}

const TEMPLATES: QuickTemplate[] = [
  { kind: 'water', icon: 'water-outline', title: 'Drink a glass of water', defaultHour: 9, defaultMinute: 0, defaultPeriod: 'AM' },
  { kind: 'stretch', icon: 'body-outline', title: 'Desk stretch & posture', defaultHour: 5, defaultMinute: 30, defaultPeriod: 'PM' },
  { kind: 'walk', icon: 'walk-outline', title: 'Evening mindful walk', defaultHour: 6, defaultMinute: 30, defaultPeriod: 'PM' },
  { kind: 'journal', icon: 'book-outline', title: 'Evening journal reflection', defaultHour: 9, defaultMinute: 0, defaultPeriod: 'PM' },
  { kind: 'sleep', icon: 'moon-outline', title: 'Bedtime wind-down', defaultHour: 10, defaultMinute: 0, defaultPeriod: 'PM' },
  { kind: 'checkin', icon: 'sunny-outline', title: 'Morning sunlight check-in', defaultHour: 8, defaultMinute: 30, defaultPeriod: 'AM' },
];

interface AddRoutineModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded?: (routineId: string) => void;
}

export function AddRoutineModal({ visible, onClose, onAdded }: AddRoutineModalProps) {
  const { colors, typography, spacing } = useTheme();
  const routines = useRootStore((s) => s.routines);
  const addRoutine = useRootStore((s) => s.addRoutine);

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<RoutineKind>('custom');
  const [selectedHour, setSelectedHour] = useState<number>(8);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [days, setDays] = useState<number[]>([]);

  const time24 = useMemo(
    () => to24Hour(selectedHour, selectedMinute, selectedPeriod),
    [selectedHour, selectedMinute, selectedPeriod],
  );

  const conflictingRoutine = useMemo(() => {
    return routines.find((r) => r.time === time24 && r.enabled);
  }, [routines, time24]);

  const handleSelectTemplate = (tpl: QuickTemplate) => {
    hapticLight();
    setKind(tpl.kind);
    setTitle(tpl.title);
    setSelectedHour(tpl.defaultHour);
    setSelectedMinute(tpl.defaultMinute);
    setSelectedPeriod(tpl.defaultPeriod);
  };

  const handleSave = () => {
    if (!title.trim() || !isHHMM(time24)) return;
    hapticSuccess();
    const newRoutineId = addRoutine({
      kind,
      title: title.trim(),
      time: time24,
      days,
    });
    if (onAdded) onAdded(newRoutineId);
    onClose();
  };

  return (
    <AppBottomSheetModal
      visible={visible}
      onClose={onClose}
      eyebrow="NEW ROUTINE ALARM"
      title="Create Routine"
      subtitle="Fires on time with high-priority heads-up notification"
    >
      <View style={styles.container}>
        {/* Quick Sanctuary Templates */}
        <Text style={[typography.captionBold, { color: colors.text.muted, marginBottom: 8 }]}>
          QUICK TEMPLATES
        </Text>
        <View style={styles.templatesWrap}>
          {TEMPLATES.map((tpl) => {
            const isSelected = title === tpl.title;
            return (
              <PressableScale
                key={tpl.title}
                onPress={() => handleSelectTemplate(tpl)}
                style={[
                  styles.templatePill,
                  {
                    backgroundColor: isSelected ? colors.primaryAlpha : colors.surface2,
                  },
                ]}
              >
                <Ionicons
                  name={tpl.icon}
                  size={15}
                  color={isSelected ? colors.primary : colors.text.secondary}
                />
                <Text
                  style={[
                    typography.caption,
                    {
                      color: isSelected ? colors.primary : colors.text.primary,
                      fontWeight: isSelected ? '700' : '500',
                      marginLeft: 6,
                    },
                  ]}
                >
                  {tpl.title.split(' ')[0]} {tpl.title.split(' ')[1] ?? ''}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        {/* Routine Name Input */}
        <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
          <TextField
            label="Routine Title"
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              setKind('custom');
            }}
            placeholder="e.g. Drink a glass of water, Evening walk"
          />
        </View>

        {/* 12-Hour AM/PM Time Picker Card */}
        <View style={[styles.timeCard, { backgroundColor: colors.surface1 }]}>
          <View style={styles.timeCardHeader}>
            <Text style={[typography.captionBold, { color: colors.text.primary }]}>
              SELECT ALARM TIME
            </Text>
            <Badge label={`${time24} (24H)`} variant="neutral" />
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
            Hours (12h format):
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
                  &quot;{conflictingRoutine.title}&quot; is already active at {format12Hour(conflictingRoutine.time)}. Both alarms will trigger on schedule.
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        {/* Submit Action */}
        <View style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
          <Button
            label={`Schedule Alarm for ${selectedHour}:${String(selectedMinute).padStart(2, '0')} ${selectedPeriod}`}
            variant="primary"
            disabled={!title.trim()}
            onPress={handleSave}
            icon={<Ionicons name="alarm" size={18} color="#FFFFFF" />}
          />
        </View>
      </View>
    </AppBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  templatesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  templatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
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
});
