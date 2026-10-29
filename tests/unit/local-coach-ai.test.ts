import {
  resolveLocalCoachReply,
  type LocalCoachContext,
} from '../../src/domain/coach/localCoachAI';

describe('Local Coach AI Engine', () => {
  const baseContext: LocalCoachContext = {
    steps: 6420,
    waterGlasses: 4,
    hydrationTarget: 8,
    userName: 'Aarav',
    allergies: ['peanuts'],
    foodRules: ['vegetarian'],
  };

  it('provides precise, non-prescriptive squat form guidance', () => {
    const res = resolveLocalCoachReply('How should I do squats?', baseContext);
    expect(res.topic).toBe('form');
    expect(res.text).toContain('Aarav,');
    expect(res.text.toLowerCase()).toContain('chest tall');
    expect(res.text.toLowerCase()).toContain('heels');
    expect(res.route).toBe('/(app)/health/pose-check');
  });

  it('provides pushup form advice', () => {
    const res = resolveLocalCoachReply('Give me pushup form tips', baseContext);
    expect(res.topic).toBe('form');
    expect(res.text.toLowerCase()).toContain('plank');
    expect(res.text.toLowerCase()).toContain('chest');
  });

  it('provides plank technique advice', () => {
    const res = resolveLocalCoachReply('How to hold a plank correctly', baseContext);
    expect(res.topic).toBe('form');
    expect(res.text.toLowerCase()).toContain('elbows');
    expect(res.text.toLowerCase()).toContain('shoulders');
  });

  it('advises on desk posture and spinal alignment', () => {
    const res = resolveLocalCoachReply('Tips for my sitting posture at my desk', baseContext);
    expect(res.topic).toBe('posture');
    expect(res.text.toLowerCase()).toContain('shoulders');
  });

  it('handles muscle soreness (DOMS) with safe, natural recovery tips', () => {
    const res = resolveLocalCoachReply('Why are my muscles so sore after yesterday?', baseContext);
    expect(res.topic).toBe('recovery');
    expect(res.text.toLowerCase()).toContain('soreness');
    expect(res.text.toLowerCase()).toContain('water');
    expect(res.text.toLowerCase()).toContain('sleep');
  });

  it('signs post safety and never diagnoses when pain is reported', () => {
    const res = resolveLocalCoachReply('I have sharp knee pain when bending', baseContext);
    expect(res.topic).toBe('recovery');
    expect(res.text.toLowerCase()).toContain('pause any movement');
    expect(res.text.toLowerCase()).toContain('healthcare provider');
    expect(res.route).toBe('/(app)/safety/urgent-support');
  });

  it('grounds hydration replies with user water logging metrics', () => {
    const res = resolveLocalCoachReply('How much water should I drink today?', baseContext);
    expect(res.topic).toBe('hydration');
    expect(res.text).toContain('4 of 8 glasses');
  });

  it('grounds summary with user real step count', () => {
    const res = resolveLocalCoachReply('How am I doing today?', baseContext);
    expect(res.topic).toBe('summary');
    expect(res.text).toContain('6,420 steps');
    expect(res.text).toContain('4 glasses of water');
  });

  it('provides soothing breathwork guidance for stress and anxiety', () => {
    const res = resolveLocalCoachReply('I feel so stressed and overwhelmed', baseContext);
    expect(res.topic).toBe('stress');
    expect(res.text.toLowerCase()).toContain('breath');
    expect(res.route).toBe('/(app)/beta-lab/breathing');
  });

  it('handles general wellbeing questions warmly and concisely', () => {
    const res = resolveLocalCoachReply('What can you help me with?', baseContext);
    expect(res.topic).toBe('general');
    expect(res.text).toContain('Aarav,');
    expect(res.text.toLowerCase()).toContain('coach');
  });
});
