import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '../theme/useTheme';

export default function NotFoundScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.xl }]}>
      <Text style={[typography.heading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
        Screen Not Found
      </Text>
      <Text style={[typography.body, { color: colors.text.secondary, marginBottom: spacing.xl, textAlign: 'center' }]}>
        This screen doesn't exist or is not available for your current account profile.
      </Text>
      <Link href="/(app)/(tabs)" style={[styles.link, { color: colors.primary }]}>
        Return to Health Home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
  },
});
