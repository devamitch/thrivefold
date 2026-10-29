import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CameraCapture } from '../../../components/camera/CameraCapture';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import {
  readDocument,
  timeFromTiming,
  type DietChartResult,
  type DocKind,
  type PrescriptionResult,
  type WorkoutPlanResult,
} from '../../../services/documents/docReader';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const KINDS: {
  kind: DocKind;
  title: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    kind: 'prescription',
    title: 'Prescription',
    sub: 'Add the medicines and reminders it lists',
    icon: 'medkit-outline',
  },
  {
    kind: 'diet_chart',
    title: "Dietitian's food chart",
    sub: 'Keep your meal plan in the app',
    icon: 'restaurant-outline',
  },
  {
    kind: 'workout_plan',
    title: "Trainer's workout plan",
    sub: 'Keep your training days in the app',
    icon: 'barbell-outline',
  },
];

/**
 * Photograph a prescription, a dietitian's chart or a trainer's plan; the text is read and shown
 * for you to check, and only what you confirm is saved. The photo itself is not kept.
 */
export default function DocumentsScreen() {
  const { colors, typography, spacing } = useTheme();
  const { addMedication, addFollowUp, addCarePlan, carePlans, deleteCarePlan, setRemindersOn } = useRootStore(
    useShallow((s) => ({
      addMedication: s.addMedication,
      addFollowUp: s.addFollowUp,
      addCarePlan: s.addCarePlan,
      carePlans: s.carePlans,
      deleteCarePlan: s.deleteCarePlan,
      setRemindersOn: s.setMedicationRemindersOn,
    })),
  );
  const [kind, setKind] = useState<DocKind | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [chosen, setChosen] = useState<number[]>([]);
  const [saved, setSaved] = useState<string | null>(null);

  const pick = async (k: DocKind, source: 'camera' | 'gallery') => {
    setError(null);
    setSaved(null);
    setResult(null);
    setKind(k);
    if (source === 'camera') {
      setCam(k);
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Permission was not given.');
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (r.canceled || !r.assets[0]) return;
    await read(k, r.assets[0].uri);
  };

  const [cam, setCam] = useState<DocKind | null>(null);
  const read = async (k: DocKind, uri: string) => {
    setKind(k);
    setBusy(true);
    try {
      const res = await readDocument(uri, k);
      setResult(res);
      if (k === 'prescription')
        setChosen(
          ((res as PrescriptionResult).medicines ?? []).map((m, i) => (m.unclear ? -1 : i)).filter((i) => i >= 0),
        );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the photo.');
    } finally {
      setBusy(false);
    }
  };

  const savePrescription = () => {
    const p = result as PrescriptionResult;
    let n = 0;
    chosen.forEach((i) => {
      const m = p.medicines[i];
      if (!m) return;
      const times = timeFromTiming(m.timing, m.frequency);
      const dose = [m.strength, m.dose, m.duration ? `for ${m.duration}` : null].filter(Boolean).join(' · ');
      (times.length ? times : ['08:00']).forEach((time) => {
        addMedication({
          name: m.name.slice(0, 60),
          dose: dose.slice(0, 80),
          time,
        });
        n += 1;
      });
    });
    if (n) setRemindersOn(true);
    setSaved(
      `${n} medicine time${n === 1 ? '' : 's'} added to Medications with reminders. Check each time matches what your doctor said.`,
    );
    setResult(null);
  };

  const savePlan = () => {
    if (kind !== 'diet_chart' && kind !== 'workout_plan') return;
    const r = result as DietChartResult | WorkoutPlanResult;
    addCarePlan({ kind, by: r.by ?? null, data: r });
    setSaved('Plan saved below.');
    setResult(null);
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="HEALTH"
          title="Documents"
          subtitle="Prescriptions, diet charts and workout plans"
          showBack
        />
      }
    >
      {KINDS.map((k) => (
        <Card key={k.kind} style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: colors.primaryAlpha }]}>
              <Ionicons name={k.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{k.title}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>{k.sub}</Text>
            </View>
          </View>
          <View style={styles.chips}>
            <Chip label="Take a photo" onPress={() => void pick(k.kind, 'camera')} />
            <Chip label="From gallery" onPress={() => void pick(k.kind, 'gallery')} />
          </View>
        </Card>
      ))}

      {busy ? <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} /> : null}
      {error ? <Text style={[typography.caption, { color: colors.error, marginTop: 10 }]}>{error}</Text> : null}
      {saved ? <Text style={[typography.caption, { color: colors.success, marginTop: 10 }]}>{saved}</Text> : null}

      {kind === 'prescription' && result ? (
        <Card style={styles.card}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Check what was read</Text>
          {(result as PrescriptionResult).doctor ? (
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {(result as PrescriptionResult).doctor}
            </Text>
          ) : null}
          {((result as PrescriptionResult).medicines ?? []).map((m, i) => {
            const on = chosen.includes(i);
            return (
              <PressableScale
                key={i}
                onPress={() => setChosen((c) => (on ? c.filter((x) => x !== i) : [...c, i]))}
                style={[styles.line, { borderTopColor: colors.surface1 }]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
              >
                <Ionicons
                  name={on ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={on ? colors.primary : colors.text.muted}
                />
                <View style={styles.flex}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    {m.name} {m.strength ?? ''}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    {[m.form, m.dose, m.frequency, m.timing, m.duration].filter(Boolean).join(' · ') ||
                      'No dosing written'}
                  </Text>
                  {m.unclear ? (
                    <Text style={[typography.caption, { color: colors.warning }]}>
                      Hard to read; check with your doctor or pharmacist.
                    </Text>
                  ) : null}
                </View>
              </PressableScale>
            );
          })}
          {(result as PrescriptionResult).followUp ? (
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 8 }]}>
              Follow-up: {(result as PrescriptionResult).followUp}
            </Text>
          ) : null}
          <Button
            label="Add selected to Medications"
            onPress={savePrescription}
            disabled={chosen.length === 0}
            style={{ marginTop: 12 }}
          />
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
            Read from your photo by AI and may contain mistakes. Thrivefold never changes a dose; follow your doctor and
            pharmacist.
          </Text>
          {(result as PrescriptionResult).followUp ? (
            <Button
              label="Add the follow-up as a reminder"
              variant="ghost"
              onPress={() => {
                const d = new Date();
                d.setDate(d.getDate() + 7);
                addFollowUp({
                  date: d.toISOString().slice(0, 10),
                  time: null,
                  with: (result as PrescriptionResult).doctor ?? 'Doctor',
                  note: (result as PrescriptionResult).followUp ?? null,
                });
                setSaved('Follow-up added in a week; change the date in Medications if needed.');
              }}
              style={{ alignSelf: 'flex-start' }}
            />
          ) : null}
        </Card>
      ) : null}

      {(kind === 'diet_chart' || kind === 'workout_plan') && result ? (
        <Card style={styles.card}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Check what was read</Text>
          <PlanView kind={kind} data={result} />
          <Button label="Save plan" onPress={savePlan} style={{ marginTop: 12 }} />
        </Card>
      ) : null}

      {carePlans.length ? (
        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg }]}>Saved plans</Text>
      ) : null}
      {carePlans.map((p) => (
        <Card key={p.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>
              {p.kind === 'diet_chart' ? 'Food chart' : 'Workout plan'}
              {p.by ? ` · ${p.by}` : ''}
            </Text>
            <Ionicons
              name="trash-outline"
              size={18}
              color={colors.text.muted}
              onPress={() => deleteCarePlan(p.id)}
              accessibilityLabel="Delete plan"
            />
          </View>
          <PlanView kind={p.kind} data={p.data} />
        </Card>
      ))}
      <CameraCapture
        visible={cam !== null}
        onClose={() => setCam(null)}
        guide="document"
        title="Photograph the page"
        hint="Fit the whole page inside the frame, flat and well lit"
        onPhoto={(uri) => {
          const k = cam;
          setCam(null);
          if (k) void read(k, uri);
        }}
      />
    </ScreenContainer>
  );
}

function PlanView({ kind, data }: { kind: 'diet_chart' | 'workout_plan'; data: unknown }) {
  const { colors, typography } = useTheme();
  if (kind === 'diet_chart') {
    const d = data as DietChartResult;
    return (
      <View>
        {(d.meals ?? []).map((m, i) => (
          <Text key={i} style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
            <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
              {[m.time, m.label].filter(Boolean).join(' · ')}:{' '}
            </Text>
            {m.items.join(', ')}
          </Text>
        ))}
        {d.avoid?.length ? (
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
            Avoid: {d.avoid.join(', ')}
          </Text>
        ) : null}
      </View>
    );
  }
  const w = data as WorkoutPlanResult;
  return (
    <View>
      {(w.days ?? []).map((d, i) => (
        <View key={i} style={{ marginTop: 6 }}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{d.day}</Text>
          {d.exercises.map((e, j) => (
            <Text key={j} style={[typography.caption, { color: colors.text.secondary }]}>
              {e.name}
              {[e.sets && `${e.sets} sets`, e.reps && `${e.reps} reps`, e.load, e.rest && `rest ${e.rest}`]
                .filter(Boolean)
                .map((x) => ` · ${x}`)
                .join('')}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
