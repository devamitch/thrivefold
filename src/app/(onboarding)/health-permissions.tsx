import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../theme/useTheme';

export default function HealthPermissionsScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const [appleHealthEnabled, setAppleHealthEnabled] = useState(false);
  const [sleepSyncEnabled, setSleepSyncEnabled] = useState(false);

  return (
    <ScreenWrapper scrollable>
      <Header title="Health Integrations" subtitle="Step 6 of 9" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Text style={[typography.heading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Device Health Sync
        </Text>
        <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: spacing.md }]}>
          Connect Apple Health or Android Health Connect to automatically sync step count, sleep duration, and active minutes.
        </Text>

        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="heart" size={20} color={colors.primary} />
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                  Apple Health / Health Connect
                </Text>
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                Reads daily active energy and steps to adapt workout intensity.
              </Text>
            </View>
            <Switch
              value={appleHealthEnabled}
              onValueChange={setAppleHealthEnabled}
              trackColor={{ false: colors.surface1, true: colors.primary }}
            />
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="moon" size={20} color={colors.primary} />
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                  Sleep Stage Analysis
                </Text>
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                Syncs sleep intervals to compute your daily recovery score.
              </Text>
            </View>
            <Switch
              value={sleepSyncEnabled}
              onValueChange={setSleepSyncEnabled}
              trackColor={{ false: colors.surface1, true: colors.primary }}
            />
          </View>
        </Card>

        <Card variant="surface1" style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.captionBold, { color: colors.text.primary }]}>
            Zero Centralized Cloud Leakage
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            Health data read from Apple Health or Health Connect stays strictly encrypted inside your device's local vault.
          </Text>
        </Card>

        <Button
          label="Next: Quiet Hours & Notifications"
          onPress={() => router.push('/(onboarding)/notification-permission')}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
