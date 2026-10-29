import { useRootStore } from '../stores/useRootStore';

/**
 * The one switch for beta features everywhere in the app: anyone can turn Beta on from the drawer.
 * Owner-only tools (developer screens) are separate and checked on the server (tf_is_owner).
 */
export function useBetaEnabled(): boolean {
  return useRootStore((s) => s.betaMode);
}

/** Beta Lab is open to everyone who turns Beta on. */
export function useBetaAccess(): boolean {
  return true;
}
