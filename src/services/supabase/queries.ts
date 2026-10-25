import { useMutation, useQuery } from '@tanstack/react-query';

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

// ---------------------------------------------------------------------------
// Communities: the server decides who can see, join and create (level, age check).
// ---------------------------------------------------------------------------

export interface Community {
  id: string;
  name: string;
  purpose: string;
  topic: string | null;
  verification_status: 'pending_founder_call' | 'verified' | 'rejected';
  created_by: string | null;
}

export interface ServerGates {
  level: number;
  age_verified: boolean;
  gates: Record<string, number>;
}

export const communityKeys = {
  list: ['server', 'communities'] as const,
  mine: ['server', 'communities', 'mine'] as const,
  gates: ['server', 'gates'] as const,
};

async function signedInClient() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ? { client: supabase, userId: data.session.user.id } : null;
}

/** Listed communities plus any the person belongs to (RLS filters both). */
export function useCommunities(enabled: boolean) {
  return useQuery({
    queryKey: communityKeys.list,
    enabled: enabled && Boolean(supabase),
    queryFn: async ({ signal }): Promise<Community[]> => {
      const s = await signedInClient();
      if (!s) return [];
      const { data, error } = await s.client
        .from('thrivefold_communities')
        .select('id, name, purpose, topic, verification_status, created_by')
        .order('created_at', { ascending: false })
        .abortSignal(signal);
      if (error) throw error;
      return (data ?? []) as Community[];
    },
  });
}

export function useMyMemberships(enabled: boolean) {
  return useQuery({
    queryKey: communityKeys.mine,
    enabled: enabled && Boolean(supabase),
    queryFn: async ({ signal }): Promise<string[]> => {
      const s = await signedInClient();
      if (!s) return [];
      const { data, error } = await s.client
        .from('thrivefold_community_memberships')
        .select('community_id')
        .eq('user_id', s.userId)
        .eq('status', 'active')
        .abortSignal(signal);
      if (error) throw error;
      return (data ?? []).map((r: { community_id: string }) => r.community_id);
    },
  });
}

export function useServerGates(enabled: boolean) {
  return useQuery({
    queryKey: communityKeys.gates,
    enabled: enabled && Boolean(supabase),
    queryFn: async (): Promise<ServerGates | null> => {
      const s = await signedInClient();
      if (!s) return null;
      const { data, error } = await s.client.rpc('tf_my_gates');
      if (error) throw error;
      return data as ServerGates;
    },
  });
}

/** Server error codes from the community RPCs, in words a person can act on. */
export function communityErrorText(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes('level_required')) return 'You need a higher level for this.';
  if (m.includes('age_verification_required')) return 'This needs an age check, which isn’t available yet.';
  if (m.includes('account_restricted')) return 'Your account can’t use groups right now.';
  if (m.includes('invitation_required')) return 'This group is invite-only.';
  if (m.includes('invalid_details')) return 'Give the group a name (3–60 letters) and a purpose (10–280).';
  if (m.includes('too_many_pending')) return 'You already have three groups waiting for verification.';
  return 'Couldn’t reach the server. Try again when you’re online.';
}

export function useJoinCommunity() {
  return useMutation({
    mutationFn: async ({ id, leave }: { id: string; leave?: boolean }) => {
      const s = await signedInClient();
      if (!s) throw new Error('not_authenticated');
      const { error } = await s.client.rpc(leave ? 'tf_leave_community' : 'tf_join_community', { p_community: id });
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: communityKeys.list }),
  });
}

export function useCreateCommunity() {
  return useMutation({
    mutationFn: async (input: { name: string; purpose: string; topic: string }) => {
      const s = await signedInClient();
      if (!s) throw new Error('not_authenticated');
      const { data, error } = await s.client.rpc('tf_create_community', {
        p_name: input.name,
        p_purpose: input.purpose,
        p_topic: input.topic,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: communityKeys.list }),
  });
}
