export type ProductExperience = 'women_health' | 'men_health' | 'pride_wellbeing';

export const baseTokens = {
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  radius: {
    none: 0,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    pill: 9999,
  },
  motion: {
    fast: 120,
    standard: 220,
    slow: 320,
  },
  typography: {
    caption: 12,
    subbody: 14,
    body: 16,
    subheading: 20,
    heading: 26,
    display: 34,
  },
} as const;

/** Native splash background (app.json expo-splash-screen); the animated splash must match it. */
export const SPLASH_BACKGROUND = '#FAF7F2';
