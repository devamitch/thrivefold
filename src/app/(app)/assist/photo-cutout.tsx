import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, Text, View, useWindowDimensions, type GestureResponderEvent } from 'react-native';

import { MediaPipeTools } from '../../../../modules/pose-landmarker/tools';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

/**
 * Tap-to-cut-out: choose a photo, tap the thing you want, and get it on a transparent background
 * (MediaPipe Interactive Segmenter, on this phone). Use it as your profile picture or share it.
 */
export default function PhotoCutoutScreen() {
  const { colors, typography, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const user = useRootStore((s) => s.user);
  const setUser = useRootStore((s) => s.setUser);
  const [uri, setUri] = useState<string | null>(null);
  const [ratio, setRatio] = useState(1);
  const [cut, setCut] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const w = width - 32;

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (r.canceled || !r.assets[0]) return;
    setUri(r.assets[0].uri);
    setRatio(r.assets[0].height && r.assets[0].width ? r.assets[0].height / r.assets[0].width : 1);
    setCut(null);
    setMsg('Tap the thing you want to keep.');
  };

  const tap = async (e: GestureResponderEvent) => {
    if (!uri || !MediaPipeTools || busy) return;
    const x = e.nativeEvent.locationX / w;
    const y = e.nativeEvent.locationY / (w * ratio);
    setBusy(true);
    setMsg(null);
    try {
      const r = await MediaPipeTools.cutout(uri, Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y)));
      setCut(r.uri);
      setMsg(r.coverage < 0.01 ? 'Nothing clear was found there; try tapping the middle of the object.' : null);
    } catch {
      setMsg('Could not cut that out. Try another spot.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader eyebrow="ASSIST" title="Photo cutout" subtitle="Tap an object to lift it off the background" showBack />
      <ScreenScrollView contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl * 2 }}>
        <Button label={uri ? 'Choose another photo' : 'Choose a photo'} onPress={() => void pick()} />
        {msg ? <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 10 }]}>{msg}</Text> : null}
        {uri ? (
          <Pressable onPress={(e) => void tap(e)} style={[styles.photo, { width: w, height: w * ratio }]} accessibilityLabel="Photo; tap the object to cut out">
            <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="fill" />
          </Pressable>
        ) : null}
        {busy ? <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} /> : null}
        {cut ? (
          <>
            <View style={[styles.checker, { width: w, height: w * ratio }]}>
              <Image source={{ uri: cut }} style={StyleSheet.absoluteFill} contentFit="fill" />
            </View>
            <View style={styles.row}>
              {user ? (
                <Button
                  label="Use as profile picture"
                  size="sm"
                  variant="outline"
                  onPress={() => {
                    setUser({ ...user, photoUrl: cut });
                    setMsg('Profile picture updated.');
                  }}
                />
              ) : null}
              <Button label="Share" size="sm" variant="outline" onPress={() => void Share.share({ url: cut, message: cut })} />
            </View>
          </>
        ) : null}
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 12 }]}>Works on the phone; your photo is not uploaded.</Text>
      </ScreenScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  photo: { marginTop: 12, borderRadius: 16, overflow: 'hidden' },
  checker: { marginTop: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: '#E9E5DD' },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
});
