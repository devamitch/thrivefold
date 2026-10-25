import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import { PoseCameraView, poseLandmarkerAvailable, poseModelVersion, type PoseFrame } from 'pose-landmarker';

import { AppHeader } from '../../../components/ui/AppHeader';
import { PoseOverlay } from '../../../components/workout/PoseOverlay';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import {
  initialRepState,
  liveCue,
  MOVEMENTS,
  stepReps,
  summarize,
  type MovementDefinition,
  type PoseSessionSummary,
  type RepState,
} from '../../../domain/pose/movement';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';
import { PressableScale } from '../../../components/ui/PressableScale';

type Phase = 'setup' | 'live' | 'done';

/**
 * Movement check with on-device MediaPipe pose landmarks. Counts reps from joint angles and
 * keeps only the derived numbers. Frames never leave the camera pipeline: nothing is saved
 * or uploaded. Without the native adapter the screen says so and points to manual logging.
 */
export default function PoseCheckScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { history, savePoseSession, recordConsent, audit } = useRootStore(
    useShallow((s) => ({
      history: s.poseSessions,
      savePoseSession: s.savePoseSession,
      recordConsent: s.recordConsent,
      audit: s.audit,
    })),
  );
  const available = Boolean(PoseCameraView) && poseLandmarkerAvailable();
  const { movement: movementParam } = useLocalSearchParams<{ movement?: string }>();
  const [movement, setMovement] = useState<MovementDefinition>(() => MOVEMENTS.find((m) => m.id === movementParam) ?? MOVEMENTS[0]);
  const [phase, setPhase] = useState<Phase>('setup');
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<{ reps: RepState; inView: boolean }>({ reps: initialRepState(), inView: false });
  const [result, setResult] = useState<PoseSessionSummary | null>(null);
  const [frame, setFrame] = useState<{ landmarks: PoseFrame['landmarks']; w: number; h: number } | null>(null);
  const [tile, setTile] = useState({ width: 0, height: 0 });
  const reps = useRef<RepState>(initialRepState());
  const startedAt = useRef('');

  const start = async () => {
    setError(null);
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setError('Camera access was not allowed. You can log the same exercise by hand from Workouts.');
        return;
      }
    }
    recordConsent('pose_camera', ['camera:on-device-pose'], 'granted');
    audit('device_connected', 'pose_camera', `${movement.title}: camera on, processed on this phone`);
    reps.current = initialRepState();
    startedAt.current = new Date().toISOString();
    setView({ reps: reps.current, inView: false });
    setPhase('live');
  };

  const onPose = useCallback(
    (e: { nativeEvent: PoseFrame }) => {
      const before = reps.current.reps;
      reps.current = stepReps(movement, reps.current, e.nativeEvent.landmarks, e.nativeEvent.timestamp);
      setFrame({ landmarks: e.nativeEvent.landmarks, w: e.nativeEvent.frameWidth, h: e.nativeEvent.frameHeight });
      if (reps.current.reps > before) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      setView({ reps: reps.current, inView: e.nativeEvent.landmarks.length > 0 });
    },
    [movement],
  );

  const finish = () => {
    const summary = summarize(movement, reps.current);
    setResult(summary);
    setPhase('done');
    audit('device_disconnected', 'pose_camera', `${movement.title}: camera off, ${summary.reps} reps`);
    if (summary.reps > 0) {
      savePoseSession({
        ...summary,
        date: formatLocalDate(new Date()),
        startedAt: startedAt.current,
        finishedAt: new Date().toISOString(),
        modelVersion: poseModelVersion() ?? 'unknown',
      });
    }
  };

  const confidence = view.reps.validFrames ? view.reps.confidenceSum / view.reps.validFrames : 0;
  const lastForMovement = history.find((h) => h.movementId === movement.id);

  if (!available) {
    return (
      <ScreenContainer header={<AppHeader title="Movement check" subtitle="Camera rep counting" showBack />} scrollMode="shell-scroll-view">
        <Card style={{ padding: spacing.base }}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Not available in this build</Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.xs }]}>
            Camera rep counting needs the on-device pose model, which this build does not include. Log the same
            exercise by hand instead; it counts the same for your plans.
          </Text>
          <Button label="Open workouts" variant="outline" onPress={() => router.replace('/(app)/health/exercise')} style={{ marginTop: spacing.md }} />
        </Card>
      </ScreenContainer>
    );
  }

  if (phase === 'live' && PoseCameraView) {
    return (
      <View style={[styles.live, { backgroundColor: colors.background }]}>
        <AppHeader title={movement.title} subtitle="Processed on this phone" showBack />
        <View style={styles.cameraWrap} onLayout={(ev) => setTile({ width: ev.nativeEvent.layout.width, height: ev.nativeEvent.layout.height })}>
          <PoseCameraView
            style={StyleSheet.absoluteFill}
            active
            facing={facing}
            onPose={onPose}
            onPoseError={(e) => setError(e.nativeEvent.message || 'The camera stopped.')}
          />
          {frame ? (
            <PoseOverlay
              landmarks={frame.landmarks}
              frameWidth={frame.w}
              frameHeight={frame.h}
              width={tile.width}
              height={tile.height}
              highlight={view.reps.fault?.joints ?? []}
            />
          ) : null}
          <View style={[styles.overlay, { backgroundColor: colors.scrim }]}>
            <Text style={[typography.display, styles.repCount, { color: colors.onPrimary }]} accessibilityLiveRegion="polite">
              {movement.kind === 'hold' ? Math.floor(view.reps.holdMs / 1000) : view.reps.reps}
              <Text style={typography.subheading}> / {movement.targetReps}</Text>
            </Text>
            <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>
              {liveCue(movement, view.reps, view.inView)}
            </Text>
            <Text style={[typography.caption, { color: colors.onPrimary, marginTop: 4 }]}>
              {view.reps.lastAngle !== null ? `Joint angle ${Math.round(view.reps.lastAngle)}°` : 'Looking for you'}
              {view.reps.validFrames ? ` · tracking ${Math.round(confidence * 100)}%` : ''}
            </Text>
          </View>
          <PressableScale
            onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
            accessibilityRole="button"
            accessibilityLabel="Switch camera"
            style={[styles.flip, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="camera-reverse-outline" size={22} color={colors.text.primary} />
          </PressableScale>
        </View>
        {error ? <Text style={[typography.caption, { color: colors.error, padding: spacing.sm }]}>{error}</Text> : null}
        <View style={{ padding: spacing.base }}>
          <Button label="Finish" size="lg" onPress={finish} />
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer
      header={<AppHeader title="Movement check" subtitle="Camera rep counting, on this phone" showBack />}
      scrollMode="shell-scroll-view"
      footer={phase === 'setup' ? <Button label="Allow camera and start" size="lg" onPress={start} /> : undefined}
    >
      {phase === 'done' && result ? (
        <Card style={{ padding: spacing.base, marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            {result.reps} of {result.targetReps} reps
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
            {result.meetsCheckpoint
              ? `Tracked clearly in ${result.validFrameCount} frames.`
              : 'Tracking was not clear enough to confirm this session. Try more light and your whole body in view.'}
            {result.angleRange ? ` Range of motion ${result.angleRange[0]}° to ${result.angleRange[1]}°.` : ''}
          </Text>
          <Button label="Do another set" variant="outline" onPress={() => setPhase('setup')} style={{ marginTop: spacing.md }} />
        </Card>
      ) : null}

      <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>Movement</Text>
      <View style={styles.chips}>
        {MOVEMENTS.map((m) => (
          <Chip key={m.id} label={m.title} selected={movement.id === m.id} onPress={() => setMovement(m)} />
        ))}
      </View>
      <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>{movement.cue}</Text>
      {lastForMovement ? (
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.xs }]}>
          Last time: {lastForMovement.reps} reps on {lastForMovement.date}
          {lastForMovement.angleRange ? `, range ${lastForMovement.angleRange[0]}° to ${lastForMovement.angleRange[1]}°` : ''}.
        </Text>
      ) : null}

      <Card style={{ padding: spacing.base, marginTop: spacing.lg }}>
        {[
          ['phone-portrait-outline', 'Runs on this phone with MediaPipe. No internet needed.'],
          ['eye-off-outline', 'No photos or video are saved or sent. Only reps, frame count and joint angles are kept.'],
          ['information-circle-outline', 'Counts visible movement only. It does not judge fitness, injury or your body.'],
          ['hand-left-outline', 'Stop if anything hurts. Clear the space around you first.'],
        ].map(([icon, text]) => (
          <View key={text} style={[styles.row, { marginBottom: spacing.sm }]}>
            <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.primary} />
            <Text style={[typography.subbody, styles.flex, { color: colors.text.secondary, marginLeft: 10 }]}>{text}</Text>
          </View>
        ))}
      </Card>
      {error ? <Text style={[typography.caption, { color: colors.error, marginTop: spacing.sm }]}>{error}</Text> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cameraWrap: { flex: 1, overflow: 'hidden' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flex: { flex: 1 },
  flip: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', position: 'absolute', right: 16, top: 16, width: 48 },
  live: { flex: 1 },
  overlay: { borderRadius: 18, bottom: 16, left: 16, padding: 14, position: 'absolute', right: 16 },
  repCount: { fontVariant: ['tabular-nums'] },
  row: { alignItems: 'flex-start', flexDirection: 'row' },
});
