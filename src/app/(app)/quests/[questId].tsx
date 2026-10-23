import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { getTaskById } from '../../../domain/game/gameCatalogService';

export default function QuestDetailScreen() {
  const router = useRouter();
  const { questId } = useLocalSearchParams<{ questId: string }>();
  const { colors, typography, spacing } = useTheme();

  const { todayQuests, verifyAndCompleteTask, skipDailyTask, showAlert, showToast } = useRootStore(
    useShallow((s) => ({
      todayQuests: s.todayQuests,
      verifyAndCompleteTask: s.verifyAndCompleteTask,
      skipDailyTask: s.skipDailyTask,
      showAlert: s.showAlert,
      showToast: s.showToast,
    })),
  );

  const quest = todayQuests.find((q) => q.id === questId) ?? todayQuests[0];
  const taskDef = getTaskById(quest?.id ?? '') ?? getTaskById('task_men_desk_decompression');

  const [notes, setNotes] = useState('');
  const [selfDeclared, setSelfDeclared] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!quest) {
    return (
      <ScreenContainer
        header={<AppHeader title="Quest" showBack />}
        scrollMode="shell-scroll-view"
      >
        <View style={{ padding: spacing.base }}>
          <Text style={[typography.body, { color: colors.text.secondary }]}>Quest not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const handleVerify = () => {
    setIsVerifying(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const result = verifyAndCompleteTask(quest.id, {
      assignmentId: quest.id,
      elapsedSeconds: (taskDef?.estimatedDurationMinutes ?? quest.durationMinutes) * 60,
      notes: notes.trim() || 'Completed with full focus and alignment',
      selfDeclaredHonest: selfDeclared,
    });

    setIsVerifying(false);

    if (result.success) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      showAlert({
        title: 'Quest Verified!',
        message: `Earned +${result.earnedTaskPoints} Daily Goal Points and +${result.earnedXp} XP!\n\nVerification: ${result.status.toUpperCase()}`,
        confirmText: 'Great',
        cancelText: null,
        onConfirm: () => router.back(),
      });
    } else {
      showAlert({
        title: 'Verification Incomplete',
        message: `Evidence check failed: ${result.reasonCodes.join(', ')}`,
        confirmText: 'Review',
        cancelText: null,
      });
    }
  };

  const handleSkip = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    skipDailyTask(quest.id, 'User skipped from detail screen');
    router.back();
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          eyebrow="QUEST CHALLENGE"
          title={quest.title}
          subtitle={quest.category.toUpperCase()}
          showBack
        />
      }
      scrollMode="shell-scroll-view"
    >
      <View style={{ paddingBottom: spacing.xxl }}>
        {/* Banner Card */}
        <Card variant="tinted" style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <View style={styles.rowBetween}>
            <Badge label={`${quest.durationMinutes} Minutes`} variant="primary" />
            <Text style={[typography.bodyBold, { color: colors.primary }]}>
              +{quest.taskPoints ?? 15} Pts • +{quest.xpReward} XP
            </Text>
          </View>
          <Text style={[typography.heading, { color: colors.primary, marginTop: spacing.sm }]}>
            {quest.title}
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
            {taskDef?.purpose ?? quest.description}
          </Text>
        </Card>

        {/* Step-by-Step Instructions */}
        <Card style={{ marginBottom: spacing.md, padding: spacing.lg }}>
          <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.sm }]}>
            Execution Steps
          </Text>
          {taskDef?.instructions && taskDef.instructions.length > 0 ? (
            taskDef.instructions.map((step) => (
              <View key={step.id} style={{ marginBottom: 12 }}>
                <Text style={[typography.subbodyBold, { color: colors.primary }]}>
                  Step {step.stepNumber}: {step.title}
                </Text>
                <Text style={[typography.body, { color: colors.text.secondary, marginTop: 2, lineHeight: 22 }]}>
                  {step.body}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 24 }]}>
              1. Find a comfortable, dedicated space.{'\n'}
              2. Follow diaphragmatic breathing throughout the movements.{'\n'}
              3. Never strain or force painful ranges of motion.{'\n'}
              4. Complete the designated duration with intention.
            </Text>
          )}
        </Card>

        {/* Verification Policy Card */}
        <Card variant="surface1" style={{ marginBottom: spacing.md, padding: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text style={[typography.captionBold, { color: colors.text.primary }]}>
              VERIFICATION POLICY
            </Text>
            <Badge
              label={taskDef?.verificationClass ? taskDef.verificationClass.toUpperCase() : 'EVIDENCE SUPPORTED'}
              variant="neutral"
            />
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Honest, verifiable progress without fake rewards. Provide activity notes or confirm honest completion.
          </Text>
        </Card>

        {/* Evidence Input Section */}
        {!quest.isCompleted && (
          <Card style={{ marginBottom: spacing.lg, padding: spacing.md }}>
            <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 8 }]}>
              Evidence & Reflection Notes
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface1,
                  color: colors.text.primary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. Completed 3 sets of decompression; hips feel noticeably less tight."
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />

            <View style={[styles.declarationRow, { marginTop: spacing.md }]}>
              <Ionicons
                name={selfDeclared ? 'checkbox' : 'square-outline'}
                size={22}
                color={selfDeclared ? colors.primary : colors.text.muted}
                onPress={() => setSelfDeclared(!selfDeclared)}
              />
              <Text
                style={[typography.caption, { color: colors.text.secondary, marginLeft: 8, flex: 1 }]}
                onPress={() => setSelfDeclared(!selfDeclared)}
              >
                I confirm that I completed this session with genuine effort and proper form.
              </Text>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        {!quest.isCompleted ? (
          <>
            <Button
              label={isVerifying ? 'Verifying...' : 'Verify & Complete Quest'}
              size="lg"
              variant="primary"
              onPress={handleVerify}
            />
            <Button
              label="Skip This Task & Pick Special Quest"
              variant="ghost"
              onPress={handleSkip}
              style={{ marginTop: spacing.sm }}
            />
          </>
        ) : (
          <Card variant="surface1" style={{ alignItems: 'center', padding: spacing.lg }}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text style={[typography.subheading, { color: colors.success, marginTop: 8 }]}>
              Quest Completed & Verified
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
              Earned +{quest.taskPoints ?? 15} Goal Points and +{quest.xpReward} XP.
            </Text>
          </Card>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
