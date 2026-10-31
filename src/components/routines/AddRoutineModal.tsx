import { useRootStore } from '../../stores/useRootStore';
import { RoutineSheet, type RoutineFormValues } from './RoutineSheet';

interface AddRoutineModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded?: (routineId: string) => void;
  /** Prefill, e.g. a bedtime or wake-up alarm. */
  initial?: Partial<RoutineFormValues>;
}

export function AddRoutineModal({ visible, onClose, onAdded, initial }: AddRoutineModalProps) {
  const addRoutine = useRootStore((s) => s.addRoutine);

  return (
    <RoutineSheet
      mode="add"
      visible={visible}
      initial={initial}
      onClose={onClose}
      onSubmit={({ kind, title, time, days }) => {
        const id = addRoutine({ kind, title, time, days });
        onAdded?.(id);
      }}
    />
  );
}
