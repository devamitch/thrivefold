import { Redirect, Stack } from 'expo-router';

import { canUseCorrespondence } from '../../../navigation/eligibility';
import { useRootStore } from '../../../stores/useRootStore';

export default function SocialLayout() {
  const allowed = useRootStore(canUseCorrespondence);
  if (!allowed) return <Redirect href="/(app)/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
