import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useCoach } from '../../components/assistant/CoachProvider';
import { AppHeader } from '../../components/ui/AppHeader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { PressableScale } from '../../components/ui/PressableScale';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextField } from '../../components/ui/TextField';
import { articlesFor } from '../../content/learn';
import { speakCoachLine, stopCoachSpeech } from '../../services/ai/coachVoiceService';
import { readerHref } from '../../services/learn/reader';
import { SOURCE_LABEL, useLibraryQueries, type LibraryItem, type LibrarySource } from '../../services/learn/onlineLibrary';
import { useTheme } from '../../theme/useTheme';

const SOURCES: (LibrarySource | 'all')[] = ['all', 'wikipedia', 'openlibrary', 'gutenberg', 'archive'];
const UA = 'ThrivefoldApp/1.0 (Android wellbeing app; com.amit.thrivefold)';

/**
 * The online part of Learn: encyclopedia summaries, books, free e-books and archive texts for the
 * person's topics (or any search), from free public APIs, one query per source so results appear
 * as each source answers. Saved on the phone for offline reading; everything opens in the in-app
 * reader. Only topic words go online.
 */
export default function LearnLibraryScreen() {
  const { colors, typography, spacing, experience } = useTheme();
  const router = useRouter();
  const coach = useCoach();
  const params = useLocalSearchParams<{ q?: string }>();
  const topics = useMemo(() => [...new Set(articlesFor(experience).map((a) => a.category))], [experience]);
  const [topic, setTopic] = useState(params.q?.trim() || topics[0] || 'Sleep');
  const [query, setQuery] = useState(params.q ?? '');
  const [source, setSource] = useState<LibrarySource | 'all'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const library = useLibraryQueries(topic);

  useEffect(() => () => stopCoachSpeech(), []);

  const search = () => {
    const t = query.trim();
    if (t.length < 2) return;
    Keyboard.dismiss();
    setOpen(null);
    setTopic(t);
  };
  const pickTopic = (t: string) => {
    setQuery('');
    setOpen(null);
    setTopic(t);
  };

  const shown = useMemo(
    () => (source === 'all' ? library.items : library.items.filter((i) => i.source === source)),
    [library.items, source],
  );

  const readAloud = (i: LibraryItem) => {
    if (speaking === i.id) {
      stopCoachSpeech();
      setSpeaking(null);
      return;
    }
    setSpeaking(i.id);
    void speakCoachLine(`${i.title}. ${i.summary}`, { onEnd: () => setSpeaking((c) => (c === i.id ? null : c)) });
  };

  const renderItem = useCallback(
    ({ item }: { item: LibraryItem }) => {
      const expanded = open === item.id;
      return (
        <Card onPress={() => setOpen(expanded ? null : item.id)} style={[styles.card, { marginBottom: spacing.md }]}>
          <View style={styles.row}>
            {item.image ? (
              <Image
                source={{ uri: item.image, headers: { 'User-Agent': UA } }}
                style={[styles.thumb, { backgroundColor: colors.surface2 }]}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View style={[styles.thumb, styles.thumbIcon, { backgroundColor: colors.surface2 }]}>
                <Ionicons name={item.source === 'wikipedia' ? 'globe-outline' : 'book-outline'} size={24} color={colors.text.secondary} />
              </View>
            )}
            <View style={styles.flex}>
              <Badge label={SOURCE_LABEL[item.source]} variant="primary" />
              <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 4 }]} numberOfLines={2}>
                {item.title}
              </Text>
              {item.byline ? (
                <Text style={[typography.caption, { color: colors.text.muted }]} numberOfLines={1}>
                  {item.byline}
                </Text>
              ) : null}
            </View>
          </View>
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.sm }]} numberOfLines={expanded ? undefined : 3}>
            {item.summary}
          </Text>
          {expanded ? (
            <View style={styles.actions}>
              <Action icon="reader-outline" label="Read" onPress={() => router.push(readerHref(item.url, item.title))} />
              <Action icon={speaking === item.id ? 'stop-circle' : 'volume-high-outline'} label={speaking === item.id ? 'Stop' : 'Listen'} onPress={() => readAloud(item)} />
              <Action icon="chatbubble-ellipses-outline" label="Ask Anvay" onPress={() => coach.ask(`Explain "${item.title}" simply and how it relates to my health.`)} />
              <Action
                icon="logo-youtube"
                label="Videos"
                onPress={() => router.push(`/(app)/watch?${new URLSearchParams({ title: item.title, q: item.title }).toString()}` as Href)}
              />
            </View>
          ) : null}
        </Card>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, speaking, colors, typography, spacing],
  );

  const pending = library.pendingSources.map((s) => SOURCE_LABEL[s]).join(', ');

  return (
    <ScreenContainer header={<AppHeader title="Library" subtitle="Articles, books and free e-books" showBack />} scrollMode="none">
      <FlashList
        data={shown}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        extraData={[open, speaking]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View>
            <TextField
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={search}
              placeholder="Search any topic"
              returnKeyType="search"
              accessibilityLabel="Search the library"
              leftIcon={<Ionicons name="search" size={18} color={colors.text.muted} />}
              rightIcon={
                query ? (
                  <PressableScale onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
                    <Ionicons name="close-circle" size={18} color={colors.text.muted} />
                  </PressableScale>
                ) : undefined
              }
              containerStyle={{ marginBottom: spacing.sm }}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} keyboardShouldPersistTaps="handled">
              {!topics.includes(topic) ? <Chip label={topic} selected onPress={() => undefined} /> : null}
              {topics.map((t) => (
                <Chip key={t} label={t} selected={topic === t} onPress={() => pickTopic(t)} />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} keyboardShouldPersistTaps="handled">
              {SOURCES.map((s) => (
                <Chip key={s} label={s === 'all' ? 'All sources' : SOURCE_LABEL[s]} selected={source === s} onPress={() => setSource(s)} />
              ))}
            </ScrollView>
            {library.loading ? (
              <View style={[styles.loadingRow, { marginBottom: spacing.sm }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[typography.caption, { color: colors.text.secondary }]}>Searching {pending || 'sources'}…</Text>
              </View>
            ) : null}
            {!library.loading && !shown.length ? (
              <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center', marginVertical: spacing.lg }]}>
                Nothing found for “{topic}”. Try other words, or connect to the internet once; results stay here for offline reading.
              </Text>
            ) : null}
          </View>
        }
        ListFooterComponent={
          shown.length ? (
            <Text style={[typography.caption, { color: colors.text.muted, textAlign: 'center', marginTop: spacing.sm }]}>
              From Wikipedia, Open Library, Project Gutenberg and the Internet Archive. Saved on this phone.
            </Text>
          ) : null
        }
      />
    </ScreenContainer>
  );
}

function Action({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const { colors, typography } = useTheme();
  return (
    <PressableScale onPress={onPress} style={[styles.action, { backgroundColor: colors.surface1 }]} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 6 }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { padding: 14 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  thumb: { width: 64, height: 64, borderRadius: 12 },
  thumbIcon: { alignItems: 'center', justifyContent: 'center' },
  chips: { flexGrow: 0, marginBottom: 6 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  action: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
});
