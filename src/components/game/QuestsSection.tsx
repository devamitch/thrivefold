import { SquircleSurface } from '../ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { ActivityRow } from './ActivityRow';
import { Badge } from '../ui/Badge';
import type { Quest } from '../../stores/slices/questSlice';
import type { LevelProgress } from '../../domain/game/progression';

export interface QuestsSectionProps {
  progress: LevelProgress;
  xp: number;
  diamonds: number;
  streak: number;
  dailyPoints: number;
  dailyPointsTarget: number;
  dailyGoalReached: boolean;
  todayQuests: Quest[];
  onOpenQuest: (assignmentId: string) => void;
}

const STATUS_LABEL: Partial<Record<Quest['status'], string>> = {
  verified: 'Verified',
  self_reported: 'Recorded',
  skipped: 'Skipped',
  replaced: 'Replaced',
  rejected: 'Needs more',
};

/** Level, today's points and the day's quests. Each quest opens the shared QuestSheet. */
export const QuestsSection: React.FC<QuestsSectionProps> = ({
  progress,
  xp,
  diamonds,
  streak,
  dailyPoints,
  dailyPointsTarget,
  dailyGoalReached,
  todayQuests,
  onOpenQuest,
}) => {
  const { colors, typography, spacing } = useTheme();
  const def = progress.definition;
  const doneCount = todayQuests.filter((q) => q.isCompleted).length;
  const active = todayQuests.filter((q) => q.status !== 'replaced');

  return (
    <>
      <Card style={{ marginTop: spacing.md, padding: spacing.lg }}>
        <SquircleSurface style={styles.rowBetween}>
          <SquircleSurface style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[typography.captionBold, { color: colors.text.muted }]}>Chapter {def.chapterNumber}</Text>
            <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 2 }]}>{def.title}</Text>
          </SquircleSurface>
          <Badge label={`Level ${progress.level}`} variant="primary" />
        </SquircleSurface>

        <SquircleSurface style={[styles.statsRow, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
          <Stat label="XP" value={String(xp)} />
          <Stat label="Diamonds" value={String(diamonds)} />
          <Stat label="Goal streak" value={`${streak}d`} />
        </SquircleSurface>

        {progress.next ? (
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.sm }]}>
            {progress.blockedByCheckpointId
              ? 'Enough XP for the next level. The chapter checkpoint comes first.'
              : `${Math.max(0, progress.xpForNext - progress.xpIntoLevel)} XP to level ${progress.next.level}`}
          </Text>
        ) : null}

        <SquircleSurface style={{ marginTop: spacing.md }}>
          <SquircleSurface style={styles.rowBetween}>
            <Text style={[typography.captionBold, { color: colors.text.primary }]}>Today&apos;s points</Text>
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              {dailyPoints} / {dailyPointsTarget}
            </Text>
          </SquircleSurface>
          <SquircleSurface style={[styles.track, { backgroundColor: colors.surface1, marginTop: 6 }]}>
            <SquircleSurface
              style={[
                styles.fill,
                {
                  backgroundColor: dailyGoalReached ? colors.success : colors.primary,
                  width: `${Math.min(100, (dailyPoints / Math.max(1, dailyPointsTarget)) * 100)}%`,
                },
              ]}
            />
          </SquircleSurface>
          {dailyGoalReached ? (
            <Text style={[typography.caption, { color: colors.success, marginTop: 4 }]}>Daily goal reached.</Text>
          ) : null}
        </SquircleSurface>
      </Card>

      <SquircleSurface style={{ marginTop: spacing.lg }}>
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          Today&apos;s quests ({doneCount}/{active.filter((q) => q.status !== 'skipped').length})
        </Text>

        {active.length === 0 ? (
          <Card variant="surface1" style={{ padding: spacing.base }}>
            <Text style={[typography.subbody, { color: colors.text.secondary }]}>
              No quests yet today. Finish setting up and they will appear here.
            </Text>
          </Card>
        ) : (
          active.map((quest) => {
            const label = STATUS_LABEL[quest.status];
            return (
              <ActivityRow
                key={quest.id}
                icon={quest.durationMinutes >= 10 ? 'barbell-outline' : 'flag-outline'}
                title={quest.title}
                meta={[
                  quest.description,
                  `${quest.durationMinutes} min · +${quest.taskPoints} pts · +${quest.xpReward} XP${quest.isReplacement ? ' · replacement' : ''}`,
                  label,
                ]
                  .filter(Boolean)
                  .join('\n')}
                done={quest.isCompleted}
                dimmed={quest.status === 'skipped'}
                action={quest.status === 'skipped' ? undefined : quest.status === 'rejected' ? 'Continue' : 'Start'}
                onPress={() => onOpenQuest(quest.id)}
              />
            );
          })
        )}
      </SquircleSurface>
    </>
  );
};

function Stat({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <SquircleSurface style={styles.stat}>
      <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
      <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{value}</Text>
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statsRow: { flexDirection: 'row', borderRadius: 14, padding: 12 },
  stat: { flex: 1, alignItems: 'center' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
