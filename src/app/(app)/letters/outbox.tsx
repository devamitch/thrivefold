import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { LetterRow } from '../../../components/letters/LetterRow';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { letterErrorText, useLetterOutbox, usePseudonyms } from '../../../services/supabase/letters';
import { useTheme } from '../../../theme/useTheme';

export default function LetterOutboxScreen() {
  const { colors, typography, spacing } = useTheme();
  const outbox = useLetterOutbox(true);
  const names = usePseudonyms((outbox.data ?? []).map((l) => l.recipient_id), true);

  return (
    <ScreenWrapper scrollable>
      <Header title="Sent" subtitle="Letters you sent and where they are" showBack />
      <View>
        {outbox.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : outbox.error ? (
          <Card style={{ padding: spacing.lg }}>
            <Text style={[typography.body, { color: colors.text.secondary }]}>{letterErrorText(outbox.error)}</Text>
          </Card>
        ) : (outbox.data ?? []).length === 0 ? (
          <Card style={{ padding: spacing.lg }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>Nothing sent yet</Text>
            <Text style={[typography.body, { color: colors.text.secondary, marginTop: 6 }]}>
              Letters you send show here, with the time left until they arrive.
            </Text>
          </Card>
        ) : (
          (outbox.data ?? []).map((l) => (
            <LetterRow key={l.id} letter={l} who={names.data?.[l.recipient_id] ?? 'your pen pal'} direction="out" />
          ))
        )}
      </View>
    </ScreenWrapper>
  );
}
