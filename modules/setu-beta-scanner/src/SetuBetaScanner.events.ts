/**
 * Event types emitted by the Setu Beta Scanner module
 */

import type {
  BetaFeatureCapability,
  BetaModelStatus,
  BetaResult,
  BetaScannerError,
  BetaSessionState,
  BetaMeasurementQuality,
} from "./SetuBetaScanner.types"

export type BetaEventName =
  | "onCapabilityChanged"
  | "onSessionStateChanged"
  | "onCameraReady"
  | "onModelReady"
  | "onResult"
  | "onMeasurementQualityChanged"
  | "onSessionWarning"
  | "onSessionError"
  | "onRecordingStateChanged"

export interface CapabilityChangedEvent {
  capabilities: BetaFeatureCapability[]
}

export interface SessionStateChangedEvent {
  sessionId: string
  state: BetaSessionState
  timestampMs: number
}

export interface CameraReadyEvent {
  cameraId: string
  position: "front" | "back"
  width: number
  height: number
  fps: number
}

export interface ModelReadyEvent {
  modelId: string
  status: BetaModelStatus
}

export interface ResultEvent {
  sessionId: string
  result: BetaResult
}

export interface MeasurementQualityChangedEvent {
  sessionId: string
  metricId: string
  quality: BetaMeasurementQuality
  reason?: string
}

export interface SessionWarningEvent {
  sessionId: string
  warning: string
  timestampMs: number
}

export interface SessionErrorEvent {
  sessionId: string
  error: BetaScannerError
}

export interface RecordingStateChangedEvent {
  sessionId: string
  isRecording: boolean
  durationMs: number
}

export type BetaEvent =
  | { name: "onCapabilityChanged"; data: CapabilityChangedEvent }
  | { name: "onSessionStateChanged"; data: SessionStateChangedEvent }
  | { name: "onCameraReady"; data: CameraReadyEvent }
  | { name: "onModelReady"; data: ModelReadyEvent }
  | { name: "onResult"; data: ResultEvent }
  | { name: "onMeasurementQualityChanged"; data: MeasurementQualityChangedEvent }
  | { name: "onSessionWarning"; data: SessionWarningEvent }
  | { name: "onSessionError"; data: SessionErrorEvent }
  | { name: "onRecordingStateChanged"; data: RecordingStateChangedEvent }
