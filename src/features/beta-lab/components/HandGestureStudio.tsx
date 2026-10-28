import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '../../../components/ui/PressableScale';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { HandTrackerSession, type HandState } from '../../../domain/vision/handTracker';
import { PoseDetectionAdapter } from '../experiments/pose-detection/PoseDetectionAdapter';
import { coachVoice } from '../../../services/ai/coachVoice';
import { hapticLight, hapticSuccess } from '../../../services/haptics';
import { useTheme } from '../../../theme/useTheme';
import type { NativeSyntheticEvent } from 'react-native';
import type { PoseFrame } from '../../../../modules/pose-landmarker';

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

  const toggleStudio = () => {
    hapticLight();
    if (!active) {
      tracker.current.reset();
      prevRepsRef.current = 0;
      setActive(true);
      void coachVoice.speak('Hand gesture studio active. Show your hand, squeeze into a fist, and open.', { priority: 3 });
    } else {
      setActive(false);
      coachVoice.stop();
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

      {/* Camera Viewport */}
      <View style={[styles.cameraContainer, { backgroundColor: '#111' }]}>
        {active ? (
          <PoseDetectionAdapter
            engine="default"
            active={active}
            facing="front"
            face={false}
            hands={true}
            onPose={onPose}
            style={StyleSheet.absoluteFill}
          />
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
            {handState.kind}
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
            {handState.wristMobilityScore}%
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
