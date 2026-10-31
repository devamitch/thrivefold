import {
  ACTION_REWARDS,
  LEVEL_CHESTS,
  MARKET,
  TICKET_FORGE_GEMS,
  TOKEN_FORGE_GEMS,
  TOKEN_FORGE_TICKETS,
  WELLNESS_PLANS,
  chestKey,
  chestsReady,
  ownedFromLedger,
  ticketsFromLedger,
  tokensFromLedger,
} from '../../src/domain/game/rewards';

describe('Thrivefold Marketplace & Rewards Architecture', () => {
  describe('1. Catalogue Integrity & Semantic Pricing', () => {
    it('verifies all market items have valid titles, costs, and valid categories', () => {
      expect(MARKET.length).toBeGreaterThan(0);
      for (const item of MARKET) {
        expect(item.id).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.cost).toBeGreaterThan(0);
        expect(['sticker', 'status', 'gear']).toContain(item.tier);
      }
    });

    it('verifies physical gear items require tokens and are marked physical', () => {
      const gearItems = MARKET.filter((m) => m.physical);
      expect(gearItems.length).toBeGreaterThanOrEqual(4);
      for (const gear of gearItems) {
        expect(gear.tokenCost).toBeDefined();
        expect(gear.tokenCost!).toBeGreaterThan(0);
        expect(gear.physical).toBe(true);
      }
    });

    it('verifies all 5 milestone chests have unique levels, cards, and gems', () => {
      expect(LEVEL_CHESTS).toHaveLength(5);
      const levels = LEVEL_CHESTS.map((c) => c.level);
      expect(levels).toEqual([5, 10, 20, 50, 100]);

      for (const chest of LEVEL_CHESTS) {
        expect(chest.gems).toBeGreaterThan(0);
        expect(chest.card.id).toBeDefined();
        expect(chest.card.title).toBeDefined();
      }
    });
  });

  describe('2. Ledger Calculations & Ownership', () => {
    it('accurately derives owned items and excludes physical orders from owned set', () => {
      const sampleLedger = [
        { kind: 'market_spend', sourceId: 'sticker_zen_fox' },
        { kind: 'market_spend', sourceId: 'gear_pushup_bars' },
        { kind: 'chest_reward', sourceId: 'card_grounded_seeker' },
      ];

      const owned = ownedFromLedger(sampleLedger);
      expect(owned).toContain('sticker_zen_fox');
      expect(owned).toContain('card_grounded_seeker');
      expect(owned).not.toContain('gear_pushup_bars');
    });

    it('handles tickets and tokens forged and spent across the ledger lifecycle', () => {
      const ledger: { kind: string; sourceId: string; diamonds?: number }[] = [
        // Forge 2 tickets
        { kind: 'market_spend', sourceId: 'forge_ticket', diamonds: -500 },
        { kind: 'market_spend', sourceId: 'forge_ticket', diamonds: -500 },
      ];
      expect(ticketsFromLedger(ledger)).toBe(2);
      expect(tokensFromLedger(ledger)).toBe(0);

      // Forge 1 token from 5 tickets
      ledger.push(
        { kind: 'market_spend', sourceId: 'forge_ticket', diamonds: -500 },
        { kind: 'market_spend', sourceId: 'forge_ticket', diamonds: -500 },
        { kind: 'market_spend', sourceId: 'forge_ticket', diamonds: -500 },
        { kind: 'market_spend', sourceId: 'token_forged_from_tickets' },
      );
      expect(ticketsFromLedger(ledger)).toBe(0);
      expect(tokensFromLedger(ledger)).toBe(1);

      // Spend 1 token on gear
      ledger.push({ kind: 'market_spend', sourceId: 'token_spent:gear_pushup_bars:1' });
      expect(tokensFromLedger(ledger)).toBe(0);
    });
  });

  describe('3. Milestone Chest Unlocking Logic', () => {
    it('returns available chests based on current user level and claimed status', () => {
      const keys: string[] = [];

      // Level 1: No chests ready
      expect(chestsReady(1, keys)).toHaveLength(0);

      // Level 5: Wooden Sanctuary Chest ready
      const atLevel5 = chestsReady(5, keys);
      expect(atLevel5).toHaveLength(1);
      expect(atLevel5[0].title).toBe('Wooden Sanctuary Chest');

      // Level 25: Levels 5, 10, 20 ready
      const atLevel25 = chestsReady(25, keys);
      expect(atLevel25.map((c) => c.level)).toEqual([5, 10, 20]);

      // Open Level 5: Only 10 and 20 remain ready
      keys.push(chestKey(5));
      const atLevel25Claimed5 = chestsReady(25, keys);
      expect(atLevel25Claimed5.map((c) => c.level)).toEqual([10, 20]);
    });
  });
});
