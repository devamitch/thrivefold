import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../../../components/ui/ScreenContainer';
import { AppHeader } from '../../../../components/ui/AppHeader';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { useTheme } from '../../../../theme/useTheme';
import { spacing } from '../../../../theme/spacing';

export default function MenHealthScreen() {
  const { colors, typography } = useTheme();

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Men's Health"
          subtitle="Strength, Stamina, Resilience"
          showBack
        />
      }
      scrollMode="shell-scroll-view"
    >
      <View style={[styles.content, { paddingBottom: 32 }]}>
        {/* Today's Status */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            Today's Focus
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Energy</Text>
              <Text style={[typography.bodyBold, { color: colors.success }]}>High</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Recovery</Text>
              <Text style={[typography.bodyBold, { color: colors.primary }]}>75%</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Sleep</Text>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>7.5h</Text>
            </View>
          </View>
        </Card>

        {/* Strength Training */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            Strength & Stamina
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: 16 }]}>
            Equipment-free mobility, bodyweight basics, progressive routines
          </Text>
          <Button label="Start Workout" size="sm" />
        </Card>

        {/* Mental Wellness */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            Mental Grounding
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: 16 }]}>
            Stoic reflection, stress decompression, emotional regulation
          </Text>
          <Button label="Reflection Exercise" size="sm" variant="outline" />
        </Card>

        {/* Recovery Habits */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            Recovery Habits
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: 16 }]}>
            Sleep tracking, cold exposure, hydration reminders
          </Text>
          <Button label="Log Recovery" size="sm" variant="outline" />
        </Card>

        {/* Health Education */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            Health Education
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: 16 }]}>
            Reproductive health, urinary wellness, pelvic-floor awareness
          </Text>
          <Button label="Learn More" size="sm" variant="outline" />
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
  },
});
