import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';

const SECTIONS = [
  {
    title: 'Stored on your phone, encrypted',
    body:
      'Check-ins, cycle dates, symptoms, journal entries, workouts, readings from connected apps and AI memory are stored on this device. The store is encrypted at rest with a key generated on the phone and kept in the Android Keystore; it is never sent to us. Keep a screen lock on, because anyone who can unlock the phone can open the app.',
  },
  {
    title: 'What an account sends',
    body:
      'Without an account nothing leaves the phone. With an account (Google or email), the server keeps your sign-in identity and your rewards ledger (XP, diamonds and unlocks) so progress survives a new phone. Health records are not uploaded. Age and gender read from Google are shown to you to confirm and are kept on the phone; a Google birthday is not treated as age verification.',
  },
  {
    title: 'Connected apps',
    body:
      'Health Connect and Bluetooth heart-rate straps are off until you turn them on and choose each data type. Thrivefold reads only what you allow, writes workouts only if you allow it, and records every consent, sync and export in an access history you can read under Connected apps. Revoking access stops reading straight away; you can also delete what was imported.',
  },
  {
    title: 'Export and delete',
    body:
      'You can export everything as JSON or as an HL7 FHIR R4 bundle to share with a clinician or another app, and erase every record on the phone from You. Erasing also replaces the encryption key.',
  },
  {
    title: 'No profiling, no ads, no selling',
    body:
      'Thrivefold never infers religion, caste, sexual orientation, political views or medical diagnoses from your data, shows no ads, and does not sell or share personal data. Rewards never depend on what you disclose about your health.',
  },
  {
    title: 'Not a medical service',
    body:
      'Thrivefold is a wellbeing app, not a medical device or a healthcare provider, and it does not diagnose. Exports are marked as patient-generated so a clinician knows they were not clinically measured.',
  },
];

export default function PrivacyPolicyScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenWrapper scrollable>
      <Header title="Privacy policy" showBack />
      <SquircleSurface style={[styles.content, { padding: spacing.base }]}>
        {SECTIONS.map((section) => (
          <Card key={section.title} style={{ marginBottom: spacing.md }}>
            <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: spacing.xs }]}>
              {section.title}
            </Text>
            <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>{section.body}</Text>
          </Card>
        ))}
      </SquircleSurface>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
