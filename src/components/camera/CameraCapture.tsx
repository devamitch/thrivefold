import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FoodCameraView, type FoodCameraHandle } from '../../../modules/pose-landmarker/food';
import { ensureCameraPermission } from '../../services/sensors/cameraPermission';
import { PressableScale } from '../ui/PressableScale';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Called with a file:// photo in the app cache. */
  onPhoto: (uri: string) => void;
  facing?: 'front' | 'back';
  title: string;
  /** Short framing guidance shown over the preview. */
  hint?: string;
  /** Outline guide drawn on the preview. */
  guide?: 'face' | 'body' | 'document' | 'none';
}

/**
 * Full-screen in-app camera (CameraX through Thrivefold's native module). Staying inside the app
 * avoids handing off to the system camera, which low-memory phones answer by closing Thrivefold.
 * Offers a gallery import too, and flips between front and back cameras.
 */
export function CameraCapture({ visible, onClose, onPhoto, facing = 'back', title, hint, guide = 'none' }: Props) {
  const insets = useSafeAreaInsets();
  const ref = useRef<FoodCameraHandle>(null);
  const [side, setSide] = useState(facing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const onShow = async () => {
    setSide(facing);
    setError(null);
    setAllowed(await ensureCameraPermission());
  };

  const shoot = async () => {
    if (!ref.current || busy) return;
    setBusy(true);
    try {
      const uri = await ref.current.capture();
      onPhoto(uri);
    } catch {
      setError('The photo could not be taken. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const gallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (!r.canceled && r.assets[0]) onPhoto(r.assets[0].uri);
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onShow={() => void onShow()} onRequestClose={onClose}>
      <View style={styles.root}>
        {FoodCameraView && allowed ? (
          <FoodCameraView ref={ref} active={visible} facing={side} labels={false} style={StyleSheet.absoluteFill} onFoodError={(e) => setError(e.nativeEvent.message)} />
        ) : (
          <View style={styles.center}>
            <Text style={styles.light}>{allowed === false ? 'Camera access was not allowed. Allow it in Android settings, or choose a photo.' : 'Starting the camera…'}</Text>
          </View>
        )}

        {guide === 'face' ? <View pointerEvents="none" style={[styles.guide, styles.faceGuide]} /> : null}
        {guide === 'body' ? <View pointerEvents="none" style={[styles.guide, styles.bodyGuide]} /> : null}
        {guide === 'document' ? <View pointerEvents="none" style={[styles.guide, styles.docGuide]} /> : null}

        <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
          <PressableScale onPress={onClose} accessibilityLabel="Close camera" style={styles.round}>
            <Ionicons name="close" size={24} color="#FFF" />
          </PressableScale>
          <Text style={[styles.light, styles.title]}>{title}</Text>
          <View style={styles.round} />
        </View>
        {hint ? (
          <View style={styles.hintWrap}>
            <Text style={[styles.light, styles.hint]}>{hint}</Text>
          </View>
        ) : null}
        {error ? <Text style={[styles.light, styles.error]}>{error}</Text> : null}

        <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
          <PressableScale onPress={() => void gallery()} accessibilityLabel="Choose from gallery" style={styles.round}>
            <Ionicons name="images-outline" size={24} color="#FFF" />
          </PressableScale>
          <PressableScale onPress={() => void shoot()} accessibilityLabel="Take photo" style={styles.shutter}>
            {busy ? <ActivityIndicator color="#000" /> : <View style={styles.shutterInner} />}
          </PressableScale>
          <PressableScale onPress={() => setSide((s) => (s === 'front' ? 'back' : 'front'))} accessibilityLabel="Switch camera" style={styles.round}>
            <Ionicons name="camera-reverse-outline" size={24} color="#FFF" />
          </PressableScale>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  light: { color: '#FFFFFF' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  title: { fontSize: 17, fontWeight: '700' },
  round: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  hintWrap: { position: 'absolute', top: 120, left: 24, right: 24, alignItems: 'center' },
  hint: { textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, overflow: 'hidden' },
  error: { position: 'absolute', bottom: 150, alignSelf: 'center', backgroundColor: 'rgba(160,40,40,0.8)', padding: 8, borderRadius: 10, overflow: 'hidden' },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  shutter: { width: 78, height: 78, borderRadius: 39, backgroundColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#FFF' },
  guide: { position: 'absolute', alignSelf: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.75)', borderStyle: 'dashed' },
  faceGuide: { top: '22%', width: 240, height: 320, borderRadius: 160 },
  bodyGuide: { top: '12%', width: '58%', height: '72%', borderRadius: 120 },
  docGuide: { top: '18%', width: '84%', height: '58%', borderRadius: 16 },
});
