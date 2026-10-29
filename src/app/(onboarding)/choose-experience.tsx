import { SquircleSurface } from '../../components/ui/SquircleSurface';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingScaffold } from '../../components/onboarding/OnboardingScaffold';
import { Card } from '../../components/ui/Card';
import { Icon, IconName } from '../../components/ui/Icon';
import { useRootStore } from '../../stores/useRootStore';
import { suggestedExperience } from '../../domain/account/googleProfile';
import { ProductExperience } from '../../theme/tokens';
import { TERMS_VERSION } from '../../domain/legal/terms';
import { useTheme } from '../../theme/useTheme';

const EXPERIENCES: { id: ProductExperience; title: string; desc: string; icon: IconName }[] = [
  {
    id: 'women_health',
    title: "Women's health",
    desc: 'Cycle and symptom tracking, energy, sleep and gentle movement.',
    icon: 'heart',
  },
  {
    id: 'men_health',
    title: "Men's health",
    desc: 'Mobility, posture, stress recovery and sustainable routines.',
    icon: 'bolt',
  },
  {
    id: 'pride_wellbeing',
    title: 'LGBTQ+ wellbeing',
    desc: 'Affirming self-care with private, optional identity settings.',
    icon: 'sun',
  },
];

export default function ChooseExperienceScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const experience = useRootStore((s) => s.experience);
  const confirmed = useRootStore((s) => s.experienceConfirmed);
  const agreed = useRootStore((s) => Boolean(s.adultConfirmedAt) && s.termsAcceptedVersion === TERMS_VERSION);
  const setExperience = useRootStore((s) => s.setExperience);
  const googleGender = useRootStore((s) => (s.user?.profileSource === 'google' ? s.user.gender : null));
  const suggested = suggestedExperience(googleGender ?? null);

  return (
    <OnboardingScaffold
      step="choose-experience"
      reward="experience"
      title="Where would you like to start?"
      subtitle="This sets your home screen, tools and look. You can change it later in Personalize."
      primaryLabel={confirmed ? 'Continue' : 'Choose one to continue'}
      primaryDisabled={!confirmed}
      onPrimary={() => router.push(agreed ? '/(onboarding)/goals' : '/(onboarding)/privacy-choices')}
    >
      {EXPERIENCES.map((item) => {
        const selected = confirmed && experience === item.id;
        return (
          <Card
            key={item.id}
            variant={selected ? 'tinted' : 'surface'}
            onPress={() => setExperience(item.id)}
            style={[
              styles.card,
              { marginBottom: spacing.md, borderColor: selected ? colors.primary : colors.border },
            ]}
          >
            <View
              style={styles.row}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${item.title}. ${item.desc}`}
            >
              <View
                style={[
                  styles.icon,
                  { backgroundColor: selected ? colors.primaryAlpha : colors.surface1 },
                ]}
              >
                <Icon name={item.icon} size={22} color={selected ? colors.primary : colors.text.secondary} />
              </View>
              <View style={styles.text}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>{item.title}</Text>
                <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
                  {item.desc}
                </Text>
                {suggested === item.id ? (
                  <Text style={[typography.captionBold, { color: colors.primary, marginTop: 4 }]}>Suggested from your Google profile</Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.radio,
                  { borderColor: selected ? colors.primary : colors.border },
                ]}
              >
                {selected ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}
              </View>
            </View>
          </Card>
        );
      })}
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16 },
  icon: { alignItems: 'center', borderRadius: 14, height: 44, justifyContent: 'center', width: 44 },
  radio: {
    alignItems: 'center',
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    marginLeft: 12,
    width: 22,
  },
  radioDot: { borderRadius: 5, height: 10, width: 10 },
  row: { alignItems: 'center', flexDirection: 'row' },
  text: { flex: 1, marginLeft: 12 },
});
