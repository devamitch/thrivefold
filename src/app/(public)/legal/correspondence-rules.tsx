import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';

export default function CorrespondenceRulesScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenWrapper scrollable>
      <Header title="Letter rules" subtitle="Slow letters, written with cards" showBack />
      <SquircleSurface style={[styles.content, { padding: spacing.base }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            1. No Raw-Text Inputs in Social Chat
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            To eliminate harassment, unsolicited images, and predatory spam, all letters and social messages are composed strictly from curated, approved cards and templates. No free-text keyboard entry is rendered in user-to-user channels.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            2. Coarse-Distance Delivery Pacing
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            Letters simulate traditional physical post: delivery times scale proportionally with regional distance (e.g. 1 hour for local, up to 36 hours for global). No precise GPS coordinates are ever tracked or shared.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            3. Daily Introduction Quota
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            Restricted social pathways limit users to at most one new introduction per day. Pacing promotes thoughtful connection over compulsive volume.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            4. No External Contact Disclosure
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            Attempting to encode phone numbers, email addresses, social handles, or physical meeting coordinates into card sequences triggers automatic interception and warning.
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
