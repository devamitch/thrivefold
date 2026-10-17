# Thrivefold Founder Policy Requests & Sensitive Gates

## 1. Context & Governance Protocol

During initial system design, several sensitive demographic and religious matching rules were explored. In accordance with Google Play, Apple App Store, and international civil rights regulations, **no algorithm or policy may covertly infer or enforce religious, ethnic, or exclusionary matching without transparent disclosure and explicit legal review.**

---

## 2. Policy Status Ledger

| Policy Code | Description | Architecture Status | Operational Rule |
|-------------|-------------|---------------------|------------------|
| `muslimMen18To30WomenDating` | Restriction or special gating for male demographics | **REVIEW_REQUIRED** | Code exists as inactive configuration in `policyConfig.founderRequestedSensitiveRules`. Policy engine deterministically halts with `POLICY_REVIEW_REQUIRED` (Allowed = false). |
| `hinduWomenSocialExclusion` | Exclusionary filtering based on religious identity | **REVIEW_REQUIRED** | Inactive. Deterministically halts with `POLICY_REVIEW_REQUIRED` (Allowed = false). Never deployed in production. |
| `physicalMeetupCoordination` | Facilitating physical in-person rendezvous | **DISABLED_PENDING_LEGAL_STORE_APPROVAL** | Halted with `FEATURE_DISABLED_BY_CHANNEL` (Allowed = false). Thrivefold remains exclusively an asynchronous postal letter exchange. |

---

## 3. Auditing & Compliance Guarantee
1. **No Inferred Attributes**: The system does NOT predict, infer, or store protected attributes (religion, ethnicity, caste, political affiliation).
2. **Deterministic Neutrality**: Feature eligibility strictly evaluates non-discriminatory variables: age assurance (18+), mutual blocklists, verified consent, and daily quotas.
3. **Legal Gatekeeper**: Moving any sensitive rule from `REVIEW_REQUIRED` to active status requires documented external counsel sign-off and updated public Terms of Service.
