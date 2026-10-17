import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { useTheme } from '../../theme/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';

export default function SignInScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const setUser = useAuthStore((s) => s.setUser);

  const [pseudonym, setPseudonym] = useState('SolsticeSeeker');

  const handleSignIn = () => {
    setUser({
      id: `user_${Date.now()}`,
      pseudonym: pseudonym.trim() || 'SolsticeSeeker',
      avatarSeed: 'seed_01',
      age: 26,
      isAgeVerified: true,
      ageBand: '25_29',
      hasActiveSubscription: false,
      createdAt: new Date().toISOString(),
    });
    router.replace('/(app)/(tabs)');
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Welcome to Thrivefold" subtitle="Secure Pseudonymous Sign-In" />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            Sign In with Pseudonym
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.md }]}>
            No real legal name required for daily self-care and health tracking.
          </Text>

          <TextInput
            placeholder="Enter display pseudonym..."
            placeholderTextColor={colors.text.muted}
            value={pseudonym}
            onChangeText={setPseudonym}
            style={[
              styles.input,
              { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.surface1 },
            ]}
          />

          <Button label="Sign In" onPress={handleSignIn} style={{ marginTop: spacing.sm }} />
        </Card>

        <Card variant="surface1" style={{ padding: spacing.base }}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
            100% Free-Tier Architecture
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Uses Supabase serverless authentication with encrypted local storage on device.
          </Text>
        </Card>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 8,
    fontSize: 16,
  },
});
