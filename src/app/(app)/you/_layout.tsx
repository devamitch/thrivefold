import { Stack } from 'expo-router';

/** Focused sub-screens of the You tab. */
export default function YouLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
