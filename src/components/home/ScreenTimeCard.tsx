import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BetaBadge } from '../ui/Badge';
import { identifyWorkSchedule } from '../../domain/productivity/screenTime';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { formatLocalDate } from '../../domain/calendar/universalCalendarEngine';
import { useBetaEnabled } from '../../hooks/useBetaEnabled';

export function ScreenTimeCard() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const betaMode = useBetaEnabled();
  const { appStateHistory } = useRootStore(
    useShallow((s) => ({
      appStateHistory: s.appStateHistory,
    })),
  );

  // Compute today's foreground continuous minutes from app state history
  const { continuousMinutes, schedule } = useMemo(() => {
    const todayStr = formatLocalDate(new Date());
    const todayStates = (appStateHistory ?? []).filter((h) => h.timestamp.startsWith(todayStr));
    
    // Find the last active transition
    const lastActive = [...todayStates].reverse().find((h) => h.state === 'active');
    let mins = 0;
    if (lastActive) {
      const elapsedMs = Date.now() - new Date(lastActive.timestamp).getTime();
      mins = Math.max(1, Math.min(180, Math.round(elapsedMs / 60000)));
    } else {
      mins = 5; // Default initial session estimation
    }

    const sched = identifyWorkSchedule([], mins);
    return { continuousMinutes: mins, schedule: sched };
  }, [appStateHistory]);

  const breakKindMeta = {
    eye_rest_20_20: {
      title: '20-20-20 Eye Relief',
      desc: 'Look at something 20 feet away for 20 seconds to relax ciliary eye muscles.',
      action: 'Eye Studio',
      route: '/(app)/beta-lab' as Href,
      icon: 'eye-outline' as const,
      image: require('../../../assets/illustrations/wellness-eye-vision.jpg'),
    },
    posture_reset: {
      title: 'Posture & Neck Reset',
      desc: 'Release stiff shoulders and restore thoracic spine alignment.',
      action: 'Desk Reset',
      route: '/(app)/health/workout/desk_reset' as Href,
      icon: 'body-outline' as const,
      image: require('../../../assets/illustrations/workout-desk-reset.jpg'),
    },
    water_hydrate: {
      title: 'Hydration Pause',
      desc: 'Drink a glass of water to refresh physical and mental focus.',
      action: 'Check Water',
      route: '/(app)/(tabs)' as Href,
      icon: 'water-outline' as const,
      image: require('../../../assets/illustrations/wellness-meditation-mind.jpg'),
    },
  }[schedule.recommendedBreakKind];

  return (
    <Card style={[styles.card, { marginTop: spacing.md }]}>
      <View style={styles.imageWrap}>
        <Image source={breakKindMeta.image} style={styles.bannerImage} contentFit="cover" />
      </View>

      <View style={styles.head}>
        <View style={styles.titleRow}>
          <Ionicons name="desktop-outline" size={18} color={colors.primary} />
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
            Focus & Eye Wellness
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {betaMode ? <BetaBadge /> : null}
          <View style={[styles.pill, { backgroundColor: colors.surface2 }]}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              {continuousMinutes}m active
            </Text>
          </View>
        </View>
      </View>

      <Text style={[typography.subheading, { color: colors.text.primary, marginTop: spacing.sm }]}>
        {breakKindMeta.title}
      </Text>
      <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
        {breakKindMeta.desc}
      </Text>

      <View style={styles.footerRow}>
        <Text style={[typography.caption, { color: colors.text.muted, flex: 1 }]}>
          Schedule: {schedule.type.replace('_', ' ')} · On-device only
        </Text>
        <Button
          variant="secondary"
          size="sm"
          label={breakKindMeta.action}
          icon={<Ionicons name={breakKindMeta.icon} size={15} color={colors.primary} />}
          onPress={() => router.push(breakKindMeta.route)}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  imageWrap: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
});
