import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, type NativeSyntheticEvent } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PoseFrame } from '../../../../modules/pose-landmarker';
import { BetaHero } from '../../../components/beta/BetaHero';
import { BetaSessionHistory } from '../../../components/beta/BetaSessionHistory';
import { BetaBadge } from '../../../components/ui/Badge';
import { PressableScale } from '../../../components/ui/PressableScale';
import { GAME_ROUNDS, gameScore, newRound, stepRound, timedOut, type EyeRound, type RoundState } from '../../../domain/vision/eyeGame';
import { averageMeasures, measureFace, type FaceMeasures } from '../../../domain/vision/faceExercises';
import { PoseDetectionAdapter } from '../../../features/beta-lab/experiments/pose-detection/PoseDetectionAdapter';
import { coachVoice } from '../../../services/ai/coachVoice';
import { recordBetaSession } from '../../../services/beta/recordSession';
import { hapticSuccess, hapticWarning } from '../../../services/haptics';
import { ensureCameraPermission } from '../../../services/sensors/cameraPermission';
import type { BetaSessionKind } from '../../../stores/slices/appSlice';
import { useTheme } from '../../../theme/useTheme';
import { getSanctuaryIllustration } from '../../../utils/illustrationResolver';

const KINDS: BetaSessionKind[] = ['eye_game'];
const SAY: Record<EyeRound, string> = { left: 'Look left', right: 'Look right', blink: 'Blink twice' };
const CALIBRATE_MS = 2000;

type Phase = 'intro' | 'calibrating' | 'playing' | 'done';

/**
 * Eye game, full screen: the coach calls a direction, the ball glides there, and you follow it with
 * your eyes only ("Complete!" when your eyes get there), or blink twice. Eight rounds, scored,
 * with points. The camera runs as a small mirror in the corner; nothing is recorded.
 */
export default function EyeGamesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, typography, spacing, experience } = useTheme();

  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [faceSeen, setFaceSeen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [denied, setDenied] = useState(false);

  const phaseRef = useRef<Phase>('intro');
  const indexRef = useRef(0);
  const round = useRef<RoundState>(newRound(0));
  const neutral = useRef<FaceMeasures | null>(null);
  const samples = useRef<FaceMeasures[]>([]);
  const phaseAt = useRef(0);
  const startedAt = useRef(0);
  const results = useRef<{ done: boolean; ms: number }[]>([]);

  const x = useSharedValue(0);
  const ball = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const reach = width / 2 - 60;

  const go = (p: Phase) => {
    phaseRef.current = p;
    phaseAt.current = Date.now();
    setPhase(p);
  };

  const showRound = useCallback(
    (i: number) => {
      const r = GAME_ROUNDS[i];
      indexRef.current = i;
      setIndex(i);
      round.current = newRound(Date.now());
      x.value = withTiming(r === 'left' ? -reach : r === 'right' ? reach : 0, { duration: 600, easing: Easing.out(Easing.cubic) });
      void coachVoice.speak(SAY[r], { priority: 3, maxMs: 2000 });
    },
    [reach, x],
  );

  const finish = useCallback(() => {
    const s = gameScore(results.current);
    setScore(s);
    go('done');
    const completed = results.current.filter((r) => r.done).length;
    void coachVoice.speak(`Game over. ${completed} of ${GAME_ROUNDS.length} complete. Score ${s}.`, { priority: 3 });
    recordBetaSession({ kind: 'eye_game', startedAt: startedAt.current, endedAt: Date.now(), metrics: { score: s, completed, rounds: GAME_ROUNDS.length } });
  }, []);

  const next = useCallback(
    (done: boolean) => {
      results.current.push({ done, ms: Date.now() - round.current.startedAt });
      setFlash(done ? 'Complete!' : 'Missed');
      setTimeout(() => setFlash(null), 700);
      if (done) {
        hapticSuccess();
        void coachVoice.speak('Complete', { priority: 3, maxMs: 1200 });
      } else hapticWarning();
      const i = indexRef.current + 1;
      if (i < GAME_ROUNDS.length) setTimeout(() => phaseRef.current === 'playing' && showRound(i), 800);
      else setTimeout(finish, 800);
    },
    [finish, showRound],
  );

  const onPose = useCallback(
    (e: NativeSyntheticEvent<PoseFrame>) => {
      const m = measureFace(e.nativeEvent.face);
      setFaceSeen(!!m);
      if (!m) return;
      const now = Date.now();
      if (phaseRef.current === 'calibrating') {
        samples.current.push(m);
        if (now - phaseAt.current >= CALIBRATE_MS && samples.current.length >= 12) {
          neutral.current = averageMeasures(samples.current);
          go('playing');
          showRound(0);
        }
        return;
      }
      if (phaseRef.current !== 'playing' || !neutral.current || round.current.done) return;
      const r = stepRound(round.current, GAME_ROUNDS[indexRef.current], m, neutral.current, now);
      round.current = r;
      if (r.done) next(true);
    },
    [next, showRound],
  );

  // Rounds time out even when no face frame arrives.
  useEffect(() => {
    if (phase !== 'playing') return;
    const iv = setInterval(() => {
      if (!round.current.done && timedOut(round.current, Date.now())) {
        round.current = { ...round.current, done: true };
        next(false);
      }
    }, 250);
    return () => clearInterval(iv);
  }, [phase, next]);

  useEffect(() => () => coachVoice.stop(), []);

  const start = async () => {
    const ok = await ensureCameraPermission();
    setDenied(!ok);
    if (!ok) return;
    samples.current = [];
    results.current = [];
    neutral.current = null;
    setScore(null);
    x.value = 0;
    startedAt.current = Date.now();
    go('calibrating');
    void coachVoice.speak('Hold the phone at eye level, keep your head still, and look at the ball.', { priority: 3 });
  };

  if (phase === 'intro' || phase === 'done') {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background, paddingTop: insets.top + 8 }]}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.base }]}>
          <PressableScale onPress={() => router.back()} accessibilityLabel="Back" style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </PressableScale>
          <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Eye game</Text>
          <BetaBadge />
        </View>
        <View style={{ paddingHorizontal: spacing.base }}>
          <BetaHero source={getSanctuaryIllustration('eyePursuit', experience)} label="Eye game" />
          {score !== null ? (
            <View style={[styles.result, { backgroundColor: colors.surface }]}>
              <Text style={[styles.big, { color: colors.primary }]}>{score}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {results.current.filter((r) => r.done).length} of {GAME_ROUNDS.length} complete
              </Text>
            </View>
          ) : (
            <Text style={[typography.body, { color: colors.text.secondary }]}>
              The ball moves left or right: follow it with your eyes only and hear &quot;Complete!&quot;. Some rounds ask for two blinks. Eight
              rounds, about two minutes. Good for screen-tired eyes; not an eye test.
            </Text>
          )}
          {denied ? <Text style={[typography.caption, { color: colors.error, marginTop: 8 }]}>Camera access was not allowed.</Text> : null}
          <PressableScale onPress={() => void start()} style={[styles.cta, { backgroundColor: colors.primary }]} accessibilityLabel="Start eye game">
            <Ionicons name="play" size={18} color={colors.text.inverse} />
            <Text style={[typography.bodyBold, { color: colors.text.inverse, marginLeft: 8 }]}>{score !== null ? 'Play again' : 'Start'}</Text>
          </PressableScale>
          <BetaSessionHistory kinds={KINDS} metric="score" unit="score" title="Your games" describe={(s) => `score ${s.metrics.score} · ${s.metrics.completed}/${s.metrics.rounds}`} />
        </View>
      </View>
    );
  }

  const r = GAME_ROUNDS[index];
  return (
    <View style={[styles.fill, { backgroundColor: '#14181F' }]}>
      <View style={[styles.mirror, { top: insets.top + 12 }]}>
        <PoseDetectionAdapter engine="default" active facing="front" face hands={false} onPose={onPose} style={StyleSheet.absoluteFill} />
      </View>
      <View style={[styles.overlayTop, { paddingTop: insets.top + 12, paddingHorizontal: spacing.base }]}>
        <PressableScale onPress={() => (phaseRef.current === 'playing' ? finish() : go('intro'))} accessibilityLabel="End game" style={[styles.iconBtn, styles.scrim]}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </PressableScale>
      </View>

      <View style={styles.center}>
        <Text style={[typography.caption, styles.dim]}>{phase === 'calibrating' ? 'Getting ready…' : `Round ${index + 1} of ${GAME_ROUNDS.length}`}</Text>
        <Text style={[styles.cue, styles.light]}>{phase === 'calibrating' ? 'Look at the ball' : SAY[r]}</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.ball, ball, { backgroundColor: phase === 'playing' && r === 'blink' ? '#8FA886' : '#E0915F' }]} />
        </View>
        {flash ? <Text style={[styles.flash, { color: flash === 'Complete!' ? '#9BD18B' : '#E8A87C' }]}>{flash}</Text> : null}
        {!faceSeen ? <Text style={[typography.bodyBold, styles.dim, { marginTop: 20 }]}>Bring your face into view, in good light</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  light: { color: '#FFFFFF' },
  dim: { color: 'rgba(255,255,255,0.7)' },
  scrim: { backgroundColor: 'rgba(0,0,0,0.45)' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 18, marginTop: 16 },
  result: { borderRadius: 18, padding: 16, alignItems: 'center' },
  big: { fontSize: 48, lineHeight: 54, fontWeight: '800' },
  mirror: { position: 'absolute', right: 16, width: 84, height: 112, borderRadius: 14, overflow: 'hidden', zIndex: 3 },
  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cue: { fontSize: 34, lineHeight: 40, fontWeight: '800', marginTop: 6 },
  track: { height: 120, width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  ball: { width: 64, height: 64, borderRadius: 32 },
  flash: { fontSize: 28, fontWeight: '800', marginTop: 16 },
});
