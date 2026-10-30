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
      closed: require('@assets/rewards/chest_wooden_closed.png'),
      burst: require('@assets/rewards/chest_wooden_burst.png'),
    },
    tier2: {
      closed: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_detail_fantasy_sci_fi_3d_render_on_a_trans.png'),
      burst: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_detail_fantasy_sci_fi_3d_render_on_a_transp.png'),
    },
    tier3: {
      closed: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_detail_fantasy_game_style_3d_render_on_a_tr.png'),
      burst: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_quality_fantasy_gaming_ui_style_render_of_a.png'),
    },
    tier4: {
      closed: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_gloss_ultra_detailed_fantasy_sci_fi_style.png'),
      burst: require('@assets/rewards/thrivefold_all_generated_images/images/a_bright_highly_detailed_3d_render_split_panel_co.png'),
    },
    tier5: {
      closed: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_detail_fantasy_loot_chest_illustration_on_a.png'),
      burst: require('@assets/rewards/thrivefold_all_generated_images/images/a_dramatic_high_detail_3d_rendered_sci_fi_fantasy.png'),
    },
  },
  currencies: {
    amberGem: require('@assets/rewards/thrivefold_all_generated_images/images/a_highly_detailed_cinematic_3d_rendered_golden.png'),
    goldenGem: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_quality_fantasy_game_icon_magical_artifac.png'),
    marketplaceToken: require('@assets/rewards/thrivefold_all_generated_images/images/a_highly_detailed_polished_fantasy_medieval_ui_st.png'),
    bronzeMedallion: require('@assets/rewards/thrivefold_all_generated_images/images/a_richly_detailed_high_quality_fantasy_medallion.png'),
    sanctuaryPass: require('@assets/rewards/thrivefold_all_generated_images/images/a_detailed_ornate_golden_framed_voucher_illustra.png'),
    goldVoucher: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_quality_fantasy_medieval_game_style_promoti.png'),
    booster2x: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_resolution_graphic_design_style_transpare.png'),
  },
  cards: {
    groundedSeeker: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_quality_epic_fantasy_medallion_ui_style_ach.png'),
    sanctuarySentinel: require('@assets/rewards/thrivefold_all_generated_images/images/a_highly_detailed_fantasy_luxe_golden_emblem_pro.png'),
    mindfulVoyager: require('@assets/rewards/thrivefold_all_generated_images/images/a_highly_detailed_fantasy_collectible_card_style_i.png'),
    apexThrivemaster: require('@assets/rewards/thrivefold_all_generated_images/images/a_detailed_fantasy_collectible_card_style_illustra.png'),
  },
  marketplace: {
    pushupBars: require('@assets/rewards/thrivefold_all_generated_images/images/a_clean_studio_product_render_style_scene_a_singl.png'),
    gyroball: require('@assets/rewards/thrivefold_all_generated_images/images/a_clean_isolated_product_style_3d_render_on_a_tran.png'),
    healthJournal: require('@assets/rewards/thrivefold_all_generated_images/images/a_clean_high_resolution_ultra_detailed_3d_render.png'),
    cricketKit: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_detail_3d_render_on_a_pure_bright_green_c.png'),
    mealThali: require('@assets/rewards/thrivefold_all_generated_images/images/a_warm_premium_cozy_product_ad_style_infographi.png'),
  },
  editorial: {
    chestWooden: require('@assets/rewards/chest_wooden_closed.png'),
    chestTerracotta: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_detail_fantasy_game_style_3d_render_on_a_tr.png'),
    chestGolden: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_detail_fantasy_loot_chest_illustration_on_a.png'),
    gemAmber: require('@assets/rewards/thrivefold_all_generated_images/images/a_highly_detailed_cinematic_3d_rendered_golden.png'),
    tokenCoin: require('@assets/rewards/thrivefold_all_generated_images/images/a_highly_detailed_polished_fantasy_medieval_ui_st.png'),
    passTicket: require('@assets/rewards/thrivefold_all_generated_images/images/a_detailed_ornate_golden_framed_voucher_illustra.png'),
    pushupBars: require('@assets/rewards/thrivefold_all_generated_images/images/a_clean_studio_product_render_style_scene_a_singl.png'),
    healthJournal: require('@assets/rewards/thrivefold_all_generated_images/images/a_clean_high_resolution_ultra_detailed_3d_render.png'),
    mealThali: require('@assets/rewards/thrivefold_all_generated_images/images/a_warm_premium_cozy_product_ad_style_infographi.png'),
    cardGroundedSeeker: require('@assets/rewards/thrivefold_all_generated_images/images/a_high_quality_epic_fantasy_medallion_ui_style_ach.png'),
    cardSanctuarySentinel: require('@assets/rewards/thrivefold_all_generated_images/images/a_highly_detailed_fantasy_luxe_golden_emblem_pro.png'),
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
