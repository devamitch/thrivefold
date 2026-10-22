import type { ProductExperience } from './tokens';

export type ColorScheme = 'light' | 'dark';

/**
 * Semantic colour tokens. Screens use these names only — never raw hex — so every
 * experience and scheme stays consistent (master spec §2.4, §34).
 *
 * Palette intent: calm, low-glare and eye-friendly. Warm off-white canvases instead of
 * pure white, muted primaries that still pass WCAG AA on their surfaces, desaturated
 * status colours, and one accent per experience used sparingly.
 */
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
  /** Bottom dock (always a deep surface, in both schemes) and its icon colours. */
  dock: string;
  dockActive: string;
  dockMuted: string;
}

const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

interface Recipe {
  experience: ProductExperience;
  scheme: ColorScheme;
  canvas: [background: string, surface: string, s1: string, s2: string, s3: string];
  ink: [primary: string, secondary: string, muted: string];
  primary: string;
  onPrimary: string;
  accent: string;
  accentText: string;
  gradient: readonly [string, string, ...string[]];
  status: { success: string; warning: string; info: string; error: string };
  dock: string;
  dockActive: string;
}

function palette(r: Recipe): ThemeColors {
  const dark = r.scheme === 'dark';
  const [background, surface, surface1, surface2, surface3] = r.canvas;
  const [inkPrimary, inkSecondary, inkMuted] = r.ink;
  return {
    scheme: r.scheme,
    experience: r.experience,
    background,
    surface,
    surface1,
    surface2,
    surface3,
    surfaceGlass: alpha(surface, 0.92),
    text: { primary: inkPrimary, secondary: inkSecondary, muted: inkMuted, inverse: dark ? background : '#FFFFFF' },
    primary: r.primary,
    onPrimary: r.onPrimary,
    primaryAlpha: alpha(r.primary, dark ? 0.2 : 0.1),
    primaryGradient: r.gradient,
    accent: r.accent,
    accentText: r.accentText,
    border: alpha(inkPrimary, dark ? 0.1 : 0.08),
    borderStrong: alpha(inkPrimary, dark ? 0.18 : 0.15),
    ...r.status,
    successSurface: alpha(r.status.success, dark ? 0.18 : 0.1),
    warningSurface: alpha(r.status.warning, dark ? 0.18 : 0.1),
    infoSurface: alpha(r.status.info, dark ? 0.18 : 0.1),
    errorSurface: alpha(r.status.error, dark ? 0.18 : 0.1),
    scrim: dark ? 'rgba(0, 0, 0, 0.6)' : alpha(inkPrimary, 0.4),
    brandAccent: r.accent,
    badgeBg: alpha(r.primary, dark ? 0.2 : 0.1),
    badgeText: dark ? r.primary : r.primary,
    dock: r.dock,
    dockActive: r.dockActive,
    dockMuted: dark ? '#8C847D' : '#A39B94',
  };
}

const LIGHT_STATUS = { success: '#43704F', warning: '#8C6114', info: '#4A6F8C', error: '#B0503F' };
const DARK_STATUS = { success: '#86B596', warning: '#D9AE62', info: '#8AAAC4', error: '#E08F80' };

/** Women's health — clay and sage. */
export const womenLightColors = palette({
  experience: 'women_health',
  scheme: 'light',
  canvas: ['#F7F3EE', '#FFFDFA', '#F0EAE3', '#E7DED5', '#DCD0C4'],
  ink: ['#2B2420', '#5E544E', '#6F655E'],
  primary: '#A0583F',
  onPrimary: '#FFFFFF',
  accent: '#5C7A66',
  accentText: '#4A6654',
  gradient: ['#B86A4F', '#A0583F'],
  status: LIGHT_STATUS,
  dock: '#2A2420',
  dockActive: '#E4A98F',
});

export const womenDarkColors = palette({
  experience: 'women_health',
  scheme: 'dark',
  canvas: ['#171412', '#201C19', '#2A2521', '#332D29', '#3E3732'],
  ink: ['#F1EAE3', '#C2B6AC', '#8E847C'],
  primary: '#DA9B82',
  onPrimary: '#1F1714',
  accent: '#93B39D',
  accentText: '#A9C7B2',
  gradient: ['#E3AC95', '#DA9B82'],
  status: DARK_STATUS,
  dock: '#25211E',
  dockActive: '#E4A98F',
});

/** Men's health — slate teal and sand. */
export const menLightColors = palette({
  experience: 'men_health',
  scheme: 'light',
  canvas: ['#F2F4F3', '#FCFDFC', '#E8ECEB', '#DDE3E2', '#D0D8D7'],
  ink: ['#1D2729', '#4C5A5D', '#5F6C6B'],
  primary: '#2E5C62',
  onPrimary: '#FFFFFF',
  accent: '#9C7A4B',
  accentText: '#7E6138',
  gradient: ['#3A6F76', '#2E5C62'],
  status: LIGHT_STATUS,
  dock: '#1C2527',
  dockActive: '#8FC3C0',
});

export const menDarkColors = palette({
  experience: 'men_health',
  scheme: 'dark',
  canvas: ['#111618', '#182023', '#20292C', '#283235', '#313C3F'],
  ink: ['#E8EEEE', '#AEBBBC', '#7C8A8B'],
  primary: '#7DB5B2',
  onPrimary: '#0F1A1B',
  accent: '#D1AE7A',
  accentText: '#DEC193',
  gradient: ['#8FC3C0', '#7DB5B2'],
  status: DARK_STATUS,
  dock: '#1A2224',
  dockActive: '#8FC3C0',
});

/** LGBTQ+ wellbeing — deep gold and plum; the rainbow is an accent, never a wash. */
const QUIET_RAINBOW = ['#C27C83', '#CFA25A', '#7FA58A', '#6E91B0', '#9283B2'] as const;

export const prideLightColors = palette({
  experience: 'pride_wellbeing',
  scheme: 'light',
  canvas: ['#F6F4F1', '#FEFDFB', '#EEEAE4', '#E4DED6', '#D8D1C8'],
  ink: ['#262229', '#57505D', '#726A78'],
  primary: '#7E5C1E',
  onPrimary: '#FFFFFF',
  accent: '#6C5A8C',
  accentText: '#5A4878',
  gradient: QUIET_RAINBOW,
  status: LIGHT_STATUS,
  dock: '#26222A',
  dockActive: '#E2C17A',
});

export const prideDarkColors = palette({
  experience: 'pride_wellbeing',
  scheme: 'dark',
  canvas: ['#151318', '#1D1A21', '#26222B', '#2F2A35', '#3A3440'],
  ink: ['#F2EFF5', '#BCB3C6', '#867D90'],
  primary: '#DDB867',
  onPrimary: '#1D1810',
  accent: '#AE9BD0',
  accentText: '#C2B3DD',
  gradient: QUIET_RAINBOW,
  status: DARK_STATUS,
  dock: '#211D25',
  dockActive: '#E2C17A',
});

export function getThemeColors(experience: ProductExperience, scheme: ColorScheme): ThemeColors {
  if (experience === 'men_health') {
    return scheme === 'dark' ? menDarkColors : menLightColors;
  }
  if (experience === 'pride_wellbeing') {
    return scheme === 'dark' ? prideDarkColors : prideLightColors;
  }
  return scheme === 'dark' ? womenDarkColors : womenLightColors;
}
