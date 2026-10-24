import { getThemeColors, ThemeColors } from './colors';
import { ProductExperience } from './tokens';
import { typographyFor, type Typography } from './typography';
import { spacing } from './spacing';
import { useRootStore } from '../stores/useRootStore';

export interface ThemeContextValue {
  colors: ThemeColors;
  typography: Typography;
  spacing: typeof spacing;
  experience: ProductExperience;
  isDark: boolean;
}

export function useTheme(): ThemeContextValue {
  const experience = useRootStore((s) => s.experience);

  // Dark theme explicitly disabled for homely, calm, eye-friendly aesthetics
  const isDark = false;
  const scheme = 'light';
  const colors = getThemeColors(experience, scheme);

  return {
    colors,
    typography: typographyFor(experience),
    spacing,
    experience,
    isDark,
  };
}
