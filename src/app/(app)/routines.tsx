import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppBottomSheetModal } from '../../components/ui/AppBottomSheetModal';
import { AppHeader } from '../../components/ui/AppHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { PressableScale } from '../../components/ui/PressableScale';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextField } from '../../components/ui/TextField';
import { Toggle } from '../../components/ui/Toggle';
import {
  format12Hour,
  isHHMM,
  ROUTINE_PRESETS,
  routineTimes,
  to24Hour,
  type Routine,
} from '../../domain/routines';
import { hapticLight, hapticSuccess } from '../../services/haptics/hapticFeedback';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const QUICK_ROUTINE_NAMES = [
  'Drink a glass of water',
  'Morning sunlight & stretch',
  'Post-lunch walk',
  'Desk posture reset',
  'Evening wind-down',
  'Bedtime breathwork',
];

const describe = (r: Pick<Routine, 'time' | 'days' | 'everyHours' | 'until'>) => {
  const when = r.everyHours
    ? `Every ${r.everyHours}h, ${format12Hour(routineTimes(r)[0])}–${format12Hour(r.until ?? r.time)}`
    : format12Hour(r.time);
  const days = !r.days.length
    ? 'Every day'
    : r.days.length === 5 && !r.days.includes(6) && !r.days.includes(7)
    ? 'Weekdays'
    : r.days.length === 2 && r.days.includes(6) && r.days.includes(7)
    ? 'Weekends'
    : r.days.map((d) => DAYS[d - 1]).join(', ');
  return `${when} · ${days}`;
};

/**
 * Routine Alarms: Schedules reliable background notifications like an alarm clock.
 * Time is picked and displayed in 12-hour AM/PM format, saved in 24-hour format.
 */
export default function RoutinesScreen() {
  const { colors, typography, spacing } = useTheme();
  const { routines, addRoutine, updateRoutine, removeRoutine } = useRootStore(
    useShallow((s) => ({
      routines: s.routines,
      addRoutine: s.addRoutine,
      updateRoutine: s.updateRoutine,
      removeRoutine: s.removeRoutine,
    })),
  );

  // Bottom sheet modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');

  // 12-hour AM/PM time picker state
  const [selectedHour, setSelectedHour] = useState<number>(8);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [days, setDays] = useState<number[]>([]);

  // Computed 24-hour time string
  const time24 = useMemo(
    () => to24Hour(selectedHour, selectedMinute, selectedPeriod),
    [selectedHour, selectedMinute, selectedPeriod],
  );

  const unusedPresets = ROUTINE_PRESETS.filter(
    (p) => !routines.some((r) => r.kind === p.kind && r.title === p.title),
  );

  const openAddModal = () => {
    hapticLight();
    setTitle('');
    setSelectedHour(8);
    setSelectedMinute(0);
    setSelectedPeriod('AM');
    setDays([]);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!title.trim() || !isHHMM(time24)) return;
    hapticSuccess();
    addRoutine({
      kind: 'custom',
      title: title.trim(),
      time: time24,
      days,
    });
    setModalVisible(false);
  };

  const setWeekdayPreset = () => {
    hapticLight();
    setDays([1, 2, 3, 4, 5]);
  };

  const setEverydayPreset = () => {
    hapticLight();
    setDays([]);
  };

  const setWeekendPreset = () => {
    hapticLight();
    setDays([6, 7]);
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Routines & Alarms"
          subtitle="Alarm-clock reminders that alert you even when closed"
          showBack
        />
      }
      scrollMode="shell-scroll-view"
    >
      {/* Informative Header Banner */}
      <Card variant="tinted" style={[styles.bannerCard, { marginBottom: spacing.md }]}>
        <View style={styles.bannerRow}>
          <Ionicons name="alarm-outline" size={24} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
              Reliable Alarm Nudges
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              Alarms trigger notifications on time even if Thrivefold is completely closed or in the background.
            </Text>
          </View>
        </View>
      </Card>

      {/* Primary Action Button */}
      <View style={{ marginBottom: spacing.lg }}>
        <Button
          label="Add Your Own Routine"
          variant="primary"
          onPress={openAddModal}
          icon={<Ionicons name="add-circle" size={18} color="#FFF" />}
        />
      </View>

      {/* Active Routines List */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[typography.subheading, { color: colors.text.primary }]}>
          Your Active Alarms ({routines.length})
        </Text>
        <Badge label="ALARM CLOCK" variant="primary" />
      </View>

      {routines.length ? (
        routines.map((r) => {
          const displayTime = format12Hour(r.time);

          return (
            <Card key={r.id} style={[styles.alarmCard, { marginBottom: spacing.sm }]}>
              <View style={styles.alarmRow}>
                {/* Big Alarm Clock Icon & 12-Hour Display */}
                <View style={[styles.timeBox, { backgroundColor: colors.surface2 }]}>
                  <Text style={[typography.heading, { color: r.enabled ? colors.primary : colors.text.muted }]}>
                    {displayTime}
                  </Text>
                </View>

                {/* Routine Title & Repeat Days */}
                <View style={[styles.flex, { marginLeft: spacing.md }]}>
                  <Text
                    style={[
                      typography.bodyBold,
                      { color: r.enabled ? colors.text.primary : colors.text.muted },
                    ]}
                    numberOfLines={1}
                  >
                    {r.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    {describe(r)}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted, fontSize: 11, marginTop: 2 }]}>
                    Saved as {r.time}
                  </Text>
                </View>

                {/* Alarm Enable Toggle */}
                <Toggle
                  value={r.enabled}
                  onValueChange={(v) => {
                    hapticLight();
                    updateRoutine(r.id, { enabled: v });
                  }}
                  accessibilityLabel={`${r.title} alarm on or off`}
                />

                {/* Delete Button */}
                <PressableScale
                  onPress={() => {
                    hapticLight();
                    removeRoutine(r.id);
                  }}
                  hitSlop={10}
                  accessibilityLabel={`Delete ${r.title}`}
                  style={{ marginLeft: 12 }}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.text.muted} />
                </PressableScale>
              </View>
            </Card>
          );
        })
      ) : (
        <Card style={styles.emptyCard}>
          <Ionicons name="alarm-outline" size={40} color={colors.text.muted} />
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: 8, textAlign: 'center' }]}>
            No routines scheduled yet. Add your first alarm clock routine above or choose from presets below!
          </Text>
        </Card>
      )}

      {/* Suggested Presets Section */}
      {unusedPresets.length ? (
        <View style={{ marginTop: spacing.xl, marginBottom: spacing.xl }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
            Recommended Presets
          </Text>
          {unusedPresets.map((p) => (
            <PressableScale
              key={p.title}
              onPress={() => {
                hapticSuccess();
                addRoutine(p);
              }}
              style={[styles.presetRow, { backgroundColor: colors.surface }]}
              accessibilityRole="button"
            >
              <View style={[styles.presetIconWrap, { backgroundColor: colors.surface2 }]}>
                <Ionicons name="add" size={20} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{p.title}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>{describe(p)}</Text>
              </View>
              <Badge label={format12Hour(p.time)} variant="neutral" />
            </PressableScale>
          ))}
        </View>
      ) : null}

      {/* ADD ROUTINE BOTTOM SHEET MODAL */}
      <AppBottomSheetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add Routine Alarm"
      >
        <View style={styles.modalContent}>
          {/* Routine Name Input */}
          <TextField
            label="Routine Name"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Drink a glass of water, Evening walk"
          />

          {/* Quick Name Suggestions */}
          <View style={styles.quickChipsWrap}>
            {QUICK_ROUTINE_NAMES.map((q) => (
              <Chip
                key={q}
                label={q}
                selected={title === q}
                onPress={() => {
                  hapticLight();
                  setTitle(q);
                }}
              />
            ))}
          </View>

          {/* Modern 12-Hour AM/PM Time Selector */}
          <View style={[styles.timeSelectorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.timeHeaderRow}>
              <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                ALARM TIME (12-HOUR FORMAT)
              </Text>
              <Badge label={`SAVED: ${time24} (24H)`} variant="primary" />
            </View>

            {/* Big Digits Display */}
            <View style={styles.largeTimeDisplayRow}>
              <View style={[styles.digitCard, { backgroundColor: colors.surface2 }]}>
                <Text style={[typography.heading, { fontSize: 32, color: colors.primary }]}>
                  {String(selectedHour).padStart(2, '0')}
                </Text>
                <Text style={[typography.caption, { color: colors.text.muted }]}>HOUR</Text>
              </View>

              <Text style={[typography.heading, { fontSize: 32, color: colors.text.primary, marginHorizontal: 8 }]}>
                :
              </Text>

              <View style={[styles.digitCard, { backgroundColor: colors.surface2 }]}>
                <Text style={[typography.heading, { fontSize: 32, color: colors.primary }]}>
                  {String(selectedMinute).padStart(2, '0')}
                </Text>
                <Text style={[typography.caption, { color: colors.text.muted }]}>MINUTE</Text>
              </View>

              {/* AM / PM Segmented Control */}
              <View style={styles.ampmColumn}>
                <PressableScale
                  onPress={() => {
                    hapticLight();
                    setSelectedPeriod('AM');
                  }}
                  style={[
                    styles.ampmButton,
                    selectedPeriod === 'AM' && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: selectedPeriod === 'AM' ? '#FFF' : colors.text.secondary },
                    ]}
                  >
                    AM
                  </Text>
                </PressableScale>

                <PressableScale
                  onPress={() => {
                    hapticLight();
                    setSelectedPeriod('PM');
                  }}
                  style={[
                    styles.ampmButton,
                    selectedPeriod === 'PM' && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: selectedPeriod === 'PM' ? '#FFF' : colors.text.secondary },
                    ]}
                  >
                    PM
                  </Text>
                </PressableScale>
              </View>
            </View>

            {/* Quick Hour Selector (1-12) */}
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: 12, marginBottom: 6 }]}>
              Select Hour:
            </Text>
            <View style={styles.hourPillsWrap}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                <PressableScale
                  key={h}
                  onPress={() => {
                    hapticLight();
                    setSelectedHour(h);
                  }}
                  style={[
                    styles.hourPill,
                    {
                      backgroundColor: selectedHour === h ? colors.primary : colors.surface2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: selectedHour === h ? '#FFF' : colors.text.primary },
                    ]}
                  >
                    {h}
                  </Text>
                </PressableScale>
              ))}
            </View>

            {/* Minute Selector (:00, :15, :30, :45) */}
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: 12, marginBottom: 6 }]}>
              Select Minute:
            </Text>
            <View style={styles.minutePillsWrap}>
              {[0, 15, 30, 45].map((m) => (
                <PressableScale
                  key={m}
                  onPress={() => {
                    hapticLight();
                    setSelectedMinute(m);
                  }}
                  style={[
                    styles.minutePill,
                    {
                      backgroundColor: selectedMinute === m ? colors.primary : colors.surface2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: selectedMinute === m ? '#FFF' : colors.text.primary },
                    ]}
                  >
                    :{String(m).padStart(2, '0')}
                  </Text>
                </PressableScale>
              ))}
            </View>
          </View>

          {/* Repeat Days Selection */}
          <View style={{ marginTop: spacing.md }}>
            <View style={styles.daysHeaderRow}>
              <Text style={[typography.captionBold, { color: colors.text.primary }]}>REPEAT DAYS</Text>
              <View style={styles.presetDaysRow}>
                <PressableScale onPress={setEverydayPreset}>
                  <Text style={[typography.caption, { color: colors.primary, marginRight: 10 }]}>Every Day</Text>
                </PressableScale>
                <PressableScale onPress={setWeekdayPreset}>
                  <Text style={[typography.caption, { color: colors.primary, marginRight: 10 }]}>Weekdays</Text>
                </PressableScale>
                <PressableScale onPress={setWeekendPreset}>
                  <Text style={[typography.caption, { color: colors.primary }]}>Weekends</Text>
                </PressableScale>
              </View>
            </View>

            <View style={styles.daysPillsRow}>
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

          {/* Save Button */}
          <View style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
            <Button
              label={`Save Alarm for ${selectedHour}:${String(selectedMinute).padStart(2, '0')} ${selectedPeriod}`}
              variant="primary"
              disabled={!title.trim()}
              onPress={handleSave}
              icon={<Ionicons name="checkmark-circle" size={18} color="#FFF" />}
            />
          </View>
        </View>
      </AppBottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bannerCard: {
    padding: 14,
    borderRadius: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  alarmCard: {
    padding: 14,
    borderRadius: 16,
  },
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBox: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  presetIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingVertical: 8,
  },
  quickChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  timeSelectorCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginTop: 8,
  },
  timeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  largeTimeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  digitCard: {
    width: 72,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ampmColumn: {
    marginLeft: 14,
    gap: 6,
  },
  ampmButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#E0E0E020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  hourPill: {
    width: 44,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minutePillsWrap: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  minutePill: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
