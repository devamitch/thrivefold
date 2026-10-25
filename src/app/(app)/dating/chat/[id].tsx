import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ChipComposer } from '../../../../components/dating/ChipComposer';
import { Card } from '../../../../components/ui/Card';
import { Header } from '../../../../components/ui/Header';
import { PressableScale } from '../../../../components/ui/PressableScale';
import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { SquircleSurface } from '../../../../components/ui/SquircleSurface';
import {
  datingErrorText,
  myUserId,
  useBlockPerson,
  useCloseConversation,
  useDatingConversations,
  useDatingMessages,
  useMarkConversationRead,
  useSendDatingMessage,
} from '../../../../services/supabase/dating';
import { useRootStore } from '../../../../stores/useRootStore';
import { useTheme } from '../../../../theme/useTheme';

/** One dating conversation: card messages, end it, block or report. */
export default function DatingChatScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { colors, typography, spacing } = useTheme();
  const showAlert = useRootStore((s) => s.showAlert);
  const me = useQuery({ queryKey: ['server', 'me'], queryFn: myUserId });
  const messages = useDatingMessages(id, true);
  const conversations = useDatingConversations(true);
  const conv = conversations.data?.find((c) => c.id === id);
  const send = useSendDatingMessage(id);
  const markRead = useMarkConversationRead();
  const close = useCloseConversation();
  const block = useBlockPerson();
  const who = conv?.other_pseudonym ?? name ?? 'Your match';
  const open = conv?.status !== 'closed';

  // Mark incoming messages read whenever new ones arrive while the chat is open.
  const lastSeen = useRef(0);
  const incoming = (messages.data ?? []).filter((m) => m.sender_id !== me.data && !m.read_at).length;
  useEffect(() => {
    if (incoming > 0 && incoming !== lastSeen.current) {
      lastSeen.current = incoming;
      markRead.mutate(id);
    }
  }, [incoming, id, markRead]);

  const actions = () =>
    showAlert({
      title: who,
      message: 'End the conversation, or block them everywhere in Thrivefold. You can also report from Safety.',
      confirmText: 'Block',
      cancelText: 'End conversation',
      destructive: true,
      onConfirm: () =>
        conv &&
        block.mutate(conv.other_id, {
          onSuccess: () => router.replace('/(app)/dating' as Href),
          onError: (e) => showAlert({ title: 'Not blocked', message: datingErrorText(e), confirmText: 'OK', cancelText: null }),
        }),
      onCancel: () => close.mutate(id),
    });

  return (
    <ScreenWrapper
      scrollable
      footer={
        open ? (
          <ChipComposer
            sending={send.isPending}
            onSend={(chipIds) =>
              send.mutate(chipIds, {
                onError: (e) => showAlert({ title: 'Not sent', message: datingErrorText(e), confirmText: 'OK', cancelText: null }),
              })
            }
          />
        ) : undefined
      }
    >
      <Header
        title={who}
        subtitle={open ? 'Messages made of cards' : 'Conversation ended'}
        showBack
        rightAction={
          <PressableScale onPress={actions} accessibilityRole="button" accessibilityLabel="Conversation options">
            <SquircleSurface shape="circle" fill={colors.surface1} style={styles.iconBtn}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.primary} />
            </SquircleSurface>
          </PressableScale>
        }
      />
      <View style={{ gap: 8 }}>
        {messages.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : messages.error ? (
          <Card style={{ padding: spacing.lg }}>
            <Text style={[typography.body, { color: colors.text.secondary }]}>{datingErrorText(messages.error)}</Text>
          </Card>
        ) : (
          (messages.data ?? []).map((m) => {
            const mine = m.sender_id === me.data;
            return (
              <View key={m.id} style={[styles.bubbleRow, { justifyContent: mine ? 'flex-end' : 'flex-start' }]}>
                <SquircleSurface radius={20} fill={mine ? colors.primary : colors.surface} style={styles.bubble}>
                  <Text style={[typography.body, { color: mine ? colors.onPrimary : colors.text.primary }]}>{m.body}</Text>
                  <Text style={[typography.caption, { color: mine ? colors.onPrimaryMuted : colors.text.muted, marginTop: 4 }]}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    {mine && m.read_at ? ' · Read' : ''}
                  </Text>
                </SquircleSurface>
              </View>
            );
          })
        )}
        {!open ? (
          <Text style={[typography.caption, { color: colors.text.muted, textAlign: 'center', marginTop: spacing.md }]}>
            This conversation has ended. No more messages can be sent.
          </Text>
        ) : null}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  iconBtn: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  bubbleRow: { flexDirection: 'row' },
  bubble: { maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 10 },
});
