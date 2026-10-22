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
