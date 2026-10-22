import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';

export default function OpenLettersScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const [openPrompts] = useState([
    {
      id: 'ol_1',
      author: 'WandererInMist',
      stamp: 'Mountain Peak',
      topic: 'How do you find quiet in a noisy city?',
      reflection: 'Living in a bustling metropolis often feels overwhelming. I have started waking at 5:30 AM just to sit with steam rising from a kettle in silence. What is your anchor practice?',
      replies: 16,
    },
    {
      id: 'ol_2',
      author: 'CloverLeaf',
      stamp: 'Rose Petal',
      topic: 'Books that healed a season of grief or transition',
      reflection: 'Reading nature poetry and quiet memoirs helped me process a difficult loss last autumn. What books have served as gentle companions during your life transitions?',
      replies: 24,
    },
    {
      id: 'ol_3',
      author: 'SeaGlassSeeker',
      stamp: 'Ocean Wave',
      topic: 'The art of not having an opinion on everything',
      reflection: 'Stepping back from constant digital debates has dramatically lowered my physiological stress. Pacing my attention has become my greatest health commitment.',
      replies: 9,
    },
  ]);

  return (
    <ScreenWrapper scrollable>
      <Header title="Open Letters" subtitle="Approved Reflection Prompts & Global Post" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="mail-open-outline" size={18} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
              Approved Prompt Cards (Section 8.3 & 14)
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            Open Letters are curated reflection cards shared across the network. You can reply using our card-only postal composer.
          </Text>
        </Card>

        {openPrompts.map((prompt) => (
          <Card key={prompt.id} style={{ marginBottom: spacing.md, padding: spacing.lg }}>
            <View style={styles.headerRow}>
              <Badge label={`Stamp: ${prompt.stamp}`} variant="neutral" />
              <Text style={[typography.caption, { color: colors.text.muted }]}>{prompt.replies} Replies</Text>
            </View>

            <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
              "{prompt.topic}"
            </Text>
            <Text style={[typography.caption, { color: colors.primary, marginTop: 2 }]}>
              Penned by {prompt.author}
            </Text>

            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 10, lineHeight: 22 }]}>
              {prompt.reflection}
            </Text>

            <Button
              label="Reply with Letter Cards"
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
