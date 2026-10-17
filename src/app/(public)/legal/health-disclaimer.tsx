import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';

export default function HealthDisclaimerScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenWrapper scrollable>
      <Header title="Health Disclaimer" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Card variant="tinted" style={{ marginBottom: spacing.md, padding: spacing.base }}>
          <Text style={[typography.subheading, { color: colors.primary, marginBottom: spacing.xs }]}>
            Educational & Self-Care Purpose Only
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            Thrivefold is designed to support healthy lifestyle habits, daily mindfulness, and educational awareness. It is NOT a medical device and does not provide clinical diagnosis, medical prescriptions, or therapeutic treatments.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            When to Seek Medical Care
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            Always consult a qualified doctor or healthcare specialist if experiencing acute pelvic pain, abnormal bleeding, severe urinary discomfort, or persistent depressive distress.
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
