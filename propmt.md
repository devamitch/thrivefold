# THRIVEFOLD — FINAL MASTER EXECUTION PROMPT

## Complete Application · Production Backend · AI & Computer Vision · Health · Quests · Progression · Communities · Privacy · Release

**Execution mode:** Continue and finish the existing project in place.  
**Authoritative product specification:** `thrivefold_ultimate_master_build_prompt_v2.md`  
**Backend default:** Supabase + PostgreSQL + secure server-side operations.  
**Client:** Existing Expo / React Native / TypeScript application, using the actual installed versions and Expo Router where already established.  
**AI:** Local-first intelligence, optional cloud AI, retrieval and memory, and task-specific computer vision where technically supported.  
**Product standard:** Real implementation, real data, connected flows and verified outcomes—not mock screens, promises or another architecture proposal.

---

# 0. YOUR MISSION

You are simultaneously acting as a senior product architect, React Native and Expo engineer, Supabase/PostgreSQL engineer, AI systems engineer, computer vision engineer, mobile UI/UX designer, security engineer, health-data privacy engineer, accessibility specialist, performance engineer and test/release engineer.

Your mission is to finish Thrivefold as a coherent application, including the existing product and all applicable mobile, web, backend, data, AI, game, health, social, security and operational functionality described in the authoritative product specification.

The current application has broken or incomplete flows. The objective is not to redesign a handful of screens while leaving the underlying problems untouched.

**Inspect the actual code, implement the real changes, connect the domains, build the backend operations, run tests, fix failures and verify the important user journeys.**

Do not stop after an audit, a directory tree, an implementation plan, types, static mock data, a dashboard redesign, or a report.

Work within the available repository, credentials, tools and build environment. Finish everything that can genuinely be completed, and identify only the specific external blockers that cannot be resolved from the available environment.

# 1. AUTHORITATIVE SOURCE, DOCUMENTS AND REQUIREMENT TRACEABILITY

## 1.1 Source-of-truth rules

Read `thrivefold_ultimate_master_build_prompt_v2.md` completely. Treat it as the authoritative source for Thrivefold's product intent, requirements, architecture and policy configuration.

Also inspect all relevant existing source files, product requirements, engineering documents, database migrations, package manifests, schemas, game catalogs, validation reports, existing tests, design references and uncommitted code.

Use the supplied final execution requirements together with the master specification to ensure that no required feature is lost.

Do not ask me to restate information already available in the project or supplied documents.

Resolve contradictions deliberately. Apply this order:

1. Applicable law, safety, consent and platform requirements.
2. Explicit user privacy choices, recipient boundaries, blocking and verified eligibility.
3. The authoritative master product requirements.
4. More-specific implementation requirements provided for the current work, where consistent with the master and the preceding rules.
5. Existing working architecture and valid user data.
6. Documented engineering decisions and safe defaults.

If a requested identity-based or social policy requires legal or distribution review, represent it in the policy engine and tests, but do not activate it in production until approved. Do not silently remove it from the requirement inventory.

## 1.2 Requirement traceability is mandatory

Create or update a concise `docs/requirements/TRACEABILITY.md` containing all requirements and meaningful sub-requirements from the master specification and this execution prompt.

For each requirement, record:

- Stable requirement ID.
- Original intent.
- Existing implementation evidence.
- Target domain and actual screen/route.
- Database table, API, native module or server function involved.
- Eligibility and privacy policy.
- Loading, empty, success, error, offline and denied states where applicable.
- Acceptance-test IDs.
- Actual status: existing and preserved, implemented, tested, externally blocked, awaiting review, or not started.
- A factual explanation for anything not shipped.

Maintain a concise decisions/conflicts document only where a real ambiguity or trade-off requires it. Do not generate large collections of unnecessary Markdown files.

No required capability may disappear simply because it is difficult, sensitive, expensive, incomplete or inconvenient.

# 2. USE ALL RELEVANT INSTALLED SKILLS AND TOOLS

Discover all available development skills, project instructions, agent instructions and applicable tooling skills in the environment. Read and apply **every relevant skill** to the real work.

This includes, where applicable:

- Expo and React Native development.
- Expo Router and navigation.
- TypeScript and native module architecture.
- Mobile UI/UX and design systems.
- Accessibility and responsive layouts.
- Reanimated and performance optimization.
- Supabase, PostgreSQL, RLS and secure backend development.
- Local persistence and offline-first synchronization.
- AI orchestration, model evaluation, retrieval and memory privacy.
- Computer vision, MediaPipe and camera integration.
- Gamification, verification policies, ledgers and progression.
- Calendar, time-zone and reproductive-cycle calculations.
- Security, privacy threat modeling and authorization.
- Testing, CI/CD, Android builds and release verification.

Use official, current documentation for APIs and package-version-sensitive behavior. Use online research where it materially improves decisions, and distinguish actual implemented behavior from researched possibilities.

Inspect the actual installed libraries before adding dependencies. Do not upgrade packages blindly or introduce unrelated frameworks solely to satisfy a generic checklist.

Do not claim a tool, skill, library, model, integration, build, test or service has been used or verified unless that actually happened.

# 3. AUDIT AND PRESERVE BEFORE MODIFYING

Inspect the repository and identify:

- The actual mobile and web application structure.
- Expo SDK, React Native version, TypeScript configuration and package manager.
- Existing Expo Router routes, layouts and guards.
- Authentication, session restoration and onboarding state.
- Existing shared UI components and theme tokens.
- Existing Supabase project configuration, schema, migrations, RLS policies, Edge Functions and storage buckets.
- Existing local database, offline queue, query cache and synchronization behavior.
- Health, cycle, calendar, exercise and journaling implementations.
- Version 3 game catalog, its schema, validation report and backend-only assessment keys.
- Existing level, reward, diamond, entitlement, community, correspondence and moderation implementations.
- Existing AI providers, BYOK setup, embeddings, local memory, native modules and downloaded model assets.
- Existing BlinkQuest references or shared implementations, including MediaPipe, camera processing, exercise recognition, Lottie assets, animations and related design tokens.
- Existing tests, CI checks, app build configuration and deployment instructions.
- Uncommitted changes and legitimate data that must remain intact.

Preserve working functionality. Fix source-level causes instead of replacing broken functionality with a superficially similar prototype.

Do not perform destructive cleanup, reset a database, rewrite historical health records, discard uncommitted work or overwrite production data without an authorized migration plan and backup.

# 4. COMPLETE ARCHITECTURE — SUPABASE FIRST

## 4.1 Primary backend decision

Use **Supabase as the primary system of record** unless the actual repository contains a justified, working alternative.

The default architecture is:

- Supabase Auth for the existing configured account lifecycle.
- PostgreSQL for durable server-side records.
- RLS and appropriate grants for row-level data security.
- Supabase Storage for approved cloud files with correct access controls.
- Edge Functions for appropriate authenticated endpoints, AI-provider orchestration, webhooks and short server workflows.
- PostgreSQL functions/RPCs and transactions for critical atomic database operations.
- Scheduled functions and suitable jobs for reminders, delivery and cleanup where supported by the configured plan.
- Durable mobile-side local persistence for supported offline behavior.
- Shared TypeScript domain contracts, validation schemas and typed API wrappers consistent with the existing project.

Do not build an entirely separate custom backend simply because Thrivefold has many features.

A Go or Python service may be added later—or now if the audit identifies a genuine hard requirement—for persistent background workers, heavy computer vision, long-running AI inference, specialized queues or workloads that exceed Supabase's operational limits.

If a custom service is necessary, define exactly why, its responsibility boundary, authentication, deployment, monitoring and cost. Keep Supabase PostgreSQL as the single source of truth unless measurable technical evidence justifies a change.

Do not run competing Supabase and Firebase account or data systems. Do not duplicate XP, diamond balances, user profiles or entitlement truth in another database.

## 4.2 Build the complete backend, not just the client

Inspect and finish every backend operation required by the real app.

Implement, where applicable:

- Authentication callbacks and account lifecycle.
- Profiles and onboarding preferences.
- Versioned feature-eligibility policies.
- Health and calendar persistence contracts.
- Task catalog references and task assignments.
- Quest skips and special-quest replacements.
- Evidence submission and verification records.
- Authoritative daily-point calculations.
- XP and skill-XP ledgers.
- Level clearances and diamond ledger.
- Feature-unlock entitlements.
- AI usage accounting and quotas.
- Local-to-cloud sync events and receipts.
- Community membership and organization roles.
- Invitations, event registrations and organizer permissions.
- Controlled correspondence and delivery state.
- Reporting, blocking, moderation and appeals.
- Notification preferences and quiet hours.
- Data export and authorized account deletion.
- Audit events, operational status and administrative workflows.
- Payment or subscription integration only where genuinely configured and within scope.

Use migrations, foreign keys, unique constraints, appropriate indexes, explicit versions, transaction-safe operations and stable IDs.

Do not create an API endpoint that simply returns hardcoded success.

## 4.3 Backend authority

The client must not be trusted to determine:

- Authentication or verified identity.
- Account role or organization privileges.
- Age assurance or adult-feature eligibility.
- Feature access or block status.
- Task verification status.
- Authoritative points, XP, levels or diamonds.
- Entitlement creation or spending.
- Dating first-contact permissions.
- Private group membership.
- Payment and refund state.
- Moderation outcomes or account suspensions.

Enforce these policies server-side and at the database level, in addition to hiding unavailable UI elements.

## 4.4 Resource and cost discipline

Verify live provider documentation, quotas, regional availability, retention terms, execution limits and pricing during implementation.

Start with free-tier-compatible local development when practical, but do not promise free hosting, AI or operation forever.

Create development, staging and production configuration with independent secrets, databases and appropriate data boundaries.

Use spend caps, rate limits, payload limits, timeouts, retries, circuit breakers and graceful degradation.

Cloud AI should default to disabled until explicitly configured. A cloud quota being exhausted must not break core health tracking, quest execution, account security or local records.

Model registered-user count, monthly active users, daily activity, peak concurrency, letters, storage, camera processing, AI requests and notification volume separately. Do not mistake a provider's account ceiling for a tested production capacity.

# 5. PRODUCT EXPERIENCES AND DESIGN SYSTEM

Thrivefold is not a generic wellness application. Preserve and complete the product's existing distinct experiences.

## 5.1 Women's Health

Preserve the existing working women's-health web application and its brand, routes, data and calculations. Extend it additively.

Retain the applicable cycle tracker, symptoms, historical periods, estimates, reproductive education, medication reminders, health records, journals and existing product-specific features.

## 5.2 Men's Health

Build a meaningful experience with its own mature visual identity and relevant navigation, content and tasks.

Include proper gym and workout functionality, covered in Section 13.

## 5.3 Pride/LGBTQ+ Wellbeing

Provide an affirming, opt-in experience with its own balanced theme and appropriate community options. Keep identity settings voluntary and private.

Never expose LGBTQ+ preferences or memberships to other groups or public profiles without explicit disclosure and consent.

## 5.4 Shared wellbeing

Support shared movement, sleep, recovery, mindfulness, learning, reflection, personal routines, accessibility-adapted activities and suitable cooperative goals.

## 5.5 Design requirements

Use the established Thrivefold/Neev Sanctuary flat design direction where appropriate:

- Zero drop shadows and zero elevation.
- Flat semantic surfaces with consistent spacing.
- Consistent 16–24 point rounded corners where suitable.
- Pista-green primary accents, restrained terracotta/coral accents and warm neutral surfaces where appropriate.
- Clear typography, contrast, dynamic type and accessible tap targets.
- Purposeful, reduced-motion-aware Reanimated interactions.
- Immediate visual press feedback on buttons, chips and actionable cards.

Avoid ornamental borders, excessive cards, neon colors, noisy gradients, childish artwork, decorative icons, emoji-based navigation and unnecessary animations.

Do not replace the established women's-health design with the men's or Pride theme. Use product-variant tokens and explicit configuration rather than scattered gender-based conditional styling.

**Do not add navigation illustrations, generic route diagrams or decorative visual filler to the application.** Build real screens, clear labels, helpful interactions and functional navigation. Architecture diagrams may be maintained in engineering documentation where genuinely useful.

Inspect and reuse real shared headers, modal sheets, alert/toast behavior, buttons, forms, safe-area layouts and theme utilities before implementing duplicates.

# 6. AUTHENTICATION, INTRODUCTION AND ONBOARDING

## 6.1 Introduction slider

Repair the missing first-run experience with four slides:

1. Private Health & Cycle Tracking.
2. Verified Daily Quests & Real Progress.
3. Reflective Letters & Private Communities.
4. On-Device Memory Vault & Personalized AI.

Provide accessible pagination, manual swipe gestures, reduced-motion-aware transitions and an optional approximately 4.5-second slide interval that pauses during interaction.

Show contextually appropriate `Get Started`, `Sign In` and `Explore as Guest` actions.

Do not require users to repeat the entire introduction on every launch.

## 6.2 Sign-in, sign-up and recovery

Repair the real authentication flow with the backend currently configured. Validate inputs, handle errors, support loading states, prevent duplicate submissions and restore existing sessions correctly.

Do not fabricate successful authentication or give clients self-selected privileges.

## 6.3 Guest mode

Guests can use supported personal features with actual local persistence. Clearly distinguish a local guest profile from a verified account.

Account conversion and merge must be deterministic, preserve existing records and never issue duplicate rewards.

## 6.4 Personalized onboarding

Use progressive disclosure. Ask only what is relevant:

- Pseudonym/display name and emblem.
- Chosen wellbeing experience.
- Primary goals and preferred routine length.
- Relevant activity, mobility and accessibility constraints.
- Optional dietary preferences, allergies, language and routines.
- Optional reproductive or health-tracking preferences.
- Optional cultural, faith, observance and community preferences.
- Privacy choices, notification settings and relevant consent.
- Permissions only when their feature is needed.

Sensitive fields must be voluntary and purpose-limited. Keep a health-only experience available without dating, intimate preferences, religion, sexual orientation or social membership disclosure.

Use real existing health history and qualifying verified progress to personalize returning users. Use selected goals, ability, activity constraints and preferences to tailor recommendations for new users.

Do not fabricate previous progress, grant false level history, or award verified achievements based on ambitious goals or unverified self-claims.

Relevant profile and onboarding state must persist and actually influence recommendations, visible features and eligible task assignment.

# 7. HOME DASHBOARD — A REAL DAILY EXPERIENCE

Replace the current single-question or nearly empty home screen with a concise, useful dashboard.

Show:

- A consistent app header and the real selected display name.
- A greeting where suitable.
- Actual daily check-in or a way to continue it.
- Relevant rhythm/health information where the feature is enabled.
- Several actual eligible daily quests—not only the first recommendation.
- Real daily-point contribution and goal.
- Actual XP, level, skills and diamond balance where appropriate.
- A way to resume unfinished assignments.
- Relevant reminders and saved events.
- A few useful shortcuts to the calendar, health, quests and progression.

Provide genuine first-run, offline, rest-day, completed-day, pending-verification, no-task and empty-history states.

Use filters such as All, Movement, Mind, Rhythm and Nutrition where useful. The filters must operate on real catalog data.

Show task details, duration estimates, potential configured rewards and actual verification requirements. Do not show “Verify & Claim” for a task that still needs to be performed.

Do not fill the dashboard with every possible feature. Prioritize the most relevant actions and expose secondary capabilities contextually.

# 8. COMPLETE GAME CATALOG AND QUEST ENGINE

Use the existing canonical version 3 game catalog, schema, validation report and trusted assessment answer keys. Inspect and validate all of them.

Do not replace the catalog with hardcoded screen data or duplicate task definitions inside components.

Each task must resolve to a complete versioned definition, including objective, instructions, scope, prerequisites, eligibility, registered verification policy, evidence rules, repeatability, reward policy, skill rewards and unlock references where applicable.

The catalog is the authority for task definitions. AI can explain or personalize an existing task, but cannot invent official tasks, verification rules or rewards during normal gameplay.

## 8.1 Daily standard quests

The default daily experience may contain **three standard quests**, while the assignment count remains configurable according to catalog availability and product policy.

Assignments must be stable for the user and the relevant local game date. Refreshing or reopening the application must not regenerate assignments.

Select appropriate quests using the catalog, experience scope, goals, prior activity, skills, level requirements, prerequisites, user preferences, accessibility, duration and applicable policy.

## 8.2 Skip and same-category special replacement

When a user skips an unsuitable quest:

1. Persist its skipped state.
2. Award nothing merely for skipping.
3. Preserve points already earned from other quests.
4. Search the real catalog for a distinct eligible special quest from the **same category**.
5. Match the replacement's contribution to the skipped quest's configured point value or permitted reward band, within a documented tolerance.
6. Show the actual objective, duration, evidence type and possible rewards.
7. Persist the accepted replacement with its own assignment ID and version.
8. Award nothing for accepting it.
9. Award configured rewards only after its task-specific verification policy succeeds.

Example: skipping a Movement quest should offer an appropriate Movement special quest—not an unrelated Mind or Nutrition task simply because it is easier to generate.

Do not fabricate a special task when none exists. Explain that no valid replacement is available and allow the user to continue without punishment.

Prevent unlimited rerolls, stale evidence replay, duplicate replacement transitions, repeated reward farming and replacement tasks that violate prerequisites or safety policies.

Skipping does not erase prior rewards and must never become a coercive mechanism.

## 8.3 Daily points and permanent progression are separate

Maintain separate, well-defined ledgers or projections for:

- Daily point contribution.
- Permanent XP.
- Skill XP.
- Diamonds.
- Streaks and check-in days.
- Daily-goal completion.
- Entitlements and feature unlocks.

A task awards only the reward types allowed by its configured policy. Reaching today's points target does not excuse invalid task evidence.

The daily-goal reward must be issued once if and when its actual conditions are satisfied.

# 9. TASK EXECUTION, VERIFICATION AND COMPUTER VISION

Build the real objective-specific task lifecycle. Do not send all activities into the same generic completion modal.

Support the applicable task types:

- Timed breathing or mindfulness.
- Guided movement and workout tasks.
- Pose or movement checks where supported.
- Knowledge assessments.
- Structured reflections.
- Planning tasks.
- User-reported external activities.
- System-verified application events.
- Evidence-supported submissions.
- Pending verification or review.

A mindfulness activity must never accidentally show unrelated exercise poses. A quiz must not use an unregistered generic verification handler.

Each task must display the actual instructions, relevant safety modification, estimated duration, accepted evidence, potential reward and proper next action.

Supported states include assigned, in progress, evidence submitted, pending verification, verified, self-reported, rejected, skipped, replaced and expired.

Validation must check ownership, task version, evidence schema, objective type, prerequisites, policy version, allowed date boundaries and duplicate/replay protection.

No points, XP, diamonds or verified completion may be awarded ahead of the applicable verification policy.

## 9.1 MediaPipe and camera-based task verification

Act as a computer vision engineer. Audit the existing camera integration and implement usable computer vision where the task definition genuinely requires it.

Use MediaPipe or another properly maintained, supported vision runtime after evaluating:

- Compatibility with the installed Expo SDK and React Native version.
- Android native integration requirements and build configuration.
- Existing camera modules and package constraints.
- Model licensing and model-asset size.
- Performance, frame rate, latency, device memory and thermal behavior.
- Pose-landmark availability and movement criteria.
- Body visibility, occlusion, low-light handling and confidence thresholds.
- Privacy boundaries and storage behavior.

Use actual landmark data and objective-specific rules to evaluate supported movements. Avoid a false claim that a camera pose proves an entire real-world workout happened.

The camera must run only for an explicitly initiated, applicable feature or task. Explain permissions and processing before activation. Prefer local frame processing, do not retain or upload raw frames by default, and provide an appropriate alternative where camera verification is unavailable.

Handle denied permissions, unsupported devices, no detected person, poor lighting, interrupted sessions and low confidence gracefully. Never grant verified credit simply because a camera was opened.

## 9.2 BlinkQuest integration audit

Search the repository and supplied sources for existing BlinkQuest integrations, model assets, MediaPipe modules, camera flows, exercise recognition, design components and relevant animations.

If a proven implementation exists, evaluate and reuse it where the code, license, platform, privacy model and architecture are compatible.

If Thrivefold's implementation can be made the same quality or better, improve its accuracy, UI, performance, objective matching, accessibility, native integration and tests.

Do not assume that a project name or dependency proves the feature is integrated. Verify the actual native module registration, model packaging, permission configuration, JavaScript interfaces, build artifacts and runtime behavior.

Do not create an unnecessary duplicate module or blindly import BlinkQuest data. Preserve clear product boundaries and sensitive-data isolation.

If no usable BlinkQuest implementation is found, implement the correct compatible approach and report the missing integration accurately.

Use a native development build where custom native code is necessary. Do not assume Expo Go contains custom native modules.

Official reference to verify during implementation:  
https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/android

# 10. LEVELS, SKILLS, DIAMONDS AND FEATURE ENTITLEMENTS

## 10.1 Automatic, legitimate level progression

Use the real catalog progression, chapters, skills, achievements, prerequisites and unlock definitions through Level 1,000.

A level must come from actual authorized progression records and required milestones. Do not create fake completion timelines, placeholder level nodes, arbitrary XP or accelerated progression disconnected from the catalog.

Use valid historical records to reconcile existing accounts. For new users, initialize an appropriate starting level and tailor difficulty without fabricating completed achievements.

When relevant user data changes, recalculate affected recommendations or progression through deterministic, auditable and idempotent logic. Distinguish adaptive difficulty from permanent earned levels.

## 10.2 Diamonds

Diamonds are a real earned currency, separate from XP and daily points.

When a user legitimately clears a level or qualifies for a configured reward milestone, award the associated catalog-defined diamond amount exactly once.

Use a durable ledger that records the source event, policy/catalog version, amount, transaction ID, timestamp and authority state.

The client must never set its own diamond balance.

## 10.3 Feature unlocks: strict visibility and eligibility

Implement a single authoritative feature registry and policy engine.

**Do not show a feature to a user who is not eligible for it or is blocked from it.**

Distinguish these situations:

1. **Eligible and available:** show the real feature and its normal navigation.
2. **Eligible but requires a valid level/diamond unlock:** it may be shown as an unlock opportunity with the actual requirement, cost and benefit.
3. **Ineligible, blocked, declined, or policy-disallowed:** hide it from ordinary navigation, home recommendations, discovery listings and unauthorized APIs. Do not tease it as an available unlock.
4. **Restricted release awaiting legal, professional or platform approval:** do not expose it to production users until cleared.

A diamond purchase may grant an entitlement only when all independent eligibility and safety checks pass. Diamonds do not override blocks, age assurance, consent, recipient preferences, provider qualification, account status or law.

Do not confuse a feature that costs diamonds with a feature for which the user is ineligible.

## 10.4 Real unlockable capabilities

Create the unlock catalog for actual supported capabilities, including where implemented and eligible:

- Private peer-support groups and wellbeing circles.
- Qualified, professionally facilitated group discovery.
- Gym buddies and activity partners.
- Workplace and office wellbeing communities.
- Office workout partners.
- Additional quest campaigns, challenges, games and skill content.
- Profile customization and emblems.
- Additional coaching experiences or other useful features supported by the product.

Each item needs an actual destination and persisted entitlement behavior. Spending diamonds must not create a fake unlock that leads to a placeholder.

A successful spend and entitlement creation must be atomic or equivalently transaction-safe. A failed unlock must not deduct currency. A duplicate request must not spend twice.

Core health, safety, privacy, recovery and essential account features must not be locked behind diamonds or levels.

Do not introduce real-money diamond purchases unless compliant payment functionality is truly configured and explicitly in scope. Earned progression is the default economy.

# 11. PROGRESSION, ROADMAP AND PROFILE

Connect the real progression engine to the UI.

The Progress experience should show current level, actual progress, next requirements, skills, milestones, achievements, campaigns, special quests, activity history, reward history and future unlocks.

A roadmap node must link to its real task, lesson or screen. Do not implement a decorative four-phase timeline in place of the catalog's actual level definitions.

The user profile must include the real pseudonym/display name, selected emblem, current level, relevant preferences, actual progress and supported account/entitlement state.

Lifetime metrics must be derived from actual records, including legitimate completed quests, check-in days and earned XP.

Allow profile and emblem editing without deleting records.

# 12. MEN'S HEALTH, GYM AND COMPLETE WORKOUT EXPERIENCE

Build a substantial Men's Health experience rather than simply changing the colors of the women's interface.

Include appropriate functionality for:

- Gym routines and equipment-based workouts.
- Home workouts and no-equipment alternatives.
- Strength training basics and progressive plans.
- Warm-up, cool-down, stretching and mobility.
- Recovery and rest-day recommendations.
- Walking, cardio and sustainable activity.
- Workout schedules and weekly routines.
- Exercise details, sets, repetitions, duration, rest periods and available equipment.
- Workout history and genuine progress charts.
- Safe alternatives for pain, mobility limits and different experience levels.
- Desk-worker routines and workplace fitness.
- Optional posture/movement coaching using MediaPipe when genuinely supported.
- Relevant sleep, energy, hydration, stress and recovery routines.
- Men's reproductive, urinary and sexual-health education, private concern logging and non-diagnostic care signposting.
- Confidence, grooming, communication, boundaries and emotional-regulation support without manipulative dating advice.

Use appropriate safety constraints. Do not promise workouts cure medical conditions or apply the same exercise requirements to every person.

## 12.1 Tutorial videos and references

Add useful exercise tutorial references, including suitable YouTube tutorials, where they materially help users perform the task correctly.

Research current, relevant and reputable sources. Prefer official health/fitness organizations, qualified educators and original creators. Verify that linked videos are relevant and accessible before publishing them in the catalog.

Use YouTube embedding or external opening according to the platform's current rules. Include clear source titles, creators and links. Do not download, rehost or copy video content without permission. Handle unavailable videos gracefully and provide concise text instructions as a fallback.

Do not turn every screen into a video feed. Tutorials must serve the actual workout or quest the user selected.

# 13. UNIVERSAL CALENDAR AND HEALTH DATA

Implement one calendar and date-handling system for all relevant events and health data.

Support applicable Day, Week, Month, Year, Agenda, Cycle History and date-range views. Preserve coherent selection across views.

Support birthdays, family birthdays, anniversaries, appointments, work/study commitments, deadlines, travel, financial reminders, holidays, routines, tasks and health reminders.

Implement event creation, editing, rescheduling, cancellation, deletion, search, filters, recurrence, occurrence exceptions and overrides.

Handle leap years, time zones, month boundaries, historical navigation and future dates. Generate only relevant visible ranges; avoid unbounded recurring-event lists and rendering entire years unnecessarily.

Selecting a date must reveal actual saved events, tasks, cycle records, symptoms and relevant reminders. Selecting an item must open its real details and editing workflow.

## 13.1 Women's cycle tracking

Preserve existing working women's-health features, data and brand.

Implement period logging with start/end dates, ongoing bleeding, backdating, correction, spotting, optional flow, symptoms, pain, mood, energy and notes.

Render correct date ranges for:

- Observed menstrual bleeding.
- Follicular phase, which begins on cycle day 1 and overlaps early menstruation.
- Observed ovulation only when the available evidence supports that classification.
- Estimated ovulation windows with uncertainty.
- Optional estimated fertile windows, never described as reliable contraception.
- Luteal phase with appropriate uncertainty when ovulation is unknown.
- PMS symptom records and optional predicted symptom windows, separate from mutually exclusive cycle phases.

Do not assume a universal 28-day cycle, day-14 ovulation or exact periods from insufficient history.

Support applicable irregular/unknown cycles, user-recorded PCOS/PCOD, contraception, pregnancy, postpartum recovery, breastfeeding, perimenopause, menopause and paused tracking.

Pregnancy is a distinct context. Do not continue ordinary period and fertile-window forecasts as though nothing changed. Preserve prior data when tracking context changes.

Every estimate must be distinguishable from an observed fact and include appropriate provenance and uncertainty.

## 13.2 Shared health modules

Preserve or complete applicable screens for:

- Health hub.
- Symptoms and history.
- Sleep.
- Mood and daily check-in.
- Nutrition and dietary preferences.
- Exercise and activity.
- Medication reminders and self-tracking.
- Journaling and private reflection.
- Reproductive tracking.
- Relevant insights and trends.
- Optional Health Connect/wearable integrations.

All operations shown to a user must actually work and persist where expected. Do not fabricate values, measurements, symptoms or historical events.

Request health-platform permissions individually, only when needed, and in line with current platform rules.

Reference for Android integration review:  
https://developer.android.com/health-and-fitness/health-connect/data-types

# 14. AI ARCHITECTURE — LOCAL-FIRST AND MULTI-PROVIDER

AI is a core product capability, not a single chatbot and not an optional afterthought.

However, AI does not replace deterministic business rules or trusted backend operations.

## 14.1 Local intelligence

Implement a modular local-first AI system where device capabilities support it.

Relevant responsibilities include:

- Understanding check-in intent.
- Categorizing and explaining existing tasks.
- Personalizing presentation and task recommendations.
- Summarizing user-approved history.
- Local memory and retrieval.
- Private reflective prompts.
- Suitable contextual coaching.
- Helping classify workout and routine preferences.
- Supporting offline task selection when the model is unavailable through deterministic rules.

Evaluate model/runtime options against actual Android target devices, memory, battery, latency, model size, license, language support and Expo native-module compatibility.

Download model weights only from a controlled, versioned and integrity-checked source. Use clear user controls for downloading, model status and deletion.

If a local model is unsupported or unavailable, fall back to deterministic behavior. Do not automatically send sensitive data to a cloud provider.

## 14.2 Cloud AI and BYOK

Implement real provider adapters and a server-side router for supported cloud-AI providers, including Gemini and additional providers only when explicitly configured.

Use current supported model identifiers from configuration. Do not hardcode retired, preview-only or unverified model names.

Build the actual provider configuration flow, secure storage, connectivity checks, rotation/deletion and safe error handling for BYOK where supported.

Never ship API keys in `EXPO_PUBLIC_` variables, mobile bundles, source maps, client-side logs or public repositories.

Cloud calls must use trusted server functions or a secured backend gateway. Enforce authentication, per-task allowlists, context minimization, consent, payload limits, output validation, usage accounting, quotas, timeouts and cost guards.

Do not send raw intimate journals, private health records, private photos or personal embeddings to a cloud model without the exact required disclosure and explicit consent. Evaluate current provider data-handling terms before enabling a model for sensitive tasks.

If provider terms or configuration are unsuitable, disable that cloud path and use local or deterministic fallbacks.

## 14.3 AI memory and retrieval

Maintain a user-controlled memory vault. Personal memory must be separately managed from model weights and transient inference state.

Users must be able to inspect, correct, disable, export and delete their memory.

Do not turn every journal entry into permanent memory automatically. Apply relevance, expiration and retention rules. Sensitive memories remain local by default.

Use local embeddings/retrieval where supported. Keep a clean abstraction so a remote vector database is not required for private personal memory.

Shared server-side knowledge should contain only approved material with the proper rights and privacy classification.

## 14.4 AI safety and authority limits

AI may recommend an existing task, explain a workout, produce a reflection prompt, or summarize authorized records.

AI must not make final decisions about:

- Age and verified identity.
- Gender or religion inference.
- Caste, nationality or political ideology.
- Dating eligibility.
- Consent, blocks or account roles.
- Medical diagnosis or prescription.
- Authoritative task verification or evidence acceptance.
- XP, points, diamonds, level, payment, billing or unlock transactions.
- Community membership or organization privileges.
- Final high-impact moderation or bans without the proper evidence and review workflow.

Validate structured AI outputs against schemas and current policy. Treat user-generated text and retrieved content as untrusted input.

AI-generated text must not silently alter user data or grant a reward. Explain material personalization decisions and allow the user to correct preferences.

## 14.5 AI safety and crisis behavior

Do not position a local or cloud LLM as a guaranteed emergency response system.

Use a tested, layered safety process for high-risk situations. Provide appropriate, current support information and honest limitations. Use only operational escalation paths that genuinely exist and have been disclosed.

Never promise that a staff member is watching or will respond unless there is an actual supported operation.

Do not upload the entire journal as part of safety handling. Minimize any data required for an explicitly disclosed report or support process.

Test multilingual input, ambiguous language, false positives, false negatives and offline scenarios.

# 15. GENDER, RELIGION, COUNTRY, NATIONALITY AND LOCATION DATA

This section is important because incorrect identity inference can create serious privacy and safety risks.

## 15.1 Do not infer sensitive attributes from the phone or location

**Do not use an online library, AI model, phone number, name, photograph, exact GPS coordinates, food habits, SIM country, IP address or behavior to infer or silently assign a user's gender, religion, caste, ethnicity, sexual orientation, political ideology or community identity.**

There is no reliable, appropriate shortcut that turns a phone number or precise location into a person's religion or gender.

Instead:

- Gender description and pronouns may be voluntary, explicit, private profile settings where relevant.
- Religion, faith and observance preferences may be optional, self-declared and purpose-limited.
- Nationality must not be confused with residence, IP-derived country or phone dialing code.
- Country and language can use explicit user selection and suitable device-locale defaults, with confirmation where needed.
- Phone-number libraries may parse and validate phone formats, but must not be used to infer nationality, religion or gender.
- Country/region geolocation may be used only for its valid technical purpose.
- Nearby communities may use a selected city or permission-based coarse location.
- Precise GPS may be requested only where a clearly explained feature genuinely requires it; do not retain or expose it unnecessarily.

Do not build a covert identity-classification pipeline.

## 15.2 Research appropriate libraries and integrations

When the product requires these capabilities, research maintained libraries or official APIs for:

- Phone-number parsing and validation.
- Country, region, locale, currency and time-zone handling.
- Permission-based location and geocoding.
- Coarse regional discovery.
- Health Connect and supported health-data APIs.
- Age assurance or identity verification providers, where required.
- Localization and accessible input components.

Evaluate maintenance, license, Expo/RN compatibility, data handling, permissions, regions, cost and production constraints. Use a provider only when it solves a real requirement.

Do not add an inference package for sensitive personal attributes.

## 15.3 Data provenance and consent

For every sensitive preference or location field, document its source, purpose, visibility, retention, update and deletion behavior.

Never infer religion from diet, prayer times, language or location. Never infer sexuality from behavior or contact lists. Never use country of residence as proof of nationality.

Where a legal or operational workflow requires verified information, use an appropriate lawful provider and store the minimum useful verification result rather than retaining unnecessary raw identity documents.

Keep optional sensitive profile fields private by default and exclude them from logs, analytics, unapproved AI prompts and notifications.

# 16. FEATURE VISIBILITY AND SERVER-SIDE ELIGIBILITY

Implement one versioned policy/entitlement engine instead of ad hoc checks across screens.

Feature visibility categories:

1. **Ordinarily available:** show and allow access.
2. **Eligible but not yet unlocked:** show the unlock opportunity only if the user meets the feature's independent eligibility and safety rules.
3. **Ineligible, blocked or prohibited:** do not show the feature in normal navigation, recommendation cards, public directories or discovery, and deny all protected routes and APIs.
4. **Restricted release:** keep disabled in production until applicable legal, platform, provider, safety and operational reviews pass.

A blocked user must not regain access by opening a deep link, changing UI state or invoking an API directly.

Use server-authoritative eligibility results with explicit reason codes suitable for safe UI explanations. Do not expose sensitive information about another user or reveal the existence of a protected person's profile.

The normal journey remains health-first. Optional social pathways may become discoverable after the configured qualifying participation and onboarding requirements, but they must be disclosed honestly once offered and wherever required for distribution review.

No automatic enrollment, covert dating screens or disguised functionality.

# 17. PRIVATE COMMUNITIES, THERAPY, GYM BUDDIES AND ORGANIZATIONS

Build real, permissioned group functionality where included in scope.

Support appropriate categories:

- Peer support and wellbeing.
- Qualified, professionally facilitated therapy/support programs.
- Women's, men's and LGBTQ+ groups.
- Topic-based communities.
- Optional culture/faith communities.
- Gym buddies and activity groups.
- Office and workplace wellbeing groups.
- Office workout partners.
- Organization-led events and challenges.

Do not represent peer support as professional therapy. A group can be called clinician-led or professionally facilitated only when provider credentials, role and actual service are appropriately verified.

Implement actual discovery, invitations, join/leave, memberships, member lists, event participation, group rules, moderation, reporting and organizer permissions.

Use privacy-preserving region discovery. No precise home coordinates, public member distances or tracking history.

Do not let a regular user acquire NGO, therapist, organization or administrative privileges simply by leveling up. Organization onboarding needs actual application and verification, role checks and audit history.

Keep memberships private. Groups must not leak personal health records, dating status, religion or other sensitive preferences.

# 18. DATING AND CONTROLLED CORRESPONDENCE

Follow the master product specification's applicable age-cohort, privacy, progressive-discovery and matching policies as versioned configuration.

All adult social and dating experiences must be optional and restricted to eligible adults with appropriate age assurance, consent, recipient controls, blocking, reporting, moderation and safe notification behavior.

## 18.1 Women-initiated first contact

For the applicable dating pathway, enforce the requested rule:

**Only an eligible woman may initiate a new first-contact dating conversation.**

Enforce it in trusted backend operations, not just by hiding a button. Men must not be able to bypass this rule with a direct API call.

Define separate rules for replying in an existing conversation and for non-dating systems such as support groups, workplace coordination or health assistance.

Never infer gender through AI or indirect technical signals.

Any religion- or identity-based matching restriction in the founder policy must remain explicit, versioned and subject to local legal/platform review. If not approved, do not covertly activate the restriction or hide the nature of the feature. Preserve health and core community support independently.

## 18.2 Chip-only structured messages

Preserve the product's rule that the relevant social correspondence interface has no arbitrary free-text composer.

Use curated chips/cards and approved templates for:

- Introduction.
- Interests and hobbies.
- Language/culture exchange.
- Everyday check-in.
- Supportive listening.
- Wellbeing and encouragement.
- Communication preferences.
- Relationship reflection.
- Appreciation and thanks.
- Appropriate non-explicit playful messages where permitted.
- Boundaries, declines, closure and help.

Allow selecting multiple chips, previewing the composed message, confirming before sending and discarding the draft.

Apply moderation to the combined message, not only each chip individually. No custom API or hidden text-field bypass.

Private health journaling remains a separate feature and may capture the details genuinely needed for personal records.

## 18.3 Slowly-inspired capabilities

Within the structured-message constraint, support the applicable profile and interest management, matching, introduction requests, approved Open Letter prompts, inbox/outbox, connection controls, delivery scheduling, stamps, collections, notification settings and safety workflows.

Enforce configured introduction quotas, including the master-specification rule where applicable for a restricted pathway. Do not let quotas prevent essential safety messages or legitimate health-support functionality.

Do not add calls, physical-meeting coordination, external contact fields or precise location sharing to restricted correspondence. Any future meetup mode must remain separate and disabled until proper review.

# 19. NOTIFICATIONS, SCHEDULING AND REAL-WORLD INTEGRATIONS

Implement consistent notification behavior driven by actual events.

Support relevant reminders for tasks, appointments, medication tracking, calendars and user-selected routines, subject to permissions and quiet hours.

Use neutral lock-screen previews by default. Never reveal cycle data, intimacy details, private communities or sensitive messages unless the user explicitly opts into that level of detail.

Prevent duplicate alerts caused by rerenders, retries or duplicate scheduled jobs.

Scheduled work must have stable identities, idempotency, expiry and failure handling. Apply platform-specific background execution limits instead of promising unrestricted background operation.

Integrate only real configured services. Do not create fake Google, YouTube, health-provider or email integrations.

# 20. PRIVACY, SECURITY AND DATA LIFECYCLE

Build and verify a threat model for health records, private AI memory, photos, accounts, location, dating, communities, organization controls, assessment answers, rewards and entitlements.

Use:

- Minimum necessary data collection.
- Strong authenticated access and row-level database policies.
- Server-only secrets.
- Secure device storage for supported credentials.
- Encryption and suitable key management where supported.
- Protected local storage for sensitive records.
- Private storage buckets and signed URLs for explicitly approved cloud files.
- Strict separation of public profile data, health records, local memory and social records.
- Idempotency for writes and rewards.
- Consent/version records for sensitive flows.
- Auditing of privileged actions without logging raw sensitive content.
- Explicit export, revocation and deletion flows.
- Appropriate retention, backup and account-deletion policies.

Do not put privileged assessment keys in the client app. Do not log raw API keys, full private journals, sensitive profile data or unnecessary evidence.

Account deletion must revoke access and handle local files, synced records, backups and other service dependencies according to a documented lawful retention policy. Do not claim instantaneous erasure from every backup unless that is actually supported.

# 21. APP ROUTES AND SCREEN INVENTORY

Audit the real Expo Router structure before refactoring. Preserve working routes and adjust the proposed screen set to the actual project rather than creating duplicate screens.

Ensure the application has real, connected screens for all applicable areas:

**Public and account**

- Introduction.
- Sign in, sign up, recovery and account verification.
- Guest access.
- Onboarding and experience selection.
- Goals, preferences, accessibility, permissions and completion.

**Main experience**

- Home dashboard.
- Universal calendar and selected-date details.
- Quests and daily challenge board.
- Task details, execution, evidence submission and verification result.
- Special quests and replacement selection.
- Games, results and history.

**Health**

- Health hub.
- Cycle tracker, period log, cycle history and insights.
- Symptoms, sleep, mood, nutrition, medication tracking and exercise.
- Applicable pregnancy/reproductive context.
- Journaling and personal history.

**Progression**

- Level roadmap.
- Level and milestone details.
- Skills and mastery.
- Achievements.
- XP, daily-point and diamond history.
- Feature unlocks and entitlement state.

**AI**

- AI home/provider status.
- BYOK/provider settings.
- Local memory inspector.
- AI privacy controls.
- Model status/download/delete.
- Approved history retrieval or coaching screens.

**Social and community**

- Eligible community discovery.
- Group details and membership.
- Therapy/wellbeing directory where valid providers exist.
- Gym buddies, workplace groups and events.
- Organization and facilitator workflows.
- Letters discovery, approved structured composition, inbox/outbox and connection details.
- Safety, reporting, blocked users and appeals.

**Profile and settings**

- Profile and emblem editing.
- Preferences and appearance.
- Notification settings.
- Privacy/permissions.
- Export and delete account.
- Support and safety.

Do not display every route to every user. Use the authoritative eligibility policy to select applicable entry points and secure all destinations at the backend.

All visible navigation controls must lead to real outcomes. No dead links, fake settings, placeholder unlocks or mock-only screens.

# 22. PERFORMANCE AND STABILITY

Profile and correct real causes of unnecessary rendering and lag.

Audit state subscriptions, duplicate data sources, unstable callbacks, expensive render-time calculations, full-calendar re-renders, list virtualization, query keys, cache invalidation, session restoration, timers, effects, native camera processing and animation execution.

Use stable domain selectors, appropriate memoization, bounded visible-range loading, virtualized lists and properly cleaned-up effects where they improve measured performance.

Ensure correctness is retained after optimizations.

Test scrolling, large date ranges, big histories, modal/keyboard transitions, app background/foreground, network loss/reconnect and restart.

# 23. DOCUMENTATION, BUILD AND RELEASE

Use the actual package manager and installed scripts. Do not blindly upgrade the framework, disable validation or weaken security to make the build pass.

Maintain only useful project documentation, including:

- Requirements traceability and decisions.
- Current backend setup, migrations and RLS.
- AI/privacy/provider configuration.
- Game catalog and reward/verification contracts.
- MediaPipe/native module setup where applicable.
- Required environment variables and safe secrets setup.
- Reproducible development and Android build instructions.
- Test results and release checklist.
- Actual costs, quota assumptions and known operating limits.

Keep all secrets in appropriate non-public environment configuration or managed secrets. Never expose them in client bundles.

Build and verify the real app in the available environment. Where supported, run the actual type checker, linter, unit/integration tests, catalog validators, Expo diagnostics and Android builds. Fix the failures that your work introduces and rerun the affected checks.

Test against the actual mobile app, backend boundary, persistence and navigation. Screenshots alone do not prove a flow works.

# 24. MANDATORY ACCEPTANCE TESTS

At minimum, validate these complete journeys using isolated test accounts and realistic fixtures.

## 24.1 Account and onboarding

- First launch shows the introduction.
- Sign in, sign up, recovery and session restoration use the real backend.
- Guest activity persists and merges safely.
- Existing users do not lose data or restart onboarding unnecessarily.
- Profile settings and preferences affect recommendations.

## 24.2 Three quests and special replacement

- A test user receives three valid standard quests where the catalog supports it.
- All three appear and retain stable IDs after restart.
- Skipping one awards nothing.
- A valid same-category special replacement is presented with a suitable reward band.
- Accepting it awards nothing.
- Correct evidence is evaluated by the correct verification policy.
- Valid authorized completion contributes to the actual daily target.
- Invalid evidence, stale tasks and duplicate submissions do not earn unsupported rewards.
- Previous earned points are preserved.
- Restart and sync retries produce no duplicates.
- Lack of a valid replacement is handled honestly.

## 24.3 Level and diamond economy

- Catalog levels, prerequisites and unlock references validate.
- Actual qualifying progress drives the level.
- Level-clear diamond rewards issue exactly once.
- Ledger totals match the displayed balance.
- Insufficient diamonds do not unlock a feature.
- An eligible purchase spends currency once and creates a real entitlement.
- Failed unlocks do not deduct diamonds.
- Ineligible or blocked features are hidden and denied by the backend.
- Essential health and safety functions are never game-locked.

## 24.4 AI and computer vision

- Core workflows remain useful without cloud AI.
- No private data is sent to cloud AI without the required explicit consent.
- API keys never appear in client bundles or logs.
- AI output cannot bypass policy or grant rewards.
- Camera tasks request permission at the right moment.
- Supported MediaPipe tasks evaluate the correct landmarks and objective criteria.
- Unsupported devices, poor visibility and low confidence do not grant false verification.
- The actual BlinkQuest integration, if present, is verified against real code and runtime behavior.

## 24.5 Health, calendar and cycle

- Actual records can be created, edited, corrected and deleted.
- Calendar views remain consistent across date ranges.
- Recurrences, time zones, leap years and month boundaries behave correctly.
- Cycle phase overlaps and recorded/predicted distinctions remain correct.
- Irregular cycles, PCOS/PCOD, contraception, pregnancy, postpartum, breastfeeding and menopause contexts do not fabricate biological facts.
- Offline persistence and synchronization preserve history.

## 24.6 Communities, dating and safety

- Ineligible and blocked users cannot see or open restricted features.
- Server-side checks resist direct API and deep-link bypass.
- Women-initiated dating first contact is enforced in the applicable mode.
- Existing replies and non-dating functions follow their own valid rules.
- Structured social composition has no free-text bypass.
- Groups, roles, therapist/provider claims, invitations and organization controls use verified permissions.
- Blocks, reports, declines and privacy settings take effect.
- Another user cannot access private health, AI memory or community data.

## 24.7 UI, reliability and release

- Every main control leads to a working destination or action.
- No screen overflows or becomes unusable with text scaling/keyboard.
- Task modals use the correct objective.
- Displayed XP, diamonds, levels and counts match persisted records.
- Loading, offline, error, pending, rejected and empty states are handled.
- Performance is measured and major regressions are corrected.
- Actual tests and build commands report their real results.

# 25. FINAL IMPLEMENTATION AND DELIVERY CONTRACT

Do not ask for confirmation for normal engineering choices. Do not stop because the project is larger than one feature. Work efficiently through connected dependencies and complete every task permitted by the repository and available environment.

Do not remove unfinished capabilities. Repair and integrate them, or document exactly what prevents a truthful production implementation.

The final report must state:

1. What was actually implemented.
2. Which screens and backend flows are connected.
3. What happened to the existing women's-health web app and its records.
4. Which database migrations, policies, functions and storage rules changed.
5. Which AI, BYOK, local memory and computer-vision integrations genuinely work.
6. Which BlinkQuest integrations were located, reused or improved.
7. Which actual tests, diagnostics and builds were run, with true results.
8. What remains blocked by missing credentials, external services, legal/professional/platform review or environment constraints.

Do not report a feature as complete merely because its screen exists.

## FINAL ACCEPTANCE CRITERION

Thrivefold must behave as one integrated application.

A real user can enter, sign in or explore as a guest, complete applicable onboarding, receive suitable daily quests, skip an unsuitable task and receive a valid same-category special replacement, execute the actual task, submit the correct evidence, earn authorized daily points and XP, level up legitimately, receive diamonds once and unlock a genuinely implemented feature when eligible.

Health and calendar records must persist correctly. Women's cycle behavior must preserve facts and handle uncertainty. Men's fitness must include genuine workouts and useful tutorials. The computer vision integration must be real where enabled. AI must provide useful personalization with privacy-respecting local and optional cloud pathways. Communities, therapy groups, organizations, gym buddies, workplace groups and adult correspondence must be genuinely implemented where released and available only under their real eligibility rules.

On restart, the user sees the same accurate persisted state. All screens connect to the actual domain logic, the backend enforces policy, private data remains protected, and the application is responsive and polished.

**Read the authoritative master specification. Use every relevant installed skill. Inspect the real project. Finish the entire feasible application and backend. Connect every important flow. Test it. Report only what you actually verified. Do not substitute diagrams, plans, mockups or fake data for working software.**
