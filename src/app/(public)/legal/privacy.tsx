import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';

export const PRIVACY_SECTIONS = [
  {
    title: '1. Local-First Storage',
    body:
      'Daily check-ins, cycle entries, journals, workouts, and other health logs are stored on your device by default. Thrivefold uses MMKV encryption when it can create and store a local key with Android secure storage. If secure key storage is unavailable, the current app falls back to unencrypted MMKV; development environments may use memory storage. Do not treat local storage as an online backup.',
  },
  {
    title: '2. Guest Mode & Zero Mandatory Account',
    body:
      'You can use core check-ins, routines, and personal logs without an account. Some features require a network connection, a downloaded on-device model, or a device permission.',
  },
  {
    title: '3. Optional Cloud Account & Sync',
    body:
      'If you sign in with Google or an email code, Thrivefold can sync account profile and progress details with its Supabase server. Profile details may include a name, birthday, chosen experience, goals, diet, allergies, contact details, height, weight, and other information you chose to save. Progress sync includes points, levels, achievements, and reward history. Daily check-ins, cycle logs, journals, and camera frames are not part of these sync operations. Weekly summaries are sent only when you enable that separate option.',
  },
  {
    title: '4. On-Device Local AI & Privacy Boundary',
    body:
      'When a compatible model is installed, the assistant can answer on-device and retrieve local app knowledge. Local chat turns and memories are stored on this device. The assistant may use other local or online paths depending on your settings and the available evidence; see the cloud AI control below.',
  },
  {
    title: '5. Optional Cloud AI Escalation & Safety Isolation',
    body:
      'Cloud AI is off until you enable it. When enabled and signed in, recent conversation messages may be sent through Thrivefold’s server to its configured AI provider. Do not include information you do not want processed by that service. The assistant applies local safety and routing rules, but AI responses can be incomplete or wrong and are not medical advice.',
  },
  {
    title: '6. Continuous RAG Knowledge & Memory Scope',
    body:
      'Thrivefold utilizes an on-device Retrieval-Augmented Generation (RAG) system combining SQLite FTS5 lexical indexing with dense vector embeddings. Answers verified on-device are indexed locally with strict owner and application scoping, ensuring your personal memories are never accessible to other apps or outside callers.',
  },
  {
    title: '7. Camera, Sensors & MediaPipe Processing',
    body:
      'When using workout posture analysis or vision exercises, video frames are processed on-device in real-time using Google MediaPipe. Camera streams are held in volatile memory only for the duration of the rep count and are discarded immediately. Raw images or video recordings are never saved to disk or transmitted over the network.',
  },
  {
    title: '8. Health Connect & Bluetooth Sensors',
    body:
      'Health Connect and Bluetooth heart-rate strap integrations are off by default. Thrivefold requests access only to the explicit biometric categories you authorize. You can inspect the full access history or revoke permissions at any time in Connected Apps.',
  },
  {
    title: '9. Zero Advertising, Zero Data Brokering',
    body:
      'Thrivefold has no advertising in this release. Anonymous usage analytics and crash reporting are separate settings and are off until you enable them. When enabled, analytics may include screen or feature use; crash reports may include generic error details, stack frames, device model, app version, and recent screen names. These diagnostics are designed to exclude health records, journal text, messages, and transcripts.',
  },
  {
    title: '10. Data Portability, FHIR Export & 1-Tap Erasure',
    body:
      'You can export app data from Privacy and data and restore a saved backup on Android. You can erase local app data from the account controls. Server account data is handled separately through account deletion. Export coverage and available formats can vary by record type; review the export before relying on it as your only copy.',
  },
  {
    title: '11. Non-Medical Wellbeing Disclaimer',
    body:
      'Thrivefold is a personal wellbeing and mindfulness companion, not a licensed medical device or healthcare provider. It does not provide medical diagnoses, treatment plans, or pharmaceutical dosages. For emergency situations or self-harm thoughts, please contact emergency services (112 / 911) or free mental health lifelines (Tele-MANAS 14416 / 988).',
  },
];

export default function PrivacyPolicyScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenWrapper scrollable>
      <Header title="Privacy Policy" showBack />
      <View style={[styles.content, { padding: spacing.base }]}>
        <Text style={[typography.caption, { color: colors.text.muted, marginBottom: spacing.md }]}>
          Effective Date: November 1, 2026 · Version 2.4 (AnvayKosh Ecosystem)
        </Text>
        {PRIVACY_SECTIONS.map((section) => (
          <Card key={section.title} style={{ marginBottom: spacing.md }}>
            <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
              {section.title}
            </Text>
            <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
              {section.body}
            </Text>
          </Card>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
