import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Chip } from '../../components/ui/Chip';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../theme/useTheme';

export default function LifestylePreferencesScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const [diet, setDiet] = useState<string>('Vegetarian');
  const [observances, setObservances] = useState<string[]>(['Mindful Meditation Days']);

  const dietOptions = ['Standard / Omnivore', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Halal', 'Kosher', 'Sattvic / No Onion-Garlic'];
  const observanceOptions = [
    'Mindful Meditation Days',
    'Full Moon / Ekadashi Observance',
    'Sabbath / Quiet Friday-Saturday',
    'Ramadan / Fasting Rhythm',
    'Sunday Rest & Solitude',
    'None / Secular Self-Care',
  ];

  const toggleObservance = (item: string) => {
    setObservances((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Lifestyle & Rhythm" subtitle="Step 5 of 9" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Text style={[typography.heading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Voluntary Preferences
        </Text>
        <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: spacing.md }]}>
          Your dietary preferences and cultural calendar choices adapt reminders and meal suggestions. We never infer identity or beliefs indirectly.
        </Text>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>
            Dietary Guidance Anchor
          </Text>
          <View style={styles.chipRow}>
            {dietOptions.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={diet === opt}
                onPress={() => setDiet(opt)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>
            Optional Observance & Rest Reminders
          </Text>
          <View style={styles.chipRow}>
            {observanceOptions.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={observances.includes(opt)}
                onPress={() => toggleObservance(opt)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>
        </Card>

        <Button
          label="Next: Health Integrations"
          onPress={() => router.push('/(onboarding)/health-permissions')}
          style={{ marginTop: spacing.md }}
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
