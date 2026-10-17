import {
  EligibilityDecision,
  UserEvaluationContext,
  RecipientEvaluationContext,
  PolicyReviewStatus,
} from './types';

export const POLICY_VERSION = '2026.10.16-v1';

export const policyConfig = {
  version: POLICY_VERSION,
  adultSocialMinimumAge: 18,
  under25Pilot: {
    enabled: true, // evaluated with strict trial rules
    minAge: 18,
    maxAgeExclusive: 25,
    trialDays: 7,
    communityAccessDuringTrial: false,
    maxIntrosPerDay: 1,
    allowedRecipientCohort: 'older_women_35_plus',
  },
  olderWomenCohorts: {
    women35To49: { minAge: 35, maxAgeInclusive: 49, enabled: true },
    women50Plus: { minAge: 50, enabled: true },
  },
  women18To40Pathway: {
    minAge: 18,
    maxAgeInclusive: 40,
    enabled: true,
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
export function evaluateFeatureEligibility(
  featureId: string,
  user: UserEvaluationContext,
  recipient?: RecipientEvaluationContext
): EligibilityDecision {
  // Precedence 1: Legal & underage protection
  if (user.age < policyConfig.adultSocialMinimumAge) {
    return {
      allowed: false,
      featureId,
      reasonCode: 'UNDERAGE_FORBIDDEN',
      policyVersion: POLICY_VERSION,
      message: 'Adult eligibility (18+) is required for social and correspondence pathways.',
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
  if (
    featureId === 'founder_religion_dating_rule' &&
    policyConfig.founderRequestedSensitiveRules.muslimMen18To30WomenDating === 'REVIEW_REQUIRED'
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
    policyConfig.founderRequestedSensitiveRules.physicalMeetupCoordination !== 'ACTIVE'
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
    const isUnder25 =
      user.experience === 'men_health' &&
      user.age >= policyConfig.under25Pilot.minAge &&
      user.age < policyConfig.under25Pilot.maxAgeExclusive;

    if (isUnder25 && !user.hasActiveSubscription) {
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
    // Under 25 male cohort: 7-day free trial
    const isUnder25 =
      user.experience === 'men_health' &&
      user.age >= policyConfig.under25Pilot.minAge &&
      user.age < policyConfig.under25Pilot.maxAgeExclusive;

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

      if (elapsedDays <= policyConfig.under25Pilot.trialDays) {
        // Enforce daily 1-intro quota
        if (user.introsSentToday >= policyConfig.under25Pilot.maxIntrosPerDay) {
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

      // Trial expired
      if (!user.hasActiveSubscription) {
        return {
          allowed: false,
          featureId,
          reasonCode: 'TRIAL_EXPIRED',
          policyVersion: POLICY_VERSION,
          message: '7-day introductory trial has concluded. Continue with personal health or upgrade.',
        };
      }
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
