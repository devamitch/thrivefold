import { SquircleSurface } from '@/components/ui';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Link, useRouter, type Href } from 'expo-router';
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
import { PressableScale } from '../../../components/ui/PressableScale';

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
          <PressableScale
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              router.push('/(app)/letters/stamps');
            }}
            style={[
              styles.stampBtn,
              { backgroundColor: colors.surface1, borderColor: colors.border },
            ]}
          >
            <Ionicons name="albums-outline" size={18} color={colors.primary} />
            <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 6 }]}>Stamps</Text>
          </PressableScale>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl }]}>
        {/* Write Letter CTA Card */}
        <Card style={{ marginBottom: spacing.lg, backgroundColor: colors.surface, padding: 14 }}>
          <SquircleSurface style={styles.heroWrap}>
            <Image
              source={require('../../../../assets/illustrations/letters-collection.jpg')}
              style={styles.heroImage}
              contentFit="cover"
            />
          </SquircleSurface>
          <SquircleSurface style={[styles.ctaRow, { marginTop: 12 }]}>
            <SquircleSurface style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Compose a Slow Letter
              </Text>
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
                Share gentle reflections sealed with collectible artisanal wax stamps.
              </Text>
            </SquircleSurface>
            <Link href={'/(app)/letters/compose' as Href} asChild>
              <Button
                label="Write"
                size="md"
                icon={<Ionicons name="create-outline" size={18} color="#FFFFFF" />}
              />
            </Link>
          </SquircleSurface>
        </Card>

        {/* Quick Postal Navigation */}
        <SquircleSurface style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg }}>
          <Link href={'/(app)/letters/discover' as Href} asChild>
            <Button
              label="Discover"
              size="sm"
              variant="outline"
              icon={<Ionicons name="compass-outline" size={14} color={colors.primary} />}
            />
          </Link>
          <Link href={'/(app)/letters/open-letters' as Href} asChild>
            <Button
              label="Open Letters"
              size="sm"
              variant="outline"
              icon={<Ionicons name="mail-open-outline" size={14} color={colors.primary} />}
            />
          </Link>
          <Link href={'/(app)/letters/outbox' as Href} asChild>
            <Button
              label="Outbox"
              size="sm"
              variant="outline"
              icon={<Ionicons name="paper-plane-outline" size={14} color={colors.primary} />}
            />
          </Link>
          <Link href={'/(app)/letters/drafts' as Href} asChild>
            <Button
              label="Drafts"
              size="sm"
              variant="ghost"
              icon={<Ionicons name="document-text-outline" size={14} color={colors.text.secondary} />}
            />
          </Link>
          <Link href={'/(app)/letters/profile' as Href} asChild>
            <Button
              label="Profile"
              size="sm"
              variant="ghost"
              icon={<Ionicons name="person-outline" size={14} color={colors.text.secondary} />}
            />
          </Link>
          <Link href={'/(app)/letters/preferences' as Href} asChild>
            <Button
              label="Pacing"
              size="sm"
              variant="ghost"
              icon={<Ionicons name="options-outline" size={14} color={colors.text.secondary} />}
            />
          </Link>
        </SquircleSurface>

        {/* Active Pen-Pal Connections */}
        <SquircleSurface style={styles.sectionHeader}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Pen-Pal Friends ({connections.length})
          </Text>
        </SquircleSurface>

        {connections.length > 0 ? (
          connections.map((conn) => (
            <Card key={conn.id} style={{ marginBottom: spacing.md }}>
              <SquircleSurface style={styles.connectionHeader}>
                <SquircleSurface style={styles.avatarRow}>
                  <SquircleSurface style={[styles.avatarCircle, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
                    <Ionicons name="paper-plane-outline" size={18} color={colors.primary} />
                  </SquircleSurface>
                  <SquircleSurface style={{ marginLeft: 12 }}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      {conn.partnerPseudonym}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                      Last letter: {new Date(conn.lastActivityAt).toLocaleDateString()}
                    </Text>
                  </SquircleSurface>
                </SquircleSurface>
                <Badge label={`${conn.letterCount} Letters`} variant="neutral" />
              </SquircleSurface>
            </Card>
          ))
        ) : (
          <Card style={{ marginBottom: spacing.lg, padding: spacing.lg, backgroundColor: colors.surface1 }}>
            <Text style={[typography.subbody, { color: colors.text.secondary, textAlign: 'center' }]}>
              Explore introductions to begin exchanging letters with consented peers.
            </Text>
            <Link href={'/(app)/social' as Href} asChild>
              <Button
                label="Discover Pen-Pals"
                variant="outline"
                size="sm"
                style={{ marginTop: 12, alignSelf: 'center' }}
              />
            </Link>
          </Card>
        )}

        {/* In-Transit & Delivered Letters */}
        <SquircleSurface style={[styles.sectionHeader, { marginTop: spacing.md }]}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Mailbox ({inbox.length})
          </Text>
        </SquircleSurface>

        {inbox.length > 0 ? (
          inbox.map((letter) => {
            const isTransit = letter.status === 'in_transit';
            return (
              <Card key={letter.id} style={{ marginBottom: spacing.md }}>
                <SquircleSurface style={styles.letterHeader}>
                  <Badge
                    label={isTransit ? 'Traveling' : 'Delivered'}
                    variant={isTransit ? 'warning' : 'success'}
                  />
                  <Text style={[typography.caption, { color: colors.text.muted }]}>
                    {letter.distanceKm.toLocaleString()} km
                  </Text>
                </SquircleSurface>

                <SquircleSurface style={styles.letterBody}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    Letter from {letter.senderPseudonym ?? 'SolsticeFriend'}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                    {isTransit
                      ? `In transit across regional postal channels · Arrives in ~${letter.deliveryHours}h`
                      : `Received on ${new Date(letter.scheduledDeliveryAt).toLocaleDateString()}`}
                  </Text>
                </SquircleSurface>

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
