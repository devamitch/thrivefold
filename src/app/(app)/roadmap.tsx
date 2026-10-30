import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppHeader } from '../../components/ui/AppHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PressableScale } from '../../components/ui/PressableScale';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LootBoxModal } from '../../components/game/LootBoxModal';
import { AssetIllustrations, RewardAssets } from '../../constants/assets';
import { currentLevelProgress, getRoadmapChapters, getRoadmapStages, getTaskById } from '../../domain/game/gameCatalogService';
import { chestKey, LEVEL_CHESTS, type LevelChest } from '../../domain/game/rewards';
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

function getChestAssets(level: number) {
  if (level >= 100) return RewardAssets.chests.tier5;
  if (level >= 50) return RewardAssets.chests.tier4;
  if (level >= 20) return RewardAssets.chests.tier3;
  if (level >= 10) return RewardAssets.chests.tier2;
  return RewardAssets.chests.tier1;
}

/**
 * The journey from the v3 catalog: 20 chapters of 50 levels, each moving through the same
 * stages and ending in a chapter challenge. The current chapter opens into its stages, the
 * current stage into its levels, with milestone chests at levels 5, 10, 20, 50, and 100.
 */
export default function RoadmapScreen() {
  const { colors, typography, spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const { xp, checkpoints, todayQuests, ledger } = useRootStore(
    useShallow((s) => ({
      xp: s.xp,
      checkpoints: s.completedCheckpoints,
      todayQuests: s.todayQuests,
      ledger: s.rewardLedger,
    })),
  );

  const opened = useMemo(() => ledger.filter((e) => e.kind === 'chest_reward').map((e) => e.key), [ledger]);
  const [chestModal, setChestModal] = useState<LevelChest | null>(null);

  const todayTaskIds = todayQuests.map((q) => q.taskId);
  const progress = currentLevelProgress(xp, checkpoints);
  const level = progress.level;
  const chapters = getRoadmapChapters();
  const stages = getRoadmapStages().filter((s) => Array.isArray(s.range));
  const chapter = chapters.find((c) => level >= c.levelRange[0] && level <= c.levelRange[1]) ?? chapters[0];
  const inChapter = level - chapter.levelRange[0] + 1; // 1..50
  const chapterPct = Math.round(((inChapter - 1) / (chapter.levelRange[1] - chapter.levelRange[0])) * 100);
  const toNext = Math.max(0, progress.xpForNext - progress.xpIntoLevel);

  const stageState = (r: [number, number]): NodeState => (inChapter > r[1] ? 'done' : inChapter >= r[0] ? 'current' : 'locked');
  const chapterState = (n: number): NodeState => (n < chapter.number ? 'done' : n === chapter.number ? 'current' : 'locked');
  const enter = (i: number) => (reduceMotion ? undefined : FadeIn.duration(180));

  // Next milestone chest on the journey
  const nextMilestone = LEVEL_CHESTS.find((c) => !opened.includes(chestKey(c.level)));

  // Preload essential journey visual assets on mount
  useEffect(() => {
    const essential = [
      AssetIllustrations.roadmapJourneyBg,
      RewardAssets.chests.tier1.closed,
      RewardAssets.chests.tier1.burst,
      RewardAssets.chests.tier2.closed,
      RewardAssets.chests.tier2.burst,
      RewardAssets.currencies.amberGem,
    ];
    essential.forEach((src) => {
      Image.loadAsync(src).catch(() => {});
    });
  }, []);

  return (
    <ScreenContainer header={<AppHeader title="Roadmap" subtitle="Where you are on the journey" showBack />} scrollMode="shell-scroll-view">
      {/* Cinematic Journey Hero Banner */}
      <View style={styles.heroBannerWrap}>
        <Image
          source={AssetIllustrations.roadmapJourneyBg}
          style={styles.heroBanner}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
        />
        <View style={styles.heroOverlay}>
          <Badge label={`Chapter ${chapter.number} · ${chapter.title}`} variant="gold" />
          <Text style={[typography.subheading, { color: '#FFFFFF', marginTop: 4 }]} numberOfLines={1}>
            {chapter.outcome}
          </Text>
        </View>
      </View>

      {/* Where you are */}
      <Animated.View entering={enter(0)}>
        <Card style={{ padding: spacing.lg }}>
          <View style={styles.rowBetween}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              CHAPTER {chapter.number} OF {chapters.length} · LEVEL {level}
            </Text>
            <Badge label={`Level ${level}`} variant="primary" />
          </View>
          <Text style={[typography.heading, { color: colors.text.primary, marginTop: 6 }]}>{chapter.title}</Text>
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
            XP comes from verified habits, workouts and completed quests. Each level needs a little more than the last.
          </Text>
        </Card>
      </Animated.View>

      {/* Next Milestone Chest Highlight */}
      {nextMilestone && (
        <Animated.View entering={enter(1)} style={{ marginTop: spacing.md }}>
          <Card style={[styles.milestoneCard, { borderColor: level >= nextMilestone.level ? colors.primary : colors.border }]}>
            <Image
              source={getChestAssets(nextMilestone.level).closed}
              style={styles.milestoneImg}
              contentFit="contain"
              transition={150}
              cachePolicy="memory-disk"
            />
            <View style={styles.flex}>
              <View style={styles.row}>
                <Text style={[typography.captionBold, { color: colors.primary }]}>
                  {level >= nextMilestone.level ? 'MILESTONE READY' : `MILESTONE · LEVEL ${nextMilestone.level}`}
                </Text>
              </View>
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 2 }]}>{nextMilestone.title}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                +{nextMilestone.gems} Amber Gems · {nextMilestone.card.title} ({nextMilestone.card.rarity} Card)
              </Text>
            </View>
            {level >= nextMilestone.level ? (
              <Button label="Open" size="sm" onPress={() => setChestModal(nextMilestone)} />
            ) : (
              <Badge label={`${nextMilestone.level - level} to go`} variant="neutral" />
            )}
          </Card>
        </Animated.View>
      )}

      {/* This chapter's stages, with the current stage's levels on a trail */}
      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.sm }]}>This chapter</Text>
      {stages.map((s, i) => {
        const state = stageState(s.range);
        const from = chapter.levelRange[0] + s.range[0] - 1;
        const to = chapter.levelRange[0] + s.range[1] - 1;
        const chestInStage = LEVEL_CHESTS.find((c) => c.level >= from && c.level <= to);
        const chestDone = chestInStage ? opened.includes(chestKey(chestInStage.level)) : false;
        const chestReady = chestInStage ? !chestDone && level >= chestInStage.level : false;

        return (
          <Animated.View key={s.id} entering={enter(i + 2)} style={styles.stageRow}>
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

              {/* Milestone Chest Callout inside stage */}
              {chestInStage && (
                <PressableScale
                  disabled={!chestReady}
                  onPress={() => setChestModal(chestInStage)}
                  style={[
                    styles.stageChestCallout,
                    {
                      backgroundColor: chestReady ? colors.primaryAlpha : colors.surface,
                      borderColor: chestReady ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Image
                    source={chestDone ? getChestAssets(chestInStage.level).burst : getChestAssets(chestInStage.level).closed}
                    style={styles.stageChestIcon}
                    contentFit="contain"
                    transition={150}
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.flex}>
                    <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                      Level {chestInStage.level} Reward: {chestInStage.title}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>
                      +{chestInStage.gems} Gems · {chestInStage.card.title}
                    </Text>
                  </View>
                  <Badge
                    label={chestDone ? 'Claimed' : chestReady ? 'Tap to open' : `Level ${chestInStage.level}`}
                    variant={chestDone ? 'success' : chestReady ? 'primary' : 'neutral'}
                  />
                </PressableScale>
              )}

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

      {/* Loot Box Modal when opening milestone chests directly from the Roadmap */}
      <LootBoxModal key={chestModal?.level ?? 0} chest={chestModal} onClose={() => setChestModal(null)} />
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
  questRow: { alignItems: 'center', flexDirection: 'row', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  rail: { alignItems: 'center', marginRight: 12, width: 28 },
  railLine: { flex: 1, marginVertical: 2, width: 2 },
  row: { alignItems: 'center', flexDirection: 'row' },
  rowBetween: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  stageRow: { flexDirection: 'row' },
  track: { borderRadius: 4, height: 8, overflow: 'hidden' },
  trail: { marginTop: 10 },
  trailNode: { alignItems: 'center', flexDirection: 'row', marginBottom: 8 },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
  },
  milestoneImg: {
    width: 60,
    height: 60,
  },
  stageChestCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  stageChestIcon: {
    width: 44,
    height: 44,
  },
  heroBannerWrap: {
    height: 130,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  heroBanner: {
    width: '100%',
    height: 130,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
