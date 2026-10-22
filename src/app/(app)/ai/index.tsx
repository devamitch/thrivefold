import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import { localMemoryVault } from '../../../services/memory/localMemoryVault';
import { localAi } from '../../../services/local-ai/localAiService';

export default function AiVaultScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const [memories, setMemories] = useState(localMemoryVault.getAllMemories());
  const [isQuantizedLoaded, setIsQuantizedLoaded] = useState(localAi.isQuantizedModelLoaded());

  const handleLoadModel = async () => {
    await localAi.loadOnDeviceModel();
    setIsQuantizedLoaded(true);
    Alert.alert('On-Device Model Active', 'Lightweight quantized model weights ready on device. Operating 100% offline.');
  };

  const handleDeleteMemory = (id: string) => {
    localMemoryVault.deleteMemory(id);
    setMemories(localMemoryVault.getAllMemories());
  };

  const handleClearAll = () => {
    Alert.alert('Clear All Memories', 'Erase all personal AI tokens stored on this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => {
          localMemoryVault.clearAll();
          setMemories([]);
        },
      },
    ]);
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="AI Memory Vault" subtitle="On-Device Sovereignty & Model State" showBack />
      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        {/* Model Runtime State Card */}
        <Card variant="tinted" style={{ marginBottom: spacing.md, padding: spacing.base }}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[typography.subbodyBold, { color: colors.primary }]}>Local Model Runtime</Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                {isQuantizedLoaded ? 'On-Device Quantized Model Loaded' : 'Deterministic & Classifier Mode'}
              </Text>
            </View>
            <Badge
              label={isQuantizedLoaded ? 'Model Ready' : 'Heuristic Mode'}
              variant={isQuantizedLoaded ? 'success' : 'neutral'}
            />
          </View>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
            Zero cloud AI keys shipped. Tasks execute locally on device with graceful fallback.
          </Text>
          {!isQuantizedLoaded && (
            <Button
              label="Initialize Local Weights"
              size="sm"
              onPress={handleLoadModel}
              style={{ marginTop: spacing.md }}
            />
          )}
        </Card>

        {/* AI Management Sub-Navigation */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
          <Button
            label="Memory Vault"
            size="sm"
            variant="outline"
            icon={<Ionicons name="hardware-chip-outline" size={14} color={colors.primary} />}
            onPress={() => router.push('/(app)/ai/memory')}
          />
          <Button
            label="Privacy Guardrails"
            size="sm"
            variant="outline"
            icon={<Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />}
            onPress={() => router.push('/(app)/ai/privacy')}
          />
          <Button
            label="Engine Status"
            size="sm"
            variant="ghost"
            icon={<Ionicons name="stats-chart-outline" size={14} color={colors.text.secondary} />}
            onPress={() => router.push('/(app)/ai/model-status')}
          />
        </View>

        {/* Memory Vault Header */}
        <View style={[styles.rowBetween, { marginVertical: spacing.sm }]}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>
            Stored Personal Memories ({memories.length})
          </Text>
          {memories.length > 0 && (
            <Pressable onPress={handleClearAll}>
              <Text style={[typography.captionBold, { color: colors.error }]}>Erase All</Text>
            </Pressable>
          )}
        </View>

        {memories.length === 0 ? (
          <Card variant="surface1" style={{ alignItems: 'center', padding: spacing.xl }}>
            <Ionicons name="lock-closed-outline" size={28} color={colors.text.muted} style={{ marginBottom: 8 }} />
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>No Memories Stored</Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, textAlign: 'center' }]}>
              Your memory vault is clean. When enabled, only user-confirmed routine preferences are retained.
            </Text>
          </Card>
        ) : (
          memories.map((mem) => (
            <Card key={mem.id} style={{ marginBottom: spacing.sm }}>
              <View style={styles.rowBetween}>
                <Badge label={mem.category.toUpperCase()} variant="neutral" />
                <Pressable onPress={() => handleDeleteMemory(mem.id)} style={{ padding: 4 }}>
                  <Ionicons name="trash-outline" size={16} color={colors.text.muted} />
                </Pressable>
              </View>
              <Text style={[typography.subbody, { color: colors.text.primary, marginTop: spacing.xs }]}>
                {mem.content}
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>
                Stored locally · {new Date(mem.createdAt).toLocaleDateString()}
              </Text>
            </Card>
          ))
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
