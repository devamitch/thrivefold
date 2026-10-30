# Thrivefold — Agent Contract

> **Think first.** Understand what the owner actually wants (read for meaning; messages are quick
> and repeated), plan before the first command, and use your full judgement — tests and lint are
> tools, not the goal; never play dumb or hide behind a rule. Only the hard safety rules never bend.
> Details: `../../Docs/PRODUCTION_DELIVERY_PLAYBOOK.md` §0.

> **Start here (every agent, every session):** read `../../Docs/PRODUCTION_DELIVERY_PLAYBOOK.md`
> (strict operating rules, truth rules, design and functionality standards, bug finding, release),
> then `docs/REQUIREMENTS_STATUS.md` (live status — update it with evidence) and
> `docs/PRODUCT_COMPLETION_PLAN.md`. Skill: `.agents/skills/production-delivery`.
> Never claim anything you did not observe on a phone or in command output.

Single source of truth for every AI coding tool and contributor (Claude, Antigravity/Gemini,
Codex, Copilot, Cursor). Tool files (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`)
only point here. Skills with step-by-step methods live in `.agents/skills/*/SKILL.md`
(`.claude/skills` is a symlink to the same folder).

## 1. Product in one paragraph

Thrivefold is an Expo (SDK 55) React Native, Android-first, local-first health and wellbeing
app with three self-selected experiences (women's health, men's health, LGBTQ+ wellbeing).
Daily check-ins, cycle tracking, journaling, gentle routines and deterministic on-device
suggestions work without any account or cloud. Social features (slow chip-only letters,
private communities) are gated behind real age assurance, consent and a server that is not
live yet. It is not a medical device and never diagnoses.

## 2. Hard rules

1. **pnpm only. Keep dependencies current and working.** Upgrade with `pnpm exec expo install --fix`
   (or `expo install <pkg>`) so native packages stay on the versions the Expo SDK supports
   (Reanimated, Worklets, Gesture Handler, Screens). Going past the SDK's versions is allowed when
   a fix needs it: rebuild, run every command in §4, and check the app on a device before committing.
2. **Real data only.** No seeded records, fake people, `Math.random()` metrics, simulated
   success, or buttons that do nothing. Empty state or honest "not available yet" instead.
3. **No payments** in this release (REQ-014): no SDKs, plans, prices, credits or upsell copy.
4. **Never infer or act on sensitive traits** (religion, orientation, ethnicity, caste,
   diagnoses). Stated religion never changes eligibility. Unreviewed cohort pathways stay off.
5. **Age verification is never self-set.** Self-declaration ≠ verification (client + DB trigger).
6. **Design system only:** theme tokens (`src/theme`), Geist type tokens, Ionicons, shared
   components. No raw hex in screens, no emoji in UI, no decorative logos inside screens.
7. **One store:** `useRootStore` composed of slices in `src/stores/slices`, persisted to MMKV.
   Use selectors or `useShallow`; never call the store without a selector.
8. **Commits:** `type(scope): summary` (≤72 chars), feature-sized. **Stage only the paths you
   changed — never `git add -A`/`git add .`** (other agents work here in parallel). Never push.
9. Don't edit `android/`/`ios/` (generated). Change `app.json`/plugins, then `expo prebuild`.
10. Report honestly: PASS / FAIL / BLOCKED / NOT TESTED, with the command or screenshot.

## 3. Map

| Area                 | Path                                                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routes (Expo Router) | `src/app/` — `(auth)/sign-in`, `(onboarding)/*` (4 steps + optional prefs), `(app)/(tabs)` Home · Today · [Thrive orb → check-in] · Progress · You, pushed screens under `(app)/` |
| Root resolver        | `src/app/index.tsx` (signed out → sign-in, not onboarded → resume step, else home)                                                                                                |
| Store                | `src/stores/useRootStore.ts`, slices in `src/stores/slices/`, MMKV in `persistStorage.ts`                                                                                         |
| Theme                | `src/theme/colors.ts` (palette recipe), `typography.ts` (Geist), `tokens.ts`, `useTheme.ts`                                                                                       |
| Components           | `src/components/ui/*`, dock `navigation/CustomTabBar.tsx`, onboarding `onboarding/OnboardingScaffold.tsx`                                                                         |
| Policy engine        | `src/domain/policy/engine.ts`, `ageAssurance.ts` (pure, tested)                                                                                                                   |
| Privacy              | `src/services/privacy/localData.ts` (export / erase)                                                                                                                              |
| Backend              | `supabase/migrations/*` (not deployed; needs its own project)                                                                                                                     |
| Dev tools            | `src/app/(app)/dev.tsx` (development builds only; linked from You)                                                                                                                |

## 5. Definition of done

Behaviour seen working on an emulator or device (release build for startup/splash), all
commands above pass, traceability updated, and the summary separates verified from not.

## 6. AnvayKosh (अन्वयकोश) ecosystem

Thrivefold belongs to **AnvayKosh** (Thrivefold, Neev, HarmonyBloom, BlinkQuest, Setu).
Surfaces: **Anvay ID** (one sign-in), **Anvay Vault** (encrypted user-controlled profile),
**Anvay Connect** (authorised app-to-app exchange), **Anvay Sync** (offline-first merge).

**Current state:** none of them is live in Thrivefold. The old "Unified Vault SOS" deep-link handoff
was removed because it put user data in URLs and trusted any caller. `src/app/+native-intent.tsx`
sends old `unified-vault`, `auth/callback` and `sso` links to Home unread. Do not restore it.

Rules for any new ecosystem code:

1. OAuth 2.1 authorization code + PKCE via the system browser and verified App Links. Validate
   issuer, audience, state, nonce, expiry. One-time codes only in URLs.
2. Never put profile/health data, tokens or keys in a URL, QR, push, log or analytics event.
3. Server-side app registry (package name + signing-cert SHA-256 per environment); fail closed.
4. Per-category consent with expiry and revoke; authentication grants no data access.
5. Merges are non-destructive: fill empty fields only, keep provenance, never overwrite.
6. Setu is not required; each app works alone.
7. Never bypass the device or app lock because a deep link arrived.
8. No secrets in the client: service keys only in Supabase Edge Function secrets;
   `EXPO_PUBLIC_*` is public. Never print `.env*` values.
9. Android 11+ `<queries>` for peer packages only when a real feature needs them.
10. Use the AnvayKosh icon from `assets/brand/anvaykosh-icon.svg` / `AnvayKoshIcon` (no background).

## Engineering standards (all agents, all features)

1. **Network data goes through TanStack Query.** Every server or public-API read uses
   `useQuery` / `useMutation` with the app's single `queryClient` (`src/services/supabase/queryClient.ts`,
   persisted, `networkMode: 'offlineFirst'`, backoff retries). Put the fetch function in a service
   file and a typed hook next to it (`useXxxQuery`), with stable query keys
   (`['library', topic]`). No ad-hoc `fetch` + `useState(loading)` in screens.
2. **Reuse before you write.** Use the shared components in `src/components/ui`
   (`ScreenContainer`, `AppHeader`, `Card`, `Chip`, `Button`, `TextField`, `PressableScale`,
   `AppBottomSheetModal`, `CustomAlert` via `showAlert`, `ImageViewer`, `SettingsRow`, `Toggle`,
   `Badge`) and the root providers (`useCoach`, the voice service, the chat store). A second
   component that does the same job as an existing one is a bug.
3. **Lists:** FlashList for anything that can grow; page from SQLite instead of loading all rows.
4. **States:** every screen handles loading, empty, error and offline with real copy; no inert
   buttons, no fake data.
5. **Theme:** tokens only (no raw hex in screens), light and dark checked, contrast checked.
6. **Production ready means:** compile, lint, tests and a release build pass, the feature was used
   on a real Android phone, and logcat showed no `FATAL` or `ReactNativeJS` errors.
