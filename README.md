# Thrivefold

Thrivefold is an Android-first, local-first wellbeing app. Its core features include daily
check-ins, routines, journaling, cycle tracking, and on-device guidance. Core use does not require
an account or a cloud connection. Thrivefold is not a medical device and does not diagnose.

## Product rules

- People choose their experience; the app does not infer sensitive traits.
- Health and journal data stay on the device by default.
- Social and shared AnvayKosh features remain gated until their server safeguards are live.
- This release has no payments, subscriptions, credits, or advertising.

## Development

Use pnpm for dependency and project commands.

```sh
pnpm install
pnpm start
pnpm android
pnpm compile
pnpm lint
pnpm test
```

## Project documents

- [Agent contract](AGENTS.md): shared rules for every coding tool and contributor.
- [Product concept](PRODUCT_MASTER.md): current product purpose, principles, and boundaries.
- [Architecture](ARCHITECTURE.md): implementation structure.
- [Routes](ROUTES.md): app navigation map.
- [Data privacy](DATA_PRIVACY.md): local data and privacy design.
- [AI system](AI_SYSTEM.md): AI implementation and operating notes.
- [Requirements status](docs/REQUIREMENTS_STATUS.md): current requirement evidence.
- [Product completion plan](docs/PRODUCT_COMPLETION_PLAN.md): remaining work and dependencies.
- [Task board](docs/TASKS.md): active engineering work.

The AnvayKosh identity, vault, connect, and sync services are not live in Thrivefold. The
standalone app must continue to work without them. Read `AGENTS.md` before changing app behavior,
data handling, or integrations.
