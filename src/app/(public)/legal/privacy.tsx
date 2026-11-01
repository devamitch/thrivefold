import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';

export const PRIVACY_SECTIONS = [
  {
    title: '1. Local-First & Device-Bound Encryption',
    body:
      'Check-ins, daily reflections, biological rhythm logs, pose coordinates, workout metrics, and journal notes are stored directly on your physical device. The database is encrypted at rest using AES-256 with keys managed by the hardware-backed Android Keystore. Your private keys never leave your phone, and our servers cannot decrypt your local data.',
  },
  {
    title: '2. Guest Mode & Zero Mandatory Account',
    body:
      'You are never required to create an account or provide an email, phone number, or social identity to use Thrivefold. All core features—including our on-device wellness coach, routines, timers, games, and local AI—are 100% accessible to guest users out of the box and function completely offline.',
  },
  {
    title: '3. Optional Cloud Account & Sync',
    body:
      'If you voluntarily choose to sign in (via Google or Email Magic Code), only minimal account metadata (user ID, avatar seed, pseudonym, and earned XP/achievement ledger) is synchronized with our secure Supabase backend so you can restore progress across phones. Your personal health notes, cycle logs, and camera pose coordinates are never uploaded to the cloud.',
  },
  {
    title: '4. On-Device Local AI & Privacy Boundary',
    body:
      'Our primary intelligent assistant operates using on-device models (GGUF quantizations executed locally via our native Android AI runtime). Prompt processing, token generation, and RAG retrieval occur entirely within your device RAM and never transmit query text to any third-party server.',
  },
  {
    title: '5. Optional Cloud AI Escalation & Safety Isolation',
    body:
      'If you have explicitly opted into Cloud AI and are signed in, complex multi-step questions (such as precision macro calculations or complex travel itineraries) may be escalated to our server-side AI gateway. Sensitive domains—including mental health distress, medical symptoms, reproductive tracking, and crisis conversations—are strictly blocked from cloud escalation and are processed exclusively on-device.',
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
      'Thrivefold does not include third-party advertising SDKs, data brokers, or profiling networks. We do not monetize your attention, track your cross-app activity, or sell personal information to insurance companies, marketers, or data aggregators.',
  },
  {
    title: '10. Data Portability, FHIR Export & 1-Tap Erasure',
    body:
      'You maintain complete ownership of your wellness data. You can export your full history at any time as JSON or as an HL7 FHIR R4 clinical bundle. You can also trigger 1-tap local data erasure from the You tab, which immediately wipes the database and rotates the Keystore encryption key.',
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
