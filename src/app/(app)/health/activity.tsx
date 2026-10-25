import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { ACTIVITY_TYPES } from '../../../domain/fitness/workouts';
import { PressableScale } from '../../../components/ui/PressableScale';

const DISTANCE_TYPES = new Set(['Walking', 'Running', 'Cycling', 'Swimming', 'Rowing', 'Hiking']);

/** Log any activity done outside a plan: type, minutes, optional distance and effort. */
export default function ActivityLogScreen() {
  const { colors, typography, spacing } = useTheme();
  const { logs, addActivityLog, deleteActivityLog, showToast, showAlert } = useRootStore(
    useShallow((s) => ({
      logs: s.activityLogs,
      addActivityLog: s.addActivityLog,
      deleteActivityLog: s.deleteActivityLog,
      showToast: s.showToast,
      showAlert: s.showAlert,
    })),
  );
  const [type, setType] = useState<string | null>(null);
  const [minutes, setMinutes] = useState('');
  const [distance, setDistance] = useState('');
  const [effort, setEffort] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const mins = parseInt(minutes, 10);
  const km = parseFloat(distance.replace(',', '.'));
  const valid = Boolean(type) && Number.isFinite(mins) && mins > 0 && mins <= 1440;

  const save = () => {
    if (!valid || !type) return;
    addActivityLog({
      type,
      date: formatLocalDate(new Date()),
      minutes: mins,
      ...(DISTANCE_TYPES.has(type) && Number.isFinite(km) && km > 0 ? { distanceKm: Math.round(km * 100) / 100 } : {}),
      ...(effort ? { effort } : {}),
      ...(note.trim() ? { note: note.trim().slice(0, 200) } : {}),
    });
    showToast({ type: 'success', message: `${type} logged: ${mins} min.` });
    setType(null);
    setMinutes('');
    setDistance('');
    setEffort(null);
    setNote('');
  };

  return (
    <ScreenContainer
      header={<AppHeader title="Log activity" subtitle="Runs, rides, classes and sport" showBack />}
      scrollMode="shell-scroll-view"
      footer={<Button label="Save activity" size="lg" disabled={!valid} onPress={save} />}
    >
      <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>What did you do?</Text>
      <View style={styles.chips}>
        {ACTIVITY_TYPES.map((t) => (
          <Chip key={t} label={t} selected={type === t} onPress={() => setType(t)} />
        ))}
      </View>

      <TextField
        label="Minutes"
        value={minutes}
        onChangeText={(t) => setMinutes(t.replace(/[^0-9]/g, '').slice(0, 4))}
        keyboardType="number-pad"
        placeholder="e.g. 30"
        containerStyle={{ marginTop: spacing.lg }}
      />
      {type && DISTANCE_TYPES.has(type) ? (
        <TextField
          label="Distance in km (optional)"
          value={distance}
          onChangeText={(t) => setDistance(t.replace(/[^0-9.,]/g, '').slice(0, 6))}
          keyboardType="decimal-pad"
          placeholder="e.g. 5.2"
          containerStyle={{ marginTop: spacing.sm }}
        />
      ) : null}

      <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
        How hard was it? (optional)
      </Text>
      <View style={styles.chips}>
        {[2, 4, 6, 8, 10].map((n) => (
          <Chip key={n} label={`${n}/10`} selected={effort === n} onPress={() => setEffort(effort === n ? null : n)} />
        ))}
      </View>
      <TextField label="Note (optional)" value={note} onChangeText={setNote} maxLength={200} containerStyle={{ marginTop: spacing.lg }} />

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.sm }]}>Recent</Text>
      {logs.length === 0 ? (
        <Text style={[typography.subbody, { color: colors.text.secondary }]}>Nothing logged yet.</Text>
      ) : (
        logs.slice(0, 30).map((l) => (
          <Card key={l.id} style={{ padding: spacing.md, marginBottom: spacing.sm }}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{l.type}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  {new Date(`${l.date}T12:00:00`).toLocaleDateString()} · {l.minutes} min
                  {l.distanceKm ? ` · ${l.distanceKm} km` : ''}
                  {l.effort ? ` · effort ${l.effort}/10` : ''}
                </Text>
                {l.note ? <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>{l.note}</Text> : null}
              </View>
              <PressableScale
                onPress={() =>
                  showAlert({
                    title: 'Delete this activity?',
                    message: 'It will be removed from this device.',
                    confirmText: 'Delete',
                    destructive: true,
                    onConfirm: () => deleteActivityLog(l.id),
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`Delete ${l.type}`}
                style={styles.iconBtn}
              >
                <Ionicons name="trash-outline" size={18} color={colors.text.muted} />
              </PressableScale>
            </View>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
