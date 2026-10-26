# THRIVEFOLD — ULTIMATE COACH EXPERIENCE MASTER PROMPT

## Best-in-Class Visual Design, Live Pose Intelligence, Skia Rendering, Synchronized Virtual Instruction and Production-Grade Performance

**Execution mode: Inspect → Back up → Improve existing code → Measure → Verify → Commit → Continue**

## MISSION

Act as a world-class Mobile Product Designer, Staff React Native Engineer, Android/Kotlin Computer-Vision Engineer, React Native Skia Specialist, Real-Time Performance Engineer, Exercise-Coaching Systems Architect, AI Systems Engineer and Accessibility/Safety Reviewer.

Your mission is to transform the **existing Thrivefold Coach, camera, exercise-learning and movement-tracking experience** into an exceptionally polished, responsive, intelligent and trustworthy virtual instructor.

The application already contains code, components, hooks, exercise definitions, camera integration, pose-landmarking logic, design tokens, database and analytics systems. Your job is to inspect, understand, repair and improve those implementations. Preserve working behavior and extend the existing architecture.

This is not a greenfield redesign, a collection of attractive mockups, a demo animation or another architecture proposal.

I want a real virtual Coach that:

- Looks and feels like it belongs to our existing product family.
- Uses the sophistication and visual restraint of BlinkQuest as a design reference.
- Shows live camera footage with beautifully rendered, correctly aligned Skia landmarks.
- Tracks movement continuously and responds to the user's current actions.
- Counts valid repetitions, measures holds and synchronizes all timers accurately.
- Detects supported movement faults and provides timely, evidence-backed guidance.
- Uses an appropriate combination of local computer vision, deterministic movement logic and existing AI services to personalize the coaching experience.
- Supports the complete existing exercise catalog, with honest capability reporting for every movement.
- Remains smooth, usable and reliable on actual Android hardware.
- Preserves the user's history, existing data infrastructure and ability to restore every modified file.

**The outcome must be a genuinely working Coach, not simply a better-looking camera screen.**

---

# 1. FIRST: UNDERSTAND THE EXISTING PRODUCT AND OUR AESTHETIC

Before changing anything, inspect the existing codebase and visual references.

Read the project instructions and relevant documentation, including `AGENTS.md`, the existing Thrivefold master prompt, Coach requirements, design-system documentation, existing continuation logs and the exercise catalog.

Inspect the actual implementations of:

- Thrivefold theme tokens and shared UI components.
- BlinkQuest screens, colors, typography, illustrations and component patterns, wherever that project or its assets are accessible.
- The existing Neev implementation where it provides useful bottom-sheet or interaction patterns.
- The current Coach screens, onboarding, exercise selector and workout runner.
- Existing `FrostedView`, glass-orb controls, gradients, modal and bottom-sheet components.
- Camera previews, pose overlays, MediaPipe modules, Skia canvases, animation code and exercise logic.
- Existing local AI, user memory, RAG, profile, exercise history and session persistence.
- Existing SQLite, Supabase, TanStack React Query, Zustand and analytics integrations.
- All existing exercise assets, instructional video mappings, voice/TTS utilities, timers and accessibility components.

Search the actual repository for the relevant files instead of assuming a particular directory structure.

Treat BlinkQuest as a reference for aesthetic quality, not as permission to replace Thrivefold's identity. Reuse compatible components and semantic tokens. Do not blindly copy another application's entire theme, navigation or layout.

If BlinkQuest source code is unavailable, use the design assets and tokens that are available, along with the established Thrivefold visual system. Do not block implementation because a reference project cannot be accessed.

## Our visual direction

Aim for a premium, calm, warm, modern, human and editorial experience. It should feel like a carefully crafted fitness and wellbeing product, not a generic generated AI interface or an engineering-debug screen.

The available BlinkQuest brand direction includes warm terracotta `#DA7756` and ivory `#FAF9F5`. Treat these as reference colors and reuse the repository's actual tokens where appropriate; do not hardcode them throughout Thrivefold or override its existing color system.

Use:

- Deliberate typography with a clear hierarchy.
- Warm neutral surfaces and restrained, purposeful accent colors.
- Strong contrast over live camera footage.
- Subtle movement that helps the user understand a state change.
- Visually consistent controls, spacing, iconography and corner radii.
- Thoughtful empty, loading, tracking-lost, permission-denied and completion states.
- Restrained glass surfaces for overlays that genuinely benefit from translucency.
- Large, legible exercise metrics where the user needs to act quickly.

Avoid:

- Default-looking skeleton overlays.
- Generic dashboard cards stacked inside a camera view.
- Excessive gradients, glassmorphism and glowing borders.
- Sparkle icons, ornamental AI motifs and unnecessary decorative animation.
- Tiny labels placed over a moving person.
- Too many buttons competing for attention.
- Arbitrary bright colors indicating incorrect form without a meaningful state.
- A constant stream of encouraging phrases that do not correspond to actual movement.

Gradients are permitted where they improve camera-frame legibility, especially at the top and bottom edges of an immersive camera screen. They should not be used as the default background for every card or component.

Use existing `FrostedView` components and glass-orb controls selectively. If a component does not exist, first inspect the existing UI primitives and create a reusable component only if a genuine gap remains.

# 2. CREATE ONE COHESIVE, IMMERSIVE COACH EXPERIENCE

Do not construct a different interaction model for every exercise. Build one polished coaching workspace that adapts its content to the exercise being performed.

Keep the camera as the primary visual surface throughout active sessions.

## 2.1 The exercise journey

Deliver the complete user journey:

**Exercise selection → Instructions → Camera setup → Ready position → Live tracking → Real-time feedback → Repetitions or timed hold → Set/rest transition → Completion summary → Persisted history.**

Every transition must be driven by actual session state and must have a working implementation.

### Exercise introduction

Show the essential information before starting:

- Exercise name and purpose.
- A concise demonstration and key movement instructions.
- Expected repetitions, duration, sets or movement sequence.
- Camera positioning and required viewing angle.
- Equipment, if any.
- Beginner-friendly modifications.
- Important limitations or safety considerations.
- Whether reliable camera verification is supported.

Do not overload the initial screen with every possible detail. Progressive disclosure should make important information accessible without overwhelming the user.

### Camera setup

Before starting inference, guide the user through positioning the device and body.

Display a restrained framing guide and a clear status such as:

- Position the camera.
- Move farther into the frame.
- Ensure the relevant joints are visible.
- Turn to the recommended side.
- Hold still while tracking initializes.
- Ready to start.

Use the actual detected landmarks, visibility and exercise-specific framing requirements to determine readiness.

Do not declare the user ready merely because the camera opened.

Allow a supported exercise to start in manual or timed mode when camera positioning or detection is unavailable.

### Active session

The active session should feel immersive and purposeful.

- Camera preview occupies the available screen.
- Landmark visualization is directly aligned to the person's movement.
- The current exercise and set remain easy to understand.
- The current repetition count is prominent for repetition-based exercises.
- Hold duration or elapsed time is prominent for timed exercises.
- The next meaningful coaching cue is easy to see and understand.
- Pause, resume, stop, sound and video controls remain accessible without obscuring the movement.
- Relevant session state remains synchronized even when the layout changes.

Use fullscreen immersive mode while active, including hiding system bars when supported. Restore system UI correctly when the session ends, the app backgrounds, navigation changes or an error occurs.

Never let immersive mode trap the user or interfere with Android back navigation.

---

# 3. DESIGN A BEAUTIFUL, PURPOSEFUL LANDMARK SYSTEM WITH SKIA

The existing landmarks are visually poor and do not appear smooth or synchronized. Correct both the rendering quality and its underlying data flow.

Use the installed `@shopify/react-native-skia` implementation for high-quality landmark drawing where compatible with the existing camera architecture.

Do not assume that rendering the entire camera feed through Skia is always faster. Benchmark the existing camera path first. A native camera preview with a dedicated Skia overlay may be preferable to a more expensive full-frame rendering pipeline.

## 3.1 Visual treatment

Build a refined, consistent visual language for all supported camera-based exercises.

### Body skeleton

- Draw clean, well-proportioned connections between the relevant anatomical landmarks.
- Use consistent stroke weights and rounded joins where appropriate.
- Avoid a thick web of bright lines that obscures the body.
- Use restrained contrast and subtle depth to ensure visibility against different backgrounds.
- Give important joints appropriate emphasis without making every point a glowing dot.
- Use selective emphasis for active joints, tracked movement segments or the current exercise's relevant body region.
- Animate confirmed state transitions rather than animating landmarks independently of their actual positions.
- Keep the shape visually cohesive at different screen sizes and camera orientations.

### Landmark states

Distinguish states with clear visual meaning, consistent with the existing Thrivefold theme:

- **Tracking:** the model has sufficient evidence to visualize the detected pose.
- **Ready:** the necessary body landmarks are sufficiently visible and stable to begin.
- **Movement detected:** the relevant exercise phase has been recognized.
- **Guidance needed:** a supported metric indicates an actionable adjustment.
- **Hold or target reached:** the required state is supported by the detector.
- **Tracking lost:** the required landmarks are no longer reliable.

Do not automatically equate a green skeleton with perfect exercise form. A detected pose does not establish that the movement is correct or safe.

Use redundant visual and textual feedback instead of relying on color alone.

### Guidance overlays

Prefer a small number of purposeful visual aids:

- The relevant movement path or range of motion.
- A reference line or angle where it genuinely helps.
- A subtle positioning guide.
- A concise form adjustment when evidence supports one.
- A clear tracking-confidence or tracking-readiness state when useful.

Avoid covering the face, joints or relevant body region with unnecessary interface elements.

### Skia implementation

Use efficient canvas drawing rather than creating a large React component tree for every joint.

- Reuse drawing objects and stable canvas structures where supported.
- Update the latest landmark values through an appropriate high-performance path compatible with the installed Skia version.
- Avoid rebuilding React components for every camera frame.
- Keep static UI elements outside the frequently updated drawing layer.
- Use bounded smoothing so joints do not jitter but also do not visibly trail behind the actual person.
- Do not continue drawing old landmark coordinates as if they were current.
- Handle confidence loss and tracking recovery cleanly.
- Avoid expensive full-screen blur and filter effects during inference.
- Verify rendering behavior across the actual range of camera resolutions, aspect ratios and display sizes.

Do not introduce a second animation framework or replace the camera library simply to make this rendering layer work.

First optimize the existing pipeline. Do not immediately introduce additional Reanimated infrastructure as a shortcut. Reuse the installed and compatible worklet, native or Skia update mechanisms wherever possible.

# 4. FIX LIVE CAMERA AND POSE SYNCHRONIZATION AT THE ROOT

The camera preview, pose detector, landmark overlay, repetition counter, guidance, audio cues and session timer must form one synchronized experience.

An attractive overlay is useless if it displays old coordinates.

## 4.1 Inspect the actual processing architecture

Trace the current path:

**Camera capture → frame preparation → native pose inference → timestamped detection result → coordinate transformation → landmark state → exercise evaluation → Skia rendering → visible feedback.**

Inspect every handoff, conversion, queue, timer and state subscription in that path.

Determine whether lag comes from:

- Synchronous inference on the UI or JavaScript thread.
- Repeated full-resolution image conversion.
- Expensive frame copies.
- Too many native-to-JavaScript bridge calls.
- Unbounded queues.
- Duplicate camera or model instances.
- React state updates on every frame.
- Unnecessary animation loops.
- Stale inference results.
- Excessive landmark smoothing.
- Incorrect camera rotation, mirroring or cropping.
- Per-frame logging or analytics.
- Audio requests or AI calls executed in the movement loop.
- Memory allocation and garbage collection.
- Competing camera and video workloads.

Fix the actual cause rather than compensating with an animation that merely makes delayed landmarks look smoother.

## 4.2 Real-time pipeline requirements

Use the installed camera library's supported live-processing architecture.

When using MediaPipe's supported live-stream mode, submit frames with valid, monotonically increasing timestamps and consume asynchronous results. Do not build an unbounded processing backlog when inference cannot keep up.

The implementation should:

- Keep the camera preview responsive independently of inference speed.
- Prefer fresh results over an accumulation of obsolete frames.
- Apply backpressure and skip unnecessary input frames under load.
- Keep capture timestamps, detection timestamps and displayed-result age measurable.
- Avoid physically rotating full image buffers unless the chosen implementation requires it.
- Avoid copying pixels into JavaScript when native processing can consume them directly.
- Reuse the pose detector and native buffers where practical.
- Release frame buffers reliably on every success and error path.
- Avoid repeated initialization whenever the Coach rerenders or changes layout.
- Stop the detector, camera, audio and supporting work when the session ends or becomes inactive.
- Prevent background/resume behavior from creating duplicate subscriptions or inference loops.

The detector's actual supported API and camera-library version must be verified against the repository. Do not blindly migrate from one VisionCamera major version to another.

## 4.3 Never use old results as live results

Every detection result should carry enough timing information to establish which captured frame it represents.

Reject or down-rank results that have become too old to support current feedback. If the detector falls behind, continue displaying the latest valid pose only within a defined freshness threshold.

If tracking is lost:

- Stop issuing new form corrections.
- Preserve the last confirmed repetition count.
- Display a clear tracking-lost state.
- Ask the user to reposition if required.
- Resume when fresh, sufficiently confident results return.

Do not guess missing coordinates to make the skeleton appear continuous indefinitely.

## 4.4 Coordinate mapping

Correct alignment between the person and the overlay is mandatory.

Handle:

- Camera orientation.
- Mirrored front-camera previews.
- Portrait and landscape transitions.
- Preview crop and aspect-fill behavior.
- Device and container dimensions.
- Safe areas and camera bounds.
- Model-coordinate normalization.
- Resolution changes.
- Translation and scaling.
- Partial body visibility.

Do not mirror both the camera and landmarks twice. Do not use hardcoded screen centers or fixed offsets as a substitute for real coordinate transforms.

Test alignment at different sizes and with the actual camera configuration.

---

# 5. BUILD A REAL VIRTUAL INSTRUCTOR, NOT A CHATBOT OVER A CAMERA

The Coach should understand the current exercise, the user's active session state and the movement evidence returned by the detector.

Use a dedicated, deterministic exercise-coaching engine for live decisions.

An LLM must not be invoked on every frame and must not be the source of truth for repetition counts, safety thresholds or pose measurements.

## 5.1 The coaching state machine

Create or improve a cohesive state machine covering:

- Initialization.
- Camera setup.
- Model loading.
- Tracking readiness.
- Start countdown.
- Active exercise.
- Movement approach or eccentric phase, where applicable.
- Target position.
- Return or concentric phase, where applicable.
- Valid repetition confirmed.
- Timed hold.
- Rest interval.
- Set completion.
- Tracking lost.
- Paused.
- Resumed.
- Interrupted session.
- Manual fallback.
- Completed session.
- Cancelled session.
- Recoverable error.

Each transition must be deterministic, testable and connected to the same canonical session state.

Do not maintain separate competing counters or timers in the UI, detector and workout service.

## 5.2 Live movement understanding

For each supported exercise, define its actual observable movement features.

Examples include:

- Joint angles and their temporal changes.
- Relative joint positions.
- Torso alignment.
- Bilateral differences where reliable.
- Movement direction.
- Entry and exit from a target range.
- Hold stability.
- Alternating side movement.
- Sequence order.
- Movement duration and cadence.
- Tracking confidence and landmark visibility.

Use exercise-specific criteria. Do not apply a universal knee-angle threshold or generic skeleton-quality score to every movement.

Only provide corrective guidance when:

1. The relevant landmarks are visible.
2. The observation is sufficiently reliable.
3. The movement metric is relevant to the current exercise.
4. The condition persists long enough to distinguish it from tracking noise.
5. The proposed cue is safe, actionable and understandable.

Account for anatomical variation, mobility differences, equipment and the camera angle.

Do not claim precise depth, load, joint forces or three-dimensional form accuracy when the available model and camera configuration cannot establish those values.

## 5.3 Natural, timely guidance

The user should feel guided through the exercise rather than subjected to constant machine-generated commentary.

Examples of appropriate cues include:

- “Move a little farther back so I can see your full body.”
- “Hold that position.”
- “Come up slowly.”
- “Keep your torso steady.”
- “Your next repetition is ready.”
- “Tracking is uncertain; adjust the camera before continuing.”

These are examples only. Generate a cue only when its corresponding state has actually been detected.

Create an event-driven coaching layer with:

- A priority system for safety and tracking messages.
- Debouncing and hysteresis.
- Minimum intervals between repeated cues.
- Suppression of stale or contradictory instructions.
- A queue that can replace obsolete low-priority cues.
- Explicit pause and mute behavior.
- A clear visual cue synchronized with the spoken instruction.
- Optional personalization from the user's declared goals, accessibility preferences and prior session history.

Avoid issuing multiple contradictory corrections in one second.

Do not tell users they performed an incorrect movement when the system merely lost track of a landmark.

Use supportive, non-shaming, body-neutral language. No humiliating scores, derogatory messages, pressure to continue through pain or assumptions about appearance.

## 5.4 Voice and audio

Reuse the existing TTS, audio and voice-provider abstractions.

Implement or finish:

- Optional voice coaching.
- Spoken repetition counts after confirmed repetitions.
- Short setup instructions.
- Hold and rest countdowns.
- Useful set transitions.
- Pause/resume and stop controls.
- Audio interruption and priority handling.
- Rate, volume and speech-preference controls where supported.
- Manual controls for users who cannot or prefer not to use voice commands.

Prefer a suitable existing offline TTS path when it is already available. Use cloud voice generation only when needed, configured and permitted. Do not send camera frames, raw landmarks or sensitive session data to a voice provider.

The voice layer must not affect the camera's processing loop. A slow or failed audio request must never freeze tracking.

Voice commands and hands-free controls must be explicitly enabled and active only during an intentionally started session. Do not record audio or listen continuously outside the active workflow.

## 5.5 Keep AI useful and out of the critical frame loop

Use the existing local AI and approved RAG services to improve:

- Exercise instructions and modifications.
- Contextual explanations.
- Personalized session summaries.
- Retrieval of relevant exercise knowledge.
- Approved user preferences and coach adaptations.
- Better phrasing of validated, deterministic feedback.
- Post-session reflection and recommendations.

Use the existing user-memory implementation and canonical history. Retrieve only the context relevant to the current exercise.

The live movement metrics and state machine must remain responsive offline without a cloud AI call.

Cloud inference failure, unavailable credentials or absent network connectivity must not stop local tracking, repetition counting or the basic coaching state machine.

---

# 6. ACCURATE REPETITIONS, HOLDS, SETS AND ALL DURATIONS

Every number displayed on the screen must come from the canonical, actual session state.

## 6.1 Repetition counter

For repetition-based exercises:

- Define the valid movement phases.
- Detect the transition into the target phase.
- Confirm the completion/return phase when required.
- Apply hysteresis and a controlled re-arm condition.
- Reject short-lived threshold crossings and tracking noise.
- Prevent duplicate counts after app resume, rerenders or model callbacks.
- Synchronize the number displayed, spoken count, activity history and completion logic.

Do not increment counters merely because time has passed.

## 6.2 Holds and static exercises

For planks, yoga poses, mobility holds or similar exercises:

- Detect the required starting pose.
- Start the hold timer only when the supported readiness conditions are met.
- Track whether the relevant posture remains sufficiently valid.
- Handle temporary tracking loss without inventing completed duration.
- Distinguish actual held time from paused time and rest time.
- Provide appropriate visual and optional spoken feedback.
- Complete the hold only according to its defined rules.

Do not claim an isometric hold was verified if the exercise only used a manually started countdown.

## 6.3 Flow and sequence exercises

For Sun Salutation sequences, compound movements, martial-arts sequences and multi-stage routines, implement sequence-aware progression where appropriate.

Use a sequence of defined movement states rather than one universal rep counter.

A sequence must not be considered complete merely because one recognizable pose appears.

## 6.4 Accurate timing

Use the appropriate monotonic time source for elapsed session durations. Do not depend on a JavaScript interval firing at exact times.

Implement reliable pause/resume, background/foreground transitions, rest timers, countdowns and completion timing. Prevent double accumulation when the app resumes.

Represent separately:

- Total elapsed session time.
- Active movement time.
- Confirmed hold time.
- Rest time.
- Paused time.
- Repetition count.
- Set count.
- Target duration or repetitions.
- Remaining target.
- Tracking and verification mode.

Keep timers synchronized across visual labels, audio cues and persisted session records.

---

# 7. SUPPORT THE ENTIRE EXISTING EXERCISE CATALOG

Do not polish one squat demo and call the Coach finished.

Inventory every exercise already defined in the canonical catalog. Preserve the authoritative catalog, current identifiers and existing task/session relationships.

Create or extend an explicit per-exercise capability registry and validate every catalog entry against it.

The catalog should cover the relevant existing exercise families, including:

- Gym and resistance exercises.
- Bodyweight movements.
- Compound-body movements.
- Squats, lunges, push-ups, bridges, presses and core work.
- Planks, static poses and timed holds.
- Mobility, balance and posture activities.
- Classical Indian yoga, including applicable Surya Namaskar variations and standing poses.
- Kalaripayattu stances and movement drills.
- Dand-Baithak and traditional bodyweight sequences.
- Martial-arts forms and drills.
- Breathing and recovery exercises.
- Any other exercise, face, eye or posture routine already documented in the product.

These are capability categories, not a replacement catalog. Inspect the actual data to determine which exercises exist and what is still missing.

## 7.1 Capability definition for each exercise

Every exercise definition should identify, where applicable:

- Canonical exercise ID.
- Exercise name and family.
- Instructions and verified demonstration reference.
- Required camera angle and body visibility.
- Relevant landmarks and movement metrics.
- Movement state machine.
- Rep/hold/sequence logic.
- Confidence and tracking-loss behavior.
- Allowed cue types and priority.
- TTS behavior.
- Safe modifications and stop conditions.
- Required equipment.
- Tracking limitations.
- Verification mode.
- Relevant tests.

Reuse the existing exercise model and data files where practical. Do not create a second independent exercise catalog.

## 7.2 Honest support levels

Classify every exercise honestly into a suitable supported mode, for example:

- Camera-verified repetition tracking.
- Camera-verified hold tracking.
- Camera-assisted sequence tracking.
- Timer/manual completion.
- Instruction-guided exercise with no reliable form verification.
- Unsupported by the current hardware/model, with a documented reason.

The objective is for every existing exercise to be usable through an appropriate, tested path—not for every exercise to be falsely presented as accurately recognized.

Some complex martial-arts forms, external-load movements, floor poses or partially occluded exercises may require a different camera view, a specialized detector or a manual fallback. Identify these cases rather than inventing confidence.

For facial or eye-exercise flows, use only the actual supported landmark pipeline. Do not claim diagnosis, treatment or medical-grade vision analysis.

## 7.3 Exercise coverage audit

Produce a machine-readable coverage report or extend the existing catalog validation tooling.

For every exercise, record the implementation path, tracking capability, test result and remaining limitations.

Make it impossible for an exercise to silently display a “camera-verified” label when its actual implementation only uses a timer or manual logging.

---

# 8. THE VIDEO, CAMERA, FULLSCREEN AND PICTURE-IN-PICTURE EXPERIENCE

The camera should be the dominant view, with optional video support that never interrupts live tracking.

## First use

When a user opens an exercise for the first time, automatically start its verified instructional video when available and permitted.

The tutorial must be skippable, with clear access to the camera setup and instructions. Do not block the user's ability to begin a supported session.

## Repeat use

For repeat sessions of the same exercise, minimize the tutorial by default. The user should be able to start with the camera immediately.

Remember video visibility preferences where practical without creating a second session record or changing the exercise's canonical state.

## Controls

Provide working options to:

- Hide the instructional video completely.
- Restore the video.
- Minimize it to an in-app floating panel.
- Expand it to its supported fullscreen mode.
- Switch visual emphasis between video and camera.
- Pause or resume the video independently.
- Exit fullscreen and return to the correct prior layout.

Use existing glass-orb controls and suitable transitions without introducing excessive animation.

Do not assume native Android multi-window PiP, an embedded floating view and fullscreen playback are the same capability. Implement the mode the existing player supports and label the behavior clearly.

Handle unsupported, deleted, blocked or unavailable videos with a useful fallback. Never replace a missing video with an unrelated demonstration.

Coordinate video lifecycle and camera processing carefully. Hiding the video should not restart the detector. Switching layout should not reset the rep counter or lose the active workout.

Use immersive fullscreen mode only during the appropriate Coach interaction and restore the previous system UI state safely.

---

# 9. MAKE THE COACH FEEL SYNCHRONIZED AND PERSONAL

The user should not need to explain the same exercise preferences or goals at every session.

Integrate with the existing app's approved profile, preference, local-memory and activity-history systems.

Use relevant, consented context such as:

- User-selected training goals.
- Declared fitness experience.
- Preferred instruction style and language.
- Accessibility preferences.
- Previously selected exercise modifications.
- Actual completed sessions and user-entered feedback.
- Previously selected video preferences.
- User-approved constraints or limitations.

Do not infer sensitive traits or medical conditions from movement, names, location or appearance.

Do not treat a missed session or low performance as a failure of character.

The Coach may adapt the amount of instruction, cue timing, exercise level or session recommendations to the user's recorded preferences and actual history, but it must make significant assumptions reviewable and correctable.

Respect the selected product experience, theme and locale.

Maintain a clean boundary between raw movement measurements, derived exercise metrics, user-approved memories and language generated by the AI.

# 10. BUILD ONE AUTHORITATIVE SESSION STATE

The Coach, exercise engine, audio layer, Skia overlay and history must not maintain conflicting representations of the same workout.

Reuse the current state management, database and service architecture.

- Use existing Zustand slices for transient session and UI state where appropriate.
- Use React Query for server-owned records and remote mutations.
- Use the canonical exercise/session service for actual movement progress.
- Use existing Expo SQLite storage for offline records where already established.
- Sync appropriate historical data through the existing Supabase flow when required.
- Reuse analytics and Crashlytics rather than adding a competing event system.

A landmark callback must not create a database write, analytics event or full React rerender for every frame.

Only confirmed state transitions should emit meaningful session events such as repetition confirmed, set completed, tracking lost or session ended.

Keep local pose data local by default. Do not upload frames, face/eye landmarks or raw body measurements merely to personalize a workout.

Prevent duplicate session completions and reward events. Persist a session exactly once under the existing canonical ID. Respect established quest verification rules before marking a quest completed.

---

# 11. OPTIMIZE FOR A REAL ANDROID DEVICE

The target is a responsive, stable live experience, not an untested claim of 60 FPS.

Use a real-device baseline and compare the same device, build, exercise, lighting and camera settings before and after changes.

Measure:

- Preview FPS.
- Landmark-result throughput.
- Frame-to-result latency.
- Landmark result age at rendering.
- Dropped and stale frames.
- UI/JS thread responsiveness.
- Native inference and conversion cost.
- Memory consumption and allocation behavior.
- Device temperature and performance degradation during sustained sessions.
- Time from camera launch to tracking readiness.
- Time from valid movement to confirmed rep.
- Audio-cue delay.
- Session interruption and recovery.

Use platform profiling, native logs and existing performance instrumentation. Keep diagnostics throttled and avoid logging every frame in production.

## Performance principles

- Keep the camera responsive even when inference cannot process every frame.
- Prefer current data over a queue of stale data.
- Avoid unnecessary frame copies, format conversions and image rotations.
- Reuse model instances and buffers where safe.
- Separate heavyweight inference from UI rendering.
- Keep drawing updates cheap and bounded.
- Do not trigger React renders for every landmark.
- Avoid unnecessary timers, polling or state subscriptions.
- Avoid blocking video playback with inference.
- Reduce nonessential analytics and cloud activity during active training.
- Pause or unload costly components appropriately on session exit.
- Recover cleanly from camera permission loss, model failure and app backgrounding.

Do not install new packages or migrate the camera architecture without evidence that the current implementation cannot meet its requirements.

## Proposed acceptance targets

Use these as initial optimization goals, then adjust based on device capability and measured baseline:

- The camera preview remains smooth at its supported target FPS.
- Aim for p50 landmark-result age below 100 ms and p95 below 150 ms on the reference device when technically achievable.
- Keep tracking results fresh rather than displaying accumulated stale frames.
- Keep the overlay visually aligned during movement.
- Prevent unbounded memory growth, frame queues or repeated detector initialization.
- Ensure interaction controls remain responsive while inference is active.

Report the actual measurements. If the reference device cannot achieve a target, explain the bottleneck and apply a sensible degradation strategy.

Do not promise that all hardware can support the same inference rate.

---

# 12. DESIGN MOTION THAT EXPLAINS STATE, NOT DECORATES IT

Every animation should communicate a meaningful change.

Use subtle, coherent transitions for:

- Ready-state confirmation.
- Starting a set.
- Confirming a repetition.
- Reaching a hold target.
- Showing a useful correction.
- Moving into rest.
- Changing the video/camera layout.
- Pausing and resuming.
- Finishing the session.

Avoid heavy animations on every frame or animations that run independently of the actual movement.

The rep counter should update immediately when the state machine confirms a repetition. A subtle transition can reinforce the event; it must never delay the counter.

Keep the interface calm, readable and fast. Do not use visual celebration to disguise incorrect movement detection.

Support reduced-motion preferences and lower-capability devices.

---

# 13. SAFETY, ACCESSIBILITY AND TRUST

A virtual instructor must be helpful without overstating what a camera can understand.

Implement the following:

- Evidence-based, exercise-specific feedback.
- Confidence and visibility gating.
- A clear distinction between camera-verified and manually reported completion.
- Accessible touch controls for all important actions.
- Visible counts and instructions in addition to speech.
- Optional voice feedback with pause and mute controls.
- Screen-reader labels and sensible focus behavior.
- Sufficient color contrast over the camera background.
- Clear tracking-loss and sensor-unavailable states.
- Safe exercise modifications where supported.
- Stop/pause controls that remain easy to reach.
- No unqualified diagnosis or medical claims.
- No assertion that an undetected or occluded joint has a specific fault.
- No requirement to enable cloud inference, camera recording or microphone access to use manual exercise flows.

The camera and microphone must be active only for an explicitly started and permissioned workflow. Stop them when the user exits or the feature becomes inactive.

Display the processing/privacy behavior accurately. If processing is local, verify it. If a provider requires uploading information, make that disclosure and permission explicit.

Never silently upload camera frames, body landmarks, audio, videos or sensitive health data.

---

# 14. REUSE THE EXISTING ARCHITECTURE AND AI SYSTEM

Inspect and reuse the project's existing implementations for:

- Expo native modules.
- MediaPipe or the installed pose runtime.
- Skia rendering.
- Camera and frame processing.
- Exercise definitions and catalog.
- Timers and session state machines.
- Audio/TTS.
- Local AI and memory.
- RAG and exercise-information retrieval.
- SQLite storage.
- Supabase synchronization.
- React Query and Zustand.
- Firebase Analytics and Crashlytics.
- Theme components, `FrostedView` and glass-orb controls.

Do not create a second AI runtime, memory vault, embedding index, exercise catalog, session database or analytics pipeline for Coach.

Use the existing local AI implementation for appropriate microtasks and approved personalization. Use existing RAG to retrieve relevant exercise instructions and modifications. Keep the live perception and repetition path deterministic and responsive.

Do not add a large language-model call to every frame. Use the detector and the exercise state machine to recognize events. The AI may explain or personalize an already validated event asynchronously.

If the app supports offline operation, the essential camera, rep-counting, timer and manual-coaching paths must continue to work without cloud AI or network access.

---

# 15. EXACT FILE PATHS, SAFE BACKUPS AND INCREMENTAL DELIVERY

I need to inspect the changes manually and identify precisely what went wrong if a regression appears.

Before editing:

1. Inspect the branch, current diff, uncommitted work and recent Git history.
2. Read the project instructions and Coach-specific requirements.
3. Identify the existing Coach route, camera, frame-processing code, Skia overlay, pose model, exercise catalog, session state and persistence services.
4. Create a dated backup of the files that will be modified.

Use an existing project convention where available or a dated location such as:

`.local-backups/thrivefold-coach-YYYYMMDD-HHmmss/`

Include the original versions and a recoverable patch or backup method. Verify the backups contain the intended files.

Do not commit backup directories or secrets. Do not reset or overwrite uncommitted changes.

## Investigate these areas first

The following paths are already referenced in the project requirements, but must be verified against the actual repository:

- `src/components/coach/`
- `src/domain/pose/`

Also search for the existing exercise catalog, Coach route, camera/native integration, frame processors, Skia overlay, exercise hooks, session store, audio services, instructional video mapping, database repository and relevant tests.

Do not invent a list of filenames before searching the code.

## Refactor only where it improves maintainability

Where the existing structure permits, keep responsibilities clear and reusable:

- Coach screen and session orchestration.
- Camera view and lifecycle.
- Pose processing and timestamp management.
- Skia landmark overlay.
- Exercise-specific detector configuration.
- Rep and hold state machines.
- Live guidance and cue prioritization.
- Speech/audio controls.
- Video and camera layout coordination.
- Session persistence and completion.
- Performance metrics and debug diagnostics.

Prefer improving existing modules over duplicating them in new directories.

## Required delivery cadence

Work in small, coherent slices.

For each slice:

1. Back up affected files.
2. Implement a meaningful change.
3. Inspect the diff.
4. Run the most relevant targeted tests.
5. Fix any regressions introduced.
6. Commit the verified result.
7. Update the delivery log.
8. Continue to the next unfinished issue.

Never commit unrelated edits or a broken slice just to maintain a cadence.

Maintain or update the existing continuation log. If no suitable log exists, use:

`docs/implementation/THRIVEFOLD_COACH_DELIVERY_LOG.md`

Record actual file paths, changes, test commands and results, commit IDs, known defects and the next concrete action.

---

# 16. ACCEPTANCE TESTS — THE COACH IS NOT DONE UNTIL THESE WORK

## A. Visual quality

- The Coach matches the established Thrivefold visual system.
- The BlinkQuest reference is used thoughtfully without replacing Thrivefold branding.
- The camera is the dominant active surface.
- Landmarks look refined and remain aligned.
- Controls are legible and visually consistent.
- No unnecessary decorative overlays obscure the exercise.
- Every session state has a deliberate design.

## B. Camera and pose synchronization

- The camera opens and closes correctly.
- The detector initializes once for the intended session.
- Landmark coordinates align with the actual person and preview.
- Rotation, mirroring, crop and resize cases are tested.
- Stale results are rejected or clearly handled.
- Tracking loss does not generate new reps or form corrections.
- Frame buffers and model resources are released safely.
- No unbounded work queue or runaway render loop develops.

## C. Live movement coaching

- A valid repetition produces exactly one confirmed count.
- Repeated callbacks cannot duplicate a count.
- Invalid motion does not trigger a false completion.
- Supported form corrections are evidence-backed.
- Voice cues match the visible state.
- Audio failures cannot freeze the camera.
- Holds, rest, pause and resume work correctly.
- Exercise completion uses the canonical session state.

## D. All exercises

- Every existing catalog entry has a reviewed capability.
- Every claimed camera-tracked exercise has an actual movement-specific implementation.
- Exercises that require another camera view show appropriate setup guidance.
- Unreliable camera cases offer an honest fallback.
- Missing instructions and video mappings are explicitly identified.
- No exercise is marked verified merely because it is listed in the catalog.

## E. Video and interaction

- First-use instructions are skippable.
- Repeat sessions minimize the tutorial by default.
- The video can be hidden completely.
- Camera and video layout transitions work without resetting the session.
- Fullscreen, system bars and Android back behavior are correct.
- Missing videos have a useful, truthful fallback.

## F. Performance

- Baseline and post-change measurements are recorded.
- The camera preview does not stall behind inference.
- Inference backlog and memory usage remain bounded.
- The overlay is updated efficiently.
- UI interactions remain responsive during a session.
- The app recovers properly from interruptions.
- Sustained-session behavior is tested rather than only a short demo.

## G. Data and privacy

- One canonical workout session is persisted.
- Counters, durations and verification mode remain consistent.
- History and related application views use the same record.
- No duplicate session, quest-completion or reward event is created.
- Sensitive raw camera or body data is not transmitted unintentionally.
- Local/offline functionality remains usable when cloud AI is unavailable.

---

# 17. FINAL REPORT — EXACT FILES AND REAL RESULTS

At completion, provide an evidence-based report with these sections.

### 1. Visual work

Explain the actual changes made to the Coach layout, Skia landmarks, controls, animation, video/camera presentation and theme consistency.

### 2. Live tracking work

Explain the previous bottlenecks and their actual fixes. Include before/after preview FPS, result latency, stale-frame rate and other measurements that were genuinely collected.

### 3. Exercise coverage

Report the number of catalog items audited, how many have verified camera tracking, how many use another supported mode, which tests passed and which movements require further work.

### 4. File-by-file changes

For every changed file, include its exact repository-relative path, the defect fixed, what changed, the verification performed, its backup/recovery path and the associated commit.

### 5. Unfinished files

List the exact existing files that remain problematic or require manual attention, including the specific reason each remains unfinished.

### 6. Backups and recovery

Provide the exact backup paths, relevant patches and actual commit hashes. Include the safest restoration method for individual files and a complete milestone rollback.

### 7. Verification

Distinguish code-reviewed, automatically tested, build-verified and physical-device-verified outcomes. Do not claim that a device was tested unless the test actually occurred.

### 8. Remaining defects

List every known limitation, missing integration, exercise lacking reliable tracking, blocked test and unresolved performance issue.

## FINAL DIRECTIVE

Do not stop at a redesigned screen, a prettier skeleton, a proposed architecture or a successful build.

Understand the current implementation. Protect it. Measure what is wrong. Repair the actual bottlenecks. Make the visual system beautiful without sacrificing responsiveness. Make the coaching state reliable before adding more animation. Use the AI to improve understanding and personalization without putting inference latency into the live movement loop.

**Deliver a Coach that feels alive because it accurately observes the user's current movement, responds at the right time, explains what to do next and stays synchronized from the first camera frame to the final saved set.**

Continue through all applicable Coach requirements until every exercise and state is accounted for, every remaining limitation is documented, all feasible work is verified, and the application is left in a safe, recoverable state.

---

## REFERENCE MATERIALS

Use these official implementation references and inspect them against the actual installed versions and project architecture:

- [MediaPipe Pose Landmarker — Android guide](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/android)
- [MediaPipe Pose Landmarker — task overview](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker)
- [React Native Skia — official project](https://shopify.github.io/react-native-skia/)
- [VisionCamera — frame output](https://visioncamera.margelo.com/docs/frame-output)
- [VisionCamera — asynchronous frame processing](https://visioncamera.margelo.com/docs/async-frame-processing)
- [VisionCamera — Skia frame processors](https://visioncamera.margelo.com/docs/skia-frame-processors)
- [VisionCamera — performance guidance](https://visioncamera.margelo.com/docs/performance)

Review real exercise-coaching products and examples for interaction and visual inspiration. Evaluate their camera framing, instructional hierarchy, pose-overlay readability, repetition display and feedback timing. Do not copy their brand assets or assume their implementations are technically equivalent.

Research references are design and engineering inputs, not evidence that Thrivefold's own features work. The existing repository, measured runtime behavior and verified acceptance tests determine completion.
