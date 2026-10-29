import { Ionicons } from '@expo/vector-icons';
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
 * Asks once, plainly, to download the on-device brain so the coach can answer offline, and shows
 * real progress. Hidden when a model is already answering or the phone cannot run one.
 */
export function BrainSetupCard({ compact = false }: { compact?: boolean }) {
  const { colors, typography } = useTheme();
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
      style={[styles.card, { backgroundColor: colors.primaryAlpha, borderColor: colors.primary }]}
    >
      <View style={styles.row}>
        <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
        <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>
          {busy ? 'Setting up the on-device brain' : 'Let Thrive answer offline'}
        </Text>
      </View>
      {!compact || busy ? (
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
          {setup?.phase === 'downloading'
            ? `Downloading ${model.name}: ${pct}% of ${model.sizeMb} MB`
            : setup?.phase === 'verifying'
              ? 'Checking the file is genuine…'
              : setup?.phase === 'loading'
                ? 'Starting it up…'
                : `One download of ${model.sizeMb} MB (Wi-Fi recommended). After that, answers are written on this phone, even with no internet.`}
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
      <View style={[styles.row, { marginTop: 10 }]}>
        {busy ? (
          setup?.phase === 'downloading' ? (
            <>
              <Button label="Pause" size="sm" variant="outline" onPress={() => void pauseSetup()} />
              <Button label="Cancel" size="sm" variant="ghost" onPress={() => void cancelSetup()} />
            </>
          ) : null
        ) : setup?.phase === 'paused' ? (
          <>
            <Button label={`Resume (${pct}%)`} size="sm" onPress={() => void resumeSetup()} />
            <Button label="Cancel" size="sm" variant="ghost" onPress={() => void cancelSetup()} />
          </>
        ) : (
          <Button
            label={setup?.phase === 'failed' ? 'Try again' : `Download ${model.sizeMb} MB`}
            size="sm"
            onPress={() => void setUpBrain(model)}
          />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 10 },
  fill: { height: '100%' },
});
