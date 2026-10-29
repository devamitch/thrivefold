import { Redirect, type Href } from 'expo-router';

import { ONBOARDING_STEPS, type OnboardingStep } from '../components/onboarding/OnboardingScaffold';
import { restorableRoute } from '../navigation/restore';
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
  const lastActiveAt = useRootStore((s) => s.lastActiveAt);
  const experienceConfirmed = useRootStore((s) => s.experienceConfirmed);

  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;
  if (!isOnboarded) {
    const resume: OnboardingStep = ONBOARDING_STEPS.includes(step as OnboardingStep)
      ? (step as OnboardingStep)
      : // A space already chosen at sign-in is not asked again.
        experienceConfirmed
        ? 'privacy-choices'
        : 'choose-experience';
    return <Redirect href={`/(onboarding)/${resume}`} />;
  }

  // A recent screen is reopened by the app layout on top of Home, so Back still works.
  const resume = restorableRoute(lastActiveRoute, lastActiveAt);
  if (resume && ['/today', '/progress', '/settings'].includes(resume)) {
    return <Redirect href={`/(app)/(tabs)${resume}` as Href} />;
  }

  return <Redirect href="/(app)/(tabs)" />;
}
