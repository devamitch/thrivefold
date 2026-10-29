import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useBetaAccess } from '../../../hooks/useBetaEnabled';

export default function BetaLabLayout() {
  // Beta Lab exists in development builds and for server-confirmed owners only.
  const allowed = useBetaAccess();
  if (!allowed) return <Redirect href="/(app)/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="eye-tracking" />
      <Stack.Screen name="hand-gestures" />
      <Stack.Screen name="gesture-game" options={{ animation: 'fade' }} />
      <Stack.Screen name="breathing" />
      <Stack.Screen name="face-exercises" options={{ animation: 'fade' }} />
      <Stack.Screen name="assistant" />
      <Stack.Screen name="body-style" />
      <Stack.Screen name="voice-practice" />
      <Stack.Screen name="focus-check" />
      <Stack.Screen name="eye-games" options={{ animation: 'fade' }} />
      <Stack.Screen name="eye-pursuit" options={{ animation: 'fade' }} />
      <Stack.Screen name="pose-coach" />
      <Stack.Screen name="voice-coach" />
      <Stack.Screen name="motion-blur" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
