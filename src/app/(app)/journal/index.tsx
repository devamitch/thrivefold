import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

export default function JournalScreen() {
  const { colors, typography } = useTheme();
  const { journalEntries, addJournalEntry, deleteJournalEntry } = useRootStore(
    useShallow((s) => ({ journalEntries: s.journalEntries, addJournalEntry: s.addJournalEntry, deleteJournalEntry: s.deleteJournalEntry })),
  );

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [, setIsComposing] = useState(false);

  const handleSave = () => {
    if (newTitle.trim() && newContent.trim()) {
      addJournalEntry(newTitle, newContent);
      setNewTitle('');
      setNewContent('');
      setIsComposing(false);
    }
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Journal" subtitle="Private notes, kept on this phone" showBack />
      <ScrollView style={[styles.content, { paddingHorizontal: 16, paddingBottom: 32 }]}>
        {/* Compose New Entry */}
        <Card style={{ marginBottom: 16, padding: 24 }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
            New Entry
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text.primary, borderColor: colors.border }]}
            placeholder="Title..."
            placeholderTextColor={colors.text.muted}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={[styles.textArea, { color: colors.text.primary, borderColor: colors.border }]}
            placeholder="Write your thoughts..."
            placeholderTextColor={colors.text.muted}
            value={newContent}
            onChangeText={setNewContent}
            multiline
            numberOfLines={6}
          />
          <View style={styles.buttonRow}>
            <Button
              label="Cancel"
              variant="outline"
              size="sm"
              onPress={() => {
                setNewTitle('');
                setNewContent('');
                setIsComposing(false);
              }}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              label="Save"
              size="sm"
              onPress={handleSave}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </Card>

        {/* Journal Entries */}
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
          Your Entries
        </Text>
        {journalEntries.map((entry) => (
          <Card key={entry.id} style={{ marginBottom: 16, padding: 24 }}>
            <View style={styles.entryHeader}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{entry.title}</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                {new Date(entry.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 8 }]}>
              {entry.content}
            </Text>
            <View style={styles.entryFooter}>
              <Text style={[typography.caption, { color: colors.primary }]}>
                Mood: {entry.moodTag}/10
              </Text>
              <Button
                label="Delete"
                variant="outline"
                size="sm"
                onPress={() => deleteJournalEntry(entry.id)}
              />
            </View>
          </Card>
        ))}

        {journalEntries.length === 0 && (
          <Card style={{ padding: 32, alignItems: 'center' }}>
            <Text style={[typography.subbody, { color: colors.text.muted }]}>
              No journal entries yet. Start writing above.
            </Text>
          </Card>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
});
