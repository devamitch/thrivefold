# Anvay ID across AnvayKosh apps — plan (owner approved 2026-10-30)

Follows the workspace laws in `/Volumes/Amit/Projects/AGENTS.md` §3. Nothing here is built yet.

## Shape
1. **Identity provider:** the shared Supabase project acts as the OAuth 2.1 authorization server
   (authorization code + PKCE). Users sign in once with Google there.
2. **App registry (server, fail closed):** table `anvay_app_registry` — package name, signing-cert
   SHA-256 per environment (debug / upload / Play), allowed redirect App Link, status (active / revoked).
   An edge function checks every token request against it.
3. **Return path:** each app opens the system browser (Custom Tab) to the authorize URL and receives a
   one-time code on its verified Android App Link (`https://<domain>/auth/<app>`); it exchanges the code
   with its PKCE verifier. URLs carry only the code — never profile, health data or tokens.
4. **Consent:** signing in grants no data. Each app requests categories (profile basics, preferences)
   with purpose, expiry and revoke, stored server-side.
5. **Data:** Anvay Vault stays owner-only; merges fill empty fields with provenance.

## Order
1. Migration: registry + consent tables with RLS; edge function `anvay-authorize` / `anvay-token`.
2. Domain + `assetlinks.json` hosting for App Links (needs the owner's domain).
3. Thrivefold client: Custom Tab sign-in, code exchange, consent screen.
4. Then BlinkQuest, Setu, Neev, HarmonyBloom, one at a time, each tested on a device.

## Owner inputs needed
- The domain for App Links and `assetlinks.json`.
- Release signing SHA-256 for each app (Play App Signing certificate).
