import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore } from '../../../stores/useRootStore';
import MenHealthScreen from './men/index';
import PrideHealthScreen from './pride/index';

export default function HealthIndexScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();

  if (experience === 'men_health') {
    return <MenHealthScreen />;
  }

  if (experience === 'pride_wellbeing') {
    return <PrideHealthScreen />;
  }

  // Default: Women's Health Hub (Harmony Bloom inspired)
  return (
    <ScreenWrapper scrollable>
      <Header title="Health" subtitle="Everything you track, in one place" showBack />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.base,
          paddingBottom: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Card style={{ marginTop: spacing.md, padding: 14, backgroundColor: colors.surface }}>
          <View style={styles.heroWrap}>
            <Image
              source={require('../../../../assets/illustrations/health-holistic.jpg')}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 12 }]}>
            Holistic Daily Harmony
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, lineHeight: 18 }]}>
            Biological rhythm synchronization, hormonal cycle phases, and gentle natural wellness tracking.
          </Text>
        </Card>

        <Card
          onPress={() => router.push('/(app)/health/cycle')}
          style={{ marginTop: spacing.sm, padding: spacing.base }}
        >
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primaryAlpha }]}>
                <Ionicons name="water-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>Cycle & Follicular Calendar</Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Track phases, predicted windows, and hormonal rhythm
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card
          onPress={() => router.push('/(app)/health/symptoms')}
          style={{ marginTop: spacing.sm, padding: spacing.base }}
        >
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primaryAlpha }]}>
                <Ionicons name="pulse-outline" size={20} color={colors.accent} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>Symptom Logging</Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Energy, cramps, mood shifts, and physical cues
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card
          onPress={() => router.push('/(app)/health/sleep')}
          style={{ marginTop: spacing.sm, padding: spacing.base }}
        >
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.iconWrap, { backgroundColor: colors.surface1 }]}>
                <Ionicons name="moon-outline" size={20} color={colors.text.primary} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>Sleep & Rest</Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Sleep consistency, resting readiness, bedtime routines
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>

        <Card
          onPress={() => router.push('/(app)/health/pelvic-floor')}
          style={{ marginTop: spacing.sm, padding: spacing.base }}
        >
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primaryAlpha }]}>
                <Ionicons name="fitness-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>Pelvic Floor & Core</Text>
                <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                  Gentle strengthening, relaxation, and guidance
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWrap: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3EFEA',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
});
