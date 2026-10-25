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
      { label: 'Calendar', icon: 'calendar-clear-outline', route: '/(app)/calendar' },
      { label: 'Check in', icon: 'sunny-outline', route: '/(app)/check-in' },
      { label: 'Quests', icon: 'flag-outline', route: '/(app)/quests' },
      { label: 'Train', icon: 'barbell-outline', route: '/(app)/train' },
      { label: 'Games', icon: 'extension-puzzle-outline', route: '/(app)/games' },
    ],
  },
  {
    title: 'Health',
    items: [
      { label: 'Cycle', icon: 'water-outline', route: '/(app)/health/cycle', only: ['women_health'] },
      { label: "Men's health", icon: 'body-outline', route: '/(app)/health/men', only: ['men_health'] },
      { label: 'Self-care', icon: 'heart-outline', route: '/(app)/health/pride', only: ['pride_wellbeing'] },
      { label: 'Food', icon: 'restaurant-outline', route: '/(app)/health/nutrition' },
      { label: 'Sleep', icon: 'moon-outline', route: '/(app)/health/sleep' },
      { label: 'Medications', icon: 'medical-outline', route: '/(app)/health/medications' },
      { label: 'Journal', icon: 'book-outline', route: '/(app)/journal' },
      { label: 'Health Connect', icon: 'sync-outline', route: '/(app)/health/integrations' },
      { label: 'All health tools', icon: 'grid-outline', route: '/(app)/health' },
    ],
  },
  {
    title: 'Growth',
    items: [
      { label: 'Roadmap', icon: 'map-outline', route: '/(app)/roadmap' },
      { label: 'Patterns', icon: 'analytics-outline', route: '/(app)/ai' },
      { label: 'Learn', icon: 'school-outline', route: '/(app)/learn' },
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
