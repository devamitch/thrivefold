import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { Link, type Href } from 'expo-router';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';

export default function LetterInboxDetailScreen() {
  const { colors, typography, spacing } = useTheme();
  const { inbox } = useRootStore(
    useShallow((s) => ({ inbox: s.inbox })),
  );

  return (
    <ScreenWrapper scrollable>
      <Header title="Inbox" subtitle="Letters to you and on their way" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        {inbox.map((letter) => {
          const isTransit = letter.status === 'in_transit';
          return (
            <Card key={letter.id} style={{ marginBottom: spacing.md, padding: spacing.lg }}>
              <SquircleSurface style={styles.headerRow}>
                <Badge
                  label={isTransit ? 'Traveling' : 'Delivered'}
                  variant={isTransit ? 'warning' : 'success'}
                />
                <Text style={[typography.caption, { color: colors.text.muted }]}>
                  {letter.distanceKm.toLocaleString()} km
                </Text>
              </SquircleSurface>

              <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                Letter from {letter.senderPseudonym ?? 'AuroraSeeker'}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                {isTransit
                  ? `In transit across regional postal channels · Arrives in ~${letter.deliveryHours}h`
                  : `Delivered on ${new Date(letter.scheduledDeliveryAt).toLocaleDateString()}`}
              </Text>

              <Link href={`/(app)/letters/delivery/${letter.id}` as any as Href} asChild>
                <Button
                  label={isTransit ? 'View Postal Journey' : 'Read Letter'}
                  variant={isTransit ? 'outline' : 'primary'}
                  size="sm"
                  style={{ marginTop: 12, alignSelf: 'flex-start' }}
                />
              </Link>
            </Card>
          );
        })}
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
