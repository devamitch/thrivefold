import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppHeader } from '../../components/ui/AppHeader';
import { Card } from '../../components/ui/Card';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { currentLevelProgress, getRoadmapChapters, getRoadmapStages, getTaskById } from '../../domain/game/gameCatalogService';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

const STAGE_NAME: Record<string, string> = {
  orientation: 'Get oriented',
  foundation_practice: 'Practise the basics',
  consistent_application: 'Use it in real life',
  independent_planning: 'Plan on your own',
  adaptation_and_reflection: 'Adapt and reflect',
  mastery_preparation: 'Get ready for mastery',
  chapter_capstone: 'Chapter challenge',
};

type NodeState = 'done' | 'current' | 'locked';

/**
 * The journey from the v3 catalog: 20 chapters of 50 levels, each moving through the same
 * stages and ending in a chapter challenge. The current chapter opens into its stages, the
 * current stage into its levels, with the level you are on breathing on the trail.
 */
export default function RoadmapScreen() {
  const { colors, typography, spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const { xp, checkpoints, todayQuests } = useRootStore(
    useShallow((s) => ({ xp: s.xp, checkpoints: s.completedCheckpoints, todayQuests: s.todayQuests })),
  );
  const todayTaskIds = todayQuests.map((q) => q.taskId);
  const progress = currentLevelProgress(xp, checkpoints);
  const level = progress.level;
  const chapters = getRoadmapChapters();
  const stages = getRoadmapStages().filter((s) => Array.isArray(s.range));
  const chapter = chapters.find((c) => level >= c.levelRange[0] && level <= c.levelRange[1]) ?? chapters[0];
  const inChapter = level - chapter.levelRange[0] + 1; // 1..50
  const chapterPct = Math.round(((inChapter - 1) / (chapter.levelRange[1] - chapter.levelRange[0])) * 100);
  const stage = stages.find((s) => inChapter >= s.range[0] && inChapter <= s.range[1]) ?? stages[0];
  const toNext = Math.max(0, progress.xpForNext - progress.xpIntoLevel);

  const stageState = (r: [number, number]): NodeState => (inChapter > r[1] ? 'done' : inChapter >= r[0] ? 'current' : 'locked');
  const chapterState = (n: number): NodeState => (n < chapter.number ? 'done' : n === chapter.number ? 'current' : 'locked');
  const enter = (i: number) => (reduceMotion ? undefined : FadeInDown.delay(30 * i).duration(260));

  return (
    <ScreenContainer header={<AppHeader title="Roadmap" subtitle="Where you are on the journey" showBack />} scrollMode="shell-scroll-view">
      {/* Where you are */}
      <Animated.View entering={enter(0)}>
        <Card style={{ padding: spacing.lg }}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
            CHAPTER {chapter.number} OF {chapters.length} · LEVEL {level}
          </Text>
          <Text style={[typography.heading, { color: colors.text.primary, marginTop: 4 }]}>{chapter.title}</Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>{chapter.outcome}</Text>
          <View style={[styles.track, { backgroundColor: colors.surface1, marginTop: spacing.md }]}>
            <View style={[styles.fill, { width: `${Math.max(3, chapterPct)}%`, backgroundColor: colors.primary }]} />
          </View>
          <View style={[styles.rowBetween, { marginTop: 6 }]}>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              Level {inChapter} of {chapter.levelRange[1] - chapter.levelRange[0] + 1} in this chapter
            </Text>
            <Text style={[typography.captionBold, { color: colors.text.secondary }]}>{toNext} XP to level {level + 1}</Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
            XP comes from finishing quests and workouts. Each level needs a little more than the last.
          </Text>
        </Card>
      </Animated.View>

      {/* This chapter's stages, with the current stage's levels on a trail */}
      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.sm }]}>This chapter</Text>
      {stages.map((s, i) => {
        const state = stageState(s.range);
        const from = chapter.levelRange[0] + s.range[0] - 1;
        const to = chapter.levelRange[0] + s.range[1] - 1;
        return (
          <Animated.View key={s.id} entering={enter(i + 1)} style={styles.stageRow}>
            <View style={styles.rail}>
              <Node state={state} icon={s.id === 'chapter_capstone' ? 'trophy' : undefined} />
              {i < stages.length - 1 ? <View style={[styles.railLine, { backgroundColor: state === 'done' ? colors.success : colors.surface2 }]} /> : null}
            </View>
            <View style={[styles.flex, { paddingBottom: spacing.md }]}>
              <View style={styles.rowBetween}>
                <Text style={[typography.bodyBold, { color: state === 'locked' ? colors.text.muted : colors.text.primary }]}>
                  {STAGE_NAME[s.id] ?? s.id}
                </Text>
                <Text style={[typography.caption, { color: colors.text.muted }]}>{from === to ? `Level ${from}` : `Levels ${from}-${to}`}</Text>
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{s.purpose}</Text>
              {state === 'current' && s.id !== 'chapter_capstone' ? (
                <LevelTrail from={from} to={to} current={level} pulse={!reduceMotion} />
              ) : null}
            </View>
          </Animated.View>
        );
      })}

      {chapter.capstone ? (
        <Card variant="tinted" style={{ padding: spacing.base, marginTop: spacing.sm }}>
          <View style={styles.row}>
            <Ionicons name="trophy-outline" size={20} color={colors.primary} />
            <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary, marginLeft: 8 }]}>{chapter.capstone.title}</Text>
          </View>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>{chapter.capstone.purpose}</Text>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>
            Opens at level {chapter.capstone.requiredAtLevel}. Finishing it moves you to the next chapter.
          </Text>
        </Card>
      ) : null}

      {/* Quests that build this chapter */}
      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.xs }]}>
        Quests that build this chapter
      </Text>
      <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>
        Your daily quests are picked from these and the wider catalog, fitted to your pace.
      </Text>
      {chapter.recommendedTaskIds
        .map((id) => getTaskById(id))
        .filter((t): t is NonNullable<typeof t> => Boolean(t))
        .slice(0, 8)
        .map((t) => (
          <View key={t.id} style={[styles.questRow, { borderBottomColor: colors.border }]}>
            <Ionicons
              name={todayTaskIds.includes(t.id) ? 'today-outline' : 'ellipse-outline'}
              size={16}
              color={todayTaskIds.includes(t.id) ? colors.primary : colors.text.muted}
            />
            <View style={[styles.flex, { marginLeft: 10 }]}>
              <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{t.title}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]} numberOfLines={2}>
                {t.shortDescription}
              </Text>
            </View>
            {todayTaskIds.includes(t.id) ? <Text style={[typography.captionBold, { color: colors.primary }]}>Today</Text> : null}
          </View>
        ))}

      {/* The whole journey */}
      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.sm }]}>The journey</Text>
      {chapters.map((c, i) => {
        const state = chapterState(c.number);
        return (
          <View key={c.id} style={styles.stageRow}>
            <View style={styles.rail}>
              <Node state={state} label={String(c.number)} />
              {i < chapters.length - 1 ? <View style={[styles.railLine, { backgroundColor: state === 'done' ? colors.success : colors.surface2 }]} /> : null}
            </View>
            <View style={[styles.flex, { paddingBottom: spacing.md, opacity: state === 'locked' ? 0.6 : 1 }]}>
              <View style={styles.rowBetween}>
                <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>{c.title}</Text>
                <Text style={[typography.caption, { color: colors.text.muted }]}>
                  {c.levelRange[0]}-{c.levelRange[1]}
                </Text>
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]} numberOfLines={2}>
                {c.description}
              </Text>
            </View>
          </View>
        );
      })}
      <View style={{ height: spacing.xl }} />
    </ScreenContainer>
  );
}

function Node({ state, icon, label }: { state: NodeState; icon?: keyof typeof Ionicons.glyphMap; label?: string }) {
  const { colors, typography } = useTheme();
  const bg = state === 'done' ? colors.success : state === 'current' ? colors.primary : colors.surface1;
  const fg = state === 'locked' ? colors.text.muted : colors.onPrimary;
  return (
    <View style={[styles.node, { backgroundColor: bg }]}>
      {state === 'done' ? (
        <Ionicons name="checkmark" size={14} color={fg} />
      ) : icon ? (
        <Ionicons name={icon} size={14} color={fg} />
      ) : label ? (
        <Text style={[typography.captionBold, { color: fg }]}>{label}</Text>
      ) : state === 'locked' ? (
        <Ionicons name="lock-closed" size={12} color={fg} />
      ) : (
        <View style={[styles.dot, { backgroundColor: fg }]} />
      )}
    </View>
  );
}

/** Levels of the current stage on a zig-zag trail; the current one breathes. */
function LevelTrail({ from, to, current, pulse }: { from: number; to: number; current: number; pulse: boolean }) {
  const { colors, typography } = useTheme();
  const breath = useSharedValue(0);
  useEffect(() => {
    if (pulse) breath.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [breath, pulse]);
  const halo = useAnimatedStyle(() => ({ opacity: 0.25 + 0.35 * breath.value, transform: [{ scale: 1 + 0.35 * breath.value }] }));
  const levels = Array.from({ length: to - from + 1 }, (_, i) => from + i).slice(0, 12);
  return (
    <View style={styles.trail}>
      {levels.map((lv, i) => {
        const done = lv < current;
        const here = lv === current;
        const offset = [0, 28, 56, 28][i % 4];
        return (
          <View key={lv} style={[styles.trailNode, { marginLeft: offset }]}>
            {here ? <Animated.View style={[styles.halo, { backgroundColor: colors.primary }, halo]} /> : null}
            <View style={[styles.levelDot, { backgroundColor: done ? colors.success : here ? colors.primary : colors.surface1 }]}>
              <Text style={[typography.captionBold, { color: done || here ? colors.onPrimary : colors.text.muted }]}>{lv}</Text>
            </View>
            {here ? <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 8 }]}>You are here</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { borderRadius: 4, height: 8, width: 8 },
  fill: { borderRadius: 4, height: 8 },
  flex: { flex: 1 },
  halo: { borderRadius: 22, height: 44, left: -4, position: 'absolute', top: -4, width: 44 },
  levelDot: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  node: { alignItems: 'center', borderRadius: 14, height: 28, justifyContent: 'center', width: 28 },
  questRow: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', paddingVertical: 10 },
  rail: { alignItems: 'center', marginRight: 12, width: 28 },
  railLine: { flex: 1, marginVertical: 2, width: 2 },
  row: { alignItems: 'center', flexDirection: 'row' },
  rowBetween: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  stageRow: { flexDirection: 'row' },
  track: { borderRadius: 4, height: 8, overflow: 'hidden' },
  trail: { marginTop: 10 },
  trailNode: { alignItems: 'center', flexDirection: 'row', marginBottom: 8 },
});
