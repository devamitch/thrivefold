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
    surfaceGlass: alpha(surface, 0.94),
    text: { primary: inkPrimary, secondary: inkSecondary, muted: inkMuted, inverse: dark ? background : '#FFFFFF' },
    primary: r.primary,
    onPrimary: r.onPrimary,
    primaryAlpha: alpha(r.primary, dark ? 0.18 : 0.1),
    primaryGradient: r.gradient,
    accent: r.accent,
    accentText: r.accentText,
    border: 'transparent',
    borderStrong: alpha(inkPrimary, dark ? 0.08 : 0.05),
    ...r.status,
    successSurface: alpha(r.status.success, dark ? 0.18 : 0.1),
    warningSurface: alpha(r.status.warning, dark ? 0.18 : 0.1),
    infoSurface: alpha(r.status.info, dark ? 0.18 : 0.1),
    errorSurface: alpha(r.status.error, dark ? 0.18 : 0.1),
    scrim: dark ? 'rgba(0, 0, 0, 0.65)' : alpha(inkPrimary, 0.35),
    brandAccent: r.accent,
    badgeBg: alpha(r.primary, dark ? 0.2 : 0.1),
    badgeText: dark ? r.primary : r.primary,
    dock: r.dock,
    dockActive: r.dockActive,
    dockMuted: dark ? '#7A7570' : '#948D86',
  };
}

const LIGHT_STATUS = { success: '#3B7349', warning: '#9E6A17', info: '#3E6F94', error: '#B84535' };
const DARK_STATUS = { success: '#7DB58E', warning: '#DEB05C', info: '#7EA6CC', error: '#E37F71' };

/** Women's health — serene warm porcelain ivory, terracotta clay and sage. */
export const womenLightColors = palette({
  experience: 'women_health',
  scheme: 'light',
  canvas: ['#FAF8F5', '#FFFFFF', '#F4EFEA', '#EAE2DA', '#DFD5CB'],
  ink: ['#1C1917', '#57524E', '#857D76'],
  primary: '#B85D3E',
  onPrimary: '#FFFFFF',
  accent: '#5E826D',
  accentText: '#486956',
  gradient: ['#C76A4B', '#B85D3E'],
  status: LIGHT_STATUS,
  dock: '#1A1614',
  dockActive: '#E28A6D',
});

export const womenDarkColors = palette({
  experience: 'women_health',
  scheme: 'dark',
  canvas: ['#13100E', '#1C1816', '#27221F', '#332C28', '#403833'],
  ink: ['#F7F4F0', '#C6BEB5', '#8A8177'],
  primary: '#E28A6D',
  onPrimary: '#17110E',
  accent: '#8EB9A0',
  accentText: '#A6CDB5',
  gradient: ['#ECA085', '#E28A6D'],
  status: DARK_STATUS,
  dock: '#13100E',
  dockActive: '#E28A6D',
});

/** Men's health — frosted titanium slate, architectural deep spruce teal and forged amber bronze. */
export const menLightColors = palette({
  experience: 'men_health',
  scheme: 'light',
  canvas: ['#F3F6F8', '#FFFFFF', '#E7EDF0', '#D9E2E6', '#C9D5DB'],
  ink: ['#0F181A', '#3C4D51', '#6B7C80'],
  primary: '#1B5760',
  onPrimary: '#FFFFFF',
  accent: '#C47D33',
  accentText: '#15454D',
  gradient: ['#246B75', '#1B5760'],
  status: LIGHT_STATUS,
  dock: '#0D1618',
  dockActive: '#42B0A9',
});

export const menDarkColors = palette({
  experience: 'men_health',
  scheme: 'dark',
  canvas: ['#0B1113', '#121C1F', '#1A2529', '#233237', '#2E3F45'],
  ink: ['#EEF4F5', '#A2B5B8', '#66787B'],
  primary: '#4CBAB3',
  onPrimary: '#071517',
  accent: '#E8A24B',
  accentText: '#4CBAB3',
  gradient: ['#5FC4BD', '#4CBAB3'],
  status: DARK_STATUS,
  dock: '#080E10',
  dockActive: '#4CBAB3',
});

/** LGBTQ+ wellbeing — lavender porcelain, royal amethyst, and glowing rose quartz. */
const QUIET_RAINBOW = ['#C86678', '#D49E48', '#68A882', '#5A8EB8', '#8E6CB8'] as const;

export const prideLightColors = palette({
  experience: 'pride_wellbeing',
  scheme: 'light',
  canvas: ['#F7F5FA', '#FFFFFF', '#EFEAF5', '#E2D8EC', '#D4C7DF'],
  ink: ['#181222', '#4C415D', '#776B8B'],
  primary: '#7348B8',
  onPrimary: '#FFFFFF',
  accent: '#B84776',
  accentText: '#5C3797',
  gradient: QUIET_RAINBOW,
  status: LIGHT_STATUS,
  dock: '#140E1E',
  dockActive: '#B682F2',
});

export const prideDarkColors = palette({
  experience: 'pride_wellbeing',
  scheme: 'dark',
  canvas: ['#0E0B16', '#171224', '#211A31', '#2C233F', '#392E50'],
  ink: ['#F6F2FA', '#B7AACC', '#75688A'],
  primary: '#B682F2',
  onPrimary: '#100520',
  accent: '#F07AA6',
  accentText: '#B682F2',
  gradient: QUIET_RAINBOW,
  status: DARK_STATUS,
  dock: '#0A0711',
  dockActive: '#B682F2',
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
