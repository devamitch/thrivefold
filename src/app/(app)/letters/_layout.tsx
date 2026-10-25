import { Stack } from 'expo-router';

import { canUseCorrespondence } from '../../../navigation/eligibility';
import { SocialGate } from '../../../components/social/SocialGate';
import { useRootStore } from '../../../stores/useRootStore';

export default function LettersLayout() {
  // Route-level gate: a direct link cannot open correspondence for someone not eligible.
  const allowed = useRootStore(canUseCorrespondence);
  if (!allowed) return <SocialGate feature="letters" />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="compose" />
      <Stack.Screen name="stamps" />
    </Stack>
  );
}
