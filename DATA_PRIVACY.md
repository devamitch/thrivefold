# Data and privacy overview

This page describes current app behavior at a high level. The controls in the app, source code, and
`docs/REQUIREMENTS_STATUS.md` are authoritative. This is not a security certification or a claim
that every integration has been independently audited.

## On-device storage

- The root app store is persisted through MMKV. On native devices it uses a key stored with
  `expo-secure-store` when secure key storage is available.
- If secure storage cannot provide a key, the current storage wrapper falls back to an unencrypted
  MMKV instance. In environments without the native module it uses in-memory storage.
- Check-ins, cycle records, journals, workouts, meals, and other health entries are kept on-device
  by default.
- Export and erase behavior is implemented in `src/services/privacy/localData.ts`; check its
  current coverage before adding new persisted data.

## Data that can sync or leave the device

- Signed-in profile and progress data sync with the Thrivefold server. This is separate from local
  health records and is described in `src/services/account/`.
- Weekly summary sharing is an explicit setting and sends aggregate summaries.
- Usage analytics is off by default. Crash reporting is also off by default and requires the person
  to enable it in Privacy and data.
- Cloud AI is off by default and requires consent. Connected health services run only after the
  person connects them and grants the requested access.
- Social features remain gated until real age assurance, consent, and server-side safeguards are
  available. The shared AnvayKosh identity, vault, connect, and sync services are not live.

## User controls

The Privacy and data screen offers app-data export, backup restore on Android, weekly summary
sharing, usage analytics, crash reports, and cloud AI controls. Account profile and progress sync
are separate account behavior. No payments are part of this release.
