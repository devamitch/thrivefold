import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { BetaBadge } from '../../../components/ui/Badge';
import { Chip } from '../../../components/ui/Chip';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { TextField } from '../../../components/ui/TextField';
import { parseCommand } from '../../../domain/assistant/commands';
import { coachVoice } from '../../../services/ai/coachVoice';
import { runCommand } from '../../../services/assistant/runCommand';
import { useVoiceInput } from '../../../services/voice/useVoiceInput';
import { useTheme } from '../../../theme/useTheme';
import { BetaHero } from '../../../components/beta/BetaHero';
import { getSanctuaryIllustration } from '../../../utils/illustrationResolver';

interface Turn {
  from: 'me' | 'coach';
  text: string;
  route?: string;
  autoNavigate?: boolean;
  needsModel?: boolean;
  fromModel?: boolean;
}

const SUGGESTIONS = [
  'How many steps today?',
  'Log two glasses of water',
  'Will it rain today?',
  'Start breathing',
  'Stress at work',
  'Relationship stress',
  'Scan a prescription',
  'Plan an outing',
];

/**
 * Thrive Coach assistant: type a request and the coach carries it out on this phone and says the
 * answer. Commands and today's numbers work offline with no model; open questions go to the
 * on-device language model when one is loaded.
 */
export default function AssistantScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const sendRef = useRef<(t: string) => Promise<void>>(async () => undefined);
  const voice = useVoiceInput((text) => void sendRef.current(text));
  const listening = voice.state === 'listening';

  useEffect(() => () => coachVoice.stop(), []);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    setDraft('');
    setTurns((t) => [...t, { from: 'me', text }]);
    setBusy(true);
    const reply = await runCommand(parseCommand(text));
    setBusy(false);
    setTurns((t) => [...t, { from: 'coach', ...reply }]);
    void coachVoice.speak(reply.text, { priority: 3, maxMs: 12_000 });
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    if (reply.route && reply.autoNavigate) {
      setTimeout(() => router.push(reply.route as Href), 900);
    }
  };

  sendRef.current = send;

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow="BETA LAB · ON-DEVICE COACH"
        title="Thrive Coach"
        subtitle="Ask, log and open anything; answers are spoken"
        showBack
        onBack={() => router.back()}
        rightAction={<BetaBadge />}
      />
      <ScrollView
        ref={scroll}
        contentContainerStyle={{
          paddingHorizontal: spacing.base,
          paddingBottom: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {turns.length === 0 ? (
          <BetaHero source={getSanctuaryIllustration('coachAssistant', experience)} label="Thrive Coach" />
        ) : null}
        {turns.length === 0 ? (
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: spacing.sm }]}>
            Try one of these. Commands and today&apos;s numbers work offline; nothing you type leaves the phone.
          </Text>
        ) : null}
        {turns.map((t, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              t.from === 'me'
                ? [styles.mine, { backgroundColor: colors.primary }]
                : [styles.theirs, { backgroundColor: colors.surface }],
            ]}
          >
            <Text
              style={[
                typography.body,
                {
                  color: t.from === 'me' ? colors.text.inverse : colors.text.primary,
                },
              ]}
            >
              {t.text}
            </Text>
            {t.fromModel ? (
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
                On-device language model · wellbeing guidance, not medical advice
              </Text>
            ) : t.from === 'coach' ? (
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
                On-device coach · wellbeing guidance, not medical advice
              </Text>
            ) : null}
            {t.route && !t.autoNavigate ? (
              <View style={styles.actions}>
                <Chip
                  label="Open related tool"
                  onPress={() => router.push(t.route as Href)}
                />
              </View>
            ) : null}
            {t.needsModel ? (
              <View style={styles.actions}>
                <Chip label="Set up on-device model" onPress={() => router.push('/(app)/ai/model-status' as Href)} />
                <Chip label="Ask Thrive (cloud)" onPress={() => router.push('/(app)/ai/chat' as Href)} />
              </View>
            ) : null}
          </View>
        ))}
        {busy ? <ActivityIndicator style={{ marginTop: 8, alignSelf: 'flex-start' }} color={colors.primary} /> : null}
        <View style={[styles.actions, { marginTop: spacing.md }]}>
          {SUGGESTIONS.map((s) => (
            <Chip key={s} label={s} onPress={() => void send(s)} />
          ))}
        </View>
      </ScrollView>
      <View style={[styles.inputRow, { paddingHorizontal: spacing.base, paddingBottom: spacing.md }]}>
        <PressableScale
          onPress={() => (listening ? voice.stop() : void voice.start({ preferOffline: true }))}
          accessibilityLabel={listening ? 'Stop listening' : 'Speak to the coach'}
          style={[styles.send, { backgroundColor: listening ? colors.primary : colors.surface2 }]}
        >
          <Ionicons
            name={listening ? 'stop' : 'mic'}
            size={20}
            color={listening ? colors.text.inverse : colors.text.primary}
          />
        </PressableScale>
        <TextField
          value={listening && voice.partial ? voice.partial : draft}
          onChangeText={setDraft}
          placeholder="Ask or tell the coach…"
          returnKeyType="send"
          onSubmitEditing={() => void send(draft)}
          containerStyle={styles.flex}
          accessibilityLabel="Message the coach"
        />
        <PressableScale
          onPress={() => void send(draft)}
          accessibilityLabel="Send"
          style={[
            styles.send,
            {
              backgroundColor: draft.trim() ? colors.primary : colors.surface2,
            },
          ]}
        >
          <Ionicons name="arrow-up" size={20} color={draft.trim() ? colors.text.inverse : colors.text.muted} />
        </PressableScale>
      </View>
      <Text style={[typography.caption, styles.note, { color: colors.text.muted, paddingHorizontal: spacing.base }]}>
        {listening
          ? 'Listening… speak now. Nothing is recorded.'
          : (voice.error ?? 'Tap the microphone to speak, or type. Audio is never saved.')}
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
    maxWidth: '88%',
  },
  mine: { alignSelf: 'flex-end' },
  theirs: { alignSelf: 'flex-start' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: { marginBottom: 8 },
});
