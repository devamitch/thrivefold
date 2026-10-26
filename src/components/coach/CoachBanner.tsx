/**
 * CoachBanner — the single coaching message strip.
 * Shows one message at a time: gesture progress, form fault, framing cue, or live cue.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FrostedView } from '../ui/FrostedView';
import { useTheme } from '../../theme/useTheme';

export type BannerTone = 'gesture' | 'fault' | 'framing' | 'cue';

interface CoachBannerProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text?: string;
  tone: BannerTone;
  gestureProgress?: number;
}

export function CoachBanner({ icon, title, text, tone, gestureProgress }: CoachBannerProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { colors, typography, spacing } = useTheme();

  return (
    <Animated.View
      key={tone + title}
      entering={reduceMotion ? undefined : FadeInDown.duration(220)}
      exiting={reduceMotion ? undefined : FadeOut.duration(150)}
      pointerEvents="none"
      accessibilityLiveRegion={tone === 'fault' || tone === 'framing' ? 'assertive' : 'polite'}
      style={[styles.bannerWrap, { bottom: insets.bottom + 150, paddingHorizontal: spacing.base }]}
    >
      <FrostedView
        tone={tone === 'fault' || tone === 'gesture' ? 'surface' : 'dark'}
        tintOpacity={tone === 'fault' || tone === 'gesture' ? 1 : 0.84}
        style={[
          styles.banner,
          {
            borderRadius: 22,
            borderColor: tone === 'fault' ? colors.error : 'rgba(255, 255, 255, 0.12)',
            borderWidth: StyleSheet.hairlineWidth,
            backgroundColor:
              tone === 'fault'
                ? colors.error
                : tone === 'gesture'
                  ? colors.primary
                  : 'rgba(16, 20, 26, 0.84)',
          },
        ]}
      >
        <View
          style={[
            styles.bannerIcon,
            {
              backgroundColor:
                tone === 'framing'
                  ? colors.warning
                  : tone === 'cue'
                    ? colors.primary
                    : colors.callSurfaceStrong,
            },
          ]}
        >
          <Ionicons name={icon} size={18} color={colors.callText} />
        </View>

        <View style={[styles.flex, { marginLeft: 12 }]}>
          <Text style={[typography.bodyBold, { color: colors.callText }]} numberOfLines={2}>
            {title}
          </Text>
          {text ? (
            <Text
              style={[typography.subbody, { color: colors.callText, opacity: 0.9, marginTop: 2 }]}
              numberOfLines={2}
            >
              {text}
            </Text>
          ) : null}
        </View>

        {tone === 'gesture' && gestureProgress != null ? (
          <View style={[styles.gestureTrack, { backgroundColor: colors.callSurfaceStrong }]}>
            <View
              style={[
                styles.gestureFill,
                { width: `${Math.round(gestureProgress * 100)}%`, backgroundColor: colors.callText },
              ]}
            />
          </View>
        ) : null}
      </FrostedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12 },
  bannerIcon: { alignItems: 'center', borderRadius: 16, height: 32, justifyContent: 'center', width: 32 },
  bannerWrap: { left: 0, position: 'absolute', right: 0 },
  flex: { flex: 1 },
  gestureFill: { height: 6 },
  gestureTrack: { borderRadius: 3, height: 6, marginLeft: 10, overflow: 'hidden', width: 60 },
});
