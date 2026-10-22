import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';

export default function ModelStatusScreen() {
  const { colors, typography, spacing } = useTheme();
  const [activeRuntime, setActiveRuntime] = useState<'deterministic' | 'local_classifier' | 'cloud_proxy'>('deterministic');

  return (
    <ScreenWrapper scrollable>
      <Header title="AI Engine Runtime Status" subtitle="Multi-Tier Local & Serverless Architecture" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Tier 1: Deterministic Engine (Always 100% Online) */}
        <Card style={{ marginBottom: spacing.md, borderColor: colors.success }}>
          <View style={styles.tierHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                Tier 1: Deterministic Rule Engine
              </Text>
            </View>
            <Badge label="Active & Online" variant="success" />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6, lineHeight: 18 }]}>
            Executes all safety boundaries, age assurance checks, one-introduction quotas, block enforcement, and contraindication modifications without network connectivity.
          </Text>
        </Card>

        {/* Tier 2: Local Intent Classifier */}
        <Card style={{ marginBottom: spacing.md, borderColor: colors.primary }}>
          <View style={styles.tierHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="hardware-chip" size={22} color={colors.primary} />
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                Tier 2: On-Device Lightweight Classifier
              </Text>
            </View>
            <Badge label="Ready (Local)" variant="primary" />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6, lineHeight: 18 }]}>
            Identifies daily check-in sentiment and fatigue signals in &lt;15ms on device. Zero battery drain and no cloud round-trips.
          </Text>
        </Card>

        {/* Tier 3: Cloud Provider Router */}
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.tierHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="cloud-outline" size={22} color={colors.text.muted} />
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                Tier 3: Cloud AI Gateway (Server-Side)
              </Text>
            </View>
            <Badge label="Standby (Cost-Capped)" variant="neutral" />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6, lineHeight: 18 }]}>
            Serverless Gemini proxy. Activated strictly for user-requested comprehensive educational synthesis with explicit consent.
          </Text>
        </Card>

        {/* Test Diagnostics */}
        <Card style={{ marginBottom: spacing.lg, backgroundColor: colors.surface1 }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 4 }]}>
            Offline Resilience Test
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 12 }]}>
            Simulate complete network loss to verify that all daily quests, check-ins, and health trackers continue operating seamlessly.
          </Text>
          <Button label="Run Offline Resilience Audit" variant="outline" size="sm" />
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
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
