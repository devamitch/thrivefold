import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, type NativeSyntheticEvent } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PoseFrame } from '../../../../modules/pose-landmarker';
import { BetaSessionHistory } from '../../../components/beta/BetaSessionHistory';
import { BetaBadge } from '../../../components/ui/Badge';
import { PressableScale } from '../../../components/ui/PressableScale';
import { measureFace, pursuitScore } from '../../../domain/vision/faceExercises';
import { PoseDetectionAdapter } from '../../../features/beta-lab/experiments/pose-detection/PoseDetectionAdapter';
import { coachVoice } from '../../../services/ai/coachVoice';
import { recordBetaSession } from '../../../services/beta/recordSession';
import { hapticSuccess } from '../../../services/haptics';
import { ensureCameraPermission } from '../../../services/sensors/cameraPermission';
import type { BetaSessionKind } from '../../../stores/slices/appSlice';
import { useTheme } from '../../../theme/useTheme';
import { BetaHero } from '../../../components/beta/BetaHero';
import { getSanctuaryIllustration } from '../../../utils/illustrationResolver';

const KINDS: BetaSessionKind[] = ['eye_pursuit'];
const RUN_MS = 30_000;
const PERIOD_MS = 6000;
/** Target position −1…1 at a time since start; the dot and the score use the same clock. */
const targetAt = (ms: number) => Math.sin((2 * Math.PI * ms) / PERIOD_MS);

/**
 * Eye pursuit: follow a dot that glides side to side with your eyes only. The face landmarker
 * measures where your irises sit, and the score is how closely they followed the dot.
 */
export default function EyePursuitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, typography, spacing, experience } = useTheme();

  const [running, setRunning] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [faceSeen, setFaceSeen] = useState(false);
  const [denied, setDenied] = useState(false);
  const [left, setLeft] = useState(RUN_MS / 1000);
  const startedAt = useRef(0);
  const samples = useRef<{ target: number; gaze: number }[]>([]);

  const x = useSharedValue(0);
  const t0 = useSharedValue(0);
  const frame = useFrameCallback((f) => {
    if (t0.value === 0) t0.value = f.timestamp;
    x.value = Math.sin((2 * Math.PI * (f.timestamp - t0.value)) / PERIOD_MS);
  }, false);
  const dot = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * (width / 2 - 40) }] }));

  const finish = useCallback(() => {
    frame.setActive(false);
    setRunning(false);
    const s = pursuitScore(samples.current);
    setScore(s);
    hapticSuccess();
    if (s === null) {
      void coachVoice.speak('I could not see your eyes long enough. Try again in brighter light.', { priority: 3 });
      return;
    }
    void coachVoice.speak(`Done. Your eyes followed the dot with a score of ${s}.`, { priority: 3 });
    recordBetaSession({ kind: 'eye_pursuit', startedAt: startedAt.current, endedAt: Date.now(), metrics: { score: s, samples: samples.current.length } });
  }, [frame]);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      const rem = Math.max(0, Math.ceil((RUN_MS - (Date.now() - startedAt.current)) / 1000));
      setLeft(rem);
      if (rem === 0) finish();
    }, 250);
    return () => clearInterval(iv);
  }, [running, finish]);

  useEffect(() => () => coachVoice.stop(), []);

  const onPose = useCallback((e: NativeSyntheticEvent<PoseFrame>) => {
    const m = measureFace(e.nativeEvent.face);
    setFaceSeen(!!m);
    if (!m || !startedAt.current) return;
    const at = (e.nativeEvent.capturedAt ?? Date.now()) - startedAt.current;
    if (at > 1000) samples.current.push({ target: targetAt(at), gaze: m.gaze });
  }, []);

  const start = async () => {
    const ok = await ensureCameraPermission();
    setDenied(!ok);
    if (!ok) return;
    samples.current = [];
    setScore(null);
    startedAt.current = Date.now();
    t0.value = 0;
    frame.setActive(true);
    setRunning(true);
    void coachVoice.speak('Keep your head still. Follow the dot with your eyes only.', { priority: 3 });
  };

  return (
    <View style={[styles.fill, { backgroundColor: colors.background, paddingTop: insets.top + 8 }]}>
      <View style={[styles.topBar, { paddingHorizontal: spacing.base }]}>
        <PressableScale
          onPress={() => {
            if (running) finish();
            router.back();
          }}
          accessibilityLabel="Back"
          style={styles.iconBtn}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </PressableScale>
        <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>Eye pursuit</Text>
        <BetaBadge />
      </View>

      {running ? (
        <View style={styles.fill}>
          <View style={styles.preview}>
            <PoseDetectionAdapter engine="default" active facing="front" face hands={false} onPose={onPose} style={StyleSheet.absoluteFill} />
          </View>
          <View style={styles.stage}>
            <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, dot]} />
          </View>
          <Text style={[typography.bodyBold, styles.center, { color: colors.text.primary }]}>
            {faceSeen ? `Follow the dot · ${left}s` : 'Bring your face into view'}
          </Text>
          <PressableScale onPress={finish} style={[styles.cta, { backgroundColor: colors.surface2, marginHorizontal: spacing.base }]} accessibilityLabel="Stop">
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Stop</Text>
          </PressableScale>
        </View>
      ) : (
        <View style={{ paddingHorizontal: spacing.base, paddingTop: spacing.md }}>
          <BetaHero source={getSanctuaryIllustration('eyePursuit', experience)} label="Eye pursuit" />
          {score !== null ? (
            <View style={[styles.result, { backgroundColor: colors.surface }]}>
              <Text style={[styles.big, { color: colors.primary }]}>{score}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>How closely your eyes followed the dot (0–100)</Text>
            </View>
          ) : null}
          <Text style={[typography.body, { color: colors.text.secondary }]}>
            A dot glides from side to side for {RUN_MS / 1000} seconds. Hold the phone at eye level, keep your head still and
            follow it with your eyes. A relaxing eye-movement exercise, not an eye test.
          </Text>
          {denied ? (
            <Text style={[typography.caption, { color: colors.error, marginTop: 8 }]}>Camera access was not allowed.</Text>
          ) : null}
          <PressableScale onPress={start} style={[styles.cta, { backgroundColor: colors.primary }]} accessibilityLabel="Start">
            <Ionicons name="play" size={18} color={colors.text.inverse} />
            <Text style={[typography.bodyBold, { color: colors.text.inverse, marginLeft: 8 }]}>{score !== null ? 'Again' : 'Start'}</Text>
          </PressableScale>
          <BetaSessionHistory kinds={KINDS} metric="score" unit="score" title="Your runs" describe={(s) => `score ${s.metrics.score}`} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  preview: { position: 'absolute', top: 8, right: 16, width: 72, height: 96, borderRadius: 12, overflow: 'hidden', zIndex: 2 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 44, height: 44, borderRadius: 22 },
  center: { textAlign: 'center', marginBottom: 12 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 18, marginTop: 20, marginBottom: 24 },
  result: { borderRadius: 18, padding: 16, marginBottom: 12, alignItems: 'center' },
  big: { fontSize: 44, lineHeight: 50, fontWeight: '800' },
});
