import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { getLevelDefinition, getSpecialQuestsForExperience } from '../../../domain/game/gameCatalogService';

export default function QuestsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const {
    xp,
    level,
    coins,
    streak,
    todayQuests,
    dailyPoints,
    dailyPointsTarget,
    dailyGoalReached,
    skipDailyTask,
    joinSpecialQuest,
    refreshDailyQuests,
  } = useRootStore(
    useShallow((s) => ({
      xp: s.xp,
      level: s.level,
      coins: s.coins,
      streak: s.streak,
      todayQuests: s.todayQuests,
      dailyPoints: s.dailyPoints,
      dailyPointsTarget: s.dailyPointsTarget,
      dailyGoalReached: s.dailyGoalReached,
      skipDailyTask: s.skipDailyTask,
      joinSpecialQuest: s.joinSpecialQuest,
      refreshDailyQuests: s.refreshDailyQuests,
    })),
  );

  const [selectedSkippedId, setSelectedSkippedId] = useState<string | null>(null);
  const levelDef = getLevelDefinition(level);
  const specialQuests = getSpecialQuestsForExperience(experience);

  const handleSkip = (assignmentId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    skipDailyTask(assignmentId, 'Replaced with Special Quest');
    setSelectedSkippedId(assignmentId);
  };

  const handleJoinSpecialQuest = (specialQuestId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    // If a skipped task was selected, replace it, otherwise replace the first skipped or active
    const targetSkipped =
      selectedSkippedId ?? todayQuests.find((q) => q.status === 'skipped')?.id ?? todayQuests[0]?.id;
    if (targetSkipped) {
      joinSpecialQuest(targetSkipped, specialQuestId);
      setSelectedSkippedId(null);
    }
  };

  const completedCount = todayQuests.filter((q) => q.isCompleted).length;
  const progressRatio = Math.min(1, dailyPoints / Math.max(1, dailyPointsTarget));

  return (
    <ScreenWrapper scrollable>
      <Header title="Daily Quests & Game" subtitle={levelDef.arc} showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}
      >
        {/* Level & Arc Header Card */}
        <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <View style={styles.levelRow}>
            <View>
              <Text style={[typography.captionBold, { color: colors.text.muted }]}>
                CHAPTER {levelDef.chapterNumber} • {levelDef.arc.toUpperCase()}
              </Text>
              <Text style={[typography.heading, { color: colors.primary, marginTop: 2 }]}>
                {levelDef.title}
              </Text>
            </View>
            <Badge label={`Lvl ${level}/1000`} variant="primary" />
          </View>

          {/* Stats Bar */}
          <View style={[styles.statsRow, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
            <View style={styles.statItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>XP</Text>
              <Text style={[typography.subbodyBold, { color: colors.primary }]}>{xp}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Coins</Text>
              <Text style={[typography.subbodyBold, { color: colors.accent }]}>{coins}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Daily Streak</Text>
              <Text style={[typography.subbodyBold, { color: colors.success }]}>{streak}d</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>Status</Text>
              <Text style={[typography.subbodyBold, { color: dailyGoalReached ? colors.success : colors.primary }]}>
                {dailyGoalReached ? 'Achieved' : 'In Progress'}
              </Text>
            </View>
          </View>

          {/* Daily Goal Points Bar */}
          <View style={{ marginTop: spacing.md }}>
            <View style={styles.pointsHeader}>
              <Text style={[typography.captionBold, { color: colors.text.secondary }]}>
                Today's Goal Points
              </Text>
              <Text style={[typography.captionBold, { color: colors.primary }]}>
                {dailyPoints} / {dailyPointsTarget} pts
              </Text>
            </View>
            <View style={[styles.progressBarTrack, { backgroundColor: colors.surface1, marginTop: 6 }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressRatio * 100}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
          </View>
        </Card>

        {/* Quests Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Today's Assigned Challenges
          </Text>
          <Badge label={`${completedCount}/${todayQuests.length}`} variant="neutral" />
        </View>

        {/* Quest Cards */}
        {todayQuests.map((quest) => {
          const isSkipped = quest.status === 'skipped';
          const isReplaced = quest.status === 'replaced';

          return (
            <Card
              key={quest.id}
              style={[
                styles.questCard,
                { marginBottom: spacing.md, opacity: isSkipped || isReplaced ? 0.5 : 1 },
              ]}
              padding={16}
            >
              <View style={styles.questHeader}>
                <View style={styles.questHeaderLeft}>
                  <Badge label={quest.category.toUpperCase()} variant="neutral" style={{ alignSelf: 'flex-start' }} />
                  <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                    {quest.title}
                  </Text>
                  <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
                    {quest.description}
                  </Text>
                </View>

                <View style={styles.questHeaderRight}>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    +{quest.taskPoints ?? 15} pts
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                    +{quest.xpReward} XP
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                    {quest.durationMinutes}m
                  </Text>
                </View>
              </View>

              <View style={[styles.questFooter, { marginTop: spacing.md, borderTopColor: colors.border }]}>
                <View style={styles.statusBadgeRow}>
                  {quest.isCompleted ? (
                    <Badge label="Verified Complete" variant="success" />
                  ) : isSkipped ? (
                    <Badge label="Skipped" variant="neutral" />
                  ) : isReplaced ? (
                    <Badge label="Replaced by Special Quest" variant="neutral" />
                  ) : (
                    <Badge label="Active Challenge" variant="primary" />
                  )}
                </View>

                <View style={styles.actionBtnRow}>
                  {!quest.isCompleted && !isSkipped && !isReplaced ? (
                    <>
                      <Button
                        label="Skip & Vault"
                        size="sm"
                        variant="ghost"
                        onPress={() => handleSkip(quest.id)}
                        style={{ marginRight: 8 }}
                      />
                      <Button
                        label="Execute"
                        size="sm"
                        variant="primary"
                        onPress={() => router.push(`/(app)/quests/${quest.id}`)}
                      />
                    </>
                  ) : quest.isCompleted ? (
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  ) : null}
                </View>
              </View>
            </Card>
          );
        })}

        {/* Special Quests Vault */}
        <View style={[styles.sectionHeaderRow, { marginTop: spacing.lg }]}>
          <View>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              Special Quests Vault
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              Skip unnecessary tasks and join an eligible special quest to earn today's points
            </Text>
          </View>
        </View>

        {specialQuests.map((sq) => (
          <Card
            key={sq.id}
            variant="surface1"
            style={{ marginBottom: spacing.md, padding: spacing.md }}
          >
            <View style={styles.questHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.vaultTagRow}>
                  <Badge label="SPECIAL QUEST" variant="primary" />
                  <Badge label={sq.vaultCategory.toUpperCase()} variant="neutral" style={{ marginLeft: 6 }} />
                </View>
                <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 6 }]}>
                  {sq.title}
                </Text>
                <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
                  {sq.shortDescription}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.primary }]}>
                  +{sq.points.taskPoints} pts
                </Text>
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                  +{sq.points.xp} XP
                </Text>
                <Button
                  label="Accept & Join"
                  size="sm"
                  variant="primary"
                  onPress={() => handleJoinSpecialQuest(sq.id)}
                  style={{ marginTop: 10 }}
                />
              </View>
            </View>
          </Card>
        ))}

        <Button
          label="Refresh Daily Quests"
          variant="outline"
          onPress={() => refreshDailyQuests()}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questCard: {
    borderRadius: 16,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  questHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  questHeaderRight: {
    alignItems: 'flex-end',
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vaultTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
