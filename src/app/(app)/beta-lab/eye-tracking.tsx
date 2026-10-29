import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppHeader } from '../../../components/ui/AppHeader';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { BetaBadge } from '../../../components/ui/Badge';
import { EyeTrackingStudio } from '../../../features/beta-lab/components/EyeTrackingStudio';
import { BetaSessionHistory } from '../../../components/beta/BetaSessionHistory';
import type { BetaSessionKind } from '../../../stores/slices/appSlice';
import { useTheme } from '../../../theme/useTheme';

const EYE_KINDS: BetaSessionKind[] = ['eye_scan', 'blink_bloom'];

export default function EyeTrackingBetaScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="BETA LAB · ON-DEVICE VISION"
          title="Eye Tracking Studio"
          subtitle="Iris metrics, Harmon distance & BlinkQuest Eye Battery"
          showBack
          onBack={() => router.back()}
          rightAction={<BetaBadge />}
        />
      }
    >
      <View style={styles.content}>
        <EyeTrackingStudio />
        <BetaSessionHistory
          kinds={EYE_KINDS}
          metric="blinksPerMin"
          unit="blinks/min"
          title="Eye sessions"
          describe={(s) => `${s.metrics.blinksPerMin ?? 0}/min · ~${s.metrics.distanceCm ?? 0} cm`}
        />
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 10 }]}>
          Blink rate and distance are estimated from the front camera for comfort habits. This is not an eye examination
          and cannot detect eye disease or measure a prescription.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
  },
});
