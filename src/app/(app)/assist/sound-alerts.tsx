import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, Vibration, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { importantSound } from '../../../domain/assist/sounds';
import { useAudioSense } from '../../../services/voice/useAudioSense';
import { useTheme } from '../../../theme/useTheme';

/**
 * Sound alerts for people who are hard of hearing: while this screen is open, the phone listens
 * and names what it hears (MediaPipe Audio Classifier, YAMNet), with a strong vibration and big
 * text for alarms, sirens, a crying baby, the doorbell, knocking, a dog or breaking glass.
 */
export default function SoundAlertsScreen() {
  const { colors, typography, spacing } = useTheme();
  const [now, setNow] = useState<{ label: string; score: number }[]>([]);
  const [log, setLog] = useState<{ label: string; at: number }[]>([]);
  const lastAlert = useRef<Record<string, number>>({});

  const audio = useAudioSense({
    onSound: (e) => {
      setNow(e.categories.slice(0, 3));
      const hit = e.categories.map((c) => importantSound(c.label, c.score)).find(Boolean);
      if (hit && Date.now() - (lastAlert.current[hit] ?? 0) > 8000) {
        lastAlert.current[hit] = Date.now();
        Vibration.vibrate([0, 400, 150, 400]);
        setLog((l) => [{ label: hit, at: e.at }, ...l].slice(0, 30));
      }
    },
  });

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="ASSIST"
          title="Sound alerts"
          subtitle="Names important sounds around you, on this phone"
          showBack
        />
      }
    >
      <Button
        label={audio.listening ? 'Stop listening' : 'Start listening'}
        size="lg"
        variant={audio.listening ? 'outline' : 'primary'}
        onPress={() => (audio.listening ? audio.stop() : void audio.start(true))}
      />
      {audio.error ? (
        <Text style={[typography.body, { color: colors.error, marginTop: 10 }]}>{audio.error}</Text>
      ) : null}

      <Card style={styles.card}>
        <Text style={[typography.caption, { color: colors.text.muted }]}>
          {audio.listening ? 'Hearing now' : 'Not listening'}
        </Text>
        {audio.listening && now.length ? (
          now.map((c) => (
            <View key={c.label} style={styles.row}>
              <Text style={[typography.subheading, styles.flex, { color: colors.text.primary }]}>{c.label}</Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>{Math.round(c.score * 100)}%</Text>
            </View>
          ))
        ) : (
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: 4 }]}>
            {audio.listening ? 'Quiet…' : 'Tap Start listening.'}
          </Text>
        )}
      </Card>

      {log.length ? (
        <Card style={styles.card}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Alerts</Text>
          {log.map((l, i) => (
            <View key={i} style={styles.row}>
              <Ionicons name="notifications" size={18} color={colors.warning} />
              <Text
                accessibilityLiveRegion="assertive"
                style={[typography.subheading, styles.flex, { color: colors.text.primary, marginLeft: 8 }]}
              >
                {l.label}
              </Text>
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                {new Date(l.at).toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      <Text style={[typography.caption, { color: colors.text.muted, marginTop: 12 }]}>
        Listens only while this screen is open. Audio is analysed in memory and never recorded. It can miss sounds or
        mislabel them; never rely on it instead of a smoke alarm or other safety device.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
});
