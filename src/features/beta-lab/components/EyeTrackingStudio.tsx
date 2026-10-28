import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { PressableScale } from '../../../components/ui/PressableScale';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { EyeTrackerSession, type EyeState } from '../../../domain/vision/eyeTracker';
import { PoseDetectionAdapter } from '../experiments/pose-detection/PoseDetectionAdapter';
import { coachVoice } from '../../../services/ai/coachVoice';
import { hapticLight, hapticSuccess } from '../../../services/haptics';
import { useTheme } from '../../../theme/useTheme';
import type { NativeSyntheticEvent } from 'react-native';
import type { PoseFrame } from '../../../../modules/pose-landmarker';

export function EyeTrackingStudio() {
  const { colors, typography, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const [active, setActive] = useState(false);
  const [eyeState, setEyeState] = useState<EyeState>({
    earLeft: 0.25,
    earRight: 0.25,
    earAvg: 0.25,
    isOpen: true,
    blinkCount: 0,
    blinksPerMin: 0,
    gaze: 'center',
    strainLevel: 'low',
    lastBlinkAt: Date.now(),
  });
  const [rateHistory, setRateHistory] = useState<number[]>([14, 16, 15, 12, 17, 15, 18]);

  const tracker = useRef(new EyeTrackerSession());
  const prevBlinkRef = useRef(0);
  const lastCoachLineRef = useRef(0);

  const onPose = useCallback((e: NativeSyntheticEvent<PoseFrame>) => {
    const frame = e.nativeEvent;
    const next = tracker.current.processFace(frame.face);
    setEyeState(next);

    // Rep / blink chime & coach guidance
    if (next.blinkCount > prevBlinkRef.current) {
      prevBlinkRef.current = next.blinkCount;
      hapticLight();

      const now = Date.now();
      if (now - lastCoachLineRef.current > 8000) {
        lastCoachLineRef.current = now;
        if (next.blinkCount % 5 === 0) {
          hapticSuccess();
          void coachVoice.speak(`Blink count ${next.blinkCount}. Keep relaxing your eyes.`, { priority: 2 });
        }
      }
    }
  }, []);

  // Update rolling history every 3s
  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      setRateHistory((prev) => [...prev.slice(-9), eyeState.blinksPerMin || 15]);
    }, 3000);
    return () => clearInterval(iv);
  }, [active, eyeState.blinksPerMin]);

  const toggleStudio = () => {
    hapticLight();
    if (!active) {
      tracker.current.reset();
      prevBlinkRef.current = 0;
      setActive(true);
      void coachVoice.speak('Eye tracking studio active. Look straight and blink naturally.', { priority: 3 });
    } else {
      setActive(false);
      coachVoice.stop();
    }
  };

  const maxRate = Math.max(25, ...rateHistory);

  return (
    <SquircleSurface radius={24} fill={colors.surface} style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="eye-outline" size={20} color={colors.primary} />
        <Text style={[typography.subheading, { color: colors.text.primary, flex: 1, marginLeft: 8 }]}>
          Eye Tracking & Blink Studio
        </Text>
        <SquircleSurface radius={8} fill={colors.primaryAlpha} style={styles.pill}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>Live MediaPipe</Text>
        </SquircleSurface>
      </View>

      {/* Camera Viewport */}
      <View style={[styles.cameraContainer, { backgroundColor: '#111' }]}>
        {active ? (
          <PoseDetectionAdapter
            engine="default"
            active={active}
            facing="front"
            face={true}
            hands={false}
            onPose={onPose}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="eye-off-outline" size={38} color="#666" />
            <Text style={[typography.body, { color: '#AAA', marginTop: 6 }]}>Eye Camera Inactive</Text>
            <Text style={[typography.caption, { color: '#777', marginTop: 2, textAlign: 'center' }]}>
              Analyzes eye aspect ratio (EAR) and blinks on-device without recording
            </Text>
          </View>
        )}
      </View>

      {/* Metrics Grid */}
      <View style={[styles.statsRow, { backgroundColor: colors.surface2 }]}>
        <View style={styles.statItem}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>Blinks</Text>
          <Text style={[typography.heading, { color: colors.text.primary, fontSize: 20 }]}>
            {eyeState.blinkCount}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>Rate</Text>
          <Text style={[typography.heading, { color: colors.text.primary, fontSize: 20 }]}>
            {eyeState.blinksPerMin} <Text style={{ fontSize: 11 }}>/min</Text>
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>Gaze</Text>
          <Text style={[typography.heading, { color: colors.text.primary, fontSize: 16, textTransform: 'capitalize' }]}>
            {eyeState.gaze}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>Strain</Text>
          <Text
            style={[
              typography.heading,
              {
                color:
                  eyeState.strainLevel === 'high'
                    ? colors.error
                    : eyeState.strainLevel === 'moderate'
                      ? colors.warning
                      : colors.success,
                fontSize: 14,
                textTransform: 'uppercase',
              },
            ]}
          >
            {eyeState.strainLevel}
          </Text>
        </View>
      </View>

      {/* Blink Rate Sparkline / Bar Graph (BlinkQuest style) */}
      <View style={{ marginTop: 14 }}>
        <View style={styles.rowBetween}>
          <Text style={[typography.captionBold, { color: colors.text.secondary }]}>
            Blink Frequency & Distribution
          </Text>
          <Text style={[typography.caption, { color: colors.text.muted }]}>
            Avg {Math.round(rateHistory.reduce((a, b) => a + b, 0) / rateHistory.length)} bpm
          </Text>
        </View>
        <View style={styles.barGraphContainer}>
          {rateHistory.map((val, idx) => (
            <View key={idx} style={styles.barColumn}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(4, (val / maxRate) * 36),
                    backgroundColor: idx === rateHistory.length - 1 ? colors.primary : colors.surface3,
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Action Button */}
      <View style={{ marginTop: 16 }}>
        <PressableScale onPress={toggleStudio} scaleTo={0.96}>
          <SquircleSurface
            radius={16}
            fill={active ? colors.error : colors.primary}
            style={styles.actionBtn}
          >
            <Ionicons name={active ? 'stop' : 'videocam'} size={18} color="#FFF" />
            <Text style={[typography.bodyBold, { color: '#FFF', marginLeft: 8 }]}>
              {active ? 'Stop Eye Studio' : 'Start Eye Tracking Studio'}
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barGraphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 42,
    gap: 4,
    marginTop: 8,
  },
  barColumn: { flex: 1, alignItems: 'center' },
  bar: { width: '80%', borderRadius: 3 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 16,
  },
});
