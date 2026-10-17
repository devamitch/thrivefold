import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import { useHealthStore } from '../../../stores/useHealthStore';

export default function TodayScreen() {
  const { colors, typography, spacing } = useTheme();
  const todayQuests = useHealthStore((s) => s.todayQuests);
  const completeQuest = useHealthStore((s) => s.completeQuest);
  const addCheckIn = useHealthStore((s) => s.addCheckIn);

  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState(8);
  const [stress, setStress] = useState(4);
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

  return (
    <ScreenWrapper scrollable>
      <Header title="Today's Plan" subtitle="Adaptive Quests & Daily Check-in" />
      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Daily Check-in Widget */}
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={styles.rowBetween}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              Daily Check-in
            </Text>
            {checkedInToday ? (
              <Badge label="Logged Today" variant="success" />
            ) : (
              <Badge label="Pending" variant="warning" />
            )}
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, marginBottom: spacing.md }]}>
            How is your energy and mood feeling today?
          </Text>

          {/* Energy Rating */}
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: 6 }]}>
            Energy Level: {energy} / 10
          </Text>
          <View style={styles.sliderRow}>
            {[1, 3, 5, 7, 9, 10].map((val) => (
              <Pressable
                key={val}
                onPress={() => setEnergy(val)}
                style={[
                  styles.pillBtn,
                  {
                    backgroundColor: energy === val ? colors.primary : colors.surface1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: energy === val ? colors.onPrimary : colors.text.primary },
                  ]}
                >
                  {val}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Mood Rating */}
          <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: spacing.md, marginBottom: 6 }]}>
            Mood: {mood} / 10
          </Text>
          <View style={styles.sliderRow}>
            {[1, 3, 5, 7, 9, 10].map((val) => (
              <Pressable
                key={val}
                onPress={() => setMood(val)}
                style={[
                  styles.pillBtn,
                  {
                    backgroundColor: mood === val ? colors.primary : colors.surface1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: mood === val ? colors.onPrimary : colors.text.primary },
                  ]}
                >
                  {val}
                </Text>
              </Pressable>
            ))}
          </View>

          {!checkedInToday && (
            <Button
              label="Save Check-in"
              size="sm"
              onPress={handleSaveCheckIn}
              style={{ marginTop: spacing.base }}
            />
          )}
        </Card>

        {/* Quests List */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          Daily Micro-Quests
        </Text>
        {todayQuests.map((quest) => (
          <Card key={quest.id} style={{ marginBottom: spacing.sm }}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <View style={styles.questMeta}>
                  <Badge label={`${quest.durationMinutes} min`} variant="neutral" />
                  <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 8 }]}>
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

              <Pressable
                onPress={() => completeQuest(quest.id)}
                disabled={quest.isCompleted}
                style={[
                  styles.checkCircle,
                  {
                    backgroundColor: quest.isCompleted ? colors.success : colors.surface1,
                    borderColor: quest.isCompleted ? colors.success : colors.borderStrong,
                  },
                ]}
              >
                {quest.isCompleted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </Pressable>
            </View>
          </Card>
        ))}
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
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pillBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  questMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
