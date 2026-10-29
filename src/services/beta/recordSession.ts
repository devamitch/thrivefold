import { useRootStore } from '../../stores/useRootStore';
import type { BetaSession } from '../../stores/slices/appSlice';

/**
 * Saves a finished beta session and lets it count where its real result qualifies: a timed
 * breathing session of a minute or more completes today's guided-exercise quest. Measurements
 * from camera studios stay in their own history and never change stable health metrics.
 */
export function recordBetaSession(session: Omit<BetaSession, 'id'>): void {
  const s = useRootStore.getState();
  s.addBetaSession(session);
  // Real points for real practice: a score bonus where the session has a score.
  const m = session.metrics;
  const bonus = m.score !== undefined ? m.score / 10 : m.reps !== undefined ? m.reps / 2 : m.seconds !== undefined ? m.seconds / 3 : m.minutes ?? 0;
  const reward = s.claimPracticeReward(`${session.kind}-${session.endedAt}`, bonus);
  if (reward.awarded) s.showToast({ type: 'success', title: `+${reward.xp} XP`, message: 'Practice counted toward today' });
  if (session.kind === 'breathing') {
    const quest = s.completePracticeQuest('breathing', Math.round((session.endedAt - session.startedAt) / 1000));
    if (quest) {
      s.showToast({ type: 'success', title: 'Quest complete', message: `${quest.title} · +${quest.xp} XP` });
    }
  }
}
