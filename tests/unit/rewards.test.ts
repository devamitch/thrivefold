import {
  ACTION_REWARDS,
  canEarn,
  chestsReady,
  LEVEL_CHESTS,
  MARKET,
  ownedFromLedger,
  streakMultiplier,
  TIER_COST,
  withStreak,
} from '../../src/domain/game/rewards';

describe('gem rewards', () => {
  it('pays once per item per day and stops at the daily cap', () => {
    const date = '2026-10-30';
    expect(canEarn([], 'med_taken', date, 'a')).toEqual({ awarded: true, gems: ACTION_REWARDS.med_taken.gems });
    expect(canEarn(['action:med_taken:2026-10-30:a'], 'med_taken', date, 'a')).toEqual({ awarded: false, reason: 'duplicate' });
    const full = Array.from({ length: ACTION_REWARDS.own_key.perDay }, (_, i) => `action:own_key:${date}:p${i}`);
    expect(canEarn(full, 'own_key', date, 'new')).toEqual({ awarded: false, reason: 'daily_limit' });
  });
  it('prices tiers as set by the owner', () => {
    expect(TIER_COST).toEqual({ sticker: 100, status: 500, gear: 10_000 });
    expect(MARKET.filter((m) => m.physical).every((m) => m.cost === 10_000)).toBe(true);
  });
});

describe('streaks, chests and ownership', () => {
  it('multiplies action gems by streak, never below base', () => {
    expect([0, 3, 7, 30].map(streakMultiplier)).toEqual([1, 1.2, 1.5, 2.5]);
    expect(withStreak(1, 3)).toBe(1);
    expect(withStreak(3, 7)).toBe(5);
    expect(withStreak(2, 30)).toBe(5);
  });
  it('offers each reached chest once', () => {
    expect(chestsReady(4, [])).toEqual([]);
    expect(chestsReady(12, []).map((c) => c.level)).toEqual([5, 10]);
    expect(chestsReady(12, ['chest:5']).map((c) => c.level)).toEqual([10]);
    expect(new Set(LEVEL_CHESTS.map((c) => c.card.id)).size).toBe(LEVEL_CHESTS.length);
  });
  it('reads owned items from the ledger, skipping physical requests', () => {
    const owned = ownedFromLedger([
      { kind: 'market_spend', sourceId: 'sticker_zen_fox' },
      { kind: 'market_spend', sourceId: 'gear_gyroball' },
      { kind: 'chest_reward', sourceId: 'card_grounded_seeker' },
      { kind: 'action_reward', sourceId: 'med_taken:x' },
    ]);
    expect(owned.sort()).toEqual(['card_grounded_seeker', 'sticker_zen_fox']);
  });
  it('tracks tickets and tokens forged and spent from the ledger', () => {
    const ledger = [
      { kind: 'market_spend', sourceId: 'forge_ticket', diamonds: -500 },
      { kind: 'market_spend', sourceId: 'forge_ticket', diamonds: -500 },
      { kind: 'market_spend', sourceId: 'forge_token', diamonds: -2500 },
      { kind: 'market_spend', sourceId: 'token_spent:sticker_slumber_moon:1' },
    ];
    const { ticketsFromLedger, tokensFromLedger, WELLNESS_PLANS } = require('../../src/domain/game/rewards');
    expect(ticketsFromLedger(ledger)).toBe(2);
    expect(tokensFromLedger(ledger)).toBe(0);
    expect(WELLNESS_PLANS.length).toBeGreaterThanOrEqual(3);
  });
});
