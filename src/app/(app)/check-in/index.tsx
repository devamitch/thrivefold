import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

export default function CheckInScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const {
    todayEnergy,
    todayMood,
    todayStress,
    todaySleepHours,
    todaySymptoms,
    updateTodayMetrics,
    addTodaySymptom,
    removeTodaySymptom,
    addCheckIn,
  } = useRootStore(
    useShallow((s) => ({ todayEnergy: s.todayEnergy, todayMood: s.todayMood, todayStress: s.todayStress, todaySleepHours: s.todaySleepHours, todaySymptoms: s.todaySymptoms, updateTodayMetrics: s.updateTodayMetrics, addTodaySymptom: s.addTodaySymptom, removeTodaySymptom: s.removeTodaySymptom, addCheckIn: s.addCheckIn })),
  );

  // Neutral starting positions for the controls; nothing is saved until "Save".
  const [energy, setEnergy] = useState(todayEnergy ?? 5);
  const [mood, setMood] = useState(todayMood ?? 5);
  const [stress, setStress] = useState(todayStress ?? 5);
  const [sleep, setSleep] = useState(todaySleepHours ?? 7);

  const symptomsList = [
    'Cramps',
    'Bloating',
    'Headache',
    'Fatigue',
    'Breast Tenderness',
    'Acne',
    'Back Pain',
    'Nausea',
    'High Energy',
    'Clear Skin',
    'Calm Mood',
    'Social',
  ];

  const handleSave = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    updateTodayMetrics(energy, mood, stress, sleep);
    addCheckIn({
      date: new Date().toISOString().split('T')[0],
      energy,
      mood,
      stress,
      sleepHours: sleep,
      symptoms: todaySymptoms,
    });
    Alert.alert('Check-In Saved ✨', 'Your daily wellness metrics and streak have been updated.', [
      { text: 'Done', onPress: () => router.back() },
    ]);
  };

  const Slider = ({ value, onChange, label, color }: { value: number; onChange: (v: number) => void; label: string; color: string }) => (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={[typography.subbody, { color: colors.text.primary }]}>{label}</Text>
        <Text style={[typography.bodyBold, { color }]}>{value}/10</Text>
      </View>
      <View style={styles.sliderTrack}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <View
            key={i}
            style={[
              styles.sliderPoint,
              {
                backgroundColor: i <= value ? color : colors.border,
                flex: 1,
                marginHorizontal: 1,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.sliderButtons}>
        <Button
          label="-"
          size="sm"
          variant="outline"
          onPress={() => onChange(Math.max(1, value - 1))}
          style={{ width: 50 }}
        />
        <Button
          label="+"
          size="sm"
          variant="outline"
          onPress={() => onChange(Math.min(10, value + 1))}
          style={{ width: 50 }}
        />
      </View>
    </View>
  );

  return (
    <ScreenWrapper scrollable>
      <Header title="Daily Check-In" subtitle="How are you feeling today?" showBack />
      <ScrollView style={[styles.content, { paddingHorizontal: 16, paddingBottom: 32 }]}>
        {/* Energy Slider */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Slider
            label="Energy Level"
            value={energy}
            onChange={setEnergy}
            color={colors.primary}
          />
        </Card>

        {/* Mood Slider */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Slider
            label="Mood"
            value={mood}
            onChange={setMood}
            color={colors.success}
          />
        </Card>

        {/* Stress Slider */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Slider
            label="Stress Level"
            value={stress}
            onChange={setStress}
            color={colors.error}
          />
        </Card>

        {/* Sleep Hours */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <View style={styles.sliderHeader}>
            <Text style={[typography.subbody, { color: colors.text.primary }]}>Sleep Hours</Text>
            <Text style={[typography.bodyBold, { color: colors.primary }]}>{sleep}h</Text>
          </View>
          <View style={styles.sliderButtons}>
            <Button
              label="-0.5"
              size="sm"
              variant="outline"
              onPress={() => setSleep(Math.max(0, sleep - 0.5))}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              label="+0.5"
              size="sm"
              variant="outline"
              onPress={() => setSleep(Math.min(24, sleep + 0.5))}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </Card>

        {/* Symptoms */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 8 }]}>
          Today's Symptoms
        </Text>
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <View style={styles.chipsContainer}>
            {symptomsList.map((sym) => (
              <Chip
                key={sym}
                label={sym}
                selected={todaySymptoms.includes(sym)}
                onPress={() => {
                  if (todaySymptoms.includes(sym)) {
                    removeTodaySymptom(sym);
                  } else {
                    addTodaySymptom(sym);
                  }
                }}
              />
            ))}
          </View>
        </Card>

        {/* Save Button */}
        <Button label="Save Check-In" onPress={handleSave} size="lg" />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  sliderPoint: {
    height: '100%',
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
