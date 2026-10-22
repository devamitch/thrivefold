import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../theme/useTheme';
import { useRootStore } from '../../stores/useRootStore';

export default function CompleteOnboardingScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const setIsOnboarded = useRootStore((s) => s.setIsOnboarded);

  const handleStart = () => {
    setIsOnboarded(true);
    router.replace('/(app)/(tabs)');
  };

  const getGreeting = () => {
    if (experience === 'men_health') {
      return 'Your Men’s Health & Vitality Space is Ready';
    }
    if (experience === 'pride_wellbeing') {
      return 'Your Affirmative Self-Care Space is Ready';
    }
    return 'Your Women’s Health & Harmony Space is Ready';
  };

  return (
    <ScreenWrapper style={styles.center}>
      <View style={[styles.content, { padding: spacing.xl }]}>
        <Text style={styles.emoji}>🌱</Text>
        <Text
          style={[
            typography.heading,
            { color: colors.text.primary, textAlign: 'center', marginBottom: spacing.sm },
          ]}
        >
          {getGreeting()}
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.xl },
          ]}
        >
          Your daily check-in, gentle movement recommendations, and local AI memory vault are initialized.
        </Text>

        <Card variant="tinted" style={{ marginBottom: spacing.xl, padding: spacing.base }}>
          <Text style={[typography.subbodyBold, { color: colors.primary, marginBottom: 4 }]}>
            Local-First Protection Active
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            All sensitive cycle metrics and personal reflections remain safely on this device.
          </Text>
        </Card>

        <Button label="Open Health Dashboard" onPress={handleStart} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 54,
    marginBottom: 16,
  },
});
