import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppHeader } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { BetaBadge } from '../../../components/ui/Badge';
import { HandGestureStudio } from '../../../features/beta-lab/components/HandGestureStudio';
import { BetaSessionHistory } from '../../../components/beta/BetaSessionHistory';
import { BetaEntryCard } from '../../../components/beta/BetaEntryCard';
import type { BetaSessionKind } from '../../../stores/slices/appSlice';
import { useTheme } from '../../../theme/useTheme';

const GRIP_KINDS: BetaSessionKind[] = ['hand_grip'];

export default function HandGesturesBetaScreen() {
  const router = useRouter();
  const { spacing } = useTheme();

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow="BETA LAB · ON-DEVICE VISION"
        title="Hand Gesture Studio"
        subtitle="21-point hand tracking, grip rep counter & wrist mobility"
        showBack
        onBack={() => router.back()}
        rightAction={<BetaBadge />}
      />
      <ScreenScrollView contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl * 2 }}>
        <View style={styles.content}>
          <HandGestureStudio />
          <BetaEntryCard
            icon="game-controller-outline"
            title="Finger Count Challenge"
            subtitle="A coach-voiced game: show the number of fingers the coach calls out"
            route="/(app)/beta-lab/gesture-game"
          />
          <BetaSessionHistory
            kinds={GRIP_KINDS}
            metric="reps"
            unit="reps"
            title="Grip sessions"
            describe={(s) => `${s.metrics.reps ?? 0} reps`}
          />
        </View>
      </ScreenScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
  },
});
