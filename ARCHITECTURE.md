# Thrivefold Technical Architecture

## 1. System Overview & Technology Stack

Thrivefold is built on an enterprise-grade, local-first React Native architecture utilizing the Expo managed workflow with modern native plugins:

```
+-------------------------------------------------------------------------+
|                           Mobile App (Client)                           |
|                                                                         |
|  +---------------------+  +---------------------+  +-----------------+  |
|  | Expo Router v55     |  | Zustand App Stores  |  | Design System   |  |
|  | (File-based routes) |  | (MMKV Persistence)  |  | (Setu & Blink)  |  |
|  +----------+----------+  +----------+----------+  +--------+--------+  |
|             |                        |                      |           |
|  +----------v------------------------v----------------------v--------+  |
|  |                       Core Domain Engine                          |  |
|  |  +---------------------+  +-----------------+  +---------------+  |  |
|  |  | Policy Engine       |  | Chip Catalog    |  | Letter Math   |  |  |
|  |  | (Deterministic RFC) |  | & Moderation    |  | & Transit     |  |  |
|  |  +---------------------+  +-----------------+  +---------------+  |  |
|  +-----------------------------------+-------------------------------+  |
|                                      |                                  |
|  +-----------------------------------v-------------------------------+  |
|  |                   Local AI & Offline Intelligence                 |  |
|  |  +---------------------+  +-----------------+  +---------------+  |  |
|  |  | Rule-based Expert   |  | Local Classifier|  | Sovereign     |  |  |
|  |  | Systems             |  | & Sentiment     |  | Memory Vault  |  |  |
|  |  +---------------------+  +-----------------+  +---------------+  |  |
+--------------------------------------|----------------------------------+
                                       | TLS 1.3 / Anonymized Proxy
                                       v
+-------------------------------------------------------------------------+
|                  Serverless Cloud Layer (Optional Sync)                 |
|                                                                         |
|  +-----------------------------+     +-------------------------------+  |
|  | Supabase PostgreSQL 16      |     | Server Cloud AI Proxy         |  |
|  | - Deny-by-default RLS       |     | - Free Gemini API Gateway     |  |
|  | - Anonymous Social Profiles |     | - Zero API Keys in Client     |  |
|  | - Letter Dispatch Queue     |     | - Daily Cost Quotas           |  |
|  +-----------------------------+     +-------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 2. Component Layers

### A. Routing & Navigation (`src/app/`)
Uses Expo Router file-based system:
- `(onboarding)`: Progressive discovery and experience selection (`women_health`, `men_health`, `pride_wellbeing`).
- `(app)/(tabs)`: Bottom tab bar navigation for Home, Today, Progress, Learn, and Settings.
- `(app)/letters`: Mailbox, stamp collection, and the structured chip composer.
- `(app)/social`: Curated introduction discovery matching consented cohorts.
- `(app)/circles`: Private, segmented affinity circles.
- `(app)/safety`: Panic button, emergency hotlines, and instant blocking.

### B. State Management (`src/stores/`)
- Powered by **Zustand** with synchronous, zero-lag **MMKV** storage persistence.
- Decoupled into specialized slices:
  - `useAppStore`: Theme mode, active experience, notifications, and language.
  - `useAuthStore`: Anonymous session, token state, age assurance status.
  - `useHealthStore`: Daily metrics, cycle tracking, strength logging, and streak counts.
  - `useLetterStore`: Sent letters, received letters, stamps, and pen-pal connections.
  - `usePolicyStore`: Active feature grants, consent audit trail, and quota counters.

### C. UI & Design System (`src/theme/`, `src/components/ui/`)
- Dynamic theme switching between three palettes:
  - `women_health`
  - `men_health`
  - `pride_wellbeing`
- Continuous curved squircles matching Apple Design guidelines via custom canvas or border radiuses.
- Reusable primitives: `ScreenWrapper`, `Card`, `Button`, `Chip`, `Badge`, `Header`.

### D. Security & Row Level Security (RLS)
- Supabase SQL schema enforces PostgreSQL RLS across all tables:
  - Users can only read their own profile and private memory logs.
  - Letters are only readable by sender and recipient once transit time has elapsed.
  - Blocked users cannot query each other's pseudonym or trigger letter delivery.
