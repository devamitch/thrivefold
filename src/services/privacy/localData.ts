/**
 * The person's own data on this device (REQ-008): export everything as JSON, or erase
 * everything. Health records are local-first, so these are the authoritative copies.
 */
import { wipeLocalData } from '../../stores/persistStorage';
import { useRootStore } from '../../stores/useRootStore';

export function buildLocalExport(): string {
  const state = useRootStore.getState();
  const data = Object.fromEntries(
    Object.entries(state).filter(([key, value]) => typeof value !== 'function' && key !== 'toasts'),
  );
  return JSON.stringify(
    { exportedAt: new Date().toISOString(), format: 'thrivefold-local-export/v2', data },
    null,
    2,
  );
}

/** Erases every Thrivefold record on this device and returns the app to a fresh state. */
export function eraseLocalData(): void {
  useRootStore.setState(useRootStore.getInitialState(), true);
  useRootStore.persist.clearStorage();
  wipeLocalData();
}
