import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { Badge } from '../../components/ui/Badge';
import { useTheme } from '../../theme/useTheme';
import { useRootStore, useShallow } from '../../stores/useRootStore';

export default function VerifyAgeScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { user, setUser } = useRootStore(
    useShallow((s) => ({ user: s.user, setUser: s.setUser })),
  );
  const [saving, setSaving] = useState(false);

  // Records a self-declaration only. It never marks the account as verified: adult
  // social features need a real age-assurance check (REQ-013), which this release
  // does not include, so they stay locked while health tools work normally.
  const handleDeclareAdult = () => {
    setSaving(true);
    if (user && !user.ageBand) {
      setUser({ ...user, ageBand: 'self_declared_adult' });
    }
    setSaving(false);
    router.replace('/(onboarding)/choose-experience');
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Age Assurance" subtitle="Adult Safeguard & Compliance" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryAlpha }]}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Strict 18+ Adult Policy
              </Text>
              <Badge label="Non-negotiable safeguard" variant="success" />
            </View>
          </View>

          <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
            Thrivefold takes participant safety seriously. All adult-social features, letter writing, and private communities require adult eligibility.
          </Text>

          <View style={[styles.assuranceBox, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
            <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
              What this means
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
              • Health tools don't need any age check.{'\n'}
              • Letters and other social features need a real age check before they unlock. That check isn't available yet, so they stay off for now.{'\n'}
              • Your birthdate is never shown on your public pseudonym profile.
            </Text>
          </View>
        </Card>

        <Button
          label={saving ? 'Saving…' : "I'm 18 or older"}
          onPress={handleDeclareAdult}
          style={{ marginTop: spacing.sm }}
        />

        <Button
          label="Exit and Cancel"
          variant="outline"
          onPress={() => router.back()}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assuranceBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
});
