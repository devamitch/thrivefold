import { requireNativeModule, requireNativeView } from 'expo';
import type React from 'react';
import { Platform, type NativeSyntheticEvent, type ViewProps } from 'react-native';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseFrame {
  timestamp: number;
  /** 33 MediaPipe pose landmarks, normalized to the frame; empty when nobody is in view. */
  landmarks: PoseLandmark[];
}

export interface PoseCameraViewProps extends ViewProps {
  active: boolean;
  facing?: 'front' | 'back';
  onPose?: (event: NativeSyntheticEvent<PoseFrame>) => void;
  onPoseError?: (event: NativeSyntheticEvent<{ code: string; message: string }>) => void;
}

interface PoseLandmarkerNative {
  isAvailable(): boolean;
  modelVersion(): string;
}

const native: PoseLandmarkerNative | null =
  Platform.OS === 'android'
    ? (() => {
        try {
          return requireNativeModule<PoseLandmarkerNative>('PoseLandmarker');
        } catch {
          return null;
        }
      })()
    : null;

export const PoseCameraView: React.ComponentType<PoseCameraViewProps> | null = native
  ? requireNativeView<PoseCameraViewProps>('PoseLandmarker')
  : null;

/** True when this build has the native adapter and its model. */
export const poseLandmarkerAvailable = (): boolean => {
  try {
    return native?.isAvailable() ?? false;
  } catch {
    return false;
  }
};

export const poseModelVersion = (): string | null => native?.modelVersion() ?? null;
