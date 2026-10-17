import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { useTheme } from '../../theme/useTheme';

export default function PrivacyChoicesScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const [isAdultConfirmed, setIsAdultConfirmed] = useState(true);
  const [localVaultAgreed, setLocalVaultAgreed] = useState(true);
  const [allowAnonymousMetrics, setAllowAnonymousMetrics] = useState(false);

  return (
    <ScreenWrapper scrollable>
      <Header title="Privacy & Integrity" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Text style={[typography.heading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Your Data Stays With You
        </Text>
        <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: spacing.lg }]}>
          Thrivefold uses a local-first architecture. Health logs, reflections, and personal memories are kept securely on your device.
        </Text>

        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.row}>
            <View style={styles.textCol}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Adult Eligibility (18+)
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                I confirm that I am at least 18 years of age. All sensitive correspondence requires adult status.
              </Text>
            </View>
            <Switch
              value={isAdultConfirmed}
              onValueChange={setIsAdultConfirmed}
              thumbColor={colors.primary}
              trackColor={{ false: colors.surface2, true: colors.primaryAlpha }}
            />
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.row}>
            <View style={styles.textCol}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Local Device Vault
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                Store journals, cycle tracking, and AI memories locally on this phone. No unconsented cloud uploads.
              </Text>
            </View>
            <Switch
              value={localVaultAgreed}
              onValueChange={setLocalVaultAgreed}
              thumbColor={colors.primary}
              trackColor={{ false: colors.surface2, true: colors.primaryAlpha }}
            />
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <View style={styles.row}>
            <View style={styles.textCol}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Anonymous Crash Diagnostics
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                Share non-sensitive crash logs to help maintain app reliability. Never shares personal health notes.
              </Text>
            </View>
            <Switch
              value={allowAnonymousMetrics}
              onValueChange={setAllowAnonymousMetrics}
              thumbColor={colors.primary}
              trackColor={{ false: colors.surface2, true: colors.primaryAlpha }}
            />
          </View>
        </Card>

        <Button
          label="Confirm & Set Goals"
          disabled={!isAdultConfirmed || !localVaultAgreed}
          onPress={() => router.push('/(onboarding)/goals')}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textCol: {
    flex: 1,
    paddingRight: 16,
  },
});
