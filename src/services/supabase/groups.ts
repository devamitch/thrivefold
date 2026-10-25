import { useMutation, useQuery } from '@tanstack/react-query';

import { communityKeys } from './queries';
import { queryClient } from './queryClient';
import { supabase } from './supabaseClient';

// ---------------------------------------------------------------------------
// Groups (migration 14): one group's page, chat, sessions and management. Every rule (who may
// post, write notes, approve, remove, change roles) is enforced by the server functions.
// ---------------------------------------------------------------------------

export type GroupRole = 'owner' | 'admin' | 'moderator' | 'facilitator' | 'member';
export type GroupKind = 'peer_support' | 'professional' | 'practice';
export type GroupReaction = 'heart' | 'support' | 'thanks' | 'same';
export type GroupEventType = 'mindful_reflection' | 'support_circle' | 'expert_qa' | 'practice_session';

export const ROLE_LABEL: Record<GroupRole, string> = {
  owner: 'Organiser',
  admin: 'Admin',
  moderator: 'Moderator',
  facilitator: 'Facilitator',
  member: 'Member',
};
export const KIND_LABEL: Record<GroupKind, string> = {
  peer_support: 'Peer support',
  professional: 'Professionally facilitated',
  practice: 'Practice group',
};
export const KIND_NOTE: Record<GroupKind, string> = {
  peer_support:
    'Run by members for members. Facilitators are peers, not therapists. Not a clinical service and not for emergencies.',
  professional:
    'Facilitated by a professional the organiser named on their verification call. Still not an emergency service.',
  practice: 'For training or practising together: workouts, meditation, sport.',
};
export const EVENT_LABEL: Record<GroupEventType, string> = {
  support_circle: 'Support circle',
  mindful_reflection: 'Mindful reflection',
  expert_qa: 'Questions with an expert',
  practice_session: 'Practice session',
};
export const REACTIONS: { id: GroupReaction; icon: 'heart' | 'hand-left' | 'sparkles' | 'people' }[] = [
  { id: 'heart', icon: 'heart' },
  { id: 'support', icon: 'hand-left' },
  { id: 'thanks', icon: 'sparkles' },
  { id: 'same', icon: 'people' },
];

export interface GroupMember {
  user_id: string;
  role: GroupRole;
  pseudonym: string;
}
export interface GroupEvent {
  id: string;
  title: string;
  description: string;
  event_type: GroupEventType;
  start_time: string;
  end_time: string;
  going: number;
  me_going: boolean;
}
export interface GroupDetail {
  id: string;
  name: string;
  purpose: string;
  topic: string | null;
  kind: GroupKind;
  join_mode: 'open' | 'approval';
  rules: string;
  verification_status: 'pending_founder_call' | 'verified' | 'rejected';
  my_role: GroupRole | null;
  my_status: 'active' | 'pending' | 'removed' | null;
  member_count: number;
  members: GroupMember[];
  pending: { user_id: string; pseudonym: string; requested_at: string }[];
  events: GroupEvent[];
}
export interface GroupMessage {
  id: string;
  sender_id: string;
  pseudonym: string;
  sender_role: GroupRole | null;
  kind: 'cards' | 'facilitator';
  body: string;
  hidden: boolean;
  created_at: string;
  reactions: Partial<Record<GroupReaction, number>>;
  my_reactions: GroupReaction[];
}

const RANK: Record<GroupRole, number> = { owner: 5, admin: 4, moderator: 3, facilitator: 2, member: 1 };
export const rankOf = (r: GroupRole | null | undefined) => (r ? RANK[r] : 0);
/** What the caller's role allows, mirroring the server checks (the server still decides). */
export function permissions(role: GroupRole | null | undefined) {
  const r = rankOf(role);
  return {
    post: r >= 1,
    note: role === 'owner' || role === 'admin' || role === 'facilitator',
    schedule: role === 'owner' || role === 'admin' || role === 'facilitator',
    moderate: r >= 3,
    manage: r >= 4,
  };
}

export const groupKeys = {
  detail: (id: string) => ['server', 'group', id] as const,
  messages: (id: string) => ['server', 'group', id, 'messages'] as const,
};

async function client() {
  if (!supabase) throw new Error('not_configured');
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('not_authenticated');
  return { client: supabase, userId: data.session.user.id };
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { client: c } = await client();
  const { data, error } = await c.rpc(fn, args);
  if (error) throw error;
  return data as T;
}

export function useMyUserId(enabled = true) {
  return useQuery({ queryKey: ['server', 'me'], enabled, queryFn: async () => (await client()).userId });
}

export function useGroup(id: string, enabled: boolean) {
  return useQuery({
    queryKey: groupKeys.detail(id),
    enabled: enabled && Boolean(supabase) && Boolean(id),
    queryFn: () => rpc<GroupDetail>('tf_group_detail', { p_community: id }),
  });
}

/** The chat, refreshed every 8 s while the group screen is open. */
export function useGroupMessages(id: string, enabled: boolean) {
  return useQuery({
    queryKey: groupKeys.messages(id),
    enabled: enabled && Boolean(supabase) && Boolean(id),
    refetchInterval: 8_000,
    queryFn: () => rpc<GroupMessage[]>('tf_group_messages', { p_community: id }),
  });
}

/** A mutation that refreshes this group (and the group list) when it settles. */
function useGroupMutation<A>(groupId: string, fn: (a: A) => Promise<unknown>) {
  return useMutation({
    mutationFn: fn,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.messages(groupId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.list });
      queryClient.invalidateQueries({ queryKey: communityKeys.mine });
    },
  });
}

export const useJoinGroup = (g: string) =>
  useGroupMutation(g, () => rpc<'active' | 'pending'>('tf_group_join', { p_community: g }));
export const useLeaveGroup = (g: string) => useGroupMutation(g, () => rpc('tf_group_leave', { p_community: g }));
export const usePostCards = (g: string) =>
  useGroupMutation(g, (chipIds: string[]) => rpc('tf_group_post', { p_community: g, p_chip_ids: chipIds }));
export const usePostNote = (g: string) =>
  useGroupMutation(g, (text: string) => rpc('tf_group_note', { p_community: g, p_text: text }));
export const useReact = (g: string) =>
  useGroupMutation(g, (a: { messageId: string; reaction: GroupReaction }) =>
    rpc('tf_group_react', { p_message: a.messageId, p_reaction: a.reaction }),
  );
export const useReportMessage = (g: string) =>
  useGroupMutation(g, (a: { messageId: string; category: string }) =>
    rpc('tf_group_report', { p_message: a.messageId, p_category: a.category }),
  );
export const useHideMessage = (g: string) =>
  useGroupMutation(g, (a: { messageId: string; hidden: boolean }) =>
    rpc('tf_group_hide', { p_message: a.messageId, p_hidden: a.hidden }),
  );
export const useDecideRequest = (g: string) =>
  useGroupMutation(g, (a: { userId: string; approve: boolean }) =>
    rpc('tf_group_decide', { p_community: g, p_user: a.userId, p_approve: a.approve }),
  );
export const useRemoveMember = (g: string) =>
  useGroupMutation(g, (userId: string) => rpc('tf_group_remove', { p_community: g, p_user: userId }));
export const useSetRole = (g: string) =>
  useGroupMutation(g, (a: { userId: string; role: GroupRole }) =>
    rpc('tf_group_set_role', { p_community: g, p_user: a.userId, p_role: a.role }),
  );
export const useGroupSettings = (g: string) =>
  useGroupMutation(g, (a: { kind: GroupKind; joinMode: 'open' | 'approval'; rules: string }) =>
    rpc('tf_group_settings', { p_community: g, p_kind: a.kind, p_join_mode: a.joinMode, p_rules: a.rules }),
  );
export const useCreateEvent = (g: string) =>
  useGroupMutation(
    g,
    (a: { title: string; description: string; type: GroupEventType; start: Date; minutes: number }) =>
      rpc('tf_group_create_event', {
        p_community: g,
        p_title: a.title,
        p_description: a.description,
        p_type: a.type,
        p_start: a.start.toISOString(),
        p_minutes: a.minutes,
      }),
  );
export const useCancelEvent = (g: string) =>
  useGroupMutation(g, (eventId: string) => rpc('tf_group_cancel_event', { p_event: eventId }));
export const useRsvp = (g: string) =>
  useGroupMutation(g, (a: { eventId: string; going: boolean }) =>
    rpc('tf_group_rsvp', { p_event: a.eventId, p_going: a.going }),
  );

export function groupErrorText(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes('not_authenticated')) return 'Sign in to use groups.';
  if (m.includes('not_a_member')) return 'Join the group first.';
  if (m.includes('forbidden')) return 'Your role in this group can’t do that.';
  if (m.includes('group_unavailable')) return 'This group isn’t available.';
  if (m.includes('removed_from_group')) return 'The organisers removed you from this group.';
  if (m.includes('owner_cannot_leave')) return 'Organisers can’t leave their own group.';
  if (m.includes('contact_details')) return 'Notes can’t include links, handles or phone numbers.';
  if (m.includes('invalid_details')) return 'Check the details and try again.';
  if (m.includes('invalid_chips')) return 'Choose between one and six cards.';
  if (m.includes('slow_down')) return 'That’s a lot of messages today. Pick it up again tomorrow.';
  if (m.includes('level_required')) return 'You need a higher level to join groups.';
  if (m.includes('age_verification_required')) return 'Groups need an age check. Start it from You > Account > Age check.';
  if (m.includes('invitation_required')) return 'This group is invite-only.';
  if (m.includes('account_restricted')) return 'Your account can’t use groups right now.';
  return 'Couldn’t reach the server. Try again when you’re online.';
}
