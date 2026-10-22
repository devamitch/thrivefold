import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { getCyclePredictions } from '../../../domain/health/cycleCalculations';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

export default function CycleScreen() {
  const { colors, typography, spacing } = useTheme();
  const cycleData = useRootStore((s) => s.cycleData);
  const updateCycleData = useRootStore((s) => s.updateCycleData);
  const todaySymptoms = useRootStore((s) => s.todaySymptoms);
  const addTodaySymptom = useRootStore((s) => s.addTodaySymptom);
  const removeTodaySymptom = useRootStore((s) => s.removeTodaySymptom);
  const showToast = useRootStore((s) => s.showToast);

  // Predictions only exist once the person has entered their own dates.
  const predictions = useMemo(
    () =>
      cycleData
        ? getCyclePredictions(cycleData.lastPeriodDate, cycleData.cycleLengthDays, cycleData.periodLengthDays)
        : null,
    [cycleData],
  );

  const [editing, setEditing] = useState(false);
  const [daysAgo, setDaysAgo] = useState(0);
  const [cycleLength, setCycleLength] = useState(cycleData?.cycleLengthDays ?? 28);
  const [periodLength, setPeriodLength] = useState(cycleData?.periodLengthDays ?? 5);
  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>(todaySymptoms);

  const saveCycle = () => {
    const start = new Date();
    start.setDate(start.getDate() - daysAgo);
    const lastPeriodDate = start.toISOString().split('T')[0];
    const next = getCyclePredictions(lastPeriodDate, cycleLength, periodLength);
    updateCycleData({
      lastPeriodDate,
      cycleLengthDays: cycleLength,
      periodLengthDays: periodLength,
      ...(next ? { currentPhase: next.currentPhase.phase, estimatedNextPeriodDate: new Date(next.nextPeriodDate).toISOString().split("T")[0] } : {}),
    });
    setEditing(false);
    showToast({ type: 'success', message: 'Cycle details saved on this device' });
  };

  const saveSymptoms = () => {
    todaySymptoms.filter((s) => !loggedSymptoms.includes(s)).forEach(removeTodaySymptom);
    loggedSymptoms.forEach(addTodaySymptom);
    showToast({ type: 'success', message: 'Today\'s symptoms saved' });
  };

  const symptomsList = [
    'Mild Cramps',
    'Bloating',
    'Tender Breasts',
    'Headache',
    'Energetic',
    'Fatigue',
    'Calm Mood',
    'Sensitive Mood',
  ];

  const toggleSymptom = (sym: string) => {
    setLoggedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Cycle Rhythm" subtitle="Hormone & Phase Tracker" showBack />
      <View style={[styles.content, { paddingHorizontal: 16, paddingBottom: 32 }]}>
        {(!cycleData || editing) && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              {cycleData ? 'Edit your cycle' : 'Set up cycle tracking'}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, marginBottom: 12 }]}>
              Predictions are estimates from the dates you enter, not medical advice. Cycles vary;
              talk to a clinician about anything that worries you.
            </Text>
            <Stepper
              label="Last period started"
              value={daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
              onMinus={() => setDaysAgo((d) => Math.max(0, d - 1))}
              onPlus={() => setDaysAgo((d) => Math.min(90, d + 1))}
            />
            <Stepper
              label="Usual cycle length"
              value={`${cycleLength} days`}
              onMinus={() => setCycleLength((d) => Math.max(18, d - 1))}
              onPlus={() => setCycleLength((d) => Math.min(45, d + 1))}
            />
            <Stepper
              label="Usual period length"
              value={`${periodLength} days`}
              onMinus={() => setPeriodLength((d) => Math.max(1, d - 1))}
              onPlus={() => setPeriodLength((d) => Math.min(10, d + 1))}
            />
            <Button label="Save cycle details" size="sm" onPress={saveCycle} style={{ marginTop: 12 }} />
          </Card>
        )}

        {/* Phase Card */}
        {predictions && (
          <Card variant="tinted" style={{ marginBottom: 16, padding: 24, backgroundColor: predictions.currentPhase.bgColor }}>
            <View style={styles.rowBetween}>
              <Text style={[typography.label, { color: predictions.currentPhase.color }]}>
                Cycle Day {predictions.currentPhase.day}
              </Text>
              <Badge label={predictions.currentPhase.label} variant="primary" />
            </View>
            <Text style={[typography.heading, { color: predictions.currentPhase.color, marginTop: 8 }]}>
              {predictions.currentPhase.label} Phase
            </Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 8 }]}>
              {predictions.currentPhase.description}
            </Text>
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
              {predictions.currentPhase.daysUntilNext} days until {predictions.currentPhase.nextPhase}
            </Text>
          </Card>
        )}

        {/* Prediction summary */}
        {cycleData && !editing && (
        <Card style={{ marginBottom: 16 }} onPress={() => setEditing(true)}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 8 }]}>
            Cycle Schedule
          </Text>
          <View style={styles.metricRow}>
            <View>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Cycle Length</Text>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                {cycleData.cycleLengthDays} Days
              </Text>
            </View>
            <View>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Period Duration</Text>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                {cycleData.periodLengthDays} Days
              </Text>
            </View>
            <View>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Next Est. Period</Text>
              <Text style={[typography.bodyBold, { color: colors.primary }]}>
                {predictions ? new Date(predictions.nextPeriodDate).toLocaleDateString() : 'Not set'}
              </Text>
            </View>
          </View>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 10 }]}>Tap to edit</Text>
        </Card>
        )}

        {/* Symptom Logger */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 8 }]}>
          Log Today's Symptoms
        </Text>
        <Card style={{ marginBottom: 16 }}>
          <View style={styles.chipsContainer}>
            {symptomsList.map((sym) => (
              <Chip
                key={sym}
                label={sym}
                selected={loggedSymptoms.includes(sym)}
                onPress={() => toggleSymptom(sym)}
              />
            ))}
          </View>
          <Button label="Save today's symptoms" size="sm" onPress={saveSymptoms} style={{ marginTop: 16 }} />
        </Card>
      </View>
    </ScreenWrapper>
  );
}

function Stepper({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.stepperRow}>
      <View style={{ flex: 1 }}>
        <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{value}</Text>
      </View>
      <Button label="−" variant="outline" size="sm" onPress={onMinus} accessibilityLabel={`Decrease ${label}`} />
      <View style={{ width: 8 }} />
      <Button label="+" variant="outline" size="sm" onPress={onPlus} accessibilityLabel={`Increase ${label}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  content: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
