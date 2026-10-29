import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { SettingsRow } from '../../../components/ui/SettingsRow';
import { useTheme } from '../../../theme/useTheme';

/** Accessibility and everyday helpers, all running on the phone. */
export default function AssistScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const go = (r: string) => () => router.push(r as Href);
  return (
    <ScreenContainer>
      <AppHeader eyebrow="ACCESSIBILITY" title="Assist" subtitle="See, hear and do more with your phone" showBack />
      <ScreenScrollView contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl * 2 }}>
        <SettingsRow icon="chatbubble-ellipses-outline" title="Talk to Thrive Coach" subtitle="Ask, log and open anything by voice" onPress={go('/(app)/beta-lab/assistant')} />
        <SettingsRow icon="eye-outline" title="What's around me" subtitle="Take a photo and hear the objects in it" onPress={go('/(app)/assist/look-around')} />
        <SettingsRow icon="ear-outline" title="Sound alerts" subtitle="Alarms, doorbell, a crying baby: big text and vibration" onPress={go('/(app)/assist/sound-alerts')} />
        <SettingsRow icon="cut-outline" title="Photo cutout" subtitle="Tap an object to lift it off the background" onPress={go('/(app)/assist/photo-cutout')} />
        <SettingsRow icon="document-text-outline" title="Read a prescription or chart" subtitle="Turn a photo into medicines and reminders" onPress={go('/(app)/health/documents')} />
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 12 }]}>
          Camera and microphone are used only while a helper is open, and nothing is recorded. These helpers can make mistakes; don&apos;t rely on
          them for safety.
        </Text>
      </ScreenScrollView>
    </ScreenContainer>
  );
}
