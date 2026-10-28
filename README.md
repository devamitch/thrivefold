# Thrivefold

> **Local-first, on-device AI wellbeing & intentional slow correspondence mobile platform for iOS, Android, and Web.**

Inspired by the serene minimalism of **Setu** and the sensory feedback mechanics of **BlinkQuest**, Thrivefold unites personal physical/mental health tracking with an asynchronous, chip-only postal letter exchange.

---

## Highlights

- **Three Dedicated Health Spaces**:
  - 🌸 **Women's Health**: Menstrual cycle tracking, luteal/follicular nutrition, hormonal wellness.
  - 🌿 **Men's Health**: Stamina, mental resilience, workout telemetry, recovery habits.
  - 💜 **Pride & LGBTQ+ Wellbeing**: Gender-affirming health milestones, identity-safe reflections.
- **Sovereign Local AI First**:
  - Deterministic phase-based expert systems and on-device sentiment classification.
  - Zero cloud reliance for daily check-ins, journal reflections, and health scoring.
  - Optional multi-provider cloud AI proxy (Gemini) with zero keys shipped to client bundles.
- **Slow Correspondence (Pen-Pal Letters)**:
  - Curated **card-only composer** (strictly no arbitrary freeform text entry; no spam or harassment).
  - Distance-delayed transit times (4 to 72 hours) calculated by regional geography.
  - Collectible aesthetic digital stamps.
- **Hardened Deterministic Policy Engine**:
  - Strict 18+ adult age assurance gate for social features.
  - 7-day under-25 pilot trial with daily 1-intro quota and complete community isolation.
  - Deny-by-default PostgreSQL Row Level Security (RLS) on all Supabase tables.

---

## AnvayKosh (अन्वयकोश) ecosystem

<div align="center">
  <img src="assets/brand/anvaykosh-icon.svg" width="96" height="96" alt="AnvayKosh icon" />
</div>

Thrivefold is one of the **AnvayKosh** apps (Thrivefold, Neev, HarmonyBloom, BlinkQuest, Setu).

| Surface | Meaning | Status in Thrivefold |
| --- | --- | --- |
| **AnvayKosh** | The shared ecosystem of these apps | Brand only |
| **Anvay ID** | One sign-in across the apps | **Not available.** No button is shown. |
| **Anvay Vault** | A user-controlled, encrypted shared profile | **Not available.** Thrivefold's data stays on this phone. |
| **Anvay Connect** | Authorised data exchange between registered apps | **Disabled.** See below. |

**Why it is off.** The first version ("Unified Vault SOS") passed profile and health data inside
deep-link URLs and trusted any caller: any app or web page could open
`thrivefold://unified-vault?callback_url=…` and receive the user's data, or overwrite it with a
crafted `…/callback?payload=…`. That code was removed. Old links are caught by
`src/app/+native-intent.tsx` and open Home without being read.

**Rules for the next version** (also in `AGENTS.md`):
- Sign-in uses OAuth 2.1 authorization code + PKCE through the system browser, returning on a
  verified Android App Link; issuer, audience, state, nonce and expiry are checked.
- No profile, health data, tokens or keys in any URL, QR code, push or log.
- A server-side registry lists approved apps by package name and signing-certificate SHA-256;
  unknown or revoked apps fail closed.
- Sharing is per data category, with consent, expiry and revoke; signing in grants nothing.
- Merges fill empty fields only, never overwrite user values, and keep provenance.
- A deep link never bypasses the device or app lock.
- Server keys live only in Supabase Edge Function secrets; `EXPO_PUBLIC_*` values are public.

The icon is `assets/brand/anvaykosh-icon.svg` (no background, viewBox cropped to the mark) and
`src/components/brand/AnvayKoshIcon.tsx` in code. The name is a working name; it has not been
trademark-cleared.

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10+
- Expo CLI (`npx expo`)

### Development Commands
```bash
# Install dependencies
pnpm install

# Run Jest unit test suite
pnpm test

# Start the Expo development server
pnpm start

# Run on iOS simulator
pnpm ios

# Run on Android emulator
pnpm android

# Run on Web
pnpm web
```

---

## Documentation Roadmap

- [PRODUCT_MASTER.md](file:///Volumes/Amit/Projects/Apps/thrivefold/PRODUCT_MASTER.md): Full product specification, UX pillars, and feature catalog.
- [ARCHITECTURE.md](file:///Volumes/Amit/Projects/Apps/thrivefold/ARCHITECTURE.md): Technical architecture, layer diagrams, and state management.
- [ROUTES.md](file:///Volumes/Amit/Projects/Apps/thrivefold/ROUTES.md): Complete Expo Router directory mapping and guard criteria.
- [DATA_PRIVACY.md](file:///Volumes/Amit/Projects/Apps/thrivefold/DATA_PRIVACY.md): Local encrypted vault design and zero-knowledge storage.
- [AI_SYSTEM.md](file:///Volumes/Amit/Projects/Apps/thrivefold/AI_SYSTEM.md): Local deterministic rules and consent-gated cloud gateway.
- [CORRESPONDENCE.md](file:///Volumes/Amit/Projects/Apps/thrivefold/CORRESPONDENCE.md): Distance delay formulas, stamp catalogs, and chip composer.
- [COMMUNITIES_AND_ORGS.md](file:///Volumes/Amit/Projects/Apps/thrivefold/COMMUNITIES_AND_ORGS.md): Segmented affinity circles and B2B verification portals.
- [PAYMENTS_AND_COSTS.md](file:///Volumes/Amit/Projects/Apps/thrivefold/PAYMENTS_AND_COSTS.md): $0 lifetime free tier and cost projections.
- [SECURITY_TEST_PLAN.md](file:///Volumes/Amit/Projects/Apps/thrivefold/SECURITY_TEST_PLAN.md): Threat modeling, penetration testing, and RLS policies.
- [DECISIONS_AND_CONFLICTS.md](file:///Volumes/Amit/Projects/Apps/thrivefold/docs/requirements/DECISIONS_AND_CONFLICTS.md): Architectural Decision Records.
- [FOUNDER_POLICY_REQUESTS.md](file:///Volumes/Amit/Projects/Apps/thrivefold/docs/requirements/FOUNDER_POLICY_REQUESTS.md): Sensitive policy governance status ledger.

---

## 🛡️ AnvayKosh (अन्वयकोश) Ecosystem Integration

<p align="center">
  <img src="assets/brand/anvaykosh-icon.svg" width="96" height="96" alt="AnvayKosh Ecosystem Icon" />
</p>

Thrivefold is a member application in the **AnvayKosh** private multi-app ecosystem:

- **Anvay ID**: 1-tap single sign-on powered by federated peer discovery. If Setu is present, it acts as the master vault. If not, Thrivefold or sibling apps (`Neev`, `HarmonyBloom`, `BlinkQuest`) serve as the Anvay Vault Provider.
- **Anvay Vault**: Encrypted personal profile storing user demographics, daily health scores, cycle records, workout habits, and non-destructive coalesced preferences.
- **Anvay Connect**: Peer-to-peer deep-link channel (`thrivefold://unified-vault`) with package validation and state-nonce tamper verification.
- **Anvay Sync**: Offline-first synchronization with non-destructive nullish merge (`coalesce`) and secure Supabase cloud reconciliation.
