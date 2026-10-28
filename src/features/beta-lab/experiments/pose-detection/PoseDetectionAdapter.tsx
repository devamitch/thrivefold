import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, type NativeSyntheticEvent } from 'react-native';
import { PoseCameraView, type PoseFrame, type PoseCameraViewProps, poseLandmarkerAvailable } from 'pose-landmarker';
import type { PoseEngineOption } from '../../flags/betaFlags';

export interface PoseDetectionAdapterProps {
  engine: PoseEngineOption;
  active: boolean;
  facing?: 'front' | 'back';
  face?: boolean;
  hands?: boolean;
  minIntervalMs?: number;
  onPose?: (event: NativeSyntheticEvent<PoseFrame>) => void;
  onPoseError?: (event: NativeSyntheticEvent<{ code: string; message: string }>) => void;
  onPoseReady?: (event: NativeSyntheticEvent<{ delegate: 'gpu' | 'cpu' }>) => void;
  style?: any;
}

export const isPoseEngineAvailable = (engine: PoseEngineOption): boolean => {
  if (engine === 'default') {
    return Boolean(PoseCameraView) && poseLandmarkerAvailable();
  }
  // Experimental engine check
  return Boolean(PoseCameraView) && poseLandmarkerAvailable();
};

export const PoseDetectionAdapter = memo(function PoseDetectionAdapter({
  engine,
  active,
  facing = 'front',
  face = false,
  hands = false,
  minIntervalMs = 0,
  onPose,
  onPoseError,
  onPoseReady,
  style,
}: PoseDetectionAdapterProps) {
  const handleError = useCallback(
    (e: NativeSyntheticEvent<{ code: string; message: string }>) => {
      onPoseError?.(e);
    },
    [onPoseError],
  );

  if (!PoseCameraView || !poseLandmarkerAvailable()) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackTitle}>Camera Engine Unavailable</Text>
        <Text style={styles.fallbackSubtitle}>
          Native pose detection module is not supported or linked on this build.
        </Text>
      </View>
    );
  }

  // Face and hand tracking follow the caller on every engine; the eye, face and hand studios rely on them.
  return (
    <PoseCameraView
      style={style}
      active={active}
      facing={facing}
      face={face}
      hands={hands}
      minIntervalMs={Math.max(0, minIntervalMs)}
      onPose={onPose}
      onPoseError={handleError}
      onPoseReady={onPoseReady}
    />
  );
});

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    padding: 24,
  },
  fallbackTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  fallbackSubtitle: {
    color: '#AAAAAA',
    fontSize: 13,
    textAlign: 'center',
  },
});

export default PoseDetectionAdapter;
