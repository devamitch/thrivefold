import { Stack } from 'expo-router';

import { canUseDating } from '../../../navigation/eligibility';
import { SocialGate } from '../../../components/social/SocialGate';
import { useRootStore } from '../../../stores/useRootStore';

export default function DatingLayout() {
  // Route-level gate: a direct link cannot open dating for someone not eligible.
  const allowed = useRootStore(canUseDating);
  if (!allowed) return <SocialGate feature="dating" />;
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
