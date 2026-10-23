/**
 * On-device search over the person's own notes (journal entries, kept memories) using
 * BM25 ranking. Runs in memory, never leaves the device, and needs no model download.
 */

export interface RetrievalDocument {
  id: string;
  kind: 'journal' | 'memory';
  title: string;
  text: string;
  date: string; // ISO timestamp or YYYY-MM-DD
}

export interface RetrievalHit {
  doc: RetrievalDocument;
  score: number;
  snippet: string;
  matchedTerms: string[];
}

const STOPWORDS = new Set(
  (
    'a an and are as at be been but by can did do does for from had has have how i if in into is it its ' +
    'me my of on or our so than that the their them then there these they this to too was we were what ' +
    'when where which who why will with you your am about after again all also any because before being ' +
    'both just more most no not now only other over same some such very'
  ).split(' '),
);

/** Light suffix stripping so "sleeping", "sleeps" and "slept" partly meet "sleep". */
export function stem(word: string): string {
  if (word.length <= 4) return word;
  for (const suffix of ['ingly', 'edly', 'ing', 'ness', 'ies', 'ied', 'ed', 'ly', 'es', 's']) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      const base = word.slice(0, -suffix.length);
      if (suffix === 'ies' || suffix === 'ied') return `${base}y`;
      return base;
    }
  }
  return word;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

const K1 = 1.2;
const B = 0.75;

/** Ranks documents for a free-text query. Returns [] for an empty or stopword-only query. */
export function searchDocuments(
  docs: RetrievalDocument[],
  query: string,
  limit = 5,
): RetrievalHit[] {
  const queryTerms = [...new Set(tokenize(query))];
  if (queryTerms.length === 0 || docs.length === 0) return [];

  const tokenized = docs.map((d) => tokenize(`${d.title} ${d.title} ${d.text}`));
  const avgLen = tokenized.reduce((a, t) => a + t.length, 0) / docs.length || 1;

  const docFreq = new Map<string, number>();
  for (const tokens of tokenized) {
    for (const term of new Set(tokens)) docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
  }

  const hits: RetrievalHit[] = [];
  docs.forEach((doc, i) => {
    const tokens = tokenized[i];
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

    let score = 0;
    const matched: string[] = [];
    for (const term of queryTerms) {
      const f = tf.get(term);
      if (!f) continue;
      matched.push(term);
      const df = docFreq.get(term) ?? 0;
      const idf = Math.log(1 + (docs.length - df + 0.5) / (df + 0.5));
      score += (idf * f * (K1 + 1)) / (f + K1 * (1 - B + (B * tokens.length) / avgLen));
    }
    if (score > 0) {
      hits.push({ doc, score, matchedTerms: matched, snippet: makeSnippet(doc.text, matched) });
    }
  });

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** About 140 characters of text around the first matching word. */
export function makeSnippet(text: string, stems: string[], width = 140): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= width) return clean;
  const words = clean.split(' ');
  let offset = 0;
  let at = -1;
  for (const w of words) {
    const s = stem(w.toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (stems.includes(s)) {
      at = offset;
      break;
    }
    offset += w.length + 1;
  }
  if (at < 0) return `${clean.slice(0, width).trimEnd()}…`;
  const start = Math.max(0, at - Math.floor(width / 3));
  const end = Math.min(clean.length, start + width);
  return `${start > 0 ? '…' : ''}${clean.slice(start, end).trim()}${end < clean.length ? '…' : ''}`;
}
