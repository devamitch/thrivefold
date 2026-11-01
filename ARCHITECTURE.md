# Architecture overview

This is a short map of the current app. Source code and `AGENTS.md` define the implementation
rules; see `docs/PRODUCT_COMPLETION_PLAN.md` and `docs/REQUIREMENTS_STATUS.md` for current status.

## App layers

- **App shell and navigation:** Expo Router routes under `src/app/`; shared navigation and UI live
  under `src/components/`.
- **State:** one Zustand store, `useRootStore`, composed from slices in `src/stores/slices/`.
- **Persistence:** the store uses MMKV through `src/stores/persistStorage.ts`; encryption depends on
  secure key storage being available. See `DATA_PRIVACY.md` for the fallback behavior.
- **Domain rules:** pure calculations and policy decisions live under `src/domain/`.
- **Local data:** app state is local-first. SQLite supports AI memory, retrieval, analytics, and
  queued work in their respective service modules.
- **Network:** server reads and writes use the shared TanStack Query client and service modules.
- **Native features:** Expo config plugins and custom modules live in `modules/`; generated
  `android/` and `ios/` directories are not edited directly.

## Current boundaries

- Core check-ins, routines, journaling, and cycle tracking do not require an account or network.
- Profile and progress sync are account features; weekly summary sharing is separately controlled.
- Social routes remain gated until age assurance, consent, and server safeguards are available.
- The AnvayKosh shared identity, vault, connect, and sync services are not live in Thrivefold.
- Read [AI system map](AI_SYSTEM.md) for the assistant, local AI, and retrieval entry points.
