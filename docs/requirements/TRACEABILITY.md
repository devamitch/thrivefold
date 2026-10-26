# Requirements Traceability Matrix

## Update — 2026-10-26 (20): Clear Cues Engine, Smart Moments Aggregations, Analytics Telemetry

Checks: compile 0, lint 0, `pnpm test` 268/268 (+10 new tests passed), `pnpm test:db` 145/145.
Release APK built in 2m 19s and installed on physical device Moto G71 (`ZD2225KYKD`).

| Item | Status | Where | Commit |
| --- | --- | --- | --- |
| Clear Cues Engine | Deterministic, prioritized, debounced cue dispatcher (`SAFETY > FRAMING > FORM_FAULT > TRANSITION > RHYTHM_COUNT > ENCOURAGEMENT`), suppression of contradictory cues, 1.5s speech spacing to prevent audio collisions, body-neutral language | `src/domain/coach/cuesEngine.ts` | (this round) |
| Smart Moments Aggregations | SQLite-backed Moments Engine (`thrivefold-moments.db` with WAL mode) capturing app sessions, coach workouts, quests, check-ins, AI tasks; calculates rolling daily summaries and coach performance statistics (FPS, p50/p95 latency) with 60-day auto-pruning | `src/services/telemetry/smartAggregations.ts` | (this round) |
| Analytics Telemetry Hardening | Removed all `Math.random()` occurrences in telemetry per AGENTS.md Hard Rule 2; replaced with monotonic sequence generator; routed moments to smart aggregations | `src/services/telemetry/analyticsService.ts` | (this round) |
| Virtual Coach Integration | Routed framing cues, form fault fixes, and rep cadence in `usePoseTracking.ts` through `cuesEngine`; tracked completed coach sessions in `useCoachSession.ts` | `src/components/coach/*` | (this round) |

## Update — 2026-10-26 (19): Local AI runtime, Analytical Memory, Hybrid RAG, Coach camera fix

Checks: compile 0, lint 0, `pnpm test` 258/258 (+26 tests passed), `pnpm test:db` 145/145.
Gradle: `:local-ai:compileDebugKotlin` passed.

| Item | Status | Where | Commit |
| --- | --- | --- | --- |
| Local AI native module | Kotlin Expo Module wrapping Llamatik 0.12.0 (`llama.cpp` ARM NEON), memory headroom guard, thread serialization, streaming, GGUF catalog | `modules/local-ai/*` | 16196e4 |
| Analytical vector memory | SQLite store (`thrivefold-local-memory.db`), 384d cosine similarity, deduplication, user isolation, GDPR/DPDP export/erase | `services/local-ai/memory/*` | 16196e4 |
| Hybrid RAG pipeline | Dense vector + BM25 sparse fusion (RRF), catalog & note retrieval, evidence citations, hallucination safeguards | `services/local-ai/rag/*` | (this round) |
| Authoritative Infrastructure Map | Published canonical boundaries across SQLite, Supabase, TanStack Query, Zustand, Firebase & Local AI | `docs/architecture/*` | (this round) |
| Coach camera memory churn & phone heat | Eliminated 30 bitmap allocations/s by recycling intermediate unrotated camera bitmaps immediately (`bitmap.recycle()`) | `modules/pose-landmarker/android/*` | (this round) |
| Backup cleanup | Relocated stray source tree backups to `.local-backups/` and updated `.gitignore` | `.gitignore`, `.local-backups/` | (this round) |

## Update — 2026-10-26 (18): groups, AI companion, social gate, coach tracking

Checks: compile 0, lint 0, `pnpm test` 232/232, `pnpm test:db` 145/145. Migrations 14 and 15
pushed live; `ai-chat` function deployed with provider keys as function secrets (never in the app;
local copy in git-ignored `supabase/functions/.env`).

| Item | Status |
| --- | --- |
| Therapy / practice groups (spec 9.3-9.5) | group page: kind (peer / professional / practice) and rules shown before joining; open or approval joining; card chat with reactions, reports (3 hide for review), moderator hide; facilitator notes (no links/handles/phone numbers); sessions with RSVPs; roles owner/admin/moderator/facilitator/member with ranked server checks; remove (no rejoin) |
| AI support (spec: optional, consent, cost-capped, server keys) | Ask Thrive chat; consent screen first; only typed text sent; Gemini then Groq then OpenRouter; 40 requests/person/day counted server-side; no content stored; toggle in Privacy. Providers checked with curl: Groq and OpenRouter answer; Gemini key valid but its model was overloaded at the time (falls back) |
| Letters/dating opened to Home silently | gate screen with the missing steps |
| Coach tracking | One Euro filter + display-time prediction; luminous skeleton with angle arc |
| Not used | Apollo, Snov, Instantly, Enrich, EXA (sales/search tools, not app features); ElevenLabs, Deepgram, Cohere, Voyage, Mem0 stored as secrets for later (voice needs an audio module and rebuild) |
| NOT TESTED on device | all of the above (phone disconnected); groups/dating need verified level-gated accounts |

## Update — 2026-10-26 (17): dating finished (preferences, ranking, report)

Checks: compile 0, lint 0, `pnpm test` 232/232, `pnpm test:db` 132/132 (+9 dating checks).
Migration 13 pushed live (additive).

| Item | Status |
| --- | --- |
| Matching preferences (spec 23.4, 26.7) | self-described age band, ages wanted (mutual), languages, looking for, pace; saved through a server function |
| Ranked matches | candidates filtered by mutual gender and age preferences, ordered by shared interests, languages, intention and pace; the card shows "In common" |
| Report from a chat | fixed reasons; the chip messages go as evidence; blocks and ends the conversation; 10 reports/day limit |
| Chat options bug | the old dialog ended the conversation when you dismissed it; now a sheet with End (confirmed), Report, Block (confirmed) |
| NOT TESTED on screen | needs two signed-in, age-verified, level-20 accounts |

## Update — 2026-10-26 (16): Coach full screen, every exercise counted, framing guidance

Checks: compile 0, lint 0, `pnpm test` 232/232.
Release build installed on the Moto G71.

| Item | Status |
| --- | --- |
| Only ~27 of 56 exercises counted | every catalogue exercise now maps to a camera movement (test asserts none missing). New detectors: torso rotation (shoulder depth turn, either side = 1 rep), hip hinge, arm bend, pull-apart, cat-cow (head lift), leg lift, knee bend, arm reach, steps, stretch / floor / arms-out holds |
| Seated thoracic rotation never counted | it had no movement; now counted by the torso-turn swing counter (unit test: one turn each side = 2 reps, wobble = 0) |
| Timed exercises (jumping jacks 30 s) needed 30 reps | timed sets count seconds spent moving |
| Coach never said where to move | debounced framing cue: step into view, move left/right (mirror-aware), step back for feet/head, come closer; shown as a banner and spoken at most every 6 s |
| Coach looked bad | full-screen camera with the skeleton, tutorial as picture-in-picture (expand / play), translucent top and bottom controls, big counter, Set done button |
| Skeleton style | side-coloured glow with white limbs, small joints, neck line instead of a head ring. Fixed: limb paths never updated (derived values read shared values inside a helper) — seen on the phone |
| Skeleton behind the body | native sends real capture time; overlay predicts to the frame on screen (capped 90 ms). Camera asks for 24-30 fps (log: `fps=[24, 30]`). Pose stays ~10 results/s: CPU inference on the G71 is the limit |
| Countdown / rest looked bad | 3-2-1 is a glass disc with a filling ring over the live camera (no blackout); rest is a glass sheet with a ring, next move and its cue, +15 s and I'm ready |
| Coach felt robotic | voice names the move, set and key cue before counting in, praises clean reps, says halfway / last ones, tells you how the set went, gives a tip mid-rest, nudges after 12 s idle (`coachVoice.ts`, tested) |
| Phone heating | during rests the camera analyses ~4 frames/s instead of ~10 (`minIntervalMs`) |
| NOT TESTED by a person | rep counting of the new detectors on a real body; alignment while moving; the glass layout on the phone (phone locked before the screenshot) |

## Update — 2026-10-26 (15): measured on the owner's Moto G71, Gate B, export, deletion

Checks: compile 0, lint 0, `pnpm test` 223/223, `pnpm test:db` 123/123. Release builds installed on
the Moto G71 (re-signed with the project debug key so they install over the existing app and keep its
data). The phone had been running a debug build, which on its own makes the whole app feel slow.

| Item | Measured / status | Commit |
| --- | --- | --- |
| Home scroll lag | native squircle "glass" redrew every card every frame: median 89 ms, 76% janky -> plain rounded views 7% janky, 1 slow draw command | c7a8c60 |
| Coach froze on "Allow camera and start" | models loaded on the main thread -> background load, preview binds at once, onPoseReady | 4f08b93 |
| Skeleton missing / misaligned | GPU delegate returned no body -> CPU; prediction overshoot -> 40-80 ms lead; aligned on device (screenshot) | 4f08b93 |
| Coach CPU when idle | main thread 54% -> <3%, GC 27% -> ~0 (frame skip before conversion, flat arrays, sleeping frame callback, SurfaceView) | 4f08b93 |
| Face, eyes, hands landmarks | face (eyes, irises, brows, lips, outline) and 2 hands, opt-in, interleaved | c7a8c60 |
| Splash late / glitching | fades after first screen mounts, 3 s cap | c7a8c60 |
| Gate B religion/culture/worldview | taxonomy, aliases, search, ideology separate, self-described, prefer-not-to-say, local only, tests | 7884e6d |
| Excel export | real .xlsx, About sheet + one sheet per category; Android saves via folder picker | 7884e6d |
| Server account deletion | delete-account function deployed; app deletes server then phone | 72b7b63 |
| Last screen restore | never fired before; allowlist, 12 h, on top of Home | 4f08b93 |
| Crashlytics | integrated, opt-out setting, no personal content; `Initializing Firebase Crashlytics 21.0.0` seen in the phone's log | (this round) |
| Pose rate in low light | ~10 results/s, 60-140 ms latency: camera frame rate drops in a dim room | — |

## Update — 2026-10-25 (14): dating (spec §18), letters cleanup

Checks: compile 0, lint 0, `pnpm test` 192/192, `pnpm test:db` 123/123. Migration 12 pushed live.
Not seen on screen: dating screens (need a signed-in, age-verified, level-20 account).

| Item | Status | Commit |
| --- | --- | --- |
| Dating: profiles, compatibility, women-first first contact, chip-only chat, end/block, limits | implemented server-side + app; DB-tested (+19 checks) | 515d61b |
| Dating safety scope | no photos, contact fields, location, calls or meetups; no religion/identity rule active (18.1) | 515d61b |
| Letter card and settings were fake | server-backed card; only real setting kept | 5e881e2 |
| Remaining for a live dating launch | owner: Veriff keys (age check), store-listing disclosure of the dating feature (spec §13, no concealment) | — |

## Update — 2026-10-25 (13): age assurance live, Terms, social invitation, check-in crash

Checks: compile 0, lint 0, `pnpm test` 192/192, `pnpm test:db` 104/104, `deno test` 4/4.
Supabase: migrations 1-11 live on lymbgfzngpkvcadrkvui; Edge Function `age-check` deployed (401 without
token, 401 with a forged signature, 405 on GET).

| Item | Status | Commit |
| --- | --- | --- |
| Check-in crashed on swipe (transform forEach of null) | fixed, verified on emulator | 0a6d953 |
| Age assurance (REQ-013) | implemented + deployed: provider session, HMAC webhook, server-only verification, 5/day limit, outcome only stored | 4067bc6 |
| Server profile rows were never created | synced after sign-in (pseudonym, experience, letter setting) | 4067bc6 |
| Terms acceptance recorded | versioned locally + `thrivefold_consents` | 4c0920b |
| Social path could only be revealed in dev | opt-in invitation after 2 check-in days, signed-in only | d40f796 |
| Age check needs provider keys | BLOCKED (owner): Veriff account, then `supabase secrets set VERIFF_API_KEY=… VERIFF_SHARED_SECRET=…` and webhook URL `…/functions/v1/age-check/webhook` in Veriff | — |
| Dating pathway, sexual/hookup or meetup features | not built: spec REVIEW_REQUIRED for dating; meetups and sexual services excluded by the spec | — |

## Update — 2026-10-25 (12): every screen visited, themed toggles

Seen on the emulator (debug + Metro, `thrivefold:///route` deep links): Quests, Games, Medications,
Journal, Connected apps, Health, Progress, Roadmap, Patterns, Learn, Personalize, Safety, Exercise
library, Log a workout, Symptoms, Mood, Coach intro and live workspace. No key/LogBox errors on these.

| Item | Status | Commit |
| --- | --- | --- |
| Native Switch rendered Material teal (ignored theme) | one `Toggle` component, used on all 6 screens | efa4ad2 |
| Coach workspace | renders coaching layout, camera stage, big count, fix banner, tutorial; no landmarks without a person (correct). Pose accuracy needs a real phone | — |
| Drawer once seen opening after deep links | not reproduced on retry | — |

## Update — 2026-10-25 (11): pen-pal letters live, overflow pass

Checks: compile 0, lint 0, `pnpm test` 188/188, `pnpm test:db` 94/94. Seen on the emulator: Train,
Check in, Calendar, Nutrition, Sleep, Cycle tab and screen.

| Item | Status | Where | Commit |
| --- | --- | --- | --- |
| Letters used invented data (fixed recipient, fake names and distances, dead Open button) | fixed: Supabase via React Query (inbox, sent, send, read, decline, reply, discover) | `services/supabase/letters.ts`, `letters/*` | e9d7ce2 |
| Server chip catalogue empty in production (every send would fail) | migration 10 seeds the 23 approved chips | `20261025000010_*` | e9d7ce2 |
| Pen-pal discovery read all social profiles | `tf_intro_candidates`: verified adults who accept introductions; caller must be verified | migration 10, `test:db` (+7 checks) | e9d7ce2 |
| Truncated labels (Train tools, Cycle tab buttons); phase shown with no period | fixed | `exercise.tsx`, `SelectedDateOverviewCard`, calendar engine | a7b5e72 |
| Dating pathway | **not built, on purpose**: the spec marks it REVIEW_REQUIRED (legal/platform review), identity rules are founder requests needing review, meetups excluded | `policy/engine.ts` | — |
| Migrations 9 and 10 on the live project | BLOCKED: CLI not logged in/linked here. Owner: `supabase login && supabase link --project-ref lymbgfzngpkvcadrkvui && supabase db push` | — | — |
| Correspondence for real users | BLOCKED: needs an age-assurance provider to set `is_age_verified` (REQ-013) | `navigation/eligibility.ts` | — |
| Coach on a real camera, voice commands | NOT TESTED / not started (emulator camera is a test pattern) | `health/coach/[planId]` | — |

## Update — 2026-10-25 (10): crash, key warnings, sheets, drawer, layout boxes

Checks: compile 0, lint 0, `pnpm test` 188/188. Seen on the Pixel emulator (debug build + Metro):
launch, Home, Cycle tab, Cycle screen, drawer open/close, period sheet.

| Issue | Root cause | Fix | Commit |
| --- | --- | --- | --- |
| App crashed on launch (SIGSEGV in RenderThread) | every rounded SquircleSurface had become a native view (not flattenable); the tree got deep enough to overflow hwui's prepareTree recursion | native squircle only for painted cards radius >= 18; rest are one rounded View | bc1ff4e |
| "Each child in a list should have a unique key" on every screen, dev lag | ScreenWrapper rebuilt children into an array without keys | stable key per child | 9f412fc |
| Pixelated sheet/alert backdrops | Android blur inside a Modal has nothing to blur and renders downsampled | scrim (iOS keeps material blur); iOS-curve open, no overshoot | 2d4e7d7 |
| Sheet actions scroll away | no footer slot | `footer` prop + `SheetFooterRow`, used by date picker, period, event, profile sheets | 2d4e7d7 |
| Chip/toggle flicker on select | SquircleSurface swapped component type when fill toggled | renderer chosen by shape/radius only | 2d4e7d7, bc1ff4e |
| Drawer plain | — | push-aside kept; frosted room (BlurTargetView sibling), accent glow, quick tiles, list fade | e9e2dfe |
| Layout Views turned into SquircleSurface (9a649fb) | sweep | AST codemod back to View (854 tags, 129 files) | 62f3e9e |
| "Average cycle 28 days" with 0 periods | defaults shown as stats | measured values only | 9f412fc |

Rule learned: a `BlurView` must never be inside the `BlurTargetView` it blurs (RenderThread
recursion crash). `FrostedView` blurs on Android only when given a sibling target.

Not done this round: deep-link route sweep for warnings was unreliable (links did not navigate);
remaining backlog (backend, correspondence, Coach, overflow audit of every screen) unchanged.

## Update — 2026-10-25 (9): visual pass on an emulator

Checks: compile 0, lint 0, `pnpm test` 188/188, release build PASS. **Seen on screen** (Pixel 7 Pro
emulator, arm64 release build): intro, sign-in, onboarding (all steps), completion, Home (men's
and women's themes), drawer (both themes), Plan/Cycle tab, Metrics/Progress, You, Sleep,
Personalize, check-in (swipe sets Energy to 9 and the check-in shows on the calendar), Calendar
month and year, Coach intro, camera permission, live workspace, end and summary.

| Bug found on screen | Root cause | Fix | Commit |
| --- | --- | --- | --- |
| Rounded screen corners and black band over status bar | swapped Views took SquircleSurface's 20px default clip | no radius prop: use style radius, else square | 1a3cb60 |
| Link-wrapped rows lost their layout in release | Slot spreads array styles into an object | flattened styles on those children | 1a3cb60 |
| Unticked age checkbox invisible | border removed, no fill | quiet fill; label reworded | 1a3cb60 |
| Year view: gap, ragged dots | horizontal ScrollView grew vertically; dots spread across card | `flexGrow: 0`; compact 7-column block | 3e69619 |
| Coach intro text under status bar | scroll padding only | inset container | 0bddb6d |
| Title Case drawer labels, truncated profile line, ring dot at zero | copy / layout | sentence case, shorter line, no arc at 0 | 54289b7, e1a54e5 |

Not checked on screen: real camera pose (emulator has a test pattern), Google sign-in, Health
Connect, physical-device performance (the emulator renders far slower than a phone).

## Update — 2026-10-25 (8): analytics consent, drawer completed

Checks: compile 0, lint 0, `pnpm test` 188/188. Not seen on device (install blocked by signature).

| Item | Status | Where | Commit |
| --- | --- | --- | --- |
| Firebase Analytics only after opt-in (v4 §4) | implemented | `firebase.json` (auto-collection, ad IDs, ad consent off), `usageAnalytics` gate, switch in Privacy and data | f4c591c |
| Drawer: per-space dark room, drag-driven reveal, clamped spring, a11y | implemented (continued from uncommitted work in tree) | `AppDrawer`, `DrawerSceneWrapper`, `drawerProgress` | 3a13ab3 |
| Decorative glow gradients in drawer | removed | `AppDrawer` | 3a13ab3 |
| Open: `SquircleSurface` default fill changed to transparent by another agent (uncommitted) | not reviewed for app-wide impact | `ui/SquircleSurface.tsx` | — |

## Update — 2026-10-25 (7): Coach workspace, landmark alignment, store performance

Checks: compile 0, lint 0, `pnpm test` 188/188, Android release build PASS (includes another
agent's uncommitted drawer/Home edits present in the tree). Device install BLOCKED: installed
build is signed with the upload key (`INSTALL_FAILED_UPDATE_INCOMPATIBLE`).

| Issue | Root cause | Fix | Commit |
| --- | --- | --- | --- |
| Landmarks drift / wrong scale over camera | preview and analysis used different aspect ratios, so the overlay's cover maths did not match | both use a 4:3 `ResolutionSelector` | 0cb718c |
| Coach looked like a call, not coaching | layout | workspace: header, set progress, camera stage with skeleton, fix banner and big count, tutorial + up next, one Set done | 0cb718c |
| App-wide lag on state changes | every store update stringified the whole state into encrypted MMKV synchronously | writes coalesced (300 ms) and flushed on background; erase cancels pending | 9effa15 |
| Fake rewards on setup complete | `Math.max(setupXp, 165)`, `Math.max(diamonds, 5)` | real values | d29e79e |
| Google Sign-In ERR_MODULE_NOT_FOUND (v4 §5) | Node ESM resolution of extensionless imports; file exists in 16.1.5 | none needed for app: Metro release bundle builds | — |

## Update — 2026-10-25 (6): repair after 47dc0c3 (borders, drawer, Home, coach)

Checks: compile 0, lint 0, `pnpm test` 188/188. `expo config --type prebuild` OK (Firebase
plugins resolve); non-clean `expo prebuild` linked Firebase. Not seen on device.

| Issue | Root cause | Fix | Commit |
| --- | --- | --- | --- |
| Borders on squircles, cards, chips, badges, buttons | 47dc0c3 added 1px hairlines in `theme/squircle.ts` and default strokes | strokes removed at the source; selected chips use solid fill | 9296a8b |
| Drawer tears while dragging | panel and screen had separate animations and widths; radius animated per frame | one shared `drawerProgress`, one width, radius set once | 05f18b6 |
| Home "setup steps left" hidden by `isOnboarded` | cosmetic short-circuit | counts only unanswered, unclaimed sections | e1d6665 |
| Home order unclear | sections appended without hierarchy | today → plan → space → week → devices → tools | e1d6665 |
| Coach not a video call; GPU stalls | split view default; 8 Skia canvases over camera + WebView | restored verified logic; full-bleed call stage + corner window; Skia buttons removed | 3e8fab5 |
| Messy landmarks | face mesh lines and halos on every joint | body bones, small joints, one head ring; halos only on faults | 3e8fab5 |
| Bouncy sheet | spring overshoot | overshoot clamped | ac8dcb3 |
| Duplicate components | `BottomSheetModal`, `Squircle`, `GlassOrbButton` unused | deleted | 3e8fab5 |

## Update — 2026-10-25 (5): calendar views, groups, Home, unified activities

Checks: compile 0, lint 0, `pnpm test` 177/177, `pnpm test:db` 87/87. Not seen on device.
Migration 9 written and tested on PGlite, **not pushed** (CLI not linked here).

| Requirement | Status | Where | Evidence |
| --- | --- | --- | --- |
| Calendar Day/Week/Month/Year/Agenda + 7/30/90-day range | implemented | `(app)/calendar/index.tsx` | tsc; year view 11 ms |
| Phase per date, monthly/weekly repeats, no invented times | fixed | `universalCalendarEngine.ts` | `agenda-sources.test.ts` |
| Personal events on every calendar view; add/edit from calendar | implemented | `useAgendaSources`, `PersonalEventModal` | — |
| Work and travel events | implemented | `PersonalCalendarEvent.category` | — |
| Groups: join L6, create L10, founder-verified listing | implemented | migration 9, `circles/index.tsx`, `queries.ts` | `test:db` (9 checks) |
| Dating gate L20, women start conversations | implemented (gate only) | `policy/engine.ts`, migration 9 | `progression-gates.test.ts` |
| Religion inference | declined | — | DECISIONS_AND_CONFLICTS 2026-10-25 |
| Home hero, week glance, one daily plan | implemented | `home/TodayHero`, `home/WeekGlance` | not device-tested |
| Quests and workouts share one row | implemented | `game/ActivityRow` | — |
| Drawer simplified; Health Connect entry | implemented | `drawerItems.ts` | `drawer-routes.test.ts` |
| Check-in swipe gestures | implemented | `check-in/index.tsx` | not device-tested |
| Left-aligned header titles | implemented | `AppHeader`, `CollapsingHeader` | — |

## Update — 2026-10-25 (4): You split, motion, date picker, theme

Checks: compile 0, lint 0, `pnpm test` 172/172. Not seen on device (installed build is signed
with the upload key; replacing it needs an uninstall, which erases app data).

| Requirement | Status | Where | Evidence |
| --- | --- | --- | --- |
| Profile/settings as focused sub-screens | implemented | `(tabs)/settings.tsx` hub, `(app)/you/{reminders,privacy,account}` | tsc, lint |
| Calendar items open their record | implemented | `navigation/eventRoutes.ts`, `train/session/[id]`, `health/meal/[id]` | commit ecc9c37 |
| No bouncy motion | implemented | drawer eased timing; section fades without slide/stagger; springs clamp | not device-tested |
| Date picker usable for birthdays | implemented | `DatePickerModal` year → month → day sheet; birthday opens on years | not device-tested |
| Men's theme calmer, low-glare | implemented | `theme/colors.ts` slate navy + brass, AA muted text; Geist headings | contrast computed (≥4.5 text) |
| Intro copy honest for every space | implemented | `IntroSlider` no cycle on slide 1; camera "for supported exercises" | — |

## Update — 2026-10-25 (3): repair prompt v3

Checks: compile 0, lint 0, `pnpm test` 171/171, Android release build PASS. Device: Today tab and
Roadmap seen on device earlier; this round's build not installed (phone has a differently
signed build; replacing it would erase app data — needs the owner's OK).

| Requirement (repair prompt) | Status | Where | Evidence |
| --- | --- | --- | --- |
| Today / Cycle and calendar tab preserved | verified | `(tabs)/today.tsx` restored from history | seen on device |
| Train = route inside quest system, no tab | implemented | `(app)/train/*`, coach `assignmentId` | `workout-evidence.test.ts` |
| Quest-launched workout completes only that assignment | implemented | `questSlice.completeAssignmentWithWorkout` | reuse of verifier + duplicate guard |
| Manual / self-reported logging | implemented | `train/log.tsx`, `verification: 'manual'` | — |
| App drawer, grouped, eligibility-aware | implemented | `navigation/drawerItems.ts`, `AppDrawer` | `drawer-routes.test.ts` |
| Calendar shows saved workouts/meals/check-ins/quests | implemented | `useAgendaSources`, `generateDayAgenda` | `agenda-sources.test.ts` |
| Local day keys (Asia/Kolkata before 05:30) | verified (unit) | `formatLocalDate` | `local-day.test.ts` |
| Men never see cycle UI | implemented | drawer `only`, You card, calendar | `agenda-sources.test.ts`, drawer test |
| No gender inference; honest birthday | implemented | `confirm-profile.tsx`, `googleProfile.ts` | `google-profile.test.ts` |
| Sign-out / erase | implemented | `signOutEverywhere`, `eraseLocalData` | not device-tested |
| Correspondence hidden + route-guarded | implemented | `navigation/eligibility.ts`, letters/social layouts | drawer test |
| Videos: reviewed only | implemented | 50 exercise + 4 hand-picked, 17 quest; rest in-app search | raw manifest kept, not served |
| Meal photos + macros | implemented | `meal-log.tsx`, `domain/nutrition/foods.ts` | `foods.test.ts` |
| Image-based macro estimation | blocked | needs a consented vision provider | — |
| Age verification provider | blocked | correspondence stays closed for everyone | — |
| Voice commands (listening) | not started | speech output only | — |

## Update — 2026-10-25 (2)

Checks: compile 0, lint 0, `pnpm test` 155/155, `pnpm test:db` 77/77, Android release build PASS.
Supabase: migration 8 (weekly summaries) pushed. No device run.

| Area | Status | Evidence | Remaining |
| --- | --- | --- | --- |
| Pose overlay | PASS (build) | Skia skeleton eases between detections every frame; joints breathe; faulty joints pulse red | Device run |
| Exercise coverage | PASS (logic) | 21 plan exercises camera-checked; holds count only in the recognised posture (`pose-movement.test.ts`) | Machine and stretch moves stay manual |
| Time-based quests | PASS (logic) | Now / Later / Done by part of day (`time-of-day.test.ts`); opt-in discreet reminders respecting quiet hours (`reminders.test.ts`) | Device run |
| Weekly summaries | PASS (logic, DB) | SQLite outbox with backoff; opt-in, signed-in only; guests never send; RPC validates ranges, own-rows RLS (`weekly-summary.test.ts`, `test:db`) | Device run |
| Intro | NOT TESTED | Rewritten slides, breathing aura | Device QA |

## Update — 2026-10-25

Checks: compile 0, lint 0, `pnpm test` 142/142, `pnpm test:db` 71/71, Android release build PASS
(arm64). Supabase: all 7 migrations pushed to project lymbgfzngpkvcadrkvui (ap-south-1);
anonymous reward claims refused (verified over REST). No device run (no device attached).

| Area | Status | Evidence | Remaining |
| --- | --- | --- | --- |
| Camera coach | PASS (logic, build) | `(app)/health/coach/[planId]`: video-call layout (`CallStage`), YouTube tutorial (4 oEmbed-verified IDs), live pose form faults that pause/resume the video, auto rep/hold counting (`pose-movement.test.ts`) | Device run; more verified videos |
| Workout XP | PASS | 5 XP per workout, 50 XP (10x) with >=80% fault-free camera frames, 2 per day; client + `tf_claim_workout_reward` (`workout-reward.test.ts`, `test:db`) | Form numbers are device-reported |
| Check-in intensity, plan suggestions | PASS (logic) | `setup-profile.test.ts`, `workouts.test.ts` | Device run |
| Backend | PASS (deployed) | `supabase db push` 7/7; React Query with MMKV persister for server reads | Enable Google provider in Supabase Auth (dashboard) |

## Update — 2026-10-24

Checks: `pnpm compile` 0 errors, `pnpm lint` 0, `pnpm test` 130/130, `pnpm test:db` 66/66.
Native release build: see the latest commit message. No device run in this pass (no device attached).

| Area | Status | Evidence | Remaining |
| --- | --- | --- | --- |
| Setup rewards (REQ-004/007) | PASS (logic) | Fixed XP per onboarding step, 165 XP total reaches level 5 (orientation stage); same XP for any answer incl. "prefer not to say"; server `tf_claim_setup_reward` (`setup-profile.test.ts`, `test:db`) | Not seen on device |
| Capability fit (REQ-007) | PASS (logic) | Baseline step (activity, energy, sleep, stress) + limits + routine length set pace, max quest length and families; edits re-fit today's unstarted quests (`refitDailyQuests`) | Not seen on device |
| Personalize screen (REQ-004) | NOT TESTED | `(app)/personalize.tsx`, linked from You | Device QA |
| Interop | PASS (logic) / NOT TESTED (device) | Health Connect read + workout write, BLE heart rate, FHIR R4 export, consent and audit log (`interop.test.ts`) | Needs a device with Health Connect and a strap |
| Encryption at rest (REQ-008) | NOT TESTED | MMKV encrypted with Keystore-held key, re-encrypt on upgrade | Verify on device upgrade path |
| MediaPipe pose | PASS (logic) | `modules/pose-landmarker` (MediaPipe Tasks + CameraX, frames never stored), rep counting (`pose-movement.test.ts`) | Device run; catalog pose objectives not wired into the verifier |
| Compliance | Documented | `docs/compliance/HIPAA_FHIR.md` | BAA, risk analysis, policies (owner) |

## Verified status — 2026-10-23 (authoritative)

Status values: PASS (verified with the listed evidence), FAIL, BLOCKED (needs an external
action), NOT TESTED. Checks: `pnpm compile` (strict, 0 errors), `pnpm lint` (0),
`pnpm test` (41/41), `pnpm test:db` (47/47 on real Postgres via PGlite),
`expo export --platform android` (bundles), `expo-doctor` 19/20 (only `expo` 55.0.31→55.0.32 patch).
No Android/iOS native build or device run was done in this pass.

| Req | Status | Evidence | Remaining issue |
| --- | --- | --- | --- |
| REQ-001 Completeness | FAIL | This table; older matrix below is unverified | Most spec sections have UI only; no per-requirement acceptance tests |
| REQ-002 Design | NOT TESTED | No device run this pass | Visual QA on device pending |
| REQ-003 Progressive UX | NOT TESTED | `isSocialPathRevealed` now false by default | Reveal rules not wired to engagement data |
| REQ-004 Questionnaires | NOT TESTED | Onboarding routes exist | Skip/edit/resume persistence not verified on device |
| REQ-005 ADHD space | FAIL | — | Not implemented |
| REQ-006 Health safety | NOT TESTED | Cycle estimates labelled; fake health data removed | No safety-scenario test suite |
| REQ-007 AI & gamification | PASS (partial) | v3-only quest engine: objective evidence, idempotent ledger, catalog levels/checkpoints, diamonds once, same-family replacement, atomic unlocks (`game-catalog.test.ts`, 56826d3); server mirror with 15 DB checks (335a9d6); local insights/search/memory (`local-intelligence.test.ts`) | Capstones, assessments (need server keys), camera and AI-provider objectives not assignable yet; no local LLM; not seen on device |
| REQ-008 Identity & privacy | PASS (local) / BLOCKED (server) | Local export/erase implemented; `tf_export_my_data`, consent revocation in `test:db` | Server account deletion needs an edge function; backend not deployed |
| REQ-009 Infrastructure | BLOCKED | Migrations 1–5 verified on Postgres (`test:db` 62/62); email OTP accounts, MMKV session persistence, reward sync queue in app (335a9d6) | Needs its own Supabase project + `EXPO_PUBLIC_SUPABASE_URL/KEY`; then `supabase db push` |
| REQ-010 Special users | PASS (DB) | `tf_admin_grant_special` / revoke, no self-grant, audited (`test:db`) | No admin UI; backend not deployed |
| REQ-011 Trust & safety | PASS (DB) | Restrictions with evidence, appeals, reinstatement, block/restriction cancel deliveries (`test:db`) | Moderation queue/human-review tooling not built |
| REQ-012 Communities & correspondence | PASS (DB) / BLOCKED (app) | Chip-only + delayed delivery + membership enforced server-side (`test:db`) | App letters/communities are local-only until backend wiring |
| REQ-013 Verification | BLOCKED | Self-verification impossible (client + DB trigger); social features locked | No age-assurance provider integrated (Sumsub/Veriff evaluation pending) |
| REQ-014 Payments deferred | PASS | Billing route, subscription gates and payment tables removed; tests assert no upsell | — |
| REQ-015 Platform engineering | PASS (partial) | No hard-coded dev identity; strict TS restored; bundle exports | Native builds not run this pass |
| REQ-016 Delivery integrity | PASS | Commits 949b668, 0d07c53, ef1c62e, 8ca1e41; reproducible `test:db` | — |

Founder-requested religion/identity rules remain unenforced and the dependent adult-social
pathway is closed to everyone (see `FOUNDER_POLICY_REQUESTS.md`); tests assert stated
religion never changes eligibility.

## Earlier matrix (2026-10-16) — UNVERIFIED

The table below was written before this audit. Its "Complete" entries were based on
compilation only; several are known to be inaccurate (no backend was deployed, the journal
is not encrypted, account verification/OTP has no server, entitlement gates were removed).
Use the verified section above.

This matrix maps every requirement, architecture tier, and policy boundary from `thrivefold_ultimate_master_build_prompt_v2.md` to active code, routes, components, database migrations, and verified test suites.

| Section / Req ID | Specification Domain | Target Module / Route | API / Policy Contract | Privacy & Retention | Implementation Status | Test Suite / Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Sec 0-2 / ARCH-001** | Unified Architecture & Safety Rules | `thrivefold/app.json`, `src/app/_layout.tsx` | Expo SDK 55, Hermes, zero-shadow flat squircle | On-device primary, sovereign local vault | Complete | `compile`, `RootLayout` |
| **Sec 3 / HEALTH-W-001** | Women's Health & Cycle Tracker | `src/app/(app)/health/cycle.tsx` | `useHealthStore.cycleData` | Local device vault | Complete | `TEST-HEALTH-01` |
| **Sec 4 / HEALTH-M-001** | Men's Wellbeing & Mobility | `src/app/(app)/health/men/index.tsx`, `exercise.tsx` | `evaluateDeterministicRoutine` | Local device vault | Complete | `tests/unit/local-ai.test.ts` |
| **Sec 5 / HEALTH-P-001** | Pride & LGBTQ+ Affirmative Space | `src/app/(app)/health/pride/index.tsx` | `theme/colors.ts (prideLight/Dark)` | No public disclosure | Complete | `ThemeColors` check |
| **Sec 6 / HEALTH-EXT-001** | Reproductive Health Education | `src/app/(app)/health/reproductive.tsx` | Clinical guidance & signposting | Read-only curated resources | Complete | `compile` |
| **Sec 7 / HEALTH-EXT-002** | Pelvic Floor Awareness & Exercises | `src/app/(app)/health/pelvic-floor.tsx` | Contraindication panel (hypertonic care) | On-device timer & logs | Complete | `compile` |
| **Sec 8 / HEALTH-EXT-003** | Multi-System Symptom Logger | `src/app/(app)/health/symptoms.tsx` | Somatic tracking & severity ratings | Local device vault | Complete | `compile` |
| **Sec 9 / HEALTH-EXT-004** | Circadian Rhythm & Sleep Alignment | `src/app/(app)/health/sleep.tsx` | Duration stepper & wind-down checklist | Local device vault | Complete | `compile` |
| **Sec 10 / HEALTH-EXT-005** | Somatic Valence, Energy & Stress | `src/app/(app)/health/mood.tsx` | Energy, mood valence, stress 1-10 scales | Local device vault | Complete | `compile` |
| **Sec 11 / HEALTH-EXT-006** | Nutrition & Hydration Tracker | `src/app/(app)/health/nutrition.tsx` | Water intake stepper & meal reflection | Local device vault | Complete | `compile` |
| **Sec 12 / HEALTH-EXT-007** | Local Non-Prescriptive Schedule | `src/app/(app)/health/medications.tsx` | Local-only medication reminders | Never shared across network | Complete | `compile` |
| **Sec 13 / HEALTH-EXT-008** | Health Audit Log & JSON Export | `src/app/(app)/health/history.tsx` | Comprehensive chronological export | User exportable JSON | Complete | `compile` |
| **Sec 14 / JRNL-001** | On-Device Encrypted Journal | `src/app/(app)/journal/index.tsx`, `new.tsx` | Local mood tags & structured prompts | Sovereign encrypted vault | Complete | `compile` |
| **Sec 15 / JRNL-002** | Single Entry View & Local AI Refl | `src/app/(app)/journal/[entryId].tsx` | Deterministic reflection suggestions | 100% on-device inference | Complete | `compile` |
| **Sec 16 / AI-LOC-001** | Deterministic Offline Task Rules | `src/domain/ai/deterministicRules.ts` | `evaluateDeterministicRoutine` | 100% on-device | Complete | `tests/unit/local-ai.test.ts` |
| **Sec 17 / AI-LOC-002** | Local Classification Engine | `src/domain/ai/localClassifier.ts` | `classifyLocalInput` | 100% on-device | Complete | `tests/unit/local-ai.test.ts` |
| **Sec 18 / AI-MEM-001** | Sovereign Memory Vault | `src/services/memory/localMemoryVault.ts`, `ai/memory.tsx` | Inspect, erase individual, wipe all | Local device vault | Complete | `compile` |
| **Sec 19 / AI-PRIV-001** | Privacy Boundary & Vector Toggles | `src/app/(app)/ai/privacy.tsx` | Zero-cloud client keys, consent flags | Enforced by proxy | Complete | `compile` |
| **Sec 20 / AI-STAT-001** | Model Runtime & Tier Status | `src/app/(app)/ai/model-status.tsx` | Deterministic, local classifier, proxy | Transparent diagnostics | Complete | `compile` |
| **Sec 21 / AI-CLD-001** | Serverless Edge AI Gateway | `src/services/ai-router/cloudAiGateway.ts` | Server proxy with daily token limits | Redacted, consent-gated | Complete | `compile` |
| **Sec 22 / CHIP-MSG-001** | Chip-Only Postal Composition | `src/app/(app)/letters/compose.tsx`, `drafts.tsx` | Zero free-text input allowed | Curated card sequences | Complete | `tests/unit/chip-catalog.test.ts` |
| **Sec 23 / CHIP-SEC-001** | Anti-Bypass Injection Interceptor | `src/domain/chips/moderation.ts` | `validateChipSequence` | Blocks phone, emails, links | Complete | `tests/unit/chip-moderation-security.test.ts` |
| **Sec 24 / SLOW-LET-001** | Slowly-Inspired Distance Delay | `src/domain/letters/deliveryCalculator.ts` | `calculateDeliveryHours` | Coarse distance bands | Complete | `tests/unit/transit-math.test.ts` |
| **Sec 25 / SLOW-LET-002** | Collectible Stamps Catalog | `src/domain/letters/stampCatalog.ts`, `stamps.tsx` | `STAMP_CATALOG`, user inventory | Local/server sync | Complete | `tests/unit/transit-math.test.ts` |
| **Sec 26 / SLOW-LET-003** | Postal Sub-Navigation & Hub | `src/app/(app)/letters/index.tsx`, `inbox.tsx`, `outbox.tsx` | In-transit countdown & milestone waypoints | Pseudonymous routing | Complete | `compile` |
| **Sec 27 / SLOW-LET-004** | Live Delivery Waypoint Tracker | `src/app/(app)/letters/delivery/[letterId].tsx` | Progress bar & distance estimation | Pseudonymous stamps | Complete | `compile` |
| **Sec 28 / SLOW-LET-005** | Pen-Pal Candidate Discovery | `src/app/(app)/letters/discover.tsx`, `open-letters.tsx` | Interest & language matching, 1-intro quota | Server quota enforced | Complete | `tests/unit/policy-engine.test.ts` |
| **Sec 29 / SLOW-LET-006** | Pen-Pal Profile & Preferences | `src/app/(app)/letters/profile.tsx`, `preferences.tsx` | Pseudonym, avatar seed, distance scope | No real names or GPS | Complete | `compile` |
| **Sec 30 / SOC-AGE-001** | Strict 18+ Adult Protection | `src/domain/policy/ageAssurance.ts`, `auth/verify-age.tsx` | Underage unconditionally barred | Zero ID document storage | Complete | `tests/unit/cohort-policy.test.ts` |
| **Sec 31 / SOC-AGE-002** | Age Band Boundary Tests | `src/domain/policy/ageAssurance.ts` | `calculateAgeBand` (18, 25, 35, 50) | Discrete cohort bins | Complete | `tests/unit/cohort-policy.test.ts` |
| **Sec 32 / SOC-TRL-001** | Under-25 Male 7-Day Pilot | `src/domain/policy/engine.ts` | Trial mode: correspondence only | Isolated from general circles | Complete | `tests/unit/policy-engine.test.ts` |
| **Sec 33 / SOC-TRL-002** | Community Block During Trial | `src/domain/policy/engine.ts` | `COMMUNITY_RESTRICTED_DURING_TRIAL` | Entitlement gate | Complete | `tests/unit/policy-engine.test.ts` |
| **Sec 34 / SOC-QTA-001** | Daily 1-New-Intro Quota | `src/stores/useAuthStore.ts`, `domain/policy/engine.ts` | `introsSentToday >= 1 -> EXHAUSTED` | Midnight reset cycle | Complete | `tests/unit/policy-engine.test.ts` |
| **Sec 35 / REL-SENS-001** | Founder Sensitive Religion Rules | `src/domain/policy/engine.ts`, `ageAssurance.ts` | Kept as REVIEW_REQUIRED (Never covert) | Protected from inference | Complete | `tests/unit/policy-engine.test.ts` |
| **Sec 36 / COMM-VIS-001** | Segmented Circle Namespaces | `src/app/(app)/circles/index.tsx`, `[communityId]/index.tsx` | Type-isolated (women, men, pride, general) | Private RLS policies | Complete | `compile` |
| **Sec 37 / COMM-INV-001** | Circle Invitations with Purpose | `src/app/(app)/circles/invitations.tsx` | Consented invites with facilitator badge | Decoupled identity | Complete | `compile` |
| **Sec 38 / ORG-APP-001** | Accredited NGO & Clinic Onboarding | `src/app/(app)/organizations/apply.tsx` | Domain verification & accreditation tier | Verification audit trail | Complete | `compile` |
| **Sec 39 / ORG-ADM-001** | Organization Administration Roster | `src/app/(app)/organizations/[organizationId]/index.tsx` | Roles: owner, admin, clinician, moderator | Staff authorization check | Complete | `compile` |
| **Sec 40 / SAFE-BLK-001** | Two-Way Immediate Block Engine | `src/domain/policy/engine.ts`, `safety/blocked-users.tsx` | Cancels letter queues & mutual invisibility | Instant server enforcement | Complete | `tests/unit/policy-engine.test.ts` |
| **Sec 41 / SAFE-RPT-001** | Safety Evidence Reporting | `src/app/(app)/safety/report.tsx` | Category, evidence summary & auto-block | Encrypted case vault | Complete | `compile` |
| **Sec 42 / SAFE-APL-001** | Transparent Account Appeal Pathway | `src/app/(app)/safety/appeal.tsx` | Human review appeal submission | Audit log preserved | Complete | `compile` |
| **Sec 43 / SAFE-CRS-001** | 24/7 Global Crisis & Helpline Hub | `src/app/(app)/safety/urgent-support.tsx` | International hotlines, SMS & emergency dial | Direct device telephone link | Complete | `compile` |
| **Sec 44 / AUTH-SU-001** | Pseudonymous Sign-Up Flow | `src/app/(auth)/sign-up.tsx` | Email/password or sovereign credential | Minimal identity leakage | Complete | `compile` |
| **Sec 45 / AUTH-VER-001** | Account Email & Token Verification | `src/app/(auth)/verify-account.tsx` | Supabase 6-digit OTP verification | Safe session token storage | Complete | `compile` |
| **Sec 46 / AUTH-RST-001** | Secure Password Recovery | `src/app/(auth)/reset-password.tsx` | Out-of-band reset link | One-time token consumption | Complete | `compile` |
| **Sec 47 / ONBD-EXP-001** | Onboarding: Choose Experience | `src/app/(onboarding)/choose-experience.tsx` | Women, Men, Pride, General Health | User explicit selection | Complete | `compile` |
| **Sec 48 / ONBD-PRV-002** | Onboarding: Privacy Choices | `src/app/(onboarding)/privacy-choices.tsx` | Offline-first, cloud AI opt-in | Explicit consent records | Complete | `compile` |
| **Sec 49 / ONBD-GLS-003** | Onboarding: Wellbeing Goals | `src/app/(onboarding)/goals.tsx` | Goal selection linked to constraints | Local device vault | Complete | `compile` |
| **Sec 50 / ONBD-CST-004** | Onboarding: Activity Constraints | `src/app/(onboarding)/activity-constraints.tsx` | Physical mobility, fatigue, injury care | Prevents harmful routines | Complete | `compile` |
| **Sec 51 / ONBD-LFS-005** | Onboarding: Lifestyle Preferences | `src/app/(onboarding)/lifestyle-preferences.tsx` | Sleep timing, hydration targets | Local preference storage | Complete | `compile` |
| **Sec 52 / ONBD-HP-006** | Onboarding: Health Permissions | `src/app/(onboarding)/health-permissions.tsx` | Step counting, biometric sensor scope | Granular platform consent | Complete | `compile` |
| **Sec 53 / ONBD-NOT-007** | Onboarding: Notification Permission | `src/app/(onboarding)/notification-permission.tsx` | Quiet hours (22:00-07:00) default | Mindful delivery only | Complete | `compile` |
| **Sec 54 / ONBD-LOC-008** | Onboarding: Location Permission | `src/app/(onboarding)/location-permission.tsx` | Coarse postal regions (Zero exact GPS) | No background tracking | Complete | `compile` |
| **Sec 55 / ONBD-ROU-009** | Onboarding: Daily Routine Setup | `src/app/(onboarding)/daily-routine.tsx` | Morning & evening quiet check-in pacing | Offline routine schedule | Complete | `compile` |
| **Sec 56 / ONBD-CMP-010** | Onboarding: Completion & Launch | `src/app/(onboarding)/complete.tsx` | Vault encryption initialization | Session activation | Complete | `compile` |
| **Sec 57 / DB-MIG-001** | Database Migrations 1, 2, 3 | `supabase/migrations/*.sql` | Profiles, RLS, Orgs, Stamps, Entitlements | Strict row level security | Complete | SQL validation |
| **Sec 58 / TST-COV-001** | End-to-End Test Suite Verification | `tests/unit/*.test.ts` | 6 suites, 36 tests passing (100% pass) | Continuous regression test | Complete | `npm test` passing |

