jest.mock('react-native', () => ({
  Linking: {
    canOpenURL: jest.fn(async () => true),
    openURL: jest.fn(async () => {}),
  },
}));

import {
  detectCrisisIntent,
  EMERGENCY_CONTACTS,
  GROUNDING_EXERCISES,
} from '../../src/services/ai/emergencySupport';

describe('Emergency Support & Crisis Detection', () => {
  test('accurately detects immediate crisis triggers', () => {
    const inputs = [
      'I want to die',
      'I feel like I want to kill myself',
      'thinking about suicide',
      'I have no reason to live anymore',
      'I took all my pills',
    ];

    inputs.forEach((input) => {
      const result = detectCrisisIntent(input);
      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe('immediate');
      expect(result.recommendedAction).toBe('emergency_dial');
      expect(result.deescalationScript).toContain('emergency lifeline buttons');
    });
  });

  test('accurately detects self-harm intent with high severity', () => {
    const inputs = [
      'I want to cut myself',
      'feeling like I need to hurt myself',
      'I burned myself on purpose',
    ];

    inputs.forEach((input) => {
      const result = detectCrisisIntent(input);
      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.category).toBe('self_harm');
      expect(result.recommendedAction).toBe('crisis_text');
      expect(result.deescalationScript).toContain('caring counselor');
    });
  });

  test('accurately detects acute panic attacks without misclassifying as suicide', () => {
    const result = detectCrisisIntent("I can't breathe and having a panic attack");
    expect(result.isCrisis).toBe(false);
    expect(result.severity).toBe('moderate');
    expect(result.category).toBe('panic');
    expect(result.recommendedAction).toBe('grounding');
    expect(result.deescalationScript).toContain('follow the gentle rhythm');
  });

  test('does not false-positive on ordinary fitness or daily speech', () => {
    const nonCrisis = [
      'I killed my leg workout today',
      'My arms are burning from pushups',
      'I want to eat pizza',
      'Feeling a bit tired after work',
    ];

    nonCrisis.forEach((input) => {
      const result = detectCrisisIntent(input);
      expect(result.isCrisis).toBe(false);
      expect(result.severity).toBe('none');
    });
  });

  test('emergency contacts have valid telephone and SMS URI protocols', () => {
    expect(EMERGENCY_CONTACTS.length).toBeGreaterThanOrEqual(4);
    EMERGENCY_CONTACTS.forEach((c) => {
      expect(c.actionUrl).toMatch(/^(tel:|sms:)/);
      expect(c.number.length).toBeGreaterThan(0);
    });

    const lifeline = EMERGENCY_CONTACTS.find((c) => c.id === 'us_988');
    expect(lifeline?.actionUrl).toBe('tel:988');

    const textLine = EMERGENCY_CONTACTS.find((c) => c.id === 'us_text');
    expect(textLine?.actionUrl).toBe('sms:741741?body=HOME');
  });

  test('grounding exercises contain complete, structured steps', () => {
    expect(GROUNDING_EXERCISES.box_breathing.phases).toHaveLength(4);
    expect(GROUNDING_EXERCISES.box_breathing.phases.map((p) => p.name)).toEqual([
      'Inhale',
      'Hold',
      'Exhale',
      'Rest',
    ]);

    expect(GROUNDING_EXERCISES.sensory_54321.steps).toHaveLength(5);
    expect(GROUNDING_EXERCISES.sensory_54321.steps[0].count).toBe(5);
    expect(GROUNDING_EXERCISES.sensory_54321.steps[4].count).toBe(1);
  });
});
