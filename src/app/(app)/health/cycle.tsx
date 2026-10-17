import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { getCyclePredictions } from '../../../domain/health/cycleCalculations';
import { useHealthStore } from '../../../stores/useHealthStore';
import { useTheme } from '../../../theme/useTheme';

export default function CycleScreen() {
  const { colors, typography, spacing } = useTheme();
  const cycleData = useHealthStore((s) => s.cycleData);

  // Calculate current phase using the cycle calculations
  const predictions = useMemo(() => {
    return getCyclePredictions(
      cycleData.lastPeriodDate,
      cycleData.cycleLengthDays,
      cycleData.periodLengthDays
    );
  }, [cycleData]);

  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>(['Mild Cramps', 'Energetic']);

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
        <Card style={{ marginBottom: 16 }}>
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
        </Card>

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
          <Button label="Save Cycle Logs" size="sm" onPress={() => {}} style={{ marginTop: 16 }} />
        </Card>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
