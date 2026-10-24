import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { PeriodLoggerModal } from '../../../components/ui/PeriodLoggerModal';
import {
  CyclePhase,
  getCyclePredictions,
  getPhaseEnergyProfile,
  PHASE_CONFIG,
  computeAdvancedCycleMetrics,
  calculatePregnancyProgress,
} from '../../../domain/health/cycleCalculations';
import { useRootStore } from '../../../stores/useRootStore';
import type { PeriodLogRecord, ReproductiveContext } from '../../../stores/slices/healthSlice';
import { useTheme } from '../../../theme/useTheme';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';

const CONTEXT_OPTIONS: { id: ReproductiveContext; label: string; icon: string; desc: string }[] = [
  { id: 'regular', label: 'Regular (21–35d)', icon: 'checkmark-circle-outline', desc: 'Consistent cycle duration' },
  { id: 'irregular', label: 'Irregular Cycles', icon: 'shuffle-outline', desc: 'Variability > 7 days between periods' },
  { id: 'pcos_pcod', label: 'PCOS / PCOD', icon: 'medical-outline', desc: 'Widened forecast; non-assumed ovulation' },
  { id: 'contraception', label: 'Hormonal Birth Control', icon: 'shield-checkmark-outline', desc: 'Withdrawal bleeds; suppressed ovulation' },
  { id: 'pregnant', label: 'Pregnant', icon: 'heart-outline', desc: 'Gestational tracking & due date calculator' },
  { id: 'postpartum', label: 'Postpartum Recovery', icon: 'flower-outline', desc: 'Physical healing; cycles may be absent' },
  { id: 'breastfeeding', label: 'Nursing / Breastfeeding', icon: 'water-outline', desc: 'Lactational amenorrhea support' },
  { id: 'perimenopause', label: 'Perimenopause', icon: 'thermometer-outline', desc: 'Vasomotor tracking & hormonal shifts' },
  { id: 'menopause', label: 'Menopause', icon: 'sunny-outline', desc: 'Sustained transition & bone vitality' },
  { id: 'paused', label: 'Paused', icon: 'pause-circle-outline', desc: 'Reproductive predictions temporarily muted' },
];

export default function CycleScreen() {
  const { colors, typography, spacing } = useTheme();
  const cycleData = useRootStore((s) => s.cycleData);
  const updateCycleData = useRootStore((s) => s.updateCycleData);
  const setReproductiveContext = useRootStore((s) => s.setReproductiveContext);
  const todaySymptoms = useRootStore((s) => s.todaySymptoms);
  const addTodaySymptom = useRootStore((s) => s.addTodaySymptom);
  const removeTodaySymptom = useRootStore((s) => s.removeTodaySymptom);
  const showToast = useRootStore((s) => s.showToast);

  const [periodLoggerOpen, setPeriodLoggerOpen] = useState(false);
  const [selectedRecordToEdit, setSelectedRecordToEdit] = useState<PeriodLogRecord | null>(null);

  const currentContext: ReproductiveContext = cycleData?.reproductiveContext ?? 'regular';

  // Only a period the person actually logged. No date is ever assumed: without one there are
  // no phase or next-period estimates, just a prompt to log.
  const effectiveLastPeriod = useMemo<string | null>(() => {
    if (cycleData?.lastPeriodDate) return cycleData.lastPeriodDate;
    if (cycleData?.periodHistory && cycleData.periodHistory.length > 0) {
      return cycleData.periodHistory[0].startDate;
    }
    return null;
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

  const advancedMetrics = useMemo(
    () =>
      computeAdvancedCycleMetrics(
        effectiveLastPeriod,
        cycleData?.periodHistory ?? [],
        cycleData?.cycleLengthDays ?? 28,
        cycleData?.periodLengthDays ?? 5,
        currentContext
      ),
    [effectiveLastPeriod, cycleData, currentContext]
  );

  const pregnancyProgress = useMemo(() => {
    if (currentContext !== 'pregnant') return null;
    const reference = cycleData?.pregnancyDetails?.conceptionDate ?? effectiveLastPeriod;
    if (!reference) return null;
    return calculatePregnancyProgress(reference, cycleData?.pregnancyDetails?.estimatedDueDate);
  }, [currentContext, cycleData, effectiveLastPeriod]);

  const [editingParams, setEditingParams] = useState(false);
  const [cycleLength, setCycleLength] = useState(cycleData?.cycleLengthDays ?? 28);
  const [periodLength, setPeriodLength] = useState(cycleData?.periodLengthDays ?? 5);
  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>(todaySymptoms);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  const saveCycleParams = () => {
    if (!effectiveLastPeriod) return;
    const next = getCyclePredictions(effectiveLastPeriod, cycleLength, periodLength);
    updateCycleData({
      lastPeriodDate: effectiveLastPeriod,
      cycleLengthDays: cycleLength,
      periodLengthDays: periodLength,
      ...(next
        ? {
            currentPhase: next.currentPhase.phase,
            estimatedNextPeriodDate: formatLocalDate(next.nextPeriodDate),
          }
        : {}),
    });
    setEditingParams(false);
    showToast({ type: 'success', message: 'Cycle parameters saved securely on device' });
  };

  const saveSymptoms = () => {
    todaySymptoms.filter((s) => !loggedSymptoms.includes(s)).forEach(removeTodaySymptom);
    loggedSymptoms.forEach(addTodaySymptom);
    showToast({ type: 'success', message: "Today's sensations recorded" });
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
    'Back Tension',
    'Cravings',
  ];

  const toggleSymptom = (sym: string) => {
    setLoggedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym],
    );
  };

  // Build a 14-day calendar window (-2 to +11 days)
  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let offset = -2; offset <= 11; offset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      const dateKey = formatLocalDate(d);
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
      <Header
        title="Cycle"
        subtitle="Clinical & Hormonal Intelligence"
        showBack
      />

      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* HERO BANNER CARD */}
        <Card style={{ marginBottom: spacing.md, padding: 14, backgroundColor: colors.surface }}>
          <View style={styles.heroWrap}>
            <Image
              source={require('../../../../assets/illustrations/intro-cycle.jpg')}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 12 }]}>
            Your cycle
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, lineHeight: 18 }]}>
            Observe natural fluctuations, follicular energy peaks, and fertile phases with clinical uncertainty bounds.
          </Text>
        </Card>

        {/* ACTION BAR: Log Bleeding / Period */}
        <Card style={{ marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.surface }}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Real Period Logging
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Record start/end dates, flow volume, cramps, and symptoms without synthetic fabrication.
              </Text>
            </View>
            <Button
              label="Log Bleeding"
              size="sm"
              onPress={() => {
                setSelectedRecordToEdit(null);
                setPeriodLoggerOpen(true);
              }}
              style={{ alignSelf: 'center' }}
            />
          </View>
        </Card>

        {/* PREGNANCY PROGRESS (OPT-IN CONTEXT) */}
        {currentContext === 'pregnant' && pregnancyProgress && (
          <Card style={{ marginBottom: spacing.md, padding: spacing.lg, backgroundColor: colors.surface1, borderColor: colors.accent }}>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="heart" size={20} color={colors.accent} />
                <Text style={[typography.heading, { color: colors.text.primary, marginLeft: 8 }]}>
                  Week {pregnancyProgress.gestationalWeeks} + {pregnancyProgress.gestationalDays} Days
                </Text>
              </View>
              <Badge label={`Trimester ${pregnancyProgress.trimester}`} variant="primary" />
            </View>
            <Text style={[typography.bodyBold, { color: colors.accentText, marginTop: 10 }]}>
              Estimated Due Date: {pregnancyProgress.estimatedDueDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
              {pregnancyProgress.daysUntilDelivery} days remaining until delivery window.
            </Text>
            <View style={{ marginTop: 12, backgroundColor: colors.surface, padding: 12, borderRadius: 12 }}>
              <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                Fetal Development Milestone
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, lineHeight: 18 }]}>
                {pregnancyProgress.developmentMilestone}
              </Text>
            </View>
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: 10, fontStyle: 'italic' }]}>
              {pregnancyProgress.clinicalGuidance}
            </Text>
          </Card>
        )}

        {/* PCOS / IRREGULAR CLINICAL GUIDANCE */}
        {(currentContext === 'pcos_pcod' || currentContext === 'irregular') && (
          <Card style={{ marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.surface1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
                {currentContext === 'pcos_pcod' ? 'PCOS / PCOD Context Active' : 'Irregular Cycle Window Active'}
              </Text>
            </View>
            <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
              Standard ovulation calculations are widened or suppressed because follicular phases vary significantly. Thrivefold statistical estimates cannot diagnose endocrinological conditions or be used as contraception.
            </Text>
          </Card>
        )}

        {/* REPRODUCTIVE CONTEXT SELECTOR (PRIVATE) */}
        <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              Reproductive Health Context
            </Text>
            <Badge label={currentContext.replace('_', ' ').toUpperCase()} variant="neutral" />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.sm }]}>
            Stored privately on this device. Adapts predictions without guessing sensitive facts.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {CONTEXT_OPTIONS.map((opt) => {
              const isSelected = currentContext === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    setReproductiveContext(opt.id);
                    showToast({ type: 'info', message: `Reproductive context updated to ${opt.label}` });
                  }}
                  style={[
                    styles.contextPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface1,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Set context to ${opt.label}`}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={16}
                    color={isSelected ? colors.onPrimary : colors.text.secondary}
                    style={{ marginBottom: 4 }}
                  />
                  <Text
                    style={[
                      typography.captionBold,
                      { color: isSelected ? colors.onPrimary : colors.text.primary, fontSize: 11 },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>

        {/* ADVANCED CYCLE METRICS (WHEN NOT PREGNANT) */}
        {currentContext !== 'pregnant' && (
          <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
            <View style={styles.rowBetween}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Deterministic Cycle Statistics
              </Text>
              <Badge
                label={`${advancedMetrics.confidenceScore.toUpperCase()} CONFIDENCE`}
                variant={advancedMetrics.confidenceScore === 'high' ? 'primary' : 'neutral'}
              />
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Average Cycle</Text>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {advancedMetrics.averageCycleLength} Days
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Bleed Duration</Text>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {advancedMetrics.averagePeriodDuration} Days
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Variability</Text>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  ±{advancedMetrics.cycleLengthVariabilityDays} Days
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Logged Cycles</Text>
                <Text style={[typography.bodyBold, { color: colors.primary }]}>
                  {advancedMetrics.recordedCyclesCount} Recorded
                </Text>
              </View>
            </View>

            {advancedMetrics.isLate && (
              <View style={{ marginTop: 12, backgroundColor: colors.warningSurface, padding: 10, borderRadius: 10 }}>
                <Text style={[typography.captionBold, { color: colors.warning }]}>
                  {advancedMetrics.isConfirmedMissed
                    ? `Confirmed Missed Period (${advancedMetrics.daysLate}d late)`
                    : `Period Late by ${advancedMetrics.daysLate} Days`}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  {advancedMetrics.explanationText}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* CONFIRMED PERIOD HISTORY LIST */}
        <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              Confirmed Bleed Records
            </Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              {cycleData?.periodHistory?.length ?? 0} saved
            </Text>
          </View>

          {(!cycleData?.periodHistory || cycleData.periodHistory.length === 0) ? (
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 8 }]}>
              No confirmed periods logged yet. Tap "Log Bleeding" above to record your first real period dates.
            </Text>
          ) : (
            cycleData.periodHistory.map((rec) => (
              <Pressable
                key={rec.id}
                onPress={() => {
                  setSelectedRecordToEdit(rec);
                  setPeriodLoggerOpen(true);
                }}
                style={[
                  styles.historyRow,
                  { backgroundColor: colors.surface1, marginTop: 8, borderColor: colors.border },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="water" size={14} color={colors.accent} style={{ marginRight: 6 }} />
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      {new Date(rec.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      {rec.endDate ? ` → ${new Date(rec.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ' (Ongoing)'}
                    </Text>
                  </View>
                  <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                    Flow: {rec.flowIntensity.toUpperCase()} {rec.painLevel !== undefined ? `• Cramps: ${rec.painLevel}/10` : ''}
                    {rec.symptoms && rec.symptoms.length > 0 ? ` • ${rec.symptoms.join(', ')}` : ''}
                  </Text>
                </View>
                <Text style={[typography.captionBold, { color: colors.primary }]}>Edit</Text>
              </Pressable>
            ))
          )}
        </Card>

        {currentContext !== 'pregnant' && !predictions && (
          <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>No estimates yet</Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6 }]}>
              Log the first day of your last period and Thrivefold will estimate your phases and next period from
              it. Nothing is assumed before then.
            </Text>
            <Button
              label="Log a period"
              size="sm"
              onPress={() => {
                setSelectedRecordToEdit(null);
                setPeriodLoggerOpen(true);
              }}
              style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
            />
          </Card>
        )}

        {/* FOLLICULAR & CYCLE RHYTHM STRIP */}
        {currentContext !== 'pregnant' && predictions && (
          <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
            <View style={styles.rowBetween}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Cycle Rhythm Strip
              </Text>
              <Badge label={activeDay.isToday ? 'Today' : activeDay.weekday} variant="primary" />
            </View>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2, marginBottom: spacing.sm }]}>
              Menstruation overlaps the early follicular phase. Tap any day to inspect hormonal phase guidance.
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
                        { color: isSelected ? colors.onPrimary : colors.text.muted, fontSize: 11 },
                      ]}
                    >
                      {d.weekday}
                    </Text>
                    <Text
                      style={[
                        typography.bodyBold,
                        { color: isSelected ? colors.onPrimary : colors.text.primary, marginVertical: 2 },
                      ]}
                    >
                      {d.dayNumber}
                    </Text>
                    <View
                      style={[
                        styles.phaseDot,
                        { backgroundColor: isSelected ? colors.onPrimary : d.cfg.color },
                      ]}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          </Card>
        )}

        {/* Selected Phase Vitality Card */}
        {currentContext !== 'pregnant' && predictions && (
          <Card style={{ marginBottom: spacing.md, padding: spacing.lg, backgroundColor: colors.surface }}>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.phaseIndicator, { backgroundColor: activePhaseConfig.color }]} />
                <Text style={[typography.heading, { color: colors.text.primary, marginLeft: 8 }]}>
                  {activePhaseConfig.label} Phase
                </Text>
              </View>
              <Badge label={`Day ${predictions.currentPhase.day}`} variant="primary" />
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
                  <Ionicons name="leaf-outline" size={14} color={activePhaseConfig.color} />
                  <Text style={[typography.caption, { color: colors.text.secondary, marginLeft: 8, flex: 1 }]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Edit or Set Up Cycle Baseline Parameters */}
        {!effectiveLastPeriod ? null : editingParams ? (
          <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              Adjust Baseline Cycle Cadence
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, marginBottom: 12 }]}>
              Statistical baseline parameters for standard calculations.
            </Text>
            <Stepper
              label="Average cycle length"
              value={`${cycleLength} days`}
              onMinus={() => setCycleLength((d) => Math.max(18, d - 1))}
              onPlus={() => setCycleLength((d) => Math.min(60, d + 1))}
            />
            <Stepper
              label="Average bleed duration"
              value={`${periodLength} days`}
              onMinus={() => setPeriodLength((d) => Math.max(1, d - 1))}
              onPlus={() => setPeriodLength((d) => Math.min(12, d + 1))}
            />
            <Button label="Save Parameters" size="sm" onPress={saveCycleParams} style={{ marginTop: 12 }} />
          </Card>
        ) : (
          <Card style={{ marginBottom: spacing.md, padding: spacing.md }} onPress={() => setEditingParams(true)}>
            <View style={styles.rowBetween}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Baseline Parameters
              </Text>
              <Text style={[typography.caption, { color: colors.primary }]}>Edit</Text>
            </View>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Cycle Length</Text>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {cycleData?.cycleLengthDays ?? 28} Days
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>Bleed Length</Text>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {cycleData?.periodLengthDays ?? 5} Days
                </Text>
              </View>
              <View style={styles.metricItem}>
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
          <Button label="Save Sensations" size="sm" onPress={saveSymptoms} style={{ marginTop: 14 }} />
        </Card>
      </View>

      {/* Period Logger Modal */}
      <PeriodLoggerModal
        visible={periodLoggerOpen}
        initialDateStr={selectedRecordToEdit?.startDate ?? effectiveLastPeriod ?? formatLocalDate(new Date())}
        onClose={() => {
          setPeriodLoggerOpen(false);
          setSelectedRecordToEdit(null);
        }}
        existingRecord={selectedRecordToEdit}
      />
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
  contextPill: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  historyRow: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  metricItem: {
    flex: 1,
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
  heroWrap: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3EFEA',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
});
