import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { BetaBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { FREQUENCIES, ITEMS, scoreFocusCheck, type Frequency } from '../../../domain/wellbeing/focusCheck';
import { useTheme } from '../../../theme/useTheme';

/**
 * Focus & attention self-check (WHO ASRS-v1.1 screener), one statement at a time, skippable at
 * any point. Answers stay on this screen and are not saved or sent. A screener, not a diagnosis.
 */
export default function FocusCheckScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const [answers, setAnswers] = useState<(Frequency | null)[]>(ITEMS.map(() => null));
  const [step, setStep] = useState<number | null>(null);
  const result = scoreFocusCheck(answers);

  const answer = (v: Frequency) => {
    if (step === null) return;
    const next = [...answers];
    next[step] = v;
    setAnswers(next);
    setStep(step + 1 < ITEMS.length ? step + 1 : ITEMS.length);
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="BETA LAB · SELF-CHECK"
          title="Focus & attention"
          subtitle="Six quick moments, skip any time"
          showBack
          rightAction={<BetaBadge />}
        />
      }
    >
      {step === null ? (
        <Card style={styles.card}>
          <Text style={[typography.body, { color: colors.text.secondary }]}>
            Over the last six months, how often have these happened? It takes about a minute. This is the World Health
            Organization&apos;s adult self-report screener. It cannot diagnose anything, and your answers are not saved
            or sent.
          </Text>
          <Button label="Start" onPress={() => setStep(0)} style={{ marginTop: 14 }} />
        </Card>
      ) : step < ITEMS.length ? (
        <Card style={styles.card}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>
            {step + 1} of {ITEMS.length}
          </Text>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 6 }]}>{ITEMS[step]}</Text>
          <View style={styles.chips}>
            {FREQUENCIES.map((f, i) => (
              <Chip key={f} label={f} selected={answers[step] === i} onPress={() => answer(i as Frequency)} />
            ))}
          </View>
          <View style={styles.row}>
            <Button
              label="Back"
              variant="ghost"
              size="sm"
              disabled={step === 0}
              onPress={() => setStep(Math.max(0, step - 1))}
            />
            <Button label="Stop here" variant="ghost" size="sm" onPress={() => router.back()} />
          </View>
        </Card>
      ) : result ? (
        <Card style={styles.card}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            {result.flagged ? 'Worth talking to a professional' : 'Not a strong pattern'}
          </Text>
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: 6 }]}>
            {result.flagged
              ? `${result.inRange} of 6 answers are in the range that is common in adult ADHD. Only a qualified clinician can say what it means for you; a psychiatrist or psychologist can assess it properly.`
              : `${result.inRange} of 6 answers are in that range. Everyone has focus slips; if they get in the way of work or relationships, a professional can help.`}
          </Text>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
            Tele-MANAS (Government of India) offers free mental-health support around the clock.
          </Text>
          <Button
            label="Call Tele-MANAS 14416"
            variant="outline"
            onPress={() => void Linking.openURL('tel:14416')}
            style={{ marginTop: 10 }}
          />
          <Button
            label="Focus tools: breathing"
            variant="ghost"
            onPress={() => router.push('/(app)/beta-lab/breathing' as Href)}
            style={{ marginTop: 4 }}
          />
        </Card>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
});
