import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';

export default function AiPrivacyScreen() {
  const { colors, typography, spacing } = useTheme();

  const [allowCloudEscalation, setAllowCloudEscalation] = useState(false);
  const [allowMemoryExtraction, setAllowMemoryExtraction] = useState(true);
  const [allowLocalEmbeddings, setAllowLocalEmbeddings] = useState(true);

  return (
    <ScreenWrapper scrollable>
      <Header title="AI Privacy & Guardrails" subtitle="Deterministic Rules & Zero-Leakage Architecture" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
            <Text style={[typography.subheading, { color: colors.text.primary, marginLeft: 8 }]}>
              Non-Negotiable AI Directives (Section 5.7)
            </Text>
          </View>
          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            AI models NEVER make final decisions regarding age eligibility, account bans, religious matching, medical diagnoses, or billing. Pure deterministic TypeScript rules govern all safety boundaries.
          </Text>
        </Card>

        {/* Local Embeddings Switch */}
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                On-Device Vector Indexing
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Embeds educational health guides inside your device's local database for fast retrieval.
              </Text>
            </View>
            <Switch
              value={allowLocalEmbeddings}
              onValueChange={setAllowLocalEmbeddings}
              trackColor={{ false: colors.surface1, true: colors.primary }}
            />
          </View>
        </Card>

        {/* Local Memory Extraction Switch */}
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Extract Learned Preferences
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Permits local classifier to store workout intensity preferences into your local vault.
              </Text>
            </View>
            <Switch
              value={allowMemoryExtraction}
              onValueChange={setAllowMemoryExtraction}
              trackColor={{ false: colors.surface1, true: colors.primary }}
            />
          </View>
        </Card>

        {/* Cloud Escalation Consent (Section 5.6) */}
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Optional Cloud AI Escalation
                </Text>
                <Badge label="Off by default" variant="neutral" style={{ marginLeft: 8 }} />
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Routes complex health education synthesis via authenticated server proxy. Never sends raw journal entries or intimate health logs.
              </Text>
            </View>
            <Switch
              value={allowCloudEscalation}
              onValueChange={setAllowCloudEscalation}
              trackColor={{ false: colors.surface1, true: colors.primary }}
            />
          </View>
        </Card>

        <Card variant="surface1" style={{ marginBottom: spacing.md }}>
          <Text style={[typography.captionBold, { color: colors.text.primary }]}>
            No Client API Keys
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            Zero cloud AI keys (Gemini, OpenAI, Anthropic) are shipped inside mobile bundles. All cloud calls route through rate-capped serverless functions.
          </Text>
        </Card>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
