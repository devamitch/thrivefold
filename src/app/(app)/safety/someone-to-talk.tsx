import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { TextField } from '../../../components/ui/TextField';
import {
  detectCrisisIntent,
  EMERGENCY_CONTACTS,
  GROUNDING_EXERCISES,
  triggerEmergencyAction,
  type CrisisDetectionResult,
} from '../../../services/ai/emergencySupport';
import { askAi } from '../../../services/ai/providers';
import { speakTherapy, stopTherapyVoice } from '../../../services/ai/therapyVoice';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

type SupportMode = 'talk' | 'box_breathing' | 'sensory';

interface Turn {
  role: 'user' | 'assistant';
  content: string;
  isCrisisAlert?: boolean;
}

const STARTERS = [
  'I feel completely overwhelmed right now',
  'I have racing anxious thoughts',
  'I just feel very lonely and need someone to listen',
  'Help me calm down step by step',
];

export default function SomeoneToTalkScreen() {
  const { colors, typography, spacing } = useTheme();
  const showToast = useRootStore((s) => s.showToast);

  const [mode, setMode] = useState<SupportMode>('talk');
  const [voiceOn, setVoiceOn] = useState(true);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: 'assistant',
      content:
        "I'm here with you. Whatever you are holding right now—stress, heavy feelings, loneliness, or exhaustion—you don't have to carry it alone. You can speak freely, and I'll listen.",
    },
  ]);

  const [activeCrisis, setActiveCrisis] = useState<CrisisDetectionResult | null>(null);

  // Box Breathing State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);
  const [breathCount, setBreathCount] = useState(4);
  const circleScale = useSharedValue(1);

  // Sensory Grounding State
  const [sensoryStepIndex, setSensoryStepIndex] = useState(0);

  const scrollRef = useRef<ScrollView>(null);

  // Stop voice on unmount
  useEffect(() => {
    return () => {
      stopTherapyVoice();
    };
  }, []);

  // Handle Box Breathing Timer Loop
  useEffect(() => {
    if (!breathingActive) {
      circleScale.value = withTiming(1, { duration: 400 });
      return;
    }

    const phases = GROUNDING_EXERCISES.box_breathing.phases;
    const currentPhase = phases[breathPhaseIndex];

    if (voiceOn) {
      speakTherapy(currentPhase.name, { rate: 0.8 });
    }

    // Animate breath visual scale
    if (breathPhaseIndex === 0) {
      // Inhale: expand
      circleScale.value = withTiming(1.45, {
        duration: 4000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else if (breathPhaseIndex === 2) {
      // Exhale: contract
      circleScale.value = withTiming(1.0, {
        duration: 4000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }

    setBreathCount(4);
    const countTimer = setInterval(() => {
      setBreathCount((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    const phaseTimer = setTimeout(() => {
      setBreathPhaseIndex((prev) => (prev + 1) % phases.length);
    }, 4000);

    return () => {
      clearInterval(countTimer);
      clearTimeout(phaseTimer);
    };
  }, [breathingActive, breathPhaseIndex, circleScale, voiceOn]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const handleSend = async (userText: string) => {
    const text = userText.trim();
    if (!text || busy) return;

    const crisis = detectCrisisIntent(text);
    const nextTurns: Turn[] = [...turns, { role: 'user', content: text }];
    setTurns(nextTurns);
    setDraft('');
    setBusy(true);

    if (crisis.isCrisis) {
      setActiveCrisis(crisis);
      const crisisReply = crisis.deescalationScript;
      setTurns((prev) => [
        ...prev,
        { role: 'assistant', content: crisisReply, isCrisisAlert: true },
      ]);
      setBusy(false);

      if (voiceOn) {
        speakTherapy(crisisReply, { rate: 0.78 });
      }
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    try {
      // Try provider AI with explicit safety & therapy system prompt
      const aiRes = await askAi(
        nextTurns.map((t) => ({ role: t.role, content: t.content })),
        {
          systemPrompt:
            'You are a warm, compassionate, calm support companion. You listen empathetically, validate emotions gently without judging or diagnosing, and offer soothing mindfulness and grounding. If the user mentions crisis or self-harm, prioritize their safety above all else. Keep replies concise, gentle, and unhurried.',
        },
      );

      let reply = aiRes.text.trim();
      // On-device deterministic fallback if AI is offline or in local-only mode
      if (!reply) {
        reply =
          "I hear you, and it is completely understandable to feel this way. Take a deep, gentle breath with me right now. You don't have to solve everything today—just taking this one moment is enough. How does your body feel in this instant?";
      }

      setTurns((prev) => [...prev, { role: 'assistant', content: reply }]);

      if (voiceOn) {
        speakTherapy(reply, { rate: 0.82 });
      }
    } catch {
      const fallbackReply =
        "I'm listening closely to you. You are safe here. Let's take a slow breath together. Would you like to try our box breathing exercise or sensory grounding?";
      setTurns((prev) => [...prev, { role: 'assistant', content: fallbackReply }]);
      if (voiceOn) {
        speakTherapy(fallbackReply, { rate: 0.82 });
      }
    } finally {
      setBusy(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const advanceSensoryStep = useCallback(() => {
    const steps = GROUNDING_EXERCISES.sensory_54321.steps;
    const next = (sensoryStepIndex + 1) % steps.length;
    setSensoryStepIndex(next);
    if (voiceOn) {
      speakTherapy(steps[next].prompt, { rate: 0.82 });
    }
  }, [sensoryStepIndex, voiceOn]);

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Someone to Talk To"
          subtitle="Support Sanctuary & Grounding"
          showBack
          rightAction={
            <PressableScale
              onPress={() => {
                setVoiceOn(!voiceOn);
                if (voiceOn) stopTherapyVoice();
              }}
              style={styles.voiceToggle}
              accessibilityLabel="Toggle voice playback"
            >
              <Ionicons
                name={voiceOn ? 'volume-high-outline' : 'volume-mute-outline'}
                size={22}
                color={voiceOn ? colors.primary : colors.text.muted}
              />
            </PressableScale>
          }
        />
      }
      scrollMode="shell-scroll-view"
    >
      <View style={{ paddingBottom: spacing.xxl }}>
        {/* Mode Selector Tabs */}
        <View style={[styles.tabRow, { marginBottom: spacing.md }]}>
          {(
            [
              { id: 'talk', label: 'Support & Listening', icon: 'heart-outline' },
              { id: 'box_breathing', label: 'Box Breathing', icon: 'radio-button-on-outline' },
              { id: 'sensory', label: '5-4-3-2-1 Grounding', icon: 'hand-left-outline' },
            ] as const
          ).map((t) => {
            const active = mode === t.id;
            return (
              <PressableScale
                key={t.id}
                onPress={() => {
                  setMode(t.id);
                  stopTherapyVoice();
                  setBreathingActive(false);
                }}
                scaleTo={0.96}
                style={styles.tabFlex}
              >
                <SquircleSurface
                  radius={12}
                  fill={active ? colors.primaryAlpha : colors.surface1}
                  strokeWidth={active ? 1.5 : 1}
                  style={[
                    styles.tabButton,
                    { borderColor: active ? colors.primary : colors.border },
                  ]}
                >
                  <Ionicons
                    name={t.icon}
                    size={18}
                    color={active ? colors.primary : colors.text.secondary}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      typography.captionBold,
                      { color: active ? colors.primary : colors.text.secondary, marginTop: 4 },
                    ]}
                  >
                    {t.label}
                  </Text>
                </SquircleSurface>
              </PressableScale>
            );
          })}
        </View>

        {/* EMERGENCY REAL ACTION BANNER (Shown automatically on crisis or pinned) */}
        {activeCrisis ? (
          <Card style={[styles.crisisCard, { backgroundColor: colors.surface1, borderColor: colors.error }]}>
            <View style={styles.crisisHeader}>
              <Ionicons name="alert-circle" size={24} color={colors.error} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={[typography.subbodyBold, { color: colors.error }]}>
                  Immediate Crisis Support Available
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  You matter. Compassionate human professionals are ready 24/7.
                </Text>
              </View>
            </View>

            <View style={styles.emergencyActionsRow}>
              {EMERGENCY_CONTACTS.slice(0, 3).map((contact) => (
                <Button
                  key={contact.id}
                  label={contact.name}
                  size="sm"
                  onPress={() => triggerEmergencyAction(contact)}
                  icon={<Ionicons name="call" size={14} color={colors.onPrimary} />}
                  style={{ marginVertical: 3 }}
                />
              ))}
              <Button
                label="Full Safety Directory"
                size="sm"
                variant="outline"
                onPress={() => Linking.openURL('tel:988')}
                icon={<Ionicons name="shield-outline" size={14} color={colors.primary} />}
                style={{ marginVertical: 3 }}
              />
            </View>
          </Card>
        ) : null}

        {/* ── Mode 1: Support Conversation & Vent ── */}
        {mode === 'talk' ? (
          <View>
            {/* Conversation Log */}
            <Card style={{ padding: spacing.md, minHeight: 320 }}>
              <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
              >
                {turns.map((turn, i) => {
                  const isUser = turn.role === 'user';
                  return (
                    <View
                      key={i}
                      style={[
                        styles.bubbleRow,
                        { justifyContent: isUser ? 'flex-end' : 'flex-start' },
                      ]}
                    >
                      <View
                        style={[
                          styles.bubble,
                          {
                            backgroundColor: isUser
                              ? colors.primary
                              : turn.isCrisisAlert
                              ? colors.surface2
                              : colors.surface1,
                            borderColor: turn.isCrisisAlert ? colors.error : colors.border,
                            borderWidth: turn.isCrisisAlert ? 1 : 0,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            typography.subbody,
                            {
                              color: isUser ? colors.onPrimary : colors.text.primary,
                              lineHeight: 20,
                            },
                          ]}
                        >
                          {turn.content}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {busy ? (
                  <View style={styles.busyRow}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[typography.caption, { color: colors.text.muted, marginLeft: 8 }]}>
                      Listening gently...
                    </Text>
                  </View>
                ) : null}
              </ScrollView>

              {/* Starter chips */}
              {turns.length <= 2 ? (
                <View style={styles.startersWrap}>
                  {STARTERS.map((s) => (
                    <Chip key={s} label={s} onPress={() => handleSend(s)} />
                  ))}
                </View>
              ) : null}

              {/* Input composer */}
              <View style={styles.composerRow}>
                <TextField
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Share what is on your mind..."
                  multiline
                  containerStyle={styles.flex}
                  accessibilityLabel="Your message"
                />
                <PressableScale
                  onPress={() => handleSend(draft)}
                  disabled={!draft.trim() || busy}
                  scaleTo={0.92}
                  style={[
                    styles.sendBtn,
                    {
                      backgroundColor:
                        draft.trim() && !busy ? colors.primary : colors.surface2,
                    },
                  ]}
                  accessibilityLabel="Send message"
                >
                  <Ionicons name="arrow-up" size={20} color={colors.onPrimary} />
                </PressableScale>
              </View>
            </Card>

            {/* Quick SOS Bar */}
            <Card variant="surface1" style={{ marginTop: spacing.md, padding: spacing.md }}>
              <View style={styles.sosRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                    Need immediate human help?
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    Free & confidential 24/7 crisis support lines
                  </Text>
                </View>
                <Button
                  label="Call 988"
                  size="sm"
                  onPress={() => Linking.openURL('tel:988')}
                  icon={<Ionicons name="call" size={12} color={colors.onPrimary} />}
                />
              </View>
            </Card>
          </View>
        ) : null}

        {/* ── Mode 2: Box Breathing Pacer ── */}
        {mode === 'box_breathing' ? (
          <Card style={[styles.centerCard, { padding: spacing.lg }]}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              {GROUNDING_EXERCISES.box_breathing.title}
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.text.secondary, textAlign: 'center', marginTop: 4, marginBottom: 24 },
              ]}
            >
              {GROUNDING_EXERCISES.box_breathing.subtitle}
            </Text>

            {/* Visual Animated Breathing Circle */}
            <View style={styles.pacerContainer}>
              <Animated.View
                style={[
                  styles.pacerCircle,
                  { backgroundColor: colors.primaryAlpha, borderColor: colors.primary },
                  animatedCircleStyle,
                ]}
              >
                <Text style={[typography.heading, { color: colors.primary, fontSize: 32 }]}>
                  {breathCount}
                </Text>
                <Text style={[typography.captionBold, { color: colors.primary, marginTop: 4 }]}>
                  {GROUNDING_EXERCISES.box_breathing.phases[breathPhaseIndex].name}
                </Text>
              </Animated.View>
            </View>

            <Text
              style={[
                typography.subbody,
                {
                  color: colors.text.secondary,
                  textAlign: 'center',
                  minHeight: 44,
                  marginTop: 24,
                  paddingHorizontal: 16,
                },
              ]}
            >
              {GROUNDING_EXERCISES.box_breathing.phases[breathPhaseIndex].instruction}
            </Text>

            <View style={styles.pacerControls}>
              <Button
                label={breathingActive ? 'Pause Breath' : 'Start Calming Breath'}
                onPress={() => setBreathingActive(!breathingActive)}
                icon={
                  <Ionicons
                    name={breathingActive ? 'pause' : 'play'}
                    size={16}
                    color={colors.onPrimary}
                  />
                }
              />
            </View>
          </Card>
        ) : null}

        {/* ── Mode 3: 5-4-3-2-1 Sensory Grounding ── */}
        {mode === 'sensory' ? (
          <Card style={{ padding: spacing.base }}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              {GROUNDING_EXERCISES.sensory_54321.title}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, marginBottom: 16 }]}>
              {GROUNDING_EXERCISES.sensory_54321.subtitle}
            </Text>

            {GROUNDING_EXERCISES.sensory_54321.steps.map((step, idx) => {
              const isActive = idx === sensoryStepIndex;
              const isPast = idx < sensoryStepIndex;
              return (
                <PressableScale
                  key={step.count}
                  onPress={() => {
                    setSensoryStepIndex(idx);
                    if (voiceOn) speakTherapy(step.prompt, { rate: 0.82 });
                  }}
                  scaleTo={0.98}
                  style={{ marginBottom: 10 }}
                >
                  <SquircleSurface
                    radius={14}
                    fill={isActive ? colors.primaryAlpha : colors.surface1}
                    strokeWidth={isActive ? 1.5 : 1}
                    style={[
                      styles.sensoryStep,
                      { borderColor: isActive ? colors.primary : colors.border },
                    ]}
                  >
                    <SquircleSurface
                      radius={12}
                      fill={isActive ? colors.primary : isPast ? colors.success : colors.surface2}
                      style={styles.stepNumBadge}
                    >
                      <Text
                        style={[
                          typography.captionBold,
                          { color: isActive || isPast ? colors.onPrimary : colors.text.secondary },
                        ]}
                      >
                        {step.count}
                      </Text>
                    </SquircleSurface>
                    <Text
                      style={[
                        typography.subbody,
                        {
                          color: isActive ? colors.text.primary : colors.text.secondary,
                          marginLeft: 12,
                          flex: 1,
                          lineHeight: 20,
                        },
                      ]}
                    >
                      {step.prompt}
                    </Text>
                  </SquircleSurface>
                </PressableScale>
              );
            })}

            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <Button
                label={sensoryStepIndex === 4 ? 'Complete Grounding' : 'Next Sensory Anchor'}
                onPress={advanceSensoryStep}
                icon={<Ionicons name="arrow-forward" size={16} color={colors.onPrimary} />}
              />
            </View>
          </Card>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabFlex: {
    flex: 1,
  },
  tabButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  voiceToggle: {
    padding: 6,
  },
  crisisCard: {
    marginBottom: 16,
    padding: 14,
    borderWidth: 1.5,
  },
  crisisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emergencyActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  startersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerCard: {
    alignItems: 'center',
  },
  pacerContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  pacerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pacerControls: {
    marginTop: 12,
  },
  sensoryStep: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  stepNumBadge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
});
