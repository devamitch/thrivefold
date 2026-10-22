import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { useTheme } from '../../theme/useTheme';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const [selectedRegion, setSelectedRegion] = useState('Northern Europe / Scandinavia');

  const regions = [
    'Northern Europe / Scandinavia',
    'Western Europe / UK',
    'North America (East)',
    'North America (West)',
    'South Asia / India',
    'Southeast Asia',
    'East Asia / Japan',
    'Australia / Oceania',
    'Latin America',
  ];

  return (
    <ScreenWrapper scrollable>
      <Header title="Coarse Regional Pacing" subtitle="Step 8 of 9" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Text style={[typography.heading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Coarse Location Only
        </Text>
        <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: spacing.md }]}>
          Thrivefold NEVER tracks exact GPS coordinates or live movement history. We only require a broad regional zone to calculate realistic letter transit times and local sunrise/sunset rhythm.
        </Text>

        <Card style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="navigate-circle-outline" size={24} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
              Select Your Geographic Zone
            </Text>
          </View>
          <View style={styles.chipRow}>
            {regions.map((reg) => (
              <Chip
                key={reg}
                label={reg}
                selected={selectedRegion === reg}
                onPress={() => setSelectedRegion(reg)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>
        </Card>

        <Card variant="surface1" style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.captionBold, { color: colors.text.primary }]}>
            Privacy Invariant (Section 9.2 & 10.1)
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            No live GPS tracking, no exact coordinates stored in Supabase, and zero proximity surveillance.
          </Text>
        </Card>

        <Button
          label="Next: Daily Routine Plan"
          onPress={() => router.push('/(onboarding)/daily-routine')}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
