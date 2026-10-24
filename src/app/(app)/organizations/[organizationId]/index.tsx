import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { Card } from '../../../../components/ui/Card';
import { Header } from '../../../../components/ui/Header';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { useTheme } from '../../../../theme/useTheme';

export default function OrganizationDetailScreen() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
  const { colors, typography, spacing } = useTheme();

  const [activeTab, setActiveTab] = useState<'programs' | 'members' | 'safety'>('programs');

  return (
    <ScreenWrapper scrollable>
      <Header
        title="Organization Console"
        subtitle="Accredited Wellbeing Hub Management"
        showBack
      />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Mind & Body Foundation
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                ID: {organizationId ?? 'org_default_01'} · Verified Non-Profit
              </Text>
            </View>
            <Badge label="Verified Credential" variant="success" />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[typography.heading, { color: colors.primary }]}>3</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Programs</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[typography.heading, { color: colors.text.primary }]}>42</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Consented Members</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[typography.heading, { color: colors.success }]}>0</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>Open Incidents</Text>
            </View>
          </View>
        </Card>

        {/* Tab Switcher */}
        <View style={[styles.tabBar, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
          {(['programs', 'members', 'safety'] as const).map((tab) => (
            <Button
              key={tab}
              label={tab === 'programs' ? 'Programs & Events' : tab === 'members' ? 'Role Roster' : 'Safety Logs'}
              variant={activeTab === tab ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setActiveTab(tab)}
              style={{ flex: 1 }}
            />
          ))}
        </View>

        {activeTab === 'programs' && (
          <View>
            <Card style={{ marginBottom: spacing.sm }}>
              <Badge label="Active Cohort" variant="primary" />
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 6 }]}>
                Workplace movement reset: 4 weeks
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                18 active participants · Next live guided session Thursday 7pm
              </Text>
            </Card>

            <Card style={{ marginBottom: spacing.sm }}>
              <Badge label="Peer support" variant="neutral" />
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 6 }]}>
                Grief & Life Transitions Support
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Facilitated by certified peer guides · Audio-only safe space
              </Text>
            </Card>
          </View>
        )}

        {activeTab === 'members' && (
          <View>
            <Card style={{ marginBottom: spacing.sm }}>
              <View style={styles.headerRow}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Dr. Astrid Lindgren</Text>
                <Badge label="Owner / Lead Clinician" variant="primary" />
              </View>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Verified License: Clinical Psychologist</Text>
            </Card>

            <Card style={{ marginBottom: spacing.sm }}>
              <View style={styles.headerRow}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Elena S.</Text>
                <Badge label="Peer Facilitator" variant="neutral" />
              </View>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Trained Peer Facilitator (Non-Clinical)</Text>
            </Card>
          </View>
        )}

        {activeTab === 'safety' && (
          <View>
            <Card style={{ backgroundColor: colors.surface1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="checkmark-done-circle" size={20} color={colors.success} />
                <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                  All Circles Compliant
                </Text>
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                Zero anti-recruitment or harassment incidents flagged across this organization's support groups.
              </Text>
            </Card>
          </View>
        )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#33333333',
    paddingTop: 14,
  },
  statBox: {
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
});
