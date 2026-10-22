---
name: thrivefold-data-and-safety
description: Rules for data, privacy, eligibility and health safety in Thrivefold — single persisted store, real data only, consent, age assurance, the deterministic policy engine, sensitive traits, no payments, export/erase. Use when touching stores, onboarding answers, social/letters/circles, health copy, or anything that decides who can do what.
---

# Data and safety

## Store

- One `useRootStore` (`src/stores/useRootStore.ts`) composed of slices:
  app, auth, health, quest, letter, policy. Persisted to MMKV (`thrivefold-root`), data only.
- Add state to the slice that owns the domain; keep action names unique across slices.
- Read with a selector `useRootStore((s) => s.x)` or `useRootStore(useShallow(...))`.
- Every initial value is empty/zero/null. Unknown stays `null` — never a plausible guess.

## Real data

- Progress, streaks, XP, cycle phase and predictions derive from recorded entries only.
- Social screens show nobody until the backend exists; no invented pen pals or orgs.
- Alerts never claim server actions that didn't happen ("reviewer will look", "joined").

## Eligibility (src/domain/policy)

- Pure functions, tested (`tests/unit/policy-engine.test.ts`, `cohort-policy.test.ts`).
- Unknown age = not adult. Social features need `isAgeVerified`, which only a real
  verification provider (server) may set; the DB trigger `tf_protect_profile_fields` blocks
  self-verification.
- Cohort pilots (under-25 men, women 18–40, older-women cohorts) ship `enabled: false`.
- Founder religion/identity rules are never enforced per person; dependent features are
  closed to everyone pending legal review. Tests assert religion never changes eligibility.
- No payment dependency anywhere (REQ-014).

## Onboarding and consent

- Answers persist in `onboarding` (app slice), skippable, editable (You → Redo setup /
  Food & reminders), resumable via `onboardingStep`.
- Never pre-tick consent, adulthood, diet or observances. Device permissions are requested
  by the feature that needs them, at that moment.

## Health safety

- Estimates are labelled as estimates; include "not medical advice" and clinician
  signposting; urgent support stays reachable (`safety/urgent-support`).
- Never reward risky behaviour or rank people by health.

## Export / erase

`src/services/privacy/localData.ts`: `buildLocalExport()` (system share sheet) and
`eraseLocalData()` (resets store + clears MMKV). Keep both complete when adding state.
