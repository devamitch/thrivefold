import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedBrandIcon } from '../../components/brand/AnimatedBrandIcon';
import CompanionScreen from '../../components/brand/thrive/CompanionScreen';
import { ThriveBoundary } from '../../components/brand/thrive/ThriveBoundary';

/** Meet Thrive: the living companion, full screen. Talk, play, or let it watch out for you. */
export default function ThriveScreen() {
  const router = useRouter();
  return (
    <View style={styles.fill}>
      <ThriveBoundary fallback={<AnimatedBrandIcon size={160} />}>
        <CompanionScreen onClose={() => router.back()} />
      </ThriveBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
