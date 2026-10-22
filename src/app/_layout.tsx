import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useRootStore } from '../stores/useRootStore';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { Toast } from '../components/ui/Toast';

export default function RootLayout() {
  const resetDailyQuotaIfNewDay = useRootStore((s) => s.resetDailyQuotaIfNewDay);

  useEffect(() => {
    resetDailyQuotaIfNewDay();
  }, [resetDailyQuotaIfNewDay]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
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
          <Toast />
        </ErrorBoundary>
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
