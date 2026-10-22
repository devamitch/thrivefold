import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { useTheme } from '../../theme/useTheme';
import { useRootStore } from '../../stores/useRootStore';
import { ProductExperience } from '../../theme/tokens';

import { Icon, IconName } from '../../components/ui/Icon';

export default function ChooseExperienceScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const experience = useRootStore((s) => s.experience);
  const setExperience = useRootStore((s) => s.setExperience);

  const experiences: { id: ProductExperience; title: string; subtitle: string; desc: string; icon: IconName }[] = [
    {
      id: 'women_health',
      title: "Women's Health & Wellbeing",
      subtitle: 'Harmony & Vitality',
      desc: 'Cycle tracking, symptom patterns, hormonal balance, emotional resilience and gentle movement.',
      icon: 'heart',
    },
    {
      id: 'men_health',
      title: "Men's Health & Vitality",
      subtitle: 'Strength, Mobility & Focus',
      desc: 'Posture mobility, stress & work decompression, pelvic-floor awareness, and sustainable fitness routines.',
      icon: 'bolt',
    },
    {
      id: 'pride_wellbeing',
      title: 'Pride & LGBTQ+ Wellbeing',
      subtitle: 'Affirmative Self-Care',
      desc: 'Identity-affirming health tools, rainbow-gold visual system, private community circles, and optional pronouns.',
      icon: 'sun',
    },
  ];

  return (
    <ScreenWrapper scrollable>
      <Header title="Thrivefold" subtitle="Personal wellbeing that adapts to you." />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Text style={[typography.heading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Select Your Experience
        </Text>
        <Text style={[typography.subbody, { color: colors.text.secondary, marginBottom: spacing.lg }]}>
          Choose the starting focus for your daily routines and dashboard. You can switch or adjust themes at any time.
        </Text>

        {experiences.map((item) => {
          const isSelected = experience === item.id;
          return (
            <Card
              key={item.id}
              variant={isSelected ? 'tinted' : 'surface'}
              onPress={() => setExperience(item.id)}
              style={[
                styles.expCard,
                {
                  marginBottom: spacing.md,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: isSelected ? colors.primaryAlpha : colors.surface1 }]}>
                  <Icon name={item.icon} size={24} color={isSelected ? colors.primary : colors.text.secondary} />
                </View>
                <View style={styles.headerText}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    {item.title}
                  </Text>
                  <Text style={[typography.captionBold, { color: colors.primary, marginTop: 2 }]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.sm }]}>
                {item.desc}
              </Text>
            </Card>
          );
        })}

        <Button
          label="Continue to Privacy & Terms"
          onPress={() => router.push('/(onboarding)/privacy-choices')}
          style={{ marginTop: spacing.lg }}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  expCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
});
