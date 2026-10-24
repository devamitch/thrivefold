import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';

export default function NewJournalEntryScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { addJournalEntry, showAlert, showToast } = useRootStore(
    useShallow((s) => ({
      addJournalEntry: s.addJournalEntry,
      showAlert: s.showAlert,
      showToast: s.showToast,
    })),
  );

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodTag, setMoodTag] = useState(8);

  const moodOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      showAlert({
        title: 'Incomplete Entry',
        message: 'Please provide a title and your reflection notes.',
        confirmText: 'Understood',
        cancelText: null,
      });
      return;
    }

    addJournalEntry(title.trim(), content.trim(), moodTag);
    showToast({ type: 'success', title: 'Saved', message: 'Your entry is kept on this phone.' });
    router.back();
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="New entry" subtitle="Private, kept on this phone" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.captionBold, { color: colors.text.secondary, marginBottom: 6 }]}>
            REFLECTION TITLE
          </Text>
          <TextInput
            placeholder="e.g. Unwinding after a demanding day..."
            placeholderTextColor={colors.text.muted}
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.surface1 }]}
          />

          <Text style={[typography.captionBold, { color: colors.text.secondary, marginTop: 14, marginBottom: 6 }]}>
            HOW ARE YOU FEELING RIGHT NOW? (MOOD TAG)
          </Text>
          <View style={styles.moodRow}>
            {moodOptions.map((m) => (
              <Chip
                key={m}
                label={`${m}`}
                selected={moodTag === m}
                onPress={() => setMoodTag(m)}
                style={{ width: 44, height: 38, marginRight: 6, marginBottom: 6, justifyContent: 'center', alignItems: 'center' }}
              />
            ))}
          </View>

          <Text style={[typography.captionBold, { color: colors.text.secondary, marginTop: 14, marginBottom: 6 }]}>
            YOUR PRIVATE THOUGHTS
          </Text>
          <TextInput
            placeholder="Write openly. This never leaves your device or trains external models without explicit consent..."
            placeholderTextColor={colors.text.muted}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            style={[styles.textArea, { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.surface1 }]}
          />
        </Card>

        <Card variant="surface1" style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="lock-closed" size={16} color={colors.primary} />
            <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 6 }]}>
              Stored only on this phone
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            Zero central cloud upload. Not accessible by community members, employers, or AI cloud proxies.
          </Text>
        </Card>

        <Button label="Save entry" onPress={handleSave} />
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
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  textArea: {
    minHeight: 160,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
