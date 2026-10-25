import React, { useEffect, useRef } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { Redirect, Stack, usePathname } from 'expo-router';

import { useRootStore } from '../../stores/useRootStore';
import { flushProgressionSync } from '../../services/sync/progressionSync';
import { syncQuestReminders } from '../../services/notifications/questReminders';
import { AppDrawer } from '../../components/navigation/AppDrawer';
import { DrawerSceneWrapper } from '../../components/navigation/DrawerSceneWrapper';
import { enqueueFinishedWeeks, flushSummaryOutbox } from '../../services/sync/summaryOutbox';
import { analytics } from '../../services/telemetry/analyticsService';
import { firebaseAnalytics } from '../../services/telemetry/firebaseAnalytics';
import { useTheme } from '../../theme/useTheme';
import { syncServerProfile, useAgeCheckStatus, useSyncAgeVerified } from '../../services/supabase/ageCheck';

/** Queues finished weeks and sends them if this person opted in; never throws. */
function runSummaryQueue() {
  try {
    enqueueFinishedWeeks();
    flushSummaryOutbox().catch(() => undefined);
  } catch {
    // The outbox is best-effort; the app works without it.
  }
}

export default function AppLayout() {
  const pathname = usePathname();
  const isAuthenticated = useRootStore((s) => s.isAuthenticated);
  const ensureDailyQuests = useRootStore((s) => s.ensureDailyQuests);
  const isOnboarded = useRootStore((s) => s.isOnboarded);
  const pendingCount = useRootStore((s) => s.pendingSync.length);
  const openCount = useRootStore((s) => s.todayQuests.filter((q) => !q.isCompleted && q.status !== 'skipped').length);
  const remindersOn = useRootStore((s) => s.questRemindersEnabled);

  // Firebase collects only after an explicit opt-in (firebase.json keeps it off at install).
  const usageAnalytics = useRootStore((s) => s.usageAnalytics);
  useEffect(() => {
    firebaseAnalytics.setCollectionEnabled(usageAnalytics);
  }, [usageAnalytics]);

  // Track active pathname so forceful app restarts restore exact location
  useEffect(() => {
    if (pathname && pathname !== '/') {
      analytics.logNavigation(pathname);
    }
  }, [pathname]);

  // Reminders follow what is still open today.
  useEffect(() => {
    syncQuestReminders();
  }, [openCount, remindersOn]);

  // A new day's quests are created on first open and whenever the app returns to the
  // foreground on a new date; the same day's set is kept as-is.
  useEffect(() => {
    ensureDailyQuests();
    runSummaryQueue();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        ensureDailyQuests();
        flushProgressionSync().catch(() => undefined);
        runSummaryQueue();
      }
    });
    return () => sub.remove();
  }, [ensureDailyQuests, isOnboarded]);

  // Send queued rewards to the server whenever something new is queued (no-op offline or
  // without an account).
  useEffect(() => {
    if (pendingCount > 0) flushProgressionSync().catch(() => undefined);
  }, [pendingCount]);

  // Signed-in accounts get their server profile rows (pseudonym, letter settings only), and
  // the local age-verified flag follows the server, the only place it can change.
  const user = useRootStore((s) => s.user);
  const signedIn = isAuthenticated && Boolean(user) && !user?.isGuest;
  const acceptingLetters = useRootStore((s) => s.letterPreferences.acceptingLetters);
  useEffect(() => {
    if (signedIn) syncServerProfile().catch(() => undefined);
  }, [signedIn, user?.pseudonym, acceptingLetters]);
  const ageStatus = useAgeCheckStatus(signedIn);
  useSyncAgeVerified(ageStatus.data);

  const { colors } = useTheme();
  // The screens are the blur target for the frosted drawer behind them.
  const sceneRef = useRef<View>(null);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.dock }]}>
      <AppDrawer blurTarget={sceneRef} />
      <DrawerSceneWrapper blurTarget={sceneRef}>
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
          <Stack.Screen name="roadmap" />
          <Stack.Screen name="train" />
          <Stack.Screen name="you" />
          <Stack.Screen name="watch" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      </DrawerSceneWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
