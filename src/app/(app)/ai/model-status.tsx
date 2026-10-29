import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import {
  LocalAI,
  MODEL_PRESETS,
  deleteLocalModel,
  downloadModelWithProgress,
  getRecommendedModel,
  isModelDownloaded,
  type ModelDownloadHandle,
  type ModelPreset,
} from '../../../../modules/local-ai';
import { BrainSetupCard } from '../../../components/assistant/BrainSetupCard';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { askLocal, ensureLocalModel } from '../../../services/ai/localModel';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

/**
 * On-device AI: download a language model once (Wi-Fi recommended), and Thrive Coach, global
 * search and meal plans answer on the phone with llama.cpp. Files are checked against their
 * published SHA-256 before use.
 */
export default function ModelStatusScreen() {
  const { colors, typography, spacing } = useTheme();
  const chosen = useRootStore((s) => s.localModelId);
  const setChosen = useRootStore((s) => s.setLocalModelId);
  const [have, setHave] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'testing'>(LocalAI.isLoaded() ? 'ready' : 'idle');
  const [reply, setReply] = useState<string | null>(null);
  const handles = useRef<Record<string, ModelDownloadHandle>>({});
  const supported = LocalAI.isAvailable();
  const caps = supported ? LocalAI.getDeviceCapabilities() : null;
  const recommended = getRecommendedModel(caps?.totalRamMb ?? 4000);

  const refresh = async () => {
    const out: Record<string, boolean> = {};
    for (const m of MODEL_PRESETS) out[m.id] = await isModelDownloaded(m.id);
    setHave(out);
  };
  useEffect(() => {
    void refresh();
  }, []);

  const download = (m: ModelPreset) => {
    setError(null);
    setProgress((p) => ({ ...p, [m.id]: 0 }));
    const h = downloadModelWithProgress(
      m,
      caps?.availableStorageBytes ?? 0,
      (info) => setProgress((p) => ({ ...p, [m.id]: info.progress ?? 0 })),
      (path, hash) => LocalAI.verifyModelChecksum(path, hash),
    );
    handles.current[m.id] = h;
    h.promise
      .then(async () => {
        await refresh();
        setChosen(m.id);
        await load();
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Download failed'))
      .finally(() =>
        setProgress((p) => {
          const n = { ...p };
          delete n[m.id];
          return n;
        }),
      );
  };

  const load = async () => {
    setState('loading');
    if (LocalAI.isLoaded()) await LocalAI.unloadModel();
    const ok = await ensureLocalModel();
    setState(ok ? 'ready' : 'idle');
    if (!ok) setError('The model could not load. Close other apps to free memory and try again.');
  };

  const test = async () => {
    setState('testing');
    const out = await askLocal(
      'Say hello in one short, friendly sentence and suggest one healthy habit for today.',
      'You are Thrive, a brief, warm wellbeing coach.',
    );
    setReply(out ?? 'No answer.');
    setState('ready');
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader eyebrow="AI" title="On-device AI" subtitle="A language model that runs on this phone" showBack />
      }
    >
      <View style={{ marginTop: 12 }}>
        <BrainSetupCard />
      </View>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="hardware-chip-outline" size={22} color={colors.primary} />
          <View style={styles.flex}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
              {supported ? 'llama.cpp engine ready' : 'Not available on this device'}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {caps
                ? `${Math.round(caps.totalRamMb / 1024)} GB RAM · ${Math.round(caps.availableStorageMb / 1024)} GB free storage`
                : ''}
            </Text>
          </View>
          <Badge
            label={state === 'ready' ? 'Loaded' : state === 'loading' ? 'Loading' : 'Not loaded'}
            variant={state === 'ready' ? 'success' : 'neutral'}
          />
        </View>
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
          Thrive Coach, global search and meal plans use it. Without a model, commands and today&apos;s numbers still
          work.
        </Text>
      </Card>

      {MODEL_PRESETS.map((m) => {
        const pct = progress[m.id];
        const downloaded = have[m.id];
        return (
          <Card key={m.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{m.name}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>{m.description}</Text>
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                  {m.sizeMb} MB · needs about {Math.round(m.minRamMb / 1024)} GB RAM · {m.license}
                </Text>
              </View>
              {m.id === recommended.id ? <Badge label="Best for this phone" variant="gold" /> : null}
            </View>
            {pct !== undefined ? (
              <View style={{ marginTop: 10 }}>
                <View style={[styles.track, { backgroundColor: colors.surface1 }]}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${Math.round(pct * 100)}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
                <View style={[styles.row, { marginTop: 6 }]}>
                  <Text style={[typography.caption, styles.flex, { color: colors.text.secondary }]}>
                    Downloading {Math.round(pct * 100)}%
                  </Text>
                  <Button
                    label="Cancel"
                    size="sm"
                    variant="ghost"
                    onPress={() => void handles.current[m.id]?.cancel()}
                  />
                </View>
              </View>
            ) : downloaded ? (
              <View style={[styles.row, { marginTop: 10 }]}>
                <Button
                  label={chosen === m.id && state === 'ready' ? 'In use' : 'Use this model'}
                  size="sm"
                  disabled={chosen === m.id && state === 'ready'}
                  onPress={() => {
                    setChosen(m.id);
                    void load();
                  }}
                />
                <Button
                  label="Delete"
                  size="sm"
                  variant="ghost"
                  onPress={async () => {
                    if (chosen === m.id) {
                      await LocalAI.unloadModel();
                      setChosen(null);
                      setState('idle');
                    }
                    await deleteLocalModel(m.id);
                    void refresh();
                  }}
                />
              </View>
            ) : (
              <Button
                label={`Download ${m.sizeMb} MB`}
                size="sm"
                variant="outline"
                disabled={!supported}
                onPress={() => download(m)}
                style={{ marginTop: 10, alignSelf: 'flex-start' }}
              />
            )}
          </Card>
        );
      })}

      {error ? <Text style={[typography.caption, { color: colors.error, marginTop: 10 }]}>{error}</Text> : null}
      {state === 'loading' || state === 'testing' ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
      ) : null}
      {state === 'ready' ? (
        <Button label="Try it" variant="outline" onPress={() => void test()} style={{ marginTop: 12 }} />
      ) : null}
      {reply ? <Text style={[typography.body, { color: colors.text.primary, marginTop: 10 }]}>{reply}</Text> : null}
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: 12 }]}>
        Models come from Qwen (Apache-2.0) on Hugging Face and are checked against their published SHA-256. Answers are
        general guidance, not medical advice.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%' },
});
