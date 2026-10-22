import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { PressableScale } from '../../../components/ui/PressableScale';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore } from '../../../stores/useRootStore';
import {
  useScrollAwareTabBar,
  useTabBarInset,
} from '../../../components/navigation/CustomTabBar';
import {
  formatLocalDate,
  parseLocalDate,
  generateDayAgenda,
  CalendarEvent,
  toggleEventStatus,
} from '../../../domain/calendar/universalCalendarEngine';
import * as Haptics from 'expo-haptics';

const ENERGY_LABELS: Record<number, string> = {
  1: 'Drained',
  3: 'Low',
  5: 'Okay',
  7: 'Good',
  9: 'Great',
  10: 'Peak',
};

const MOOD_LABELS: Record<number, string> = {
  1: 'Very low',
  3: 'Down',
  5: 'Neutral',
  7: 'Positive',
  9: 'Happy',
  10: 'Joyful',
};

const INTENSITY_OPTIONS = [
  { id: 'rest', label: 'Rest Day', icon: 'bed-outline' as const, desc: '5 min restorative stretch' },
  { id: 'light', label: 'Light', icon: 'leaf-outline' as const, desc: '15 min easy routine' },
  { id: 'regular', label: 'Full', icon: 'walk-outline' as const, desc: '30 min active baseline' },
] as const;

export default function TodayScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { onScroll, scrollEventThrottle } = useScrollAwareTabBar();

  const addCheckIn = useRootStore((s) => s.addCheckIn);
  const cycleData = useRootStore((s) => s.cycleData);
  const onboarding = useRootStore((s) => s.onboarding);

  const [selectedDateStr, setSelectedDateStr] = useState(() => formatLocalDate(new Date()));
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState(8);
  const [intensity, setIntensity] = useState<'rest' | 'light' | 'regular'>('regular');
  const [checkedInToday, setCheckedInToday] = useState(false);

  // Generate 7-day horizontal strip around current week
  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = formatLocalDate(d);
      const dayName = d.toLocaleDateString(undefined, { weekday: 'narrow' });
      return {
        dateStr,
        dayNumber: d.getDate(),
        dayName,
        isToday: dateStr === formatLocalDate(new Date()),
      };
    });
  }, []);

  // Generated agenda items from Universal Calendar Engine
  const defaultAgenda = useMemo(() => {
    return generateDayAgenda(selectedDateStr, {
      experience,
      cycleData,
    });
  }, [selectedDateStr, experience, cycleData]);

  const [agendaEvents, setAgendaEvents] = useState<CalendarEvent[]>(defaultAgenda);

  // Keep agenda in sync when date or experience changes
  React.useEffect(() => {
    setAgendaEvents(
      generateDayAgenda(selectedDateStr, {
        experience,
        cycleData,
      })
    );
  }, [selectedDateStr, experience, cycleData]);

  const handleToggleEvent = (event: CalendarEvent) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setAgendaEvents((prev) =>
      prev.map((e) => (e.id === event.id ? toggleEventStatus(e) : e))
    );
  };

  const handleSaveCheckIn = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    addCheckIn({
      date: selectedDateStr,
      energy,
      mood,
      stress: 4,
      sleepHours: 7.5,
      symptoms: ['Normal energy baseline'],
    });
    setCheckedInToday(true);
  };

  const isMen = experience === 'men_health';
  const isPride = experience === 'pride_wellbeing';

  const completedEvents = agendaEvents.filter((e) => e.status === 'completed').length;
  const totalEvents = agendaEvents.length;
  const progressPct = totalEvents > 0 ? completedEvents / totalEvents : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: tabBarInset + spacing.xxl,
            paddingHorizontal: spacing.base,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Page Title & Eyebrow (Neev Apple Sanctuary Style) */}
        <View style={styles.header}>
          <Text style={[typography.label, { color: colors.primary }]}>
            {isMen ? 'DAILY DISCIPLINE & AGENDA' : isPride ? 'AFFIRMING DAILY PLAN' : 'DAILY RHYTHM & AGENDA'}
          </Text>
          <Text style={[typography.display, { color: colors.text.primary, marginTop: 4 }]}>
            {selectedDateStr === formatLocalDate(new Date()) ? "Today's Agenda" : selectedDateStr}
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 2 }]}>
            {isMen
              ? 'Physical training, postural decompression, recovery schedule.'
              : isPride
              ? 'Self-care routines, hormone schedule, private reflections.'
              : 'Cycle-aligned daily rhythm, restorative habits, tasks.'}
          </Text>
        </View>

        {/* 7-Day Horizontal Date Strip (Flat squircle pills, zero borders, zero shadows) */}
        <View style={[styles.dateStrip, { marginTop: spacing.md }]}>
          {weekDays.map((item) => {
            const isSelected = item.dateStr === selectedDateStr;
            return (
              <PressableScale
                key={item.dateStr}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setSelectedDateStr(item.dateStr);
                }}
                scaleTo={0.92}
                style={[
                  styles.dayPill,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : item.isToday
                      ? colors.surface1
                      : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    {
                      color: isSelected ? colors.onPrimary : colors.text.secondary,
                    },
                  ]}
                >
                  {item.dayName}
                </Text>
                <Text
                  style={[
                    typography.subheading,
                    {
                      color: isSelected ? colors.onPrimary : colors.text.primary,
                      marginTop: 2,
                    },
                  ]}
                >
                  {item.dayNumber}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        {/* Agenda Progress Pill */}
        <Animated.View entering={FadeInDown.delay(40).duration(260)}>
          <Card style={[styles.progressCard, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
            <View style={styles.progressRow}>
              <View>
                <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                  {completedEvents} of {totalEvents} activities completed
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  {progressPct === 1 ? 'All routines finished for today' : 'Progressing through daily schedule'}
                </Text>
              </View>
              <Badge
                label={`${Math.round(progressPct * 100)}%`}
                variant={progressPct === 1 ? 'success' : 'primary'}
              />
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.surface1, marginTop: 10 }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${progressPct * 100}%`,
                  },
                ]}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Daily Health Check-in (Zero shadows, flat squircle) */}
        {!checkedInToday ? (
          <Animated.View entering={FadeInDown.delay(70).duration(280)}>
            <Card style={[styles.checkInCard, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    {isMen ? 'Physical & Mental Readiness' : 'Daily Wellbeing Check-in'}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    Calibrates routine intensity and recovery recommendations
                  </Text>
                </View>
                <Badge label="Pending" variant="warning" />
              </View>

              {/* Energy */}
              <View style={{ marginTop: 16 }}>
                <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                  Energy: {ENERGY_LABELS[energy] ?? `${energy}/10`}
                </Text>
                <View style={styles.ratingRow}>
                  {[1, 3, 5, 7, 9, 10].map((val) => (
                    <PressableScale
                      key={val}
                      onPress={() => setEnergy(val)}
                      scaleTo={0.92}
                      style={[
                        styles.ratingBtn,
                        {
                          backgroundColor:
                            energy === val ? colors.primary : colors.surface1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          typography.captionBold,
                          {
                            color: energy === val ? colors.onPrimary : colors.text.secondary,
                          },
                        ]}
                      >
                        {val}
                      </Text>
                    </PressableScale>
                  ))}
                </View>
              </View>

              {/* Mood */}
              <View style={{ marginTop: 14 }}>
                <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                  Mood: {MOOD_LABELS[mood] ?? `${mood}/10`}
                </Text>
                <View style={styles.ratingRow}>
                  {[1, 3, 5, 7, 9, 10].map((val) => (
                    <PressableScale
                      key={val}
                      onPress={() => setMood(val)}
                      scaleTo={0.92}
                      style={[
                        styles.ratingBtn,
                        {
                          backgroundColor:
                            mood === val ? colors.accent : colors.surface1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          typography.captionBold,
                          {
                            color: mood === val ? colors.onPrimary : colors.text.secondary,
                          },
                        ]}
                      >
                        {val}
                      </Text>
                    </PressableScale>
                  ))}
                </View>
              </View>

              {/* Intensity */}
              <View style={{ marginTop: 14 }}>
                <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>
                  Target Session Load
                </Text>
                <View style={styles.intensityRow}>
                  {INTENSITY_OPTIONS.map((opt) => (
                    <PressableScale
                      key={opt.id}
                      onPress={() => setIntensity(opt.id)}
                      scaleTo={0.95}
                      style={[
                        styles.intensityBtn,
                        {
                          backgroundColor:
                            intensity === opt.id ? colors.primaryAlpha : colors.surface1,
                        },
                      ]}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={18}
                        color={intensity === opt.id ? colors.primary : colors.text.secondary}
                      />
                      <Text
                        style={[
                          typography.captionBold,
                          {
                            color: intensity === opt.id ? colors.primary : colors.text.primary,
                            marginTop: 4,
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </PressableScale>
                  ))}
                </View>
              </View>

              <Button
                label="Log Readiness Check-in"
                onPress={handleSaveCheckIn}
                style={{ marginTop: 16 }}
              />
            </Card>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(240)}>
            <Card style={[styles.checkInCard, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
              <View style={styles.rowBetween}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      Daily check-in logged
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>
                      Energy {energy}/10 · Mood {mood}/10 · {intensity} intensity
                    </Text>
                  </View>
                </View>
                <Badge label="Saved" variant="success" />
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Personalized Nourishment Protocol (Reflecting onboarding diet choice) */}
        <Animated.View entering={FadeInDown.delay(85).duration(260)}>
          <Card style={[styles.checkInCard, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[typography.captionBold, { color: colors.text.muted }]}>
                    NOURISHMENT & HYDRATION
                  </Text>
                  {onboarding.diet && onboarding.diet !== 'No preference' ? (
                    <Badge label={onboarding.diet} variant="primary" style={{ marginLeft: 8 }} />
                  ) : null}
                </View>
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 4 }]}>
                  {onboarding.diet && onboarding.diet !== 'No preference'
                    ? `${onboarding.diet} Fueling Protocol`
                    : 'Balanced Whole Foods Protocol'}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Personalized cellular hydration and meal timings based on your profile
                </Text>
              </View>
              <Button
                label="View Plan"
                size="sm"
                variant="outline"
                onPress={() => router.push('/(app)/health/nutrition')}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Universal Calendar Agenda Items */}
        <Text
          style={[
            typography.subheading,
            { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
          ]}
        >
          Scheduled Activities ({agendaEvents.length})
        </Text>

        {agendaEvents.map((event, idx) => {
          const isDone = event.status === 'completed';
          return (
            <Animated.View
              key={event.id}
              entering={FadeInDown.delay(100 + idx * 30).duration(240)}
            >
              <Card
                style={[
                  styles.eventCard,
                  {
                    backgroundColor: colors.surface,
                    marginBottom: 8,
                    opacity: isDone ? 0.6 : 1,
                  },
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={styles.eventMeta}>
                      {event.startTime ? (
                        <Text style={[typography.label, { color: colors.primary, marginRight: 8 }]}>
                          {event.startTime}
                        </Text>
                      ) : null}
                      <Badge
                        label={event.category.toUpperCase()}
                        variant={event.category === 'fitness' ? 'primary' : 'neutral'}
                      />
                    </View>
                    <Text
                      style={[
                        typography.bodyBold,
                        {
                          color: colors.text.primary,
                          textDecorationLine: isDone ? 'line-through' : 'none',
                          marginTop: 4,
                        },
                      ]}
                    >
                      {event.title}
                    </Text>
                    {event.description ? (
                      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                        {event.description}
                      </Text>
                    ) : null}
                  </View>

                  <PressableScale
                    onPress={() => handleToggleEvent(event)}
                    scaleTo={0.88}
                    style={[
                      styles.checkCircle,
                      {
                        backgroundColor: isDone ? colors.success : colors.surface1,
                      },
                    ]}
                  >
                    {isDone ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : (
                      <Ionicons name="ellipse-outline" size={18} color={colors.text.muted} />
                    )}
                  </PressableScale>
                </View>
              </Card>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: { marginBottom: 4 },
  dateStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPill: {
    width: '13.2%',
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderWidth: 0,
  },
  progressCard: {
    borderRadius: 18,
    padding: 16,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderWidth: 0,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  checkInCard: {
    borderRadius: 18,
    padding: 18,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderWidth: 0,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingBtn: {
    width: 44,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderWidth: 0,
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderWidth: 0,
  },
  eventCard: {
    borderRadius: 16,
    padding: 14,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderWidth: 0,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
