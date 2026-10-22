---
name: thrivefold-working-method
description: How to take any Thrivefold request from vague report to verified fix — scope it, find the real cause in code, change only that, verify on a device, commit just your files, and report honestly. Use first for any bug, "looks bad", flow, or feature request; works for any AI tool.
---

# Working method

The owner judges the app on the phone. Work is done when the behaviour is seen working,
checks pass, and the report says exactly what was and wasn't verified.

## 1. Pin the request down

- Re-read the owner's latest message and the spec section it touches
  (`thrivefold_ultimate_master_build_prompt_v2.md`). Turn "looks bad" into checkable
  statements: which screen, what's wrong, what good looks like.
- If the owner limits scope ("only X"), stay inside it; list other problems in the report.

## 2. Look before you touch

- `git status --short` and `git log --oneline -5`. Another agent may be mid-change.
- If a file you plan to edit changed in the last few minutes and you didn't change it,
  someone else owns it right now: work elsewhere or integrate, never overwrite.
- Read the whole code path (screen → store slice → domain function), not the comments.
  Comments here have described intended behaviour that wasn't real.

## 3. Find the cause — patterns already found in this repo

| Symptom | Real cause |
| --- | --- |
| Data "lost" after restart | stores weren't persisted (now one MMKV-persisted `useRootStore`) |
| New user sees progress/letters | seeded initial state in slices |
| Adult features open to anyone | hard-coded verified user; `?? 26` / `?? true` fallbacks |
| Onboarding skipped | sign-in routed straight to tabs instead of `/` resolver |
| Grey/black app icon | SVG gradients rasterised by ImageMagick; render with resvg |
| Button does nothing | `onPress={() => {}}` or an alert claiming success |
| Strict errors "missing" | `"strict": true` had been removed from tsconfig |

Grep for the symptom's data, find every writer and reader, then fix at the source.

## 4. Change only what's needed

- Keep public APIs (store actions, component props) stable or update every caller in the
  same commit. Use existing components and tokens (see `thrivefold-design-system`).
- No fake success, no placeholder people, no decorative logos or emoji.

## 5. Verify

`pnpm compile && pnpm lint && pnpm test && pnpm test:db`, then see it on a device
(`thrivefold-android-verification`). Startup, splash, icons and fonts need a native rebuild.

## 6. Commit and report

- Stage explicit paths: `git add path/a path/b` — **never `git add -A` or `git add .`**.
- `type(scope): summary` ≤72 chars, body says why. Never push.
- Report: what changed, evidence per item (command output / screenshot), what is NOT
  TESTED or BLOCKED and the exact owner action needed.
