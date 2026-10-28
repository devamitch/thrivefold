import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppHeader } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { BetaBadge } from '../../../components/ui/Badge';
import { EyeTrackingStudio } from '../../../features/beta-lab/components/EyeTrackingStudio';
import { useTheme } from '../../../theme/useTheme';

export default function EyeTrackingBetaScreen() {
  const router = useRouter();
  const { spacing } = useTheme();

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow="BETA LAB · ON-DEVICE VISION"
        title="Eye Tracking Studio"
        subtitle="Iris metrics, Harmon distance & BlinkQuest Eye Battery"
        showBack
        onBack={() => router.back()}
        rightAction={<BetaBadge />}
      />
      <ScreenScrollView contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl * 2 }}>
        <View style={styles.content}>
          <EyeTrackingStudio />
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
