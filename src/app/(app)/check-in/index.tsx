import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React, { useMemo, useRef, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { StyleSheet, Text, TextInput, type AccessibilityActionEvent, View } from 'react-native';
import { Link, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import type { DailyCheckInRecord } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { classifyLocalInput } from '../../../domain/ai/localClassifier';
import { ProductExperience } from '../../../theme/tokens';
import { PressableScale } from '../../../components/ui/PressableScale';

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
const INTENSITIES = [
  { value: 'rest', label: 'Rest day' },
  { value: 'light', label: 'Something light' },
  { value: 'regular', label: 'My usual' },
] as const;

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
  const [intensity, setIntensity] = useState<DailyCheckInRecord['intensity']>(existing?.intensity);

  const signal = useMemo(() => (note.trim().length > 3 ? classifyLocalInput({ text: note }) : null), [note]);

  const save = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    updateTodayMetrics(energy, mood, stress, sleep);
    addCheckIn({ date, energy, mood, stress, sleepHours: sleep, symptoms, notes: note.trim() || undefined, intensity });
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
        <Scale kind="energy" {...SCALES.energy} value={energy} onChange={setEnergy} />
      </Card>
      <Card style={styles.card}>
        <Scale kind="mood" {...SCALES.mood} value={mood} onChange={setMood} />
      </Card>
      <Card style={styles.card}>
        <Scale kind="stress" {...SCALES.stress} value={stress} onChange={setStress} />
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

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.xs }]}>
        How much do you want to do today?
      </Text>
      <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>
        Optional. Today&apos;s quests follow your choice.
      </Text>
      <View style={styles.chips}>
        {INTENSITIES.map((i) => (
          <Chip key={i.value} label={i.label} selected={intensity === i.value} onPress={() => setIntensity(intensity === i.value ? undefined : i.value)} />
        ))}
      </View>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
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
          <Link href={'/(app)/safety/urgent-support' as Href} asChild>
            <Button label="Get support now" size="sm" style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }} />
          </Link>
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

const WORDS: Record<keyof typeof SCALES, string[]> = {
  energy: ['Empty', 'Drained', 'Tired', 'Low', 'Okay', 'Fine', 'Good', 'Lively', 'Strong', 'Full of energy'],
  mood: ['Very low', 'Low', 'Down', 'Flat', 'Okay', 'Fine', 'Good', 'Bright', 'Happy', 'Great'],
  stress: ['Calm', 'Relaxed', 'Easy', 'A little tense', 'Some pressure', 'Tense', 'Stressed', 'Strained', 'Overloaded', 'Very stressed'],
};

/**
 * 1–10 scale. Swipe along it (or tap a segment) to set it; each step clicks with a light
 * haptic. Screen readers can increase or decrease it.
 */
const SCALE_ICONS: Record<keyof typeof SCALES, keyof typeof Ionicons.glyphMap> = {
  energy: 'flash-outline',
  mood: 'happy-outline',
  stress: 'pulse-outline',
};

/**
 * 1–10 interactive scale with smooth swipe/drag gesture, tactile haptic ticks,
 * visual fill, and discrete tap targets.
 */
function Scale({
  kind,
  label,
  low,
  high,
  value,
  onChange,
}: {
  kind: keyof typeof SCALES;
  label: string;
  low: string;
  high: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const { colors, typography, spacing } = useTheme();
  const trackWidth = useRef(0);
  const lastVal = useRef(value);
  lastVal.current = value;

  const updateFromPosition = (x: number) => {
    if (trackWidth.current <= 0) return;
    const clampedX = Math.max(0, Math.min(trackWidth.current, x));
    const step = Math.min(10, Math.max(1, Math.round((clampedX / trackWidth.current) * 9) + 1));
    if (step !== lastVal.current) {
      lastVal.current = step;
      try {
        Haptics.selectionAsync();
      } catch {}
      onChange(step);
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-5, 5])
    .failOffsetY([-25, 25])
    .runOnJS(true)
    .onBegin((e) => updateFromPosition(e.x))
    .onUpdate((e) => updateFromPosition(e.x));

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd((e) => updateFromPosition(e.x));

  const combinedGesture = Gesture.Race(panGesture, tapGesture);

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: 10, now: value, text: `${value} of 10, ${WORDS[kind][value - 1]}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e: AccessibilityActionEvent) => {
        const next = Math.max(1, Math.min(10, value + (e.nativeEvent.actionName === 'increment' ? 1 : -1)));
        onChange(next);
      }}
    >
      <View style={styles.rowBetween}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name={SCALE_ICONS[kind]} size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{label}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <PressableScale
            hitSlop={8}
            onPress={() => {
              if (value > 1) {
                try { Haptics.selectionAsync(); } catch {}
                onChange(value - 1);
              }
            }}
            style={[styles.miniStep, { backgroundColor: colors.surface1, marginRight: 8 }]}
            accessibilityLabel={`Decrease ${label}`}
          >
            <Ionicons name="remove" size={14} color={colors.text.primary} />
          </PressableScale>
          <Text style={[typography.subheading, { color: colors.primary, minWidth: 84, textAlign: 'center' }]}>
            {WORDS[kind][value - 1]} · {value}
          </Text>
          <PressableScale
            hitSlop={8}
            onPress={() => {
              if (value < 10) {
                try { Haptics.selectionAsync(); } catch {}
                onChange(value + 1);
              }
            }}
            style={[styles.miniStep, { backgroundColor: colors.surface1, marginLeft: 8 }]}
            accessibilityLabel={`Increase ${label}`}
          >
            <Ionicons name="add" size={14} color={colors.text.primary} />
          </PressableScale>
        </View>
      </View>

      <GestureDetector gesture={combinedGesture}>
        <View
          style={[styles.scaleTrackContainer, { marginTop: spacing.sm }]}
          onLayout={(e) => {
            trackWidth.current = e.nativeEvent.layout.width;
          }}
        >
          <View style={styles.scale}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
              const active = n <= value;
              const isThumb = n === value;
              return (
                <View
                  key={n}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: active ? colors.primary : colors.surface1,
                      opacity: active ? 0.6 + n * 0.04 : 0.8,
                      transform: isThumb ? [{ scaleY: 1.15 }] : undefined,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </GestureDetector>

      <View style={[styles.rowBetween, { marginTop: 6 }]}>
        <Text style={[typography.caption, { color: colors.text.muted }]}>{low}</Text>
        <Text style={[typography.caption, { color: colors.primary, opacity: 0.8 }]}>Swipe or tap along bar</Text>
        <Text style={[typography.caption, { color: colors.text.muted }]}>{high}</Text>
      </View>
    </View>
  );
}

function StepButton({ icon, label, onPress }: { icon: 'add' | 'remove'; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.stepBtn, { backgroundColor: colors.surface1 }]}>
      <Ionicons name={icon} size={20} color={colors.text.primary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scaleTrackContainer: { paddingVertical: 6, justifyContent: 'center' },
  scale: { flexDirection: 'row', gap: 4, height: 42, alignItems: 'center' },
  segment: { flex: 1, height: 36, borderRadius: 8 },
  miniStep: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  note: { minHeight: 96, borderRadius: 16, padding: 12, textAlignVertical: 'top' },
});
