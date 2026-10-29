import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PoseFrame } from '../../../../modules/pose-landmarker';
import { BetaSessionHistory } from '../../../components/beta/BetaSessionHistory';
import { BetaBadge } from '../../../components/ui/Badge';
import { PressableScale } from '../../../components/ui/PressableScale';
import {
  FACE_ROUTINE,
  averageMeasures,
  initialRep,
  measureFace,
  movement,
  stepRep,
  type FaceMeasures,
  type RepState,
} from '../../../domain/vision/faceExercises';
import { PoseDetectionAdapter } from '../../../features/beta-lab/experiments/pose-detection/PoseDetectionAdapter';
import { coachVoice } from '../../../services/ai/coachVoice';
import { recordBetaSession } from '../../../services/beta/recordSession';
import { hapticLight, hapticSuccess } from '../../../services/haptics';
import { ensureCameraPermission } from '../../../services/sensors/cameraPermission';
import type { BetaSessionKind } from '../../../stores/slices/appSlice';
import { BetaHero } from '../../../components/beta/BetaHero';
import { getSanctuaryIllustration } from '../../../utils/illustrationResolver';
import { useTheme } from '../../../theme/useTheme';
import { CoachGuide } from '../../../components/beta/CoachGuide';

const KINDS: BetaSessionKind[] = ['face_exercise'];
const CALIBRATE_MS = 2500;
const EXERCISE_LIMIT_MS = 60_000;
const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

type Phase = 'intro' | 'calibrating' | 'exercise' | 'done';

/**
 * Face and eye exercises with the coach: calibrate on a relaxed face, then six guided movements
 * (brows, smile, jaw, eye squeeze, look left, look right), each counted from face landmarks.
 */
export default function FaceExercisesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, experience } = useTheme();

  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [rep, setRep] = useState<RepState>(initialRep());
  const [level, setLevel] = useState(0);
  const [faceSeen, setFaceSeen] = useState(false);
  const [denied, setDenied] = useState(false);
  const [results, setResults] = useState<number[]>([]);

  const phaseRef = useRef<Phase>('intro');
  const indexRef = useRef(0);
  const repRef = useRef<RepState>(initialRep());
  const neutral = useRef<FaceMeasures | null>(null);
  const samples = useRef<FaceMeasures[]>([]);
  const phaseStartedAt = useRef(0);
  const startedAt = useRef(0);
  const resultsRef = useRef<number[]>([]);

  const go = (p: Phase) => {
    phaseRef.current = p;
    phaseStartedAt.current = Date.now();
    setPhase(p);
  };

  const finish = useCallback(() => {
    go('done');
    const total = resultsRef.current.reduce((a, b) => a + b, 0);
    void coachVoice.speak(`All done. ${total} movements in total. Relax your face.`, { priority: 3 });
    if (total > 0) {
      const metrics: Record<string, number> = { reps: total, exercises: resultsRef.current.filter((r) => r > 0).length };
      FACE_ROUTINE.forEach((ex, i) => (metrics[`reps_${ex.id}`] = resultsRef.current[i] ?? 0));
      recordBetaSession({ kind: 'face_exercise', startedAt: startedAt.current, endedAt: Date.now(), metrics });
    }
  }, []);

  const startExercise = useCallback((i: number) => {
    indexRef.current = i;
    repRef.current = initialRep();
    setIndex(i);
    setRep(repRef.current);
    go('exercise');
    void coachVoice.speak(`${FACE_ROUTINE[i].title}. ${FACE_ROUTINE[i].cue}`, { priority: 3 });
  }, []);

  const nextExercise = useCallback(() => {
    const i = indexRef.current;
    resultsRef.current = [...resultsRef.current.slice(0, i), repRef.current.reps];
    setResults(resultsRef.current);
    if (i + 1 < FACE_ROUTINE.length) startExercise(i + 1);
    else finish();
  }, [finish, startExercise]);

  const onPose = useCallback(
    (e: NativeSyntheticEvent<PoseFrame>) => {
      const m = measureFace(e.nativeEvent.face);
      setFaceSeen(!!m);
      if (!m) return;
      const now = Date.now();
      if (phaseRef.current === 'calibrating') {
        samples.current.push(m);
        if (now - phaseStartedAt.current >= CALIBRATE_MS && samples.current.length >= 15) {
          neutral.current = averageMeasures(samples.current);
          hapticSuccess();
          startExercise(0);
        }
        return;
      }
      if (phaseRef.current !== 'exercise' || !neutral.current) return;
      const ex = FACE_ROUTINE[indexRef.current];
      const value = movement(ex.metric, m, neutral.current);
      setLevel(Math.max(0, Math.min(1, value / ex.enter)));
      const next = stepRep(repRef.current, ex, value, now);
      if (next.reps !== repRef.current.reps) {
        hapticLight();
        repRef.current = next;
        setRep(next);
        if (next.reps >= ex.reps) {
          void coachVoice.speak(`${NUMBERS[next.reps] ?? next.reps}. Well done.`, { priority: 3 });
          nextExercise();
        } else {
          void coachVoice.speak(NUMBERS[next.reps] ?? String(next.reps), { priority: 2, minGapMs: 0 });
        }
      } else if (next !== repRef.current) {
        repRef.current = next;
      }
    },
    [nextExercise, startExercise],
  );

  // Move on if an exercise is not finished within a minute, keeping the reps that were counted.
  useEffect(() => {
    if (phase !== 'exercise') return;
    const t = setTimeout(nextExercise, EXERCISE_LIMIT_MS);
    return () => clearTimeout(t);
  }, [phase, index, nextExercise]);

  useEffect(() => () => coachVoice.stop(), []);

  const start = async () => {
    const ok = await ensureCameraPermission();
    setDenied(!ok);
    if (!ok) return;
    samples.current = [];
    neutral.current = null;
    resultsRef.current = [];
    setResults([]);
    startedAt.current = Date.now();
    go('calibrating');
    void coachVoice.speak('Hold the phone at eye level. Relax your face and look at the screen.', { priority: 3 });
  };

  const end = () => {
    coachVoice.stop();
    if (phaseRef.current === 'exercise') {
      resultsRef.current = [...resultsRef.current.slice(0, indexRef.current), repRef.current.reps];
      finish();
    } else {
      go('intro');
    }
  };

  if (phase === 'intro' || phase === 'done') {
    const total = results.reduce((a, b) => a + b, 0);
    return (
      <View style={[styles.fill, { backgroundColor: colors.background, paddingTop: insets.top + 8 }]}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.base }]}>
          <PressableScale onPress={() => router.back()} accessibilityLabel="Back" style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </PressableScale>
          <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Face & eye exercises</Text>
          <BetaBadge />
        </View>
        <View style={{ paddingHorizontal: spacing.base, paddingTop: spacing.md }}>
          {phase !== 'done' ? (
            <BetaHero source={getSanctuaryIllustration('faceExercises', experience)} label="Face & eye exercises" />
          ) : null}
          {phase === 'done' ? (
            <View style={[styles.summary, { backgroundColor: colors.surface }]}>
              <Text style={[typography.heading, { color: colors.text.primary }]}>{total} movements</Text>
              {FACE_ROUTINE.map((ex, i) => (
                <View key={ex.id} style={styles.summaryRow}>
                  <Text style={[typography.caption, styles.flex, { color: colors.text.secondary }]}>{ex.title}</Text>
                  <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                    {results[i] ?? 0} / {ex.reps}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <>
              <Text style={[typography.body, { color: colors.text.secondary }]}>
                Six guided movements with the coach: brow lifts, a wide smile, jaw opener, eye squeeze, and looking left
                and right with your eyes. The camera first learns your relaxed face, then counts each movement.
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
                Face points are processed on this phone; no image is saved. Stop if anything is uncomfortable. This is a
                relaxation and mobility routine, not treatment for facial palsy or any condition.
              </Text>
            </>
          )}
          {phase === 'intro' ? (
            <CoachGuide
              steps={[
                'Prop the phone at eye level, face lit evenly from the front.',
                'Keep a relaxed face for 2 seconds while the camera learns your neutral look.',
                'Do each movement slowly and hold it until the coach counts.',
                'Return to neutral between reps. Stop anything that feels uncomfortable.',
              ]}
            />
          ) : null}
          {denied ? (
            <Text style={[typography.caption, { color: colors.error, marginTop: 8 }]}>
              Camera access was not allowed. Allow it in Android settings to start.
            </Text>
          ) : null}
          <PressableScale onPress={start} style={[styles.cta, { backgroundColor: colors.primary }]} accessibilityLabel="Start exercises">
            <Ionicons name="play" size={18} color={colors.text.inverse} />
            <Text style={[typography.bodyBold, { color: colors.text.inverse, marginLeft: 8 }]}>
              {phase === 'done' ? 'Go again' : 'Start'}
            </Text>
          </PressableScale>
          <BetaSessionHistory
            kinds={KINDS}
            metric="reps"
            unit="moves"
            title="Your sessions"
            describe={(s) => `${s.metrics.reps} moves · ${s.metrics.exercises}/${FACE_ROUTINE.length} exercises`}
          />
        </View>
      </View>
    );
  }

  const ex = FACE_ROUTINE[index];
  return (
    <View style={[styles.fill, styles.dark]}>
      <PoseDetectionAdapter engine="default" active facing="front" face hands={false} onPose={onPose} style={StyleSheet.absoluteFill} />
      <View style={[styles.overlayTop, { paddingTop: insets.top + 8, paddingHorizontal: spacing.base }]}>
        <PressableScale onPress={end} accessibilityLabel="End session" style={[styles.iconBtn, styles.scrim]}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </PressableScale>
        <Text style={[typography.bodyBold, styles.light]}>
          {phase === 'calibrating' ? 'Learning your relaxed face' : `${index + 1} of ${FACE_ROUTINE.length}`}
        </Text>
        {phase === 'exercise' ? (
          <PressableScale onPress={nextExercise} accessibilityLabel="Skip exercise" style={[styles.skip, styles.scrim]}>
            <Text style={[typography.captionBold, styles.light]}>Skip</Text>
          </PressableScale>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      <View style={[styles.panel, styles.scrim, { paddingBottom: insets.bottom + 20, paddingHorizontal: spacing.lg }]}>
        {!faceSeen ? (
          <Text style={[typography.bodyBold, styles.light]}>Bring your face into view, in good light</Text>
        ) : phase === 'calibrating' ? (
          <Text style={[typography.bodyBold, styles.light]}>Relax and look at the screen…</Text>
        ) : (
          <>
            <Text style={[typography.subheading, styles.light]}>{ex.title}</Text>
            <Text style={[typography.caption, styles.dim, { marginTop: 4 }]}>{ex.cue}</Text>
            <View style={styles.repRow}>
              <Text style={[styles.reps, styles.light]}>
                {rep.reps}
                <Text style={[typography.body, styles.dim]}> / {ex.reps}</Text>
              </Text>
              <View style={styles.meter}>
                <View style={[styles.meterFill, { width: `${level * 100}%`, backgroundColor: level >= 1 ? colors.success : colors.primary }]} />
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  dark: { backgroundColor: '#000000' },
  light: { color: '#FFFFFF' },
  dim: { color: 'rgba(255,255,255,0.75)' },
  scrim: { backgroundColor: 'rgba(0,0,0,0.5)' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  skip: { height: 36, borderRadius: 18, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 18, marginTop: 20 },
  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panel: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 18 },
  repRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 },
  reps: { fontSize: 40, lineHeight: 46, fontWeight: '800' },
  meter: { flex: 1, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 5 },
  summary: { borderRadius: 18, padding: 16, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', paddingVertical: 4 },
});
