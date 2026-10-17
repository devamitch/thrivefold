# Thrivefold Security & Penetration Testing Plan

## 1. Threat Model & Security Posture

Thrivefold handles sensitive personal health indicators and pseudonymous social correspondence. The threat model accounts for:
- **Client-Side Data Extraction**: Unlawful extraction of local health or cycle records from stolen physical devices.
- **Social Grooming & Harassment**: Attempts by bad actors to send abusive, predatory, or commercial spam messages.
- **Bypass of Social Age Gates**: Minors attempting to access adult correspondence or adult community channels.
- **SQL Injection & Data Leakage**: Malicious queries attempting to access other users' letters or identities.

---

## 2. Security Test Matrix

| Area | Threat Vector | Defense Mechanism | Validation Status |
|------|---------------|-------------------|-------------------|
| **Data At Rest** | Forensic extraction of local storage | Encrypted MMKV partitions + OS Keystore/Keychain protection | Verified |
| **Social Content** | Injection of phone numbers, links, profanity | 100% chip-only composer; zero freeform text entry; regex anti-bypass scanner | Verified by `chip-catalog.test.ts` |
| **Age Protection** | Underage participation in social correspondence | Deterministic age gate (17 barred with `UNDERAGE_FORBIDDEN`) | Verified by `policy-engine.test.ts` |
| **Quotas & Spiders** | Flooding introduction requests | Hard limit of 1 intro/day for trial users; database-level uniqueness constraints | Verified by `policy-engine.test.ts` |
| **Cloud RLS** | Horizontal privilege escalation (IDOR) | Supabase Row Level Security: `auth.uid() = user_id` deny-by-default on all tables | Verified in `20261016000002_thrivefold_rls_and_policies.sql` |
| **Secret Leakage** | Extraction of LLM API keys from app bundle | Zero cloud AI keys in bundle; requests routed through authenticated server edge proxy | Verified in `cloudAiGateway.ts` |

---

## 3. Automated Regression Testing Suite
Thrivefold maintains unit test coverage for all security and policy logic in `tests/unit/`:
- `policy-engine.test.ts`: Validates P0/P1 age rules, 1-intro daily limits, recipient blocks, and `REVIEW_REQUIRED` founder policies.
- `chip-catalog.test.ts`: Validates that chip composer blocks arbitrary text, forbids over 5 cards, and validates catalog UUIDs.
- `local-ai.test.ts`: Validates on-device deterministic cycle phase recommendations and crisis signal interception.
