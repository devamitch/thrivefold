import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { LocalAI } from '../../../../modules/local-ai';
import { analyzePortrait, portraitVisionAvailable } from '../../../../modules/pose-landmarker/portrait';
import { AppHeader } from '../../../components/ui/AppHeader';
import { BetaBadge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { TextField } from '../../../components/ui/TextField';
import {
  analyseBody,
  analyseColours,
  analyseFace,
  analysePosture,
  bodyNumbers,
  type BodyResult,
  type ColourResult,
  type FaceResult,
  type PostureResult,
} from '../../../domain/vision/portrait';
import { coachVoice } from '../../../services/ai/coachVoice';
import { recordBetaSession } from '../../../services/beta/recordSession';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';
import { BetaHero } from '../../../components/beta/BetaHero';

const SHAPE_LABEL: Record<FaceResult['shape'], string> = {
  oval: 'Oval', round: 'Round', square: 'Square', heart: 'Heart', oblong: 'Long (oblong)', diamond: 'Diamond',
};
const BMI_LABEL = { below: 'Below the usual range', healthy: 'In the usual range', above: 'Above the usual range', well_above: 'Well above the usual range' } as const;

type Source = 'camera_front' | 'camera_back' | 'gallery';

async function pickPhoto(source: Source): Promise<string | null> {
  if (source === 'gallery') {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return null;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    return r.canceled ? null : (r.assets[0]?.uri ?? null);
  }
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const r = await ImagePicker.launchCameraAsync({
    quality: 0.9,
    cameraType: source === 'camera_front' ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
  });
  return r.canceled ? null : (r.assets[0]?.uri ?? null);
}

const rgb = (c: [number, number, number]) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

/**
 * Body & Style Companion: face shape and glasses, posture, body proportions for fit, outfit
 * colours, and body numbers (BMI, energy, protein, water), all measured on this phone.
 */
export default function BodyStyleScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { heightCm, weightKg, setHeightCm, setWeightKg } = useRootStore(
    useShallow((s) => ({ heightCm: s.heightCm, weightKg: s.weightKg, setHeightCm: s.setHeightCm, setWeightKg: s.setWeightKg })),
  );
  const available = portraitVisionAvailable();

  const [busy, setBusy] = useState<'face' | 'body' | 'plan' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [face, setFace] = useState<FaceResult | null>(null);
  const [body, setBody] = useState<BodyResult | null>(null);
  const [posture, setPosture] = useState<PostureResult | null>(null);
  const [outfit, setOutfit] = useState<{ result: ColourResult; top: [number, number, number]; bottom: [number, number, number] } | null>(null);
  const [h, setH] = useState(heightCm ? String(heightCm) : '');
  const [w, setW] = useState(weightKg ? String(weightKg) : '');
  const [age, setAge] = useState('');
  const [formula, setFormula] = useState<'female' | 'male' | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  const numbers = bodyNumbers(Number(h), Number(w), age ? Number(age) : null, formula);

  const runFace = async (source: Source) => {
    setError(null);
    const uri = await pickPhoto(source);
    if (!uri) return;
    setBusy('face');
    try {
      const a = await analyzePortrait(uri);
      const r = a.face.length ? analyseFace(a.face, a.width, a.height) : null;
      setFace(r);
      if (!r) setError('No clear face found. Use a front-facing photo in even light, face filling about a third of the frame.');
      else void coachVoice.speak(`Your face reads as ${SHAPE_LABEL[r.shape]}. ${r.frames[0]}.`, { priority: 3, maxMs: 10_000 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not analyse the photo');
    } finally {
      setBusy(null);
    }
  };

  const runBody = async (source: Source) => {
    setError(null);
    const uri = await pickPhoto(source);
    if (!uri) return;
    setBusy('body');
    try {
      const a = await analyzePortrait(uri);
      const p = analysePosture(a.pose, a.width, a.height);
      const b = analyseBody(a.segmentation.widths ?? [], a.pose);
      const top = a.segmentation.clothesTop ?? null;
      const bottom = a.segmentation.clothesBottom ?? null;
      const c = analyseColours(top, bottom);
      setPosture(p);
      setBody(b);
      setOutfit(c && top && bottom ? { result: c, top, bottom } : null);
      if (!p && !b) {
        setError('No full body found. Stand about two metres away, head to feet in the frame, facing the camera.');
        return;
      }
      void coachVoice.speak(
        [p ? `Posture score ${p.score}. ${p.notes[0]}` : '', c ? `Outfit colours: ${c.note}` : ''].filter(Boolean).join(' '),
        { priority: 3, maxMs: 14_000 },
      );
      recordBetaSession({
        kind: 'portrait_scan',
        startedAt: Date.now() - 1000,
        endedAt: Date.now(),
        metrics: { ...(p ? { postureScore: p.score } : {}), ...(c ? { colourScore: c.score } : {}) },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not analyse the photo');
    } finally {
      setBusy(null);
    }
  };

  const saveNumbers = () => {
    const hc = Number(h), wk = Number(w);
    if (hc >= 120 && hc <= 230) setHeightCm(Math.round(hc));
    if (wk >= 30 && wk <= 300) setWeightKg(Math.round(wk * 10) / 10);
  };

  const askPlan = async () => {
    if (!numbers) return;
    if (!LocalAI.isLoaded()) {
      setPlan('To write a meal plan on this phone, load an on-device model first. Your targets above already work with the meal log.');
      return;
    }
    setBusy('plan');
    try {
      const target = numbers.energy ? `${numbers.energy.low}-${numbers.energy.high} kcal` : 'a balanced amount of energy';
      const text = await LocalAI.generateText({
        system: 'You are a friendly nutrition coach. Write a simple one-day meal plan in plain lines: breakfast, lunch, snack, dinner. No medical claims, no supplements.',
        prompt: `Plan one day of everyday home meals for about ${target} with ${numbers.proteinG.low}-${numbers.proteinG.high} g protein and ${numbers.waterL} L of water.`,
      });
      setPlan(text.trim() || 'The model returned nothing; try again.');
    } catch {
      setPlan('The on-device model could not write a plan just now.');
    } finally {
      setBusy(null);
    }
  };

  const PhotoButtons = ({ onPick, front }: { onPick: (s: Source) => void; front: boolean }) => (
    <View style={styles.row}>
      <Chip label={front ? 'Take a selfie' : 'Take a photo'} onPress={() => onPick(front ? 'camera_front' : 'camera_back')} />
      <Chip label="Choose from gallery" onPress={() => onPick('gallery')} />
    </View>
  );

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow="BETA LAB · ON-DEVICE COMPANION"
        title="Body & Style"
        subtitle="Face shape and glasses, posture, fit, outfit colours and body numbers"
        showBack
        onBack={() => router.back()}
        rightAction={<BetaBadge />}
      />
      <ScreenScrollView contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl * 2 }}>
        <BetaHero source={require('../../../../assets/illustrations/workout-strength.jpg')} label="Body and style" />
        <Text style={[typography.caption, { color: colors.text.muted }]}>
          Photos are analysed on this phone and not saved or sent. Results are estimates from one photo. Thrivefold never
          rates how anyone looks.
        </Text>
        {!available ? (
          <Text style={[typography.caption, { color: colors.error, marginTop: 8 }]}>Photo analysis is not available in this build.</Text>
        ) : null}
        {error ? <Text style={[typography.caption, { color: colors.error, marginTop: 8 }]}>{error}</Text> : null}

        <Card style={styles.card}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Face shape and glasses</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>Look straight at the camera, hair off your face.</Text>
          <PhotoButtons onPick={runFace} front />
          {busy === 'face' ? <ActivityIndicator color={colors.primary} style={styles.spin} /> : null}
          {face ? (
            <View style={{ marginTop: spacing.sm }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{SHAPE_LABEL[face.shape]} face</Text>
              {face.frames.map((f) => (
                <Text key={f} style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>• {f}</Text>
              ))}
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>Less suited: {face.avoid}</Text>
              {face.pdMm ? (
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
                  Estimated pupil distance ≈ {face.pdMm} mm (±3 mm). Have an optician measure it before ordering lenses.
                </Text>
              ) : null}
            </View>
          ) : null}
        </Card>

        <Card style={styles.card}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Posture, fit and outfit</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            A full-length front photo, about two metres away, arms slightly away from your sides.
          </Text>
          <PhotoButtons onPick={runBody} front={false} />
          {busy === 'body' ? <ActivityIndicator color={colors.primary} style={styles.spin} /> : null}
          {posture ? (
            <View style={styles.result}>
              <View style={styles.scoreRow}>
                <Text style={[styles.score, { color: colors.primary }]}>{posture.score}</Text>
                <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>Posture from the front</Text>
              </View>
              {posture.notes.map((n) => (
                <Text key={n} style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}>• {n}</Text>
              ))}
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
                Shoulders tilt {posture.shoulderTiltDeg}°, hips {posture.hipTiltDeg}°.
              </Text>
            </View>
          ) : null}
          {outfit ? (
            <View style={styles.result}>
              <View style={styles.scoreRow}>
                <Text style={[styles.score, { color: colors.primary }]}>{outfit.result.score}</Text>
                <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>Outfit colour pairing</Text>
                <View style={[styles.swatch, { backgroundColor: rgb(outfit.top) }]} />
                <View style={[styles.swatch, { backgroundColor: rgb(outfit.bottom) }]} />
              </View>
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}>{outfit.result.note}</Text>
            </View>
          ) : null}
          {body ? (
            <View style={styles.result}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{body.label}</Text>
              {body.tips.map((t) => (
                <Text key={t} style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}>• {t}</Text>
              ))}
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
                From your outline in this photo; loose clothes change it. A fit guide, not a body judgement.
              </Text>
            </View>
          ) : null}
        </Card>

        <Card style={styles.card}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Body numbers and food</Text>
          <View style={styles.row}>
            <TextField label="Height (cm)" value={h} onChangeText={setH} keyboardType="numeric" containerStyle={styles.flex} onBlur={saveNumbers} />
            <TextField label="Weight (kg)" value={w} onChangeText={setW} keyboardType="numeric" containerStyle={styles.flex} onBlur={saveNumbers} />
            <TextField label="Age" value={age} onChangeText={setAge} keyboardType="numeric" containerStyle={styles.flex} />
          </View>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>Energy formula</Text>
          <View style={styles.row}>
            <Chip label="Female" selected={formula === 'female'} onPress={() => setFormula('female')} />
            <Chip label="Male" selected={formula === 'male'} onPress={() => setFormula('male')} />
            <Chip label="Show a range" selected={formula === null} onPress={() => setFormula(null)} />
          </View>
          {numbers ? (
            <View style={styles.result}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>BMI {numbers.bmi} · {BMI_LABEL[numbers.category]}</Text>
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                BMI ignores muscle and build, and healthy ranges differ between people; treat it as a rough guide.
              </Text>
              {numbers.energy ? (
                <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6 }]}>
                  Energy on a lightly active day ≈ {numbers.energy.low}–{numbers.energy.high} kcal
                </Text>
              ) : (
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>Add your age to estimate daily energy.</Text>
              )}
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}>
                Protein ≈ {numbers.proteinG.low}–{numbers.proteinG.high} g · Water ≈ {numbers.waterL} L a day
              </Text>
              <View style={styles.row}>
                <Chip label="Ask the coach for a day of meals" onPress={() => void askPlan()} />
                <Chip label="Open nutrition" onPress={() => router.push('/(app)/health/nutrition' as Href)} />
              </View>
              {busy === 'plan' ? <ActivityIndicator color={colors.primary} style={styles.spin} /> : null}
              {plan ? <Text style={[typography.subbody, { color: colors.text.primary, marginTop: 8 }]}>{plan}</Text> : null}
            </View>
          ) : (
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>Enter height and weight to see your numbers.</Text>
          )}
        </Card>

        <PressableScale onPress={() => router.push('/(app)/beta-lab/face-exercises' as Href)} style={[styles.link, { backgroundColor: colors.surface }]}>
          <Ionicons name="happy-outline" size={18} color={colors.primary} />
          <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>Face & eye exercises</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
        </PressableScale>
      </ScreenScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginTop: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  spin: { marginTop: 10, alignSelf: 'flex-start' },
  result: { marginTop: 12 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  score: { fontSize: 28, lineHeight: 32, fontWeight: '800' },
  swatch: { width: 22, height: 22, borderRadius: 11 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16, marginTop: 12 },
});
