import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from './queryClient';
import { supabase } from './supabaseClient';

// ---------------------------------------------------------------------------
// Dating (propmt.md section 18). Every rule lives on the server: verified adults at level 20,
// women start conversations, chip-only messages, blocks and closing. The app reads and asks.
// ---------------------------------------------------------------------------

export type DatingGender = 'woman' | 'man' | 'nonbinary';

export type AgeBand = '18-24' | '25-34' | '35-44' | '45-54' | '55+';
export type DatingIntention = 'friendship_first' | 'long_term' | 'open';
export type DatingPace = 'slow' | 'steady';

export const AGE_BANDS: AgeBand[] = ['18-24', '25-34', '35-44', '45-54', '55+'];
export const INTENTION_LABEL: Record<DatingIntention, string> = {
  friendship_first: 'Friendship first',
  long_term: 'Something long-term',
  open: 'Open to seeing',
};
export const PACE_LABEL: Record<DatingPace, string> = { slow: 'Slow and unhurried', steady: 'Steady' };

export interface DatingProfile {
  gender: DatingGender;
  interested_in: DatingGender[];
  interests: string[];
  prompt_chip_ids: string[];
  is_active: boolean;
}

/** Matching preferences (migration 13). All self-chosen; the age band is self-described. */
export interface DatingPreferences {
  age_band: AgeBand | null;
  want_age_bands: AgeBand[];
  languages: string[];
  intention: DatingIntention | null;
  pace: DatingPace | null;
}

export interface DatingCandidate {
  user_id: string;
  pseudonym: string;
  gender: DatingGender;
  interests: string[];
  intro: string | null;
  age_band: AgeBand | null;
  intention: DatingIntention | null;
  pace: DatingPace | null;
  languages: string[];
  shared_interests: string[];
  shared_languages: string[];
  /** How well preferences line up; used for ordering only, never shown as a number. */
  score: number;
}

export interface DatingConversation {
  id: string;
  other_id: string;
  other_pseudonym: string;
  status: 'open' | 'closed';
  initiator: string;
  last_body: string | null;
  last_message_at: string;
  unread: number;
}

export interface DatingMessage {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export const datingKeys = {
  profile: ['server', 'dating', 'profile'] as const,
  candidates: ['server', 'dating', 'candidates'] as const,
  conversations: ['server', 'dating', 'conversations'] as const,
  messages: (id: string) => ['server', 'dating', 'messages', id] as const,
};

async function signedIn() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ? { client: supabase, userId: data.session.user.id } : null;
}

export async function myUserId(): Promise<string | null> {
  return (await signedIn())?.userId ?? null;
}

export function useDatingProfile(enabled: boolean) {
  return useQuery({
    queryKey: datingKeys.profile,
    enabled: enabled && Boolean(supabase),
    queryFn: async (): Promise<(DatingProfile & DatingPreferences) | null> => {
      const s = await signedIn();
      if (!s) return null;
      const { data, error } = await s.client
        .from('thrivefold_dating_profiles')
        .select('gender, interested_in, interests, prompt_chip_ids, is_active, age_band, want_age_bands, languages, intention, pace')
        .eq('user_id', s.userId)
        .maybeSingle();
      if (error) throw error;
      return (data as (DatingProfile & DatingPreferences) | null) ?? null;
    },
  });
}

export function useSaveDatingProfile() {
  return useMutation({
    mutationFn: async (p: DatingProfile & { preferences?: DatingPreferences }) => {
      const s = await signedIn();
      if (!s) throw new Error('not_authenticated');
      const { error } = await s.client.rpc('tf_dating_save_profile', {
        p_gender: p.gender,
        p_interested_in: p.interested_in,
        p_interests: p.interests,
        p_prompt_chip_ids: p.prompt_chip_ids,
        p_active: p.is_active,
      });
      if (error) throw error;
      if (p.preferences) {
        const pr = p.preferences;
        const { error: e2 } = await s.client.rpc('tf_dating_save_preferences', {
          p_age_band: pr.age_band,
          p_want_age_bands: pr.want_age_bands,
          p_languages: pr.languages,
          p_intention: pr.intention,
          p_pace: pr.pace,
        });
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datingKeys.profile });
      queryClient.invalidateQueries({ queryKey: datingKeys.candidates });
    },
  });
}

export function useDeleteDatingProfile() {
  return useMutation({
    mutationFn: async () => {
      const s = await signedIn();
      if (!s) throw new Error('not_authenticated');
      const { error } = await s.client.rpc('tf_dating_delete_profile');
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server', 'dating'] }),
  });
}

export function useDatingCandidates(enabled: boolean) {
  return useQuery({
    queryKey: datingKeys.candidates,
    enabled: enabled && Boolean(supabase),
    queryFn: async (): Promise<DatingCandidate[]> => {
      const s = await signedIn();
      if (!s) return [];
      const { data, error } = await s.client.rpc('tf_dating_candidates', { p_limit: 30 });
      if (error) throw error;
      return (data ?? []) as DatingCandidate[];
    },
  });
}

export function useDatingConversations(enabled: boolean) {
  return useQuery({
    queryKey: datingKeys.conversations,
    enabled: enabled && Boolean(supabase),
    refetchInterval: 20_000,
    queryFn: async (): Promise<DatingConversation[]> => {
      const s = await signedIn();
      if (!s) return [];
      const { data, error } = await s.client.rpc('tf_dating_conversations');
      if (error) throw error;
      return (data ?? []) as DatingConversation[];
    },
  });
}

/** Messages in one conversation; refreshes every few seconds while the chat is open. */
export function useDatingMessages(conversationId: string, enabled: boolean) {
  return useQuery({
    queryKey: datingKeys.messages(conversationId),
    enabled: enabled && Boolean(supabase) && Boolean(conversationId),
    refetchInterval: 5_000,
    queryFn: async ({ signal }): Promise<DatingMessage[]> => {
      const s = await signedIn();
      if (!s) return [];
      const { data, error } = await s.client
        .from('thrivefold_dating_messages')
        .select('id, sender_id, body, created_at, read_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .abortSignal(signal);
      if (error) throw error;
      return (data ?? []) as DatingMessage[];
    },
  });
}

export function useStartConversation() {
  return useMutation({
    mutationFn: async (input: { recipientId: string; chipIds: string[] }) => {
      const s = await signedIn();
      if (!s) throw new Error('not_authenticated');
      const { data, error } = await s.client.rpc('tf_dating_start', {
        p_recipient: input.recipientId,
        p_chip_ids: input.chipIds,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datingKeys.conversations });
      queryClient.invalidateQueries({ queryKey: datingKeys.candidates });
    },
  });
}

export function useSendDatingMessage(conversationId: string) {
  return useMutation({
    mutationFn: async (chipIds: string[]) => {
      const s = await signedIn();
      if (!s) throw new Error('not_authenticated');
      const { error } = await s.client.rpc('tf_dating_send', { p_conversation: conversationId, p_chip_ids: chipIds });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datingKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: datingKeys.conversations });
    },
  });
}

export function useMarkConversationRead() {
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const s = await signedIn();
      if (!s) return;
      await s.client.rpc('tf_dating_mark_read', { p_conversation: conversationId });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: datingKeys.conversations }),
  });
}

export function useCloseConversation() {
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const s = await signedIn();
      if (!s) throw new Error('not_authenticated');
      const { error } = await s.client.rpc('tf_dating_close', { p_conversation: conversationId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: datingKeys.conversations }),
  });
}

export type DatingReportCategory = 'harassment' | 'pressure' | 'underage' | 'fake_profile' | 'spam' | 'other';
export const REPORT_LABEL: Record<DatingReportCategory, string> = {
  harassment: 'Harassment or insults',
  pressure: 'Pressure to move off the app or meet',
  underage: 'Might be under 18',
  fake_profile: 'Fake or impersonating',
  spam: 'Spam or selling',
  other: 'Something else',
};

/** Reports the other person in a conversation (chip messages go as evidence) and blocks them. */
export function useReportDatingConversation() {
  return useMutation({
    mutationFn: async (input: { conversationId: string; category: DatingReportCategory; block: boolean }) => {
      const s = await signedIn();
      if (!s) throw new Error('not_authenticated');
      const { error } = await s.client.rpc('tf_dating_report', {
        p_conversation: input.conversationId,
        p_category: input.category,
        p_block: input.block,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server', 'dating'] }),
  });
}

/** Blocks someone everywhere (letters, groups, dating). */
export function useBlockPerson() {
  return useMutation({
    mutationFn: async (otherId: string) => {
      const s = await signedIn();
      if (!s) throw new Error('not_authenticated');
      const { error } = await s.client.from('thrivefold_blocks').insert({ user_id: s.userId, blocked_user_id: otherId });
      if (error && !String(error.message).includes('duplicate')) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server'] }),
  });
}

export function datingErrorText(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes('not_authenticated')) return 'Sign in to use dating.';
  if (m.includes('age_verification_required')) return 'Dating needs an age check. Start it from You > Account > Age check.';
  if (m.includes('level_required')) return 'Dating opens at level 20.';
  if (m.includes('account_restricted')) return 'Your account can’t use dating right now.';
  if (m.includes('dating_profile_required')) return 'Set up your dating profile first.';
  if (m.includes('women_start_conversations')) return 'In Thrivefold dating, women send the first message. You can reply once someone writes to you.';
  if (m.includes('recipient_unavailable')) return 'This person isn’t available.';
  if (m.includes('conversation_exists')) return 'You already have a conversation with this person.';
  if (m.includes('daily_introduction_limit')) return 'You can start three new conversations a day. Try again tomorrow.';
  if (m.includes('conversation_closed')) return 'This conversation has ended.';
  if (m.includes('conversation_unavailable')) return 'This conversation isn’t available.';
  if (m.includes('slow_down')) return 'That’s a lot of messages today. Pick it up again tomorrow.';
  if (m.includes('invalid_chips')) return 'Choose between one and six cards.';
  if (m.includes('invalid_category')) return 'Choose a reason for the report.';
  return 'Couldn’t reach the server. Nothing was sent; try again when you’re online.';
}
