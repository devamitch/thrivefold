import fs from 'fs';
import path from 'path';

import { DRAWER_SECTIONS } from '../../src/navigation/drawerItems';

const APP = path.join(__dirname, '../../src/app');

/** True when an Expo Router path resolves to a screen file (index or named). */
function resolves(route: string): boolean {
  const rel = route.replace(/^\//, '');
  const candidates = [`${rel}.tsx`, `${rel}/index.tsx`];
  return candidates.some((c) => fs.existsSync(path.join(APP, c)));
}

test('every drawer item opens a real screen', () => {
  const missing = DRAWER_SECTIONS.flatMap((s) => s.items).filter((i) => !resolves(i.route)).map((i) => i.route);
  expect(missing).toEqual([]);
});

test('cycle is only offered to the women\'s health experience; groups open at level 6', () => {
  const items = DRAWER_SECTIONS.flatMap((s) => s.items);
  expect(items.find((i) => i.label === 'Cycle')?.only).toEqual(['women_health']);
  items.filter((i) => ['Circles', 'Organizations'].includes(i.label)).forEach((i) => expect(i.minLevel).toBe(6));
  // Social entries exist but stay hidden until the person opts into the social path.
  expect(items.find((i) => i.label === 'Letters')?.social).toBe(true);
  expect(items.some((i) => i.label === 'Train')).toBe(true);
});

test('correspondence needs an open social path and a real age check', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { canUseCorrespondence } = require('../../src/navigation/eligibility');
  const user = (isAgeVerified: boolean) => ({ isAgeVerified }) as never;
  expect(canUseCorrespondence({ isSocialPathRevealed: true, user: user(false) })).toBe(false);
  expect(canUseCorrespondence({ isSocialPathRevealed: false, user: user(true) })).toBe(false);
  expect(canUseCorrespondence({ isSocialPathRevealed: true, user: null })).toBe(false);
  expect(canUseCorrespondence({ isSocialPathRevealed: true, user: user(true) })).toBe(true);
});
