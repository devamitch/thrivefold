# Requirements Traceability Matrix

| Requirement ID | Specification Summary | Target Module / Route | API / Policy Contract | Privacy & Retention | Implementation Status | Test ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `HEALTH-W-001` | Preserve existing women's cycle tracker | `Apps/harmony-bloom` & `thrivefold/src/app/(app)/health/cycle.tsx` | `useHealthStore.cycleData` | Local device vault | Preserved & Extracted | `HB-BUILD-01` |
| `HEALTH-M-001` | Men's health mobility, posture & pelvic care | `thrivefold/src/app/(app)/health/exercise.tsx` | `evaluateDeterministicRoutine` | Local device vault | Implemented | `TEST-LOCAL-AI-03` |
| `HEALTH-P-001` | Pride & LGBTQ+ affirmative wellbeing space | `thrivefold/src/app/(app)/(tabs)/index.tsx` | `theme/colors.ts (prideLight/Dark)` | No public disclosure | Implemented | `TEST-THEME-01` |
| `AI-LOCAL-001` | Deterministic offline task rules | `thrivefold/src/domain/ai/deterministicRules.ts` | `evaluateDeterministicRoutine` | 100% on-device | Implemented | `TEST-LOCAL-AI-01` |
| `AI-LOCAL-002` | Local classification (fatigue, intent, safety) | `thrivefold/src/domain/ai/localClassifier.ts` | `classifyLocalInput` | 100% on-device | Implemented | `TEST-LOCAL-AI-04` |
| `AI-MEM-001` | Sovereign local memory vault with inspect/erase | `thrivefold/src/services/memory/localMemoryVault.ts` | `localMemoryVault` | Local encrypted storage | Implemented | `TEST-AI-VAULT-01` |
| `AI-CLOUD-001` | Serverless Edge AI Gateway (Gemini) with caps | `thrivefold/src/services/ai-router/cloudAiGateway.ts` | `cloudAiGateway.requestGeneration` | Redacted, consent-gated | Implemented | `TEST-CLOUD-GW-01` |
| `CHIP-MSG-001` | Chip-only message composer (no raw typed text) | `thrivefold/src/app/(app)/letters/compose.tsx` | `validateChipSequence` | Moderated before queue | Implemented | `TEST-CHIP-CAT-01` |
| `CHIP-MSG-002` | Anti-bypass injection moderation | `thrivefold/src/domain/chips/moderation.ts` | `validateChipSequence` | Instant rejection | Implemented | `TEST-CHIP-CAT-02` |
| `SLOW-LET-001` | Slowly-inspired distance delayed delivery | `thrivefold/src/domain/letters/deliveryCalculator.ts` | `calculateDeliveryHours` | ETA countdown metadata | Implemented | `TEST-DELIVERY-01` |
| `SLOW-LET-002` | Stamp collection album & milestones | `thrivefold/src/domain/letters/stampCatalog.ts` | `STAMP_CATALOG` | Local/server sync | Implemented | `TEST-STAMP-01` |
| `SOC-AGE-001` | Underage protection (18+ baseline) | `thrivefold/src/domain/policy/engine.ts` | `evaluateFeatureEligibility` | Server-enforced | Implemented | `TEST-POLICY-01` |
| `SOC-TRIAL-001` | Under-25 7-day free trial & community block | `thrivefold/src/domain/policy/engine.ts` | `evaluateFeatureEligibility` | Server entitlement | Implemented | `TEST-POLICY-04` |
| `SOC-QUOTA-001` | 1 new intro per day quota | `thrivefold/src/domain/policy/engine.ts` | `evaluateFeatureEligibility` | Daily local & server key | Implemented | `TEST-POLICY-06` |
| `REL-SENS-001` | Founder requested Muslim/Hindu policies | `thrivefold/src/domain/policy/engine.ts` | `founderRequestedSensitiveRules` | Kept as REVIEW_REQUIRED | Documented & Gated | `TEST-POLICY-07` |
| `COMM-VIS-001` | Segmented private circle namespaces | `thrivefold/src/app/(app)/circles/index.tsx` | `thrivefold_communities (RLS)` | Isolated per membership | Implemented | `TEST-COMM-01` |
| `SAFETY-001` | Block list immediately cancels queue | `thrivefold/src/domain/policy/engine.ts` | `evaluateFeatureEligibility` | Immediate delivery halt | Implemented | `TEST-POLICY-03` |
| `SAFETY-002` | Emergency crisis numbers & reporting | `thrivefold/src/app/(app)/safety/index.tsx` | `usePolicyStore.submitReport` | Audited case storage | Implemented | `TEST-SAFETY-01` |
| `BILLING-001` | 100% Free personal tier & no-card mode | `thrivefold/src/app/(app)/billing/index.tsx` | `plan_free` | Zero credit card req | Implemented | `TEST-BILLING-01` |
