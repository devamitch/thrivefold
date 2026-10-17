import type { ProductExperience } from './tokens';

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  scheme: ColorScheme;
  experience: ProductExperience;
  background: string;
  surface: string;
  surface1: string;
  surface2: string;
  surface3: string;
  surfaceGlass: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  primary: string;
  onPrimary: string;
  primaryAlpha: string;
  primaryGradient: readonly [string, string, ...string[]];
  accent: string;
  accentText: string;
  border: string;
  borderStrong: string;
  success: string;
  warning: string;
  info: string;
  error: string;
  successSurface: string;
  warningSurface: string;
  infoSurface: string;
  errorSurface: string;
  scrim: string;
  brandAccent: string;
  badgeBg: string;
  badgeText: string;
}

export const womenLightColors: ThemeColors = {
  scheme: 'light',
  experience: 'women_health',
  background: '#FAF7F5',
  surface: '#FFFFFF',
  surface1: '#F4EFEA',
  surface2: '#EFE6DE',
  surface3: '#E5D8CC',
  surfaceGlass: 'rgba(255, 255, 255, 0.85)',
  text: {
    primary: '#2D2522',
    secondary: '#6E5F5A',
    muted: '#9E8D86',
    inverse: '#FFFFFF',
  },
  primary: '#B45309', // Warm terracotta / lotus
  onPrimary: '#FFFFFF',
  primaryAlpha: 'rgba(180, 83, 9, 0.12)',
  primaryGradient: ['#D97706', '#92400E'],
  accent: '#7C3AED', // Lavender / violet accent from HarmonyBloom
  accentText: '#6D28D9',
  border: 'rgba(45, 37, 34, 0.08)',
  borderStrong: 'rgba(45, 37, 34, 0.16)',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  error: '#EF4444',
  successSurface: '#ECFDF5',
  warningSurface: '#FFFBEB',
  infoSurface: '#EFF6FF',
  errorSurface: '#FEF2F2',
  scrim: 'rgba(45, 37, 34, 0.45)',
  brandAccent: '#E11D48',
  badgeBg: 'rgba(180, 83, 9, 0.1)',
  badgeText: '#B45309',
};

export const womenDarkColors: ThemeColors = {
  scheme: 'dark',
  experience: 'women_health',
  background: '#191514',
  surface: '#241F1D',
  surface1: '#2E2724',
  surface2: '#3A312E',
  surface3: '#463C38',
  surfaceGlass: 'rgba(36, 31, 29, 0.85)',
  text: {
    primary: '#FDFCFB',
    secondary: '#C4B7B2',
    muted: '#8A7A74',
    inverse: '#191514',
  },
  primary: '#F59E0B',
  onPrimary: '#191514',
  primaryAlpha: 'rgba(245, 158, 11, 0.18)',
  primaryGradient: ['#F59E0B', '#B45309'],
  accent: '#A78BFA',
  accentText: '#C4B5FD',
  border: 'rgba(253, 252, 251, 0.08)',
  borderStrong: 'rgba(253, 252, 251, 0.16)',
  success: '#34D399',
  warning: '#FBBF24',
  info: '#60A5FA',
  error: '#F87171',
  successSurface: 'rgba(16, 185, 129, 0.15)',
  warningSurface: 'rgba(245, 158, 11, 0.15)',
  infoSurface: 'rgba(59, 130, 246, 0.15)',
  errorSurface: 'rgba(239, 68, 68, 0.15)',
  scrim: 'rgba(0, 0, 0, 0.7)',
  brandAccent: '#FB7185',
  badgeBg: 'rgba(245, 158, 11, 0.15)',
  badgeText: '#FBBF24',
};

export const menLightColors: ThemeColors = {
  scheme: 'light',
  experience: 'men_health',
  background: '#F5F7F8',
  surface: '#FFFFFF',
  surface1: '#EAF0F2',
  surface2: '#DCE4E7',
  surface3: '#CCD7DC',
  surfaceGlass: 'rgba(255, 255, 255, 0.88)',
  text: {
    primary: '#122329',
    secondary: '#3E5660',
    muted: '#718C97',
    inverse: '#FFFFFF',
  },
  primary: '#173C4A', // Midnight teal
  onPrimary: '#FFFFFF',
  primaryAlpha: 'rgba(23, 60, 74, 0.12)',
  primaryGradient: ['#173C4A', '#2D6273'],
  accent: '#C18B43', // Warm amber
  accentText: '#9A6B29',
  border: 'rgba(18, 35, 41, 0.09)',
  borderStrong: 'rgba(18, 35, 41, 0.18)',
  success: '#059669',
  warning: '#D97706',
  info: '#2563EB',
  error: '#DC2626',
  successSurface: '#ECFDF5',
  warningSurface: '#FFFBEB',
  infoSurface: '#EFF6FF',
  errorSurface: '#FEF2F2',
  scrim: 'rgba(18, 35, 41, 0.5)',
  brandAccent: '#397A78',
  badgeBg: 'rgba(23, 60, 74, 0.09)',
  badgeText: '#173C4A',
};

export const menDarkColors: ThemeColors = {
  scheme: 'dark',
  experience: 'men_health',
  background: '#0B1418',
  surface: '#131F24',
  surface1: '#1C2D34',
  surface2: '#273D46',
  surface3: '#324E59',
  surfaceGlass: 'rgba(19, 31, 36, 0.88)',
  text: {
    primary: '#EDF3F5',
    secondary: '#A3B9C2',
    muted: '#6B828C',
    inverse: '#0B1418',
  },
  primary: '#438A9C',
  onPrimary: '#FFFFFF',
  primaryAlpha: 'rgba(67, 138, 156, 0.2)',
  primaryGradient: ['#326B7A', '#1C424C'],
  accent: '#F59E0B',
  accentText: '#FCD34D',
  border: 'rgba(237, 243, 245, 0.08)',
  borderStrong: 'rgba(237, 243, 245, 0.16)',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  error: '#EF4444',
  successSurface: 'rgba(16, 185, 129, 0.15)',
  warningSurface: 'rgba(245, 158, 11, 0.15)',
  infoSurface: 'rgba(59, 130, 246, 0.15)',
  errorSurface: 'rgba(239, 68, 68, 0.15)',
  scrim: 'rgba(0, 0, 0, 0.75)',
  brandAccent: '#5EEAD4',
  badgeBg: 'rgba(67, 138, 156, 0.18)',
  badgeText: '#7DD3FC',
};

export const prideLightColors: ThemeColors = {
  scheme: 'light',
  experience: 'pride_wellbeing',
  background: '#FAF8F5',
  surface: '#FFFFFF',
  surface1: '#F4EFEB',
  surface2: '#EFE5DD',
  surface3: '#E4D5C9',
  surfaceGlass: 'rgba(255, 255, 255, 0.88)',
  text: {
    primary: '#242028',
    secondary: '#5C5468',
    muted: '#9186A0',
    inverse: '#FFFFFF',
  },
  primary: '#D97706', // Warm Gold
  onPrimary: '#FFFFFF',
  primaryAlpha: 'rgba(217, 119, 6, 0.12)',
  primaryGradient: ['#E11D48', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
  accent: '#8B5CF6',
  accentText: '#7C3AED',
  border: 'rgba(36, 32, 40, 0.08)',
  borderStrong: 'rgba(36, 32, 40, 0.16)',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  error: '#EF4444',
  successSurface: '#ECFDF5',
  warningSurface: '#FFFBEB',
  infoSurface: '#EFF6FF',
  errorSurface: '#FEF2F2',
  scrim: 'rgba(36, 32, 40, 0.45)',
  brandAccent: '#D97706',
  badgeBg: 'rgba(217, 119, 6, 0.1)',
  badgeText: '#B45309',
};

export const prideDarkColors: ThemeColors = {
  scheme: 'dark',
  experience: 'pride_wellbeing',
  background: '#16131A',
  surface: '#201C26',
  surface1: '#2A2533',
  surface2: '#352F40',
  surface3: '#413A4D',
  surfaceGlass: 'rgba(32, 28, 38, 0.88)',
  text: {
    primary: '#F9F7FB',
    secondary: '#BFB5CE',
    muted: '#867999',
    inverse: '#16131A',
  },
  primary: '#FBBF24',
  onPrimary: '#16131A',
  primaryAlpha: 'rgba(251, 191, 36, 0.2)',
  primaryGradient: ['#FB7185', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA'],
  accent: '#A78BFA',
  accentText: '#C4B5FD',
  border: 'rgba(249, 247, 251, 0.08)',
  borderStrong: 'rgba(249, 247, 251, 0.16)',
  success: '#34D399',
  warning: '#FBBF24',
  info: '#60A5FA',
  error: '#F87171',
  successSurface: 'rgba(16, 185, 129, 0.15)',
  warningSurface: 'rgba(245, 158, 11, 0.15)',
  infoSurface: 'rgba(59, 130, 246, 0.15)',
  errorSurface: 'rgba(239, 68, 68, 0.15)',
  scrim: 'rgba(0, 0, 0, 0.75)',
  brandAccent: '#FBBF24',
  badgeBg: 'rgba(251, 191, 36, 0.15)',
  badgeText: '#FCD34D',
};

export function getThemeColors(experience: ProductExperience, scheme: ColorScheme): ThemeColors {
  if (experience === 'men_health') {
    return scheme === 'dark' ? menDarkColors : menLightColors;
  }
  if (experience === 'pride_wellbeing') {
    return scheme === 'dark' ? prideDarkColors : prideLightColors;
  }
  return scheme === 'dark' ? womenDarkColors : womenLightColors;
}
