import { formQualifies, workoutRewardXp, workoutRewardsOn, type LedgerEntry } from '../../src/domain/game/progression';

test('good camera-checked form earns ten times the base', () => {
  expect(workoutRewardXp(null)).toBe(5);
  expect(workoutRewardXp({ validFrames: 200, formScore: 0.85 })).toBe(50);
  expect(workoutRewardXp({ validFrames: 200, formScore: 0.6 })).toBe(5);
  expect(formQualifies({ validFrames: 5, formScore: 1 })).toBe(false);
});

test('workout rewards are counted per game date', () => {
  const e = (key: string, gameDate: string): LedgerEntry => ({
    key, kind: 'workout_reward', xp: 5, diamonds: 0, taskPoints: 0, gameDate, sourceId: key, policyVersion: 't', createdAt: '',
  });
  expect(workoutRewardsOn([e('a', '2026-10-25'), e('b', '2026-10-25'), e('c', '2026-10-24')], '2026-10-25')).toBe(2);
});
