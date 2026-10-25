import { SquircleSurface } from '@/components/ui';
import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';

export default function JournalEntryDetailScreen() {
  const router = useRouter();
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const { colors, typography, spacing } = useTheme();
  const { journalEntries, deleteJournalEntry, showAlert, showToast } = useRootStore(
    useShallow((s) => ({
      journalEntries: s.journalEntries,
      deleteJournalEntry: s.deleteJournalEntry,
      showAlert: s.showAlert,
      showToast: s.showToast,
    })),
  );

  const entry = journalEntries.find((e) => e.id === entryId) ?? journalEntries[0];

  const handleDelete = () => {
    showAlert({
      title: 'Delete Reflection',
      message: 'Are you sure you want to permanently erase this entry from your device?',
      confirmText: 'Delete',
      destructive: true,
      onConfirm: () => {
        if (entry) deleteJournalEntry(entry.id);
        showToast({ type: 'info', title: 'Deleted', message: 'Entry deleted from this phone.' });
        router.back();
      },
    });
  };

  if (!entry) {
    return (
      <ScreenWrapper>
        <Header title="Journal" showBack />
        <SquircleSurface style={{ padding: spacing.base, alignItems: 'center' }}>
          <Text style={[typography.body, { color: colors.text.secondary }]}>Entry not found.</Text>
          <Button label="Back to Journal" onPress={() => router.back()} style={{ marginTop: 12 }} />
        </SquircleSurface>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable>
      <Header title="Journal entry" subtitle={new Date(entry.createdAt).toLocaleDateString()} showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <SquircleSurface style={styles.headerRow}>
            <Text style={[typography.heading, { color: colors.text.primary, flex: 1 }]}>
              {entry.title}
            </Text>
            <Badge label={`Mood: ${entry.moodTag}/10`} variant="primary" />
          </SquircleSurface>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4, marginBottom: 16 }]}>
            Logged at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Kept on this phone
          </Text>

          <Text style={[typography.body, { color: colors.text.primary, lineHeight: 24 }]}>
            {entry.content}
          </Text>
        </Card>

        {/* Local AI Reflection Prompt (Section 5.3) */}
        <Card style={{ marginBottom: spacing.lg, backgroundColor: colors.surface1 }}>
          <SquircleSurface style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Ionicons name="leaf-outline" size={18} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.primary, marginLeft: 6 }]}>
              On-Device Gentle Insight
            </Text>
          </SquircleSurface>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 20 }]}>
            You highlighted feelings of restoration. Notice what conditions helped you feel settled today, and consider protecting that quiet space tomorrow.
          </Text>
        </Card>

        <Button label="Delete Entry" variant="outline" onPress={handleDelete} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
