import { SNOOZE_MS, nextProfileQuestion, profileCompleteness, type ProfileState } from '../../src/domain/account/profileQuestions';

const base: ProfileState = {
  signedIn: true, birthDate: null, heightCm: null, weightKg: null, diet: null, routineMinutes: null, snoozedUntil: {}, lastAskedAt: null,
};

describe('profile questions', () => {
  it('asks the birthday first for signed-in people, then height', () => {
    expect(nextProfileQuestion(base, 0)).toBe('birthday');
    expect(nextProfileQuestion({ ...base, signedIn: false }, 0)).toBe('height');
  });

  it('asks at most once a day unless the question is already showing', () => {
    expect(nextProfileQuestion({ ...base, lastAskedAt: 1000 }, 5000)).toBeNull();
    expect(nextProfileQuestion({ ...base, lastAskedAt: 1000 }, 5000, true)).toBe('birthday');
  });

  it('skips snoozed questions until the snooze ends', () => {
    const s = { ...base, snoozedUntil: { birthday: SNOOZE_MS } };
    expect(nextProfileQuestion(s, 10)).toBe('height');
    expect(nextProfileQuestion(s, SNOOZE_MS)).toBe('birthday');
  });

  it('reports completeness over the questions that apply', () => {
    expect(profileCompleteness({ ...base, signedIn: false, heightCm: 170, weightKg: 70 })).toBe(50);
    expect(nextProfileQuestion({ ...base, birthDate: '1990-01-01', heightCm: 1, weightKg: 1, diet: 'Vegan', routineMinutes: 10 }, 0)).toBeNull();
  });
});
