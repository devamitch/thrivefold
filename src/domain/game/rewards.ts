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
  tokenCost?: number;
  ticketCost?: number;
  /** Real items: limited stock, delivered by the Thrivefold team. */
  physical?: boolean;
  assetKey?: string;
}

/** Gem prices set by the owner: stickers 100, status 500, real accessories 10,000. */
export const TIER_COST: Record<MarketTier, number> = { sticker: 100, status: 500, gear: 10_000 };

export const MARKET: MarketItem[] = [
  { id: 'sticker_zen_fox', icon: 'leaf', tier: 'sticker', title: 'Meditating Zen Fox', description: 'Profile sticker for calm streaks.', cost: TIER_COST.sticker, tokenCost: 1, assetKey: 'cardGroundedSeeker' },
  { id: 'sticker_hydration_drop', icon: 'water', tier: 'sticker', title: 'Living Hydration Drop', description: 'For people who never skip water.', cost: TIER_COST.sticker, tokenCost: 1, assetKey: 'amberGem' },
  { id: 'sticker_slumber_moon', icon: 'moon', tier: 'sticker', title: 'Slumber Moon', description: 'A sleepy moon for early nights.', cost: TIER_COST.sticker, tokenCost: 1, assetKey: 'goldenGem' },
  { id: 'sticker_stride_shoes', icon: 'walk', tier: 'sticker', title: 'Morning Stride Shoes', description: 'For daily walkers.', cost: TIER_COST.sticker, tokenCost: 1, assetKey: 'bronzeMedallion' },
  { id: 'sticker_pranayama', icon: 'flower-outline', tier: 'sticker', title: 'Pranayama Lotus', description: 'For deep breathing and nervous system reset.', cost: TIER_COST.sticker, tokenCost: 1, assetKey: 'booster_2x_jade_talisman' },
  { id: 'sticker_solar', icon: 'sunny-outline', tier: 'sticker', title: 'Solar Vitality Medal', description: 'For awakening with the morning sun.', cost: TIER_COST.sticker, tokenCost: 1, assetKey: 'cinematic_minted_gold_coin' },
  { id: 'status_sanctuary', icon: 'ribbon', tier: 'status', title: 'Sanctuary status', description: 'A Sanctuary badge next to Anvay in the coach, for steady habits.', cost: TIER_COST.status, ticketCost: 1, tokenCost: 1, assetKey: 'sanctuaryPass' },
  { id: 'status_guardian', icon: 'shield-checkmark-outline', tier: 'status', title: 'Guardian Sentinel status', description: 'A protective sentinel shield insignia beside your name.', cost: TIER_COST.status, ticketCost: 1, tokenCost: 1, assetKey: 'sanctuary_guardian_shield' },
  { id: 'gear_pushup_bars', icon: 'barbell', tier: 'gear', title: 'Push-up bars', description: 'Ergonomic solid beechwood parallettes, delivered to you.', cost: TIER_COST.gear, tokenCost: 10, physical: true, assetKey: 'pushupBars' },
  { id: 'gear_gyroball', icon: 'disc', tier: 'gear', title: 'Gyroball wrist trainer', description: 'High-precision autostart metal gyroball, delivered to you.', cost: TIER_COST.gear, tokenCost: 12, physical: true, assetKey: 'precision_gyroball_render' },
  { id: 'gear_stationery', icon: 'book', tier: 'gear', title: 'Stationery kit', description: 'Hardcover linen journal and stationery set, delivered to you.', cost: TIER_COST.gear, tokenCost: 10, physical: true, assetKey: 'linen_journal_isometric' },
  { id: 'gear_gripper', icon: 'fitness-outline', tier: 'gear', title: 'Knurled hand gripper', description: 'Heavy-duty aircraft aluminum grip trainer with knurled handles.', cost: TIER_COST.gear, tokenCost: 10, physical: true, assetKey: 'knurled_hand_gripper' },
  { id: 'gear_cricket', icon: 'baseball-outline', tier: 'gear', title: 'Junior cricket set', description: 'English willow junior bat and leather ball set, delivered to you.', cost: TIER_COST.gear, tokenCost: 20, physical: true, assetKey: 'junior_cricket_bat' },
  { id: 'gear_dumbbells', icon: 'barbell', tier: 'gear', title: 'Dumbbells', description: 'A pair of dumbbells, delivered to you.', cost: TIER_COST.gear, tokenCost: 10, physical: true, assetKey: 'gyroball' },
  { id: 'gear_barbell', icon: 'barbell', tier: 'gear', title: 'Barbell', description: 'A home barbell, delivered to you.', cost: TIER_COST.gear, tokenCost: 15, physical: true, assetKey: 'pushupBars' },
  { id: 'gear_nordic_set', icon: 'cafe-outline', tier: 'gear', title: 'Nordic wellness still life set', description: 'Natural beechwood, ceramic mug and linen tea towel.', cost: TIER_COST.gear, tokenCost: 12, physical: true, assetKey: 'nordic_wellness_still_life' },
];

export interface EditorialArt {
  id: string;
  title: string;
  category: string;
  description: string;
  assetKey:
    | 'chestWooden'
    | 'chestTerracotta'
    | 'chestGolden'
    | 'gemAmber'
    | 'tokenCoin'
    | 'passTicket'
    | 'pushupBars'
    | 'healthJournal'
    | 'mealThali'
    | 'cardGroundedSeeker'
    | 'cardSanctuarySentinel';
}

export const EDITORIAL_ARTWORKS: EditorialArt[] = [
  { id: 'art_chest_wooden', title: 'Scandinavian Beechwood Relic', category: 'Chest Study', description: 'Gouache on textured cotton paper depicting the Level 5 Wooden Sanctuary Chest.', assetKey: 'chestWooden' },
  { id: 'art_chest_terracotta', title: 'Terracotta Sanctuary Vault', category: 'Vault Study', description: 'Hexagonal ceramic vault with brushed oxidized copper trims and mechanical dial.', assetKey: 'chestTerracotta' },
  { id: 'art_chest_golden', title: 'Champagne Gold Sunburst Trove', category: 'Trove Study', description: 'Octagonal reliquary forged from brushed gold and frosted ivory glass.', assetKey: 'chestGolden' },
  { id: 'art_gem_amber', title: 'Amber Habit Core Crystal', category: 'Currency Study', description: 'Emerald-cut warm amber crystal with internal light refractions.', assetKey: 'gemAmber' },
  { id: 'art_token_coin', title: 'Minted Bronze-Gold Token', category: 'Coin Study', description: 'High-relief commemorative token with debossed Thrivefold geometric seal.', assetKey: 'tokenCoin' },
  { id: 'art_pass_ticket', title: 'Letterpress Sanctuary Pass', category: 'Voucher Study', description: 'Sage-green passport ticket with guilloche patterns and gold-foil emblem.', assetKey: 'passTicket' },
  { id: 'art_pushup_bars', title: 'Solid Beechwood Parallettes', category: 'Equipment Study', description: 'Ergonomic parallettes with natural rubber feet and laser-engraved T-leaf.', assetKey: 'pushupBars' },
  { id: 'art_journal', title: 'Sage Linen Health Journal', category: 'Stationery Study', description: 'A5 hardcover reflection journal bound in natural sage bookcloth.', assetKey: 'healthJournal' },
  { id: 'art_meal_thali', title: 'Ayurvedic Wholesome Thali', category: 'Nutrition Study', description: 'Balanced traditional meal plate of seasonal legumes, grains and vegetables.', assetKey: 'mealThali' },
  { id: 'art_card_seeker', title: 'Grounded Seeker Tarot Archetype', category: 'Collector Card', description: 'Circular earthen labyrinth mandala with brushed bronze foil border.', assetKey: 'cardGroundedSeeker' },
  { id: 'art_card_sentinel', title: 'Sanctuary Sentinel Shield', category: 'Collector Card', description: 'Heraldic silver shield with olive branch on brushed sage silk.', assetKey: 'cardSanctuarySentinel' },
];

export interface WellnessPlan {
  id: string;
  icon: string;
  title: string;
  category: string;
  description: string;
  cost: number;
  tokenCost: number;
  assetKey?: 'goldVoucher' | 'mealThali' | 'bronzeMedallion';
}

/** Verified wellness care and nutrition plans (spec §5). */
export const WELLNESS_PLANS: WellnessPlan[] = [
  {
    id: 'plan_doctor_telehealth',
    icon: 'medkit-outline',
    title: 'Verified Doctor Telehealth Visit',
    category: 'Clinical Service',
    description: 'Instant digital booking voucher for a 1-on-1 lifestyle doctor consultation.',
    cost: 37_500,
    tokenCost: 15,
    assetKey: 'goldVoucher',
  },
  {
    id: 'plan_ayurvedic_meal_box',
    icon: 'restaurant-outline',
    title: 'Organic Wholesome Meal Box (3 Days)',
    category: 'Nutrition Plan',
    description: 'Doorstep partner kitchen delivery of fresh, clean, tailored whole-food meals.',
    cost: 45_000,
    tokenCost: 18,
    assetKey: 'mealThali',
  },
  {
    id: 'plan_movement_posture',
    icon: 'fitness-outline',
    title: '30-Day Mindful Movement Plan',
    category: 'Movement Guide',
    description: 'Structured 30-day posture reset, joint mobility and core strength pathway.',
    cost: 12_500,
    tokenCost: 5,
    assetKey: 'bronzeMedallion',
  },
];

export const TICKET_FORGE_GEMS = 500;
export const TOKEN_FORGE_TICKETS = 5;
export const TOKEN_FORGE_GEMS = 2500;

export function ticketsFromLedger(ledger: readonly { kind: string; sourceId: string; diamonds?: number }[]): number {
  let tickets = 0;
  for (const e of ledger) {
    if (e.sourceId === 'forge_ticket' || (e.kind === 'market_spend' && e.sourceId === 'ticket_forged')) tickets += 1;
    if (e.kind === 'market_spend' && e.sourceId === 'token_forged_from_tickets') tickets -= 5;
    if (e.kind === 'market_spend' && (e.sourceId.startsWith('ticket_spent:') || e.sourceId === 'status_sanctuary_ticket')) tickets -= 1;
  }
  return Math.max(0, tickets);
}

export function tokensFromLedger(ledger: readonly { kind: string; sourceId: string; diamonds?: number }[]): number {
  let tokens = 0;
  for (const e of ledger) {
    if (e.sourceId === 'forge_token' || e.sourceId === 'token_forged' || e.sourceId === 'token_forged_from_tickets') tokens += 1;
    if (e.kind === 'market_spend' && e.sourceId.startsWith('token_spent:')) {
      const parts = e.sourceId.split(':');
      const count = parts.length > 2 ? parseInt(parts[2], 10) || 1 : 1;
      tokens -= count;
    }
  }
  return Math.max(0, tokens);
}

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

/**
 * Steady days pay more (owner reward spec §2): 3-day streak ×1.2, 7-day ×1.5, 30-day ×2.5.
 * Rounded, never below the base, so a 1-gem action stays 1 until the multiplier adds a whole gem.
 */
export function streakMultiplier(streak: number): number {
  if (streak >= 30) return 2.5;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.2;
  return 1;
}

export const withStreak = (gems: number, streak: number) => Math.max(gems, Math.round(gems * streakMultiplier(streak)));

export interface CollectorCard {
  id: string;
  title: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  icon: string;
}

export interface LevelChest {
  level: number;
  title: string;
  gems: number;
  card: CollectorCard;
}

/** One chest per milestone level (spec §3). Contents are fixed per tier, never random. */
export const LEVEL_CHESTS: LevelChest[] = [
  { level: 5, title: 'Wooden Sanctuary Chest', gems: 15, card: { id: 'card_grounded_seeker', title: 'Grounded Seeker', rarity: 'Common', icon: 'earth' } },
  { level: 10, title: 'Terracotta Sanctuary Vault', gems: 25, card: { id: 'card_sanctuary_sentinel', title: 'Sanctuary Sentinel', rarity: 'Rare', icon: 'shield-checkmark' } },
  { level: 20, title: 'Golden Sunburst Trove', gems: 40, card: { id: 'card_mindful_voyager', title: 'Mindful Voyager', rarity: 'Epic', icon: 'compass' } },
  { level: 50, title: 'Ecosystem Relic Box', gems: 50, card: { id: 'card_ecosystem_relic', title: 'Ecosystem Relic', rarity: 'Legendary', icon: 'planet' } },
  { level: 100, title: 'Grand Master Reliquary', gems: 50, card: { id: 'card_apex_thrivemaster', title: 'Apex Thrivemaster', rarity: 'Mythic', icon: 'star' } },
];

export const chestKey = (level: number) => `chest:${level}`;

/** Chests reached but not opened yet. */
export function chestsReady(level: number, ledgerKeys: readonly string[]): LevelChest[] {
  return LEVEL_CHESTS.filter((c) => level >= c.level && !ledgerKeys.includes(chestKey(c.level)));
}

/**
 * What the person owns, read from the ledger (which follows the account), so stickers, status and
 * cards come back after a reinstall. Physical requests are not "owned" items.
 */
export function ownedFromLedger(ledger: readonly { kind: string; sourceId: string }[]): string[] {
  const out = new Set<string>();
  for (const e of ledger) {
    if (e.kind === 'market_spend') {
      const isInternal = e.sourceId === 'forge_ticket' || e.sourceId === 'forge_token' || e.sourceId === 'token_forged_from_tickets';
      if (!isInternal) {
        if (e.sourceId.startsWith('token_spent:') || e.sourceId.startsWith('ticket_spent:')) {
          const parts = e.sourceId.split(':');
          const id = parts[1];
          if (id && !MARKET.find((m) => m.id === id)?.physical) out.add(id);
        } else if (!MARKET.find((m) => m.id === e.sourceId)?.physical) {
          out.add(e.sourceId);
        }
      }
    }
    if (e.kind === 'chest_reward') out.add(e.sourceId);
  }
  return [...out];
}
