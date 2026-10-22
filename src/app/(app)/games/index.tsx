import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';

export default function GamesScreen() {
  const { colors, typography, spacing } = useTheme();

  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession === 'game_breathe') {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            setBreathPhase((current) => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              if (current === 'Inhale') return 'Hold';
              if (current === 'Hold') return 'Exhale';
              if (current === 'Exhale') return 'Rest';
              setCycleCount((c) => c + 1);
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const games = [
    {
      id: 'game_breathe',
      title: 'Harmonic Box Breathing',
      type: 'Nervous System Reset',
      desc: 'An interactive 4-4-4-4 box breathing guide with gentle haptic rhythms to reduce acute autonomic heart rate.',
      icon: 'cloud-outline' as const,
    },
    {
      id: 'game_focus',
      title: 'Sensory Grounding (5-4-3-2-1)',
      type: 'Cognitive Grounding',
      desc: 'Step-by-step sensory check: 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.',
      icon: 'locate-outline' as const,
    },
    {
      id: 'game_reflex',
      title: 'Calm Pulse Synchronization',
      type: 'Rhythm Coordination',
      desc: 'Tap along with steady 60 BPM ambient tempo pulses to synchronize breath and recover relaxed presence.',
      icon: 'musical-notes-outline' as const,
    },
  ];

  const handleStartGame = (gameId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setActiveSession(gameId);
    setBreathPhase('Inhale');
    setBreathTimer(4);
    setCycleCount(0);
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Wellness Arcade" subtitle="Interactive Calming Exercises" showBack />
      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card variant="surface1" style={{ marginBottom: spacing.md, padding: spacing.base }}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
            Restorative Play
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            No punishing loss mechanics or stress timers. These micro-games soothe sympathetic nervous system overdrive.
          </Text>
        </Card>

        {games.map((g) => (
          <Card key={g.id} style={{ marginBottom: spacing.md }}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: colors.surface1 }]}>
                <Ionicons name={g.icon} size={26} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Badge label={g.type} variant="primary" style={{ marginBottom: 4 }} />
                <Text style={[typography.subheading, { color: colors.text.primary }]}>
                  {g.title}
                </Text>
              </View>
            </View>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginVertical: spacing.sm }]}>
              {g.desc}
            </Text>
            <Button
              label={g.id === 'game_breathe' ? 'Start Box Breathing' : 'Begin Exercise'}
              size="sm"
              variant="outline"
              onPress={() => handleStartGame(g.id)}
            />
          </Card>
        ))}

        {/* Breathing Exercise Modal */}
        <Modal visible={activeSession === 'game_breathe'} transparent animationType="fade">
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.75)' }]}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>
                  Box Breathing Session
                </Text>
                <Pressable onPress={() => setActiveSession(null)}>
                  <Ionicons name="close-circle-outline" size={26} color={colors.text.muted} />
                </Pressable>
              </View>

              <View style={styles.orbWrapper}>
                <View
                  style={[
                    styles.breathingOrb,
                    {
                      borderColor: colors.primary,
                      backgroundColor: colors.primaryAlpha,
                      transform: [
                        {
                          scale:
                            breathPhase === 'Inhale'
                              ? 1.25
                              : breathPhase === 'Hold'
                              ? 1.25
                              : breathPhase === 'Exhale'
                              ? 0.95
                              : 0.95,
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={[typography.heading, { color: colors.primary }]}>{breathPhase}</Text>
                  <Text style={[typography.display, { color: colors.primary, marginTop: 4 }]}>
                    {breathTimer}
                  </Text>
                </View>
              </View>

              <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center', marginTop: 16 }]}>
                Completed Cycles: {cycleCount} · Synchronize lungs with the pulse
              </Text>

              <Button
                label="End Session"
                variant="outline"
                size="md"
                style={{ marginTop: 20 }}
                onPress={() => setActiveSession(null)}
              />
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  orbWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  breathingOrb: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
