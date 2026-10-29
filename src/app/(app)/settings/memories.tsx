import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { TextField } from '../../../components/ui/TextField';
import { memoryStore } from '../../../services/local-ai/memory/memoryStore';
import { knowledgeStore } from '../../../services/local-ai/rag/knowledgeStore';
import type { UserMemory, MemoryKind } from '../../../services/local-ai/memory/types';
import { useTheme } from '../../../theme/useTheme';
import { hapticMedium, hapticSelection } from '../../../services/haptics';

const CATEGORIES: { label: string; kind?: MemoryKind }[] = [
  { label: 'All' },
  { label: 'Facts', kind: 'fact' },
  { label: 'Preferences', kind: 'preference' },
  { label: 'Episodes', kind: 'episode' },
  { label: 'Workflows', kind: 'workflow' },
  { label: 'Profile', kind: 'profile' },
];

export default function MemoriesScreen() {
  const { colors, typography } = useTheme();

  const [loading, setLoading] = useState(true);
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [selectedKind, setSelectedKind] = useState<MemoryKind | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const loadMemories = useCallback(async () => {
    try {
      setLoading(true);
      const items = await memoryStore.listMemories('local_user', {
        status: 'active',
        kind: selectedKind,
      });
      setMemories(items);
    } catch {
      // Degrades gracefully
    } finally {
      setLoading(false);
    }
  }, [selectedKind]);

  useEffect(() => {
    void loadMemories();
  }, [loadMemories]);

  const filteredMemories = useMemo(() => {
    if (!searchQuery.trim()) return memories;
    const q = searchQuery.toLowerCase().trim();
    return memories.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        m.kind.toLowerCase().includes(q) ||
        (m.metadata?.tag && String(m.metadata.tag).toLowerCase().includes(q))
    );
  }, [memories, searchQuery]);

  const handleDeleteMemory = useCallback(
    async (id: string) => {
      hapticMedium();
      Alert.alert(
        'Delete Memory',
        'Are you sure you want to forget this knowledge? It will be permanently removed from local RAG.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await memoryStore.deleteMemory(id, 'local_user');
              await loadMemories();
            },
          },
        ]
      );
    },
    [loadMemories]
  );

  const handleClearAll = useCallback(() => {
    hapticMedium();
    Alert.alert(
      'Clear All Knowledge',
      'This will erase all analytical memories learned by Thrive Coach on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Everything',
          style: 'destructive',
          onPress: async () => {
            await memoryStore.clearAllMemories('local_user');
            await knowledgeStore.clearAllDocuments('local_user');
            await loadMemories();
          },
        },
      ]
    );
  }, [loadMemories]);

  const handleExport = useCallback(async () => {
    hapticSelection();
    try {
      const dump = JSON.stringify(memories, null, 2);
      await Share.share({
        title: 'Thrivefold Knowledge Export',
        message: dump,
      });
    } catch {
      // ignore
    }
  }, [memories]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader
        title="AI Memories & RAG"
        subtitle="On-device analytical knowledge private to you"
        showBack
      />

      <ScreenContainer scrollable contentContainerStyle={styles.container}>
        {/* Top Info Banner */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={24} color={colors.dockActive} />
            <View style={styles.infoTextCol}>
              <Text style={[styles.infoTitle, { color: colors.text.primary, fontFamily: typography.label.fontFamily }]}>
                100% On-Device & Private
              </Text>
              <Text style={[styles.infoDesc, { color: colors.text.secondary, fontFamily: typography.body.fontFamily }]}>
                Thrive Coach remembers only facts and routines approved by you. Memories are stored in local SQLite and never sent to cloud servers without consent.
              </Text>
            </View>
          </View>
        </Card>

        {/* Search Input */}
        <TextField
          label="Search memories"
          placeholder="Filter by keyword, topic, or habit…"
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search" size={18} color={colors.text.secondary} />}
        />

        {/* Category Pills */}
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedKind === cat.kind;
            return (
              <PressableScale
                key={idx}
                onPress={() => {
                  hapticSelection();
                  setSelectedKind(cat.kind);
                }}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected ? colors.dockActive : colors.surface,
                    borderColor: isSelected ? colors.dockActive : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: isSelected ? colors.dock : colors.text.primary,
                      fontFamily: typography.label.fontFamily,
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        {/* Memory Items List */}
        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.secondary, fontFamily: typography.label.fontFamily }]}>
              STORED MEMORIES ({filteredMemories.length})
            </Text>
            {filteredMemories.length > 0 ? (
              <PressableScale onPress={handleExport}>
                <Text style={[styles.exportLink, { color: colors.dockActive, fontFamily: typography.label.fontFamily }]}>
                  Export JSON
                </Text>
              </PressableScale>
            ) : null}
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={colors.dockActive} style={{ marginTop: 24 }} />
          ) : filteredMemories.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="library-outline" size={36} color={colors.text.muted} />
              <Text style={[styles.emptyTitle, { color: colors.text.primary, fontFamily: typography.label.fontFamily }]}>
                No memories found
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.text.secondary, fontFamily: typography.body.fontFamily }]}>
                Speak to Thrive Coach or log your reflections to build on-device knowledge.
              </Text>
            </Card>
          ) : (
            filteredMemories.map((mem) => (
              <Card key={mem.id} style={styles.memoryCard}>
                <View style={styles.memoryHeader}>
                  <Badge variant="neutral" label={mem.kind.toUpperCase()} />
                  <Text style={[styles.memoryDate, { color: colors.text.muted, fontFamily: typography.body.fontFamily }]}>
                    {new Date(mem.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={[styles.memoryContent, { color: colors.text.primary, fontFamily: typography.body.fontFamily }]}>
                  {mem.content}
                </Text>

                <View style={styles.memoryFooter}>
                  <Text style={[styles.memoryOrigin, { color: colors.text.muted, fontFamily: typography.body.fontFamily }]}>
                    Origin: {mem.origin} • Confidence: {Math.round(mem.confidence * 100)}%
                  </Text>
                  <PressableScale
                    onPress={() => handleDeleteMemory(mem.id)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error || '#EF4444'} />
                  </PressableScale>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Clear All / GDPR Section */}
        {memories.length > 0 ? (
          <View style={styles.dangerSection}>
            <Button
              title="Forget All Memories"
              variant="danger"
              onPress={handleClearAll}
            />
          </View>
        ) : null}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    paddingBottom: 48,
    paddingHorizontal: 20,
    gap: 16,
  },
  infoCard: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoTextCol: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  pill: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 13,
  },
  listSection: {
    marginTop: 8,
    gap: 12,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 0.8,
  },
  exportLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  memoryCard: {
    padding: 16,
    gap: 8,
  },
  memoryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memoryDate: {
    fontSize: 12,
  },
  memoryContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  memoryFooter: {
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
  },
  memoryOrigin: {
    fontSize: 11,
  },
  deleteBtn: {
    padding: 4,
  },
  dangerSection: {
    marginTop: 16,
  },
});
