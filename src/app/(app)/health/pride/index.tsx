import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../../../components/ui/ScreenWrapper';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Header } from '../../../../components/ui/Header';
import { useTheme } from '../../../../theme/useTheme';
import { spacing } from '../../../../theme/spacing';

export default function PrideHealthScreen() {
  const { colors, typography } = useTheme();

  return (
    <ScreenWrapper scrollable>
      <Header title="Pride Wellbeing" subtitle="Affirming Care, Safe Space" showBack />
      <ScrollView style={[styles.content, { paddingHorizontal: 16, paddingBottom: 32 }]}>
        {/* Identity Affirmation */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            Identity Affirmation
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: 16 }]}>
            Pronouns, gender description, identity-safe reflections
          </Text>
          <Button label="Update Profile" size="sm" />
        </Card>

        {/* HRT Tracking */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            HRT Schedule
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: 16 }]}>
            Dose tracking, injection site rotation, schedule reminders
          </Text>
          <Button label="View Schedule" size="sm" />
        </Card>

        {/* Dysphoria Support */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            Dysphoria Support
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: 16 }]}>
            Symptom logging, coping tools, crisis resources
          </Text>
          <Button label="Access Tools" size="sm" variant="outline" />
        </Card>

        {/* Panic Lock */}
        <Card style={{ marginBottom: 16, padding: 24, backgroundColor: colors.errorSurface }}>
          <Text style={[typography.subheading, { color: colors.error, marginBottom: 12 }]}>
            Quick Panic Lock
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: 16 }]}>
            Instant privacy protection, emergency contacts
          </Text>
          <Button label="Activate Safe Mode" size="sm" variant="outline" />
        </Card>

        {/* General Health */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            General Health
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: 16 }]}>
            Exercise, nutrition, sleep, mental wellness
          </Text>
          <Button label="View Health" size="sm" variant="outline" />
        </Card>

        {/* Community */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            Private Community
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: 16 }]}>
            LGBTQ+ peer support, safe spaces, local groups
          </Text>
          <Button label="Explore Communities" size="sm" />
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
