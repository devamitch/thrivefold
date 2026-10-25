import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';

export default function CommunityRulesScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenWrapper scrollable>
      <Header title="Community rules" subtitle="Safety, respect and boundaries" showBack />
      <SquircleSurface style={[styles.content, { padding: spacing.base }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            1. Safe, Segmented Spaces
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            All private circles (women, men, LGBTQ+, topic support) operate with strict isolation. Membership in any sensitive group is never surfaced across other groups, shared directories, or public profiles.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            2. Zero Coercion & Anti-Recruitment
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            Deceptive religious conversion, ideological recruitment, MLM solicitations, and predatory sales are prohibited. Conduct is evaluated on behavior and evidence, not identity stereotypes.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            3. Peer Support vs. Clinical Therapy
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            Peer facilitators are not licensed medical clinicians. Clinical groups are explicitly verified and credentialed. Groups are confidential; covert recording is strictly barred.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            4. Reporting, Blocking & Appeals
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            Blocking immediately halts all messages, invites, and queue processing between users. Every moderation restriction is auditable and subject to a transparent appeal pathway.
          </Text>
        </Card>
      </SquircleSurface>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
