import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated as RNAnimated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../theme/useTheme';
import { useRootStore } from '../../stores/useRootStore';

const EXPERIENCES = [
  {
    id: 'women',
    label: "Women's Health",
    emoji: '🌸',
    desc: 'Cycle, hormones, energy & care',
    gradient: ['#FDE8D8', '#FAD4C0'] as [string, string],
    accentBg: '#FAF0EA',
    accent: '#B45309',
  },
  {
    id: 'men',
    label: "Men's Vitality",
    emoji: '🌊',
    desc: 'Mobility, focus & daily strength',
    gradient: ['#DDF0F2', '#C6E8EC'] as [string, string],
    accentBg: '#EAF5F6',
    accent: '#1A4F5C',
  },
  {
    id: 'pride',
    label: 'Pride & Wellbeing',
    emoji: '🏳️‍🌈',
    desc: 'Affirming, private self-care',
    gradient: ['#FFF4E0', '#FDE8C8'] as [string, string],
    accentBg: '#FFF9F0',
    accent: '#B45309',
  },
] as const;

export default function SignInScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const setUser = useRootStore((s) => s.setUser);

  const [pseudonym, setPseudonym] = useState('');
  const [selectedExp, setSelectedExp] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setUser({
      id: `user_${Date.now()}`,
      pseudonym: pseudonym.trim() || 'SolsticeSeeker',
      avatarSeed: 'seed_01',
      age: null,
      isAgeVerified: false,
      ageBand: null,
      createdAt: new Date().toISOString(),
    });
    router.replace('/(app)/(tabs)');
  };

  const handleGuest = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    useRootStore.getState().continueAsGuest();
    router.replace('/(app)/(tabs)');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Hero */}
        <View style={styles.hero}>
          <View style={[styles.logoRing, { borderColor: `${colors.primary}30` }]}>
            <Image
              source={require('../../../assets/brand/app-icon.png')}
              style={styles.logoImg}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
          <Text style={[typography.heading, styles.heroTitle, { color: colors.text.primary }]}>
            Thrivefold
          </Text>
          <Text style={[typography.subbody, styles.heroSub, { color: colors.text.secondary }]}>
            Personal wellbeing that adapts to you
          </Text>
        </View>

        {/* Experience Selector */}
        <View style={[styles.section, { paddingHorizontal: spacing.base }]}>
          <Text style={[typography.label, { color: colors.text.muted, marginBottom: spacing.sm }]}>
            Choose your experience
          </Text>
          {EXPERIENCES.map((exp, idx) => {
            const active = selectedExp === idx;
            return (
              <Pressable
                key={exp.id}
                onPress={() => setSelectedExp(idx)}
                style={({ pressed }) => [
                  styles.expCard,
                  {
                    backgroundColor: active ? exp.accentBg : colors.surface,
                    borderColor: active ? exp.accent : colors.border,
                    borderWidth: active ? 2 : 1,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
              >
                <LinearGradient
                  colors={active ? exp.gradient : ['transparent', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.expEmoji}>{exp.emoji}</Text>
                <View style={styles.expText}>
                  <Text
                    style={[
                      typography.bodyBold,
                      { color: active ? exp.accent : colors.text.primary },
                    ]}
                  >
                    {exp.label}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    {exp.desc}
                  </Text>
                </View>
                {active && (
                  <Ionicons name="checkmark-circle" size={22} color={exp.accent} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Sign In Form */}
        <View style={[styles.section, { paddingHorizontal: spacing.base }]}>
          <Card style={styles.formCard}>
            <Text
              style={[
                typography.subheading,
                { color: colors.text.primary, marginBottom: spacing.xs },
              ]}
            >
              Create your private space
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.text.secondary, marginBottom: spacing.md },
              ]}
            >
              No real name required. Use a pseudonym — your identity stays private.
            </Text>

            <TextField
              placeholder="Choose a display name..."
              value={pseudonym}
              onChangeText={setPseudonym}
              containerStyle={{ marginBottom: spacing.md }}
              leftIcon={
                <Ionicons name="person-outline" size={18} color={colors.text.muted} />
              }
            />

            <Button
              label={isLoading ? 'Entering...' : 'Begin My Journey'}
              onPress={handleSignIn}
              disabled={isLoading}
            />

            <View style={[styles.divider, { marginVertical: spacing.md }]}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[typography.caption, { color: colors.text.muted, marginHorizontal: 12 }]}>
                or
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Button
              label="Continue as Guest"
              variant="outline"
              onPress={handleGuest}
              disabled={isLoading}
            />
          </Card>
        </View>

        {/* Privacy Note */}
        <View style={[styles.section, { paddingHorizontal: spacing.base }]}>
          <View
            style={[
              styles.privacyNote,
              { backgroundColor: colors.surface1, borderColor: colors.border },
            ]}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
            <Text
              style={[
                typography.caption,
                { color: colors.text.secondary, flex: 1, marginLeft: 8 },
              ]}
            >
              Local-first data. Health logs stay on your device. No cloud upload without your
              explicit consent.
            </Text>
          </View>
        </View>

        {/* New Account Link */}
        <View style={styles.footerLinks}>
          <Pressable onPress={() => router.push('/(auth)/sign-up')}>
            <Text style={[typography.caption, { color: colors.primary }]}>
              Create full account →
            </Text>
          </Pressable>
          <Text style={[typography.caption, { color: colors.text.muted }]}>  ·  </Text>
          <Pressable onPress={() => router.push('/(public)/legal/terms')}>
            <Text style={[typography.caption, { color: colors.text.muted }]}>Terms</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoRing: {
    width: 84,
    height: 84,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  logoImg: {
    width: 76,
    height: 76,
    borderRadius: 22,
  },
  heroTitle: {
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSub: {
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 32,
  },
  section: {
    marginBottom: 20,
  },
  expCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  expEmoji: {
    fontSize: 26,
    marginRight: 12,
  },
  expText: {
    flex: 1,
    gap: 2,
  },
  formCard: {
    padding: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 4,
  },
});
