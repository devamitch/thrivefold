import { AssetIllustrations } from '../constants/assets';
import type { ProductExperience } from '../theme/tokens';

export type SanctuaryIllustrationKey =
  | 'yogaFlow'
  | 'hiitStrength'
  | 'deskReset'
  | 'meditation'
  | 'deepSleep'
  | 'eyeVision'
  | 'faceExercises'
  | 'voicePractice'
  | 'healthHub'
  | 'betaLabHub'
  | 'handGames'
  | 'eyePursuit'
  | 'breathing'
  | 'bodyStyle'
  | 'poseCoach'
  | 'coachAssistant'
  | 'outdoors'
  | 'profileKosh'
  | 'nutrition'
  | 'activityIndoor'
  | 'emergency';

/**
 * Returns the authentic sanctuary illustration tailored to the active user experience
 * (men_health, women_health, pride_wellbeing) so that men see male-represented art,
 * women see women-represented art, and LGBTQ+/neutral paths receive welcoming inclusive art.
 */
export function getSanctuaryIllustration(
  key: SanctuaryIllustrationKey,
  experience: ProductExperience = 'women_health',
) {
  if (experience === 'men_health') {
    switch (key) {
      case 'yogaFlow':
        return AssetIllustrations.workoutYogaFlowMen;
      case 'hiitStrength':
        return AssetIllustrations.workoutStrengthMen;
      case 'deskReset':
        return AssetIllustrations.workoutDeskResetMen;
      case 'meditation':
        return AssetIllustrations.wellnessMeditationMen;
      case 'deepSleep':
        return AssetIllustrations.wellnessDeepSleepMen;
      case 'eyeVision':
        return AssetIllustrations.wellnessEyeVisionMen;
      case 'faceExercises':
        return AssetIllustrations.betaFaceExercisesMen;
      case 'voicePractice':
        return AssetIllustrations.betaVoicePracticeMen;
      case 'breathing':
        return AssetIllustrations.betaBreathingMen;
      case 'nutrition':
        return AssetIllustrations.nutritionPlateMen;
      default:
        break;
    }
  }

  if (experience === 'pride_wellbeing') {
    switch (key) {
      case 'healthHub':
        return AssetIllustrations.healthPride;
      case 'meditation':
        return AssetIllustrations.wellnessMeditationMind;
      default:
        break;
    }
  }

  // Default / Women's health
  switch (key) {
    case 'yogaFlow':
      return AssetIllustrations.workoutYogaFlow;
    case 'hiitStrength':
      return AssetIllustrations.workoutHiitStrength;
    case 'deskReset':
      return AssetIllustrations.workoutDeskReset;
    case 'meditation':
      return AssetIllustrations.wellnessMeditationMind;
    case 'deepSleep':
      return AssetIllustrations.wellnessDeepSleep;
    case 'eyeVision':
      return AssetIllustrations.wellnessEyeVision;
    case 'faceExercises':
      return AssetIllustrations.betaFaceExercises;
    case 'voicePractice':
      return AssetIllustrations.betaVoicePractice;
    case 'healthHub':
      return AssetIllustrations.cycleRestRestore;
    case 'betaLabHub':
      return AssetIllustrations.betaLabHub;
    case 'handGames':
      return AssetIllustrations.betaHandGames;
    case 'eyePursuit':
      return AssetIllustrations.betaEyePursuit;
    case 'breathing':
      return AssetIllustrations.betaBreathing;
    case 'bodyStyle':
      return AssetIllustrations.betaBodyStyle;
    case 'poseCoach':
      return AssetIllustrations.betaPoseCoach;
    case 'coachAssistant':
      return AssetIllustrations.betaCoachAssistant;
    case 'outdoors':
      return AssetIllustrations.outdoorsWalk;
    case 'profileKosh':
      return AssetIllustrations.profileKosh;
    case 'nutrition':
      return AssetIllustrations.nutritionPlate;
    case 'activityIndoor':
      return AssetIllustrations.activityIndoor;
    case 'emergency':
      return AssetIllustrations.emergencyHelp;
    default:
      return AssetIllustrations.workoutYogaFlow;
  }
}

/**
 * Resolves the tailored editorial illustration for each Learn article
 * taking into account the user's active experience.
 */
export function getArticleIllustration(
  articleId: string,
  experience: ProductExperience = 'women_health',
) {
  switch (articleId) {
    case 'sleep_basics':
      return experience === 'men_health'
        ? AssetIllustrations.wellnessDeepSleepMen
        : AssetIllustrations.wellnessDeepSleep;
    case 'slow_breathing':
      return experience === 'men_health'
        ? AssetIllustrations.betaBreathingMen
        : AssetIllustrations.betaBreathing;
    case 'activity_guidelines':
      return experience === 'men_health'
        ? AssetIllustrations.workoutStrengthMen
        : AssetIllustrations.workoutMobility;
    case 'cycle_basics':
      return AssetIllustrations.cycleRadiantVitality;
    case 'pelvic_floor':
      return experience === 'men_health'
        ? AssetIllustrations.learnPelvicMen
        : AssetIllustrations.learnPelvic;
    case 'mens_urinary_sexual':
      return AssetIllustrations.healthMen;
    case 'posture_desk':
      return experience === 'men_health'
        ? AssetIllustrations.workoutDeskResetMen
        : AssetIllustrations.workoutDeskReset;
    case 'listening':
      return experience === 'men_health'
        ? AssetIllustrations.learnListeningMen
        : AssetIllustrations.learnCommunication;
    case 'work_frustration':
      return experience === 'men_health'
        ? AssetIllustrations.wellnessMeditationMen
        : AssetIllustrations.wellnessMeditationMind;
    case 'affirming_care':
      return AssetIllustrations.learnAffirming;
    default:
      return AssetIllustrations.sanctuaryAmbientBg;
  }
}

/**
 * Resolves the tailored workout illustration based on workout plan setting or pattern.
 */
export function getWorkoutPlanIllustration(
  setting: string,
  experience: ProductExperience = 'women_health',
) {
  const isMen = experience === 'men_health';
  switch (setting) {
    case 'yoga':
      return isMen ? AssetIllustrations.workoutYogaFlowMen : AssetIllustrations.workoutYogaFlow;
    case 'home':
    case 'gym':
      return isMen ? AssetIllustrations.workoutStrengthMen : AssetIllustrations.workoutStrength;
    case 'hiit':
      return isMen ? AssetIllustrations.workoutHiitStrengthMen : AssetIllustrations.workoutHiitStrength;
    case 'desk':
    case 'seated':
      return isMen ? AssetIllustrations.workoutDeskResetMen : AssetIllustrations.workoutDeskReset;
    case 'recovery':
    case 'cardio':
    case 'balance':
    case 'pilates':
      return AssetIllustrations.workoutMobility;
    default:
      return isMen ? AssetIllustrations.workoutStrengthMen : AssetIllustrations.workoutYogaFlow;
  }
}
