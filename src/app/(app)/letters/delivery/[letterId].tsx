import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Header } from '../../../../components/ui/Header';
import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { SquircleSurface } from '../../../../components/ui/SquircleSurface';
import {
  hoursUntil,
  letterErrorText,
  useDeclineLetter,
  useLetterInbox,
  useLetterOutbox,
  useOpenLetter,
  usePseudonyms,
} from '../../../../services/supabase/letters';
import { useRootStore } from '../../../../stores/useRootStore';
import { useTheme } from '../../../../theme/useTheme';

/** One letter. Opening an arrived letter marks it read; you can reply or decline. */
export default function LetterScreen() {
  const router = useRouter();
  const { letterId } = useLocalSearchParams<{ letterId: string }>();
  const { colors, typography, spacing } = useTheme();
  const showAlert = useRootStore((s) => s.showAlert);
  const inbox = useLetterInbox(true);
  const outbox = useLetterOutbox(true);
  const open = useOpenLetter();
  const decline = useDeclineLetter();

  const incoming = inbox.data?.find((l) => l.id === letterId);
  const letter = incoming ?? outbox.data?.find((l) => l.id === letterId);
  const otherId = letter ? (incoming ? letter.sender_id : letter.recipient_id) : '';
  const names = usePseudonyms(otherId ? [otherId] : [], Boolean(otherId));
  const who = names.data?.[otherId] ?? (incoming ? 'A pen pal' : 'your pen pal');

  // Mark read once, when an arrived letter is first shown to its recipient.
  const marked = useRef(false);
  useEffect(() => {
    if (incoming && incoming.status !== 'opened' && !marked.current) {
      marked.current = true;
      open.mutate(incoming.id);
    }
  }, [incoming, open]);

  if (inbox.isLoading || outbox.isLoading) {
    return (
      <ScreenWrapper scrollable>
        <Header title="Letter" showBack />
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </ScreenWrapper>
    );
  }

  if (!letter) {
    return (
      <ScreenWrapper scrollable>
        <Header title="Letter" showBack />
        <Card style={{ padding: spacing.lg }}>
          <Text style={[typography.body, { color: colors.text.secondary }]}>
            This letter isn’t available. It may have been declined or isn’t delivered yet.
          </Text>
        </Card>
      </ScreenWrapper>
    );
  }

  const waiting = hoursUntil(letter.scheduled_delivery_at);
  const onDecline = () =>
    showAlert({
      title: 'Decline this letter?',
      message: `${who} won’t be told why. You can still block them from Safety.`,
      confirmText: 'Decline',
      destructive: true,
      onConfirm: () =>
        decline.mutate(letter.id, {
          onSuccess: () => router.back(),
          onError: (e) => showAlert({ title: 'Couldn’t decline', message: letterErrorText(e), confirmText: 'OK', cancelText: null }),
        }),
    });

  return (
    <ScreenWrapper
      scrollable
      footer={
        incoming ? (
          <View style={styles.actions}>
            <Button label="Decline" variant="secondary" onPress={onDecline} style={styles.flex} />
            <Link href={`/(app)/letters/compose?to=${letter.sender_id}&name=${encodeURIComponent(who)}` as Href} asChild>
              <Button label="Reply" style={styles.flex} />
            </Link>
          </View>
        ) : undefined
      }
    >
      <Header title={incoming ? `From ${who}` : `To ${who}`} subtitle={new Date(letter.sent_at).toLocaleDateString()} showBack />
      <Card style={{ padding: spacing.lg }}>
        <SquircleSurface shape="circle" fill={colors.primaryAlpha} style={styles.icon}>
          <Ionicons name={waiting > 0 ? 'paper-plane-outline' : 'mail-open-outline'} size={22} color={colors.primary} />
        </SquircleSurface>
        <Text style={[typography.body, { color: colors.text.primary, marginTop: spacing.md, lineHeight: 24 }]}>
          {letter.assembled_body}
        </Text>
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>
          {waiting > 0
            ? `On its way. Arrives in about ${waiting} hour${waiting === 1 ? '' : 's'}.`
            : letter.opened_at
              ? `Read ${new Date(letter.opened_at).toLocaleString()}`
              : `Arrived ${new Date(letter.scheduled_delivery_at).toLocaleString()}`}
        </Text>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10 },
  icon: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
});
