import { ACTION_REWARDS, canEarn, MARKET, TIER_COST } from '../../src/domain/game/rewards';

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
