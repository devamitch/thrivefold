import { fillEmpty, usable } from '../../src/domain/ecosystem/anvayVault';

describe('Anvay Vault merge', () => {
  const at = '2026-10-28T10:00:00.000Z';

  it('fills empty fields only and never overwrites existing values', () => {
    const { merged, filled } = fillEmpty(
      { display_name: 'Asha', locale: null },
      { display_name: 'Someone else', locale: 'en-IN', time_zone: 'Asia/Kolkata' },
      'com.amit.neev',
      at,
    );
    expect(merged.display_name).toBe('Asha');
    expect(merged.locale).toBe('en-IN');
    expect(merged.time_zone).toBe('Asia/Kolkata');
    expect(filled).toEqual(['locale', 'time_zone']);
    expect(merged.sources?.locale).toEqual({ app: 'com.amit.neev', at });
  });

  it('treats placeholder names as empty and never copies them', () => {
    expect(usable('display_name', 'Guest')).toBeNull();
    const { merged } = fillEmpty({ display_name: 'Guest' }, { display_name: 'Ravi' }, 'x', at);
    expect(merged.display_name).toBe('Ravi');
    expect(fillEmpty({}, { display_name: 'Friend' }, 'x', at).filled).toEqual([]);
  });

  it('keeps the original source of a value when it is passed on', () => {
    const { merged } = fillEmpty(
      {},
      { locale: 'hi-IN', sources: { locale: { app: 'com.amit.setu', at: '2026-01-01T00:00:00Z' } } },
      'com.amit.thrivefold',
      at,
    );
    expect(merged.sources?.locale?.app).toBe('com.amit.setu');
  });

  it('rejects malformed values', () => {
    expect(usable('photo_url', 'javascript:alert(1)')).toBeNull();
    expect(usable('photo_url', 'http://insecure.example/a.png')).toBeNull();
    expect(usable('locale', 'x'.repeat(30))).toBeNull();
  });
});
