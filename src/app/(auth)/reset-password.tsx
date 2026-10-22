import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { useTheme } from '../../theme/useTheme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = () => {
    setSent(true);
    Alert.alert('Reset Link Sent', 'If an account exists with this email, a private recovery link was sent.');
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Account Recovery" subtitle="Reset your access credentials" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            Self-Service Credential Reset
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.md }]}>
            Enter your verified recovery email address to receive a secure login token.
          </Text>

          <TextInput
            placeholder="recovery@domain.com"
            placeholderTextColor={colors.text.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[
              styles.input,
              { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.surface1 },
            ]}
          />

          <Button
            label={sent ? 'Resend Recovery Link' : 'Send Reset Link'}
            onPress={handleReset}
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        <Button
          label="Return to Sign In"
          variant="outline"
          onPress={() => router.push('/(auth)/sign-in')}
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
    marginBottom: 8,
  },
});
