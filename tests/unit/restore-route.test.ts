import { restorableRoute, RESTORE_WINDOW_MS } from '../../src/navigation/restore';

const now = Date.parse('2026-10-26T10:00:00Z');
const recent = new Date(now - 60_000).toISOString();

describe('restoring the last screen', () => {
  it('reopens a recent screen in an app area', () => {
    expect(restorableRoute('/health/sleep', recent, now)).toBe('/health/sleep');
    expect(restorableRoute('/(app)/(tabs)/progress', recent, now)).toBe('/progress');
    expect(restorableRoute('/health/coach/desk_reset', recent, now)).toBe('/health/coach/desk_reset');
  });
  it('never reopens auth, onboarding, dev or unknown screens', () => {
    for (const r of ['/sign-in', '/choose-experience', '/dev', '/', '/legal/terms', '/../etc']) {
      expect(restorableRoute(r, recent, now)).toBeNull();
    }
  });
  it('ignores stale visits and missing timestamps', () => {
    expect(restorableRoute('/health/sleep', new Date(now - RESTORE_WINDOW_MS - 1).toISOString(), now)).toBeNull();
    expect(restorableRoute('/health/sleep', null, now)).toBeNull();
  });
  it('drops query strings', () => {
    expect(restorableRoute('/letters/compose?to=abc', recent, now)).toBe('/letters/compose');
  });
});
