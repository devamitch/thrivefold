import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../theme/useTheme';
import { useRootStore, useShallow } from '../../stores/useRootStore';

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { quietHoursEnabled, quietHoursStart, quietHoursEnd, setQuietHours } = useRootStore(
    useShallow((s) => ({ quietHoursEnabled: s.quietHoursEnabled, quietHoursStart: s.quietHoursStart, quietHoursEnd: s.quietHoursEnd, setQuietHours: s.setQuietHours })),
  );

  return (
    <ScreenWrapper scrollable>
      <Header title="Quiet Hours & Notifications" subtitle="Step 7 of 9" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Text style={[typography.heading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Protecting Your Calm
        </Text>
        <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: spacing.md }]}>
          We reject notifications that demand your attention. Notifications use neutral text by default so your cycle data, health details, and letter previews never leak onto lock screens.
        </Text>

        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="moon-outline" size={20} color={colors.primary} />
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                  Night Quiet Hours ({quietHoursStart} – {quietHoursEnd})
                </Text>
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                Mutes all prompts, reminder buzzes, and letter notifications while you rest.
              </Text>
            </View>
            <Switch
              value={quietHoursEnabled}
              onValueChange={(val) => setQuietHours(val)}
              trackColor={{ false: colors.surface1, true: colors.primary }}
            />
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 4 }]}>
            Neutral Lock Screen Previews
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            Preview displays: "A quiet reflection awaits" rather than sensitive health symptoms, medication names, or personal letter contents.
          </Text>
        </Card>

        <Button
          label="Next: Coarse Location"
          onPress={() => router.push('/(onboarding)/location-permission')}
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
