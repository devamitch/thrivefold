import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
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
  useStartConversation,
  type DatingCandidate,
} from '../../../services/supabase/dating';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

/** Dating home: people to meet and your conversations. Every rule is checked on the server. */
export default function DatingScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const showAlert = useRootStore((s) => s.showAlert);
  const [tab, setTab] = useState<'discover' | 'chats'>('discover');
  const [hello, setHello] = useState<DatingCandidate | null>(null);

  const profile = useDatingProfile(true);
  const hasProfile = Boolean(profile.data);
  const candidates = useDatingCandidates(hasProfile && tab === 'discover');
  const chats = useDatingConversations(hasProfile);
  const start = useStartConversation();
  const unread = (chats.data ?? []).reduce((n, c) => n + c.unread, 0);
  const canStart = profile.data?.gender === 'woman';

  const errorCard = (e: unknown) => (
    <Card style={{ padding: spacing.lg }}>
      <Text style={[typography.body, { color: colors.text.secondary }]}>{datingErrorText(e)}</Text>
    </Card>
  );

  return (
    <ScreenWrapper scrollable>
      <Header
        title="Dating"
        subtitle="Verified adults, messages made of cards"
        showBack
        rightAction={
          <Link href={'/(app)/dating/profile' as Href} asChild>
            <PressableScale accessibilityRole="button" accessibilityLabel="Your dating profile">
              <SquircleSurface shape="circle" fill={colors.surface1} style={styles.iconBtn}>
                <Ionicons name="person-circle-outline" size={22} color={colors.text.primary} />
              </SquircleSurface>
            </PressableScale>
          </Link>
        }
      />
      <View>
        {profile.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : profile.error ? (
          errorCard(profile.error)
        ) : !hasProfile ? (
          <Card style={{ padding: spacing.lg }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>Set up your dating profile</Text>
            <Text style={[typography.body, { color: colors.text.secondary, marginTop: 6 }]}>
              Say how you identify and who you’d like to meet. No photos, no exact location, no contact details. Women send the
              first message; anyone can reply. You can pause or delete your profile any time.
            </Text>
            <Link href={'/(app)/dating/profile' as Href} asChild>
              <Button label="Set up profile" style={{ marginTop: spacing.md }} />
            </Link>
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
                      In Thrivefold dating, women send the first message. People you match with can write to you, and you can
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
                        {canStart ? <Button label="Say hello" size="sm" onPress={() => setHello(c)} /> : null}
                      </View>
                      {c.intro ? <Text style={[typography.body, { color: colors.text.secondary, marginTop: 8 }]}>{c.intro}</Text> : null}
                      {(c.shared_interests ?? []).length > 0 || (c.shared_languages ?? []).length > 0 ? (
                        <View style={[styles.common, { backgroundColor: colors.primaryAlpha }]}>
                          <Ionicons name="sparkles-outline" size={14} color={colors.primary} />
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

      <AppBottomSheetModal visible={Boolean(hello)} onClose={() => setHello(null)} title={`Say hello to ${hello?.pseudonym ?? ''}`} subtitle="Up to six cards. You can start three new conversations a day.">
        <ChipComposer
          sending={start.isPending}
          sendLabel="Send hello"
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
