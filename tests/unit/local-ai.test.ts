import { evaluateDeterministicRoutine } from '../../src/domain/ai/deterministicRules';
import { classifyLocalInput } from '../../src/domain/ai/localClassifier';

describe('Thrivefold Local-First AI & Deterministic Task Rules', () => {
  test('P0: High stress and low energy trigger breathing recommendation without cloud', () => {
    const recommendation = evaluateDeterministicRoutine({
      energy: 2,
      mood: 4,
      stress: 9,
      experience: 'women_health',
    });

    expect(recommendation.category).toBe('breathing');
    expect(recommendation.title).toContain('Parasympathetic');
    expect(recommendation.aiExplanation.source).toBe('local_deterministic');
  });

  test('P0: Severe pain triggers clinical signposting and halts strenuous workouts', () => {
    const recommendation = evaluateDeterministicRoutine({
      energy: 5,
      mood: 5,
      stress: 5,
      physicalPainOrLimitation: 'Severe acute pelvic pain',
      experience: 'women_health',
    });

    expect(recommendation.category).toBe('rest');
    expect(recommendation.title).toContain('Professional Consultation Signpost');
    expect(recommendation.cautionNotice).toContain('Thrivefold does not provide clinical diagnosis');
  });

  test('P0: Men health experience generates posture mobility routine', () => {
    const recommendation = evaluateDeterministicRoutine({
      energy: 5,
      mood: 6,
      stress: 5,
      experience: 'men_health',
    });

    expect(recommendation.category).toBe('movement');
    expect(recommendation.title).toContain('Desk Worker');
  });

  test('P0: Local classifier detects crisis signal on device and flags alert', () => {
    const classification = classifyLocalInput({ text: 'I feel completely hopeless and want to end my life' });
    expect(classification.isCrisisAlert).toBe(true);
    expect(classification.intent).toBe('crisis_signal');
    expect(classification.result.text).toContain('Immediate care alert');
  });
});
