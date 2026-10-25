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
  /** Size of the analysed (upright, mirrored for the front camera) frame, for overlay mapping. */
  frameWidth: number;
  frameHeight: number;
  /** Selected face points as flat [x, y, ...] in FACE_INDICES order; empty when off or no face. */
  face?: number[];
  /** Up to two hands, each flat [x, y] * 21 (MediaPipe hand order); empty when off. */
  hands?: number[][];
}

/** Slices of `face`, by point count, in the order the native view sends them. */
export const FACE_GROUPS = {
  leftEye: [0, 16],
  rightEye: [16, 32],
  irises: [32, 42],
  leftBrow: [42, 52],
  rightBrow: [52, 62],
  lips: [62, 82],
  outline: [82, 118],
} as const;

/** MediaPipe hand bones (21 points). */
export const HAND_BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

export interface PoseCameraViewProps extends ViewProps {
  active: boolean;
  facing?: 'front' | 'back';
  /** Also track the face (eyes, irises, brows, lips, outline). */
  face?: boolean;
  /** Also track up to two hands. */
  hands?: boolean;
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
