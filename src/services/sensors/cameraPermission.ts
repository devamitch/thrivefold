import { PermissionsAndroid, Platform } from 'react-native';

/** Asks for the camera once, at the moment the person starts a camera feature. */
export async function ensureCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    if (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)) return true;
    const r = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return r === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}
