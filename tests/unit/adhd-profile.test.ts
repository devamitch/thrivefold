import {
  ADHD_QUESTIONS,
  ADHD_OPTIONS,
  evaluateAdhdAnswers,
} from '../../src/domain/account/adhdProfile';

describe('ADHD & Focus Self-Reflection Screener', () => {
  it('has 6 HIPAA-aligned self-reflection questions from WHO ASRS-v1.1 Part A', () => {
    expect(ADHD_QUESTIONS.length).toBe(6);
    expect(ADHD_QUESTIONS.map((q) => q.id)).toEqual([
      'wrap_up',
      'organization',
      'remembering',
      'initiation',
      'restlessness',
      'motor',
    ]);
  });

  it('has standard 5 ordinal reflection options', () => {
    expect(ADHD_OPTIONS.length).toBe(5);
    expect(ADHD_OPTIONS[0].label).toBe('Never');
    expect(ADHD_OPTIONS[4].label).toBe('Very often');
  });

  it('evaluates a low-friction profile as Balanced Flow Pacer', () => {
    const answers = {
      wrap_up: 0,
      organization: 1,
      remembering: 0,
      initiation: 1,
      restlessness: 0,
      motor: 0,
    };
    const res = evaluateAdhdAnswers(answers);
    expect(res.totalScore).toBe(2);
    expect(res.focusStyle).toBe('Balanced Flow Pacer');
    expect(res.recommendedPacing).toBe('steady');
  });

  it('identifies inattention & task inertia as Creative Deep Diver with micro-pacing', () => {
    const answers = {
      wrap_up: 3,
      organization: 3,
      remembering: 3,
      initiation: 4,
      restlessness: 1,
      motor: 1,
    };
    const res = evaluateAdhdAnswers(answers);
    expect(res.totalScore).toBe(15);
    expect(res.focusStyle).toBe('Creative Deep Diver');
    expect(res.recommendedPacing).toBe('micro');
    expect(res.tips.some((t) => t.includes('5-minute'))).toBe(true);
  });

  it('identifies physical restlessness as Kinetic Thinker with movement pacing', () => {
    const answers = {
      wrap_up: 1,
      organization: 1,
      remembering: 1,
      initiation: 1,
      restlessness: 4,
      motor: 3,
    };
    const res = evaluateAdhdAnswers(answers);
    expect(res.totalScore).toBe(11);
    expect(res.focusStyle).toBe('Kinetic Thinker');
    expect(res.recommendedPacing).toBe('flexible');
    expect(res.tips.some((t) => t.includes('walking'))).toBe(true);
  });

  it('identifies organizational friction as Spontaneous Explorer', () => {
    const answers = {
      wrap_up: 3,
      organization: 4,
      remembering: 1,
      initiation: 1,
      restlessness: 1,
      motor: 1,
    };
    const res = evaluateAdhdAnswers(answers);
    expect(res.totalScore).toBe(11);
    expect(res.focusStyle).toBe('Spontaneous Explorer');
    expect(res.recommendedPacing).toBe('flexible');
  });
});
