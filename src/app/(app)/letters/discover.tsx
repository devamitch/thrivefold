import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { letterErrorText, useIntroCandidates } from '../../../services/supabase/letters';
import { useTheme } from '../../../theme/useTheme';

/**
 * People open to a first letter, chosen by the server: verified adults who accept
 * introductions, minus anyone blocked or already written to. One new introduction a day.
 */
export default function DiscoverPenPalsScreen() {
  const { colors, typography, spacing } = useTheme();
  const candidates = useIntroCandidates(true);
  const [interest, setInterest] = useState<string | null>(null);

  const interests = useMemo(
    () => [...new Set((candidates.data ?? []).flatMap((c) => c.interests))].sort().slice(0, 12),
    [candidates.data],
  );
  const shown = (candidates.data ?? []).filter((c) => !interest || c.interests.includes(interest));

  return (
    <ScreenWrapper scrollable>
      <Header title="Find a pen pal" subtitle="One new introduction a day" showBack />
      <View>
        <Card variant="surface1" style={{ padding: spacing.base, marginBottom: spacing.md }}>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={[typography.caption, styles.flex, { color: colors.text.secondary }]}>
              Letters are made of cards and arrive about 12 hours after you send them. No live chat.
            </Text>
          </View>
        </Card>

        {interests.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.noGrow} contentContainerStyle={styles.chips}>
            <Chip label="Everyone" selected={!interest} onPress={() => setInterest(null)} />
            {interests.map((i) => (
              <Chip key={i} label={i} selected={interest === i} onPress={() => setInterest(i)} />
            ))}
          </ScrollView>
        ) : null}

        {candidates.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : candidates.error ? (
          <Card style={{ padding: spacing.lg }}>
            <Text style={[typography.body, { color: colors.text.secondary }]}>{letterErrorText(candidates.error)}</Text>
          </Card>
        ) : shown.length === 0 ? (
          <Card style={{ padding: spacing.lg }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>Nobody new right now</Text>
            <Text style={[typography.body, { color: colors.text.secondary, marginTop: 6 }]}>
              Only real, age-checked people who are open to letters appear here. Check back later.
            </Text>
          </Card>
        ) : (
          shown.map((c) => (
            <SquircleSurface key={c.user_id} radius={20} fill={colors.surface} style={styles.person}>
              <View style={styles.flex}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{c.pseudonym}</Text>
                <Text numberOfLines={1} style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  {[c.coarse_region, c.languages.join(', ')].filter(Boolean).join(' · ')}
                </Text>
                {c.interests.length > 0 ? (
                  <Text numberOfLines={2} style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
                    {c.interests.join(' · ')}
                  </Text>
                ) : null}
              </View>
              <Link href={`/(app)/letters/compose?to=${c.user_id}&name=${encodeURIComponent(c.pseudonym)}` as Href} asChild>
                <Button label="Write" size="sm" />
              </Link>
            </SquircleSurface>
          ))
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  noGrow: { flexGrow: 0 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  person: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 8, padding: 14 },
});
