import { readFileSync } from 'fs';
import { join } from 'path';

import { dedupeAlerts, parseCap, parseFeed } from '../../src/services/world/officialAlerts';

// Real responses saved from NDMA SACHET on 2026-10-29.
const fixture = (f: string) => readFileSync(join(__dirname, '../fixtures/sachet', f), 'utf8');

describe('SACHET parsing', () => {
  it('reads item ids and publish times from the national feed', () => {
    const items = parseFeed(fixture('feed-head.xml') + '</channel></rss>');
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].id).toMatch(/^\d+$/);
    expect(Number.isFinite(items[0].pubDate)).toBe(true);
  });

  it('reads the English block of a real CAP alert', () => {
    const a = parseCap('1793224339126009', fixture('cap.xml'))!;
    expect(a.event).toBe('Thunderstorm with Lightning');
    expect(a.severity).toBe('Moderate');
    expect(a.sender).toBe('Uttarakhand-SDMA');
    expect(a.expiresAt).toBe('2026-10-29T06:12:00+05:30');
    expect(a.headline).toMatch(/Dehradun/);
  });

  it('keeps the newest update of an alert and orders by severity', () => {
    const base = { id: '1', event: 'Rain', headline: '', sender: 'IMD', expiresAt: null, instruction: null };
    const out = dedupeAlerts([
      { ...base, severity: 'Minor', sentAt: '2026-10-29T01:00:00Z' },
      { ...base, id: '2', severity: 'Moderate', sentAt: '2026-10-29T02:00:00Z' },
      { ...base, id: '3', event: 'Flood', severity: 'Severe', sentAt: '2026-10-29T01:00:00Z' },
    ]);
    expect(out.map((a) => a.id)).toEqual(['3', '2']);
  });
});
