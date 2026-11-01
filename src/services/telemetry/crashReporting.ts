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

const diagnosticKeys = new Set(['code', 'component', 'operation', 'route', 'phase', 'status', 'source', 'feature']);

export function sanitizeDiagnosticContext(context?: Record<string, unknown>): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(context ?? {})) {
    if (!diagnosticKeys.has(key)) continue;
    if (typeof value === 'string') safe[key] = value.replace(/[^a-zA-Z0-9_./: -]/g, '_').slice(0, 80);
    else if (typeof value === 'number' || typeof value === 'boolean') safe[key] = value;
  }
  return safe;
}

export function safeStackFrames(error: unknown): string | undefined {
  if (!(error instanceof Error) || !error.stack) return undefined;
  const frames = error.stack
    .split('\n')
    .slice(1)
    .filter((line) => /^\s*at\s/.test(line) || /^\s*https?:\/\//.test(line));
  return frames.slice(0, 12).join('\n').slice(0, 500) || undefined;
}

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
  /** A caught error (e.g. the error boundary). Keeps stack frames, not the original message. */
  recordError(error: unknown, where: string) {
    if (!enabled) return;
    const safeError = new Error('Captured application error');
    safeError.stack = safeStackFrames(error);
    sdk()?.recordError(safeError, where);
  },
};
