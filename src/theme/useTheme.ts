import { useColorScheme } from 'react-native';
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
  const systemScheme = useColorScheme();
  const themeMode = useRootStore((s) => s.themeMode);
  const experience = useRootStore((s) => s.experience);

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const scheme = isDark ? 'dark' : 'light';
  const colors = getThemeColors(experience, scheme);

  return {
    colors,
    typography: typographyFor(experience),
    spacing,
    experience,
    isDark,
  };
}
