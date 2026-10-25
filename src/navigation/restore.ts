/**
 * Which screen to reopen after the app was closed or killed (V3 §5). Only real app areas,
 * never auth, onboarding or dev screens, and only if the visit was recent. Opening a screen
 * replays nothing: Coach opens on its intro, forms open empty, no action is re-run.
 */
const RESTORABLE = new Set([
  'today', 'progress', 'settings', 'health', 'train', 'calendar', 'check-in', 'quests', 'games',
  'journal', 'learn', 'roadmap', 'personalize', 'safety', 'you', 'ai', 'circles', 'letters',
  'dating', 'organizations',
]);
export const RESTORE_WINDOW_MS = 12 * 60 * 60 * 1000;

export function restorableRoute(route: string | null | undefined, savedAt: string | null | undefined, now = Date.now()): string | null {
  if (!route || !route.startsWith('/') || route.includes('..')) return null;
  if (!savedAt || now - new Date(savedAt).getTime() > RESTORE_WINDOW_MS) return null;
  const clean = route.replace(/\/\([^)]+\)/g, '').split('?')[0];
  const first = clean.split('/').filter(Boolean)[0];
  if (!first || !RESTORABLE.has(first)) return null;
  return clean;
}
