import { ViewStyle, Platform } from 'react-native';

/**
 * Squircle-like smooth curvature generator and border radius presets inspired by Setu & BlinkQuest
 */
export function getSquircleStyle(radius: number = 24, smoothness: number = 0.6): ViewStyle {
  return {
    borderRadius: radius,
    overflow: 'hidden',
  };
}

export const cardStyles = {
  cardBase: {
    borderRadius: 22,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  } as ViewStyle,
  tileBase: {
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  } as ViewStyle,
  pillBase: {
    borderRadius: 9999,
  } as ViewStyle,
  floatingBar: {
    borderRadius: 28,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  } as ViewStyle,
} as const;

