import React, { useState } from 'react';
import { Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore } from '../../../stores/useRootStore';

export default function SafetyAppealScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const showAlert = useRootStore((s) => s.showAlert);

  const [statement, setStatement] = useState('');

  const handleAppeal = () => {
    if (!statement.trim()) {
      showAlert({
        title: 'Statement Required',
        message: 'Please explain why you believe the moderation restriction was in error.',
        confirmText: 'OK',
        cancelText: null,
      });
      return;
    }

    showAlert({
      title: 'Appeal Submitted',
      message: 'Your appeal has been queued for human review. Our safety team will evaluate the decision.',
      confirmText: 'Done',
      cancelText: null,
      onConfirm: () => router.back(),
    });
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Appeal a decision" subtitle="How a review works" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 4 }]}>
            Fair review
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            Thrivefold provides a human review pathway for high-impact restrictions. If you believe your card composition or account action was flagged incorrectly, describe the context below.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.captionBold, { color: colors.text.secondary, marginBottom: 4 }]}>
            YOUR EXPLANATION / CONTEXT
          </Text>
          <TextInput
            placeholder="Explain why you believe the restriction was a false positive or misunderstood..."
            placeholderTextColor={colors.text.muted}
            value={statement}
            onChangeText={setStatement}
            multiline
            numberOfLines={6}
            style={[styles.textArea, { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.surface1 }]}
          />
        </Card>

        <Button label="Submit Appeal for Human Review" onPress={handleAppeal} />
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
  textArea: {
    minHeight: 140,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
  },
});
