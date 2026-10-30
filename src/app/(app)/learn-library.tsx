import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

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
import { SOURCE_LABEL, useLibraryQuery, type LibraryItem, type LibrarySource } from '../../services/learn/onlineLibrary';
import { useTheme } from '../../theme/useTheme';

const SOURCES: (LibrarySource | 'all')[] = ['all', 'wikipedia', 'openlibrary', 'gutenberg', 'archive'];

/**
 * The online part of Learn: encyclopedia summaries, books, free e-books and archive texts for the
 * person's topics, found through free public APIs, kept on the phone for offline reading, and
 * readable aloud or explainable by the coach. Only topic words go online.
 */
export default function LearnLibraryScreen() {
  const { colors, typography, spacing, experience } = useTheme();
  const router = useRouter();
  const coach = useCoach();
  // Topics come from this experience's Learn categories, so they follow the person's space.
  const topics = useMemo(() => [...new Set(articlesFor(experience).map((a) => a.category))], [experience]);
  const [topic, setTopic] = useState(topics[0] ?? 'Sleep');
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<LibrarySource | 'all'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const library = useLibraryQuery(topic);
  const items = useMemo(() => library.data ?? [], [library.data]);
  const loading = library.isFetching;
  const load = (t: string) => setTopic(t);

  useEffect(() => () => stopCoachSpeech(), []);

  const shown = useMemo(() => (source === 'all' ? items : items.filter((i) => i.source === source)), [items, source]);

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
                source={{ uri: item.image, headers: { 'User-Agent': 'ThrivefoldApp/1.0 (Android wellbeing app; com.amit.thrivefold)' } }}
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
              <Action icon={speaking === item.id ? 'stop-circle' : 'volume-high-outline'} label={speaking === item.id ? 'Stop' : 'Read aloud'} onPress={() => readAloud(item)} />
              <Action icon="chatbubble-ellipses-outline" label="Ask Anvay" onPress={() => coach.ask(`Explain "${item.title}" simply and how it relates to my health.`)} />
              <Action icon="open-outline" label="Open source" onPress={() => void Linking.openURL(item.url)} />
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

  return (
    <ScreenContainer header={<AppHeader title="Library" subtitle="Articles, books and free e-books" showBack />} scrollMode="none">
      <View style={styles.flex}>
        <TextField
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => query.trim() && load(query.trim())}
          placeholder="Search any topic"
          returnKeyType="search"
          accessibilityLabel="Search the library"
          leftIcon={<Ionicons name="search" size={18} color={colors.text.muted} />}
          containerStyle={{ marginBottom: spacing.sm }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} keyboardShouldPersistTaps="handled">
          {topics.map((t) => (
            <Chip key={t} label={t} selected={topic === t} onPress={() => load(t)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {SOURCES.map((s) => (
            <Chip key={s} label={s === 'all' ? 'All sources' : SOURCE_LABEL[s]} selected={source === s} onPress={() => setSource(s)} />
          ))}
        </ScrollView>
        {loading && !shown.length ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : null}
        {!loading && !shown.length ? (
          <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.lg }]}>
            Nothing saved for “{topic}” yet. Connect to the internet once and it stays here for offline reading.
          </Text>
        ) : null}
        <FlashList
          data={shown}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          extraData={[open, speaking]}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          ListFooterComponent={
            shown.length ? (
              <Text style={[typography.caption, { color: colors.text.muted, textAlign: 'center', marginTop: spacing.sm }]}>
                From Wikipedia, Open Library, Project Gutenberg and the Internet Archive. Saved on this phone.
              </Text>
            ) : null
          }
        />
      </View>
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
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  action: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
});
