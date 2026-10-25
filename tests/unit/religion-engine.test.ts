import {
  evaluateValuesAlignment,
  FAITH_OBSERVANCES,
  FaithTradition,
  generateObservanceCalendarEvents,
  ValuesProfile,
} from '../../src/domain/community/religionEngine';

describe('Thrivefold Religion & Values Finishing Engine', () => {
  test('Strict safety: All major traditions have curated, dignified wellbeing observances', () => {
    const traditions: FaithTradition[] = [
      'hinduism',
      'christianity',
      'judaism',
      'buddhism',
      'sikhism',
      'jainism',
      'parsi',
      'civic',
      'indigenous_earth',
      'secular_mindful',
      'universal_spiritual',
      'islam',
      'bahai',
    ];

    for (const t of traditions) {
      const items = FAITH_OBSERVANCES[t];
      expect(items).toBeDefined();
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(item.month).toBeGreaterThanOrEqual(1);
        expect(item.month).toBeLessThanOrEqual(12);
      }
    }
  });

  test('Observance calendar generation maps to compliant Universal Calendar events', () => {
    const events = generateObservanceCalendarEvents('islam', ['ramadan_fasting'], 2026);
    expect(events.length).toBe(1);
    expect(events[0].title).toContain('Ramadan');
    expect(events[0].date).toBe('2026-03-10');
    expect(events[0].isAllDay).toBe(true);
    expect(events[0].category).toBe('routine');
    expect(events[0].metadata?.tradition).toBe('islam');
    expect(events[0].metadata?.fastingWindow).toEqual({ dawnHour: 5, duskHour: 18 });
  });

  test('Hinduism Ekadashi, Navratri and diverse regional celebrations format correctly', () => {
    const events = generateObservanceCalendarEvents('hinduism', [], 2026);
    expect(events.some((e) => e.title.includes('Ekadashi'))).toBe(true);
    expect(events.some((e) => e.title.includes('Diwali'))).toBe(true);
    expect(events.some((e) => e.title.includes('Makar Sankranti'))).toBe(true);
  });

  test('Parsi, civic (not a faith) and Indigenous observances generate correctly', () => {
    const parsiEvents = generateObservanceCalendarEvents('parsi', [], 2026);
    expect(parsiEvents.some((e) => e.title.includes('Navroz'))).toBe(true);

    const solidarityEvents = generateObservanceCalendarEvents('civic', [], 2026);
    expect(solidarityEvents.some((e) => e.title.includes('Workers Day'))).toBe(true);

    const indigenousEvents = generateObservanceCalendarEvents('indigenous_earth', [], 2026);
    expect(indigenousEvents.some((e) => e.title.includes('Earth Stewardship') || e.title.includes('Solstice'))).toBe(true);
  });

  test('Values matching engine computes respectful alignment between consented users', () => {
    const userA: ValuesProfile = {
      userId: 'user_a',
      voluntaryTradition: 'buddhism',
      observanceReminders: ['uposatha_mindfulness'],
      dietaryAlignment: 'Vegetarian',
      dialoguePreference: 'open_to_all',
      coreValues: ['mindfulness', 'compassion', 'nature'],
    };

    const userB: ValuesProfile = {
      userId: 'user_b',
      voluntaryTradition: 'secular_mindful',
      observanceReminders: ['weekly_digital_sabbath'],
      dietaryAlignment: 'Vegetarian',
      dialoguePreference: 'interfaith_dialogue',
      coreValues: ['mindfulness', 'nature', 'community_service'],
    };

    const result = evaluateValuesAlignment(userA, userB);
    expect(result.compatible).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.sharedValues).toContain('mindfulness');
    expect(result.sharedValues).toContain('nature');
    expect(result.connectionReason).toContain('mindfulness');
  });

  test('Non-exclusionary neutrality: Users with diverse traditions remain compatible for open correspondence', () => {
    const userA: ValuesProfile = {
      userId: 'user_a',
      voluntaryTradition: 'christianity',
      observanceReminders: [],
      dialoguePreference: 'open_to_all',
      coreValues: ['family', 'generosity'],
    };

    const userB: ValuesProfile = {
      userId: 'user_b',
      voluntaryTradition: 'judaism',
      observanceReminders: [],
      dialoguePreference: 'interfaith_dialogue',
      coreValues: ['family', 'justice'],
    };

    const result = evaluateValuesAlignment(userA, userB);
    expect(result.compatible).toBe(true);
    expect(result.sharedValues).toContain('family');
  });
});
