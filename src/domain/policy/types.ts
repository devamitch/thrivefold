import { ProductExperience } from '../../theme/tokens';

export type SocialMode =
  | 'letters'
  | 'structured-introduction'
  | 'community-support'
  | 'meetup-reviewed';

export type PolicyReviewStatus =
  | 'ACTIVE'
  | 'REVIEW_REQUIRED'
  | 'DISABLED_PENDING_LEGAL_STORE_APPROVAL';

export type EligibilityReasonCode =
  | 'ELIGIBLE'
  | 'UNDERAGE_FORBIDDEN'
  | 'NEEDS_VERIFICATION'
  | 'NEEDS_EXPLICIT_CONSENT'
  | 'TRIAL_ACTIVE'
  | 'TRIAL_EXPIRED'
  | 'POLICY_REVIEW_REQUIRED'
  | 'COMMUNITY_RESTRICTED_DURING_TRIAL'
  | 'RECIPIENT_BLOCKED'
  | 'RECIPIENT_DECLINED'
  | 'ONE_NEW_INTRO_DAILY_QUOTA_EXHAUSTED'
  | 'FEATURE_DISABLED_BY_CHANNEL'
  | 'INELIGIBLE_COHORT'
  | 'LEVEL_REQUIRED'
  | 'FIRST_CONTACT_NOT_ALLOWED';

export interface EligibilityDecision {
  allowed: boolean;
  featureId: string;
  reasonCode: EligibilityReasonCode;
  policyVersion: string;
  entitlementId?: string;
  trialExpiresAt?: string;
  message?: string;
}

export interface UserEvaluationContext {
  userId: string;
  /** null until the person has stated or verified their age. */
  age: number | null;
  isAgeVerified: boolean;
  experience: ProductExperience;
  completedCheckInDays: number;
  selfDeclaredDiet?: string;
  selfDeclaredReligion?: string;
  consentedFeatures: string[];
  activeTrialStartDate?: string;
  introsSentToday: number;
  blockedUserIds: string[];
  /** Current progression level (the server re-checks it from its own ledger). */
  level?: number;
  /** Only what the person stated themselves; never inferred. */
  selfDeclaredGender?: 'woman' | 'man' | 'non_binary' | 'other' | null;
}

export interface RecipientEvaluationContext {
  recipientId: string;
  age: number;
  experience: ProductExperience;
  acceptsIntroductions: boolean;
  acceptedAgeMin?: number;
  acceptedAgeMax?: number;
  blockedUserIds: string[];
}
