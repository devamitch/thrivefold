import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Chip } from '../../components/ui/Chip';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../theme/useTheme';

export default function ActivityConstraintsScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const [selectedConstraints, setSelectedConstraints] = useState<string[]>(['Desk Worker / Sedentary']);

  const constraintOptions = [
    'None / Fully Mobile',
    'Desk Worker / Sedentary',
    'Lower Back Sensitivity',
    'Knee / Joint Discomfort',
    'Wrist / Shoulder Tightness',
    'Pelvic Floor Caution',
    'Chronic Fatigue / Recovery Mode',
    'Post-Partum / Healing',
    'Low Intensity Only',
  ];

  const toggleConstraint = (opt: string) => {
    setSelectedConstraints((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Movement Constraints" subtitle="Step 4 of 9" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Text style={[typography.heading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Safe Movement Pacing
        </Text>
        <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: spacing.md }]}>
          We tailor all mobility exercises, yoga sequences, and stretches to your physical boundaries. You can update these anytime.
        </Text>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>
            Any physical limitations or preferences?
          </Text>
          <View style={styles.chipRow}>
            {constraintOptions.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={selectedConstraints.includes(opt)}
                onPress={() => toggleConstraint(opt)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>
        </Card>

        <Button
          label="Next: Lifestyle & Rhythm"
          onPress={() => router.push('/(onboarding)/lifestyle-preferences')}
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
