/**
 * Rewrites incoming system links before Expo Router resolves them.
 *
 * The earlier AnvayKosh handoff links (`thrivefold://unified-vault…`, `…/auth/callback…`,
 * `…/sso…`) carried profile data in the URL and are no longer accepted: any app or web page could
 * send one. They now open Home, and their query string is dropped unread. A future Anvay ID flow
 * must use OAuth authorization code + PKCE over verified App Links, never data in the URL.
 */
const RETIRED_ECOSYSTEM_PATHS = /^\/?(unified-vault|auth\/callback|sso)(\/|\?|$)/i;

export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    // thrivefold://unified-vault puts the first segment where a host would be; https links do not.
    const afterScheme = path.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
    const afterHost = afterScheme.replace(/^[^/?]*/, '');
    if ([path, afterScheme, afterHost].some((p) => RETIRED_ECOSYSTEM_PATHS.test(p))) return '/';
    return path;
  } catch {
    return '/';
  }
}
