import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import {
  ADHD_OPTIONS,
  ADHD_QUESTIONS,
  evaluateAdhdAnswers,
} from '../../../domain/account/adhdProfile';
import { hapticLight, hapticSuccess } from '../../../services/haptics';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

export default function AdhdScreenerScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const { adhdProfile, setAdhdProfile } = useRootStore(
    useShallow((s) => ({
      adhdProfile: s.adhdProfile,
      setAdhdProfile: s.setAdhdProfile,
    })),
  );

  const [answers, setAnswers] = useState<Record<string, number>>(adhdProfile.answers ?? {});
  const [retaking, setRetaking] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === ADHD_QUESTIONS.length;
  const showResults = Boolean(adhdProfile.completedAt) && !retaking;

  const evaluation = evaluateAdhdAnswers(answers);

  const selectOption = (qId: string, val: number) => {
    hapticLight();
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSave = () => {
    hapticSuccess();
    const evalResult = evaluateAdhdAnswers(answers);
    setAdhdProfile({
      answers,
      completedAt: new Date().toISOString(),
      focusStyle: evalResult.focusStyle,
      score: evalResult.totalScore,
    });
    setRetaking(false);
  };

  const handleSkip = () => {
    router.back();
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="YOU"
          title="Focus self-check"
          subtitle="Six questions · about 1 minute · skip any"
          showBack
          onBack={() => router.back()}
        />
      }
    >
      <View style={styles.container}>
        {/* What this is, and what it is not */}
        <SquircleSurface radius={16} fill={colors.surface2} style={styles.noticeCard}>
          <View style={styles.row}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary, marginLeft: 8 }]}>
              Not a diagnosis
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
            Based on the WHO adult ADHD self-report screener (ASRS v1.1). Your answers only change how Thrive paces
            tasks, for example smaller steps and gentler reminders. They stay on this phone. If focus problems affect
            your life, talk to a doctor.
          </Text>
        </SquircleSurface>

        {showResults ? (
          <View style={{ marginTop: spacing.md }}>
            {/* Focus Style Summary Card */}
            <Card style={styles.resultCard}>
              <View style={styles.rowBetween}>
                <Text style={[typography.captionBold, { color: colors.primary }]}>YOUR FOCUS STYLE</Text>
                <Badge label="Active" variant="success" />
              </View>

              <Text style={[typography.heading, { color: colors.text.primary, marginTop: 8 }]}>
                {adhdProfile.focusStyle ?? evaluation.focusStyle}
              </Text>
              <Text style={[typography.body, { color: colors.text.secondary, marginTop: 4 }]}>
                {evaluation.focusStyleDescription}
              </Text>

              <View style={[styles.statsRow, { borderTopColor: colors.surface1 }]}>
                <View style={styles.statBox}>
                  <Text style={[typography.heading, { color: colors.primary }]}>
                    {evaluation.totalScore}/{evaluation.maxScore}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Reflection Index</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.surface1 }]} />
                <View style={styles.statBox}>
                  <Text style={[typography.heading, { color: colors.accent }]}>
                    {evaluation.recommendedPacing === 'micro' ? '5 min' : '10-20 min'}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Recommended Pacing</Text>
                </View>
              </View>

              {/* Strengths */}
              <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.md }]}>
                Natural Strengths
              </Text>
              {evaluation.strengths.map((s, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                  <Text style={[typography.body, styles.flex, { color: colors.text.primary, marginLeft: 8 }]}>
                    {s}
                  </Text>
                </View>
              ))}

              {/* Tips for Thrivefold */}
              <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.md }]}>
                Thrivefold Habit Tweaks
              </Text>
              {evaluation.tips.map((tip, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                  <Text style={[typography.caption, styles.flex, { color: colors.text.secondary, marginLeft: 8 }]}>
                    {tip}
                  </Text>
                </View>
              ))}

              <View style={[styles.row, { gap: 8, marginTop: spacing.lg }]}>
                <Button
                  label="Retake reflection"
                  variant="outline"
                  onPress={() => setRetaking(true)}
                  style={styles.flex}
                />
                <Button label="Done" onPress={() => router.back()} style={styles.flex} />
              </View>
            </Card>
          </View>
        ) : (
          <View style={{ marginTop: spacing.md }}>
            {/* Progress header */}
            <View style={styles.rowBetween}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Questions
              </Text>
              <Text style={[typography.captionBold, { color: colors.primary }]}>
                {answeredCount}/{ADHD_QUESTIONS.length}
              </Text>
            </View>

            {/* Questions list */}
            {ADHD_QUESTIONS.map((q, idx) => {
              const currentVal = answers[q.id];
              return (
                <Card key={q.id} style={styles.questionCard}>
                  <View style={styles.qHead}>
                    <View style={[styles.qNum, { backgroundColor: colors.primaryAlpha }]}>
                      <Text style={[typography.captionBold, { color: colors.primary }]}>{idx + 1}</Text>
                    </View>
                    <View style={styles.flex}>
                      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{q.title}</Text>
                      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                        {q.subtext}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.optionsWrap}>
                    {ADHD_OPTIONS.map((opt) => (
                      <Chip
                        key={opt.value}
                        label={opt.label}
                        selected={currentVal === opt.value}
                        onPress={() => selectOption(q.id, opt.value)}
                      />
                    ))}
                  </View>
                </Card>
              );
            })}

            {/* Bottom Actions */}
            <View style={[styles.row, { gap: 10, marginTop: spacing.lg, marginBottom: spacing.xxl }]}>
              <Button label="Skip for now" variant="ghost" onPress={handleSkip} style={styles.flex} />
              <Button
                label={isComplete ? 'Save & View Style' : `Save (${answeredCount}/${ADHD_QUESTIONS.length})`}
                disabled={answeredCount === 0}
                onPress={handleSave}
                style={styles.flex}
              />
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  noticeCard: {
    padding: 16,
    borderRadius: 16,
  },
  resultCard: {
    borderRadius: 20,
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  questionCard: {
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  qHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  qNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
});
