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
