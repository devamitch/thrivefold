/**
 * Keeps the coach's local knowledge current: every screen, every Learn article, a summary of the
 * person's last week and the coach conversation go into Thrive RAG, where hybrid retrieval
 * (keywords plus vectors) finds them. Only changed documents are replaced; nothing leaves the phone.
 */
import { ARTICLES } from '../../content/learn';
import { chatDoc, hashText, learnDocs, recentDaysDoc, screensDoc, type KnowledgeDoc } from '../../domain/assistant/appKnowledge';
import { DESTINATIONS } from '../../domain/search/destinations';
import { useRootStore } from '../../stores/useRootStore';
import { thriveRag } from '../local-ai/rag/thriveRag';

let running: Promise<number> | null = null;

/** All documents the app provides right now. */
export function currentAppDocs(now = new Date()): KnowledgeDoc[] {
  const s = useRootStore.getState();
  return [screensDoc(DESTINATIONS), ...learnDocs(ARTICLES), recentDaysDoc(s, now), chatDoc(s.coachTurns)];
}

/**
 * Replaces changed documents and returns how many were written. Starts only once the person has
 * finished onboarding (there is nothing of theirs to know before). Never throws.
 */
export function refreshAppKnowledge(): Promise<number> {
  if (!useRootStore.getState().isOnboarded) return Promise.resolve(0);
  if (running) return running;
  running = thriveRag
    .sync(currentAppDocs().map((d) => ({ ...d, hash: hashText(d.text) })))
    .catch(() => 0)
    .finally(() => {
      running = null;
    });
  return running;
}
