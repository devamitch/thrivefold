/**
 * Voluntary Faith, Observance & Values Engine for Thrivefold
 *
 * Strict Compliance:
 * 1. Zero inference: Never infer faith, diet, or tradition from name, phone, GPS, AI or contacts.
 * 2. Voluntary opt-in: Users self-declare observances only if they wish to receive calendar
 *    wellbeing reminders (e.g. fasting windows, rest days, meditation dates).
 * 3. Non-exclusionary: Values matching in adult correspondence supports mindful dialogue
 *    and shared interests without discrimination or exclusionary bans.
 */

import type { CalendarEvent } from '../calendar/universalCalendarEngine';

export type FaithTradition =
  | 'universal_spiritual'
  | 'secular_mindful'
  | 'islam'
  | 'hinduism'
  | 'christianity'
  | 'judaism'
  | 'buddhism'
  | 'sikhism'
  | 'jainism'
  | 'parsi'
  | 'communist_solidarity'
  | 'indigenous_earth'
  | 'bahai'
  | 'other';

export interface ObservanceDefinition {
  id: string;
  tradition: FaithTradition;
  name: string;
  category: 'fasting' | 'rest_day' | 'meditation' | 'festival' | 'reflection';
  description: string;
  month: number; // 1-12
  day: number; // 1-31 (or approximate fixed solar date for reference)
  durationDays?: number;
  fastingWindow?: { dawnHour: number; duskHour: number };
}

export interface ValuesProfile {
  userId: string;
  voluntaryTradition?: FaithTradition;
  observanceReminders: string[]; // IDs of chosen observances
  dietaryAlignment?: string; // Halal, Kosher, Vegetarian, Non-Vegetarian, Vegan, Sattvic, Regional, etc.
  dialoguePreference: 'open_to_all' | 'similar_tradition' | 'interfaith_dialogue';
  coreValues: string[]; // e.g. ['compassion', 'mindfulness', 'community_service', 'family', 'nature', 'solidarity', 'justice']
}

export interface ValuesMatchResult {
  compatible: boolean;
  score: number; // 0 - 100
  sharedValues: string[];
  connectionReason: string;
}

/**
 * Curated calendar observances focused on personal wellbeing, mindful pacing,
 * nutrition awareness, community solidarity, and rest days.
 */
export const FAITH_OBSERVANCES: Record<FaithTradition, ObservanceDefinition[]> = {
  islam: [
    {
      id: 'ramadan_fasting',
      tradition: 'islam',
      name: 'Ramadan Daily Fasting Window',
      category: 'fasting',
      description: 'Dawn-to-dusk mindful fasting, hydration focus at suhoor and iftar.',
      month: 3,
      day: 10,
      durationDays: 30,
      fastingWindow: { dawnHour: 5, duskHour: 18 },
    },
    {
      id: 'friday_reflection',
      tradition: 'islam',
      name: 'Friday Community & Reflection',
      category: 'reflection',
      description: 'Midday reflection, gratitude, and mindful reset.',
      month: 1,
      day: 1,
    },
    {
      id: 'eid_al_fitr',
      tradition: 'islam',
      name: 'Eid al-Fitr',
      category: 'festival',
      description: 'Celebration of gratitude, connection, and generous nourishment.',
      month: 4,
      day: 10,
    },
    {
      id: 'eid_al_adha',
      tradition: 'islam',
      name: 'Eid al-Adha',
      category: 'festival',
      description: 'Sacrifice, charity, sharing with neighbours and family.',
      month: 6,
      day: 17,
    },
  ],
  hinduism: [
    {
      id: 'ekadashi_detox',
      tradition: 'hinduism',
      name: 'Ekadashi Fasting & Digestive Rest',
      category: 'fasting',
      description: 'Optional bi-monthly digestive reset; fruits, hydration, and inner calm.',
      month: 1,
      day: 11,
    },
    {
      id: 'navratri_wellness',
      tradition: 'hinduism',
      name: 'Navratri Energy & Renewal',
      category: 'reflection',
      description: 'Nine evenings celebrating feminine vitality, music, regional traditions, and mindful pacing.',
      month: 10,
      day: 3,
      durationDays: 9,
    },
    {
      id: 'diwali_renewal',
      tradition: 'hinduism',
      name: 'Diwali Festival of Lights',
      category: 'festival',
      description: 'Inner light, joy, home renewal, family feasting, and community warmth across diverse cultures.',
      month: 11,
      day: 1,
    },
    {
      id: 'makar_sankranti_pongal',
      tradition: 'hinduism',
      name: 'Makar Sankranti / Pongal Harvest',
      category: 'festival',
      description: 'Solar transition, harvest gratitude, sweet sesame and rice preparations, welcoming warmth.',
      month: 1,
      day: 14,
    },
    {
      id: 'mahashivratri_stillness',
      tradition: 'hinduism',
      name: 'Maha Shivratri Night of Meditation',
      category: 'meditation',
      description: 'Night of deep stillness, yoga, breath awareness, and conscious presence.',
      month: 3,
      day: 8,
    },
  ],
  christianity: [
    {
      id: 'lent_reflection',
      tradition: 'christianity',
      name: 'Lenten Season of Simplicity',
      category: 'reflection',
      description: '40 days of intentional simplicity, fasting from excess, and generosity.',
      month: 2,
      day: 14,
      durationDays: 40,
    },
    {
      id: 'sunday_sabbath',
      tradition: 'christianity',
      name: 'Sunday Sabbath & Rest',
      category: 'rest_day',
      description: 'Weekly day of rest, spiritual renewal, and family presence.',
      month: 1,
      day: 7,
    },
    {
      id: 'christmas_peace',
      tradition: 'christianity',
      name: 'Christmas Peace & Hope',
      category: 'festival',
      description: 'Joyful celebration of hope, peace on earth, and shared love.',
      month: 12,
      day: 25,
    },
  ],
  judaism: [
    {
      id: 'shabbat_rest',
      tradition: 'judaism',
      name: 'Shabbat Digital & Mental Rest',
      category: 'rest_day',
      description: '25 hours from Friday dusk to Saturday night of rest and fellowship.',
      month: 1,
      day: 5,
    },
    {
      id: 'yom_kippur_fast',
      tradition: 'judaism',
      name: 'Yom Kippur Day of Atonement',
      category: 'fasting',
      description: 'Solemn fast, soul reflection, forgiveness, and renewal.',
      month: 10,
      day: 12,
    },
    {
      id: 'hanukkah_light',
      tradition: 'judaism',
      name: 'Hanukkah Festival of Dedication',
      category: 'festival',
      description: 'Lighting eight candles, perseverance, and quiet evening gratitude.',
      month: 12,
      day: 25,
      durationDays: 8,
    },
  ],
  buddhism: [
    {
      id: 'uposatha_mindfulness',
      tradition: 'buddhism',
      name: 'Uposatha Mindful Stillness',
      category: 'meditation',
      description: 'Full moon renewal: simple eating, chanting, and sitting meditation.',
      month: 1,
      day: 15,
    },
    {
      id: 'vesak_compassion',
      tradition: 'buddhism',
      name: 'Vesak (Buddha Day)',
      category: 'festival',
      description: 'Honouring wisdom, compassion, non-harming, and peace for all beings.',
      month: 5,
      day: 23,
    },
  ],
  sikhism: [
    {
      id: 'gurpurab_seva',
      tradition: 'sikhism',
      name: 'Gurpurab & Community Seva',
      category: 'reflection',
      description: 'Selfless community service, equality, and mindful contemplation.',
      month: 11,
      day: 15,
    },
    {
      id: 'vaisakhi_courage',
      tradition: 'sikhism',
      name: 'Vaisakhi Festival of Vitality',
      category: 'festival',
      description: 'Spring renewal, courage, and universal human dignity.',
      month: 4,
      day: 14,
    },
  ],
  jainism: [
    {
      id: 'paryushana_ahimsa',
      tradition: 'jainism',
      name: 'Paryushana & Universal Forgiveness',
      category: 'fasting',
      description: 'Ahimsa (non-violence), fasting, introspection, and Michhami Dukkadam.',
      month: 9,
      day: 5,
      durationDays: 8,
    },
    {
      id: 'mahavir_jayanti',
      tradition: 'jainism',
      name: 'Mahavir Jayanti',
      category: 'reflection',
      description: 'Gentleness to all life, truthfulness, and ecological harmony.',
      month: 4,
      day: 21,
    },
  ],
  parsi: [
    {
      id: 'parsi_navroz',
      tradition: 'parsi',
      name: 'Navroz (Zoroastrian New Year)',
      category: 'festival',
      description: 'Renewal of nature, spring equinox celebration of good thoughts, good words, and good deeds (Humata, Hukhta, Hvarshta).',
      month: 3,
      day: 21,
    },
    {
      id: 'parsi_khordad_sal',
      tradition: 'parsi',
      name: 'Khordad Sal',
      category: 'reflection',
      description: 'Birth anniversary of Prophet Zarathushtra, dedicated to spiritual wisdom, charity, and joyful fellowship.',
      month: 8,
      day: 23,
    },
  ],
  communist_solidarity: [
    {
      id: 'may_day_solidarity',
      tradition: 'communist_solidarity',
      name: 'International Workers Day (May Day)',
      category: 'reflection',
      description: 'Celebrating universal worker dignity, collective wellbeing, fair labor, and social solidarity.',
      month: 5,
      day: 1,
    },
    {
      id: 'mutual_aid_day',
      tradition: 'communist_solidarity',
      name: 'Communal Mutual Aid & Cooperation Day',
      category: 'reflection',
      description: 'Practical community support, food sharing, shared spaces, and collective care.',
      month: 10,
      day: 15,
    },
  ],
  indigenous_earth: [
    {
      id: 'earth_solstice_reverence',
      tradition: 'indigenous_earth',
      name: 'Summer & Winter Solstice Earth Reverence',
      category: 'reflection',
      description: 'Honoring ancestral wisdom, seasonal rhythms, rivers, soil, and reciprocity with Mother Earth.',
      month: 6,
      day: 21,
    },
    {
      id: 'indigenous_peoples_day',
      tradition: 'indigenous_earth',
      name: 'Indigenous Heritage & Earth Stewardship',
      category: 'festival',
      description: 'Celebration of native cultures, oral traditions, sacred lands, and living in balance with all relations.',
      month: 10,
      day: 12,
    },
  ],
  secular_mindful: [
    {
      id: 'weekly_digital_sabbath',
      tradition: 'secular_mindful',
      name: 'Weekly Digital Reset Day',
      category: 'rest_day',
      description: 'One full day free of notifications, screens, and newsfeeds to connect with nature and loved ones.',
      month: 1,
      day: 7,
    },
    {
      id: 'equinox_balance',
      tradition: 'secular_mindful',
      name: 'Equinox Balance Reflection',
      category: 'reflection',
      description: 'Equal day and night: assessing work-life harmony, scientific awe, and seasonal transitions.',
      month: 3,
      day: 21,
    },
  ],
  universal_spiritual: [
    {
      id: 'universal_gratitude_day',
      tradition: 'universal_spiritual',
      name: 'Universal Gratitude & Lovingkindness',
      category: 'meditation',
      description: 'Metta meditation: wishing wellness, peace, safety, and health to all sentient beings everywhere.',
      month: 1,
      day: 1,
    },
  ],
  bahai: [
    {
      id: 'bahai_naw_ruz',
      tradition: 'bahai',
      name: 'Naw-Rúz (New Year Reflection)',
      category: 'reflection',
      description: 'Spiritual renewal, fellowship, and sunrise meditation celebrating the oneness of humanity.',
      month: 3,
      day: 20,
    },
  ],
  other: [],
};

/**
 * Generate Universal Calendar events from a user's self-declared observances
 */
export function generateObservanceCalendarEvents(
  tradition: FaithTradition,
  chosenObservanceIds: string[],
  year: number,
): CalendarEvent[] {
  const definitions = FAITH_OBSERVANCES[tradition] ?? [];
  const active = definitions.filter(
    (def) => chosenObservanceIds.length === 0 || chosenObservanceIds.includes(def.id),
  );

  const events: CalendarEvent[] = [];

  for (const obs of active) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${year}-${pad(obs.month)}-${pad(obs.day)}`;

    events.push({
      id: `observance_${obs.id}_${year}`,
      title: obs.name,
      date: dateStr,
      kind: 'custom',
      status: 'recorded',
      category: 'routine',
      privacy: 'private',
      description: obs.description,
      isAllDay: true,
      metadata: {
        tradition: obs.tradition,
        observanceCategory: obs.category,
        fastingWindow: obs.fastingWindow,
      },
    });
  }

  return events;
}

/**
 * Deterministic Values & Thoughtful Correspondence Compatibility
 * Evaluates match quality between two consented adult pen pals
 */
export function evaluateValuesAlignment(
  userA: ValuesProfile,
  userB: ValuesProfile,
): ValuesMatchResult {
  // If either has blocked or declined values exchange, treat as neutral
  const sharedValues = userA.coreValues.filter((v) => userB.coreValues.includes(v));

  let score = 50; // Neutral baseline

  // Shared values boost
  score += Math.min(30, sharedValues.length * 10);

  // Dietary alignment (e.g. both vegetarian or both mindful eaters)
  if (userA.dietaryAlignment && userB.dietaryAlignment) {
    if (userA.dietaryAlignment === userB.dietaryAlignment) {
      score += 10;
    }
  }

  // Tradition preferences
  let connectionReason = 'Shared human values and intentional living.';
  if (userA.voluntaryTradition && userB.voluntaryTradition) {
    if (userA.voluntaryTradition === userB.voluntaryTradition) {
      score += 10;
      connectionReason = 'Mutual alignment in spiritual/cultural traditions and life pace.';
    } else if (
      userA.dialoguePreference === 'interfaith_dialogue' ||
      userB.dialoguePreference === 'interfaith_dialogue'
    ) {
      score += 8;
      connectionReason =
        'Complementary perspectives with enthusiasm for respectful interfaith dialogue.';
    }
  }

  if (sharedValues.length > 0) {
    connectionReason = `Strong shared connection around ${sharedValues.slice(0, 3).join(', ')}.`;
  }

  return {
    compatible: score >= 40,
    score: Math.min(100, Math.max(0, score)),
    sharedValues,
    connectionReason,
  };
}
