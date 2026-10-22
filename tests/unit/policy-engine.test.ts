import { evaluateFeatureEligibility, policyConfig } from '../../src/domain/policy/engine';
import { UserEvaluationContext, RecipientEvaluationContext } from '../../src/domain/policy/types';

// The under-25 pilot ships disabled; tests that exercise its rules enable it explicitly.
const pilotEnabled = { ...policyConfig, under25Pilot: { ...policyConfig.under25Pilot, enabled: true } };

describe('Thrivefold Deterministic Policy Engine', () => {
  const baseUser: UserEvaluationContext = {
    userId: 'user_test_01',
    age: 26,
    isAgeVerified: true,
    experience: 'women_health',
    completedCheckInDays: 3,
    consentedFeatures: ['restricted_correspondence_trial', 'letters'],
    introsSentToday: 0,
    blockedUserIds: [],
  };

  test('P0: Underage users (< 18) are strictly forbidden from adult social/correspondence', () => {
    const underageUser: UserEvaluationContext = {
      ...baseUser,
      age: 17,
      isAgeVerified: false,
    };

    const decision = evaluateFeatureEligibility('restricted_correspondence_trial', underageUser);
    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe('UNDERAGE_FORBIDDEN');
  });

  test('P0: Exactly 18 years old with verification passes adult baseline', () => {
    const adultUser: UserEvaluationContext = {
      ...baseUser,
      age: 18,
      isAgeVerified: true,
    };

    const decision = evaluateFeatureEligibility('restricted_correspondence_trial', adultUser, undefined, pilotEnabled);
    expect(decision.allowed).toBe(true);
  });

  test('P0: Unknown age is never treated as adult', () => {
    const decision = evaluateFeatureEligibility('letters', { ...baseUser, age: null, isAgeVerified: false });
    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe('UNDERAGE_FORBIDDEN');
  });

  test('P0: A stated adult age without verification does not unlock social features', () => {
    const decision = evaluateFeatureEligibility('letters', { ...baseUser, isAgeVerified: false });
    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe('NEEDS_VERIFICATION');
  });

  test('P1: Unreviewed pilot pathways are off by default', () => {
    expect(policyConfig.under25Pilot.enabled).toBe(false);
    expect(policyConfig.women18To40Pathway.enabled).toBe(false);
    expect(policyConfig.olderWomenCohorts.women35To49.enabled).toBe(false);
    expect(policyConfig.olderWomenCohorts.women50Plus.enabled).toBe(false);
    const decision = evaluateFeatureEligibility('restricted_correspondence_trial', { ...baseUser, age: 22, experience: 'men_health' });
    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe('POLICY_REVIEW_REQUIRED');
  });

  test('REQ-014: An expired introductory period cannot be bought back', () => {
    const decision = evaluateFeatureEligibility(
      'restricted_correspondence_trial',
      {
        ...baseUser,
        age: 22,
        experience: 'men_health',
        activeTrialStartDate: new Date(Date.now() - 8 * 86_400_000).toISOString(),
      },
      undefined,
      pilotEnabled,
    );
    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe('TRIAL_EXPIRED');
    expect(decision.message ?? '').not.toMatch(/upgrade|subscri|purchase/i);
  });

  test('P0: Blocked recipient immediately halts communication', () => {
    const recipient: RecipientEvaluationContext = {
      recipientId: 'recipient_01',
      age: 38,
      experience: 'women_health',
      acceptsIntroductions: true,
      blockedUserIds: [],
    };

    const userWithBlock: UserEvaluationContext = {
      ...baseUser,
      blockedUserIds: ['recipient_01'],
    };

    const decision = evaluateFeatureEligibility('letters', userWithBlock, recipient);
    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe('RECIPIENT_BLOCKED');
  });

  test('P1: Under-25 pilot cohort receives 7-day free trial', () => {
    const youngMaleUser: UserEvaluationContext = {
      ...baseUser,
      userId: 'young_man_01',
      age: 22,
      experience: 'men_health',
      activeTrialStartDate: new Date().toISOString(),
      introsSentToday: 0,
    };

    const decision = evaluateFeatureEligibility('restricted_correspondence_trial', youngMaleUser, undefined, pilotEnabled);
    expect(decision.allowed).toBe(true);
    expect(decision.reasonCode).toBe('TRIAL_ACTIVE');
  });

  test('P1: Under-25 pilot cohort is barred from general communities during trial', () => {
    const youngMaleUser: UserEvaluationContext = {
      ...baseUser,
      userId: 'young_man_01',
      age: 22,
      experience: 'men_health',
      activeTrialStartDate: new Date().toISOString(),
    };

    const decision = evaluateFeatureEligibility('community_directory', youngMaleUser, undefined, pilotEnabled);
    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe('COMMUNITY_RESTRICTED_DURING_TRIAL');
  });

  test('P1: Daily 1-new-intro quota is strictly enforced', () => {
    const quotaExhaustedUser: UserEvaluationContext = {
      ...baseUser,
      userId: 'young_man_01',
      age: 22,
      experience: 'men_health',
      activeTrialStartDate: new Date().toISOString(),
      introsSentToday: 1, // already sent 1 today
    };

    const decision = evaluateFeatureEligibility('restricted_correspondence_trial', quotaExhaustedUser, undefined, pilotEnabled);
    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe('ONE_NEW_INTRO_DAILY_QUOTA_EXHAUSTED');
  });

  test('P0: Sensitive founder religious rules stay DISABLED as REVIEW_REQUIRED', () => {
    const decision = evaluateFeatureEligibility('founder_religion_dating_rule', baseUser);
    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe('POLICY_REVIEW_REQUIRED');
  });
});
