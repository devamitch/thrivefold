import { Ionicons } from '@expo/vector-icons';
import { hapticSelection } from '../../../services/haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '../../../components/ui/AppHeader';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { PoseOverlay } from '../../../components/workout/PoseOverlay';
import { EyeTrackingStudio } from '../../../features/beta-lab/components/EyeTrackingStudio';
import { HandGestureStudio } from '../../../features/beta-lab/components/HandGestureStudio';
import {
  isMotionBlurSupported,
  MotionBlurAdapter,
} from '../../../features/beta-lab/experiments/motion-blur/MotionBlurAdapter';
import { PoseDetectionAdapter } from '../../../features/beta-lab/experiments/pose-detection/PoseDetectionAdapter';
import { useBetaSettings, type PoseEngineOption } from '../../../features/beta-lab/flags/betaFlags';
import { useBetaPoseLab } from '../../../features/beta-lab/hooks/useBetaPoseLab';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

type Tab = 'eye-tracking' | 'hand-gestures' | 'pose-lab' | 'motion-blur' | 'settings';

export default function BetaLabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, typography, spacing } = useTheme();

  const { betaMode, setBetaMode } = useRootStore(
    useShallow((s) => ({
      betaMode: s.betaMode,
      setBetaMode: s.setBetaMode,
    })),
  );

  const { settings, updateSetting, resetSettings } = useBetaSettings();
  const [activeTab, setActiveTab] = useState<Tab>('eye-tracking');

  // Motion blur demo animation — strictly zero spring physics, only smooth timing
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
      motionProgress.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
    }
  }, [motionRunning, motionProgress]);

  const movingCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: motionProgress.value * (width * 0.28) }],
  }));

  // Pose Lab hook & camera state
  const poseLab = useBetaPoseLab();

  const tick = useCallback(() => {
    hapticSelection();
  }, []);

  const selectTab = useCallback(
    (t: Tab) => {
      tick();
      setActiveTab(t);
    },
    [tick],
  );

  const toggleEngine = useCallback(
    (eng: PoseEngineOption) => {
      tick();
      updateSetting('poseEngine', eng);
    },
    [tick, updateSetting],
  );

  return (
    <ScreenContainer>
      <AppHeader
        title="Beta Lab"
        subtitle="Experimental Motion & Pose Tech"
        showBack
        onBack={() => router.back()}
        rightAction={
          <PressableScale
            onPress={() => {
              tick();
              setBetaMode(!betaMode);
            }}
            scaleTo={0.92}
            accessibilityRole="button"
            accessibilityLabel="Toggle Beta Mode"
          >
            <SquircleSurface
              radius={12}
              fill={betaMode ? colors.dockActive : colors.surface2}
              style={styles.headerBadge}
            >
              <Text
                style={[
                  typography.captionBold,
                  { color: betaMode ? colors.dock : colors.text.muted, fontSize: 11 },
                ]}
              >
                {betaMode ? 'BETA ON' : 'BETA OFF'}
              </Text>
            </SquircleSurface>
          </PressableScale>
        }
      />

      {/* Tab Segment Selector */}
      <View style={{ marginBottom: 10, marginTop: 4 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.tabRow, { paddingHorizontal: spacing.md }]}
        >
          <PressableScale onPress={() => selectTab('eye-tracking')} scaleTo={0.96}>
            <SquircleSurface
              radius={14}
              fill={activeTab === 'eye-tracking' ? colors.dockActive : colors.surface2}
              style={styles.tabBtn}
            >
              <Ionicons
                name="eye-outline"
                size={16}
                color={activeTab === 'eye-tracking' ? colors.dock : colors.text.primary}
              />
              <Text
                style={[
                  typography.captionBold,
                  { color: activeTab === 'eye-tracking' ? colors.dock : colors.text.primary },
                ]}
              >
                Eye Tracking
              </Text>
            </SquircleSurface>
          </PressableScale>

          <PressableScale onPress={() => selectTab('hand-gestures')} scaleTo={0.96}>
            <SquircleSurface
              radius={14}
              fill={activeTab === 'hand-gestures' ? colors.dockActive : colors.surface2}
              style={styles.tabBtn}
            >
              <Ionicons
                name="hand-right-outline"
                size={16}
                color={activeTab === 'hand-gestures' ? colors.dock : colors.text.primary}
              />
              <Text
                style={[
                  typography.captionBold,
                  { color: activeTab === 'hand-gestures' ? colors.dock : colors.text.primary },
                ]}
              >
                Hand Gestures
              </Text>
            </SquircleSurface>
          </PressableScale>

          <PressableScale onPress={() => selectTab('pose-lab')} scaleTo={0.96}>
            <SquircleSurface
              radius={14}
              fill={activeTab === 'pose-lab' ? colors.dockActive : colors.surface2}
              style={styles.tabBtn}
            >
              <Ionicons
                name="body-outline"
                size={16}
                color={activeTab === 'pose-lab' ? colors.dock : colors.text.primary}
              />
              <Text
                style={[
                  typography.captionBold,
                  { color: activeTab === 'pose-lab' ? colors.dock : colors.text.primary },
                ]}
              >
                Pose Lab
              </Text>
            </SquircleSurface>
          </PressableScale>

          <PressableScale onPress={() => selectTab('motion-blur')} scaleTo={0.96}>
            <SquircleSurface
              radius={14}
              fill={activeTab === 'motion-blur' ? colors.dockActive : colors.surface2}
              style={styles.tabBtn}
            >
              <Ionicons
                name="water-outline"
                size={16}
                color={activeTab === 'motion-blur' ? colors.dock : colors.text.primary}
              />
              <Text
                style={[
                  typography.captionBold,
                  { color: activeTab === 'motion-blur' ? colors.dock : colors.text.primary },
                ]}
              >
                Motion Blur
              </Text>
            </SquircleSurface>
          </PressableScale>

          <PressableScale onPress={() => selectTab('settings')} scaleTo={0.96}>
            <SquircleSurface
              radius={14}
              fill={activeTab === 'settings' ? colors.dockActive : colors.surface2}
              style={styles.tabBtn}
            >
              <Ionicons
                name="options-outline"
                size={16}
                color={activeTab === 'settings' ? colors.dock : colors.text.primary}
              />
              <Text
                style={[
                  typography.captionBold,
                  { color: activeTab === 'settings' ? colors.dock : colors.text.primary },
                ]}
              >
                Flags & Engines
              </Text>
            </SquircleSurface>
          </PressableScale>
        </ScrollView>
      </View>

      <ScreenScrollView contentContainerStyle={styles.scrollContent}>
        {/* ======================= TAB 1: EYE TRACKING ======================= */}
        {activeTab === 'eye-tracking' ? (
          <View style={styles.sectionWrap}>
            <EyeTrackingStudio />
          </View>
        ) : null}

        {/* ======================= TAB 2: HAND GESTURES ======================= */}
        {activeTab === 'hand-gestures' ? (
          <View style={styles.sectionWrap}>
            <HandGestureStudio />
          </View>
        ) : null}

        {/* ======================= TAB 3: MOTION BLUR ======================= */}
        {activeTab === 'motion-blur' ? (
          <View style={styles.sectionWrap}>
            <SquircleSurface radius={24} fill={colors.surface} style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
                <Text style={[typography.subheading, { color: colors.callText, flex: 1 }]}>
                  Native Motion Blur Studio
                </Text>
                <SquircleSurface
                  radius={8}
                  fill={isMotionBlurSupported() ? colors.primaryAlpha : colors.surface2}
                  style={styles.pill}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: isMotionBlurSupported() ? colors.primary : colors.text.muted },
                    ]}
                  >
                    {isMotionBlurSupported() ? 'Supported' : 'Safe View Fallback'}
                  </Text>
                </SquircleSurface>
              </View>

              <Text style={[typography.body, { color: colors.text.muted, marginTop: 6 }]}>
                Motion blur dynamically softens fast-moving UI elements based on on-screen velocity.
                It is completely isolated from frosted backdrops and sheet blurs.
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
                    <SquircleSurface
                      radius={18}
                      fill={colors.dockActive}
                      style={styles.movingDemoCard}
                    >
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
                  <SquircleSurface
                    radius={16}
                    fill={motionRunning ? colors.error : colors.primary}
                    style={styles.btnSurface}
                  >
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
                      name={settings.motionBlurEnabled ? 'eye' : 'eye-off-outline'}
                      size={18}
                      color={settings.motionBlurEnabled ? colors.dock : colors.text.primary}
                    />
                    <Text
                      style={[
                        typography.bodyBold,
                        { color: settings.motionBlurEnabled ? colors.dock : colors.text.primary },
                      ]}
                    >
                      {settings.motionBlurEnabled ? 'Blur On' : 'Blur Off'}
                    </Text>
                  </SquircleSurface>
                </PressableScale>
              </View>

              {/* Parameter Adjusters */}
              <View style={styles.settingRow}>
                <Text style={[typography.body, { color: colors.text.primary }]}>
                  Live Recapture
                </Text>
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
                  Android 13+ runs per-pixel runtime shaders; Android 12 applies directional blur;
                  Android 11 and web fall back cleanly to smooth 60fps rendering without blur.
                </Text>
              </View>
            </SquircleSurface>
          </View>
        ) : null}

        {/* ======================= TAB 2: POSE LAB ======================= */}
        {activeTab === 'pose-lab' ? (
          <View style={styles.sectionWrap}>
            <SquircleSurface radius={24} fill={colors.surface} style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="body-outline" size={20} color={colors.primary} />
                <Text style={[typography.subheading, { color: colors.text.primary, flex: 1 }]}>
                  Pose Detection Sandbox
                </Text>
                <SquircleSurface radius={8} fill={colors.primaryAlpha} style={styles.pill}>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    {settings.poseEngine === 'default' ? 'Default MediaPipe' : 'Experimental'}
                  </Text>
                </SquircleSurface>
              </View>

              {/* Camera Preview Box */}
              <View style={[styles.cameraContainer, { backgroundColor: '#121212' }]}>
                {poseLab.active ? (
                  <>
                    <PoseDetectionAdapter
                      engine={settings.poseEngine}
                      active={poseLab.active}
                      facing={poseLab.facing}
                      face={false}
                      hands={false}
                      onPose={poseLab.onPose}
                      onPoseReady={poseLab.onPoseReady}
                      onPoseError={poseLab.onPoseError}
                      style={StyleSheet.absoluteFill}
                    />
                    <PoseOverlay
                      feed={poseLab.feed}
                      width={width - 48}
                      height={260}
                      highlight={[]}
                    />
                  </>
                ) : (
                  <View style={styles.cameraPlaceholder}>
                    <Ionicons name="videocam-off-outline" size={42} color="#666666" />
                    <Text style={[typography.body, { color: '#AAAAAA', marginTop: 8 }]}>
                      Camera Inactive
                    </Text>
                    <Text style={[typography.caption, { color: '#777777', marginTop: 2 }]}>
                      Tap Start Camera below to evaluate live skeleton tracking
                    </Text>
                  </View>
                )}
              </View>

              {/* Live Telemetry Panel */}
              <View style={[styles.telemetryGrid, { backgroundColor: colors.surface2 }]}>
                <View style={styles.telemetryItem}>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>FPS</Text>
                  <Text style={[typography.heading, { color: colors.text.primary, fontSize: 18 }]}>
                    {poseLab.telemetry.fps}
                  </Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Latency</Text>
                  <Text style={[typography.heading, { color: colors.text.primary, fontSize: 18 }]}>
                    {poseLab.telemetry.latencyMs} ms
                  </Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Points</Text>
                  <Text style={[typography.heading, { color: colors.text.primary, fontSize: 18 }]}>
                    {poseLab.telemetry.pointsCount}
                  </Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Delegate</Text>
                  <Text style={[typography.heading, { color: colors.text.primary, fontSize: 18 }]}>
                    {poseLab.telemetry.delegate.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Camera Actions */}
              <View style={styles.controlsRow}>
                <PressableScale
                  onPress={() => {
                    tick();
                    poseLab.toggleCamera();
                  }}
                  scaleTo={0.95}
                  style={styles.actionBtn}
                >
                  <SquircleSurface
                    radius={16}
                    fill={poseLab.active ? colors.error : colors.primary}
                    style={styles.btnSurface}
                  >
                    <Ionicons name={poseLab.active ? 'stop' : 'camera'} size={18} color="#FFFFFF" />
                    <Text style={[typography.bodyBold, { color: '#FFFFFF' }]}>
                      {poseLab.active ? 'Stop Camera' : 'Start Camera'}
                    </Text>
                  </SquircleSurface>
                </PressableScale>

                {poseLab.active ? (
                  <PressableScale
                    onPress={() => {
                      tick();
                      poseLab.flipCamera();
                    }}
                    scaleTo={0.95}
                    style={styles.actionBtn}
                  >
                    <SquircleSurface radius={16} fill={colors.surface2} style={styles.btnSurface}>
                      <Ionicons name="camera-reverse" size={18} color={colors.text.primary} />
                      <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                        {poseLab.facing === 'front' ? 'Front' : 'Back'}
                      </Text>
                    </SquircleSurface>
                  </PressableScale>
                ) : null}
              </View>
            </SquircleSurface>
          </View>
        ) : null}

        {/* ======================= TAB 3: ENGINES & SETTINGS ======================= */}
        {activeTab === 'settings' ? (
          <View style={styles.sectionWrap}>
            <SquircleSurface radius={24} fill={colors.surface} style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="options" size={20} color={colors.primary} />
                <Text style={[typography.subheading, { color: colors.text.primary, flex: 1 }]}>
                  Dual Engine & Fallback Architecture
                </Text>
              </View>

              <Text style={[typography.body, { color: colors.text.muted, marginTop: 4 }]}>
                Choose which pose engine to evaluate. The production app always defaults to the
                proven Native MediaPipe engine if experimental modules are disabled or fail.
              </Text>

              {/* Engine Option: Default MediaPipe */}
              <PressableScale
                onPress={() => toggleEngine('default')}
                scaleTo={0.98}
                style={styles.engineCard}
              >
                <SquircleSurface
                  radius={18}
                  fill={settings.poseEngine === 'default' ? colors.primaryAlpha : colors.surface2}
                  style={styles.engineInner}
                >
                  <View style={styles.engineHeaderRow}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      Default Engine (MediaPipe Native)
                    </Text>
                    {settings.poseEngine === 'default' ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    ) : null}
                  </View>
                  <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                    33-point body tracking with 60fps UI-thread Skia interpolation. Proven, stable,
                    and battery-optimized.
                  </Text>
                </SquircleSurface>
              </PressableScale>

              {/* Engine Option: Experimental Module */}
              <PressableScale
                onPress={() => toggleEngine('experimental')}
                scaleTo={0.98}
                style={styles.engineCard}
              >
                <SquircleSurface
                  radius={18}
                  fill={
                    settings.poseEngine === 'experimental' ? colors.primaryAlpha : colors.surface2
                  }
                  style={styles.engineInner}
                >
                  <View style={styles.engineHeaderRow}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      Experimental Engine (Beta Lab)
                    </Text>
                    {settings.poseEngine === 'experimental' ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    ) : null}
                  </View>
                  <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                    Experimental pose and frame processing pipeline with adaptive throttling and
                    extended telemetry.
                  </Text>
                </SquircleSurface>
              </PressableScale>

              {/* Reset Beta Settings */}
              <PressableScale
                onPress={() => {
                  tick();
                  resetSettings();
                }}
                scaleTo={0.98}
                style={styles.resetBtn}
              >
                <SquircleSurface radius={16} fill={colors.surface2} style={styles.resetInner}>
                  <Ionicons name="refresh-outline" size={18} color={colors.error} />
                  <Text style={[typography.bodyBold, { color: colors.error }]}>
                    Restore Safe Defaults
                  </Text>
                </SquircleSurface>
              </PressableScale>
            </SquircleSurface>
          </View>
        ) : null}
      </ScreenScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  tabFlex: {
    flex: 1,
  },
  tabBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  sectionWrap: {
    paddingHorizontal: 16,
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stage: {
    alignItems: 'center',
    borderRadius: 20,
    height: 140,
    justifyContent: 'center',
    marginTop: 16,
    overflow: 'hidden',
  },
  movingDemoCard: {
    alignItems: 'center',
    height: 90,
    justifyContent: 'center',
    width: 100,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
  },
  btnSurface: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  compatNotice: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  cameraContainer: {
    borderRadius: 20,
    height: 260,
    marginTop: 14,
    overflow: 'hidden',
  },
  cameraPlaceholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  telemetryGrid: {
    borderRadius: 16,
    flexDirection: 'row',
    marginTop: 12,
    padding: 12,
  },
  telemetryItem: {
    alignItems: 'center',
    flex: 1,
  },
  engineCard: {
    marginTop: 12,
  },
  engineInner: {
    padding: 14,
  },
  engineHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resetBtn: {
    marginTop: 20,
  },
  resetInner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
  },
});
