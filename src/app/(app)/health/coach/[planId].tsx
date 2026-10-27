/**
 * Coach screen — refactored entry point.
 *
 * All state lives in hooks (useCoachSession, usePoseTracking).
 * All UI lives in components from src/components/coach/.
 * This file is the orchestrator: it wires data and events together.
 *
 * Full-screen immersive: StatusBar is hidden, camera takes full stage,
 * video is PiP by default (camera-on mode), with animated toggle.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PoseCameraView, poseLandmarkerAvailable } from 'pose-landmarker';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  InteractionManager,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CoachBanner,
  CoachHUD,
  CoachIntro,
  CoachVideoStage,
  CountdownOverlay,
  GestureRemoteGuideModal,
  RestOverlay,
  SessionComplete,
  useCoachSession,
  usePoseTracking,
} from '../../../../components/coach';
import { Button } from '../../../../components/ui/Button';
import { GlassIconButton, GlassMarks } from '../../../../components/ui/GlassOrbButton';
import { CoachGlass } from '../../../../components/workout/CoachGlass';
import { PoseOverlay } from '../../../../components/workout/PoseOverlay';
import {
  YouTubePlayer,
  type YouTubePlayerHandle,
} from '../../../../components/workout/YouTubePlayer';
import { videoFor } from '../../../../content/exerciseVideos';
import {
  voiceCommandResponseSpeech,
  type VoiceCommand,
} from '../../../../domain/coach/voiceCommands';
import { exerciseById } from '../../../../domain/fitness/workouts';
import { gestureTriggerSpeech } from '../../../../domain/pose/coachVoice';
import { type Gesture } from '../../../../domain/pose/gestures';
import { liveCue, summarize } from '../../../../domain/pose/movement';
import { PoseDetectionAdapter } from '../../../../features/beta-lab/experiments/pose-detection/PoseDetectionAdapter';
import { getBetaSettings } from '../../../../features/beta-lab/flags/betaFlags';
import { speakCoach } from '../../../../services/ai/coachVoiceService';
import { useRootStore } from '../../../../stores/useRootStore';
import { useTheme } from '../../../../theme/useTheme';

/** Tutorial video re-renders only when its own props change, not on every rep update. */
const TutorialVideo = memo(YouTubePlayer);
const NO_JOINTS: number[] = [];
const OVERLAY_LAYERS = { body: true, feet: true, hands: false, head: false, eyes: false };

export default function CoachScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { colors, typography, spacing } = useTheme();
  const { planId, assignmentId } = useLocalSearchParams<{
    planId: string;
    assignmentId?: string;
  }>();

  const cameraBuilt = Boolean(PoseCameraView) && poseLandmarkerAvailable();

  // ── Session state ─────────────────────────────────────────────────────────
  const session = useCoachSession({ planId: planId ?? '', assignmentId });
  const {
    plan,
    phase,
    setPhase,
    item,
    exercise,
    movement,
    unit,
    timed,
    setIdx,
    itemIdx,
    rest,
    setRest,
    restTotal,
    elapsed,
    countdown,
    setCountdown,
    voiceOn,
    setVoiceOn,
    done,
    linkedQuest,
    progressOf,
    startedAt,
    introMs,
    voiceRef,
    finish,
    completeSet,
    say,
  } = session;

  // ── Camera state ──────────────────────────────────────────────────────────
  const [cameraOn, setCameraOn] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [fullTracking, setFullTracking] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMounted, setVideoMounted] = useState(false);
  const [showGestureModal, setShowGestureModal] = useState(false);
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const countdownArmed = useRef(false);
  const autoPaused = useRef(false);
  const player = useRef<YouTubePlayerHandle>(null);
  const hasWatched = useRootStore((s) =>
    item ? Boolean(s.watchedTutorials[item.exerciseId]) : false,
  );
  const markTutorialWatched = useRootStore((s) => s.markTutorialWatched);
  const betaMode = useRootStore((s) => s.betaMode);

  // ── Checking active ───────────────────────────────────────────────────────
  const checking =
    phase === 'live' && cameraOn && Boolean(movement) && rest === 0 && countdown === 0;
  const cameraMain = cameraOn && Boolean(PoseCameraView);
  const video = item ? videoFor(item.exerciseId) : undefined;

  const poseTrackRef = useRef<ReturnType<typeof usePoseTracking> | null>(null);

  // ── Gesture handler ───────────────────────────────────────────────────────
  const onGesture = useCallback(
    (g: Gesture) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      const speech = gestureTriggerSpeech(g, {
        videoPlaying,
        rest: rest > 0,
        itemIdx,
      });
      say(speech);

      if (g === 'one_hand') {
        autoPaused.current = false;
        if (videoPlaying) {
          player.current?.pause();
        } else {
          player.current?.play();
        }
        return;
      }
      if (g === 'cross_arms') {
        autoPaused.current = true;
        player.current?.pause();
        return;
      }
      if (g === 'hands_on_hips') {
        setRest((r) => r + 30);
        return;
      }
      if (g === 't_pose') {
        if (itemIdx > 0) {
          session.setItemIdx(itemIdx - 1);
          session.setSetIdx(0);
        }
        return;
      }
      if (rest > 0) {
        setRest(0);
      } else if (countdown === 0 && item && poseTrackRef.current) {
        const counted = progressOf(poseTrackRef.current.repRef.current);
        completeSet(
          cameraOn && movement && poseTrackRef.current.repRef.current.validFrames > 0
            ? counted
            : item.target,
        );
      }
    },
    [
      videoPlaying,
      rest,
      itemIdx,
      say,
      countdown,
      item,
      setRest,
      session,
      progressOf,
      completeSet,
      cameraOn,
      movement,
    ],
  );

  // ── Pose tracking ─────────────────────────────────────────────────────────
  // gestureMode: 'off' while positioning/countdown/rest; 'set' only during an active set.
  const gestureMode: 'off' | 'set' | 'rest' =
    phase === 'live' && rest === 0 && countdown === 0 ? 'set' : rest > 0 ? 'rest' : 'off';

  const poseTrack = usePoseTracking({
    checking,
    movement,
    item,
    timed,
    facing,
    countdown,
    videoPlaying,
    rest,
    gestureMode,
    onGesture,
    onCompleteSet: useCallback(
      (value: number) => {
        // record summary before completing set
        if (
          movement &&
          poseTrackRef.current &&
          poseTrackRef.current.repRef.current.validFrames > 0
        ) {
          session.results.current[item!.exerciseId] ??= { sets: [], summaries: [] };
          session.results.current[item!.exerciseId].summaries.push(
            summarize(movement, poseTrackRef.current.repRef.current),
          );
        }
        poseTrackRef.current?.resetReps();
        autoPaused.current = false;
        completeSet(value);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [movement, item, completeSet],
    ),
    sayFn: say,
    progressOf,
  });
  poseTrackRef.current = poseTrack;

  // Auto-pause video on form fault, resume when fixed
  useEffect(() => {
    if (!poseTrack) return;
    const fault = poseTrack.rep.fault;
    if (fault && videoPlaying) {
      player.current?.pause();
      autoPaused.current = true;
    } else if (!fault && autoPaused.current) {
      player.current?.play();
      autoPaused.current = false;
    }
  }, [poseTrack.rep.fault, videoPlaying]);

  // ── Voice command dispatcher ──────────────────────────────────────────────
  const executeVoiceCommand = useCallback(
    (cmd: VoiceCommand) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
      const speech = voiceCommandResponseSpeech(cmd);
      if (voiceOn) {
        speakCoach(speech, true).catch(() => undefined);
      }
      switch (cmd) {
        case 'pause':
          autoPaused.current = true;
          player.current?.pause();
          break;
        case 'resume':
          if (rest > 0) {
            setRest(0);
          } else {
            autoPaused.current = false;
            player.current?.play();
          }
          break;
        case 'next_set':
          if (rest > 0) {
            setRest(0);
          } else if (countdown === 0 && item && poseTrack) {
            const counted = progressOf(poseTrack.repRef.current);
            completeSet(
              cameraOn && movement && poseTrack.repRef.current.validFrames > 0
                ? counted
                : item.target,
            );
          }
          break;
        case 'add_rest':
          setRest((r) => r + 30);
          break;
        case 'previous':
          if (itemIdx > 0) {
            session.setItemIdx(itemIdx - 1);
            session.setSetIdx(0);
          }
          break;
        case 'toggle_video':
          setVideoPlaying((v) => !v);
          break;
        case 'help':
          setShowGestureModal(true);
          break;
      }
    },
    [
      voiceOn,
      rest,
      countdown,
      item,
      itemIdx,
      cameraOn,
      movement,
      poseTrack,
      completeSet,
      progressOf,
      session,
      setRest,
    ],
  );

  // ── Counter pulse from poseTrack ──────────────────────────────────────────
  const counterAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: poseTrack.counterPulse.value }],
  }));

  // ── Back button ───────────────────────────────────────────────────────────
  const confirmEnd = useCallback(() => {
    useRootStore.getState().showAlert({
      title: 'End workout?',
      message: 'Sets you finished are saved and count toward your XP.',
      confirmText: 'End and save',
      cancelText: 'Keep going',
      onConfirm: () => {
        if (cameraOn) {
          useRootStore
            .getState()
            .audit('device_disconnected', 'pose_camera', `${plan?.title}: camera off`);
        }
        setCameraOn(false);
        finish();
      },
    });
  }, [finish, cameraOn, plan]);

  useEffect(() => {
    if (phase !== 'live') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmEnd();
      return true;
    });
    return () => sub.remove();
  }, [phase, confirmEnd]);

  // ── Start session ─────────────────────────────────────────────────────────
  const start = async () => {
    let allowed = false;
    if (cameraBuilt && Platform.OS === 'android') {
      const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      allowed = res === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (allowed) {
      const s = useRootStore.getState();
      s.recordConsent('pose_camera', ['camera:on-device-pose'], 'granted');
      s.audit('device_connected', 'pose_camera', `${plan?.title ?? 'Workout'}: camera on`);
    }
    setCameraOn(allowed);
    poseTrack.setTrackingReady(false);
    startedAt.current = new Date().toISOString();
    setPhase('live');
    say(
      allowed
        ? 'Hi! Prop your phone up about two metres back so I can see you. You can control me hands-free with gestures.'
        : "Let's begin. Stay strong and focus on your form.",
    );
    countdownArmed.current = true;
    if (!allowed) {
      countdownArmed.current = false;
      // Start at 4 so the GET READY card shows, then 3-2-1-Go
      setTimeout(() => setCountdown(4), 1600);
    } else {
      setTimeout(() => {
        if (countdownArmed.current) {
          countdownArmed.current = false;
          setCountdown(4);
        }
      }, 8000);
    }
    InteractionManager.runAfterInteractions(() => setTimeout(() => setVideoMounted(true), 400));
  };

  // Auto count-in when camera sees you — start at 4 (GET READY beat)
  useEffect(() => {
    if (countdownArmed.current && poseTrack.trackingReady && poseTrack.hasPerson) {
      countdownArmed.current = false;
      setCountdown(4);
    }
  }, [poseTrack.trackingReady, poseTrack.hasPerson, setCountdown]);

  // ── Early returns ─────────────────────────────────────────────────────────
  if (!plan || !item || !exercise) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[typography.body, { color: colors.text.secondary }]}>
          This workout plan was not found.
        </Text>
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  if (phase === 'intro') {
    return (
      <>
        <StatusBar hidden />
        <CoachIntro
          plan={plan}
          exercise={exercise}
          cameraBuilt={cameraBuilt}
          linkedQuest={linkedQuest}
          onStart={start}
          onBack={() => router.back()}
        />
      </>
    );
  }

  if (phase === 'done' && done) {
    return (
      <>
        <StatusBar hidden />
        <SessionComplete done={done} elapsed={elapsed} planTitle={plan.title} />
      </>
    );
  }

  // ── LIVE phase ────────────────────────────────────────────────────────────
  const fault = checking ? poseTrack.rep.fault : null;
  const counted = progressOf(poseTrack.rep);
  const remaining = Math.max(0, item.target - counted);
  const share = Math.min(1, counted / Math.max(1, item.target));
  const starting = cameraMain && !poseTrack.trackingReady && !poseTrack.cameraError;

  const upNext =
    setIdx + 1 < item.sets
      ? { ex: exercise, set: setIdx + 2, of: item.sets }
      : plan.items[itemIdx + 1]
        ? {
            ex: exerciseById(plan.items[itemIdx + 1].exerciseId),
            set: 1,
            of: plan.items[itemIdx + 1].sets,
          }
        : null;

  // nextItem: the item that will run AFTER this rest.
  // Within an exercise: same item (next set). After last set of an exercise: next plan item.
  const nextItem =
    rest > 0 ? (setIdx + 1 < item.sets ? item : (plan.items[itemIdx + 1] ?? null)) : null;

  // Build banner data: most urgent first
  const { gestureProgress, framing } = poseTrack;
  const banner: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    text?: string;
    tone: 'gesture' | 'fault' | 'framing' | 'cue';
  } | null =
    gestureProgress.g && gestureProgress.p > 0
      ? {
          icon:
            gestureProgress.g === 'cross_arms'
              ? 'pause-circle-outline'
              : gestureProgress.g === 'hands_on_hips'
                ? 'time-outline'
                : gestureProgress.g === 't_pose'
                  ? 'arrow-undo-outline'
                  : 'hand-left-outline',
          title:
            gestureProgress.g === 'one_hand'
              ? videoPlaying
                ? 'Pausing video...'
                : 'Playing video...'
              : gestureProgress.g === 'cross_arms'
                ? 'Pausing workout...'
                : gestureProgress.g === 'hands_on_hips'
                  ? 'Adding +30s rest...'
                  : gestureProgress.g === 't_pose'
                    ? itemIdx > 0
                      ? 'Going back...'
                      : 'At first exercise'
                    : rest > 0
                      ? 'Skipping rest...'
                      : 'Finishing set...',
          tone: 'gesture',
        }
      : fault
        ? { icon: 'alert', title: fault.title, text: fault.fix, tone: 'fault' }
        : cameraMain && framing && poseTrack.trackingReady
          ? {
              icon:
                framing.id === 'move_left'
                  ? 'arrow-back'
                  : framing.id === 'move_right'
                    ? 'arrow-forward'
                    : framing.id === 'closer'
                      ? 'enter-outline'
                      : framing.id === 'step_in'
                        ? 'body-outline'
                        : 'resize-outline',
              title: framing.text,
              tone: 'framing',
            }
          : checking && movement
            ? {
                icon: 'pulse-outline',
                title: liveCue(movement, poseTrack.rep, poseTrack.hasPerson),
                tone: 'cue',
              }
            : null;

  const videoTile = !videoMounted ? (
    <View
      style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: colors.callBackground }]}
    >
      <ActivityIndicator color={colors.callMuted} />
    </View>
  ) : (
    <TutorialVideo
      key={item.exerciseId}
      ref={player}
      videoId={video?.videoId}
      query={`${exercise.name} proper form tutorial`}
      style={StyleSheet.absoluteFill}
      onPlayingChange={setVideoPlaying}
    />
  );

  const clock = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View
      style={[styles.flex, { backgroundColor: colors.callBackground }]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setStage((s) => (s.width === width && s.height === height ? s : { width, height }));
      }}
    >
      {/* Full-screen immersive: status bar hidden */}
      <StatusBar hidden />

      {/* Full-screen background: camera or video */}
      {cameraMain && PoseCameraView ? (
        betaMode ? (
          <PoseDetectionAdapter
            engine={getBetaSettings().poseEngine}
            style={StyleSheet.absoluteFill}
            active={phase === 'live'}
            facing={facing}
            face={fullTracking}
            hands={fullTracking}
            minIntervalMs={rest > 0 ? 250 : 0}
            onPose={poseTrack.onPose}
            onPoseReady={poseTrack.onPoseReady}
            onPoseError={poseTrack.onPoseError}
          />
        ) : (
          <PoseCameraView
            style={StyleSheet.absoluteFill}
            active={phase === 'live'}
            facing={facing}
            face={fullTracking}
            hands={fullTracking}
            minIntervalMs={rest > 0 ? 250 : 0}
            onPose={poseTrack.onPose}
            onPoseReady={poseTrack.onPoseReady}
            onPoseError={poseTrack.onPoseError}
          />
        )
      ) : (
        videoTile
      )}

      {/* Pose skeleton overlay — body+feet only per V5; face/hands/eyes locked off */}
      {cameraMain && stage.width > 0 ? (
        <PoseOverlay
          feed={poseTrack.feed}
          width={stage.width}
          height={stage.height}
          highlight={fault?.joints ?? NO_JOINTS}
          angleJoints={
            movement && !movement.metric && movement.kind === 'reps' ? movement.joints : null
          }
          layers={OVERLAY_LAYERS}
        />
      ) : null}
      {/* Red border when form is wrong */}
      {fault ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.faultEdge, { borderColor: colors.error }]}
        />
      ) : null}

      {/* Starting camera indicator */}
      {starting ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(150)}
          exiting={reduceMotion ? undefined : FadeOut.duration(200)}
          pointerEvents="none"
          style={styles.startingWrap}
        >
          <CoachGlass radius={999} style={styles.startingCam}>
            <ActivityIndicator color={colors.callText} />
            <Text style={[typography.bodyBold, { color: colors.callText, marginLeft: 10 }]}>
              Starting camera
            </Text>
          </CoachGlass>
        </Animated.View>
      ) : null}

      {/* Top bar: end / exercise info / voice */}
      <View style={[styles.topBar, { top: insets.top + 8, paddingHorizontal: spacing.base }]}>
        <GlassIconButton
          path={GlassMarks.close}
          accessibilityLabel="End workout"
          onPress={confirmEnd}
          size={44}
        />
        <View
          style={[
            styles.flex,
            styles.titlePill,
            { justifyContent: 'center', gap: 6, backgroundColor: 'transparent' },
          ]}
        >
          <Text style={[typography.bodyBold, { color: colors.callText }]} numberOfLines={1}>
            {exercise.name}
          </Text>
          <View style={styles.setsInline} accessibilityLabel={`Set ${setIdx + 1} of ${item.sets}`}>
            {Array.from({ length: item.sets }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.setSeg,
                  {
                    backgroundColor:
                      i < setIdx
                        ? colors.primary
                        : i === setIdx
                          ? colors.callText
                          : colors.callSurfaceStrong,
                  },
                ]}
              />
            ))}
            <Text style={[typography.caption, { color: colors.callMuted, marginLeft: 8 }]}>
              {itemIdx + 1}/{plan.items.length} · {clock(elapsed)}
            </Text>
          </View>
        </View>
        <GlassIconButton
          path={voiceOn ? GlassMarks.volume : GlassMarks.mute}
          accessibilityLabel={voiceOn ? 'Mute voice coach' : 'Turn on voice coach'}
          tone={voiceOn ? 'primary' : 'neutral'}
          onPress={() => setVoiceOn((v) => !v)}
          size={44}
        />
      </View>

      {/* Right rail: camera controls */}
      {cameraMain ? (
        <View style={[styles.rail, { top: insets.top + 72, right: spacing.base }]}>
          <GlassIconButton
            path={GlassMarks.flip}
            accessibilityLabel="Flip camera"
            onPress={() => {
              poseTrack.setTrackingReady(false);
              setFacing((f) => (f === 'front' ? 'back' : 'front'));
            }}
            size={44}
          />
          <GlassIconButton
            path={GlassMarks.scan}
            accessibilityLabel="Track face and hands too"
            tone={fullTracking ? 'primary' : 'neutral'}
            onPress={() => setFullTracking((v) => !v)}
            size={44}
          />
          <GlassIconButton
            path={GlassMarks.info}
            accessibilityLabel="Hands-free gesture & voice controls guide"
            tone="neutral"
            onPress={() => setShowGestureModal(true)}
            size={44}
          />
        </View>
      ) : null}

      {/* Tutorial video stage: handles first-time skippable auto-play, PiP, and minimized pill */}
      {cameraMain ? (
        <CoachVideoStage
          ref={player}
          exerciseId={item.exerciseId}
          exerciseName={exercise.name}
          videoId={video?.videoId}
          hasWatched={hasWatched}
          onMarkWatched={() => markTutorialWatched(item.exerciseId)}
          videoPlaying={videoPlaying}
          onPlayingChange={setVideoPlaying}
          stageWidth={stage.width}
          topInset={insets.top}
          cameraMain={cameraMain}
        />
      ) : null}

      {/* Coaching banner — one message at a time */}
      {banner && rest === 0 && countdown === 0 ? (
        <CoachBanner
          key={banner.tone + banner.title}
          icon={banner.icon}
          title={banner.title}
          text={banner.text}
          tone={banner.tone}
          gestureProgress={gestureProgress.p}
        />
      ) : null}

      {/* Camera error */}
      {poseTrack.cameraError ? (
        <Text
          style={[
            typography.caption,
            styles.cameraError,
            { color: colors.callText, backgroundColor: colors.error, top: insets.top + 72 },
          ]}
        >
          {poseTrack.cameraError}
        </Text>
      ) : null}

      {/* Bottom HUD: rep count, next up, set done */}
      {rest === 0 ? (
        <CoachHUD
          counted={counted}
          remaining={remaining}
          unit={unit}
          share={share}
          fault={fault}
          cameraMain={cameraMain}
          movement={movement}
          upNext={upNext}
          counterStyle={counterAnimStyle}
          onSetDone={() => {
            if (!item) return;
            const counted = progressOf(poseTrack.repRef.current);
            completeSet(
              cameraOn && movement && poseTrack.repRef.current.validFrames > 0
                ? counted
                : item.target,
            );
          }}
        />
      ) : null}

      {/* 3-2-1 countdown */}
      {countdown > 0 ? (
        <CountdownOverlay
          countdown={countdown}
          introMs={introMs.current}
          exerciseName={exercise.name}
          target={item.target}
          unit={unit}
          framing={framing}
          movementCue={movement?.cue}
        />
      ) : null}

      {/* Rest overlay */}
      {rest > 0 ? (
        <RestOverlay
          rest={rest}
          restTotal={restTotal.current}
          nextItem={nextItem}
          setIdx={setIdx}
          onAddRest={() => {
            restTotal.current += 15;
            setRest((r) => r + 15);
          }}
          onSkipRest={() => setRest(0)}
        />
      ) : null}

      {/* Hands-Free Camera Gesture & Voice Remote Guide Bottom Sheet */}
      <GestureRemoteGuideModal
        visible={showGestureModal}
        onClose={() => setShowGestureModal(false)}
        onExecuteCommand={executeVoiceCommand}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: { bottom: 0, left: 0, position: 'absolute', right: 0 },
  cameraError: {
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
  },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 8 },
  faultEdge: { borderWidth: 4 },
  flex: { flex: 1 },
  gestureBtn: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pip: { aspectRatio: 16 / 9, position: 'absolute' },
  pipBtn: {
    alignItems: 'center',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  pipControls: { bottom: 6, flexDirection: 'row', gap: 6, position: 'absolute', right: 6 },
  rail: { gap: 10, position: 'absolute' },
  setSeg: { borderRadius: 2, height: 4, width: 18 },
  setsInline: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 4 },
  startingCam: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  startingWrap: { alignItems: 'center', left: 0, position: 'absolute', right: 0, top: '45%' },
  titlePill: {
    justifyContent: 'center',
    marginHorizontal: 10,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  topBar: { alignItems: 'center', flexDirection: 'row', left: 0, position: 'absolute', right: 0 },
});
