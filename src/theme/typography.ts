import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

const fontBold = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

export const typography = {
  hero: {
    fontFamily: fontBold,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800',
    letterSpacing: -1,
  } as TextStyle,
  display: {
    fontFamily: fontBold,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
  } as TextStyle,
  heading: {
    fontFamily: fontBold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
  } as TextStyle,
  subheading: {
    fontFamily: fontBold,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '600',
    letterSpacing: -0.3,
  } as TextStyle,
  body: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0,
  } as TextStyle,
  bodyBold: {
    fontFamily: fontBold,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: 0,
  } as TextStyle,
  subbody: {
    fontFamily,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
    letterSpacing: 0,
  } as TextStyle,
  subbodyBold: {
    fontFamily: fontBold,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    letterSpacing: 0,
  } as TextStyle,
  caption: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.1,
  } as TextStyle,
  captionBold: {
    fontFamily: fontBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  } as TextStyle,
  label: {
    fontFamily: fontBold,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,
} as const;

