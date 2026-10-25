import type { Ionicons } from '@expo/vector-icons';

import type { ProductExperience } from '../theme/tokens';

export interface Item {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  /** Shown only for these experiences (default: everyone). */
  only?: ProductExperience[];
  /** Shown only once the social path is open to this person. */
  social?: boolean;
  /** Minimum progression level required to see this item. */
  minLevel?: number;
}

/**
 * Secondary navigation, grouped by purpose. Bottom tabs stay the main destinations; every
 * entry here opens a real route. Entries follow the person's experience and eligibility;
 * gated routes also check access themselves.
 */
export const DRAWER_SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: 'Today',
    items: [
      { label: 'Universal Calendar', icon: 'calendar-outline', route: '/(app)/calendar' },
      { label: 'Daily Check-in', icon: 'sunny-outline', route: '/(app)/check-in' },
      { label: 'Quests', icon: 'ribbon-outline', route: '/(app)/quests' },
      { label: 'Train', icon: 'fitness-outline', route: '/(app)/train' },
      { label: 'Games', icon: 'game-controller-outline', route: '/(app)/games' },
    ],
  },
  {
    title: 'Health',
    items: [
      { label: 'Cycle', icon: 'water-outline', route: '/(app)/health/cycle', only: ['women_health'] },
      { label: "Men's Health", icon: 'barbell-outline', route: '/(app)/health/men', only: ['men_health'] },
      { label: 'Affirming Care', icon: 'heart-outline', route: '/(app)/health/pride', only: ['pride_wellbeing'] },
      { label: 'Nutrition & Food', icon: 'nutrition-outline', route: '/(app)/health/nutrition' },
      { label: 'Sleep & Rest', icon: 'moon-outline', route: '/(app)/health/sleep' },
      { label: 'Medications', icon: 'medkit-outline', route: '/(app)/health/medications' },
      { label: 'Journal', icon: 'book-outline', route: '/(app)/journal' },
      { label: 'Health Connect', icon: 'pulse-outline', route: '/(app)/health/integrations' },
      { label: 'All Health Tools', icon: 'apps-outline', route: '/(app)/health' },
    ],
  },
  {
    title: 'Growth',
    items: [
      { label: 'Roadmap & Progress', icon: 'trail-sign-outline', route: '/(app)/roadmap' },
      { label: 'Patterns & Insights', icon: 'bulb-outline', route: '/(app)/ai' },
      { label: 'Learn & Science', icon: 'school-outline', route: '/(app)/learn' },
    ],
  },
  {
    title: 'Together',
    items: [
      { label: 'Circles', icon: 'people-outline', route: '/(app)/circles', minLevel: 6 },
      { label: 'Organizations', icon: 'business-outline', route: '/(app)/organizations', minLevel: 6 },
    ],
  },
];
