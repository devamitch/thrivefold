/**
 * Full-screen live eye check, after BlinkQuest's ScannerHost: edge-to-edge front camera with
 * soft scrims, viewfinder corners, a status pill with the eye battery, a live open/closed eye
 * indicator, guidance, live metrics, an Eyes / Face / Both overlay switch, and glass
 * pause / stop / flip controls. Runs on Thrivefold's own MediaPipe camera module; frames are
 * analysed in memory and never stored.
 */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Linking, Modal, StyleSheet, Text, View, type NativeSyntheticEvent } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import type { PoseFrame } from '../../../modules/pose-landmarker';
import type { EyeState } from '../../domain/vision/eyeTracker';
import { PoseDetectionAdapter } from '../../features/beta-lab/experiments/pose-detection/PoseDetectionAdapter';
import { hapticLight } from '../../services/haptics';
import { useTheme } from '../../theme/useTheme';
import { GlassIconButton, GlassMarks, PlayPauseButton } from '../ui/GlassOrbButton';
import { PressableScale } from '../ui/PressableScale';
import { EyeOverlay } from './EyeOverlay';

type OverlayMode = 'eyes' | 'face' | 'both';
const CORNER = 34;
// Text and marks drawn over the live camera image stay white regardless of theme.
const ON_GLASS = '#FFFFFF';
const ON_GLASS_MUTED = 'rgba(255,255,255,0.72)';

export function EyeScanFullScreen({
  visible,
  eye,
  overlay,
  onPose,
  onStop,
}: {
  visible: boolean;
  eye: EyeState;
  overlay: { face?: number[]; w: number; h: number };
  onPose: (e: NativeSyntheticEvent<PoseFrame>) => void;
  onStop: () => void;
}) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [paused, setPaused] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [mode, setMode] = useState<OverlayMode>('eyes');
  const [error, setError] = useState<string | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const status = error ? 'error' : paused ? 'paused' : eye.tracked ? 'tracking' : 'no_face';
  const statusLabel = { error: 'Camera problem', paused: 'Paused', tracking: 'Tracking', no_face: 'Looking for you' }[status];
  const dot = { error: colors.error, paused: colors.warning, tracking: colors.success, no_face: colors.warning }[status];
  const zone = !eye.tracked
    ? '—'
    : eye.harmonZone === 'optimal'
      ? 'Good distance'
      : eye.harmonZone === 'too_close'
        ? 'Too close'
        : 'A bit far';
  const corners = status === 'tracking' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)';

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onStop}>
      <GestureHandlerRootView style={styles.ghRoot}>
        <View
          style={[styles.root, { backgroundColor: colors.text.primary }]}
          onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        >
          <PoseDetectionAdapter
            engine="default"
            active={visible && !paused}
            facing={facing}
            face
            hands={false}
            fit="cover"
            onPose={onPose}
            onPoseError={(e) => setError(e.nativeEvent.message)}
            style={StyleSheet.absoluteFill}
          />
          {!paused ? <EyeOverlay face={overlay.face} frameW={overlay.w} frameH={overlay.h} mode={mode} cover boxW={box.w} boxH={box.h} /> : null}

          {/* Soft scrims keep the glass controls legible over bright scenes. */}
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(0,0,0,0.38)', 'rgba(0,0,0,0)']}
            style={[styles.topScrim, { height: insets.top + 160 }]}
          />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
            style={[styles.bottomScrim, { height: insets.bottom + 340 }]}
          />

          {/* Viewfinder corners framing where the face should sit. */}
          <View pointerEvents="none" style={[styles.viewfinder, { top: insets.top + 70, bottom: insets.bottom + 320 }]}>
            {(
              [
                [{ left: 0, top: 0 }, '0deg'],
                [{ right: 0, top: 0 }, '90deg'],
                [{ right: 0, bottom: 0 }, '180deg'],
                [{ left: 0, bottom: 0 }, '270deg'],
              ] as const
            ).map(([pos, rotate]) => (
              <View key={rotate} style={[styles.corner, pos, { transform: [{ rotate }] }]}>
                <Svg width={CORNER} height={CORNER}>
                  <Path
                    d={`M1.5 ${CORNER} V12 Q1.5 1.5 12 1.5 H${CORNER}`}
                    stroke={corners}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
              </View>
            ))}
          </View>

          {/* Top bar */}
          <View style={[styles.topBar, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
            <GlassIconButton path={GlassMarks.chevronDown} accessibilityLabel="Close the eye check" onPress={onStop} />
            <View style={styles.pill}>
              <View style={[styles.dot, { backgroundColor: dot }]} />
              <Text style={[typography.captionBold, { color: ON_GLASS }]}>{statusLabel}</Text>
              <Text style={[typography.caption, { color: ON_GLASS_MUTED }]}>· {eye.batteryLevel.toFixed(0)}%</Text>
            </View>
            <GlassIconButton
              path={GlassMarks.flip}
              accessibilityLabel="Switch camera"
              onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
            />
          </View>

          {/* Live eye state */}
          {status === 'tracking' ? (
            <View style={[styles.eyeState, { top: insets.top + 72 }]} pointerEvents="none">
              <View style={[styles.eyeDot, { backgroundColor: eye.isOpen ? colors.success : colors.warning }]} />
              <Text style={[typography.captionBold, { color: ON_GLASS }]}>{eye.isOpen ? 'Eyes open' : 'Blink'}</Text>
            </View>
          ) : null}

          {/* Guidance */}
          {status !== 'tracking' || eye.activeAlert ? (
            <View style={[styles.guidance, { top: insets.top + 118 }]} pointerEvents="none">
              <Text style={[typography.caption, styles.center, { color: ON_GLASS }]}>
                {error
                  ? `${error}`
                  : paused
                    ? 'Paused. Nothing is measured until you resume.'
                    : !eye.tracked
                      ? "Centre your face in the frame, where you'd normally hold the phone"
                      : `${eye.activeAlert?.title}. ${eye.activeAlert?.body}`}
              </Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBox}>
              <PressableScale onPress={() => void Linking.openSettings()} style={styles.errorBtn}>
                <Text style={[typography.captionBold, { color: ON_GLASS }]}>Open Android settings</Text>
              </PressableScale>
            </View>
          ) : null}

          {/* Bottom controls */}
          <View style={[styles.bottom, { paddingBottom: insets.bottom + 18 }]} pointerEvents="box-none">
            <View style={styles.metrics}>
              <Metric value={eye.tracked ? `${eye.distanceCm.toFixed(0)} cm` : '—'} label={zone} />
              <Metric value={`${eye.blinksPerMin}`} label="blinks / min" />
              <Metric value={`${eye.blinkCount}`} label="blinks" />
              <Metric value={`${eye.batteryLevel.toFixed(0)}%`} label="eye battery" />
            </View>

            <View style={styles.segment}>
              {(['eyes', 'face', 'both'] as const).map((m) => (
                <PressableScale
                  key={m}
                  onPress={() => setMode(m)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: mode === m }}
                  scaleTo={0.95}
                  style={[styles.segmentItem, mode === m && { backgroundColor: ON_GLASS }]}
                >
                  <Text style={[typography.captionBold, { color: mode === m ? colors.text.primary : ON_GLASS }]}>
                    {m === 'eyes' ? 'Eyes' : m === 'face' ? 'Face' : 'Both'}
                  </Text>
                </PressableScale>
              ))}
            </View>

            <View style={styles.controls}>
              <View style={styles.control}>
                <GlassIconButton
                  path={GlassMarks.close}
                  accessibilityLabel="Close without saving"
                  onPress={onStop}
                  size={52}
                />
                <Text style={[typography.caption, { color: ON_GLASS_MUTED }]}>Close</Text>
              </View>
              <PlayPauseButton
                playing={!paused}
                variant="glass"
                size={76}
                accessibilityLabel={paused ? 'Resume' : 'Pause'}
                onPress={() => {
                  hapticLight();
                  setPaused((p) => !p);
                }}
              />
              <View style={styles.control}>
                <GlassIconButton path={GlassMarks.stop} accessibilityLabel="Stop and save" onPress={onStop} size={52} />
                <Text style={[typography.caption, { color: ON_GLASS_MUTED }]}>Save</Text>
              </View>
            </View>
            <Text style={[typography.caption, styles.center, { color: ON_GLASS_MUTED }]}>
              Eye comfort awareness only, not a medical device
            </Text>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  const { typography } = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={[typography.subheading, { color: ON_GLASS }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[typography.caption, { color: ON_GLASS_MUTED }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Android gives a Modal its own window; gestures there need their own root.
  ghRoot: { flex: 1 },
  root: { flex: 1 },
  center: { textAlign: 'center' },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0 },
  bottomScrim: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  viewfinder: { position: 'absolute', left: 36, right: 36 },
  corner: { position: 'absolute', width: CORNER, height: CORNER },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  eyeState: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  eyeDot: { width: 10, height: 10, borderRadius: 5 },
  guidance: {
    position: 'absolute',
    left: 32,
    right: 32,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  errorBox: { position: 'absolute', top: '45%', alignSelf: 'center' },
  errorBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.5)' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, gap: 14 },
  metrics: { flexDirection: 'row' },
  metric: { flex: 1, alignItems: 'center' },
  segment: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  segmentItem: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' },
  control: { alignItems: 'center', gap: 4 },
});
