# ANVAYKOSH — MASTER ENGINEERING, AI, COST OPTIMISATION & PRODUCT DELIVERY DIRECTIVE

## One Identity. One Intelligence Layer. Five Applications. Local-First. Cost-Controlled. Production-Ready.

**Execution owner:** Gemini — act as the accountable CTO, Principal Architect, Senior React Native Engineer, Kotlin/Android Engineer, AI Engineer, Backend Engineer, Database Architect, Product Designer, QA Engineer, Security Engineer and Release Manager.

**Execution mode:** Inspect → Understand → Back up → Plan → Implement → Integrate → Test → Fix → Commit → Publish → Verify.

**Primary delivery priority: THRIVEFOLD.**

**Ecosystem:** AnvayKosh, ThriveFold, HarmonyBloom, Neev Sanctuary, Setu and BlinkQuest.

---

# 0. THE ACTUAL MISSION

I am not asking you to create another architecture document, another prototype, another AI chat screen or another disconnected implementation.

I want you to finish the existing product and infrastructure.

You must inspect the actual repositories, understand all previous implementations, recover existing work, repair broken functionality, consolidate duplicate systems and implement the complete product.

The final result must provide:

1. A fully functional ThriveFold application, ready for Play Store publication and submission.
2. One unified Anvay intelligence architecture serving all five applications.
3. Local AI as the primary execution strategy.
4. Deterministic calculations and local functionality even when no model is installed.
5. Intelligent selection of the best available local or cloud model.
6. Extremely economical cloud inference with a strict spending ceiling.
7. Existing Gemini, OpenAI, OpenRouter, Qwen, Gemma, ElevenLabs and other configured integrations working through one gateway.
8. One central voice experience, including Someone to Talk.
9. Complete local RAG, scoped memory, retrieval and document processing.
10. Reliable model downloading, installation, persistence, recovery and switching.
11. Correct Android native modules, permissions, localization and configuration.
12. Proper UI/UX, animations, loading, empty, error, offline and recovery states.
13. Secure integration between all five applications.
14. Complete testing, documentation, commits and release verification.

**Do not sacrifice product quality to save a few tokens. Do not waste tokens on tasks that deterministic code can perform.**

The objective is the best possible user experience at the lowest sustainable operating cost.

# 1. NON-NEGOTIABLE RULES

1. Continue from the existing repositories. Do not start a greenfield rewrite.
2. Inspect every existing implementation before replacing or extending it.
3. Preserve working features, historical data, migrations, design tokens and established architecture.
4. Reuse installed dependencies and native modules wherever practical.
5. Do not introduce duplicate databases, AI clients, voice engines, task engines, state-management systems or RAG pipelines.
6. Never assume a feature works merely because its code exists.
7. Never mark a feature complete without testing its real behavior.
8. Never invent API availability, model compatibility, model download URLs, checksums, pricing, benchmarks or successful release submissions.
9. Do not ask me to repeatedly approve ordinary engineering decisions.
10. Ask only when a decision is irreversible, financially consequential, security-sensitive or genuinely requires my credentials or explicit consent.
11. Preserve existing user data. Never reset production databases to make tests pass.
12. Do not silently remove existing product features.
13. Keep standalone AI chat disabled where it has explicitly been disabled. Do not re-enable a separate chat product merely to expose the AI engine. The shared assistant infrastructure, voice experience and Someone to Talk contextual experience must still work.
14. Never hardcode success states, fake download progress, fake model availability or simulated inference.
15. Complete the actual implementation, not just the plan.

When something is blocked, continue independent work and document the exact blocker.

# 2. FIRST: UNDERSTAND THE ENTIRE EXISTING ECOSYSTEM

Before editing:

- Inspect the workspace and all available repositories.
- Read `AGENTS.md`, README files, project specifications, architecture documents, continuation prompts, issue notes and existing implementation plans.
- Inspect all Git branches, recent commits, uncommitted changes and untracked files.
- Identify each application's package ID, Expo SDK, React Native version, Kotlin integration, build configuration and signing setup.
- Inspect dependency versions and lockfiles.
- Identify shared libraries and native modules.
- Inspect the current AI architecture, all provider clients, model integrations, download services, RAG, memory, voice and tools.
- Inspect SQLite, Supabase, Firebase, React Query, Zustand, local analytics and Crashlytics.
- Inspect current navigation, design system, themes, assets and existing animations.
- Inspect existing Play Store release configuration.

Applications:

| Application    | Product ownership                                      |
| -------------- | ------------------------------------------------------ |
| ThriveFold     | Wellness, routines, rewards, progress, sleep and Coach |
| HarmonyBloom   | Cycle tracking and women's wellness                    |
| Neev Sanctuary | Family spaces, relationships, family coordination      |
| Setu           | Existing networking and connection capabilities        |
| BlinkQuest     | Existing visual and wellness capabilities              |

Do not assume that every repository has the same Expo SDK or dependency versions.

## 2.1 Protect the existing work

Before editing:

- Create a recoverable snapshot of the current Git state.
- Preserve all uncommitted changes.
- Record the current branch and last known-good commit.
- Back up affected files before high-risk changes.
- Preserve database migration history.
- Never use destructive Git resets or blanket clean operations.
- Never uninstall the user's working production app.
- Never use `adb uninstall`, `pm clear`, or database resets to make tests easier.
- Never delete model directories, signing keys, credentials or caches without proving that doing so is safe.

Use disposable test packages for destructive lifecycle tests.

Create milestone commits after meaningful, verified work.

## 2.2 Required audit documents

Create or update:

- `docs/ANVAYKOSH_MASTER_AUDIT.md`
- `docs/EXISTING_INFRASTRUCTURE_MAP.md`
- `docs/ANVAY_IMPLEMENTATION_PLAN.md`
- `docs/AI_IMPLEMENTATION_STATUS.md`
- `docs/AI_RECOVERY_REPORT.md`
- `docs/THRIVEFOLD_RELEASE_STATUS.md`

Use these status values consistently:

- `EXISTING_AND_WORKING`
- `EXISTING_BUT_BROKEN`
- `PARTIALLY_IMPLEMENTED`
- `MISSING`
- `BLOCKED`
- `VERIFIED`

Do not confuse implemented with verified.

# 3. THE TARGET ARCHITECTURE: ONE ANVAY CORE

Build one logical intelligence architecture shared by all five applications.

```text
                    ANVAYKOSH ECOSYSTEM
                             |
                    ANVAY CORE
                             |
       +---------------------+----------------------+
       |                     |                      |
   Identity               AI Gateway             Anvay Vault
       |                     |                      |
   Pairwise IDs          Model Router          Scoped Memory
   Device Keys           Cost Governor         Document Index
   Permissions           Provider Adapters     Encryption
       |                     |                      |
       +---------------------+----------------------+
                             |
                    Central Voice Engine
                             |
                    Shared Action Registry
                             |
             +---------------+---------------+
             |               |               |
         ThriveFold      HarmonyBloom       Neev
             |               |               |
            Setu          BlinkQuest       Other clients
```

The logical core must own:

- Identity and authorization.
- Model discovery and lifecycle.
- AI request routing.
- Provider configuration.
- Cost governance.
- Local intelligence.
- Memory and retrieval.
- Voice orchestration.
- Shared action registry.
- Cross-app communication.
- Performance monitoring.
- Secure synchronization.

## 3.1 Important Android architecture decision

Do not assume that a library embedded in five APKs creates one shared model directory.

Android applications have separate private sandboxes.

Evaluate two complementary deployment layers:

**A. Shared Anvay Core provider**

A separately identifiable Android package can host the canonical model inventory, downloads, model files and inference runtime.

Use signature-protected Android services, package and certificate verification, scoped capabilities, version negotiation and streaming IPC.

**B. Embedded Anvay Core fallback**

Every app must retain enough local functionality to work independently if the central provider is absent, unavailable or removed.

The client must:

1. Discover the provider.
2. Verify its signing identity.
3. Negotiate protocol and version compatibility.
4. Request available models.
5. Request inference.
6. Receive streamed responses.
7. Detect process failure.
8. Fall back to its own installed local model or deterministic engine.

Never transmit model weights or full documents through Binder. Use small requests, callbacks and suitable file descriptors or shared storage mechanisms.

Never use deprecated shared-UID tricks.

## 3.2 Cross-app security

Use:

- Android Keystore.
- Hardware-backed keys where available.
- Signature-level permissions.
- Package UID and signing-certificate verification.
- Short-lived scoped capability tokens.
- Explicit, revocable domain permissions.
- Encrypted local sensitive data.
- Secure cloud authentication.

Every action must validate the caller, requested scope, user consent and authorization.

**Shared infrastructure does not mean unrestricted access to all user data.**

# 4. ONE IDENTITY — ANVAY ID

Build on existing identity and authentication infrastructure.

Use a secure key hierarchy:

```text
Device-bound identity key
        |
        +-- Vault key-encryption key
        |       |
        |       +-- Health data key
        |       +-- Cycle data key
        |       +-- Family data key
        |       +-- Peer identity data key
        |       +-- Vision data key
        |       +-- Memory data key
        |
        +-- Pairwise application identities
        |
        +-- Short-lived signed assertions
```

Requirements:

- Non-exportable device keys where possible.
- Envelope encryption for sensitive domains.
- Independent application identities.
- Key rotation and recovery.
- Secure credential storage.
- No raw secrets in JavaScript, logs, analytics or deep links.
- No personal information in deep links.
- OAuth with PKCE for cloud authentication where applicable.
- Local functionality without mandatory sign-in.

Profile merging must be non-destructive.

Only fill missing profile information when provenance and consent allow it. Never overwrite confirmed user data silently.

Record an explicit account-recovery strategy and document its limitations.

# 5. ONE AI GATEWAY — EVERY PROVIDER INTEGRATED

Inspect and consolidate the existing provider implementations.

Do not create a competing AI service.

Integrate every provider already present or configured, including:

**Local models**

- Qwen.
- Gemma.
- Other installed compatible models.
- Existing embedding models.

**Cloud and external providers**

- Gemini.
- OpenAI.
- OpenRouter.
- Claude, where already configured.
- ElevenLabs for supported voice capabilities.
- Existing speech recognition and synthesis providers.

Do not assume every model supports the same capabilities.

Create capability-aware adapters.

Each provider/model must have an actual capability record:

```ts
type ModelCapabilities = {
  textGeneration: boolean;
  reasoning: boolean;
  toolCalling: boolean;
  structuredOutput: boolean;
  vision: boolean;
  audioInput: boolean;
  audioOutput: boolean;
  embeddings: boolean;
  streaming: boolean;
  maxContextTokens?: number;
};
```

Extend this schema with actual provider-specific metadata.

## 5.1 One normalized request contract

All AI calls must pass through the same orchestration interface.

```ts
type AnvayRequest = {
  requestId: string;
  applicationId: string;
  intent: string;
  input: string;
  context?: unknown;
  requiredCapabilities?: string[];
  privacyScope?: string[];
  preferredMode?: 'automatic' | 'local-only' | 'cloud-allowed';
  maxCost?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
};

type AnvayResponse = {
  requestId: string;
  status: 'success' | 'partial' | 'needs-input' | 'unavailable' | 'failed';
  content?: string;
  structuredData?: unknown;
  sources?: unknown[];
  actions?: unknown[];
  executionTier?: string;
  provider?: string;
  model?: string;
  usage?: unknown;
  error?: unknown;
};
```

Use the repository's existing types where suitable instead of introducing unnecessary duplicates.

## 5.2 Provider selection

The gateway must:

1. Understand the user's intent.
2. Identify the required capabilities.
3. Inspect available local models.
4. Inspect configured cloud providers.
5. Check model compatibility.
6. Check privacy restrictions.
7. Check device RAM and runtime availability.
8. Check network connectivity.
9. Check latency requirements.
10. Estimate cloud cost.
11. Apply the user's selected mode and budget.
12. Select the best eligible option.
13. Execute.
14. Validate the output.
15. Escalate only when justified.
16. Return a normalized response.

Never call Gemini for every request.

Never call Qwen for every request.

Never call multiple large models in parallel without a measurable justification.

**Privacy, authorization and budget are hard constraints, not weighted preferences.**

## 5.3 Adaptive selection formula

First construct the eligible set:

\[
E=\{m \mid C_m \supseteq C_{required},\ Privacy_m=1,\ Healthy_m=1,\ Context_m\ adequate,\ Budget_m\ adequate\}
\]

Then rank eligible models:

\[
U_m=w_qQ_m-w_l\frac{L_m}{L_b}-w_c\frac{C_m}{C_b}
\]

Where:

- \(Q_m\): measured task quality.
- \(L_m\): measured latency.
- \(C_m\): estimated request cost.
- \(L_b\): latency budget.
- \(C_b\): cost budget.
- \(w_q,w_l,w_c\): configurable weights.

Normalize the values before comparison.

Use measured task quality, not model marketing claims.

Choose the smallest capable model that passes the required quality threshold, not merely the model with the fewest parameters.

# 6. LOCAL-FIRST EXECUTION — WORK EVEN WITH ZERO MODELS

This is a fundamental product requirement.

The app must remain useful when:

- No local model is installed.
- A model is downloading.
- A model is corrupted.
- Native inference is unavailable.
- Internet is unavailable.
- Cloud credentials are missing.
- API quotas are exhausted.
- Supabase is unavailable.
- The central provider is missing.

Implement deterministic functionality first.

## 6.1 Execution hierarchy

Use this priority:

1. Native deterministic functions.
2. Registered application actions.
3. Indexed SQLite queries.
4. Local full-text retrieval.
5. Existing cached knowledge.
6. Local vector retrieval.
7. Small local model.
8. Larger local model.
9. Cloud inference when authorized and justified.

A model is not required for every useful assistant operation.

## 6.2 Deterministic calculation engine

Build or complete a proper calculation service.

It must support:

**Arithmetic**

- Addition, subtraction, multiplication and division.
- Modulo, powers and roots.
- Parentheses and operator precedence.
- Fractions and negative numbers.
- Decimal arithmetic.
- Scientific notation.

**Mathematics and statistics**

- Percentages.
- Ratios.
- Proportions.
- Averages.
- Weighted averages.
- Median and mode.
- Variance and standard deviation.
- Minimum and maximum.
- Summations.
- Percentage change.
- Basic algebraic operations where implemented.

**Date and time**

- Current date and time.
- Date differences.
- Age.
- Time-zone conversion.
- Duration.
- Date addition and subtraction.
- Week numbers.
- Recurring dates.
- Calendar calculations.
- Localized formatting.

**Units**

- Length.
- Weight.
- Temperature.
- Volume.
- Speed.
- Area.
- Time.
- Data storage.
- Energy.
- Other explicitly supported units.

**Financial calculations**

- Simple interest.
- Compound interest.
- EMI.
- Loan repayment.
- Savings projections.
- Discounts.
- Percentage change.
- Tax calculations using supplied or verified rates.
- Currency conversion using current or timestamped cached exchange rates.

Never invent live exchange rates or tax rates.

## 6.3 Required mathematical formulas

Implement and test the underlying formulas.

Percentage:

\[
Percentage=\frac{Part}{Whole}\times100
\]

Percentage change:

\[
Change\%=\frac{New-Old}{Old}\times100
\]

Compound interest:

\[
A=P\left(1+\frac{r}{n}\right)^{nt}
\]

Simple interest:

\[
SI=\frac{P\times r\times t}{100}
\]

EMI:

\[
EMI=\frac{P r(1+r)^n}{(1+r)^n-1}
\]

Where:

- \(P\) is principal.
- \(r\) is periodic interest rate expressed as a decimal.
- \(n\) is total number of payment periods.

For monthly EMI, convert annual nominal interest to the applicable monthly rate and use the total number of monthly payments. State the assumptions and exclude fees unless provided.

Arithmetic mean:

\[
\bar{x}=\frac{\sum x_i}{N}
\]

Population variance:

\[
\sigma^2=\frac{\sum(x_i-\mu)^2}{N}
\]

Sample variance:

\[
s^2=\frac{\sum(x_i-\bar{x})^2}{N-1}
\]

Unit conversion must use explicit conversion factors and preserve dimensional correctness.

## 6.4 Calculation engineering rules

- Use a proper expression parser.
- Never use JavaScript `eval()`.
- Use decimal-safe arithmetic for money.
- Validate input.
- Handle division by zero.
- Handle overflow and invalid expressions.
- Preserve units.
- Show calculation steps where useful.
- Return typed structured results.
- Localize the output.
- Add unit tests and edge-case tests.

Example:

User: "What is 18% of 2500?"

Execute locally. No Qwen, Gemini or OpenAI call.

User: "What is my EMI for a ₹5 lakh loan at 10% for 3 years?"

Execute the deterministic EMI calculation and explain the assumptions.

## 6.5 Application-specific deterministic engines

Reuse actual application functionality:

- ThriveFold rewards and progression.
- Hydration and routine statistics.
- Sleep and activity summaries.
- HarmonyBloom cycle calculations.
- Neev family events and calendar calculations.
- Setu connection functionality.
- BlinkQuest existing visual and wellness calculations.

Do not let an LLM calculate authoritative reward points, dates, permissions, cycle records or financial values.

# 7. LOCAL MODEL CATALOGUE AND HARDWARE-AWARE SELECTION

Inspect all existing Qwen, Gemma and other model assets.

Do not assume model availability based on documentation alone.

Create a real model catalogue with:

- Stable ID.
- Display name.
- Version.
- Provider.
- Architecture.
- Format.
- Quantization.
- Download URL.
- Actual file size.
- SHA-256.
- Runtime compatibility.
- Minimum RAM.
- Recommended RAM.
- Storage requirement.
- Context length.
- Tokenizer.
- Language support.
- Capabilities.
- License.
- Availability.
- Verification status.

Never fabricate a download URL or checksum.

## 7.1 Model-size mathematics

Estimate model weight storage:

\[
S_{weights}\approx\frac{P\times b}{8}
\]

Where:

- \(P\) = parameter count.
- \(b\) = average bits per weight.

For example, a 1.5-billion-parameter model at an illustrative 4.5 bits per parameter:

\[
S\approx\frac{1.5\times10^9\times4.5}{8}
\approx0.844\ GB
\]

This is an approximation, not the complete installed model size. Tokenizers, metadata, alignment, runtime and other tensors add overhead.

Estimate peak inference memory:

\[
RAM_{peak}\approx RAM_{weights}+RAM_{KV}+RAM_{runtime}+RAM_{workspace}+RAM_{other}
\]

KV cache:

\[
RAM_{KV}=2\times L\times H_{KV}\times D_{head}\times B_{element}\times T
\]

Where:

- \(L\) = transformer layers.
- \(H_{KV}\) = KV heads.
- \(D_{head}\) = head dimension.
- \(B_{element}\) = bytes per cache element.
- \(T\) = context tokens.

Read actual model configuration. Do not guess these values.

Include Android system memory, concurrent app memory and a safety margin.

Never allow the user-facing "force load" action to bypass memory safety.

## 7.2 Device capability detection

Measure:

- Total RAM.
- Available RAM.
- CPU architecture and core layout.
- Supported acceleration.
- Native runtime compatibility.
- Available storage.
- Thermal status.
- Model format support.
- Context requirements.

Benchmark CPU/GPU/NPU execution where supported.

Do not assume an accelerator is faster without measuring it.

Keep only the necessary models loaded. Load larger models on demand and unload them under memory pressure.

# 8. FIX MODEL STORAGE AND THE UNINSTALL/REINSTALL FAILURE

This is a critical existing defect. Investigate it before downloading duplicate models.

The previous model setup worked, but after uninstalling the application, the models became inaccessible.

Determine exactly why.

Inspect:

- Android `filesDir`.
- `cacheDir`.
- `getExternalFilesDir`.
- Expo `documentDirectory`.
- Expo `cacheDirectory`.
- SAF document URIs.
- Native module storage.
- SQLite model registry.
- File permissions.
- Keystore dependencies.
- Model checksums.
- Runtime references.
- Model installation records.

Distinguish:

1. File deleted.
2. File present but inaccessible.
3. Registry missing.
4. Registry references obsolete path.
5. SAF permission revoked.
6. File corrupted.
7. Native runtime incompatible.
8. Encryption key missing.
9. Model downloaded but not installed.
10. Model installed but not loaded.

## 8.1 Fix the exact filesystem error

Investigate:

`ExponentFileSystems.MoveAsync has been rejected`

Inspect:

- Exact stack trace.
- Source and destination URI.
- Installed Expo SDK.
- Installed `expo-file-system` version.
- Import path.
- Native Android implementation.
- Whether the path is `file://` or `content://`.
- Directory existence.
- Destination collision.
- Permissions.
- Cross-storage movement.

Use the supported API for the installed version.

Evaluate `expo-file-system/legacy` when the legacy API is actually required, and modern `File`/`Directory` APIs where compatible.

Handle SAF `content://` through Android `ContentResolver` streams and supported URI operations. Never treat it as an ordinary filesystem path.

## 8.2 Correct persistence architecture

A client's private storage is removed when that client is uninstalled.

A separate model-provider package's private storage can survive the uninstall of a client while the provider remains installed.

Uninstalling the provider can remove its private model files.

An SAF-selected directory may provide a different persistence path, but its URI permissions and recovery behavior must be handled explicitly.

Implement:

**Primary:** separate Anvay Core model provider, where the Android deployment architecture justifies it.

**Fallback:** embedded model runtime and deterministic execution in each client.

**Optional:** user-authorized SAF model directory, with persistent URI permissions, reauthorization and integrity checks.

Never claim that a model will survive uninstalling its owner unless the actual storage location and lifecycle prove it.

## 8.3 Model installation transaction

Use this exact logical lifecycle:

```text
DISCOVER
  ↓
CHECK COMPATIBILITY
  ↓
CHECK STORAGE
  ↓
CHECK NETWORK
  ↓
DETECT EXISTING FILES
  ↓
SELECT MODEL
  ↓
CONSENT / DOWNLOAD POLICY
  ↓
DOWNLOAD TO TEMPORARY LOCATION
  ↓
VERIFY SIZE
  ↓
VERIFY SHA-256
  ↓
VALIDATE FORMAT
  ↓
INSTALL SAFELY
  ↓
REGISTER MODEL
  ↓
LOAD NATIVE RUNTIME
  ↓
RUN TEST INFERENCE
  ↓
READY
```

Never register a partial model.

Never delete a working model before its replacement is verified and successfully tested.

Use atomic rename where supported. Otherwise use safe copy-and-verify.

Support:

- Resumable downloads.
- HTTP range validation.
- Pause.
- Resume.
- Cancel.
- Retry with bounded backoff.
- Duplicate-download prevention.
- Persistent state.
- Network interruption recovery.
- Storage checks.
- Integrity verification.
- Version switching.
- Rollback.
- Corruption detection.
- Recovery after restart.

# 9. MODEL DOWNLOAD MANAGER AND FIRST-RUN EXPERIENCE

The app must intelligently inspect the device and recommend the most suitable model.

Do not immediately force a large download.

First determine:

- Is a model already installed?
- Is a central provider available?
- Is a compatible model present in shared storage?
- Can the device run the model safely?
- Is enough storage available?
- Is Wi-Fi connected?
- Is battery and thermal state appropriate?
- Is a download already in progress?

If a suitable model exists, reuse it.

If not, recommend the smallest capable baseline model.

If the user has authorized automatic setup, start the initial download under the configured download policy.

Default download policy:

- Wi-Fi only.
- No automatic large upgrades.
- No download when storage is insufficient.
- Respect battery and thermal conditions.
- Allow cellular downloads only with explicit consent.
- Do not block onboarding.
- Use Android-compliant background execution.

## 9.1 Dashboard states

Implement distinct states:

1. Checking device.
2. Discovering models.
3. Existing model found.
4. Preparing download.
5. Downloading.
6. Paused.
7. Verifying.
8. Installing.
9. Loading.
10. Running test inference.
11. Ready.
12. Offline.
13. Recovering.
14. Unavailable.
15. Attention required.

Display actual model name, version, size, progress, speed, downloaded bytes, total bytes, verification status and installation status.

Remaining-time estimates must only appear when enough reliable measurements exist.

No fabricated progress.

No infinite loading.

No broken chatbot while model setup is in progress.

Keep the rest of the app usable.

## 9.2 Model dashboard design

Create a polished and compact Anvay AI dashboard showing:

- Local AI status.
- Active model.
- Model availability.
- Model catalogue.
- Download status.
- Storage usage.
- Runtime health.
- Provider health.
- Offline availability.
- Memory status.
- Voice status.
- Cloud usage and budget.

Provide model actions:

- Download.
- Pause.
- Resume.
- Cancel.
- Retry.
- Switch.
- View details.
- Upgrade.
- Roll back.
- Remove with confirmation.

Show the actual reason for failures and a useful recovery action.

Advanced diagnostics belong in a separate developer view.

## 9.3 Model upgrade experience

When a better compatible model is available, explain its actual benefits and cost in storage.

Show the current model and proposed model side by side.

Never imply that a larger model is automatically better.

Never replace the working model without user consent and rollback.

# 10. COST: BEST POSSIBLE QUALITY WITHOUT UNCONTROLLED SPENDING

This is one of the most important requirements.

We cannot operate an unlimited paid AI service.

We can tolerate a small amount of token expenditure where it materially improves quality, but routine usage must remain economical.

Build the entire system around that reality.

## 10.1 Cost policy

Use these defaults:

- Deterministic and local execution first.
- Cloud inference disabled for sensitive domains unless explicitly authorized.
- User BYOK is optional.
- Platform-funded cloud inference has a hard monthly budget.
- No hidden cloud calls.
- No unrestricted multi-model retries.
- No background cloud summarization by default.
- No expensive model for trivial requests.
- No request that exceeds the configured budget.

Suggested initial platform-funded budget:

**₹100 per active user per month as an initial configurable ceiling, not an entitlement or a promise of unlimited service.**

Allow the owner to configure:

- ₹0: strict local-only platform spending.
- A small custom amount.
- A higher amount only after explicit configuration.

Also implement a global platform budget, daily ceiling and emergency kill switch.

The user may use their own provider key and pay their provider directly. This must be clearly distinguished from platform-funded inference.

If the configured budget is exhausted, use local execution and communicate the limitation without breaking the product.

## 10.2 Token cost formula

For a cloud request:

\[
C_{request}=
\frac{N_{in}P_{in}+N_{out}P_{out}}{10^6}
\]

Where:

- \(N_{in}\): input tokens.
- \(N_{out}\): output tokens.
- \(P_{in}\): input price per million tokens.
- \(P_{out}\): output price per million tokens.

For \(R\) monthly requests and cloud escalation fraction \(q\):

\[
C_{monthly}=R\times q\times C_{request}
\]

For example only, assume:

- 1,500 input tokens.
- 300 output tokens.
- Illustrative input price $0.50 per million.
- Illustrative output price $2.00 per million.

Then:

\[
C_{request}=
\frac{1500(0.50)+300(2.00)}{10^6}
=\$0.00135
\]

At 900 requests per month:

- All requests through cloud: approximately $1.215.
- Only 5% escalated: approximately $0.06075.

These are mathematical illustrations, not current provider quotes.

Fetch and verify current official pricing before configuring any provider. Include separate rates for cached input, image tokens, audio, tool calls or other billable modalities where applicable.

Never hardcode outdated prices.

## 10.3 Budget enforcement

Track:

- Provider.
- Model.
- Input tokens.
- Output tokens.
- Cached tokens.
- Request cost.
- Daily usage.
- Monthly usage.
- User budget.
- Global platform budget.
- Escalation reason.
- Provider response status.

Calculate:

\[
RemainingBudget=MonthlyBudget-ActualSpend-ReservedSpend
\]

Reserve estimated request cost before dispatch. Reconcile against actual provider usage afterward.

If usage is missing, estimate conservatively and mark it as estimated.

Implement a token bucket:

\[
TokensAvailable(t)=\min(B,\ TokensAvailable(t_0)+\rho(t-t_0))
\]

Where \(B\) is capacity and \(\rho\) is refill rate.

Enforce:

- Per-user monthly limit.
- Per-user daily limit.
- Per-request cost limit.
- Per-provider limit.
- Global monthly limit.
- Concurrency limit.
- Retry limit.
- Output-token ceiling.

When a budget is reached, do not retry through another paid provider automatically.

Fall back to local execution.

## 10.4 Cost optimization order

Prioritize savings in this order:

1. Deterministic calculations and actions.
2. Local SQLite and FTS5.
3. Cached retrieval and local memory.
4. Small local model.
5. Larger local model when necessary.
6. Cloud escalation only when quality or capability genuinely requires it.
7. Compact prompts.
8. Short output budgets.
9. Provider prompt caching when available and beneficial.
10. Safe response caching.
11. Background batching.
12. Model selection based on actual cost and quality.

Do not use a paid embedding API for every query if a compatible local embedding model is available.

Do not re-embed unchanged documents.

Do not summarize the same conversation repeatedly.

Do not send all app tools to every model request.

Do not send personal data to a cross-user semantic cache.

## 10.5 Quality must remain high

Do not degrade a response merely to save a few tokens.

Instead:

- Retrieve only relevant context.
- Use the best eligible model.
- Limit unnecessary prompt overhead.
- Use structured outputs.
- Validate answers.
- Escalate only when required.
- Stop after a bounded number of attempts.

If a difficult task genuinely requires a better model and budget is available, use it.

The system should optimize value, not blindly minimize token count.

# 11. ROUTING CASCADE AND LATENCY ENGINEERING

Use a tiered cascade.

```text
TIER 0 — RULES / NATIVE FUNCTIONS / REGISTERED ACTIONS
    ↓
TIER 1 — SQLITE / FTS5 / CACHED KNOWLEDGE / EMBEDDING MATCH
    ↓
TIER 2 — SMALL LOCAL MODEL
    ↓
TIER 3 — LARGER LOCAL MODEL
    ↓
TIER 4 — CLOUD MODEL, ONLY IF AUTHORIZED AND WITHIN BUDGET
```

Do not invoke the next tier if the current tier has already produced a sufficient, validated answer.

## 11.1 Latency mathematics

\[
T_{total}=T_{route}+T_{retrieve}+T_{prefill}+T_{decode}+T_{post}
\]

\[
T_{prefill}=\frac{N_{prompt}-N_{cached}}{r_{prefill}}
\]

\[
T_{decode}=\frac{N_{out}}{r_{decode}}
\]

For a cascade, expected time is:

\[
E[T]=\sum_i t_i\prod_{j<i}(1-s_j)
\]

Where \(t_i\) is the tier execution time and \(s_i\) is its measured success probability.

Use this formula to evaluate whether a cheap tier is worth trying before an expensive one.

Measure actual success rates. Do not use illustrative values as production benchmarks.

## 11.2 Routing budgets

Initial engineering targets to validate on real devices:

| Execution                    |                      Target |
| ---------------------------- | --------------------------: |
| Native action or calculation |          Under 30 ms median |
| Indexed lookup               |          Under 50 ms median |
| Lightweight retrieval        |         Under 150 ms median |
| Small local model            | Measure by device and model |
| Larger model                 |  Stream as soon as possible |
| Visible UI acknowledgement   |                Under 100 ms |

These are targets, not guaranteed performance.

Record p50 and p95.

## 11.3 Prompt efficiency

- Keep shared system instructions static.
- Include only the relevant application manifest.
- Include at most the most relevant tools.
- Maintain a compact state snapshot.
- Keep recent conversation context.
- Summarize older history only when needed.
- Cache model prefixes where supported by the runtime.
- Use bounded retrieval.
- Do not send entire databases or all documents into a prompt.

A request should receive the minimum context needed to answer correctly.

# 12. LOCAL RAG AND UNIFIED MEMORY

Finish the existing Expo SQLite, vector and RAG implementations.

Do not create another memory engine.

Support:

- Structured memory.
- Semantic memory.
- Episodic memory.
- Working memory.
- Conversation history.
- Document memory.
- Application-specific memory.
- User-confirmed preferences.
- Source references.
- Historical retrieval.

## 12.1 Ingestion

Support approved sources:

- PDF.
- DOCX.
- TXT.
- Markdown.
- Images.
- OCR.
- Audio transcripts.
- Notes.
- Conversations.
- Application records.
- Product documentation.
- User-authorized records.

Store:

- Source ID.
- Owner application.
- Domain.
- Version.
- Creation time.
- Update time.
- Permission scope.
- Chunk ID.
- Original source reference.
- Processing status.

Never ingest secrets or unauthorized private data.

## 12.2 Retrieval

Use:

1. Structured SQL.
2. Exact lookup.
3. FTS5.
4. Existing vector search.
5. Hybrid retrieval.
6. Reranking when necessary.
7. Extractive response.
8. Model synthesis only when it adds value.

Use reciprocal-rank fusion when combining keyword and vector results:

\[
RRF(d)=\sum_r\frac{1}{k+rank_r(d)}
\]

A conventional starting constant is \(k=60\), but validate retrieval quality.

For context selection:

\[
N_{RAG}=N_{window}-N_{static}-N_{state}-N_{history}-N_{output}
\]

Select only enough chunks to answer the question.

Initial chunking guidance: section-aware chunks of approximately 200–400 tokens with modest overlap, then measure actual retrieval quality.

## 12.3 Vector storage mathematics

\[
Memory=N\times d\times bytesPerValue
\]

For 100,000 vectors with 384 dimensions:

- Float32: approximately 153.6 MB.
- Int8: approximately 38.4 MB.

Use quantization only if the existing vector engine supports it and quality remains acceptable.

Do not add an ANN index until measured retrieval performance justifies it.

## 12.4 Memory privacy

Every memory item must have:

- Scope.
- Owner.
- ACL.
- Source.
- Confidence.
- Status.
- Version.
- Retention policy.

Keep model-inferred facts separate from user-confirmed facts.

Memory extraction runs asynchronously and never blocks a normal response.

Provide correction, deletion, export and consent controls.

Sensitive crisis conversations must not automatically become permanent memories.

# 13. ONE ACTION REGISTRY ACROSS ALL APPS

Create one logical action registry from actual app capabilities.

Each action should contain:

```ts
type AnvayAction = {
  id: string;
  appId: string;
  description: string;
  parametersSchema: unknown;
  permissionScopes: string[];
  risk: 'read' | 'reversible' | 'destructive' | 'external';
  requiresConfirmation: boolean;
  handlerId: string;
  undoHandlerId?: string;
  examplePhrases: string[];
};
```

The model may propose an action.

Deterministic code must validate its parameters and authorization.

The action registry must be the source of truth for:

- Intent examples.
- Tool selection.
- UI explanations.
- Navigation.
- Validation.
- Tests.
- Cross-app discovery.

Use the current screen as useful context, not as permission to bypass authorization.

Never let the model invent database IDs.

Resolve user references against actual data.

Destructive or external actions require confirmation.

Never automatically call, send messages, delete important data or share location.

# 14. ONE CENTRAL VOICE ASSISTANT

There must be one logical voice engine across all five apps.

Reuse existing voice services and consolidate competing implementations.

Inspect:

- `GlobalVoiceAssistant`.
- `globalVoiceController`.
- `coachVoiceService`.
- `therapyVoice`.
- Existing speech recognition.
- Existing TTS.
- Existing streaming.
- Existing interruption handling.

Do not create duplicate speech pipelines.

Support:

- Text input.
- Voice input.
- Speech recognition.
- Streaming responses.
- Sentence-level TTS.
- Interruption.
- Cancellation.
- Echo prevention.
- Language preferences.
- Voice selection.
- Offline fallback.
- Microphone denial recovery.
- Audio focus.
- Background and foreground lifecycle.

Typing must never unexpectedly activate the microphone.

The microphone must not start automatically when Someone to Talk opens.

Use one shared voice controller and one audio playback owner.

ElevenLabs should be used only when configured, available and appropriate. Local or platform speech must remain a fallback.

# 15. SOMEONE TO TALK — ONE SUPPORT MODE OF ANVAY

Complete the existing Someone to Talk experience.

Do not create a second AI conversation engine.

It must use the same:

- Assistant identity.
- Conversation orchestration.
- Voice controller.
- Provider gateway.
- Language preference.
- Relevant conversation context.
- Memory policy.
- Permissions.
- Safety controls.

Start naturally and support typing or voice.

Understand whether the situation is:

- Ordinary conversation.
- Loneliness.
- Anxiety or distress.
- A past event.
- A hypothetical discussion.
- Concern about someone else.
- Immediate physical danger.
- Medical emergency.
- A crisis requiring human assistance.

Do not ask a long questionnaire.

Understand context, negation, quoted statements and timing.

Ask only the most important unanswered question.

Do not rely on an LLM alone for safety detection.

Use deterministic local safety rules, contextual assessment and explicit safety-policy validation.

Critical emergency information and action access must work offline.

## 15.1 Emergency contact system

Support:

- Add contact.
- Edit contact.
- Delete contact.
- Primary contact.
- Relationship.
- Preferred call or SMS action.
- Location-sharing preference.

Use actual device or user-provided contact information.

Never silently call or message.

## 15.2 Country and emergency directory

Distinguish:

- Device locale.
- Device region.
- SIM country.
- User-selected country.
- Current physical location.
- Home country.

Use Expo Localization for locale, language, region and time zone.

Use location APIs only when coordinates are actually needed.

Emergency-number selection should use verified jurisdiction data.

Maintain an auditable emergency directory with source, jurisdiction, verification date and version.

If the country cannot be reliably established, ask the user to select it rather than inventing a number.

For immediate danger, prioritize the correct emergency service.

## 15.3 Nearby help

When location permission is granted, locate relevant services:

- Emergency departments.
- Hospitals.
- Urgent care.
- Ambulance services.
- Crisis support.
- Mental health support.
- Police or emergency assistance.
- Other relevant services.

Show verified phone numbers, address, reliable distance and availability only when the source supports them.

Actions:

- Open native dialer with the verified number.
- Open directions.
- Open official website.
- Share location with a trusted contact after explicit consent.

Do not claim a call was placed if the dialer only opened.

Do not claim an ambulance was dispatched without an authorized integration confirming it.

Do not fabricate nearby services.

## 15.4 Emergency safety

Never:

- Automatically call.
- Automatically contact authorities.
- Silently share location.
- Delay emergency guidance.
- Make unsupported medical diagnoses.
- Guarantee safety.
- Falsely reassure someone.

Do not recommend a breathing exercise when emergency medical symptoms require immediate professional assistance.

Someone to Talk must remain calm, simple, accessible and action-oriented.

# 16. FIVE-APP DATA OWNERSHIP AND PRIVACY

Define explicit domain ownership.

| Domain                        | Owner        | Default cross-app access |
| ----------------------------- | ------------ | ------------------------ |
| Health metrics and routines   | ThriveFold   | Denied                   |
| Cycle and reproductive data   | HarmonyBloom | Denied                   |
| Family and child safety       | Neev         | Denied                   |
| Peer identity and connections | Setu         | Minimal                  |
| Vision and blink data         | BlinkQuest   | Aggregates only          |

Cross-app access requires an explicit, revocable permission grant.

Cloud access requires separate consent.

The AI router must filter unauthorized data before retrieval, context assembly or model selection.

Do not assume that one shared vector database permits every app to read every vector.

Use per-domain encryption keys and ACL filters.

# 17. BACKEND, SQLITE AND SUPABASE

Reuse the existing infrastructure.

Define one source of truth for every data type.

Suggested responsibility boundaries:

| System             | Responsibility                                             |
| ------------------ | ---------------------------------------------------------- |
| SQLite             | Local durable records, offline data, local history, queues |
| Supabase/Postgres  | Authorized synchronized account data                       |
| React Query        | Remote server state and request lifecycle                  |
| Zustand            | Transient UI and interaction state                         |
| Firebase Analytics | Consent-approved product telemetry                         |
| Crashlytics        | Crash reporting and diagnostics                            |
| Local AI           | Private on-device inference and retrieval                  |

Do not store the same logical record in multiple independent systems without a defined synchronization strategy.

Implement:

- Incremental sync.
- Idempotent operations.
- Conflict resolution.
- Retry queues.
- Offline mutations.
- Supabase RLS.
- Scoped authorization.
- Data ownership.
- Deletion propagation.
- Schema migrations.

No cloud synchronization should be required for local functionality.

Do not introduce another backend or database without a concrete measured need.

# 18. BYOK — BRING YOUR OWN KEY

Users should not need an account to use local AI.

When a capability genuinely requires cloud inference, offer optional BYOK.

Support existing providers such as Gemini, OpenAI and OpenRouter.

Provide:

- Provider selection.
- API-key entry.
- Secure key storage.
- Connection test.
- Model selection.
- Capability validation.
- Default provider selection.
- Usage information.
- Budget settings.
- Update key.
- Remove key.
- Clear error handling.

Store keys using secure native-backed storage, preferably backed by Android Keystore.

Do not expose keys in logs, telemetry, deep links, plaintext backups or source control.

Do not assume that a client-side key can be hidden from the device owner. Clearly explain BYOK's security model.

If the platform funds cloud requests, keep provider credentials server-side in a secure gateway and enforce server-side budgets and rate limits.

Never ask users to sign in when the requested feature can run locally.

If sign-in is genuinely required for a cloud feature, explain why and navigate to the correct screen.

# 19. APP LOCALIZATION AND ANDROID CONFIGURATION

Audit `app.json`, `app.config.ts`, config plugins and native Android configuration for every application.

Use Expo Localization for:

- Preferred language.
- Locale.
- Region.
- Time zone.

Use Expo Location for coordinates only when required.

Do not confuse device region with current physical location.

Support the relevant languages already targeted by the applications, including English, Bengali, Hindi and Hinglish where the product supports them.

Implement localized dates, numbers, currency, units and voice settings.

Audit permissions individually:

- Internet.
- Microphone.
- Camera.
- Foreground location.
- Background location only when genuinely required.
- Notifications.
- Storage or SAF access.
- Foreground services.
- Any native model or audio capability.

Request permissions at the point of use with a clear explanation.

Do not request broad permissions merely because a feature might need them later.

Use Android-compliant background execution.

Do not assume background services can run indefinitely.

Ensure each native module is correctly registered in each app.

Do not blindly copy files across apps without building and testing each target.

# 20. UI/UX — FINISH THE ACTUAL PRODUCT

Do not stop at making backend APIs work.

Audit every existing screen and flow.

Improve the real UI, not just technical architecture.

Use the existing design system, theme tokens, typography, spacing, colors and assets.

Deliver a cohesive, modern, accessible and polished experience.

Prioritize:

- Consistency.
- Clear information hierarchy.
- Smooth transitions.
- Purposeful animations.
- Responsive layouts.
- Fast interactions.
- Accessibility.
- Empty states.
- Error states.
- Offline states.
- Loading states.
- Recovery states.
- Dark and light themes.
- Haptic feedback where appropriate.

Do not introduce decorative animation that delays important actions.

Do not use fake loading animations that imply progress without actual work.

## 20.1 Anvay AI dashboard

The dashboard must immediately explain:

- Whether the device is being checked.
- Whether a model exists.
- Whether a download is active.
- Whether the model is verified.
- Whether inference is available.
- Whether the app is offline.
- Whether a provider is available.
- Whether a recovery action is needed.

When no model exists, show a useful setup screen and keep deterministic functionality available.

Do not show an empty broken chatbot.

Do not display raw provider errors to ordinary users.

Provide advanced diagnostics separately.

## 20.2 AI settings

Include:

- Automatic routing.
- Local-only mode.
- Hybrid mode.
- Cloud permission.
- Provider management.
- BYOK.
- Model downloads.
- Model switching.
- Storage usage.
- Memory settings.
- Voice settings.
- Download policy.
- Sync preferences.
- Budget controls.
- Usage information.

Standalone chat remains disabled where configured. Do not use the settings work as an excuse to re-enable it.

# 21. THRIVEFOLD — FIRST PRIORITY

Finish ThriveFold before spreading incomplete shared infrastructure across the other apps.

Audit every existing feature and preserve functioning behavior.

Required verification:

- Model manager.
- Local inference.
- AI dashboard.
- Provider gateway.
- RAG.
- Memory.
- Voice assistant.
- Someone to Talk.
- Emergency support.
- Trusted contacts.
- Nearby help.
- Routines.
- Alarms.
- Sleep schedules.
- Hydration.
- Rewards.
- Milestones.
- Progress.
- Existing Coach and exercise functionality.
- Existing navigation.
- Existing analytics.
- Crash reporting.
- Offline operation.

Inspect and preserve existing implementations such as:

- `GlobalVoiceAssistant`
- `globalVoiceController`
- `chatStore`
- `coachVoiceService`
- `therapyVoice`
- `askAi`
- `LocalAI`
- `thriveRag`
- `emergencySupport`

Extend the existing APIs instead of assuming new methods or duplicating the engines.

Check existing alarm deep links and routine behavior.

Do not break existing routines, rewards, historical data, Coach functionality or navigation.

## 21.1 Live Coach and existing product flows

Audit the current Coach experience, camera integration, pose detection, video controls, session lifecycle and exercise progression.

Preserve existing working functionality.

Fix:

- Duplicate subscriptions.
- Competing audio playback.
- Unnecessary render loops.
- Resource leaks.
- Incorrect session state.
- Broken camera lifecycle.
- Performance regressions.
- Missing error recovery.

Do not invent exercise detection or claim that an exercise was completed without actual evidence from the implemented verification system.

# 22. PERFORMANCE AND OBSERVABILITY

Create `docs/AI_PERFORMANCE.md`.

Measure on actual Android hardware using release builds.

Record:

- Model loading duration.
- First-token latency.
- Total response time.
- Tokens per second.
- Peak RAM.
- Storage usage.
- Download speed.
- Retrieval latency.
- Cache hit rate.
- Provider latency.
- Provider failures.
- Cloud escalation rate.
- Actual cloud cost.
- Battery consumption.
- Thermal behavior.
- Crash rate.

Profile:

- Route time.
- Retrieval time.
- Prompt size.
- Prefill.
- Decode.
- Post-processing.

Optimize only after identifying the real bottleneck.

Use:

- Prompt pruning.
- Compact history.
- Retrieval filtering.
- Embedding cache.
- Safe local cache.
- Model warm-up.
- Model unloading.
- Streaming.
- Cancellation.
- Background processing.
- Priority scheduling.

Foreground user requests must outrank background embedding and memory jobs.

Cancel unnecessary inference when a user interrupts or starts a new request.

Never fabricate benchmark results.

# 23. TESTING — NO FALSE COMPLETION

Implement and run actual tests.

## AI and providers

- Local model available.
- No model available.
- Invalid model.
- Native module missing.
- Local-only mode.
- Cloud enabled.
- Missing API key.
- Invalid API key.
- Provider timeout.
- Rate limit.
- Empty response.
- Malformed structured output.
- Cloud budget exhausted.
- Offline mode.
- Provider recovery.
- Model switching.

## Model lifecycle

- Download.
- Pause.
- Resume.
- Cancel.
- Retry.
- Restart during download.
- Restart after download.
- Integrity mismatch.
- Storage exhaustion.
- Model corruption.
- Rollback.
- Process death.
- Device reboot.
- Client uninstall.
- Client reinstall.
- Provider uninstall.
- SAF permission loss.
- Model registry loss.

Use a disposable test application for uninstall tests.

## RAG

- PDF extraction.
- Scanned PDF OCR.
- Image OCR.
- Audio transcription.
- Unicode text.
- Chunk boundaries.
- Embeddings.
- Full-text search.
- Vector search.
- Hybrid retrieval.
- Permission filtering.
- Source citations.
- Memory deletion.
- Model version changes.

## Five apps

Test each application independently.

Verify:

- Startup.
- Navigation.
- Native modules.
- Permissions.
- Local functionality.
- Model discovery.
- Provider fallback.
- Cross-app authorization.
- No unauthorized data leakage.
- No dependency on another app being installed.

## Someone to Talk

Test:

- Ordinary conversation.
- Loneliness.
- Anxiety.
- Panic.
- Past crisis.
- Explicit immediate danger.
- Overdose disclosure.
- Severe injury.
- Medical emergency.
- Third-party emergency.
- Hypothetical discussion.
- Negation.
- Ambiguous statements.
- Country selection.
- Location denied.
- Nearby help.
- Emergency contact.
- Dialer.
- SMS composer.
- Location-sharing consent.
- Offline emergency directory.

## Required engineering checks

Run the actual project-supported:

- TypeScript checks.
- Lint.
- Unit tests.
- Integration tests.
- Native tests.
- Database migration tests.
- Security tests.
- Android release build.
- Physical-device verification.

Do not claim a test passed unless it was executed and its result was inspected.

# 24. PUBLISH THRIVEFOLD

This is the first release milestone.

Once ThriveFold passes functional QA:

1. Verify the package ID.
2. Verify signing configuration.
3. Verify version and version code.
4. Verify app configuration.
5. Verify Android permissions.
6. Build the release AAB.
7. Validate the AAB.
8. Install and test the release build.
9. Verify startup and navigation.
10. Verify AI fallback.
11. Verify crash reporting.
12. Verify no production secrets are embedded.
13. Verify privacy disclosures and required store materials.
14. Prepare release notes and required assets.
15. Submit through the already configured Play Console workflow if access is available.
16. Verify the actual submission result and release status.

A successful local build is not publication.

A successful upload is not necessarily approval.

A submitted release is not necessarily a published release.

If a Play Console action requires my credentials, payment, declaration or explicit authorization, prepare everything else and identify the exact final action needed from me.

Do not claim publication without evidence.

# 25. INTEGRATE THE REMAINING FOUR APPLICATIONS

After ThriveFold's shared infrastructure passes its acceptance tests, integrate the core into:

1. HarmonyBloom.
2. Neev Sanctuary.
3. Setu.
4. BlinkQuest.

Reuse the verified native modules, provider adapters, model manager, routing, voice and security components.

Each app must retain:

- Its own package ID.
- Its own product identity.
- Its own data ownership.
- Its own navigation and design.
- Its own standalone fallback.

Build and test each application independently.

Do not ship incomplete shared infrastructure just to claim all five apps are integrated.

# 26. GIT, COMMITS AND CONTINUOUS EXECUTION

Work through the backlog without stopping after the audit.

After each coherent milestone:

1. Review the diff.
2. Run focused tests.
3. Fix regressions.
4. Update documentation.
5. Create a recovery checkpoint.
6. Commit the verified changes.
7. Continue to the next unfinished item.

Use descriptive commits.

Do not force-push.

Do not commit:

- API keys.
- Keystores.
- Private credentials.
- Model binaries unintentionally.
- Personal databases.
- User records.
- Sensitive logs.
- Local backups.

Preserve unrelated changes.

Do not stop because one subsystem is blocked. Continue independent work.

# 27. REQUIRED DELIVERABLES

Create or update these documents:

1. `docs/ANVAYKOSH_MASTER_AUDIT.md`
2. `docs/EXISTING_INFRASTRUCTURE_MAP.md`
3. `docs/ANVAY_IMPLEMENTATION_PLAN.md`
4. `docs/ANVAYCORE_ARCHITECTURE.md`
5. `docs/AI_RECOVERY_REPORT.md`
6. `docs/AI_STORAGE_ARCHITECTURE.md`
7. `docs/AI_MODEL_CATALOG.md`
8. `docs/AI_MODEL_LIFECYCLE.md`
9. `docs/AI_DOWNLOAD_MANAGER.md`
10. `docs/AI_RUNTIME_ARCHITECTURE.md`
11. `docs/AI_ROUTING.md`
12. `docs/AI_COST_GOVERNANCE.md`
13. `docs/AI_RAG.md`
14. `docs/AI_MEMORY.md`
15. `docs/AI_PROVIDER_MATRIX.md`
16. `docs/AI_SECURITY.md`
17. `docs/AI_PERFORMANCE.md`
18. `docs/AI_VOICE_ARCHITECTURE.md`
19. `docs/AI_EMERGENCY_SUPPORT.md`
20. `docs/ANDROID_CONFIGURATION.md`
21. `docs/THRIVEFOLD_RELEASE_STATUS.md`
22. `docs/AI_IMPLEMENTATION_STATUS.md`

Keep documents accurate and update them as implementation progresses.

# 28. EXECUTION ORDER — DO NOT REORDER WITHOUT A TECHNICAL REASON

## Phase 1 — Repository and product audit

Understand every existing implementation and protect the current work.

**Gate:** Complete infrastructure map, recovery snapshot and prioritized backlog.

## Phase 2 — ThriveFold recovery

Repair broken model access, native modules, filesystem handling, dashboard states and existing product regressions.

**Gate:** Existing functionality preserved and recovery behavior verified.

## Phase 3 — Deterministic local engine

Complete calculations, SQLite intelligence, action registry and offline fallback.

**Gate:** Useful functionality works without any AI model or cloud provider.

## Phase 4 — Model lifecycle

Complete discovery, compatibility, download, verification, installation, persistence, rollback and recovery.

**Gate:** Model can be installed, loaded, used and recovered on a real device.

## Phase 5 — Unified AI gateway

Consolidate local and cloud providers, routing, validation and cost governance.

**Gate:** Correct provider selected for each test scenario, with hard budget enforcement.

## Phase 6 — RAG and memory

Complete ingestion, indexing, hybrid retrieval, scoped memory and source references.

**Gate:** Retrieval is accurate, permission-filtered and usable offline.

## Phase 7 — Central voice and Someone to Talk

Consolidate voice, support context, emergency flows and nearby assistance.

**Gate:** One assistant, one voice engine and safe, verified actions.

## Phase 8 — UI/UX completion

Finish the dashboard, setup, settings, model manager and existing product experience.

**Gate:** No broken, fake or infinite loading states.

## Phase 9 — ThriveFold QA and publication

Run complete release testing and publish through the configured workflow.

**Gate:** Actual release status verified.

## Phase 10 — Remaining four applications

Integrate the verified shared architecture and test each application independently.

**Gate:** All five apps work independently and share only authorized infrastructure.

# 29. FINAL ACCEPTANCE CRITERIA

Do not declare the project complete until the following are verified.

### Product

- [ ] ThriveFold's existing features work.
- [ ] Live Coach works.
- [ ] Someone to Talk uses the central assistant.
- [ ] Standalone chat remains disabled as configured.
- [ ] Emergency support is accessible.
- [ ] Existing navigation and design are preserved.
- [ ] UI/UX has complete loading, empty, error and recovery states.

### AI

- [ ] Local Qwen works where compatible.
- [ ] Other existing local models are discovered.
- [ ] Gemini works when configured.
- [ ] OpenAI works when configured.
- [ ] OpenRouter works when configured.
- [ ] ElevenLabs works where configured.
- [ ] Provider selection is capability-aware.
- [ ] Offline operation works.
- [ ] No-model operation works.
- [ ] Deterministic calculations avoid LLM calls.
- [ ] Provider failure does not break the application.

### Cost

- [ ] Cloud spending has a hard per-user limit.
- [ ] Global spending limit exists.
- [ ] Budget reservations and actual usage are tracked.
- [ ] No paid retries occur after budget exhaustion.
- [ ] Local-only mode makes no cloud requests.
- [ ] Current provider prices are verified.
- [ ] Cloud use is visible and explainable.
- [ ] Quality is preserved where budget permits.

### Models

- [ ] Existing models are recovered where possible.
- [ ] Downloads are resumable.
- [ ] SHA-256 is verified.
- [ ] Installation is safe.
- [ ] Model switching works.
- [ ] Rollback works.
- [ ] Model state survives normal restarts.
- [ ] Client reinstall behavior is tested.
- [ ] Provider uninstall behavior is honest and recoverable.
- [ ] No unsupported persistence claims exist.

### RAG and memory

- [ ] Local retrieval works.
- [ ] Documents are processed.
- [ ] Source references are retained.
- [ ] Permissions are enforced.
- [ ] Memory corrections and deletion work.
- [ ] Sensitive data is isolated.
- [ ] Retrieval works without a chat model where possible.

### Five applications

- [ ] Each app builds independently.
- [ ] Each app works independently.
- [ ] Shared native modules are correctly registered.
- [ ] Cross-app actions are authorized.
- [ ] No unauthorized data leakage exists.
- [ ] Model-provider fallback works.

### Release and engineering

- [ ] Tests are executed.
- [ ] Android release builds pass.
- [ ] Physical-device checks are completed.
- [ ] Git changes are reviewed.
- [ ] Commits are created.
- [ ] Documentation is updated.
- [ ] ThriveFold's actual Play release status is verified.

# 30. HOW YOU MUST WORK WITH ME

I want implementation, not repeated explanations of what could be done.

Do not stop after writing the architecture.

Do not stop after creating the dashboard.

Do not stop after making the local model load.

Do not stop after fixing the AI provider.

Do not stop after building ThriveFold.

Continue through the defined phases and all independent remaining work.

If something cannot be completed, state:

- What is blocked.
- Why it is blocked.
- What you verified.
- What you attempted.
- What remains.
- What exact access or decision is needed.

Do not hide failures behind successful status messages.

At the end of every major milestone, provide:

1. Completed work.
2. Actual changed files.
3. Tests executed and results.
4. Build status.
5. Cost impact.
6. Known limitations.
7. Remaining tasks.
8. Commit hash.
9. Next execution phase.

**Final instruction: Build the best sustainable solution, not the most expensive one. Use local intelligence, deterministic execution, existing infrastructure and small, deliberate cloud escalation. Protect the user's data, preserve the existing products, finish ThriveFold first, and continue until every deliverable has been implemented and verified.**

# Thrivefold Hybrid AI System Architecture

## 1. Local AI First: Deterministic Rules & On-Device Classification

Thrivefold avoids unpredictable and expensive cloud LLM latency by relying primarily on fast, deterministic, on-device intelligence (`src/domain/ai/` and `src/services/local-ai/`).

### Deterministic Expert Rules

- **Cycle Phase Rules**: Automatically maps menstrual cycle days to bio-specific nutrition, sleep hygiene, and physical activity advice (e.g. Follicular phase iron replenishment vs. Luteal phase magnesium and hydration).
- **Fatigue & Burnout Thresholds**: Triggered when sleep falls below 6 hours alongside consecutive high-stress check-in tags, proposing gentle de-escalation quests.
- **Crisis Signal Interception**: High-risk tags (e.g. self-harm, severe crisis) immediately trigger the deterministic safety circuit breaker, bypassing all conversational routines to surface local crisis hotline numbers.

### Local Classifier & Sentiment Analysis

- Operates in zero milliseconds locally without network connectivity.
- Categorizes self-reflection notes into primary emotional archetypes: `grounded`, `reflective`, `tense`, `energized`, `fatigued`.
- Generates contextual habit recommendations tailored to the active experience.

---

## 2. Consent-Gated Cloud AI Gateway (Gemini Multi-Provider)

For users who explicitly grant consent for advanced reflective insights:

- **Zero Client Keys**: Mobile application bundles contain zero API keys. All cloud AI requests pass through an authenticated server-side Edge Proxy (`services/ai-router/cloudAiGateway.ts`).
- **Data Anonymization**: All personally identifiable information, account identifiers, and exact GPS coordinates are stripped before proxy forwarding.
- **Cost Capping & Circuit Breakers**:
  - Free users are capped at 5 cloud reflections per calendar week.
  - Automatic fallback to on-device deterministic rules if cloud quotas or internet connectivity fail.
