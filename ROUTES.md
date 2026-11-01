# Route map

Expo Router builds routes from `src/app/`. That directory is the source of truth; this page lists
the main route groups and does not imply that every nested screen is production-ready.

| Route area | Path | Purpose |
| --- | --- | --- |
| Public entry | `src/app/index.tsx`, `(auth)/`, `(public)/` | Resolve app state, sign in, and show public legal pages. |
| Onboarding | `(onboarding)/` | Choose an experience and set up optional preferences. |
| Main tabs | `(app)/(tabs)/` | Home, Today, Progress, and You; the center Thrive control opens check-in/assistant actions. |
| Health and routines | `(app)/health/`, `(app)/check-in/`, `(app)/calendar/`, `(app)/train/` | Personal wellbeing, tracking, and activity flows. |
| Assistant and AI | `(app)/ai/`, `(app)/assist/` | Coach, local model, retrieval, and assistant experiences. |
| Other app areas | `(app)/journal/`, `quests/`, `games/`, `settings/`, `you/`, `safety/` | Personal records, progress, preferences, and support. |
| Gated social areas | `(app)/letters/`, `dating/`, `circles/`, `organizations/`, `social/` | Routes exist in code; availability depends on policy and server safeguards. |
| Experimental features | `(app)/beta-lab/` | Beta surfaces subject to their own access gates. |

The route guard and behavior live in each group layout and screen. Do not infer access from a route
existing. Review `src/app/(app)/_layout.tsx`, the route's `_layout.tsx`, and the policy engine
before changing a gate. Use `rg --files src/app` for the current complete file list.
