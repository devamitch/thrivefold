import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { coachVoice } from '../../services/ai/coachVoice';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { PressableScale } from '../ui/PressableScale';

/** Numbered how-to steps for an exercise, with a button that has the coach read them aloud. */
export function CoachGuide({ title = 'How to do it', steps, tip }: { title?: string; steps: string[]; tip?: string }) {
  const { colors, typography } = useTheme();
  const speak = () => {
    coachVoice.stop();
    void coachVoice.speak(steps.map((s, i) => `Step ${i + 1}. ${s}`).join(' ') + (tip ? ` Tip: ${tip}` : ''), { priority: 3, maxMs: 30_000 });
  };
  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>{title}</Text>
        <PressableScale onPress={speak} accessibilityLabel="Hear the instructions" style={[styles.listen, { backgroundColor: colors.primaryAlpha }]}>
          <Ionicons name="volume-high-outline" size={16} color={colors.primary} />
          <Text style={[typography.captionBold, { color: colors.primary }]}>Hear it</Text>
        </PressableScale>
      </View>
      {steps.map((s, i) => (
        <View key={i} style={styles.step}>
          <View style={[styles.num, { backgroundColor: colors.primary }]}>
            <Text style={[typography.captionBold, { color: colors.text.inverse }]}>{i + 1}</Text>
          </View>
          <Text style={[typography.subbody, styles.flex, { color: colors.text.secondary }]}>{s}</Text>
        </View>
      ))}
      {tip ? <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6 }]}>Tip: {tip}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginTop: 12 },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  listen: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  step: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 5 },
  num: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
});
