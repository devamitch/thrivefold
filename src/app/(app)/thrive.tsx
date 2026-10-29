import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBrandIcon } from '../../components/brand/AnimatedBrandIcon';
import CompanionScreen from '../../components/brand/thrive/CompanionScreen';
import { ThriveBoundary } from '../../components/brand/thrive/ThriveBoundary';
import { GlassIconButton, GlassMarks } from '../../components/ui/GlassOrbButton';

/** Meet Thrive: the living companion, full screen. Talk, play, or let it watch out for you. */
export default function ThriveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.fill}>
      <ThriveBoundary fallback={<AnimatedBrandIcon size={160} />}>
        <CompanionScreen />
      </ThriveBoundary>
      <View style={[styles.back, { top: insets.top + 8 }]}>
        <GlassIconButton path={GlassMarks.chevronDown} accessibilityLabel="Close" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  back: { position: 'absolute', right: 12 },
});
