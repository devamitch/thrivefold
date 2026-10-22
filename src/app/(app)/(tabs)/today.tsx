import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  { id: 'rest', label: 'Rest Day', icon: 'bed-outline' as const, desc: '5 min gentle stretch' },
  { id: 'light', label: 'Light', icon: 'leaf-outline' as const, desc: '15 min easy flow' },
  { id: 'regular', label: 'Regular', icon: 'walk-outline' as const, desc: '30 min full routine' },
] as const;

export default function TodayScreen() {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { onScroll, scrollEventThrottle } = useScrollAwareTabBar();

  const todayQuests = useRootStore((s) => s.todayQuests);
  const completeQuest = useRootStore((s) => s.completeQuest);
  const addCheckIn = useRootStore((s) => s.addCheckIn);

  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState(8);
  const [stress, setStress] = useState(4);
  const [intensity, setIntensity] = useState<'rest' | 'light' | 'regular'>('regular');
  const [checkedInToday, setCheckedInToday] = useState(false);

  const handleSaveCheckIn = () => {
    addCheckIn({
      date: new Date().toISOString().split('T')[0],
      energy,
      mood,
      stress,
      sleepHours: 7.5,
      symptoms: ['Normal energy'],
    });
    setCheckedInToday(true);
  };

  const completedCount = todayQuests.filter((q) => q.isCompleted).length;
  const totalCount = todayQuests.length;
  const progressPct = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarInset }]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* ── Page Header ── */}
        <LinearGradient
          colors={[colors.success + '14', colors.background]}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={{ paddingHorizontal: spacing.base }}>
            <Text style={[typography.label, { color: colors.success }]}>DAILY PLAN</Text>
            <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>
              Today's Journey
            </Text>

            {/* Quest Progress Bar */}
            <View style={[styles.progressContainer, { marginTop: spacing.md }]}>
              <View style={styles.progressLabelRow}>
                <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                  {completedCount} of {totalCount} quests done
                </Text>
                <Text style={[typography.captionBold, { color: colors.success }]}>
                  {Math.round(progressPct * 100)}%
                </Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.success + '20' }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.success,
                      width: `${progressPct * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.content, { paddingHorizontal: spacing.base }]}>
          {/* ── Daily Check-In Card ── */}
          {!checkedInToday ? (
            <Animated.View entering={FadeInDown.delay(60).springify()}>
              <Card style={[styles.cardBase, { padding: 20 }]}>
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Badge label="Check-in pending" variant="warning" />
                    <Text
                      style={[
                        typography.subheading,
                        { color: colors.text.primary, marginTop: 6 },
                      ]}
                    >
                      How are you today?
                    </Text>
                  </View>
                  <Ionicons name="partly-sunny-outline" size={28} color={colors.primary} />
                </View>

                {/* Energy */}
                <View style={styles.ratingSection}>
                  <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                    Energy   {ENERGY_LABELS[energy] ?? `${energy}/10`}
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
                            borderColor: energy === val ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            typography.captionBold,
                            {
                              color:
                                energy === val ? colors.onPrimary : colors.text.secondary,
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
                <View style={styles.ratingSection}>
                  <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                    Mood   {MOOD_LABELS[mood] ?? `${mood}/10`}
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
                            borderColor: mood === val ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            typography.captionBold,
                            {
                              color:
                                mood === val ? colors.onPrimary : colors.text.secondary,
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
                <View style={styles.ratingSection}>
                  <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 8 }]}>
                    Preferred intensity today
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
                              intensity === opt.id ? colors.primary + '14' : colors.surface1,
                            borderColor:
                              intensity === opt.id ? colors.primary : colors.border,
                            borderWidth: intensity === opt.id ? 2 : 1,
                          },
                        ]}
                      >
                        <Ionicons name={opt.icon} size={20} color={colors.primary} />
                        <Text
                          style={[
                            typography.captionBold,
                            {
                              color:
                                intensity === opt.id ? colors.primary : colors.text.primary,
                              marginTop: 4,
                            },
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                          {opt.desc}
                        </Text>
                      </PressableScale>
                    ))}
                  </View>
                </View>

                <Button
                  label="Save Check-in"
                  onPress={handleSaveCheckIn}
                  style={{ marginTop: spacing.md }}
                />
              </Card>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.springify()}>
              <Card style={[styles.cardBase, { padding: 16 }]}>
                <View style={styles.cardRow}>
                  <View style={[styles.successIcon, { backgroundColor: colors.success + '18' }]}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      Check-in saved
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>
                      Energy {energy}/10 · Mood {mood}/10 · {intensity} intensity
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          )}

          {/* ── Daily Micro-Quests ── */}
          <Text
            style={[
              typography.subheading,
              { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.sm },
            ]}
          >
            Today's Micro-Quests
          </Text>
          {todayQuests.map((quest, idx) => (
            <Animated.View
              key={quest.id}
              entering={FadeInDown.delay(100 + idx * 40).springify()}
            >
              <Card style={[styles.questCard, { marginBottom: 10 }]}>
                <View style={styles.cardRow}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={styles.questMeta}>
                      <Badge label={`${quest.durationMinutes} min`} variant="neutral" />
                      <Text
                        style={[
                          typography.captionBold,
                          { color: colors.primary, marginLeft: 8 },
                        ]}
                      >
                        +{quest.xpReward} XP
                      </Text>
                    </View>
                    <Text
                      style={[
                        typography.bodyBold,
                        {
                          color: quest.isCompleted ? colors.text.muted : colors.text.primary,
                          textDecorationLine: quest.isCompleted ? 'line-through' : 'none',
                          marginTop: 6,
                        },
                      ]}
                    >
                      {quest.title}
                    </Text>
                  </View>

                  <PressableScale
                    onPress={() => completeQuest(quest.id)}
                    disabled={quest.isCompleted}
                    scaleTo={0.88}
                    style={[
                      styles.checkCircle,
                      {
                        backgroundColor: quest.isCompleted ? colors.success : 'transparent',
                        borderColor: quest.isCompleted ? colors.success : colors.borderStrong,
                      },
                    ]}
                  >
                    {quest.isCompleted && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </PressableScale>
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: {
    paddingBottom: 20,
  },
  progressContainer: {},
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  content: { paddingTop: 16 },
  cardBase: { marginBottom: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  ratingSection: { marginTop: 16 },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingBtn: {
    width: 42,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
  },
  successIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questCard: { padding: 14 },
  questMeta: { flexDirection: 'row', alignItems: 'center' },
  checkCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
