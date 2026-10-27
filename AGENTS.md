# Thrivefold — Agent Contract

Single source of truth for every AI coding tool and contributor (Claude, Antigravity/Gemini,
Codex, Copilot, Cursor). Tool files (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`)
only point here. Skills with step-by-step methods live in `.agents/skills/*/SKILL.md`
(`.claude/skills` is a symlink to the same folder).

Authoritative product spec: `../../thrivefold_ultimate_master_build_prompt_v2.md`.

## 1. Product in one paragraph

Thrivefold is an Expo (SDK 55) React Native, Android-first, local-first health and wellbeing
app with three self-selected experiences (women's health, men's health, LGBTQ+ wellbeing).
Daily check-ins, cycle tracking, journaling, gentle routines and deterministic on-device
suggestions work without any account or cloud. Social features (slow chip-only letters,
private communities) are gated behind real age assurance, consent and a server that is not
live yet. It is not a medical device and never diagnoses.

## 2. Hard rules

1. **pnpm only.** Keep `react-native-worklets` at 0.7.4. Don't upgrade packages without evidence.
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

## 4. Commands

```sh
pnpm compile      # strict tsc
pnpm lint         # eslint (expo config)
pnpm test         # jest unit tests
pnpm test:db      # migrations + RLS checks on real Postgres (PGlite)
CI=1 pnpm dlx expo-doctor
CI=1 pnpm exec expo prebuild --platform android --no-install   # after app.json/asset/font changes
cd android && ./gradlew --no-daemon :app:assembleRelease -PreactNativeArchitectures=arm64-v8a
```

## 5. Definition of done

Behaviour seen working on an emulator or device (release build for startup/splash), all
commands above pass, traceability updated, and the summary separates verified from not.

## 6. AnvayKosh (अन्वयकोश) Ecosystem Contract

Thrivefold is a member of the **AnvayKosh** private multi-app ecosystem.
All agents working on this codebase must adhere to the following ecosystem rules:

1. **Brand Architecture**:
   - **AnvayKosh**: The master unified ecosystem.
   - **Anvay ID**: Federated 1-tap single sign-on across member apps (`thrivefold`, `neev`, `harmonybloom`, `blinkquest`, `setu`).
   - **Anvay Vault**: Encrypted personal profile (identity, locations, preferences, routine, health, cycle, and arcade progression).
   - **Anvay Connect**: Authorized cross-app peer-to-peer protocol via deep links (`thrivefold://unified-vault` and `thrivefold://auth/callback`).
   - **Anvay Sync**: Offline-first, non-destructive synchronization with nullish coalescing.
2. **Decentralized Peer-to-Peer Mesh**:
   - Setu is NOT a mandatory installation requirement.
   - If Setu is installed, it acts as the primary master vault.
   - If Setu is NOT installed, any installed sibling app (`Thrivefold`, `HarmonyBloom`, `Neev`, or `BlinkQuest`) acts as the Anvay Vault Provider.
   - If no sibling app is installed, sync falls back to the Supabase Cloud Vault when online.
3. **Non-Destructive Coalescing**:
   - Never wipe or overwrite populated user fields.
   - When merging incoming data, use nullish coalescing (`coalesce`) to fill empty/null values while preserving existing user data.
4. **Zero Secret Exposure**:
   - Never hardcode secrets, tokens, or private keys in source code or `eas.json`.
   - All credentials must reside in gitignored `.env` and be managed through `eas env:push`.
5. **Android Queries Compliance**:
   - Android 11+ `<queries>` in `AndroidManifest.xml` must declare peer packages: `com.amit.setu`, `com.amit.neev`, `com.amit.harmonybloom`, `com.amit.blinkquest`.
