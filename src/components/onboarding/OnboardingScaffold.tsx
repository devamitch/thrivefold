import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';

/** The short, linear onboarding (master spec §3.3). Everything else is optional later. */
export const ONBOARDING_STEPS = [
  'choose-experience',
  'privacy-choices',
  'goals',
  'activity-constraints',
  'lifestyle-preferences',
] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

interface OnboardingScaffoldProps {
  step: OnboardingStep;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  /** Shown as a quiet "Skip" in the top bar when the step is optional. */
  onSkip?: () => void;
}

/**
 * One layout for every onboarding step: progress + back + skip on top, an editorial
 * title, scrollable content, and the primary action pinned above the safe area so it
 * never scrolls out of reach. Records the step so a closed app resumes here.
 */
export function OnboardingScaffold({
  step,
  title,
  subtitle,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  onSkip,
}: OnboardingScaffoldProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const setOnboardingStep = useRootStore((s) => s.setOnboardingStep);
  const index = ONBOARDING_STEPS.indexOf(step);

  useEffect(() => {
    setOnboardingStep(step);
  }, [setOnboardingStep, step]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.topBar, { paddingHorizontal: spacing.base }]}>
        {index > 0 ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.topButton}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </Pressable>
        ) : (
          <View style={styles.topButton} />
        )}
        <View
          style={styles.progress}
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${index + 1} of ${ONBOARDING_STEPS.length}`}
        >
          {ONBOARDING_STEPS.map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                { backgroundColor: i <= index ? colors.primary : colors.surface1 },
              ]}
            />
          ))}
        </View>
        {onSkip ? (
          <Pressable
            onPress={onSkip}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Skip this step"
            style={[styles.topButton, styles.skip]}
          >
            <Text style={[typography.subbody, { color: colors.text.secondary }]}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.topButton} />
        )}
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={[typography.display, styles.title, { color: colors.text.primary }]}
          accessibilityRole="header"
          maxFontSizeMultiplier={1.3}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.body, styles.subtitle, { color: colors.text.secondary }]}>
            {subtitle}
          </Text>
        ) : null}
        {children}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: spacing.base,
            paddingBottom: Math.max(insets.bottom, 12) + 8,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Button label={primaryLabel} onPress={onPrimary} disabled={primaryDisabled} size="lg" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  footer: { borderTopWidth: 0, paddingTop: 14 },
  progress: { flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center' },
  progressDot: { borderRadius: 2, height: 4, maxWidth: 36, flex: 1 },
  root: { flex: 1 },
  skip: { alignItems: 'flex-end' },
  subtitle: { marginBottom: 24, marginTop: 8 },
  title: { marginTop: 12 },
  topBar: { alignItems: 'center', flexDirection: 'row', height: 52 },
  topButton: { justifyContent: 'center', minHeight: 44, width: 56 },
});
