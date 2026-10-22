import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Chip } from '../../../components/ui/Chip';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';

export default function SymptomsScreen() {
  const { colors, typography, spacing } = useTheme();
  const { todaySymptoms, addTodaySymptom, removeTodaySymptom, checkInHistory } = useRootStore(
    useShallow((s) => ({ todaySymptoms: s.todaySymptoms, addTodaySymptom: s.addTodaySymptom, removeTodaySymptom: s.removeTodaySymptom, checkInHistory: s.checkInHistory })),
  );

  const commonSymptoms = [
    'Mild energy surge',
    'Cramping / Discomfort',
    'Lower Back Aches',
    'Brain Fog',
    'Bloating / Water Retention',
    'Headache / Tension',
    'Restlessness',
    'Digestive Sensitivity',
    'Joint Stiffness',
    'Emotional Sensitivity',
  ];

  const toggleSymptom = (s: string) => {
    if (todaySymptoms.includes(s)) {
      removeTodaySymptom(s);
    } else {
      addTodaySymptom(s);
    }
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Symptom Tracker" subtitle="Log & Track Physical Sensations" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 8 }]}>
            Today's Logged Symptoms ({todaySymptoms.length})
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 12 }]}>
            Tap any symptom tag to add or remove it from today's on-device encrypted record.
          </Text>
          <View style={styles.chipRow}>
            {commonSymptoms.map((s) => {
              const active = todaySymptoms.includes(s);
              return (
                <Chip
                  key={s}
                  label={s}
                  selected={active}
                  onPress={() => toggleSymptom(s)}
                  style={{ marginRight: 6, marginBottom: 6 }}
                />
              );
            })}
          </View>
        </Card>

        {/* Historic Log Timeline */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          Recent History
        </Text>

        {checkInHistory.map((item) => (
          <Card key={item.id} style={{ marginBottom: spacing.sm }}>
            <View style={styles.historyRow}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
              <Badge label={`Energy: ${item.energy}/10`} variant="neutral" />
            </View>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
              Symptoms: {item.symptoms.length > 0 ? item.symptoms.join(', ') : 'None reported (Clear day)'}
            </Text>
          </Card>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
