# THRIVEFOLD — ULTIMATE MASTER EXECUTION & DELIVERY PROMPT V5

## One source of truth for the existing app: real Coach, real-time vision, intentional voice/video, full-product completion, verified release

**Use this prompt inside Claude Code (or another repository-capable coding agent) with the real Thrivefold repository open.** Attach/extract the accompanying source-context bundle when it is available. This is an implementation contract, not a request to produce another prompt, plan, mock-up, or status essay.

**Execution loop:** read the real sources → protect existing work → reproduce the actual failures → measure → implement the smallest correct vertical slice → test → inspect the diff → commit a verified milestone → continue until every feasible requirement is verified or precisely blocked.

---

# 0. THE OUTCOME THE USER ACTUALLY NEEDS

Thrivefold is an existing application with substantial code and partially working functionality. It is not a greenfield app. The Coach/camera/MediaPipe path, session hooks, pose overlays, voice cues, YouTube tutorial player, design system, persistence, quest/progression systems, AI/data integrations, and broad product specification already exist in some form. Earlier sessions made changes, and some work was reported as committed and tested. Those reports are **leads to verify, not proof**.

The immediate user need is a complete, polished, believable **real exercise Coach**:

- Camera positioning must be calm and predictable. Nothing should silently start a workout, add rest, change video state, move exercises, complete a set, or speak a command while the user is merely positioning themselves.
- Voice commands must be intentional, scoped, deterministic, and able to control the wider app when the user explicitly activates the command system. Core commands must work without an LLM or internet connection.
- YouTube tutorials must start correctly on the first deliberate user action. Tutorial audio, coach TTS, speech recognition, haptics, camera setup and countdowns must not collide or make a confusing scanner-like mess.
- Body pose must be real, fresh, connected, anatomically plausible, correctly aligned to the person, smooth without trailing badly, and inexpensive enough to remain responsive on an actual Android phone.
- Face, eyes, and hands must remain supported as independent layers/capabilities. Their visibility can be turned off without breaking body tracking. When a user explicitly enables richer tracking, use one camera session and an intentional shared inference budget—never competing camera engines.
- Coach tips, positioning banners, countdowns, HUD controls, rest state and completion UI must look intentionally designed—not like generic AI-generated cards stacked over the body.
- The exercise must really proceed through instructions → setup → readiness → countdown → tracking → valid reps/hold → rest/next set → completion → persistence → history/progress/quest updates.
- Preserve the rest of Thrivefold. The whole-app product specification remains in scope. Do not fix Coach by deleting health, calendar, nutrition, AI, quest, community, privacy, or release requirements.

**This is a delivery job.** Make code changes in the actual repository, run real checks, test the actual app and continue to the next task. Do not stop after the first diagnosis, a prettier screen, passing TypeScript, a native compile, or one successful workout.

---

# 1. CONTEXT PACK, READ REQUIREMENTS, AND RECONCILE CONFLICTS

## 1.1 Read the real project before editing

Discover the real repository root, instructions, source files, assets and configuration. Read all applicable instructions and the complete relevant specifications, chunking large Markdown/code/text files rather than truncating them. At minimum locate and read, when present:

- `AGENTS.md`, nested agent instructions, `CLAUDE.md`, `README.md`, current setup/run/build instructions.
- `thrivefold_ultimate_master_build_prompt_v2.md` and any current successor.
- `thrivefold_compact_master_repair_prompt.md` and typo variants such as `propmt.md` if they exist.
- `thrivefold_continuation_completion_master_prompt_v3.md`, the V4 rescue/delivery prompt, the current final production prompt, and current Coach/pose-specific prompts.
- Existing route, design-system, privacy, architecture, AI/RAG, analytics, calendar/cycle, quest/catalog, release and marketing specifications.
- Current and previous delivery logs, source-review notes, known issues, test plans, crash logs, CI logs, Git diffs and release evidence.
- All supplied code excerpts for `PoseCameraView.kt`, `PoseLandmarkerModule.kt`, `pose-landmarker` TypeScript API, `usePoseTracking`, `CoachScreen`, voice/gesture parsing, coach speech, YouTube player, overlays and HUD components.
- The source-context bundle’s index and all unique applicable source files. Deduplicate identical pasted files by SHA/content; do not mistake a repeated upload for a separate requirement. Do not ignore a unique file just because the same filename pattern appears elsewhere.

Record each source as `read fully`, `read in chunks`, `unavailable`, or `duplicate of <source>`. Never say all files were read if a file was inaccessible or the output was truncated.

## 1.2 One hierarchy for old and new instructions

The materials contain historical contradictions. Resolve them deliberately rather than randomly picking a prompt:

1. Safety, consent, applicable law, platform terms and repository agent rules.
2. The latest explicit project-owner requirements in this task and current authoritative repo spec.
3. Current runtime behavior, actual source code, current Git state and validated architecture decisions.
4. Current product specification and release acceptance criteria.
5. Historical implementation notes, older prompts, reports and proposed experiments.

Use these specific conflict decisions:

- **No production dependency on a separate Beta Lab.** Older material proposed a Beta Lab, but the current requirement is to finish the real Coach in the existing product. Do not create another experiment area or leave the normal Coach behind a hidden beta flag. If a Beta Lab already exists, do not destroy its code/data blindly; inspect it, remove its control of the normal production flow, and retain/archive it only if it has a valid separate purpose.
- **Do not migrate camera architecture merely because VisionCamera/Worklets sounds newer.** First optimize and measure the existing CameraX + Expo/Kotlin/MediaPipe path. The upstream pose-detection repository’s ADR 0001 explicitly chose to own CameraX as its primary camera and described a VisionCamera adapter as a future additional entry point. Evaluate that decision against our current stack; do not blindly transplant or contradict it.
- **Landmark support and visibility are separate.** Body pose is the priority for workout tracking and must always work in the chosen release configuration. Face/eye/hand code must not be deleted. Each overlay can be hidden independently. Provide a real full-tracking mode for body + face/eyes + hands without a second camera session. When safely supported, derive enabled detectors from the same captured frame; if device budget or model contracts require scheduling, document the separate cadence/timestamps and keep layers from appearing synchronized when they are not. Extra inference must be consented and governed by a measured frame/thermal budget; do not secretly burn compute on hidden detectors that are not needed.
- **Do not add Reanimated as an immediate performance fix.** No blanket dependency upgrades, no extra animation library, and no per-landmark Reanimated animation loop. Use the already-installed, compatible stack. First fix frame freshness, conversion, inference, dispatch and coordinate mapping. Use Skia for the high-frequency overlay. Existing Reanimated may handle light UI transitions after the hot path is stable. Avoid spring, bounce and elastic effects.
- **No user-facing use of the term the owner explicitly banned.** For the Slow Letter / controlled correspondence experience, do not put that word in user-facing navigation, marketing or copy. Preserve established internal IDs/API/database names unless a safe compatibility migration is justified. Keep eligibility, age, consent, progression and recipient policy transparent and enforced server-side; do not covertly infer sensitive identity.
- **Resolve monetization conflict before introducing billing.** Historical materials conflict between a strict no-in-app-purchases/no-upsells rule and a different proposal mentioning a free trial, credits or subscriptions. Inspect the current authoritative product spec, code and console/configuration. Do not invent, activate or remove billing based on an old prompt; preserve existing data and document the owner-approved decision.
- **Credential security beats stale environment examples.** Never put private provider keys in `EXPO_PUBLIC_*`, client bundles, logs or committed `.env` files. Use server-side secrets for shared cloud provider calls; user-owned BYOK credentials need secure local storage and explicit consent. Historical examples that expose secrets must be treated as stale and corrected safely.
- **No fake completion.** Report implemented, automated-tested, build-verified, device-verified, backend-verified, deployed, submitted and published separately. A successful compile is not proof of runtime operation.

## 1.3 Reported recent work to verify from Git, not assume

The user reported these commits and outcomes. Check the actual current branch, objects, changed files, diffs and tests before relying on them:

- `df934b1` — `feat(coach): optimize pose camera pipeline, hud overlays and prompts`. Reported: reusable bitmaps/buffers in `PoseCameraView.kt`; cleaned landmark geometry in `PoseOverlay.tsx`; streamlined `CoachBanner.tsx` and `CoachHUD.tsx`; positioning changes in `PositioningCard.tsx` and `useCoachFlow.ts`; queue-less priority speech in `coachVoice.ts`.
- `8b1b105` — `feat(ai): add byok settings and emergency voice support protocols`. Reported BYOK keys for Gemini/Groq/OpenRouter/Sarvam stored locally; listening/grounding and emergency support flows; deterministic crisis detection and TTS. Verify privacy, actual storage guarantees and platform/region appropriateness.
- `565c297` and `b3bb018` — nutrition/macros and AI verification on meal submission.
- `9d16360` — vitals, BMI, photo food macros, check-in rewards and reminders.
- Reported checks: `pnpm compile`, `pnpm lint`, `pnpm test` (44 suites / 305 tests), `pnpm test:db` (145 PostgreSQL RLS tests), and Expo prebuild. Re-run the current repository’s scripts and record current output; don't present those old numbers as today’s results.
- Physical-device smoke testing was still reported as pending for phone `ZD2225KYKD`. Verify the actual connected device with `adb devices -l`; do not assume it is connected now.
- Previous reports mention a Beta Mode toggle/Beta Lab. That may conflict with the current production-Coach requirement; resolve as specified above.

The supplied `PoseCameraView.kt`/`usePoseTracking` excerpts may predate `df934b1`. Compare them against `git show df934b1`, current files and the current branch. **Do not apply a stale diagnosis to a newer implementation without checking.**

## 1.4 First required engineering artifacts

Reuse existing equivalents when possible. Do not create several competing trackers. Keep one canonical set:

- Requirements traceability: every documented feature → route/component/domain owner → persistence/API/native dependency → acceptance test → evidence/status.
- Source-review / architecture decision matrix for the upstream libraries and local camera path.
- Known-defects/root-cause register separating confirmed causes from hypotheses.
- Delivery log recording each code slice, exact commands/results, actual device evidence, commit hash and remaining blockers.
- Rollback/recovery instructions for high-risk/native/data changes.

Suggested names only when no equivalent exists: `docs/requirements/TRACEABILITY.md`, `docs/architecture/EXISTING_INFRASTRUCTURE_MAP.md`, `docs/implementation/THRIVEFOLD_DELIVERY_LOG.md`, and `docs/release/RELEASE_RUNBOOK.md`.

---

# 2. SAFE EXECUTION: PROTECT WORK, THEN MAKE REAL PROGRESS

## 2.1 Baseline and backups

Before editing:

1. Inspect `pwd`, branch, commit, `git status --short`, staged/unstaged/untracked files, remotes, recent commits and all relevant diffs.
2. Identify another agent’s active changes and protect them. Never overwrite user work or stage unrelated files.
3. Capture baseline test/build outcomes and inspect runtime/crash evidence where available.
4. Confirm actual package manager, Expo SDK, React Native version, New Architecture state, native module versions, Kotlin/Gradle/JDK, MediaPipe/CameraX, Reanimated, Skia, Worklets, package ID and build profile.
5. Create a real, readable backup/patch of the files at risk. Verify it has content and can restore the old version. Keep backup material/secrets out of commits and releases.
6. Capture screenshots or video of the current broken UX when practical, including camera positioning, first tutorial play, a live set, cue/banner and completion.

Never run destructive resets, blanket `git clean`, `git reset --hard`, mass checkouts, production database resets, or blind native-project regeneration. Do not remove model assets or untracked work. Use current repository commands/package manager only.

## 2.2 Stop endless analysis loops

Initial inspection must be sufficient but bounded. Read the required material in sensible chunks, then start a real fix. Within the first work cycle, produce a meaningful code or test diff. For each defect: reproduce or inspect once → state the likely root cause and confidence → change code → run the narrowest useful test → inspect/fix → run broader checks. After a command fails, inspect its full relevant error and change the diagnostic approach; do not repeatedly run the same failing command unchanged. Missing credentials/device access do not block independent fixes.

Work in coherent vertical slices and commit each verified milestone. Don't commit knowingly broken code just to satisfy cadence. Push only to the intended branch/remote when authorized and when tests pass.

---

# 3. CRITICAL P0 — STOP UNINTENDED ACTIONS DURING POSITIONING

This is the first behavior defect to resolve because an exercise app must never act as if a user issued a command when they did not.

## 3.1 Confirm the reported risk in current code

The supplied `usePoseTracking` excerpt calls gesture recognition for every pose frame whenever the movement is not in `ARM_MOVES`; it does not appear to gate `stepGesture` on `checking`, explicit gesture enablement, active exercise state or an explicit user gesture-control setting. `checking` gates rep processing later, not the earlier gesture block. In the supplied `CoachScreen` excerpt, `onGesture` maps gesture events to play/pause video, add rest, go to the previous item or a fallback branch that can complete a set. The fallback must not turn an unknown or incidental gesture into a command. These are **high-confidence risks in the supplied excerpt, not proof that the latest committed code is identical**. Confirm the current files and test the real path.

## 3.2 Single explicit control state machine

Define separate states for:

- `idle` / no active Coach.
- `camera_permission` / camera starting.
- `positioning` / user moving the phone or body into frame.
- `model_initializing` / no inference result yet.
- `ready` / a stable, exercise-specific pose/framing requirement has been met.
- `countdown` / started only after the user’s explicit Start action and valid readiness, unless an opt-in product setting specifies a different documented path.
- `active_set`.
- `paused`.
- `tutorial_playing`.
- `rest`.
- `complete` / `cancelled` / recoverable failure.

The canonical session state—not a loose combination of booleans—must determine whether voice commands, hand gestures, rep counting, TTS and video playback are permitted. Use the current store/state-machine architecture if sound; don't create a duplicate timer or second session owner.

**During positioning, camera initialization, tutorial-only viewing, countdown cancellation, pause, route backgrounding and session completion, pose/hand movement must not trigger workout commands.** A detected body/hand pose is not a command by itself.

## 3.3 Voice command engine across the whole app

Build on the existing STT/voice command services, not a duplicate recognizer. Support an explicit app-wide command system using deterministic intent parsing; keep LLM interpretation optional and outside the critical control path.

- Default behavior is no microphone listening and no commands. Require a clear user action such as push-to-talk or an explicitly enabled, visible foreground listening mode. Show an unambiguous mic/listening state and support stop/disable.
- Global voice control may be offered in any screen only when the user explicitly activates it and grants permission. Coach hands-free mode may remain active only during a workout session the user explicitly started, if that feature is enabled. No covert/background listening.
- Parse only finalized transcript segments; ignore partial/interim text for side effects. Use recognition confidence when available, exact intent/phrase boundaries, language-aware aliases, duplicate suppression, cooldown and command-session IDs. Fuzzy matches must not add or submit anything.
- Do not execute any action when parsing returns `null`, when the command is outside the current screen/state allowlist, or when the listener belongs to an old session.
- Commands must have a typed registry: `intent`, `scope`, valid session states, required permission, idempotency key, risk level, handler, confirmation requirement and expected UI acknowledgement.
- Commands such as adding a record, submitting a meal, sending correspondence, changing profile/health data, destructive actions or externally visible actions need an explicit review/confirmation step. Simple reversible controls may execute directly when their allowed state matches.
- Add robust handling for Android speech service errors, unavailable locale, permission denial, app backgrounding, recognizer cancellation/restart, microphone contention and timeout. A recognition failure must not crash/freeze the app or leave a phantom “listening” state.
- Prevent the app from recognizing its own TTS as a user command. Coordinate TTS/listening lifecycle; stop or suspend recognition during coach speech where necessary, introduce a safe echo-guard interval, and never parse a transcript emitted from a session that has ended.
- Manual controls remain visible and fully functional even when STT/AI is unavailable.

The supplied `parseVoiceCommand` excerpt is a specific risk: it tests unanchored regexes against the whole transcript and then checks broad standalone keywords like `start`, `go`, `ready`, `next`, `done`, `skip`, `complete`, `back`, `stop` and `play`. Ordinary speech about positioning may therefore be parsed as a command. Replace this with intent phrases appropriate to an explicitly activated command surface, tight anchors/command prefixes or push-to-talk boundaries, confidence checks, and contextual allowed actions. A word appearing naturally inside a sentence is not enough. Use separate phrases for changing a tutorial versus pausing/resuming the workout. The app-wide deterministic command vocabulary should be based on existing intents (e.g. open a known area, start/stop an explicitly requested timer, pause/resume, repeat instruction, navigate back when safe, and draft an input). Discover the real route registry and actual operations first; do not invent handlers that don't exist. Contextual commands must be validated against a real allowlist. AI can interpret complex wording into a draft intent but must not bypass authorization, validation or confirmation.

## 3.4 Gesture controls are separate from voice control

- Turn gesture command mode off by default unless the current product spec has a clear opt-in requirement. Explain it and show its state in UI.
- During positioning, gestures can be used only for pose/framing readiness feedback, never command execution.
- During an active set, only explicit supported gestures may map to commands. Require stable confidence, a deliberate hold/dwell time, neutral/ready transition, per-command cooldown and a single fired edge (not one command on each frame while the pose is held).
- Keep workout movement gestures separate from control gestures; suppress conflicts per exercise. Do not treat arbitrary/unknown gestures as “next set” or “complete”. An unmatched gesture must have no side effect.
- Don't use hand landmarks for gesture commands when hand inference is disabled, stale or low-confidence. Provide manual accessibility alternatives.
- No set-completion command should arise from the generic/default branch of an unrelated gesture handler. Completing a set needs rep/hold target evidence or an explicit, distinct user action with appropriate confirmation.

## 3.5 Regressions specifically required

Add tests reproducing:

- User moves into frame, raises arms to adjust the tripod, moves hands across the body or tests posture: no video toggle, add-rest event, previous exercise, set completion, reward or spoken command.
- Body/hand pose remains held across hundreds of frames: exactly zero duplicate command events after the initial deliberate trigger.
- Unmatched gesture/parser returns `null`: no action.
- Partial transcript contains “next” while the user is speaking normally: no action until valid finalized/confirmed command input.
- Old recognition callback arrives after route/session ends: ignored.
- Repeated final transcript delivered twice: one action maximum.
- TTS says a phrase matching a command: it is not executed as user speech.
- Voice/gesture control off: no side effects, even with visible pose.

---

# 4. P0 — ONE AUDIO OWNER: COACH SPEECH, STT, TUTORIAL AUDIO, SFX AND HAPTICS

Sound must feel calm and natural. It must not sound like a scanner, an overexcited assistant, multiple systems speaking over each other, or a voice that comments on every frame.

## 4.1 Establish real audio ownership

Inspect `say`, `speakCoach`, `coachVoiceService`, `voiceRef`, `voiceOn`, gesture speech, cue engine, `YouTubePlayer`, haptics and any native audio session/focus code. Create/fix one small coordinator around existing services. It must know:

- current screen/session and phase;
- whether tutorial video is loading, playing, paused or ended;
- whether user explicitly enabled spoken coaching;
- whether STT is actively listening/push-to-talk;
- current speech queue/priority and cancellation token;
- Android audio focus/interruption status and current app foreground state.

Do not create separate TTS queues that can overlap. Do not play repeated “success” sounds for each inference result. Do not make camera initialization or person detection trigger repetitive chimes.

## 4.2 Audio behavior contract

- Voice coaching is optional and respects the actual persisted toggle. If disabled, `say()` must not speak via a path that bypasses that setting. Audit every voice call site, including the `start()` path and gesture/cue services.
- The start screen should not unexpectedly speak a long greeting during camera positioning. Show concise visual guidance by default; optional spoken guidance is allowed only when enabled and should not collide with video audio.
- During tutorial audio playback, suppress coach TTS by default (unless the user explicitly chooses a documented mixed-audio mode). Do not pause/restart the video every time an ordinary cue changes. Decide a simple policy: tutorial audio has priority while playing; coach may pause/mute tutorial only for a safety-critical cue, with a visible state, or defer non-critical speech.
- Avoid concurrent STT and TTS. Pause/stop listening while TTS speaks and resume only when the chosen activation mode allows it. Do not continually restart recognition after every speech event.
- Treat haptics as confirmations for deliberate user actions or meaningful exercise transitions, not every frame or every minor cue.
- Speech text should be short, calm, contextually useful, and natural. Avoid overenthusiastic/robotic phrases such as repeated ‘outstanding effort’, ‘let’s get right back into strong form’ or long explanations for every button. Use concise acknowledgements and let silence remain normal. Speak only on debounced state transitions, confirmed reps or rare actionable cues. Rate-limit repeated cues, coalesce interruptions, cancel obsolete speech when state changes, and stop speech on pause/end/backgrounding. Update any stale help prompt that claims gestures are active ‘anytime’; state accurately when voice/gesture commands are enabled.
- Do not speak a “rep complete” message for invalid or faulted reps. Do not announce an achieved reward before persisted state confirms it.
- When the tutorial is playing, suppress unnecessary idle nudges and repetitive coaching that compete with the instructor.

Test on the actual Android device with media volume and speech toggle both on and off, first tutorial play, pause/resume, TTS interruption, STT, Android back, background/resume and a full exercise. A code-level unit test alone cannot prove Android audio focus works.

---

# 5. P1 — MAKE THE YOUTUBE TUTORIAL WORK ON THE FIRST INTENTIONAL PLAY

Trace `YouTubePlayer`, `CoachVideoStage`, `videoFor`, media registry, callbacks, fullscreen and every mount/unmount. Current excerpt initializes `videoPlaying` false, has `videoMounted`, mounts the player after a short delayed interaction callback, and may call `player.play()` from gesture/command handlers. Verify current code before refactoring.

Required behavior:

1. One authoritative video/player state. Do not maintain conflicting “playing” booleans that disagree with the actual player event.
2. Loading the player is not the same as playing. Wait for the provider/player's real ready state; update UI using actual playback callbacks. Display meaningful `loading`, `ready`, `playing`, `paused`, `ended`, `unavailable`, `embed blocked`, and `error` states.
3. Preserve the requested first-time learning behavior: on the first use of an exercise, show a skippable tutorial introduction and request autoplay only if the platform/player permits it from the valid user action that started the flow. If autoplay is blocked by provider or user-gesture rules, show a ready player with an obvious one-tap Play action—never a dead or swallowed first tap. Do not auto-play just because the camera or a hidden player mounted. On repeat sessions, default the tutorial to minimized PiP rather than restarting loudly.
4. The first Play tap must not be swallowed by an unready WebView or overwritten by a later effect. If the player isn't ready, record one pending user intent, execute it once on ready, and clear it safely. Double taps must not issue contradictory play/pause commands.
5. Ensure correct video ID/URL mapping for each exercise. No irrelevant filler video and no claim a search result is a verified tutorial. If a direct video is unavailable or embedding is forbidden, show an honest in-app fallback/search experience with attribution.
6. Keep playback inside the app when supported and permitted. Do not download/rehost videos or launch an external YouTube app by default.
7. Handle aspect ratio, layout/safe areas, PiP/minimize/hide state, orientation/fullscreen, Android back, route changes, remounting, errors and restoration without resetting the exercise timer or pose/session state.
8. Do not mount redundant players. Do not mount a WebView on every render or remount when `videoPlaying` changes. Preserve the one session owner and stable video ID.
9. Resolve audio focus and TTS/STT arbitration using Section 4. When the player starts, confirm audio is audible at normal media volume and is not muted by an old audio session or competing TTS.
10. Opening/closing the tutorial must never start camera tracking or run commands without a user action. Pausing the video must not inadvertently pause/complete a workout unless that exact behavior is an explicit user action.

Add a player contract test and verify the first-play path on device from a fresh process, not only after the player has been warmed by a previous screen.

---

# 6. P1 — CAMERA POSITIONING, TRUE READINESS AND COUNTDOWN

The user must have time to position the phone/body without the app forcing a count-in. The supplied excerpt has a timeout that appears to start a countdown after roughly 8 seconds even if a stable person/pose is not detected, plus a separate effect that starts the countdown when `trackingReady && hasPerson`. Confirm this in current code and fix the state machine.

- Permission request/consent, camera mount, preview visible, model loading, person detected, required joints visible, correct view angle and exercise-ready are distinct states.
- Do not mark ready just because a camera opened, the model was initialized, or any nonempty array was received. Require stable recent landmarks, enough confidence/visibility for the active exercise, correct body coverage and a plausible pose for a configurable short dwell window.
- A setup prompt must be specific and calm: stand/move back, bring feet into view, turn sideways, improve lighting, keep required joints visible, or hold still. Show one concise actionable tip at a time; avoid duplicate banners and repeated speech.
- Camera positioning may keep updating landmarks and framing state, but it cannot run reps, gesture commands, TTS chatter or set completion.
- An explicit Start tap is required before a countdown. If an auto-start-on-ready option already exists, keep it off by default and make it explicit/consented. Never start merely because eight seconds passed.
- If readiness is lost during countdown, cancel/pause it according to state machine policy and return to setup. A countdown uses monotonic elapsed time so it does not drift after JS stalls.
- Provide clear Cancel/Back and manual/timed fallback if permission is denied, the device lacks the camera, tracking is unavailable or the exercise does not support vision.
- Start the exercise timer from the canonical session transition, not before permissions/player/model readiness or from multiple competing timers.
- Do not force tutorial autoplay. Setup feedback should be visual while a video is playing unless voice is enabled and audio is available.

Tests: person never enters frame; person enters but feet are cut off; model loads while no person is seen; stable pose; pose lost during countdown; camera denied; camera toggled; tutorial loading; app background/resume; fast repeated Start; user cancels; timed/manual mode.

---

# 7. P1 — PROFILE THE REAL-TIME VISION PIPELINE BEFORE CHANGING FRAMEWORKS

## 7.1 Map the complete data path

Trace and diagram the actual path with source file/function names:

`CameraX capture → ImageProxy/planes → pixel conversion → rotation/mirror/crop → MPImage ownership → MediaPipe task/delegate → result timestamps → native-to-JS delivery → landmark/visibility filtering → coordinate transform → Skia paint → actual rendered frame`.

Also trace the independent exercise-control path:

`fresh landmarks → valid joint/angle features → exercise-specific phase state machine → confirmed rep/hold → cue arbitration → canonical session update → persistence/reward/quest update`.

Record capture cadence, analysis cadence, detector p50/p95, capture-to-result age, result-to-render age, result frame drops, JS callback time, Skia draw work, memory/GC, temperature/thermal state and preview frame cadence where tools allow. Keep diagnostics lightweight and redacted; never log camera pixels or private health data.

## 7.2 Current supplied `PoseCameraView.kt` risks — verify each against current branch

The shared excerpt (which may differ from commit `df934b1`) suggests investigating:

- `image.toBitmap()` per accepted frame, a new `Matrix`, rotation/mirroring and `Bitmap.createBitmap(...)`. A recent commit reportedly introduced reusable `srcBmp`, `outBmps`, `xform` and `canvas`; confirm those optimizations are present in the actual current source and are correct. Never claim “zero GC” based only on a source comment.
- CameraX RGBA_8888 analysis at 640×480 and a request for ~30 fps. Measure the actual bound preview and analysis resolutions/FPS; supported target FPS does not guarantee delivered FPS. Verify field of view, crop rectangles and rotation metadata.
- MediaPipe is forced to CPU because an earlier report said GPU loaded but produced no body on a Moto G71 5G. Treat this as an old field observation, not a general truth; benchmark CPU/GPU on the actual release build and device with positive pose success/quality checks, and retain a safe fallback.
- The `inFlight` gate has a 500 ms age check that can allow a new frame while the earlier inference is still running. If the old callback returns later it can clear the new flight state. Replace timeout-based fake unlocks with bounded backpressure, session generations, explicit task completion/error state and safe recovery. Never overlap detector calls unless the API and synchronization explicitly support it.
- The supplied `analyse()` creates a single `MPImage` from `upright` and submits it to pose and optionally face/hands asynchronous detectors on alternating frames. Verify MediaPipe's ownership/lifetime contract. Do not recycle/reuse mutable bitmap memory while any detector can still read it. If several tasks use the same backing bitmap, document and test its safe lifetime and detector scheduling.
- `emit()` reads global `frameW`/`frameH`, so older results could be labeled with newer frame geometry after a resize, camera switch or session restart. Attach immutable per-frame metadata to results or reject stale generations. Store capture timestamp / frame dimensions / transform alongside the submitted inference, not in mutable global state that later frames overwrite.
- Face/hand callbacks in the excerpt stamp freshness with callback time rather than the source frame time and accept results up to `STALE_MS` 500ms old. This can display a delayed face/hand over a newer body frame. Track the source frame timestamp per detector and use a measured, strict freshness budget; clear/fade independently when stale.
- `provider.unbindAll()` can affect another camera owner in the same process. Establish ownership of the exact use cases/session. Unbind only the camera session owned by this view when possible; don't make a camera module silently disrupt another route.
- Async provider callbacks may arrive after camera/screen/session changes. Use generation tokens and exact lifecycle teardown. Ensure models and executor are created once per intended lifecycle and released exactly once.
- The GPU error-listener fallback that replaces the landmarker should be race-safe and avoid closing a detector still in use. Log/record the real failure and recovery; do not silently fall back in a way that hides missing landmarks.
- `ImageProxy.close()` must occur exactly once on every success/error/drop path. Don't keep an `ImageProxy` open while awaiting a slow model. Don't recycle the input prematurely.
- The sensor timestamp, uptime, elapsed realtime and wall-clock conversions need one documented monotonic time model. `System.currentTimeMillis()` may be useful for presentation metadata but must not drive durations. MediaPipe LIVE_STREAM timestamps must be monotonically increasing; don't hide clock problems by manufacturing timestamps that break capture-age measurement.
- The `catch (_: Exception) { }` path can silently drop every frame with no diagnostic. Use rate-limited error counters/codes and clear stale tracking state; avoid per-frame logs.

These are investigation points from a supplied excerpt, not a final verdict. Mark each confirmed, rejected or still uncertain with evidence.

## 7.3 One camera session and one detector owner

Inspect `CoachScreen`, `PoseCameraView`, `PoseDetectionAdapter`, the `pose-landmarker` native package, any beta flag, native module configuration, and all route lifecycle owners.

- The current excerpt branches by `betaMode` between direct `PoseCameraView` and `PoseDetectionAdapter`. The production Coach must not be split into two different engines through a hidden beta toggle. Select one verified production camera/detector implementation behind a typed adapter.
- No simultaneous camera session, second hidden preview, duplicate MediaPipe task set or multiple listeners for the same workout.
- Camera start/stop/switch, React mount/unmount, route blur, app background/foreground, Android permission changes and activity recreation must preserve single ownership and not leak threads/models.
- Camera use-case ownership must be scoped; don't call process-wide `unbindAll()` unless the actual package architecture can prove it owns all process camera use cases.
- Preserve the camera preview's responsiveness independently of inference. Use latest-frame backpressure and bounded queues, not a backlog of obsolete frames.

## 7.4 Bitmap/frame conversion and ownership

Read the current CameraX ImageProxy output-format docs, plane count, pixel/row stride, buffer offset/position/limit, RGBA channel ordering and MediaPipe `MPImage`/`BitmapImageBuilder` ownership for installed versions. Upstream `FrameConverter.kt` reuses a source/cropped Bitmap, Canvas and Rects, re-allocating only when dimensions or row stride change; it explicitly confines use to the analysis thread and documents buffer validity. Adopt that pattern only if the local buffer format and exact ownership contracts match.

- Test padded and unpadded row strides; never assume pixel stride equals four or rows are tightly packed unless measured.
- Preserve source/cropped bitmap sizes and lifecycle. Do not copy incorrect stride data into a narrower bitmap or shear/transpose pixels.
- Avoid per-frame `Bitmap.createBitmap` rotation copies if the detector and transform can use metadata correctly and safely. If a physical rotation copy is necessary, benchmark it and reuse buffers only after detector ownership allows it.
- Reuse native objects only when thread confinement and no-outstanding-read guarantees are provable. Never race a second model's read against a buffer being overwritten.
- On dimension/format/camera change, rebuild buffer(s) atomically, reset filters, and invalidate previous metadata. On release, release references/resources exactly once.
- Keep all conversion off the UI thread. Never move full camera pixels into JavaScript.

## 7.5 CPU/GPU, model and rate policy

Benchmark actual detector versions/model assets/delegates at the same lighting, camera, body distance, resolution and build type. Validate not only inference time but whether landmarks are present and correct. Don't call GPU “faster” if it stalls, returns empty poses, or adds recovery churn.

- Initialize/prewarm off the main thread and show truthful loading state; do not block camera preview/UI for multiple seconds.
- Cache models/delegates within supported lifecycle boundaries; do not re-create a model for every rerender or video toggle.
- Keep a clear CPU fallback when GPU setup or inference fails, with generation-safe transition, and measure fallback behavior.
- Adapt analysis FPS to the measured detector p50/p95 and thermal/memory/device constraints. Use the freshest result; do not feed faster than the model can consume.
- Use profile/rate/thermal/idle patterns from upstream only where compatible and needed. Do not copy their defaults without verifying device behavior.
- Keep face and hands inference off when not requested, unless the user explicitly enables full tracking. In full tracking mode, schedule detectors with a bounded shared budget and track separate timestamps; body pose and rep correctness get priority.

## 7.6 Native-to-JS delivery and worklet decision

The supplied JS hook constructs a new `n*3` array on every pose callback, creates landmark objects for movement logic, and writes multiple shared values (`frameW`, `frameH`, points, capturedAt, seq, face, hands). Measure bridge/serialization/allocation cost before redesigning.

Review upstream data transport carefully. Upstream ADR 0008 says Expo events cannot carry a true `ArrayBuffer` without boxing; it introduced a native ring buffer and drain tick. ADR 0010 moved drain reads to synchronous module functions on the JS thread rather than main-thread view functions because queued view calls caused lag. Other ADRs explain snapshots, duty-cycle rate and frame-reader/file-decoder behavior. Do not blindly implement the old or new idea: the versioned upstream architecture and current local stack must be reviewed together.

- Prefer minimal per-frame allocation and a bounded/latest-frame delivery protocol.
- Do not emit a high volume of individual landmark events if the rendering/control use case can be satisfied through a safer native buffer or compact payload.
- Do not introduce C++/JSI/zero-copy infrastructure just for a theoretical gain; account for New Architecture, lifecycle, ownership, testability and both development/release builds.
- If using typed arrays, ArrayBuffer, shared values or ring buffers, prove actual support and exact buffer lifetime for the installed Expo/RN/Reanimated/Skia APIs.
- Exercise math/rep detection can run in native or JS, but there must be one authoritative state machine. Move processing only when profiling justifies it and tests keep counts identical.

## 7.7 VisionCamera / Worklets / New Architecture — evaluate, don't assume

Canonical repository/docs to inspect afresh:

- `https://github.com/margelo/react-native-vision-camera`
- `https://visioncamera.margelo.com/docs`
- `https://visioncamera.margelo.com/docs/frame-output`
- `https://visioncamera.margelo.com/docs/async-frame-processing`
- `https://visioncamera.margelo.com/docs/skia-frame-processors`
- `https://visioncamera.margelo.com/docs/performance`
- `https://visioncamera.margelo.com/docs/coordinate-systems`
- `https://docs.swmansion.com/react-native-worklets/docs/`

Inspect actual installed/publicly available package version, source/commit, license, changelog, plugin/autolinking, peer dependencies, Nitro/JSI/New Architecture requirements and Android release support. Check whether the evaluated VisionCamera major uses `useFrameProcessor` + `react-native-worklets-core` or a different newer Frame Output/Worklets API. Never mix major-version APIs. The V5 rewrite described in some docs may not be publicly available/production-ready in the actual environment; verify, don't assume.

If an async frame runner is used, explicitly handle busy/drop semantics. Official frame-output contracts require each frame to be disposed exactly once; dropped frames must be released promptly and frames accepted by async work must be released at the correct completion point. Verify in current docs/source rather than relying on this summary alone.

Deliver a comparison table: current CameraX/Expo MediaPipe vs a version-compatible VisionCamera integration. Score compatibility, frame ownership, preview stability, output format, conversion cost, JS/worklet/native boundaries, Skia transform, lifecycle complexity, migration risk, performance measured on target device, release build and maintenance cost. Make a short ADR with accept/adapt/reject. Default to fixing the existing camera unless measured evidence shows an architecture migration is necessary and safe. No second camera owner on one device.

---

# 8. COORDINATES, FRESHNESS, FILTERING AND CORRECT ANATOMY

A smooth overlay that is shifted or delayed is a failure. Correct data and geometry come before aesthetic filtering.

## 8.1 One source of truth for transform

Define and test one coordinate-transform pipeline for model normalized coordinates → upright inference image → sensor rotation → front-camera mirror (exactly once) → preview crop/FILL_CENTER → actual view bounds → Skia canvas. Use current official camera/preview transform APIs if available. Do not add arbitrary pixel offsets, independent component-specific scale math or mirror the same coordinates twice.

Capture immutable frame metadata per detection: frame width/height, rotation/target rotation, lens facing, preview crop/scale mode, transform version/generation, capture timestamp and inference timestamp. If metadata no longer matches current camera/view geometry, discard that result rather than drawing it with new dimensions.

Test front/back camera, portrait/landscape, rotations, crop/FILL_CENTER, short/tall phones, resolution changes and partially visible bodies. `PreviewView.ScaleType.FILL_CENTER` may crop the preview; normalized full-frame points need matching crop offsets/scales or they will drift even if preview and image are nominally 4:3.

## 8.2 Freshness and dropout

- Separate detection success from “some point array exists.” Validate landmark count, finite coordinates, visibility/confidence and exercise-specific joint availability.
- Every visible overlay has a freshness budget based on capture-to-render age. If result age crosses that budget, fade/clear it and stop giving live coaching corrections until fresh input returns. Don't leave old coordinates indefinitely.
- Track frame/detector timestamps through all callbacks. Reject out-of-order or old-session results. Pose, face and hands can have different capture times; don't pretend the same timestamp if they do not.
- On pose loss, keep the last confirmed reps/session state but show tracking lost, stop form cues/reps/gesture commands, and request a reposition only when actionable. Reset filters after loss/gap/camera change rather than smoothing across discontinuities.
- Use monotonic time for durations, cooldowns, latency and rep state-machine intervals. Use wall-clock time only for persisted human timestamps where appropriate.

## 8.3 Smoothing without trailing

Inspect MediaPipe's current smoothing for the chosen single-pose/video mode before applying another filter. Do not stack two heavy filters. If additional filtering is needed, use a measured, time-aware low-lag filter (e.g. a tuned One-Euro style approach) on x/y/z only—not visibility/confidence. Visibility loss must remain rapid and clear. Reset on discontinuity. Tune quick motions, holds and reacquisition on a real body, not just replayed mock points.

## 8.4 Skia overlay design: premium, restrained, high performance

Use the installed `@shopify/react-native-skia` for the high-frequency drawing layer if current compatibility is sound. Benchmark first; a native camera preview plus a dedicated Skia overlay may be cheaper than passing full camera frames through Skia.

Visual direction: a calm, precise, futuristic fitness instrument with intentional shapes—not a neon spider web or generic AI skeleton.

- The core body graph uses the correct anatomical topology, thin connected lines with rounded joins/caps, legible contrast across light/dark backgrounds and restrained selected joint nodes.
- Emphasize only the joints/segments relevant to the exercise or movement phase. Use small, well-shaped dots or subtle dashed/laser accents selectively, not a glowing dot on every landmark at all times.
- Any gradient/highlight is restrained, theme-token-driven and static/cheap where possible. A purpose-built top/bottom edge gradient on the immersive full-screen camera may be retained for HUD legibility, but don't turn ordinary content cards into linear-gradient panels. Avoid full-screen blur, per-joint glow filters, many shadows, continuously animated scan lines and per-frame path/paint allocations.
- Prefer stable canvas structures and reusable drawing values; keep static UI outside the frame-updating canvas. Update through the lowest-cost compatible interface, no whole-screen React rerender per frame.
- Distinguish `tracking`, `ready`, `movement detected`, `guidance needed`, `hold reached` and `tracking lost` without implying a green skeleton means clinically or biomechanically perfect form.
- Face/eye/hand overlays have separate visibility toggles and palettes/topologies. Keep the face mesh/eye/iris view off by default for normal training, but preserve capability; don't show them when stale or when the user has not enabled them.
- Do not display all 478 face points by default if a selected, stable subset is enough. The supplied API has groups for eyes, irises, brows, lips and outline, and hand topology uses 21 joints; validate the exact index ordering in code. Don't create broken lines by assuming group indices from a different model.
- Include a useful non-tracking fallback when native view/model is unavailable; don't show fake landmarks or pretend detection is active.
- Respect reduced-motion/accessibility preferences. No spring/bounce/elastic motion.

Use design assets and tokens from the existing Thrivefold brand; the BlinkQuest warm terracotta/ivory aesthetic can be an inspiration if those assets are available, not permission to hardcode a second theme throughout Thrivefold. No sparkle icons or decorative AI motif; avoid the generic stacked-card look. Keep the camera/person the main visual focus.

---

# 9. FIX THE REAL JAVASCRIPT / WORKLET HOT PATH

Inspect `usePoseTracking`, `PoseOverlay`, cue engine, movement/gesture helpers, `useCoachSession`, state subscriptions and render tree.

- No per-frame `setState` for landmarks. React state should change only for meaningful state transitions such as person found/lost, framing cue changed, rep confirmed, fault changed, session phase changed, error or readiness.
- Audit all `useCallback` dependencies, stale closures, refs, timers and old session callbacks. A stable native event callback must forward to the newest handler without allowing an old workout to mutate a new one.
- Reduce allocation/boxing of `points`, `landmarksOf`, `hands.flat()`, arrays, objects and maps only when safe and measured. The JS representation in an Expo event may already be boxed; do not pretend a `DoubleArray` event is a zero-copy Float32Array.
- Shared values are for render data, not a second source of session truth. Avoid updating redundant shared values independently if a compact coherent frame object/sequence can carry the same data and is actually supported.
- Keep haptics, TTS, analytics, networking, local AI and database writes out of the per-frame path. Emit only from rate-limited, confirmed transitions.
- Use stable `Skia` paints/paths or efficient declarative path generation compatible with the installed Skia version. No building a large React component tree for every joint.
- Profile JS handler duration, callback frequency, dropped events, React renders, Skia work, heap/GC, and frame age. Optimize the demonstrated bottleneck, not aesthetics of the code alone.
- When pose is stale or missing, stop gesture/rep processing immediately and expose a clear state.

---

# 10. BUILD A REAL EXERCISE COACH, NOT A CAMERA DEMO

## 10.1 One canonical exercise/session state machine

The full flow must work from every existing entry point (Quests, Train, Home/Today, Calendar or task detail):

`exercise/task selection → instructions/tutorial → permission/positioning → stable readiness → explicit start/countdown → active set → valid reps or hold duration → pause/resume → rest/next set → completion review → saved session → history/progress/calendar/quest state → eligible reward once`.

Use one authoritative session state and one canonical timer. Don't let UI, detector, video player, voice command service and workout repository each maintain competing counters/timers. Define typed transitions, including initialization, positioning, ready, countdown, active set, rest, paused, tracking lost, manual fallback, interrupted, completion, cancelled and recoverable failure.

## 10.2 Valid rep tracking and holds

For each exercise that claims camera verification, specify the actual observable joints/features, camera angle requirements, minimum confidence, initial/approach/target/return phases, hysteresis, velocity or dwell requirements where applicable, cooldown, reset/loss rules, common false positives and supported faults. Add deterministic unit tests with realistic timelines. No counting from arbitrary elapsed time or a single threshold-crossing frame.

- Reject double counts caused by jitter, dropped frames or holding at the target.
- Do not count a rep while required joints are hidden or confidence is below threshold.
- Correctly distinguish repetitions, timed holds, flow/sequences and manual sessions.
- Time using monotonic timestamps and elapsed-time deltas, not increment-per-interval counters that drift when JS is busy.
- `progressOf()` / `stepReps()` / `validFrames` or their current equivalents must remain the single authoritative calculation source.
- Don't award target completion based on `item.target` in a fallback branch when the user did not complete the set. Manual completion must be a distinct, explicit path and saved as manually completed rather than vision-verified.

## 10.3 Capability registry for the entire exercise catalog

Audit the current catalog and `capabilityRegistry` (or actual equivalent). Every exercise must advertise truthful support such as:

- `vision_verified` — automated counting/form checks tested for this movement and view;
- `vision_assisted` — camera supplies limited feedback but cannot verify all required outcomes;
- `timed` — duration verified by the timer, not vision;
- `manual` — user reports completion with honest labeling;
- `video_only` / `instructions_only` if that is the actual support.

No all-exercise “AI-powered” claim without coverage evidence. Run a coverage sweep for all current exercises and applicable quests. For supported exercises, test right angle/front/back view, required joints visible, occlusion, low light, body enters/leaves, side selection, fast/slow movement, fatigue and camera switch. Keep fallbacks honest.

## 10.4 Timers, rest and progression

- One canonical session clock; pause/resume must suspend/resume time exactly. Tutorial playback must not reset a workout.
- Rest duration/add-rest changes apply exactly once. No add-rest triggered by an accidental gesture.
- Next set/exercise only on explicit command or documented completed state. Stop/End must ask only when necessary and preserve actual completed sets.
- Prevent duplicate completion writes/rewards with stable idempotency/session IDs. Persist actual counts and completion policy.
- Only update linked quest/calendar/progress/reward after the canonical completion policy succeeds. Use the existing progression ledger and task catalog v3. Never create duplicate reward economy/engine.
- Completion screen shows the actual workout, sets/reps/hold/time, saved status and only earned/eligible rewards. It has functional Review, Done and Continue paths and looks premium, not like a pile of generic cards.
- Background/foreground and process recreation must safely pause/restore the session or present a clear recovery choice. Always close camera/model/audio resources on end/background according to the current product policy.

## 10.5 Coach component audit and UI polish

Locate actual current files/callers for at least:

`CoachScreen`, `CoachIntro`, `CoachVideoStage`, `YouTubePlayer`, `PoseCameraView`, `PoseOverlay`, `usePoseTracking`, `useCoachSession`, movement/rep state, cue engine, voice command parser, `CoachHUD`, `CoachBanner`, `PositioningCard`, `CountdownOverlay`, `RestOverlay`, `SessionComplete`, `GestureRemoteGuideModal`, `CoachGlass`, `ProgressRing`, glass-orb controls, `FrostedView`, modal/sheet components and theme tokens.

- Recover the last-known-good UI from Git history and compare screenshots. Preserve working behavior and the glass-orb buttons the owner likes.
- During a live session, use the available immersive layout appropriately: hide the status bar/system bars only when safe and restore them on completion, backgrounding, error and navigation; do not trap Android back.
- Intro: concise exercise purpose, goal/sets/reps/duration, required camera angle, tutorial, equipment, key safety note, capability truthfulness and one clear primary action. Progressive disclosure for secondary details. During the first visit for that exercise, offer the requested skippable tutorial; on later visits default it to minimized PiP. Include a genuine preference/action to hide the player completely, restore it, swap which window is primary, and expand to fullscreen without resetting session state. Follow player/platform autoplay constraints rather than faking a playing state.
- Positioning: one compact, purposeful status banner at a time. Keep banners out of joints/face, avoid redundant overlays, ensure text fits smaller phones and avoid flickering as frames change.
- HUD: rep/time and set are the most prominent values, the current cue is short, controls are stable and tappable. No overlapping cards or tiny text over moving limbs.
- Countdown: clear visual hierarchy and one quiet intentional sound or speech only if enabled; cancel correctly on tracking loss.
- Rest: clear remaining time, next exercise and purposeful actions; no fake animations or reward claims.
- Completion: actual persistence state, earned progress only, consistent spacing, typography, buttons and animation. Ensure native camera disappears and all services stop after completion.
- Keep existing theme tokens. Reduce excess linear gradients and fake/translucent surfaces. Use `FrostedView` only where there is a real, verified backdrop effect. Reanimated is not the fix for the camera frame pipeline; use restrained existing animations only for UI transitions after performance is measured.

---

# 11. THE REST OF THRIVEFOLD IS STILL IN SCOPE

The focused Coach repair is not authorization to discard the full platform requirements. After P0 stability/voice/video fixes and the complete Coach vertical slice are verified, continue automatically through all remaining applicable tasks in the authoritative repo specification. Respect any project-specific ordering that remains valid (including Religion/Culture/Worldview when the current spec names it as a priority). Don't stop at one screen or one build.

## 11.1 One integrated architecture and data authority

Inventory and reuse the actual systems for Expo SQLite/local persistence, Supabase/PostgreSQL, RLS, migrations, React Query, Zustand, local analytics, Firebase Analytics/Crashlytics, AI providers, embeddings/RAG, memory, notifications, local AI runtime and native modules.

Use clear responsibilities appropriate to current code: local durable/offline data and pending sync; server-owned shared/account data and access policy; React Query for remote cache/fetch lifecycle; Zustand for deliberate transient UI state; existing analytics/crash pipelines; AI for optional classification/summarization/retrieval rather than deterministic authority. Do not add a second database, tracking pipeline, query client, task engine, AI gateway, vector store or progression ledger without evidence and an ADR.

Preserve local user data and historical records. Use additive versioned migrations, idempotent upserts, explicit source-of-truth ownership, sync conflict handling, retry/offline states and backup/export/delete flows.

## 11.2 Authentication, onboarding, Home/Today and navigation

- Preserve the actual bottom-tab order/names and established Home/Today/Cycle & Calendar flow from current code/history. Do not create another tab or move Train into a new bottom tab solely to make it accessible.
- Train is a dedicated route within the unified Quests & Activities domain, accessible from the existing drawer and contextual links. It must not become a duplicate task/award engine.
- Fix onboarding completion state if users finish setup but Home still says steps remain. Use one real setup-progress source of truth, not duplicated local flags.
- Onboarding is goal-driven, progressive and low-friction: ask only what a chosen goal needs; reuse user-approved existing data; preserve drafts. Health/identity/profile information is optional where it should be and never invented.
- Support actual auth/session restore, recovery and guest/local modes per the current product spec. All visible navigation links and deep links must resolve and enforce the same eligibility/authorization as UI navigation.
- Repair render loops caused by unstable selectors returning new arrays/objects; verify subscriptions and memoization from actual symptoms.

## 11.3 Calendar, women's health, men's health and shared health

- Keep the universal calendar for relevant events, appointments, workouts, meals, birthdays/anniversaries, travel, holidays, finance/reminders as supported. Add/Edit Event forms and all fields must remain accessible with the Android keyboard open; focused inputs scroll into view, Save remains reachable, picker transitions preserve drafts, Android back behaves correctly, and the saved event persists at the correct date/time/time zone.
- Preserve the existing women's cycle-history and reproductive-health experience. Implement cycle phases and calculations according to the authoritative domain spec, uncertainty and history preservation. Do not show menstrual/cycle UI to profiles not using that health experience; the shared calendar remains available.
- Keep suitable men's health/mobility/recovery/sleep/stress and exercise education; optional LGBTQ+ wellbeing; general health and accessibility. Don't reduce men's health to bodybuilding, and don't make unsubstantiated health claims.
- Preserve and verify the full existing health inventory where present: cycle/period logging using start date and daily flow/symptoms rather than requiring an artificial end date at log time; mood and energy scales (historically 1–10); physical/mental/energy symptom categories and severity; circadian sleep duration/quality and wind-down; hydration and nutrition; meal logging; non-prescriptive medication reminders; pelvic-floor contraction/reverse-Kegel timers with hypertonic-care warnings; health history/timeline and Excel export (encrypted/un-encrypted only if the existing user-authorized export flow supports it). Do not assume every listed route is implemented: verify code, persistence and tests.
- Only display genuinely available vitals with provenance and permission (manual input, supported wearable/Health Connect/provider source). Never fabricate heart rate, BP, SpO2, respiratory rate or other medical measurements from an ordinary phone camera unless the specific validated hardware/sensor/library truly supports it.
- BMI or calculations must be correctly validated and clearly presented as non-diagnostic. Medication, pregnancy, postpartum, PCOS/PCOD, irregular cycles and menopause support must follow current scope, privacy and safety rules and avoid diagnosis.

## 11.4 Tasks, catalog v3, quests, games and progression

- Use the current authoritative catalog v3 only, with typed validation and evidence. Don't resurrect old task catalogs or define quest records inside screens.
- Keep assignments, tasks, special quests, replacement/skip policy, exercise sessions, games, XP, levels, diamonds, streaks, achievements, unlocks, calendar and progress in one connected domain.
- Skip/replacement must respect same-category eligibility and daily limits. Points and permanent progression must remain distinct if the spec requires it. Store rewards in the current append-only/ledger mechanism and prevent duplicates through idempotent completion keys.
- A feature unlock must be genuinely implemented and server-authorized/locally persisted as documented—not only hidden/shown UI. Eligibility decisions must be traceable and testable.
- Show achievement/level-clear modals only after the underlying persisted event exists. Reuse existing modal components; no sparkle icons or invented people/metrics.

## 11.5 Nutrition and meal logging

- Restore Log Meals, photo/gallery access and persistence. Verify actual image picker/Gallery permissions and route state. No dead buttons or fake saved meals.
- Photo identification should present plausible candidates and confidence/limitations, use the available food reference database (USDA/IFCT where already integrated), allow portion/ingredient correction, and use deterministic source-backed nutrient calculations. AI may estimate missing detail only as a labeled draft with user review/confirmation.
- Do not report false precision or claim macros were “verified” by AI without evidence. Manual meal logging works offline and without AI. On submit, prevent duplicate writes, persist the meal, update daily totals only once and provide recoverable errors.

## 11.6 Local AI, BYOK, RAG, memory and agentic operations

- Audit the existing local runtime (including Llamatik if present), model download/storage, capability checks, model readiness, streaming, cancellation, memory and embedding indices. Never fake loading progress or claim a local model is installed/running without evidence.
- Reuse existing provider/BYOK adapters and protect credentials in appropriate local storage. Never ship secrets or service-role keys in the mobile bundle or logs. Historically named providers include Gemini, Groq, OpenRouter and Sarvam AI, plus optional Deepgram/ElevenLabs voice services; inspect current adapters and actual credential availability, don't assume any one is configured. The user's correction is Sarvam AI (not an autocorrected look-alike). Keep deterministic STT command control functional without these providers.
- Use deterministic code for validation, authorization, health/cycle calculations, workout reps, task completion, rewards and command execution. AI can aid natural-language interpretation, summaries, user-approved draft form filling, classification and retrieval—but must not commit sensitive/destructive actions without user review.
- RAG must include authorized ingestion, stable source/chunk IDs, versioned embeddings, correct vector dimensions, hybrid retrieval if supported, relevance filtering, source-aware context, insufficient-evidence responses, deletion/re-indexing and RLS/permission filters. Keep personal memory, public help and shared community data logically separated.
- Memory must be user-reviewable, correctable, selectively deletable/exportable and grounded in provenance. Do not infer religion, caste, nationality, gender identity, sexual orientation, political beliefs or medical diagnoses from name, location, language, behavior, food, photo, voice or device signals.
- Emergency and therapy paths must be deterministic and safe, use current region-appropriate resources, not promise clinical care, and require confirmation before calling/sending anything. Verify actual platform/region/resource details before release.

## 11.7 Culture, worldview, communities and controlled correspondence

- Complete the project’s declared Religion/Culture/Worldview engine where still required: user-declared optional profiles, taxonomy/aliases/search, localization-ready records, privacy and edits, and server-side policy where needed. No covert inference and no silent eligibility changes.
- Communities, therapy/practice circles, groups, NGOs/business/corporate/organization tools where part of the approved product, gym-buddy and correspondence flows must use real auth, policy, consent, blocking/reporting, age and safety restrictions, recipient boundaries, server-side access enforcement, auditability and data lifecycle. Circle capabilities historically include guideline acceptance, join/approval queues, owner/facilitator roles, facilitator notes, scheduled sessions/RSVP, membership management and reporting; verify each actual route/permission.
- Slow Letter capabilities in the historical spec include drafts, inbox/outbox, discovery/open letters, privacy preferences, stamps, delivery simulation/transit delays based on broad geographic bands, and curated conversational-chip composition. Do not require precise location if broad bands suffice. If chip-only composition is the current safety requirement, enforce it on the backend as well as UI; don't leave a free-text bypass in an API.
- Adult-only discovery/correspondence is gated by real, permitted age assurance (18+ where the spec requires it), mutual consent, recipient boundaries and server-side eligibility. The historically described women-first first-contact and mutual-interest requirements must be reviewed for legal/platform safety before production activation. Immediate reporting should preserve only policy-required evidence in appropriately encrypted/retained case records and block both directions when the policy requires it.
- For Slow Letter / controlled correspondence, keep progressive eligibility/levels/achievements and user-initiated steps, but do not expose the explicitly banned word in any user-facing copy. Preserve clear privacy/eligibility explanations without disguising capability to evade a platform or legal review.
- Mark any sensitive identity-based eligibility policy that needs legal/platform review as review-required; do not silently activate it in production.

## 11.8 Analytics, notifications and connected apps

- Reuse existing Firebase Analytics, Crashlytics, local diagnostics and notification scheduling. Audit duplicate initialization and event pipelines, consent, retention, redaction and environment gating.
- Emit meaningful state-transition events, not every frame. Never send raw camera, transcript, journal, private health values or BYOK secrets as telemetry.
- Smart health reminders should use the existing stored preferences/timezone/consent; don't duplicate schedules or spam users. Make notification permissions and schedule state truthful.
- Connected apps and integrations need real source/provenance, scopes, sync/error states, and documented unsupported integrations. Don't display fabricated connections or metrics.

## 11.9 Product design/navigation and the complete feature inventory

- Inspect and preserve the actual existing design system and navigation. Historical product descriptions call for zero-shadow Squircle-style surfaces, restrained warm/neutral palettes, clear Geist-like typography, Ionicons (or the current installed icon set), and the established Home / Today / Progress / You tabs with the central Thrive Orb. Treat those as historical clues: compare the live code/Git screenshots and preserve the real current labels/order rather than forcing stale tokens.
- Keep Women's Health, Men's Health and optional Pride/LGBTQ+ wellbeing as profile-selected experiences that users can change in settings. Privacy/discrete mode must genuinely hide sensitive information in the UI and notifications when enabled.
- Preserve the daily health/somatics inventory listed in Section 11.3. Preserve the unified quests/tasks/games/train/progression system, tutorial registry, camera Coach, local AI and user-controlled memory, emergency support, private circles/communities, controlled correspondence, and all approved backend/admin experiences.
- The historical Coach catalog claimed up to 77 exercise entries, including standard body-weight/mobility movements, yoga (e.g. Surya Namaskar and Warrior series), Kalaripayattu stances, Dand-Baithak/Hindu push-up/squat variants and martial-arts basics. Treat this as a coverage-audit lead; compare actual catalog IDs and never inflate counts or mark every movement vision-verified without tests.
- Preserve app intro, sign-in/sign-up/recovery/session restoration, guest/local mode, onboarding/profile/settings, Home/Today setup progress, check-ins, universal calendar, health history/export, meal logging/Gallery, quests/special quests, games, progression/achievements, Coach/Train, AI/memory/Ask Thrive, notifications, connected apps, circles and correspondence as applicable. Every visible route must work or expose a truthful disabled/blocked state.
- The historical spec says core health, timers, check-ins and local workouts should work offline and without an account, while social and cloud-AI features are consent-gated. Preserve that local-first principle. Audit MMKV, SQLite, Supabase and any other stores; do not assume all data belongs to one store. Define canonical ownership and sync rules from the current code and spec, preserve historical records, and avoid duplicate sources of truth.
- If monetization conflicts remain (strict no-purchase policy versus old trial/credits/subscription proposals), see Section 1.2: don't invent or activate billing. Keep a documented decision and use current approved requirements.

## 11.10 Shared UI foundation, blur, sheets, keyboard and Gallery

- Repair `FrostedView` as true backdrop blur where the installed Android stack supports it. Distinguish a tinted translucent fallback from actual blur. Verify the real target/background capture in portal/modal layouts. `expo-motion-blur` is a different effect and must not substitute for backdrop blur.
- Audit `AppBottomSheetModal`, portal layers, close/backdrop/back actions, drag-vs-scroll ownership, safe-area/IME insets and keyboard-aware scroll for all call sites, including Calendar Add/Edit Event. Fields must be reachable and drafts preserved when the keyboard/date picker changes.
- Fix Gallery and Log Meals navigation/permissions/storage. Ensure no overlay intercepts taps unintentionally; no half-dismissed stale sheet state or duplicate submits.
- Do not add duplicate modal stacks, blur providers, theme systems, navigation roots or gesture roots before proving the current foundation cannot be repaired.

---

# 12. UPSTREAM POSE-DETECTION SOURCE TREE: RECURSIVE REVIEW CONTRACT

Review the repo/docs/tests at the current pinned revision and then check whether upstream has changed. The previously inspected repository tree had SHA:

`c1ff344dd16937f404409326df7242ea92e445b9`

Root: `https://github.com/khalid999devs/react-native-pose-detection`

Android tree: `https://github.com/khalid999devs/react-native-pose-detection/tree/main/packages/core/android/src/main/java/com/posedetection`

Relevant implementation groups discovered in that tree include:

- Top-level: `ErrorCode.kt`, `Permissions.kt`, `PoseDetectionModule.kt`, `PoseLog.kt`, `Skeleton.kt`.
- `camera/`: `CameraSource.kt`, `FrameConverter.kt`.
- `detector/`: `DetectorCache.kt`, `FileDetector.kt`, `PoseDetector.kt`, `SampleSlots.kt`, `StaticDetection.kt`, `StaticOptions.kt`, `StillImage.kt`, `VideoFrameSampler.kt`.
- `engine/`: `Conditions.kt`, `DataParsing.kt`, `FrameStreams.kt`, `FrameWire.kt`, `Geometry.kt`, `OneEuroFilter.kt`, `PoseTrack.kt`, `TriggerParsing.kt`, `Triggers.kt`, `VisibilityClock.kt`.
- `export/`: `ExportAudio.kt`, `ExportCanvas.kt`, `ExportGl.kt`, `ExportOptions.kt`, `ExportPump.kt`, `PoseExport.kt`, `VideoExporter.kt`.
- `performance/`: `Calibrator.kt`, `FilePacer.kt`, `Performance.kt`.
- `view/`: `OverlayConfig.kt`, `OverlayParsing.kt`, `OverlayProjection.kt`, `OverlayRenderer.kt`, `OverlayView.kt`, `PoseCameraView.kt`.
- Android tests for frame rates, rotation, ring buffer/streams, one-euro filter, triggers/conditions, pose tracks, visibility clock, calibrator, rate governor/thermal mapping, overlay projection and export.
- TypeScript/native contracts: `packages/core/src/PoseCamera.tsx`, `frames/accessors.ts`, `frames/decodeFrames.ts`, `frames/wire.ts`, native contract/functions, permissions, camera/frame/joint/event/prop types, validation, smoothing and logging.
- Docs, CI, examples, license and architecture decisions `docs/adr/0001` through `0012`.

This path list is an inventory, not proof that each file has been read. Recursively inspect all relevant files and tests, and update the inventory with read/evidence status. Review other nested files discovered through the live tree too.

Important upstream design context already checked:

- ADR 0001 accepted owning the camera rather than making VisionCamera a required dependency; a VisionCamera adapter was described as a later additional entry point. Camera orientation/lifecycle is a major bug source.
- ADR 0008 introduced bounded native frame buffering and drain rather than pushing large arrays through Expo events because event conversion boxes numeric arrays. It also describes a self-describing wire format and timestamped frames.
- ADR 0010 moved drains from view functions on Android main queue to module functions on the JavaScript thread because queued view calls made reads wait behind layout/preview work. Don't copy outdated ADR 0008 details without its amendment.
- `FrameConverter.kt` reuses `Bitmap`, `Canvas` and `Rect`, handling row stride, and states analysis-thread-only ownership. It says the converted bitmap is valid until the next call and that MediaPipe copies pixels before detection returns; independently validate this against our actual MediaPipe version/call pattern.
- `CameraSource.kt` owns exact use cases/configuration, keeps start tokens to reject stale provider callbacks, and has explicit switching/pause/release behavior. Inspect its current implementation and don't assume its comments make process-wide unbinding safe in every app.
- `OneEuroFilter.kt` uses real elapsed time, resets on discontinuity and smooths x/y/z, not visibility. Its default constants are package-specific and must not be copied blindly.
- `Performance.kt` has device/profile budgets, p50-derived capacity, thermal/idle/low-power rate governance and bounded FPS. These are examples to evaluate against device measurements, not guaranteed settings.

Required deliverable: an upstream-to-local matrix with exact path and pinned commit, pattern, local equivalent, compatibility, test coverage, adopt/adapt/reject decision, and the test that proves it. Do not copy a whole library or its assumptions without license and version review. Keep attribution/license requirements if code is derived.

---

# 13. TEST STRATEGY — BEHAVIOR, NATIVE LIFECYCLE, REAL DEVICE, WHOLE PRODUCT

## 13.1 Unit/pure logic tests

Cover at minimum:

- Voice parser intent precision, final-vs-interim transcripts, duplicate result, unknown phrase, confidence/aliases, disabled state and action/state allowlist.
- Gesture dwell/confidence/neutral reset/cooldown, gestures suppressed while positioning/countdown/tutorial/paused, no default completion on unknown gesture.
- Session state transitions and countdown cancel/restart, timer pause/resume, invalid rep, valid rep, hold, lost tracking, manual fallback, cancel and idempotent completion.
- Camera timestamp ordering, session generation, freshness thresholds, clock conversion and result rejection after switch/release.
- Transform math for front/back, crop, portrait/landscape, FILL_CENTER, differing aspect ratio, resolution updates and view bounds.
- Filtering reset and visibility dropping, missing/NaN coordinates, occlusion, reacquisition and stale frames.
- Frame buffer size/stride/layout and ownership assumptions that can be tested in the current setup.
- Audio arbitration: tutorial priority, TTS disabled, TTS cancellation, STT no-listen while TTS when required, no stale speech after session end.
- Reward/session persistence idempotency and supported/unsupported exercise capability.

## 13.2 Native/integration checks

- Expo module autolinking and exact JS/native module names, model asset presence, camera permission, module availability and event delivery in both dev and release variants.
- Camera start/stop/restart, view unmount, route changes, camera switch, provider callback stale rejection, no leaked executors/models and no competing camera sessions.
- MediaPipe model creation, positive detection, inference error, CPU/GPU fallback and detector shutdown under load.
- Reusable bitmap/MPImage lifecycle under concurrent or alternating detectors, only when safe to test directly.
- YouTube player ready/play/pause/error/first gesture and audio policy.
- Calendar fields with keyboard open, BottomSheet drag+scroll, Gallery and Log Meals.

## 13.3 Physical Android device tests are mandatory when available

Check `adb devices -l`; record model/API/build and exact installed application/version. Install the exact artifact being evaluated and capture logs. If a physical device is unavailable/unauthorized, say that precisely and continue other tests.

Run this focused acceptance script:

1. Cold launch; check no crash/native-module error.
2. Open Train/Coach from each real supported entry point.
3. Open a tutorial and tap Play once on a fresh session; verify the first tap works and audio is audible, correctly routed and not overlapped by TTS.
4. Position the phone; raise arms/move hands/change angle/correct clothing; confirm no command, rest addition, video toggle, navigation, set completion or speech is triggered.
5. Wait longer than any previous setup timeout while remaining unready; confirm the app does not force-start the workout.
6. Get into frame; check stable readiness and explicit Start; lose tracking during countdown; confirm countdown handles it correctly.
7. Run at least one repetition-based exercise and one timed/hold exercise; use faster/slower movements and intentional pauses; confirm correct counts/timing and no false corrections.
8. Enable body-only display; toggle face/eyes/hands visibility; enable full tracking if available and verify body tracking remains responsive and all layers share correct alignment and freshness.
9. Start/stop voice control explicitly; test valid command, ordinary speech, partial transcript, TTS echo, repeated recognition, backgrounding and permission denial.
10. Play/pause the tutorial while active; verify canonical session timers stay correct and audio arbitration works.
11. Pause/resume, rest/next set, manual/timed fallback, end/cancel, completion, app background/resume and hardware back.
12. Confirm session persists accurately, appears in history/progress, updates linked quest only when eligible, and any reward is awarded exactly once.
13. Repeat cold launch and test logs for stale callback/crashes. Capture screenshots of positioning, active HUD, landmarks and completion.

## 13.4 Performance report

Run before/after tests on the same device, build type, camera facing, lighting, body distance, exercise and duration. Record actual values or mark unavailable:

- Camera preview FPS / stability.
- Analysis and pose-result FPS.
- p50 and p95 inference latency.
- p50 and p95 capture-to-result age.
- p50 and p95 result-to-render/visible landmark age if measurable.
- Drop/skip rate and any backlog.
- JS handler duration and React render counts.
- Memory/GC behavior and thermal changes.
- CPU vs GPU correctness and performance (if both were genuinely tested).
- Additional face/hand tracking impact versus body-only mode.
- UI responsiveness during tutorial, voice and exercise.

Use initial goals as a target for investigation—not a fabricated promise: stable ~30 FPS camera preview where hardware allows; fresh useful body poses often enough for a natural workout (aim for roughly 20–30 updates/sec on supported hardware); body overlay p95 capture-to-visible age under ~150ms under nominal conditions. If the device/model cannot meet a target, show the measured reason and tune the profile. Never improve the apparent metric by dropping most frames, drawing stale points, or reducing correctness.

## 13.5 Full-product regression

After Coach changes, run the actual repository test suites and regress onboarding/Home setup progress, route/deep-link behavior, calendar/cycle history, event Add/Edit with keyboard, health data permissions, log meal/photo macros/Gallery, quests/task catalog v3, progression/rewards, local AI/BYOK/RAG behavior where configured, community eligibility/privacy, analytics/crash reporting, modals/gestures, offline/error states and release packaging.

Run the package’s existing commands (discover first): typecheck/compile, lint, unit/integration tests, DB/RLS tests, Expo config/prebuild/doctors if appropriate, native Gradle debug/release build and available E2E tests. Do not blindly run expensive or destructive commands. Fix failures introduced by the change, and document pre-existing failures rather than suppressing them.

---

# 14. MILESTONE ORDER — KEEP SHIPPING VERIFIED SLICES

Follow this order unless the reproduced evidence requires a different safe dependency sequence:

**M0 — Recover and baseline:** current branch/state, spec inventory, actual reported commits, backups, current test and device evidence.

**M1 — Accidental actions/audio:** suppress all voice/gesture commands during positioning and any disallowed state; explicit activation; remove generic gesture-to-completion; establish one speech/audio owner and first-play regression tests.

**M2 — Tutorial/player contract:** correct initial play, readiness and playback state, audio focus, no accidental autoplay, video data/source validation and error fallback.

**M3 — Positioning/readiness:** canonical setup states, no timeout-driven forced countdown, stable readiness, lost-tracking handling and manual fallback.

**M4 — Camera/native correctness:** lifecycle/generation tokens, safe in-flight state, exact model and input ownership, frame conversion/bitmap reuse, timestamp and error handling, one camera owner.

**M5 — Measured performance/delivery:** baseline/after metrics, bounded inference rate, optional extra detectors, native event/data-delivery improvements only when justified.

**M6 — Coordinate/Skia quality:** correct transform, stale-frame rejection, low-lag filtering, clean connected anatomy, selectable body/face/eye/hand layers and polished positioning/tips/HUD.

**M7 — Real workout vertical slice:** reps/holds, timers, pause/rest/countdown, completion persistence, history/progress/quest integration and valid reward-once behavior.

**M8 — Shared foundations + other regressions:** crashes/native packaging, FrostedView, sheets/keyboard, Calendar Add/Edit, Log Meals, Gallery, onboarding setup-state, health and other priority defects.

**M9 — Full documented product backlog:** remaining AI/RAG/memory, local/cloud provider safety, calendar/health/cycle, catalog v3 quest/game engine, religion/culture/worldview, communities/correspondence, analytics/notifications/backend/RLS and every other applicable requirement.

**M10 — Release and marketing:** release artifact/build verification, store policy/assets, authentic screenshots, listing copy, launch/website assets, deployment and actual submission only where access/approval permit.

At every milestone: inspect diff → run focused tests → correct regressions → update delivery log/traceability → commit the verified slice → continue. Do not stop after the Coach because the whole platform remains in scope, and do not abandon the Coach because the broader backlog is large.

---

# 15. DEFINITION OF DONE — SPECIFIC EVIDENCE REQUIRED

The immediate Coach outcome is verified only when:

- Moving into position does not issue commands or talk unexpectedly.
- Gesture controls are explicitly opt-in and disabled/suppressed outside the correct state; no unknown gesture completes a set.
- Voice STT is user-activated, deterministic, scope-limited and usable without LLM/network; no speech echo/partial transcript/old callback causes side effects.
- Video starts on the first real Play action, has correct audio and does not fight TTS/STT; no auto-play occurs on camera mount.
- The app never forces a countdown just because a timer expired while user setup is incomplete.
- One session owns the camera and model(s); no duplicate camera, model or event subscriptions; all buffers/models/threads are released safely.
- Pose/face/hand results carry source timestamps/geometry; stale, out-of-order or wrong-generation results are discarded.
- Landmarks align across front/back camera, crop, rotation and screen dimensions; no hard-coded offsets or double mirroring.
- Body landmarks are connected, purposeful and attractive; the UI is restrained and legible. Face/eyes/hands can be hidden independently and richer tracking does not silently degrade the body path.
- Reps/holds and session timers are correct for the explicitly tested supported exercises; unsupported exercises are honestly labelled and use manual/timed fallback.
- Completion, saved history, quest updates and rewards are real, idempotent and connected.
- Before/after device metrics exist, or missing measurements are explicitly marked unavailable.
- Typecheck/lint/tests/builds and the exact physical-device run have actual results, with crashes and regressions addressed.

The whole product is complete only when every applicable requirement in the traceability matrix is either evidenced as verified or marked blocked with the exact reason, owner and next action. “Screen exists”, “code compiles”, “test is mocked”, “native build succeeded” and “APK exists” are not interchangeable with a working feature, device test, backend deployment, store submission or publication.

---

# 16. SECURITY, SAFETY, RELEASE AND MARKETING GATES

- Do not ship secrets, service-role keys, signing keys, personal data, model caches or private backups.
- Check RLS and server-side authorization for user-scoped data; hiding UI is not access control.
- Use consent/provenance and clear off switches for camera, voice, face/eye/hand tracking, Health Connect, notifications, AI/cloud and community features. Keep raw camera/audio data on device unless the actual product feature expressly requires another flow and the user consents.
- Do not present camera form analysis as medical diagnosis or guarantee safe technique. Use clear capability/support labels and caution for pain, injury, dizziness or medical conditions; don't issue unsupported medical advice.
- Validate YouTube terms, app-store rules, privacy disclosures, health/AI disclosures and sensitive social eligibility policies against current official sources before release.
- Only call the app submitted/published when the real console shows it. Prepare screenshots/store graphics/listing/feature graphic/privacy assets and landing-page material from authentic, current UI, not unimplemented mockups.
- If remote services, credentials, device access, legal review or platform approval are missing, finish all independent work, state the exact external blocker and provide the next concrete action. Never fake the result.

---

# 17. REQUIRED END-OF-SESSION REPORT

Continue working until a concrete blocker or session limit. Before stopping, update the durable delivery log with:

1. Current branch, commit hash and clean/dirty status.
2. Source/spec files actually read and any unread/unavailable files.
3. Confirmed root causes vs hypotheses; show relevant file/function evidence.
4. Exact files changed and why; migrations/native config/model assets included.
5. Backup/recovery paths and rollback steps.
6. Commands executed, exit codes and pass/fail/skip results. Distinguish old reported results from new tests.
7. Before/after camera, pose, UI and audio metrics; device model/API/build. Mark anything unmeasured.
8. Manual/device cases executed, screenshots/log locations and cases not performed.
9. Actual artifacts: APK/AAB path, application ID/version/versionCode/hash if available, install/launch state.
10. Actual commit hashes; push branch/remote only if authorized. Never claim a push succeeded without its result.
11. Traceability status for the Coach and whole-product scope: `TODO`, `IN PROGRESS`, `IMPLEMENTED`, `AUTOMATED TESTED`, `BUILD VERIFIED`, `DEVICE VERIFIED`, `BACKEND VERIFIED`, `DEPLOYED`, `SUBMITTED`, `APPROVED`, `PUBLISHED`, `BLOCKED — EXACT REASON`, or `NOT APPLICABLE — JUSTIFICATION`.
12. Remaining blockers and next exact code action. Do not hide incomplete work behind an “all done” summary.

The final user-facing answer should be direct, concise but complete: delivered behavior, evidence, exact commits/files, test results, release/device status and only the remaining genuine blockers. No invented metrics, no claims based only on prompts, no generic promises and no plan-only ending.

---

# START NOW

Open the actual repository. Read the instructions and the current Coach/voice/video/native sources. Verify the reported commits and the current tests. Protect the work. Start by reproducing and fixing accidental actions and audio/first-play behavior, then make the positioning state machine trustworthy, measure the pose pipeline, fix its real hot spots and coordinate transforms, polish the real Coach, complete a workout end to end, and continue through every applicable product requirement. Use the upstream source at its pinned SHA as an engineering reference, not as a copy/paste solution. Deliver code and evidence—not another plan.
