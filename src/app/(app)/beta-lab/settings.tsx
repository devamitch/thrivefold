import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { BetaBadge } from '../../../components/ui/Badge';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { useBetaSettings, type PoseEngineOption } from '../../../features/beta-lab/flags/betaFlags';
import { hapticSelection } from '../../../services/haptics';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

export default function BetaSettingsScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { betaMode, setBetaMode } = useRootStore(
    useShallow((s) => ({
      betaMode: s.betaMode,
      setBetaMode: s.setBetaMode,
    })),
  );
  const { settings, updateSetting, resetSettings } = useBetaSettings();

  const tick = useCallback(() => {
    hapticSelection();
  }, []);

  const toggleEngine = useCallback(
    (eng: PoseEngineOption) => {
      tick();
      updateSetting('poseEngine', eng);
    },
    [tick, updateSetting],
  );

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="BETA LAB · ARCHITECTURE"
          title="Beta Flags & Engines"
          subtitle="Manage on-device inference delegates, runtime shaders & Global Beta Mode"
          showBack
          onBack={() => router.back()}
          rightAction={<BetaBadge />}
        />
      }
    >
      {/* Global Beta Mode Master Switch */}
      <SquircleSurface radius={24} fill={colors.surface} style={[styles.card, { marginTop: spacing.sm }]}>
        <View style={styles.cardHeader}>
          <BetaBadge />
          <Text style={[typography.subheading, { color: colors.text.primary, flex: 1 }]}>Global Beta Mode</Text>
          <Switch
            value={betaMode}
            onValueChange={(val) => {
              tick();
              setBetaMode(val);
            }}
            thumbColor={betaMode ? colors.dockActive : colors.text.muted}
          />
        </View>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
          When enabled, unlocks all experimental studios, live telemetry, and Beta Lab entry points across Home and
          Health sections.
        </Text>
      </SquircleSurface>

      {/* Pose Engine Options */}
      <SquircleSurface radius={24} fill={colors.surface} style={[styles.card, { marginTop: spacing.md }]}>
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
          Pose Detection Engine
        </Text>

        <View style={{ gap: 10 }}>
          {(['default', 'experimental'] as PoseEngineOption[]).map((eng) => (
            <PressableScale key={eng} onPress={() => toggleEngine(eng)} scaleTo={0.98}>
              <SquircleSurface
                radius={16}
                fill={settings.poseEngine === eng ? colors.dockActive : colors.surface2}
                style={styles.engineCard}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      typography.bodyBold,
                      {
                        color: settings.poseEngine === eng ? colors.dock : colors.text.primary,
                      },
                    ]}
                  >
                    {eng === 'default' ? 'MediaPipe Tasks Native' : 'Experimental JS Shader Pipeline'}
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: settings.poseEngine === eng ? colors.dock : colors.text.secondary,
                        opacity: 0.8,
                      },
                    ]}
                  >
                    {eng === 'default'
                      ? 'Hardware-accelerated NPU/GPU delegate via C++ runtime'
                      : 'Pure software fallback with lightweight angle tracking'}
                  </Text>
                </View>
                {settings.poseEngine === eng ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.dock} />
                ) : null}
              </SquircleSurface>
            </PressableScale>
          ))}
        </View>
      </SquircleSurface>

      {/* Runtime Switches */}
      <SquircleSurface radius={24} fill={colors.surface} style={[styles.card, { marginTop: spacing.md }]}>
        <Text style={[typography.subheading, { color: colors.text.primary, marginBottom: 12 }]}>
          Display &amp; Debug Flags
        </Text>

        <View style={styles.switchRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Live Diagnostics HUD</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              Displays real-time frame rates and inference diagnostics
            </Text>
          </View>
          <Switch
            value={settings.showDiagnostics}
            onValueChange={(val) => {
              tick();
              updateSetting('showDiagnostics', val);
            }}
            thumbColor={settings.showDiagnostics ? colors.dockActive : colors.text.muted}
          />
        </View>

        <View style={[styles.switchRow, { marginTop: 12 }]}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Native Motion Blur</Text>
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              Enables AGSL directional velocity shaders for card animations
            </Text>
          </View>
          <Switch
            value={settings.motionBlurEnabled}
            onValueChange={(val) => {
              tick();
              updateSetting('motionBlurEnabled', val);
            }}
            thumbColor={settings.motionBlurEnabled ? colors.dockActive : colors.text.muted}
          />
        </View>
      </SquircleSurface>

      {/* Reset Button */}
      <PressableScale
        onPress={() => {
          tick();
          resetSettings();
        }}
        scaleTo={0.96}
        style={{ marginTop: spacing.xl }}
      >
        <SquircleSurface radius={16} fill={colors.surface2} style={styles.resetBtn}>
          <Ionicons name="refresh-outline" size={18} color={colors.text.secondary} />
          <Text style={[typography.bodyBold, { color: colors.text.secondary }]}>Reset Beta Settings to Default</Text>
        </SquircleSurface>
      </PressableScale>
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
  },
  engineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resetBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
