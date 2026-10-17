import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { useTheme } from '../../../theme/useTheme';

export default function OrganizationsScreen() {
  const { colors, typography } = useTheme();

  return (
    <ScreenWrapper scrollable>
      <Header title="Organizations" subtitle="Verified NGOs, Businesses, & Programs" showBack />
      <ScrollView style={[styles.content, { paddingHorizontal: 16, paddingBottom: 32 }]}>
        {/* Apply for Organization */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            Apply as Organization
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: 16 }]}>
            Apply for verified organization status to manage communities and programs
          </Text>
          <Button label="Start Application" size="sm" />
        </Card>

        {/* Application Status */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            Application Status
          </Text>
          <Text style={[typography.caption, { color: colors.text.muted }]}>
            No active application
          </Text>
        </Card>

        {/* Organization Benefits */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            Organization Benefits
          </Text>
          <View style={styles.benefitRow}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>•</Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginLeft: 8 }]}>
              Create and manage private communities
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>•</Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginLeft: 8 }]}>
              Host events and programs
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>•</Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginLeft: 8 }]}>
              Assign facilitator roles
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>•</Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginLeft: 8 }]}>
              Access moderation tools
            </Text>
          </View>
        </Card>

        {/* Verification Requirements */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            Verification Requirements
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: 16 }]}>
            Organizations must provide proof of registration, representative identity, and purpose documentation
          </Text>
          <Button label="Learn More" size="sm" variant="outline" />
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  benefitRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
});
