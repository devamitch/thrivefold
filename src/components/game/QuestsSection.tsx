import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Quest } from '../../stores/slices/questSlice';

export interface QuestsSectionProps {
  levelDef: {
    level: number;
    title: string;
    chapterNumber: number;
    arc: string;
  };
  level: number;
  xp: number;
  coins: number;
  streak: number;
  dailyPoints: number;
  dailyPointsTarget: number;
  dailyGoalReached: boolean;
  todayQuests: Quest[];
  specialQuests: Array<{
    id: string;
    title: string;
    shortDescription: string;
    points: { taskPoints: number };
  }>;
  onExecuteQuest: (questId: string) => void;
  onSkipQuest: (questId: string) => void;
  onJoinSpecialQuest: (skippedId: string, specialQuestId: string) => void;
}

export const QuestsSection: React.FC<QuestsSectionProps> = ({
  levelDef,
  level,
  xp,
  coins,
  streak,
  dailyPoints,
  dailyPointsTarget,
  dailyGoalReached,
  todayQuests,
  specialQuests,
  onExecuteQuest,
  onSkipQuest,
  onJoinSpecialQuest,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <>
      {/* Level & Arc Banner */}
      <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, paddingRight: 8 }}>
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
            <Text style={[typography.caption, { color: colors.text.muted }]}>Total XP</Text>
            <Text style={[typography.subbodyBold, { color: colors.primary }]}>{xp}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Coins</Text>
            <Text style={[typography.subbodyBold, { color: colors.accent }]}>{coins}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Streak</Text>
            <Text style={[typography.subbodyBold, { color: colors.success }]}>{streak}d</Text>
          </View>
        </View>

        {/* Today's Point Target Progress */}
        <View style={{ marginTop: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text style={[typography.captionBold, { color: colors.text.primary }]}>
              Today's Point Target
            </Text>
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              {dailyPoints} / {dailyPointsTarget} pts
            </Text>
          </View>
          <View style={[styles.progressBarTrack, { backgroundColor: colors.surface1, marginTop: 6 }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: dailyGoalReached ? colors.success : colors.primary,
                  width: `${Math.min(100, (dailyPoints / Math.max(1, dailyPointsTarget)) * 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      </Card>

      {/* Daily Quests with Skip & Replace */}
      <View style={{ marginTop: spacing.lg }}>
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          Today's Quests ({todayQuests.filter((q) => q.isCompleted).length}/{todayQuests.length})
        </Text>

        {todayQuests.map((quest) => (
          <Card key={quest.id} style={{ marginBottom: 10, padding: spacing.md }}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {quest.title}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  {quest.description}
                </Text>
              </View>
              <Badge
                label={quest.isCompleted ? 'Verified' : `${quest.taskPoints ?? 10} pts`}
                variant={quest.isCompleted ? 'success' : 'primary'}
              />
            </View>

            {!quest.isCompleted && (
              <View style={[styles.actionBtnRow, { marginTop: 12 }]}>
                <Button
                  label="Execute Task"
                  size="sm"
                  variant="primary"
                  onPress={() => onExecuteQuest(quest.id)}
                  style={{ marginRight: 8 }}
                />
                <Button
                  label="Skip & Vault"
                  size="sm"
                  variant="ghost"
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    onSkipQuest(quest.id);
                  }}
                />
              </View>
            )}
          </Card>
        ))}
      </View>

      {/* Special Quests Vault */}
      <View style={{ marginTop: spacing.lg }}>
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          Special Quests Vault (Pick an alternative)
        </Text>
        {specialQuests.map((sq) => (
          <Card key={sq.id} style={{ marginBottom: 10, padding: spacing.md }}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {sq.title}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  {sq.shortDescription}
                </Text>
              </View>
              <Badge label={`+${sq.points.taskPoints} pts`} variant="primary" />
            </View>
            <Button
              label="Accept & Join Special Quest"
              size="sm"
              variant="outline"
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } catch {}
                const targetSkipped =
                  todayQuests.find((q) => q.status === 'skipped')?.id ??
                  todayQuests[0]?.id ??
                  'default';
                onJoinSpecialQuest(targetSkipped, sq.id);
              }}
              style={{ marginTop: 10, alignSelf: 'flex-start' }}
            />
          </Card>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 12,
  },
  statItem: {
    flex: 1,
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
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
