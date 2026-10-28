import { redirectSystemPath } from '../../src/app/+native-intent';

describe('retired ecosystem deep links', () => {
  it.each([
    'thrivefold://unified-vault?client_app=x&callback_url=evil://steal&payload=abc',
    'thrivefold://unified-vault/callback?status=authorized&payload=abc',
    'thrivefold://auth/callback?code=1',
    '/sso?app_id=x',
    'unified-vault',
  ])('sends %s to Home without reading it', (path) => {
    expect(redirectSystemPath({ path, initial: true })).toBe('/');
  });

  it('leaves normal app links alone', () => {
    expect(redirectSystemPath({ path: '/health/meal-log', initial: false })).toBe('/health/meal-log');
    expect(redirectSystemPath({ path: 'thrivefold://health/coach/home_beginner', initial: true })).toBe(
      'thrivefold://health/coach/home_beginner',
    );
  });
});
