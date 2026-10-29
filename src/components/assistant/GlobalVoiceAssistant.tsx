/**
 * Global Voice Assistant Overlay Sheet.
 *
 * Implements the unified interactive assistant surface:
 * - Real-time conversational state (listening, reasoning, speaking)
 * - Animated voice activity orb
 * - Streaming transcript & coach response
 * - Suggested contextual prompt chips based on active screen
 * - Action buttons for navigated tools
 * - Keyboard / text input fallback
 * - Styled strictly with Thrivefold design tokens & typography
 */

import { Ionicons } from '@expo/vector-icons';
import { usePathname, router } from 'expo-router';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import {
  globalVoiceController,
  type VoiceAssistantState,
} from '../../services/voice/globalVoiceController';
import { resolveScreenCapability } from '../../domain/assistant/screenRegistry';
import type { ToolExecutionResult } from '../../domain/assistant/toolRegistry';
import { hapticMedium, hapticSelection } from '../../services/haptics';

export function GlobalVoiceAssistant() {
  const { colors, typography } = useTheme();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceAssistantState>('idle');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [spokenReply, setSpokenReply] = useState('');
  const [lastToolResult, setLastToolResult] = useState<ToolExecutionResult | null>(null);
  const [manualText, setManualText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Animation pulse for listening / reasoning
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (voiceState === 'listening' || voiceState === 'reasoning') {
      pulse.value = withRepeat(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1, { duration: 300 });
    }
  }, [voiceState, pulse]);

  const animatedOrbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  // Subscribe to controller updates
  useEffect(() => {
    const unsub = globalVoiceController.subscribe({
      onStateChange: (state) => {
        setVoiceState(state);
      },
      onPartialTranscript: (text) => {
        setPartialTranscript(text);
        setErrorMessage(null);
      },
      onFinalTranscript: (text) => {
        setPartialTranscript(text);
      },
      onAssistantReply: (reply, toolResult) => {
        setSpokenReply(reply);
        if (toolResult) {
          setLastToolResult(toolResult);
        }
      },
      onError: (err) => {
        setErrorMessage(err);
      },
    });

    return () => unsub();
  }, []);

  // Sync open state with controller
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const open = globalVoiceController.isAssistantOpen();
      if (open !== visible) {
        setVisible(open);
        if (open) {
          setErrorMessage(null);
        }
      }
    }, 150);

    return () => clearInterval(checkInterval);
  }, [visible]);

  const handleClose = useCallback(() => {
    hapticSelection();
    globalVoiceController.close();
    setVisible(false);
  }, []);

  const handleToggleMic = useCallback(() => {
    hapticMedium();
    if (voiceState === 'listening') {
      globalVoiceController.stopListening();
    } else {
      void globalVoiceController.startListening();
    }
  }, [voiceState]);

  const handleManualSubmit = useCallback(() => {
    const text = manualText.trim();
    if (!text) return;
    hapticSelection();
    setManualText('');
    setPartialTranscript(text);
    void globalVoiceController.handleFinalUtterance(text);
  }, [manualText]);

  const handleChipPress = useCallback((command: string) => {
    hapticSelection();
    setPartialTranscript(command);
    void globalVoiceController.handleFinalUtterance(command);
  }, []);

  const handleOpenRoute = useCallback((route: string) => {
    hapticMedium();
    handleClose();
    router.push(route as any);
  }, [handleClose]);

  if (!visible) return null;

  const screenCap = resolveScreenCapability(pathname);

  const getStatusText = () => {
    switch (voiceState) {
      case 'requesting_permission':
        return 'Requesting microphone permission…';
      case 'listening':
        return 'Listening… speak naturally';
      case 'transcribing':
        return 'Processing your words…';
      case 'reasoning':
        return 'Thinking…';
      case 'speaking':
        return 'Thrive Coach is speaking…';
      case 'error':
        return errorMessage || 'Voice unavailable';
      default:
        return 'Tap microphone to speak or type below';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={[styles.sheet, { backgroundColor: colors.surface1 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.statusDot, { backgroundColor: colors.dockActive }]} />
              <Text
                style={[
                  styles.title,
                  { color: colors.text.primary, fontFamily: typography.label.fontFamily },
                ]}
              >
                Thrive Coach
              </Text>
            </View>

            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Close voice assistant"
              onPress={handleClose}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={22} color={colors.text.secondary} />
            </PressableScale>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Center Animated Voice Orb */}
            <View style={styles.orbContainer}>
              <Animated.View
                style={[
                  styles.orb,
                  { backgroundColor: colors.dockActive },
                  animatedOrbStyle,
                ]}
              >
                <Ionicons
                  name={voiceState === 'listening' ? 'mic' : 'sparkles'}
                  size={32}
                  color={colors.dock || '#121212'}
                />
              </Animated.View>
              <Text
                style={[
                  styles.statusLabel,
                  { color: colors.text.secondary, fontFamily: typography.body.fontFamily },
                ]}
              >
                {getStatusText()}
              </Text>
            </View>

            {/* User Utterance Box */}
            {partialTranscript ? (
              <View style={[styles.bubble, styles.userBubble, { backgroundColor: colors.surface }]}>
                <Text
                  style={[
                    styles.userText,
                    { color: colors.text.primary, fontFamily: typography.body.fontFamily },
                  ]}
                >
                  "{partialTranscript}"
                </Text>
              </View>
            ) : null}

            {/* Coach Spoken Response Box */}
            {spokenReply ? (
              <View
                style={[
                  styles.bubble,
                  styles.coachBubble,
                  { backgroundColor: colors.surface, borderColor: colors.dockActive },
                ]}
              >
                <Text
                  style={[
                    styles.coachText,
                    { color: colors.text.primary, fontFamily: typography.body.fontFamily },
                  ]}
                >
                  {spokenReply}
                </Text>

                {/* If tool generated a route to open */}
                {lastToolResult?.routeToOpen ? (
                  <PressableScale
                    accessibilityRole="button"
                    style={[styles.actionBtn, { backgroundColor: colors.dockActive }]}
                    onPress={() => handleOpenRoute(lastToolResult.routeToOpen!)}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: colors.dock, fontFamily: typography.label.fontFamily },
                      ]}
                    >
                      Open {lastToolResult.message.includes('Opened') ? 'Screen' : 'Action'}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.dock} />
                  </PressableScale>
                ) : null}
              </View>
            ) : null}

            {/* Suggested Contextual Chips */}
            <View style={styles.chipsSection}>
              <Text
                style={[
                  styles.chipsSectionTitle,
                  { color: colors.text.secondary, fontFamily: typography.label.fontFamily },
                ]}
              >
                SUGGESTIONS FOR {screenCap.title.toUpperCase()}
              </Text>
              <View style={styles.chipsRow}>
                {screenCap.suggestedChips.map((chip, idx) => (
                  <PressableScale
                    key={idx}
                    accessibilityRole="button"
                    style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => handleChipPress(chip.command)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: colors.text.primary, fontFamily: typography.body.fontFamily },
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </PressableScale>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Controls: Text input + Mic Button */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text.primary,
                  fontFamily: typography.body.fontFamily,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Ask coach anything or type command…"
              placeholderTextColor={colors.text.secondary}
              value={manualText}
              onChangeText={setManualText}
              onSubmitEditing={handleManualSubmit}
              returnKeyType="send"
            />

            {manualText.trim() ? (
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Send text query"
                style={[styles.micBtn, { backgroundColor: colors.dockActive }]}
                onPress={handleManualSubmit}
              >
                <Ionicons name="send" size={20} color={colors.dock} />
              </PressableScale>
            ) : (
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Toggle microphone"
                style={[
                  styles.micBtn,
                  {
                    backgroundColor:
                      voiceState === 'listening' ? '#EF4444' : colors.dockActive,
                  },
                ]}
                onPress={handleToggleMic}
              >
                <Ionicons
                  name={voiceState === 'listening' ? 'stop' : 'mic'}
                  size={22}
                  color={colors.dock}
                />
              </PressableScale>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    minHeight: '55%',
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  orb: {
    alignItems: 'center',
    borderRadius: 35,
    height: 70,
    justifyContent: 'center',
    width: 70,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statusLabel: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  bubble: {
    borderRadius: 16,
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  userText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  coachBubble: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    maxWidth: '92%',
  },
  coachText: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionBtn: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipsSection: {
    marginTop: 18,
  },
  chipsSectionTitle: {
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  input: {
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    fontSize: 14,
    height: 44,
    paddingHorizontal: 16,
  },
  micBtn: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
