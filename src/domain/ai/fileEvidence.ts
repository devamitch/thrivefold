/**
 * The lines of a saved file that best answer a question, with the page they are on. Pure and
 * deterministic, so a document answer can always quote the file instead of trusting a small
 * model's memory.
 */
import { tokenize } from './localRetrieval';

export interface FileLine {
  file: string;
  page: number;
  line: string;
  score: number;
}

const MARKER = /^\[(.+), page (\d+)\]$/;

/** Splits text stored as "[name, page N]\n…" into scored lines for the query. */
export function scoreFileLines(file: string, stored: string, query: string, ignore: Set<string> = new Set()): FileLine[] {
  const terms = new Set(tokenize(query).filter((t) => !ignore.has(t)));
  if (!terms.size) return [];
  let page = 1;
  const out: FileLine[] = [];
  for (const raw of stored.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(MARKER);
    if (m) {
      page = Number(m[2]);
      continue;
    }
    const words = new Set(tokenize(line));
    let score = 0;
    terms.forEach((t) => {
      if (words.has(t)) score++;
    });
    if (score) out.push({ file, page, line, score });
  }
  return out.sort((a, b) => b.score - a.score);
}

/**
 * Best lines across files. A question mentioning a file's own words ("blood report") counts as
 * asking about that file, so one strong line (2+ shared words) is enough.
 */
export function bestFileLines(files: { name: string; text: string }[], query: string, max = 3): FileLine[] {
  const queryTerms = new Set(tokenize(query));
  const all = files.flatMap((f) => {
    // Words that only name the file ("blood report") pick the file, not the line inside it.
    const nameWords = new Set(tokenize(f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]/g, ' ')));
    const nameHit = [...nameWords].some((t) => queryTerms.has(t));
    return scoreFileLines(f.name, f.text, query, nameHit ? nameWords : undefined).map((l) => ({
      ...l,
      score: l.score + (nameHit ? 1 : 0),
    }));
  });
  const strong = all.filter((l) => l.score >= 2).sort((a, b) => b.score - a.score);
  // Only lines as good as the best one: weaker lines (a title, a name) add noise, not evidence.
  return strong.filter((l) => l.score >= (strong[0]?.score ?? 0)).slice(0, max);
}
