import { Stack } from 'expo-router';
import React from 'react';

export default function BetaLabLayout() {
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
      <Stack.Screen name="pose-coach" />
      <Stack.Screen name="food-lens" />
      <Stack.Screen name="voice-coach" />
      <Stack.Screen name="motion-blur" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
