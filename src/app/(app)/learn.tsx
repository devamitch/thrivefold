import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, type Href } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ViewInstance } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { AppHeader } from '../../components/ui/AppHeader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { TextField } from '../../components/ui/TextField';
import { useCoach } from '../../components/assistant/CoachProvider';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { articlesFor, type Article } from '../../content/learn';
import { speakCoachLine, stopCoachSpeech } from '../../services/ai/coachVoiceService';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../../components/ui/PressableScale';
import { ImageViewer, type ViewerOrigin } from '../../components/ui/ImageViewer';
import { getArticleIllustration } from '../../utils/illustrationResolver';

/** Plain-language health basics for the selected experience; tap an article to read it. */
export default function LearnScreen() {
  const { colors, typography, spacing, experience } = useTheme();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const all = useMemo(() => articlesFor(experience), [experience]);
  const read = useRootStore((s) => s.learnRead);
  const setRead = useRootStore((s) => s.setLearnRead);
  const coach = useCoach();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const categories = useMemo(() => [...new Set(all.map((a) => a.category))], [all]);
  // Filter by topic and by words in the title or text; unread articles first so "continue" is on top.
  const articles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((a) => !category || a.category === category)
      .filter((a) => !q || a.title.toLowerCase().includes(q) || a.body.some((p) => p.toLowerCase().includes(q)))
      .sort((a, b) => Number(!!read[a.id]) - Number(!!read[b.id]));
  }, [all, category, query, read]);
  const readCount = all.filter((a) => read[a.id]).length;
  const imageRefs = useRef<Record<string, ViewInstance | null>>({});
  const [viewer, setViewer] = useState<{ source: ImageSource | number; origin: ViewerOrigin; caption: string } | null>(
    null,
  );
  // The viewer grows out of the tapped picture: measure where it is on screen first.
  const openImage = (id: string, source: ImageSource | number, caption: string) => {
    const node = imageRefs.current[id];
    if (!node) return;
    node.measureInWindow((x, y, width, height) => setViewer({ source, caption, origin: { x, y, width, height } }));
  };

  // Stop any active speech on unmount
  useEffect(() => {
    return () => {
      stopCoachSpeech();
    };
  }, []);

  const toggleVoice = useCallback((art: Article) => {
    if (speakingId === art.id) {
      stopCoachSpeech();
      setSpeakingId(null);
      return;
    }

    setSpeakingId(art.id);
    const introText = `In this lesson, you will learn about: ${art.title}. ${art.body.join(' ')}`;
    // The previous article's "stopped" arrives after this one starts; only clear our own id.
    void speakCoachLine(introText, {
      onEnd: () =>
        setSpeakingId((cur) => {
          // Listening to the end counts as read.
          if (cur === art.id) useRootStore.getState().setLearnRead(art.id, true);
          return cur === art.id ? null : cur;
        }),
    });
  }, [speakingId]);

  const ask = (art: Article) => coach.ask(`Explain the Learn article "${art.title}" simply, and what I can do about it.`);

  return (
    <ScreenContainer
      header={<AppHeader title="Learn" subtitle="Plain-language health basics" showBack />}
      scrollMode="shell-scroll-view"
    >
      <Card variant="surface1" style={{ marginBottom: spacing.md, padding: spacing.base }}>
        <Text style={[typography.caption, { color: colors.text.secondary }]}>
          General information based on public health guidance (NHS, WHO, CDC). Not medical advice and not a diagnosis.
        </Text>
      </Card>

      <Link href={'/(app)/learn-library' as Href} asChild>
        <PressableScale style={[styles.libraryCard, { backgroundColor: colors.surface, marginBottom: spacing.md }]} accessibilityRole="link">
          <Ionicons name="library-outline" size={22} color={colors.primary} />
          <View style={styles.flex}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Library</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              Encyclopedia articles, books and free e-books on your topics. Saved for offline reading.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
        </PressableScale>
      </Link>

      {/* Progress is real: only articles marked read (or listened to the end) count. */}
      <View style={[styles.progressRow, { marginBottom: spacing.sm }]}>
        <Text style={[typography.captionBold, { color: colors.text.secondary }]}>
          {readCount} of {all.length} read
        </Text>
        <View style={[styles.track, { backgroundColor: colors.surface2 }]}>
          <View style={[styles.fill, { backgroundColor: colors.primary, width: `${all.length ? (readCount / all.length) * 100 : 0}%` }]} />
        </View>
      </View>
      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder="Search articles"
        returnKeyType="search"
        accessibilityLabel="Search Learn articles"
        leftIcon={<Ionicons name="search" size={18} color={colors.text.muted} />}
        containerStyle={{ marginBottom: spacing.sm }}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} keyboardShouldPersistTaps="handled">
        <Chip label="All" selected={!category} onPress={() => setCategory(null)} />
        {categories.map((c) => (
          <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(category === c ? null : c)} />
        ))}
      </ScrollView>
      {articles.length === 0 ? (
        <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center', marginVertical: spacing.md }]}>
          No built-in article matches.
        </Text>
      ) : null}
      {/* One search for everything: built-in lessons above, the online library one tap away. */}
      {query.trim().length > 1 ? (
        <Link href={`/(app)/learn-library?${new URLSearchParams({ q: query.trim() }).toString()}` as Href} asChild>
          <PressableScale style={[styles.libraryCard, { backgroundColor: colors.surface, marginBottom: spacing.md }]} accessibilityRole="link">
            <Ionicons name="search" size={20} color={colors.primary} />
            <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>Search the library for “{query.trim()}”</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </PressableScale>
        </Link>
      ) : null}

      {articles.map((art) => {
        const expanded = open === art.id;
        const isSpeaking = speakingId === art.id;
        const artImage = getArticleIllustration(art.id, experience);

        return (
          <Card
            key={art.id}
            onPress={() => setOpen(expanded ? null : art.id)}
            style={{ marginBottom: spacing.md, overflow: 'hidden', padding: 0 }}
          >
            {/* Top Article Illustration Banner */}
            <View style={styles.imageWrap}>
              <PressableScale
                ref={(r: ViewInstance | null) => {
                  imageRefs.current[art.id] = r;
                }}
                onPress={() => openImage(art.id, artImage, art.title)}
                scaleTo={0.98}
                style={StyleSheet.absoluteFill}
                accessibilityRole="imagebutton"
                accessibilityLabel={`${art.title}. Open the picture full screen`}
              >
                <Image
                  source={artImage}
                  style={styles.cardImage}
                  contentFit="cover"
                  transition={150}
                  priority="low"
                  accessibilityIgnoresInvertColors
                />
              </PressableScale>
              <View style={styles.badgeOverlay} pointerEvents="box-none">
                {/* Solid chip so the category stays readable on any picture (no grey band). */}
                <View style={[styles.categoryChip, { backgroundColor: colors.background }]}>
                  <Badge label={art.category} variant="primary" />
                </View>
                <View style={styles.pillRow}>
                  <PressableScale
                    accessibilityRole="button"
                    accessibilityLabel={isSpeaking ? 'Stop listening' : 'Listen to lesson summary'}
                    onPress={() => toggleVoice(art)}
                    style={styles.voicePill}
                  >
                    <Ionicons
                      name={isSpeaking ? 'stop-circle' : 'volume-high'}
                      size={14}
                      color="#FFFFFF"
                    />
                    <Text style={styles.pillText}>{isSpeaking ? 'Stop' : 'Listen'}</Text>
                  </PressableScale>
                  <View style={styles.readPill}>
                    <Ionicons name="time-outline" size={13} color="#FFFFFF" />
                    <Text style={styles.pillText}>{art.minutes} min</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Card Content */}
            <View style={{ padding: spacing.base }}>
              <View style={styles.titleRow}>
                <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>
                  {art.title}
                </Text>
                {read[art.id] ? <Ionicons name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: 8 }} /> : null}
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.text.muted}
                />
              </View>

              {expanded ? (
                <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(200)}>
                  {art.body.map((p) => (
                    <Text
                      key={p.slice(0, 24)}
                      style={[typography.body, { color: colors.text.secondary, marginTop: spacing.sm }]}
                    >
                      {p}
                    </Text>
                  ))}
                  <View style={styles.actionRow}>
                    <Link
                      href={`/(app)/watch?${new URLSearchParams({ title: art.title, q: art.videoQuery }).toString()}` as Href}
                      asChild
                    >
                      <PressableScale
                        accessibilityRole="link"
                        style={StyleSheet.flatten([styles.cardHeader, { justifyContent: 'flex-start', marginTop: spacing.md }])}
                      >
                        <Ionicons name="logo-youtube" size={16} color={colors.text.secondary} />
                        <Text style={[typography.captionBold, { color: colors.text.secondary, marginLeft: 6 }]}>
                          Watch videos on this topic
                        </Text>
                      </PressableScale>
                    </Link>

                    <PressableScale
                      accessibilityRole="button"
                      onPress={() => toggleVoice(art)}
                      style={[styles.listenFullBtn, { backgroundColor: colors.surface1, marginTop: spacing.md }]}
                    >
                      <Ionicons
                        name={isSpeaking ? 'stop-circle' : 'volume-high-outline'}
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 6 }]}>
                        {isSpeaking ? 'Stop voice' : 'Listen to lesson'}
                      </Text>
                    </PressableScale>
                  </View>

                  <View style={[styles.actionRow, { marginTop: spacing.md }]}>
                    <PressableScale
                      accessibilityRole="button"
                      onPress={() => ask(art)}
                      style={[styles.listenFullBtn, { backgroundColor: colors.surface1 }]}
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
                      <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 6 }]}>Ask Anvay about this</Text>
                    </PressableScale>
                    <PressableScale
                      accessibilityRole="button"
                      accessibilityState={{ checked: !!read[art.id] }}
                      onPress={() => setRead(art.id, !read[art.id])}
                      style={[styles.listenFullBtn, { backgroundColor: read[art.id] ? colors.primary : colors.surface1 }]}
                    >
                      <Ionicons name={read[art.id] ? 'checkmark' : 'checkmark-done-outline'} size={16} color={read[art.id] ? colors.onPrimary : colors.primary} />
                      <Text style={[typography.captionBold, { color: read[art.id] ? colors.onPrimary : colors.primary, marginLeft: 6 }]}>
                        {read[art.id] ? 'Read' : 'Mark as read'}
                      </Text>
                    </PressableScale>
                  </View>

                  {art.seekHelp ? (
                    <View style={[styles.help, { backgroundColor: colors.warningSurface, marginTop: spacing.md }]}>
                      <Ionicons name="medkit-outline" size={18} color={colors.warning} />
                      <Text style={[typography.subbody, styles.flex, { color: colors.text.primary, marginLeft: 8 }]}>
                        {art.seekHelp}
                      </Text>
                    </View>
                  ) : null}
                </Animated.View>
              ) : null}
            </View>
          </Card>
        );
      })}
      <ImageViewer
        source={viewer?.source ?? null}
        origin={viewer?.origin ?? null}
        caption={viewer?.caption}
        onClose={() => setViewer(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryChip: { borderRadius: 999 },
  chips: { flexGrow: 0, marginBottom: 8 },
  libraryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16 },
  progressRow: { gap: 6 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  badgeOverlay: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  cardImage: { height: '100%', width: '100%' },
  flex: { flex: 1 },
  help: { alignItems: 'flex-start', borderRadius: 12, flexDirection: 'row', padding: 12 },
  imageWrap: {
    height: 145,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  listenFullBtn: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  pillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  readPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  titleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  voicePill: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
