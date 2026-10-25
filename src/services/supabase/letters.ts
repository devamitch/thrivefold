import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from './queryClient';
import { supabase } from './supabaseClient';

// ---------------------------------------------------------------------------
// Slow letters. The server owns everything that matters: chip-only bodies, verified adults
// on both sides, consent for first letters, one new introduction a day, blocks, and delivery
// time (RLS hides a letter from its recipient until it arrives). The app only reads and asks.
// ---------------------------------------------------------------------------

export interface ServerLetter {
  id: string;
  sender_id: string;
  recipient_id: string;
  stamp_id: string;
  chip_ids: string[];
  assembled_body: string;
  status: 'in_transit' | 'delivered' | 'opened' | 'declined' | 'cancelled';
  sent_at: string;
  scheduled_delivery_at: string;
  opened_at: string | null;
}

export interface IntroCandidate {
  user_id: string;
  pseudonym: string;
  coarse_region: string;
  languages: string[];
  interests: string[];
}

export const letterKeys = {
  inbox: ['server', 'letters', 'inbox'] as const,
  outbox: ['server', 'letters', 'outbox'] as const,
  candidates: ['server', 'letters', 'candidates'] as const,
  names: (ids: string[]) => ['server', 'letters', 'names', ...ids] as const,
};

const LETTER_COLUMNS =
  'id, sender_id, recipient_id, stamp_id, chip_ids, assembled_body, status, sent_at, scheduled_delivery_at, opened_at';

async function signedInClient() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ? { client: supabase, userId: data.session.user.id } : null;
}

/** Letters addressed to me that have arrived (the server hides ones still travelling). */
export function useLetterInbox(enabled: boolean) {
  return useQuery({
    queryKey: letterKeys.inbox,
    enabled: enabled && Boolean(supabase),
    queryFn: async ({ signal }): Promise<ServerLetter[]> => {
      const s = await signedInClient();
      if (!s) return [];
      const { data, error } = await s.client
        .from('thrivefold_letters')
        .select(LETTER_COLUMNS)
        .eq('recipient_id', s.userId)
        .neq('status', 'declined')
        .order('scheduled_delivery_at', { ascending: false })
        .abortSignal(signal);
      if (error) throw error;
      return (data ?? []) as ServerLetter[];
    },
  });
}

/** Letters I sent, including ones still on their way. */
export function useLetterOutbox(enabled: boolean) {
  return useQuery({
    queryKey: letterKeys.outbox,
    enabled: enabled && Boolean(supabase),
    queryFn: async ({ signal }): Promise<ServerLetter[]> => {
      const s = await signedInClient();
      if (!s) return [];
      const { data, error } = await s.client
        .from('thrivefold_letters')
        .select(LETTER_COLUMNS)
        .eq('sender_id', s.userId)
        .order('sent_at', { ascending: false })
        .abortSignal(signal);
      if (error) throw error;
      return (data ?? []) as ServerLetter[];
    },
  });
}

/** Verified adults who accept a first letter, chosen by the server. */
export function useIntroCandidates(enabled: boolean) {
  return useQuery({
    queryKey: letterKeys.candidates,
    enabled: enabled && Boolean(supabase),
    queryFn: async (): Promise<IntroCandidate[]> => {
      const s = await signedInClient();
      if (!s) return [];
      const { data, error } = await s.client.rpc('tf_intro_candidates', { p_limit: 20 });
      if (error) throw error;
      return (data ?? []) as IntroCandidate[];
    },
  });
}

/** Pseudonyms for the people in my letters (social profiles are pseudonymous by design). */
export function usePseudonyms(userIds: string[], enabled: boolean) {
  const ids = [...new Set(userIds)].sort();
  return useQuery({
    queryKey: letterKeys.names(ids),
    enabled: enabled && Boolean(supabase) && ids.length > 0,
    staleTime: 10 * 60 * 1000,
    queryFn: async ({ signal }): Promise<Record<string, string>> => {
      const s = await signedInClient();
      if (!s) return {};
      const { data, error } = await s.client
        .from('thrivefold_social_profiles')
        .select('user_id, pseudonym')
        .in('user_id', ids)
        .abortSignal(signal);
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((r: { user_id: string; pseudonym: string }) => [r.user_id, r.pseudonym]));
    },
  });
}

export function useSendLetter() {
  return useMutation({
    mutationFn: async (input: { recipientId: string; chipIds: string[]; stampId: string }) => {
      const s = await signedInClient();
      if (!s) throw new Error('not_authenticated');
      const { data, error } = await s.client.rpc('tf_send_letter', {
        p_recipient: input.recipientId,
        p_chip_ids: input.chipIds,
        p_stamp_id: input.stampId,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: letterKeys.outbox });
      queryClient.invalidateQueries({ queryKey: letterKeys.candidates });
    },
  });
}

export function useOpenLetter() {
  return useMutation({
    mutationFn: async (letterId: string) => {
      const s = await signedInClient();
      if (!s) throw new Error('not_authenticated');
      const { error } = await s.client.rpc('tf_mark_letter_opened', { p_letter: letterId });
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: letterKeys.inbox }),
  });
}

export function useDeclineLetter() {
  return useMutation({
    mutationFn: async (letterId: string) => {
      const s = await signedInClient();
      if (!s) throw new Error('not_authenticated');
      const { error } = await s.client.rpc('tf_decline_letter', { p_letter: letterId });
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: letterKeys.inbox }),
  });
}

/** Server error codes from the letter RPCs, in words a person can act on. */
export function letterErrorText(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes('not_authenticated')) return 'Sign in to send letters.';
  if (m.includes('age_verification_required')) return 'Letters need an age check. Start it from You > Account > Age check.';
  if (m.includes('recipient_unavailable')) return 'This person isn’t taking new letters right now.';
  if (m.includes('daily_introduction_limit')) return 'You can start one new conversation a day. Try again tomorrow.';
  if (m.includes('invalid_chips')) return 'Choose between 1 and 12 cards for your letter.';
  if (m.includes('account_restricted')) return 'Your account can’t send letters right now.';
  return 'Couldn’t reach the server. Your letter wasn’t sent; try again when you’re online.';
}

/** Hours until a letter arrives, rounded up; 0 once it has. */
export function hoursUntil(iso: string, now = Date.now()): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 3_600_000));
}
