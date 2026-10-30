import { buildTable, GUIDES, matchMedicine, parseChatAction, type TableInput } from '../../src/domain/assistant/chatActions';
import { storeDocs, type StoreDocsInput } from '../../src/domain/assistant/appKnowledge';

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
}));

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(async (len: number) => new Uint8Array(len)),
  digestStringAsync: jest.fn(async () => 'mock-hash'),
}));

const NOW = new Date(2026, 9, 30, 10);

describe('chat actions', () => {
  it.each([
    ['show my meds', { kind: 'show', what: 'meds' }],
    ['show my prescriptions', { kind: 'show', what: 'meds' }],
    ['my appointments', { kind: 'show', what: 'followups' }],
    ["what are today's tasks", { kind: 'show', what: 'today' }],
    ['what can you do', { kind: 'show', what: 'screens' }],
    ['I have a prescription, help me log it', { kind: 'guide', job: 'prescription' }],
    ['take a photo of my lunch', { kind: 'guide', job: 'meal_photo' }],
    ['log out', { kind: 'sign_out' }],
    ['quit', { kind: 'close' }],
    ['clear the chat history', { kind: 'clear_chat' }],
    ['delete my vitamin d medicine', { kind: 'delete_med', name: 'vitamin d' }],
    ['I took my metformin', { kind: 'took_med', name: 'metformin' }],
    ['turn on medicine reminders', { kind: 'reminders', on: true }],
  ])('%s', (text, want) => {
    expect(parseChatAction(text)).toEqual(want);
  });

  it('leaves questions and small talk to the coach', () => {
    expect(parseChatAction('how do I sleep better')).toBeNull();
    expect(parseChatAction('I took a walk')).toBeNull();
    expect(parseChatAction('hello')).toBeNull();
  });

  const s: TableInput = {
    medications: [
      { id: 'b', name: 'Metformin', dose: '500 mg', time: '20:00' },
      { id: 'a', name: 'Vitamin D3', dose: '', time: '08:00' },
    ],
    medicationTaken: ['2026-10-30|a'],
    medicationRemindersOn: true,
    followUps: [
      { date: '2026-10-01', time: null, with: 'Old visit', note: null },
      { date: '2026-11-04', time: '10:30', with: 'Dr Rao', note: 'bring reports' },
    ],
    todayQuests: [{ title: 'Walk 10 minutes', isCompleted: false, status: 'assigned', xpReward: 5 }],
    mealLogs: [],
    carePlans: [],
    checkInHistory: [],
    hydration: {},
  };

  it('builds a medicines table, sorted by time, with today’s status', () => {
    const t = buildTable('meds', s, NOW);
    expect(t.title).toBe('Your medicines · reminders on');
    expect(t.rows).toEqual([
      ['Vitamin D3', '—', '08:00', 'Taken'],
      ['Metformin', '500 mg', '20:00', 'Not yet'],
    ]);
    expect(t.route).toBe('/(app)/health/medications');
  });

  it('shows only upcoming follow-ups', () => {
    expect(buildTable('followups', s, NOW).rows).toEqual([['2026-11-04', '10:30', 'Dr Rao', 'bring reports']]);
  });

  it('matches spoken medicine names loosely', () => {
    expect(matchMedicine(s.medications, 'vitamin d')?.id).toBe('a');
    expect(matchMedicine(s.medications, 'aspirin')).toBeNull();
  });

  it('guides each job to a real screen', () => {
    for (const g of Object.values(GUIDES)) expect(g.route).toMatch(/^\/\(app\)\//);
  });
});

describe('store documents', () => {
  const base: StoreDocsInput = {
    koshProfile: { preferredName: 'Amit', languages: ['English'], foodRestrictions: [], allergies: ['peanuts'], cuisines: [], foodDislikes: [], interests: [], skills: [], careerGoal: null },
    heightCm: 175,
    weightKg: null,
    onboarding: { goals: ['sleep better'], constraints: [], routineMinutes: 10, diet: 'vegetarian' },
    emergencyContacts: [{ name: 'Riya', relation: 'sister' }],
    followUps: [],
    carePlans: [],
    journalEntries: [],
    mealLogs: [{ date: '2026-10-30', type: 'lunch', items: [{ foodId: 'dal', servings: 2 }] }],
    workoutSessions: [],
    activityLogs: [],
    vitalsHistory: [],
    personalEvents: [],
    cycleData: null,
    aiMemories: [{ category: 'routine', content: 'trains at 7 am' }],
    betaSessions: [],
    achievements: [],
  };

  it('writes the profile without contact numbers and finds food names', () => {
    const docs = storeDocs(base, NOW, (id) => (id === 'dal' ? 'Dal' : undefined));
    const profile = docs.find((d) => d.key === 'me:profile')!.text;
    expect(profile).toContain('Allergies: peanuts');
    expect(profile).toContain('Riya (sister)');
    expect(profile).not.toMatch(/\d{10}/);
    expect(docs.find((d) => d.key === 'me:food')!.text).toContain('2026-10-30 lunch: Dal x2');
    expect(docs.find((d) => d.key === 'me:memories')!.text).toContain('routine: trains at 7 am');
    expect(docs.some((d) => d.key === 'me:cycle')).toBe(false);
  });
});

describe('chat attachments', () => {
  // The service imports native modules; the pure helpers are tested with light mocks.
  jest.mock('expo-document-picker', () => ({}));
  jest.mock('expo-image-picker', () => ({}));
  jest.mock('../../modules/local-ai', () => ({ LocalAI: {} }));
  jest.mock('../../src/services/local-ai/rag/thriveRag', () => ({ thriveRag: {} }));
  jest.mock('../../src/services/voice/globalVoiceController', () => ({ globalVoiceController: {} }));

  it('recognises the kind of a picked file', () => {
    const { kindOf } = require('../../src/services/assistant/chatAttachments');
    expect(kindOf('application/pdf', 'x')).toBe('pdf');
    expect(kindOf(null, 'Report.PDF')).toBe('pdf');
    expect(kindOf('image/jpeg', 'a')).toBe('image');
    expect(kindOf('text/plain', 'notes.txt')).toBe('file');
  });

  it('joins page text, dropping blank pages and extra spaces', () => {
    const { documentText, preview } = require('../../src/services/assistant/chatAttachments');
    expect(documentText({ pages: [{ page: 1, text: 'Hello   world' }, { page: 2, text: '   ' }, { page: 3, text: 'Bye' }] })).toBe('Hello world\n\nBye');
    expect(preview('one two three four', 9)).toBe('one two…');
  });
});
