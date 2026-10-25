import { evaluateFeatureEligibility } from '../../src/domain/policy/engine';
import type { UserEvaluationContext } from '../../src/domain/policy/types';

const adult = (over: Partial<UserEvaluationContext> = {}): UserEvaluationContext => ({
  userId: 'u1',
  age: 28,
  isAgeVerified: true,
  experience: 'women_health',
  completedCheckInDays: 10,
  consentedFeatures: ['join_community', 'create_community', 'dating_profile', 'dating_first_contact', 'dating_reply'],
  introsSentToday: 0,
  blockedUserIds: [],
  level: 1,
  ...over,
});

test('groups: join from level 6, create from level 10 (pending founder call)', () => {
  expect(evaluateFeatureEligibility('join_community', adult({ level: 5 })).reasonCode).toBe('LEVEL_REQUIRED');
  expect(evaluateFeatureEligibility('join_community', adult({ level: 6 })).allowed).toBe(true);
  expect(evaluateFeatureEligibility('create_community', adult({ level: 9 })).reasonCode).toBe('LEVEL_REQUIRED');
  const create = evaluateFeatureEligibility('create_community', adult({ level: 10 }));
  expect(create.allowed).toBe(true);
  expect(create.entitlementId).toBe('pending_founder_call');
});

test('dating opens at level 20 and only women send the first message', () => {
  expect(evaluateFeatureEligibility('dating_profile', adult({ level: 19 })).reasonCode).toBe('LEVEL_REQUIRED');
  expect(evaluateFeatureEligibility('dating_profile', adult({ level: 20 })).allowed).toBe(true);
  expect(evaluateFeatureEligibility('dating_first_contact', adult({ level: 25, selfDeclaredGender: 'woman' })).allowed).toBe(true);
  expect(evaluateFeatureEligibility('dating_first_contact', adult({ level: 25, selfDeclaredGender: 'man' })).reasonCode).toBe(
    'FIRST_CONTACT_NOT_ALLOWED',
  );
  // Unknown gender is never guessed; it simply can't start a conversation.
  expect(evaluateFeatureEligibility('dating_first_contact', adult({ level: 25 })).allowed).toBe(false);
  expect(evaluateFeatureEligibility('dating_reply', adult({ level: 25, selfDeclaredGender: 'man' })).allowed).toBe(true);
});

test('level never overrides age verification or consent', () => {
  expect(evaluateFeatureEligibility('dating_profile', adult({ level: 99, isAgeVerified: false })).reasonCode).toBe('NEEDS_VERIFICATION');
  expect(evaluateFeatureEligibility('dating_profile', adult({ level: 99, age: 17 })).reasonCode).toBe('UNDERAGE_FORBIDDEN');
  expect(evaluateFeatureEligibility('dating_profile', adult({ level: 99, consentedFeatures: [] })).reasonCode).toBe('NEEDS_EXPLICIT_CONSENT');
});
