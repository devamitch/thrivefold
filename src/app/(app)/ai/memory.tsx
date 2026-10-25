import { SquircleSurface } from '@/components/ui';
import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { TextField } from '../../../components/ui/TextField';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { activeMemories, type MemoryItem } from '../../../domain/ai/types';
import { PressableScale } from '../../../components/ui/PressableScale';

const MAX_LENGTH = 280;

export default function AiMemoryScreen() {
  const { colors, typography, spacing } = useTheme();
  const {
    aiMemories,
    aiMemoryEnabled,
    addAiMemory,
    updateAiMemory,
    deleteAiMemory,
    clearAiMemories,
    setAiMemoryEnabled,
    showAlert,
    showToast,
  } = useRootStore(
    useShallow((s) => ({
      aiMemories: s.aiMemories,
      aiMemoryEnabled: s.aiMemoryEnabled,
      addAiMemory: s.addAiMemory,
      updateAiMemory: s.updateAiMemory,
      deleteAiMemory: s.deleteAiMemory,
      clearAiMemories: s.clearAiMemories,
      setAiMemoryEnabled: s.setAiMemoryEnabled,
      showAlert: s.showAlert,
      showToast: s.showToast,
    })),
  );

  const memories = useMemo(() => activeMemories(aiMemories), [aiMemories]);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAdd = () => {
    if (addAiMemory({ content: draft, category: 'preference', source: 'user' })) {
      setDraft('');
      showToast({ type: 'success', message: 'Saved on this device.' });
    }
  };

  const startEdit = (m: MemoryItem) => {
    setEditingId(m.id);
    setEditText(m.content);
  };

  const saveEdit = () => {
    if (editingId) updateAiMemory(editingId, editText);
    setEditingId(null);
  };

  const confirmDelete = (id: string) =>
    showAlert({
      title: 'Forget this memory?',
      message: 'It will be removed from this device.',
      confirmText: 'Forget',
      destructive: true,
      onConfirm: () => deleteAiMemory(id),
    });

  const confirmClear = () =>
    showAlert({
      title: 'Forget everything?',
      message: 'All memories on this device will be removed. This cannot be undone.',
      confirmText: 'Forget all',
      destructive: true,
      onConfirm: () => {
        clearAiMemories();
        showToast({ type: 'info', message: 'All memories removed.' });
      },
    });

  return (
    <ScreenWrapper scrollable>
      <Header title="Memory" subtitle="Things you chose to keep, stored only on this device" showBack />
      <SquircleSurface style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }}>
        <Card style={{ marginBottom: spacing.md }}>
          <SquircleSurface style={styles.row}>
            <SquircleSurface style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Use memory</Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                When off, nothing new is kept and existing memories are not used or searched. They stay until you
                remove them.
              </Text>
            </SquircleSurface>
            <Switch
              value={aiMemoryEnabled}
              onValueChange={setAiMemoryEnabled}
              trackColor={{ false: colors.surface1, true: colors.primary }}
              accessibilityLabel="Use memory"
            />
          </SquircleSurface>
        </Card>

        {aiMemoryEnabled ? (
          <Card variant="surface1" style={{ marginBottom: spacing.md }}>
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: spacing.sm }]}>
              Add something to remember
            </Text>
            <TextField
              value={draft}
              onChangeText={setDraft}
              placeholder="e.g. Mornings work best for my routines"
              maxLength={MAX_LENGTH}
              multiline
              accessibilityLabel="New memory"
            />
            <Button
              label="Keep"
              size="sm"
              disabled={!draft.trim()}
              onPress={handleAdd}
              style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
            />
          </Card>
        ) : null}

        <SquircleSurface style={[styles.row, { marginBottom: spacing.sm }]}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Kept ({memories.length})</Text>
          {memories.length > 0 ? <Button label="Forget all" variant="ghost" size="sm" onPress={confirmClear} /> : null}
        </SquircleSurface>

        {memories.length === 0 ? (
          <Card variant="surface1" style={{ padding: spacing.lg }}>
            <Text style={[typography.subbody, { color: colors.text.secondary }]}>
              Nothing kept yet. Add a note above, or keep a pattern from Your Patterns. Journal entries are never
              turned into memories automatically.
            </Text>
          </Card>
        ) : (
          memories.map((m) => (
            <Card key={m.id} style={{ marginBottom: spacing.sm, opacity: aiMemoryEnabled ? 1 : 0.6 }}>
              <SquircleSurface style={styles.row}>
                <Badge label={m.source === 'insight' ? 'From a pattern' : 'Added by you'} variant="neutral" />
                <Text style={[typography.caption, { color: colors.text.muted }]}>
                  {new Date(m.updatedAt ?? m.createdAt).toLocaleDateString()}
                </Text>
              </SquircleSurface>
              {editingId === m.id ? (
                <>
                  <TextField
                    value={editText}
                    onChangeText={setEditText}
                    maxLength={MAX_LENGTH}
                    multiline
                    autoFocus
                    accessibilityLabel="Edit memory"
                    containerStyle={{ marginTop: spacing.sm }}
                  />
                  <SquircleSurface style={[styles.actions, { marginTop: spacing.sm }]}>
                    <Button label="Save" size="sm" disabled={!editText.trim()} onPress={saveEdit} />
                    <Button label="Cancel" size="sm" variant="ghost" onPress={() => setEditingId(null)} />
                  </SquircleSurface>
                </>
              ) : (
                <>
                  <Text style={[typography.body, { color: colors.text.primary, marginTop: spacing.sm }]}>
                    {m.content}
                  </Text>
                  {m.expiresAt ? (
                    <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
                      Forgotten automatically on {new Date(m.expiresAt).toLocaleDateString()}
                    </Text>
                  ) : null}
                  <SquircleSurface style={[styles.actions, { marginTop: spacing.sm }]}>
                    <IconAction icon="create-outline" label="Edit" onPress={() => startEdit(m)} />
                    <IconAction icon="trash-outline" label="Forget" onPress={() => confirmDelete(m.id)} />
                  </SquircleSurface>
                </>
              )}
            </Card>
          ))
        )}
      </SquircleSurface>
    </ScreenWrapper>
  );
}

function IconAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { colors, typography } = useTheme();
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.iconAction}>
      <Ionicons name={icon} size={16} color={colors.text.secondary} />
      <Text style={[typography.captionBold, { color: colors.text.secondary, marginLeft: 4 }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconAction: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingRight: 8,
  },
});
