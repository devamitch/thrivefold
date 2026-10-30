import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { Ionicons } from '@expo/vector-icons';
import { hapticLight, hapticMedium, hapticSuccess } from '../../../services/haptics';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image } from 'expo-image';

import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { useTheme } from '../../../theme/useTheme';
import { PressableScale } from '../../../components/ui/PressableScale';

interface MemoryCard {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  matched: boolean;
}

const INITIAL_CARDS: Omit<MemoryCard, 'id' | 'matched'>[] = [
  { icon: 'flower-outline', label: 'Chamomile' },
  { icon: 'leaf-outline', label: 'Eucalyptus' },
  { icon: 'rose-outline', label: 'Wild Rose' },
  { icon: 'water-outline', label: 'Pure Spring' },
];

export default function GamesScreen() {
  const { colors, typography, spacing } = useTheme();

  const [activeSession, setActiveSession] = useState<string | null>(null);

  // Breathing state
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  // Memory game state
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);

  // Sensory Grounding state
  const [groundingStep, setGroundingStep] = useState(0);

  // Box Breathing loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession === 'game_breathe') {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            setBreathPhase((current) => {
              hapticLight();
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

  const initMemoryGame = () => {
    const deck = [...INITIAL_CARDS, ...INITIAL_CARDS]
      .sort(() => Math.random() - 0.5)
      .map((item, id) => ({ ...item, id, matched: false }));
    setCards(deck);
    setFlippedIndices([]);
    setMatchedPairs(0);
  };

  const handleCardPress = (index: number) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index) || cards[index].matched) {
      return;
    }
    hapticLight();

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      const [first, second] = nextFlipped;
      if (cards[first].label === cards[second].label) {
        hapticSuccess();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === first || i === second ? { ...c, matched: true } : c)),
          );
          setFlippedIndices([]);
          setMatchedPairs((p) => p + 1);
        }, 500);
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const games = [
    {
      id: 'game_breathe',
      title: 'Harmonic Box Breathing',
      type: 'Nervous System Reset',
      desc: 'Interactive 4-4-4-4 box breathing with gentle haptic rhythms to soothe sympathetic nervous overdrive.',
      icon: 'cloud-outline' as const,
    },
    {
      id: 'game_memory',
      title: 'Flora Rhythm Memory Match',
      type: 'Cognitive Calm',
      desc: 'Pair calming botanicals at your own gentle pace. Zero stress timers or penalties.',
      icon: 'flower-outline' as const,
    },
    {
      id: 'game_focus',
      title: 'Sensory Grounding (5-4-3-2-1)',
      type: 'Mindful Anchoring',
      desc: 'Step-by-step sensory check: observe sight, texture, sound, aroma, and taste to center present awareness.',
      icon: 'locate-outline' as const,
    },
  ];

  const handleStartGame = (gameId: string) => {
    hapticMedium();
    setActiveSession(gameId);
    if (gameId === 'game_breathe') {
      setBreathPhase('Inhale');
      setBreathTimer(4);
      setCycleCount(0);
    } else if (gameId === 'game_memory') {
      initMemoryGame();
    } else if (gameId === 'game_focus') {
      setGroundingStep(0);
    }
  };

  const groundingPrompts = [
    { count: '5', label: 'Notice 5 things you can see around you.', hint: 'Shapes, colors, soft light.' },
    { count: '4', label: 'Notice 4 physical textures you can feel.', hint: 'Your clothes, the chair, the phone surface, your breath.' },
    { count: '3', label: 'Notice 3 subtle sounds you can hear.', hint: 'Ambient hum, distant breeze, your heartbeat.' },
    { count: '2', label: 'Notice 2 scents in the air.', hint: 'Herbal tea, fresh air, clean cotton.' },
    { count: '1', label: 'Notice 1 taste or sensation of calm.', hint: 'Sip water or breathe deeply into your center.' },
  ];

  return (
    <ScreenWrapper scrollable>
      <Header title="Games" subtitle="Short breathing, focus and memory practice" showBack />
      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md, padding: 14, backgroundColor: colors.surface }}>
          <View style={styles.heroWrap}>
            <Image
              source={require('../../../../assets/illustrations/beta-hand-games.jpg')}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 12 }]}>
            Gentle Cognitive Rhythm
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, lineHeight: 18 }]}>
            No punishing loss conditions, lives, or stress clocks. These exercises restore balance to the nervous system and sync with your hormonal vitality.
          </Text>
        </Card>

        {games.map((g) => (
          <Card key={g.id} style={{ marginBottom: spacing.md, padding: spacing.md }}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: colors.surface1 }]}>
                <Ionicons name={g.icon} size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Badge label={g.type} variant="primary" style={{ marginBottom: 4 }} />
                <Text style={[typography.subheading, { color: colors.text.primary }]}>
                  {g.title}
                </Text>
              </View>
            </View>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginVertical: spacing.sm, lineHeight: 20 }]}>
              {g.desc}
            </Text>
            <Button
              label={g.id === 'game_breathe' ? 'Start Box Breathing' : g.id === 'game_memory' ? 'Play Flora Match' : 'Begin Grounding'}
              size="sm"
              variant="outline"
              onPress={() => handleStartGame(g.id)}
            />
          </Card>
        ))}

        {/* Breathing Exercise Modal */}
        <Modal visible={activeSession === 'game_breathe'} transparent animationType="fade">
          <GestureHandlerRootView style={styles.ghRoot}>
            <View style={[styles.modalOverlay, { backgroundColor: colors.scrim }]}>
              <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                <View style={styles.modalHeader}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    Harmonic Box Breathing
                  </Text>
                  <PressableScale onPress={() => setActiveSession(null)}>
                    <Ionicons name="close-circle-outline" size={26} color={colors.text.muted} />
                  </PressableScale>
                </View>

                <View style={styles.orbWrapper}>
                  <View
                    style={[
                      styles.breathingOrb,
                      {
                        backgroundColor: colors.primaryAlpha,
                        transform: [
                          {
                            scale:
                              breathPhase === 'Inhale'
                                ? 1.25
                                : breathPhase === 'Hold'
                                ? 1.25
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

                <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center', marginTop: 12 }]}>
                  Completed Cycles: {cycleCount} · Inhale for 4, hold for 4, exhale for 4, rest for 4.
                </Text>

                <Button
                  label="End Session"
                  variant="ghost"
                  size="md"
                  style={{ marginTop: 20 }}
                  onPress={() => setActiveSession(null)}
                />
              </View>
            </View>
          </GestureHandlerRootView>
        </Modal>

        {/* Memory Game Modal */}
        <Modal visible={activeSession === 'game_memory'} transparent animationType="fade">
          <GestureHandlerRootView style={styles.ghRoot}>
            <View style={[styles.modalOverlay, { backgroundColor: colors.scrim }]}>
              <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                <View style={styles.modalHeader}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    Flora Memory Match
                  </Text>
                  <PressableScale onPress={() => setActiveSession(null)}>
                    <Ionicons name="close-circle-outline" size={26} color={colors.text.muted} />
                  </PressableScale>
                </View>

                <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 16 }]}>
                  Pairs Found: {matchedPairs} of {INITIAL_CARDS.length}
                </Text>

                <View style={styles.grid}>
                  {cards.map((c, i) => {
                    const isFlipped = flippedIndices.includes(i) || c.matched;
                    return (
                      <PressableScale
                        key={c.id}
                        onPress={() => handleCardPress(i)}
                        style={[
                          styles.gridTile,
                          {
                            backgroundColor: c.matched
                              ? colors.primaryAlpha
                              : isFlipped
                              ? colors.surface1
                              : colors.surface1,
                          },
                        ]}
                      >
                        {isFlipped ? (
                          <>
                            <Ionicons name={c.icon} size={24} color={colors.primary} />
                            <Text style={[typography.caption, { color: colors.text.primary, fontSize: 10, marginTop: 2 }]}>
                              {c.label}
                            </Text>
                          </>
                        ) : (
                          <Ionicons name="cube-outline" size={20} color={colors.text.muted} />
                        )}
                      </PressableScale>
                    );
                  })}
                </View>

                {matchedPairs === INITIAL_CARDS.length && (
                  <View style={{ alignItems: 'center', marginTop: 16 }}>
                    <Text style={[typography.bodyBold, { color: colors.primary }]}>
                      All Flora Matched!
                    </Text>
                    <Button
                      label="Play Again"
                      size="sm"
                      variant="outline"
                      onPress={initMemoryGame}
                      style={{ marginTop: 8 }}
                    />
                  </View>
                )}

                <Button
                  label="Close"
                  variant="ghost"
                  size="md"
                  style={{ marginTop: 16 }}
                  onPress={() => setActiveSession(null)}
                />
              </View>
            </View>
          </GestureHandlerRootView>
        </Modal>

        {/* Sensory Grounding Modal */}
        <Modal visible={activeSession === 'game_focus'} transparent animationType="fade">
          <GestureHandlerRootView style={styles.ghRoot}>
            <View style={[styles.modalOverlay, { backgroundColor: colors.scrim }]}>
              <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                <View style={styles.modalHeader}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    Sensory Grounding
                  </Text>
                  <PressableScale onPress={() => setActiveSession(null)}>
                    <Ionicons name="close-circle-outline" size={26} color={colors.text.muted} />
                  </PressableScale>
                </View>

                <View style={[styles.groundingStepBox, { backgroundColor: colors.surface1 }]}>
                  <Text style={[typography.display, { color: colors.primary, fontSize: 36 }]}>
                    {groundingPrompts[groundingStep].count}
                  </Text>
                  <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8, textAlign: 'center' }]}>
                    {groundingPrompts[groundingStep].label}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6, textAlign: 'center' }]}>
                    {groundingPrompts[groundingStep].hint}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                  {groundingStep < groundingPrompts.length - 1 ? (
                    <Button
                      label="Next Step"
                      size="md"
                      style={{ flex: 1 }}
                      onPress={() => setGroundingStep((s) => s + 1)}
                    />
                  ) : (
                    <Button
                      label="Complete Grounding"
                      size="md"
                      style={{ flex: 1 }}
                      onPress={() => setActiveSession(null)}
                    />
                  )}
                </View>
              </View>
            </View>
          </GestureHandlerRootView>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // Android gives a Modal its own window; gestures there need their own root.
  ghRoot: { flex: 1 },
  breathingOrb: {
    alignItems: 'center',
    borderRadius: 80,
    height: 160,
    justifyContent: 'center',
    width: 160,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  gridTile: {
    alignItems: 'center',
    borderRadius: 16,
    height: 72,
    justifyContent: 'center',
    width: '22%',
  },
  groundingStepBox: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 24,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  modalCard: {
    borderRadius: 24,
    maxWidth: 360,
    padding: 24,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  orbWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  heroWrap: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3EFEA',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
});
