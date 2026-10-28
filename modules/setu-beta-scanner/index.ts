/**
 * Setu Beta Scanner Module - Main Export
 */

export { default as SetuBetaScanner } from "./src/SetuBetaScanner"
export type {
  BetaFeatureId,
  BetaCapabilityStatus,
  BetaSessionState,
  BetaMeasurementQuality,
  BetaFeatureCapability,
  BetaMetric,
  BetaFeedback,
  BetaResult,
  BetaSessionConfig,
  BetaSessionHandle,
  BetaModelStatus,
  BetaScannerErrorCode,
  BetaScannerError,
  ReadingErgonomicsMetrics,
  PostureMetrics,
  MeditationMetrics,
  FacialGeometryMetrics,
  FaceAsymmetryMetrics,
  JawlineMetrics,
  TeethAlignmentMetrics,
  BodyStructureMetrics,
  ExerciseMetrics,
  VoiceMetrics,
  HandwritingMetrics,
  GestureMetrics,
  MotorAnalysisMetrics,
  BreathingMetrics,
  ColorStyleMetrics,
  ModelInfo,
  FeatureAvailabilityResult,
} from "./src/SetuBetaScanner.types"
export type {
  BetaEventName,
  BetaEvent,
  CapabilityChangedEvent,
  SessionStateChangedEvent,
  CameraReadyEvent,
  ModelReadyEvent,
  ResultEvent,
  MeasurementQualityChangedEvent,
  SessionWarningEvent,
  SessionErrorEvent,
  RecordingStateChangedEvent,
} from "./src/SetuBetaScanner.events"
export { addListener, isAvailable } from "./src/SetuBetaScanner"
