import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import { useRootStore } from '../../stores/useRootStore';
import { getTaskById } from '../../domain/game/gameCatalogService';
import { QuestPanel } from './QuestPanel';

export interface QuestSheetProps {
  /** The assignment to run; null hides the sheet. */
  assignmentId: string | null;
  onClose: () => void;
}

/** Bottom sheet around QuestPanel, used from Home and Today. */
export function QuestSheet({ assignmentId, onClose }: QuestSheetProps) {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const taskId = useRootStore((s) => s.dailyAssignments.find((a) => a.assignmentId === assignmentId)?.taskId);
  const title = taskId ? getTaskById(taskId)?.title : undefined;

  return (
    <Modal visible={Boolean(assignmentId)} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <View style={[styles.backdrop, { backgroundColor: colors.scrim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
          <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
            <View style={styles.handleBar}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>
            <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
              <Text style={[typography.heading, { color: colors.text.primary, flex: 1 }]} numberOfLines={2}>
                {title ?? 'Quest'}
              </Text>
              <PressableScale
                onPress={onClose}
                style={[styles.close, { backgroundColor: colors.surface1 }]}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={18} color={colors.text.secondary} />
              </PressableScale>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}
            >
              {assignmentId ? <QuestPanel assignmentId={assignmentId} onDone={onClose} /> : null}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingTop: 6 },
  handleBar: { alignItems: 'center', paddingVertical: 8 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingBottom: 8 },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
