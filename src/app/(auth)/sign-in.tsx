import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { newLocalId } from '../../stores/slices/authSlice';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

const INTRO_SLIDES = [
  {
    id: 'privacy',
    badge: '100% PRIVATE & ON-DEVICE',
    title: 'Your Private Health Sanctuary',
    subtitle:
      'Zero trackers. Zero cloud selling. Every cycle note, physical log, and wellness habit stays encrypted right on your phone.',
    icon: 'shield-checkmark' as const,
    iconColor: '#B85D3E',
    iconBg: 'rgba(184, 93, 62, 0.12)',
  },
  {
    id: 'biology',
    badge: 'PHASE & BIOLOGY AWARE',
    title: 'Rhythms Aligned to Your Body',
    subtitle:
      'Hormonal cycle & follicular insights for women; posture, structural mobility, stamina, and athletic recovery for men.',
    icon: 'leaf' as const,
    iconColor: '#5E826D',
    iconBg: 'rgba(94, 130, 109, 0.14)',
  },
  {
    id: 'habits',
    badge: 'VERIFIED RITUALS & GAMES',
    title: 'Habits That Feel Like Play',
    subtitle:
      'Somatic breathwork, decompression flows, and daily quests verified with honest self-declaration, streak milestones, and XP progression.',
    icon: 'trophy' as const,
    iconColor: '#C47D33',
    iconBg: 'rgba(196, 125, 51, 0.14)',
  },
];

const PROMISES = [
  { icon: 'phone-portrait-outline' as const, text: 'Your health records stay on this device.' },
  { icon: 'eye-off-outline' as const, text: 'Nothing about your health is shared or sold.' },
  { icon: 'trash-outline' as const, text: 'Export or erase everything any time in Settings.' },
];

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const setUser = useRootStore((s) => s.setUser);
  const continueAsGuest = useRootStore((s) => s.continueAsGuest);
  const [activeSlide, setActiveSlide] = useState(0);
  const [pseudonym, setPseudonym] = useState('');

  const name = pseudonym.trim();
  const tooLong = name.length > 24;

  const createProfile = () => {
    if (tooLong) return;
    setUser({
      id: newLocalId('user'),
      pseudonym: name || 'Friend',
      avatarSeed: newLocalId('seed'),
      age: null,
      isAgeVerified: false,
      ageBand: null,
      createdAt: new Date().toISOString(),
    });
    router.replace('/');
  };

  const guest = () => {
    continueAsGuest();
    router.replace('/');
  };

  const link = (label: string, href: '/(public)/legal/terms' | '/(public)/legal/privacy' | '/(public)/legal/health-disclaimer') => (
    <Pressable onPress={() => router.push(href)} hitSlop={10} accessibilityRole="link">
      <Text style={[typography.caption, { color: colors.text.muted }]}>{label}</Text>
    </Pressable>
  );

  const currentSlide = INTRO_SLIDES[activeSlide];

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
            paddingHorizontal: spacing.lg,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.hero}>
          <View style={[styles.mark, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
            <Image
              source={require('../../../assets/brand/Minimalist-Terracotta-T-and-Leaf-Emblem.png')}
              style={styles.markImage}
              contentFit="contain"
              accessibilityIgnoresInvertColors
              accessible
              accessibilityLabel="Thrivefold"
            />
          </View>
          <Text
            style={[typography.display, styles.center, { color: colors.text.primary, marginTop: spacing.md }]}
            accessibilityRole="header"
          >
            Thrivefold
          </Text>
          <Text style={[typography.body, styles.center, { color: colors.text.secondary, marginTop: 4 }]}>
            Small, steady routines for your health — kept on your phone.
          </Text>
        </View>

        {/* Interactive Intro Walkthrough Card */}
        <View style={[styles.slideCard, { backgroundColor: colors.surface, borderColor: colors.borderStrong, marginTop: spacing.lg }]}>
          <View style={styles.slideHeader}>
            <View style={[styles.slideIconBox, { backgroundColor: currentSlide.iconBg }]}>
              <Ionicons name={currentSlide.icon} size={22} color={currentSlide.iconColor} />
            </View>
            <View style={[styles.badgePill, { backgroundColor: currentSlide.iconBg }]}>
              <Text style={[typography.captionBold, { color: currentSlide.iconColor, fontSize: 10, letterSpacing: 0.5 }]}>
                {currentSlide.badge}
              </Text>
            </View>
          </View>

          <Text style={[typography.heading, { color: colors.text.primary, marginTop: spacing.sm }]}>
            {currentSlide.title}
          </Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6, lineHeight: 20 }]}>
            {currentSlide.subtitle}
          </Text>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {INTRO_SLIDES.map((slide, idx) => {
              const isActive = idx === activeSlide;
              return (
                <Pressable
                  key={slide.id}
                  onPress={() => setActiveSlide(idx)}
                  hitSlop={8}
                  style={[
                    styles.dot,
                    {
                      width: isActive ? 24 : 8,
                      backgroundColor: isActive ? colors.primary : colors.surface2,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Slide ${idx + 1}`}
                />
              );
            })}
          </View>
        </View>

        {/* Profile Creation / Nickname */}
        <View style={{ marginTop: spacing.lg }}>
          <TextField
            label="What should we call you?"
            placeholder="A first name or nickname (e.g. Alex, Sam)"
            value={pseudonym}
            onChangeText={setPseudonym}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={createProfile}
            error={tooLong ? 'Keep it under 25 characters' : undefined}
            maxLength={40}
          />
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.xs }]}>
            Optional. No phone number, email or password needed.
          </Text>

          <Button
            label="Enter Sanctuary"
            size="lg"
            onPress={createProfile}
            disabled={tooLong}
            style={{ marginTop: spacing.md }}
          />
          <Button
            label="Continue as Guest Tester"
            variant="ghost"
            onPress={guest}
            style={{ marginTop: spacing.xs }}
          />
        </View>

        {/* On-device Promises */}
        <View
          style={[
            styles.promise,
            { backgroundColor: colors.surface, borderColor: colors.borderStrong, marginTop: spacing.lg },
          ]}
        >
          {PROMISES.map((row) => (
            <View key={row.text} style={styles.promiseRow}>
              <Ionicons name={row.icon} size={17} color={colors.primary} />
              <Text style={[typography.caption, styles.promiseText, { color: colors.text.secondary }]}>
                {row.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Legal Links */}
        <View style={[styles.links, { marginTop: spacing.md }]}>
          {link('Terms', '/(public)/legal/terms')}
          <Text style={[typography.caption, { color: colors.text.muted }]}>  ·  </Text>
          {link('Privacy', '/(public)/legal/privacy')}
          <Text style={[typography.caption, { color: colors.text.muted }]}>  ·  </Text>
          {link('Not medical advice', '/(public)/legal/health-disclaimer')}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  hero: { alignItems: 'center' },
  links: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  mark: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 28,
    borderWidth: 1,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  markImage: { height: 80, width: 80 },
  slideCard: {
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  slideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slideIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  promise: {
    borderCurve: 'continuous',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  promiseRow: { alignItems: 'center', flexDirection: 'row' },
  promiseText: { flex: 1, marginLeft: 8 },
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center' },
});
