import { validateChipSequence, MAX_CHIPS_PER_COMPOSITION } from '../../src/domain/chips/moderation';

describe('Thrivefold Chip Catalog & Anti-Bypass Moderation', () => {
  test('P0: Approved chip sequence passes validation and creates assembled preview', () => {
    const chipIds = ['intro_01', 'interest_01', 'wellbeing_01'];
    const result = validateChipSequence(chipIds);

    expect(result.valid).toBe(true);
    expect(result.chips.length).toBe(3);
    expect(result.assembledPreview).toContain('Hello! I hope you are having a peaceful and calm day.');
    expect(result.assembledPreview).toContain('Remember to be kind and patient');
  });

  test('P0: Unknown or arbitrary text chip IDs fail validation', () => {
    const invalidIds = ['intro_01', 'arbitrary_injected_phone_number_or_text'];
    const result = validateChipSequence(invalidIds);

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Unknown or unapproved card identifier');
  });

  test('P0: Empty sequence fails validation', () => {
    const result = validateChipSequence([]);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('at least 1 curated card');
  });

  test('P0: Exceeding max chip count (5) fails validation', () => {
    const sixChips = ['intro_01', 'intro_02', 'intro_03', 'interest_01', 'interest_02', 'interest_03'];
    expect(sixChips.length).toBeGreaterThan(MAX_CHIPS_PER_COMPOSITION);

    const result = validateChipSequence(sixChips);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain(`at most ${MAX_CHIPS_PER_COMPOSITION} cards`);
  });
});
