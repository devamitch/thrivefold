import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { TextField } from '../../../components/ui/TextField';
import { hapticSuccess } from '../../../services/haptics';
import { memoryStore } from '../../../services/local-ai/memory/memoryStore';
import type { UserMemory } from '../../../services/local-ai/memory/types';
import { answerWithHybridRag } from '../../../services/local-ai/rag/hybridRagPipeline';
import { knowledgeStore, type KnowledgeDocument } from '../../../services/local-ai/rag/knowledgeStore';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const USER = 'local_user';

const when = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * What Thrive Coach remembers, all on this phone: things you taught it (by voice, "remember
 * that…", or here), answers it learned from the cloud coach, and documents you saved. You can
 * test it with a question, delete anything, or clear it all.
 */
export default function MemoriesScreen() {
  const { colors, typography, spacing } = useTheme();
  const showAlert = useRootStore((s) => s.showAlert);
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<{ text: string; sources: string[] } | null>(null);
  const [asking, setAsking] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [m, d] = await Promise.all([
        memoryStore.listMemories(USER, { status: 'active' }),
        knowledgeStore.listDocuments(USER),
      ]);
      setMemories(m);
      setDocs(d);
    } catch {
      setError('The memory store could not be opened on this phone.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remember = async () => {
    const text = draft.trim();
    if (text.length < 3) return;
    await memoryStore.addMemory({
      userId: USER,
      kind: 'fact',
      content: text.slice(0, 300),
      sourceEventIds: [`typed_${Date.now()}`],
      confidence: 1,
      origin: 'user_declared',
      status: 'active',
      metadata: { source: 'memories_screen', tag: 'remembered' },
    });
    hapticSuccess();
    setDraft('');
    void load();
  };

  const ask = async () => {
    const q = question.trim();
    if (q.length < 3) return;
    setAsking(true);
    try {
      const r = await answerWithHybridRag(USER, q);
      setAnswer({ text: r.answer, sources: r.isGrounded ? r.citations : [] });
    } catch {
      setAnswer({ text: 'Searching your memory failed. Try again.', sources: [] });
    } finally {
      setAsking(false);
    }
  };

  const forgetMemory = (m: UserMemory) =>
    showAlert({
      title: 'Forget this?',
      message: m.content,
      confirmText: 'Forget',
      cancelText: 'Keep',
      destructive: true,
      onConfirm: () => void memoryStore.deleteMemory(m.id, USER).then(load),
    });

  const forgetDoc = (d: KnowledgeDocument) =>
    showAlert({
      title: 'Delete this?',
      message: d.title,
      confirmText: 'Delete',
      cancelText: 'Keep',
      destructive: true,
      onConfirm: () => void knowledgeStore.deleteDocument(USER, d.id).then(load),
    });

  const clearAll = () =>
    showAlert({
      title: 'Clear everything Thrive remembers?',
      message: 'Memories, learned answers and saved documents are deleted from this phone. Your health records stay.',
      confirmText: 'Clear all',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: () =>
        void Promise.all([memoryStore.clearAllMemories(USER), knowledgeStore.clearAllDocuments(USER)]).then(load),
    });

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="THRIVE COACH"
          title="What Thrive remembers"
          subtitle="Kept on this phone. Nothing is uploaded."
          showBack
        />
      }
    >
      <Card style={styles.card}>
        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Teach Thrive</Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
          Or say &quot;remember that…&quot; to the coach. It uses these when it answers you.
        </Text>
        <TextField
          value={draft}
          onChangeText={setDraft}
          placeholder="e.g. I train at 7 am and avoid dairy"
          maxLength={300}
          containerStyle={{ marginTop: spacing.sm }}
          onSubmitEditing={() => void remember()}
          returnKeyType="done"
        />
        <Button
          label="Remember this"
          size="sm"
          disabled={draft.trim().length < 3}
          onPress={() => void remember()}
          style={styles.inlineBtn}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Ask your memory</Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
          Answers come only from what is saved here, with the source shown.
        </Text>
        <TextField
          value={question}
          onChangeText={setQuestion}
          placeholder="e.g. When do I train?"
          containerStyle={{ marginTop: spacing.sm }}
          onSubmitEditing={() => void ask()}
          returnKeyType="search"
        />
        <Button
          label="Search"
          size="sm"
          variant="outline"
          loading={asking}
          disabled={question.trim().length < 3}
          onPress={() => void ask()}
          style={styles.inlineBtn}
        />
        {answer ? (
          <View style={[styles.answer, { backgroundColor: colors.surface2 }]}>
            <Text style={[typography.body, { color: colors.text.primary }]}>{answer.text}</Text>
            {answer.sources.map((s) => (
              <Text key={s} style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
                {s}
              </Text>
            ))}
          </View>
        ) : null}
      </Card>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} /> : null}
      {error ? <Text style={[typography.body, { color: colors.error, marginTop: spacing.md }]}>{error}</Text> : null}

      {!loading && !error ? (
        <>
          <Text style={[typography.captionBold, styles.section, { color: colors.text.muted }]}>
            REMEMBERED · {memories.length}
          </Text>
          {memories.length ? (
            memories.map((m) => (
              <Card key={m.id} style={styles.row}>
                <View style={styles.flex}>
                  <Text style={[typography.body, { color: colors.text.primary }]}>{m.content}</Text>
                  <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                    {m.origin === 'user_declared' ? 'You told Thrive' : 'Noticed by Thrive'} · {when(m.updatedAt)}
                  </Text>
                </View>
                <PressableScale onPress={() => forgetMemory(m)} hitSlop={10} accessibilityLabel="Forget this">
                  <Ionicons name="trash-outline" size={18} color={colors.text.muted} />
                </PressableScale>
              </Card>
            ))
          ) : (
            <Text style={[typography.body, { color: colors.text.secondary }]}>
              Nothing yet. Teach Thrive something above.
            </Text>
          )}

          <Text style={[typography.captionBold, styles.section, { color: colors.text.muted }]}>
            LEARNED ANSWERS AND DOCUMENTS · {docs.length}
          </Text>
          {docs.length ? (
            docs.map((d) => (
              <Card key={d.id} style={styles.row}>
                <Ionicons
                  name={d.metadata?.source === 'cloud_coach' ? 'bulb-outline' : 'document-text-outline'}
                  size={18}
                  color={colors.primary}
                />
                <View style={styles.flex}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]} numberOfLines={2}>
                    {d.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                    {d.metadata?.source === 'cloud_coach' ? 'Learned from the online coach' : 'Saved document'} ·{' '}
                    {when(d.createdAt)}
                  </Text>
                </View>
                <PressableScale onPress={() => forgetDoc(d)} hitSlop={10} accessibilityLabel="Delete this">
                  <Ionicons name="trash-outline" size={18} color={colors.text.muted} />
                </PressableScale>
              </Card>
            ))
          ) : (
            <Text style={[typography.body, { color: colors.text.secondary }]}>
              When the online coach answers a detailed question (with your permission), the answer is kept here so
              Thrive can use it offline next time.
            </Text>
          )}

          {memories.length || docs.length ? (
            <Button label="Clear everything" variant="ghost" onPress={clearAll} style={{ marginTop: spacing.lg }} />
          ) : null}
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginTop: 12 },
  inlineBtn: { marginTop: 10, alignSelf: 'flex-start' },
  answer: { marginTop: 12, padding: 12, borderRadius: 14 },
  section: { marginTop: 22, marginBottom: 8, letterSpacing: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
});
