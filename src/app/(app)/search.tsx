import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MediaPipeTools, cosine } from '../../../modules/pose-landmarker/tools';
import { PressableScale } from '../../components/ui/PressableScale';
import { parseCommand } from '../../domain/assistant/commands';
import { DESTINATIONS, keywordScore, type Destination } from '../../domain/search/destinations';
import { askLocal } from '../../services/ai/localModel';
import { runCommand } from '../../services/assistant/runCommand';
import { searchJournal } from '../../services/journal/semanticSearch';
import { useVoiceInput } from '../../services/voice/useVoiceInput';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

type Result = { kind: 'screen'; d: Destination; score: number } | { kind: 'record'; title: string; sub: string; route: string; icon: string; score: number };

let destVecs: number[][] | null = null;

/**
 * Global search: type or say anything. Screens are matched by words and by meaning (on-device
 * text embedder); your own records (journal, medicines, meals, plans) are searched on the phone;
 * the on-device language model, when downloaded, adds a short answer. Commands run directly.
 */
export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<TextInput>(null);
  const store = useRootStore;
  const voice = useVoiceInput((text) => {
    setQ(text);
    void run(text);
  });

  const quick = useMemo(() => (q.trim() ? DESTINATIONS.map((d) => ({ d, s: keywordScore(q, d) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 6) : []), [q]);

  const run = async (text: string) => {
    const query = text.trim();
    if (!query) return;
    setBusy(true);
    setAnswer(null);
    const s = store.getState();
    const out: Result[] = [];
    // Screens: words + meaning.
    let sem: number[] = DESTINATIONS.map(() => 0);
    try {
      if (MediaPipeTools) {
        destVecs ??= await MediaPipeTools.embedText(DESTINATIONS.map((d) => `${d.title}. ${d.description}`));
        const [qv] = await MediaPipeTools.embedText([query]);
        sem = destVecs.map((v) => cosine(qv, v));
      }
    } catch {
      sem = DESTINATIONS.map(() => 0);
    }
    DESTINATIONS.forEach((d, i) => {
      const score = keywordScore(query, d) + Math.max(0, sem[i] - 0.25) * 2;
      if (score > 0.25) out.push({ kind: 'screen', d, score });
    });
    // Your records.
    const lower = query.toLowerCase();
    s.medications.filter((m) => m.name.toLowerCase().includes(lower)).forEach((m) =>
      out.push({ kind: 'record', title: m.name, sub: `Medicine · ${m.time}${m.dose ? ` · ${m.dose}` : ''}`, route: '/(app)/health/medications', icon: 'medkit-outline', score: 1.5 }),
    );
    s.mealLogs
      .filter((m) => JSON.stringify(m).toLowerCase().includes(lower))
      .slice(0, 3)
      .forEach((m) => out.push({ kind: 'record', title: `Meal on ${m.date}`, sub: 'Meal log', route: '/(app)/health/nutrition', icon: 'restaurant-outline', score: 1.2 }));
    try {
      (await searchJournal(query, s.journalEntries, 3)).forEach((r) =>
        out.push({ kind: 'record', title: r.entry.title, sub: `Journal · ${new Date(r.entry.createdAt).toLocaleDateString()}`, route: `/(app)/journal/${r.entry.id}`, icon: 'book-outline', score: 1 + r.score }),
      );
    } catch {
      // journal search is optional
    }
    setResults(out.sort((a, b) => b.score - a.score).slice(0, 12));

    // Commands answer directly; anything else gets a short answer from the local model if present.
    const cmd = parseCommand(query);
    if (cmd.kind !== 'unknown' && cmd.kind !== 'open') {
      const r = await runCommand(cmd);
      setAnswer(r.text);
      if (r.route) router.push(r.route as Href);
    } else if (cmd.kind === 'unknown') {
      const top = out.slice(0, 3).map((r) => (r.kind === 'screen' ? r.d.title : r.title)).join(', ');
      const a = await askLocal(
        query,
        'You are Thrive, a brief wellbeing coach inside a health app. Answer in at most two sentences. If one of the listed app screens helps, name it. Never diagnose.',
        top ? `Relevant app screens: ${top}` : undefined,
      );
      setAnswer(a);
    }
    setBusy(false);
  };

  const open = (route: string) => router.push(route as Href);
  const list: Result[] = results.length ? results : quick.map((x) => ({ kind: 'screen' as const, d: x.d, score: x.s }));

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + 8 }]}>
      <View style={[styles.bar, { marginHorizontal: spacing.base, backgroundColor: colors.surface }]}>
        <PressableScale onPress={() => router.back()} accessibilityLabel="Back" style={styles.icon}>
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </PressableScale>
        <TextInput
          ref={input}
          autoFocus
          value={q}
          onChangeText={(t) => {
            setQ(t);
            setResults([]);
            setAnswer(null);
          }}
          onSubmitEditing={() => void run(q)}
          returnKeyType="search"
          placeholder="Search or ask anything"
          placeholderTextColor={colors.text.muted}
          style={[typography.body, styles.input, { color: colors.text.primary }]}
          accessibilityLabel="Search Thrivefold"
        />
        <PressableScale
          onPress={() => (voice.state === 'listening' ? voice.stop() : void voice.start())}
          accessibilityLabel={voice.state === 'listening' ? 'Stop listening' : 'Search by voice'}
          style={[styles.icon, voice.state === 'listening' && { backgroundColor: colors.primary }]}
        >
          <Ionicons name={voice.state === 'listening' ? 'stop' : 'mic-outline'} size={20} color={voice.state === 'listening' ? colors.text.inverse : colors.text.primary} />
        </PressableScale>
      </View>

      <View style={{ paddingHorizontal: spacing.base, flex: 1 }}>
        {busy ? <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} /> : null}
        {answer ? (
          <View style={[styles.answer, { backgroundColor: colors.primaryAlpha }]}>
            <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
            <Text style={[typography.subbody, styles.flex, { color: colors.text.primary }]}>{answer}</Text>
          </View>
        ) : null}
        {list.map((r, i) => (
          <PressableScale
            key={`${r.kind}-${i}`}
            onPress={() => open(r.kind === 'screen' ? r.d.route : r.route)}
            style={[styles.row, { borderBottomColor: colors.surface1 }]}
            accessibilityLabel={r.kind === 'screen' ? r.d.title : r.title}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.surface1 }]}>
              <Ionicons name={(r.kind === 'screen' ? r.d.icon : r.icon) as keyof typeof Ionicons.glyphMap} size={18} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{r.kind === 'screen' ? r.d.title : r.title}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]} numberOfLines={1}>
                {r.kind === 'screen' ? r.d.description : r.sub}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
          </PressableScale>
        ))}
        {!q.trim() ? (
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 16 }]}>
            Try &quot;eye games&quot;, &quot;scan a prescription&quot;, &quot;I feel stressed&quot;, &quot;log two glasses of water&quot; or tap the mic. Search runs on this
            phone.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', borderRadius: 22, paddingHorizontal: 6, height: 52 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, paddingHorizontal: 6 },
  answer: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 14, marginTop: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
