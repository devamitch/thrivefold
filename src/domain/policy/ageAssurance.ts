export type AgeBand = 'under_18' | '18_24' | '25_29' | '30_34' | '35_39' | '40_44' | '45_49' | '50_plus';

export interface AgeVerificationResult {
  isVerified: boolean;
  ageBand: AgeBand;
  verifiedAt: string;
  provider?: string;
}

export interface FeatureEligibility {
  featureId: string;
  isEligible: boolean;
  reasonCode?: string;
  requiresConsent: boolean;
  minimumAge?: number;
  maximumAge?: number;
  requiresVerification: boolean;
}

export type FeatureId =
  | 'letters'
  | 'structured_intro'
  | 'community_access'
  | 'adult_social'
  | 'meetup'
  | 'organization_admin';

export interface PolicyConfig {
  minimumAgeForSocial: number;
  under25TrialEnabled: boolean;
  under25TrialDays: number;
  under25DailyIntroQuota: number;
  communityAccessDuringTrial: boolean;
  muslimMen18to30WomenDatingRestricted: boolean;
  hinduWomenDatingRestricted: boolean;
}

export const DEFAULT_POLICY: PolicyConfig = {
  minimumAgeForSocial: 18,
  under25TrialEnabled: false, // Disabled until legal review
  under25TrialDays: 7,
  under25DailyIntroQuota: 1,
  communityAccessDuringTrial: false,
  muslimMen18to30WomenDatingRestricted: true, // REVIEW_REQUIRED
  hinduWomenDatingRestricted: true, // REVIEW_REQUIRED
};

export function calculateAgeBand(birthDate: Date): AgeBand {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) return 'under_18';
  if (age <= 24) return '18_24';
  if (age <= 29) return '25_29';
  if (age <= 34) return '30_34';
  if (age <= 39) return '35_39';
  if (age <= 44) return '40_44';
  if (age <= 49) return '45_49';
  return '50_plus';
}

export function evaluateFeatureEligibility(
  featureId: FeatureId,
  ageBand: AgeBand,
  verificationResult: AgeVerificationResult | null,
  userPreferences: Record<string, any>,
  policy: PolicyConfig = DEFAULT_POLICY,
): FeatureEligibility {
  // Always require 18+ for social features
  if (featureId === 'letters' || featureId === 'structured_intro' || featureId === 'adult_social' || featureId === 'meetup') {
    if (ageBand === 'under_18') {
      return {
        featureId,
        isEligible: false,
        reasonCode: 'AGE_RESTRICTED',
        requiresConsent: false,
        requiresVerification: true,
        minimumAge: 18,
      };
    }
  }

  // Under-25 trial restrictions
  if (policy.under25TrialEnabled && ageBand === '18_24' && featureId === 'letters') {
    if (!verificationResult || !verificationResult.isVerified) {
      return {
        featureId,
        isEligible: false,
        reasonCode: 'VERIFICATION_REQUIRED',
        requiresConsent: false,
        requiresVerification: true,
        minimumAge: 18,
      };
    }
  }

  // Muslim men 18-30 women dating restriction (REVIEW_REQUIRED)
  if (policy.muslimMen18to30WomenDatingRestricted && ageBand === '18_24' && featureId === 'adult_social') {
    const religion = userPreferences.religion;
    if (religion === 'muslim') {
      return {
        featureId,
        isEligible: false,
        reasonCode: 'POLICY_RESTRICTION_REVIEW_REQUIRED',
        requiresConsent: false,
        requiresVerification: false,
      };
    }
  }

  // Hindu women dating restriction (REVIEW_REQUIRED)
  if (policy.hinduWomenDatingRestricted && featureId === 'adult_social') {
    const religion = userPreferences.religion;
    if (religion === 'hindu') {
      return {
        featureId,
        isEligible: false,
        reasonCode: 'POLICY_RESTRICTION_REVIEW_REQUIRED',
        requiresConsent: false,
        requiresVerification: false,
      };
    }
  }

  // Default eligible for verified adults
  return {
    featureId,
    isEligible: true,
    requiresConsent: true,
    requiresVerification: false,
  };
}
