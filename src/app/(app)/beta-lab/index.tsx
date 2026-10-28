import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge, BetaBadge } from '../../../components/ui/Badge';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { BETA_CAPABILITIES, type BetaCapability } from '../../../domain/health/metricRegistry';
import { hapticSelection } from '../../../services/haptics';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

interface StudioProduct {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badgeVariant?: 'gold' | 'beta' | 'success' | 'neutral';
}

const STUDIOS: StudioProduct[] = [
  {
    id: 'eye',
    title: 'Eye Tracking Studio',
    subtitle: 'Blink rate, EAR ratio, Harmon reading distance & Eye Battery',
    tag: 'BlinkQuest Tech',
    icon: 'eye-outline',
    route: '/(app)/beta-lab/eye-tracking',
    badgeVariant: 'gold',
  },
  {
    id: 'hand',
    title: 'Hand Gesture Studio',
    subtitle: '21-point tracking, grip rep counter & wrist mobility score',
    tag: 'Hand Mesh',
    icon: 'hand-left-outline',
    route: '/(app)/beta-lab/hand-gestures',
    badgeVariant: 'beta',
  },
  {
    id: 'assistant',
    title: 'Thrive Coach',
    subtitle: 'Ask, log water, check today and open any studio; answers are spoken',
    tag: 'On-device',
    icon: 'chatbubble-ellipses-outline',
    route: '/(app)/beta-lab/assistant',
    badgeVariant: 'gold',
  },
  {
    id: 'face',
    title: 'Face & Eye Exercises',
    subtitle: 'Brows, smile, jaw, eye squeeze and gaze drills counted by the coach',
    tag: 'Face Mesh',
    icon: 'happy-outline',
    route: '/(app)/beta-lab/face-exercises',
    badgeVariant: 'gold',
  },
  {
    id: 'body-style',
    title: 'Body & Style Companion',
    subtitle: 'Face shape and glasses, posture score, fit tips, outfit colours, BMI and meals',
    tag: 'Segmentation',
    icon: 'shirt-outline',
    route: '/(app)/beta-lab/body-style',
    badgeVariant: 'gold',
  },
  {
    id: 'eye-pursuit',
    title: 'Eye Pursuit',
    subtitle: 'Follow a gliding dot with your eyes; scored from iris tracking',
    tag: 'Eye Exercise',
    icon: 'radio-button-on-outline',
    route: '/(app)/beta-lab/eye-pursuit',
    badgeVariant: 'beta',
  },
  {
    id: 'finger-game',
    title: 'Hand Games',
    subtitle: 'Finger count and gesture match, called out by the coach',
    tag: 'Coach Game',
    icon: 'game-controller-outline',
    route: '/(app)/beta-lab/gesture-game',
    badgeVariant: 'gold',
  },
  {
    id: 'breathing',
    title: 'Breathing Coach',
    subtitle: 'Paced breathing patterns with spoken cues and session history',
    tag: 'Guided',
    icon: 'leaf-outline',
    route: '/(app)/beta-lab/breathing',
    badgeVariant: 'success',
  },
  {
    id: 'pose',
    title: 'Live Pose Coach',
    subtitle: '33-joint skeleton tracking, joint angle telemetry & form score',
    tag: 'Full Body',
    icon: 'body-outline',
    route: '/(app)/beta-lab/pose-coach',
    badgeVariant: 'beta',
  },
  {
    id: 'food',
    title: 'Food Lens AI Vision',
    subtitle: 'Live plate capture, culinary item classification & macro estimation',
    tag: 'Multimodal AI',
    icon: 'restaurant-outline',
    route: '/(app)/health/meal-log',
    badgeVariant: 'gold',
  },
  {
    id: 'voice',
    title: 'Spoken Coach Studio',
    subtitle: 'Priority audio cues, rep guidance & spoken exercise pacing',
    tag: 'expo-speech',
    icon: 'volume-high-outline',
    route: '/(app)/beta-lab/voice-coach',
    badgeVariant: 'success',
  },
  {
    id: 'blur',
    title: 'Native Motion Blur',
    subtitle: 'Velocity-driven AGSL runtime shaders & 60fps card animation',
    tag: 'AGSL Shaders',
    icon: 'sparkles-outline',
    route: '/(app)/beta-lab/motion-blur',
    badgeVariant: 'neutral',
  },
  {
    id: 'settings',
    title: 'Beta Flags & Engines',
    subtitle: 'Engine toggles, inference HUD overlay & global configuration',
    tag: 'Config',
    icon: 'options-outline',
    route: '/(app)/beta-lab/settings',
    badgeVariant: 'neutral',
  },
];

export default function BetaLabScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const { betaMode, setBetaMode } = useRootStore(
    useShallow((s) => ({
      betaMode: s.betaMode,
      setBetaMode: s.setBetaMode,
    })),
  );

  const tick = useCallback(() => {
    hapticSelection();
  }, []);

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow="HEALTH OS · EXPERIMENTAL"
        title="Beta Lab"
        subtitle="On-Device Vision, Gesture & Audio Studios"
        showBack
        onBack={() => router.back()}
        rightAction={<BetaBadge />}
      />

      <ScreenScrollView contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl * 2 }}>
        {/* Global Beta Mode Master Banner */}
        <SquircleSurface radius={24} fill={colors.surface} style={[styles.masterCard, { marginTop: spacing.sm }]}>
          <View style={styles.bannerHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <BetaBadge />
              <View style={{ flex: 1 }}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>
                  Global Beta Mode
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  {betaMode ? 'Active across Home, Health & Tools' : 'Off · Only stable flows exposed'}
                </Text>
              </View>
            </View>
            <Switch
              value={betaMode}
              onValueChange={(val) => {
                tick();
                setBetaMode(val);
              }}
              thumbColor={betaMode ? colors.dockActive : colors.text.muted}
            />
          </View>
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
            Enabling Global Beta Mode unlocks all 7 dedicated studios below and surfaces experimental telemetry throughout Thrivefold.
          </Text>
        </SquircleSurface>

        {/* Section Heading: Dedicated Product Studios */}
        <View style={[styles.sectionHeader, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          <Text style={[typography.captionBold, { color: colors.text.muted, letterSpacing: 1.2 }]}>
            DEDICATED BETA STUDIOS
          </Text>
          <Text style={[typography.caption, { color: colors.primary }]}>
            {STUDIOS.length} Separate Flows
          </Text>
        </View>

        {/* Studios Grid */}
        <View style={{ gap: 10 }}>
          {STUDIOS.map((studio) => (
            <PressableScale
              key={studio.id}
              onPress={() => {
                tick();
                router.push(studio.route as any);
              }}
              scaleTo={0.98}
              accessibilityRole="button"
              accessibilityLabel={`Open ${studio.title}`}
            >
              <SquircleSurface radius={20} fill={colors.surface} style={styles.studioCard}>
                <View style={[styles.iconCircle, { backgroundColor: colors.surface2 }]}>
                  <Ionicons name={studio.icon} size={22} color={colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                      {studio.title}
                    </Text>
                    <Badge label={studio.tag} variant={studio.badgeVariant ?? 'beta'} />
                  </View>
                  <Text style={[typography.caption, { color: colors.text.secondary }]} numberOfLines={2}>
                    {studio.subtitle}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
              </SquircleSurface>
            </PressableScale>
          ))}
        </View>

        {/* Capabilities Registry Section */}
        <View style={[styles.sectionHeader, { marginTop: spacing.xl, marginBottom: spacing.sm }]}>
          <Text style={[typography.captionBold, { color: colors.text.muted, letterSpacing: 1.2 }]}>
            HEALTH OS CAPABILITY REGISTRY
          </Text>
          <BetaBadge />
        </View>

        <View style={{ gap: 8 }}>
          {BETA_CAPABILITIES.map((cap) => (
            <SquircleSurface
              key={cap.id}
              radius={20}
              fill={colors.surface}
              style={[styles.capCard, { padding: spacing.md }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary, flex: 1 }]}>
                  {cap.title}
                </Text>
                <Badge
                  label={cap.status.toUpperCase()}
                  variant={
                    cap.status === 'working'
                      ? 'success'
                      : cap.status === 'beta'
                        ? 'beta'
                        : cap.status === 'research_only'
                          ? 'warning'
                          : 'neutral'
                  }
                />
              </View>

              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
                {cap.subtitle}
              </Text>

              <View style={{ marginTop: 8, backgroundColor: colors.surface2, padding: 8, borderRadius: 10 }}>
                <Text style={[typography.captionBold, { color: colors.primary, fontSize: 11 }]}>
                  STATUS: {cap.statusNote}
                </Text>
                {cap.modelsRequired ? (
                  <Text style={[typography.caption, { color: colors.text.muted, fontSize: 10, marginTop: 2 }]}>
                    Models: {cap.modelsRequired.join(', ')}
                  </Text>
                ) : null}
                <Text style={[typography.caption, { color: colors.text.muted, fontSize: 10, marginTop: 2 }]}>
                  Data Outputs: {cap.dataOutputs.join(' · ')}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                <PressableScale
                  onPress={() => {
                    tick();
                    router.push(cap.route as any);
                  }}
                  scaleTo={0.96}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${cap.title}`}
                >
                  <SquircleSurface radius={10} fill={colors.dockActive} style={{ paddingHorizontal: 14, paddingVertical: 6 }}>
                    <Text style={[typography.captionBold, { color: colors.dock }]}>
                      Open Dedicated Route
                    </Text>
                  </SquircleSurface>
                </PressableScale>
              </View>
            </SquircleSurface>
          ))}
        </View>
      </ScreenScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  masterCard: {
    padding: 18,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capCard: {
    padding: 16,
  },
});
