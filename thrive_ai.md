# THRIVEFOLD — MASTER EXECUTION PROMPT

## Complete All Pending Work, Unify Existing Infrastructure, Finish Local AI/RAG, Repair Live Coach, Optimize the Entire App

**Execution mode: Inspect → Back up → Implement → Verify → Commit → Continue**

Act as the accountable Staff/Principal React Native Engineer, AI Systems Architect, Kotlin/Android Engineer, Backend Engineer, Database Architect, Performance Engineer, Product Designer, Security Engineer and Release Owner for the existing Thrivefold application.

Your assignment is to finish the existing product in place. This is not a request for another audit, roadmap, UI mock-up, architectural proposal or greenfield rewrite.

**Read the supplied project specifications, inspect the actual repository, repair the code that already exists, consolidate duplicate implementations, connect every incomplete feature end to end, improve real-device performance, test the results and continue through the remaining backlog.**

Do not stop after implementing AI or fixing the Coach. The entire documented application must be accounted for.

---

# 1. NON-NEGOTIABLE EXECUTION RULES

1. Continue from the current repository and current Git state. Never assume earlier agents completed a feature just because documentation or a commit says they did.
2. Read `AGENTS.md`, the README, every relevant project Markdown file, the master product specification, continuation prompts, repair prompts, architecture documents, previous progress logs and relevant issue notes in full.
3. Read the installed dependency versions, application configuration, routes, components, services, hooks, stores, database schemas, migrations, native modules, AI providers, assets, tests and deployment configuration before changing the affected area.
4. Do actual implementation. A checklist, a TODO, a mock screen, a stubbed response, a successful HTTP status or a passing TypeScript check is not proof of a finished feature.
5. Use existing, working code and dependencies wherever possible. Improve, consolidate and extend them rather than rebuilding functioning features.
6. Treat existing SQLite databases, local analytics, Firebase Analytics, Crashlytics, Supabase, React Query, Zustand stores, AI services, camera modules and design-system components as infrastructure to audit and reuse.
7. Never introduce another database, event pipeline, state-management system, AI provider abstraction, task engine or duplicate feature implementation without documenting a concrete technical reason.
8. Preserve existing user data, migrations, history, completed work, navigation, theme tokens, accessibility and functioning product flows.
9. Every change must be reversible. Create backups before modifying existing files or database structures.
10. Commit coherent, tested milestones using descriptive commit messages. Do not commit unrelated changes, secrets, generated build artifacts or backups accidentally.
11. Continue automatically through independent, documented work. Do not repeatedly ask me to approve routine changes or restate requirements already present in project documentation.
12. Use available engineering tools and relevant installed skills. Delegate through available agents only when file ownership is clearly separated and every result receives an integration review.

**Completion means working application behavior, not an impressive implementation report.**

# 2. PROTECT THE REPOSITORY BEFORE TOUCHING IT

Before making changes:

- Inspect `pwd`, branch, `git status --short`, tracked and untracked files, recent commits, current diffs and any work already being performed by another agent.
- Identify the last known-good revision and the latest changes affecting broken flows.
- Read all applicable project instructions and record the authoritative requirements.
- Create a dated recovery snapshot before changing existing code.

## Mandatory backup strategy

Use a dated location such as:

`.local-backups/thrivefold-repair-YYYYMMDD-HHmmss/`

Adapt the location to the repository's actual conventions.

The backup must preserve the pre-edit state of affected files and provide a way to restore them. Use Git patches, exact file copies and, when appropriate, a Git bundle or branch reference.

- Back up existing uncommitted work before editing it.
- Before each high-risk change, create another checkpoint for the affected files.
- Keep before-and-after patches and document the files and commands needed for rollback.
- Keep database backup procedures separate from source-code backups.
- Verify that backups can be read and restored; merely creating an empty directory is insufficient.
- Keep private backup material out of public releases and avoid committing duplicate source trees.
- Never use destructive resets, force-checkouts, blanket clean commands or database resets to hide a problem.

After every coherent milestone:

1. Review the actual diff.
2. Run focused checks.
3. Fix regressions introduced by the change.
4. Create a recoverable checkpoint.
5. Commit the verified milestone.
6. Update the continuation log.
7. Move to the next unfinished requirement.

If a build or test fails twice for the same underlying reason, inspect the actual failure, change the debugging approach and continue other independent work. Do not repeatedly execute the same failing command unchanged.

# 3. ESTABLISH ONE AUTHORITATIVE INFRASTRUCTURE MAP

The project already contains database, analytics, state, networking and AI implementations. Your first engineering priority is to establish what exists and consolidate it safely.

Inspect and document the actual implementations of:

- Expo SQLite and every database-opening or database-initialization service.
- Existing SQLite schemas, migrations, repositories, indexes, transaction helpers and backup/export functionality.
- All local analytics modules, event queues and instrumentation utilities.
- Firebase Analytics initialization, event emission and consent behavior.
- Firebase Crashlytics initialization, breadcrumbs, nonfatal errors and native crash reporting.
- Supabase clients, authentication/session management, database tables, migrations, RPCs, storage buckets, Edge Functions and Row Level Security policies.
- TanStack React Query clients, query keys, hooks, persistence configuration, mutation handling, invalidation and offline behavior.
- Zustand stores and slices, including duplicate stores and overlapping persisted state.
- Existing AI providers, model adapters, prompts, classifiers, memory, embeddings, retrieval and RAG implementations.
- Existing logging, performance instrumentation, feature flags, environment variables and debug-only overrides.
- Camera, pose detection, landmark rendering, Coach services, video controls and exercise/session state.

Inspect the whole dependency graph and Git history before deciding what should survive.

Create or update:

`docs/architecture/EXISTING_INFRASTRUCTURE_MAP.md`

Include the real module paths, initialization owners, data ownership, dependencies, duplication found, keep/remove decisions, risks and verification status.

## Responsibility boundaries

Maintain a clear separation of responsibility.

| Existing system              | Canonical responsibility                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Expo SQLite                  | Durable local records, offline-first data, local history, pending mutations and bounded analytics outbox           |
| Supabase/Postgres            | Authoritative synchronized account data and shared, server-controlled records                                      |
| TanStack React Query         | Remote server state, request lifecycle, caching, invalidation and mutation synchronization                         |
| Zustand slices               | Small, deliberate client/UI state such as current selections, transient interaction state and coordinated UI state |
| Firebase Analytics           | Approved, consented product telemetry using the existing provider                                                  |
| Firebase Crashlytics         | Crash diagnostics, redacted errors, useful breadcrumbs and release-specific crash context                          |
| Local analytics              | Privacy-conscious local diagnostics, counters, profiling and event queuing                                         |
| Local AI                     | On-device classification, structured tasks, supported inference and private local intelligence                     |
| Existing AI/backend services | Authorized cloud inference, retrieval, complex workflows and shared analysis where justified                       |

Adapt these boundaries to the actual repository where working implementations differ, and document any justified exception.

Do not mistake the same data appearing in a query cache, local database and remote database for three independent sources of truth.

Define explicitly which system owns each record, which systems contain projections or caches, and how changes propagate.

# 4. REPAIR DUPLICATION WITHOUT DESTROYING DATA

Search for duplicated:

- SQLite databases, database providers, schemas and migration histories.
- Event schemas, analytics clients and tracking hooks.
- Firebase initialization and Crashlytics setup.
- Supabase client instances and authorization helpers.
- React Query clients, conflicting query keys and repeated API calls.
- Zustand state that duplicates server-owned records or SQLite persistence.
- Memory tables, embedding models, vector indexes and document-ingestion jobs.
- Task completion, workout session, progression, reward and calendar-recording logic.
- Coach components, animation loops, camera subscriptions and pose detection instances.
- AI gateway functions, provider configurations and fallback logic.

For each duplicate:

1. Identify the original owner and the source of truth.
2. Inspect usage and migration history.
3. Choose the canonical implementation based on actual working behavior, security and maintainability.
4. Move callers to the canonical implementation.
5. Preserve meaningful records, identifiers and historical behavior.
6. Add compatibility adapters or an additive migration if required.
7. Verify all callers and entry points.
8. Remove redundant code only after proving it is unused and safe to remove.

Do not blindly merge schemas, drop tables, wipe SQLite files, regenerate migration history or rename public APIs without updating all consumers.

Before deleting a redundant component, store, service or table, document the reason, dependency search, replacement and rollback plan.

The result must be one coherent ecosystem, not multiple partially working systems sharing the same screens.

# 5. FINISH THE COMPLETE LOCAL-FIRST AI SYSTEM

The application needs useful intelligence throughout the product, not merely an AI chat screen.

Audit and finish the existing AI implementation before creating any new subsystem.

## 5.1 Local AI runtime

Inspect existing native modules, model integrations and AI abstractions.

Where the current implementation is incomplete, complete a dedicated Expo Android native module using Kotlin and a verified, supported on-device inference runtime. Evaluate the existing Llamatik integration against its current official API and available release compatibility.

Implement real operations for:

- Device capability detection and runtime status.
- Supported model discovery and compatibility validation.
- Model download, progress, verification and app-private storage.
- Lazy loading, explicit unloading, memory management and resource cleanup.
- Streaming and non-streaming inference.
- Structured generation and strict result validation.
- Text embeddings using a known, compatible embedding model.
- Cancellation, timeouts, error reporting and recovery.
- Model/version metadata, performance measurements and diagnostics.

Do not bundle multi-gigabyte model files blindly into the APK. Download models when needed, verify their hashes, support interrupted downloads where practical, and handle insufficient storage and unsupported devices honestly.

Do not claim that a model is trained, loaded or running when it is not. Do not expose a pretend model-loading progress bar.

If an existing local model or classifier already performs a task reliably, keep it and improve it instead of adding a competing runtime.

## 5.2 Use AI for the right tasks

Use deterministic code for rules, validation, date calculations, numerical thresholds, authorization and state transitions.

Use lightweight local inference for appropriate tasks such as:

- Intent classification and task routing.
- Text and document classification.
- Entity extraction and structured summaries.
- Categorization and organization suggestions.
- Similarity-based retrieval and duplicate detection.
- Short, contextual explanations.
- Relevant-memory selection and summarization.
- Carefully scoped personalization.
- Optional activity and pattern explanations supported by actual records.

Use more capable cloud models only when genuinely needed, permitted, configured and approved for that particular data flow.

Implement typed provider interfaces, timeouts, retries, rate limits, circuit breakers, maximum context and output budgets, cancellation, cost limits and an explicit offline fallback.

Do not attempt to make the model itself the authoritative database, identity system, reward engine, clinical decision-maker or authorization layer.

# 6. COMPLETE AN END-TO-END HYBRID RAG PIPELINE

Do not add a second RAG implementation if one already exists. Audit and consolidate the current retrieval, memory, embedding, indexing and AI gateway code.

Implement the complete ingestion-to-answer path.

## 6.1 Data sources and ingestion

Support the appropriate existing sources, including:

- User-approved profile information and preferences.
- User-created notes, journals and documents where relevant.
- Exercise instructions, task catalogs and instructional content.
- App help, product documentation and verified knowledge resources.
- User-authorized activity summaries and historical records.
- Other existing content sources explicitly approved by the product.

For each source, record its owner, content category, permission scope, source identifier, revision, timestamps and deletion status.

Normalize and chunk content consistently. Use stable source IDs, deterministic chunk identifiers, metadata filters, bounded chunk sizes and incremental re-indexing.

Never index secrets, private data belonging to other users, or information outside the requesting user's authorization scope.

## 6.2 Embeddings and vector storage

Reuse existing embedding services, embedding tables, SQLite indexes and Supabase/Postgres extensions wherever possible.

For local retrieval, prefer the existing SQLite/vector implementation. Introduce a compatible vector extension only after verifying platform availability and native integration.

For synchronized or shared retrieval, reuse Supabase Postgres and its existing `pgvector` setup where available.

Keep model identity, embedding dimensions, content version and index version explicit. The same embedding space must be used for compatible document and query vectors.

If the current model or vector dimensions change, implement a versioned, additive migration strategy. Do not invalidate or rewrite all existing vectors without justification.

## 6.3 Retrieval quality

Build or finish:

1. Query normalization and intent classification.
2. Permission-filtered retrieval.
3. Semantic vector search.
4. Keyword search and hybrid retrieval where supported.
5. Relevance filtering, deduplication and optional reranking.
6. Source-aware context construction with context limits.
7. Evidence-grounded generation with source references.
8. Confidence and insufficient-evidence handling.
9. Safe response validation.
10. Feedback, evaluation and measurable retrieval-quality improvement.

Personal memory, global product documentation and shared community information must remain separate logical scopes even if they share infrastructure.

Do not accept a plausible-sounding generated answer as proof of retrieval success. Verify it against retrieved records.

## 6.4 Supabase integration

Inspect the real Supabase project configuration, current schema, RLS policies, functions, indexes and migration history.

Extend existing structures instead of creating duplicate tables with new names.

Implement the appropriate combination of:

- Canonical source records and metadata.
- Versioned chunk and embedding records.
- Permission-scoped semantic-search functions.
- Incremental ingestion and update processing.
- Retryable embedding jobs using existing infrastructure.
- Idempotent upserts and duplicate prevention.
- Removal and re-indexing when source records change.
- User-scoped retrieval and source citations.
- RLS and server-side authorization.
- Query limits, rate limits and operational error handling.

All privileged database operations must remain server-side. Never expose a Supabase service-role key, provider secret or privileged API credential in the mobile bundle.

Test RLS across guest, authenticated and unauthorized contexts. Never rely solely on hiding UI elements to protect data.

Use additive, version-controlled SQL migrations and the existing deployment procedure. Do not reset production or erase user data.

# 7. SMART MEMORY AND USER UNDERSTANDING

Build on the existing memory implementation instead of creating another competing memory vault.

Separate:

- **Profile memory:** user-declared and user-approved facts.
- **Preference memory:** explicit preferences and corrected suggestions.
- **Episodic memory:** useful summaries of meaningful events and completed activities.
- **Semantic memory:** relationships between verified facts, notes, projects and content.
- **Procedural memory:** repeatable workflows and instructions.
- **Derived insights:** hypotheses backed by identifiable records and sufficient evidence.

Each memory record should carry a stable identifier, owner scope, provenance, confidence where relevant, created/updated timestamps, lifecycle status and appropriate expiration rules.

Implement memory review, editing, correction, suspension, selective deletion, full deletion and export.

Retrieve relevant memory only when the current task benefits from it. Use recency, relevance, source quality and confidence rather than injecting a complete user history into every prompt.

Avoid infinite accumulation of repetitive memories. Deduplicate, merge compatible updates and preserve meaningful history without converting every app event into a permanent fact.

A user must be able to inspect important AI-derived assumptions and correct inaccurate ones.

## Personalization and cohort analytics

Improve recommendations using explicit goals, declared preferences, actual activities, suitable historical trends and relevant feature usage.

Use appropriate statistical methods or clustering algorithms for eligible, non-sensitive features. The LLM may describe validated patterns; it must not invent the evidence or secretly assign sensitive cultural, religious, ethnic, caste, political or other identity labels.

Where the app supports cultural, faith or community preferences, make sensitive attributes voluntary, user-declared, private and editable.

Do not diagnose health conditions or make unjustified medical, psychological, social or identity claims from indirect behavior.

# 8. LANGGRAPH AND WORKFLOW ORCHESTRATION

Inspect any existing LangGraph workflows and AI-related backend services before adding new ones.

Use a local task orchestrator for operations that must remain responsive and functional offline.

Use LangGraph on an appropriate existing backend runtime where durable, multi-step or shared workflows require:

- Typed workflow state.
- Explicit routing and conditional branches.
- Retrieval and tool-execution nodes.
- Input, output and permission validation.
- Bounded retries and clear failure paths.
- Appropriate checkpointing and recovery.
- Idempotent database writes.
- Observability and redacted execution traces.
- Human confirmation for consequential operations.

Do not force a server-oriented LangGraph deployment into React Native or create a duplicate backend merely to adopt the framework.

Use Supabase Edge Functions or the project's existing backend where technically appropriate. If the current hosting environment cannot safely support the required workflow, document the limitation and select the smallest justified compatible runtime.

Keep workflow checkpoints distinct from canonical business records and long-term memory. Do not persist unnecessary sensitive information in graph state.

An AI workflow must not silently create, delete, message, reward, publish or otherwise modify consequential user data without the required authorization and confirmation.

# 9. UNIFY TANSTACK QUERY, ZUSTAND AND SQLITE

Audit the current state-management architecture and retain useful implementations.

## TanStack React Query

Use the existing QueryClient and established query-key conventions for server state, remote fetches, mutations, stale-data handling and cache invalidation.

Fix duplicate queries, unnecessary refetches, stale responses and invalidation gaps. Do not build one query client per feature.

## Zustand slices

Keep Zustand focused on transient client state and deliberate cross-screen coordination. Split oversized stores into coherent slices only where there is a real boundary.

Do not mirror all Supabase data or SQLite tables into Zustand and create competing state copies. Keep stores narrowly subscribed and avoid rerendering the entire application when a single landmark or UI value changes.

## Expo SQLite

Reuse the existing database service, schema and migrations.

Use transactions, prepared statements, appropriate indexes, bounded data access and careful database initialization. Keep high-frequency camera data out of persistent tables.

SQLite should support the existing offline-first behavior, local history, durable pending changes, bounded analytics queue and locally retained memories as appropriate to the established design.

## Synchronization

Implement or complete the existing local-to-remote synchronization process:

- Queue operations durably.
- Associate them with the correct owner and record IDs.
- Use idempotency keys where appropriate.
- Retry transient failures with bounded backoff.
- Resolve conflicts deterministically.
- Reconcile server responses with SQLite.
- Invalidate affected React Query caches.
- Keep transient UI state consistent.
- Preserve offline behavior.
- Prevent repeated actions from creating duplicate sessions, events, records or rewards.

Document the source of truth and recovery behavior for every synchronized entity.

# 10. FINISH ANALYTICS, LOCAL TELEMETRY AND CRASH DIAGNOSTICS

Existing analytics must be improved and consolidated, not replaced with a new parallel event platform.

## Product analytics

Inspect all existing event definitions, event emitters and provider initialization.

Implement a consistent, versioned event schema for important interactions, including:

- App startup, foregrounding and resume.
- Route navigation and navigation failures.
- Onboarding completion and stale progress.
- Meaningful feature use and interaction outcomes.
- Quests, exercises, workout sessions and progression.
- AI task execution, retrieval quality and failures.
- Database synchronization and API failures.
- Camera availability, inference latency and dropped frames.
- Performance regressions and important recovery paths.

Use stable event IDs, event names, timestamps, app/build version, feature context and minimal approved parameters.

Do not log every touch coordinate, keystroke or frame. Do not use raw interaction histories to infer undisclosed sensitive traits.

## Local analytics

Reuse existing SQLite-backed event queues and local diagnostic utilities.

Implement bounded storage, batched writes, retention, idempotency, retry/backoff and safe queue cleanup.

Local analytics must not create duplicate business records or duplicate events every time a component rerenders.

Keep instrumentation cheap enough that it never blocks rendering, camera inference or navigation.

## Firebase Analytics

Retain the existing Firebase integration where compatible with the real Expo/Android setup.

Verify configuration, native initialization, event schema, consent, debug testing and production delivery. Ensure there is one initialization authority and that a single logical event does not get emitted multiple times.

Do not treat logging an event locally as proof that Firebase received it.

## Crashlytics

Preserve and repair the existing Crashlytics integration.

Verify release-build crash reporting, nonfatal exceptions, native crash context, useful breadcrumbs, source mapping/native symbols where applicable and the correct Firebase project.

Do not duplicate Sentry, Firebase or other crash initialization. If another provider is legitimately configured, consolidate according to the existing project's architecture instead of blindly enabling both.

## Privacy boundary

Never send raw cycle or medication records, private journal entries, sensitive identity information, face/eye/body landmarks, camera frames, audio, message content, credentials or unredacted API payloads to remote analytics.

Respect consent and user opt-out. Keep local diagnostics, product telemetry and crash reporting as distinct purposes with appropriate controls.

# 11. PRIORITY ZERO: REPAIR THE LIVE COACH AND CAMERA PERFORMANCE

The current coaching camera, pose landmarks and exercise interactions are too slow, poorly synchronized and visually inconsistent.

Existing code already exists. **Fix the actual bottlenecks instead of creating a replacement Coach screen or adding another animation loop.**

Inspect the real route, camera component, frame-processing implementation, MediaPipe/native modules, landmark overlay, Skia drawing code, rep counter, exercise state machine, video player, spoken feedback and session persistence.

The documented candidate areas include:

- `src/components/coach/`
- `src/domain/pose/`

Also search the actual project for the Coach route, camera scanner, exercise utilities, hooks, video/PiP components, native model assets and relevant Kotlin/JS modules. These paths are investigation leads, not permission to invent nonexistent files.

## 11.1 Measure the baseline first

On the available physical Android device, collect an initial baseline before changing the pipeline.

Measure:

- Camera preview frame rate.
- Inference throughput.
- Frame-to-result latency, including median and p95.
- Age of the newest displayed landmarks.
- Stale and dropped frame counts.
- JS/UI thread blocking and rerender frequency.
- Memory consumption, CPU load and thermal degradation.
- Camera initialization and recovery time.
- Rep-count timing accuracy and duplicate-count rate.
- Video playback and camera-switch responsiveness.

Use native, JavaScript and profiling tools where appropriate. Do not invent results or claim device verification when the device is unavailable.

## 11.2 Fix the underlying frame pipeline

Inspect and correct the following where applicable:

- Frame processing and inference must not block the JS or UI thread.
- Prefer the existing native asynchronous live-stream processing mode and callback mechanism when supported by the installed vision runtime.
- Maintain monotonic frame timestamps and align inference results to the corresponding capture time.
- Drop stale frames instead of building an unbounded processing queue.
- Use a latest-frame-wins policy for real-time tracking where appropriate.
- Avoid repeatedly copying full-resolution image buffers across the JS/native boundary.
- Avoid unnecessary image conversions, allocations, garbage collection and per-frame logging.
- Reuse detector instances and buffers when supported.
- Avoid running multiple duplicate model instances.
- Process at a suitable camera/model resolution and adapt sensibly to device capabilities.
- Keep model inference, landmark smoothing, rep-state evaluation and rendering on appropriate execution paths.
- Throttle unrelated analytics, TTS, network requests and expensive React updates during active tracking.
- Stop inference and release camera/model resources correctly when the screen is inactive, the workout pauses, the app backgrounds or the user exits.

Do not create new timers, polling loops or `setInterval`-driven pose updates to simulate live tracking.

## 11.3 Use React Native Skia for landmark rendering

Reuse the installed Skia implementation and current design tokens.

Improve landmark rendering so it feels like a deliberate, modern training interface rather than a default skeleton-debug overlay.

- Draw through a dedicated Skia rendering layer.
- Reuse drawing objects and avoid rebuilding the entire React tree for every frame.
- Correct coordinate transformations for aspect ratio, scaling, camera orientation, portrait/landscape, cropping, mirroring and safe areas.
- Keep the skeleton aligned with the actual body, not merely the center of the camera container.
- Use a restrained, consistent palette, meaningful joint/pose emphasis and clear active-exercise guidance.
- Keep text, controls, rep counts and visual feedback separate from raw per-frame rendering.
- Smooth jitter without adding so much smoothing that the feedback trails behind movement.
- Avoid displaying stale landmarks as if they were current.
- Handle low confidence, occlusion, multiple people, partial body visibility and tracking loss appropriately.
- Never report accurate form feedback when the detector has insufficient evidence.

Remove ugly decorative linear-gradient cards and unnecessary glass effects from ordinary Coach components. Reuse existing `FrostedView` components selectively for appropriate overlays and use glass-orb controls only when they fit the established design system. A full-screen camera treatment may retain an intentional gradient when it improves legibility.

Do not introduce or expand Reanimated as a quick fix before the existing pipeline has been measured and repaired. Reuse installed dependencies. Add no new animation dependency unless a proven, necessary gap remains.

Avoid sparkle icons, fake AI visual language, excessive blur, animated noise and decorative elements that obscure coaching.

## 11.4 Make tracking feel live

The camera preview must stay responsive even when inference is slower than the camera frame rate.

Render the newest valid landmark results, synchronize their timestamps with capture time, and interpolate cautiously between valid samples where appropriate. Bound any prediction window and stop prediction when confidence drops or the result becomes too old.

Do not claim that all devices can run inference at 60 FPS. Establish attainable targets from the connected device's actual capability.

Use these initial performance goals as benchmarks, not fabricated guarantees:

- Maintain a smooth camera preview at the supported 30 or 60 FPS mode.
- Aim for p50 landmark-result age below 100 ms and p95 below 150 ms on the reference device, when achievable.
- Keep overlays aligned with the displayed body and avoid visibly accumulating latency.
- Prevent unbounded frame queues, UI freezes and progressive memory growth.
- On lower-capability devices, degrade inference frequency or model resolution before sacrificing camera responsiveness.

Report measured results, identify hardware limitations and tune the implementation until it is as responsive as the actual device permits.

## 11.5 Exercise state machines and rep counting

Repair exercise-specific rep counting using real joint angles, movement phases, confidence gating, hysteresis and a controlled re-arm state.

Support movement-specific validation rather than one generic threshold applied to every exercise.

Ensure:

- A rep is counted only after a complete, valid movement.
- Brief threshold crossings cannot produce repeated counts.
- Pose loss and camera occlusion do not fabricate reps.
- Session pause, rest, restart and cancellation preserve correct state.
- Spoken counts are triggered by confirmed state transitions, not every frame.
- Audio feedback is rate-limited, configurable, interruptible and synchronized with visible feedback.
- Voice and gesture controls are explicitly enabled during an active session, with accessible manual alternatives.

If detection is unavailable, provide manual logging or self-reported completion without claiming camera verification.

# 12. REPAIR AND FINISH THE COMPLETE COACH EXPERIENCE

Preserve the existing coaching functionality and reorganize it into small, reusable components and utilities rather than a large monolithic screen.

Create or consolidate feature modules for:

- Coach screen composition and lifecycle.
- Camera and native scanner.
- Pose-processing hooks and domain logic.
- Skia landmark overlay.
- Exercise-specific movement definitions and detection logic.
- Rep/set/rest state machines.
- Spoken coaching and optional voice controls.
- Exercise instructions and verified tutorial references.
- Video playback, fullscreen and picture-in-picture states.
- Session persistence, completion and historical records.

Reuse the existing project structure where practical; do not create duplicate modules just to match these descriptive names.

## Camera and tutorial experience

The camera scanner should be the main active training surface by default.

For first-time exercises, automatically play a relevant, verified instructional video when available, while keeping it skippable. For repeat exercises, begin with the camera minimized interruptions and keep the tutorial minimized by default.

Provide an animated but lightweight way to switch the active emphasis between the video and camera. Support picture-in-picture-like layouts and fullscreen expansion where the existing platform and player support them.

- Provide an option to minimize or fully hide the tutorial player.
- Maintain functional playback controls, loading/error states, aspect ratio, orientation and Android back handling.
- Keep video playback from blocking inference.
- Never display an unrelated video as a valid exercise tutorial.
- Remember appropriate video preferences without breaking session restoration.
- Use fullscreen immersive mode with reliable safe-area, status-bar and navigation-bar handling.
- Restore system bars correctly when exiting the Coach.

Every movement advertised by the exercise catalog must have working instructions and a valid tracking strategy or honest manual fallback.

Extend the existing exercise catalog only after completing current functionality. Add the documented Indian yoga, Kalaripayattu, Dand-Baithak and martial-arts movements when the underlying exercise definitions, instructions, safety notes and verification logic can be implemented properly.

Do not claim that a movement is accurately tracked just because it appears in the catalog.

# 13. FINISH ALL OTHER DOCUMENTED PRODUCT WORK

After resolving severe blockers and the main Coach performance path, continue through the entire backlog in the project's supplied specifications. Do not abandon other features simply because AI is the primary new priority.

Inspect, repair, connect and verify the existing:

- Authentication, onboarding, guest mode and session restoration.
- Home, Today, setup completion and tool sections.
- Universal Calendar, routines, events and reminders.
- Health modules, historical records, cycle/period logging and local-date handling.
- Check-ins, mood, energy, symptoms, sleep and nutrition.
- Medication schedules and privacy-safe notifications.
- Quests, games, exercise assignments, progression, achievements and rewards.
- Train route and Coach integration with the existing canonical activity engine.
- Profile, accessibility, appearance, settings, connected applications and privacy controls.
- Letters, controlled introductions, chats, group management and therapy/practice circles.
- Organization membership, moderation, invitations and administration where documented.
- Data import/export, account deletion and memory management.
- Website/backend integration and release configuration where within repository scope.

Use the actual project specifications as the source of truth and reconcile conflicting old documents rather than blindly applying every historical implementation note.

### Product integrity requirements

- Preserve existing working navigation and design. Do not replace the current Home/calendar experience with a new competing layout.
- Keep one canonical task catalog, assignment model, workout session model and reward ledger.
- Reuse existing UI components, bottom sheets and theme tokens.
- Keep feature access consistent between UI navigation, application services and backend authorization.
- Remove dead controls and connect incomplete flows to real state, persistence and service behavior.
- Preserve genuine user history; do not introduce dummy production records to make a screen look populated.
- Do not remove sensitive or optional features simply because they require additional work; implement the documented eligibility, consent, privacy and access policies.
- For period logging, record the user-selected start date and applicable flow information. Do not require or invent an end date.
- For social features, enforce the project's adult eligibility, explicit participation, consent, blocking/reporting, moderation and documented message-composition rules.
- For health-related behavior, never invent diagnoses, fabricated historical values or medical certainty.

# 14. FIX ENVIRONMENT CONFIGURATION AND EXTERNAL AI PROVIDERS

Inspect the actual environment files, configuration loaders, provider registry, feature flags and deployment configuration.

Reuse the providers already present and consolidate the routing logic. Do not introduce new providers merely because an API key exists.

For every integration, verify:

- Whether the SDK is installed and compatible.
- Where the key is consumed.
- Whether the provider is genuinely configured.
- Whether the request succeeds under the supported authentication model.
- Timeout, retry, fallback and cost-limit behavior.
- Offline behavior and consent requirements.
- Whether any secrets are exposed in client code, logs, source maps, commits or build artifacts.

All privileged keys must remain server-side. Use environment variables and the deployment platform's secret manager. Client-visible build variables must never contain privileged credentials.

Use feature flags and development-only overrides for local-device testing, but fail closed for protected production capabilities. Overrides must not bypass server-side authorization, consent, age eligibility or other safety controls.

Keep `.env.example` free of secret values. Never echo existing credentials into generated prompts, documentation, commits or progress logs.

Treat keys exposed in pasted documents or committed to Git as potentially compromised. Identify the affected integration, recommend immediate revocation/rotation and remove exposed values from tracked files and history following a safe, reviewed remediation procedure.

Do not fabricate a successful provider test when credentials, service permissions or network access are unavailable.

# 15. VISUAL QUALITY, INTERACTION AND RESPONSIVENESS

Make the whole application feel intentional, polished, consistent and responsive without indiscriminate redesigns.

- Reuse the established design tokens and components.
- Fix spacing, hierarchy, typography, contrast, scroll behavior, touch targets and safe areas.
- Improve existing bottom sheets and modal interactions.
- Use `FrostedView` selectively, not as a substitute for sound layout.
- Avoid gratuitous linear gradients, excessive glassmorphism, sparkle icons, duplicated cards and generated-looking decoration.
- Preserve the established navigation and preferred component patterns.
- Respect reduced-motion settings, accessibility and screen readers.
- Avoid full-screen rerenders caused by small state updates.
- Keep expensive data transformations, analytics processing and AI summarization out of critical interaction paths.

Prioritize functional correctness and performance first, then polish individual screens using the existing design system.

# 16. MEASURE AND OPTIMIZE THE ENTIRE APP

Profile the running application, not just its source code.

Inspect:

- App startup and model/database initialization.
- JS and native UI frame rates.
- Screen mounts and expensive render paths.
- React Query waterfalls, duplicate requests and stale cache behavior.
- Zustand selectors and excessive subscriptions.
- SQLite migrations, large queries, indexing and unnecessary writes.
- Memory use and storage growth.
- Camera processing, native allocations and image conversion.
- Video playback, navigation transitions and modal interactions.
- Offline queues and synchronization.
- Crash frequency, native exceptions and release-only issues.

Use the actual device and profiling tools when available.

Optimize the largest measured bottlenecks first. Reuse loaded models and database connections where appropriate, batch writes, virtualize long lists, memoize only when it meaningfully helps, avoid expensive computation during rendering and reduce unnecessary network traffic.

Do not launch model initialization, full database scans, embedding generation or analytics backfills synchronously during app startup.

Provide a bounded background processing strategy for expensive AI operations. Pause or reduce nonessential work during active camera sessions.

Maintain a short performance record with before/after measurements, device/build details and any remaining limitations.

# 17. DATABASE, SECURITY AND DATA INTEGRITY

Before every schema change, inspect the existing schema, migration history, data relationships and database ownership.

Use additive, versioned migrations. Back up the relevant database when possible and document restoration steps.

Verify:

- SQLite and Supabase migrations apply cleanly.
- User, guest and signed-in data remain properly scoped.
- RLS protects each user and organization boundary.
- Offline writes synchronize without data loss or duplicates.
- Query caching does not conceal failed persistence.
- Account switching and logout do not expose prior-user memory or cached records.
- Delete/export functionality covers the intended local and remote data.
- Historical records are preserved.
- All records that feed Home, Calendar, Progress, analytics and summaries use canonical IDs and consistent data.

Never reset a production database, replace the database with dummy fixtures or delete meaningful history merely to simplify migration work.

# 18. AUTOMATED AND MANUAL VERIFICATION

Do not spend the entire session running expensive or repetitive test suites. Choose targeted checks for each changed area, then perform broader validation at meaningful milestones.

Use the package manager, scripts and dependency versions already established in the repository.

## Required validation

**AI/RAG**

- Model detection, loading, unloading, cancellation and errors.
- Real local inference with networking disabled.
- Structured-output validation.
- Correct embedding dimensions and model versioning.
- Retrieval relevance, source grounding, access filtering and deletion.
- Memory isolation, correction and persistence after restart.
- Supabase authorization and RLS with distinct users.

**State and databases**

- SQLite migration and persistence checks.
- Offline writes and retry behavior.
- React Query invalidation and synchronization.
- Zustand state updates without broad unnecessary rerenders.
- Migration rollback/restoration procedures where supported.

**Analytics**

- One logical event results in one correctly routed event.
- SQLite queue boundaries, retries, deduplication and retention.
- Consent and opt-out behavior.
- No sensitive payload leakage.
- Correct Firebase Analytics and Crashlytics configuration and delivery where verifiable.

**Coach**

- Physical-device camera initialization and permission handling.
- Live-stream inference and callback timing.
- Frame drops, latency and stale-result behavior.
- Correct landmark positioning and orientation.
- Movement-specific rep counting and form-feedback state machines.
- Audio interruption and session lifecycle handling.
- Camera/video switching, hidden/minimized player, fullscreen and Android back.
- Session persistence, duplicate prevention and honest manual fallback.

**Product-wide**

- Core route smoke tests.
- Onboarding state after completion and app restart.
- Calendar and health-record date boundaries.
- Quest/session/reward consistency.
- Group permissions and messaging rules.
- Export, deletion and account-switch isolation.
- Relevant lint, TypeScript, unit, integration, native build and release checks.

Do not claim physical-device verification if the device is not accessible. Do not claim deployment, migration or analytics delivery without direct evidence.

# 19. REQUIRED IMPLEMENTATION CADENCE

Maintain one canonical file:

`docs/implementation/THRIVEFOLD_DELIVERY_LOG.md`

If the repository already has an authoritative equivalent, update it instead of creating a duplicate.

Maintain or update:

`docs/requirements/TRACEABILITY.md`

Again, extend the existing requirement register if one already exists.

Use statuses such as:

- TODO
- IN PROGRESS
- IMPLEMENTED
- AUTOMATED TESTED
- DEVICE VERIFIED
- BLOCKED — exact reason

A feature does not become verified merely because its component exists.

Work in coherent vertical slices. Prefer finishing one meaningful user flow end to end over touching dozens of files without completing their connections.

Commit only safe, tested slices. Never overwrite concurrent work or use a destructive reset to recover from an integration problem.

At a context or session boundary, preserve the exact repository state and next actionable item. Do not promise to finish in the background.

# 20. EXACT FILE AND FOLDER PATH REPORTING

I need to understand exactly which existing files are broken and what was repaired so I can manually inspect, change or revert things myself.

Before implementation, generate a concise inventory. During implementation, keep it updated. At delivery, provide an exact file-by-file report based on the actual repository.

For every relevant file, report:

| Field            | Required information                                      |
| ---------------- | --------------------------------------------------------- |
| Path             | Exact existing repository-relative path                   |
| Area             | AI, RAG, database, analytics, Coach, UI, backend or other |
| Current issue    | Reproduced problem or verified architectural defect       |
| Change           | What actually changed                                     |
| Reason           | Why this is the correct fix                               |
| Verification     | Test/command/device check and real result                 |
| Backup           | Exact backup or recovery patch path                       |
| Commit           | Actual commit containing the change                       |
| Manual follow-up | What remains for me to inspect, configure or test         |

Include:

1. Files changed during the session.
2. Duplicate files, services, stores or modules retained temporarily and why.
3. Safe-to-remove code, with evidence and removal status.
4. Important untouched files that still need manual attention.
5. Exact native Android files and configuration files involved in the Coach, AI and analytics paths.
6. Database migrations and any applicable rollback or recovery scripts.
7. The highest-risk files to inspect first if a later regression appears.

Search the real codebase for the relevant implementation rather than fabricating standard filenames.

Likely investigation areas documented in prior requirements include `src/components/coach/`, `src/domain/pose/`, the existing AI memory implementation, health routes, social/group modules, database services, analytics services, Supabase migrations/functions and native Android modules. Verify the actual paths before changing anything.

# 21. FINAL DEFINITION OF DONE

Do not declare completion until every documented requirement has been accounted for and all feasible work has been implemented and verified.

At minimum, the final delivery must include:

- A consolidated infrastructure map that identifies canonical services and resolved duplication.
- A working existing app with no regressions introduced by the changes.
- A completed local-first AI workflow with real, tested inference where supported.
- A functioning, evidence-grounded RAG pipeline using the existing local storage and Supabase infrastructure where appropriate.
- Consistent memory and personalization with user controls and appropriate isolation.
- A documented LangGraph/workflow strategy and working integrations where required.
- Reused and repaired SQLite, React Query, Zustand, Firebase Analytics, Crashlytics and Supabase implementations.
- Measurably improved Coach responsiveness and correct live landmark alignment on the available target device.
- Functional camera/video interaction and honest exercise verification.
- All other documented product features finished as far as the available repository, credentials and hardware permit.
- No unresolved, known critical regressions hidden by mock data or fallback responses.
- Tests, actual results, meaningful commits, verified backups and an updated continuation log.
- An exact file-by-file change report with paths and manual follow-up items.

# 22. FINAL RESPONSE FORMAT

When reporting the final result, provide:

**A. Delivery summary:** What is actually completed and what changed in user-visible behavior.

**B. Feature status:** Implemented, tested, device-verified, partially complete or blocked. Provide evidence and the reason for every remaining blocker.

**C. Performance:** Before/after camera latency, inference throughput, preview FPS, memory and any other measured improvements. Use actual values only.

**D. Infrastructure consolidation:** Which existing database, analytics, state, AI and backend implementations are canonical; which duplicate implementations were safely removed or left in place.

**E. Files changed:** Exact repository-relative paths, purpose, tests and associated commits.

**F. Backups and recovery:** Exact backup locations, recovery commands and milestone commit hashes.

**G. Environment and external setup:** Missing credentials, dashboard settings, migrations, model files, device permissions and deployment actions that genuinely require manual intervention.

**H. Remaining backlog:** Every unfinished documented item, its actual current state, reason it is unfinished and the next concrete action.

**I. Next priority:** The single most important remaining task.

Do not use vague statements like “optimized everything,” “AI is fully integrated” or “the Coach is now real-time” without evidence.

**Start now. Inspect and protect the repository, read all applicable specifications, make the first meaningful code change early, and continue implementing through the backlog. Keep existing functionality, data, infrastructure and history intact. The objective is to deliver the best working version of the existing app—not another promise to build one.**

# THRIVEFOLD — MASTER PRODUCT UNIFICATION & INTELLIGENCE DELIVERY PROMPT

## Preserve the Existing Engineering. Unify Every Data Flow. Deliver a Smarter, Beautifully Integrated, Fully Working Product.

**Execution protocol: INSPECT → PRESERVE → BACK UP → CONNECT → IMPROVE → MEASURE → VERIFY → COMMIT → CONTINUE**

## 0. THE MISSION

Act as the accountable Principal Software Architect, Staff React Native Engineer, AI Systems Architect, Backend Engineer, Data Architect, Mobile Performance Engineer, Product Designer, Security Engineer and Release Owner for the existing Thrivefold application.

This is a real application with substantial work already completed. Claude has already established a good foundation across the application, backend, UI, data systems and existing features. The existing implementation is valuable and should be treated as such.

**I do not want a rewrite. I want the existing product to become significantly smarter, more unified, more accurate, more responsive and more complete.**

Do not presume that the previous implementation is broken. Inspect it, understand its existing design decisions, acknowledge what works, preserve the good engineering, and improve only where there is demonstrable value.

The objective is to make Thrivefold behave like one intelligent, connected product rather than a collection of separate features that happen to share an application.

Bring together the existing:

- User profiles, preferences and approved personal context.
- Health records, check-ins, habits, routines and historical trends.
- Exercise catalog, live Coach, camera tracking and workout history.
- Quests, games, progression, levels, achievements, rewards and streaks.
- Product analytics, local telemetry and crash diagnostics.
- Expo SQLite and its existing schemas and migration system.
- Supabase, PostgreSQL, existing APIs, Edge Functions and authorization.
- TanStack React Query, Zustand slices and current service abstractions.
- Local AI, embeddings, semantic retrieval, RAG, long-term memory and personalization.
- Existing LangGraph or other backend workflows, where present.
- Existing design system, BlinkQuest visual references, components, assets and navigation.
- Existing calendar, progress, reports, export and synchronization capabilities.

These systems must contribute to a coherent experience with correct calculations, clear ownership, useful insights and predictable behavior.

**The desired outcome is one intelligent product, one coherent data architecture, one canonical set of business rules per domain and one consistently synchronized user experience—not one gigantic database, one monolithic service or an unnecessary redesign.**

Do not stop after an audit or another implementation proposal. Inspect, preserve, improve and finish actual working code.

---

# 1. PROTECT ALL EXISTING WORK FIRST

Before editing any source file, database schema, configuration or generated asset:

1. Inspect the current branch, `git status --short`, uncommitted changes, untracked files, recent commits and existing backup/recovery strategy.
2. Read `AGENTS.md`, `README`, relevant project Markdown files, existing architectural specifications, all supplied continuation and repair prompts, current delivery logs and feature requirements.
3. Inspect the actual application, database, services, stores, APIs, backend functions, native modules, build configuration and installed package versions.
4. Recover prior good implementations from Git history when necessary. Do not recreate something that already works simply because an earlier agent did not document it.
5. Identify the highest-value improvements based on existing defects, incomplete integrations and measured performance. Begin implementation once sufficient context exists to make a safe change.

## Mandatory backups

Create a dated, verifiable backup before modifying existing work.

Use the existing backup conventions or an appropriate path such as:

`.local-backups/thrivefold-master-YYYYMMDD-HHmmss/`

Preserve relevant original files, uncommitted modifications, before/after diffs and recovery instructions. For significant changes, create incremental checkpoints.

For database work, use an appropriate database backup or recovery mechanism separately from source-code backups. Never assume that a Git commit backs up live user data.

Verify that the backups are readable and recoverable. Keep private backups and credentials out of public commits, release artifacts and generated documentation.

Never use a destructive Git reset, blanket clean, forced checkout, production database reset or database deletion to make the repository easier to modify.

## Delivery rules

Make small, coherent, tested changes. Inspect the diff, run focused checks, commit safe milestones and update the existing delivery log.

Do not commit unrelated changes or another agent's work.

Do not continue repeating the same failed command without changing the diagnosis. If a dependency, credential, environment or physical device is unavailable, finish the work that can be implemented and verified independently, document the precise blocker and continue.

The existing application and backend deserve careful improvement, not indiscriminate replacement.

---

# 2. ESTABLISH THE CANONICAL ARCHITECTURE

The repository already contains significant infrastructure. Audit it and unify it safely.

Inspect the actual implementations of:

- Expo SQLite databases, migrations, repositories and transaction helpers.
- Supabase clients, database schemas, RLS policies, RPCs, Edge Functions and synchronization.
- TanStack React Query clients, query keys, mutation hooks, caching and invalidation.
- Zustand stores, slices and persistence.
- Firebase Analytics, Crashlytics and local analytics.
- Existing AI providers, local model runtimes, memory, embeddings and RAG.
- Existing LangGraph nodes, workflow state, checkpointing and backend services.
- Exercise sessions, movement tracking, task catalogs, quests, progression and reward processing.
- Health, routines, calendar, nutrition and historical records.
- User identity, profile, preferences, local personalization and permissions.
- Existing observability, feature flags, performance tools and environment configuration.

Create or extend the existing architecture documentation rather than creating another duplicate set of documents.

Preferred documents, only if equivalent authoritative files do not already exist:

- `docs/architecture/EXISTING_INFRASTRUCTURE_MAP.md`
- `docs/architecture/UNIFIED_DOMAIN_AND_DATA_FLOW.md`
- `docs/requirements/TRACEABILITY.md`
- `docs/implementation/THRIVEFOLD_DELIVERY_LOG.md`

Use actual repository conventions where different.

For each system, identify its real path, purpose, authoritative data, consumers, persistence, initialization owner, dependencies, current defects, duplication and verification status.

## Canonical responsibility boundaries

Reuse the systems already installed and appropriately configured.

| System                       | Responsibility                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Expo SQLite                  | Durable local records, offline history, local-first operations and approved local memory/analytics storage                            |
| Supabase/PostgreSQL          | Authoritative synchronized account data, shared records, protected business operations and server-side calculations where appropriate |
| TanStack React Query         | Remote server state, fetch lifecycle, mutations, cache invalidation and synchronization                                               |
| Zustand                      | UI state and intentional client coordination, not a competing database                                                                |
| Firebase Analytics           | Consented, privacy-appropriate product telemetry                                                                                      |
| Firebase Crashlytics         | Crash and nonfatal diagnostics with redacted context                                                                                  |
| Existing local analytics     | Local diagnostics, performance measurements and bounded event queues                                                                  |
| Existing AI services         | Appropriate inference, retrieval, summarization, personalization and approved workflows                                               |
| Existing LangGraph workflows | Durable, multi-step orchestration when actually needed                                                                                |

Adjust these boundaries if the current implementation has a better documented design. Do not change the architecture just to conform to this table.

Crucially, the same record existing in SQLite, Supabase and React Query does not mean these systems should independently calculate its meaning.

For every domain entity, define the canonical writer, authoritative record, local representation, synchronization rules, derived values and cache invalidation requirements.

---

# 3. UNIFY THE DATA MODEL WITHOUT CREATING A MONOLITH

The application must be able to understand relationships between health, exercise, gaming, user preferences, AI memory, analytics and progress without creating unnecessary database duplication.

Inspect the real schemas and identify the best way to connect existing entities through stable IDs, foreign keys or documented references.

The following domain relationships must be explicitly understood.

## User and preference domain

Connect the appropriate existing profile ID, account identity, guest scope, selected experience, declared preferences, consent state and personalization settings.

Keep identity and profile data authoritative. Do not infer sensitive identity characteristics using AI.

## Health and wellbeing domain

Connect existing check-ins, user-recorded health data, symptoms, sleep, nutrition, medications, routines, calendar events and relevant history.

Health records remain the source of truth for their actual measurements. Derived health insights must refer to real records and adequate data.

## Exercise and movement domain

Use the existing exercise catalog, exercise definitions, workout plans, Coach sessions, camera verification and manually reported sessions.

Each saved session must have stable identifiers, an exercise reference, start/end timestamps where applicable, actual completed movements or holds, source of verification, relevant metrics and an unambiguous completion state.

## Gaming and progression domain

Reuse the current canonical quest catalog, assignment engine, progression logic, reward ledger, achievement system, level calculations and game records.

Connect verified activity completions to progression through existing rules. A workout must not create a duplicate quest or produce multiple rewards simply because its result is displayed in several screens.

## Analytics domain

Separate business facts from analytical events.

A verified workout completion is a canonical business event and record. A screen view or feature interaction is a product analytics event. The latter must not be used as the source of truth for completed workouts, health history or rewards.

## AI and memory domain

Connect approved user preferences, relevant historical summaries, exercise knowledge and useful activity patterns to the existing retrieval system.

An AI-generated inference is not equivalent to a verified fact or a saved business record.

## Cross-domain references

Where the existing system supports it, make it possible to answer questions such as:

- Which exercises did the user actually complete this week?
- How did the number of completed sessions change over the last month?
- Which supported training activities contribute to a particular quest?
- Does the current recommendation match the user's declared goal and experience?
- Which historical records support this insight?
- Has a recommendation already been completed, dismissed or corrected?
- Does a newly earned reward already exist in the canonical ledger?
- What useful context can be retrieved locally when the user has no connection?

Do not create separate tables containing duplicate copies of the same canonical facts simply to make these questions easier.

Use views, appropriate joins, materialized summaries or existing analytics structures when justified by actual query patterns and performance measurements.

---

# 4. BUILD THE UNIFIED INTELLIGENCE LAYER

The product should combine its existing data and AI capabilities into a deliberate intelligence layer.

This layer must connect data, deterministic calculations, retrieval, approved inference, recommendations and verified outcomes.

It should not become a new independent database or another competing AI orchestration framework.

The conceptual flow is:

**Canonical app records → validated domain events → local and server-side state updates → approved analytics and memory updates → relevant retrieval → evidence-backed insights → user action → verified outcome.**

Reuse existing service contracts wherever practical.

## Four distinct processing stages

### Stage A — Facts

Retrieve actual authorized records, preferences, completed actions, measurements and canonical domain states.

Do not fabricate records to make an insight appear meaningful.

### Stage B — Calculations

Apply the existing authoritative business rules, date logic, progression formulas, exercise definitions and validated numerical calculations.

Do not ask a language model to calculate authoritative balances, streaks, level progression, date ranges or repetition counts when deterministic code is appropriate.

### Stage C — Interpretation

Use existing AI and statistical methods to classify, retrieve, summarize and interpret the available facts.

Any inferred result must remain distinguishable from verified data and include appropriate provenance, confidence or limitations.

### Stage D — Action and evaluation

Produce a recommendation, contextual explanation, report or user-approved action.

Observe what actually happened afterward and evaluate whether the recommendation was followed, ignored, corrected or unsuitable.

Use the outcome to improve the existing recommendation logic without silently rewriting user preferences or learning incorrect rules from a single interaction.

## One product experience

Inspect the existing Home, Today, Progress, Insights, Coach, health and activity screens.

Connect them using a coherent information architecture so that users do not have to hunt through separate systems to understand their progress.

If a single existing screen can serve as the unified overview, improve it. Do not automatically add a new dashboard or navigation tab.

Present relevant information at the point where it helps: recent activity in Progress, relevant health patterns in Insights, and exercise-specific context in the Coach.

The user should experience one consistent product, while the implementation keeps domain responsibilities separate.

---

# 5. FINISH THE COMPLETE AI, MEMORY AND RAG PIPELINE

Audit the existing AI runtime, model integrations, prompts, memory records, embedding generation, retrieval functions and backend workflows.

**Extend the existing system. Do not create a second AI platform, duplicate memory vault or parallel embedding database.**

## 5.1 Local-first AI

Where already implemented, retain and improve existing local inference, classifiers, deterministic rules, embeddings and offline processing.

Where something is missing, integrate an appropriate supported local model runtime using the actual application architecture and compatible versions.

Use the local AI system for suitable small tasks such as:

- Intent classification.
- Task routing.
- Entity extraction.
- Short summaries.
- Content categorization.
- Document organization suggestions.
- Contextual memory retrieval.
- Exercise-instruction lookup.
- Appropriate personalized explanations.

Load models only when required, use explicit memory management and release resources correctly.

Maintain real offline functionality for supported tasks. Do not simulate a model, fabricate inference results or indicate that a model is loaded when it is not.

## 5.2 RAG ingestion and retrieval

Complete the entire existing pipeline from source content to useful, grounded responses.

Reuse current ingestion code, source identifiers, embedding services, document chunks, indexes and existing vector infrastructure.

Implement or repair:

1. Source authorization and validation.
2. Content normalization and chunking.
3. Stable chunk IDs and source metadata.
4. Incremental and idempotent ingestion.
5. Versioned embedding generation.
6. Local retrieval and appropriate Supabase-backed retrieval.
7. Semantic and keyword search where supported.
8. Relevance filtering and deduplication.
9. Source-aware context construction.
10. Grounded generation and appropriate citations.
11. Insufficient-evidence handling.
12. Memory correction, source deletion and re-indexing.

Filter sources by authorization before retrieval. Do not retrieve a user's private memory for another user.

Keep personal memory, approved exercise knowledge, global product documentation and community information in separate logical security scopes.

Track embedding model identity, vector dimensions and document versions. Never mix incompatible embeddings or erase existing vectors merely to simplify a model change.

## 5.3 Supabase-backed intelligence

Reuse the existing Supabase project and backend implementation.

Inspect its real schema, migrations, RLS, authentication, existing RPCs, Edge Functions, indexes and synchronization behavior.

Use the existing PostgreSQL/vector-search infrastructure when it is supported and appropriate. Do not introduce another backend or duplicate RAG schema without a verified need.

Use additive migrations, proper ownership checks, bounded queries and idempotent updates.

Server-side functions must enforce access control. Client-side filtering is insufficient.

Verify retrieval and memory isolation across users, correct deletion behavior and consistency between local and synchronized records.

## 5.4 LangGraph

Reuse the existing LangGraph workflows if they are already appropriate.

Use LangGraph for durable, multi-step, stateful workflows where it adds real value—not for every interaction or as a replacement for ordinary application services.

Keep workflow checkpointing distinct from canonical business data and persistent user memory.

Local tasks must not depend on a running backend graph when they can be completed safely on-device.

## 5.5 Recommendations must be explainable

For every important AI-derived insight or recommendation, identify the actual supporting records, relevant time range, calculation or retrieval method, limitations and whether the result is an inference.

Handle insufficient data explicitly. Avoid producing false certainty from a few check-ins or incomplete workout history.

Users must be able to correct relevant assumptions, modify preferences and dismiss or disable unsuitable personalization.

Do not infer religion, caste, ethnicity, sexual orientation, political beliefs, diagnoses or other sensitive attributes from indirect behavior.

---

# 6. UNIFY EXERCISE, COACH, GAMING AND PROGRESSION

The Coach, exercise engine, quest system, games, progression and analytics must use the same canonical underlying records.

Inspect the existing implementation before making changes. Claude has already built meaningful work here; preserve valid session handling, state machines, catalogs, reward logic and historical records.

## 6.1 One exercise and activity model

Reuse the existing canonical exercise catalog and activity/quest definitions.

Ensure the same exercise and activity IDs are used wherever appropriate across:

- Exercise selection.
- Workout instructions.
- Coach camera tracking.
- Session completion.
- Quest assignments.
- Workout history.
- Calendar integration.
- Progress and achievements.
- Analytics.
- AI-generated summaries and recommendations.

Do not create multiple exercise catalogs or independent session records for different screens.

Keep the existing authoritative catalog version and documented task rules. Verify actual coverage before adding new exercises.

## 6.2 One authoritative workout session

Track a workout using one canonical session state and persistent record.

Connect the actual session lifecycle to:

- Exercise selection and instructions.
- Camera readiness.
- Tracking state.
- Valid repetitions, holds or sequences.
- Pauses, rest and interruptions.
- Set and session completion.
- Verification source.
- History and relevant calendar entries.
- Eligible quest completion.
- Idempotent reward processing.
- Relevant progress and analytics updates.

A session may have multiple UI presentations, but they must not create duplicate business records or independently recalculate progress.

## 6.3 One progression and reward calculation engine

Audit all current XP, level, streak, achievement, points, rewards and unlock formulas.

Find and consolidate duplicate calculation logic. Maintain one authoritative implementation for each rule.

- Preserve documented progression rules.
- Calculate rewards only from verified eligible events.
- Keep server-validated rewards authoritative where required.
- Prevent duplicate rewards on retries, app resume or repeated taps.
- Make completion and skip behavior explicit.
- Preserve valid historical rewards.
- Do not create fake streaks, XP, levels or achievements.
- Ensure every UI representation uses the same calculated result.
- Expose understandable explanations of reward changes.

Where progression formulas are adjusted, create versioned changes and migration rules rather than silently changing the meaning of existing users' records.

## 6.4 Improve intelligent personalization

Use real exercise history, declared goals, supported capability, difficulty preferences and appropriate prior feedback to recommend suitable activities.

The system should help users discover appropriate exercises, avoid unnecessary repetition and understand progress.

Do not use an LLM to decide whether a repetition happened or whether the user is entitled to a reward. Those decisions require verified state and explicit business rules.

---

# 7. FINISH THE REAL-TIME VIRTUAL COACH

Preserve the existing Coach implementation and build on its working parts.

The desired experience is a premium, responsive virtual instructor with an intentional visual hierarchy, beautiful Skia landmarks, synchronized movement feedback, accurate exercise calculations and useful guidance.

Inspect the actual camera, pose runtime, native module, Skia overlay, exercise state machines, audio/TTS, video controls, session persistence and design system.

Use BlinkQuest as a visual reference where its real assets or code are available. Preserve Thrivefold's own identity and tokens.

## Real-time requirements

- Keep the camera preview responsive independently of inference speed.
- Reuse the current supported native live-stream pipeline where it is appropriate.
- Use current timestamps, bounded frame queues and fresh-result handling.
- Correct scaling, crop, rotation, mirroring and coordinate alignment.
- Render landmarks through an efficient Skia overlay where appropriate.
- Avoid unnecessary React rerenders, image copies and per-frame database writes.
- Use exercise-specific repetition, hold and sequence logic.
- Provide evidence-backed, confidence-gated form feedback.
- Synchronize visible counters, timers, spoken cues and saved session state.
- Stop inference and release camera resources correctly.
- Keep basic tracking and exercise functionality available offline where supported.

Do not call an LLM on every camera frame.

The deterministic exercise engine should recognize the current movement state. AI can provide appropriate explanations, personalization and retrieved exercise knowledge asynchronously.

## Exercise coverage

Audit every existing exercise in the canonical catalog. Identify which can genuinely support camera-verified reps, holds or sequences, which need another camera view or model, and which require a manual/timed fallback.

Cover the documented workout families, including gym, bodyweight, mobility, yoga, traditional Indian exercises, Kalaripayattu, Dand-Baithak and martial-arts sequences where present in the existing requirements.

Do not claim that an exercise is camera-verified solely because it appears in a list.

## Camera and instructional video

Keep the camera as the primary active surface.

- Automatically show a skippable, verified instructional video on first use where available.
- Minimize the tutorial by default for repeat sessions.
- Let users hide it completely, restore it, minimize it or expand it where the actual player supports those modes.
- Coordinate layout transitions without resetting the workout.
- Keep fullscreen and Android back behavior correct.
- Avoid making video playback compete unnecessarily with pose inference.

Use the existing `FrostedView`, glass-orb controls and visual primitives when they suit the established design.

## Performance

Measure actual preview FPS, landmark-result latency, stale-frame age, dropped frames, memory consumption and interaction responsiveness on the reference Android device.

Use measured data to optimize the existing implementation. Do not guarantee 60 FPS or any latency target without verifying the target hardware.

Maintain a safe and bounded inference strategy, suppress duplicate subscriptions and avoid accumulating stale frames.

---

# 8. UNIFY HEALTH, EXERCISE, GAMING AND ANALYTICS CALCULATIONS

Audit every existing calculation that influences health displays, progress, activity summaries, daily plans, streaks, achievements and AI recommendations.

The same underlying records must produce consistent results everywhere.

## Calculation registry

Create or extend a calculation registry and documentation using the actual project's architecture.

For each calculation, record:

- Its canonical function or service.
- Source records and input fields.
- Units and permitted value ranges.
- Date and time-zone semantics.
- Formula and applicable conditions.
- Rounding and missing-data behavior.
- Data sufficiency requirements.
- Version and change history.
- Related UI screens and downstream consumers.
- Tests covering normal, edge and failure cases.

Do not create a new calculation engine if an authoritative existing implementation already exists. Document the existing canonical functions and strengthen them instead.

## Required consistency

Verify at least:

- Active session duration and paused/rest durations.
- Completed exercises, valid repetitions and holds.
- Daily/weekly/monthly activity summaries.
- Workout-history aggregates.
- Quest completion and reward eligibility.
- XP, levels, streaks and achievements.
- Calendar events and daily assignments.
- Health and habit trend calculations.
- AI insight time ranges and evidence.
- Local and server-side summary consistency.
- Data export values and timestamps.

Keep raw data, derived metrics and recommendations distinguishable.

Never sum incompatible units, double-count mirrored records or treat duplicated analytics events as completed activities.

Use one documented rounding strategy and consistent local-date semantics. Preserve the product's existing authoritative health/cycle rules and historical records.

AI-generated prose may describe a calculation, but the displayed numeric result must come from the canonical calculation.

## Regression tests

Include zero-record cases, insufficient history, duplicated events, missing fields, interrupted sessions, edits and deletions, timezone boundaries, guest/account transitions, offline retries and server/local reconciliation.

A formula must not silently produce a plausible value when required source data is missing.

---

# 9. CONSOLIDATE SQLITE, SUPABASE, REACT QUERY AND ZUSTAND

Use the existing infrastructure rather than introducing new versions of the same services.

## Expo SQLite

Reuse current databases, schemas, migrations and repositories.

Use SQLite for appropriate durable local records, offline activity history, approved local memories and bounded synchronization or analytics queues.

Use transactions, prepared statements, appropriate indexes and controlled initialization. Do not persist per-frame camera coordinates or raw landmarks as an ordinary exercise-history record.

## Supabase

Keep the existing backend as the shared system of record for the appropriate synchronized data.

Extend the present schemas, functions and policies. Protect records with RLS and server-side authorization.

Use additive migrations and a verified deployment procedure. Never reset production data.

## React Query

Reuse the existing QueryClient and query-key conventions.

Fix stale caches, duplicate requests and invalidation gaps. Mutations must update or invalidate the correct cached representations after a successful canonical write.

Do not build a second query client for Coach, AI or games.

## Zustand

Retain useful existing stores and slices.

Use Zustand for intentional UI/session coordination, not as a second persistent database or unbounded copy of Supabase records.

Avoid broad subscriptions and unnecessary rerenders, especially during live camera inference.

## Synchronization

For each synchronized entity, define:

1. Where it is created.
2. Its canonical owner.
3. How local writes are stored.
4. When it is synced.
5. How retries and idempotency work.
6. How conflicts are resolved.
7. How caches are reconciled.
8. How edits and deletions propagate.

Test offline operation, retry after reconnection, repeated requests, account switching and deletion.

Local and backend state must converge without duplicates or silent loss.

---

# 10. UNIFY LOCAL ANALYTICS, FIREBASE ANALYTICS AND CRASHLYTICS

Reuse the existing analytics and crash-reporting systems.

Do not introduce a new provider merely to collect similar events.

Use a documented event schema with stable event IDs and appropriate event versioning.

Collect meaningful, consented product events for:

- Feature entry and successful/failed outcomes.
- Exercise sessions and valid completion.
- Quest and game progression.
- Important navigation and onboarding transitions.
- AI task and retrieval execution.
- Backend synchronization and service errors.
- Coach readiness, tracking loss and performance metrics.
- App stability and significant performance regressions.

Keep local analytics useful for debugging and offline diagnostics, Firebase Analytics responsible for approved product telemetry, and Crashlytics responsible for crash/error diagnostics.

Do not let rerenders or camera frames produce repetitive analytics events.

Never send raw body landmarks, camera frames, audio, private journals, cycle or medication records, secrets or sensitive personal attributes to remote analytics.

Respect consent and opt-out. Avoid unbounded queues and network requests during a live workout.

Verify actual release integration and event delivery where access permits. A locally recorded event is not evidence that Firebase received it.

---

# 11. MAKE AI INSIGHTS AND REPORTS USEFUL ACROSS THE ENTIRE APP

Use the existing records and canonical calculations to generate contextual reports that help users understand meaningful progress.

Do not create another analytics database or another disconnected dashboard.

Improve the existing relevant screens to provide:

- A coherent overview of recent progress.
- Actual completed activity summaries.
- Relevant trends over appropriate time ranges.
- Connections between documented goals and completed activities.
- Retrieval-backed exercise explanations.
- Recommendations grounded in valid source records.
- Clear data limitations and insufficient-history states.
- User-correctable preferences and dismissible suggestions.
- A useful history of recommendations and actual outcomes.

Use AI for concise explanations, categorization, contextual retrieval and suitable recommendation generation.

Use deterministic calculations for measurements, rewards, streaks, timers and other authoritative numbers.

For every important recommendation, preserve the supporting evidence and identify whether it is directly recorded, calculated or inferred.

Do not turn correlation into causation. Do not diagnose users or secretly classify sensitive personal identities.

If a recommendation is based on inadequate evidence, provide a neutral explanation or no recommendation.

The result should be genuinely useful, not a stream of generic motivational text.

---

# 12. BACKEND WORKFLOWS AND AI ORCHESTRATION

The existing backend is already a valuable piece of the product. Preserve its working deployment, schemas, authentication, APIs and service boundaries.

Improve the backend by connecting existing services, correcting calculation duplication, strengthening authorization and completing the missing data flows.

Reuse existing LangGraph workflows for complex, durable orchestration where available.

Keep simple domain operations in appropriate existing services or database functions. Do not create a graph node or LLM request for every ordinary CRUD operation.

Implement explicit workflow state, bounded retries, idempotency, validated inputs/outputs, cancellation, observability and appropriate checkpointing.

Use human confirmation for consequential AI-initiated changes.

Keep AI workflow persistence separate from canonical user records. A completed graph run does not automatically mean a workout, quest, reward or health record has been successfully saved.

When a backend dependency is unavailable, preserve the offline path where appropriate and report the limitation accurately.

---

# 13. PRESERVE THE BEST EXISTING UI AND IMPROVE THE EXPERIENCE

Keep the product's established navigation, screens, tokens, component architecture and functioning backend flows.

Use the actual BlinkQuest reference where available to improve the aesthetic quality of relevant surfaces. Do not replace Thrivefold branding with a generic redesign.

Focus on:

- More cohesive visual hierarchy.
- Better Coach overlays and controls.
- Responsive screen interactions.
- Consistent status, loading, empty and failure states.
- Better bottom sheets and modal behavior.
- Clearer progress and activity summaries.
- Less duplicated content and unnecessary decoration.
- Accessibility and reduced-motion support.
- Responsive rendering and safe-area behavior.
- Consistent presentation of canonical calculations across screens.

Reuse existing components. Create new reusable abstractions only where they remove a real duplication or solve a clear design gap.

Do not break the established Home/Today and universal-calendar flows to force in a new dashboard.

---

# 14. FINISH ALL DOCUMENTED FEATURES

Do not allow integration work to become an excuse to abandon existing product requirements.

Audit and work through every feature in the current master specifications, including:

- Authentication, guest mode and session restoration.
- Home, Today and onboarding completion.
- Universal Calendar and routines.
- Health tracking, cycle logging and historical data.
- Sleep, mood, energy, symptoms, nutrition and medication records.
- Coach, camera, exercise definitions and workout history.
- Quests, games, progression, levels, rewards and achievements.
- AI memory, RAG, personalization and reporting.
- Profile, settings, privacy, accessibility and data management.
- Existing letters, messaging, community/group and organization features.
- Exports, account deletion and synchronization.
- Backend functions, migrations, RLS and deployment configuration.

Preserve historical records and documented safety rules. Use the canonical task catalog and reward engine. Make feature access consistent between the client and backend.

No fake data, dead buttons, mocked completion paths or fabricated user metrics may be used to make an incomplete feature look finished.

Resolve conflicting historical specifications using the authoritative project documentation and actual existing code. Record the decision rather than silently removing a capability.

---

# 15. IMPROVE PERFORMANCE WITHOUT DAMAGING WORKING CODE

Profile the existing application and backend before optimizing.

Measure:

- App startup and initialization.
- SQLite query performance and database growth.
- React Query cache behavior and request waterfalls.
- Zustand subscription and rerender costs.
- Backend API latency and query performance.
- RAG retrieval latency and quality.
- AI model startup and inference time.
- Coach preview FPS and landmark freshness.
- Memory, battery and sustained-session stability.
- Analytics queue size and background work.
- Crash rates and release-specific failures.

Optimize measured bottlenecks first.

Avoid loading large models or running embedding backfills synchronously at startup. Keep RAG and analytics work out of the live camera critical path.

Use batch processing, appropriate indexing, bounded concurrency and reusable resources where justified.

Do not install new dependencies or change framework versions without a concrete, verified reason.

Maintain a before-and-after performance record with actual hardware/build information. Do not fabricate performance improvements or promise identical results on every device.

---

# 16. TEST THE COMPLETE SYSTEM, NOT JUST INDIVIDUAL SCREENS

Add or improve focused tests that establish the integrity of the unified product.

## Data and calculations

- Canonical entity relationships.
- No duplicate session or reward creation.
- Correct duration, streak, XP and progression calculations.
- Historical record preservation.
- Correct date and time-zone behavior.
- Offline writes and reconnection.
- Correct synchronization and cache invalidation.
- Export values matching canonical records.

## AI and retrieval

- Real inference and supported offline fallback.
- Embedding compatibility and re-indexing.
- RAG source relevance and grounding.
- Authorization filtering.
- Memory isolation and deletion.
- Insufficient-evidence handling.
- Recommendations based on actual records.
- Safe failures when providers are unavailable.

## Coach and exercise

- Live camera initialization.
- Landmark alignment and fresh timestamps.
- Repetition/hold state-machine correctness.
- Tracking loss without fabricated results.
- Voice/counter/session synchronization.
- Camera/video transitions and fullscreen recovery.
- Accurate persistence after interruptions.

## Backend and integrations

- RLS across users and roles.
- Authentication and account switching.
- Idempotent mutations.
- Migration correctness.
- Analytics deduplication.
- Crash reporting and error handling.
- Correct local/server reconciliation.

## Product quality

- Core route smoke tests.
- Real user flows across Home, Calendar, Coach, Quests and Progress.
- Loading, empty, error, offline and permission-denied states.
- Export and deletion.
- Regression checks for existing functioning screens.

Use the existing package manager, scripts and installed versions. Run focused tests during development and broader checks at coherent milestones.

If physical-device or live-backend access is unavailable, distinguish automated verification from unperformed manual verification.

---

# 17. BACKUPS, CHECKPOINTS AND CHANGE TRACEABILITY

Keep exact paths and changes easy to inspect manually.

For every milestone, document:

- Existing files modified.
- New files created.
- Duplicate code consolidated.
- Database migrations introduced.
- API or service contracts affected.
- The actual reason for each change.
- Relevant tests and real results.
- Backup/recovery location.
- Commit hash.
- Remaining defect or risk.

Update the existing delivery log and requirement traceability documents instead of creating redundant alternatives.

Never delete a working component merely because another component seems cleaner. Establish that it is redundant, migrate all consumers, preserve records and verify the replacement first.

Commit coherent, verified work. Do not commit secrets or unrelated modifications.

At any session boundary, leave a durable record of exactly what is completed, what has been verified, what is blocked and the next concrete engineering action.

---

# 18. FINAL ACCEPTANCE CRITERIA

The work is complete only when the application behaves as one connected product and all documented requirements have been accounted for.

The final result must demonstrate:

1. Existing good application and backend work preserved.
2. One documented canonical source of truth for each domain entity.
3. Existing SQLite, Supabase, React Query, Zustand and analytics systems reused coherently.
4. Duplicate business logic and duplicated persistence removed safely where justified.
5. Health, activity, exercise and gaming records consistently connected.
6. Calculations correct and consistent across all relevant screens.
7. AI recommendations grounded in actual, authorized source data.
8. Local AI/RAG functioning for the tasks that claim offline support.
9. Secure backend orchestration and authorization where required.
10. Coach tracking, feedback, sessions and history properly synchronized.
11. Useful product analytics and working crash diagnostics without sensitive-data leakage.
12. Measurable performance improvements where bottlenecks were found.
13. Existing features retained and the full documented backlog accounted for.
14. Automated tests and relevant builds passing, with real-device checks recorded where available.
15. Verified recovery backups, meaningful commits and a precise file-by-file handoff.

# 19. REQUIRED FINAL REPORT

Provide:

**A. What was already working:** Preserve credit for the strong existing implementation and identify what was retained.

**B. What was improved:** Describe actual user-visible changes, integrations and corrected defects.

**C. Unified data architecture:** Explain canonical ownership, SQLite/Supabase synchronization, state management and calculations.

**D. AI and RAG:** Report actual local inference, ingestion, retrieval, memory, workflows and validation status.

**E. Exercise and gaming integration:** Show how real sessions lead to canonical history, analytics, eligible rewards and consistent progress.

**F. Performance:** Include measured before-and-after results and any remaining limitations.

**G. Exact changed files:** Provide repository-relative paths, purpose, tests, backup locations and commits.

**H. Backend/database changes:** List migrations, APIs, functions, policy changes and any manual deployment actions.

**I. Verification:** Clearly separate implementation, automated testing, build verification, live-service verification and physical-device testing.

**J. Remaining work:** List all documented outstanding items, exact blockers and next actions. Do not hide incomplete work behind an overall success claim.

## FINAL DIRECTIVE

The existing Claude implementation is the starting point, not disposable work.

Study its strengths. Preserve its architecture where it is sound. Reuse the existing code, records, calculations, state, analytics, database, backend and assets. Eliminate duplication only when you have established the correct replacement. Connect every important feature through its canonical data and business logic.

Build a product where user activity, exercise results, gaming progression, health history, personalization, analytics and AI insights complement one another without becoming separate competing systems.

**Make Thrivefold more intelligent through better data, more accurate calculations, relevant context and verified outcomes—not through more AI calls, more databases, more dashboards or more abstraction.**

Back up first. Improve incrementally. Test the actual behavior. Commit every verified milestone. Keep everything recoverable.

Do not stop at the plan. Finish all feasible documented work, preserve the good engineering that already exists, and leave a precise account of every remaining limitation.
