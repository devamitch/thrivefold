import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { BetaBadge } from '../../../components/ui/Badge';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { coachVoice } from '../../../services/ai/coachVoice';
import { hapticSelection, hapticSuccess } from '../../../services/haptics';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';
import { Toggle } from '../../../components/ui/Toggle';

export default function VoiceCoachBetaScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const [lastSpoken, setLastSpoken] = useState<string>('Ready for voice coaching');
  const voiceOn = useRootStore((s) => s.coachVoiceEnabled);
  const setVoiceOn = useRootStore((s) => s.setCoachVoiceEnabled);

  const tick = useCallback(() => {
    hapticSelection();
  }, []);

  const testSpeak = (text: string, priority: 1 | 2 | 3 = 2) => {
    tick();
    setLastSpoken(text);
    hapticSuccess();
    void coachVoice.speak(text, { priority });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="BETA LAB · AUDIO GUIDANCE"
          title="Spoken Coach Studio"
          subtitle="Priority-based native speech synthesis, rep cues & exercise pacing"
          showBack
          onBack={() => router.back()}
          rightAction={<BetaBadge />}
        />
      }
    >
      <SquircleSurface radius={24} fill={colors.surface} style={[styles.card, { marginTop: spacing.sm }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="volume-high-outline" size={20} color={colors.primary} />
          <Text style={[typography.subheading, { color: colors.text.primary, flex: 1 }]}>
            Coach Voice Testing Harness
          </Text>
          <SquircleSurface radius={8} fill={colors.primaryAlpha} style={styles.pill}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>expo-speech</Text>
          </SquircleSurface>
        </View>

        <Text style={[typography.body, { color: colors.text.muted, marginTop: 4 }]}>
          Real-time audio feedback with priority queueing. Prevents overlapping speech, honors device mute, and
          coordinates with haptic pulses.
        </Text>

        {/* Current Cue Box */}
        <SquircleSurface radius={18} fill={colors.surface2} style={styles.cueBox}>
          <Ionicons name="mic-outline" size={22} color={colors.primary} />
          <Text style={[typography.bodyBold, { color: colors.text.primary, flex: 1 }]}>&ldquo;{lastSpoken}&rdquo;</Text>
        </SquircleSurface>

        {/* Voice on/off: applies to workouts and every beta studio */}
        <View style={[styles.controlRow, { marginTop: spacing.md }]}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Coach voice</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              Spoken cues in workouts, eye, hand and breathing studios
            </Text>
          </View>
          <Toggle
            value={voiceOn}
            onValueChange={(v) => {
              tick();
              setVoiceOn(v);
            }}
            accessibilityLabel="Coach voice"
          />
        </View>

        {/* Test Phrasing Buttons */}
        <Text
          style={[
            typography.captionBold,
            {
              color: colors.text.muted,
              marginTop: spacing.lg,
              marginBottom: 8,
            },
          ]}
        >
          SAMPLE AUDIO CUES BY PRIORITY
        </Text>

        <View style={{ gap: 8 }}>
          <PressableScale
            onPress={() => testSpeak('Squat depth is optimal. Push through your heels.', 2)}
            scaleTo={0.97}
          >
            <SquircleSurface radius={16} fill={colors.surface2} style={styles.cueItem}>
              <View style={[styles.priorityDot, { backgroundColor: colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Rep Form Guidance (Priority 2)
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  &ldquo;Squat depth is optimal. Push through your heels.&rdquo;
                </Text>
              </View>
              <Ionicons name="play" size={16} color={colors.primary} />
            </SquircleSurface>
          </PressableScale>

          <PressableScale
            onPress={() => testSpeak('Caution: keep your spine neutral and shoulders back.', 1)}
            scaleTo={0.97}
          >
            <SquircleSurface radius={16} fill={colors.surface2} style={styles.cueItem}>
              <View style={[styles.priorityDot, { backgroundColor: colors.error }]} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Safety Correction (Priority 1)
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  &ldquo;Caution: keep your spine neutral and shoulders back.&rdquo;
                </Text>
              </View>
              <Ionicons name="play" size={16} color={colors.primary} />
            </SquircleSurface>
          </PressableScale>

          <PressableScale
            onPress={() => testSpeak('Ten blinks logged. Take a gentle 20 second distance focus.', 3)}
            scaleTo={0.97}
          >
            <SquircleSurface radius={16} fill={colors.surface2} style={styles.cueItem}>
              <View style={[styles.priorityDot, { backgroundColor: colors.dockActive }]} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  Ergonomic Reminder (Priority 3)
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  &ldquo;Ten blinks logged. Take a gentle 20 second distance focus.&rdquo;
                </Text>
              </View>
              <Ionicons name="play" size={16} color={colors.primary} />
            </SquircleSurface>
          </PressableScale>
        </View>

        {/* Stop audio button */}
        <PressableScale
          onPress={() => {
            tick();
            coachVoice.stop();
            setLastSpoken('Speech paused');
          }}
          scaleTo={0.96}
          style={{ marginTop: spacing.lg }}
        >
          <SquircleSurface radius={16} fill={colors.surface2} style={styles.stopBtn}>
            <Ionicons name="stop-circle-outline" size={18} color={colors.error} />
            <Text style={[typography.bodyBold, { color: colors.error }]}>Silence Audio Queue</Text>
          </SquircleSurface>
        </PressableScale>
      </SquircleSurface>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    marginVertical: 14,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stopBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
