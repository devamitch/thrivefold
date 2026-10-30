import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewInstance } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { AppHeader } from '../../components/ui/AppHeader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
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
  const articles = articlesFor(experience);
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
    void speakCoachLine(introText, { onEnd: () => setSpeakingId((cur) => (cur === art.id ? null : cur)) });
  }, [speakingId]);

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
