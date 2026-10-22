# Requirements Traceability Matrix

## Verified status — 2026-10-23 (authoritative)

Status values: PASS (verified with the listed evidence), FAIL, BLOCKED (needs an external
action), NOT TESTED. Checks: `pnpm compile` (strict, 0 errors), `pnpm lint` (0),
`pnpm test` (41/41), `pnpm test:db` (47/47 on real Postgres via PGlite),
`expo export --platform android` (bundles), `expo-doctor` 19/20 (only `expo` 55.0.31→55.0.32 patch).
No Android/iOS native build or device run was done in this pass.

| Req | Status | Evidence | Remaining issue |
| --- | --- | --- | --- |
| REQ-001 Completeness | FAIL | This table; older matrix below is unverified | Most spec sections have UI only; no per-requirement acceptance tests |
| REQ-002 Design | NOT TESTED | No device run this pass | Visual QA on device pending |
| REQ-003 Progressive UX | NOT TESTED | `isSocialPathRevealed` now false by default | Reveal rules not wired to engagement data |
| REQ-004 Questionnaires | NOT TESTED | Onboarding routes exist | Skip/edit/resume persistence not verified on device |
| REQ-005 ADHD space | FAIL | — | Not implemented |
| REQ-006 Health safety | NOT TESTED | Cycle estimates labelled; fake health data removed | No safety-scenario test suite |
| REQ-007 AI & gamification | PASS (partial) | Deterministic rules tested (`local-ai.test.ts`); progress from real activity | Cloud gateway untested; no local LLM |
| REQ-008 Identity & privacy | PASS (local) / BLOCKED (server) | Local export/erase implemented; `tf_export_my_data`, consent revocation in `test:db` | Server account deletion needs an edge function; backend not deployed |
| REQ-009 Infrastructure | BLOCKED | Migrations 1–4 verified on Postgres | Needs its own Supabase project + env vars; no fallback to another app's project |
| REQ-010 Special users | PASS (DB) | `tf_admin_grant_special` / revoke, no self-grant, audited (`test:db`) | No admin UI; backend not deployed |
| REQ-011 Trust & safety | PASS (DB) | Restrictions with evidence, appeals, reinstatement, block/restriction cancel deliveries (`test:db`) | Moderation queue/human-review tooling not built |
| REQ-012 Communities & correspondence | PASS (DB) / BLOCKED (app) | Chip-only + delayed delivery + membership enforced server-side (`test:db`) | App letters/communities are local-only until backend wiring |
| REQ-013 Verification | BLOCKED | Self-verification impossible (client + DB trigger); social features locked | No age-assurance provider integrated (Sumsub/Veriff evaluation pending) |
| REQ-014 Payments deferred | PASS | Billing route, subscription gates and payment tables removed; tests assert no upsell | — |
| REQ-015 Platform engineering | PASS (partial) | No hard-coded dev identity; strict TS restored; bundle exports | Native builds not run this pass |
| REQ-016 Delivery integrity | PASS | Commits 949b668, 0d07c53, ef1c62e, 8ca1e41; reproducible `test:db` | — |

Founder-requested religion/identity rules remain unenforced and the dependent adult-social
pathway is closed to everyone (see `FOUNDER_POLICY_REQUESTS.md`); tests assert stated
religion never changes eligibility.

## Earlier matrix (2026-10-16) — UNVERIFIED

The table below was written before this audit. Its "Complete" entries were based on
compilation only; several are known to be inaccurate (no backend was deployed, the journal
is not encrypted, account verification/OTP has no server, entitlement gates were removed).
Use the verified section above.

This matrix maps every requirement, architecture tier, and policy boundary from `thrivefold_ultimate_master_build_prompt_v2.md` to active code, routes, components, database migrations, and verified test suites.

| Section / Req ID | Specification Domain | Target Module / Route | API / Policy Contract | Privacy & Retention | Implementation Status | Test Suite / Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Sec 0-2 / ARCH-001** | Unified Architecture & Safety Rules | `thrivefold/app.json`, `src/app/_layout.tsx` | Expo SDK 55, Hermes, zero-shadow flat squircle | On-device primary, sovereign local vault | Complete | `compile`, `RootLayout` |
| **Sec 3 / HEALTH-W-001** | Women's Health & Cycle Tracker | `src/app/(app)/health/cycle.tsx` | `useHealthStore.cycleData` | Local device vault | Complete | `TEST-HEALTH-01` |
| **Sec 4 / HEALTH-M-001** | Men's Wellbeing & Mobility | `src/app/(app)/health/men/index.tsx`, `exercise.tsx` | `evaluateDeterministicRoutine` | Local device vault | Complete | `tests/unit/local-ai.test.ts` |
| **Sec 5 / HEALTH-P-001** | Pride & LGBTQ+ Affirmative Space | `src/app/(app)/health/pride/index.tsx` | `theme/colors.ts (prideLight/Dark)` | No public disclosure | Complete | `ThemeColors` check |
| **Sec 6 / HEALTH-EXT-001** | Reproductive Health Education | `src/app/(app)/health/reproductive.tsx` | Clinical guidance & signposting | Read-only curated resources | Complete | `compile` |
| **Sec 7 / HEALTH-EXT-002** | Pelvic Floor Awareness & Exercises | `src/app/(app)/health/pelvic-floor.tsx` | Contraindication panel (hypertonic care) | On-device timer & logs | Complete | `compile` |
| **Sec 8 / HEALTH-EXT-003** | Multi-System Symptom Logger | `src/app/(app)/health/symptoms.tsx` | Somatic tracking & severity ratings | Local device vault | Complete | `compile` |
| **Sec 9 / HEALTH-EXT-004** | Circadian Rhythm & Sleep Alignment | `src/app/(app)/health/sleep.tsx` | Duration stepper & wind-down checklist | Local device vault | Complete | `compile` |
| **Sec 10 / HEALTH-EXT-005** | Somatic Valence, Energy & Stress | `src/app/(app)/health/mood.tsx` | Energy, mood valence, stress 1-10 scales | Local device vault | Complete | `compile` |
| **Sec 11 / HEALTH-EXT-006** | Nutrition & Hydration Tracker | `src/app/(app)/health/nutrition.tsx` | Water intake stepper & meal reflection | Local device vault | Complete | `compile` |
| **Sec 12 / HEALTH-EXT-007** | Local Non-Prescriptive Schedule | `src/app/(app)/health/medications.tsx` | Local-only medication reminders | Never shared across network | Complete | `compile` |
| **Sec 13 / HEALTH-EXT-008** | Health Audit Log & JSON Export | `src/app/(app)/health/history.tsx` | Comprehensive chronological export | User exportable JSON | Complete | `compile` |
| **Sec 14 / JRNL-001** | On-Device Encrypted Journal | `src/app/(app)/journal/index.tsx`, `new.tsx` | Local mood tags & structured prompts | Sovereign encrypted vault | Complete | `compile` |
| **Sec 15 / JRNL-002** | Single Entry View & Local AI Refl | `src/app/(app)/journal/[entryId].tsx` | Deterministic reflection suggestions | 100% on-device inference | Complete | `compile` |
| **Sec 16 / AI-LOC-001** | Deterministic Offline Task Rules | `src/domain/ai/deterministicRules.ts` | `evaluateDeterministicRoutine` | 100% on-device | Complete | `tests/unit/local-ai.test.ts` |
| **Sec 17 / AI-LOC-002** | Local Classification Engine | `src/domain/ai/localClassifier.ts` | `classifyLocalInput` | 100% on-device | Complete | `tests/unit/local-ai.test.ts` |
| **Sec 18 / AI-MEM-001** | Sovereign Memory Vault | `src/services/memory/localMemoryVault.ts`, `ai/memory.tsx` | Inspect, erase individual, wipe all | Local device vault | Complete | `compile` |
| **Sec 19 / AI-PRIV-001** | Privacy Boundary & Vector Toggles | `src/app/(app)/ai/privacy.tsx` | Zero-cloud client keys, consent flags | Enforced by proxy | Complete | `compile` |
| **Sec 20 / AI-STAT-001** | Model Runtime & Tier Status | `src/app/(app)/ai/model-status.tsx` | Deterministic, local classifier, proxy | Transparent diagnostics | Complete | `compile` |
| **Sec 21 / AI-CLD-001** | Serverless Edge AI Gateway | `src/services/ai-router/cloudAiGateway.ts` | Server proxy with daily token limits | Redacted, consent-gated | Complete | `compile` |
| **Sec 22 / CHIP-MSG-001** | Chip-Only Postal Composition | `src/app/(app)/letters/compose.tsx`, `drafts.tsx` | Zero free-text input allowed | Curated card sequences | Complete | `tests/unit/chip-catalog.test.ts` |
| **Sec 23 / CHIP-SEC-001** | Anti-Bypass Injection Interceptor | `src/domain/chips/moderation.ts` | `validateChipSequence` | Blocks phone, emails, links | Complete | `tests/unit/chip-moderation-security.test.ts` |
| **Sec 24 / SLOW-LET-001** | Slowly-Inspired Distance Delay | `src/domain/letters/deliveryCalculator.ts` | `calculateDeliveryHours` | Coarse distance bands | Complete | `tests/unit/transit-math.test.ts` |
| **Sec 25 / SLOW-LET-002** | Collectible Stamps Catalog | `src/domain/letters/stampCatalog.ts`, `stamps.tsx` | `STAMP_CATALOG`, user inventory | Local/server sync | Complete | `tests/unit/transit-math.test.ts` |
| **Sec 26 / SLOW-LET-003** | Postal Sub-Navigation & Hub | `src/app/(app)/letters/index.tsx`, `inbox.tsx`, `outbox.tsx` | In-transit countdown & milestone waypoints | Pseudonymous routing | Complete | `compile` |
| **Sec 27 / SLOW-LET-004** | Live Delivery Waypoint Tracker | `src/app/(app)/letters/delivery/[letterId].tsx` | Progress bar & distance estimation | Pseudonymous stamps | Complete | `compile` |
| **Sec 28 / SLOW-LET-005** | Pen-Pal Candidate Discovery | `src/app/(app)/letters/discover.tsx`, `open-letters.tsx` | Interest & language matching, 1-intro quota | Server quota enforced | Complete | `tests/unit/policy-engine.test.ts` |
| **Sec 29 / SLOW-LET-006** | Pen-Pal Profile & Preferences | `src/app/(app)/letters/profile.tsx`, `preferences.tsx` | Pseudonym, avatar seed, distance scope | No real names or GPS | Complete | `compile` |
| **Sec 30 / SOC-AGE-001** | Strict 18+ Adult Protection | `src/domain/policy/ageAssurance.ts`, `auth/verify-age.tsx` | Underage unconditionally barred | Zero ID document storage | Complete | `tests/unit/cohort-policy.test.ts` |
| **Sec 31 / SOC-AGE-002** | Age Band Boundary Tests | `src/domain/policy/ageAssurance.ts` | `calculateAgeBand` (18, 25, 35, 50) | Discrete cohort bins | Complete | `tests/unit/cohort-policy.test.ts` |
| **Sec 32 / SOC-TRL-001** | Under-25 Male 7-Day Pilot | `src/domain/policy/engine.ts` | Trial mode: correspondence only | Isolated from general circles | Complete | `tests/unit/policy-engine.test.ts` |
| **Sec 33 / SOC-TRL-002** | Community Block During Trial | `src/domain/policy/engine.ts` | `COMMUNITY_RESTRICTED_DURING_TRIAL` | Entitlement gate | Complete | `tests/unit/policy-engine.test.ts` |
| **Sec 34 / SOC-QTA-001** | Daily 1-New-Intro Quota | `src/stores/useAuthStore.ts`, `domain/policy/engine.ts` | `introsSentToday >= 1 -> EXHAUSTED` | Midnight reset cycle | Complete | `tests/unit/policy-engine.test.ts` |
| **Sec 35 / REL-SENS-001** | Founder Sensitive Religion Rules | `src/domain/policy/engine.ts`, `ageAssurance.ts` | Kept as REVIEW_REQUIRED (Never covert) | Protected from inference | Complete | `tests/unit/policy-engine.test.ts` |
| **Sec 36 / COMM-VIS-001** | Segmented Circle Namespaces | `src/app/(app)/circles/index.tsx`, `[communityId]/index.tsx` | Type-isolated (women, men, pride, general) | Private RLS policies | Complete | `compile` |
| **Sec 37 / COMM-INV-001** | Circle Invitations with Purpose | `src/app/(app)/circles/invitations.tsx` | Consented invites with facilitator badge | Decoupled identity | Complete | `compile` |
| **Sec 38 / ORG-APP-001** | Accredited NGO & Clinic Onboarding | `src/app/(app)/organizations/apply.tsx` | Domain verification & accreditation tier | Verification audit trail | Complete | `compile` |
| **Sec 39 / ORG-ADM-001** | Organization Administration Roster | `src/app/(app)/organizations/[organizationId]/index.tsx` | Roles: owner, admin, clinician, moderator | Staff authorization check | Complete | `compile` |
| **Sec 40 / SAFE-BLK-001** | Two-Way Immediate Block Engine | `src/domain/policy/engine.ts`, `safety/blocked-users.tsx` | Cancels letter queues & mutual invisibility | Instant server enforcement | Complete | `tests/unit/policy-engine.test.ts` |
| **Sec 41 / SAFE-RPT-001** | Safety Evidence Reporting | `src/app/(app)/safety/report.tsx` | Category, evidence summary & auto-block | Encrypted case vault | Complete | `compile` |
| **Sec 42 / SAFE-APL-001** | Transparent Account Appeal Pathway | `src/app/(app)/safety/appeal.tsx` | Human review appeal submission | Audit log preserved | Complete | `compile` |
| **Sec 43 / SAFE-CRS-001** | 24/7 Global Crisis & Helpline Hub | `src/app/(app)/safety/urgent-support.tsx` | International hotlines, SMS & emergency dial | Direct device telephone link | Complete | `compile` |
| **Sec 44 / AUTH-SU-001** | Pseudonymous Sign-Up Flow | `src/app/(auth)/sign-up.tsx` | Email/password or sovereign credential | Minimal identity leakage | Complete | `compile` |
| **Sec 45 / AUTH-VER-001** | Account Email & Token Verification | `src/app/(auth)/verify-account.tsx` | Supabase 6-digit OTP verification | Safe session token storage | Complete | `compile` |
| **Sec 46 / AUTH-RST-001** | Secure Password Recovery | `src/app/(auth)/reset-password.tsx` | Out-of-band reset link | One-time token consumption | Complete | `compile` |
| **Sec 47 / ONBD-EXP-001** | Onboarding: Choose Experience | `src/app/(onboarding)/choose-experience.tsx` | Women, Men, Pride, General Health | User explicit selection | Complete | `compile` |
| **Sec 48 / ONBD-PRV-002** | Onboarding: Privacy Choices | `src/app/(onboarding)/privacy-choices.tsx` | Offline-first, cloud AI opt-in | Explicit consent records | Complete | `compile` |
| **Sec 49 / ONBD-GLS-003** | Onboarding: Wellbeing Goals | `src/app/(onboarding)/goals.tsx` | Goal selection linked to constraints | Local device vault | Complete | `compile` |
| **Sec 50 / ONBD-CST-004** | Onboarding: Activity Constraints | `src/app/(onboarding)/activity-constraints.tsx` | Physical mobility, fatigue, injury care | Prevents harmful routines | Complete | `compile` |
| **Sec 51 / ONBD-LFS-005** | Onboarding: Lifestyle Preferences | `src/app/(onboarding)/lifestyle-preferences.tsx` | Sleep timing, hydration targets | Local preference storage | Complete | `compile` |
| **Sec 52 / ONBD-HP-006** | Onboarding: Health Permissions | `src/app/(onboarding)/health-permissions.tsx` | Step counting, biometric sensor scope | Granular platform consent | Complete | `compile` |
| **Sec 53 / ONBD-NOT-007** | Onboarding: Notification Permission | `src/app/(onboarding)/notification-permission.tsx` | Quiet hours (22:00-07:00) default | Mindful delivery only | Complete | `compile` |
| **Sec 54 / ONBD-LOC-008** | Onboarding: Location Permission | `src/app/(onboarding)/location-permission.tsx` | Coarse postal regions (Zero exact GPS) | No background tracking | Complete | `compile` |
| **Sec 55 / ONBD-ROU-009** | Onboarding: Daily Routine Setup | `src/app/(onboarding)/daily-routine.tsx` | Morning & evening quiet check-in pacing | Offline routine schedule | Complete | `compile` |
| **Sec 56 / ONBD-CMP-010** | Onboarding: Completion & Launch | `src/app/(onboarding)/complete.tsx` | Vault encryption initialization | Session activation | Complete | `compile` |
| **Sec 57 / DB-MIG-001** | Database Migrations 1, 2, 3 | `supabase/migrations/*.sql` | Profiles, RLS, Orgs, Stamps, Entitlements | Strict row level security | Complete | SQL validation |
| **Sec 58 / TST-COV-001** | End-to-End Test Suite Verification | `tests/unit/*.test.ts` | 6 suites, 36 tests passing (100% pass) | Continuous regression test | Complete | `npm test` passing |

