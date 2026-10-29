import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Toggle } from '../../../components/ui/Toggle';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

export default function PreferencesBriefScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const {
    diet,
    routineMinutes,
    setOnboardingAnswers,
    hapticsEnabled,
    setHapticsEnabled,
    coachVoiceEnabled,
    setCoachVoiceEnabled,
    quietHoursStart,
    quietHoursEnd,
    adhdProfile,
    kosh,
  } = useRootStore(
    useShallow((s) => ({
      diet: s.onboarding.diet,
      routineMinutes: s.onboarding.routineMinutes,
      setOnboardingAnswers: s.setOnboardingAnswers,
      hapticsEnabled: s.hapticsEnabled,
      setHapticsEnabled: s.setHapticsEnabled,
      coachVoiceEnabled: s.coachVoiceEnabled,
      setCoachVoiceEnabled: s.setCoachVoiceEnabled,
      quietHoursStart: s.quietHoursStart,
      quietHoursEnd: s.quietHoursEnd,
      adhdProfile: s.adhdProfile,
      kosh: s.koshProfile,
    })),
  );

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="PREFERENCES & HABITS"
          title="Preferences Brief"
          subtitle="Routine, nutrition, sensory comfort and quiet hours"
          showBack
          onBack={() => router.back()}
        />
      }
    >
      <View style={styles.container}>
        {/* Card 1: Focus & Routine Pacing */}
        <Card style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.flex}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Daily Routine Length
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Choose how long your daily wellness routine should take.
              </Text>
            </View>
            {adhdProfile.completedAt ? (
              <Badge label={adhdProfile.focusStyle ?? 'Focus Profile'} variant="primary" />
            ) : null}
          </View>

          <View style={styles.chipsWrap}>
            {([5, 10, 20] as const).map((mins) => (
              <Chip
                key={mins}
                label={`${mins} min / day`}
                selected={routineMinutes === mins}
                onPress={() =>
                  setOnboardingAnswers({
                    routineMinutes: routineMinutes === mins ? null : mins,
                  })
                }
              />
            ))}
          </View>

          <PressableScale
            onPress={() => router.push('/(app)/you/adhd-screener' as Href)}
            style={[styles.subLink, { backgroundColor: colors.surface1, marginTop: spacing.md }]}
          >
            <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
            <View style={[styles.flex, { marginLeft: 10 }]}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Focus & Attention Screener
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {adhdProfile.completedAt
                  ? `Active style: ${adhdProfile.focusStyle} (Score: ${adhdProfile.score})`
                  : 'Gentle 6-question reflection for micro-step task planning'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
          </PressableScale>
        </Card>

        {/* Card 2: Food & Nutrition Brief */}
        <Card style={[styles.card, { marginTop: spacing.md }]}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Nutrition & Meal Style
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            Meal inspiration and nutrition quests follow your style.
          </Text>

          <View style={styles.chipsWrap}>
            {['No preference', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Pescatarian', 'Eggetarian'].map((d) => (
              <Chip
                key={d}
                label={d}
                selected={diet === d}
                onPress={() => setOnboardingAnswers({ diet: diet === d ? null : d })}
              />
            ))}
          </View>

          {/* Allergies / Rules summary */}
          <View style={[styles.detailBox, { borderTopColor: colors.surface1 }]}>
            <Text style={[typography.captionBold, { color: colors.text.secondary }]}>
              Allergies & Intolerances:
            </Text>
            <Text style={[typography.body, { color: colors.text.primary, marginTop: 2 }]}>
              {kosh.allergies.length ? kosh.allergies.join(', ') : 'None listed'}
            </Text>

            <Text style={[typography.captionBold, { color: colors.text.secondary, marginTop: 8 }]}>
              Food Rules:
            </Text>
            <Text style={[typography.body, { color: colors.text.primary, marginTop: 2 }]}>
              {kosh.foodRestrictions.length ? kosh.foodRestrictions.join(', ') : 'None listed'}
            </Text>

            <PressableScale
              onPress={() => router.push('/(app)/you/edit-profile' as Href)}
              style={[styles.smallBtn, { backgroundColor: colors.surface2, marginTop: 10 }]}
            >
              <Text style={[typography.captionBold, { color: colors.primary }]}>
                Edit food rules & allergies
              </Text>
            </PressableScale>
          </View>
        </Card>

        {/* Card 3: Sensory & Comfort */}
        <Card style={[styles.card, { marginTop: spacing.md }]}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Sensory & Auditory Comfort
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Haptic Feedback</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Gentle vibrations on taps, button presses, and quest achievements
              </Text>
            </View>
            <Toggle value={hapticsEnabled} onValueChange={setHapticsEnabled} />
          </View>

          <View style={[styles.switchRow, { borderTopColor: colors.surface1, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Spoken Coach Voice</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Audio direction in eye pursuits, workouts and breathing exercises
              </Text>
            </View>
            <Toggle value={coachVoiceEnabled} onValueChange={setCoachVoiceEnabled} />
          </View>

          <View style={[styles.switchRow, { borderTopColor: colors.surface1, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Quiet Hours</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {quietHoursStart} to {quietHoursEnd} (No quest or reminder notifications)
              </Text>
            </View>
            <PressableScale
              onPress={() => router.push('/(app)/you/reminders')}
              style={[styles.smallBtn, { backgroundColor: colors.surface2 }]}
            >
              <Text style={[typography.captionBold, { color: colors.primary }]}>Adjust</Text>
            </PressableScale>
          </View>
        </Card>

        {/* Card 4: Additional Personalization Shortcuts */}
        <Card style={[styles.card, { marginTop: spacing.md, marginBottom: spacing.xl }]}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 8 }]}>
            More Personalization
          </Text>

          <PressableScale
            onPress={() => router.push('/(app)/you/beliefs')}
            style={styles.linkRow}
          >
            <Ionicons name="globe-outline" size={20} color={colors.primary} />
            <View style={[styles.flex, { marginLeft: 10 }]}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Beliefs & Cultural Observances
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Optional observance reminders (kept local on this device)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
          </PressableScale>

          <PressableScale
            onPress={() => router.push('/(app)/you/reminders')}
            style={[styles.linkRow, { borderTopColor: colors.surface1, borderTopWidth: StyleSheet.hairlineWidth }]}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            <View style={[styles.flex, { marginLeft: 10 }]}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                Notifications & Quiet Time
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Morning check-in reminders and evening quiet hours
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
          </PressableScale>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  flex: { flex: 1 },
  card: {
    borderRadius: 18,
    padding: 18,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  subLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
  },
  detailBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  smallBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
});
