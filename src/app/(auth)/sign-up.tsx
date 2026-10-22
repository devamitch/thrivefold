import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Header } from '../../components/ui/Header';
import { useTheme } from '../../theme/useTheme';
import { useRootStore } from '../../stores/useRootStore';

import { TextField } from '../../components/ui/TextField';

export default function SignUpScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const setUser = useRootStore((s) => s.setUser);

  const [pseudonym, setPseudonym] = useState('');
  const [email, setEmail] = useState('');
  const [ageBand, setAgeBand] = useState<'18_24' | '25_29' | '30_34' | '35_39' | '40_44' | '45_49' | '50_plus'>('25_29');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const ageBands = [
    { id: '18_24', label: '18–24' },
    { id: '25_29', label: '25–29' },
    { id: '30_34', label: '30–34' },
    { id: '35_39', label: '35–39' },
    { id: '40_44', label: '40–44' },
    { id: '45_49', label: '45–49' },
    { id: '50_plus', label: '50+' },
  ];

  const handleSignUp = () => {
    if (!agreedToTerms) return;

    setUser({
      id: `user_${Date.now()}`,
      pseudonym: pseudonym.trim() || 'NewSeeker',
      email: email.trim() || undefined,
      avatarSeed: `seed_${Math.floor(Math.random() * 999)}`,
      age: null, // self-declared band only; exact age comes from age assurance
      isAgeVerified: false,
      ageBand,
      createdAt: new Date().toISOString(),
    });

    router.push('/(auth)/verify-age');
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Create Account" subtitle="Private, Pseudonymous, Safe" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            Choose Your Identity
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.md }]}>
            We never require government IDs for personal wellness tracking.
          </Text>

          <TextField
            label="PSEUDONYM / NICKNAME"
            placeholder="e.g. CedarWhisper, GentlePacer"
            value={pseudonym}
            onChangeText={setPseudonym}
          />

          <TextField
            label="EMAIL (OPTIONAL FOR RECOVERY)"
            placeholder="optional@domain.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[typography.captionBold, { color: colors.text.secondary, marginTop: 16, marginBottom: 8 }]}>
            AGE BAND (18+ MANDATORY FOR COMMUNITY)
          </Text>
          <View style={styles.chipRow}>
            {ageBands.map((b) => (
              <Chip
                key={b.id}
                label={b.label}
                selected={ageBand === b.id}
                onPress={() => setAgeBand(b.id as any)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>
        </Card>

        {/* Terms Agreement */}
        <Pressable
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          style={[styles.termsRow, { borderColor: agreedToTerms ? colors.primary : colors.border, backgroundColor: colors.surface1 }]}
        >
          <Ionicons
            name={agreedToTerms ? 'checkbox' : 'square-outline'}
            size={22}
            color={agreedToTerms ? colors.primary : colors.text.muted}
          />
          <Text style={[typography.caption, { color: colors.text.primary, marginLeft: 10, flex: 1 }]}>
            I confirm I am 18+ years old and agree to the Terms of Service, Privacy Policy, and Community Rules.
          </Text>
        </Pressable>

        <Button
          label="Continue to Age Assurance"
          disabled={!agreedToTerms}
          onPress={handleSignUp}
          style={{ marginTop: spacing.md }}
        />

        <Button
          label="Already have an account? Sign In"
          variant="outline"
          onPress={() => router.push('/(auth)/sign-in')}
          style={{ marginTop: spacing.sm }}
        />

        <Button
          label="Instant Guest Mode (Dev & Testing)"
          variant="secondary"
          onPress={() => {
            useRootStore.getState().continueAsGuest();
            router.replace('/(app)/(tabs)');
          }}
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
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
});
