import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Header } from '../../../components/ui/Header';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { TextField } from '../../../components/ui/TextField';
import { aiErrorText, askThrive, type ChatTurn } from '../../../services/ai/cloudChat';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const STARTERS = [
  'Help me plan a calmer evening',
  'Ideas for a 10-minute workout at home',
  'How can I sleep a little better?',
  'I feel stressed about work',
];

/**
 * Ask Thrive: the optional cloud AI companion. Nothing is sent until the person agrees, and
 * only what they type here is sent (never their health records). Conversations stay on this
 * screen; the server keeps only a daily request count.
 */
export default function ThriveChatScreen() {
  const { colors, typography, spacing } = useTheme();
  const { consent, setConsent } = useRootStore(
    useShallow((s) => ({ consent: s.cloudAiConsent, setConsent: s.setCloudAiConsent })),
  );
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next: ChatTurn[] = [...turns, { role: 'user', content }];
    setTurns(next);
    setDraft('');
    setError(null);
    setBusy(true);
    try {
      const r = await askThrive(next);
      setTurns((t) => [...t, { role: 'assistant', content: r.reply }]);
      setRemaining(r.remaining);
    } catch (e) {
      setError(aiErrorText(e));
    } finally {
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  if (!consent) {
    return (
      <ScreenWrapper scrollable footer={<Button label="I agree, start" onPress={() => setConsent(true)} />}>
        <Header title="Ask Thrive" subtitle="Optional AI companion" showBack />
        <Card style={{ padding: spacing.lg }}>
          <Ionicons name="chatbubbles-outline" size={26} color={colors.primary} />
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.sm }]}>
            Before you start
          </Text>
          {[
            'What you type here is sent through Thrivefold’s server to an AI provider (Google Gemini, Groq or OpenRouter) to write a reply.',
            'Your check-ins, cycle data, journal and other records are not sent. Only this conversation.',
            'Thrivefold’s server stores no messages, only how many you sent today (a daily limit keeps it free).',
            'Thrive is not a doctor or therapist and can be wrong. In an emergency, contact local emergency services.',
            'You can turn this off any time in You > Privacy.',
          ].map((t) => (
            <View key={t} style={[styles.row, { marginTop: spacing.sm }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
              <Text style={[typography.subbody, styles.flex, { color: colors.text.secondary, marginLeft: 8 }]}>{t}</Text>
            </View>
          ))}
        </Card>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      footer={
        <View style={styles.composer}>
          <TextField
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask about habits, sleep, movement, stress…"
            maxLength={2000}
            multiline
            containerStyle={styles.flex}
            accessibilityLabel="Message to Thrive"
          />
          <PressableScale
            onPress={() => send(draft)}
            disabled={!draft.trim() || busy}
            accessibilityRole="button"
            accessibilityLabel="Send"
            style={[styles.send, { backgroundColor: draft.trim() && !busy ? colors.primary : colors.surface2 }]}
          >
            <Ionicons name="arrow-up" size={22} color={colors.onPrimary} />
          </PressableScale>
        </View>
      }
    >
      <Header
        title="Ask Thrive"
        subtitle={remaining !== null ? `${remaining} questions left today` : 'AI companion, not medical advice'}
        showBack
      />
      <ScrollView ref={scroll} style={styles.flex} contentContainerStyle={{ gap: 10, paddingBottom: spacing.lg }}>
        {turns.length === 0 ? (
          <View style={{ gap: 8 }}>
            <Text style={[typography.body, { color: colors.text.secondary }]}>What would help today?</Text>
            <View style={styles.wrap}>
              {STARTERS.map((s) => (
                <Chip key={s} label={s} onPress={() => send(s)} />
              ))}
            </View>
          </View>
        ) : null}
        {turns.map((t, i) => (
          <View key={i} style={[styles.bubbleRow, { justifyContent: t.role === 'user' ? 'flex-end' : 'flex-start' }]}>
            <View style={[styles.bubble, { backgroundColor: t.role === 'user' ? colors.primary : colors.surface }]}>
              <Text style={[typography.body, { color: t.role === 'user' ? colors.onPrimary : colors.text.primary }]}>
                {t.content}
              </Text>
            </View>
          </View>
        ))}
        {busy ? <ActivityIndicator color={colors.primary} style={{ alignSelf: 'flex-start' }} /> : null}
        {error ? <Text style={[typography.caption, { color: colors.error }]}>{error}</Text> : null}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  bubble: { borderRadius: 18, maxWidth: '85%', paddingHorizontal: 14, paddingVertical: 10 },
  bubbleRow: { flexDirection: 'row' },
  composer: { alignItems: 'flex-end', flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  row: { alignItems: 'flex-start', flexDirection: 'row' },
  send: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', marginBottom: 4, width: 48 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
