import { dailyBrief, type BriefInput } from '../../src/domain/assistant/dailyBrief';

const base: BriefInput = {
  name: 'Amit', hour: 9, today: '2026-10-30', checkedInToday: false, waterGlasses: 1, waterTarget: 8,
  openQuests: ['Walk 10 minutes'], medicines: [], medicationTaken: [], nowHHMM: '09:00', followUps: [],
};

describe('daily brief', () => {
  it('lists what is due from real data', () => {
    const t = dailyBrief({ ...base, medicines: [{ id: 'a', name: 'Vitamin D', time: '08:00' }] });
    expect(t).toContain('Good morning, Amit.');
    expect(t).toContain('Vitamin D is due');
    expect(t).toContain('1 of 8 glasses');
    expect(t).toContain('"Walk 10 minutes"');
  });
  it('says when everything is done', () => {
    expect(dailyBrief({ ...base, hour: 20, checkedInToday: true, waterGlasses: 8, openQuests: [] })).toBe(
      "Good evening, Amit. You're all caught up today. What can I help with?",
    );
  });
  it('does not repeat taken medicines', () => {
    const t = dailyBrief({ ...base, medicines: [{ id: 'a', name: 'Vitamin D', time: '08:00' }], medicationTaken: ['2026-10-30|a'] });
    expect(t).not.toContain('Vitamin D');
  });
});
