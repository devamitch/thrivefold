import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';

export default function PrivacyPolicyScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenWrapper scrollable>
      <Header title="Privacy Policy" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            Local-First Protection
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            All sensitive reproductive health metrics, period dates, symptom histories, private journals, and AI memory tokens are stored only on your device by default. On-device storage is not encrypted by the app, so use your phone's screen lock.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            Zero Covert Profiling
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            Thrivefold never secretly infers religion, caste, sexual orientation, political ideology, or medical diagnoses from GPS, food logs, or writing patterns.
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
