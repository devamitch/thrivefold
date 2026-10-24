# HIPAA, FHIR and interoperability: what is built and what is not

Status as of 2026-10-24. This is an engineering record, not legal advice. Thrivefold cannot
honestly be called "HIPAA compliant" yet: compliance is a property of an organisation and its
contracts, not only of an app. This page lists the technical safeguards that exist in code and
the steps only the owner can take.

## Does HIPAA apply?

HIPAA applies to covered entities (providers, plans, clearinghouses) and their business
associates. A consumer wellbeing app used directly by a person, with no covered entity
involved, is usually not covered; the FTC Health Breach Notification Rule and state laws
(for example Washington's My Health My Data Act) apply instead. HIPAA starts to apply if a
clinic, employer health plan or insurer offers Thrivefold to its patients or members. Treat
the safeguards below as the baseline for both cases.

## Technical safeguards in the app (45 CFR 164.312 mapping)

| Safeguard | Where | Status |
| --- | --- | --- |
| Encryption at rest | `src/stores/persistStorage.ts`: MMKV AES store, per-install key in Android Keystore via expo-secure-store; existing data re-encrypted on upgrade; erase rotates the key | Built, unit-tested logic; not seen on device |
| Access control | Device screen lock; no shared accounts; health records never leave the phone | Built (relies on the OS lock) |
| Audit controls | `integrationSlice.auditLog`: consent, sync read/write, device connect, export, erase events; visible in Connected apps | Built |
| Integrity | Append-only reward ledger with idempotency keys; server RPCs set amounts (`tf_claim_*`) | Built, `pnpm test:db` |
| Transmission security | Supabase over TLS; only sign-in identity and reward ledger are sent; health records are not | Built; backend not deployed |
| Consent | Per-type Health Connect consent, camera consent for pose checks, records kept after revoke | Built |
| Right of access / portability | JSON export and HL7 FHIR R4 Bundle export (`src/domain/interop/fhir.ts`) | Built, `tests/unit/interop.test.ts` |
| Deletion | Erase everything on the phone, key rotated; `tf_export_my_data` server export | Built locally; server account deletion needs an edge function |
| Minimum necessary | Rewards never depend on disclosed health data; sensitive catalog tasks are never auto-assigned | Built, tests |

## What the owner must do before claiming HIPAA readiness

1. Use a HIPAA-eligible backend plan and sign a BAA (Supabase offers one on its Team/Enterprise
   plans with the HIPAA add-on). Sign BAAs with every vendor that touches PHI (email OTP
   provider, crash reporting, analytics). Today none of these are deployed.
2. Write and keep a security risk analysis (164.308(a)(1)), policies, workforce training, an
   incident and breach-notification procedure, and a contingency plan.
3. Name a privacy and security officer.
4. Get the privacy policy reviewed by counsel for the markets you ship in.
5. Keep crash reporting and logs free of health data (no Sentry or analytics is wired today).

## FHIR and HL7

- Export: FHIR R4 `Bundle` of type `collection`, with `Patient`, `Observation` (LOINC 93832-4
  sleep, 41950-7 steps, 8867-4 heart rate, 29463-7 weight, 8665-2 last menstrual period,
  55411-3 exercise duration) and `MedicationStatement`. Self-reported scores without a standard
  code use the Thrivefold code system and every bundle is tagged `patient-generated`.
- Not built: a FHIR server API, SMART on FHIR app launch, import from an EHR, HL7 v2 messages.
  These need a partner EHR and are out of scope for a local-first consumer app.

## Platform health data

| Source | Status |
| --- | --- |
| Android Health Connect (also where Google Fit and Samsung Health share data) | Read steps, sleep, heart rate, weight, exercise; optional workout write. Built; needs a device to verify |
| Bluetooth LE heart-rate straps (GATT 0x180D / 0x2A37) | Built; needs a device to verify |
| Apple HealthKit | Not applicable: this is an Android build. Needs an iOS target and react-native-health |
| Google Fit APIs | Deprecated by Google; Health Connect replaces them |
| Samsung Health SDK | Not needed: Samsung Health writes to Health Connect |

## MediaPipe pose

`modules/pose-landmarker` runs MediaPipe Pose Landmarker (lite) on-device through CameraX.
Frames are analysed in memory and dropped; only reps, valid frame count, mean landmark
confidence and joint-angle range are stored (`src/domain/pose/movement.ts`). It is not a
clinical or injury assessment. The catalog's pose quest objectives stay unassigned until the
session evidence is wired into the quest verifier.
