import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useCoach } from '../../../components/assistant/CoachProvider';

/**
 * Old address of the separate "Thrive Coach" screen. There is one coach now: links here open the
 * Anvay sheet (ready to type, microphone off) over the screen the person came from.
 */
export default function AssistantRedirect() {
  const router = useRouter();
  const coach = useCoach();

  useEffect(() => {
    // The sheet lives above every screen, so it stays open while this placeholder leaves.
    coach.open({ listen: false });
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)');
  }, [router, coach]);

  return null;
}
