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
  workoutStrength: require('@assets/illustrations/workout-strength.jpg'),
  workoutMobility: require('@assets/illustrations/workout-mobility.jpg'),
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
  roadmapJourneyBg: require('@assets/illustrations/roadmap-journey-bg.jpg'),
  todayMorningBg: require('@assets/illustrations/today-morning-bg.jpg'),
  progressZenBg: require('@assets/illustrations/progress-zen-bg.jpg'),
  sanctuaryAmbientBg: require('@assets/illustrations/sanctuary-ambient-bg.jpg'),
  learnCommunication: require('@assets/illustrations/learn-communication.jpg'),
  learnListeningMen: require('@assets/illustrations/learn-listening-men.jpg'),
  learnPelvic: require('@assets/illustrations/learn-pelvic.jpg'),
  learnPelvicMen: require('@assets/illustrations/learn-pelvic-men.jpg'),
  learnAffirming: require('@assets/illustrations/learn-affirming.jpg'),
} as const;

export type AssetIllustrationsName = keyof typeof AssetIllustrations;

/** Reward and gamification assets: chests, gems, tokens, cards, and marketplace merchandise. */
export const RewardAssets = {
  chests: {
    tier1: {
      closed: require('@assets/rewards/chests/tier1_beechwood_closed.png'),
      burst: require('@assets/rewards/chests/tier1_beechwood_burst.png'),
    },
    tier2: {
      closed: require('@assets/rewards/chests/chest_wide_01_closed.png'),
      burst: require('@assets/rewards/chests/chest_wide_01_burst.png'),
    },
    tier3: {
      closed: require('@assets/rewards/chests/chest_wide_03_closed.png'),
      burst: require('@assets/rewards/chests/chest_wide_03_burst.png'),
    },
    tier4: {
      closed: require('@assets/rewards/chests/chest_wide_04_closed.png'),
      burst: require('@assets/rewards/chests/chest_wide_04_burst.png'),
    },
    tier5: {
      closed: require('@assets/rewards/chests/chest_wide_05_closed.png'),
      burst: require('@assets/rewards/chests/chest_wide_05_burst.png'),
    },
  },
  currencies: {
    amberGem: require('@assets/rewards/currencies/gem_amber_habit.png'),
    goldenGem: require('@assets/rewards/currencies/gem_mythic_gold.png'),
    marketplaceToken: require('@assets/rewards/currencies/token_marketplace_coin.png'),
    bronzeMedallion: require('@assets/rewards/currencies/token_bronze_medallion.png'),
    sanctuaryPass: require('@assets/rewards/currencies/pass_sanctuary_ticket.png'),
    goldVoucher: require('@assets/rewards/currencies/pass_gold_voucher.png'),
    booster2x: require('@assets/rewards/currencies/booster_2x_talisman.png'),
  },
  cards: {
    groundedSeeker: require('@assets/rewards/cards/card_grounded_seeker.png'),
    sanctuarySentinel: require('@assets/rewards/cards/card_sanctuary_sentinel.png'),
    mindfulVoyager: require('@assets/rewards/cards/card_mindful_voyager_3d.png'),
    apexThrivemaster: require('@assets/rewards/cards/card_apex_thrivemaster_3d.png'),
  },
  marketplace: {
    pushupBars: require('@assets/rewards/marketplace/beechwood_pushup_bars.png'),
    gyroball: require('@assets/rewards/marketplace/gyroball_wrist_exerciser.png'),
    healthJournal: require('@assets/rewards/marketplace/linen_health_journal.png'),
    cricketKit: require('@assets/rewards/marketplace/cricket_kit_junior.png'),
    mealThali: require('@assets/rewards/marketplace/ayurvedic_meal_thali.jpg'),
  },
} as const;

export const Assets = {
  brand: {
    logo: require('@assets/images/logo.png'),
    appIcon: require('@assets/images/app-icon-all.png'),
  },
  illustrations: AssetIllustrations,
  rewards: RewardAssets,
  icons: ProductIcons,
} as const;

export const AssetIcons = ProductIcons;
export type AssetIconsName = ProductIconName;
