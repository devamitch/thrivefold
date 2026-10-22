import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import {
  CyclePhase,
  getCyclePredictions,
  getPhaseEnergyProfile,
  PHASE_CONFIG,
} from '../../../domain/health/cycleCalculations';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

export default function CycleScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const cycleData = useRootStore((s) => s.cycleData);
  const updateCycleData = useRootStore((s) => s.updateCycleData);
  const todaySymptoms = useRootStore((s) => s.todaySymptoms);
  const addTodaySymptom = useRootStore((s) => s.addTodaySymptom);
  const removeTodaySymptom = useRootStore((s) => s.removeTodaySymptom);
  const showToast = useRootStore((s) => s.showToast);

  // Fallback to 14 days ago if no data yet so the user sees a rich follicular calendar
  const effectiveLastPeriod = useMemo(() => {
    if (cycleData?.lastPeriodDate) return cycleData.lastPeriodDate;
    const d = new Date();
    d.setDate(d.getDate() - 10);
    return d.toISOString().split('T')[0];
  }, [cycleData]);

  const predictions = useMemo(
    () =>
      getCyclePredictions(
        effectiveLastPeriod,
        cycleData?.cycleLengthDays ?? 28,
        cycleData?.periodLengthDays ?? 5,
      ),
    [effectiveLastPeriod, cycleData],
  );

  const [editing, setEditing] = useState(false);
  const [daysAgo, setDaysAgo] = useState(10);
  const [cycleLength, setCycleLength] = useState(cycleData?.cycleLengthDays ?? 28);
  const [periodLength, setPeriodLength] = useState(cycleData?.periodLengthDays ?? 5);
  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>(todaySymptoms);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  const saveCycle = () => {
    const start = new Date();
    start.setDate(start.getDate() - daysAgo);
    const lastPeriodDate = start.toISOString().split('T')[0];
    const next = getCyclePredictions(lastPeriodDate, cycleLength, periodLength);
    updateCycleData({
      lastPeriodDate,
      cycleLengthDays: cycleLength,
      periodLengthDays: periodLength,
      ...(next
        ? {
            currentPhase: next.currentPhase.phase,
            estimatedNextPeriodDate: new Date(next.nextPeriodDate).toISOString().split('T')[0],
          }
        : {}),
    });
    setEditing(false);
    showToast({ type: 'success', message: 'Cycle details saved securely on device' });
  };

  const saveSymptoms = () => {
    todaySymptoms.filter((s) => !loggedSymptoms.includes(s)).forEach(removeTodaySymptom);
    loggedSymptoms.forEach(addTodaySymptom);
    showToast({ type: 'success', message: "Today's symptoms recorded" });
  };

  const symptomsList = [
    'Energetic',
    'Creative Flow',
    'Calm Mood',
    'Mild Cramps',
    'Bloating',
    'Tender Breasts',
    'Headache',
    'Deep Rest Needed',
    'Glowing Skin',
    'Restless Sleep',
  ];

  const toggleSymptom = (sym: string) => {
    setLoggedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym],
    );
  };

  // Build a 14-day calendar window (-3 to +10 days)
  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let offset = -2; offset <= 11; offset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      const dateKey = d.toISOString().split('T')[0];
      const phase = predictions?.cycleDayMap.get(dateKey) ?? 'follicular';
      days.push({
        offset,
        date: d,
        dateKey,
        dayNumber: d.getDate(),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        phase,
        cfg: PHASE_CONFIG[phase],
        isToday: offset === 0,
      });
    }
    return days;
  }, [predictions]);

  const activeDay = calendarDays.find((d) => d.offset === selectedDayOffset) ?? calendarDays[2];
  const activePhaseConfig = PHASE_CONFIG[activeDay.phase as CyclePhase] ?? PHASE_CONFIG.follicular;
  const energy = getPhaseEnergyProfile(activeDay.phase as CyclePhase);

  return (
    <ScreenWrapper scrollable>
      <Header title="Follicular & Cycle Rhythm" subtitle="Hormone & Phase Calendar" showBack />
      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Follicular Calendar Strip */}
        <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              Cycle Rhythm Strip
            </Text>
            <Badge label={activeDay.isToday ? 'Today' : activeDay.weekday} variant="primary" />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.sm }]}>
            Tap any day to preview hormonal phase, energy levels, and restorative suggestions.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarStrip}>
            {calendarDays.map((d) => {
              const isSelected = d.offset === selectedDayOffset;
              return (
                <Pressable
                  key={d.dateKey}
                  onPress={() => setSelectedDayOffset(d.offset)}
                  style={[
                    styles.dayPill,
                    {
                      backgroundColor: isSelected ? d.cfg.color : colors.surface1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${d.weekday} ${d.dayNumber}, ${d.cfg.label} phase`}
                >
                  <Text
                    style={[
                      typography.caption,
                      { color: isSelected ? '#FFFFFF' : colors.text.muted, fontSize: 11 },
                    ]}
                  >
                    {d.weekday}
                  </Text>
                  <Text
                    style={[
                      typography.bodyBold,
                      { color: isSelected ? '#FFFFFF' : colors.text.primary, marginVertical: 2 },
                    ]}
                  >
                    {d.dayNumber}
                  </Text>
                  <View
                    style={[
                      styles.phaseDot,
                      { backgroundColor: isSelected ? '#FFFFFF' : d.cfg.color },
                    ]}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>

        {/* Selected Phase Vitality Card */}
        <Card style={{ marginBottom: spacing.md, padding: spacing.lg, backgroundColor: colors.surface }}>
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.phaseIndicator, { backgroundColor: activePhaseConfig.color }]} />
              <Text style={[typography.heading, { color: colors.text.primary, marginLeft: 8 }]}>
                {activePhaseConfig.label} Phase
              </Text>
            </View>
            <Badge label={`Day ${predictions?.currentPhase.day ?? 12}`} variant="primary" />
          </View>

          <Text style={[typography.body, { color: colors.text.secondary, marginTop: 10, lineHeight: 22 }]}>
            {activePhaseConfig.description}
          </Text>

          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
            {activePhaseConfig.energyDesc}
          </Text>

          {/* Energy Profile Meters */}
          <View style={{ marginTop: spacing.md }}>
            <Text style={[typography.captionBold, { color: colors.text.primary, marginBottom: 8 }]}>
              Hormonal Vitality Profile
            </Text>
            <EnergyBar label="Physical Stamina" value={energy.physicalEnergy} color={activePhaseConfig.color} />
            <EnergyBar label="Cognitive Focus" value={energy.cognitiveSharpness} color={colors.primary} />
            <EnergyBar label="Social Battery" value={energy.socialBattery} color={colors.accent} />
            <EnergyBar label="Emotional Sensitivity" value={energy.emotionalSensitivity} color={colors.text.muted} />
          </View>

          {/* Tips for this phase */}
          <View style={{ marginTop: spacing.md }}>
            <Text style={[typography.captionBold, { color: colors.text.primary, marginBottom: 6 }]}>
              Nutritional & Movement Guidance
            </Text>
            {activePhaseConfig.tips.slice(0, 3).map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <Ionicons name="sparkles" size={14} color={activePhaseConfig.color} />
                <Text style={[typography.caption, { color: colors.text.secondary, marginLeft: 8, flex: 1 }]}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Edit or Set Up Cycle */}
        {(!cycleData || editing) ? (
          <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              {cycleData ? 'Adjust cycle cadence' : 'Personalize cycle dates'}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, marginBottom: 12 }]}>
              Private on this device. Statistical estimates, not contraception or diagnosis.
            </Text>
            <Stepper
              label="Last period start"
              value={daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
              onMinus={() => setDaysAgo((d) => Math.max(0, d - 1))}
              onPlus={() => setDaysAgo((d) => Math.min(90, d + 1))}
            />
            <Stepper
              label="Average cycle length"
              value={`${cycleLength} days`}
              onMinus={() => setCycleLength((d) => Math.max(18, d - 1))}
              onPlus={() => setCycleLength((d) => Math.min(45, d + 1))}
            />
            <Stepper
              label="Average bleed duration"
              value={`${periodLength} days`}
              onMinus={() => setPeriodLength((d) => Math.max(1, d - 1))}
              onPlus={() => setPeriodLength((d) => Math.min(10, d + 1))}
            />
            <Button label="Save cycle parameters" size="sm" onPress={saveCycle} style={{ marginTop: 12 }} />
          </Card>
        ) : (
          <Card style={{ marginBottom: spacing.md, padding: spacing.md }} onPress={() => setEditing(true)}>
            <View style={styles.rowBetween}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Cycle Parameters
              </Text>
              <Text style={[typography.caption, { color: colors.primary }]}>Edit</Text>
            </View>
            <View style={styles.metricRow}>
              <View>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Cycle Length</Text>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {cycleData.cycleLengthDays} Days
                </Text>
              </View>
              <View>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Bleed Length</Text>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {cycleData.periodLengthDays} Days
                </Text>
              </View>
              <View>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Next Period</Text>
                <Text style={[typography.bodyBold, { color: colors.primary }]}>
                  {predictions ? new Date(predictions.nextPeriodDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Estimated'}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Symptoms Tracker */}
        <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 8 }]}>
            Log Daily Sensations
          </Text>
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
          <Button label="Save logged sensations" size="sm" onPress={saveSymptoms} style={{ marginTop: 14 }} />
        </Card>

        {/* Harmony Bloom Somatic Games Link */}
        <Card
          style={{ marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.surface1 }}
          onPress={() => router.push('/(app)/games')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.gameIconBox, { backgroundColor: colors.surface }]}>
              <Ionicons name="game-controller-outline" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Restorative Mini-Games
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Harmonic breathing, sensory grounding, and soothing rhythms.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>
      </View>
    </ScreenWrapper>
  );
}

function EnergyBar({ label, value, color }: { label: string; value: number; color: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.energyRow}>
      <Text style={[typography.caption, { color: colors.text.secondary, width: 120 }]}>{label}</Text>
      <View style={[styles.energyTrack, { backgroundColor: colors.surface1 }]}>
        <View style={[styles.energyFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={[typography.captionBold, { color: colors.text.primary, width: 36, textAlign: 'right' }]}>
        {value}%
      </Text>
    </View>
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
      <Button label="−" variant="ghost" size="sm" onPress={onMinus} accessibilityLabel={`Decrease ${label}`} />
      <View style={{ width: 8 }} />
      <Button label="+" variant="ghost" size="sm" onPress={onPlus} accessibilityLabel={`Increase ${label}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  calendarStrip: {
    gap: 8,
    paddingVertical: 6,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  dayPill: {
    alignItems: 'center',
    borderRadius: 14,
    height: 64,
    justifyContent: 'center',
    width: 48,
  },
  energyFill: {
    borderRadius: 3,
    height: '100%',
  },
  energyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 4,
  },
  energyTrack: {
    borderRadius: 3,
    flex: 1,
    height: 6,
    overflow: 'hidden',
  },
  gameIconBox: {
    alignItems: 'center',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  phaseDot: {
    borderRadius: 2,
    height: 4,
    marginTop: 2,
    width: 4,
  },
  phaseIndicator: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepperRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 6,
  },
  tipRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
});
