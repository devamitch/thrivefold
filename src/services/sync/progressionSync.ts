/**
 * Mirrors on-device rewards to the server when an account is signed in. The server reads the
 * reward from its own catalog table (tf_claim_task_reward) and applies its own limits, so a
 * modified client cannot grant itself more. Items stay queued while offline and are retried;
 * items the server rejects for good are dropped from the queue.
 */
import { supabase } from '../supabase/supabaseClient';
import { useRootStore } from '../../stores/useRootStore';

const PERMANENT = /unknown task|unknown setup step|workout limit reached|stale game date|limit reached|account restricted|UNKNOWN_FEATURE|OWNED/i;

let flushing = false;

export async function flushProgressionSync(): Promise<{ sent: number; pending: number }> {
  const { pendingSync, resolveSync } = useRootStore.getState();
  if (!supabase || flushing || pendingSync.length === 0) return { sent: 0, pending: pendingSync.length };
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { sent: 0, pending: pendingSync.length };

  flushing = true;
  let sent = 0;
  try {
    for (const item of pendingSync) {
      const { data: result, error } =
        item.kind === 'claim'
          ? await supabase.rpc('tf_claim_task_reward', {
              p_assignment_key: item.assignmentId,
              p_task_id: item.taskId,
              p_game_date: item.gameDate,
            })
          : item.kind === 'setup'
            ? await supabase.rpc('tf_claim_setup_reward', { p_section: item.section })
            : item.kind === 'workout'
              ? await supabase.rpc('tf_claim_workout_reward', {
                  p_session_key: item.sessionId,
                  p_game_date: item.gameDate,
                  p_valid_frames: item.validFrames,
                  p_form_score: item.formScore,
                })
              : await supabase.rpc('tf_unlock_feature', { p_feature_id: item.featureId });
      const message = error?.message ?? (result && result.ok === false ? String(result.block) : '');
      if (!error && !(result && result.ok === false)) {
        resolveSync(item.key);
        sent += 1;
      } else if (PERMANENT.test(message)) {
        resolveSync(item.key);
      } else {
        break; // network or server trouble: keep the rest queued, in order
      }
    }
  } finally {
    flushing = false;
  }
  return { sent, pending: useRootStore.getState().pendingSync.length };
}
