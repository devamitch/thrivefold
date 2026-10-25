import React from 'react';
import { useRootStore } from '../../stores/useRootStore';
import { getTaskById } from '../../domain/game/gameCatalogService';
import { QuestPanel } from './QuestPanel';
import { AppBottomSheetModal } from '../ui/AppBottomSheetModal';
import { useTheme } from '../../theme/useTheme';

export interface QuestSheetProps {
  /** The assignment to run; null hides the sheet. */
  assignmentId: string | null;
  onClose: () => void;
}

/**
 * Gesture-driven bottom sheet around QuestPanel, used from Home and Today.
 * Features downward swipe-to-dismiss, spring physics, frosted backdrop, and squircle top corners.
 */
export function QuestSheet({ assignmentId, onClose }: QuestSheetProps) {
  const { spacing } = useTheme();
  const taskId = useRootStore((s) => s.dailyAssignments.find((a) => a.assignmentId === assignmentId)?.taskId);
  const title = taskId ? getTaskById(taskId)?.title : undefined;

  return (
    <AppBottomSheetModal
      visible={Boolean(assignmentId)}
      onClose={onClose}
      eyebrow="DAILY QUEST"
      title={title ?? 'Quest'}
      maxHeight="92%"
      contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: spacing.lg }}
    >
      {assignmentId ? <QuestPanel assignmentId={assignmentId} onDone={onClose} onLeave={onClose} /> : null}
    </AppBottomSheetModal>
  );
}

export default QuestSheet;
