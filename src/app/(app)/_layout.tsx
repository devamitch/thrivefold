import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';

import { useRootStore } from '../../stores/useRootStore';
import { flushProgressionSync } from '../../services/sync/progressionSync';

export default function AppLayout() {
  const ensureDailyQuests = useRootStore((s) => s.ensureDailyQuests);
  const isOnboarded = useRootStore((s) => s.isOnboarded);
  const pendingCount = useRootStore((s) => s.pendingSync.length);

  // A new day's quests are created on first open and whenever the app returns to the
  // foreground on a new date; the same day's set is kept as-is.
  useEffect(() => {
    ensureDailyQuests();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        ensureDailyQuests();
        flushProgressionSync().catch(() => undefined);
      }
    });
    return () => sub.remove();
  }, [ensureDailyQuests, isOnboarded]);

  // Send queued rewards to the server whenever something new is queued (no-op offline or
  // without an account).
  useEffect(() => {
    if (pendingCount > 0) flushProgressionSync().catch(() => undefined);
  }, [pendingCount]);

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
      <Stack.Screen name="personalize" />
    </Stack>
  );
}
