import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ChipComposer } from '../../../components/dating/ChipComposer';
import { AppBottomSheetModal } from '../../../components/ui/AppBottomSheetModal';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Header } from '../../../components/ui/Header';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import {
  INTENTION_LABEL,
  PACE_LABEL,
  datingErrorText,
  useDatingCandidates,
  useDatingConversations,
  useDatingProfile,
  useSaveDatingProfile,
  useStartConversation,
  type DatingCandidate,
  type DatingGender,
} from '../../../services/supabase/dating';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

/** Letter exchange: verified adults, unhurried correspondence. */
export default function DatingScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const showAlert = useRootStore((s) => s.showAlert);
  const experience = useRootStore((s) => s.experience);
  const onboarding = useRootStore((s) => s.onboarding);
  const [tab, setTab] = useState<'discover' | 'chats'>('discover');
  const [hello, setHello] = useState<DatingCandidate | null>(null);
  const [synthesizing, setSynthesizing] = useState(false);

  const profile = useDatingProfile(true);
  const hasProfile = Boolean(profile.data);
  const candidates = useDatingCandidates(hasProfile && tab === 'discover');
  const chats = useDatingConversations(hasProfile);
  const start = useStartConversation();
  const save = useSaveDatingProfile();
  const unread = (chats.data ?? []).reduce((n, c) => n + c.unread, 0);
  const canStart = profile.data?.gender === 'woman';

  // Smart auto-synthesis: rather than blocking the user with a questionnaire,
  // the app auto-derives the initial correspondence profile from the user's ongoing journey.
  useEffect(() => {
    if (!profile.isLoading && !profile.data && !profile.error && !save.isPending && !synthesizing) {
      setSynthesizing(true);
      const gender: DatingGender =
        experience === 'women_health' ? 'woman' : experience === 'men_health' ? 'man' : 'nonbinary';
      const interested_in: DatingGender[] =
        gender === 'woman' ? ['man', 'woman'] : gender === 'man' ? ['woman'] : ['woman', 'man', 'nonbinary'];
      const interests =
        onboarding?.goals && onboarding.goals.length > 0
          ? onboarding.goals.slice(0, 4)
          : ['Walks', 'Reading', 'Fitness', 'Nature'];

      save.mutate({
        gender,
        interested_in,
        interests,
        prompt_chip_ids: [],
        is_active: true,
        preferences: {
          age_band: '25-34',
          want_age_bands: ['18-24', '25-34', '35-44', '45-54', '55+'],
          languages: ['English'],
          intention: 'friendship_first',
          pace: 'slow',
        },
      });
    }
  }, [profile.isLoading, profile.data, profile.error, save.isPending, synthesizing, experience, onboarding]);

  const errorCard = (e: unknown) => (
    <Card style={{ padding: spacing.lg }}>
      <Text style={[typography.body, { color: colors.text.secondary }]}>{datingErrorText(e)}</Text>
    </Card>
  );

  return (
    <ScreenWrapper scrollable>
      <Header
        title="Letter Exchange"
        subtitle="Verified adults, thoughtful unhurried correspondence"
        showBack
        rightAction={
          <Link href={'/(app)/dating/profile' as Href} asChild>
            <PressableScale accessibilityRole="button" accessibilityLabel="Your correspondence profile">
              <SquircleSurface shape="circle" fill={colors.surface1} style={styles.iconBtn}>
                <Ionicons name="person-circle-outline" size={22} color={colors.text.primary} />
              </SquircleSurface>
            </PressableScale>
          </Link>
        }
      />
      <View>
        {profile.isLoading || synthesizing || save.isPending ? (
          <View style={{ alignItems: 'center', marginTop: spacing.xl, padding: spacing.lg }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.sm }]}>
              {synthesizing || save.isPending ? 'Preparing your correspondence profile...' : 'Loading letter exchange...'}
            </Text>
          </View>
        ) : profile.error ? (
          errorCard(profile.error)
        ) : !hasProfile ? (
          <Card style={{ padding: spacing.lg }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>Connecting to Letter Exchange</Text>
            <Text style={[typography.body, { color: colors.text.secondary, marginTop: 6 }]}>
              Thoughtful correspondence between verified adults.
            </Text>
            <Button
              label="Retry"
              style={{ marginTop: spacing.md }}
              onPress={() => {
                setSynthesizing(false);
                profile.refetch();
              }}
            />
          </Card>
        ) : (
          <>
            <View style={[styles.row, { marginBottom: spacing.md }]}>
              <Chip label="Discover" selected={tab === 'discover'} onPress={() => setTab('discover')} />
              <Chip label={unread > 0 ? `Chats · ${unread}` : 'Chats'} selected={tab === 'chats'} onPress={() => setTab('chats')} />
            </View>

            {tab === 'discover' ? (
              <>
                {!canStart ? (
                  <Card variant="surface1" style={{ padding: spacing.base, marginBottom: spacing.md }}>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>
                      In Thrivefold letter exchanges, women send the first note. People you connect with can write to you, and you can
                      reply in Chats.
                    </Text>
                  </Card>
                ) : null}
                {candidates.isLoading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : candidates.error ? (
                  errorCard(candidates.error)
                ) : (candidates.data ?? []).length === 0 ? (
                  <Card style={{ padding: spacing.lg }}>
                    <Text style={[typography.body, { color: colors.text.secondary }]}>
                      Nobody new right now. Only verified adults whose preferences match yours appear here.
                    </Text>
                  </Card>
                ) : (
                  (candidates.data ?? []).map((c) => (
                    <SquircleSurface key={c.user_id} radius={22} fill={colors.surface} style={styles.person}>
                      <View style={styles.rowBetween}>
                        <View style={styles.flex}>
                          <Text style={[typography.subheading, { color: colors.text.primary }]} numberOfLines={1}>
                            {c.pseudonym}
                          </Text>
                          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]} numberOfLines={2}>
                            {[c.age_band, c.intention ? INTENTION_LABEL[c.intention] : null, c.pace ? PACE_LABEL[c.pace] : null]
                              .filter(Boolean)
                              .join(' · ') || 'Verified adult'}
                          </Text>
                        </View>
                        {canStart ? <Button label="Send note" size="sm" onPress={() => setHello(c)} /> : null}
                      </View>
                      {c.intro ? <Text style={[typography.body, { color: colors.text.secondary, marginTop: 8 }]}>{c.intro}</Text> : null}
                      {(c.shared_interests ?? []).length > 0 || (c.shared_languages ?? []).length > 0 ? (
                        <View style={[styles.common, { backgroundColor: colors.primaryAlpha }]}>
                          <Ionicons name="link-outline" size={14} color={colors.primary} />
                          <Text style={[typography.captionBold, styles.flex, { color: colors.primary }]} numberOfLines={2}>
                            In common: {[...(c.shared_interests ?? []), ...(c.shared_languages ?? [])].join(', ')}
                          </Text>
                        </View>
                      ) : null}
                      {c.interests.length > 0 ? (
                        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]} numberOfLines={2}>
                          {c.interests.join(' · ')}
                          {(c.languages ?? []).length ? `  ·  Speaks ${c.languages.join(', ')}` : ''}
                        </Text>
                      ) : null}
                    </SquircleSurface>
                  ))
                )}
              </>
            ) : chats.isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : chats.error ? (
              errorCard(chats.error)
            ) : (chats.data ?? []).length === 0 ? (
              <Card style={{ padding: spacing.lg }}>
                <Text style={[typography.body, { color: colors.text.secondary }]}>No conversations yet.</Text>
              </Card>
            ) : (
              (chats.data ?? []).map((c) => (
                <Link key={c.id} href={`/(app)/dating/chat/${c.id}?name=${encodeURIComponent(c.other_pseudonym)}` as Href} asChild>
                  <PressableScale scaleTo={0.98} accessibilityRole="button" accessibilityLabel={`Conversation with ${c.other_pseudonym}`}>
                    <SquircleSurface radius={20} fill={colors.surface} style={styles.chat}>
                      <SquircleSurface shape="circle" fill={c.unread ? colors.primaryAlpha : colors.surface1} style={styles.avatar}>
                        <Text style={[typography.bodyBold, { color: c.unread ? colors.primary : colors.text.secondary }]}>
                          {c.other_pseudonym.slice(0, 1).toUpperCase()}
                        </Text>
                      </SquircleSurface>
                      <View style={styles.flex}>
                        <Text numberOfLines={1} style={[c.unread ? typography.bodyBold : typography.body, { color: colors.text.primary }]}>
                          {c.other_pseudonym}
                        </Text>
                        <Text numberOfLines={1} style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                          {c.status === 'closed' ? 'Conversation ended' : c.last_body ?? ''}
                        </Text>
                      </View>
                      {c.unread > 0 ? <Badge label={String(c.unread)} variant="primary" /> : null}
                    </SquircleSurface>
                  </PressableScale>
                </Link>
              ))
            )}
          </>
        )}
      </View>

      <AppBottomSheetModal visible={Boolean(hello)} onClose={() => setHello(null)} title={`Write to ${hello?.pseudonym ?? ''}`} subtitle="Up to six cards. You can start three new conversations a day.">
        <ChipComposer
          sending={start.isPending}
          sendLabel="Send note"
          onSend={(chipIds) =>
            hello &&
            start.mutate(
              { recipientId: hello.user_id, chipIds },
              {
                onSuccess: (id) => {
                  const name = hello.pseudonym;
                  setHello(null);
                  router.push(`/(app)/dating/chat/${id}?name=${encodeURIComponent(name)}` as Href);
                },
                onError: (e) => showAlert({ title: 'Not sent', message: datingErrorText(e), confirmText: 'OK', cancelText: null }),
              },
            )
          }
        />
      </AppBottomSheetModal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: 8 },
  rowBetween: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  iconBtn: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  person: { marginBottom: 10, padding: 16 },
  chat: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 8, padding: 14 },
  avatar: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  common: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', gap: 6, marginTop: 10, paddingHorizontal: 10, paddingVertical: 6 },
});
