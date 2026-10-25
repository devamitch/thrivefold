import { ViewStyle } from 'react-native';

/**
 * Squircle-like smooth curvature generator and border radius presets inspired by Neev & BlinkQuest.
 * No shadows and no border lines: surfaces separate by fill.
 */
export function getSquircleStyle(radius: number = 24, smoothness: number = 1): ViewStyle {
  return {
    borderRadius: radius,
    overflow: 'hidden',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  };
}

export const cardStyles = {
  cardBase: {
    borderRadius: 20,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
  tileBase: {
    borderRadius: 14,
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
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
} as const;

export default cardStyles;
