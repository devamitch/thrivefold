import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { Link, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import MenHealthScreen from './men/index';
import PrideHealthScreen from './pride/index';

export default function HealthIndexScreen() {
  const { colors, typography, spacing, experience } = useTheme();

  if (experience === 'men_health') {
    return <MenHealthScreen />;
  }

  if (experience === 'pride_wellbeing') {
    return <PrideHealthScreen />;
  }

  // Default: women's health hub
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
            Your body, your records
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, lineHeight: 18 }]}>
            Cycle, symptoms, sleep and movement in one place. Everything stays on this phone.
          </Text>
        </Card>

        <Link href={'/(app)/health/cycle' as Href} asChild>
          <Card
            style={{ marginTop: spacing.sm, padding: spacing.base }}
          >
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.iconWrap, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="water-outline" size={20} color={colors.primary} />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>Cycle calendar</Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    Log periods and see estimated phases and next dates
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </View>
          </Card>
        </Link>

        <Link href={'/(app)/health/symptoms' as Href} asChild>
          <Card
            style={{ marginTop: spacing.sm, padding: spacing.base }}
          >
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.iconWrap, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="pulse-outline" size={20} color={colors.accent} />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>Symptoms</Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    Cramps, headaches, mood and anything else you notice
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </View>
          </Card>
        </Link>

        <Link href={'/(app)/health/sleep' as Href} asChild>
          <Card
            style={{ marginTop: spacing.sm, padding: spacing.base }}
          >
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.iconWrap, { backgroundColor: colors.surface1 }]}>
                  <Ionicons name="moon-outline" size={20} color={colors.text.primary} />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>Sleep</Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    Hours, regularity and a wind-down routine
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </View>
          </Card>
        </Link>

        <Link href={'/(app)/health/pelvic-floor' as Href} asChild>
          <Card
            style={{ marginTop: spacing.sm, padding: spacing.base }}
          >
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.iconWrap, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="fitness-outline" size={20} color={colors.primary} />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>Pelvic floor and core</Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    Guided squeeze-and-relax sets with a timer
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </View>
          </Card>
        </Link>

        <Link href={'/(app)/health/integrations' as Href} asChild>
          <Card
            style={{ marginTop: spacing.sm, padding: spacing.base }}
          >
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.iconWrap, { backgroundColor: colors.surface1 }]}>
                  <Ionicons name="link-outline" size={20} color={colors.text.primary} />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={[typography.subheading, { color: colors.text.primary }]}>Connected apps</Text>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                    Health Connect, heart-rate straps, FHIR export
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </View>
          </Card>
        </Link>
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
