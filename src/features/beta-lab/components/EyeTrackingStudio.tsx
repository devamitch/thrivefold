/**
 * EyeTrackingStudio.tsx — Complete Eye Tracking, Ergonomics & Vision Wellness Studio.
 *
 * Modeled after BlinkQuest's eye metrics suite:
 * - Real-time Eye Aspect Ratio (EAR) & Blink frequency
 * - Iris-calibrated Harmon reading distance (~35-45 cm)
 * - Downward gaze inclination angle (15°-25° dry-eye prevention)
 * - Daily Eye Battery drain & recharge model
 * - Interactive Blink Bloom, 20-20-20 Near/Far, and Visual Acuity Optotype routines
 * - On-device, local-first, zero cloud transmission.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeSyntheticEvent } from 'react-native';

import { PressableScale } from '../../../components/ui/PressableScale';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { EyeTrackerSession, type EyeState } from '../../../domain/vision/eyeTracker';
import { PoseDetectionAdapter } from '../experiments/pose-detection/PoseDetectionAdapter';
import { coachVoice } from '../../../services/ai/coachVoice';
import { hapticLight, hapticSuccess, hapticSelection } from '../../../services/haptics';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';
import { VisualAcuityChart } from './VisualAcuityChart';
import { BlinkBloomExercise } from './BlinkBloomExercise';
import { NearFarFocusExercise } from './NearFarFocusExercise';
import type { PoseFrame } from '../../../../modules/pose-landmarker';
import { ensureCameraPermission } from '../../../services/sensors/cameraPermission';

type StudioMode = 'scanner' | 'bloom' | 'nearfar' | 'acuity';

export function EyeTrackingStudio() {
  const { colors, typography, spacing } = useTheme();
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState<StudioMode>('scanner');
  const [eyeState, setEyeState] = useState<EyeState>(() => new EyeTrackerSession().processFace(undefined));
  // Blinks/min sampled every 3 s while a face is tracked; starts empty, never seeded.
  const [rateHistory, setRateHistory] = useState<number[]>([]);
  const addBetaSession = useRootStore((s) => s.addBetaSession);
  const session = useRef({ startedAt: 0, trackedFrames: 0, distanceSum: 0 });

  const tracker = useRef(new EyeTrackerSession());
  const prevBlinkRef = useRef(0);
  const lastCoachLineRef = useRef(0);
  const lastAlertAtRef = useRef(0);

  const onPose = useCallback((e: NativeSyntheticEvent<PoseFrame>) => {
    const frame = e.nativeEvent;
    const next = tracker.current.processFace(frame.face);
    setEyeState(next);
    // The coach says each new comfort alert once (the alert engine already applies cooldowns).
    if (next.activeAlert && next.activeAlert.at !== lastAlertAtRef.current) {
      lastAlertAtRef.current = next.activeAlert.at;
      void coachVoice.speak(`${next.activeAlert.title}. ${next.activeAlert.body}`, { priority: 3 });
    }
    if (next.tracked) {
      session.current.trackedFrames += 1;
      session.current.distanceSum += next.distanceCm;
    }

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

  // Sample the measured rate every 3 s, only while a face is in view.
  const latest = useRef(eyeState);
  latest.current = eyeState;
  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      if (latest.current.tracked) setRateHistory((prev) => [...prev.slice(-19), latest.current.blinksPerMin]);
    }, 3000);
    return () => clearInterval(iv);
  }, [active]);

  const finishSession = useCallback(() => {
    const st = session.current;
    const endedAt = Date.now();
    // Keep only sessions long enough to mean something: 20 s with a face in view.
    if (st.startedAt && endedAt - st.startedAt >= 20_000 && st.trackedFrames >= 60) {
      addBetaSession({
        kind: mode === 'bloom' ? 'blink_bloom' : 'eye_scan',
        startedAt: st.startedAt,
        endedAt,
        metrics: {
          blinks: latest.current.blinkCount,
          blinksPerMin: Math.round((latest.current.blinkCount / (endedAt - st.startedAt)) * 60_000),
          distanceCm: Math.round(st.distanceSum / st.trackedFrames),
        },
      });
    }
    session.current = { startedAt: 0, trackedFrames: 0, distanceSum: 0 };
  }, [addBetaSession, mode]);

  // Leaving the screen ends the camera; save what was measured.
  const finishRef = useRef(finishSession);
  finishRef.current = finishSession;
  useEffect(() => () => finishRef.current(), []);

  const [denied, setDenied] = useState(false);
  const toggleStudio = async () => {
    hapticLight();
    if (!active) {
      const ok = await ensureCameraPermission();
      setDenied(!ok);
      if (!ok) return;
      tracker.current.reset();
      prevBlinkRef.current = 0;
      setRateHistory([]);
      session.current = { startedAt: Date.now(), trackedFrames: 0, distanceSum: 0 };
      setActive(true);
      void coachVoice.speak('Eye tracking studio active. Look straight and blink naturally.', { priority: 3 });
    } else {
      setActive(false);
      coachVoice.stop();
      finishSession();
    }
  };

  const maxRate = Math.max(25, ...rateHistory);

  return (
    <SquircleSurface radius={24} fill={colors.surface} style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="eye-outline" size={20} color={colors.primary} />
        <Text style={[typography.subheading, { color: colors.text.primary, flex: 1, marginLeft: 8 }]}>
          Eye Tracking & Blink Studio
        </Text>
        <SquircleSurface radius={8} fill={colors.primaryAlpha} style={styles.pill}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>BlinkQuest Modules</Text>
        </SquircleSurface>
      </View>

      {/* Mode Selector Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface2 }]}>
        <PressableScale
          onPress={() => {
            hapticSelection();
            setMode('scanner');
          }}
          style={[styles.tabItem, mode === 'scanner' && { backgroundColor: colors.surface }]}
        >
          <Text
            style={[
              typography.captionBold,
              { color: mode === 'scanner' ? colors.primary : colors.text.secondary },
            ]}
          >
            Live Monitor
          </Text>
        </PressableScale>

        <PressableScale
          onPress={() => {
            hapticSelection();
            setMode('bloom');
          }}
          style={[styles.tabItem, mode === 'bloom' && { backgroundColor: colors.surface }]}
        >
          <Text
            style={[
              typography.captionBold,
              { color: mode === 'bloom' ? colors.primary : colors.text.secondary },
            ]}
          >
            Blink Bloom
          </Text>
        </PressableScale>

        <PressableScale
          onPress={() => {
            hapticSelection();
            setMode('nearfar');
          }}
          style={[styles.tabItem, mode === 'nearfar' && { backgroundColor: colors.surface }]}
        >
          <Text
            style={[
              typography.captionBold,
              { color: mode === 'nearfar' ? colors.primary : colors.text.secondary },
            ]}
          >
            20-20-20 Break
          </Text>
        </PressableScale>

        <PressableScale
          onPress={() => {
            hapticSelection();
            setMode('acuity');
          }}
          style={[styles.tabItem, mode === 'acuity' && { backgroundColor: colors.surface }]}
        >
          <Text
            style={[
              typography.captionBold,
              { color: mode === 'acuity' ? colors.primary : colors.text.secondary },
            ]}
          >
            Visual Acuity
          </Text>
        </PressableScale>
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
            <Text style={[typography.body, { color: '#AAA', marginTop: 6 }]}>Camera Scanner Inactive</Text>
            <Text style={[typography.caption, { color: '#777', marginTop: 2, textAlign: 'center' }]}>
              Tracks viewing distance, gaze inclination, and EAR on-device
            </Text>
          </View>
        )}

        {/* HUD Overlay Badges when active */}
        {active && (
          <View style={styles.hudOverlay}>
            <View style={[styles.hudPill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
              <Ionicons name="resize-outline" size={12} color="#FFF" />
              <Text style={[typography.captionBold, { color: '#FFF', marginLeft: 4 }]}>
                {eyeState.tracked ? `~${eyeState.distanceCm.toFixed(0)} cm` : 'Looking for your face'}
              </Text>
            </View>
            <View style={[styles.hudPill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
              <Ionicons name="battery-charging-outline" size={12} color="#4CAF50" />
              <Text style={[typography.captionBold, { color: '#4CAF50', marginLeft: 4 }]}>
                {eyeState.batteryLevel.toFixed(0)}% Battery
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Alert Banner if active */}
      {eyeState.activeAlert && (
        <View
          style={[
            styles.alertBanner,
            {
              backgroundColor:
                eyeState.activeAlert.severity === 'critical'
                  ? colors.errorSurface
                  : colors.warningSurface,
            },
          ]}
        >
          <Ionicons
            name={eyeState.activeAlert.severity === 'critical' ? 'alert-circle' : 'warning-outline'}
            size={18}
            color={eyeState.activeAlert.severity === 'critical' ? colors.error : colors.warning}
          />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text
              style={[
                typography.captionBold,
                {
                  color:
                    eyeState.activeAlert.severity === 'critical' ? colors.error : colors.warning,
                },
              ]}
            >
              {eyeState.activeAlert.title}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 1 }]}>
              {eyeState.activeAlert.body}
            </Text>
          </View>
          <PressableScale onPress={() => tracker.current.dismissAlert()}>
            <Ionicons name="close" size={16} color={colors.text.muted} />
          </PressableScale>
        </View>
      )}

      {/* Mode-specific content */}
      {mode === 'scanner' && (
        <>
          {/* Metrics Grid */}
          <View style={[styles.statsRow, { backgroundColor: colors.surface2 }]}>
            <View style={styles.statItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Distance</Text>
              <Text style={[typography.heading, { color: colors.text.primary, fontSize: 18 }]}>
                {eyeState.tracked ? `~${eyeState.distanceCm.toFixed(0)}` : '—'} <Text style={{ fontSize: 11 }}>cm</Text>
              </Text>
              <Text
                style={[
                  typography.caption,
                  {
                    color:
                      eyeState.harmonZone === 'optimal'
                        ? colors.success
                        : eyeState.harmonZone === 'too_close'
                          ? colors.error
                          : colors.primary,
                    fontSize: 10,
                  },
                ]}
              >
                {!eyeState.tracked
                  ? 'No face'
                  : eyeState.harmonZone === 'optimal'
                  ? 'Harmon Zone'
                  : eyeState.harmonZone === 'too_close'
                    ? 'Too Close'
                    : 'Comfort Far'}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Blinks</Text>
              <Text style={[typography.heading, { color: colors.text.primary, fontSize: 18 }]}>
                {eyeState.blinksPerMin} <Text style={{ fontSize: 11 }}>/min</Text>
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted, fontSize: 10 }]}>
                {eyeState.blinkCount} total
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Gaze Angle</Text>
              <Text style={[typography.heading, { color: colors.text.primary, fontSize: 18 }]}>
                {eyeState.tracked ? `${eyeState.gazeAngleDeg.toFixed(0)}°` : '—'}
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted, fontSize: 10 }]}>
                {eyeState.gaze}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Eye Battery</Text>
              <Text style={[typography.heading, { color: colors.primary, fontSize: 18 }]}>
                {eyeState.batteryLevel.toFixed(0)}%
              </Text>
              <Text
                style={[
                  typography.caption,
                  {
                    color:
                      eyeState.strainLevel === 'high'
                        ? colors.error
                        : eyeState.strainLevel === 'moderate'
                          ? colors.warning
                          : colors.success,
                    fontSize: 10,
                    textTransform: 'uppercase',
                  },
                ]}
              >
                {eyeState.strainLevel}
              </Text>
            </View>
          </View>

          {/* Blink Rate Sparkline / Bar Graph */}
          <View style={{ marginTop: 14 }}>
            <View style={styles.rowBetween}>
              <Text style={[typography.captionBold, { color: colors.text.secondary }]}>
                Blink Frequency & Distribution
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                {rateHistory.length
                  ? `Avg ${Math.round(rateHistory.reduce((a, b) => a + b, 0) / rateHistory.length)} /min`
                  : active
                    ? 'Measuring…'
                    : 'Start the camera to measure'}
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

          {/* Ergonomic Recommendation */}
          <View style={[styles.recommendationBox, { backgroundColor: colors.surface2 }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={[typography.caption, { color: colors.text.secondary, flex: 1, marginLeft: 6 }]}>
              {eyeState.recommendation}
            </Text>
          </View>
        </>
      )}

      {mode === 'bloom' && (
        <BlinkBloomExercise
          blinkCount={eyeState.blinkCount}
          isOpen={eyeState.isOpen}
          earAvg={eyeState.earAvg}
        />
      )}

      {mode === 'nearfar' && <NearFarFocusExercise />}

      {mode === 'acuity' && <VisualAcuityChart distanceCm={eyeState.tracked ? eyeState.distanceCm : undefined} />}

      {denied ? (
        <Text style={[typography.caption, { color: colors.error, marginTop: 12 }]}>
          Camera access was not allowed. Allow it in Android settings to use eye tracking.
        </Text>
      ) : null}

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
              {active ? 'Stop Camera Session' : 'Start Eye Camera Scanner'}
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
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: { alignItems: 'center', paddingHorizontal: 20 },
  hudOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
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
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 16,
  },
});
