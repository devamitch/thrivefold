import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRootStore } from '../stores/useRootStore';
import { useTheme } from '../theme/useTheme';

// import { BlurRoot } from '@/components/ui';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { AnimatedSplash } from '../components/brand/AnimatedSplash';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AchievementModal } from '../components/ui/AchievementModal';
import { CustomAlert } from '../components/ui/CustomAlert';
import { MindfulNotificationBanner } from '../components/ui/MindfulNotificationBanner';
import { GlobalVoiceAssistant } from '../components/assistant/GlobalVoiceAssistant';
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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: PERSIST_MAX_AGE,
      }}
    >
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          {/* <BlurRoot> */}
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
            <GlobalVoiceAssistant />
            {splash ? <AnimatedSplash onDone={() => setSplash(false)} /> : null}
          </ErrorBoundary>
          {/* </BlurRoot> */}
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </PersistQueryClientProvider>
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
  return (
    <StatusBar
      barStyle={isDark ? 'light-content' : 'dark-content'}
      translucent
      backgroundColor="transparent"
    />
  );
}
