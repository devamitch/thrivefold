# Thrivefold task board

| ID | Task | Owner | Status | Evidence |
| --- | --- | --- | --- | --- |
| AI.1 | Audit and connect local-first assistant, retrieval and safe cloud escalation | codex | IN PROGRESS | `AI_RUNTIME_AUDIT.md`; 570 unit tests, compile, DB checks and targeted lint pass; release/device verification pending |
| DOC.1 | Remove stale product claims and reduce sensitive console diagnostics | codex | DONE | `pnpm compile` PASS; targeted ESLint PASS; 90 suites / 570 tests PASS; full lint has 3 known errors in untouched `LootBoxModal.tsx`; no device run (diagnostics/docs only) |
| DOC.2 | Consolidate project entry docs and sanitize diagnostic output | codex | DONE | README/Gemini entry points simplified; 10 obsolete execution prompts removed; crash text and context sanitized; compile and 570 tests PASS; full lint still has 3 known hook errors in untouched `LootBoxModal.tsx`; no device run |
| DOC.3 | Remove superseded root specifications and clarify future social concepts | codex | DONE | Removed obsolete prompt, continuation, and payments docs; shortened `AI_SYSTEM.md`; labeled social docs as future concepts; `pnpm compile` PASS, 570/570 tests PASS, targeted ESLint PASS, stale-reference check PASS; no device run |
