import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { LetterRow } from '../../../components/letters/LetterRow';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { letterErrorText, useLetterInbox, useLetterOutbox, usePseudonyms } from '../../../services/supabase/letters';
import { useTheme } from '../../../theme/useTheme';

const LINKS: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { label: 'Inbox', icon: 'mail-outline', route: '/(app)/letters/inbox' },
  { label: 'Sent', icon: 'paper-plane-outline', route: '/(app)/letters/outbox' },
  { label: 'Stamps', icon: 'albums-outline', route: '/(app)/letters/stamps' },
  { label: 'Preferences', icon: 'options-outline', route: '/(app)/letters/preferences' },
];

/** Slow letters: newest arrivals, a way to start, and the mailbox sections. */
export default function LettersScreen() {
  const { colors, typography, spacing } = useTheme();
  const inbox = useLetterInbox(true);
  const outbox = useLetterOutbox(true);
  const recent = (inbox.data ?? []).slice(0, 3);
  const names = usePseudonyms(recent.map((l) => l.sender_id), true);
  const unread = (inbox.data ?? []).filter((l) => l.status !== 'opened').length;
  const travelling = (outbox.data ?? []).filter((l) => new Date(l.scheduled_delivery_at).getTime() > Date.now()).length;

  return (
    <ScreenWrapper scrollable>
      <Header title="Letters" subtitle="Slow pen-pal letters, made of cards" showBack />
      <View>
        <Card style={{ padding: 14 }}>
          <View style={styles.heroWrap}>
            <Image
              source={require('../../../../assets/illustrations/letters-collection.jpg')}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 12 }]}>Write to someone new</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            {unread > 0 ? `${unread} unread · ` : ''}
            {travelling > 0 ? `${travelling} on the way · ` : ''}
            Letters arrive about 12 hours after they are sent.
          </Text>
          <Link href={'/(app)/letters/discover' as Href} asChild>
            <Button label="Find a pen pal" style={{ marginTop: spacing.md }} />
          </Link>
        </Card>

        <View style={[styles.grid, { marginTop: spacing.md }]}>
          {LINKS.map((l) => (
            <Link key={l.route} href={l.route as Href} asChild>
              <PressableScale style={styles.cell} scaleTo={0.96} accessibilityRole="button" accessibilityLabel={l.label}>
                <SquircleSurface radius={18} fill={colors.surface} style={styles.tile}>
                  <Ionicons name={l.icon} size={20} color={colors.primary} />
                  <Text style={[typography.captionBold, { color: colors.text.primary, marginTop: 6 }]}>{l.label}</Text>
                </SquircleSurface>
              </PressableScale>
            </Link>
          ))}
        </View>

        <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Recently arrived
        </Text>
        {inbox.isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : inbox.error ? (
          <Card style={{ padding: spacing.lg }}>
            <Text style={[typography.body, { color: colors.text.secondary }]}>{letterErrorText(inbox.error)}</Text>
          </Card>
        ) : recent.length === 0 ? (
          <Card style={{ padding: spacing.lg }}>
            <Text style={[typography.body, { color: colors.text.secondary }]}>
              Your mailbox is empty. Letters appear here once they arrive.
            </Text>
          </Card>
        ) : (
          recent.map((l) => <LetterRow key={l.id} letter={l} who={names.data?.[l.sender_id] ?? 'A pen pal'} direction="in" />)
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  heroWrap: { aspectRatio: 16 / 9, borderCurve: 'continuous', borderRadius: 16, overflow: 'hidden', width: '100%' },
  heroImage: { height: '100%', width: '100%' },
  grid: { flexDirection: 'row', gap: 8 },
  cell: { flex: 1 },
  tile: { alignItems: 'center', paddingVertical: 14 },
});
