/**
 * Keeps the coach's local knowledge current: every screen, every Learn article and a summary of the
 * person's last week go into the on-device knowledge store, where hybrid retrieval (keywords plus
 * vectors) finds them. Only changed documents are replaced; nothing leaves the phone.
 */
import { ARTICLES } from '../../content/learn';
import { learnDocs, recentDaysDoc, screensDoc, hashText, type KnowledgeDoc } from '../../domain/assistant/appKnowledge';
import { DESTINATIONS } from '../../domain/search/destinations';
import { asyncKeyValueStorage } from '../../stores/persistStorage';
import { useRootStore } from '../../stores/useRootStore';
import { knowledgeStore } from '../local-ai/rag/knowledgeStore';

const USER = 'local_user';
const INDEX_KEY = 'thrive.appKnowledge.v1';

type Index = Record<string, { id: string; hash: string }>;

let running: Promise<number> | null = null;

async function readIndex(): Promise<Index> {
  try {
    const raw = await asyncKeyValueStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as Index) : {};
  } catch {
    return {};
  }
}

/** All documents the app provides right now. */
export function currentAppDocs(now = new Date()): KnowledgeDoc[] {
  return [screensDoc(DESTINATIONS), ...learnDocs(ARTICLES), recentDaysDoc(useRootStore.getState(), now)];
}

/** Replaces changed documents and returns how many were written. Never throws. */
export function refreshAppKnowledge(): Promise<number> {
  if (running) return running;
  running = (async () => {
    let written = 0;
    try {
      const index = await readIndex();
      const docs = currentAppDocs();
      const keep = new Set(docs.map((d) => d.key));
      for (const doc of docs) {
        const hash = hashText(doc.text);
        const prev = index[doc.key];
        if (prev?.hash === hash) continue;
        if (prev) await knowledgeStore.deleteDocument(USER, prev.id).catch(() => false);
        const saved = await knowledgeStore.ingestDocument(USER, {
          title: doc.title,
          text: doc.text,
          sourceType: 'wellness_guide',
          metadata: { source: 'app', key: doc.key },
        });
        index[doc.key] = { id: saved.id, hash };
        written++;
      }
      // Articles or screens that no longer exist.
      for (const key of Object.keys(index)) {
        if (keep.has(key)) continue;
        await knowledgeStore.deleteDocument(USER, index[key].id).catch(() => false);
        delete index[key];
        written++;
      }
      await asyncKeyValueStorage.setItem(INDEX_KEY, JSON.stringify(index));
    } catch {
      // The coach still answers from the screen and the prompt without this.
    }
    return written;
  })().finally(() => {
    running = null;
  });
  return running;
}
