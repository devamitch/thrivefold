import { useQuery } from '@tanstack/react-query';

import { queryClient } from './queryClient';
import { supabase } from './supabaseClient';

export const queryKeys = {
  serverProgress: ['server', 'progress'] as const,
};

export interface ServerProgress {
  xp: number;
  diamonds: number;
  level: number;
}

/**
 * XP, diamonds and level as the server has confirmed them for the signed-in account. Null
 * without a backend or session; cached on the phone between launches.
 */
export function useServerProgress(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.serverProgress,
    enabled: enabled && Boolean(supabase),
    queryFn: async (): Promise<ServerProgress | null> => {
      if (!supabase) return null;
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return null;
      const { data, error } = await supabase.rpc('tf_my_progress');
      if (error) throw error;
      return data as ServerProgress;
    },
  });
}

/** Called after queued rewards reach the server, so the confirmed numbers refresh. */
export const invalidateServerProgress = () => queryClient.invalidateQueries({ queryKey: queryKeys.serverProgress });
