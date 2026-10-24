import { Ionicons } from '@expo/vector-icons';
import type { ProductExperience } from './tokens';

export type ExperienceIconGlyph = keyof typeof Ionicons.glyphMap;

export interface TabIconPair {
  active: ExperienceIconGlyph;
  inactive: ExperienceIconGlyph;
  label: string;
}

export interface ExperienceIcons {
  experience: ProductExperience;
  tabs: {
    index: TabIconPair;
    today: TabIconPair;
    progress: TabIconPair;
    settings: TabIconPair;
  };
  orb: {
    icon: ExperienceIconGlyph;
    label: string;
  };
  actions: {
    checkIn: ExperienceIconGlyph;
    healthHub: ExperienceIconGlyph;
    focus: ExperienceIconGlyph;
    journal: ExperienceIconGlyph;
    sleep: ExperienceIconGlyph;
    mood: ExperienceIconGlyph;
    streak: ExperienceIconGlyph;
    badge: ExperienceIconGlyph;
  };
}

export const EXPERIENCE_ICONS: Record<ProductExperience, ExperienceIcons> = {
  women_health: {
    experience: 'women_health',
    tabs: {
      index: { active: 'home', inactive: 'home-outline', label: 'Home' },
      today: { active: 'barbell', inactive: 'barbell-outline', label: 'Train' },
      progress: { active: 'trending-up', inactive: 'trending-up-outline', label: 'Progress' },
      settings: { active: 'person-circle', inactive: 'person-circle-outline', label: 'You' },
    },
    orb: {
      icon: 'leaf',
      label: 'Check in',
    },
    actions: {
      checkIn: 'heart-outline',
      healthHub: 'water-outline',
      focus: 'flower-outline',
      journal: 'book-outline',
      sleep: 'moon-outline',
      mood: 'happy-outline',
      streak: 'flame-outline',
      badge: 'ribbon-outline',
    },
  },
  men_health: {
    experience: 'men_health',
    tabs: {
      index: { active: 'grid', inactive: 'grid-outline', label: 'Home' },
      today: { active: 'barbell', inactive: 'barbell-outline', label: 'Train' },
      progress: { active: 'stats-chart', inactive: 'stats-chart-outline', label: 'Progress' },
      settings: { active: 'shield', inactive: 'shield-outline', label: 'You' },
    },
    orb: {
      icon: 'flash',
      label: 'Check in',
    },
    actions: {
      checkIn: 'pulse-outline',
      healthHub: 'barbell-outline',
      focus: 'fitness-outline',
      journal: 'terminal-outline',
      sleep: 'bed-outline',
      mood: 'speedometer-outline',
      streak: 'trophy-outline',
      badge: 'shield-checkmark-outline',
    },
  },
  pride_wellbeing: {
    experience: 'pride_wellbeing',
    tabs: {
      index: { active: 'infinite', inactive: 'infinite-outline', label: 'Home' },
      today: { active: 'barbell', inactive: 'barbell-outline', label: 'Train' },
      progress: { active: 'pulse', inactive: 'pulse-outline', label: 'Progress' },
      settings: { active: 'heart-circle', inactive: 'heart-circle-outline', label: 'You' },
    },
    orb: {
      icon: 'prism',
      label: 'Check in',
    },
    actions: {
      checkIn: 'sunny-outline',
      healthHub: 'color-wand-outline',
      focus: 'planet-outline',
      journal: 'bookmark-outline',
      sleep: 'moon-outline',
      mood: 'happy-outline',
      streak: 'star-outline',
      badge: 'ribbon-outline',
    },
  },
};

export function getExperienceIcons(experience: ProductExperience): ExperienceIcons {
  return EXPERIENCE_ICONS[experience] ?? EXPERIENCE_ICONS.women_health;
}
