import { Stamp } from './types';

export const STAMP_CATALOG: Stamp[] = [
  {
    id: 'stamp_lotus_bloom',
    name: 'Lotus Blossom',
    category: 'foundational',
    icon: 'flower',
    color: '#E11D48',
    description: 'A symbol of peaceful rising and emotional resilience.',
    unlocked: true,
  },
  {
    id: 'stamp_morning_sol',
    name: 'Golden Dawn',
    category: 'foundational',
    icon: 'sun',
    color: '#D97706',
    description: 'Celebrating morning awareness and renewed vitality.',
    unlocked: true,
  },
  {
    id: 'stamp_ocean_wave',
    name: 'Deep Waters',
    category: 'foundational',
    icon: 'wind',
    color: '#2563EB',
    description: 'A tribute to emotional patience and steady depth.',
    unlocked: true,
  },
  {
    id: 'stamp_mountain_peace',
    name: 'High Peaks',
    category: 'milestone',
    icon: 'mountain',
    color: '#059669',
    description: 'Unlocked after completing 7 consecutive days of daily check-ins.',
    unlocked: true,
  },
  {
    id: 'stamp_quiet_moon',
    name: 'Crescent Moon',
    category: 'milestone',
    icon: 'moon',
    color: '#7C3AED',
    description: 'Awarded for mindful evening wind-down reflections.',
    unlocked: true,
  },
  {
    id: 'stamp_rainbow_prism',
    name: 'Prism Radiance',
    category: 'cultural',
    icon: 'sparkles',
    color: '#F59E0B',
    description: 'Celebrating diversity, affirmative love, and gentle self-expression.',
    unlocked: true,
  },
];

export function getUnlockedStamps(): Stamp[] {
  return STAMP_CATALOG.filter((s) => s.unlocked);
}

export function getStampById(id: string): Stamp | undefined {
  return STAMP_CATALOG.find((s) => s.id === id);
}
