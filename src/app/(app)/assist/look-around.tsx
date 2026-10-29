import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { MediaPipeTools, type DetectedObject } from '../../../../modules/pose-landmarker/tools';
import { CameraCapture } from '../../../components/camera/CameraCapture';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { coachVoice } from '../../../services/ai/coachVoice';
import { describeObjects } from '../../../domain/assist/objects';
import { useTheme } from '../../../theme/useTheme';

/** "What's in front of me": take a photo and hear the objects in it, found on the phone (MediaPipe Object Detector). */
export default function LookAroundScreen() {
  const { colors, typography, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const [uri, setUri] = useState<string | null>(null);
  const [objects, setObjects] = useState<DetectedObject[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [said, setSaid] = useState<string | null>(null);

  const [cam, setCam] = useState(false);
  const look = (photo: string) => {
    void analyse(photo);
  };
  const analyse = async (photo: string) => {
    setError(null);
    setUri(photo);
    if (!MediaPipeTools) {
      setError('Object detection is not available on this device.');
      return;
    }
    setBusy(true);
    try {
      const found = await MediaPipeTools.detectObjects(photo);
      setObjects(found);
      const text = describeObjects(found);
      setSaid(text);
      void coachVoice.speak(text, { priority: 3, maxMs: 12_000 });
    } catch {
      setError('Could not look at that photo.');
    } finally {
      setBusy(false);
    }
  };

  const w = width - 32;
  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="ASSIST"
          title="What's around me"
          subtitle="Photo → spoken list of objects, on this phone"
          showBack
        />
      }
    >
      <Button
        label="Take a photo and tell me"
        size="lg"
        onPress={() => setCam(true)}
        accessibilityHint="Opens the camera, then reads out what it sees"
      />
      {busy ? <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} /> : null}
      {error ? <Text style={[typography.body, { color: colors.error, marginTop: 12 }]}>{error}</Text> : null}
      {said ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[typography.subheading, { color: colors.text.primary, marginTop: 16 }]}
        >
          {said}
        </Text>
      ) : null}
      {uri ? (
        <View style={[styles.photo, { width: w, height: w * 1.33 }]}>
          <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="contain" />
          {objects.map((o, i) => (
            <View
              key={i}
              style={[
                styles.box,
                {
                  borderColor: colors.primary,
                  left: `${o.box[0] * 100}%`,
                  top: `${o.box[1] * 100}%`,
                  width: `${(o.box[2] - o.box[0]) * 100}%`,
                  height: `${(o.box[3] - o.box[1]) * 100}%`,
                },
              ]}
            >
              <Text style={[styles.tag, { backgroundColor: colors.primary }]}>{o.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={16} color={colors.text.muted} />
        <Text style={[typography.caption, { color: colors.text.muted, flex: 1 }]}>
          Recognises about 80 everyday objects (people, cups, chairs, phones, vehicles…). It can be wrong; do not rely
          on it for safety.
        </Text>
      </View>
      <CameraCapture
        visible={cam}
        onClose={() => setCam(false)}
        title="What's around me"
        hint="Point the camera, then press the big button"
        onPhoto={(photo) => {
          setCam(false);
          look(photo);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  photo: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  box: { position: 'absolute', borderWidth: 2, borderRadius: 6 },
  tag: {
    position: 'absolute',
    top: -2,
    left: -2,
    color: '#FFF',
    fontSize: 11,
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  note: { flexDirection: 'row', gap: 6, marginTop: 16 },
});
