/**
 * Restoring a Thrivefold backup into this phone without losing anything already here: empty
 * fields are filled from the backup, lists gain the backup's items they lack (matched by id, key
 * or date), and populated values on this phone are never overwritten.
 */

/** Values worked out from other records (points, level, today's quests); never restored directly. */
const DERIVED = new Set([
  'xp',
  'level',
  'diamonds',
  'streak',
  'questsCompleted',
  'todayQuests',
  'dailyPoints',
  'dailyGoalReached',
  'achievementModal',
  'rewardLedger',
  'completedCheckpoints',
  'achievements',
  'toasts',
  'alert',
]);

const isEmpty = (v: unknown) =>
  v === null ||
  v === undefined ||
  v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 0);

const identity = (item: unknown): string => {
  if (item && typeof item === 'object') {
    const o = item as Record<string, unknown>;
    for (const k of ['id', 'key', 'assignmentId', 'date'])
      if (typeof o[k] === 'string' || typeof o[k] === 'number') return `${k}:${o[k]}`;
  }
  return JSON.stringify(item);
};

/** The patch to apply to the store, and how many fields it touched. */
export function mergeBackup(
  local: Record<string, unknown>,
  backup: Record<string, unknown>,
): { patch: Record<string, unknown>; changed: string[] } {
  const patch: Record<string, unknown> = {};
  const changed: string[] = [];
  for (const [key, value] of Object.entries(backup)) {
    if (DERIVED.has(key) || typeof local[key] === 'function' || isEmpty(value)) continue;
    const mine = local[key];
    if (isEmpty(mine)) {
      if (
        mine !== undefined &&
        mine !== null &&
        (typeof mine !== typeof value || Array.isArray(mine) !== Array.isArray(value))
      )
        continue;
      patch[key] = value;
      changed.push(key);
    } else if (Array.isArray(mine) && Array.isArray(value)) {
      const have = new Set(mine.map(identity));
      const extra = value.filter((v) => !have.has(identity(v)));
      if (extra.length) {
        patch[key] = [...mine, ...extra];
        changed.push(key);
      }
    }
  }
  return { patch, changed };
}
