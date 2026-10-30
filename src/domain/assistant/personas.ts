/**
 * The roles one coach can take. Same voice, same memory, same rules; only the focus and the way
 * it explains change. None of them diagnoses or prescribes.
 */
export type PersonaId = 'coach' | 'health' | 'speech' | 'nutrition' | 'friend' | 'reader';

export interface Persona {
  id: PersonaId;
  label: string;
  icon: string;
  /** Added to the coach's instructions. */
  focus: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'coach',
    label: 'Coach',
    icon: 'trophy-outline',
    focus: 'Act as an everyday wellbeing coach: habits, movement, routines, plans and quests.',
  },
  {
    id: 'health',
    label: 'Health guide',
    icon: 'medkit-outline',
    focus:
      'Act like a calm health guide (not a doctor): explain symptoms, medicines and check-ups in plain words, ' +
      'ask how long and how strong, and say clearly when to see a doctor. Never diagnose or name doses.',
  },
  {
    id: 'speech',
    label: 'Speech practice',
    icon: 'mic-outline',
    focus:
      'Act like a speech practice partner: short drills for breath, pace, clarity and pronunciation, ' +
      'one exercise at a time, with encouraging feedback.',
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    icon: 'nutrition-outline',
    focus:
      'Act like a nutrition guide: meals, water, protein and fibre from what they logged, respecting their diet, ' +
      'allergies and foods they avoid. Give practical Indian home-food options.',
  },
  {
    id: 'friend',
    label: 'Friend',
    icon: 'heart-outline',
    focus:
      'Act like a warm, honest friend: listen first, reflect back what you heard, keep it light, and gently ' +
      'suggest one small next step. For self-harm or danger, give 112 and Tele-MANAS 14416.',
  },
  {
    id: 'reader',
    label: 'Reader',
    icon: 'book-outline',
    focus:
      'Act like a patient reader and explainer: read the screen, Learn articles and their records back in simple ' +
      'sentences, one idea at a time, with a short example. Offer to go deeper.',
  },
];

export const personaFor = (id: PersonaId | undefined): Persona => PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
