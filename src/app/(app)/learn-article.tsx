import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { useCoach } from '../../components/assistant/CoachProvider';
import { AppHeader } from '../../components/ui/AppHeader';
import { Badge } from '../../components/ui/Badge';
import { PressableScale } from '../../components/ui/PressableScale';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ARTICLES, articlesFor } from '../../content/learn';
import { speakCoachLine, stopCoachSpeech } from '../../services/ai/coachVoiceService';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { getArticleIllustration } from '../../utils/illustrationResolver';

/** One Learn article: read, listen, ask the coach, mark read, watch videos, related reading. */
export default function LearnArticleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const coach = useCoach();
  const reduce = useReducedMotion();
  const { colors, typography, spacing, experience } = useTheme();
  const art = ARTICLES.find((a) => a.id === id);
  const read = useRootStore((s) => (art ? !!s.learnRead[art.id] : false));
  const setRead = useRootStore((s) => s.setLearnRead);
  const [speaking, setSpeaking] = useState(false);

  const related = useMemo(
    () => (art ? articlesFor(experience).filter((a) => a.id !== art.id && a.category === art.category).slice(0, 3) : []),
    [art, experience],
  );

  useEffect(() => () => stopCoachSpeech(), []);

  if (!art) {
    return (
      <ScreenContainer header={<AppHeader title="Learn" showBack />} scrollMode="shell-scroll-view">
        <Text style={[typography.body, { color: colors.text.secondary }]}>This article is no longer available.</Text>
      </ScreenContainer>
    );
  }

  const listen = () => {
    if (speaking) {
      stopCoachSpeech();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    void speakCoachLine(`${art.title}. ${art.body.join(' ')}`, {
      onEnd: () => {
        setSpeaking(false);
        setRead(art.id, true);
      },
    });
  };

  return (
    <ScreenContainer header={<AppHeader title={art.category} showBack compact />} scrollMode="shell-scroll-view">
      <Image source={getArticleIllustration(art.id, experience)} style={styles.hero} contentFit="cover" transition={150} accessibilityIgnoresInvertColors />
      <Animated.View entering={reduce ? undefined : FadeInDown.duration(260)}>
        <View style={[styles.meta, { marginTop: spacing.md }]}>
          <Badge label={art.category} variant="primary" />
          <Text style={[typography.caption, { color: colors.text.muted }]}>{art.minutes} min read</Text>
          {read ? (
            <View style={styles.readTag}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={[typography.caption, { color: colors.success }]}>Read</Text>
            </View>
          ) : null}
        </View>
        <Text style={[typography.heading, { color: colors.text.primary, marginTop: spacing.sm }]}>{art.title}</Text>

        <View style={[styles.toolbar, { marginTop: spacing.md }]}>
          <Tool icon={speaking ? 'stop-circle' : 'volume-high-outline'} label={speaking ? 'Stop' : 'Listen'} onPress={listen} active={speaking} />
          <Tool icon="chatbubble-ellipses-outline" label="Ask Anvay" onPress={() => coach.ask(`Explain the Learn article "${art.title}" simply, and what I can do about it.`)} />
          <Tool
            icon="logo-youtube"
            label="Videos"
            onPress={() => router.push(`/(app)/watch?${new URLSearchParams({ title: art.title, q: art.videoQuery }).toString()}` as Href)}
          />
          <Tool
            icon="library-outline"
            label="More"
            onPress={() => router.push(`/(app)/learn-library?${new URLSearchParams({ q: art.category }).toString()}` as Href)}
          />
        </View>

        {art.body.map((p, i) => (
          <Text key={i} style={[typography.body, styles.para, { color: colors.text.primary, marginTop: spacing.md }]}>
            {p}
          </Text>
        ))}

        {art.seekHelp ? (
          <View style={[styles.help, { backgroundColor: colors.warningSurface, marginTop: spacing.lg }]}>
            <Ionicons name="medkit-outline" size={18} color={colors.warning} />
            <Text style={[typography.subbody, styles.flex, { color: colors.text.primary }]}>{art.seekHelp}</Text>
          </View>
        ) : null}

        <PressableScale
          onPress={() => setRead(art.id, !read)}
          accessibilityRole="button"
          accessibilityState={{ checked: read }}
          style={[styles.readBtn, { backgroundColor: read ? colors.surface1 : colors.primary, marginTop: spacing.lg }]}
        >
          <Ionicons name={read ? 'refresh' : 'checkmark'} size={18} color={read ? colors.primary : colors.onPrimary} />
          <Text style={[typography.bodyBold, { color: read ? colors.primary : colors.onPrimary }]}>{read ? 'Mark as unread' : 'Mark as read'}</Text>
        </PressableScale>

        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>
          General information based on public health guidance (NHS, WHO, CDC). Not medical advice and not a diagnosis.
        </Text>

        {related.length ? (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>Related</Text>
            {related.map((r) => (
              <PressableScale
                key={r.id}
                onPress={() => router.replace(`/(app)/learn-article?id=${r.id}` as Href)}
                style={[styles.related, { backgroundColor: colors.surface }]}
                accessibilityRole="link"
              >
                <Image source={getArticleIllustration(r.id, experience)} style={styles.relatedThumb} contentFit="cover" />
                <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]} numberOfLines={2}>
                  {r.title}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
              </PressableScale>
            ))}
          </View>
        ) : null}
      </Animated.View>
    </ScreenContainer>
  );
}

function Tool({ icon, label, onPress, active }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; active?: boolean }) {
  const { colors, typography } = useTheme();
  return (
    <PressableScale onPress={onPress} style={styles.tool} accessibilityRole="button" accessibilityLabel={label}>
      <View style={[styles.toolIcon, { backgroundColor: active ? colors.primary : colors.surface1 }]}>
        <Ionicons name={icon} size={20} color={active ? colors.onPrimary : colors.primary} />
      </View>
      <Text style={[typography.caption, { color: colors.text.secondary }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { width: '100%', aspectRatio: 16 / 9, borderRadius: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  readTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between' },
  tool: { alignItems: 'center', gap: 6, minWidth: 68 },
  toolIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  para: { lineHeight: 26 },
  help: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderRadius: 14, padding: 14 },
  readBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14 },
  related: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 10, marginBottom: 8 },
  relatedThumb: { width: 56, height: 56, borderRadius: 10 },
});
