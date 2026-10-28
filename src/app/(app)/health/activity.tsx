import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { BetaBadge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { ACTIVITY_TYPES } from '../../../domain/fitness/workouts';
import { MET_BY_ACTIVITY, DEFAULT_WEIGHT_KG } from '../../../domain/activity/calories';
import { PressableScale } from '../../../components/ui/PressableScale';
import { useBetaEnabled } from '../../../hooks/useBetaEnabled';

const DISTANCE_TYPES = new Set(['Walking', 'Running', 'Treadmill', 'Walking pad', 'Cycling', 'Swimming', 'Rowing', 'Hiking']);

/** Log any activity done outside a plan: type, minutes, optional distance and effort, or run a live session. */
export default function ActivityLogScreen() {
  const { colors, typography, spacing } = useTheme();
  const betaMode = useBetaEnabled();
  const { logs, weightKg, addActivityLog, deleteActivityLog, showToast, showAlert } = useRootStore(
    useShallow((s) => ({
      logs: s.activityLogs,
      weightKg: s.weightKg,
      addActivityLog: s.addActivityLog,
      deleteActivityLog: s.deleteActivityLog,
      showToast: s.showToast,
      showAlert: s.showAlert,
    })),
  );
  const [type, setType] = useState<string | null>('Treadmill');
  const [minutes, setMinutes] = useState('');
  const [distance, setDistance] = useState('');
  const [effort, setEffort] = useState<number | null>(null);
  const [note, setNote] = useState('');

  // ── Live Session State ──
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sessionActive && !sessionPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionActive, sessionPaused]);

  const activeMet = type ? (MET_BY_ACTIVITY[type.toLowerCase()] ?? 4.0) : 4.0;
  const userKg = weightKg && weightKg > 20 && weightKg < 300 ? weightKg : DEFAULT_WEIGHT_KG;
  const liveBurnedKcal = Math.round(activeMet * userKg * (elapsedSeconds / 3600));

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    setElapsedSeconds(0);
    setSessionActive(true);
    setSessionPaused(false);
  };

  const handleFinishSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const completedMins = Math.max(1, Math.round(elapsedSeconds / 60));
    setMinutes(completedMins.toString());
    setSessionActive(false);
    setSessionPaused(false);
    showToast({
      type: 'success',
      title: 'Session complete',
      message: `${completedMins} min session recorded. Tap Save below to add to history.`,
    });
  };

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
      header={<AppHeader title="Activity & Workouts" subtitle="Live sessions, treadmill & sport logs" showBack />}
      scrollMode="shell-scroll-view"
      footer={<Button label="Save activity" size="lg" disabled={!valid} onPress={save} />}
    >
      {/* Live Activity Session Card */}
      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <View style={styles.liveHead}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <Ionicons name="timer-outline" size={20} color={colors.primary} />
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
              {sessionActive ? `Live: ${type ?? 'Activity'}` : 'Start Live Session'}
            </Text>
          </View>
          {betaMode ? <BetaBadge /> : null}
        </View>

        {sessionActive ? (
          <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
            <Text style={[typography.heading, { fontSize: 44, lineHeight: 52, color: colors.text.primary }]}>
              {formatTimer(elapsedSeconds)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                MET: {activeMet.toFixed(1)}
              </Text>
              <Text style={[typography.captionBold, { color: colors.primary }]}>
                ≈ {liveBurnedKcal} kcal burned
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: spacing.md }}>
              <Button
                variant="secondary"
                size="sm"
                label={sessionPaused ? 'Resume' : 'Pause'}
                icon={<Ionicons name={sessionPaused ? 'play' : 'pause'} size={16} color={colors.text.primary} />}
                onPress={() => setSessionPaused(!sessionPaused)}
              />
              <Button
                variant="primary"
                size="sm"
                label="Finish"
                icon={<Ionicons name="stop" size={16} color={colors.onPrimary} />}
                onPress={handleFinishSession}
              />
            </View>
          </View>
        ) : (
          <View style={{ marginTop: spacing.xs }}>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>
              Track live workout duration and real-time calorie burn for walking pad, treadmill, or outdoor exercise.
            </Text>
            <Button
              variant="secondary"
              label={`Start ${type ?? 'Workout'} Timer`}
              icon={<Ionicons name="play-circle-outline" size={18} color={colors.primary} />}
              onPress={handleStartSession}
            />
          </View>
        )}
      </Card>

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
  liveHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
