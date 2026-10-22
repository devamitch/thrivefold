import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';

export default function AiMemoryScreen() {
  const { colors, typography, spacing } = useTheme();

  const [memories, setMemories] = useState([
    { id: 'mem_1', text: 'Prefers gentle morning mobility over high-intensity cardio due to desk work stiffness.', source: 'Onboarding Goals', date: 'Yesterday' },
    { id: 'mem_2', text: 'Practicing regular 4-7-8 breathing when stress levels exceed 6/10.', source: 'Daily Check-In', date: '2 days ago' },
    { id: 'mem_3', text: 'Vegetarian dietary focus; appreciates whole plant nourishment recommendations.', source: 'Lifestyle Preferences', date: '3 days ago' },
  ]);

  const handleDelete = (id: string) => {
    Alert.alert('Erase Memory', 'Remove this learned preference from your device-local vault?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Erase',
        style: 'destructive',
        onPress: () => setMemories((prev) => prev.filter((m) => m.id !== id)),
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Reset All Memories', 'This clears all on-device learned context for task personalization.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset All', style: 'destructive', onPress: () => setMemories([]) },
    ]);
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Local Memory Vault" subtitle="Inspect, Edit & Delete Learned Personal Context" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Core Principle Banner (Section 5.3) */}
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
              User-Controlled Memory (Section 5.3)
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            Personal memories are stored separately from model weights. We avoid auto-promoting every journal note into a permanent memory. You can inspect and erase any entry at any time.
          </Text>
        </Card>

        <View style={styles.headerRow}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Active Local Memories ({memories.length})
          </Text>
          {memories.length > 0 && (
            <Button label="Clear All" variant="ghost" size="sm" onPress={handleClearAll} />
          )}
        </View>

        {memories.length > 0 ? (
          memories.map((m) => (
            <Card key={m.id} style={{ marginTop: spacing.sm }}>
              <View style={styles.headerRow}>
                <Badge label={m.source} variant="neutral" />
                <Text style={[typography.caption, { color: colors.text.muted }]}>{m.date}</Text>
              </View>
              <Text style={[typography.body, { color: colors.text.primary, marginTop: 8, lineHeight: 22 }]}>
                "{m.text}"
              </Text>
              <Button
                label="Forget This Memory"
                variant="outline"
                size="sm"
                style={{ marginTop: 10, alignSelf: 'flex-start' }}
                onPress={() => handleDelete(m.id)}
              />
            </Card>
          ))
        ) : (
          <Card style={{ padding: spacing.xl, alignItems: 'center', marginTop: spacing.md }}>
            <Text style={[typography.subbody, { color: colors.text.secondary }]}>
              Memory vault is completely empty. No personal preferences are currently retained.
            </Text>
          </Card>
        )}
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
    marginBottom: 4,
  },
});
