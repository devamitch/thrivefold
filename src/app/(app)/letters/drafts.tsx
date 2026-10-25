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

export default function LetterDraftsScreen() {
  const { colors, typography, spacing } = useTheme();
  const { drafts } = useRootStore(
    useShallow((s) => ({ drafts: s.drafts })),
  );

  return (
    <ScreenWrapper scrollable>
      <Header title="Drafts" subtitle="Letters you have not sent yet" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        {drafts.length > 0 ? (
          drafts.map((draft) => (
            <Card key={draft.id} style={{ marginBottom: spacing.md, padding: spacing.lg }}>
              <SquircleSurface style={styles.headerRow}>
                <Badge label="Saved Draft" variant="neutral" />
                <Text style={[typography.caption, { color: colors.text.muted }]}>
                  {new Date(draft.createdAt).toLocaleDateString()}
                </Text>
              </SquircleSurface>

              <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                {draft.chipIds.length} Curated Cards Selected
              </Text>

              <Link href={'/(app)/letters/compose' as Href} asChild>
                <Button
                  label="Resume Composition"
                  size="sm"
                  style={{ marginTop: 12, alignSelf: 'flex-start' }}
                />
              </Link>
            </Card>
          ))
        ) : (
          <Card style={{ padding: spacing.xl, alignItems: 'center', marginTop: spacing.md }}>
            <Text style={[typography.subbody, { color: colors.text.secondary }]}>
              No active drafts. Start composing a slow letter to save your thoughts.
            </Text>
            <Link href={'/(app)/letters/compose' as Href} asChild>
              <Button
                label="Compose New Letter"
                size="sm"
                style={{ marginTop: 16 }}
              />
            </Link>
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
