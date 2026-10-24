import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../theme/useTheme';

export default function OpenLettersScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  // Approved prompt cards. Letters from other people appear only once the server delivers them.
  const openPrompts = [
    { id: 'ol_quiet', topic: 'How do you find quiet in a noisy place?' },
    { id: 'ol_books', topic: 'A book that helped you through a hard season' },
    { id: 'ol_attention', topic: 'Something you stopped paying attention to, and why it helped' },
  ];

  return (
    <ScreenWrapper scrollable>
      <Header title="Open Letters" subtitle="Approved Reflection Prompts & Global Post" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="mail-open-outline" size={18} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
              Approved prompt cards
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            Open Letters are curated reflection cards shared across the network. You can reply using our card-only postal composer.
          </Text>
        </Card>

        {openPrompts.map((prompt) => (
          <Card key={prompt.id} style={{ marginBottom: spacing.md, padding: spacing.lg }}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{prompt.topic}</Text>
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
              No replies yet. Shared letters appear here once the letters server is connected.
            </Text>
            <Button
              label="Write with letter cards"
              size="sm"
              style={{ marginTop: 14, alignSelf: 'flex-start' }}
              onPress={() => router.push('/(app)/letters/compose')}
            />
          </Card>
        ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
