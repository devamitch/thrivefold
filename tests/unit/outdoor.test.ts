import { describeCode, inPolygon, parsePolygon, planWalk, walkScore, type HourForecast, type OfficialAlert } from '../../src/domain/world/outdoor';

const hour = (h: number, o: Partial<HourForecast> = {}): HourForecast => ({
  time: `2026-10-29T${String(h).padStart(2, '0')}:00`, tempC: 26, feelsC: 27, rainChance: 10, uv: 3, code: 1, ...o,
});
const now = new Date('2026-10-29T08:30');

describe('outdoor planning', () => {
  it('scores thunderstorms zero and mild dry hours high', () => {
    expect(walkScore(hour(9, { code: 95 }))).toBe(0);
    expect(walkScore(hour(9))).toBe(100);
    expect(walkScore(hour(13, { feelsC: 38, uv: 9 }))).toBeLessThan(40);
  });

  it('picks the most comfortable upcoming hour and gives tips for now', () => {
    const hours = [hour(8, { rainChance: 70 }), hour(9, { rainChance: 60 }), hour(12, { feelsC: 36, uv: 9 }), hour(17, { feelsC: 28 })];
    const p = planWalk(hours, now, []);
    expect(p.best?.time).toBe('2026-10-29T17:00');
    expect(p.tips.some((t) => /umbrella/.test(t))).toBe(true);
  });

  it('suggests no walk when an active official warning applies, and ignores expired ones', () => {
    const alert: OfficialAlert = { id: 'a', event: 'Heavy Rain', headline: 'x', severity: 'Severe', sender: 'IMD', sentAt: '2026-10-29T06:00:00+05:30', expiresAt: '2026-10-29T12:00:00+05:30', instruction: null };
    expect(planWalk([hour(17)], new Date('2026-10-29T08:30:00+05:30'), [alert]).warned).toBe(true);
    expect(planWalk([hour(17)], new Date('2026-10-29T13:00:00+05:30'), [alert]).warned).toBe(false);
  });

  it('matches a point inside an alert polygon', () => {
    const poly = parsePolygon('22.0,88.0 23.0,88.0 23.0,89.0 22.0,89.0');
    expect(inPolygon([22.57, 88.36], poly)).toBe(true);
    expect(inPolygon([25, 88.36], poly)).toBe(false);
  });

  it('describes WMO codes', () => {
    expect(describeCode(0)).toBe('Clear');
    expect(describeCode(63)).toBe('Rain');
    expect(describeCode(96)).toBe('Thunderstorm');
  });
});
