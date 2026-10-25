/**
 * Crash diagnostics (Firebase Crashlytics). One place initialises it; nothing else imports the
 * SDK. What is sent: stack traces, device model, OS and app version, and the names of the last
 * screens visited. Never health records, journal text, messages, beliefs, location or camera
 * data. The person can switch it off in Privacy and data; it is off at native start-up and the
 * app turns it on from their setting.
 */
type Crashlytics = {
  setCrashlyticsCollectionEnabled(enabled: boolean): Promise<void>;
  recordError(error: Error, jsErrorName?: string): void;
  log(message: string): void;
  setAttribute(name: string, value: string): Promise<null>;
};

let instance: Crashlytics | null | undefined;

function sdk(): Crashlytics | null {
  if (instance !== undefined) return instance;
  try {
    // Lazy: the native module only exists in builds that include it (not Expo Go or web).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-firebase/crashlytics');
    instance = (mod.getCrashlytics ? mod.getCrashlytics() : mod.default()) as Crashlytics;
  } catch {
    instance = null;
  }
  return instance;
}

let enabled = false;

export const crashReporting = {
  setEnabled(on: boolean) {
    enabled = on;
    sdk()?.setCrashlyticsCollectionEnabled(on).catch(() => undefined);
  },
  /** Screen name only, as a breadcrumb for the next crash report. */
  breadcrumb(screen: string) {
    if (!enabled) return;
    sdk()?.log(`screen ${screen.replace(/[^a-zA-Z0-9_/()[\]-]/g, '_').slice(0, 80)}`);
  },
  /** A caught error (e.g. the error boundary). The message is truncated and kept generic. */
  recordError(error: unknown, where: string) {
    if (!enabled) return;
    const e = error instanceof Error ? error : new Error(String(error).slice(0, 200));
    sdk()?.recordError(e, where);
  },
};
