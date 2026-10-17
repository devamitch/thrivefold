import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import { useQuestStore } from '../../../stores/useQuestStore';
import { spacing } from '../../../theme/spacing';

export default function QuestsScreen() {
  const { colors, typography } = useTheme();
  const { xp, level, coins, streak, todayQuests, completeQuest, refreshDailyQuests } = useQuestStore();

  const completedCount = todayQuests.filter((q) => q.isCompleted).length;

  return (
    <ScreenWrapper scrollable>
      <Header title="Daily Quests" subtitle="Complete tasks to earn XP" showBack />
      <ScrollView style={[styles.content, { paddingHorizontal: 16, paddingBottom: 32 }]}>
        {/* Progress Header */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Level</Text>
              <Text style={[typography.display, { color: colors.primary }]}>{level}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>XP</Text>
              <Text style={[typography.heading, { color: colors.primary }]}>{xp}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Coins</Text>
              <Text style={[typography.heading, { color: colors.accent }]}>{coins}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Streak</Text>
              <Text style={[typography.heading, { color: colors.success }]}>{streak}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedCount / todayQuests.length) * 100}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
            {completedCount}/{todayQuests.length} quests completed
          </Text>
        </Card>

        {/* Quest List */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
          Today's Quests
        </Text>
        {todayQuests.map((quest) => (
          <Card
            key={quest.id}
            style={[
              styles.questCard,
              quest.isCompleted && { opacity: 0.6, backgroundColor: colors.surface2 },
            ]}
            padding={24}
          >
            <View style={styles.questHeader}>
              <View style={styles.questHeaderLeft}>
                <Text style={[typography.label, { color: colors.primary, marginBottom: 4 }]}>
                  {quest.category.toUpperCase()}
                </Text>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{quest.title}</Text>
                <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
                  {quest.description}
                </Text>
              </View>
              <View style={styles.questHeaderRight}>
                <Text style={[typography.caption, { color: colors.text.muted }]}>{quest.durationMinutes}m</Text>
                <Text style={[typography.caption, { color: colors.primary }]}>+{quest.xpReward} XP</Text>
              </View>
            </View>
            <View style={styles.questFooter}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                Difficulty: {quest.difficulty}
              </Text>
              {!quest.isCompleted ? (
                <Button
                  label="Complete"
                  size="sm"
                  onPress={() => completeQuest(quest.id)}
                />
              ) : (
                <Button label="Done" size="sm" variant="outline" disabled />
              )}
            </View>
          </Card>
        ))}

        {/* Refresh Button */}
        <Button
          label="Refresh Daily Quests"
          variant="outline"
          onPress={refreshDailyQuests}
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  questCard: {
    marginBottom: 16,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  questHeaderLeft: {
    flex: 1,
  },
  questHeaderRight: {
    alignItems: 'flex-end',
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
