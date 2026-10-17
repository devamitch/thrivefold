import { useColorScheme } from 'react-native';
import { getThemeColors, ThemeColors } from './colors';
import { ProductExperience } from './tokens';
import { typography } from './typography';
import { spacing } from './spacing';
import { useAppStore } from '../stores/useAppStore';

export interface ThemeContextValue {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  experience: ProductExperience;
  isDark: boolean;
}

export function useTheme(): ThemeContextValue {
  const systemScheme = useColorScheme();
  const themeMode = useAppStore((s) => s.themeMode);
  const experience = useAppStore((s) => s.experience);

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const scheme = isDark ? 'dark' : 'light';
  const colors = getThemeColors(experience, scheme);

  return {
    colors,
    typography,
    spacing,
    experience,
    isDark,
  };
}
