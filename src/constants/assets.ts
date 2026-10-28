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
