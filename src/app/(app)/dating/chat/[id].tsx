import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ChipComposer } from '../../../../components/dating/ChipComposer';
import { AppBottomSheetModal } from '../../../../components/ui/AppBottomSheetModal';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Chip } from '../../../../components/ui/Chip';
import { Header } from '../../../../components/ui/Header';
import { PressableScale } from '../../../../components/ui/PressableScale';
import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { SquircleSurface } from '../../../../components/ui/SquircleSurface';
import {
  REPORT_LABEL,
  datingErrorText,
  myUserId,
  useBlockPerson,
  useCloseConversation,
  useDatingConversations,
  useDatingMessages,
  useMarkConversationRead,
  useReportDatingConversation,
  useSendDatingMessage,
  type DatingReportCategory,
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

  const report = useReportDatingConversation();
  const [sheet, setSheet] = useState<'menu' | 'report' | null>(null);
  const [reason, setReason] = useState<DatingReportCategory | null>(null);
  const fail = (title: string) => (e: unknown) =>
    showAlert({ title, message: datingErrorText(e), confirmText: 'OK', cancelText: null });

  const endConversation = () => {
    setSheet(null);
    showAlert({
      title: 'End this conversation?',
      message: `Neither of you can send more messages. ${who} isn’t told why.`,
      confirmText: 'End conversation',
      cancelText: 'Keep talking',
      destructive: true,
      onConfirm: () => close.mutate(id, { onError: fail('Not ended') }),
    });
  };

  const blockPerson = () => {
    setSheet(null);
    showAlert({
      title: `Block ${who}?`,
      message: 'They can’t see or contact you anywhere in Thrivefold: dating, letters or groups.',
      confirmText: 'Block',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: () =>
        conv &&
        block.mutate(conv.other_id, {
          onSuccess: () => router.replace('/(app)/dating' as Href),
          onError: fail('Not blocked'),
        }),
    });
  };

  const sendReport = () =>
    reason &&
    report.mutate(
      { conversationId: id, category: reason, block: true },
      {
        onSuccess: () => {
          setSheet(null);
          setReason(null);
          showAlert({
            title: 'Report sent',
            message: 'Thank you. A moderator will review the messages. You won’t hear from this person again.',
            confirmText: 'OK',
            cancelText: null,
            onConfirm: () => router.replace('/(app)/dating' as Href),
          });
        },
        onError: fail('Report not sent'),
      },
    );

  const actions = () => setSheet('menu');

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

      <AppBottomSheetModal visible={sheet === 'menu'} onClose={() => setSheet(null)} title={who}>
        <View style={{ gap: 10 }}>
          {open ? <Button label="End conversation" variant="secondary" onPress={endConversation} /> : null}
          <Button label="Report" variant="secondary" onPress={() => setSheet('report')} />
          <Button label={`Block ${who}`} variant="ghost" onPress={blockPerson} />
        </View>
      </AppBottomSheetModal>

      <AppBottomSheetModal
        visible={sheet === 'report'}
        onClose={() => setSheet(null)}
        title={`Report ${who}`}
        subtitle="The card messages in this chat go to a moderator. You also block them."
        footer={
          <Button
            label={reason ? 'Send report and block' : 'Choose a reason'}
            disabled={!reason || report.isPending}
            loading={report.isPending}
            onPress={sendReport}
          />
        }
      >
        <View style={styles.wrap}>
          {(Object.keys(REPORT_LABEL) as DatingReportCategory[]).map((k) => (
            <Chip key={k} label={REPORT_LABEL[k]} selected={reason === k} onPress={() => setReason(k)} />
          ))}
        </View>
      </AppBottomSheetModal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  iconBtn: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  bubbleRow: { flexDirection: 'row' },
  bubble: { maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
