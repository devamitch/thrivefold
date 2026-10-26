import { CuesEngine, CUE_PRIORITIES } from '@/domain/coach/cuesEngine';

describe('CuesEngine', () => {
  let engine: CuesEngine;

  beforeEach(() => {
    engine = new CuesEngine({
      minSpeechIntervalMs: 1000,
      defaultDurationMs: 2000,
    });
  });

  it('allows high priority safety cue to preempt lower priority cue immediately', () => {
    const t0 = 1000;
    // Lower priority encouragement
    const d1 = engine.proposeCue({
      id: 'encourage_1',
      category: 'ENCOURAGEMENT',
      bannerText: 'Nice control',
      tone: 'cue',
    }, t0);

    expect(d1.activeCue?.id).toBe('encourage_1');
    expect(d1.shouldSpeak).toBe(true);

    // Immediate safety cue (priority 1)
    const d2 = engine.proposeCue({
      id: 'safety_1',
      category: 'SAFETY',
      bannerText: 'Step away from slippery edges',
      tone: 'safety',
    }, t0 + 100);

    expect(d2.activeCue?.id).toBe('safety_1');
    expect(d2.activeCue?.priority).toBe(CUE_PRIORITIES.SAFETY);
  });

  it('suppresses lower priority cue when higher priority cue is active', () => {
    const t0 = 1000;
    engine.proposeCue({
      id: 'fault_chest',
      category: 'FORM_FAULT',
      bannerText: 'Keep your chest lifted',
      tone: 'fault',
      durationMs: 3000,
    }, t0);

    // Proposed lower priority cue while fault is active
    const d2 = engine.proposeCue({
      id: 'encourage_1',
      category: 'ENCOURAGEMENT',
      bannerText: 'Great pace',
      tone: 'cue',
    }, t0 + 500);

    // Active cue remains the form fault
    expect(d2.activeCue?.id).toBe('fault_chest');
    expect(d2.shouldSpeak).toBe(false);
  });

  it('suppresses encouragement when there is an active form fault', () => {
    const t0 = 1000;
    engine.proposeCue({
      id: 'fault_knee',
      category: 'FORM_FAULT',
      bannerText: 'Keep knees tracking over toes',
      tone: 'fault',
      durationMs: 4000,
    }, t0);

    // Attempt encouragement
    const d = engine.proposeCue({
      id: 'encourage_2',
      category: 'ENCOURAGEMENT',
      bannerText: 'Looking strong',
      tone: 'cue',
    }, t0 + 2000);

    expect(d.activeCue?.id).toBe('fault_knee');
  });

  it('clears fault state on resolveFault', () => {
    const t0 = 1000;
    engine.proposeCue({
      id: 'fault_back',
      category: 'FORM_FAULT',
      bannerText: 'Flatten your back',
      tone: 'fault',
      durationMs: 4000,
    }, t0);

    engine.resolveFault('fault_back', t0 + 1000);
    const active = engine.getActiveCue();
    expect(active).toBeNull();
  });

  it('respects minimum speech interval to prevent audio collisions', () => {
    const t0 = 1000;
    const d1 = engine.proposeCue({
      id: 'cue_1',
      category: 'RHYTHM_COUNT',
      bannerText: '1',
      tone: 'cue',
    }, t0);

    expect(d1.shouldSpeak).toBe(true);

    // Next cue arrives 200ms later (less than 1000ms speech interval)
    const d2 = engine.proposeCue({
      id: 'cue_2',
      category: 'RHYTHM_COUNT',
      bannerText: '2',
      tone: 'cue',
    }, t0 + 200);

    expect(d2.shouldSpeak).toBe(false);
  });
});
