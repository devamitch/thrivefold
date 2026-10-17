export type ChipCategory =
  | 'introduction'
  | 'interests'
  | 'language'
  | 'checkin'
  | 'encouragement'
  | 'listening'
  | 'appreciation'
  | 'boundary'
  | 'close'
  | 'system';

export interface Chip {
  id: string;
  category: ChipCategory;
  text: string;
  locale: string;
  riskClass: 'safe' | 'moderate' | 'high';
  allowedModes: string[];
  version: string;
}

export const CHIP_CATALOG: Record<string, Chip> = {
  // Introduction chips
  intro_1: {
    id: 'intro_1',
    category: 'introduction',
    text: 'Hello! I came across your profile and thought we might have some shared interests.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
  intro_2: {
    id: 'intro_2',
    category: 'introduction',
    text: 'Hi there! Your profile caught my attention. Would you like to exchange letters?',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
  intro_3: {
    id: 'intro_3',
    category: 'introduction',
    text: 'Greetings! I noticed we share some hobbies. I enjoy slow correspondence.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },

  // Interest chips
  interest_1: {
    id: 'interest_1',
    category: 'interests',
    text: 'I love reading and discussing books.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
  interest_2: {
    id: 'interest_2',
    category: 'interests',
    text: 'I enjoy music and sharing favorite songs.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
  interest_3: {
    id: 'interest_3',
    category: 'interests',
    text: 'I like art and creative expression.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
  interest_4: {
    id: 'interest_4',
    category: 'interests',
    text: 'I enjoy cooking and trying new recipes.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },

  // Language/culture exchange
  language_1: {
    id: 'language_1',
    category: 'language',
    text: 'I am learning a new language and would love to practice.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
  language_2: {
    id: 'language_2',
    category: 'language',
    text: 'I enjoy learning about different cultures.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },

  // Check-in chips
  checkin_1: {
    id: 'checkin_1',
    category: 'checkin',
    text: 'How are you doing today?',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
  checkin_2: {
    id: 'checkin_2',
    category: 'checkin',
    text: 'I hope you are having a good week.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },

  // Encouragement chips
  encourage_1: {
    id: 'encourage_1',
    category: 'encouragement',
    text: 'You are doing great. Keep going!',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
  encourage_2: {
    id: 'encourage_2',
    category: 'encouragement',
    text: 'I believe in you. Take it one day at a time.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },

  // Listening chips
  listen_1: {
    id: 'listen_1',
    category: 'listening',
    text: 'I am here if you want to talk.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
  listen_2: {
    id: 'listen_2',
    category: 'listening',
    text: 'Your feelings matter. I am listening.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },

  // Appreciation chips
  appreciate_1: {
    id: 'appreciate_1',
    category: 'appreciation',
    text: 'Thank you for being a wonderful pen pal.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
  appreciate_2: {
    id: 'appreciate_2',
    category: 'appreciation',
    text: 'I appreciate your letters and your friendship.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },

  // Boundary chips
  boundary_1: {
    id: 'boundary_1',
    category: 'boundary',
    text: 'I need some time to myself right now.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
  boundary_2: {
    id: 'boundary_2',
    category: 'boundary',
    text: 'I would prefer to keep our correspondence slow.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },

  // Close conversation chips
  close_1: {
    id: 'close_1',
    category: 'close',
    text: 'It has been lovely corresponding with you. I am signing off.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
  close_2: {
    id: 'close_2',
    category: 'close',
    text: 'Thank you for our letters. Take care.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },

  // System chips (for safety, reporting)
  system_report: {
    id: 'system_report',
    category: 'system',
    text: 'I need to report something.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
  system_block: {
    id: 'system_block',
    category: 'system',
    text: 'I would like to stop this correspondence.',
    locale: 'en',
    riskClass: 'safe',
    allowedModes: ['letters', 'structured_intro'],
    version: '1.0',
  },
};

export function getChipsByCategory(category: ChipCategory): Chip[] {
  return Object.values(CHIP_CATALOG).filter((chip) => chip.category === category);
}

export function getChipById(id: string): Chip | undefined {
  return CHIP_CATALOG[id];
}
