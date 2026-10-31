/**
 * ANVAY — SOMEONE TO TALK TO & EMERGENCY ASSISTANCE
 *
 * One unified AI companion, conversational safety engine, and emergency sanctuary:
 * - Natural, welcoming opening ("I'm here. What's happening? You can talk to me.")
 * - Centralized voice & dialogue infrastructure (globalVoiceController & coachVoiceService)
 * - Intelligent situational assessment (negation, medical urgency, overdose, self-harm)
 * - Country-aware emergency directory with instant native dialers (112, 988, 14416, 911, 999)
 * - Personal trusted emergency contacts (one-tap call and pre-composed SMS with confirmation)
 * - Nearby emergency care discovery (ER, hospitals, urgent care with GPS navigation)
 * - Local-first therapeutic grounding (Box Breathing & 5-4-3-2-1 Sensory)
 * - Zero long-term RAG memory leaks of sensitive crisis data
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ScrollViewInstance } from 'react-native';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
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
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { TextField } from '../../../components/ui/TextField';
import {
  detectCrisisIntent,
  GROUNDING_EXERCISES,
  triggerEmergencyAction,
  type CrisisDetectionResult,
} from '../../../services/ai/emergencySupport';
import {
  SUPPORTED_COUNTRIES,
  type EmergencyServiceContact,
} from '../../../services/ai/emergencyDirectory';
import {
  findNearbyEmergencyCare,
  openEmergencyUrl,
  requestLocationForEmergencyCare,
  resolveEmergencyJurisdiction,
  setExplicitUserCountry,
  type EmergencyFacility,
  type ResolvedJurisdiction,
} from '../../../services/location/emergencyLocationResolver';
import { askAi } from '../../../services/ai/providers';
import { speakTherapy, stopTherapyVoice } from '../../../services/ai/therapyVoice';
import {
  globalVoiceController,
  type VoiceAssistantState,
} from '../../../services/voice/globalVoiceController';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

type SupportMode = 'talk' | 'box_breathing' | 'sensory' | 'directory';

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
  const emergencyContacts = useRootStore((s) => s.emergencyContacts);
  const koshProfile = useRootStore((s) => s.koshProfile);

  const [mode, setMode] = useState<SupportMode>('talk');
  const [voiceOn, setVoiceOn] = useState(true);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceAssistantState>('idle');

  // Initial Natural Warm Anvay Greeting
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: 'assistant',
      content: "I'm here. What's happening? You can talk to me.",
    },
  ]);

  const [activeCrisis, setActiveCrisis] = useState<CrisisDetectionResult | null>(null);

  // Jurisdiction & Emergency Contacts State
  const [jurisdiction, setJurisdiction] = useState<ResolvedJurisdiction | null>(null);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  // Nearby Facilities State
  const [facilities, setFacilities] = useState<EmergencyFacility[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [facilityModalVisible, setFacilityModalVisible] = useState(false);

  // Box Breathing State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);
  const [breathCount, setBreathCount] = useState(4);
  const circleScale = useSharedValue(1);

  // Sensory Grounding State
  const [sensoryStepIndex, setSensoryStepIndex] = useState(0);

  const scrollRef = useRef<ScrollViewInstance>(null);

  // Load initial jurisdiction
  const loadJurisdiction = useCallback(async () => {
    try {
      const res = await resolveEmergencyJurisdiction(koshProfile?.homeAddress);
      setJurisdiction(res);
    } catch {
      // Graceful fallback
    }
  }, [koshProfile?.homeAddress]);

  useEffect(() => {
    loadJurisdiction();
  }, [loadJurisdiction]);

  // Subscribe to central voice controller
  useEffect(() => {
    const unsub = globalVoiceController.subscribe({
      onStateChange: (state) => setVoiceState(state),
      onPartialTranscript: (text) => setDraft(text),
      onFinalTranscript: (text) => {
        setDraft('');
        void handleSend(text);
      },
      onAssistantReply: () => {},
      onError: (err) => showToast({ type: 'info', message: err }),
    });

    return () => {
      unsub();
      stopTherapyVoice();
      globalVoiceController.stopListening();
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
      // Inhale: expand smoothly
      circleScale.value = withTiming(1.45, {
        duration: 4000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else if (breathPhaseIndex === 2) {
      // Exhale: contract gently
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

  // Toggle voice recognition
  const toggleVoiceInput = async () => {
    if (voiceState === 'listening' || voiceState === 'requesting_permission') {
      globalVoiceController.stopListening();
    } else {
      stopTherapyVoice();
      await globalVoiceController.startListening();
    }
  };

  // Switch country jurisdiction
  const handleSelectCountry = async (countryCode: string) => {
    setExplicitUserCountry(countryCode);
    setCountryModalVisible(false);
    const updated = await resolveEmergencyJurisdiction();
    setJurisdiction(updated);
    showToast({
      type: 'success',
      message: `Emergency numbers updated for ${updated.countryName} (${updated.primaryEmergency.number})`,
    });
  };

  // Discover nearby hospitals
  const handleFindNearbyCare = async () => {
    setLoadingFacilities(true);
    setFacilityModalVisible(true);
    try {
      const coords = await requestLocationForEmergencyCare();
      if (!coords) {
        setFacilities([
          {
            id: 'fallback_er',
            name: 'Emergency Medical Hospital Search',
            type: 'hospital',
            lat: 0,
            lon: 0,
            open247: true,
            actionDirectionsUrl:
              Platform.OS === 'ios'
                ? 'http://maps.apple.com/?q=Hospital+Emergency+Room'
                : 'https://www.google.com/maps/search/hospital+emergency+room',
          },
        ]);
        setLoadingFacilities(false);
        return;
      }
      const list = await findNearbyEmergencyCare(coords.latitude, coords.longitude);
      setFacilities(list);
    } catch {
      showToast({ type: 'error', message: 'Could not load nearby facilities. Opening maps...' });
    } finally {
      setLoadingFacilities(false);
    }
  };

  // Main turn processor
  const handleSend = async (userText: string) => {
    const text = userText.trim();
    if (!text || busy) return;

    // 1. Layered Situational Safety Detection
    const crisis = detectCrisisIntent(text, jurisdiction?.countryCode);
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
      // Natural, compassionate Anvay support prompt
      const aiRes = await askAi(
        nextTurns.map((t) => ({ role: t.role, content: t.content })),
        {
          systemPrompt:
            'You are Anvay, a calm, compassionate, deeply attentive support companion. ' +
            'Listen empathetically, validate the person\'s feelings without diagnosing or giving unwanted lectures. ' +
            'Understand what is happening, who needs help, and ask at most ONE gentle clarifying question if really necessary. ' +
            'Keep replies concise, unhurried, warm, and comforting. Never invent facts or medical diagnoses.',
        },
      );

      let reply = aiRes.text.trim();
      if (!reply) {
        reply =
          "I hear you, and it is completely understandable to feel this way. Take a slow, gentle breath with me right now. You don't have to carry everything all at once. What feels like the most helpful thing right now?";
      }

      setTurns((prev) => [...prev, { role: 'assistant', content: reply }]);

      if (voiceOn) {
        speakTherapy(reply, { rate: 0.82 });
      }
    } catch {
      const fallbackReply =
        "I'm listening closely to you. You are in a safe, quiet space. Let's take a slow breath together. Would you like to try our box breathing exercise or sensory grounding?";
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
          subtitle="Anvay Support & Sanctuary"
          showBack
          rightAction={
            <View style={styles.headerActions}>
              <PressableScale
                touch="pressable"
                onPress={() => setCountryModalVisible(true)}
                style={styles.countryChipBtn}
                accessibilityLabel="Change country"
              >
                <Text style={styles.flagEmoji}>{jurisdiction?.flag || '🇮🇳'}</Text>
                <Text style={[typography.captionBold, { color: colors.text.primary, marginLeft: 4 }]}>
                  {jurisdiction?.countryCode || 'IN'}
                </Text>
                <Ionicons name="chevron-down" size={12} color={colors.text.muted} style={{ marginLeft: 2 }} />
              </PressableScale>

              <PressableScale
                touch="pressable"
                onPress={() => {
                  setVoiceOn(!voiceOn);
                  if (voiceOn) stopTherapyVoice();
                }}
                style={styles.voiceToggle}
                accessibilityLabel="Toggle voice playback"
              >
                <Ionicons
                  name={voiceOn ? 'volume-high-outline' : 'volume-mute-outline'}
                  size={20}
                  color={voiceOn ? colors.primary : colors.text.muted}
                />
              </PressableScale>
            </View>
          }
        />
      }
      scrollMode="shell-scroll-view"
    >
      <View style={{ paddingBottom: spacing.xxl }}>
        {/* Mode Selector Tabs (Horizontal Pill Bar with Full Legible Labels) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
          style={{ marginBottom: spacing.md }}
        >
          {(
            [
              { id: 'talk', label: 'Support & Listening', icon: 'heart-outline' },
              { id: 'box_breathing', label: 'Box Breathing', icon: 'radio-button-on-outline' },
              { id: 'sensory', label: '5-4-3-2-1 Sensory', icon: 'hand-left-outline' },
              { id: 'directory', label: 'Helplines & Care', icon: 'call-outline' },
            ] as const
          ).map((t) => {
            const active = mode === t.id;
            return (
              <PressableScale
                key={t.id}
                touch="pressable"
                onPress={() => {
                  setMode(t.id);
                  stopTherapyVoice();
                  setBreathingActive(false);
                }}
                scaleTo={0.96}
              >
                <SquircleSurface
                  radius={16}
                  fill={active ? colors.primaryAlpha : colors.surface1}
                  strokeWidth={active ? 1.5 : 1}
                  style={[
                    styles.tabPill,
                    { borderColor: active ? colors.primary : colors.border },
                  ]}
                >
                  <Ionicons
                    name={t.icon}
                    size={18}
                    color={active ? colors.primary : colors.text.secondary}
                  />
                  <Text
                    style={[
                      typography.subbodyBold,
                      {
                        color: active ? colors.primary : colors.text.secondary,
                        marginLeft: 6,
                        fontSize: 13,
                      },
                    ]}
                  >
                    {t.label}
                  </Text>
                </SquircleSurface>
              </PressableScale>
            );
          })}
        </ScrollView>

        {/* ── HIGH PRIORITY URGENT ASSISTANCE BANNER (Automated on crisis detection) ── */}
        {activeCrisis ? (
          <Card
            style={[
              styles.crisisCard,
              {
                backgroundColor: colors.surface1,
                borderColor:
                  activeCrisis.severity === 'immediate_emergency' ? colors.error : colors.warning,
              },
            ]}
          >
            <View style={styles.crisisHeader}>
              <Ionicons
                name="alert-circle"
                size={26}
                color={activeCrisis.severity === 'immediate_emergency' ? colors.error : colors.warning}
              />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text
                  style={[
                    typography.subbodyBold,
                    {
                      color:
                        activeCrisis.severity === 'immediate_emergency'
                          ? colors.error
                          : colors.warning,
                    },
                  ]}
                >
                  {activeCrisis.category === 'medical_emergency'
                    ? 'Urgent Medical Attention Recommended'
                    : activeCrisis.category === 'overdose_poisoning'
                      ? 'Immediate Poison Control / Ambulance Needed'
                      : activeCrisis.category === 'abuse_violence'
                        ? 'Emergency Police & Physical Safety Support'
                        : 'Immediate Human Support Available 24/7'}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  You matter. Please connect with immediate professional emergency care for {jurisdiction?.countryName}.
                </Text>
              </View>
            </View>

            <View style={styles.emergencyActionsRow}>
              {/* Primary Emergency Dialer */}
              {jurisdiction?.primaryEmergency ? (
                <Button
                  label={`Call ${jurisdiction.primaryEmergency.number} (${jurisdiction.primaryEmergency.name.split(' ')[0]})`}
                  size="sm"
                  onPress={() => triggerEmergencyAction(jurisdiction.primaryEmergency)}
                  icon={<Ionicons name="call" size={14} color={colors.onPrimary} />}
                  style={{ backgroundColor: colors.error }}
                />
              ) : null}

              {/* Primary Mental Health Lifeline */}
              {jurisdiction?.primaryMentalHealth ? (
                <Button
                  label={`Helpline: ${jurisdiction.primaryMentalHealth.number}`}
                  size="sm"
                  onPress={() => triggerEmergencyAction(jurisdiction.primaryMentalHealth)}
                  icon={<Ionicons name="heart" size={14} color={colors.onPrimary} />}
                  style={{ backgroundColor: colors.primary }}
                />
              ) : null}

              {/* Nearby Emergency Care */}
              <Button
                label="Find Nearby Hospitals"
                size="sm"
                variant="outline"
                onPress={handleFindNearbyCare}
                icon={<Ionicons name="navigate-outline" size={14} color={colors.primary} />}
              />
            </View>
          </Card>
        ) : null}

        {/* ── Mode 1: Support Conversation & Vent ── */}
        {mode === 'talk' ? (
          <View>
            {/* Conversation Log */}
            <Card style={{ padding: spacing.md, minHeight: 330 }}>
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
                            borderWidth: turn.isCrisisAlert ? 1.5 : 0,
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

              {/* Input composer with integrated Voice Input */}
              <View style={styles.composerRow}>
                <PressableScale
                  touch="pressable"
                  onPress={toggleVoiceInput}
                  scaleTo={0.9}
                  style={[
                    styles.micBtn,
                    {
                      backgroundColor:
                        voiceState === 'listening'
                          ? colors.error
                          : voiceState === 'requesting_permission'
                            ? colors.warning
                            : colors.surface2,
                    },
                  ]}
                  accessibilityLabel="Voice microphone"
                >
                  <Ionicons
                    name={voiceState === 'listening' ? 'mic' : 'mic-outline'}
                    size={22}
                    color={voiceState === 'listening' ? colors.onPrimary : colors.primary}
                  />
                </PressableScale>

                <TextField
                  value={draft}
                  onChangeText={setDraft}
                  returnKeyType="send"
                  onSubmitEditing={() => handleSend(draft)}
                  placeholder={
                    voiceState === 'listening'
                      ? 'Listening to you speak...'
                      : 'Share what is on your mind...'
                  }
                  multiline
                  containerStyle={styles.flex}
                  accessibilityLabel="Your message"
                />

                <PressableScale
                  touch="pressable"
                  onPress={() => handleSend(draft)}
                  disabled={!draft.trim() || busy}
                  scaleTo={0.92}
                  style={[
                    styles.sendBtn,
                    {
                      backgroundColor: draft.trim() && !busy ? colors.primary : colors.surface2,
                      opacity: draft.trim() && !busy ? 1 : 0.6,
                    },
                  ]}
                  accessibilityLabel="Send message"
                >
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={draft.trim() && !busy ? colors.onPrimary : colors.text.muted}
                  />
                </PressableScale>
              </View>
            </Card>

            {/* Quick Country Emergency Access Card */}
            <Card variant="surface1" style={{ marginTop: spacing.md, padding: spacing.md }}>
              <View style={styles.sosRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                    {jurisdiction?.countryName} Emergency & Crisis Support
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    {jurisdiction?.primaryEmergency.name}: {jurisdiction?.primaryEmergency.number} • Lifeline: {jurisdiction?.primaryMentalHealth.number}
                  </Text>
                </View>
                <Button
                  label={`Dial ${jurisdiction?.primaryEmergency.number || '112'}`}
                  size="sm"
                  onPress={() => {
                    if (jurisdiction?.primaryEmergency) {
                      triggerEmergencyAction(jurisdiction.primaryEmergency);
                    }
                  }}
                  icon={<Ionicons name="call" size={12} color={colors.onPrimary} />}
                />
              </View>
            </Card>

            {/* Trusted Emergency Contacts */}
            {emergencyContacts && emergencyContacts.length > 0 ? (
              <Card variant="surface1" style={{ marginTop: spacing.sm, padding: spacing.md }}>
                <Text style={[typography.captionBold, { color: colors.text.primary, marginBottom: 8 }]}>
                  Your Trusted Emergency Contacts
                </Text>
                {emergencyContacts.map((c) => (
                  <View key={c.id} style={styles.contactItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                        {c.name} {c.relation ? `(${c.relation})` : ''}
                      </Text>
                      <Text style={[typography.caption, { color: colors.text.secondary }]}>
                        {c.phone}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Button
                        label="Call"
                        size="sm"
                        variant="outline"
                        onPress={() => openEmergencyUrl(`tel:${c.phone.replace(/[^0-9+]/g, '')}`)}
                        icon={<Ionicons name="call-outline" size={12} color={colors.primary} />}
                      />
                      <Button
                        label="SMS"
                        size="sm"
                        variant="outline"
                        onPress={() => {
                          const msg = encodeURIComponent(
                            "I'm feeling overwhelmed right now and could use a moment to talk. Please message me when you can.",
                          );
                          openEmergencyUrl(`sms:${c.phone.replace(/[^0-9+]/g, '')}?body=${msg}`);
                        }}
                        icon={<Ionicons name="chatbubble-outline" size={12} color={colors.primary} />}
                      />
                    </View>
                  </View>
                ))}
              </Card>
            ) : null}
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
                {
                  color: colors.text.secondary,
                  textAlign: 'center',
                  marginTop: 4,
                  marginBottom: 24,
                },
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
            <Text
              style={[
                typography.caption,
                { color: colors.text.secondary, marginTop: 4, marginBottom: 16 },
              ]}
            >
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

        {/* ── Mode 4: Country Helplines Directory ── */}
        {mode === 'directory' ? (
          <View>
            <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>
                    {jurisdiction?.countryName} Helplines
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    Verified official public services & crisis lines
                  </Text>
                </View>
                <Button
                  label="Switch Country"
                  size="sm"
                  variant="outline"
                  onPress={() => setCountryModalVisible(true)}
                />
              </View>
            </Card>

            {jurisdiction?.allContacts.map((contact) => (
              <Card key={contact.id} style={{ marginBottom: spacing.sm, padding: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                      {contact.name}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                      {contact.hours} • {contact.coverage}
                    </Text>
                    <Text style={[typography.caption, { color: colors.primary, marginTop: 4, fontWeight: '700' }]}>
                      {contact.number}
                    </Text>
                  </View>
                  <Button
                    label="Connect"
                    size="sm"
                    onPress={() => triggerEmergencyAction(contact)}
                    icon={<Ionicons name={contact.type === 'sms' ? 'chatbubble' : 'call'} size={12} color={colors.onPrimary} />}
                  />
                </View>
              </Card>
            ))}

            <View style={{ marginTop: 12, alignItems: 'center' }}>
              <Button
                label="Find Nearby ER & Hospitals"
                variant="outline"
                onPress={handleFindNearbyCare}
                icon={<Ionicons name="navigate-outline" size={14} color={colors.primary} />}
              />
            </View>
          </View>
        ) : null}
      </View>

      {/* ── Modal: Country Jurisdiction Selector ── */}
      <Modal
        visible={countryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SquircleSurface
            radius={24}
            fill={colors.surface1}
            style={[styles.modalCard, { borderColor: colors.border }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Select Your Current Country
              </Text>
              <PressableScale touch="pressable" onPress={() => setCountryModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </PressableScale>
            </View>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 12 }]}>
              Emergency numbers (such as 112, 911, or 988) depend on the country you are currently located in.
            </Text>

            <ScrollView style={{ maxHeight: 360 }}>
              {SUPPORTED_COUNTRIES.map((c) => {
                const selected = jurisdiction?.countryCode === c.code;
                return (
                  <PressableScale
                    key={c.code}
                    touch="pressable"
                    onPress={() => handleSelectCountry(c.code)}
                    style={{ marginBottom: 8 }}
                  >
                    <SquircleSurface
                      radius={12}
                      fill={selected ? colors.primaryAlpha : colors.surface2}
                      strokeWidth={selected ? 1.5 : 1}
                      style={[
                        styles.countryRow,
                        { borderColor: selected ? colors.primary : colors.border },
                      ]}
                    >
                      <Text style={{ fontSize: 24, marginRight: 12 }}>{c.flag}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                          {c.name}
                        </Text>
                        <Text style={[typography.caption, { color: colors.text.secondary }]}>
                          Emergency: {c.defaultEmergency} • Lifeline: {c.defaultMentalHealth}
                        </Text>
                      </View>
                      {selected ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                    </SquircleSurface>
                  </PressableScale>
                );
              })}
            </ScrollView>
          </SquircleSurface>
        </View>
      </Modal>

      {/* ── Modal: Nearby Emergency Facilities ── */}
      <Modal
        visible={facilityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFacilityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SquircleSurface
            radius={24}
            fill={colors.surface1}
            style={[styles.modalCard, { borderColor: colors.border }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Nearby Emergency Medical Care
              </Text>
              <PressableScale touch="pressable" onPress={() => setFacilityModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </PressableScale>
            </View>

            {loadingFacilities ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 12 }]}>
                  Locating verified emergency medical centers near you...
                </Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {facilities.map((f) => (
                  <Card key={f.id} style={{ marginBottom: 10, padding: 12 }}>
                    <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                      {f.name}
                    </Text>
                    {f.distanceKm !== undefined ? (
                      <Text style={[typography.caption, { color: colors.primary, marginTop: 2 }]}>
                        {f.distanceKm} km away {f.open247 ? '• Open 24/7' : ''}
                      </Text>
                    ) : null}
                    {f.address ? (
                      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                        {f.address}
                      </Text>
                    ) : null}

                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                      <Button
                        label="Get Directions"
                        size="sm"
                        onPress={() => openEmergencyUrl(f.actionDirectionsUrl)}
                        icon={<Ionicons name="navigate" size={14} color={colors.onPrimary} />}
                      />
                      {f.actionDialUrl ? (
                        <Button
                          label="Call"
                          size="sm"
                          variant="outline"
                          onPress={() => openEmergencyUrl(f.actionDialUrl!)}
                          icon={<Ionicons name="call-outline" size={14} color={colors.primary} />}
                        />
                      ) : null}
                    </View>
                  </Card>
                ))}
              </ScrollView>
            )}
          </SquircleSurface>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  flagEmoji: {
    fontSize: 14,
  },
  tabScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  voiceToggle: {
    padding: 6,
  },
  crisisCard: {
    marginBottom: 16,
    padding: 14,
    borderWidth: 2,
  },
  crisisHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  emergencyActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
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
    gap: 6,
    marginTop: 8,
  },
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  flex: {
    flex: 1,
  },
});
