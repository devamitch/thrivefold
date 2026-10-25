import fs from 'fs';
import path from 'path';

import {
  MAX_WORLDVIEWS,
  normaliseWorldviewProfile,
  observanceSetsFor,
  PREFER_NOT_TO_SAY,
  searchWorldviews,
  WORLDVIEWS,
  worldviewExportRows,
  worldviewFullLabel,
  worldviewLabel,
  getWorldview,
} from '../../src/domain/identity/worldview';

const ids = new Set(WORLDVIEWS.map((w) => w.id));

describe('worldview taxonomy coverage (V3 §6)', () => {
  it('covers the traditions the spec names', () => {
    for (const id of ['christianity', 'islam', 'hinduism', 'buddhism', 'jainism', 'sikhism', 'zoroastrianism', 'zoroastrianism.parsi', 'judaism', 'indigenous', 'bahai']) {
      expect(ids.has(id)).toBe(true);
    }
  });
  it('includes secular and non-religious identities', () => {
    for (const id of ['atheist', 'agnostic', 'humanist', 'none', 'spiritual']) expect(ids.has(id)).toBe(true);
  });
  it('treats communism and other ideologies as worldviews, never religions', () => {
    expect(getWorldview('ideology.communism')?.category).toBe('ideology');
    expect(WORLDVIEWS.filter((w) => w.category === 'religion').some((w) => /commun|marx|social/i.test(w.labels.en))).toBe(false);
  });
  it('has unique ids and valid parents', () => {
    expect(ids.size).toBe(WORLDVIEWS.length);
    for (const w of WORLDVIEWS) if (w.parentId) expect(ids.has(w.parentId)).toBe(true);
  });
});

describe('search and aliases', () => {
  it.each([
    ['Muslim', 'islam'],
    ['Sanatan', 'hinduism'],
    ['parsee', 'zoroastrianism.parsi'],
    ['Bahai', 'bahai'],
    ['ISKCON', 'hinduism.vaishnava'],
    ['सिख', 'sikhism'],
    ['Adivasi', 'indigenous'],
    ['candomble', 'indigenous.afro_diasporic'],
  ])('"%s" finds %s', (q, id) => {
    expect(searchWorldviews(q).map((w) => w.id)).toContain(id);
  });
  it('returns nothing for an empty query', () => {
    expect(searchWorldviews('  ')).toEqual([]);
  });
});

describe('labels and translation fallback', () => {
  it('uses the locale label when present, else English', () => {
    expect(worldviewLabel('islam', 'hi-IN')).toBe('इस्लाम');
    expect(worldviewLabel('islam', 'fr-FR')).toBe('Islam');
  });
  it('shows children with their parent', () => {
    expect(worldviewFullLabel('islam.sunni')).toBe('Sunni (Islam)');
  });
  it('keeps unknown or future ids visible instead of dropping them', () => {
    expect(worldviewLabel('future.tradition')).toBe('Unlisted (future.tradition)');
    expect(normaliseWorldviewProfile({ ids: ['future.tradition'] }).ids).toEqual(['future.tradition']);
  });
});

describe('the person controls their own choice', () => {
  it('allows several identities up to the limit, without duplicates', () => {
    const p = normaliseWorldviewProfile({ ids: ['hinduism', 'humanist', 'hinduism', 'buddhism', 'judaism'] });
    expect(p.ids).toEqual(['hinduism', 'humanist', 'buddhism']);
    expect(p.ids.length).toBe(MAX_WORLDVIEWS);
  });
  it('"prefer not to say" stands alone and turns reminders off', () => {
    const p = normaliseWorldviewProfile({ ids: ['islam', PREFER_NOT_TO_SAY], selfDescribed: 'x', observanceReminders: true });
    expect(p.ids).toEqual([PREFER_NOT_TO_SAY]);
    expect(p.selfDescribed).toBeNull();
    expect(p.observanceReminders).toBe(false);
  });
  it('self-description is trimmed plain text', () => {
    const p = normaliseWorldviewProfile({ ids: [], selfDescribed: '  <b>Quaker-ish</b>\n seeker  ' });
    expect(p.selfDescribed).toBe('bQuaker-ish/b seeker');
  });
  it('observance reminders come only from explicit choices', () => {
    expect(observanceSetsFor(null)).toEqual([]);
    expect(observanceSetsFor(normaliseWorldviewProfile({ ids: ['islam.shia'], observanceReminders: false }))).toEqual([]);
    expect(observanceSetsFor(normaliseWorldviewProfile({ ids: ['islam.shia', 'zoroastrianism.parsi'], observanceReminders: true }))).toEqual(['islam', 'parsi']);
  });
  it('is included in the export', () => {
    const rows = worldviewExportRows(normaliseWorldviewProfile({ ids: ['sikhism'], selfDescribed: 'Sahajdhari' }));
    expect(rows.find((r) => r.label === 'Beliefs and culture')?.value).toBe('Sikhism');
    expect(rows.find((r) => r.label === 'In my own words')?.value).toBe('Sahajdhari');
  });
});

describe('no inference, no use for access', () => {
  const root = path.join(__dirname, '../../src');
  const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
  it('the taxonomy exports no inference function', () => {
    const src = read('domain/identity/worldview.ts');
    expect(/export function (infer|detect|guess|predict|classify)/i.test(src)).toBe(false);
  });
  it('eligibility, dating, letters and policy code never read the worldview profile', () => {
    for (const f of ['domain/policy/engine.ts', 'navigation/eligibility.ts', 'services/supabase/dating.ts', 'services/supabase/letters.ts', 'services/supabase/ageCheck.ts']) {
      expect(read(f)).not.toMatch(/worldview/i);
    }
  });
  it('the profile is never sent to the server or analytics', () => {
    for (const f of ['services/supabase/ageCheck.ts', 'services/telemetry/analyticsService.ts', 'services/telemetry/firebaseAnalytics.ts']) {
      expect(read(f)).not.toMatch(/worldview/i);
    }
  });
});
