import { Image } from 'expo-image';
import { AssetIllustrations, RewardAssets } from '../constants/assets';
import { MASTER_GENERATED_ARTIFACTS } from '../constants/masterRewardAssets';

/**
 * Preload and precache all static image assets in the application on startup.
 * Warmed into memory and disk cache via expo-image so all screens render instantly
 * without grey placeholder flickers or delay.
 */
export function preloadAllAppImages() {
  const sources: any[] = [
    ...Object.values(AssetIllustrations),
    ...MASTER_GENERATED_ARTIFACTS.map((a) => a.source),
    ...Object.values(RewardAssets.currencies),
    ...Object.values(RewardAssets.chests).flatMap((c) => [c.closed, c.burst]),
    ...Object.values(RewardAssets.cards),
    ...Object.values(RewardAssets.marketplace),
    ...Object.values(RewardAssets.editorial),
  ];

  const unique = Array.from(new Set(sources.filter(Boolean)));
  unique.forEach((src) => {
    Image.loadAsync(src).catch(() => {});
  });
}

