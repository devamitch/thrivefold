import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '../../../components/ui/PressableScale';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { HandTrackerSession, type HandState } from '../../../domain/vision/handTracker';
import { PoseDetectionAdapter } from '../experiments/pose-detection/PoseDetectionAdapter';
import { coachVoice } from '../../../services/ai/coachVoice';
import { hapticLight, hapticSuccess } from '../../../services/haptics';
import { useTheme } from '../../../theme/useTheme';
import type { NativeSyntheticEvent } from 'react-native';
import type { PoseFrame } from '../../../../modules/pose-landmarker';
import { ensureCameraPermission } from '../../../services/sensors/cameraPermission';
import { recordBetaSession } from '../../../services/beta/recordSession';

export function HandGestureStudio() {
  const { colors, typography, spacing } = useTheme();
  const [active, setActive] = useState(false);
  const [handState, setHandState] = useState<HandState>({
    kind: 'unknown',
    extendedFingers: 0,
    gripReps: 0,
    wristAngleDeg: 0,
    wristMobilityScore: 0,
    isMoving: false,
    confidence: 0,
  });

  const tracker = useRef(new HandTrackerSession());
  const prevRepsRef = useRef(0);
  const startedAt = useRef(0);

  // Save a session with at least one counted rep; runs on stop and when leaving the screen.
  const finishSession = useCallback(() => {
    if (startedAt.current && prevRepsRef.current > 0) {
      recordBetaSession({
        kind: 'hand_grip',
        startedAt: startedAt.current,
        endedAt: Date.now(),
        metrics: { reps: prevRepsRef.current },
      });
    }
    startedAt.current = 0;
  }, []);
  const finishRef = useRef(finishSession);
  finishRef.current = finishSession;
  useEffect(() => () => finishRef.current(), []);

  const onPose = useCallback((e: NativeSyntheticEvent<PoseFrame>) => {
    const frame = e.nativeEvent;
    const hand = frame.hands && frame.hands.length > 0 ? frame.hands[0] : undefined;
    const next = tracker.current.processHand(hand);
    setHandState(next);

    // Rep detection chime and coach voice
    if (next.gripReps > prevRepsRef.current) {
      prevRepsRef.current = next.gripReps;
      hapticSuccess();
      void coachVoice.speak(`${next.gripReps}! Open wide... and squeeze again.`, { priority: 2 });
    }
  }, []);

  const [denied, setDenied] = useState(false);
  const toggleStudio = async () => {
    hapticLight();
    if (!active) {
      const ok = await ensureCameraPermission();
      setDenied(!ok);
      if (!ok) return;
      tracker.current.reset();
      prevRepsRef.current = 0;
      startedAt.current = Date.now();
      setActive(true);
      void coachVoice.speak('Hand gesture studio active. Show your hand, squeeze into a fist, and open.', { priority: 3 });
    } else {
      setActive(false);
      coachVoice.stop();
      finishSession();
    }
  };

  return (
    <SquircleSurface radius={24} fill={colors.surface} style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="hand-right-outline" size={20} color={colors.primary} />
        <Text style={[typography.subheading, { color: colors.text.primary, flex: 1, marginLeft: 8 }]}>
          Hand Gesture & Mobility Studio
        </Text>
        <SquircleSurface radius={8} fill={colors.primaryAlpha} style={styles.pill}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>21 Landmark Task</Text>
        </SquircleSurface>
      </View>

      {/* The grip exercise runs full screen with the count large enough to see from arm's length. */}
      <Modal visible={active} animationType="fade" statusBarTranslucent onRequestClose={() => void toggleStudio()}>
        <View style={styles.full}>
          <PoseDetectionAdapter engine="default" active={active} facing="front" face={false} hands onPose={onPose} style={StyleSheet.absoluteFill} />
          <View style={styles.fullPanel}>
            <Text style={styles.fullReps}>{handState.gripReps}</Text>
            <Text style={[typography.bodyBold, { color: '#FFF' }]}>
              {handState.confidence > 0 ? (handState.kind === 'closed' ? 'Fist: now open wide' : 'Open: now squeeze') : 'Show your hand to the camera'}
            </Text>
            <Text style={[typography.caption, { color: 'rgba(255,255,255,0.75)', marginTop: 4 }]}>
              {handState.confidence > 0 ? `${handState.extendedFingers} fingers open` : ''}
            </Text>
            <PressableScale onPress={() => void toggleStudio()} style={styles.fullStop} accessibilityLabel="Stop">
              <Text style={[typography.bodyBold, { color: '#FFF' }]}>Stop and save</Text>
            </PressableScale>
          </View>
        </View>
      </Modal>

      {/* Camera Viewport */}
      <View style={[styles.cameraContainer, { backgroundColor: '#111' }]}>
        {active ? (
          <View style={styles.placeholder}>
            <Text style={[typography.body, { color: '#AAA' }]}>Running full screen…</Text>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="hand-right-outline" size={38} color="#666" />
            <Text style={[typography.body, { color: '#AAA', marginTop: 6 }]}>Hand Camera Inactive</Text>
            <Text style={[typography.caption, { color: '#777', marginTop: 2, textAlign: 'center' }]}>
              Tracks hand open/closed states, wrist rotation, and finger extensions in real time
            </Text>
          </View>
        )}
      </View>

      {/* Rep & Mobility Metrics */}
      <View style={[styles.statsRow, { backgroundColor: colors.surface2 }]}>
        <View style={styles.statItem}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>Grip Reps</Text>
          <Text style={[typography.heading, { color: colors.primary, fontSize: 24 }]}>
            {handState.gripReps}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>State</Text>
          <Text style={[typography.heading, { color: colors.text.primary, fontSize: 16, textTransform: 'capitalize' }]}>
            {handState.confidence > 0 ? handState.kind : active ? 'No hand' : '—'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>Fingers</Text>
          <Text style={[typography.heading, { color: colors.text.primary, fontSize: 18 }]}>
            {handState.extendedFingers} / 5
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>Mobility</Text>
          <Text style={[typography.heading, { color: colors.text.primary, fontSize: 18 }]}>
            {handState.confidence > 0 ? `${handState.wristMobilityScore}%` : '—'}
          </Text>
        </View>
      </View>

      {/* Exercise Instructions */}
      <View style={[styles.guideBox, { backgroundColor: colors.surface3 }]}>
        <Ionicons name="fitness-outline" size={16} color={colors.primary} />
        <Text style={[typography.caption, { color: colors.text.secondary, flex: 1, marginLeft: 6 }]}>
          Grip exercise: Squeeze hand into a tight fist, then open fingers fully. Coach will count reps.
        </Text>
      </View>

      {denied ? (
        <Text style={[typography.caption, { color: colors.error, marginTop: 12 }]}>
          Camera access was not allowed. Allow it in Android settings to use hand tracking.
        </Text>
      ) : null}

      {/* Action Button */}
      <View style={{ marginTop: 14 }}>
        <PressableScale onPress={toggleStudio} scaleTo={0.96}>
          <SquircleSurface
            radius={16}
            fill={active ? colors.error : colors.primary}
            style={styles.actionBtn}
          >
            <Ionicons name={active ? 'stop' : 'videocam'} size={18} color="#FFF" />
            <Text style={[typography.bodyBold, { color: '#FFF', marginLeft: 8 }]}>
              {active ? 'Stop Hand Studio' : 'Start Hand Gesture Studio'}
            </Text>
          </SquircleSurface>
        </PressableScale>
      </View>
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, backgroundColor: '#000' },
  fullPanel: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: 36, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)' },
  fullReps: { color: '#FFF', fontSize: 72, lineHeight: 80, fontWeight: '800' },
  fullStop: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 16, marginTop: 14, backgroundColor: 'rgba(255,255,255,0.18)' },
  card: { padding: 16, marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pill: { paddingHorizontal: 8, paddingVertical: 4 },
  cameraContainer: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: { alignItems: 'center', paddingHorizontal: 20 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 12,
  },
  statItem: { alignItems: 'center' },
  guideBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 16,
  },
});
