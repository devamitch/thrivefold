import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useRootStore } from '../stores/useRootStore';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { MindfulNotificationBanner } from '../components/ui/MindfulNotificationBanner';
import { CustomAlert } from '../components/ui/CustomAlert';
import { AchievementModal } from '../components/ui/AchievementModal';
import { AnimatedSplash } from '../components/brand/AnimatedSplash';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { PERSIST_MAX_AGE, queryClient, queryPersister } from '../services/supabase/queryClient';

// The animated splash hides the native one once it is drawn on top of it.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [splash, setSplash] = useState(true);
  const resetDailyQuotaIfNewDay = useRootStore((s) => s.resetDailyQuotaIfNewDay);

  useEffect(() => {
    resetDailyQuotaIfNewDay();
  }, [resetDailyQuotaIfNewDay]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: queryPersister,
            maxAge: PERSIST_MAX_AGE,
          }}
        >
          <ErrorBoundary>
            <ThemedStatusBar />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(public)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(app)" />
            </Stack>
            <MindfulNotificationBanner />
            <CustomAlert />
            <AchievementModal />
            {splash ? <AnimatedSplash onDone={() => setSplash(false)} /> : null}
          </ErrorBoundary>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

/** One status bar for the whole app: dark icons on light canvases, light on dark. */
function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />;
}
