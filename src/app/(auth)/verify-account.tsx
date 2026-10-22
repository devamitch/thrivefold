import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { useTheme } from '../../theme/useTheme';

export default function VerifyAccountScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const [code, setCode] = useState('');

  const handleVerify = () => {
    router.replace('/(onboarding)/choose-experience');
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Account Verification" subtitle="Enter your 6-digit confirmation code" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            Verification Code
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.md }]}>
            If you provided an optional recovery email, enter the security code sent to you.
          </Text>

          <TextInput
            placeholder="000000"
            placeholderTextColor={colors.text.muted}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            style={[
              styles.input,
              { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.surface1 },
            ]}
          />

          <Button label="Verify & Proceed" onPress={handleVerify} style={{ marginTop: spacing.sm }} />
        </Card>

        <Button
          label="Skip / Continue Without Email"
          variant="outline"
          onPress={() => router.replace('/(onboarding)/choose-experience')}
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
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 8,
  },
});
