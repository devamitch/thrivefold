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
  /** Secondary text and quiet fills on a primary-coloured hero. */
  onPrimaryMuted: string;
  onPrimarySurface: string;
  /** Second and third data colours on a primary-coloured hero (rings, legend dots). */
  onPrimaryAccent: string;
  onPrimaryInfo: string;
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
  /** Video-call screen (coach): always dark, whatever the theme. */
  callBackground: string;
  callSurface: string;
  callSurfaceStrong: string;
  callText: string;
  callMuted: string;
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
  /** Data colours legible on `primary`; default to translucent `onPrimary`. */
  onPrimaryData?: { accent: string; info: string };
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
    onPrimaryMuted: alpha(r.onPrimary, 0.74),
    onPrimarySurface: alpha(r.onPrimary, dark ? 0.16 : 0.14),
    onPrimaryAccent: r.onPrimaryData?.accent ?? alpha(r.onPrimary, 0.7),
    onPrimaryInfo: r.onPrimaryData?.info ?? alpha(r.onPrimary, 0.5),
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
    callBackground: '#0B0D10',
    callSurface: 'rgba(18, 20, 24, 0.62)',
    callSurfaceStrong: 'rgba(255, 255, 255, 0.16)',
    callText: '#FFFFFF',
    callMuted: 'rgba(255, 255, 255, 0.72)',
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
  onPrimaryData: { accent: '#F2D3B3', info: '#CFE3F2' },
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

/**
 * Men's health — deep slate navy on warm stone, with a muted brass accent. Low-glare:
 * no pure white in light mode, and a soft steel blue (not neon) as the dark primary.
 */
export const menLightColors = palette({
  experience: 'men_health',
  scheme: 'light',
  canvas: ['#F3F2EF', '#FAF9F7', '#EBE9E4', '#DFDCD5', '#D0CCC3'],
  ink: ['#141A22', '#46505C', '#626A75'],
  primary: '#22364F',
  onPrimary: '#F6F4F0',
  accent: '#9A7440',
  accentText: '#7A5A2E',
  gradient: ['#2C4562', '#22364F'],
  status: LIGHT_STATUS,
  dock: '#121820',
  dockActive: '#C9A46A',
  onPrimaryData: { accent: '#C9A46A', info: '#8FB4D6' },
});

export const menDarkColors = palette({
  experience: 'men_health',
  scheme: 'dark',
  canvas: ['#0F1216', '#161B21', '#1E242B', '#272E36', '#323A43'],
  ink: ['#ECEEF0', '#A9B1BA', '#7D8690'],
  primary: '#9DB7D5',
  onPrimary: '#0D1622',
  accent: '#C9A46A',
  accentText: '#D4B27C',
  gradient: ['#AFC5DF', '#9DB7D5'],
  status: DARK_STATUS,
  dock: '#0B0E12',
  dockActive: '#C9A46A',
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
  onPrimaryData: { accent: '#F4A8C6', info: '#A9D3F0' },
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

/**
 * Men's health in terracotta clay with a sage accent (the palette Women's used before).
 * Same recipe, own identity, so the two experiences can diverge later.
 */
export const menTerracottaColors = palette({
  experience: 'men_health',
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
  onPrimaryData: { accent: '#F2D3B3', info: '#CFE3F2' },
});

/**
 * Women's health in sage green on a soft sage-tinted ivory, with a muted clay accent.
 * Primary #557A63 on white is 4.8:1 (WCAG AA for text and controls).
 */
export const womenSageColors = palette({
  experience: 'women_health',
  scheme: 'light',
  canvas: ['#F7F8F4', '#FFFFFF', '#EEF1EA', '#E2E7DC', '#D3DACB'],
  ink: ['#18201B', '#4E5A52', '#78847C'],
  primary: '#557A63',
  onPrimary: '#FFFFFF',
  accent: '#B5704F',
  accentText: '#8F5538',
  gradient: ['#628A71', '#557A63'],
  status: LIGHT_STATUS,
  dock: '#141A16',
  dockActive: '#9CC3A8',
  onPrimaryData: { accent: '#F2D3B3', info: '#CFE3F2' },
});

/** One stable object per experience, so memoised screens do not re-render on every read. */
const GUEST_COLORS: Record<ProductExperience, ThemeColors> = {
  women_health: { ...menLightColors, experience: 'women_health' },
  men_health: menLightColors,
  pride_wellbeing: { ...menLightColors, experience: 'pride_wellbeing' },
};

/**
 * Colours by who is using the app: guests (not signed in) get the calm slate ink-blue palette;
 * signed-in people get their experience's palette. Dark theme is disabled for now.
 */
export function getThemeColors(
  experience: ProductExperience,
  _scheme: ColorScheme,
  isGuest = false,
): ThemeColors {
  if (isGuest) return GUEST_COLORS[experience];
  if (experience === 'men_health') return menTerracottaColors;
  if (experience === 'pride_wellbeing') return prideLightColors;
  return womenSageColors;
}
