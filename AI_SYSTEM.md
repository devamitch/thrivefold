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
