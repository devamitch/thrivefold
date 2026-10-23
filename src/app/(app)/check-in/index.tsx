import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type AccessibilityActionEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { classifyLocalInput } from '../../../domain/ai/localClassifier';
import { ProductExperience } from '../../../theme/tokens';

const SYMPTOMS_BY_EXPERIENCE: Record<ProductExperience, string[]> = {
  women_health: ['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Breast tenderness', 'Acne', 'Back pain', 'Nausea', 'Calm mood', 'High energy'],
  men_health: ['Muscle soreness', 'Lower back strain', 'Joint stiffness', 'Headache', 'Fatigue', 'Restless', 'Calm mood', 'High focus'],
  pride_wellbeing: ['Tension', 'Headache', 'Fatigue', 'Chest or posture strain', 'Lower back pain', 'Bloating', 'Calm mood', 'Body ease'],
};

const SCALES = {
  energy: { label: 'Energy', low: 'Drained', high: 'Full of energy' },
  mood: { label: 'Mood', low: 'Low', high: 'Great' },
  stress: { label: 'Stress', low: 'Calm', high: 'Very stressed' },
} as const;

const SLEEP_PRESETS = [5, 6, 7, 8, 9];

/** Daily check-in: four quick ratings, optional symptoms and a private note. One per day. */
export default function CheckInScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { experience, history, addCheckIn, updateTodayMetrics, showToast } = useRootStore(
    useShallow((s) => ({
      experience: s.experience,
      history: s.checkInHistory,
      addCheckIn: s.addCheckIn,
      updateTodayMetrics: s.updateTodayMetrics,
      showToast: s.showToast,
    })),
  );
  const date = formatLocalDate(new Date());
  const existing = history.find((c) => c.date === date);

  // Start from today's saved values, otherwise a neutral middle; nothing is saved until "Save".
  const [energy, setEnergy] = useState(existing?.energy ?? 5);
  const [mood, setMood] = useState(existing?.mood ?? 5);
  const [stress, setStress] = useState(existing?.stress ?? 5);
  const [sleep, setSleep] = useState(existing?.sleepHours ?? 7);
  const [symptoms, setSymptoms] = useState<string[]>(existing?.symptoms ?? []);
  const [note, setNote] = useState(existing?.notes ?? '');

  const signal = useMemo(() => (note.trim().length > 3 ? classifyLocalInput({ text: note }) : null), [note]);

  const save = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    updateTodayMetrics(energy, mood, stress, sleep);
    addCheckIn({ date, energy, mood, stress, sleepHours: sleep, symptoms, notes: note.trim() || undefined });
    showToast({ type: 'success', title: existing ? 'Check-in updated' : 'Check-in saved', message: 'Saved on this device.' });
    router.back();
  };

  return (
    <ScreenContainer
      header={<AppHeader title="Check in" subtitle={existing ? 'Update today’s check-in' : 'About a minute. Everything stays on this phone.'} showBack />}
      scrollMode="shell-scroll-view"
      footer={<Button label={existing ? 'Update check-in' : 'Save check-in'} size="lg" onPress={save} />}
    >
      <Card style={styles.card}>
        <Scale {...SCALES.energy} value={energy} onChange={setEnergy} />
      </Card>
      <Card style={styles.card}>
        <Scale {...SCALES.mood} value={mood} onChange={setMood} />
      </Card>
      <Card style={styles.card}>
        <Scale {...SCALES.stress} value={stress} onChange={setStress} />
      </Card>

      <Card style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Sleep last night</Text>
          <Text style={[typography.subheading, { color: colors.primary }]}>{sleep}h</Text>
        </View>
        <View style={[styles.chips, { marginTop: spacing.sm }]}>
          {SLEEP_PRESETS.map((h) => (
            <Chip key={h} label={`${h}h`} selected={sleep === h} onPress={() => setSleep(h)} />
          ))}
        </View>
        <View style={[styles.stepper, { marginTop: spacing.sm }]}>
          <StepButton icon="remove" label="Half an hour less" onPress={() => setSleep((v) => Math.max(0, v - 0.5))} />
          <Text style={[typography.caption, { color: colors.text.secondary }]}>Adjust by 30 minutes</Text>
          <StepButton icon="add" label="Half an hour more" onPress={() => setSleep((v) => Math.min(16, v + 0.5))} />
        </View>
      </Card>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.sm }]}>
        Anything you noticed?
      </Text>
      <View style={styles.chips}>
        {(SYMPTOMS_BY_EXPERIENCE[experience] ?? SYMPTOMS_BY_EXPERIENCE.men_health).map((sym) => (
          <Chip
            key={sym}
            label={sym}
            selected={symptoms.includes(sym)}
            onPress={() => setSymptoms((cur) => (cur.includes(sym) ? cur.filter((x) => x !== sym) : [...cur, sym]))}
          />
        ))}
      </View>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
        A private note (optional)
      </Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Anything on your mind today"
        placeholderTextColor={colors.text.muted}
        multiline
        maxLength={500}
        accessibilityLabel="Private note"
        style={[styles.note, typography.body, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.border }]}
      />

      {signal?.isCrisisAlert ? (
        <Card variant="tinted" style={{ marginTop: spacing.md, padding: spacing.base }}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>You don&apos;t have to handle this alone</Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
            If you might be in danger, contact local emergency services now. Support lines are one tap away.
          </Text>
          <Button label="Get support now" size="sm" onPress={() => router.push('/(app)/safety/urgent-support')} style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }} />
        </Card>
      ) : signal && signal.intensitySuggestion === 'rest' ? (
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.sm }]}>
          Sounds like a heavy day. A lighter routine or rest is a fine choice.
        </Text>
      ) : null}

      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>
        Not medical advice. Notes never leave this device.
      </Text>
    </ScreenContainer>
  );
}

/** Tap-to-set 1–10 scale; screen readers can increase or decrease it. */
function Scale({ label, low, high, value, onChange }: { label: string; low: string; high: string; value: number; onChange: (v: number) => void }) {
  const { colors, typography, spacing } = useTheme();
  const set = (v: number) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    onChange(Math.max(1, Math.min(10, v)));
  };
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: 10, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e: AccessibilityActionEvent) => set(value + (e.nativeEvent.actionName === 'increment' ? 1 : -1))}
    >
      <View style={styles.rowBetween}>
        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{label}</Text>
        <Text style={[typography.subheading, { color: colors.primary }]}>{value}/10</Text>
      </View>
      <View style={[styles.scale, { marginTop: spacing.sm }]}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <Pressable
            key={n}
            onPress={() => set(n)}
            hitSlop={{ top: 8, bottom: 8 }}
            style={[styles.segment, { backgroundColor: n <= value ? colors.primary : colors.surface1 }]}
          />
        ))}
      </View>
      <View style={[styles.rowBetween, { marginTop: 6 }]}>
        <Text style={[typography.caption, { color: colors.text.muted }]}>{low}</Text>
        <Text style={[typography.caption, { color: colors.text.muted }]}>{high}</Text>
      </View>
    </View>
  );
}

function StepButton({ icon, label, onPress }: { icon: 'add' | 'remove'; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.stepBtn, { backgroundColor: colors.surface1 }]}>
      <Ionicons name={icon} size={20} color={colors.text.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scale: { flexDirection: 'row', gap: 4, height: 32 },
  segment: { flex: 1, borderRadius: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  note: { minHeight: 96, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 12, textAlignVertical: 'top' },
});
