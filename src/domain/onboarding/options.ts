import type { OnboardingAnswers } from '../../stores/slices/appSlice';
import { ProductExperience } from '../../theme/tokens';

// Plain goals; each one steers which kinds of quests come first (see GOAL_FAMILIES).
export const SHARED_GOALS = [
  'More energy',
  'Better sleep',
  'Less stress',
  'Move more',
  'Mobility and posture',
  'Steady daily habits',
  'Emotional support',
  'Eat well',
  'Learn about my health',
];

export const GOALS_BY_EXPERIENCE: Record<ProductExperience, string[]> = {
  women_health: ['Understand my cycle', 'Period comfort', 'PMS and mood'],
  men_health: ['Strength training', 'Desk-work aches', 'Focus'],
  pride_wellbeing: ['Affirming self-care', 'Body ease'],
};

export const SHARED_CONSTRAINTS = [
  'Lower back',
  'Knees or joints',
  'Wrists or shoulders',
  'Recovering / low energy',
  'Mostly sitting all day',
  'Low impact only',
];

export const CONSTRAINTS_BY_EXPERIENCE: Record<ProductExperience, string[]> = {
  women_health: [
    ...SHARED_CONSTRAINTS,
    'Pelvic floor & sacrum',
    'Cramps / sensitive phase',
  ],
  men_health: [
    ...SHARED_CONSTRAINTS,
    'Tight hips / groin',
    'Hamstrings & calves',
    'Neck / upper spine',
  ],
  pride_wellbeing: [
    ...SHARED_CONSTRAINTS,
    'Chest / posture strain',
    'Neck / upper back tension',
  ],
};

export const ROUTINE_LENGTHS: { value: NonNullable<OnboardingAnswers['routineMinutes']>; label: string }[] = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 20, label: '20 min' },
];

export const goalsFor = (experience: ProductExperience) => [...GOALS_BY_EXPERIENCE[experience], ...SHARED_GOALS];
export const constraintsFor = (experience: ProductExperience) => CONSTRAINTS_BY_EXPERIENCE[experience] ?? SHARED_CONSTRAINTS;
