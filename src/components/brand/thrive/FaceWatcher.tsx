import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, type NativeSyntheticEvent } from 'react-native';

import type { PoseFrame } from '../../../../modules/pose-landmarker';
import { PoseDetectionAdapter } from '../../../features/beta-lab/experiments/pose-detection/PoseDetectionAdapter';
import { ensureCameraPermission } from '../../../services/sensors/cameraPermission';
import { useTheme } from '../../../theme/useTheme';
import type { FaceSignal } from './types';

/**
 * On-device face signals from the app's own MediaPipe camera (no network): smile, eyes open,
 * head angles, position and distance. Frames are read in memory and never stored.
 */
export function FaceWatcher({
  active,
  onSignal,
  width = 132,
  height = 176,
  mirror = true,
}: {
  active: boolean;
  onSignal: (s: FaceSignal) => void;
  width?: number;
  height?: number;
  /** Flip this if the character's gaze goes the wrong way. */
  mirror?: boolean;
}) {
  const { colors } = useTheme();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    void ensureCameraPermission().then((ok) => alive && setAllowed(ok));
    return () => {
      alive = false;
    };
  }, [active]);

  const onPose = useCallback(
    (e: NativeSyntheticEvent<PoseFrame>) => {
      const f = e.nativeEvent;
      const pts = f.face ?? [];
      if (pts.length < 4) {
        onSignal({ present: false, smile: 0, eyesOpen: 1, yaw: 0, pitch: 0, roll: 0, x: 0, y: 0, size: 0 });
        return;
      }
      let minX = 1;
      let maxX = 0;
      let minY = 1;
      let maxY = 0;
      for (let i = 0; i + 1 < pts.length; i += 2) {
        minX = Math.min(minX, pts[i]);
        maxX = Math.max(maxX, pts[i]);
        minY = Math.min(minY, pts[i + 1]);
        maxY = Math.max(maxY, pts[i + 1]);
      }
      const b = f.blendshapes ?? {};
      const cx = (minX + maxX) - 1; // centre mapped to -1..1
      onSignal({
        present: true,
        smile: ((b.mouthSmileLeft ?? 0) + (b.mouthSmileRight ?? 0)) / 2,
        eyesOpen: 1 - ((b.eyeBlinkLeft ?? 0) + (b.eyeBlinkRight ?? 0)) / 2,
        yaw: f.head?.yaw ?? 0,
        pitch: f.head?.pitch ?? 0,
        roll: 0,
        x: mirror ? -cx : cx,
        y: minY + maxY - 1,
        size: maxY - minY,
      });
    },
    [onSignal, mirror],
  );

  if (!active || !allowed) return null;
  return (
    <View style={[styles.box, { width, height, backgroundColor: colors.surface2 }]}>
      <PoseDetectionAdapter
        engine="default"
        active
        facing="front"
        face
        hands={false}
        minIntervalMs={80}
        onPose={onPose}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 22, borderCurve: 'continuous', overflow: 'hidden' },
});
