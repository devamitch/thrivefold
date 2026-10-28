import { supabase } from '../supabase/supabaseClient';
import { useRootStore } from '../../stores/useRootStore';

/**
 * Asks the server whether the signed-in account is a project owner (`tf_is_owner`). Owners see
 * Beta Lab and developer tools in release builds. The owner list is never readable from the app,
 * and a missing session or any error means "not an owner".
 */
export async function refreshOwnerStatus(): Promise<boolean> {
  let owner = false;
  try {
    if (supabase) {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        const { data, error } = await supabase.rpc('tf_is_owner');
        owner = !error && data === true;
      }
    }
  } catch {
    owner = false;
  }
  useRootStore.getState().setIsOwner(owner);
  return owner;
}
