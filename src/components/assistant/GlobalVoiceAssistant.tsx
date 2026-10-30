/**
 * The Thrive Coach conversation sheet, opened from the tab-bar orb.
 *
 * It listens, answers out loud and in text, and keeps the conversation visible. Requests that
 * open a screen close the sheet and go there. Typing works too, and typing never turns the
 * microphone on.
 *
 * Keyboard: the sheet lifts with the keyboard on both platforms (KeyboardAvoidingView with
 * "padding"; Android is edge-to-edge, so it no longer resizes on its own) and grows to use the
 * space above the keyboard while the field is focused.
 */

import { Ionicons } from '@expo/vector-icons';
import { router, usePathname, type Href } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { resolveScreenCapability } from '../../domain/assistant/screenRegistry';
import type { ToolExecutionResult } from '../../domain/assistant/toolRegistry';
import { hapticMedium, hapticSelection } from '../../services/haptics';
import {
  globalVoiceController,
  type VoiceAssistantState,
} from '../../services/voice/globalVoiceController';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { AnvayCompanion } from '../brand/AnvayCompanion';
import { PressableScale } from '../ui/PressableScale';
import { BrainSetupCard } from './BrainSetupCard';

interface Turn {
  id: string;
  who: 'you' | 'coach';
  text: string;
  route?: string;
  at: number;
}

const MAX_TURNS = 100;
const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const STATUS: Record<VoiceAssistantState, string> = {
  idle: 'Tap the microphone or type',
  requesting_permission: 'Allow the microphone to talk',
  listening: 'Listening…',
  transcribing: 'Got it…',
  reasoning: 'Thinking…',
  speaking: 'Speaking… tap the microphone to interrupt',
  error: 'Voice is not available',
};

const SHEET_RATIO = 0.78;

export function GlobalVoiceAssistant() {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceAssistantState>('idle');
  const [partial, setPartial] = useState('');
  // The conversation survives closing the sheet and app restarts (saved in the store).
  const [turns, setTurns] = useState<Turn[]>(() => useRootStore.getState().coachTurns);
  const [typed, setTyped] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const list = useRef<FlatList<Turn>>(null);
  const input = useRef<TextInput>(null);
  const [kb, setKb] = useState(0);

  // Edge-to-edge Android does not resize a Modal for the keyboard, so the sheet is lifted by the
  // keyboard's height from the keyboard events (one mechanism only; no KeyboardAvoidingView).
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    // Measured on the Moto G71: endCoordinates.height over-reports by the navigation-bar inset
    // (the composer floated ~250 px above the keys). The keyboard's top edge is reliable, so the
    // lift is the distance from that edge to the bottom of the screen.
    const a = Keyboard.addListener(showEvt, (e) =>
      setKb(Math.max(0, Dimensions.get('screen').height - e.endCoordinates.screenY)),
    );
    const b = Keyboard.addListener(hideEvt, () => setKb(0));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  // Save the conversation shortly after it changes (not on every streamed token).
  useEffect(() => {
    const id = setTimeout(() => useRootStore.getState().setCoachTurns(turns), 600);
    return () => clearTimeout(id);
  }, [turns]);

  // Streamed tokens: keep only the newest text and render it at most once per frame.
  const pendingReply = useRef<{ reply: string; tool?: ToolExecutionResult } | null>(null);
  const frame = useRef<number | null>(null);

  const listening = voiceState === 'listening';

  // A soft ring around the microphone button while it is listening.
  const ring = useSharedValue(0);
  useEffect(() => {
    ring.value = listening
      ? withRepeat(withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }), -1, false)
      : withTiming(0, { duration: 150 });
  }, [listening, ring]);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value === 0 ? 0 : (1 - ring.value) * 0.5,
    transform: [{ scale: 1 + ring.value * 0.55 }],
  }));

  const close = useCallback(() => {
    hapticSelection();
    Keyboard.dismiss();
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
      // Spoken and typed messages both arrive here, so a message is only ever added once.
      onFinalTranscript: (text) => {
        setPartial('');
        setError(null);
        setTurns((t) =>
          [...t, { id: newId(), who: 'you' as const, text, at: Date.now() }].slice(-MAX_TURNS),
        );
      },
      onAssistantReply: (reply, tool?: ToolExecutionResult) => {
        pendingReply.current = { reply, tool };
        if (frame.current == null) {
          frame.current = requestAnimationFrame(() => {
            frame.current = null;
            const next = pendingReply.current;
            pendingReply.current = null;
            if (!next) return;
            const route = next.tool?.routeToOpen;
            setTurns((t) => {
              const last = t[t.length - 1];
              // Streaming updates the coach's current reply in place (same id).
              if (
                last?.who === 'coach' &&
                !last.route &&
                next.reply.startsWith(last.text.slice(0, 12))
              ) {
                return [...t.slice(0, -1), { ...last, text: next.reply, route }];
              }
              return [
                ...t,
                { id: newId(), who: 'coach' as const, text: next.reply, route, at: Date.now() },
              ].slice(-MAX_TURNS);
            });
          });
        }
        if (tool?.autoNavigate && tool.routeToOpen) {
          // The screen was opened by the tool; get out of the way so the person sees it.
          setTimeout(() => globalVoiceController.close(), 900);
        }
      },
      onError: (e) => setError(e),
    });
    return () => {
      unsub();
    };
  }, []);

  // Follow the controller's open state directly (no polling).
  useEffect(
    () =>
      globalVoiceController.subscribeOpen((open) => {
        if (open) {
          setError(null);
          setPartial('');
          setTyped('');
        } else {
          setFocused(false);
        }
        setVisible(open);
      }),
    [],
  );

  const clearHistory = () => {
    hapticSelection();
    setTurns([]);
    useRootStore.getState().setCoachTurns([]);
  };

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    hapticSelection();
    setTyped('');
    // The controller reports the message back through onFinalTranscript.
    void globalVoiceController.handleFinalUtterance(t, 'text');
  };

  const toggleMic = () => {
    hapticMedium();
    Keyboard.dismiss();
    if (listening) globalVoiceController.stopListening();
    else void globalVoiceController.startListening();
  };

  const onInputFocus = () => {
    setFocused(true);
    // Typing and listening do not mix: the microphone rests while the keyboard is in use.
    if (listening) globalVoiceController.stopListening();
  };
  const onInputBlur = () => setFocused(false);

  const go = (route: string) => {
    close();
    router.push(route as Href);
  };

  const reversed = React.useMemo(() => [...turns].reverse(), [turns]);
  const renderTurn = useCallback(
    ({ item }: { item: Turn }) => <TurnRow turn={item} onOpen={go} />,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // A real sheet: drag the handle or header down to dismiss; it springs back if not far enough.
  const dragY = useSharedValue(0);
  useEffect(() => {
    if (visible) dragY.value = 0;
  }, [visible, dragY]);
  const sheetDrag = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetY(-12)
    .onUpdate((e) => {
      'worklet';
      dragY.value = e.translationY > 0 ? e.translationY : e.translationY * 0.15;
    })
    .onEnd((e) => {
      'worklet';
      if (e.translationY > 120 || e.velocityY > 900) {
        dragY.value = withTiming(900, { duration: 200 }, (done) => {
          if (done) runOnJS(close)();
        });
      } else {
        dragY.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: dragY.value }] }));

  if (!visible) return null;

  const screen = resolveScreenCapability(pathname);
  const mood =
    voiceState === 'listening'
      ? ('listening' as const)
      : voiceState === 'reasoning' || voiceState === 'transcribing'
        ? ('thinking' as const)
        : voiceState === 'speaking'
          ? ('speaking' as const)
          : voiceState === 'error'
            ? ('error' as const)
            : ('idle' as const);

  const hasText = typed.trim().length > 0;
  const showThinking =
    (voiceState === 'reasoning' || voiceState === 'transcribing') &&
    turns[turns.length - 1]?.who === 'you';
  const dotColor = error
    ? colors.error
    : listening
      ? colors.primary
      : voiceState === 'idle'
        ? colors.text.muted
        : colors.primary;

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={close}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <GestureHandlerRootView style={styles.flex}>
        <View style={[styles.flex, { backgroundColor: colors.scrim }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityLabel="Close the coach"
          />
          <View
            pointerEvents="box-none"
            style={[styles.avoid, { paddingTop: insets.top + 8, paddingBottom: kb }]}
          >
            <Animated.View
              accessibilityViewIsModal
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.background,
                  // A tall sheet; with the keyboard up it shrinks to the space above it.
                  height: Math.min(
                    Math.round(winH * SHEET_RATIO),
                    Dimensions.get('screen').height - kb - insets.top - 8,
                  ),
                },
                sheetStyle,
              ]}
            >
              <GestureDetector gesture={sheetDrag}>
                <View>
                  <View style={[styles.grabber, { backgroundColor: colors.surface3 }]} />
                  <View style={[styles.header, { paddingHorizontal: spacing.base }]}>
                    <View style={styles.miniOrb}>
                      <AnvayCompanion size={48} mood={mood} />
                    </View>
                    <View style={styles.flex}>
                      <Text style={[typography.subheading, { color: colors.text.primary }]}>
                        Anvay
                      </Text>
                      <View style={styles.statusRow}>
                        <View style={[styles.dot, { backgroundColor: dotColor }]} />
                        <Text
                          style={[
                            typography.caption,
                            styles.flex,
                            { color: error ? colors.error : colors.text.secondary },
                          ]}
                          numberOfLines={1}
                        >
                          {error ?? STATUS[voiceState]}
                        </Text>
                      </View>
                    </View>
                    {turns.length ? (
                      <PressableScale
                        onPress={clearHistory}
                        hitSlop={8}
                        accessibilityLabel="Clear this conversation"
                        style={{ marginRight: 16 }}
                      >
                        <Ionicons name="trash-outline" size={21} color={colors.text.secondary} />
                      </PressableScale>
                    ) : null}
                    <PressableScale
                      onPress={() => go('/(app)/settings/memories')}
                      hitSlop={8}
                      accessibilityLabel="Memory"
                    >
                      <Ionicons name="library-outline" size={22} color={colors.text.secondary} />
                    </PressableScale>
                    <PressableScale
                      onPress={close}
                      hitSlop={8}
                      accessibilityLabel="Close"
                      style={{ marginLeft: 16 }}
                    >
                      <Ionicons name="close" size={24} color={colors.text.secondary} />
                    </PressableScale>
                  </View>
                </View>
              </GestureDetector>

              {turns.length === 0 && !partial ? (
                // Empty conversation: a plain view (no inverted-list flip quirks).
                <View style={[styles.flex, { paddingHorizontal: spacing.base }]}>
                  <BrainSetupCard compact={focused} />
                  <View style={styles.empty}>
                    {/* The whole character, never cropped; it steps aside while typing. */}
                    {focused ? null : (
                      <View style={styles.buddy} pointerEvents="none">
                        <AnvayCompanion size={140} mood={mood} />
                      </View>
                    )}
                    <Text style={[typography.body, { color: colors.text.secondary }]}>
                      Talk naturally. Ask a question, or say things like &quot;log two glasses of
                      water and then open sleep&quot;, &quot;export all my metrics&quot; or
                      &quot;remember that I train at 7 am&quot;.
                    </Text>
                    <Text
                      style={[
                        typography.captionBold,
                        styles.chipsTitle,
                        { color: colors.text.muted },
                      ]}
                    >
                      TRY ON {screen.title.toUpperCase()}
                    </Text>
                    <View style={styles.chips}>
                      {screen.suggestedChips.map((c) => (
                        <PressableScale
                          key={c.command}
                          onPress={() => send(c.command)}
                          style={[
                            styles.chip,
                            { backgroundColor: colors.surface, borderColor: colors.surface2 },
                          ]}
                        >
                          <Text style={[typography.caption, { color: colors.text.primary }]}>
                            {c.label}
                          </Text>
                        </PressableScale>
                      ))}
                    </View>
                  </View>
                </View>
              ) : (
                <FlatList
                  ref={list}
                  // Newest at the bottom: the list is inverted, so it stays on the latest message
                  // when the keyboard opens or a reply streams in.
                  inverted
                  data={reversed}
                  keyExtractor={(t) => t.id}
                  renderItem={renderTurn}
                  initialNumToRender={12}
                  windowSize={7}
                  removeClippedSubviews
                  style={styles.flex}
                  contentContainerStyle={{
                    paddingHorizontal: spacing.base,
                    paddingVertical: spacing.sm,
                  }}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                  ListHeaderComponent={
                    <>
                      {showThinking ? (
                        <View
                          style={[
                            styles.bubble,
                            styles.theirs,
                            { backgroundColor: colors.surface },
                          ]}
                        >
                          <Text style={[typography.body, { color: colors.text.muted }]}>
                            Thinking…
                          </Text>
                        </View>
                      ) : null}
                      {partial ? (
                        <View
                          style={[
                            styles.bubble,
                            styles.mine,
                            { backgroundColor: colors.primaryAlpha },
                          ]}
                        >
                          <Text style={[typography.body, { color: colors.text.primary }]}>
                            {partial}
                          </Text>
                        </View>
                      ) : null}
                    </>
                  }
                  ListFooterComponent={<BrainSetupCard compact />}
                />
              )}

              {/* Composer: sits above the keyboard, and above the system bar when it is closed. */}
              <View
                style={[
                  styles.composer,
                  {
                    paddingHorizontal: spacing.base,
                    borderTopColor: colors.surface2,
                    // Safe-area inset only when the keyboard is closed.
                    paddingBottom: kb > 0 ? 10 : insets.bottom + 10,
                  },
                ]}
              >
                <View
                  style={[
                    styles.pill,
                    {
                      backgroundColor: colors.surface,
                      borderColor: focused ? colors.primary : colors.surface2,
                    },
                  ]}
                >
                  <TextInput
                    style={[typography.body, styles.input, { color: colors.text.primary }]}
                    placeholder={listening ? 'Listening… or type' : 'Message Anvay'}
                    placeholderTextColor={colors.text.muted}
                    value={typed}
                    onChangeText={setTyped}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    ref={input}
                    multiline
                    onSubmitEditing={() => send(typed)}
                    returnKeyType="send"
                    submitBehavior="submit"
                    accessibilityLabel="Type a message to Anvay"
                  />
                  <View style={styles.actionWrap}>
                    <Animated.View
                      pointerEvents="none"
                      style={[styles.ring, { backgroundColor: colors.error }, ringStyle]}
                    />
                    <PressableScale
                      accessibilityRole="button"
                      accessibilityLabel={
                        hasText
                          ? 'Send'
                          : listening
                            ? 'Stop listening'
                            : voiceState === 'speaking'
                              ? 'Interrupt and talk'
                              : 'Talk'
                      }
                      onPress={hasText ? () => send(typed) : toggleMic}
                      style={[
                        styles.action,
                        { backgroundColor: listening && !hasText ? colors.error : colors.primary },
                      ]}
                    >
                      <Ionicons
                        name={hasText ? 'send' : listening ? 'stop' : 'mic'}
                        size={20}
                        color={colors.text.inverse}
                      />
                    </PressableScale>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

/** One message bubble. Memoized: a streamed reply re-renders only its own row. */
const TurnRow = React.memo(function TurnRow({
  turn,
  onOpen,
}: {
  turn: Turn;
  onOpen: (route: string) => void;
}) {
  const { colors, typography } = useTheme();
  const mine = turn.who === 'you';
  return (
    <View
      style={[
        styles.bubble,
        mine
          ? [styles.mine, { backgroundColor: colors.primary }]
          : [styles.theirs, { backgroundColor: colors.surface }],
      ]}
    >
      <Text style={[typography.body, { color: mine ? colors.text.inverse : colors.text.primary }]}>
        {turn.text}
      </Text>
      {turn.route ? (
        <PressableScale
          onPress={() => onOpen(turn.route!)}
          style={styles.openRow}
          accessibilityRole="button"
        >
          <Text style={[typography.captionBold, { color: colors.primary }]}>Open</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </PressableScale>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  avoid: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  miniOrb: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  empty: { paddingTop: 8 },
  buddy: { alignItems: 'center', marginBottom: 4 },
  chipsTitle: { marginTop: 20, marginBottom: 8, letterSpacing: 0.6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  bubble: {
    maxWidth: '86%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginTop: 8,
  },
  mine: { alignSelf: 'flex-end', borderBottomRightRadius: 6 },
  theirs: { alignSelf: 'flex-start', borderBottomLeftRadius: 6 },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  composer: {
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 52,
    paddingVertical: 4,
    borderRadius: 26,
    borderWidth: 1,
    paddingLeft: 18,
    paddingRight: 4,
  },
  // Grows with the text up to about four lines.
  input: { flex: 1, minHeight: 44, maxHeight: 112, paddingVertical: 10, textAlignVertical: 'center' },
  actionWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 48, height: 48, borderRadius: 24 },
  action: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
