/**
 * Official disaster and weather alerts for India from NDMA SACHET (Common Alerting Protocol).
 * Feed: https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml (public domain).
 * Each recent alert's polygon is checked against the person's chosen place; matching alerts
 * that have not expired are returned with their sender, times and instruction. Cached 20 minutes.
 */
import { inPolygon, parsePolygon, type OfficialAlert } from '../../domain/world/outdoor';
import { getText } from './http';

const FEED = 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml';
const CAP = 'https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=';
const POLY = 'https://sachet.ndma.gov.in/cap_public_website/FetchPolygonXMLFile?identifier=';
const MAX_CHECK = 40;
const FRESH_MS = 20 * 60_000;

const tag = (xml: string, name: string): string | null => {
  const m = xml.match(new RegExp(`<(?:cap:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:cap:)?${name}>`));
  return m ? m[1].trim() : null;
};
const tags = (xml: string, name: string): string[] =>
  [...xml.matchAll(new RegExp(`<(?:cap:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:cap:)?${name}>`, 'g'))].map((m) => m[1].trim());

const SEVERITIES = ['Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown'] as const;

/** Items from the national feed: numeric id and publish time. */
export function parseFeed(xml: string): { id: string; pubDate: number }[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map((m) => ({ id: tag(m[1], 'guid') ?? '', pubDate: Date.parse(tag(m[1], 'pubDate') ?? '') }))
    .filter((i) => /^\d+$/.test(i.id) && Number.isFinite(i.pubDate));
}

/** The English info block of a CAP alert (or the first one); null for tests and drills. */
export function parseCap(id: string, xml: string): OfficialAlert | null {
  const infos = tags(xml, 'info');
  const info = infos.find((i) => /^en/i.test(tag(i, 'language') ?? '')) ?? infos[0];
  if (!info || tag(xml, 'status') !== 'Actual') return null;
  const sev = tag(info, 'severity') ?? 'Unknown';
  return {
    id,
    event: tag(info, 'event') ?? 'Alert',
    headline: tag(info, 'headline') ?? '',
    severity: (SEVERITIES as readonly string[]).includes(sev) ? (sev as OfficialAlert['severity']) : 'Unknown',
    sender: tag(xml, 'sender') ?? 'NDMA SACHET',
    sentAt: tag(xml, 'sent') ?? '',
    expiresAt: tag(info, 'expires'),
    instruction: tag(info, 'instruction') || null,
  };
}

/** Keeps the newest alert per sender and event (updates of one alert), most severe first. */
export function dedupeAlerts(found: OfficialAlert[]): OfficialAlert[] {
  const byKey = new Map<string, OfficialAlert>();
  for (const a of found) {
    const k = `${a.sender}|${a.event}`;
    const prev = byKey.get(k);
    if (!prev || Date.parse(a.sentAt) > Date.parse(prev.sentAt)) byKey.set(k, a);
  }
  return [...byKey.values()].sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity));
}

let cached: { key: string; at: number; alerts: OfficialAlert[] } | null = null;

export async function alertsFor(lat: number, lon: number): Promise<OfficialAlert[]> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  if (cached && cached.key === key && Date.now() - cached.at < FRESH_MS) return cached.alerts;
  const items = parseFeed(await getText(FEED, 15_000))
    .filter((i) => Date.now() - i.pubDate < 24 * 3_600_000)
    .sort((a, b) => b.pubDate - a.pubDate)
    .slice(0, MAX_CHECK);

  const found: OfficialAlert[] = [];
  // A few at a time, so a slow connection is not flooded.
  for (let i = 0; i < items.length; i += 6) {
    const batch = await Promise.all(
      items.slice(i, i + 6).map(async ({ id }) => {
        try {
          const polys = tags(await getText(POLY + id), 'polygon').map(parsePolygon);
          if (!polys.some((p) => p.length >= 3 && inPolygon([lat, lon], p))) return null;
          const alert = parseCap(id, await getText(CAP + id));
          if (!alert || (alert.expiresAt && Date.parse(alert.expiresAt) < Date.now())) return null;
          return alert;
        } catch {
          return null;
        }
      }),
    );
    for (const a of batch) if (a) found.push(a);
  }
  const alerts = dedupeAlerts(found);
  cached = { key, at: Date.now(), alerts };
  return alerts;
}
