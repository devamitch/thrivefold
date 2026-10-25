import { SquircleSurface } from '@/components/ui';
import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { Card } from '../../../../components/ui/Card';
import { Header } from '../../../../components/ui/Header';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { useTheme } from '../../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../../stores/useRootStore';

export default function LetterDeliveryDetailScreen() {
  const router = useRouter();
  const { letterId } = useLocalSearchParams<{ letterId: string }>();
  const { colors, typography, spacing } = useTheme();
  const { inbox, outbox } = useRootStore(
    useShallow((s) => ({ inbox: s.inbox, outbox: s.outbox })),
  );

  const letter = [...inbox, ...outbox].find((l) => l.id === letterId) ?? inbox[0];

  return (
    <ScreenWrapper scrollable>
      <Header title="Letter on its way" subtitle="Letters take time to arrive, like post" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md, alignItems: 'center', padding: spacing.xl }}>
          <SquircleSurface style={[styles.stampCircle, { backgroundColor: colors.primaryAlpha }]}>
            <Ionicons name="mail-unread" size={32} color={colors.primary} />
          </SquircleSurface>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 12 }]}>
            Letter ID: {letter.id}
          </Text>
          <Badge
            label={letter.status === 'in_transit' ? 'In Transit Across Channels' : 'Arrived at Destination'}
            variant={letter.status === 'in_transit' ? 'warning' : 'success'}
            style={{ marginTop: 8 }}
          />

          <SquircleSurface style={styles.journeyMetrics}>
            <SquircleSurface style={styles.metricItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>DISTANCE</Text>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{letter.distanceKm.toLocaleString()} km</Text>
            </SquircleSurface>
            <SquircleSurface style={styles.metricItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>TRANSIT TIME</Text>
              <Text style={[typography.bodyBold, { color: colors.primary }]}>~{letter.deliveryHours} Hours</Text>
            </SquircleSurface>
            <SquircleSurface style={styles.metricItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>STAMP</Text>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{letter.stampId.replace('stamp_', '')}</Text>
            </SquircleSurface>
          </SquircleSurface>
        </Card>

        {/* Milestone Steps */}
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            Postal Waypoints
          </Text>
          <SquircleSurface style={styles.timelineRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <SquircleSurface style={{ marginLeft: 10 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Dispatched by Sender</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                {new Date(letter.createdAt).toLocaleString()}
              </Text>
            </SquircleSurface>
          </SquircleSurface>
          <SquircleSurface style={[styles.timelineRow, { marginTop: 14 }]}>
            <Ionicons
              name={letter.status === 'in_transit' ? 'airplane' : 'checkmark-circle'}
              size={20}
              color={letter.status === 'in_transit' ? colors.primary : colors.success}
            />
            <SquircleSurface style={{ marginLeft: 10 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Cross-Regional Transit Routing</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                Paced based on coarse geographic distance bands
              </Text>
            </SquircleSurface>
          </SquircleSurface>
          <SquircleSurface style={[styles.timelineRow, { marginTop: 14 }]}>
            <Ionicons
              name={letter.status === 'delivered' || letter.status === 'opened' ? 'checkmark-circle' : 'time-outline'}
              size={20}
              color={letter.status === 'delivered' || letter.status === 'opened' ? colors.success : colors.text.muted}
            />
            <SquircleSurface style={{ marginLeft: 10 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Delivery to Recipient Box</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                Expected: {new Date(letter.scheduledDeliveryAt).toLocaleString()}
              </Text>
            </SquircleSurface>
          </SquircleSurface>
        </Card>

        <Button label="Return to Mailbox" variant="outline" onPress={() => router.replace('/(app)/letters')} />
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
  stampCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  journeyMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    borderTopColor: '#33333333',
    paddingTop: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
