# Thrivefold — product concept

Thrivefold is an Android-first, local-first wellbeing app. It supports daily check-ins, routines,
journaling, cycle tracking, and gentle on-device guidance. Core features work without an account or
cloud connection. The app supports women's health, men's health, and LGBTQ+ wellbeing through
self-selected experiences. It is not a medical device and does not diagnose or replace professional
care.

## Product principles

- Keep health and journal data on the device by default; make any sharing explicit and optional.
- Use calm, accessible screens and plain, non-judgmental language.
- Offer deterministic, on-device suggestions that do not diagnose or infer sensitive traits.
- Let people choose their experience. Never infer or use religion, orientation, ethnicity, caste,
  or diagnoses for eligibility or recommendations.
- Provide export and deletion controls for local data.
- Keep social features unavailable until age assurance, consent, privacy controls, and server-side
  safeguards are implemented and reviewed.
- Keep the core app free of payments, subscriptions, credits, and advertising in this release.

## Main experience

People can record how they feel, keep personal notes, track routines and relevant health patterns,
and review their own history. Optional guidance uses information the person has entered and makes
its limits clear. The app remains useful offline and does not require account creation for core
features.

## Social features

Slow letters and private communities are future, gated features. They require real age assurance,
explicit consent, carefully scoped data access, and a live server with tested access controls. They
must not expose private health information in messages, URLs, logs, or analytics. Until those
conditions are met, the app should present an honest unavailable state.

## Ecosystem direction

Thrivefold is part of AnvayKosh alongside Neev, HarmonyBloom, BlinkQuest, and Setu. Those shared
identity, vault, connection, and sync services are not live in Thrivefold. Each app must work on its
own. Any future integration must use verified authorization flows, per-category consent, and
non-destructive data merges; never put profile or health data in links.
