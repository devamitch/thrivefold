import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../../theme/useTheme';
import { CustomTabBar } from '../../../components/navigation/CustomTabBar';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      initialRouteName="index"
      backBehavior="initialRoute"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="today" options={{ title: 'Today' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
