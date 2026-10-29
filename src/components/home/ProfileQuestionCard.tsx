import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { koshCompleteness } from '../../domain/account/koshProfile';
import { SNOOZE_MS, nextProfileQuestion, type ProfileQuestion } from '../../domain/account/profileQuestions';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';

const WHY: Record<ProfileQuestion, string> = {
  birthday: 'Add your birthday so a new phone restores your account.',
  height: 'Add your height for BMI and step distance.',
  weight: 'Add your weight so calorie estimates fit you.',
  diet: 'Say how you eat so meal ideas fit.',
  routine: 'Pick a routine length so quests fit your day.',
};

/**
 * A quiet nudge, not a questionnaire: how complete the profile is and the one detail that would
 * help most right now. Tapping opens the profile; "Later" hides it for a week.
 */
export function ProfileQuestionCard() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const s = useRootStore(
    useShallow((st) => ({
      user: st.user,
      heightCm: st.heightCm,
      weightKg: st.weightKg,
      diet: st.onboarding.diet,
      routineMinutes: st.onboarding.routineMinutes,
      profileAsk: st.profileAsk,
      kosh: st.koshProfile,
      contacts: st.emergencyContacts.length,
      snooze: st.snoozeProfileQuestion,
    })),
  );
  const state = {
    signedIn: !!s.user && !s.user.isGuest,
    birthDate: s.user?.birthDate,
    heightCm: s.heightCm,
    weightKg: s.weightKg,
    diet: s.diet,
    routineMinutes: s.routineMinutes,
    snoozedUntil: s.profileAsk.snoozedUntil,
    lastAskedAt: null,
  };
  const q = nextProfileQuestion(state, Date.now());
  if (!q) return null;
  const pct = Math.round((koshCompleteness(s.kosh, s.contacts) + (s.heightCm ? 100 : 0) + (s.weightKg ? 100 : 0)) / 3);

  return (
    <Card style={{ marginTop: spacing.md }} onPress={() => router.push('/(app)/you/profile' as Href)} accessibilityLabel={`Profile ${pct}% complete. ${WHY[q]}`}>
      <View style={styles.row}>
        <View style={[styles.ring, { borderColor: colors.primary }]}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>{pct}%</Text>
        </View>
        <View style={styles.flex}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Your profile</Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{WHY[q]}</Text>
        </View>
        <Text
          style={[typography.captionBold, { color: colors.text.muted, padding: 8 }]}
          onPress={() => s.snooze(q, Date.now() + SNOOZE_MS)}
          accessibilityRole="button"
        >
          Later
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ring: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
