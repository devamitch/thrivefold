# Thrivefold AI system map

This file is an index to the current implementation. `AGENTS.md`, the live requirements status,
and source code are authoritative for current behavior; older execution prompts are not.

## Implementation areas

- Assistant routing and actions: `src/services/assistant/agentEngine.ts` and
  `src/domain/assistant/`.
- Local retrieval and memory: `src/services/local-ai/rag/` and
  `src/services/local-ai/memory/`.
- Provider and model setup: `src/services/ai/` and `modules/local-ai/`.
- Shared coach voice: `src/services/voice/` and `src/services/ai/coachVoiceService.ts`.
- Privacy-safe diagnostics: `src/services/telemetry/crashReporting.ts`.

## Current evidence

- [AI runtime audit](docs/AI_RUNTIME_AUDIT.md) records observed routing, safeguards, and remaining
  issues.
- [Capability and offline matrix](docs/ai/CAPABILITY_AND_OFFLINE_MATRIX.md) describes which AI
  features work offline and their current status.
- [Local RAG and memory architecture](docs/ai/LOCAL_RAG_AND_MEMORY_ARCHITECTURE.md) documents the
  on-device retrieval system.
- [Local model catalog](docs/ai/LOCAL_AI_RUNTIME_AND_MODEL_CATALOG.md) describes model setup and
  runtime behavior.
- [Health document safety](docs/ai/HEALTH_DOCUMENT_SAFETY.md) covers sensitive document handling.

## Guardrails

Keep deterministic and on-device behavior available without a model or network. Ask for consent
before optional cloud AI. Do not send private health records, journal text, or transcripts to
analytics or logs. AI guidance does not diagnose; use the data and safety rules in `AGENTS.md`.
