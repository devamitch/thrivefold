import { SquircleSurface } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import { BaselineQuestions } from '../../components/onboarding/BaselineQuestions';
import { AppHeader } from '../../components/ui/AppHeader';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { EMPTY_BASELINE, fitFor, isSetupSectionAnswered, SETUP_REWARDS, setupLedgerKey } from '../../domain/game/setupProfile';
import { constraintsFor, goalsFor, ROUTINE_LENGTHS } from '../../domain/onboarding/options';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../../components/ui/PressableScale';

/**
 * Everything onboarding asked, editable at any time. Each change re-fits today's quests that
 * have not been started yet (questSlice.refitDailyQuests); finished quests and earned XP stay.
 * Setup steps that were skipped earlier still earn their XP here once answered.
 */
export default function PersonalizeScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { experience, setExperience, onboarding, setOnboardingAnswers, todayQuests, ledger, claimSetupReward, todayCheckIn } = useRootStore(
    useShallow((s) => ({
      experience: s.experience,
      setExperience: s.setExperience,
      onboarding: s.onboarding,
      setOnboardingAnswers: s.setOnboardingAnswers,
      todayQuests: s.todayQuests,
      ledger: s.rewardLedger,
      claimSetupReward: s.claimSetupReward,
      todayCheckIn: s.checkInHistory.find((c) => c.date === formatLocalDate(new Date())),
    })),
  );

  useEffect(() => {
    useRootStore.getState().autoClaimAnsweredSetupRewards();
  }, []);

  const fit = fitFor(onboarding, todayCheckIn ?? null);
  const { goals, constraints, routineMinutes } = onboarding;
  const answers = {
    goals: onboarding?.goals ?? [],
    constraints: onboarding?.constraints ?? [],
    routineMinutes: onboarding?.routineMinutes ?? null,
    diet: onboarding?.diet ?? null,
    observances: onboarding?.observances ?? [],
    baseline: { ...EMPTY_BASELINE, ...onboarding?.baseline },
  };
  const unanswered = SETUP_REWARDS.filter(
    (r) => !ledger.some((e) => e.key === setupLedgerKey(r.section)) && !isSetupSectionAnswered(r.section, answers),
  );

  const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  const claimAll = () => {
    useRootStore.getState().autoClaimAnsweredSetupRewards();
  };

  return (
    <ScreenContainer
      header={<AppHeader title="Personalize" subtitle="Goals, pace and how you feel" showBack />}
      scrollMode="shell-scroll-view"
    >
      <Card style={{ padding: spacing.base }}>
        <SquircleSurface style={styles.row}>
          <Ionicons name="options-outline" size={18} color={colors.primary} />
          <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>How your quests fit now</Text>
        </SquircleSurface>
        {(fit.reasons.length ? fit.reasons : ['Standard pace. Answer the questions below to fit quests to you.']).map((r) => (
          <Text key={r} style={[typography.subbody, { color: colors.text.secondary, marginTop: spacing.xs }]}>
            {r}
          </Text>
        ))}
        {todayQuests.length > 0 ? (
          <SquircleSurface style={{ marginTop: spacing.md }}>
            <Text style={[typography.captionBold, { color: colors.text.muted }]}>TODAY</Text>
            {todayQuests
              .filter((q) => q.status !== 'replaced' && q.status !== 'skipped')
              .map((q) => (
                <SquircleSurface key={q.id} style={[styles.row, { marginTop: 6 }]}>
                  <Ionicons
                    name={q.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={q.isCompleted ? colors.success : colors.text.muted}
                  />
                  <Text style={[typography.subbody, styles.flex, { color: colors.text.primary, marginLeft: 8 }]} numberOfLines={1}>
                    {q.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>{q.durationMinutes} min</Text>
                </SquircleSurface>
              ))}
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
              Quests you have not started change as you edit below.
            </Text>
          </SquircleSurface>
        ) : null}
      </Card>

      {unanswered.length > 0 ? (
        <PressableScale
          onPress={claimAll}
          accessibilityRole="button"
          style={[styles.claim, { backgroundColor: colors.primaryAlpha, marginTop: spacing.md }]}
        >
          <Ionicons name="trophy-outline" size={16} color={colors.primary} />
          <Text style={[typography.subbodyBold, styles.flex, { color: colors.primary, marginLeft: 8 }]}>
            {unanswered.reduce((sum, r) => sum + r.xp, 0)} setup XP open. Answer below to earn them automatically.
          </Text>
        </PressableScale>
      ) : null}

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.xs }]}>
        Your focus
      </Text>
      <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>
        Sets your home screen, tools and look. Your records are kept.
      </Text>
      <SquircleSurface style={styles.chips}>
        {(
          [
            ['women_health', "Women's health"],
            ['men_health', "Men's health"],
            ['pride_wellbeing', 'LGBTQ+ wellbeing'],
          ] as const
        ).map(([id, label]) => (
          <Chip key={id} label={label} selected={experience === id} onPress={() => setExperience(id)} />
        ))}
      </SquircleSurface>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
        What you want help with
      </Text>
      <SquircleSurface style={styles.chips}>
        {goalsFor(experience).map((g) => (
          <Chip key={g} label={g} selected={goals.includes(g)} onPress={() => setOnboardingAnswers({ goals: toggle(goals, g) })} />
        ))}
      </SquircleSurface>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
        How you are today
      </Text>
      <BaselineQuestions />

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
        Go easy on
      </Text>
      <SquircleSurface style={styles.chips}>
        {constraintsFor(experience).map((c) => (
          <Chip
            key={c}
            label={c}
            selected={constraints.includes(c)}
            onPress={() => setOnboardingAnswers({ constraints: toggle(constraints, c) })}
          />
        ))}
      </SquircleSurface>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
        Daily routine length
      </Text>
      <SquircleSurface style={styles.chips}>
        {ROUTINE_LENGTHS.map((l) => (
          <Chip
            key={l.value}
            label={l.label}
            selected={routineMinutes === l.value}
            onPress={() => setOnboardingAnswers({ routineMinutes: routineMinutes === l.value ? null : l.value })}
          />
        ))}
      </SquircleSurface>

      <Card onPress={() => router.push('/(onboarding)/lifestyle-preferences')} style={{ marginTop: spacing.xl }}>
        <SquircleSurface style={styles.row}>
          <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
          <SquircleSurface style={[styles.flex, { marginLeft: 12 }]}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Food and reminders</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Eating preference and the reminders you want</Text>
          </SquircleSurface>
          <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
        </SquircleSurface>
      </Card>
      <SquircleSurface style={{ height: spacing.xl }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  claim: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', padding: 12 },
  flex: { flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row' },
});
