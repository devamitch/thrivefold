import { SquircleSurface } from '@/components/ui';
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';

const FACTS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  {
    icon: 'phone-portrait-outline',
    title: 'Everything is worked out on this device',
    body: 'Suggestions, patterns and note search use your records stored on this phone. Nothing is sent to a server or an AI company.',
  },
  {
    icon: 'bookmark-outline',
    title: 'Memory holds only what you choose',
    body: 'Journal entries are never turned into memories automatically. You can edit, pause or forget memories at any time.',
  },
  {
    icon: 'git-branch-outline',
    title: 'Rules decide, not AI',
    body: 'Age, eligibility, blocking, rewards and safety are decided by fixed, tested rules. Suggestions never diagnose.',
  },
  {
    icon: 'eye-off-outline',
    title: 'Nothing is guessed about you',
    body: 'Religion, orientation, ethnicity or health conditions are never inferred from what you write or do.',
  },
];

export default function AiPrivacyScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenWrapper scrollable>
      <Header title="AI Privacy" subtitle="What happens to your data" showBack />
      <SquircleSurface style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        {FACTS.map((f) => (
          <Card key={f.title} style={{ marginBottom: spacing.sm }}>
            <SquircleSurface style={styles.row}>
              <Ionicons name={f.icon} size={20} color={colors.primary} />
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 10, flex: 1 }]}>
                {f.title}
              </Text>
            </SquircleSurface>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6 }]}>{f.body}</Text>
          </Card>
        ))}

        <Card variant="surface1" style={{ marginTop: spacing.sm }}>
          <SquircleSurface style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Cloud AI</Text>
            <Badge label="Not available" variant="neutral" />
          </SquircleSurface>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6 }]}>
            This build has no cloud AI. If it is added later, it will be off until you turn it on for a specific
            feature, and it will never receive your journal or intimate health records.
          </Text>
        </Card>
      </SquircleSurface>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
