/**
 * The Thrive Coach conversation sheet, opened from the tab-bar orb.
 *
 * It listens, answers out loud and in text, and keeps the conversation visible. Requests that
 * open a screen close the sheet and go there. Typing works too, and typing never turns the
 * microphone on.
 *
 * Keyboard: the sheet is lifted by the keyboard's height (Android is edge-to-edge and no longer
 * resizes on its own) and shrinks to the space above it; the chat list is inverted so it stays
 * on the newest message.
 */

import { Ionicons } from '@expo/vector-icons';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { router, usePathname, type Href } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';
import {
  Dimensions,
  Keyboard,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
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

import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { LocalAI } from '../../../modules/local-ai';
import type { ChatTable } from '../../domain/assistant/chatActions';
import { dailyBrief, type BriefInput } from '../../domain/assistant/dailyBrief';
import { PERSONAS } from '../../domain/assistant/personas';
import { plainText } from '../../domain/assistant/plainText';
import { resolveScreenCapability } from '../../domain/assistant/screenRegistry';
import type { ToolExecutionResult } from '../../domain/assistant/toolRegistry';
import { hasSanctuaryStatus } from '../../domain/game/rewards';
import { languageOf, LANGUAGES } from '../../domain/languages';
import { speakCoachLine, stopCoachSpeech } from '../../services/ai/coachVoiceService';
import { SUPPORTED_COUNTRIES } from '../../services/ai/emergencyDirectory';
import {
  detectCrisisIntent,
  GROUNDING_EXERCISES,
  type CrisisDetectionResult,
} from '../../services/ai/emergencySupport';
import { getSetupState, subscribeSetup, type SetupState } from '../../services/ai/modelSetup';
import { setChatActionHooks } from '../../services/assistant/chatActions';
import {
  pickFile,
  readAttachment,
  type PickedFile,
} from '../../services/assistant/chatAttachments';
import { CHAT_PAGE, chatStore, type ChatMessage } from '../../services/assistant/chatStore';
import { hapticMedium, hapticSelection } from '../../services/haptics';
import { thriveRag } from '../../services/local-ai/rag/thriveRag';
import {
  resolveEmergencyJurisdiction,
  setExplicitUserCountry,
  type ResolvedJurisdiction,
} from '../../services/location/emergencyLocationResolver';
import {
  globalVoiceController,
  type VoiceAssistantState,
} from '../../services/voice/globalVoiceController';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { AnvayCompanion } from '../brand/AnvayCompanion';
import { CameraCapture } from '../camera/CameraCapture';
import { Chip } from '../ui/Chip';
import { PressableScale } from '../ui/PressableScale';
import { Button } from '../ui/Button';
import { SquircleSurface } from '../ui/SquircleSurface';
import { BrainSetupCard } from './BrainSetupCard';

type Turn = ChatMessage;

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

function briefInput(): BriefInput {
  const st = useRootStore.getState();
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return {
    name: st.koshProfile?.preferredName || st.user?.pseudonym?.split(' ')[0] || null,
    hour: d.getHours(),
    today,
    checkedInToday: st.checkInHistory.some((c) => c.date === today),
    waterGlasses: st.hydration[today] ?? 0,
    waterTarget: st.hydrationTargetGlasses,
    openQuests: st.todayQuests
      .filter((q) => !q.isCompleted && q.status !== 'skipped')
      .map((q) => q.title),
    medicines: st.medications,
    medicationTaken: st.medicationTaken,
    nowHHMM: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    followUps: st.followUps,
  };
}

export function GlobalVoiceAssistant() {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceAssistantState>('idle');
  const [partial, setPartial] = useState('');
  // The conversation lives in SQLite: the newest page loads now, older pages as you scroll up.
  const [turns, setTurns] = useState<Turn[]>(() => {
    const legacy = useRootStore.getState().coachTurns;
    if (legacy.length && chatStore.importLegacy(legacy)) useRootStore.getState().setCoachTurns([]);
    return chatStore.page();
  });
  const hasOlder = useRef(true);
  const [typed, setTyped] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const list = useRef<FlashListRef<Turn>>(null);
  const input = useRef<TextInputInstance>(null);
  const [kb, setKb] = useState(0);
  const [setupState, setSetupState] = useState<SetupState>(getSetupState);
  useEffect(() => subscribeSetup(setSetupState), []);
  const isModelSettingUp =
    setupState.phase === 'downloading' ||
    setupState.phase === 'verifying' ||
    setupState.phase === 'loading';
  const setupProgress = Math.round((setupState.progress ?? 0) * 100);

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

  // Save new and growing messages shortly after they change (not on every streamed token). Only
  // the newest few can change, so older pages are never rewritten.
  useEffect(() => {
    const id = setTimeout(() => chatStore.upsert(turns.slice(-3)), 600);
    return () => clearTimeout(id);
  }, [turns]);

  const loadOlder = useCallback(() => {
    if (!hasOlder.current) return;
    setTurns((t) => {
      const older = chatStore.page(t[0]?.at);
      if (older.length < CHAT_PAGE) hasOlder.current = false;
      return older.length ? [...older, ...t] : t;
    });
  }, []);

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
  // The voice orb: while listening, a second ring follows the loudness of the person's voice.
  const level = useSharedValue(0);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value === 0 ? 0 : (1 - ring.value) * 0.5,
    transform: [{ scale: 1 + ring.value * 0.55 }],
  }));
  const levelStyle = useAnimatedStyle(() => ({
    opacity: listening ? 0.35 : 0,
    transform: [{ scale: 1 + level.value * 0.7 }],
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
        const quote = pendingQuote.current;
        pendingQuote.current = null;
        const shown = quote ? text.replace(/^About your earlier reply ".*?": /s, '') : text;
        const crisis = detectCrisisIntent(shown, jurisdiction?.countryCode);
        if (crisis.gradedTier !== 'ordinary_difficulty') {
          setActiveCrisis(crisis);
          if (persona !== 'support') {
            setPersona('support');
          }
        }
        setTurns((t) => [
          ...t,
          {
            id: newId(),
            who: 'you' as const,
            text: shown,
            quote: quote ?? undefined,
            at: Date.now(),
          },
        ]);
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
            const data = next.tool?.data as { table?: ChatTable; transient?: boolean } | undefined;
            const table = data?.table;
            const transient = data?.transient || undefined;
            setTurns((t) => {
              const last = t[t.length - 1];
              // A progress line ("Reading…") is replaced by whatever comes next.
              if (last?.who === 'coach' && last.transient) {
                return [...t.slice(0, -1), { ...last, text: next.reply, route, table, transient }];
              }
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
                {
                  id: newId(),
                  who: 'coach' as const,
                  text: next.reply,
                  route,
                  table,
                  transient,
                  at: Date.now(),
                },
              ];
            });
          });
        }
        if (tool?.autoNavigate && tool.routeToOpen) {
          // The screen was opened by the tool; get out of the way so the person sees it.
          setTimeout(() => globalVoiceController.close(), 900);
        }
      },
      onError: (e) => setError(e),
      // Android reports roughly -2..10 dB; map to 0..1 and ease toward it.
      onAudioLevel: (db) => {
        level.value = withTiming(Math.min(1, Math.max(0, (db + 2) / 12)), { duration: 120 });
      },
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
          // First open of the day: Anvay starts with a short brief from the person's own data.
          setTurns((t) => {
            const last = t[t.length - 1];
            const today = new Date().toDateString();
            if (t.some((m) => m.who === 'coach' && new Date(m.at).toDateString() === today))
              return t;
            if (last && new Date(last.at).toDateString() === today) return t;
            return [
              ...t,
              {
                id: newId(),
                who: 'coach' as const,
                text: dailyBrief(briefInput()),
                at: Date.now(),
              },
            ];
          });
        } else {
          setFocused(false);
        }
        setVisible(open);
      }),
    [],
  );

  const sanctuary = useRootStore((st) => hasSanctuaryStatus(st.marketOwned));
  const coachLanguage = useRootStore((st) => st.coachLanguage);
  const setCoachLanguage = useRootStore((st) => st.setCoachLanguage);
  const [langOpen, setLangOpen] = useState(false);
  const persona = useRootStore((st) => st.coachPersona);
  const setPersona = useRootStore((st) => st.setCoachPersona);
  const showToast = useRootStore((st) => st.showToast);

  const [jurisdiction, setJurisdiction] = useState<ResolvedJurisdiction | null>(null);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [directoryModalVisible, setDirectoryModalVisible] = useState(false);
  const [groundingModal, setGroundingModal] = useState<'breathing' | 'sensory' | null>(null);
  const [activeCrisis, setActiveCrisis] = useState<CrisisDetectionResult | null>(null);

  // Box Breathing state (4-4-4-4: Inhale, Hold, Exhale, Rest)
  const [breathingStep, setBreathingStep] = useState(0);
  const [breathingCount, setBreathingCount] = useState(4);
  const breathAnim = useSharedValue(1);

  // 5-4-3-2-1 Sensory grounding state
  const [sensoryStep, setSensoryStep] = useState(0);

  useEffect(() => {
    if (visible && !jurisdiction) {
      resolveEmergencyJurisdiction()
        .then(setJurisdiction)
        .catch(() => null);
    }
  }, [visible, jurisdiction]);

  useEffect(() => {
    if (groundingModal !== 'breathing') return;
    setBreathingStep(0);
    setBreathingCount(4);
    breathAnim.value = 1;
    const interval = setInterval(() => {
      setBreathingCount((prev) => {
        if (prev <= 1) {
          setBreathingStep((s) => {
            const next = (s + 1) % 4;
            if (next === 0) breathAnim.value = withTiming(1.4, { duration: 4000 });
            else if (next === 2) breathAnim.value = withTiming(1.0, { duration: 4000 });
            return next;
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    breathAnim.value = withTiming(1.4, { duration: 4000 });
    return () => clearInterval(interval);
  }, [groundingModal, breathAnim]);

  const callNumber = (number: string) => {
    hapticMedium();
    const clean = number.replace(/\s+/g, '');
    Linking.openURL(`tel:${clean}`).catch(() => {
      showToast({
        type: 'warning',
        title: 'Unable to open dialer',
        message: `Please dial ${number} manually.`,
      });
    });
  };

  const selectCountry = (code: string) => {
    setExplicitUserCountry(code);
    resolveEmergencyJurisdiction(code).then((jur) => {
      setJurisdiction(jur);
      setCountryModalVisible(false);
    });
  };

  const breathAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathAnim.value }],
  }));

  const clearHistory = () => {
    hapticSelection();
    setTurns([]);
    chatStore.clear();
  };

  // "Clear the chat" and "close" said in the chat act on this sheet.
  useEffect(() => {
    setChatActionHooks({
      closeSheet: close,
      clearChat: () => {
        setTurns([]);
        chatStore.clear();
      },
    });
  }, [close]);

  const lastSent = useRef({ text: '', at: 0 });
  const pendingQuote = useRef<string | null>(null);
  const send = (text: string) => {
    if (pending) return sendAttachment();
    const t = text.trim();
    if (!t) return;
    // A hardware Enter can fire submit twice, and a double tap sends twice: one message only.
    if (lastSent.current.text === t && Date.now() - lastSent.current.at < 1200) return;
    lastSent.current = { text: t, at: Date.now() };
    hapticSelection();
    setTyped('');

    // Detect situational crisis or graded distress
    const crisis = detectCrisisIntent(t, jurisdiction?.countryCode);
    if (crisis.gradedTier !== 'ordinary_difficulty') {
      setActiveCrisis(crisis);
      if (persona !== 'support') {
        setPersona('support');
      }
    } else if (activeCrisis && activeCrisis.gradedTier !== 'imminent_risk') {
      setActiveCrisis(null);
    }
    if (replyTo) {
      // A reply to a specific answer: the coach gets that answer as context; the chat shows a quote.
      const quote = plainText(replyTo.text).slice(0, 280);
      setReplyTo(null);
      pendingQuote.current = quote;
      void globalVoiceController.handleFinalUtterance(
        `About your earlier reply "${quote}": ${t}`,
        'text',
      );
      return;
    }
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

  // Open at the newest message, and jump to it whenever the person sends something (their own
  // message must never land off-screen, whatever was scrolled before).
  const lastWho = turns[turns.length - 1]?.who;
  useEffect(() => {
    if (!visible || !turns.length) return;
    const t = setTimeout(() => list.current?.scrollToEnd({ animated: false }), 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  useEffect(() => {
    if (lastWho !== 'you') return;
    const t = setTimeout(() => list.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [turns.length, lastWho]);

  // Keep the newest message in view when the keyboard opens and the sheet gets shorter.
  useEffect(() => {
    if (!kb || !turns.length) return;
    const t = setTimeout(() => list.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [kb, turns.length]);
  // 👍 keeps the answer in local knowledge so similar questions reuse it; 👎 is remembered so the
  // reply is not reused. Tapping the same rating again clears it.
  const rate = useCallback((id: string, fb: 'up' | 'down') => {
    hapticSelection();
    setTurns((t) => {
      const i = t.findIndex((m) => m.id === id);
      if (i < 0) return t;
      const next = { ...t[i], feedback: t[i].feedback === fb ? undefined : fb };
      chatStore.upsert([next]);
      if (next.feedback === 'up') {
        const asked = [...t.slice(0, i)].reverse().find((m) => m.who === 'you')?.text ?? '';
        void thriveRag
          .remember(
            asked.slice(0, 80) || 'Helpful answer',
            `Question: ${asked}\nAnswer: ${next.text}`,
            'wellness_guide',
            {
              source: 'liked_reply',
              messageId: id,
            },
          )
          .catch(() => undefined);
      }
      return [...t.slice(0, i), next, ...t.slice(i + 1)];
    });
  }, []);
  // A picked file waits above the composer until sent, so nothing is read by accident. Whatever
  // is typed alongside becomes the question about it.
  const [pending, setPending] = useState<PickedFile | null>(null);
  // Camera: the same in-app camera as meal and document photos (CameraX inside Thrivefold; the
  // system camera can close the app on low-memory phones).
  const [camOpen, setCamOpen] = useState(false);
  const attach = async (camera: boolean) => {
    hapticSelection();
    Keyboard.dismiss();
    if (camera) {
      setCamOpen(true);
      return;
    }
    const file = await pickFile().catch(() => null);
    if (file) setPending(file);
  };
  const sendAttachment = () => {
    if (!pending) return;
    hapticSelection();
    const file = pending;
    const question = typed.trim();
    setPending(null);
    setTyped('');
    setTurns((t) => [
      ...t,
      {
        id: newId(),
        who: 'you' as const,
        text: question || file.name,
        at: Date.now(),
        attachment: { uri: file.uri, name: file.name, kind: file.kind },
      },
    ]);
    void readAttachment(file, question);
  };
  const share = useCallback((text: string) => {
    void Share.share({ message: plainText(text) }).catch(() => undefined);
  }, []);

  // Per-reply tools: listen, translate on the phone, reply to it, copy.
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const listen = useCallback((t: Turn) => {
    hapticSelection();
    setSpeakingId((cur) => {
      if (cur === t.id) {
        stopCoachSpeech();
        return null;
      }
      void speakCoachLine(plainText(t.translation?.text ?? t.text), {
        onEnd: () => setSpeakingId((c) => (c === t.id ? null : c)),
      });
      return t.id;
    });
  }, []);
  const translateTurn = useCallback(async (t: Turn) => {
    hapticSelection();
    if (t.translation) {
      setTurns((all) => all.map((m) => (m.id === t.id ? { ...m, translation: undefined } : m)));
      return;
    }
    const target =
      useRootStore.getState().coachLanguage === 'en' ? 'hi' : useRootStore.getState().coachLanguage;
    try {
      const r = await LocalAI.translateText(t.text, target);
      setTurns((all) => {
        const next = all.map((m) =>
          m.id === t.id ? { ...m, translation: { lang: target, text: r.text } } : m,
        );
        const changed = next.find((m) => m.id === t.id);
        if (changed) chatStore.upsert([changed]);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not translate.');
    }
  }, []);
  const [replyTo, setReplyTo] = useState<Turn | null>(null);
  const replyToTurn = useCallback((t: Turn) => {
    hapticSelection();
    setReplyTo(t);
    setTimeout(() => input.current?.focus(), 50);
  }, []);
  const copy = useCallback((t: Turn) => {
    hapticSelection();
    void Clipboard.setStringAsync(plainText(t.translation?.text ?? t.text));
    useRootStore.getState().showToast({ type: 'success', message: 'Copied' });
  }, []);

  const renderTurn = useCallback(
    ({ item }: { item: Turn }) => (
      <TurnRow
        turn={item}
        onOpen={go}
        onRate={rate}
        onShare={share}
        onListen={listen}
        onTranslate={translateTurn}
        onReply={replyToTurn}
        onCopy={copy}
        speaking={speakingId === item.id}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [speakingId],
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

  const handleRequestClose = useCallback(() => {
    if (directoryModalVisible) {
      setDirectoryModalVisible(false);
      return;
    }
    if (countryModalVisible) {
      setCountryModalVisible(false);
      return;
    }
    if (groundingModal) {
      setGroundingModal(null);
      return;
    }
    if (camOpen) {
      setCamOpen(false);
      return;
    }
    close();
  }, [directoryModalVisible, countryModalVisible, groundingModal, camOpen, close]);

  const hasText = typed.trim().length > 0 || pending !== null;
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
      onRequestClose={handleRequestClose}
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
                      <View style={styles.statusRow}>
                        <Text style={[typography.subheading, { color: colors.text.primary }]}>
                          Anvay
                        </Text>
                        {persona === 'support' ? (
                          <View
                            style={[
                              styles.sanctuaryPill,
                              { backgroundColor: colors.primaryAlpha, marginLeft: 8 },
                            ]}
                            accessibilityLabel="Support Companion Sanctuary"
                          >
                            <Ionicons name="heart-circle" size={13} color={colors.primary} />
                            <Text
                              style={[
                                typography.captionBold,
                                { color: colors.primary, marginLeft: 3 },
                              ]}
                            >
                              Sanctuary
                            </Text>
                          </View>
                        ) : sanctuary ? (
                          <View
                            style={[styles.sanctuary, { backgroundColor: colors.surface2 }]}
                            accessibilityLabel="Sanctuary status"
                          >
                            <Ionicons name="ribbon" size={12} color={colors.primary} />
                            <Text style={[typography.caption, { color: colors.primary }]}>
                              Sanctuary
                            </Text>
                          </View>
                        ) : null}
                      </View>
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
                      onPress={() => setLangOpen((v) => !v)}
                      hitSlop={8}
                      accessibilityLabel={`Reply language: ${languageOf(coachLanguage).label}`}
                      style={[styles.langBtn, { marginRight: 14, borderColor: colors.surface3 }]}
                    >
                      <Ionicons name="language-outline" size={18} color={colors.text.secondary} />
                      <Text style={[typography.captionBold, { color: colors.text.secondary }]}>
                        {coachLanguage.toUpperCase()}
                      </Text>
                    </PressableScale>
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

              {langOpen ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  style={styles.personaRow}
                  contentContainerStyle={{ paddingHorizontal: spacing.base }}
                >
                  {LANGUAGES.map((l) => (
                    <Chip
                      key={l.code}
                      label={l.native}
                      selected={coachLanguage === l.code}
                      onPress={() => {
                        hapticSelection();
                        setCoachLanguage(l.code);
                        setLangOpen(false);
                      }}
                    />
                  ))}
                </ScrollView>
              ) : null}
              {/* One companion, several roles: the voice, memory and rules stay the same. */}
              {langOpen ? null : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  style={styles.personaRow}
                  contentContainerStyle={{ paddingHorizontal: spacing.base }}
                >
                  {PERSONAS.map((p) => (
                    <Chip
                      key={p.id}
                      label={p.label}
                      selected={persona === p.id}
                      onPress={() => {
                        hapticSelection();
                        setPersona(p.id);
                      }}
                      icon={
                        <Ionicons
                          name={p.icon as keyof typeof Ionicons.glyphMap}
                          size={15}
                          color={persona === p.id ? colors.onPrimary : colors.text.secondary}
                        />
                      }
                    />
                  ))}
                </ScrollView>
              )}

              {/* Graded Situational Safety & Support Companion Toolbar */}
              {activeCrisis?.gradedTier === 'imminent_risk' ? (
                /* Tier 4: Explicit Imminent Risk */
                <View style={styles.safetyContainer}>
                  <SquircleSurface
                    radius={22}
                    fill={colors.errorSurface}
                    style={[styles.safetyCardBox, { borderColor: colors.error, borderWidth: 1 }]}
                  >
                    <View style={styles.safetyCardRow}>
                      <View style={[styles.safetyIconBadge, { backgroundColor: colors.error }]}>
                        <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.flex}>
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          Immediate Care & Safety
                        </Text>
                        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                          Your life and physical safety are the highest priority. Free 24/7 care is here.
                        </Text>
                      </View>
                      <PressableScale onPress={() => setActiveCrisis(null)} hitSlop={8}>
                        <Ionicons name="close" size={18} color={colors.text.muted} />
                      </PressableScale>
                    </View>
                    <View style={styles.safetyCardActions}>
                      <PressableScale
                        onPress={() => callNumber(jurisdiction?.primaryEmergency.number ?? '112')}
                        style={[styles.safetyActionBtn, { backgroundColor: colors.error }]}
                        accessibilityRole="button"
                        accessibilityLabel={`Call Emergency ${jurisdiction?.primaryEmergency.number ?? '112'}`}
                      >
                        <Ionicons name="call" size={14} color="#FFFFFF" />
                        <Text style={[typography.captionBold, { color: '#FFFFFF', marginLeft: 6 }]}>
                          Call Emergency ({jurisdiction?.primaryEmergency.number ?? '112'})
                        </Text>
                      </PressableScale>

                      <PressableScale
                        onPress={() => callNumber(jurisdiction?.primaryMentalHealth.number ?? '14416')}
                        style={[styles.safetyActionBtn, { backgroundColor: colors.primary }]}
                        accessibilityRole="button"
                        accessibilityLabel={`Call Lifeline ${jurisdiction?.primaryMentalHealth.number ?? '14416'}`}
                      >
                        <Ionicons name="heart" size={14} color={colors.onPrimary} />
                        <Text style={[typography.captionBold, { color: colors.onPrimary, marginLeft: 6 }]}>
                          Lifeline ({jurisdiction?.primaryMentalHealth.number ?? '14416'})
                        </Text>
                      </PressableScale>
                    </View>
                  </SquircleSurface>
                </View>
              ) : activeCrisis?.gradedTier === 'ambiguous_safety' ? (
                /* Tier 3: Ambiguous Safety Concern */
                <View style={styles.safetyContainer}>
                  <SquircleSurface
                    radius={22}
                    fill={colors.surface1}
                    style={[styles.safetyCardBox, { borderColor: colors.primary, borderWidth: 1 }]}
                  >
                    <View style={styles.safetyCardRow}>
                      <View style={[styles.safetyIconBadge, { backgroundColor: colors.primaryAlpha }]}>
                        <Ionicons name="heart" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.flex}>
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          We are right here with you
                        </Text>
                        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                          Are you safe right now? Take a gentle breath. You do not have to carry this alone.
                        </Text>
                      </View>
                      <PressableScale onPress={() => setActiveCrisis(null)} hitSlop={8}>
                        <Ionicons name="close" size={18} color={colors.text.muted} />
                      </PressableScale>
                    </View>
                    <View style={styles.safetyCardActions}>
                      <PressableScale
                        onPress={() => callNumber(jurisdiction?.primaryMentalHealth.number ?? '14416')}
                        style={[styles.safetyActionBtn, { backgroundColor: colors.primary }]}
                        accessibilityRole="button"
                        accessibilityLabel={`Call 24/7 Lifeline ${jurisdiction?.primaryMentalHealth.number ?? '14416'}`}
                      >
                        <Ionicons name="call" size={14} color={colors.onPrimary} />
                        <Text style={[typography.captionBold, { color: colors.onPrimary, marginLeft: 6 }]}>
                          24/7 Support ({jurisdiction?.primaryMentalHealth.number ?? '14416'})
                        </Text>
                      </PressableScale>
                      <PressableScale
                        onPress={() => setGroundingModal('breathing')}
                        style={[styles.safetyActionBtn, { backgroundColor: colors.surface2 }]}
                        accessibilityRole="button"
                        accessibilityLabel="Box breathing exercise"
                      >
                        <Ionicons name="flower-outline" size={14} color={colors.text.primary} />
                        <Text style={[typography.captionBold, { color: colors.text.primary, marginLeft: 6 }]}>
                          Box Breathing
                        </Text>
                      </PressableScale>
                    </View>
                  </SquircleSurface>
                </View>
              ) : activeCrisis?.gradedTier === 'significant_distress' ? (
                /* Tier 2: Significant Distress (Panic / Overwhelm) */
                <View style={styles.safetyContainer}>
                  <SquircleSurface
                    radius={22}
                    fill={colors.surface1}
                    style={[styles.safetyCardBox, { borderColor: colors.border, borderWidth: 1 }]}
                  >
                    <View style={styles.safetyCardRow}>
                      <View style={[styles.safetyIconBadge, { backgroundColor: colors.primaryAlpha }]}>
                        <Ionicons name="flower-outline" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.flex}>
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          Pause and steady with me
                        </Text>
                        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                          Your nervous system is in high alert. This wave will settle gently.
                        </Text>
                      </View>
                      <PressableScale onPress={() => setActiveCrisis(null)} hitSlop={8}>
                        <Ionicons name="close" size={18} color={colors.text.muted} />
                      </PressableScale>
                    </View>
                    <View style={styles.safetyCardActions}>
                      <PressableScale
                        onPress={() => setGroundingModal('breathing')}
                        style={[styles.safetyActionBtn, { backgroundColor: colors.primary }]}
                        accessibilityRole="button"
                        accessibilityLabel="Start box breathing exercise"
                      >
                        <Ionicons name="flower-outline" size={14} color={colors.onPrimary} />
                        <Text style={[typography.captionBold, { color: colors.onPrimary, marginLeft: 6 }]}>
                          Start Box Breathing
                        </Text>
                      </PressableScale>
                      <PressableScale
                        onPress={() => setGroundingModal('sensory')}
                        style={[styles.safetyActionBtn, { backgroundColor: colors.surface2 }]}
                        accessibilityRole="button"
                        accessibilityLabel="5-4-3-2-1 Sensory grounding exercise"
                      >
                        <Ionicons name="eye-outline" size={14} color={colors.text.primary} />
                        <Text style={[typography.captionBold, { color: colors.text.primary, marginLeft: 6 }]}>
                          5-4-3-2-1 Sensory
                        </Text>
                      </PressableScale>
                    </View>
                  </SquircleSurface>
                </View>
              ) : persona === 'support' ? (
                /* Tier 1: Ordinary Support Context — Calm, Tranquil Sanctuary Bar */
                <View style={styles.calmSupportBar}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.calmSupportChipsContainer}
                  >
                    <PressableScale
                      onPress={() => setGroundingModal('breathing')}
                      style={[styles.calmSupportChip, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}
                      accessibilityRole="button"
                      accessibilityLabel="Box breathing exercise"
                    >
                      <Ionicons name="flower-outline" size={14} color={colors.primary} />
                      <Text style={[typography.captionBold, { color: colors.text.primary, marginLeft: 6 }]}>
                        Box Breathing
                      </Text>
                    </PressableScale>

                    <PressableScale
                      onPress={() => setGroundingModal('sensory')}
                      style={[styles.calmSupportChip, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}
                      accessibilityRole="button"
                      accessibilityLabel="5-4-3-2-1 sensory grounding"
                    >
                      <Ionicons name="eye-outline" size={14} color={colors.primary} />
                      <Text style={[typography.captionBold, { color: colors.text.primary, marginLeft: 6 }]}>
                        5-4-3-2-1 Grounding
                      </Text>
                    </PressableScale>

                    <PressableScale
                      onPress={() => setDirectoryModalVisible(true)}
                      style={[styles.calmSupportChip, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}
                      accessibilityRole="button"
                      accessibilityLabel={`View all verified helplines for ${jurisdiction?.countryName ?? 'India'}`}
                    >
                      <Text style={{ fontSize: 13 }}>{jurisdiction?.flag ?? '🇮🇳'}</Text>
                      <Text style={[typography.captionBold, { color: colors.text.secondary, marginLeft: 6 }]}>
                        Helplines
                      </Text>
                    </PressableScale>

                    <PressableScale
                      onPress={() => setCountryModalVisible(true)}
                      style={[styles.calmSupportChip, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}
                      accessibilityRole="button"
                      accessibilityLabel={`Current country: ${jurisdiction?.countryName ?? 'India'}. Tap to change country.`}
                    >
                      <Ionicons name="globe-outline" size={14} color={colors.text.muted} />
                      <Text style={[typography.caption, { color: colors.text.muted, marginLeft: 4 }]}>
                        {jurisdiction?.countryCode ?? 'IN'}
                      </Text>
                    </PressableScale>
                  </ScrollView>
                </View>
              ) : null}

              {turns.length === 0 && !partial ? (
                // Empty conversation: a plain view (no inverted-list flip quirks).
                <View style={[styles.flex, { paddingHorizontal: spacing.base }]}>
                  <BrainSetupCard compact={focused} />
                  <View style={styles.empty}>
                    {/* The whole character, never cropped; it steps aside while typing. */}
                    {focused ? null : (
                      <View style={styles.buddy} pointerEvents="none">
                        <AnvayCompanion
                          size={140}
                          mood={mood}
                          topic={persona === 'support' ? 'mind' : undefined}
                        />
                      </View>
                    )}
                    {persona === 'support' ? (
                      <>
                        <Text
                          style={[
                            typography.body,
                            { color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
                          ]}
                        >
                          I am right here with you. Take a slow, gentle breath. Whatever you are
                          feeling, you can talk to me freely. If you need urgent human support, tap
                          any helpline above.
                        </Text>
                        <Text
                          style={[
                            typography.captionBold,
                            styles.chipsTitle,
                            { color: colors.text.muted },
                          ]}
                        >
                          SAFE WAYS TO START
                        </Text>
                        <View style={styles.chips}>
                          {[
                            'I feel completely overwhelmed right now',
                            'I have racing anxious thoughts',
                            'I just need someone to talk to',
                            'Guide me through a calming exercise',
                          ].map((cmd) => (
                            <PressableScale
                              key={cmd}
                              onPress={() => send(cmd)}
                              style={[
                                styles.chip,
                                { backgroundColor: colors.surface, borderColor: colors.surface2 },
                              ]}
                            >
                              <Text style={[typography.caption, { color: colors.text.primary }]}>
                                {cmd}
                              </Text>
                            </PressableScale>
                          ))}
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={[typography.body, { color: colors.text.secondary }]}>
                          Talk naturally. Ask a question, or say things like &quot;log two glasses
                          of water and then open sleep&quot;, &quot;export all my metrics&quot; or
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
                      </>
                    )}
                  </View>
                </View>
              ) : (
                <FlashList
                  ref={list}
                  // A real chat: oldest first, opens at the newest message, keeps its place when
                  // older pages load above, and follows new replies while you are at the bottom.
                  data={turns}
                  keyExtractor={(t) => t.id}
                  renderItem={renderTurn}
                  maintainVisibleContentPosition={{
                    startRenderingFromBottom: true,
                    autoscrollToBottomThreshold: 0.25,
                  }}
                  onStartReached={loadOlder}
                  onStartReachedThreshold={0.3}
                  style={styles.flex}
                  contentContainerStyle={{
                    paddingHorizontal: spacing.base,
                    paddingVertical: spacing.sm,
                  }}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                  ListHeaderComponent={<BrainSetupCard compact />}
                  ListFooterComponent={
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
                {replyTo ? (
                  <View
                    style={[
                      styles.replyBar,
                      { backgroundColor: colors.surface, borderLeftColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[typography.caption, styles.flex, { color: colors.text.secondary }]}
                      numberOfLines={2}
                    >
                      Replying to: {plainText(replyTo.text)}
                    </Text>
                    <PressableScale
                      onPress={() => setReplyTo(null)}
                      hitSlop={10}
                      accessibilityLabel="Cancel reply"
                    >
                      <Ionicons name="close" size={18} color={colors.text.muted} />
                    </PressableScale>
                  </View>
                ) : null}
                {pending ? (
                  <View style={[styles.pending, { backgroundColor: colors.surface }]}>
                    {pending.kind === 'image' ? (
                      <Image
                        source={{ uri: pending.uri }}
                        style={styles.pendingThumb}
                        contentFit="cover"
                        accessibilityLabel={pending.name}
                      />
                    ) : (
                      <View
                        style={[
                          styles.pendingThumb,
                          styles.pendingIcon,
                          { backgroundColor: colors.surface2 },
                        ]}
                      >
                        <Ionicons
                          name={
                            pending.kind === 'pdf' ? 'document-text-outline' : 'document-outline'
                          }
                          size={26}
                          color={colors.text.secondary}
                        />
                      </View>
                    )}
                    <View style={styles.flex}>
                      <Text
                        style={[typography.bodyBold, { color: colors.text.primary }]}
                        numberOfLines={1}
                      >
                        {pending.name}
                      </Text>
                      <Text
                        style={[typography.caption, { color: colors.text.secondary }]}
                        numberOfLines={2}
                      >
                        Read on this phone. Type a question, or just send for a summary.
                      </Text>
                    </View>
                    <PressableScale
                      onPress={() => setPending(null)}
                      hitSlop={10}
                      accessibilityLabel="Remove the file"
                    >
                      <Ionicons name="close-circle" size={22} color={colors.text.muted} />
                    </PressableScale>
                  </View>
                ) : null}
                <View
                  style={[
                    styles.pill,
                    {
                      backgroundColor: colors.surface,
                      borderColor: focused ? colors.primary : colors.surface2,
                    },
                  ]}
                >
                  {/* Attach a photo (tap: gallery, hold: camera): prescriptions, diet charts, plans. */}
                  <PressableScale
                    onPress={() => void attach(false)}
                    hitSlop={8}
                    style={styles.attach}
                    accessibilityLabel="Attach a file: PDF, photo or text"
                  >
                    <Ionicons name="attach" size={22} color={colors.text.secondary} />
                  </PressableScale>
                  <PressableScale
                    onPress={() => void attach(true)}
                    hitSlop={8}
                    style={styles.camBtn}
                    accessibilityLabel="Take a photo"
                  >
                    <Ionicons name="camera-outline" size={22} color={colors.text.secondary} />
                  </PressableScale>
                  <TextInput
                    style={[
                      typography.body,
                      styles.input,
                      { color: colors.text.primary, opacity: isModelSettingUp ? 0.6 : 1 },
                    ]}
                    placeholder={
                      isModelSettingUp
                        ? `Anvay on-device model downloading (${setupProgress}%)…`
                        : listening
                          ? 'Listening… or type'
                          : 'Message Anvay'
                    }
                    placeholderTextColor={colors.text.muted}
                    value={typed}
                    onChangeText={setTyped}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    ref={input}
                    multiline
                    editable={!isModelSettingUp}
                    onSubmitEditing={() => !isModelSettingUp && send(typed)}
                    returnKeyType="send"
                    submitBehavior="submit"
                    accessibilityLabel="Type a message to Anvay"
                  />
                  <View style={styles.actionWrap}>
                    <Animated.View
                      pointerEvents="none"
                      style={[styles.ring, { backgroundColor: colors.error }, ringStyle]}
                    />
                    <Animated.View
                      pointerEvents="none"
                      style={[styles.ring, { backgroundColor: colors.primary }, levelStyle]}
                    />
                    <PressableScale
                      accessibilityRole="button"
                      accessibilityLabel={
                        isModelSettingUp
                          ? `Model downloading ${setupProgress}%`
                          : hasText
                            ? 'Send'
                            : listening
                              ? 'Stop listening'
                              : voiceState === 'speaking'
                                ? 'Interrupt and talk'
                                : 'Talk'
                      }
                      disabled={isModelSettingUp}
                      onPress={
                        isModelSettingUp ? undefined : hasText ? () => send(typed) : toggleMic
                      }
                      style={[
                        styles.action,
                        {
                          backgroundColor: isModelSettingUp
                            ? colors.surface2
                            : listening && !hasText
                              ? colors.error
                              : colors.primary,
                          opacity: isModelSettingUp ? 0.6 : 1,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          isModelSettingUp
                            ? 'cloud-download-outline'
                            : hasText
                              ? 'send'
                              : listening
                                ? 'stop'
                                : 'mic'
                        }
                        size={20}
                        color={isModelSettingUp ? colors.text.muted : colors.text.inverse}
                      />
                    </PressableScale>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
        <CameraCapture
          visible={camOpen}
          onClose={() => setCamOpen(false)}
          guide="document"
          title="Take a photo"
          hint="A prescription, medicine strip, report or anything to read. Hold it flat in good light."
          onPhoto={(uri) => {
            setCamOpen(false);
            setPending({ uri, name: 'Photo', mime: 'image/jpeg', kind: 'image' });
          }}
        />

        {/* In-sheet overlays (rendered within GlobalVoiceAssistant's own window, avoiding Android nested Modal bugs) */}
        {countryModalVisible ? (
          <View style={styles.sheetOverlayFill} pointerEvents="box-none">
            <Pressable
              style={styles.sheetOverlayBackdrop}
              onPress={() => setCountryModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close country selector"
            />
            <View style={styles.sheetOverlayContentWrapper} pointerEvents="box-none">
              <SquircleSurface
                radius={28}
                fill={colors.background}
                style={[
                  styles.modalBox,
                  { borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    Select Emergency Country
                  </Text>
                  <PressableScale
                    onPress={() => setCountryModalVisible(false)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={22} color={colors.text.secondary} />
                  </PressableScale>
                </View>
                <Text
                  style={[typography.caption, { color: colors.text.secondary, marginBottom: 12 }]}
                >
                  Emergency and mental health helplines match your physical country.
                </Text>
                <ScrollView style={{ maxHeight: 340 }}>
                  {SUPPORTED_COUNTRIES.map((c) => {
                    const sel = jurisdiction?.countryCode === c.code;
                    return (
                      <PressableScale
                        key={c.code}
                        onPress={() => selectCountry(c.code)}
                        style={[
                          styles.countryRow,
                          {
                            backgroundColor: sel ? colors.primaryAlpha : colors.surface,
                            borderColor: sel ? colors.primary : colors.surface2,
                          },
                        ]}
                      >
                        <Text style={styles.countryFlagLarge}>{c.flag}</Text>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                            {c.name}
                          </Text>
                          <Text style={[typography.caption, { color: colors.text.secondary }]}>
                            Emergency: {c.defaultEmergency} • Lifeline: {c.defaultMentalHealth}
                          </Text>
                        </View>
                        {sel ? (
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        ) : null}
                      </PressableScale>
                    );
                  })}
                </ScrollView>
                <Button
                  label="Done"
                  variant="secondary"
                  size="sm"
                  onPress={() => setCountryModalVisible(false)}
                  style={{ marginTop: 14 }}
                />
              </SquircleSurface>
            </View>
          </View>
        ) : null}

        {/* All Helplines Directory Overlay */}
        {directoryModalVisible ? (
          <View style={styles.sheetOverlayFill} pointerEvents="box-none">
            <Pressable
              style={styles.sheetOverlayBackdrop}
              onPress={() => setDirectoryModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close helplines directory"
            />
            <View style={styles.sheetOverlayContentWrapper} pointerEvents="box-none">
              <SquircleSurface
                radius={28}
                fill={colors.background}
                style={[
                  styles.modalBox,
                  { borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    {jurisdiction?.flag} Verified Helplines ({jurisdiction?.countryName})
                  </Text>
                  <PressableScale
                    onPress={() => setDirectoryModalVisible(false)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={22} color={colors.text.secondary} />
                  </PressableScale>
                </View>
                <ScrollView style={{ maxHeight: 380 }}>
                  {jurisdiction?.allContacts.map((contact) => (
                    <View
                      key={contact.id}
                      style={[
                        styles.helplineCard,
                        { backgroundColor: colors.surface, borderColor: colors.surface2 },
                      ]}
                    >
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                          {contact.name}
                        </Text>
                        <Text
                          style={[typography.captionBold, { color: colors.primary, marginTop: 2 }]}
                        >
                          {contact.number} • {contact.hours}
                        </Text>
                        <Text
                          style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}
                        >
                          {contact.coverage} • Source: {contact.officialSource}
                        </Text>
                      </View>
                      <PressableScale
                        onPress={() => callNumber(contact.number)}
                        style={[
                          styles.emergencyCallBtn,
                          {
                            backgroundColor: colors.primary,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                          },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Call ${contact.name}`}
                      >
                        <Ionicons name="call" size={14} color="#FFFFFF" />
                        <Text style={[typography.captionBold, { color: '#FFFFFF', marginLeft: 4 }]}>
                          Call
                        </Text>
                      </PressableScale>
                    </View>
                  ))}
                </ScrollView>
                <Button
                  label="Done"
                  variant="secondary"
                  size="sm"
                  onPress={() => setDirectoryModalVisible(false)}
                  style={{ marginTop: 14 }}
                />
              </SquircleSurface>
            </View>
          </View>
        ) : null}

        {/* Box Breathing In-Sheet Overlay */}
        {groundingModal === 'breathing' ? (
          <View style={styles.sheetOverlayFill} pointerEvents="box-none">
            <Pressable
              style={styles.sheetOverlayBackdrop}
              onPress={() => setGroundingModal(null)}
              accessibilityRole="button"
              accessibilityLabel="Close breathing exercise"
            />
            <View style={styles.sheetOverlayContentWrapper} pointerEvents="box-none">
              <SquircleSurface
                radius={28}
                fill={colors.background}
                style={[
                  styles.modalBox,
                  {
                    borderColor: colors.border,
                    borderWidth: 1,
                    alignItems: 'center',
                  },
                ]}
              >
                <View style={[styles.modalHeader, { width: '100%' }]}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    Box Breathing (Sama Vritti)
                  </Text>
                  <PressableScale
                    onPress={() => setGroundingModal(null)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={22} color={colors.text.secondary} />
                  </PressableScale>
                </View>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.text.secondary, textAlign: 'center', marginBottom: 20 },
                  ]}
                >
                  Calm your autonomic nervous system in 4 rhythmic beats
                </Text>

                {/* Animated breathing circle */}
                <View style={styles.breathingCircleContainer}>
                  <Animated.View
                    style={[
                      styles.breathingCircle,
                      breathAnimStyle,
                      { backgroundColor: colors.primaryAlpha, borderColor: colors.primary },
                    ]}
                  >
                    <Text style={[typography.heading, { color: colors.primary }]}>
                      {breathingCount}
                    </Text>
                  </Animated.View>
                </View>

                <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: 20 }]}>
                  {
                    [
                      'Inhale slowly...',
                      'Gently hold...',
                      'Release slowly...',
                      'Pause in stillness...',
                    ][breathingStep]
                  }
                </Text>
                <Text
                  style={[
                    typography.caption,
                    {
                      color: colors.text.secondary,
                      textAlign: 'center',
                      marginTop: 6,
                      marginHorizontal: 20,
                    },
                  ]}
                >
                  {
                    [
                      'Breathe in gently through your nose, expanding your chest.',
                      'Keep your shoulders completely relaxed.',
                      'Release smoothly and completely through your mouth.',
                      'Rest in calm before the next breath.',
                    ][breathingStep]
                  }
                </Text>

                <Button
                  label="I feel calmer now"
                  variant="primary"
                  size="md"
                  onPress={() => setGroundingModal(null)}
                  style={{ marginTop: 24, width: '100%' }}
                />
              </SquircleSurface>
            </View>
          </View>
        ) : null}

        {/* 5-4-3-2-1 Sensory Grounding In-Sheet Overlay */}
        {groundingModal === 'sensory' ? (
          <View style={styles.sheetOverlayFill} pointerEvents="box-none">
            <Pressable
              style={styles.sheetOverlayBackdrop}
              onPress={() => setGroundingModal(null)}
              accessibilityRole="button"
              accessibilityLabel="Close sensory grounding"
            />
            <View style={styles.sheetOverlayContentWrapper} pointerEvents="box-none">
              <SquircleSurface
                radius={28}
                fill={colors.background}
                style={[
                  styles.modalBox,
                  { borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    5-4-3-2-1 Sensory Grounding
                  </Text>
                  <PressableScale
                    onPress={() => setGroundingModal(null)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={22} color={colors.text.secondary} />
                  </PressableScale>
                </View>
                <Text
                  style={[typography.caption, { color: colors.text.secondary, marginBottom: 16 }]}
                >
                  Anchor your mind into this physical room, step by step.
                </Text>

                <View
                  style={[
                    styles.sensoryCard,
                    { backgroundColor: colors.surface, borderColor: colors.surface2 },
                  ]}
                >
                  <Text style={[typography.heading, { color: colors.primary, marginBottom: 4 }]}>
                    {GROUNDING_EXERCISES.sensory_54321.steps[sensoryStep].count}
                  </Text>
                  <Text
                    style={[typography.subbodyBold, { color: colors.text.primary, lineHeight: 22 }]}
                  >
                    {GROUNDING_EXERCISES.sensory_54321.steps[sensoryStep].prompt}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 18,
                  }}
                >
                  <PressableScale
                    onPress={() => setSensoryStep((s) => Math.max(0, s - 1))}
                    disabled={sensoryStep === 0}
                    style={[styles.stepBtn, { opacity: sensoryStep === 0 ? 0.3 : 1 }]}
                    accessibilityRole="button"
                    accessibilityLabel="Previous step"
                  >
                    <Text style={[typography.captionBold, { color: colors.text.secondary }]}>
                      Previous
                    </Text>
                  </PressableScale>

                  <Text style={[typography.caption, { color: colors.text.muted }]}>
                    Step {sensoryStep + 1} of 5
                  </Text>

                  {sensoryStep < 4 ? (
                    <PressableScale
                      onPress={() => setSensoryStep((s) => Math.min(4, s + 1))}
                      style={[styles.stepBtnPrimary, { backgroundColor: colors.primary }]}
                      accessibilityRole="button"
                      accessibilityLabel="Next step"
                    >
                      <Text style={[typography.captionBold, { color: colors.onPrimary }]}>Next</Text>
                    </PressableScale>
                  ) : (
                    <PressableScale
                      onPress={() => setGroundingModal(null)}
                      style={[styles.stepBtnPrimary, { backgroundColor: colors.primary }]}
                      accessibilityRole="button"
                      accessibilityLabel="Complete grounding"
                    >
                      <Text style={[typography.captionBold, { color: colors.onPrimary }]}>
                        Complete
                      </Text>
                    </PressableScale>
                  )}
                </View>
              </SquircleSurface>
            </View>
          </View>
        ) : null}
      </GestureHandlerRootView>
    </Modal>
  );
}

/** Records shown in the chat as a small table (first rows; the Open link shows the rest). */
const TABLE_ROWS = 12;
function TurnTable({ table }: { table: ChatTable }) {
  const { colors, typography } = useTheme();
  if (!table.rows.length) return null;
  const rows = table.rows.slice(0, TABLE_ROWS);
  return (
    <View style={styles.tableWrap}>
      <View style={[styles.tableRow, { borderBottomColor: colors.surface3 }]}>
        {table.columns.map((c) => (
          <Text
            key={c}
            style={[typography.captionBold, styles.tableCell, { color: colors.text.secondary }]}
          >
            {c}
          </Text>
        ))}
      </View>
      {rows.map((r, i) => (
        <View key={i} style={[styles.tableRow, { borderBottomColor: colors.surface3 }]}>
          {r.map((cell, j) => (
            <Text
              key={j}
              style={[typography.caption, styles.tableCell, { color: colors.text.primary }]}
              numberOfLines={3}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
      {table.rows.length > TABLE_ROWS ? (
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6 }]}>
          and {table.rows.length - TABLE_ROWS} more
        </Text>
      ) : null}
    </View>
  );
}

/** One message bubble. Memoized: a streamed reply re-renders only its own row. */
const TurnRow = React.memo(function TurnRow({
  turn,
  onOpen,
  onRate,
  onShare,
  onListen,
  onTranslate,
  onReply,
  onCopy,
  speaking,
}: {
  turn: Turn;
  onOpen: (route: string) => void;
  onRate: (id: string, fb: 'up' | 'down') => void;
  onShare: (text: string) => void;
  onListen: (t: Turn) => void;
  onTranslate: (t: Turn) => void;
  onReply: (t: Turn) => void;
  onCopy: (t: Turn) => void;
  speaking: boolean;
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
        turn.table?.rows.length ? styles.wide : null,
      ]}
    >
      {turn.quote ? (
        <View
          style={[styles.quote, { borderLeftColor: mine ? colors.text.inverse : colors.primary }]}
        >
          <Text
            style={[
              typography.caption,
              { color: mine ? colors.text.inverse : colors.text.secondary },
            ]}
            numberOfLines={2}
          >
            {turn.quote}
          </Text>
        </View>
      ) : null}
      <Text style={[typography.body, { color: mine ? colors.text.inverse : colors.text.primary }]}>
        {mine ? turn.text : plainText(turn.text)}
      </Text>
      {turn.translation ? (
        <View
          style={[
            styles.translated,
            { borderTopColor: mine ? colors.text.inverse : colors.surface3 },
          ]}
        >
          <Text
            style={[typography.caption, { color: mine ? colors.text.inverse : colors.text.muted }]}
          >
            {languageOf(turn.translation.lang).native}, translated on this phone
          </Text>
          <Text
            style={[typography.body, { color: mine ? colors.text.inverse : colors.text.primary }]}
          >
            {turn.translation.text}
          </Text>
        </View>
      ) : null}
      {turn.attachment?.kind === 'image' ? (
        <Image
          source={{ uri: turn.attachment.uri }}
          style={styles.bubbleImage}
          contentFit="cover"
          accessibilityLabel={turn.attachment.name}
        />
      ) : turn.attachment ? (
        <View style={styles.fileChip}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={mine ? colors.text.inverse : colors.text.secondary}
          />
          <Text
            style={[
              typography.caption,
              { color: mine ? colors.text.inverse : colors.text.secondary, flexShrink: 1 },
            ]}
            numberOfLines={1}
          >
            {turn.attachment.name}
          </Text>
        </View>
      ) : null}
      {turn.table ? <TurnTable table={turn.table} /> : null}
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
      {!mine && turn.text && !turn.transient ? (
        <View style={styles.actions}>
          <PressableScale
            onPress={() => onRate(turn.id, 'up')}
            hitSlop={8}
            accessibilityLabel="Helpful"
            accessibilityState={{ selected: turn.feedback === 'up' }}
          >
            <Ionicons
              name={turn.feedback === 'up' ? 'thumbs-up' : 'thumbs-up-outline'}
              size={16}
              color={turn.feedback === 'up' ? colors.primary : colors.text.muted}
            />
          </PressableScale>
          <PressableScale
            onPress={() => onRate(turn.id, 'down')}
            hitSlop={8}
            accessibilityLabel="Not helpful"
            accessibilityState={{ selected: turn.feedback === 'down' }}
          >
            <Ionicons
              name={turn.feedback === 'down' ? 'thumbs-down' : 'thumbs-down-outline'}
              size={16}
              color={turn.feedback === 'down' ? colors.primary : colors.text.muted}
            />
          </PressableScale>
          <PressableScale
            onPress={() => onListen(turn)}
            hitSlop={8}
            accessibilityLabel={speaking ? 'Stop reading' : 'Read this reply aloud'}
          >
            <Ionicons
              name={speaking ? 'stop-circle' : 'volume-high-outline'}
              size={16}
              color={speaking ? colors.primary : colors.text.muted}
            />
          </PressableScale>
          <PressableScale
            onPress={() => onTranslate(turn)}
            hitSlop={8}
            accessibilityLabel="Translate this reply"
          >
            <Ionicons
              name="language-outline"
              size={16}
              color={turn.translation ? colors.primary : colors.text.muted}
            />
          </PressableScale>
          <PressableScale
            onPress={() => onReply(turn)}
            hitSlop={8}
            accessibilityLabel="Reply to this"
          >
            <Ionicons name="arrow-undo-outline" size={16} color={colors.text.muted} />
          </PressableScale>
          <PressableScale
            onPress={() => onCopy(turn)}
            hitSlop={8}
            accessibilityLabel="Copy this reply"
          >
            <Ionicons name="copy-outline" size={16} color={colors.text.muted} />
          </PressableScale>
          <PressableScale
            onPress={() => onShare(turn.text)}
            hitSlop={8}
            accessibilityLabel="Share this reply"
          >
            <Ionicons name="share-outline" size={16} color={colors.text.muted} />
          </PressableScale>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  personaRow: { flexGrow: 0, marginBottom: 4 },
  sanctuary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
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
  wide: { maxWidth: '100%', width: '100%' },
  theirs: { alignSelf: 'flex-start', borderBottomLeftRadius: 6 },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  tableWrap: { marginTop: 10 },
  actions: { flexDirection: 'row', gap: 18, marginTop: 10, flexWrap: 'wrap' },
  translated: { marginTop: 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, gap: 2 },
  quote: { borderLeftWidth: 3, paddingLeft: 8, marginBottom: 6 },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderLeftWidth: 3,
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 16,
    marginBottom: 8,
  },
  pendingThumb: { width: 48, height: 48, borderRadius: 10 },
  pendingIcon: { alignItems: 'center', justifyContent: 'center' },
  fileChip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  bubbleImage: { width: 180, height: 180, borderRadius: 12, marginTop: 8 },
  // Mirrors the Send/Mic button on the right: same 48 dp box, bottom-aligned with one line of text.
  attach: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  camBtn: { width: 36, height: 48, alignItems: 'center', justifyContent: 'center', marginLeft: -6 },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
  },
  tableCell: { flex: 1, paddingRight: 8 },
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
    paddingLeft: 4,
    paddingRight: 4,
  },
  // Grows with the text up to about four lines.
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 112,
    paddingVertical: 12,
    paddingHorizontal: 2,
    textAlignVertical: 'center',
  },
  actionWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 48, height: 48, borderRadius: 24 },
  action: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Safety & Emergency styles
  sanctuaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  safetyContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  safetyCardBox: {
    padding: 14,
  },
  safetyCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  safetyIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  safetyActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  calmSupportBar: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  calmSupportChipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calmSupportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  countryFlagLarge: { fontSize: 24 },
  emergencyCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sheetOverlayFill: {
    ...StyleSheet.absoluteFill,
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetOverlayBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  sheetOverlayContentWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modalBox: {
    borderRadius: 28,
    padding: 20,
    maxHeight: '85%',
    width: '100%',
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
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  helplineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    gap: 10,
  },
  breathingCircleContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  breathingCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensoryCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 8,
  },
  stepBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  stepBtnPrimary: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
});
