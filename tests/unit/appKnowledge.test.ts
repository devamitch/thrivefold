import { ARTICLES } from '../../src/content/learn';
import {
  hashText,
  lastDays,
  learnDocs,
  recentDaysDoc,
  recentDaysLines,
  screensDoc,
  standingLines,
  type RecentDaysInput,
} from '../../src/domain/assistant/appKnowledge';
import { DESTINATIONS } from '../../src/domain/search/destinations';

const NOW = new Date(2026, 9, 30, 10, 0, 0);

const empty: RecentDaysInput = {
  checkInHistory: [],
  hydration: {},
  hydrationTargetGlasses: 8,
  mealLogs: [],
  medications: [],
  journalEntries: [],
  deviceReadings: [],
  todayQuests: [],
  level: 1,
  xp: 0,
  streak: 0,
};

describe('app knowledge documents', () => {
  it('lists the last days as local dates, newest first, across a month change', () => {
    expect(lastDays(new Date(2026, 10, 2), 3)).toEqual(['2026-11-02', '2026-11-01', '2026-10-31']);
  });

  it('describes every screen with its route', () => {
    const doc = screensDoc(DESTINATIONS);
    expect(doc.key).toBe('app:screens');
    for (const d of DESTINATIONS) expect(doc.text).toContain(d.route);
  });

  it('makes one document per Learn article and keeps the title on every paragraph', () => {
    const docs = learnDocs(ARTICLES);
    expect(docs).toHaveLength(ARTICLES.length);
    const first = docs[0].text.split('\n').slice(1);
    expect(first.every((line) => line.startsWith(ARTICLES[0].title))).toBe(true);
  });

  it('summarises only days with real logs and says so when nothing is logged', () => {
    expect(recentDaysLines(empty, NOW)).toEqual([]);
    expect(recentDaysDoc(empty, NOW).text).toContain('Nothing logged in the last 7 days.');

    const s: RecentDaysInput = {
      ...empty,
      checkInHistory: [{ date: '2026-10-29', energy: 6, mood: 7, stress: 3, sleepHours: 7.5, symptoms: ['headache'] }],
      hydration: { '2026-10-30': 5 },
      mealLogs: [{ date: '2026-10-30', type: 'breakfast', items: [] }],
      deviceReadings: [{ date: '2026-10-30', kind: 'steps', value: 4210.4, unit: 'count', source: 'health_connect' }],
      journalEntries: [{ createdAt: '2026-10-29T12:00:00.000Z' }],
      todayQuests: [],
    };
    const lines = recentDaysLines(s, NOW);
    expect(lines[0]).toBe('2026-10-30: water 5 of 8 glasses; meals logged: breakfast; steps 4210 (health_connect)');
    expect(lines[1]).toContain('mood 7/10');
    expect(lines[1]).toContain('symptoms headache');
    expect(lines[1]).toContain('1 journal entry');
    expect(recentDaysLines({ ...s, hydration: { '2026-10-01': 3 } }, NOW, 7).join()).not.toContain('2026-10-01');
  });

  it('lists medicines and today’s quests', () => {
    const lines = standingLines({
      ...empty,
      medications: [{ name: 'Vitamin D', dose: '1 tablet', time: '09:00' }],
      todayQuests: [
        { title: 'Drink water', isCompleted: true, status: 'completed' },
        { title: 'Walk 10 minutes', isCompleted: false, status: 'assigned' },
        { title: 'Stretch', isCompleted: false, status: 'skipped' },
      ],
    });
    expect(lines).toContain('Medicines: Vitamin D 1 tablet at 09:00');
    expect(lines).toContain("Today's open quests: Walk 10 minutes");
    expect(lines).toContain("Today's finished quests: Drink water");
  });

  it('hashes text stably', () => {
    expect(hashText('abc')).toBe(hashText('abc'));
    expect(hashText('abc')).not.toBe(hashText('abd'));
  });
});
