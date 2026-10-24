/**
 * Bluetooth LE heart-rate monitors (chest straps, watches in broadcast mode) through the
 * standard GATT Heart Rate profile: service 0x180D, measurement characteristic 0x2A37.
 * Scanning and connecting only happen while the person is on the devices screen.
 */
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, State, type Device, type Subscription } from 'react-native-ble-plx';

import { base64ToBytes, parseHeartRateMeasurement } from '../../domain/interop/readings';

const HR_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
const HR_MEASUREMENT = '00002a37-0000-1000-8000-00805f9b34fb';

let manager: BleManager | null = null;
const getManager = () => (manager ??= new BleManager());

export async function ensureBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version >= 31) {
    const res = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return Object.values(res).every((v) => v === PermissionsAndroid.RESULTS.GRANTED);
  }
  const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  return res === PermissionsAndroid.RESULTS.GRANTED;
}

export async function bluetoothOn(): Promise<boolean> {
  return (await getManager().state()) === State.PoweredOn;
}

/** Scans for devices advertising the Heart Rate service; returns a stop function. */
export function scanHeartRateMonitors(onFound: (d: { id: string; name: string }) => void, onError: (msg: string) => void): () => void {
  const m = getManager();
  const seen = new Set<string>();
  m.startDeviceScan([HR_SERVICE], { allowDuplicates: false }, (error, device) => {
    if (error) {
      onError(error.message);
      return;
    }
    if (device && !seen.has(device.id)) {
      seen.add(device.id);
      onFound({ id: device.id, name: device.name ?? device.localName ?? 'Heart-rate monitor' });
    }
  });
  const timer = setTimeout(() => m.stopDeviceScan(), 20000);
  return () => {
    clearTimeout(timer);
    m.stopDeviceScan();
  };
}

export interface HeartRateConnection {
  device: Device;
  stop: () => Promise<void>;
}

/** Connects and streams beats per minute until stopped. */
export async function connectHeartRate(deviceId: string, onBpm: (bpm: number) => void, onDisconnect: () => void): Promise<HeartRateConnection> {
  const m = getManager();
  m.stopDeviceScan();
  const device = await m.connectToDevice(deviceId, { timeout: 15000 });
  await device.discoverAllServicesAndCharacteristics();
  const sub: Subscription = device.monitorCharacteristicForService(HR_SERVICE, HR_MEASUREMENT, (error, ch) => {
    if (error || !ch?.value) return;
    const bpm = parseHeartRateMeasurement(base64ToBytes(ch.value));
    if (bpm && bpm > 20 && bpm < 250) onBpm(bpm);
  });
  const discSub = m.onDeviceDisconnected(deviceId, () => onDisconnect());
  return {
    device,
    stop: async () => {
      sub.remove();
      discSub.remove();
      try {
        await m.cancelDeviceConnection(deviceId);
      } catch {
        // Already disconnected.
      }
    },
  };
}
