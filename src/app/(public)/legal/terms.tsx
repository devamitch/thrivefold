import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';

export default function TermsScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenWrapper scrollable>
      <Header title="Terms of service" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            1. Who can use Thrivefold
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            Thrivefold is made for adults. Community features open only after a real age check, and children cannot join them.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            2. Anti-Harassment & Chip Interaction
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            User-to-user introductions and letters are strictly composed using curated, approved message cards. Deceptive recruitment, MLM solicitations, and sharing prohibited contact details are strictly barred.
          </Text>
        </Card>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
