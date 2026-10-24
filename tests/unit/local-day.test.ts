import { formatLocalDate } from '../../src/domain/calendar/universalCalendarEngine';

describe('local day keys', () => {
  const tz = process.env.TZ;
  afterAll(() => {
    process.env.TZ = tz;
  });

  test('India just after midnight is the new local day, not yesterday in UTC', () => {
    process.env.TZ = 'Asia/Kolkata';
    // 00:30 IST on 25 Oct is 19:00 UTC on 24 Oct.
    const d = new Date('2026-10-24T19:00:00Z');
    expect(d.toISOString().slice(0, 10)).toBe('2026-10-24');
    expect(formatLocalDate(d)).toBe('2026-10-25');
  });

  test('month and leap-year boundaries', () => {
    process.env.TZ = 'Asia/Kolkata';
    expect(formatLocalDate(new Date('2028-02-28T20:00:00Z'))).toBe('2028-02-29');
    expect(formatLocalDate(new Date('2026-12-31T19:00:00Z'))).toBe('2027-01-01');
  });
});
