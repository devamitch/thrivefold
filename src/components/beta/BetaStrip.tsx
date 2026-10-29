import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useBetaEnabled } from '../../hooks/useBetaEnabled';
import { useTheme } from '../../theme/useTheme';
import { getSanctuaryIllustration, type SanctuaryIllustrationKey } from '../../utils/illustrationResolver';
import { PressableScale } from '../ui/PressableScale';

const TILES: { title: string; sub: string; route: string; art: SanctuaryIllustrationKey }[] = [
  { title: 'Thrive Coach', sub: 'Talk or type', route: '/(app)/beta-lab/assistant', art: 'coachAssistant' },
  { title: 'Eye game', sub: 'Look left, right, blink', route: '/(app)/beta-lab/eye-games', art: 'eyePursuit' },
  { title: 'Eye studio', sub: 'Blinks, distance', route: '/(app)/beta-lab/eye-tracking', art: 'eyeVision' },
  { title: 'Face & eyes', sub: 'Coached moves', route: '/(app)/beta-lab/face-exercises', art: 'faceExercises' },
  { title: 'Voice', sub: 'Hold, steady, clear', route: '/(app)/beta-lab/voice-practice', art: 'voicePractice' },
  { title: 'Body & style', sub: 'Glasses, posture', route: '/(app)/beta-lab/body-style', art: 'bodyStyle' },
  { title: 'Hand games', sub: 'Fingers, gestures', route: '/(app)/beta-lab/gesture-game', art: 'handGames' },
  { title: 'Breathing', sub: 'Paced, spoken', route: '/(app)/beta-lab/breathing', art: 'breathing' },
  { title: 'Pose coach', sub: 'Reps and form', route: '/(app)/health/pose-check', art: 'poseCoach' },
];

// Brass/gold for premium beta surfaces (matches the BETA badge).
const GOLD_A = '#C9A46A';
const GOLD_B = '#8A622A';

/** Premium beta studios on Home: one gold header and a row of picture tiles. Hidden when Beta is off. */
export function BetaStrip({ practiceLine }: { practiceLine: string }) {
  const enabled = useBetaEnabled();
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  if (!enabled) return null;

  return (
    <View style={{ marginTop: spacing.lg }}>
      <PressableScale onPress={() => router.push('/(app)/beta-lab' as Href)} accessibilityLabel="Open Beta Lab">
        <LinearGradient colors={[GOLD_A, GOLD_B]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <Ionicons name="bulb" size={18} color="#FFF8EC" />
          <View style={styles.flex}>
            <Text style={[typography.bodyBold, styles.light]}>Beta studios</Text>
            <Text style={[typography.caption, styles.lightDim]} numberOfLines={1}>
              {practiceLine}
            </Text>
          </View>
          <Text style={[typography.captionBold, styles.light]}>All</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFF8EC" />
        </LinearGradient>
      </PressableScale>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TILES.map((t) => (
          <PressableScale key={t.route} onPress={() => router.push(t.route as Href)} accessibilityLabel={`${t.title}, ${t.sub}`} style={[styles.tile, { backgroundColor: colors.surface, borderColor: 'rgba(201,164,106,0.45)' }]}>
            <Image source={getSanctuaryIllustration(t.art, experience)} style={styles.art} contentFit="cover" />
            <View style={styles.tileText}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]} numberOfLines={1}>
                {t.title}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]} numberOfLines={1}>
                {t.sub}
              </Text>
            </View>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  light: { color: '#FFF8EC' },
  lightDim: { color: 'rgba(255,248,236,0.85)' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18 },
  row: { gap: 10, paddingTop: 10, paddingRight: 4 },
  tile: { width: 148, borderRadius: 18, overflow: 'hidden', borderWidth: 1 },
  art: { width: '100%', height: 92 },
  tileText: { padding: 10 },
});
