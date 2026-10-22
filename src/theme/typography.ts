import { TextStyle } from 'react-native';

import type { ProductExperience } from './tokens';

/**
 * Type system. All faces are embedded at build time by the expo-font plugin (app.json);
 * each weight is its own family because on Android a custom family plus a separate
 * fontWeight can fall back to the system font.
 *
 * - Women's health & LGBTQ+: Fraunces (static SemiBold/Medium serif) for display/headings — warm,
 *   editorial — with Geist (shared with BlinkQuest/Neev) for everything you read.
 * - Men's health: Space Mono for headings and labels (calm, technical character) with
 *   Space Grotesk for body text, because long monospaced paragraphs tire the eye.
 */
interface Faces {
  display: string;
  heading: string;
  subheading: string;
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
  mono: string;
  monoBold: string;
  label: string;
  stat: string;
  /** Monospaced/serif display faces read larger; nudge tracking per family. */
  displayTracking: number;
}

const SERIF_FACES: Faces = {
  display: 'Fraunces-Variable',
  heading: 'Fraunces-Medium',
  subheading: 'Geist-SemiBold',
  regular: 'Geist-Regular',
  medium: 'Geist-Medium',
  semibold: 'Geist-SemiBold',
  bold: 'Geist-Bold',
  mono: 'SpaceMono-Regular',
  monoBold: 'SpaceMono-Bold',
  label: 'Geist-SemiBold',
  stat: 'Fraunces-SemiBold',
  displayTracking: -0.6,
};

const MONO_FACES: Faces = {
  display: 'SpaceMono-Bold',
  heading: 'SpaceMono-Bold',
  subheading: 'SpaceMono-Bold',
  regular: 'SpaceGrotesk-Regular',
  medium: 'SpaceGrotesk-Medium',
  semibold: 'SpaceGrotesk-SemiBold',
  bold: 'SpaceGrotesk-Bold',
  mono: 'SpaceMono-Regular',
  monoBold: 'SpaceMono-Bold',
  label: 'SpaceMono-Regular',
  stat: 'SpaceMono-Bold',
  displayTracking: -1.2,
};

function build(f: Faces) {
  return {
    hero: { fontFamily: f.display, fontSize: 38, lineHeight: 46, letterSpacing: f.displayTracking - 0.4 } as TextStyle,
    display: { fontFamily: f.display, fontSize: 32, lineHeight: 40, letterSpacing: f.displayTracking } as TextStyle,
    heading: { fontFamily: f.heading, fontSize: 24, lineHeight: 31, letterSpacing: f.displayTracking / 2 } as TextStyle,
    subheading: { fontFamily: f.subheading, fontSize: 18, lineHeight: 24, letterSpacing: -0.2 } as TextStyle,
    body: { fontFamily: f.regular, fontSize: 16, lineHeight: 23, letterSpacing: 0 } as TextStyle,
    bodyBold: { fontFamily: f.semibold, fontSize: 16, lineHeight: 23, letterSpacing: 0 } as TextStyle,
    subbody: { fontFamily: f.regular, fontSize: 14, lineHeight: 20, letterSpacing: 0 } as TextStyle,
    subbodyBold: { fontFamily: f.semibold, fontSize: 14, lineHeight: 20, letterSpacing: 0 } as TextStyle,
    caption: { fontFamily: f.regular, fontSize: 12, lineHeight: 17, letterSpacing: 0.1 } as TextStyle,
    captionBold: { fontFamily: f.semibold, fontSize: 12, lineHeight: 17, letterSpacing: 0.1 } as TextStyle,
    label: {
      fontFamily: f.label,
      fontSize: 11,
      lineHeight: 15,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    } as TextStyle,
    mono: { fontFamily: f.mono, fontSize: 13, lineHeight: 18, letterSpacing: 0 } as TextStyle,
    monoBold: { fontFamily: f.monoBold, fontSize: 13, lineHeight: 18, letterSpacing: 0 } as TextStyle,
    stat: { fontFamily: f.stat, fontSize: 28, lineHeight: 34, letterSpacing: f.displayTracking } as TextStyle,
  } as const;
}

export type Typography = ReturnType<typeof build>;

const SERIF = build(SERIF_FACES);
const MONO = build(MONO_FACES);

export function typographyFor(experience: ProductExperience): Typography {
  return experience === 'men_health' ? MONO : SERIF;
}

/** Default (women's health) set, for code outside a themed component. */
export const typography = SERIF;
