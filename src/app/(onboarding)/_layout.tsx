import { Stack } from 'expo-router';

/**
 * Onboarding is four short steps (see ONBOARDING_STEPS) plus an optional preferences
 * screen. Device permissions (health data, notifications, location) are requested
 * by the feature that needs them, not up front (master spec §3.3 step 9).
 */
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="choose-experience" />
      <Stack.Screen name="privacy-choices" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="activity-constraints" />
      <Stack.Screen name="complete" options={{ gestureEnabled: false }} />
      <Stack.Screen name="lifestyle-preferences" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
