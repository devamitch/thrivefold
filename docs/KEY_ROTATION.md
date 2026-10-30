# Provider key rotation (owner action)

Builds made before commit 63bbbcf (2026-10-30) bundled these `EXPO_PUBLIC_*` keys from `.env.local`
into the app. Treat every one as exposed. Values are never written here.

Checked by comparing SHA-256 digests (no values printed): most of the same keys are also the
Supabase Edge Function secrets, so rotating means updating Supabase too.

| Leaked key (`.env.local`) | Same key also in Supabase secret | Where to rotate |
| --- | --- | --- |
| GEMINI_API_KEY | GEMINI_AUTH_KEY | aistudio.google.com → API keys |
| GEMINI_API_KEY_2 | GEMINI_API_KEY | aistudio.google.com → API keys |
| GROQ_API_KEY | GROQ_API_KEY | console.groq.com → API Keys |
| GROQ_API_KEY_2 | GROQ_API_KEY_2 | console.groq.com → API Keys |
| OPENROUTER_API_KEY | OPENROUTER_API_KEY | openrouter.ai → Keys |
| SARVAM_API_KEY, SARVAM_API_KEY_2 | — | dashboard.sarvam.ai → API keys |
| ELEVENLABS_API_KEY | ELEVENLABS_API_KEY | elevenlabs.io → Profile → API keys |
| DEEPGRAM_API_KEY | DEEPGRAM_API_KEY | console.deepgram.com → API Keys |
| COHERE_API_KEY | COHERE_API_KEY | dashboard.cohere.com → API keys |
| VOYAGE_API_KEY | VOYAGE_API_KEY | dash.voyageai.com → API keys |
| EXA_API_KEY | — | dashboard.exa.ai → API keys |
| MEM0_API_KEY | MEM0_API_KEY | app.mem0.ai → API keys |

## Steps
1. In each console: create a new key, then **revoke the old one** (only revoking stops the leak).
2. Put the new keys only on the server, for example:
   `supabase secrets set GROQ_API_KEY=<new> --project-ref lymbgfzngpkvcadrkvui` (one per secret above).
3. Delete the `EXPO_PUBLIC_<provider>` lines from `.env.local` (the app no longer reads them).
4. Check old APKs/AABs are not still being distributed; any uploaded to Play before 63bbbcf contain the old keys.
