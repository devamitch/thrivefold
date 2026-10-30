/**
 * Gems for everyday actions and the gem marketplace. Gems ("diamonds" in the ledger) are earned
 * only by real actions, each paid once per item per day with a daily cap, so they can't be farmed.
 * No money ever buys gems (REQ-014).
 */
export type ActionKind =
  | 'med_taken'
  | 'med_photo'
  | 'med_added'
  | 'meal_photo'
  | 'profile_detail'
  | 'own_key'
  | 'document_read'
  | 'learn_read'
  | 'routine_done';

export const ACTION_REWARDS: Record<ActionKind, { gems: number; perDay: number; label: string }> = {
  med_taken: { gems: 2, perDay: 6, label: 'Took a medicine' },
  med_photo: { gems: 3, perDay: 3, label: 'Photographed a medicine' },
  med_added: { gems: 2, perDay: 5, label: 'Added a medicine' },
  meal_photo: { gems: 2, perDay: 4, label: 'Logged a meal photo' },
  profile_detail: { gems: 3, perDay: 10, label: 'Shared a profile detail' },
  own_key: { gems: 25, perDay: 1, label: 'Brought your own AI key' },
  document_read: { gems: 3, perDay: 3, label: 'Read a document' },
  learn_read: { gems: 3, perDay: 5, label: 'Finished a Learn lesson' },
  routine_done: { gems: 1, perDay: 10, label: 'Kept a routine' },
};

export type MarketTier = 'sticker' | 'status' | 'gear';

export interface MarketItem {
  id: string;
  /** Ionicons glyph shown for the item until illustrated art ships. */
  icon: string;
  tier: MarketTier;
  title: string;
  description: string;
  cost: number;
  /** Real items: limited stock, delivered by the Thrivefold team. */
  physical?: boolean;
}

/** Gem prices set by the owner: stickers 100, status 500, real accessories 10,000. */
export const TIER_COST: Record<MarketTier, number> = { sticker: 100, status: 500, gear: 10_000 };

export const MARKET: MarketItem[] = [
  { id: 'sticker_zen_fox', icon: 'leaf', tier: 'sticker', title: 'Meditating Zen Fox', description: 'Profile sticker for calm streaks.', cost: TIER_COST.sticker },
  { id: 'sticker_hydration_drop', icon: 'water', tier: 'sticker', title: 'Living Hydration Drop', description: 'For people who never skip water.', cost: TIER_COST.sticker },
  { id: 'sticker_slumber_moon', icon: 'moon', tier: 'sticker', title: 'Slumber Moon', description: 'A sleepy moon for early nights.', cost: TIER_COST.sticker },
  { id: 'sticker_stride_shoes', icon: 'walk', tier: 'sticker', title: 'Morning Stride Shoes', description: 'For daily walkers.', cost: TIER_COST.sticker },
  { id: 'status_sanctuary', icon: 'ribbon', tier: 'status', title: 'Sanctuary status', description: 'A Sanctuary badge next to Anvay in the coach, for steady habits.', cost: TIER_COST.status },
  { id: 'gear_pushup_bars', icon: 'barbell', tier: 'gear', title: 'Push-up bars', description: 'A pair of push-up bars, delivered to you.', cost: TIER_COST.gear, physical: true },
  { id: 'gear_gyroball', icon: 'disc', tier: 'gear', title: 'Gyroball wrist trainer', description: 'Wrist and grip strength, delivered to you.', cost: TIER_COST.gear, physical: true },
  { id: 'gear_dumbbells', icon: 'barbell', tier: 'gear', title: 'Dumbbells', description: 'A pair of dumbbells, delivered to you.', cost: TIER_COST.gear, physical: true },
  { id: 'gear_barbell', icon: 'barbell', tier: 'gear', title: 'Barbell', description: 'A home barbell, delivered to you.', cost: TIER_COST.gear, physical: true },
  { id: 'gear_stationery', icon: 'book', tier: 'gear', title: 'Stationery kit', description: 'Journal and stationery set, delivered to you.', cost: TIER_COST.gear, physical: true },
];

/** How many of an action were already paid on a day (from ledger keys `action:<kind>:<date>:<id>`). */
export function actionsPaidOn(keys: readonly string[], kind: ActionKind, date: string): number {
  const prefix = `action:${kind}:${date}:`;
  return keys.filter((k) => k.startsWith(prefix)).length;
}

export type EarnResult = { awarded: true; gems: number } | { awarded: false; reason: 'duplicate' | 'daily_limit' };

export function canEarn(keys: readonly string[], kind: ActionKind, date: string, sourceId: string): EarnResult {
  const key = `action:${kind}:${date}:${sourceId}`;
  if (keys.includes(key)) return { awarded: false, reason: 'duplicate' };
  if (actionsPaidOn(keys, kind, date) >= ACTION_REWARDS[kind].perDay) return { awarded: false, reason: 'daily_limit' };
  return { awarded: true, gems: ACTION_REWARDS[kind].gems };
}

/** True once the person holds Sanctuary status. */
export const hasSanctuaryStatus = (owned: readonly string[]) => owned.includes('status_sanctuary');
