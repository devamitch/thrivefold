import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { format12Hour, isHHMM, parseRoutineRequest, to24Hour, type Routine, type RoutineKind } from '../../domain/routines';
import { daysOverlap, formatCountdown, nextTrigger } from '../../domain/routineSchedule';
import { hapticLight, hapticSuccess, hapticWarning } from '../../services/haptics/hapticFeedback';
import { isRoutineVoiceAvailable, listenForRoutine } from '../../services/routines/routineVoice';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';
import { Toggle } from '../ui/Toggle';
import { RoutineBottomSheet } from './RoutineBottomSheet';
import { DaySelector } from './DaySelector';
import { TimeSelector, type Period, type TimeValue } from './TimeSelector';

export interface RoutineFormValues {
  kind: RoutineKind;
  title: string;
  time: string; // "HH:mm" 24h
  days: number[];
  enabled: boolean;
}

type IconName = keyof typeof Ionicons.glyphMap;

const KIND_ICON: Record<RoutineKind, IconName> = {
  water: 'water',
  checkin: 'sunny',
  sleep: 'moon',
  stretch: 'body',
  journal: 'book',
  walk: 'walk',
  custom: 'alarm',
};

interface Template {
  kind: RoutineKind;
  label: string;
  title: string;
  time: string;
}

const TEMPLATES: Template[] = [
  { kind: 'water', label: 'Water', title: 'Drink a glass of water', time: '09:00' },
  { kind: 'checkin', label: 'Sunlight', title: 'Morning sunlight check-in', time: '08:30' },
  { kind: 'stretch', label: 'Stretch', title: 'Desk stretch & posture', time: '17:30' },
  { kind: 'walk', label: 'Walk', title: 'Evening mindful walk', time: '18:30' },
  { kind: 'journal', label: 'Journal', title: 'Evening journal reflection', time: '21:00' },
  { kind: 'sleep', label: 'Wind down', title: 'Bedtime wind-down', time: '22:00' },
];

const DEFAULT_TIME: TimeValue = { hour: 8, minute: 0, period: 'AM' };

function toTimeValue(time24: string): TimeValue {
  if (!isHHMM(time24)) return DEFAULT_TIME;
  const [h, m] = time24.split(':').map(Number);
  return { hour: h % 12 === 0 ? 12 : h % 12, minute: m, period: (h >= 12 ? 'PM' : 'AM') as Period };
}

interface Props {
  visible: boolean;
  mode: 'add' | 'edit';
  routine?: Routine | null;
  initial?: Partial<RoutineFormValues>;
  onClose: () => void;
  onSubmit: (values: RoutineFormValues) => void;
  onDelete?: () => void;
}

export function RoutineSheet({ visible, mode, routine, initial, onClose, onSubmit, onDelete }: Props) {
  const { colors, typography, spacing } = useTheme();
  const routines = useRootStore((s) => s.routines);
  const isEdit = mode === 'edit';

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<RoutineKind>('custom');
  const [time, setTime] = useState<TimeValue>(DEFAULT_TIME);
  const [days, setDays] = useState<number[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [nameEditing, setNameEditing] = useState(false);
  const [voice, setVoice] = useState<'idle' | 'listening' | 'miss'>('idle');

  useEffect(() => {
    if (!visible) return;
    setConfirmDelete(false);
    setNameEditing(false);
    setVoice('idle');
    if (isEdit && routine) {
      setTitle(routine.title);
      setKind(routine.kind);
      setTime(toTimeValue(routine.time));
      setDays(routine.days ?? []);
      setEnabled(routine.enabled);
    } else {
      setTitle(initial?.title ?? '');
      setKind(initial?.kind ?? 'custom');
      setTime(initial?.time ? toTimeValue(initial.time) : DEFAULT_TIME);
      setDays(initial?.days ?? []);
      setEnabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, routine?.id, isEdit]);

  const time24 = useMemo(() => to24Hour(time.hour, time.minute, time.period), [time]);
  const canSave = !!title.trim() && isHHMM(time24);

  const conflict = useMemo(
    () => routines.find((r) => r.enabled && r.time === time24 && r.id !== routine?.id && daysOverlap(r.days, days)) ?? null,
    [routines, time24, days, routine?.id],
  );

  const next = useMemo(() => {
    if (!enabled || !canSave) return null;
    return nextTrigger({ time: time24, days, everyHours: routine?.everyHours, until: routine?.until });
  }, [enabled, canSave, time24, days, routine?.everyHours, routine?.until]);

  if (isEdit && !routine) return null;

  const close = () => {
    Keyboard.dismiss();
    onClose();
  };

  const pickTemplate = (t: Template) => {
    hapticLight();
    setKind(t.kind);
    setTitle(t.title);
    setTime(toTimeValue(t.time));
  };

  const startVoice = async () => {
    if (voice === 'listening') return;
    hapticLight();
    setVoice('listening');
    try {
      const text = await listenForRoutine();
      if (!text) return setVoice('idle');
      const draft = parseRoutineRequest(text);
      if (!draft) return setVoice('miss');
      setTitle(draft.title);
      setKind(draft.kind);
      setTime(toTimeValue(draft.time));
      setDays(draft.days);
      hapticSuccess();
      setVoice('idle');
    } catch {
      setVoice('miss');
    }
  };

  const save = () => {
    if (!canSave) return;
    hapticSuccess();
    onSubmit({ kind, title: title.trim(), time: time24, days, enabled });
    close();
  };

  const remove = () => {
    hapticWarning();
    onDelete?.();
    close();
  };

  const label = [typography.captionBold, { color: colors.text.muted, marginBottom: 8 }];
  const voiceOn = !isEdit && isRoutineVoiceAvailable();

  const tile = (key: string, icon: IconName, text: string, active: boolean, onPress: () => void, accent = false) => (
    <PressableScale
      key={key}
      onPress={onPress}
      style={styles.tile}
      accessibilityRole="button"
      accessibilityLabel={text}
    >
      <View
        style={[
          styles.tileIcon,
          { backgroundColor: accent ? colors.primary : active ? colors.primaryAlpha : colors.surface2 },
        ]}
      >
        <Ionicons name={icon} size={20} color={accent ? '#FFFFFF' : active ? colors.primary : colors.text.secondary} />
      </View>
      <Text
        style={[typography.caption, { color: active ? colors.primary : colors.text.secondary, marginTop: 6, fontWeight: active ? '700' : '500' }]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </PressableScale>
  );

  return (
    <RoutineBottomSheet
      visible={visible}
      onClose={close}
      eyebrow={isEdit ? 'EDIT ALARM' : 'NEW ALARM'}
      title={isEdit ? 'Edit alarm' : 'Add alarm'}
      subtitle={isEdit && routine ? `Set for ${format12Hour(routine.time)}` : undefined}
    >
      <View style={styles.container}>
        {nameEditing ? (
          // Typing mode: nothing else on screen, so the keyboard never fights the layout.
          <View>
            <Text style={label}>Name</Text>
            <TextInput
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (!isEdit) setKind('custom');
              }}
              placeholder="e.g. Evening walk"
              placeholderTextColor={colors.text.muted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => {
                Keyboard.dismiss();
                setNameEditing(false);
              }}
              maxLength={60}
              style={[typography.body, styles.input, { backgroundColor: colors.surface2, color: colors.text.primary }]}
            />
            <View style={{ marginTop: spacing.md }}>
              <Button
                label="Done"
                variant="primary"
                disabled={!title.trim()}
                onPress={() => {
                  Keyboard.dismiss();
                  setNameEditing(false);
                }}
              />
            </View>
          </View>
        ) : (
          <>
            {!isEdit ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.tiles}
              >
                {voiceOn
                  ? tile('voice', voice === 'listening' ? 'radio' : 'mic', voice === 'listening' ? 'Listening' : 'Say it', false, startVoice, true)
                  : null}
                {TEMPLATES.map((t) => tile(t.kind, KIND_ICON[t.kind], t.label, title === t.title, () => pickTemplate(t)))}
                {tile('custom', 'create-outline', 'Custom', false, () => {
                  hapticLight();
                  setNameEditing(true);
                })}
              </ScrollView>
            ) : null}

            {voice === 'miss' ? (
              <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 10 }]}>
                Didn&apos;t catch that. Try &quot;remind me to stretch at 6 pm on weekdays&quot;.
              </Text>
            ) : null}

            {title || isEdit ? (
              <PressableScale
                onPress={() => {
                  hapticLight();
                  setNameEditing(true);
                }}
                style={[styles.nameRow, { backgroundColor: colors.surface2 }]}
                accessibilityRole="button"
                accessibilityLabel={`Name: ${title}. Tap to rename`}
              >
                <View style={[styles.nameIcon, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name={KIND_ICON[kind]} size={18} color={colors.primary} />
                </View>
                <Text style={[typography.bodyBold, { color: colors.text.primary, flex: 1, marginLeft: 10 }]} numberOfLines={1}>
                  {title}
                </Text>
                <Ionicons name="pencil" size={16} color={colors.text.muted} />
              </PressableScale>
            ) : null}

            <Text style={[label, { marginTop: spacing.md }]}>Time</Text>
            <View style={[styles.card, { backgroundColor: colors.surface2 }]}>
              <TimeSelector value={time} onChange={setTime} />
              {routine?.everyHours && routine.until ? (
                <Text style={[typography.caption, { color: colors.text.muted, textAlign: 'center', marginTop: 10 }]}>
                  Then every {routine.everyHours}h until {format12Hour(routine.until)}
                </Text>
              ) : null}
            </View>

            <Text style={[label, { marginTop: spacing.md }]}>Repeat</Text>
            <DaySelector days={days} onChange={setDays} />

            {isEdit ? (
              <View style={[styles.statusRow, { backgroundColor: colors.surface2, marginTop: spacing.md }]}>
                <Text style={[typography.bodyBold, { color: colors.text.primary, flex: 1 }]}>
                  {enabled ? 'Alarm on' : 'Alarm paused'}
                </Text>
                <Toggle
                  value={enabled}
                  onValueChange={(v) => {
                    hapticLight();
                    setEnabled(v);
                  }}
                  accessibilityLabel="Alarm enabled"
                />
              </View>
            ) : null}

            {conflict ? (
              <View style={[styles.notice, { backgroundColor: colors.surface2, marginTop: spacing.md }]}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.accent} />
                <Text style={[typography.caption, { color: colors.text.secondary, flex: 1, marginLeft: 8, lineHeight: 17 }]}>
                  Same time as &quot;{conflict.title}&quot;. Both will ring.
                </Text>
              </View>
            ) : null}

            <View style={{ marginTop: spacing.lg }}>
              {next ? (
                <Text style={[typography.caption, { color: colors.text.muted, textAlign: 'center', marginBottom: 8 }]}>
                  Next rings {formatCountdown(next)}
                </Text>
              ) : null}
              <Button
                label={isEdit ? 'Save changes' : `Add alarm · ${format12Hour(time24)}`}
                variant="primary"
                disabled={!canSave}
                onPress={save}
                icon={<Ionicons name={isEdit ? 'checkmark-circle' : 'alarm'} size={18} color="#FFFFFF" />}
              />
            </View>

            {isEdit ? (
              confirmDelete ? (
                <View style={[styles.confirmBox, { backgroundColor: colors.surface2 }]}>
                  <Text style={[typography.caption, { color: colors.error, textAlign: 'center', marginBottom: 8 }]}>
                    Delete &quot;{routine?.title}&quot;? This can&apos;t be undone.
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Button label="Keep" variant="secondary" size="sm" onPress={() => setConfirmDelete(false)} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button label="Delete" variant="danger" size="sm" onPress={remove} />
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
                  accessibilityRole="button"
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                  <Text style={[typography.captionBold, { color: colors.error, marginLeft: 6 }]}>Delete alarm</Text>
                </PressableScale>
              )
            ) : null}
          </>
        )}
      </View>
    </RoutineBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 4 },
  tiles: { gap: 14, paddingBottom: 14, paddingRight: 8 },
  tile: { alignItems: 'center', width: 62 },
  tileIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 16 },
  nameIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  input: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  card: { borderRadius: 18, padding: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14 },
  notice: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14 },
  confirmBox: { marginTop: 10, padding: 12, borderRadius: 14 },
  deleteLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginTop: 4 },
});
