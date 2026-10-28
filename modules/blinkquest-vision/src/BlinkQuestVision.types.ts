export type BlinkQuestVisionModuleEvents = {
  onVisionStatus: (params: VisionStatusEvent) => void
  onEyeLandmarks: (params: EyeLandmarksEvent) => void
  onPictureInPictureChange: (params: PictureInPictureEvent) => void
}

export type VisionStatusEvent = {
  status: "initializing" | "ready" | "stopped" | "error"
  message?: string
}

export type EyePoint = {
  x: number
  y: number
  z: number
}

export type FaceBounds = {
  xMin: number
  yMin: number
  xMax: number
  yMax: number
}

export type IrisLandmarks = {
  left: { x: number; y: number }
  right: { x: number; y: number }
}

/**
 * One Face Landmarker result. Two native contracts exist:
 * - v2 (current Kotlin runtime): `points`, `frameWidth/Height`, `inferenceMs`,
 *   optional `blendshapes` and `transformMatrix`; no derived metrics.
 * - v1 (original runtime): `eyeLandmarks` subset keyed by index, `iris`, and
 *   native blink/strain fields, which the JS engine ignores.
 */
export type EyeLandmarksEvent = {
  status: "face_detected" | "no_face" | "invalid"
  timestampMs: number
  faceCount: number
  faceBounds?: FaceBounds
  // v2
  points?: number[]
  frameWidth?: number
  frameHeight?: number
  inferenceMs?: number
  blendshapes?: Record<string, number>
  transformMatrix?: number[]
  message?: string
  // v1
  eyeLandmarks?: Record<string, EyePoint>
  iris?: IrisLandmarks
}

export type PictureInPictureEvent = {
  isInPictureInPicture: boolean
  isInPictureInPictureMode?: boolean
}

export type VisionRuntimeStats = {
  modelId: string
  modelLoaded: boolean
  modelInitMs: number
  framesReceived: number
  framesThrottled: number
  framesDroppedBusy: number
  framesSubmitted: number
  resultsReceived: number
  facesDetected: number
  inferenceErrors: number
  lastLatencyMs: number
  meanLatencyMs: number
  frameWidth: number
  frameHeight: number
  minFrameIntervalMs: number
  /** Mean luminance (0–255) of the last frame, and frames brightened for low light. */
  meanLuma?: number
  lowLightFrames?: number
  isInPictureInPicture: boolean
  autoPipEnabled: boolean
  lastError?: string
}

export type CameraIntrinsics = {
  cameraId: string
  focalLengthMm: number
  sensorWidthMm: number
  sensorHeightMm: number
  pixelArrayWidth: number
  pixelArrayHeight: number
}

export type DeviceTelemetry = {
  manufacturer: string
  model: string
  androidRelease: string
  sdkInt: number
  batteryPercent?: number
  isCharging?: boolean
  /** PowerManager.THERMAL_STATUS_* (0 none … 6 shutdown), API 29+. */
  thermalStatus?: number
  memoryAvailableBytes?: number
  memoryTotalBytes?: number
  memoryLow?: boolean
  appHeapUsedBytes?: number
  appHeapMaxBytes?: number
  appVersion?: string
  appBuild?: number
}
