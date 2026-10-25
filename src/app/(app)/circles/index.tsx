import { Link, type Href } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SettingsRow } from '../../../components/ui/SettingsRow';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { TextField } from '../../../components/ui/TextField';
import { policyConfig } from '../../../domain/policy/engine';
import {
  communityErrorText,
  useCommunities,
  useCreateCommunity,
  useJoinCommunity,
  useMyMemberships,
  useServerGates,
  type Community,
} from '../../../services/supabase/queries';
import { isBackendConfigured } from '../../../services/supabase/supabaseClient';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const TOPICS = ['Gym partners', 'Therapy and support', 'Meditation', 'Aerobics', 'Sports', 'Running', 'Yoga'] as const;
const JOIN_AT = policyConfig.progressionGates.join_community;
const CREATE_AT = policyConfig.progressionGates.create_community;

/**
 * Groups for training, therapy and practice. Joining opens at level 6 and creating at
 * level 10; the server re-checks both from its own ledger, plus the age check. A new
 * group works for its organiser straight away and is listed after a verification call.
 */
export default function CirclesScreen() {
  const { colors, typography, spacing } = useTheme();
  const { user, localLevel, showToast } = useRootStore(
    useShallow((s) => ({ user: s.user, localLevel: s.level, showToast: s.showToast })),
  );
  const signedIn = Boolean(user && !user.isGuest && user.email) && isBackendConfigured;
  const gates = useServerGates(signedIn);
  const level = gates.data?.level ?? localLevel;
  const ageOk = gates.data?.age_verified ?? user?.isAgeVerified ?? false;
  const canJoin = signedIn && level >= JOIN_AT && ageOk;
  const canCreate = canJoin && level >= CREATE_AT;

  const list = useCommunities(canJoin);
  const mine = useMyMemberships(canJoin);
  const join = useJoinCommunity();
  const create = useCreateCommunity();

  const [topic, setTopic] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; purpose: string; topic: string } | null>(null);

  const groups = (list.data ?? []).filter((c) => !topic || c.topic === topic);
  const member = new Set(mine.data ?? []);

  const toggle = (c: Community) =>
    join.mutate(
      { id: c.id, leave: member.has(c.id) },
      { onError: (e) => showToast({ type: 'error', message: communityErrorText(e) }) },
    );

  const submit = () => {
    if (!form) return;
    create.mutate(form, {
      onSuccess: () => {
        setForm(null);
        showToast({ type: 'success', message: 'Group created. It is listed for others after a short verification call.' });
      },
      onError: (e) => showToast({ type: 'error', message: communityErrorText(e) }),
    });
  };

  const lock = !signedIn
    ? { title: 'Groups need an account', body: 'Sign in with Google so the server can check your level and keep groups safe.' }
    : level < JOIN_AT
      ? { title: `Groups open at level ${JOIN_AT}`, body: `You're level ${level}. Quests, workouts and check-ins move you up.` }
      : !ageOk
        ? { title: 'Confirm your age to join', body: 'Groups are for verified adults. A two-minute check with an independent provider; Thrivefold keeps only the result.' }
        : null;

  return (
    <ScreenContainer header={<AppHeader title="Circles" subtitle="Training, support and practice groups" showBack />} scrollMode="shell-scroll-view">
      {lock ? (
        <SquircleSurface radius={22} fill={colors.surface} style={[styles.card, { padding: spacing.lg }]}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>{lock.title}</Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>{lock.body}</Text>
          {signedIn && level < JOIN_AT ? (
            <View style={[styles.track, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
              <View style={[styles.fill, { backgroundColor: colors.primary, width: `${Math.min(100, (level / JOIN_AT) * 100)}%` }]} />
            </View>
          ) : null}
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>
            Join from level {JOIN_AT}. Start your own group from level {CREATE_AT}.
          </Text>
          {signedIn && level >= JOIN_AT && !ageOk ? (
            <Link href={'/(app)/you/age-check' as Href} asChild>
              <Button label="Start age check" size="sm" style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} />
            </Link>
          ) : null}
          {signedIn && level < JOIN_AT ? (
            <Link href={'/(app)/quests' as Href} asChild>
              <Button label="See today's quests" size="sm" variant="outline" style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} />
            </Link>
          ) : null}
        </SquircleSurface>
      ) : (
        <>
          <View style={[styles.chips, { marginBottom: spacing.md }]}>
            <Chip label="All" selected={!topic} onPress={() => setTopic(null)} />
            {TOPICS.map((t) => (
              <Chip key={t} label={t} selected={topic === t} onPress={() => setTopic(t)} />
            ))}
          </View>

          {list.isPending ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : list.isError ? (
            <SquircleSurface radius={18} fill={colors.surface1} style={styles.card}>
              <Text style={[typography.subbody, { color: colors.text.secondary }]}>{communityErrorText(list.error)}</Text>
              <Button label="Try again" size="sm" variant="outline" onPress={() => list.refetch()} style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }} />
            </SquircleSurface>
          ) : groups.length === 0 ? (
            <SquircleSurface radius={18} fill={colors.surface1} style={styles.card}>
              <Text style={[typography.subbody, { color: colors.text.secondary }]}>
                {topic ? `No ${topic.toLowerCase()} groups yet.` : 'No groups yet.'}
                {canCreate ? ' You can start the first one.' : ` Groups you can join will appear here; you can start one from level ${CREATE_AT}.`}
              </Text>
            </SquircleSurface>
          ) : (
            groups.map((c) => (
              <SettingsRow
                key={c.id}
                icon={member.has(c.id) ? 'checkmark-circle' : 'people-outline'}
                title={c.name}
                subtitle={[c.topic, c.verification_status === 'pending_founder_call' ? 'Waiting for verification' : null, c.purpose].filter(Boolean).join(' · ')}
                right={
                  c.created_by === null || c.verification_status === 'verified' ? (
                    <Button label={member.has(c.id) ? 'Leave' : 'Join'} size="sm" variant={member.has(c.id) ? 'outline' : 'primary'} onPress={() => toggle(c)} disabled={join.isPending} />
                  ) : undefined
                }
              />
            ))
          )}

          {canCreate ? (
            form ? (
              <SquircleSurface radius={22} fill={colors.surface} style={[styles.card, { marginTop: spacing.md }]}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>Start a group</Text>
                <TextField label="Name" value={form.name} onChangeText={(name) => setForm({ ...form, name })} maxLength={60} placeholder="Morning lifting partners" />
                <TextField
                  label="What it's for"
                  value={form.purpose}
                  onChangeText={(purpose) => setForm({ ...form, purpose })}
                  maxLength={280}
                  multiline
                  placeholder="Who it's for, where and when you meet"
                />
                <View style={[styles.chips, { marginTop: spacing.sm }]}>
                  {TOPICS.map((t) => (
                    <Chip key={t} label={t} selected={form.topic === t} onPress={() => setForm({ ...form, topic: t })} />
                  ))}
                </View>
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>
                  Your group works for you and anyone you invite right away. Before others can find it, we verify the organiser on a short call.
                </Text>
                <View style={[styles.row, { marginTop: spacing.md }]}>
                  <Button label="Cancel" variant="ghost" onPress={() => setForm(null)} style={styles.flex} />
                  <Button label="Create" onPress={submit} loading={create.isPending} disabled={form.name.trim().length < 3 || form.purpose.trim().length < 10} style={styles.flex} />
                </View>
              </SquircleSurface>
            ) : (
              <SettingsRow icon="add-circle-outline" title="Start a group" subtitle="Gym, therapy, meditation, sports and more" onPress={() => setForm({ name: '', purpose: '', topic: topic ?? TOPICS[0] })} />
            )
          ) : (
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>
              You can start your own group from level {CREATE_AT}. You&apos;re level {level}.
            </Text>
          )}
        </>
      )}

      <Link href={'/(app)/circles/invitations' as Href} asChild>
        <SettingsRow icon="mail-open-outline" title="Invitations" subtitle="Groups that invited you" />
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, padding: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fill: { borderRadius: 3, height: '100%' },
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: 10 },
  track: { borderRadius: 3, height: 6, overflow: 'hidden' },
});
