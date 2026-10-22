import { TextStyle } from 'react-native';

// Geist (shared with BlinkQuest/Neev), embedded at build time by the expo-font plugin
// in app.json. Each weight is its own family: on Android a custom family plus a
// separate fontWeight can fall back to the system font, so weights are not set here.
const regular = 'Geist-Regular';
const medium = 'Geist-Medium';
const semibold = 'Geist-SemiBold';
const bold = 'Geist-Bold';

export const typography = {
  hero: {
    fontFamily: bold,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1,
  } as TextStyle,
  display: {
    fontFamily: bold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.8,
  } as TextStyle,
  heading: {
    fontFamily: bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
  } as TextStyle,
  subheading: {
    fontFamily: semibold,
    fontSize: 19,
    lineHeight: 25,
    letterSpacing: -0.3,
  } as TextStyle,
  body: {
    fontFamily: regular,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,
  bodyBold: {
    fontFamily: semibold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,
  subbody: {
    fontFamily: regular,
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0,
  } as TextStyle,
  subbodyBold: {
    fontFamily: semibold,
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0,
  } as TextStyle,
  caption: {
    fontFamily: regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  } as TextStyle,
  captionBold: {
    fontFamily: semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  } as TextStyle,
  label: {
    fontFamily: bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,
} as const;

