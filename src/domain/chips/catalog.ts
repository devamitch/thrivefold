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
  | 'close_conversation'
  | 'dating_hello'
  | 'dating_reflection'
  | 'dating_playful'
  | 'dating_reply';

export interface MessageChip {
  id: string;
  category: ChipCategory;
  text: string;
  subtext?: string;
  allowedModes: ('letters' | 'structured-introduction' | 'dating')[];
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

  // 11. Dating (chip-only, non-explicit; spec section 18.2)
  {
    id: 'dating_hello_01',
    category: 'dating_hello',
    text: 'Hi! Your profile made me smile. I would like to get to know you.',
    subtext: 'Warm hello',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_hello_02',
    category: 'dating_hello',
    text: 'Hello, I think we share a few interests. Would you like to talk?',
    subtext: 'Shared interests',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_hello_03',
    category: 'dating_hello',
    text: 'Hi there, I like how you describe your days.',
    subtext: 'Noticed you',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_reflect_01',
    category: 'dating_reflection',
    text: 'I value honesty and kindness in a partner.',
    subtext: 'What matters',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_reflect_02',
    category: 'dating_reflection',
    text: 'I am looking for something steady and unhurried.',
    subtext: 'What I want',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_reflect_03',
    category: 'dating_reflection',
    text: 'Making each other laugh matters a lot to me.',
    subtext: 'Humour',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_reflect_04',
    category: 'dating_reflection',
    text: 'I like taking things slowly and getting to know someone well.',
    subtext: 'Pace',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_reflect_05',
    category: 'dating_reflection',
    text: 'What does a good week look like for you?',
    subtext: 'Question',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_reflect_06',
    category: 'dating_reflection',
    text: 'What is something you are looking forward to?',
    subtext: 'Question',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_playful_01',
    category: 'dating_playful',
    text: 'Tea or coffee? This is important.',
    subtext: 'Playful',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_playful_02',
    category: 'dating_playful',
    text: 'Your taste in hobbies is suspiciously good.',
    subtext: 'Playful',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_playful_03',
    category: 'dating_playful',
    text: 'Now I am curious what your perfect Sunday looks like.',
    subtext: 'Playful',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_reply_01',
    category: 'dating_reply',
    text: 'I would like that. Tell me more.',
    subtext: 'Reply',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_reply_02',
    category: 'dating_reply',
    text: 'Thank you, that is kind of you to say.',
    subtext: 'Reply',
    allowedModes: ['dating'],
    riskClass: 'safe',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_reply_03',
    category: 'dating_reply',
    text: 'I am enjoying this, and I would like to keep the pace slow.',
    subtext: 'Pace',
    allowedModes: ['dating'],
    riskClass: 'boundary',
    version: CHIP_CATALOG_VERSION,
  },
  {
    id: 'dating_close_01',
    category: 'close_conversation',
    text: 'Thank you for the conversation. I do not think we are a match, and I wish you well.',
    subtext: 'Kind goodbye',
    allowedModes: ['dating'],
    riskClass: 'boundary',
    version: CHIP_CATALOG_VERSION,
  },
];

export function getChipsByCategory(category: ChipCategory): MessageChip[] {
  return APPROVED_CHIPS.filter((c) => c.category === category);
}

export function getChipById(id: string): MessageChip | undefined {
  return APPROVED_CHIPS.find((c) => c.id === id);
}
