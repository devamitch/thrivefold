import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';

type Status = 'active' | 'not_installed' | 'not_available';

const COMPONENTS: { title: string; status: Status; body: string }[] = [
  {
    title: 'Safety and routine rules',
    status: 'active',
    body: "Picks today's suggestion from your check-in, and switches to rest and care guidance when you report severe pain.",
  },
  {
    title: 'Pattern finder',
    status: 'active',
    body: 'Compares weeks, links sleep, stress, mood and energy, and spots recurring symptoms. It stays quiet until there are enough check-ins.',
  },
  {
    title: 'Note search',
    status: 'active',
    body: 'Ranks your journal entries and memories by relevance to the words you search for.',
  },
  {
    title: 'Wording classifier',
    status: 'active',
    body: 'Recognises tiredness, stress, pain and low mood in short text, ignoring negations like "not tired". Safety phrases always surface support options.',
  },
  {
    title: 'On-device language model',
    status: 'not_installed',
    body: 'No language model ships with this build. Everything above works without one.',
  },
  {
    title: 'Cloud AI',
    status: 'not_available',
    body: 'No server is configured, so nothing can be sent anywhere.',
  },
];

const BADGE: Record<Status, { label: string; variant: 'success' | 'neutral' }> = {
  active: { label: 'Running', variant: 'success' },
  not_installed: { label: 'Not installed', variant: 'neutral' },
  not_available: { label: 'Not available', variant: 'neutral' },
};

export default function ModelStatusScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenWrapper scrollable>
      <Header title="On this device" subtitle="What powers suggestions and patterns" showBack />
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        {COMPONENTS.map((c) => (
          <Card key={c.title} style={{ marginBottom: spacing.sm }}>
            <View style={styles.row}>
              <View style={[styles.row, { flex: 1 }]}>
                <Ionicons
                  name={c.status === 'active' ? 'checkmark-circle' : 'remove-circle-outline'}
                  size={20}
                  color={c.status === 'active' ? colors.success : colors.text.muted}
                />
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8, flex: 1 }]}>
                  {c.title}
                </Text>
              </View>
              <Badge label={BADGE[c.status].label} variant={BADGE[c.status].variant} />
            </View>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6 }]}>{c.body}</Text>
          </Card>
        ))}
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
          All of these work offline. None of them diagnose; they describe your own records.
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
