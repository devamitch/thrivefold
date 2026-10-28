/**
 * Central Metric & Health Capability Registry for Thrivefold Health OS.
 *
 * Defines:
 * 1. Provenance: on-device measured, imported (Health Connect/sensors), calculated estimate, or manual.
 * 2. Metric definitions with units, aggregation methods, and supported platforms.
 * 3. Beta capabilities registry with honest capability statuses.
 */

export type MetricProvenance = 'measured' | 'imported' | 'estimated' | 'manual';

export interface MetricDefinition {
  id: string;
  name: string;
  unit: string;
  category: 'activity' | 'vitals' | 'recovery' | 'nutrition' | 'mind';
  provenance: MetricProvenance;
  supportsLive: boolean;
  supportsHistorical: boolean;
  aggregation: 'sum' | 'average' | 'latest' | 'max';
  description: string;
}

export const METRIC_REGISTRY: Record<string, MetricDefinition> = {
  steps: {
    id: 'steps',
    name: 'Steps',
    unit: 'steps',
    category: 'activity',
    provenance: 'measured',
    supportsLive: true,
    supportsHistorical: true,
    aggregation: 'sum',
    description: 'Hardware pedometer & Health Connect unified step count with hourly distribution',
  },
  active_calories: {
    id: 'active_calories',
    name: 'Active Burn',
    unit: 'kcal',
    category: 'activity',
    provenance: 'estimated',
    supportsLive: true,
    supportsHistorical: true,
    aggregation: 'sum',
    description: 'MET-based active calorie estimation from steps, workouts, and sports',
  },
  heart_rate: {
    id: 'heart_rate',
    name: 'Heart Rate',
    unit: 'bpm',
    category: 'vitals',
    provenance: 'imported',
    supportsLive: true,
    supportsHistorical: true,
    aggregation: 'average',
    description: 'BLE chest strap / optical sensor & Health Connect heart rate samples',
  },
  sleep_minutes: {
    id: 'sleep_minutes',
    name: 'Sleep',
    unit: 'min',
    category: 'recovery',
    provenance: 'imported',
    supportsLive: false,
    supportsHistorical: true,
    aggregation: 'sum',
    description: 'Health Connect sleep stages and duration with check-in fallback',
  },
  hydration: {
    id: 'hydration',
    name: 'Hydration',
    unit: 'glasses',
    category: 'nutrition',
    provenance: 'manual',
    supportsLive: true,
    supportsHistorical: true,
    aggregation: 'sum',
    description: 'Daily water tracking (250ml per glass) with timestamped logs & undo',
  },
  screen_time: {
    id: 'screen_time',
    name: 'Screen Time',
    unit: 'min',
    category: 'mind',
    provenance: 'measured',
    supportsLive: true,
    supportsHistorical: true,
    aggregation: 'sum',
    description: 'Local app session duration & 20-20-20 eye strain break triggers',
  },
};

export type BetaCapabilityStatus =
  | 'working'
  | 'beta'
  | 'needs_permission'
  | 'needs_calibration'
  | 'model_unavailable'
  | 'unsupported'
  | 'research_only';

export interface BetaCapability {
  id: string;
  title: string;
  subtitle: string;
  category: 'vision' | 'activity' | 'ai' | 'haptics' | 'sensors';
  status: BetaCapabilityStatus;
  statusNote: string;
  route: string;
  modelsRequired?: string[];
  permissionsRequired?: string[];
  dataOutputs: string[];
}

export const BETA_CAPABILITIES: BetaCapability[] = [
  {
    id: 'eye_tracking_studio',
    title: 'Eye Tracking Studio',
    subtitle: 'Blink rate, Eye Aspect Ratio (EAR) & gaze strain metrics',
    category: 'vision',
    status: 'working',
    statusNote: 'Real-time 468-point MediaPipe face landmarker iris analysis on-device',
    route: '/(app)/beta-lab/eye-tracking',
    modelsRequired: ['face_landmarker.task'],
    permissionsRequired: ['android.permission.CAMERA'],
    dataOutputs: ['blinkCount', 'blinksPerMinute', 'earValue', 'gazeDirection', 'strainLevel'],
  },
  {
    id: 'hand_gesture_studio',
    title: 'Hand Gesture Studio',
    subtitle: '21-point hand tracking, grip rep counting & wrist mobility',
    category: 'vision',
    status: 'working',
    statusNote: 'Real-time MediaPipe hand landmarker with open/close hysteresis',
    route: '/(app)/beta-lab/hand-gestures',
    modelsRequired: ['hand_landmarker.task'],
    permissionsRequired: ['android.permission.CAMERA'],
    dataOutputs: ['gripReps', 'extendedFingers', 'wristMobilityPercent', 'activeHand'],
  },
  {
    id: 'pose_coach_live',
    title: 'Live Pose Coach',
    subtitle: 'Full-body skeleton tracking & real-time exercise rep counting',
    category: 'vision',
    status: 'working',
    statusNote: 'MediaPipe pose landmarker with angle calculation & coach cues',
    route: '/(app)/beta-lab/pose-coach',
    modelsRequired: ['pose_landmarker_lite.task'],
    permissionsRequired: ['android.permission.CAMERA'],
    dataOutputs: ['exerciseReps', 'formScore', 'jointAngles', 'symmetryScore'],
  },
  {
    id: 'food_lens_vision',
    title: 'Food Lens AI Vision',
    subtitle: 'Camera meal capture, food classification & macro estimates',
    category: 'ai',
    status: 'working',
    statusNote: 'Server-side Edge Function with Gemini multimodal food analysis',
    route: '/(app)/beta-lab/food-lens',
    modelsRequired: ['food_classifier.tflite', 'gemini-1.5-flash'],
    permissionsRequired: ['android.permission.CAMERA'],
    dataOutputs: ['mealItems', 'calorieEstimate', 'proteinGrams', 'carbsGrams', 'fatGrams'],
  },
  {
    id: 'treadmill_pad_tracker',
    title: 'Treadmill & Walking Pad Mode',
    subtitle: 'Dedicated session timer with tailored indoor MET burn formula',
    category: 'activity',
    status: 'working',
    statusNote: 'Uses 3.8-8.5 MET with step deduplication to avoid double counting',
    route: '/(app)/health/activity',
    dataOutputs: ['elapsedMinutes', 'activeCaloriesBurned', 'sessionType'],
  },
  {
    id: 'screen_time_break_reminders',
    title: 'Screen Time & 20-20-20 Rule',
    subtitle: 'Tracks continuous foreground sessions and prompts eye relief',
    category: 'sensors',
    status: 'working',
    statusNote: 'Local on-device session tracking without sensitive background snooping',
    route: '/(app)/roadmap',
    dataOutputs: ['continuousMinutes', 'breakRecommendation', 'workSchedulePhase'],
  },
  {
    id: 'voice_coach_tts',
    title: 'Spoken Coach Guidance',
    subtitle: 'Priority-based audio cues for workouts and eye/hand exercises',
    category: 'ai',
    status: 'working',
    statusNote: 'Native TTS via expo-speech with overlap prevention and mute safety',
    route: '/(app)/beta-lab/voice-coach',
    dataOutputs: ['spokenCue', 'cuePriority', 'silenceHonored'],
  },
  {
    id: 'touchless_navigation',
    title: 'Touchless Pointer Control',
    subtitle: 'Air-gesture navigation via camera hand position',
    category: 'vision',
    status: 'research_only',
    statusNote: 'Experimental: requires fixed device mount and high ambient lighting',
    route: '/(app)/beta-lab/hand-gestures',
    modelsRequired: ['hand_landmarker.task'],
    permissionsRequired: ['android.permission.CAMERA'],
    dataOutputs: ['normalizedX', 'normalizedY', 'pinchGesture'],
  },
];

