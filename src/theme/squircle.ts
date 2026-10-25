import { ViewStyle } from 'react-native';

/**
 * Squircle-like smooth curvature generator and border radius presets inspired by Neev & BlinkQuest.
 * Adheres strictly to Zero Shadows: crisp hairlines instead of fuzzy elevation halos.
 */
export function getSquircleStyle(radius: number = 24, smoothness: number = 1): ViewStyle {
  return {
    borderRadius: radius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(14, 30, 27, 0.07)',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  };
}

export const cardStyles = {
  cardBase: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(14, 30, 27, 0.07)',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
  tileBase: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(14, 30, 27, 0.07)',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
  pillBase: {
    borderRadius: 9999,
  } as ViewStyle,
  floatingBar: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(14, 30, 27, 0.07)',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
} as const;

export default cardStyles;
