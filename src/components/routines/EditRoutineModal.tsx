import type { Routine } from '../../domain/routines';
import { useRootStore } from '../../stores/useRootStore';
import { RoutineSheet } from './RoutineSheet';

interface EditRoutineModalProps {
  routine: Routine | null;
  visible: boolean;
  onClose: () => void;
  onUpdated?: (routine: Routine) => void;
  onDeleted?: (routineId: string) => void;
}

export function EditRoutineModal({
  routine,
  visible,
  onClose,
  onUpdated,
  onDeleted,
}: EditRoutineModalProps) {
  const updateRoutine = useRootStore((s) => s.updateRoutine);
  const removeRoutine = useRootStore((s) => s.removeRoutine);

  return (
    <RoutineSheet
      mode="edit"
      visible={visible}
      routine={routine}
      onClose={onClose}
      onSubmit={({ title, time, days, enabled }) => {
        if (!routine) return;
        updateRoutine(routine.id, { title, time, days, enabled });
        onUpdated?.({ ...routine, title, time, days, enabled });
      }}
      onDelete={() => {
        if (!routine) return;
        removeRoutine(routine.id);
        onDeleted?.(routine.id);
      }}
    />
  );
}
