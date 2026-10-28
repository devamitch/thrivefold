/**
 * Type definitions for the Setu Beta Scanner module
 * MediaPipe-powered vision and audio features for BlinkQuest
 */

export type BetaFeatureId =
  | "reading-ergonomics"
  | "posture-correction"
  | "meditation-biofeedback"
  | "facial-geometry"
  | "face-asymmetry"
  | "eyewear-preview"
  | "jawline-analysis"
  | "teeth-alignment"
  | "body-structure"
  | "exercise-coaching"
  | "voice-training"
  | "handwriting-practice"
  | "gesture-control"
  | "motor-analysis"
  | "breathing-guide"
  | "color-style"

export type BetaCapabilityStatus =
  | "available"
  | "experimental"
  | "needs-calibration"
  | "permission-required"
  | "model-unavailable"
  | "unsupported"
  | "temporarily-unavailable"

export type BetaSessionState =
  | "idle"
  | "requesting-permission"
  | "initializing"
  | "running"
  | "paused"
  | "stopping"
  | "completed"
  | "error"

export type BetaMeasurementQuality = "good" | "limited" | "invalid"

export interface BetaFeatureCapability {
  id: BetaFeatureId
  title: string
  description: string
  status: BetaCapabilityStatus
  reason?: string
  localOnly: true
  requiresCamera: boolean
  requiresMicrophone: boolean
  requiresCalibration: boolean
  requiredModels: string[]
}

export interface BetaMetric {
  id: string
  value: number | string | boolean
  unit?: string
  confidence?: number
  quality: BetaMeasurementQuality
  timestampMs: number
  explanation: string
}

export interface BetaFeedback {
  id: string
  level: "info" | "guidance" | "warning"
  title: string
  message: string
  actionable: boolean
}

export interface BetaResult {
  sessionId: string
  featureId: BetaFeatureId
  timestampMs: number
  metrics: BetaMetric[]
  feedback: BetaFeedback[]
  warnings: string[]
}

export interface BetaSessionConfig {
  featureId: BetaFeatureId
  cameraPosition?: "front" | "back"
  enableAudio?: boolean
  sampleRateHz?: number
}

export interface BetaSessionHandle {
  sessionId: string
  featureId: BetaFeatureId
  startTimeMs: number
}

export interface BetaModelStatus {
  modelId: string
  isLoaded: boolean
  loadTimeMs?: number
  delegate: "gpu" | "cpu" | "none"
  error?: string
}

export type BetaScannerErrorCode =
  | "MODULE_UNAVAILABLE"
  | "PERMISSION_DENIED"
  | "CAMERA_UNAVAILABLE"
  | "MICROPHONE_UNAVAILABLE"
  | "MODEL_MISSING"
  | "MODEL_LOAD_FAILED"
  | "UNSUPPORTED_INPUT"
  | "SESSION_ALREADY_ACTIVE"
  | "SESSION_NOT_ACTIVE"
  | "INVALID_CONFIGURATION"
  | "RESOURCE_EXHAUSTED"
  | "INFERENCE_FAILED"
  | "UNKNOWN"

export interface BetaScannerError {
  code: BetaScannerErrorCode
  message: string
  details?: Record<string, unknown>
}

// Specific feature metrics

export interface ReadingErgonomicsMetrics {
  distanceCm: number
  distanceQuality: BetaMeasurementQuality
  gazeAngle: number
  blinkRatePerMin: number
  readingDurationMin: number
  fatigueRisk: "low" | "medium" | "high"
}

export interface PostureMetrics {
  forwardHeadAngle: number
  shoulderRounding: number
  pelvicTilt: number
  overallPostureScore: number
  recommendations: string[]
}

export interface MeditationMetrics {
  heartRateBpm: number
  breathingRatePerMin: number
  relaxationDepth: number
  sessionDurationMin: number
}

export interface FacialGeometryMetrics {
  pupillaryDistanceMm: number
  faceShape: "oval" | "square" | "heart" | "round"
  asymmetryScore: number
  goldenRatioScore: number
}

export interface FaceAsymmetryMetrics {
  orbitalCant: number
  lipTilt: number
  malarAsymmetry: number
  overallAsymmetryIndex: number
}

export interface JawlineMetrics {
  gonialAngle: number
  jawlineDefinition: number
  skinUndertone: "warm" | "cool" | "neutral"
  colorPalette: string[]
}

export interface TeethAlignmentMetrics {
  dentalMidlineOffset: number
  anteriorCrowding: number
  alignmentQuality: BetaMeasurementQuality
}

export interface BodyStructureMetrics {
  biacromialBiiliacRatio: number
  somatotype: "ectomorph" | "mesomorph" | "endomorph"
  torsoLegRatio: number
  shoulderHipRatio: number
}

export interface ExerciseMetrics {
  exerciseType: string
  repCount: number
  formQuality: number
  formDefects: string[]
  jointAngles: Record<string, number>
}

export interface VoiceMetrics {
  fundamentalFrequency: number
  formantF1: number
  formantF2: number
  resonanceScore: number
  targetFrequency: number
}

export interface HandwritingMetrics {
  gripQuality: number
  penAngle: number
  tripodStability: number
  pressureScore: number
}

export interface GestureMetrics {
  gestureType: string
  confidence: number
  handPosition: { x: number; y: number }
  pinchDistance: number
}

export interface MotorAnalysisMetrics {
  tremorFrequency: number
  tremorAmplitude: number
  tremorType: "parkinsonian" | "essential" | "none"
  facialAsymmetryIndex: number
}

export interface BreathingMetrics {
  breathingRate: number
  diaphragmaticRatio: number
  cycleDuration: number
  coherenceScore: number
}

export interface ColorStyleMetrics {
  skinUndertone: string
  clothingColors: string[]
  colorHarmonyScore: number
  contrastScore: number
  silhouetteScore: number
  overallAestheticScore: number
}

export interface ModelInfo {
  id: string
  assetPath: string
  version: string
  license: string
  requiredDelegate: string
  estimatedSizeBytes: number
}

export interface FeatureAvailabilityResult {
  status: "available" | "unavailable" | "partially_available"
  missingModels?: string[]
}
