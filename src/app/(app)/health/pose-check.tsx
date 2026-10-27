import { Ionicons } from '@expo/vector-icons';
import { hapticLight } from '../../../services/haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  landmarksOf,
  PoseCameraView,
  poseLandmarkerAvailable,
  poseModelVersion,
  type PoseFrame,
} from 'pose-landmarker';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { FrostedView } from '../../../components/ui/FrostedView';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Squircle } from '../../../components/ui/Squircle';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { PoseOverlay } from '../../../components/workout/PoseOverlay';
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

const NO_JOINTS: number[] = [];

type Phase = 'setup' | 'live' | 'done';

/**
 * Movement check with on-device MediaPipe pose landmarks. Counts reps from joint angles and
 * keeps only the derived numbers. Frames never leave the camera pipeline: nothing is saved
 * or uploaded. Without the native adapter the screen says so and points to manual logging.
 */
export default function PoseCheckScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const [movement, setMovement] = useState<MovementDefinition>(
    () => MOVEMENTS.find((m) => m.id === movementParam) ?? MOVEMENTS[0],
  );
  const [phase, setPhase] = useState<Phase>('setup');
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<{ reps: RepState; inView: boolean }>({
    reps: initialRepState(),
    inView: false,
  });
  const [result, setResult] = useState<PoseSessionSummary | null>(null);

  // Landmarks go to the overlay through shared values: no re-render per camera frame.
  const feedPoints = useSharedValue<number[]>([]);
  const feedW = useSharedValue(0);
  const feedH = useSharedValue(0);
  const feedFace = useSharedValue<number[]>([]);
  const feedHands = useSharedValue<number[]>([]);
  const feedSeq = useSharedValue(0);
  const feedCapturedAt = useSharedValue(0);
  const feed = useRef({
    points: feedPoints,
    frameW: feedW,
    frameH: feedH,
    face: feedFace,
    hands: feedHands,
    seq: feedSeq,
    capturedAt: feedCapturedAt,
  }).current;
  const lastUi = useRef(0);
  const [tile, setTile] = useState({ width: 0, height: 0 });
  const reps = useRef<RepState>(initialRepState());
  const startedAt = useRef('');

  const start = async () => {
    setError(null);
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setError(
          'Camera access was not allowed. You can log the same exercise by hand from Workouts.',
        );
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
      const lm = landmarksOf(e.nativeEvent.points);
      reps.current = stepReps(movement, reps.current, lm, e.nativeEvent.timestamp);
      const flat = new Array(lm.length * 3);
      for (let i = 0; i < lm.length; i++) {
        flat[i * 3] = lm[i].x;
        flat[i * 3 + 1] = lm[i].y;
        flat[i * 3 + 2] = lm[i].visibility;
      }
      feed.frameW.value = e.nativeEvent.frameWidth;
      feed.frameH.value = e.nativeEvent.frameHeight;
      feed.points.value = flat;
      feed.capturedAt.value = e.nativeEvent.capturedAt ?? 0;
      feed.seq.value = feed.seq.value + 1;
      feed.face.value = e.nativeEvent.face ?? [];
      feed.hands.value = (e.nativeEvent.hands ?? []).flat();
      const counted = reps.current.reps > before;
      if (counted) hapticLight();
      const now = Date.now();
      if (counted || now - lastUi.current > 150) {
        lastUi.current = now;
        setView({ reps: reps.current, inView: lm.length > 0 });
      }
    },
    [movement, feed],
  );

  const finish = () => {
    const summary = summarize(movement, reps.current);
    setResult(summary);
    setPhase('done');
    audit(
      'device_disconnected',
      'pose_camera',
      `${movement.title}: camera off, ${summary.reps} reps`,
    );
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
      <ScreenContainer
        header={<AppHeader title="Movement check" subtitle="Camera rep counting" showBack />}
        scrollMode="shell-scroll-view"
      >
        <Card style={{ padding: spacing.base }}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
            Not available in this build
          </Text>
          <Text
            style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.xs }]}
          >
            Camera rep counting needs the on-device pose model, which this build does not include.
            Log the same exercise by hand instead; it counts the same for your plans.
          </Text>
          <Button
            label="Open workouts"
            variant="outline"
            onPress={() => router.replace('/(app)/health/exercise')}
            style={{ marginTop: spacing.md }}
          />
        </Card>
      </ScreenContainer>
    );
  }

  if (phase === 'live' && PoseCameraView) {
    return (
      <View style={[styles.live, { backgroundColor: colors.background }]}>
        <View style={[styles.liveHeader, { top: insets.top + 8, paddingHorizontal: spacing.base }]}>
          <PressableScale
            onPress={finish}
            style={[styles.headerCircleBtn, { backgroundColor: colors.surface }]}
            accessibilityRole="button"
            accessibilityLabel="Close camera"
          >
            <Ionicons name="close" size={20} color={colors.text.primary} />
          </PressableScale>
          <SquircleSurface
            radius={20}
            fill={colors.surface}
            style={[styles.flex, styles.liveTitlePill, { borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }]}
          >
            <Text style={[typography.subbodyBold, { color: colors.text.primary }]} numberOfLines={1}>
              {movement.title}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {movement.kind === 'hold' ? 'Hold duration' : 'Repetition tracking'} · On-Device
            </Text>
          </SquircleSurface>
          <PressableScale
            onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
            accessibilityRole="button"
            accessibilityLabel="Switch camera"
            style={[styles.headerCircleBtn, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="camera-reverse-outline" size={20} color={colors.text.primary} />
          </PressableScale>
        </View>

        <View
          style={styles.cameraWrap}
          onLayout={(ev) =>
            setTile({ width: ev.nativeEvent.layout.width, height: ev.nativeEvent.layout.height })
          }
        >
          <PoseCameraView
            style={StyleSheet.absoluteFill}
            active
            facing={facing}
            face
            hands
            onPose={onPose}
            onPoseError={(e) => setError(e.nativeEvent.message || 'The camera stopped.')}
          />
          <PoseOverlay
            feed={feed}
            width={tile.width}
            height={tile.height}
            highlight={view.reps.fault?.joints ?? NO_JOINTS}
            angleJoints={!movement.metric && movement.kind === 'reps' ? movement.joints : null}
          />

          <SquircleSurface
            radius={20}
            fill={colors.scrim}
            style={[styles.overlay, { borderColor: 'rgba(255, 255, 255, 0.15)', borderWidth: StyleSheet.hairlineWidth }]}
          >
            <Text
              style={[typography.display, styles.repCount, { color: colors.onPrimary }]}
              accessibilityLiveRegion="polite"
            >
              {movement.kind === 'hold' ? Math.floor(view.reps.holdMs / 1000) : view.reps.reps}
              <Text style={typography.subheading}> / {movement.targetReps}</Text>
            </Text>
            <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>
              {liveCue(movement, view.reps, view.inView)}
            </Text>
            <Text style={[typography.caption, { color: colors.onPrimary, marginTop: 4 }]}>
              {view.reps.lastAngle !== null
                ? `Joint angle ${Math.round(view.reps.lastAngle)}°`
                : 'Looking for you'}
              {view.reps.validFrames ? ` · tracking ${Math.round(confidence * 100)}%` : ''}
            </Text>
          </SquircleSurface>
        </View>

        {error ? (
          <Text style={[typography.caption, { color: colors.error, padding: spacing.sm }]}>
            {error}
          </Text>
        ) : null}

        <View
          style={[
            styles.liveFooter,
            {
              backgroundColor: colors.surface,
              paddingBottom: insets.bottom + spacing.sm,
              paddingTop: spacing.sm,
              paddingHorizontal: spacing.base,
              borderTopColor: colors.border,
              borderTopWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          <Button label="Finish Session" size="lg" onPress={finish} />
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Movement check"
          subtitle="On-device camera rep counting & form guidance"
          showBack
        />
      }
      scrollMode="shell-scroll-view"
      footer={
        phase === 'setup' ? (
          <FrostedView
            tone="surface"
            intensity={70}
            tintOpacity={0.88}
            style={[
              styles.stickyFooter,
              {
                paddingBottom: Math.max(insets.bottom, 12),
                paddingTop: spacing.sm,
                paddingHorizontal: spacing.base,
                borderTopColor: colors.border,
                borderTopWidth: StyleSheet.hairlineWidth,
              },
            ]}
          >
            <Button label="Allow camera and start" size="lg" onPress={start} />
          </FrostedView>
        ) : undefined
      }
    >
      {phase === 'done' && result ? (
        <Squircle
          radius={18}
          fill={colors.surface1}
          style={[
            styles.doneCard,
            { borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.md },
          ]}
        >
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            {result.reps} of {result.targetReps} reps
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
            {result.meetsCheckpoint
              ? `Tracked clearly in ${result.validFrameCount} frames.`
              : 'Tracking was not clear enough to confirm this session. Try more light and your whole body in view.'}
            {result.angleRange
              ? ` Range of motion ${result.angleRange[0]}° to ${result.angleRange[1]}°.`
              : ''}
          </Text>
          <Button
            label="Do another set"
            variant="outline"
            onPress={() => setPhase('setup')}
            style={{ marginTop: spacing.md }}
          />
        </Squircle>
      ) : null}

      <Text
        style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}
      >
        Select Movement
      </Text>
      <View style={styles.chips}>
        {MOVEMENTS.map((m) => (
          <Chip
            key={m.id}
            label={m.title}
            selected={movement.id === m.id}
            onPress={() => setMovement(m)}
          />
        ))}
      </View>

      <Squircle
        radius={16}
        fill={colors.surface}
        style={[
          styles.cueCard,
          {
            borderColor: colors.border,
            borderWidth: StyleSheet.hairlineWidth,
            marginTop: spacing.sm,
          },
        ]}
      >
        <View style={styles.row}>
          <Ionicons name="barbell-outline" size={18} color={colors.primary} />
          <Text
            style={[
              typography.subbodyBold,
              { color: colors.text.primary, marginLeft: 8, flex: 1 },
            ]}
          >
            {movement.cue}
          </Text>
        </View>
        {lastForMovement ? (
          <Text
            style={[typography.caption, { color: colors.text.muted, marginTop: spacing.xs }]}
          >
            Last time: {lastForMovement.reps} reps on {lastForMovement.date}
            {lastForMovement.angleRange
              ? `, range ${lastForMovement.angleRange[0]}° to ${lastForMovement.angleRange[1]}°`
              : ''}
            .
          </Text>
        ) : null}
      </Squircle>

      {/* Honest Coach Guidance & Technical Capabilities */}
      <Squircle
        radius={18}
        fill={colors.surface1}
        style={[
          styles.guidelinesCard,
          {
            borderColor: colors.border,
            borderWidth: StyleSheet.hairlineWidth,
            marginTop: spacing.md,
          },
        ]}
      >
        <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          How On-Device Movement Tracking Works
        </Text>
        {[
          [
            'phone-portrait-outline',
            'Runs 100% on this phone with Google MediaPipe. No internet required.',
          ],
          [
            'shield-checkmark-outline',
            'Total visual privacy: video frames stay in memory for math and are instantly discarded. Zero uploads.',
          ],
          [
            'analytics-outline',
            'Measures observable geometric joint angles, range of motion, and repetition cadence.',
          ],
          [
            'alert-circle-outline',
            'Honest boundaries: Does not estimate internal muscle load or diagnose medical/joint issues.',
          ],
          ['hand-left-outline', 'Stop immediately if anything hurts. Clear the floor around you before starting.'],
        ].map(([icon, text]) => (
          <View key={text} style={[styles.row, { marginBottom: spacing.sm }]}>
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={18}
              color={colors.primary}
            />
            <Text
              style={[
                typography.subbody,
                styles.flex,
                { color: colors.text.secondary, marginLeft: 10 },
              ]}
            >
              {text}
            </Text>
          </View>
        ))}
      </Squircle>

      {error ? (
        <Text style={[typography.caption, { color: colors.error, marginTop: spacing.sm }]}>
          {error}
        </Text>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cameraWrap: { flex: 1, overflow: 'hidden' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cueCard: { padding: 14 },
  doneCard: { padding: 16 },
  flex: { flex: 1 },
  guidelinesCard: { padding: 16 },
  headerCircleBtn: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  live: { flex: 1 },
  liveFooter: { width: '100%' },
  liveHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 10,
  },
  liveTitlePill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  overlay: {
    borderRadius: 18,
    bottom: 24,
    left: 16,
    padding: 16,
    position: 'absolute',
    right: 16,
  },
  repCount: { fontVariant: ['tabular-nums'] },
  row: { alignItems: 'flex-start', flexDirection: 'row' },
  stickyFooter: {
    paddingHorizontal: 16,
    width: '100%',
  },
});

