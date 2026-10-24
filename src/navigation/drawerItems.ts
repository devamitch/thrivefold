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
    title: 'Your day',
    items: [
      { label: 'Home', icon: 'home-outline', route: '/(app)/(tabs)' },
      { label: 'Calendar and routine', icon: 'calendar-outline', route: '/(app)/calendar' },
      { label: 'Check in', icon: 'sunny-outline', route: '/(app)/check-in' },
    ],
  },
  {
    title: 'Quests and activities',
    items: [
      { label: 'Daily quests', icon: 'flag-outline', route: '/(app)/quests' },
      { label: 'Train', icon: 'barbell-outline', route: '/(app)/train' },
      { label: 'Exercise library', icon: 'library-outline', route: '/(app)/train/library' },
      { label: 'Log a workout', icon: 'create-outline', route: '/(app)/train/log' },
      { label: 'Games', icon: 'game-controller-outline', route: '/(app)/games' },
    ],
  },
  {
    title: 'Progress',
    items: [
      { label: 'Roadmap', icon: 'map-outline', route: '/(app)/roadmap' },
      {
        label: 'Progress and rewards',
        icon: 'trending-up-outline',
        route: '/(app)/(tabs)/progress',
      },
      { label: 'Patterns and insights', icon: 'analytics-outline', route: '/(app)/ai' },
    ],
  },
  {
    title: 'Health',
    items: [
      { label: 'Health hub', icon: 'medkit-outline', route: '/(app)/health' },
      {
        label: 'Cycle',
        icon: 'water-outline',
        route: '/(app)/health/cycle',
        only: ['women_health'],
      },
      {
        label: "Men's health",
        icon: 'body-outline',
        route: '/(app)/health/men',
        only: ['men_health'],
      },
      {
        label: 'Self-care',
        icon: 'heart-outline',
        route: '/(app)/health/pride',
        only: ['pride_wellbeing'],
      },
      { label: 'Food and macros', icon: 'restaurant-outline', route: '/(app)/health/nutrition' },
      { label: 'Sleep', icon: 'moon-outline', route: '/(app)/health/sleep' },
      { label: 'Medications', icon: 'medical-outline', route: '/(app)/health/medications' },
      { label: 'Journal', icon: 'book-outline', route: '/(app)/journal' },
      { label: 'Learn', icon: 'school-outline', route: '/(app)/learn' },
      { label: 'Connected apps', icon: 'link-outline', route: '/(app)/health/integrations' },
    ],
  },
  {
    title: 'Activity & Wellness Circles',
    items: [
      {
        label: 'Circles (Gym, Therapy, Sports)',
        icon: 'people-outline',
        route: '/(app)/circles',
        social: true,
        minLevel: 6,
      },
      {
        label: 'Verified Hubs & Places',
        icon: 'business-outline',
        route: '/(app)/organizations',
        social: true,
        minLevel: 6,
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { label: 'Personalize', icon: 'options-outline', route: '/(app)/personalize' },
      { label: 'Settings and privacy', icon: 'settings-outline', route: '/(app)/(tabs)/settings' },
      { label: 'Safety and support', icon: 'shield-checkmark-outline', route: '/(app)/safety' },
    ],
  },
];
