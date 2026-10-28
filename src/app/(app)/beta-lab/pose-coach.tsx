import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { BetaBadge } from '../../../components/ui/Badge';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { PoseOverlay } from '../../../components/workout/PoseOverlay';
import { PoseDetectionAdapter } from '../../../features/beta-lab/experiments/pose-detection/PoseDetectionAdapter';
import { useBetaSettings } from '../../../features/beta-lab/flags/betaFlags';
import { useBetaPoseLab } from '../../../features/beta-lab/hooks/useBetaPoseLab';
import { hapticSelection } from '../../../services/haptics';
import { useTheme } from '../../../theme/useTheme';

export default function PoseCoachBetaScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors, typography, spacing } = useTheme();
  const { settings, updateSetting } = useBetaSettings();
  const poseLab = useBetaPoseLab();

  const tick = useCallback(() => {
    hapticSelection();
  }, []);

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow="BETA LAB · ON-DEVICE VISION"
        title="Live Pose Coach"
        subtitle="33-point MediaPipe body tracking & movement angle telemetry"
        showBack
        onBack={() => router.back()}
        rightAction={<BetaBadge />}
      />

      <ScreenScrollView contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl * 2 }}>
        <SquircleSurface radius={24} fill={colors.surface} style={[styles.card, { marginTop: spacing.sm }]}>
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
                style={[styles.actionBtn, { maxWidth: 54 }]}
              >
                <SquircleSurface radius={16} fill={colors.surface2} style={styles.btnSurface}>
                  <Ionicons name="camera-reverse-outline" size={20} color={colors.text.primary} />
                </SquircleSurface>
              </PressableScale>
            ) : null}
          </View>

          {/* Quick links to real health pose check */}
          <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
            <PressableScale
              onPress={() => router.push('/(app)/health/pose-check')}
              scaleTo={0.97}
            >
              <SquircleSurface radius={16} fill={colors.dockActive} style={styles.poseCheckLink}>
                <Ionicons name="fitness-outline" size={18} color={colors.dock} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.dock }]}>
                    Full Workout Rep Counter
                  </Text>
                  <Text style={[typography.caption, { color: colors.dock, opacity: 0.8 }]}>
                    Squats, pushups & jumping jacks with full-screen coach cues
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.dock} />
              </SquircleSurface>
            </PressableScale>
          </View>
        </SquircleSurface>
      </ScreenScrollView>
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
    marginBottom: 12,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cameraContainer: {
    height: 260,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  cameraPlaceholder: {
    alignItems: 'center',
    padding: 16,
  },
  telemetryGrid: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
  },
  telemetryItem: {
    flex: 1,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
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
  poseCheckLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
});
