/**
 * The person's points, level and streaks on the Thrivefold server (thrivefold_progress,
 * owner-only), so a reinstall or a new phone keeps them. The reward ledger is the source of
 * truth: entries have unique keys, so merging two copies never counts anything twice.
 */
import type { LedgerEntry } from '../../domain/game/progression';
import { useRootStore } from '../../stores/useRootStore';
import { supabase } from '../supabase/supabaseClient';

async function userId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** Takes server entries this phone lacks, then saves the merged copy. Silent for guests or offline. */
export async function syncProgress(): Promise<boolean> {
  const id = await userId();
  const s = useRootStore.getState();
  if (!supabase || !id || !s.user || s.user.isGuest) return false;
  const { data, error } = await supabase
    .from('thrivefold_progress')
    .select('ledger, completed_checkpoints, achievements')
    .eq('user_id', id)
    .maybeSingle();
  if (error) {
    console.warn('progress pull failed', error.code, error.message);
    return false;
  }
  if (data) {
    const row = data as {
      ledger: LedgerEntry[] | null;
      completed_checkpoints: string[] | null;
      achievements: string[] | null;
    };
    useRootStore
      .getState()
      .mergeRemoteProgress(row.ledger ?? [], row.completed_checkpoints ?? [], row.achievements ?? []);
  }
  return pushProgress(id);
}

async function pushProgress(id: string): Promise<boolean> {
  if (!supabase) return false;
  const s = useRootStore.getState();
  const { error } = await supabase.from('thrivefold_progress').upsert(
    {
      user_id: id,
      xp: Math.min(10_000_000, Math.max(0, Math.round(s.xp))),
      level: Math.min(1000, Math.max(1, s.level)),
      diamonds: Math.min(1_000_000, Math.max(0, s.diamonds)),
      streak: Math.min(10_000, Math.max(0, s.streak)),
      quests_completed: s.questsCompleted,
      achievements: s.achievements.slice(0, 500),
      ledger: s.rewardLedger.slice(-20_000),
      completed_checkpoints: s.completedCheckpoints.slice(0, 500),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (error) {
    console.warn('progress push failed', error.code, error.message);
    return false;
  }
  return true;
}
