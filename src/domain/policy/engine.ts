import {
  EligibilityDecision,
  UserEvaluationContext,
  RecipientEvaluationContext,
  PolicyReviewStatus,
} from './types';

export const POLICY_VERSION = '2026.10.23-v2';

/**
 * Every age/cohort social pathway ships disabled (master spec §23.2): enabling one is a
 * founder decision that needs legal/store review, made by changing this config — not
 * by code paths that ignore it. All initial-release features are free (REQ-014): no
 * rule here depends on payment.
 */
export const policyConfig = {
  version: POLICY_VERSION,
  adultSocialMinimumAge: 18,
  under25Pilot: {
    enabled: false, // enable only after legal/store review
    minAge: 18,
    maxAgeExclusive: 25,
    trialDays: 7,
    communityAccessDuringTrial: false,
    maxIntrosPerDay: 1,
    allowedRecipientCohort: 'older_women_35_plus',
  },
  olderWomenCohorts: {
    women35To49: { minAge: 35, maxAgeInclusive: 49, enabled: false },
    women50Plus: { minAge: 50, enabled: false },
  },
  women18To40Pathway: {
    minAge: 18,
    maxAgeInclusive: 40,
    enabled: false,
  },
  // Sensitive rules explicitly recorded as REVIEW_REQUIRED per founder specifications
  founderRequestedSensitiveRules: {
    muslimMen18To30WomenDating: 'REVIEW_REQUIRED' as PolicyReviewStatus,
    hinduWomenSocialExclusion: 'REVIEW_REQUIRED' as PolicyReviewStatus,
    physicalMeetupCoordination: 'DISABLED_PENDING_LEGAL_STORE_APPROVAL' as PolicyReviewStatus,
  },
};

/**
 * Pure deterministic policy evaluation for feature eligibility
 */
export type PolicyConfig = typeof policyConfig;

export function evaluateFeatureEligibility(
  featureId: string,
  user: UserEvaluationContext,
  recipient?: RecipientEvaluationContext,
  config: PolicyConfig = policyConfig,
): EligibilityDecision {
  // Precedence 1: Legal & underage protection. Unknown age is treated as not adult.
  if (user.age === null || user.age < config.adultSocialMinimumAge) {
    return {
      allowed: false,
      featureId,
      reasonCode: 'UNDERAGE_FORBIDDEN',
      policyVersion: POLICY_VERSION,
      message: 'Community features open after a real age check.',
    };
  }

  // Verification requirement for social features
  if (!user.isAgeVerified) {
    return {
      allowed: false,
      featureId,
      reasonCode: 'NEEDS_VERIFICATION',
      policyVersion: POLICY_VERSION,
      message: 'Age assurance verification is required.',
    };
  }

  // Precedence 2: Recipient consent & blocking checks
  if (recipient) {
    if (
      user.blockedUserIds.includes(recipient.recipientId) ||
      recipient.blockedUserIds.includes(user.userId)
    ) {
      return {
        allowed: false,
        featureId,
        reasonCode: 'RECIPIENT_BLOCKED',
        policyVersion: POLICY_VERSION,
        message: 'Communication between these accounts is restricted.',
      };
    }

    if (!recipient.acceptsIntroductions) {
      return {
        allowed: false,
        featureId,
        reasonCode: 'RECIPIENT_DECLINED',
        policyVersion: POLICY_VERSION,
        message: 'Recipient is not accepting new introductions at this time.',
      };
    }

    if (
      (recipient.acceptedAgeMin && user.age < recipient.acceptedAgeMin) ||
      (recipient.acceptedAgeMax && user.age > recipient.acceptedAgeMax)
    ) {
      return {
        allowed: false,
        featureId,
        reasonCode: 'INELIGIBLE_COHORT',
        policyVersion: POLICY_VERSION,
        message: 'User does not match recipient selected preferences.',
      };
    }
  }

  // Precedence 3: Sensitive rules & regulatory reviews (system level gate)
  // Identity-based founder rules are never enforced per user (no one is singled out by
  // religion); the feature that would depend on them stays unavailable to everyone.
  if (
    featureId === 'founder_religion_dating_rule' &&
    config.founderRequestedSensitiveRules.muslimMen18To30WomenDating !== 'ACTIVE'
  ) {
    return {
      allowed: false,
      featureId,
      reasonCode: 'POLICY_REVIEW_REQUIRED',
      policyVersion: POLICY_VERSION,
      message: 'This policy is queued for legal and platform regulatory review before deployment.',
    };
  }

  if (
    featureId === 'physical_meetup_coordination' &&
    config.founderRequestedSensitiveRules.physicalMeetupCoordination !== 'ACTIVE'
  ) {
    return {
      allowed: false,
      featureId,
      reasonCode: 'FEATURE_DISABLED_BY_CHANNEL',
      policyVersion: POLICY_VERSION,
      message: 'Physical meetup coordination is disabled in restricted letter mode.',
    };
  }

  // Precedence 4: Structural cohort safety gates
  // Community access check for trial users: strictly blocked during trial
  if (featureId === 'community_directory' || featureId === 'join_community') {
    const inPilotTrial =
      config.under25Pilot.enabled &&
      user.experience === 'men_health' &&
      user.age >= config.under25Pilot.minAge &&
      user.age < config.under25Pilot.maxAgeExclusive &&
      isWithinTrial(user.activeTrialStartDate, config.under25Pilot.trialDays);

    if (inPilotTrial && !config.under25Pilot.communityAccessDuringTrial) {
      return {
        allowed: false,
        featureId,
        reasonCode: 'COMMUNITY_RESTRICTED_DURING_TRIAL',
        policyVersion: POLICY_VERSION,
        message: 'Community discovery is restricted during introductory letter trial.',
      };
    }
  }

  // Precedence 5: Check feature consent
  if (!user.consentedFeatures.includes(featureId)) {
    return {
      allowed: false,
      featureId,
      reasonCode: 'NEEDS_EXPLICIT_CONSENT',
      policyVersion: POLICY_VERSION,
      message: 'Explicit participation consent is required.',
    };
  }

  // Precedence 6: Specific feature policies & quotas
  if (featureId === 'restricted_correspondence_trial') {
    if (!config.under25Pilot.enabled) {
      return {
        allowed: false,
        featureId,
        reasonCode: 'POLICY_REVIEW_REQUIRED',
        policyVersion: POLICY_VERSION,
        message: 'This correspondence pathway is not available in this release.',
      };
    }
    // Under 25 male cohort: 7-day introductory period
    const isUnder25 =
      user.experience === 'men_health' &&
      user.age >= config.under25Pilot.minAge &&
      user.age < config.under25Pilot.maxAgeExclusive;

    if (isUnder25) {
      if (!user.activeTrialStartDate) {
        return {
          allowed: true,
          featureId,
          reasonCode: 'TRIAL_ACTIVE',
          policyVersion: POLICY_VERSION,
          entitlementId: 'trial_7_day_slow_letters',
          message: '7-day restricted correspondence trial available.',
        };
      }

      const startDate = new Date(user.activeTrialStartDate).getTime();
      const now = Date.now();
      const elapsedDays = (now - startDate) / (1000 * 60 * 60 * 24);

      if (elapsedDays <= config.under25Pilot.trialDays) {
        // Enforce daily 1-intro quota
        if (user.introsSentToday >= config.under25Pilot.maxIntrosPerDay) {
          return {
            allowed: false,
            featureId,
            reasonCode: 'ONE_NEW_INTRO_DAILY_QUOTA_EXHAUSTED',
            policyVersion: POLICY_VERSION,
            message: 'Daily introductory message limit (1 per day) reached.',
          };
        }

        return {
          allowed: true,
          featureId,
          reasonCode: 'TRIAL_ACTIVE',
          policyVersion: POLICY_VERSION,
          entitlementId: 'trial_7_day_slow_letters',
        };
      }

      // Introductory period over. Health features are unaffected; nothing is for sale.
      return {
        allowed: false,
        featureId,
        reasonCode: 'TRIAL_EXPIRED',
        policyVersion: POLICY_VERSION,
        message: 'The 7-day introductory period has ended. Your health tools stay available.',
      };
    }
  }

  // Default allowed if all constraints pass
  return {
    allowed: true,
    featureId,
    reasonCode: 'ELIGIBLE',
    policyVersion: POLICY_VERSION,
  };
}

function isWithinTrial(startIso: string | undefined, trialDays: number): boolean {
  if (!startIso) return true; // not started yet: the introductory rules still apply
  const elapsedDays = (Date.now() - new Date(startIso).getTime()) / 86_400_000;
  return elapsedDays <= trialDays;
}
