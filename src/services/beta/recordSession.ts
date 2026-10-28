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
  if (session.kind === 'breathing') {
    const quest = s.completePracticeQuest('breathing', Math.round((session.endedAt - session.startedAt) / 1000));
    if (quest) {
      s.showToast({ type: 'success', title: 'Quest complete', message: `${quest.title} · +${quest.xp} XP` });
    }
  }
}
