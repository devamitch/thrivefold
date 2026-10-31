import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  brainReady,
  cancelSetup,
  pauseSetup,
  resumeSetup,
  recommendedModel,
  setUpBrain,
  subscribeSetup,
  type SetupState,
} from '../../services/ai/modelSetup';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui';
import { Button } from '../ui/Button';

/**
 * Asks plainly to download the on-device brain so Anvay can answer offline, and shows
 * real progress. Hidden when a model is already answering or the phone cannot run one.
 */
export function BrainSetupCard({ compact = false }: { compact?: boolean }) {
  const { colors, typography } = useTheme();
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<SetupState | null>(null);
  const model = recommendedModel();

  useEffect(() => subscribeSetup(setSetup), []);
  useEffect(() => {
    void brainReady().then(setReady);
  }, [setup?.phase]);

  if (!model || ready === null || ready || setup?.phase === 'ready') return null;
  const busy =
    setup?.phase === 'downloading' || setup?.phase === 'verifying' || setup?.phase === 'loading';
  const pct = Math.round((setup?.progress ?? 0) * 100);

  return (
    <Card
      style={[styles.card, { backgroundColor: colors.surface1, borderColor: colors.primary }]}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryAlpha }]}>
          <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
            {busy ? 'Setting up On-Device Anvay' : 'Anvay On-Device AI Setup'}
          </Text>
          <Text style={[typography.caption, { color: colors.text.muted }]}>
            {busy ? `Downloading ${pct}%` : 'Private · 100% Offline'}
          </Text>
        </View>
      </View>

      {!compact || busy ? (
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 8, lineHeight: 18 }]}>
          {setup?.phase === 'downloading'
            ? `Downloading ${model.name}: ${pct}% of ${model.sizeMb} MB via Android DownloadManager. It continues in the background if you leave the app.`
            : setup?.phase === 'verifying'
              ? 'Verifying SHA-256 integrity of the local model…'
              : setup?.phase === 'loading'
                ? 'Initializing on-device engine into memory…'
                : `Download ${model.name} (${model.sizeMb} MB) for private on-device intelligence without internet. If you recently reinstalled the app or cleared storage, Android purges local model files—tap below to restore.`}
        </Text>
      ) : null}

      {setup?.phase === 'downloading' ? (
        <View style={[styles.track, { backgroundColor: colors.surface2 }]}>
          <View style={[styles.fill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
        </View>
      ) : null}

      {setup?.phase === 'failed' && setup.message ? (
        <Text style={[typography.caption, { color: colors.error, marginTop: 6 }]}>
          {setup.message}
        </Text>
      ) : null}

      <View style={[styles.row, { marginTop: 12, flexWrap: 'wrap', gap: 8 }]}>
        {busy ? (
          setup?.phase === 'downloading' ? (
            <>
              {setup?.durable ? null : (
                <Button label="Pause" size="sm" variant="outline" onPress={() => void pauseSetup()} />
              )}
              <Button label="Cancel" size="sm" variant="ghost" onPress={() => void cancelSetup()} />
            </>
          ) : null
        ) : setup?.phase === 'paused' ? (
          <>
            <Button label={`Resume (${pct}%)`} size="sm" onPress={() => void resumeSetup()} />
            <Button label="Cancel" size="sm" variant="ghost" onPress={() => void cancelSetup()} />
          </>
        ) : (
          <>
            <Button
              label={setup?.phase === 'failed' ? 'Try again' : `Download ${model.sizeMb} MB`}
              size="sm"
              onPress={() => void setUpBrain(model)}
            />
            <Button
              label="Use Cloud Key (BYOK)"
              size="sm"
              variant="outline"
              onPress={() => router.push('/(app)/settings/ai-byok' as Href)}
            />
          </>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: 18, borderWidth: 1.5, padding: 14, marginBottom: 14 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 10 },
  fill: { height: '100%' },
});
