/**
 * The Learn library beyond the built-in articles: encyclopedia summaries, free books and archive
 * texts from public, keyless APIs, cached in SQLite so it works offline afterwards, and summarised
 * into Thrive RAG so the coach can use what was read.
 *
 * Only topic words are sent (e.g. "sleep hygiene"); never anything about the person.
 * Sources: Wikipedia REST (CC BY-SA), Open Library (book records), Project Gutenberg via Gutendex
 * (public-domain books), Internet Archive (open texts). YouTube is reached through the existing
 * Watch screen, which searches by query.
 */
import { useQuery } from '@tanstack/react-query';
import * as Network from 'expo-network';
import * as SQLite from 'expo-sqlite';

import { hashText } from '../../domain/assistant/appKnowledge';
import { thriveRag } from '../local-ai/rag/thriveRag';

export type LibrarySource = 'wikipedia' | 'openlibrary' | 'gutenberg' | 'archive';

export interface LibraryItem {
  id: string;
  source: LibrarySource;
  topic: string;
  title: string;
  /** Plain-text summary or description, as given by the source. */
  summary: string;
  url: string;
  /** Author or publisher line when the source gives one. */
  byline?: string;
  /** Picture from the source (thumbnail or cover), when there is one. */
  image?: string;
  fetchedAt: number;
}

export const SOURCE_LABEL: Record<LibrarySource, string> = {
  wikipedia: 'Encyclopedia',
  openlibrary: 'Book',
  gutenberg: 'Free e-book',
  archive: 'Archive',
};

const TIMEOUT_MS = 12_000;
// Wikimedia refuses generic HTTP-library user agents; identify the app (no personal data).
const USER_AGENT = 'ThrivefoldApp/1.0 (Android wellbeing app; com.amit.thrivefold)';
const DAY_MS = 24 * 60 * 60 * 1000;

let db: SQLite.SQLiteDatabase | null = null;
function getDb(): SQLite.SQLiteDatabase | null {
  if (db) return db;
  try {
    db = SQLite.openDatabaseSync('thrivefold-local-memory.db');
    db.execSync(`
      CREATE TABLE IF NOT EXISTS learn_library (
        id TEXT PRIMARY KEY NOT NULL,
        source TEXT NOT NULL,
        topic TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        url TEXT NOT NULL,
        byline TEXT,
        image TEXT,
        fetched_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_learn_library_topic ON learn_library(topic);
    `);
    return db;
  } catch {
    return null;
  }
}

async function getJson<T>(url: string): Promise<T | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json', 'User-Agent': USER_AGENT, 'Api-User-Agent': USER_AGENT } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

const q = encodeURIComponent;

// Plain topic words also match bands, songs and films; keep encyclopedia results on health.
const healthScoped = (topic: string) => (/\bhealth|medic|disease|sleep hygiene\b/i.test(topic) ? topic : `${topic} health`);

async function fromWikipedia(topic: string): Promise<Omit<LibraryItem, 'fetchedAt'>[]> {
  const search = await getJson<{ pages?: { key: string }[] }>(
    `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${q(healthScoped(topic))}&limit=4`,
  );
  const keys = (search?.pages ?? []).map((p) => p.key);
  const pages = await Promise.all(
    keys.map((k) =>
      getJson<{ title: string; extract?: string; content_urls?: { mobile?: { page?: string } }; thumbnail?: { source?: string } }>(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${q(k)}`,
      ),
    ),
  );
  return pages
    .filter((p): p is NonNullable<typeof p> => !!p?.extract)
    .map((p) => ({
      id: `wikipedia:${p.title}`,
      source: 'wikipedia' as const,
      topic,
      title: p.title,
      summary: p.extract!,
      url: p.content_urls?.mobile?.page ?? `https://en.wikipedia.org/wiki/${q(p.title)}`,
      byline: 'Wikipedia (CC BY-SA)',
      image: p.thumbnail?.source,
    }));
}

async function fromOpenLibrary(topic: string): Promise<Omit<LibraryItem, 'fetchedAt'>[]> {
  const r = await getJson<{ docs?: { key: string; title: string; author_name?: string[]; first_publish_year?: number; cover_i?: number; subject?: string[] }[] }>(
    `https://openlibrary.org/search.json?q=${q(topic)}&limit=6&fields=key,title,author_name,first_publish_year,cover_i,subject`,
  );
  return (r?.docs ?? []).map((d) => ({
    id: `openlibrary:${d.key}`,
    source: 'openlibrary' as const,
    topic,
    title: d.title,
    summary: [d.first_publish_year ? `First published ${d.first_publish_year}.` : '', d.subject?.length ? `Subjects: ${d.subject.slice(0, 6).join(', ')}.` : '']
      .filter(Boolean)
      .join(' ') || 'Book record from Open Library.',
    url: `https://openlibrary.org${d.key}`,
    byline: d.author_name?.slice(0, 2).join(', '),
    image: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : undefined,
  }));
}

async function fromGutenberg(topic: string): Promise<Omit<LibraryItem, 'fetchedAt'>[]> {
  const r = await getJson<{ results?: { id: number; title: string; authors?: { name: string }[]; summaries?: string[]; subjects?: string[]; formats?: Record<string, string> }[] }>(
    `https://gutendex.com/books?search=${q(topic)}`,
  );
  return (r?.results ?? []).slice(0, 5).map((b) => ({
    id: `gutenberg:${b.id}`,
    source: 'gutenberg' as const,
    topic,
    title: b.title,
    summary: b.summaries?.[0] ?? (b.subjects?.length ? `Subjects: ${b.subjects.slice(0, 5).join(', ')}.` : 'Public-domain e-book.'),
    url: `https://www.gutenberg.org/ebooks/${b.id}`,
    byline: b.authors?.map((a) => a.name).join(', '),
    image: b.formats?.['image/jpeg'],
  }));
}

async function fromArchive(topic: string): Promise<Omit<LibraryItem, 'fetchedAt'>[]> {
  const r = await getJson<{ response?: { docs?: { identifier: string; title: string; creator?: string | string[]; description?: string | string[] }[] } }>(
    `https://archive.org/advancedsearch.php?q=${q(`(${topic}) AND mediatype:texts`)}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=description&rows=5&output=json`,
  );
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  return (r?.response?.docs ?? []).map((d) => ({
    id: `archive:${d.identifier}`,
    source: 'archive' as const,
    topic,
    title: d.title,
    summary: (first(d.description) ?? 'Open text from the Internet Archive.').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 600),
    url: `https://archive.org/details/${d.identifier}`,
    byline: first(d.creator),
    image: `https://archive.org/services/img/${d.identifier}`,
  }));
}

type Row = { id: string; source: LibrarySource; topic: string; title: string; summary: string; url: string; byline: string | null; image: string | null; fetched_at: number };
const fromRow = (r: Row): LibraryItem => ({
  id: r.id,
  source: r.source,
  topic: r.topic,
  title: r.title,
  summary: r.summary,
  url: r.url,
  byline: r.byline ?? undefined,
  image: r.image ?? undefined,
  fetchedAt: r.fetched_at,
});

export const onlineLibrary = {
  /** Cached items, optionally for one topic, newest first. Works offline. */
  cached(topic?: string, limit = 200): LibraryItem[] {
    const d = getDb();
    if (!d) return [];
    try {
      const rows = topic
        ? d.getAllSync<Row>('SELECT * FROM learn_library WHERE topic = ? ORDER BY fetched_at DESC LIMIT ?', [topic, limit])
        : d.getAllSync<Row>('SELECT * FROM learn_library ORDER BY fetched_at DESC LIMIT ?', [limit]);
      return rows.map(fromRow);
    } catch {
      return [];
    }
  },

  /** Fetches a topic from every source (when online), caches it and returns what was found. */
  async fetchTopic(topic: string): Promise<LibraryItem[]> {
    const net = await Network.getNetworkStateAsync().catch(() => null);
    if (!net?.isInternetReachable) return this.cached(topic);
    const parts = await Promise.all([fromWikipedia(topic), fromOpenLibrary(topic), fromGutenberg(topic), fromArchive(topic)]);
    const now = Date.now();
    const items = parts.flat().map((i) => ({ ...i, fetchedAt: now }));
    const d = getDb();
    if (d && items.length) {
      try {
        d.withTransactionSync(() => {
          for (const i of items) {
            d.runSync(
              `INSERT OR REPLACE INTO learn_library (id, source, topic, title, summary, url, byline, image, fetched_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [i.id, i.source, i.topic, i.title, i.summary, i.url, i.byline ?? null, i.image ?? null, i.fetchedAt],
            );
          }
        });
      } catch {
        // Shown this time even if not cached.
      }
    }
    // What was read becomes coach knowledge (summaries only, deduplicated by content).
    const text = items.map((i) => `${i.title} (${SOURCE_LABEL[i.source]}${i.byline ? `, ${i.byline}` : ''}): ${i.summary}`).join('\n\n');
    if (text) {
      void thriveRag
        .rememberDocument(`Library: ${topic}`, [{ page: 1, text }], hashText(text))
        .catch(() => undefined);
    }
    return items.length ? items : this.cached(topic);
  },

  /** Refreshes each topic at most once a day, only when online. Never throws. */
  async refreshDaily(topics: string[]): Promise<number> {
    let n = 0;
    for (const t of topics) {
      const last = this.cached(t, 1)[0]?.fetchedAt ?? 0;
      if (Date.now() - last < DAY_MS) continue;
      const got = await this.fetchTopic(t).catch(() => []);
      n += got.length;
    }
    return n;
  },
};

/** Typed hook: cached items show at once (and offline); a fresh fetch runs at most daily per topic. */
export function useLibraryQuery(topic: string) {
  return useQuery({
    queryKey: ['library', topic],
    queryFn: () => onlineLibrary.fetchTopic(topic),
    initialData: () => {
      const cached = onlineLibrary.cached(topic);
      return cached.length ? cached : undefined;
    },
    initialDataUpdatedAt: () => onlineLibrary.cached(topic, 1)[0]?.fetchedAt,
    staleTime: DAY_MS,
    // Results already live in SQLite; don't also persist them in the query cache.
    meta: { persist: false },
  });
}
