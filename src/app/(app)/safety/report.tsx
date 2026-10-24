import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';

export default function SafetyReportScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { submitReport, blockUser, showAlert } = useRootStore(
    useShallow((s) => ({ submitReport: s.submitReport, blockUser: s.blockUser, showAlert: s.showAlert })),
  );

  const [targetId, setTargetId] = useState('');
  const [category, setCategory] = useState<'harassment' | 'spam' | 'coercive_recruitment' | 'contact_sharing' | 'impersonation'>('harassment');
  const [evidenceSummary, setEvidenceSummary] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);

  const categories = [
    { id: 'harassment', label: 'Harassment / Threats' },
    { id: 'contact_sharing', label: 'Sharing Contact Details' },
    { id: 'coercive_recruitment', label: 'Coercive Recruitment' },
    { id: 'spam', label: 'MLM / Unsolicited Promotion' },
    { id: 'impersonation', label: 'Impersonation / Fake Bio' },
  ];

  const handleSubmit = () => {
    if (!evidenceSummary.trim()) {
      showAlert({
        title: 'Evidence Summary Required',
        message: 'Please provide a brief explanation of the incident.',
        confirmText: 'OK',
        cancelText: null,
      });
      return;
    }

    submitReport({
      targetId: targetId.trim() || 'reported_participant',
      category,
      evidenceSummary: evidenceSummary.trim(),
    });

    if (alsoBlock) {
      blockUser(targetId.trim() || 'reported_participant');
    }

    showAlert({
      title: 'Report Submitted',
      message: 'Our moderation engine and safety reviewers will inspect the evidence according to community standards. The user has been blocked from contacting you.',
      confirmText: 'Done',
      cancelText: null,
      onConfirm: () => router.back(),
    });
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Safety Report" subtitle="Confidential Evidence Submission" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="shield-half-outline" size={20} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
              We act on behaviour, not identity
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            Thrivefold enforces conduct rules based on verifiable evidence. We never restrict accounts based on identity stereotypes, nationality, or faith labels.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.captionBold, { color: colors.text.secondary, marginBottom: 4 }]}>
            PARTICIPANT PSEUDONYM OR ID (OPTIONAL)
          </Text>
          <TextInput
            placeholder="e.g. Sender pseudonym from letter..."
            placeholderTextColor={colors.text.muted}
            value={targetId}
            onChangeText={setTargetId}
            style={[styles.input, { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.surface1 }]}
          />

          <Text style={[typography.captionBold, { color: colors.text.secondary, marginTop: 14, marginBottom: 8 }]}>
            VIOLATION CATEGORY
          </Text>
          <View style={styles.chipRow}>
            {categories.map((c) => (
              <Chip
                key={c.id}
                label={c.label}
                selected={category === c.id}
                onPress={() => setCategory(c.id as any)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>

          <Text style={[typography.captionBold, { color: colors.text.secondary, marginTop: 14, marginBottom: 4 }]}>
            EVIDENCE SUMMARY
          </Text>
          <TextInput
            placeholder="Describe the specific card sequence, message context, or coercive behavior..."
            placeholderTextColor={colors.text.muted}
            value={evidenceSummary}
            onChangeText={setEvidenceSummary}
            multiline
            numberOfLines={4}
            style={[styles.textArea, { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.surface1 }]}
          />
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Immediately Block Participant
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Permanently cancels any in-transit letters and prevents future introductions.
              </Text>
            </View>
            <Switch
              value={alsoBlock}
              onValueChange={setAlsoBlock}
              trackColor={{ false: colors.surface1, true: colors.primary }}
            />
          </View>
        </Card>

        <Button label="Submit Safety Report" variant="danger" onPress={handleSubmit} />
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
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
