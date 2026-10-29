/**
 * Search journal entries by meaning, on the phone (MediaPipe Text Embedder, Universal Sentence
 * Encoder). Embeddings are cached in memory per entry for this session and never stored or sent.
 */
import { MediaPipeTools, cosine } from '../../../modules/pose-landmarker/tools';
import type { JournalEntry } from '../../stores/slices/healthSlice';

const cache = new Map<string, number[]>();

export const semanticSearchAvailable = () => !!MediaPipeTools;

export async function searchJournal(query: string, entries: JournalEntry[], limit = 5): Promise<{ entry: JournalEntry; score: number }[]> {
  if (!MediaPipeTools || !query.trim() || entries.length === 0) return [];
  const missing = entries.filter((e) => !cache.has(e.id));
  if (missing.length) {
    const vecs = await MediaPipeTools.embedText(missing.map((e) => `${e.title}. ${e.content}`));
    missing.forEach((e, i) => cache.set(e.id, vecs[i]));
  }
  const [q] = await MediaPipeTools.embedText([query.trim()]);
  return entries
    .map((entry) => ({ entry, score: cosine(q, cache.get(entry.id) ?? []) }))
    .filter((r) => r.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Overall tone of a text (positive / negative), from the on-device text classifier. */
export async function toneOf(text: string): Promise<'positive' | 'negative' | null> {
  if (!MediaPipeTools || text.trim().length < 12) return null;
  try {
    const cats = await MediaPipeTools.classifyText(text);
    const top = [...cats].sort((a, b) => b.score - a.score)[0];
    if (!top || top.score < 0.65) return null;
    return /pos/i.test(top.label) || top.label === '1' ? 'positive' : 'negative';
  } catch {
    return null;
  }
}
