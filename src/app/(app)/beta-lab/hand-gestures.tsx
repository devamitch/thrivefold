import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppHeader } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { BetaBadge } from '../../../components/ui/Badge';
import { HandGestureStudio } from '../../../features/beta-lab/components/HandGestureStudio';
import { useTheme } from '../../../theme/useTheme';

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
