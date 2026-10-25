import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { LetterRow } from '../../../components/letters/LetterRow';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { letterErrorText, useLetterInbox, usePseudonyms } from '../../../services/supabase/letters';
import { useTheme } from '../../../theme/useTheme';

export default function LetterInboxScreen() {
  const { colors, typography, spacing } = useTheme();
  const inbox = useLetterInbox(true);
  const names = usePseudonyms((inbox.data ?? []).map((l) => l.sender_id), true);

  return (
    <ScreenWrapper scrollable>
      <Header title="Inbox" subtitle="Letters that have arrived for you" showBack />
      <View>
        {inbox.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : inbox.error ? (
          <Card style={{ padding: spacing.lg }}>
            <Text style={[typography.body, { color: colors.text.secondary }]}>{letterErrorText(inbox.error)}</Text>
          </Card>
        ) : (inbox.data ?? []).length === 0 ? (
          <Card style={{ padding: spacing.lg }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>No letters yet</Text>
            <Text style={[typography.body, { color: colors.text.secondary, marginTop: 6 }]}>
              Letters appear here once they arrive, about 12 hours after someone sends one.
            </Text>
          </Card>
        ) : (
          (inbox.data ?? []).map((l) => (
            <LetterRow key={l.id} letter={l} who={names.data?.[l.sender_id] ?? 'A pen pal'} direction="in" />
          ))
        )}
      </View>
    </ScreenWrapper>
  );
}
