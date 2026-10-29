/**
 * Thrivefold runtime asset registry matching Neev architecture.
 * Includes authentic illustrations, brand icons, and core product icons.
 */

import { ProductIcons, type ProductIconName } from './product-icons';

/** Hero, empty-state, and trust/security artwork. */
export const AssetIllustrations = {
  discover: require('@assets/illustrations/nearby-discover.webp'),
  empty: require('@assets/illustrations/radar-empty.webp'),
  security: require('@assets/illustrations/security.webp'),
  network: require('@assets/illustrations/setu-network.webp'),
  share: require('@assets/illustrations/share.webp'),
  vaultLocked: require('@assets/illustrations/vault-locked.webp'),
  workoutYogaFlow: require('@assets/illustrations/workout-yoga-flow.jpg'),
  workoutHiitStrength: require('@assets/illustrations/workout-hiit-strength.jpg'),
  workoutDeskReset: require('@assets/illustrations/workout-desk-reset.jpg'),
  cycleRestRestore: require('@assets/illustrations/cycle-rest-restore.jpg'),
  cycleRadiantVitality: require('@assets/illustrations/cycle-radiant-vitality.jpg'),
  wellnessMeditationMind: require('@assets/illustrations/wellness-meditation-mind.jpg'),
  wellnessDeepSleep: require('@assets/illustrations/wellness-deep-sleep.jpg'),
  wellnessEyeVision: require('@assets/illustrations/wellness-eye-vision.jpg'),
  betaLabHub: require('@assets/illustrations/beta-lab-hub.jpg'),
  betaFaceExercises: require('@assets/illustrations/beta-face-exercises.jpg'),
  betaHandGames: require('@assets/illustrations/beta-hand-games.jpg'),
  betaEyePursuit: require('@assets/illustrations/beta-eye-pursuit.jpg'),
  betaBreathing: require('@assets/illustrations/beta-breathing.jpg'),
  betaVoicePractice: require('@assets/illustrations/beta-voice-practice.jpg'),
  betaBodyStyle: require('@assets/illustrations/beta-body-style.jpg'),
  betaPoseCoach: require('@assets/illustrations/beta-pose-coach.jpg'),
  betaCoachAssistant: require('@assets/illustrations/beta-coach-assistant.jpg'),
  outdoorsWalk: require('@assets/illustrations/outdoors-walk.jpg'),
  profileKosh: require('@assets/illustrations/profile-kosh.jpg'),
  nutritionPlate: require('@assets/illustrations/nutrition-plate.jpg'),
  activityIndoor: require('@assets/illustrations/activity-indoor.jpg'),
  healthMen: require('@assets/illustrations/health-men.jpg'),
  healthPride: require('@assets/illustrations/health-pride.jpg'),
  emergencyHelp: require('@assets/illustrations/emergency-help.jpg'),
  workoutYogaFlowMen: require('@assets/illustrations/workout-yoga-flow-men.jpg'),
  workoutStrengthMen: require('@assets/illustrations/workout-strength-men.jpg'),
  workoutHiitStrengthMen: require('@assets/illustrations/workout-hiit-strength-men.jpg'),
  workoutDeskResetMen: require('@assets/illustrations/workout-desk-reset-men.jpg'),
  wellnessMeditationMen: require('@assets/illustrations/wellness-meditation-men.jpg'),
  wellnessDeepSleepMen: require('@assets/illustrations/wellness-deep-sleep-men.jpg'),
  wellnessEyeVisionMen: require('@assets/illustrations/wellness-eye-vision-men.jpg'),
  betaFaceExercisesMen: require('@assets/illustrations/beta-face-exercises-men.jpg'),
  betaVoicePracticeMen: require('@assets/illustrations/beta-voice-practice-men.jpg'),
  nutritionPlateMen: require('@assets/illustrations/nutrition-plate-men.jpg'),
  betaBreathingMen: require('@assets/illustrations/beta-breathing-men.jpg'),
  outdoorsWalkMen: require('@assets/illustrations/outdoors-walk-men.jpg'),
  roadmapJourneyBg: require('@assets/illustrations/roadmap-journey-bg.jpg'),
  todayMorningBg: require('@assets/illustrations/today-morning-bg.jpg'),
  progressZenBg: require('@assets/illustrations/progress-zen-bg.jpg'),
  sanctuaryAmbientBg: require('@assets/illustrations/sanctuary-ambient-bg.jpg'),
} as const;

export type AssetIllustrationsName = keyof typeof AssetIllustrations;

export const Assets = {
  brand: {
    logo: require('@assets/images/logo.png'),
    appIcon: require('@assets/images/app-icon-all.png'),
  },
  illustrations: AssetIllustrations,
  icons: ProductIcons,
} as const;

export const AssetIcons = ProductIcons;
export type AssetIconsName = ProductIconName;
