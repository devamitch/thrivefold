import { useRootStore } from '../stores/useRootStore';

/**
 * The one switch for beta features everywhere in the app: Beta Mode must be on, and the person
 * must be allowed to use it (a development build, or a server-confirmed owner in release).
 * A persisted `betaMode` alone never unlocks anything after sign-out or on someone else's phone.
 */
export function useBetaEnabled(): boolean {
  return useRootStore((s) => s.betaMode && (__DEV__ || s.isOwner));
}

/** Whether the person may open Beta Lab at all (to turn Beta Mode on). */
export function useBetaAccess(): boolean {
  return useRootStore((s) => __DEV__ || s.isOwner);
}
