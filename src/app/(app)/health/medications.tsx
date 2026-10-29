import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { useRouter, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { PressableScale } from '../../../components/ui/PressableScale';
import { DatePickerModal } from '../../../components/ui/DatePickerModal';
import { syncCareReminders } from '../../../services/notifications/careReminders';

const isTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

/** Private list of what the person takes, with today's taken/not-taken marks. */
export default function MedicationsScreen() {
  const { colors, typography, spacing } = useTheme();
  const { medications, taken, addMedication, deleteMedication, toggleMedicationTaken, showAlert, remindersOn, setRemindersOn, followUps, addFollowUp, deleteFollowUp } = useRootStore(
    useShallow((s) => ({
      remindersOn: s.medicationRemindersOn,
      setRemindersOn: s.setMedicationRemindersOn,
      followUps: s.followUps,
      addFollowUp: s.addFollowUp,
      deleteFollowUp: s.deleteFollowUp,
      medications: s.medications,
      taken: s.medicationTaken,
      addMedication: s.addMedication,
      deleteMedication: s.deleteMedication,
      toggleMedicationTaken: s.toggleMedicationTaken,
      showAlert: s.showAlert,
    })),
  );
  const router = useRouter();
  const today = formatLocalDate(new Date());
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [time, setTime] = useState('08:00');
  const valid = name.trim().length > 1 && isTime(time);
  const [fuWith, setFuWith] = useState('');
  const [fuDate, setFuDate] = useState('');
  const [fuTime, setFuTime] = useState('');
  const [fuNote, setFuNote] = useState('');
  const [fuPicker, setFuPicker] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Keep the scheduled reminders in step with the lists.
  useEffect(() => {
    void syncCareReminders(medications, remindersOn, followUps).then((ok) => setPermissionDenied(!ok));
  }, [medications, remindersOn, followUps]);

  const save = () => {
    if (!valid) return;
    addMedication({ name: name.trim(), dose: dose.trim(), time });
    setName('');
    setDose('');
    setTime('08:00');
    setAdding(false);
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Medications" subtitle="Your own list, kept on this device" showBack />
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        <Card variant="surface1" style={{ marginBottom: spacing.md }}>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            Thrivefold only records what you enter. It never recommends, doses or changes a medication or supplement.
            Ask your clinician or pharmacist about any change.
          </Text>
        </Card>

        <View style={styles.row}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Today</Text>
          {!adding ? <Button label="Add" variant="outline" size="sm" onPress={() => setAdding(true)} /> : null}
        </View>

        {adding ? (
          <Card style={{ marginTop: spacing.sm }}>
            <TextField label="Name" value={name} onChangeText={setName} placeholder="As written on the label" />
            <TextField label="Dose (optional)" value={dose} onChangeText={setDose} placeholder="e.g. 1 tablet" containerStyle={{ marginTop: spacing.sm }} />
            <TextField
              label="Time (24-hour)"
              value={time}
              onChangeText={setTime}
              placeholder="08:00"
              keyboardType="numbers-and-punctuation"
              error={time && !isTime(time) ? 'Use HH:MM, e.g. 21:30' : undefined}
              containerStyle={{ marginTop: spacing.sm }}
            />
            <View style={[styles.actions, { marginTop: spacing.md }]}>
              <Button label="Save" size="sm" disabled={!valid} onPress={save} />
              <Button label="Cancel" size="sm" variant="ghost" onPress={() => setAdding(false)} />
            </View>
          </Card>
        ) : null}

        {medications.length === 0 && !adding ? (
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
            Nothing added yet. Add anything you take regularly to tick it off each day.
          </Text>
        ) : null}

        {medications.map((m) => {
          const done = taken.includes(`${today}|${m.id}`);
          return (
            <Card key={m.id} style={{ marginTop: spacing.sm }}>
              <View style={styles.row}>
                <PressableScale
                  onPress={() => toggleMedicationTaken(m.id, today)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: done }}
                  accessibilityLabel={`${m.name} taken today`}
                  style={styles.main}
                >
                  <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={26} color={done ? colors.success : colors.text.muted} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{m.name}</Text>
                    <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                      {[m.dose, m.time].filter(Boolean).join(' · ')} · {done ? 'taken today' : 'not marked yet'}
                    </Text>
                  </View>
                </PressableScale>
                <PressableScale
                  onPress={() =>
                    showAlert({
                      title: `Remove ${m.name}?`,
                      message: 'It and its history are removed from this device.',
                      confirmText: 'Remove',
                      destructive: true,
                      onConfirm: () => deleteMedication(m.id),
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${m.name}`}
                  style={styles.iconBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.text.muted} />
                </PressableScale>
              </View>
            </Card>
          );
        })}

        <Card style={{ marginTop: spacing.lg }}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Remind me at these times</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>A daily notification for each medicine. Names stay hidden on the lock screen.</Text>
            </View>
            <Switch value={remindersOn} onValueChange={setRemindersOn} accessibilityLabel="Medicine reminders" />
          </View>
          {permissionDenied ? (
            <Text style={[typography.caption, { color: colors.error, marginTop: 6 }]}>Notifications are off for Thrivefold. Allow them in Android settings.</Text>
          ) : null}
        </Card>

        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>Doctor follow-ups</Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>You get a reminder the evening before and on the morning of each one.</Text>
        {followUps.map((f) => (
          <Card key={f.id} style={{ marginTop: spacing.sm }}>
            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={22} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{f.with}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  {new Date(`${f.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                  {f.time ? ` · ${f.time}` : ''}
                  {f.note ? ` · ${f.note}` : ''}
                </Text>
              </View>
              <PressableScale onPress={() => deleteFollowUp(f.id)} accessibilityLabel={`Remove follow-up with ${f.with}`} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.text.muted} />
              </PressableScale>
            </View>
          </Card>
        ))}
        <Card style={{ marginTop: spacing.sm }}>
          <TextField label="Doctor or clinic" value={fuWith} onChangeText={setFuWith} />
          <View style={[styles.actions, { marginTop: spacing.sm }]}>
            <Button label={fuDate ? new Date(`${fuDate}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'Pick date'} size="sm" variant="outline" onPress={() => setFuPicker(true)} />
            <TextField value={fuTime} onChangeText={setFuTime} placeholder="Time 10:30" containerStyle={{ flex: 1 }} />
          </View>
          <TextField label="Note (optional)" value={fuNote} onChangeText={setFuNote} containerStyle={{ marginTop: spacing.sm }} />
          <Button
            label="Add follow-up"
            size="sm"
            disabled={!fuWith.trim() || !fuDate || (!!fuTime && !isTime(fuTime))}
            onPress={() => {
              addFollowUp({ date: fuDate, time: fuTime && isTime(fuTime) ? fuTime : null, with: fuWith.trim().slice(0, 60), note: fuNote.trim().slice(0, 80) || null });
              setFuWith('');
              setFuDate('');
              setFuTime('');
              setFuNote('');
            }}
            style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
          />
        </Card>

        <Button
          label="Scan a prescription"
          variant="outline"
          onPress={() => router.push('/(app)/health/documents' as Href)}
          style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
        />
        <Button
          label="Order medicines online"
          variant="ghost"
          onPress={() => void Linking.openURL('market://search?q=online%20pharmacy%20medicine%20delivery&c=apps')}
          style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
        />
        <Text style={[typography.caption, { color: colors.text.muted }]}>Opens Google Play to choose a licensed pharmacy app. Thrivefold does not sell or prescribe medicines.</Text>
      </View>
      <DatePickerModal
        visible={fuPicker}
        value={fuDate || today}
        minDate={today}
        onChange={(d) => {
          setFuDate(d);
          setFuPicker(false);
        }}
        onClose={() => setFuPicker(false)}
        title="Follow-up date"
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  main: { flexDirection: 'row', alignItems: 'center', flex: 1, minHeight: 48 },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
