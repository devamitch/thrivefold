import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ChipComposer } from '../../../../components/dating/ChipComposer';
import { AppBottomSheetModal } from '../../../../components/ui/AppBottomSheetModal';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Chip } from '../../../../components/ui/Chip';
import { DatePickerModal } from '../../../../components/ui/DatePickerModal';
import { Header } from '../../../../components/ui/Header';
import { PressableScale } from '../../../../components/ui/PressableScale';
import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { TextField } from '../../../../components/ui/TextField';
import type { ChipCategory } from '../../../../domain/chips/catalog';
import {
  EVENT_LABEL,
  KIND_LABEL,
  KIND_NOTE,
  REACTIONS,
  ROLE_LABEL,
  groupErrorText,
  permissions,
  rankOf,
  useCancelEvent,
  useCreateEvent,
  useDecideRequest,
  useGroup,
  useGroupMessages,
  useGroupSettings,
  useHideMessage,
  useJoinGroup,
  useLeaveGroup,
  useMyUserId,
  usePostCards,
  usePostNote,
  useReact,
  useRemoveMember,
  useReportMessage,
  useRsvp,
  useSetRole,
  type GroupEventType,
  type GroupKind,
  type GroupMember,
  type GroupMessage,
  type GroupRole,
} from '../../../../services/supabase/groups';
import { useRootStore } from '../../../../stores/useRootStore';
import { useTheme } from '../../../../theme/useTheme';

const GROUP_CATEGORIES: { id: ChipCategory; label: string }[] = [
  { id: 'group_checkin', label: 'Check in' },
  { id: 'group_share', label: 'Share' },
  { id: 'group_support', label: 'Support' },
  { id: 'gratitude', label: 'Thanks' },
  { id: 'group_boundary', label: 'Boundaries' },
];
const REPORT_REASONS = [
  { id: 'harassment', label: 'Harassment' },
  { id: 'pressure', label: 'Pressure or recruiting' },
  { id: 'selling', label: 'Selling or spam' },
  { id: 'unsafe', label: 'Someone may be unsafe' },
  { id: 'other', label: 'Something else' },
];
type Tab = 'chat' | 'sessions' | 'people' | 'about';

const when = (iso: string) =>
  new Date(iso).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/**
 * One group: card chat with facilitator notes, sessions, members and management, and what the
 * group is (peer or professional) with its rules, shown before anyone joins. The server decides
 * every permission; the screen only hides buttons a role can't use.
 */
export default function GroupScreen() {
  const { communityId } = useLocalSearchParams<{ communityId: string }>();
  const id = communityId ?? '';
  const { colors, typography, spacing } = useTheme();
  const showAlert = useRootStore((s) => s.showAlert);
  const showToast = useRootStore((s) => s.showToast);
  const group = useGroup(id, true);
  const g = group.data;
  const isMember = g?.my_status === 'active';
  const can = permissions(isMember ? g?.my_role : null);
  const messages = useGroupMessages(id, isMember);
  const me = useMyUserId();
  const [tab, setTab] = useState<Tab>('chat');
  const [composer, setComposer] = useState<'cards' | 'note' | null>(null);
  const [note, setNote] = useState('');
  const [reportFor, setReportFor] = useState<GroupMessage | null>(null);
  const [personFor, setPersonFor] = useState<GroupMember | null>(null);

  const join = useJoinGroup(id);
  const leave = useLeaveGroup(id);
  const post = usePostCards(id);
  const postNote = usePostNote(id);
  const react = useReact(id);
  const report = useReportMessage(id);
  const hide = useHideMessage(id);
  const fail = (e: unknown) => showToast({ type: 'error', message: groupErrorText(e) });

  if (group.isLoading) {
    return (
      <ScreenWrapper>
        <Header title="Group" showBack />
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </ScreenWrapper>
    );
  }
  if (!g) {
    return (
      <ScreenWrapper scrollable>
        <Header title="Group" showBack />
        <Card style={{ padding: spacing.lg }}>
          <Text style={[typography.body, { color: colors.text.secondary }]}>
            {group.error ? groupErrorText(group.error) : 'This group isn’t available.'}
          </Text>
        </Card>
      </ScreenWrapper>
    );
  }

  const about = (
    <Card style={{ padding: spacing.base, marginBottom: spacing.md }}>
      <View style={styles.row}>
        <Badge label={KIND_LABEL[g.kind]} variant={g.kind === 'professional' ? 'info' : 'neutral'} />
        <Badge label={g.join_mode === 'approval' ? 'Join by approval' : 'Open to join'} variant="neutral" />
        {g.verification_status !== 'verified' ? <Badge label="Waiting for verification" variant="warning" /> : null}
      </View>
      <Text style={[typography.body, { color: colors.text.primary, marginTop: spacing.sm }]}>{g.purpose}</Text>
      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.sm }]}>{KIND_NOTE[g.kind]}</Text>
      <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: spacing.md }]}>Group rules</Text>
      <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}>{g.rules}</Text>
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
        {g.member_count} {g.member_count === 1 ? 'member' : 'members'}. Organisers never see your health data, journal or other
        groups. If you are in danger, contact local emergency services.
      </Text>
    </Card>
  );

  // Not a member yet: what the group is, its rules, and a join button.
  if (!isMember) {
    return (
      <ScreenWrapper
        scrollable
        footer={
          g.my_status === 'pending' ? (
            <Button label="Request sent" disabled />
          ) : g.my_status === 'removed' ? undefined : (
            <Button
              label={g.join_mode === 'approval' ? 'Ask to join' : 'Join group'}
              loading={join.isPending}
              onPress={() =>
                join.mutate(undefined, {
                  onSuccess: (s) =>
                    showToast({
                      type: 'success',
                      message: s === 'pending' ? 'Request sent. The organisers will reply.' : `Welcome to ${g.name}.`,
                    }),
                  onError: fail,
                })
              }
            />
          )
        }
      >
        <Header title={g.name} subtitle={g.topic ?? 'Group'} showBack />
        {about}
        <Text style={[typography.caption, { color: colors.text.muted }]}>
          By joining you agree to the group rules. Messages are made of cards; organisers can write short notes.
        </Text>
      </ScreenWrapper>
    );
  }

  const rows = messages.data ?? [];

  const chat = (
    <View style={{ gap: 10 }}>
      {messages.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {!messages.isLoading && rows.length === 0 ? (
        <Card style={{ padding: spacing.lg }}>
          <Text style={[typography.body, { color: colors.text.secondary }]}>
            No messages yet. Start with a check-in card.
          </Text>
        </Card>
      ) : null}
      {rows.map((m) => {
        const mine = m.sender_id === me.data;
        const isNote = m.kind === 'facilitator';
        return (
          <View
            key={m.id}
            style={[
              styles.msg,
              {
                backgroundColor: isNote ? colors.primaryAlpha : mine ? colors.surface1 : colors.surface,
                opacity: m.hidden ? 0.55 : 1,
              },
            ]}
          >
            <View style={styles.rowBetween}>
              <Text style={[typography.captionBold, { color: isNote ? colors.primary : colors.text.secondary }]} numberOfLines={1}>
                {isNote ? `${m.pseudonym} · ${ROLE_LABEL[m.sender_role ?? 'facilitator']} note` : mine ? 'You' : m.pseudonym}
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>{when(m.created_at)}</Text>
            </View>
            <Text style={[typography.body, { color: colors.text.primary, marginTop: 4 }]}>
              {m.hidden ? `Hidden for review: ${m.body}` : m.body}
            </Text>
            <View style={[styles.row, { marginTop: 8 }]}>
              {REACTIONS.map((r) => {
                const on = m.my_reactions.includes(r.id);
                const n = m.reactions[r.id] ?? 0;
                return (
                  <PressableScale
                    key={r.id}
                    onPress={() => react.mutate({ messageId: m.id, reaction: r.id }, { onError: fail })}
                    accessibilityRole="button"
                    accessibilityLabel={`React ${r.id}`}
                    style={[styles.react, { backgroundColor: on ? colors.primaryAlpha : colors.surface1 }]}
                  >
                    <Ionicons name={on ? r.icon : (`${r.icon}-outline` as never)} size={14} color={on ? colors.primary : colors.text.secondary} />
                    {n > 0 ? <Text style={[typography.caption, { color: colors.text.secondary, marginLeft: 4 }]}>{n}</Text> : null}
                  </PressableScale>
                );
              })}
              <View style={styles.flex} />
              {can.moderate ? (
                <PressableScale
                  onPress={() => hide.mutate({ messageId: m.id, hidden: !m.hidden }, { onError: fail })}
                  accessibilityRole="button"
                  accessibilityLabel={m.hidden ? 'Show message' : 'Hide message'}
                  hitSlop={8}
                >
                  <Ionicons name={m.hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.text.muted} />
                </PressableScale>
              ) : null}
              {!mine ? (
                <PressableScale onPress={() => setReportFor(m)} accessibilityRole="button" accessibilityLabel="Report message" hitSlop={8}>
                  <Ionicons name="flag-outline" size={18} color={colors.text.muted} />
                </PressableScale>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );

  return (
    <ScreenWrapper
      scrollable
      footer={
        tab === 'chat' ? (
          <View style={styles.row}>
            <Button label="Share cards" style={styles.flex} onPress={() => setComposer('cards')} />
            {can.note ? <Button label="Write a note" variant="secondary" style={styles.flex} onPress={() => setComposer('note')} /> : null}
          </View>
        ) : undefined
      }
    >
      <Header title={g.name} subtitle={`${KIND_LABEL[g.kind]} · ${ROLE_LABEL[g.my_role ?? 'member']}`} showBack />
      <View style={[styles.row, { marginBottom: spacing.md }]}>
        <Chip label="Chat" selected={tab === 'chat'} onPress={() => setTab('chat')} />
        <Chip label={g.events.length ? `Sessions · ${g.events.length}` : 'Sessions'} selected={tab === 'sessions'} onPress={() => setTab('sessions')} />
        <Chip
          label={can.moderate && g.pending.length ? `People · ${g.pending.length} new` : 'People'}
          selected={tab === 'people'}
          onPress={() => setTab('people')}
        />
        <Chip label="About" selected={tab === 'about'} onPress={() => setTab('about')} />
      </View>

      {tab === 'chat' ? chat : null}
      {tab === 'sessions' ? <Sessions groupId={id} events={g.events} canSchedule={can.schedule} /> : null}
      {tab === 'people' ? (
        <People
          groupId={id}
          members={g.members}
          pending={can.moderate ? g.pending : []}
          myRole={g.my_role}
          meId={me.data}
          onPerson={setPersonFor}
        />
      ) : null}
      {tab === 'about' ? (
        <>
          {about}
          {can.manage ? <Settings groupId={id} kind={g.kind} joinMode={g.join_mode} rules={g.rules} /> : null}
          {g.my_role !== 'owner' ? (
            <Button
              label="Leave group"
              variant="ghost"
              onPress={() =>
                showAlert({
                  title: `Leave ${g.name}?`,
                  message: g.join_mode === 'approval' ? 'You would need to ask again to rejoin.' : 'You can rejoin later.',
                  confirmText: 'Leave',
                  destructive: true,
                  onConfirm: () => leave.mutate(undefined, { onError: fail }),
                })
              }
            />
          ) : null}
        </>
      ) : null}

      <AppBottomSheetModal visible={composer === 'cards'} onClose={() => setComposer(null)} title="Share with the group" subtitle="Up to six cards">
        <ChipComposer
          categories={GROUP_CATEGORIES}
          sending={post.isPending}
          sendLabel="Share"
          onSend={(chipIds) => post.mutate(chipIds, { onSuccess: () => setComposer(null), onError: fail })}
        />
      </AppBottomSheetModal>

      <AppBottomSheetModal
        visible={composer === 'note'}
        onClose={() => setComposer(null)}
        title="Facilitator note"
        subtitle="A prompt, a session reminder or a welcome. No links, handles or phone numbers."
        footer={
          <Button
            label="Post note"
            loading={postNote.isPending}
            disabled={note.trim().length < 2}
            onPress={() =>
              postNote.mutate(note.trim(), {
                onSuccess: () => {
                  setNote('');
                  setComposer(null);
                },
                onError: fail,
              })
            }
          />
        }
      >
        <TextField value={note} onChangeText={setNote} maxLength={500} multiline placeholder="Tonight's prompt: one thing that helped this week." />
      </AppBottomSheetModal>

      <AppBottomSheetModal visible={Boolean(reportFor)} onClose={() => setReportFor(null)} title="Report this message" subtitle="Goes to Thrivefold moderators. Three reports hide it until reviewed.">
        <View style={{ gap: 8 }}>
          {REPORT_REASONS.map((r) => (
            <Button
              key={r.id}
              label={r.label}
              variant="secondary"
              onPress={() =>
                reportFor &&
                report.mutate(
                  { messageId: reportFor.id, category: r.id },
                  {
                    onSuccess: () => {
                      setReportFor(null);
                      showToast({ type: 'success', message: 'Report sent. Thank you.' });
                    },
                    onError: fail,
                  },
                )
              }
            />
          ))}
        </View>
      </AppBottomSheetModal>

      <PersonSheet groupId={id} person={personFor} myRole={g.my_role} onClose={() => setPersonFor(null)} />
    </ScreenWrapper>
  );
}

function Sessions({ groupId, events, canSchedule }: { groupId: string; events: { id: string; title: string; description: string; event_type: GroupEventType; start_time: string; end_time: string; going: number; me_going: boolean }[]; canSchedule: boolean }) {
  const { colors, typography, spacing } = useTheme();
  const showToast = useRootStore((s) => s.showToast);
  const rsvp = useRsvp(groupId);
  const cancel = useCancelEvent(groupId);
  const create = useCreateEvent(groupId);
  const [form, setForm] = useState<{ title: string; description: string; type: GroupEventType; date: string; hour: number; minutes: number } | null>(null);
  const [picking, setPicking] = useState(false);
  const fail = (e: unknown) => showToast({ type: 'error', message: groupErrorText(e) });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <View style={{ gap: 10 }}>
      {events.length === 0 ? (
        <Card style={{ padding: spacing.lg }}>
          <Text style={[typography.body, { color: colors.text.secondary }]}>No sessions scheduled.</Text>
        </Card>
      ) : null}
      {events.map((e) => (
        <Card key={e.id} style={{ padding: spacing.base }}>
          <Text style={[typography.caption, { color: colors.primary }]}>{EVENT_LABEL[e.event_type] ?? 'Session'}</Text>
          <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 2 }]}>{e.title}</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            {when(e.start_time)} · {Math.round((Date.parse(e.end_time) - Date.parse(e.start_time)) / 60000)} min · {e.going} going
          </Text>
          {e.description ? <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6 }]}>{e.description}</Text> : null}
          <View style={[styles.row, { marginTop: spacing.sm }]}>
            <Button
              label={e.me_going ? 'Going' : 'I’ll be there'}
              size="sm"
              variant={e.me_going ? 'secondary' : 'primary'}
              onPress={() => rsvp.mutate({ eventId: e.id, going: !e.me_going }, { onError: fail })}
            />
            {canSchedule ? <Button label="Cancel session" size="sm" variant="ghost" onPress={() => cancel.mutate(e.id, { onError: fail })} /> : null}
          </View>
        </Card>
      ))}
      {canSchedule ? (
        form ? (
          <Card style={{ padding: spacing.base }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>New session</Text>
            <TextField label="Title" value={form.title} onChangeText={(title) => setForm({ ...form, title })} maxLength={80} />
            <TextField label="What to expect" value={form.description} onChangeText={(description) => setForm({ ...form, description })} maxLength={400} multiline />
            <View style={[styles.row, { marginTop: spacing.sm }]}>
              {(Object.keys(EVENT_LABEL) as GroupEventType[]).map((t) => (
                <Chip key={t} label={EVENT_LABEL[t]} selected={form.type === t} onPress={() => setForm({ ...form, type: t })} />
              ))}
            </View>
            <View style={[styles.row, { marginTop: spacing.sm }]}>
              <Chip label={form.date} selected onPress={() => setPicking(true)} />
              {[8, 12, 18, 19, 20].map((h) => (
                <Chip key={h} label={`${h}:00`} selected={form.hour === h} onPress={() => setForm({ ...form, hour: h })} />
              ))}
            </View>
            <View style={[styles.row, { marginTop: spacing.sm }]}>
              {[30, 45, 60, 90].map((m) => (
                <Chip key={m} label={`${m} min`} selected={form.minutes === m} onPress={() => setForm({ ...form, minutes: m })} />
              ))}
            </View>
            <View style={[styles.row, { marginTop: spacing.md }]}>
              <Button label="Cancel" variant="ghost" style={styles.flex} onPress={() => setForm(null)} />
              <Button
                label="Schedule"
                style={styles.flex}
                loading={create.isPending}
                disabled={form.title.trim().length < 3}
                onPress={() => {
                  const start = new Date(`${form.date}T00:00:00`);
                  start.setHours(form.hour, 0, 0, 0);
                  create.mutate(
                    { title: form.title.trim(), description: form.description.trim(), type: form.type, start, minutes: form.minutes },
                    { onSuccess: () => setForm(null), onError: fail },
                  );
                }}
              />
            </View>
            <DatePickerModal
              visible={picking}
              value={form.date}
              minDate={today}
              onChange={(date) => setForm({ ...form, date })}
              onClose={() => setPicking(false)}
              title="Session date"
            />
          </Card>
        ) : (
          <Button
            label="Schedule a session"
            variant="secondary"
            onPress={() => setForm({ title: '', description: '', type: 'support_circle', date: today, hour: 19, minutes: 60 })}
          />
        )
      ) : null}
    </View>
  );
}

function People({
  groupId,
  members,
  pending,
  myRole,
  meId,
  onPerson,
}: {
  groupId: string;
  members: GroupMember[];
  pending: { user_id: string; pseudonym: string }[];
  myRole: GroupRole | null;
  meId?: string;
  onPerson: (m: GroupMember) => void;
}) {
  const { colors, typography, spacing } = useTheme();
  const showToast = useRootStore((s) => s.showToast);
  const decide = useDecideRequest(groupId);
  const fail = (e: unknown) => showToast({ type: 'error', message: groupErrorText(e) });
  return (
    <View style={{ gap: 8 }}>
      {pending.length > 0 ? (
        <Card style={{ padding: spacing.base }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>Asking to join</Text>
          {pending.map((p) => (
            <View key={p.user_id} style={[styles.rowBetween, { marginTop: spacing.sm }]}>
              <Text style={[typography.body, styles.flex, { color: colors.text.primary }]} numberOfLines={1}>
                {p.pseudonym}
              </Text>
              <Button label="Decline" size="sm" variant="ghost" onPress={() => decide.mutate({ userId: p.user_id, approve: false }, { onError: fail })} />
              <Button label="Approve" size="sm" onPress={() => decide.mutate({ userId: p.user_id, approve: true }, { onError: fail })} />
            </View>
          ))}
        </Card>
      ) : null}
      {members.map((m) => {
        const manageable = m.user_id !== meId && rankOf(myRole) >= 3 && rankOf(m.role) < rankOf(myRole);
        return (
          <PressableScale
            key={m.user_id}
            disabled={!manageable}
            onPress={() => onPerson(m)}
            accessibilityRole={manageable ? 'button' : undefined}
            style={[styles.person, { backgroundColor: colors.surface }]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.surface1 }]}>
              <Text style={[typography.bodyBold, { color: colors.text.secondary }]}>{m.pseudonym.slice(0, 1).toUpperCase()}</Text>
            </View>
            <Text style={[typography.body, styles.flex, { color: colors.text.primary }]} numberOfLines={1}>
              {m.user_id === meId ? `${m.pseudonym} (you)` : m.pseudonym}
            </Text>
            {m.role !== 'member' ? <Badge label={ROLE_LABEL[m.role]} variant={m.role === 'owner' ? 'primary' : 'neutral'} /> : null}
            {manageable ? <Ionicons name="chevron-forward" size={16} color={colors.text.muted} /> : null}
          </PressableScale>
        );
      })}
    </View>
  );
}

function PersonSheet({ groupId, person, myRole, onClose }: { groupId: string; person: GroupMember | null; myRole: GroupRole | null; onClose: () => void }) {
  const { colors, typography, spacing } = useTheme();
  const showAlert = useRootStore((s) => s.showAlert);
  const showToast = useRootStore((s) => s.showToast);
  const setRole = useSetRole(groupId);
  const remove = useRemoveMember(groupId);
  const fail = (e: unknown) => showToast({ type: 'error', message: groupErrorText(e) });
  const roles: GroupRole[] = (['admin', 'moderator', 'facilitator', 'member'] as GroupRole[]).filter((r) => rankOf(r) < rankOf(myRole));
  return (
    <AppBottomSheetModal visible={Boolean(person)} onClose={onClose} title={person?.pseudonym ?? ''} subtitle={person ? ROLE_LABEL[person.role] : ''}>
      {rankOf(myRole) >= 4 ? (
        <>
          <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>Role</Text>
          <View style={[styles.row, { marginTop: spacing.sm }]}>
            {roles.map((r) => (
              <Chip
                key={r}
                label={ROLE_LABEL[r]}
                selected={person?.role === r}
                onPress={() => person && setRole.mutate({ userId: person.user_id, role: r }, { onSuccess: onClose, onError: fail })}
              />
            ))}
          </View>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
            Facilitators can write notes and schedule sessions. Moderators approve requests, hide messages and remove members.
          </Text>
        </>
      ) : null}
      <Button
        label="Remove from group"
        variant="ghost"
        style={{ marginTop: spacing.md }}
        onPress={() =>
          person &&
          showAlert({
            title: `Remove ${person.pseudonym}?`,
            message: 'They leave the group and can’t rejoin.',
            confirmText: 'Remove',
            destructive: true,
            onConfirm: () => remove.mutate(person.user_id, { onSuccess: onClose, onError: fail }),
          })
        }
      />
    </AppBottomSheetModal>
  );
}

function Settings({ groupId, kind, joinMode, rules }: { groupId: string; kind: GroupKind; joinMode: 'open' | 'approval'; rules: string }) {
  const { colors, typography, spacing } = useTheme();
  const showToast = useRootStore((s) => s.showToast);
  const save = useGroupSettings(groupId);
  const [k, setK] = useState<GroupKind>(kind);
  const [mode, setMode] = useState(joinMode);
  const [text, setText] = useState(rules);
  const dirty = k !== kind || mode !== joinMode || text.trim() !== rules;
  return (
    <Card style={{ padding: spacing.base, marginBottom: spacing.md }}>
      <Text style={[typography.subheading, { color: colors.text.primary }]}>Manage group</Text>
      <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: spacing.md }]}>What kind of group</Text>
      <View style={[styles.row, { marginTop: spacing.sm }]}>
        {(Object.keys(KIND_LABEL) as GroupKind[]).map((x) => (
          <Chip key={x} label={KIND_LABEL[x]} selected={k === x} onPress={() => setK(x)} />
        ))}
      </View>
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
        Choose professionally facilitated only if a qualified professional runs it; we confirm on the verification call.
      </Text>
      <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: spacing.md }]}>Who can join</Text>
      <View style={[styles.row, { marginTop: spacing.sm }]}>
        <Chip label="Anyone eligible" selected={mode === 'open'} onPress={() => setMode('open')} />
        <Chip label="By approval" selected={mode === 'approval'} onPress={() => setMode('approval')} />
      </View>
      <TextField label="Rules" value={text} onChangeText={setText} maxLength={1000} multiline containerStyle={{ marginTop: spacing.sm }} />
      <Button
        label="Save changes"
        disabled={!dirty || text.trim().length < 20}
        loading={save.isPending}
        style={{ marginTop: spacing.md }}
        onPress={() =>
          save.mutate(
            { kind: k, joinMode: mode, rules: text.trim() },
            {
              onSuccess: () => showToast({ type: 'success', message: 'Group updated.' }),
              onError: (e) => showToast({ type: 'error', message: groupErrorText(e) }),
            },
          )
        }
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  flex: { flex: 1 },
  msg: { borderRadius: 18, padding: 12 },
  person: { alignItems: 'center', borderRadius: 16, flexDirection: 'row', gap: 12, padding: 12 },
  react: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', height: 28, justifyContent: 'center', minWidth: 36, paddingHorizontal: 8 },
  row: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rowBetween: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
});
