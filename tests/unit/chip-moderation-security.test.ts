import { validateChipSequence, MAX_CHIPS_PER_COMPOSITION } from '../../src/domain/chips/moderation';
import { APPROVED_CHIPS } from '../../src/domain/chips/catalog';

describe('Thrivefold Chip Moderation & Anti-Injection Security Tests', () => {
  test('Disallows empty or missing chip arrays', () => {
    const emptyResult = validateChipSequence([]);
    expect(emptyResult.valid).toBe(false);
    expect(emptyResult.reason).toContain('at least 1 curated card');

    const invalidResult = validateChipSequence(null as any);
    expect(invalidResult.valid).toBe(false);
  });

  test(`Disallows sequences exceeding maximum allowed cards (${MAX_CHIPS_PER_COMPOSITION})`, () => {
    const tooMany = ['intro_1', 'intro_2', 'checkin_1', 'checkin_2', 'appreciate_1', 'appreciate_2'];
    const result = validateChipSequence(tooMany);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain(`at most ${MAX_CHIPS_PER_COMPOSITION} cards`);
  });

  test('Blocks arbitrary free-text injection attempts', () => {
    const arbitraryAttempts = [
      'Call me at 555-0199',
      'Follow my instagram @badactor',
      'https://malicious-link.com',
      '<script>alert("xss")</script>',
      'DROP TABLE thrivefold_profiles;',
    ];

    for (const attempt of arbitraryAttempts) {
      const result = validateChipSequence([attempt]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Arbitrary text input is prohibited');
    }
  });

  test('Assembles valid approved chip sequences with accurate preview', () => {
    const validIds = ['intro_01', 'interest_01'];
    const result = validateChipSequence(validIds);
    expect(result.valid).toBe(true);
    expect(result.chips).toHaveLength(2);
    expect(result.chips[0].id).toBe('intro_01');
    expect(result.assembledPreview).toContain('Hello! I hope you are having a peaceful and calm day.');
  });

  test('All approved chips in the catalog conform to strict curated safety standards', () => {
    expect(APPROVED_CHIPS.length).toBeGreaterThanOrEqual(10);
    for (const chip of APPROVED_CHIPS) {
      expect(chip.id).toBeTruthy();
      expect(chip.category).toBeTruthy();
      expect(chip.text.length).toBeGreaterThan(5);
      expect(['safe', 'boundary', 'contact_sensitive']).toContain(chip.riskClass);
      // Verify no chip text accidentally leaks raw contact prompt templates
      expect(chip.text).not.toMatch(/\b(phone|whatsapp|snapchat|telegram|call me)\b/i);
    }
  });
});
