import { Platform } from "react-native"
import { NativeModule, requireNativeModule } from "expo"

import type {
  BlinkQuestVisionModuleEvents,
  CameraIntrinsics,
  DeviceTelemetry,
  VisionRuntimeStats,
} from "./BlinkQuestVision.types"

declare class BlinkQuestVisionModule extends NativeModule<BlinkQuestVisionModuleEvents> {
  initializeFaceLandmarker(): Promise<boolean>
  stopFaceLandmarker(): Promise<void>
  isPictureInPictureSupported(): Promise<boolean>
  isInPictureInPictureMode(): Promise<boolean>
  enterPictureInPicture(width?: number, height?: number): Promise<boolean>
  setPictureInPictureParams(width?: number, height?: number): Promise<boolean>
  // Present only in the v2 native runtime; callers must feature-check.
  setAutoPictureInPicture?(enabled: boolean, width?: number, height?: number): Promise<boolean>
  /** Camera rectangle in window pixels; Android animates it into the PiP window. */
  setPipSourceRect?(x: number, y: number, width: number, height: number): Promise<boolean>
  getRuntimeStats?(): Promise<VisionRuntimeStats>
  getDeviceTelemetry?(): Promise<DeviceTelemetry>
  getFrontCameraIntrinsics?(): Promise<CameraIntrinsics | null>
}

/**
 * BlinkQuestVision is implemented in Kotlin for Android only. Calling
 * requireNativeModule on iOS/web throws at import time, which previously
 * crashed the app on every non-Android platform since this module is
 * imported unconditionally from the always-mounted scanner host.
 * On unsupported platforms we export a no-op stub with the same shape
 * instead of the native binding.
 */
const BlinkQuestVision: BlinkQuestVisionModule =
  Platform.OS === "android"
    ? requireNativeModule<BlinkQuestVisionModule>("BlinkQuestVision")
    : ({
        initializeFaceLandmarker: async () => false,
        stopFaceLandmarker: async () => undefined,
        isPictureInPictureSupported: async () => false,
        isInPictureInPictureMode: async () => false,
        enterPictureInPicture: async () => false,
        setPictureInPictureParams: async () => false,
        addListener: () => ({ remove: () => undefined }),
        removeListener: () => undefined,
        removeAllListeners: () => undefined,
        emit: () => undefined,
        listenerCount: () => 0,
      } as unknown as BlinkQuestVisionModule)

export default BlinkQuestVision
