import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '../../components/ui/PressableScale';
import { YouTubePlayer } from '../../components/workout/YouTubePlayer';
import { useTheme } from '../../theme/useTheme';

/**
 * Watch tutorials without leaving Thrivefold: a verified video plays in the embedded
 * player; anything else opens YouTube's search for that topic inside the app.
 */
export default function WatchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTheme();
  const { v, q, title } = useLocalSearchParams<{ v?: string; q?: string; title?: string }>();

  return (
    <View style={[styles.root, { backgroundColor: colors.text.primary, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.bar}>
        <PressableScale
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={22} color={colors.onPrimary} />
        </PressableScale>
        <View style={styles.flex}>
          <Text style={[typography.bodyBold, { color: colors.onPrimary }]} numberOfLines={1}>
            {title ?? 'Tutorial'}
          </Text>
          <Text
            style={[typography.caption, { color: colors.onPrimary, opacity: 0.75 }]}
            numberOfLines={1}
          >
            {v ? 'Checked tutorial video' : 'Pick a video below; it plays here'}
          </Text>
        </View>
      </View>
      <YouTubePlayer
        videoId={v || undefined}
        query={q}
        style={{ flex: 1, marginBottom: insets.bottom }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  bar: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 6 },
  flex: { flex: 1 },
  root: { flex: 1 },
});
