import type { RootState } from './rootTypes';
import { EMPTY_ONBOARDING } from './slices/appSlice';
import { migrateQuestState } from './slices/questSlice';

export const ROOT_STORE_VERSION = 5;

export function migrateRootState(persisted: unknown, version: number): RootState {
  let state = (persisted ?? {}) as Record<string, unknown>;
  if (version < 2) {
    state = migrateQuestState(state);
    if (Array.isArray(state.personalEvents)) {
      state.personalEvents = (state.personalEvents as { id: string }[]).filter(
        (event) => event.id !== 'default_bday_user' && event.id !== 'default_anniversary',
      );
    }
  }
  if (version < 4) state.experienceConfirmed = Boolean(state.isOnboarded);
  if (version < 3) {
    state.onboarding = { ...EMPTY_ONBOARDING, ...((state.onboarding as object | undefined) ?? {}) };
  }
  if (version < 5) state.crashReports = false;
  return state as unknown as RootState;
}
