import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Constant heart-rate monitoring from the user's watch/band through Android Health Connect
 * (anything that writes HeartRate there works: Galaxy/Wear OS, Mi Band, Fitbit, Garmin...).
 * Polls every 15 s, reads on-device, and never sends data anywhere.
 *
 *   const { actions } = useCompanion();
 *   useHeartRate(actions.onHeart);
 *
 * Needs: react-native-health-connect + expo-health-connect config plugin, and the
 * Health Connect app on the phone. Reading pixels from the front camera (camera pulse) needs a
 * native frame hook in the pose module; this file deliberately does not fake that.
 */
export function useHeartRate(onBpm: (bpm: number) => void, enabled = true, everyMs = 15000) {
  useEffect(() => {
    if (!enabled || Platform.OS !== 'android') return;
    let HC: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      HC = require('react-native-health-connect');
    } catch {
      return;
    }
    let alive = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    (async () => {
      try {
        if (!(await HC.initialize())) return;
        const granted = await HC.requestPermission([{ accessType: 'read', recordType: 'HeartRate' }]);
        if (!granted?.length) return;
        const poll = async () => {
          try {
            const end = new Date();
            const start = new Date(end.getTime() - 15 * 60 * 1000);
            const res = await HC.readRecords('HeartRate', {
              timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: end.toISOString() },
            });
            let best = 0;
            let bestT = 0;
            for (const rec of res?.records ?? []) {
              for (const s of rec.samples ?? []) {
                const ts = new Date(s.time).getTime();
                if (ts > bestT) { bestT = ts; best = s.beatsPerMinute; }
              }
            }
            if (alive && best > 25 && best < 230) onBpm(Math.round(best));
          } catch { /* transient */ }
        };
        await poll();
        timer = setInterval(poll, everyMs);
      } catch { /* Health Connect unavailable */ }
    })();

    return () => { alive = false; if (timer) clearInterval(timer); };
  }, [enabled, everyMs, onBpm]);
}
