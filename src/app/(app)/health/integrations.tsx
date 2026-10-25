import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, Share, StyleSheet, Switch, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { formatLocalDate } from '../../../domain/calendar/universalCalendarEngine';
import { buildFhirBundle, fhirGender } from '../../../domain/interop/fhir';
import { dailyHeartRate } from '../../../domain/interop/readings';
import {
  bluetoothOn,
  connectHeartRate,
  ensureBlePermissions,
  scanHeartRateMonitors,
  type HeartRateConnection,
} from '../../../services/integrations/bleHeartRate';
import {
  HC_DATA_TYPES,
  connectHealthConnect,
  disconnectHealthConnect,
  healthConnectStatus,
  openHealthConnect,
  syncHealthConnect,
  type HcDataType,
  type HcStatus,
} from '../../../services/integrations/healthConnect';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';
import { PressableScale } from '../../../components/ui/PressableScale';

/** Stable empty list: a new [] in a store selector would re-render forever. */
const NO_PERIODS: never[] = [];

const ACTION_LABEL: Record<string, string> = {
  consent_granted: 'Access granted',
  consent_revoked: 'Access removed',
  sync_read: 'Data read',
  sync_write: 'Data written',
  device_connected: 'Device connected',
  device_disconnected: 'Device disconnected',
  export_fhir: 'FHIR export shared',
  export_json: 'Data export shared',
  data_erased: 'Data erased',
};
const SOURCE_LABEL: Record<string, string> = {
  health_connect: 'Health Connect',
  ble_heart_rate: 'Heart-rate monitor',
  pose_camera: 'Movement check camera',
  fhir_export: 'FHIR',
  json_export: 'Export',
  local_data: 'This phone',
};

/** Connected apps and devices: Health Connect, Bluetooth heart rate, FHIR export, consent and audit. */
export default function IntegrationsScreen() {
  const { colors, typography, spacing } = useTheme();
  const s = useRootStore(
    useShallow((st) => ({
      user: st.user,
      healthConnect: st.healthConnect,
      bleDevice: st.bleDevice,
      readings: st.deviceReadings,
      consentRecords: st.consentRecords,
      auditLog: st.auditLog,
      checkIns: st.checkInHistory,
      periods: st.cycleData?.periodHistory ?? NO_PERIODS,
      medications: st.medications,
      workouts: st.workoutSessions,
      activities: st.activityLogs,
      recordConsent: st.recordConsent,
      audit: st.audit,
      setHealthConnect: st.setHealthConnect,
      setBleDevice: st.setBleDevice,
      importReadings: st.importReadings,
      removeReadings: st.removeReadings,
      showToast: st.showToast,
      showAlert: st.showAlert,
    })),
  );

  // ── Health Connect ──
  const [hcStatus, setHcStatus] = useState<HcStatus | 'checking'>('checking');
  const [chosen, setChosen] = useState<HcDataType[]>([
    'Steps',
    'SleepSession',
    'HeartRate',
    'ExerciseSession',
  ]);
  const [writeWorkouts, setWriteWorkouts] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    healthConnectStatus().then(setHcStatus);
  }, []);

  const connect = async () => {
    setBusy(true);
    try {
      const granted = await connectHealthConnect(chosen, writeWorkouts);
      if (granted.length === 0) {
        s.showToast({ type: 'info', message: 'No access was granted. Nothing was read.' });
        return;
      }
      const scopes = [
        ...granted.map((t) => `read:${t}`),
        ...(writeWorkouts ? ['write:ExerciseSession'] : []),
      ];
      s.recordConsent('health_connect', scopes, 'granted');
      const readings = await syncHealthConnect(granted);
      s.importReadings(readings);
      const now = new Date().toISOString();
      s.setHealthConnect({ scopes, connectedAt: now, lastSyncAt: now });
      s.audit(
        'sync_read',
        'health_connect',
        `${readings.length} daily values from ${granted.join(', ')}`,
      );
      s.showToast({
        type: 'success',
        title: 'Connected',
        message: `${readings.length} daily values imported.`,
      });
    } catch {
      s.showToast({ type: 'warning', message: 'Health Connect did not respond. Try again.' });
    } finally {
      setBusy(false);
    }
  };

  const sync = async () => {
    if (!s.healthConnect) return;
    setBusy(true);
    try {
      const types = s.healthConnect.scopes
        .filter((x) => x.startsWith('read:'))
        .map((x) => x.slice(5) as HcDataType);
      const readings = await syncHealthConnect(types);
      s.importReadings(readings);
      s.setHealthConnect({ ...s.healthConnect, lastSyncAt: new Date().toISOString() });
      s.audit('sync_read', 'health_connect', `${readings.length} daily values`);
      s.showToast({ type: 'success', message: `Synced ${readings.length} daily values.` });
    } catch {
      s.showToast({ type: 'warning', message: 'Sync failed. Check Health Connect permissions.' });
    } finally {
      setBusy(false);
    }
  };

  const disconnect = () =>
    s.showAlert({
      title: 'Disconnect Health Connect?',
      message:
        'Thrivefold stops reading and writing, and the imported values are removed from this phone. Data in Health Connect is not touched.',
      confirmText: 'Disconnect',
      destructive: true,
      onConfirm: async () => {
        await disconnectHealthConnect();
        s.recordConsent('health_connect', s.healthConnect?.scopes ?? [], 'revoked');
        s.removeReadings('health_connect');
        s.setHealthConnect(null);
      },
    });

  // ── Bluetooth heart rate ──
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState<{ id: string; name: string }[]>([]);
  const [bpm, setBpm] = useState<number | null>(null);
  const [bleError, setBleError] = useState<string | null>(null);
  const samples = useRef<{ time: string; beatsPerMinute: number }[]>([]);
  const conn = useRef<HeartRateConnection | null>(null);
  const stopScan = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      stopScan.current?.();
      conn.current?.stop();
    },
    [],
  );

  const scan = async () => {
    setBleError(null);
    if (!(await ensureBlePermissions())) {
      setBleError('Bluetooth permission is needed to find your monitor.');
      return;
    }
    if (!(await bluetoothOn())) {
      setBleError('Turn on Bluetooth, then try again.');
      return;
    }
    setFound([]);
    setScanning(true);
    stopScan.current = scanHeartRateMonitors(
      (d) => setFound((cur) => (cur.some((c) => c.id === d.id) ? cur : [...cur, d])),
      (msg) => {
        setBleError(msg);
        setScanning(false);
      },
    );
    setTimeout(() => setScanning(false), 20000);
  };

  const connectDevice = async (d: { id: string; name: string }) => {
    stopScan.current?.();
    setScanning(false);
    try {
      samples.current = [];
      conn.current = await connectHeartRate(
        d.id,
        (value) => {
          setBpm(value);
          samples.current.push({ time: new Date().toISOString(), beatsPerMinute: value });
        },
        () => {
          setBpm(null);
          s.setBleDevice(null);
        },
      );
      s.setBleDevice({ id: d.id, name: d.name, connectedAt: new Date().toISOString() });
      s.recordConsent('ble_heart_rate', ['read:heart_rate'], 'granted');
      s.audit('device_connected', 'ble_heart_rate', d.name);
    } catch {
      setBleError('Could not connect. Make sure the monitor is on and close by.');
    }
  };

  const disconnectDevice = async () => {
    if (samples.current.length) {
      s.importReadings(dailyHeartRate(samples.current, 'ble_heart_rate'));
      s.audit(
        'sync_read',
        'ble_heart_rate',
        `${samples.current.length} heart-rate samples saved as a daily summary`,
      );
    }
    await conn.current?.stop();
    conn.current = null;
    s.audit('device_disconnected', 'ble_heart_rate', s.bleDevice?.name ?? 'monitor');
    s.setBleDevice(null);
    setBpm(null);
  };

  // ── FHIR export ──
  const exportFhir = async () => {
    const bundle = buildFhirBundle({
      patientId: s.user?.id ?? 'local',
      displayName: s.user?.pseudonym,
      gender: fhirGender(s.user?.gender),
      checkIns: s.checkIns,
      periods: s.periods,
      medications: s.medications,
      workouts: s.workouts,
      activities: s.activities,
      readings: s.readings,
    });
    try {
      const result = await Share.share({
        title: 'Thrivefold health record (FHIR R4)',
        message: JSON.stringify(bundle, null, 2),
      });
      if (result.action === Share.sharedAction) {
        s.recordConsent('fhir_export', ['all-records'], 'granted');
        s.audit('export_fhir', 'fhir_export', `${bundle.entry.length} resources`);
      }
    } catch {
      s.showToast({ type: 'warning', message: 'Could not open the share sheet.' });
    }
  };

  const last7 = useMemo(() => {
    const since = formatLocalDate(new Date(Date.now() - 6 * 86400000));
    return s.readings.filter((r) => r.date >= since);
  }, [s.readings]);
  const latest = (kind: string) => last7.find((r) => r.kind === kind);

  const row = (label: string, value: string) => (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[typography.subbody, { color: colors.text.secondary }]}>{label}</Text>
      <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{value}</Text>
    </View>
  );

  return (
    <ScreenContainer
      header={
        <AppHeader title="Connected apps" subtitle="Health Connect, devices and exports" showBack />
      }
      scrollMode="shell-scroll-view"
    >
      {/* Health Connect */}
      <Card style={{ padding: spacing.base }}>
        <View style={styles.titleRow}>
          <Ionicons name="fitness-outline" size={22} color={colors.primary} />
          <Text
            style={[typography.subheading, { color: colors.text.primary, marginLeft: 8, flex: 1 }]}
          >
            Health Connect
          </Text>
          <Badge
            label={
              s.healthConnect
                ? 'Connected'
                : hcStatus === 'available'
                  ? 'Ready'
                  : hcStatus === 'checking'
                    ? 'Checking'
                    : 'Not available'
            }
            variant={s.healthConnect ? 'success' : 'neutral'}
          />
        </View>
        <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6 }]}>
          Samsung Health, Google Fit, Fitbit, Garmin and many other apps share through Health
          Connect. Turn sharing on in those apps, then connect here. Thrivefold reads only what you
          allow and keeps it on this phone.
        </Text>

        {hcStatus === 'unavailable' && Platform.OS === 'android' ? (
          <Button
            label="Get Health Connect"
            size="sm"
            variant="outline"
            onPress={() =>
              Linking.openURL('market://details?id=com.google.android.apps.healthdata').catch(
                () => undefined,
              )
            }
            style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
          />
        ) : hcStatus === 'update_required' ? (
          <Button
            label="Update Health Connect"
            size="sm"
            variant="outline"
            onPress={() =>
              Linking.openURL('market://details?id=com.google.android.apps.healthdata').catch(
                () => undefined,
              )
            }
            style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
          />
        ) : s.healthConnect ? (
          <>
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
              {s.healthConnect.scopes
                .map((x) => x.replace('read:', 'Read ').replace('write:', 'Write '))
                .join(' · ')}
              {s.healthConnect.lastSyncAt
                ? ` · last synced ${new Date(s.healthConnect.lastSyncAt).toLocaleString()}`
                : ''}
            </Text>
            <View style={[styles.actions, { marginTop: spacing.md }]}>
              <Button
                label={busy ? 'Syncing…' : 'Sync now'}
                size="sm"
                disabled={busy}
                onPress={sync}
              />
              <Button label="Manage" size="sm" variant="outline" onPress={openHealthConnect} />
              <Button label="Disconnect" size="sm" variant="ghost" onPress={disconnect} />
            </View>
          </>
        ) : hcStatus === 'available' ? (
          <>
            {HC_DATA_TYPES.map((t) => {
              const on = chosen.includes(t.type);
              return (
                <View key={t.type} style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      {t.label}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>
                      {t.why}
                    </Text>
                  </View>
                  <Switch
                    value={on}
                    onValueChange={() =>
                      setChosen((c) => (on ? c.filter((x) => x !== t.type) : [...c, t.type]))
                    }
                    trackColor={{ false: colors.surface2, true: colors.primary }}
                    accessibilityLabel={`Read ${t.label}`}
                  />
                </View>
              );
            })}
            <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Save my workouts there
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  Finished Thrivefold workouts appear in your other apps.
                </Text>
              </View>
              <Switch
                value={writeWorkouts}
                onValueChange={setWriteWorkouts}
                trackColor={{ false: colors.surface2, true: colors.primary }}
              />
            </View>
            <Button
              label={busy ? 'Connecting…' : 'Connect Health Connect'}
              disabled={busy || chosen.length === 0}
              onPress={connect}
              style={{ marginTop: spacing.md }}
            />
          </>
        ) : null}

        {last7.length > 0 ? (
          <View style={{ marginTop: spacing.md }}>
            {latest('steps')
              ? row('Steps (latest day)', `${latest('steps')!.value.toLocaleString()}`)
              : null}
            {latest('sleep_minutes')
              ? row(
                  'Sleep (latest night)',
                  `${Math.round((latest('sleep_minutes')!.value / 60) * 10) / 10} h`,
                )
              : null}
            {latest('heart_rate_avg')
              ? row('Heart rate (latest day)', `${latest('heart_rate_avg')!.value} bpm avg`)
              : null}
            {latest('weight_kg')
              ? row('Weight (latest)', `${latest('weight_kg')!.value} kg`)
              : null}
            {latest('exercise_minutes')
              ? row('Workouts (latest day)', `${latest('exercise_minutes')!.value} min`)
              : null}
          </View>
        ) : null}
      </Card>

      {/* Bluetooth heart rate */}
      <Card style={{ padding: spacing.base, marginTop: spacing.md }}>
        <View style={styles.titleRow}>
          <Ionicons name="bluetooth-outline" size={22} color={colors.primary} />
          <Text
            style={[typography.subheading, { color: colors.text.primary, marginLeft: 8, flex: 1 }]}
          >
            Heart-rate monitor
          </Text>
          {s.bleDevice ? <Badge label="Connected" variant="success" /> : null}
        </View>
        <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6 }]}>
          Chest straps and watches that broadcast standard Bluetooth heart rate. Live readings are
          summarised for the day when you disconnect.
        </Text>
        {s.bleDevice ? (
          <>
            <Text
              style={[typography.hero, { color: colors.primary, marginTop: spacing.sm }]}
              accessibilityLiveRegion="polite"
            >
              {bpm ? `${bpm} bpm` : 'Waiting…'}
            </Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              {s.bleDevice.name}
            </Text>
            <Button
              label="Disconnect and save"
              size="sm"
              variant="outline"
              onPress={disconnectDevice}
              style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
            />
          </>
        ) : (
          <>
            <Button
              label={scanning ? 'Searching…' : 'Find my monitor'}
              size="sm"
              disabled={scanning}
              onPress={scan}
              style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
            />
            {found.map((d) => (
              <PressableScale
                key={d.id}
                onPress={() => connectDevice(d)}
                accessibilityRole="button"
                style={[styles.device, { backgroundColor: colors.surface1 }]}
              >
                <Ionicons name="heart-outline" size={18} color={colors.primary} />
                <Text
                  style={[
                    typography.bodyBold,
                    { color: colors.text.primary, marginLeft: 10, flex: 1 },
                  ]}
                >
                  {d.name}
                </Text>
                <Text style={[typography.captionBold, { color: colors.primary }]}>Connect</Text>
              </PressableScale>
            ))}
            {scanning && found.length === 0 ? (
              <Text
                style={[
                  typography.caption,
                  { color: colors.text.secondary, marginTop: spacing.sm },
                ]}
              >
                Wake your monitor (wear it or wet the strap).
              </Text>
            ) : null}
          </>
        )}
        {bleError ? (
          <Text style={[typography.caption, { color: colors.error, marginTop: spacing.sm }]}>
            {bleError}
          </Text>
        ) : null}
      </Card>

      {/* Apple Health */}
      <Card variant="surface1" style={{ padding: spacing.base, marginTop: spacing.md }}>
        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Apple Health</Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
          Apple Health exists only on iPhone. This is the Android version, so it connects through
          Health Connect instead.
        </Text>
      </Card>

      {/* FHIR export */}
      <Card style={{ padding: spacing.base, marginTop: spacing.md }}>
        <View style={styles.titleRow}>
          <Ionicons name="document-text-outline" size={22} color={colors.primary} />
          <Text
            style={[typography.subheading, { color: colors.text.primary, marginLeft: 8, flex: 1 }]}
          >
            Share with a clinician
          </Text>
        </View>
        <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6 }]}>
          Export your records as an HL7 FHIR R4 bundle, the standard many health systems and apps
          can read. It is labelled as recorded by you, not clinically verified. You choose where it
          goes.
        </Text>
        <Button
          label="Export FHIR record"
          size="sm"
          variant="outline"
          onPress={exportFhir}
          style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
        />
      </Card>

      {/* Consent and audit */}
      <Text
        style={[
          typography.subheading,
          { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
        ]}
      >
        Access history
      </Text>
      <Text
        style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}
      >
        Every time data is connected, read, written, exported or removed. Kept on this phone.
      </Text>
      {s.auditLog.length === 0 ? (
        <Text style={[typography.subbody, { color: colors.text.secondary }]}>Nothing yet.</Text>
      ) : (
        s.auditLog.slice(0, 40).map((e) => (
          <View key={e.id} style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                {ACTION_LABEL[e.action] ?? e.action} · {SOURCE_LABEL[e.source] ?? e.source}
              </Text>
              <Text
                style={[typography.caption, { color: colors.text.secondary }]}
                numberOfLines={2}
              >
                {e.detail}
              </Text>
            </View>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              {new Date(e.at).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>
        {s.consentRecords.length} consent decision{s.consentRecords.length === 1 ? '' : 's'}{' '}
        recorded.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    minHeight: 56,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    minHeight: 48,
  },
  device: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginTop: 8,
    minHeight: 52,
  },
});
