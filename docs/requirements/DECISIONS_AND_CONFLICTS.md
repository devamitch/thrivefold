# Thrivefold Architectural Decisions & Conflict Resolutions (ADR)

## ADR-001: Mobile vs. Web Architecture for Thrivefold
- **Context**: The existing ecosystem includes `Apps/harmony-bloom`, a responsive PWA built with React 19 and Vite. The founder requested a native mobile experience inspired by `Setu` and `BlinkQuest`.
- **Decision**: Keep `Apps/harmony-bloom` as a self-contained, high-performance web companion (with zero regressions) and build `Apps/thrivefold` as an Expo React Native cross-platform application for iOS, Android, and Web using Expo Router.
- **Status**: Implemented & Verified.

---

## ADR-002: Chip-Only Composer vs. Freeform Text Chat
- **Context**: Open text input on social platforms introduces severe moderation burdens, risk of harassment, predatory behavior, and instant messaging addiction.
- **Decision**: All pen-pal correspondence is strictly constructed using curated cards and sentiment chips from the approved catalog. Arbitrary text entry fields are completely removed from the social composer.
- **Status**: Implemented & Verified in `domain/chips/catalog.ts` and `(app)/letters/compose.tsx`.

---

## ADR-003: Deterministic Policy Engine vs. Heuristic AI Moderation
- **Context**: Moderating age restrictions, quotas, and consent cannot rely on probabilistic AI or LLMs due to non-deterministic edge cases and latency.
- **Decision**: Use a pure, deterministic TypeScript policy engine (`src/domain/policy/engine.ts`) with strict precedence levels (P0 Legal -> P1 Safety -> P2 Consent -> P3 Quotas).
- **Status**: Implemented & Verified with 100% passing unit tests.

---

## ADR-004: Local-First Storage vs. Real-Time Cloud Databases
- **Context**: Health data is sensitive and subject to stringent global regulations (GDPR, HIPAA, DPDP Act).
- **Decision**: All personal check-ins, cycles, workouts, and journals are stored locally in MMKV key-value partitions with user-initiated JSON export and purge capabilities. Supabase is utilized only for pseudonymous asynchronous letter transit and authentication tokens.
- **Status**: Implemented & Verified.

---

## ADR-005: v3 catalog only; objective-specific verification (2026-10-23)
- **Decision**: `thrivefold_real_game_catalog_v3.json` is the only quest/level source. A quest is assigned only if its `objective.type` has a registered evaluator (`src/domain/game/objectives.ts`); knowledge assessments (server-held answer keys), camera, AI-provider, scorecard and private-record objectives are not assigned until those runtimes exist.
- **Status**: Implemented, tested (`game-catalog.test.ts`).

## GAME-LEVEL-GATE: task minimumLevel orders the curriculum
- **Context**: The catalog puts basic movement (151+), sleep (101+) and nutrition (251+) in later chapters, and advancing past level 50 needs a chapter capstone that does not exist yet. Treating `minimumLevel` as a hard gate would give new users only five planning tasks.
- **Decision**: `maximumLevel` still retires tasks; `minimumLevel` is used for ordering: each day has one quest from the current chapter and the rest spread across families (Movement, Mind, Rhythm, Nutrition, Growth). Sensitive, age-gated, unreleased and zero-reward tasks are never auto-assigned.

## ECON-001: Diamonds and unlocks
- **Context**: v3 defines task points, XP and levels but no diamond amounts.
- **Decision**: `src/content/game/progression_economy.v1.json`: 5 diamonds per level cleared, 15 every tenth level, 50 at a chapter checkpoint level, 2 per daily goal. Unlocks: fourth daily quest (30, level 3), nature emblems (15, level 2), milestone emblems (40, level 6). Earned only; no purchase path (REQ-014). Health, safety and privacy features are never locked.
- **Server**: migration 5 is generated from the catalog and this file (`scripts/build-progression-migration.mjs`); the server reads rewards from its own tables, never from the client.
