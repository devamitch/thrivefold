import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

export default function LettersInboxScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { inbox, connections } = useRootStore(
    useShallow((s) => ({ inbox: s.inbox, connections: s.connections })),
  );

  return (
    <ScreenWrapper scrollable>
      <Header
        title="Letters"
        subtitle="Asynchronous pen-pal letters"
        showBack
        rightAction={
          <Pressable
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              router.push('/(app)/letters/stamps');
            }}
            style={({ pressed }) => [
              styles.stampBtn,
              { backgroundColor: colors.surface1, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="albums-outline" size={18} color={colors.primary} />
            <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 6 }]}>Stamps</Text>
          </Pressable>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl }]}>
        {/* Write Letter CTA Card */}
        <Card style={{ marginBottom: spacing.lg, backgroundColor: colors.surface, padding: 14 }}>
          <View style={styles.heroWrap}>
            <Image
              source={require('../../../../assets/illustrations/letters-collection.jpg')}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
          <View style={[styles.ctaRow, { marginTop: 12 }]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Compose a Slow Letter
              </Text>
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
                Share gentle reflections sealed with collectible artisanal wax stamps.
              </Text>
            </View>
            <Button
              label="Write"
              size="md"
              onPress={() => router.push('/(app)/letters/compose')}
              icon={<Ionicons name="create-outline" size={18} color="#FFFFFF" />}
            />
          </View>
        </Card>

        {/* Quick Postal Navigation */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg }}>
          <Button
            label="Discover"
            size="sm"
            variant="outline"
            icon={<Ionicons name="compass-outline" size={14} color={colors.primary} />}
            onPress={() => router.push('/(app)/letters/discover')}
          />
          <Button
            label="Open Letters"
            size="sm"
            variant="outline"
            icon={<Ionicons name="mail-open-outline" size={14} color={colors.primary} />}
            onPress={() => router.push('/(app)/letters/open-letters')}
          />
          <Button
            label="Outbox"
            size="sm"
            variant="outline"
            icon={<Ionicons name="paper-plane-outline" size={14} color={colors.primary} />}
            onPress={() => router.push('/(app)/letters/outbox')}
          />
          <Button
            label="Drafts"
            size="sm"
            variant="ghost"
            icon={<Ionicons name="document-text-outline" size={14} color={colors.text.secondary} />}
            onPress={() => router.push('/(app)/letters/drafts')}
          />
          <Button
            label="Profile"
            size="sm"
            variant="ghost"
            icon={<Ionicons name="person-outline" size={14} color={colors.text.secondary} />}
            onPress={() => router.push('/(app)/letters/profile')}
          />
          <Button
            label="Pacing"
            size="sm"
            variant="ghost"
            icon={<Ionicons name="options-outline" size={14} color={colors.text.secondary} />}
            onPress={() => router.push('/(app)/letters/preferences')}
          />
        </View>

        {/* Active Pen-Pal Connections */}
        <View style={styles.sectionHeader}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Pen-Pal Friends ({connections.length})
          </Text>
        </View>

        {connections.length > 0 ? (
          connections.map((conn) => (
            <Card key={conn.id} style={{ marginBottom: spacing.md }}>
              <View style={styles.connectionHeader}>
                <View style={styles.avatarRow}>
                  <View style={[styles.avatarCircle, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
                    <Ionicons name="paper-plane-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      {conn.partnerPseudonym}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                      Last letter: {new Date(conn.lastActivityAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Badge label={`${conn.letterCount} Letters`} variant="neutral" />
              </View>
            </Card>
          ))
        ) : (
          <Card style={{ marginBottom: spacing.lg, padding: spacing.lg, backgroundColor: colors.surface1 }}>
            <Text style={[typography.subbody, { color: colors.text.secondary, textAlign: 'center' }]}>
              Explore introductions to begin exchanging letters with consented peers.
            </Text>
            <Button
              label="Discover Pen-Pals"
              variant="outline"
              size="sm"
              style={{ marginTop: 12, alignSelf: 'center' }}
              onPress={() => router.push('/(app)/social')}
            />
          </Card>
        )}

        {/* In-Transit & Delivered Letters */}
        <View style={[styles.sectionHeader, { marginTop: spacing.md }]}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Mailbox ({inbox.length})
          </Text>
        </View>

        {inbox.length > 0 ? (
          inbox.map((letter) => {
            const isTransit = letter.status === 'in_transit';
            return (
              <Card key={letter.id} style={{ marginBottom: spacing.md }}>
                <View style={styles.letterHeader}>
                  <Badge
                    label={isTransit ? 'Traveling' : 'Delivered'}
                    variant={isTransit ? 'warning' : 'success'}
                  />
                  <Text style={[typography.caption, { color: colors.text.muted }]}>
                    {letter.distanceKm.toLocaleString()} km
                  </Text>
                </View>

                <View style={styles.letterBody}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    Letter from {letter.senderPseudonym ?? 'SolsticeFriend'}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                    {isTransit
                      ? `In transit across regional postal channels · Arrives in ~${letter.deliveryHours}h`
                      : `Received on ${new Date(letter.scheduledDeliveryAt).toLocaleDateString()}`}
                  </Text>
                </View>

                <Button
                  label={isTransit ? 'Track Transit' : 'Open Letter'}
                  variant={isTransit ? 'outline' : 'primary'}
                  size="sm"
                  style={{ marginTop: spacing.md }}
                  onPress={() => {
                    // Open letter view
                  }}
                />
              </Card>
            );
          })
        ) : (
          <Card style={{ padding: spacing.xl, alignItems: 'center', backgroundColor: colors.surface }}>
            <Ionicons name="mail-unread-outline" size={36} color={colors.text.muted} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: 10 }]}>
              Your mailbox is empty
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, textAlign: 'center' }]}>
              Letters travel with realistic time delays based on distance. Send a letter to start an exchange!
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
    paddingHorizontal: 16,
  },
  stampBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  heroWrap: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3EFEA',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  letterBody: {
    marginTop: 10,
  },
});
