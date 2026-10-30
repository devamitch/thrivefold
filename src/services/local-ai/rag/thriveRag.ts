/**
 * Thrive RAG: the one place the app stores and finds local knowledge and asks the on-device model.
 *
 * Built on the `react-native-rag` contracts (Embeddings, VectorStore, LLM), implemented over what
 * this app already ships: llama.cpp through `modules/local-ai` for embeddings and generation, and
 * the SQLite knowledge store for vectors. Retrieval is hybrid (BM25 keywords + vectors, fused by
 * reciprocal rank), so it still works before any model is downloaded. ExecuTorch (the package's
 * own runtime) is not used: it needs Android 13+ and a new native build.
 *
 * Everything stays on the phone.
 */
import type { Embeddings, GetResult, LLM, Message, QueryResult, VectorStore } from 'react-native-rag';

import { LocalAI } from '../../../../modules/local-ai';
import { asyncKeyValueStorage } from '../../../stores/persistStorage';
import { answerWithHybridRag, retrieveHybridEvidence, type RagEvidenceHit, type RagResponse } from './hybridRagPipeline';
import { knowledgeStore, type KnowledgeDocument } from './knowledgeStore';

const USER = 'local_user';

/** Embeddings from the loaded llama.cpp model (none until a model is ready). */
export class LocalEmbeddings implements Embeddings {
  async load() {
    return this;
  }
  async unload() {}
  async embed(text: string): Promise<number[]> {
    if (!LocalAI.isLoaded()) return [];
    try {
      return (await LocalAI.embed(text)) ?? [];
    } catch {
      return [];
    }
  }
}

/** Streams from the on-device model. The last user message is the prompt; earlier turns are context. */
export class LocalLLM implements LLM {
  private turn: string | null = null;

  async load() {
    return this;
  }
  async unload() {}
  async interrupt() {
    if (this.turn) LocalAI.cancelGeneration();
  }

  generate(messages: Message[], callback: (token: string) => void): Promise<string> {
    if (!LocalAI.isLoaded()) return Promise.reject(new Error('No on-device model is loaded.'));
    const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n');
    const talk = messages.filter((m) => m.role !== 'system');
    const last = talk[talk.length - 1]?.content ?? '';
    const context = talk
      .slice(0, -1)
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Person' : 'Coach'}: ${m.content}`)
      .join('\n');
    const turnId = `rag_${Date.now()}`;
    this.turn = turnId;
    return new Promise<string>((resolve, reject) => {
      const subs = [
        LocalAI.onToken((e) => {
          if (e.turnId === turnId) callback(e.token);
        }),
        LocalAI.onStreamComplete((e) => {
          if (e.turnId !== turnId) return;
          done();
          resolve(e.fullText);
        }),
        LocalAI.onStreamError((e) => {
          if (e.turnId !== turnId) return;
          done();
          reject(new Error(e.error));
        }),
      ];
      const done = () => {
        subs.forEach((s) => s.remove());
        if (this.turn === turnId) this.turn = null;
      };
      if (!LocalAI.startStream(turnId, last, context || undefined, system || undefined)) {
        done();
        reject(new Error('The on-device model is busy.'));
      }
    });
  }
}

const toGetResult = (d: KnowledgeDocument): GetResult => ({
  id: d.id,
  document: d.rawText,
  embedding: [],
  metadata: { ...(d.metadata ?? {}), title: d.title, sourceType: d.sourceType },
});

/** The SQLite knowledge store behind the `VectorStore` contract, with hybrid search. */
export class SqliteVectorStore implements VectorStore {
  async load() {
    return this;
  }
  async unload() {}

  async add(params: { id?: string; document?: string; embedding?: number[]; metadata?: Record<string, any> }): Promise<string> {
    const meta = params.metadata ?? {};
    const doc = await knowledgeStore.ingestDocument(USER, {
      title: String(meta.title ?? params.document?.slice(0, 60) ?? 'Note'),
      text: params.document ?? '',
      sourceType: (meta.sourceType as KnowledgeDocument['sourceType']) ?? 'user_note',
      metadata: meta,
    });
    return doc.id;
  }

  async update(params: { id: string; document?: string; embedding?: number[]; metadata?: Record<string, any> }): Promise<void> {
    await knowledgeStore.deleteDocument(USER, params.id);
    await this.add({ document: params.document, metadata: params.metadata });
  }

  async delete(params: { predicate: (value: GetResult) => boolean }): Promise<void> {
    const docs = await knowledgeStore.listDocuments(USER);
    for (const d of docs) if (params.predicate(toGetResult(d))) await knowledgeStore.deleteDocument(USER, d.id);
  }

  async query(params: { queryText?: string; nResults?: number; predicate?: (value: QueryResult) => boolean }): Promise<QueryResult[]> {
    if (!params.queryText) return [];
    const hits = await retrieveHybridEvidence(USER, params.queryText, params.nResults ?? 4);
    const results = hits.map<QueryResult>((h) => ({
      id: h.document.id,
      document: h.document.content,
      embedding: h.document.embedding ?? [],
      metadata: { ...(h.document.metadata ?? {}), title: h.document.title, snippet: h.snippet },
      similarity: h.hybridScore,
    }));
    return params.predicate ? results.filter(params.predicate) : results;
  }
}

const INDEX_KEY = 'thrive.appKnowledge.v1';
type KeyIndex = Record<string, { id: string; hash: string }>;

async function readIndex(): Promise<KeyIndex> {
  try {
    const raw = await asyncKeyValueStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as KeyIndex) : {};
  } catch {
    return {};
  }
}

/** The app's single RAG entry point. */
export const thriveRag = {
  embeddings: new LocalEmbeddings(),
  store: new SqliteVectorStore(),
  llm: new LocalLLM(),

  /** Best matches for a question across app knowledge, Learn, memories, chats and documents. */
  search(query: string, topK = 4): Promise<RagEvidenceHit[]> {
    return retrieveHybridEvidence(USER, query, topK);
  },

  /** Evidence lines for a prompt ("- title: text"), best matches first. */
  async contextFor(query: string, maxChars = 1500, topK = 4): Promise<string> {
    try {
      const hits = await retrieveHybridEvidence(USER, query, topK);
      return hits
        // Fused RRF scores are small (one list alone tops out near 1/61 ≈ 0.016), so any fixed cut
        // above that dropped every hit; candidates already matched a keyword or the meaning.
        .filter((h) => h.hybridScore > 0)
        // Document chunks are short already: pass them whole so page markers and numbers survive.
        .map((h) => `- ${h.document.title}: ${h.document.sourceType === 'user_document' ? h.document.content.replace(/\s+/g, ' ') : h.snippet}`)
        .join('\n')
        .slice(0, maxChars);
    } catch {
      return '';
    }
  },

  /** A grounded answer with citations, or an honest "not found". */
  answer(question: string): Promise<RagResponse> {
    return answerWithHybridRag(USER, question);
  },

  /** Saves free text (a note, a cloud answer, a scanned document) for later retrieval. */
  remember(title: string, text: string, sourceType: KnowledgeDocument['sourceType'] = 'user_note', metadata?: Record<string, unknown>) {
    return knowledgeStore.ingestDocument(USER, { title, text, sourceType, metadata });
  },

  /**
   * Adds a file the person read in the chat (its extracted text, never the file itself). Pages are
   * marked "[page N]" so answers can cite them. A file with the same text is not added twice.
   */
  async rememberDocument(name: string, pages: { page: number; text: string }[], hash: string): Promise<{ id: string; duplicate: boolean }> {
    const existing = (await knowledgeStore.listDocuments(USER)).find((d) => d.metadata?.hash === hash);
    if (existing) return { id: existing.id, duplicate: true };
    const text = pages
      .filter((p) => p.text.trim())
      .map((p) => `[${name}, page ${p.page}]\n${p.text.trim()}`)
      .join('\n\n');
    const doc = await knowledgeStore.ingestDocument(USER, {
      title: name,
      text,
      sourceType: 'imported_file',
      metadata: { source: 'chat_attachment', hash, pages: pages.length, at: new Date().toISOString() },
    });
    return { id: doc.id, duplicate: false };
  },

  /**
   * Keyed documents the app owns (screens, Learn, recent days, chats): replaced only when the text
   * changed, and removed when a key disappears. Returns how many were written or removed.
   */
  async sync(docs: { key: string; title: string; text: string; hash: string }[]): Promise<number> {
    const index = await readIndex();
    // Documents erased elsewhere (Settings > Memories > clear) are written again.
    const present = new Set((await knowledgeStore.listDocuments(USER)).map((d) => d.id));
    for (const key of Object.keys(index)) if (!present.has(index[key].id)) delete index[key];
    const keep = new Set(docs.map((d) => d.key));
    let changed = 0;
    for (const doc of docs) {
      const prev = index[doc.key];
      if (prev?.hash === doc.hash) continue;
      if (prev) await knowledgeStore.deleteDocument(USER, prev.id).catch(() => false);
      const saved = await knowledgeStore.ingestDocument(USER, {
        title: doc.title,
        text: doc.text,
        sourceType: 'wellness_guide',
        metadata: { source: 'app', key: doc.key },
      });
      index[doc.key] = { id: saved.id, hash: doc.hash };
      changed++;
    }
    for (const key of Object.keys(index)) {
      if (keep.has(key)) continue;
      await knowledgeStore.deleteDocument(USER, index[key].id).catch(() => false);
      delete index[key];
      changed++;
    }
    await asyncKeyValueStorage.setItem(INDEX_KEY, JSON.stringify(index));
    return changed;
  },

  /** Forgets everything (erase all data). */
  async clear(): Promise<void> {
    await knowledgeStore.clearAllDocuments(USER);
    await asyncKeyValueStorage.removeItem(INDEX_KEY);
  },
};
