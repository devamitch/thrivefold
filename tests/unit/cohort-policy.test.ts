import { calculateAgeBand, evaluateFeatureEligibility, DEFAULT_POLICY } from '../../src/domain/policy/ageAssurance';

describe('Thrivefold Cohort Policy & Age Assurance Tests', () => {
  describe('calculateAgeBand boundary conditions', () => {
    test('Identifies under_18 minors precisely', () => {
      const today = new Date();
      // 17 years and 364 days ago
      const seventeen = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
      expect(calculateAgeBand(seventeen)).toBe('under_18');
    });

    test('Identifies exact 18th birthday as 18_24 adult cohort', () => {
      const today = new Date();
      const eighteen = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      expect(calculateAgeBand(eighteen)).toBe('18_24');
    });

    test('Identifies 24 as 18_24 and 25 as 25_29', () => {
      const today = new Date();
      const twentyFour = new Date(today.getFullYear() - 24, today.getMonth(), today.getDate());
      const twentyFive = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
      expect(calculateAgeBand(twentyFour)).toBe('18_24');
      expect(calculateAgeBand(twentyFive)).toBe('25_29');
    });

    test('Identifies 34 as 30_34 and 35 as 35_39', () => {
      const today = new Date();
      const thirtyFour = new Date(today.getFullYear() - 34, today.getMonth(), today.getDate());
      const thirtyFive = new Date(today.getFullYear() - 35, today.getMonth(), today.getDate());
      expect(calculateAgeBand(thirtyFour)).toBe('30_34');
      expect(calculateAgeBand(thirtyFive)).toBe('35_39');
    });

    test('Identifies 49 as 45_49 and 50 as 50_plus', () => {
      const today = new Date();
      const fortyNine = new Date(today.getFullYear() - 49, today.getMonth(), today.getDate());
      const fifty = new Date(today.getFullYear() - 50, today.getMonth(), today.getDate());
      expect(calculateAgeBand(fortyNine)).toBe('45_49');
      expect(calculateAgeBand(fifty)).toBe('50_plus');
    });
  });

  describe('Feature eligibility evaluation and restrictions', () => {
    test('Minors are unconditionally barred from social letters and meetups', () => {
      const eligibility = evaluateFeatureEligibility('letters', 'under_18', null, {});
      expect(eligibility.isEligible).toBe(false);
      expect(eligibility.reasonCode).toBe('AGE_RESTRICTED');
      expect(eligibility.minimumAge).toBe(18);
    });

    test('Verified adults are eligible with explicit consent', () => {
      const eligibility = evaluateFeatureEligibility('letters', '25_29', {
        isVerified: true,
        ageBand: '25_29',
        verifiedAt: new Date().toISOString(),
      }, {});
      expect(eligibility.isEligible).toBe(true);
      expect(eligibility.requiresConsent).toBe(true);
    });

    test('Stated religion never changes eligibility; unreviewed pathway is closed to everyone', () => {
      const verified = { isVerified: true, ageBand: '25_29' as const, verifiedAt: new Date().toISOString() };
      const results = ['muslim', 'hindu', 'christian', undefined].map((religion) =>
        evaluateFeatureEligibility('adult_social', '25_29', verified, { religion }),
      );
      for (const r of results) {
        expect(r.isEligible).toBe(false);
        expect(r.reasonCode).toBe('POLICY_RESTRICTION_REVIEW_REQUIRED');
      }
      const letters = ['muslim', 'hindu', undefined].map((religion) =>
        evaluateFeatureEligibility('letters', '25_29', verified, { religion }).isEligible,
      );
      expect(new Set(letters).size).toBe(1);
    });

    test('Social features require real verification', () => {
      const unverified = evaluateFeatureEligibility('letters', '30_34', null, {});
      expect(unverified.isEligible).toBe(false);
      expect(unverified.reasonCode).toBe('VERIFICATION_REQUIRED');
    });

    test('Under-25 trial when enabled requires adult age verification', () => {
      const policyWithTrial = {
        ...DEFAULT_POLICY,
        under25TrialEnabled: true,
      };

      const unverified = evaluateFeatureEligibility('letters', '18_24', null, {}, policyWithTrial);
      expect(unverified.isEligible).toBe(false);
      expect(unverified.reasonCode).toBe('VERIFICATION_REQUIRED');

      const verified = evaluateFeatureEligibility('letters', '18_24', {
        isVerified: true,
        ageBand: '18_24',
        verifiedAt: new Date().toISOString(),
      }, {}, policyWithTrial);
      expect(verified.isEligible).toBe(true);
    });
  });
});
