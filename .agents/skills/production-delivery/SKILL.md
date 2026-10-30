---
name: production-delivery
description: Strict method for any task in this app — read the rules and task board, verify APIs against installed types and official docs, build the smallest real change, test on a real phone, update docs/TASKS.md with evidence, and hand over with the delivery report. Use first for every feature, bug, polish or release task.
---

# Production delivery (strict)

Full manual: `Docs/PRODUCTION_DELIVERY_PLAYBOOK.md` at the workspace root (from the app folder:
`../../Docs/PRODUCTION_DELIVERY_PLAYBOOK.md`).

1. **Read:** `AGENTS.md`, `docs/REQUIREMENTS_STATUS.md`, `docs/PRODUCT_COMPLETION_PLAN.md`,
   the files you will touch. `git status` — never overwrite others' uncommitted work.
2. **Claim** one task in `docs/REQUIREMENTS_STATUS.md` (`IN PROGRESS`, your name).
3. **Verify before coding:** read the installed type definitions or the official docs for the
   installed version (playbook §4). Never invent APIs, props, versions, model names or checksums.
4. **Build** the smallest real change; reuse `src/components/ui`, providers and services; tokens
   only; Gesture Handler touch; Reanimated with reduced motion; TanStack Query for network;
   FlashList for lists; in-app reader for links; every state (loading/empty/error/offline).
5. **Check:** `pnpm compile`, `pnpm lint`, `pnpm test` (+ `pnpm test:db` if migrations).
6. **Prove on a phone:** release build, install, use the feature, `logcat` shows no `FATAL` or
   `ReactNativeJS` errors, screenshot (playbook §9).
7. **Record:** set the task `DONE` with evidence (or `NOT TESTED` / `BLOCKED: reason`) in the same
   commit. Commit `type(scope): summary`, stage only your paths, never push.
8. **Hand over** with the delivery report (playbook §11).
