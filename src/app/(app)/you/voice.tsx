import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnvayCompanion } from '../../../components/brand/AnvayCompanion';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SettingsGroup, SettingsRow } from '../../../components/ui/SettingsRow';
import { Toggle } from '../../../components/ui/Toggle';
import { queueCoachSpeech } from '../../../services/ai/coachVoiceService';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const RATES = [
  { label: 'Slower', value: 0.85 },
  { label: 'Normal', value: 0.95 },
  { label: 'Faster', value: 1.08 },
];

/** How Anvay sounds and listens: voice on or text only, which voice, speed, and conversation mode. */
export default function VoiceSettingsScreen() {
  const { colors, typography, spacing } = useTheme();
  const s = useRootStore(
    useShallow((st) => ({
      on: st.speakReplies,
      setOn: st.setSpeakReplies,
      gender: st.coachVoiceGender,
      setGender: st.setCoachVoiceGender,
      rate: st.coachVoiceRate,
      setRate: st.setCoachVoiceRate,
      convo: st.conversationMode,
      setConvo: st.setConversationMode,
    })),
  );

  const preview = () =>
    void queueCoachSpeech("Hello, I'm Anvay. I'll keep my answers short and clear.");

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader eyebrow="ANVAY" title="Voice and conversation" subtitle="How Anvay sounds and listens" showBack />
      }
    >
      <View style={styles.hero}>
        <AnvayCompanion size={120} mood="speaking" />
      </View>

      <SettingsGroup title="Voice">
        <SettingsRow
          icon="volume-high-outline"
          title="Speak replies"
          subtitle={s.on ? 'Anvay talks and shows text' : 'Text only: Anvay stays silent'}
          right={<Toggle value={s.on} onValueChange={s.setOn} accessibilityLabel="Speak replies" />}
        />
        <SettingsRow
          icon="chatbubbles-outline"
          title="Conversation mode"
          subtitle={
            s.convo ? 'Keeps listening after each reply until you close it' : 'Listens once each time you tap the mic'
          }
          right={<Toggle value={s.convo} onValueChange={s.setConvo} accessibilityLabel="Conversation mode" />}
        />
      </SettingsGroup>

      <Text style={[typography.captionBold, styles.label, { color: colors.text.muted, marginTop: spacing.lg }]}>
        WHICH VOICE
      </Text>
      <View style={styles.chips}>
        <Chip label="Indian male" selected={s.gender === 'male'} onPress={() => s.setGender('male')} />
        <Chip label="Indian female" selected={s.gender === 'female'} onPress={() => s.setGender('female')} />
      </View>

      <Text style={[typography.captionBold, styles.label, { color: colors.text.muted, marginTop: spacing.lg }]}>
        SPEED
      </Text>
      <View style={styles.chips}>
        {RATES.map((r) => (
          <Chip
            key={r.label}
            label={r.label}
            selected={Math.abs(s.rate - r.value) < 0.04}
            onPress={() => s.setRate(r.value)}
          />
        ))}
      </View>

      <Button
        label="Hear a preview"
        variant="outline"
        onPress={preview}
        disabled={!s.on}
        style={{ marginTop: spacing.lg }}
      />
      <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.md }]}>
        Voices come from your phone&apos;s speech engine. If a voice is missing, install Indian English voices in
        Android settings → Text-to-speech. Say &quot;stop&quot; or &quot;bye&quot; to end a conversation.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 4 },
  label: { letterSpacing: 0.6, marginBottom: 8, marginLeft: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
