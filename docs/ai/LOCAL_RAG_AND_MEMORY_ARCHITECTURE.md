# Local RAG & Analytical Memory Architecture

Authoritative specification of Thrivefold's on-device Retrieval-Augmented Generation (RAG) and long-term analytical memory pipeline.

---

## 1. Architectural Overview

```
User Query / Voice Utterance
       │
       ▼
Query Normalization & Tokenization (localRetrieval.ts)
       │
   ┌───┴───────────────────────────────────┐
   ▼                                       ▼
Sparse Lexical BM25 Ranking           Dense Vector Cosine Similarity
(`rankSparseBM25`)                    (`LocalAI.embed` -> `memoryStore`)
   │                                       │
   └───────────────────┬───────────────────┘
                       ▼
         Reciprocal Rank Fusion (RRF k=60)
         `score = (1 / (60 + rankSparse)) + (1.2 / (60 + rankDense))`
                       │
                       ▼
          Evidence Confidence Threshold Filter ($\tau \ge 0.01$)
                       │
     ┌─────────────────┴─────────────────┐
     ▼                                   ▼
High Confidence Evidence            Insufficient Evidence
Synthesize Grounded Answer with      Return Truthful Non-Diagnostic
`[Source 1]`, `[Source 2]` Citations Fallback Statement
```

---

## 2. Document Ingestion & Chunking Standards

1. **Semantic Boundary Chunking**: Documents are split along natural paragraph and sentence boundaries (bounded between 150 and 400 characters) with a 40-character sliding overlap to preserve contextual continuity.
2. **Metadata Tagging**: Every chunk retains:
   - `id`: unique UUID
   - `sourceType`: `user_memory` | `user_journal` | `exercise_catalog` | `health_guide`
   - `title`: human-readable document or exercise title
   - `content`: raw sanitized snippet
   - `timestamp`: ISO-8601 creation/modification date
   - `embedding`: 384-dimensional vector when model is loaded.

---

## 3. SQLite Local Storage Schema

All memories are persisted in `thrivefold-local-memory.db`:

```sql
CREATE TABLE IF NOT EXISTS user_memories (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL, -- 'profile' | 'preference' | 'episode' | 'fact' | 'workflow' | 'semantic'
  content TEXT NOT NULL,
  embedding_json TEXT,
  source_event_ids_json TEXT NOT NULL,
  confidence REAL NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT,
  origin TEXT NOT NULL, -- 'user_declared' | 'observed' | 'ai_inferred'
  status TEXT NOT NULL, -- 'active' | 'needs_confirmation' | 'archived'
  metadata_json TEXT
);
```

---

## 4. Privacy, Inspection & Right to Be Forgotten

- **Inspection Screen**: Users can view all saved memories at `Settings -> Private AI Memories` (`/(app)/settings/memories`).
- **Selective Deletion**: Any individual memory can be erased instantly with `memoryStore.deleteMemory(id, userId)`.
- **Erase All**: Complete local knowledge reset via `memoryStore.clearAllMemories(userId)` with explicit confirmation dialog.
- **Export**: Full JSON export capability via Android system share sheet.
