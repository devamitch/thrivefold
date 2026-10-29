import { useRouter, type Href } from 'expo-router';
import React from 'react';

import { OutdoorCard } from '../../components/home/OutdoorCard';
import { AppHeader } from '../../components/ui/AppHeader';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { SettingsRow } from '../../components/ui/SettingsRow';
import { useTheme } from '../../theme/useTheme';
import { AssetIllustrations } from '../../constants/assets';
import { SanctuaryImageBackground } from '../../components/ui/SanctuaryImageBackground';

/** Outdoors and plans: weather and official alerts for your town, outings, and trip check-ins. */
export default function OutdoorsScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  return (
    <SanctuaryImageBackground source={AssetIllustrations.roadmapJourneyBg}>
      <ScreenContainer
        style={{ backgroundColor: 'transparent' }}
        scrollable
        header={<AppHeader eyebrow="PLANS" title="Outdoors" subtitle="Weather, outings and safe trips" showBack />}
      >
        <OutdoorCard />
        <SettingsRow
          icon="map-outline"
          title="Plan an outing"
          subtitle="Pandals, parks, heritage walks with walking times"
          onPress={() => router.push('/(app)/outing' as Href)}
        />
        <SettingsRow
          icon="shield-checkmark-outline"
          title="Trip check-in"
          subtitle="Let trusted people know you got there"
          onPress={() => router.push('/(app)/safety/trip' as Href)}
        />
      </ScreenContainer>
    </SanctuaryImageBackground>
  );
}
