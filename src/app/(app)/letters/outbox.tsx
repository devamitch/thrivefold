import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';

export default function LetterOutboxScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { outbox } = useRootStore(
    useShallow((s) => ({ outbox: s.outbox })),
  );

  return (
    <ScreenWrapper scrollable>
      <Header title="Postal Outbox" subtitle="Letters Dispatched Across Global Channels" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        {outbox.length > 0 ? (
          outbox.map((letter) => (
            <Card key={letter.id} style={{ marginBottom: spacing.md, padding: spacing.lg }}>
              <View style={styles.headerRow}>
                <Badge
                  label={letter.status === 'opened' ? 'Opened & Read' : 'Dispatched'}
                  variant={letter.status === 'opened' ? 'success' : 'primary'}
                />
                <Text style={[typography.caption, { color: colors.text.muted }]}>
                  {letter.distanceKm.toLocaleString()} km
                </Text>
              </View>

              <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                Letter to {letter.recipientPseudonym ?? 'your pen pal'}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                Dispatched on {new Date(letter.createdAt).toLocaleDateString()} · Delivered on {new Date(letter.scheduledDeliveryAt).toLocaleDateString()}
              </Text>

              <Button
                label="View Delivery Track"
                variant="outline"
                size="sm"
                style={{ marginTop: 12, alignSelf: 'flex-start' }}
                onPress={() => router.push(`/(app)/letters/delivery/${letter.id}` as any)}
              />
            </Card>
          ))
        ) : (
          <Card style={{ padding: spacing.xl, alignItems: 'center', marginTop: spacing.md }}>
            <Text style={[typography.subbody, { color: colors.text.secondary }]}>
              No dispatched letters yet. Compose a slow letter to begin!
            </Text>
          </Card>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
