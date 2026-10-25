import { Redirect } from 'expo-router';

import { ONBOARDING_STEPS, type OnboardingStep } from '../components/onboarding/OnboardingScaffold';
import { useRootStore } from '../stores/useRootStore';

/**
 * Single routing decision for app start and after sign-in/sign-out:
 * signed out -> sign-in; not onboarded -> the onboarding step they reached last;
 * otherwise -> home. The store hydrates synchronously from MMKV, so no spinner.
 */
export default function BootstrapResolver() {
  const isAuthenticated = useRootStore((s) => s.isAuthenticated);
  const isOnboarded = useRootStore((s) => s.isOnboarded);
  const step = useRootStore((s) => s.onboardingStep);
  const lastActiveRoute = useRootStore((s) => s.lastActiveRoute);

  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;
  if (!isOnboarded) {
    const resume: OnboardingStep = ONBOARDING_STEPS.includes(step as OnboardingStep)
      ? (step as OnboardingStep)
      : 'choose-experience';
    return <Redirect href={`/(onboarding)/${resume}`} />;
  }

  // Restore previous screen if user closed app forcefully while on an active screen
  if (
    lastActiveRoute &&
    typeof lastActiveRoute === 'string' &&
    lastActiveRoute.startsWith('/(app)') &&
    !lastActiveRoute.includes('complete')
  ) {
    return <Redirect href={lastActiveRoute as any} />;
  }

  return <Redirect href="/(app)/(tabs)" />;
}
