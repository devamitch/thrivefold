/**
 * CoachBanner — one slim capsule above the HUD. One message at a time.
 * Fault shows its fix on a second line; everything else is a single line.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/useTheme';
import { CoachGlass } from '../workout/CoachGlass';
import { COACH_HUD_HEIGHT } from './CoachHUD';

export type BannerTone = 'gesture' | 'fault' | 'framing' | 'cue';

interface CoachBannerProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text?: string;
  tone: BannerTone;
  gestureProgress?: number;
}

export const CoachBanner = memo(function CoachBanner({
  icon,
  title,
  text,
  tone,
  gestureProgress,
}: CoachBannerProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { colors, typography, spacing } = useTheme();
  const accent =
    tone === 'fault' ? colors.error : tone === 'framing' ? colors.warning : colors.callText;

  return (
    <Animated.View
      key={tone + title}
      entering={reduceMotion ? undefined : FadeIn.duration(160)}
      exiting={reduceMotion ? undefined : FadeOut.duration(120)}
      pointerEvents="none"
      accessibilityLiveRegion={tone === 'fault' || tone === 'framing' ? 'assertive' : 'polite'}
      style={[
        styles.wrap,
        {
          top: insets.top + 62,
          paddingLeft: spacing.base,
          paddingRight: spacing.base + 52,
        },
      ]}
    >
      <CoachGlass radius={20} strong style={styles.pill}>
        <Ionicons name={icon} size={18} color={accent} />
        <View style={styles.copy}>
          <Text style={[typography.subbodyBold, { color: colors.callText }]} numberOfLines={1}>
            {title}
          </Text>
          {tone === 'fault' && text ? (
            <Text
              style={[typography.caption, { color: colors.callMuted, marginTop: 1 }]}
              numberOfLines={2}
            >
              {text}
            </Text>
          ) : null}
        </View>
        {tone === 'gesture' && gestureProgress != null ? (
          <View style={[styles.track, { backgroundColor: colors.callSurfaceStrong }]}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.round(gestureProgress * 100)}%`,
                  backgroundColor: colors.callText,
                },
              ]}
            />
          </View>
        ) : null}
      </CoachGlass>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  copy: { flex: 1, marginLeft: 10 },
  fill: { height: 3 },
  pill: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 9 },
  track: { borderRadius: 2, height: 3, marginLeft: 10, overflow: 'hidden', width: 44 },
  wrap: { alignSelf: 'center', left: 0, position: 'absolute', right: 0 },
});
