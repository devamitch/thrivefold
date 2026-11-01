# Security verification plan

This is an automated verification checklist, not a penetration-test report. Passing unit tests does
not prove deployed server configuration or production-device behavior. Record current evidence in
`docs/REQUIREMENTS_STATUS.md`.

## Checks

| Area | Check | Command or source |
| --- | --- | --- |
| Type safety | Compile the TypeScript app | `pnpm compile` |
| App logic | Run unit and integration suites | `pnpm test --runInBand` |
| Database access | Exercise migration and row-level security tests against Postgres | `pnpm test:db` |
| Eligibility | Verify unknown age and unverified accounts fail closed; sensitive traits do not affect access | `src/domain/policy/`, `tests/unit/policy-engine.test.ts` |
| Local data | Verify export, restore, and erase behavior as features change | `src/services/privacy/localData.ts` and related tests |
| Diagnostics | Confirm private records, notes, messages, and transcripts do not enter logs or analytics | `src/services/telemetry/` |
| Device behavior | Install a release build and check logcat for crashes | Playbook §9 in `../../Docs/PRODUCTION_DELIVERY_PLAYBOOK.md` |

## Release safeguards

- Never print `.env*` values or place secrets in client code, logs, URLs, or analytics.
- Keep age assurance server-verified. Self-declaration is not verification.
- Keep unreviewed social pathways disabled; never use inferred sensitive traits for eligibility.
- Review deployed Supabase policies and Edge Function secrets in the target project. Repository
  migrations alone do not prove the deployed project matches them.
- Rotate provider keys that appeared in earlier builds, as tracked in `docs/KEY_ROTATION.md`.

## Latest recorded result

See `docs/REQUIREMENTS_STATUS.md` for the current compile, lint, test, database, build, and device
evidence. A full third-party penetration test has not been recorded here.
