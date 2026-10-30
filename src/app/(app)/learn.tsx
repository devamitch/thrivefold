import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { AppHeader } from '../../components/ui/AppHeader';
import { Chip } from '../../components/ui/Chip';
import { PressableScale } from '../../components/ui/PressableScale';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextField } from '../../components/ui/TextField';
import { articlesFor, type Article } from '../../content/learn';
import { onlineLibrary, SOURCE_LABEL } from '../../services/learn/onlineLibrary';
import { readerHref } from '../../services/learn/reader';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { getArticleIllustration } from '../../utils/illustrationResolver';

const articleHref = (id: string) => `/(app)/learn-article?id=${id}` as Href;
const libraryHref = (q?: string) => (q ? (`/(app)/learn-library?${new URLSearchParams({ q }).toString()}` as Href) : ('/(app)/learn-library' as Href));

/**
 * Learn hub: one search over the built-in lessons and the online library, a "continue" rail of
 * unread lessons, saved library reading, topics and the full lesson list. Lessons open in their
 * own screen; library items open in the in-app reader.
 */
export default function LearnScreen() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { colors, typography, spacing, experience } = useTheme();
  const all = useMemo(() => articlesFor(experience), [experience]);
  const read = useRootStore((s) => s.learnRead);
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const categories = useMemo(() => [...new Set(all.map((a) => a.category))], [all]);
  const unread = useMemo(() => all.filter((a) => !read[a.id]), [all, read]);
  const saved = useMemo(() => onlineLibrary.cached(undefined, 8), []);
  const readCount = all.length - unread.length;

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const list = useMemo(
    () =>
      all
        .filter((a) => searching || !category || a.category === category)
        .filter((a) => !q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.body.some((p) => p.toLowerCase().includes(q))),
    [all, category, q, searching],
  );

  return (
    <ScreenContainer header={<AppHeader title="Learn" subtitle="Plain-language health, read or listen" showBack />} scrollMode="shell-scroll-view">
      <TextField
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => q.length > 1 && !list.length && router.push(libraryHref(query.trim()))}
        placeholder="Search lessons, books and articles"
        returnKeyType="search"
        accessibilityLabel="Search Learn"
        leftIcon={<Ionicons name="search" size={18} color={colors.text.muted} />}
        rightIcon={
          query ? (
            <PressableScale onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.text.muted} />
            </PressableScale>
          ) : undefined
        }
        containerStyle={{ marginBottom: spacing.md }}
      />

      {!searching ? (
        <>
          {/* Progress: only lessons marked read (or listened to the end) count. */}
          <View style={[styles.progressCard, { backgroundColor: colors.surface, marginBottom: spacing.lg }]}>
            <View style={styles.flex}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                {readCount === all.length ? 'All lessons read' : `${readCount} of ${all.length} lessons read`}
              </Text>
              <View style={[styles.track, { backgroundColor: colors.surface2, marginTop: 8 }]}>
                <View style={[styles.fill, { backgroundColor: colors.primary, width: `${all.length ? (readCount / all.length) * 100 : 0}%` }]} />
              </View>
            </View>
            <Ionicons name="school-outline" size={28} color={colors.primary} />
          </View>

          {unread.length ? (
            <Section title={readCount ? 'Continue' : 'Start here'}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
                {unread.slice(0, 6).map((a) => (
                  <PressableScale key={a.id} onPress={() => router.push(articleHref(a.id))} style={styles.railCard} accessibilityRole="link" accessibilityLabel={a.title}>
                    <Image source={getArticleIllustration(a.id, experience)} style={styles.railImage} contentFit="cover" transition={150} />
                    <Text style={[typography.captionBold, { color: colors.primary, marginTop: 8 }]}>{a.category.toUpperCase()}</Text>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]} numberOfLines={2}>
                      {a.title}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.muted }]}>{a.minutes} min</Text>
                  </PressableScale>
                ))}
              </ScrollView>
            </Section>
          ) : null}

          <Section title="Library" action="Explore" onAction={() => router.push(libraryHref())}>
            {saved.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
                {saved.map((i) => (
                  <PressableScale
                    key={i.id}
                    onPress={() => router.push(readerHref(i.url, i.title))}
                    style={[styles.bookCard, { backgroundColor: colors.surface }]}
                    accessibilityRole="link"
                    accessibilityLabel={i.title}
                  >
                    {i.image ? (
                      <Image source={{ uri: i.image }} style={styles.bookImage} contentFit="cover" />
                    ) : (
                      <View style={[styles.bookImage, styles.center, { backgroundColor: colors.surface2 }]}>
                        <Ionicons name="book-outline" size={24} color={colors.text.secondary} />
                      </View>
                    )}
                    <Text style={[typography.caption, { color: colors.primary, marginTop: 6 }]}>{SOURCE_LABEL[i.source]}</Text>
                    <Text style={[typography.captionBold, { color: colors.text.primary }]} numberOfLines={2}>
                      {i.title}
                    </Text>
                  </PressableScale>
                ))}
              </ScrollView>
            ) : (
              <PressableScale onPress={() => router.push(libraryHref())} style={[styles.linkCard, { backgroundColor: colors.surface }]} accessibilityRole="link">
                <Ionicons name="library-outline" size={22} color={colors.primary} />
                <Text style={[typography.body, styles.flex, { color: colors.text.secondary }]}>
                  Encyclopedia articles, books and free e-books on your topics, saved for offline reading.
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
              </PressableScale>
            )}
          </Section>
        </>
      ) : null}

      <Section title={searching ? `Lessons matching “${query.trim()}”` : 'All lessons'}>
        {!searching ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} keyboardShouldPersistTaps="handled">
            <Chip label="All" selected={!category} onPress={() => setCategory(null)} />
            {categories.map((c) => (
              <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(category === c ? null : c)} />
            ))}
          </ScrollView>
        ) : null}
        {list.map((a, i) => (
          <Animated.View key={a.id} entering={reduce ? undefined : FadeInDown.delay(Math.min(i, 6) * 40).duration(220)}>
            <LessonRow article={a} read={!!read[a.id]} onPress={() => router.push(articleHref(a.id))} />
          </Animated.View>
        ))}
        {searching && !list.length ? (
          <Text style={[typography.body, { color: colors.text.secondary, marginBottom: spacing.sm }]}>No built-in lesson matches.</Text>
        ) : null}
        {searching && q.length > 1 ? (
          <PressableScale onPress={() => router.push(libraryHref(query.trim()))} style={[styles.linkCard, { backgroundColor: colors.surface, marginTop: spacing.sm }]} accessibilityRole="link">
            <Ionicons name="search" size={20} color={colors.primary} />
            <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>Search books and articles for “{query.trim()}”</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </PressableScale>
        ) : null}
      </Section>

      <Text style={[typography.caption, { color: colors.text.muted, marginBottom: spacing.lg }]}>
        General information based on public health guidance (NHS, WHO, CDC). Not medical advice and not a diagnosis.
      </Text>
    </ScreenContainer>
  );
}

function Section({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={[styles.sectionHead, { marginBottom: spacing.sm }]}>
        <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>{title}</Text>
        {action && onAction ? (
          <PressableScale onPress={onAction} hitSlop={10} accessibilityRole="link">
            <Text style={[typography.captionBold, { color: colors.primary }]}>{action}</Text>
          </PressableScale>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function LessonRow({ article, read, onPress }: { article: Article; read: boolean; onPress: () => void }) {
  const { colors, typography, experience } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.surface }]}
      accessibilityRole="link"
      accessibilityLabel={`${article.title}${read ? ', read' : ''}`}
    >
      <Image source={getArticleIllustration(article.id, experience)} style={styles.rowImage} contentFit="cover" transition={150} />
      <View style={styles.flex}>
        <Text style={[typography.captionBold, { color: colors.primary }]}>{article.category}</Text>
        <Text style={[typography.bodyBold, { color: colors.text.primary }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={[typography.caption, { color: colors.text.muted }]}>{article.minutes} min</Text>
      </View>
      {read ? <Ionicons name="checkmark-circle" size={22} color={colors.success} /> : <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  progressCard: { flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 18, padding: 16 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  sectionHead: { flexDirection: 'row', alignItems: 'center' },
  rail: { gap: 12, paddingRight: 8 },
  railCard: { width: 220 },
  railImage: { width: 220, height: 130, borderRadius: 16 },
  bookCard: { width: 132, borderRadius: 14, padding: 8 },
  bookImage: { width: 116, height: 116, borderRadius: 10 },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 14 },
  chips: { flexGrow: 0, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 10, marginBottom: 10 },
  rowImage: { width: 72, height: 72, borderRadius: 12 },
});
