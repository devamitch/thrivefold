export type ChipCategory =
  | 'introduction'
  | 'interests'
  | 'daily_checkin'
  | 'wellbeing'
  | 'listening'
  | 'language_culture'
  | 'communication_style'
  | 'gratitude'
  | 'boundaries'
  | 'close_conversation';

export interface MessageChip {
  id: string;
  category: ChipCategory;
  text: string;
  subtext?: string;
  allowedModes: ('letters' | 'structured-introduction')[];
  riskClass: 'safe' | 'boundary' | 'contact_sensitive';
  version: string;
}

export const CHIP_CATALOG_VERSION = '2026.10.16-v1';

export const APPROVED_CHIPS: MessageChip[] = [
  // 1. Introduction
  {
    id: 'intro_01',
    category: 'introduction',
    text: 'Hello! I hope you are having a peaceful and calm day.',
    subtext: 'Friendly opening',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'intro_02',
    category: 'introduction',
    text: 'Warm greetings from my corner of the world. Nice to connect with you.',
    subtext: 'Thoughtful hello',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'intro_03',
    category: 'introduction',
    text: 'I noticed our shared interest in sustainable wellness and mindful living.',
    subtext: 'Shared resonance',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },

  // 2. Interests & Hobbies
  {
    id: 'interest_01',
    category: 'interests',
    text: 'I enjoy morning nature walks, warm tea, and quiet reading sessions.',
    subtext: 'Calm hobbies',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'interest_02',
    category: 'interests',
    text: 'Gardening, cooking nourishing meals, and gentle mobility stretching keep me grounded.',
    subtext: 'Self-care practices',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'interest_03',
    category: 'interests',
    text: 'Music, creative reflection, and ambient soundscapes are my daily recharge.',
    subtext: 'Creative outlets',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },

  // 3. Daily Check-in
  {
    id: 'checkin_01',
    category: 'daily_checkin',
    text: 'Today feels gentle and steady. Taking things one step at a time.',
    subtext: 'Balanced state',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'checkin_02',
    category: 'daily_checkin',
    text: 'Work was quite busy today, but I made time for an evening breath break.',
    subtext: 'Decompressing',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'checkin_03',
    category: 'daily_checkin',
    text: 'Resting today to replenish energy and reset my focus.',
    subtext: 'Rest day',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },

  // 4. Wellbeing & Encouragement
  {
    id: 'wellbeing_01',
    category: 'wellbeing',
    text: 'Remember to be kind and patient with yourself on difficult days.',
    subtext: 'Gentle reminder',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'wellbeing_02',
    category: 'wellbeing',
    text: 'Celebrating the small daily wins—even drinking water and taking deep breaths counts.',
    subtext: 'Progress support',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'wellbeing_03',
    category: 'wellbeing',
    text: 'Sending peaceful thoughts and strength for whatever challenges you are navigating.',
    subtext: 'Supportive solidarity',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },

  // 5. Supportive Listening
  {
    id: 'listening_01',
    category: 'listening',
    text: 'I appreciate your reflection. Thank you for sharing your thoughts with me.',
    subtext: 'Attentive reply',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'listening_02',
    category: 'listening',
    text: 'It takes courage to acknowledge life transitions. You are doing well.',
    subtext: 'Empathetic presence',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },

  // 6. Language & Culture Exchange
  {
    id: 'lang_01',
    category: 'language_culture',
    text: 'I love learning about different cultural traditions and festive celebrations.',
    subtext: 'Cultural appreciation',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'lang_02',
    category: 'language_culture',
    text: 'The changing seasons here remind me of the beauty of continuous renewal.',
    subtext: 'Seasonal reflection',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },

  // 7. Communication Preferences
  {
    id: 'comm_01',
    category: 'communication_style',
    text: 'I prefer slow, thoughtful letters rather than fast messaging. Take your time replying!',
    subtext: 'No reply pressure',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'comm_02',
    category: 'communication_style',
    text: 'I check my correspondence once a day during quiet hours.',
    subtext: 'Pacing schedule',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },

  // 8. Gratitude
  {
    id: 'gratitude_01',
    category: 'gratitude',
    text: 'Thank you for your kind letter and warm thoughts. It brightened my day.',
    subtext: 'Heartfelt thanks',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'gratitude_02',
    category: 'gratitude',
    text: 'I value this quiet, respectful space we share on Thrivefold.',
    subtext: 'Respectful connection',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },

  // 9. Boundaries & Decline
  {
    id: 'boundary_01',
    category: 'boundaries',
    text: 'Thank you for reaching out, but I am focusing solely on my personal health routines right now.',
    subtext: 'Polite decline',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'boundary',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'boundary_02',
    category: 'boundaries',
    text: 'I prefer to keep our communication strictly within our shared wellness topics.',
    subtext: 'Scope boundary',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'boundary',
    version: CHIP_CATALOG_VERSION,
  },

  // 10. Close Conversation
  {
    id: 'close_01',
    category: 'close_conversation',
    text: 'Wishing you the very best on your wellness journey. Take good care!',
    subtext: 'Warm closing',
    allowedModes: ['letters', 'structured-introduction'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
];

export function getChipsByCategory(category: ChipCategory): MessageChip[] {
  return APPROVED_CHIPS.filter((c) => c.category === category);
}

export function getChipById(id: string): MessageChip | undefined {
  return APPROVED_CHIPS.find((c) => c.id === id);
}
