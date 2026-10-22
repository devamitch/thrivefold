---
name: thrivefold-backend
description: Thrivefold's Supabase backend — migrations, RLS patterns, server functions for letters/communities/grants/appeals, and how to prove security with pnpm test:db on real Postgres. Use when adding tables, policies, RPCs, or wiring the app to the server.
---

# Backend

Status: migrations written and verified locally; **not deployed**. Thrivefold needs its own
Supabase project — never point it at another app's project. The client
(`src/services/supabase/supabaseClient.ts`) is `null` unless `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_KEY` are set; the app must keep working on-device without it.

## Migrations (`supabase/migrations`)

1. `…000001` core tables · 2. `…000002` RLS · 3. `…000003` orgs/stamps ·
4. `…000004` hardening: deny-by-default, no anon, fixed membership policies, letters via
   RPC, special grants, restrictions/appeals/audit, export, payment tables dropped.

## Rules

- RLS on every table, policies `to authenticated`, deny by default; no `using (true)`.
- Never compare `x_id = id` inside a subquery on another table — `id` binds to the inner
  table. Use a `security definer` helper (`tf_is_community_member(id)`) instead; this also
  avoids self-referencing policy recursion.
- Writes that must enforce rules (letters, joins, grants, restrictions) go through
  `security definer` functions with `set search_path = ''`; revoke direct insert/update.
- Server-controlled columns (age verification, age band) are protected by trigger.
- Admin actions require `tf_is_platform_admin`, forbid self-application, and write
  `thrivefold_audit_log`. Restrictions need evidence; appeals can reinstate.

## Prove it

```sh
pnpm test:db   # runs all migrations on PGlite (Postgres 17) with auth stubs: 47 checks
```

Add a check to `tests/db/rls.test.mjs` for every new policy or RPC: the allowed case, the
cross-user case, and the anon case. A policy without a failing-then-passing check is not done.

## Deploy (owner, once a project exists)

```sh
supabase link --project-ref <thrivefold-ref> && supabase db push
```
