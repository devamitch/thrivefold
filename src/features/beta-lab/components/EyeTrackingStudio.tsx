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
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { NativeSyntheticEvent } from 'react-native';

import { PressableScale } from '../../../components/ui/PressableScale';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { EyeTrackerSession, type EyeState } from '../../../domain/vision/eyeTracker';
import { EyeOverlay } from '../../../components/vision/EyeOverlay';
import { PoseDetectionAdapter } from '../experiments/pose-detection/PoseDetectionAdapter';
import { coachVoice } from '../../../services/ai/coachVoice';
import { hapticLight, hapticSuccess, hapticSelection } from '../../../services/haptics';
import { useTheme } from '../../../theme/useTheme';
import { getSanctuaryIllustration } from '../../../utils/illustrationResolver';
import { VisualAcuityChart } from './VisualAcuityChart';
import { BlinkBloomExercise } from './BlinkBloomExercise';
import { NearFarFocusExercise } from './NearFarFocusExercise';
import type { PoseFrame } from '../../../../modules/pose-landmarker';
import { ensureCameraPermission } from '../../../services/sensors/cameraPermission';
import { recordBetaSession } from '../../../services/beta/recordSession';

type StudioMode = 'scanner' | 'bloom' | 'nearfar' | 'acuity';

export function EyeTrackingStudio() {
  const { colors, typography, spacing, experience } = useTheme();
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState<StudioMode>('scanner');
  const [eyeState, setEyeState] = useState<EyeState>(() => new EyeTrackerSession().processFace(undefined));
  // Blinks/min sampled every 3 s while a face is tracked; starts empty, never seeded.
  const [rateHistory, setRateHistory] = useState<number[]>([]);
  const session = useRef({ startedAt: 0, trackedFrames: 0, distanceSum: 0 });

  const tracker = useRef(new EyeTrackerSession());
  const prevBlinkRef = useRef(0);
  const lastCoachLineRef = useRef(0);
  const lastAlertAtRef = useRef(0);

  const [overlay, setOverlay] = useState<{ face?: number[]; w: number; h: number }>({ w: 0, h: 0 });
  const onPose = useCallback((e: NativeSyntheticEvent<PoseFrame>) => {
    const frame = e.nativeEvent;
    setOverlay({ face: frame.face, w: frame.frameWidth, h: frame.frameHeight });
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
      recordBetaSession({
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
  }, [mode]);

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

  const [camError, setCamError] = useState<string | null>(null);
  const zoneLabel = !eyeState.tracked
    ? 'No face yet'
    : eyeState.harmonZone === 'optimal'
      ? 'Good distance'
      : eyeState.harmonZone === 'too_close'
        ? 'Too close'
        : 'A bit far';
  const zoneColor =
    eyeState.harmonZone === 'optimal'
      ? colors.success
      : eyeState.harmonZone === 'too_close'
        ? colors.error
        : colors.warning;
  const current = MODES.find((m) => m.key === mode) ?? MODES[0];

  return (
    <View>
      {/* Preview: illustration until the camera runs for a guided exercise. */}
      <View style={[styles.cameraContainer, { backgroundColor: colors.surface2 }]}>
        {active && mode !== 'scanner' ? (
          <PoseDetectionAdapter
            engine="default"
            active={active}
            facing="front"
            face
            hands={false}
            onPose={onPose}
            onPoseError={(e) => setCamError(e.nativeEvent.message)}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <Image
            source={getSanctuaryIllustration('eyeVision', experience)}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        )}
        {active && mode !== 'scanner' ? (
          <View style={styles.hudOverlay}>
            <View style={[styles.hudPill, { backgroundColor: colors.scrim }]}>
              <Text style={[typography.captionBold, { color: colors.text.inverse }]}>
                {camError ??
                  (eyeState.tracked ? `${zoneLabel} · ${eyeState.distanceCm.toFixed(0)} cm` : 'Looking for your face')}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Pick an activity: one clear list instead of a cramped tab strip. */}
      <View style={styles.modeList}>
        {MODES.map((m) => {
          const on = m.key === mode;
          return (
            <PressableScale
              key={m.key}
              onPress={() => {
                hapticSelection();
                if (active && m.key !== mode) void toggleStudio();
                setMode(m.key);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[
                styles.modeTile,
                {
                  backgroundColor: on ? colors.primaryAlpha : colors.surface,
                  borderColor: on ? colors.primary : colors.surface2,
                },
              ]}
            >
              <View style={[styles.modeIcon, { backgroundColor: on ? colors.primary : colors.surface2 }]}>
                <Ionicons name={m.icon} size={20} color={on ? colors.text.inverse : colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{m.title}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>{m.body}</Text>
              </View>
              {on ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
            </PressableScale>
          );
        })}
      </View>

      {/* Live check runs full screen with the eyes outlined; the guided exercises keep a small camera. */}
      <Modal
        visible={active && mode === 'scanner'}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => void toggleStudio()}
      >
        <View style={[styles.full, { backgroundColor: colors.text.primary }]}>
          <PoseDetectionAdapter
            engine="default"
            active={active && mode === 'scanner'}
            facing="front"
            face
            hands={false}
            onPose={onPose}
            onPoseError={(e) => setCamError(e.nativeEvent.message)}
            style={StyleSheet.absoluteFill}
          />
          <EyeOverlay face={overlay.face} frameW={overlay.w} frameH={overlay.h} />
          <View style={styles.fullTop}>
            <View style={[styles.fullChip, { backgroundColor: eyeState.tracked ? colors.success : colors.scrim }]}>
              <Text style={[typography.captionBold, { color: colors.text.inverse }]}>
                {camError ?? (eyeState.tracked ? 'Tracking your eyes' : 'Bring your face into view')}
              </Text>
            </View>
          </View>
          <View style={[styles.fullPanel, { backgroundColor: colors.scrim }]}>
            {/* Two scrim layers keep white text readable over a bright camera image in light mode. */}
            <View style={[StyleSheet.absoluteFill, styles.fullPanelShade, { backgroundColor: colors.scrim }]} />
            <View style={styles.fullStats}>
              <FullStat label={zoneLabel} value={eyeState.tracked ? `${eyeState.distanceCm.toFixed(0)} cm` : '—'} />
              <FullStat label="blinks a minute" value={`${eyeState.blinksPerMin}`} />
              <FullStat label="eye battery" value={`${eyeState.batteryLevel.toFixed(0)}%`} />
            </View>
            <Text style={[typography.body, { color: colors.text.inverse, marginTop: 10, opacity: 0.9 }]}>
              {eyeState.recommendation}
            </Text>
            {eyeState.activeAlert ? (
              <Text style={[typography.bodyBold, { color: colors.warning, marginTop: 6 }]}>
                {eyeState.activeAlert.title}
              </Text>
            ) : null}
            <PressableScale
              onPress={() => void toggleStudio()}
              style={[styles.fullStop, { backgroundColor: colors.primary }]}
              accessibilityLabel="Stop and save"
            >
              <Ionicons name="stop" size={18} color={colors.text.inverse} />
              <Text style={[typography.bodyBold, { color: colors.text.inverse, marginLeft: 8 }]}>Stop and save</Text>
            </PressableScale>
          </View>
        </View>
      </Modal>

      {eyeState.activeAlert ? (
        <View
          style={[
            styles.alertBanner,
            {
              backgroundColor:
                eyeState.activeAlert.severity === 'critical' ? colors.errorSurface : colors.warningSurface,
            },
          ]}
        >
          <Ionicons
            name={eyeState.activeAlert.severity === 'critical' ? 'alert-circle' : 'warning-outline'}
            size={18}
            color={eyeState.activeAlert.severity === 'critical' ? colors.error : colors.warning}
          />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[typography.captionBold, { color: colors.text.primary }]}>{eyeState.activeAlert.title}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 1 }]}>
              {eyeState.activeAlert.body}
            </Text>
          </View>
          <PressableScale onPress={() => tracker.current.dismissAlert()} accessibilityLabel="Dismiss">
            <Ionicons name="close" size={16} color={colors.text.muted} />
          </PressableScale>
        </View>
      ) : null}

      {mode === 'scanner' && (eyeState.blinkCount > 0 || rateHistory.length > 0) ? (
        <SquircleSurface radius={20} fill={colors.surface} style={styles.card}>
          <Text style={[typography.captionBold, { color: colors.text.muted }]}>LAST CHECK</Text>
          <View style={styles.statsRow}>
            <Stat
              label={zoneLabel}
              value={eyeState.tracked ? `${eyeState.distanceCm.toFixed(0)} cm` : '—'}
              color={zoneColor}
            />
            <Stat label="blinks a minute" value={`${eyeState.blinksPerMin}`} color={colors.text.primary} />
            <Stat
              label={`${eyeState.strainLevel} strain`}
              value={`${eyeState.batteryLevel.toFixed(0)}%`}
              color={colors.primary}
            />
          </View>
          {rateHistory.length ? (
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
          ) : null}
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 10 }]}>
            {eyeState.recommendation}
          </Text>
        </SquircleSurface>
      ) : null}

      {mode === 'bloom' && (
        <BlinkBloomExercise blinkCount={eyeState.blinkCount} isOpen={eyeState.isOpen} earAvg={eyeState.earAvg} />
      )}
      {mode === 'nearfar' && <NearFarFocusExercise />}
      {mode === 'acuity' && <VisualAcuityChart distanceCm={eyeState.tracked ? eyeState.distanceCm : undefined} />}

      {denied ? (
        <Text style={[typography.caption, { color: colors.error, marginTop: 12 }]}>
          Camera access was not allowed. Allow it in Android settings to use eye tracking.
        </Text>
      ) : null}

      {current.camera ? (
        <PressableScale onPress={toggleStudio} scaleTo={0.97} style={{ marginTop: 16 }}>
          <SquircleSurface radius={18} fill={active ? colors.error : colors.primary} style={styles.actionBtn}>
            <Ionicons name={active ? 'stop' : 'eye'} size={20} color={colors.text.inverse} />
            <Text style={[typography.bodyBold, { color: colors.text.inverse, marginLeft: 8 }]}>
              {active ? 'Stop and save' : current.start}
            </Text>
          </SquircleSurface>
        </PressableScale>
      ) : null}
    </View>
  );
}

const MODES: {
  key: StudioMode;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
  start: string;
  camera: boolean;
}[] = [
  {
    key: 'scanner',
    icon: 'scan-outline',
    title: 'Live eye check',
    body: 'Distance, blinks and eye battery, full screen',
    start: 'Start live eye check',
    camera: true,
  },
  {
    key: 'bloom',
    icon: 'flower-outline',
    title: 'Blink Bloom',
    body: 'Slow, full blinks grow a flower',
    start: 'Start Blink Bloom',
    camera: true,
  },
  {
    key: 'nearfar',
    icon: 'swap-horizontal-outline',
    title: '20-20-20 break',
    body: 'Look 6 metres away for 20 seconds',
    start: '',
    camera: false,
  },
  {
    key: 'acuity',
    icon: 'text-outline',
    title: 'Reading chart',
    body: 'A quick letter chart at your distance',
    start: '',
    camera: false,
  },
];

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={[typography.heading, { color }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
    </View>
  );
}

function FullStat({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={[typography.heading, { color: colors.text.inverse }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.text.inverse, opacity: 0.75 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  full: { flex: 1 },
  fullTop: { position: 'absolute', top: 52, left: 0, right: 0, alignItems: 'center' },
  fullChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  fullPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  fullPanelShade: { borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  fullStats: { flexDirection: 'row' },
  fullStop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 18,
    marginTop: 16,
  },
  modeList: { gap: 10, marginTop: 4 },
  modeTile: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, borderWidth: 1 },
  modeIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
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
    aspectRatio: 16 / 9,
    marginBottom: 14,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderWrap: {
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
    borderRadius: 22,
  },
});
