import { Redirect, Stack } from 'expo-router';

import { canUseCorrespondence } from '../../../navigation/eligibility';
import { useRootStore } from '../../../stores/useRootStore';

export default function LettersLayout() {
  // Route-level gate: a direct link cannot open correspondence for someone not eligible.
  const allowed = useRootStore(canUseCorrespondence);
  if (!allowed) return <Redirect href="/(app)/(tabs)" />;
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
