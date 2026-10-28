import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { BetaBadge } from '../../../components/ui/Badge';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { FoodCameraView, foodVisionAvailable } from '../../../../modules/pose-landmarker/food';
import { hapticSelection, hapticSuccess } from '../../../services/haptics';
import { useTheme } from '../../../theme/useTheme';

export default function FoodLensBetaScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const [active, setActive] = useState(false);
  const [detectedItem, setDetectedItem] = useState<{
    name: string;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);

  const tick = useCallback(() => {
    hapticSelection();
  }, []);

  const handleSimulateScan = () => {
    hapticSuccess();
    setDetectedItem({
      name: 'Dal Makhani & Brown Basmati Rice',
      kcal: 485,
      protein: 18,
      carbs: 68,
      fat: 14,
    });
  };

  const LiveCamera = FoodCameraView;
  const hasVision = foodVisionAvailable();

  return (
    <ScreenContainer>
      <AppHeader
        eyebrow="BETA LAB · MULTIMODAL AI"
        title="Food Lens AI Vision"
        subtitle="Live camera meal analysis, macro estimation & nutritional AI"
        showBack
        onBack={() => router.back()}
        rightAction={<BetaBadge />}
      />

      <ScreenScrollView contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl * 2 }}>
        <SquircleSurface radius={24} fill={colors.surface} style={[styles.card, { marginTop: spacing.sm }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
            <Text style={[typography.subheading, { color: colors.text.primary, flex: 1 }]}>
              Plate Scanner &amp; Macro Lens
            </Text>
            <SquircleSurface radius={8} fill={colors.primaryAlpha} style={styles.pill}>
              <Text style={[typography.captionBold, { color: colors.primary }]}>
                {hasVision ? 'Camera Ready' : 'Edge AI Ready'}
              </Text>
            </SquircleSurface>
          </View>

          {/* Camera Stage */}
          <View style={[styles.cameraBox, { backgroundColor: '#1A1E1C' }]}>
            {active && LiveCamera && hasVision ? (
              <LiveCamera style={StyleSheet.absoluteFill} active={active} />
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Ionicons name="camera-outline" size={44} color="#88998C" />
                <Text style={[typography.bodyBold, { color: '#EAF0EB', marginTop: 10 }]}>
                  {active ? 'Initializing Camera Pipeline...' : 'Food Camera Preview'}
                </Text>
                <Text style={[typography.caption, { color: '#A0B2A4', textAlign: 'center', marginTop: 4, maxWidth: 260 }]}>
                  Frame the plate within the lens to detect culinary items and compute macro balances
                </Text>
              </View>
            )}
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <PressableScale
              onPress={() => {
                tick();
                setActive((prev) => !prev);
              }}
              scaleTo={0.95}
              style={{ flex: 1 }}
            >
              <SquircleSurface
                radius={16}
                fill={active ? colors.error : colors.primary}
                style={styles.btnSurface}
              >
                <Ionicons name={active ? 'stop-outline' : 'videocam-outline'} size={18} color="#FFFFFF" />
                <Text style={[typography.bodyBold, { color: '#FFFFFF' }]}>
                  {active ? 'Stop Camera' : 'Start Camera'}
                </Text>
              </SquircleSurface>
            </PressableScale>

            <PressableScale
              onPress={handleSimulateScan}
              scaleTo={0.95}
              style={{ flex: 1 }}
            >
              <SquircleSurface
                radius={16}
                fill={colors.dockActive}
                style={styles.btnSurface}
              >
                <Ionicons name="scan-outline" size={18} color={colors.dock} />
                <Text style={[typography.bodyBold, { color: colors.dock }]}>
                  Analyze Plate
                </Text>
              </SquircleSurface>
            </PressableScale>
          </View>

          {/* Detected Nutrition Card */}
          {detectedItem ? (
            <SquircleSurface radius={20} fill={colors.surface2} style={styles.nutritionCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                  {detectedItem.name}
                </Text>
                <Text style={[typography.heading, { color: colors.primary, fontSize: 20 }]}>
                  {detectedItem.kcal} <Text style={[typography.caption, { color: colors.text.muted }]}>kcal</Text>
                </Text>
              </View>

              <View style={styles.macrosRow}>
                <View style={styles.macroPill}>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Protein</Text>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    {detectedItem.protein}g
                  </Text>
                </View>
                <View style={styles.macroPill}>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Carbs</Text>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    {detectedItem.carbs}g
                  </Text>
                </View>
                <View style={styles.macroPill}>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Fat</Text>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>
                    {detectedItem.fat}g
                  </Text>
                </View>
              </View>

              <PressableScale
                onPress={() => router.push('/(app)/health/meal-log')}
                scaleTo={0.97}
                style={{ marginTop: 12 }}
              >
                <SquircleSurface radius={14} fill={colors.primary} style={styles.logBtn}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                  <Text style={[typography.bodyBold, { color: '#FFFFFF' }]}>
                    Log to Daily Meals
                  </Text>
                </SquircleSurface>
              </PressableScale>
            </SquircleSurface>
          ) : null}

          {/* Notice */}
          <View style={styles.noticeBox}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.text.muted} />
            <Text style={[typography.caption, { color: colors.text.muted, flex: 1 }]}>
              Food photos are processed on-device and transiently evaluated via Google Gemini. Images are never retained or trained on.
            </Text>
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
  cameraBox: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cameraPlaceholder: {
    alignItems: 'center',
    padding: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  btnSurface: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nutritionCard: {
    padding: 16,
    marginBottom: 12,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  macroPill: {
    flex: 1,
    backgroundColor: '#00000008',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  logBtn: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  noticeBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginTop: 8,
  },
});
