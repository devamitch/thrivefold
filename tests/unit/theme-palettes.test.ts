import { getThemeColors, menLightColors } from '../../src/theme/colors';

describe('palette by audience', () => {
  it('gives guests the slate ink-blue palette whatever their experience', () => {
    expect(getThemeColors('women_health', 'light', true).primary).toBe(menLightColors.primary);
    expect(getThemeColors('men_health', 'light', true).primary).toBe(menLightColors.primary);
    // stable object, so memoised screens do not re-render
    expect(getThemeColors('women_health', 'light', true)).toBe(getThemeColors('women_health', 'light', true));
  });

  it('gives signed-in men terracotta and women sage', () => {
    expect(getThemeColors('men_health', 'light').primary).toBe('#B85D3E');
    expect(getThemeColors('women_health', 'light').primary).toBe('#557A63');
  });
});
