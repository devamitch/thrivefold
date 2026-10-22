import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="health" />
      <Stack.Screen name="quests" />
      <Stack.Screen name="games" />
      <Stack.Screen name="journal" />
      <Stack.Screen name="learn" />
      <Stack.Screen name="dev" />
      <Stack.Screen name="ai" />
      <Stack.Screen name="circles" />
      <Stack.Screen name="letters" />
      <Stack.Screen name="social" />
      <Stack.Screen name="organizations" />
      <Stack.Screen name="safety" />
      <Stack.Screen name="check-in" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
