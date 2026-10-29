/**
 * The Thrive Coach conversation sheet, opened by holding the tab-bar orb.
 *
 * It listens, answers out loud and in text, and keeps listening until closed, so a person can
 * talk back and forth. Every exchange stays visible as a conversation. Requests that open a
 * screen close the sheet and go there. Typing works too.
 */

import { Ionicons } from '@expo/vector-icons';
import { router, usePathname, type Href } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { resolveScreenCapability } from '../../domain/assistant/screenRegistry';
import type { ToolExecutionResult } from '../../domain/assistant/toolRegistry';
import { hapticMedium, hapticSelection } from '../../services/haptics';
import { globalVoiceController, type VoiceAssistantState } from '../../services/voice/globalVoiceController';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import { ThriveClock } from '../brand/ThriveClock';
import { BrainSetupCard } from './BrainSetupCard';

interface Turn {
  id: number;
  who: 'you' | 'coach';
  text: string;
  route?: string;
}

const STATUS: Record<VoiceAssistantState, string> = {
  idle: 'Tap the microphone or type',
  requesting_permission: 'Allow the microphone to talk',
  listening: 'Listening…',
  transcribing: 'Got it…',
  reasoning: 'Thinking…',
  speaking: 'Speaking… just talk to interrupt',
  error: 'Voice is not available',
};

export function GlobalVoiceAssistant() {
  const { colors, typography, spacing } = useTheme();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceAssistantState>('idle');
  const [partial, setPartial] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const nextId = useRef(1);
  const scroll = useRef<ScrollView>(null);

  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value =
      voiceState === 'listening' || voiceState === 'reasoning'
        ? withRepeat(withTiming(1.15, { duration: 750, easing: Easing.inOut(Easing.ease) }), -1, true)
        : withTiming(1, { duration: 250 });
  }, [voiceState, pulse]);
  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const close = useCallback(() => {
    hapticSelection();
    globalVoiceController.close();
    setVisible(false);
  }, []);

  useEffect(() => {
    const unsub = globalVoiceController.subscribe({
      onStateChange: setVoiceState,
      onPartialTranscript: (text) => {
        setPartial(text);
        setError(null);
      },
      onFinalTranscript: (text) => {
        setPartial('');
        setTurns((t) => [...t, { id: nextId.current++, who: 'you' as const, text }].slice(-30));
      },
      onAssistantReply: (reply, tool?: ToolExecutionResult) => {
        setTurns((t) => {
          const last = t[t.length - 1];
          const route = tool?.routeToOpen;
          // Streaming tokens update the coach's current reply instead of adding a new one.
          if (last?.who === 'coach' && !last.route && reply.startsWith(last.text.slice(0, 12))) {
            return [...t.slice(0, -1), { ...last, text: reply, route }];
          }
          return [...t, { id: nextId.current++, who: 'coach' as const, text: reply, route }].slice(-30);
        });
        if (tool?.autoNavigate && tool.routeToOpen) {
          // The screen was opened by the tool; get out of the way so the person sees it.
          setTimeout(() => {
            globalVoiceController.close();
            setVisible(false);
          }, 900);
        }
      },
      onError: (e) => setError(e),
    });
    return () => {
      unsub();
    };
  }, []);

  // The controller opens from the orb; follow it.
  useEffect(() => {
    const iv = setInterval(() => {
      const open = globalVoiceController.isAssistantOpen();
      setVisible((v) => {
        if (open && !v) {
          setError(null);
          setTurns([]);
        }
        return open;
      });
    }, 150);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  }, [turns, partial]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    hapticSelection();
    setTyped('');
    setTurns((all) => [...all, { id: nextId.current++, who: 'you' as const, text: t }].slice(-30));
    void globalVoiceController.handleFinalUtterance(t);
  };

  const toggleMic = () => {
    hapticMedium();
    if (voiceState === 'listening') globalVoiceController.stopListening();
    else void globalVoiceController.startListening();
  };

  const go = (route: string) => {
    close();
    router.push(route as Href);
  };

  if (!visible) return null;
  const screen = resolveScreenCapability(pathname);
  const listening = voiceState === 'listening';
  const mood =
    listening
      ? ('listening' as const)
      : voiceState === 'reasoning' || voiceState === 'transcribing'
        ? ('thinking' as const)
        : voiceState === 'speaking'
          ? ('speaking' as const)
          : ('idle' as const);

  return (
    <Modal visible animationType="slide" transparent onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.backdrop, { backgroundColor: colors.scrim }]}
      >
        <PressableScale style={styles.dismissArea} onPress={close} accessibilityLabel="Close the coach" scaleTo={1}>
          <View />
        </PressableScale>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={[styles.grabber, { backgroundColor: colors.surface3 }]} />
          <View style={[styles.header, { paddingHorizontal: spacing.base }]}>
            <Animated.View style={[styles.miniOrb, orbStyle]}>
              <ThriveClock size={48} mood={mood} />
            </Animated.View>
            <View style={styles.flex}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>Mr. Minute</Text>
              <Text
                style={[typography.caption, { color: error ? colors.error : colors.text.secondary }]}
                numberOfLines={1}
              >
                {error ?? STATUS[voiceState]}
              </Text>
            </View>
            <PressableScale onPress={() => go('/(app)/settings/memories')} hitSlop={8} accessibilityLabel="Memory">
              <Ionicons name="library-outline" size={22} color={colors.text.secondary} />
            </PressableScale>
            <PressableScale onPress={close} hitSlop={8} accessibilityLabel="Close" style={{ marginLeft: 16 }}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </PressableScale>
          </View>

          <ScrollView
            ref={scroll}
            style={styles.flex}
            contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.md }}
            keyboardShouldPersistTaps="handled"
          >
            <BrainSetupCard compact={turns.length > 0} />
            {turns.length === 0 && !partial ? (
              <View style={styles.empty}>
                {/* The whole character, never cropped, reacting to the conversation. */}
                <View style={styles.buddy} pointerEvents="none">
                  <ThriveClock size={140} mood={mood} />
                </View>
                <Text style={[typography.body, { color: colors.text.secondary }]}>
                  Talk naturally. Ask a question, or say things like &quot;log two glasses of water and then open
                  sleep&quot;, &quot;export all my metrics&quot; or &quot;remember that I train at 7 am&quot;.
                </Text>
                <Text style={[typography.captionBold, styles.chipsTitle, { color: colors.text.muted }]}>
                  TRY ON {screen.title.toUpperCase()}
                </Text>
                <View style={styles.chips}>
                  {screen.suggestedChips.map((c) => (
                    <PressableScale
                      key={c.command}
                      onPress={() => send(c.command)}
                      style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}
                    >
                      <Text style={[typography.caption, { color: colors.text.primary }]}>{c.label}</Text>
                    </PressableScale>
                  ))}
                </View>
              </View>
            ) : null}

            {turns.map((t) => (
              <View
                key={t.id}
                style={[
                  styles.bubble,
                  t.who === 'you'
                    ? [styles.mine, { backgroundColor: colors.primary }]
                    : [styles.theirs, { backgroundColor: colors.surface }],
                ]}
              >
                <Text style={[typography.body, { color: t.who === 'you' ? colors.text.inverse : colors.text.primary }]}>
                  {t.text}
                </Text>
                {t.route ? (
                  <PressableScale onPress={() => go(t.route!)} style={styles.openRow} accessibilityRole="button">
                    <Text style={[typography.captionBold, { color: colors.primary }]}>Open</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                  </PressableScale>
                ) : null}
              </View>
            ))}
            {partial ? (
              <View style={[styles.bubble, styles.mine, { backgroundColor: colors.primaryAlpha }]}>
                <Text style={[typography.body, { color: colors.text.primary }]}>{partial}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.footer, { paddingHorizontal: spacing.base, borderTopColor: colors.surface2 }]}>
            <TextInput
              style={[
                typography.body,
                styles.input,
                { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.surface2 },
              ]}
              placeholder="Type to the coach"
              placeholderTextColor={colors.text.muted}
              value={typed}
              onChangeText={setTyped}
              onSubmitEditing={() => send(typed)}
              returnKeyType="send"
            />
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={typed.trim() ? 'Send' : listening ? 'Stop listening' : 'Talk'}
              onPress={typed.trim() ? () => send(typed) : toggleMic}
              style={[styles.mic, { backgroundColor: listening ? colors.error : colors.primary }]}
            >
              <Ionicons
                name={typed.trim() ? 'send' : listening ? 'stop' : 'mic'}
                size={22}
                color={colors.text.inverse}
              />
            </PressableScale>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  dismissArea: { flex: 1 },
  sheet: { height: '78%', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 20 },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 12 },
  miniOrb: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  empty: { paddingTop: 8 },
  buddy: { alignItems: 'center', marginBottom: 4 },
  chipsTitle: { marginTop: 20, marginBottom: 8, letterSpacing: 0.6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  bubble: { maxWidth: '86%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, marginTop: 8 },
  mine: { alignSelf: 'flex-end', borderBottomRightRadius: 6 },
  theirs: { alignSelf: 'flex-start', borderBottomLeftRadius: 6 },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, height: 48, borderRadius: 24, paddingHorizontal: 18, borderWidth: 1 },
  mic: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
