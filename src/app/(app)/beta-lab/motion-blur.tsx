import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AppHeader } from '../../../components/ui/AppHeader';
import { BetaBadge } from '../../../components/ui/Badge';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import {
  isMotionBlurSupported,
  MotionBlurAdapter,
} from '../../../features/beta-lab/experiments/motion-blur/MotionBlurAdapter';
import { useBetaSettings } from '../../../features/beta-lab/flags/betaFlags';
import { hapticSelection } from '../../../services/haptics';
import { useTheme } from '../../../theme/useTheme';

export default function MotionBlurBetaScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors, typography, spacing } = useTheme();
  const { settings, updateSetting } = useBetaSettings();

  const motionProgress = useSharedValue(0);
  const [motionRunning, setMotionRunning] = useState(false);

  useEffect(() => {
    if (motionRunning) {
      motionProgress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 750, easing: Easing.inOut(Easing.cubic) }),
          withTiming(-1, { duration: 750, easing: Easing.inOut(Easing.cubic) }),
        ),
        -1,
        true,
      );
    } else {
      motionProgress.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [motionRunning, motionProgress]);

  const movingCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: motionProgress.value * (width * 0.28) }],
  }));

  const tick = useCallback(() => {
    hapticSelection();
  }, []);

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="BETA LAB · FLUID PHYSICS"
          title="Native Motion Blur"
          subtitle="Velocity-driven AGSL runtime shaders & 60fps card animation"
          showBack
          onBack={() => router.back()}
          rightAction={<BetaBadge />}
        />
      }
    >
      <SquircleSurface radius={24} fill={colors.surface} style={[styles.card, { marginTop: spacing.sm }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="bulb-outline" size={20} color={colors.primary} />
          <Text style={[typography.subheading, { color: colors.callText, flex: 1 }]}>Native Motion Blur Studio</Text>
          <SquircleSurface
            radius={8}
            fill={isMotionBlurSupported() ? colors.primaryAlpha : colors.surface2}
            style={styles.pill}
          >
            <Text
              style={[
                typography.captionBold,
                {
                  color: isMotionBlurSupported() ? colors.primary : colors.text.muted,
                },
              ]}
            >
              {isMotionBlurSupported() ? 'Supported' : 'Safe View Fallback'}
            </Text>
          </SquircleSurface>
        </View>

        <Text style={[typography.body, { color: colors.text.muted, marginTop: 6 }]}>
          Motion blur dynamically softens fast-moving UI elements based on on-screen velocity. It is completely isolated
          from frosted backdrops and sheet blurs.
        </Text>

        {/* Interactive Demo Stage */}
        <View style={[styles.stage, { backgroundColor: colors.surface2 }]}>
          <Animated.View style={movingCardStyle}>
            <MotionBlurAdapter
              enabled={settings.motionBlurEnabled}
              intensity={settings.motionBlurIntensity}
              samples={settings.motionBlurSamples}
              live={settings.motionBlurLive}
            >
              <SquircleSurface radius={18} fill={colors.dockActive} style={styles.movingDemoCard}>
                <Ionicons name="rocket-outline" size={28} color={colors.dock} />
                <Text style={[typography.captionBold, { color: colors.dock, marginTop: 4 }]}>
                  {settings.motionBlurEnabled ? 'Blur Active' : 'Plain View'}
                </Text>
              </SquircleSurface>
            </MotionBlurAdapter>
          </Animated.View>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <PressableScale
            onPress={() => {
              tick();
              setMotionRunning((r) => !r);
            }}
            scaleTo={0.95}
            style={styles.actionBtn}
          >
            <SquircleSurface radius={16} fill={motionRunning ? colors.error : colors.primary} style={styles.btnSurface}>
              <Ionicons name={motionRunning ? 'pause' : 'play'} size={18} color="#FFFFFF" />
              <Text style={[typography.bodyBold, { color: '#FFFFFF' }]}>
                {motionRunning ? 'Stop Motion' : 'Start Motion'}
              </Text>
            </SquircleSurface>
          </PressableScale>

          <PressableScale
            onPress={() => {
              tick();
              updateSetting('motionBlurEnabled', !settings.motionBlurEnabled);
            }}
            scaleTo={0.95}
            style={styles.actionBtn}
          >
            <SquircleSurface
              radius={16}
              fill={settings.motionBlurEnabled ? colors.dockActive : colors.surface2}
              style={styles.btnSurface}
            >
              <Ionicons
                name={settings.motionBlurEnabled ? 'eye' : 'eye-off'}
                size={18}
                color={settings.motionBlurEnabled ? colors.dock : colors.text.primary}
              />
              <Text
                style={[
                  typography.bodyBold,
                  {
                    color: settings.motionBlurEnabled ? colors.dock : colors.text.primary,
                  },
                ]}
              >
                {settings.motionBlurEnabled ? 'Blur ON' : 'Blur OFF'}
              </Text>
            </SquircleSurface>
          </PressableScale>
        </View>

        {/* Tuning Sliders */}
        <View style={[styles.tuningRow, { marginTop: spacing.md }]}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Intensity</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[0.5, 1.0, 1.5, 2.0].map((intVal) => (
              <PressableScale
                key={intVal}
                onPress={() => {
                  tick();
                  updateSetting('motionBlurIntensity', intVal);
                }}
                scaleTo={0.92}
              >
                <SquircleSurface
                  radius={10}
                  fill={settings.motionBlurIntensity === intVal ? colors.primary : colors.surface2}
                  style={{ paddingHorizontal: 12, paddingVertical: 6 }}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      {
                        color: settings.motionBlurIntensity === intVal ? '#FFFFFF' : colors.text.secondary,
                      },
                    ]}
                  >
                    {intVal}x
                  </Text>
                </SquircleSurface>
              </PressableScale>
            ))}
          </View>
        </View>

        <View style={[styles.tuningRow, { marginTop: spacing.sm }]}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Samples</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[4, 8, 16].map((sampleVal) => (
              <PressableScale
                key={sampleVal}
                onPress={() => {
                  tick();
                  updateSetting('motionBlurSamples', sampleVal);
                }}
                scaleTo={0.92}
              >
                <SquircleSurface
                  radius={10}
                  fill={settings.motionBlurSamples === sampleVal ? colors.primary : colors.surface2}
                  style={{ paddingHorizontal: 12, paddingVertical: 6 }}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      {
                        color: settings.motionBlurSamples === sampleVal ? '#FFFFFF' : colors.text.secondary,
                      },
                    ]}
                  >
                    {sampleVal}
                  </Text>
                </SquircleSurface>
              </PressableScale>
            ))}
          </View>
        </View>

        <View style={[styles.switchRow, { marginTop: spacing.sm }]}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Continuous Live Updates</Text>
          <Switch
            value={settings.motionBlurLive}
            onValueChange={(val) => {
              tick();
              updateSetting('motionBlurLive', val);
            }}
            thumbColor={settings.motionBlurLive ? colors.dockActive : colors.text.muted}
          />
        </View>

        <View style={styles.compatNotice}>
          <Ionicons name="information-circle-outline" size={16} color={colors.text.muted} />
          <Text style={[typography.caption, { color: colors.text.muted, flex: 1 }]}>
            Android 13+ runs per-pixel runtime shaders; Android 12 applies directional blur; Android 11 and web fall
            back cleanly to smooth 60fps rendering without blur.
          </Text>
        </View>
      </SquircleSurface>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stage: {
    height: 180,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 14,
    overflow: 'hidden',
  },
  movingDemoCard: {
    width: 120,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
  },
  btnSurface: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tuningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  compatNotice: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#00000010',
  },
});
