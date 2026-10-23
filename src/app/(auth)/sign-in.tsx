import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { newLocalId } from '../../stores/slices/authSlice';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';

const { width: SCREEN_W } = Dimensions.get('window');

const INTRO_SLIDES = [
  {
    id: 'cycle',
    badge: 'BIOLOGY & HORMONES',
    title: 'Private Cycle & Natural Rhythm',
    subtitle:
      'Local-first cycle tracking without cloud surveillance. Aligned to your biological phases.',
    image: require('../../../assets/illustrations/intro-cycle.jpg'),
    icon: 'leaf' as const,
    iconColor: '#5E826D',
    iconBg: 'rgba(94, 130, 109, 0.14)',
  },
  {
    id: 'quests',
    badge: 'VERIFIED MILESTONES',
    title: 'Verified Daily Health Quests',
    subtitle:
      'Meaningful wellness routines, athletic conditioning, and streaks that prove real progress.',
    image: require('../../../assets/illustrations/intro-quests.jpg'),
    icon: 'trophy' as const,
    iconColor: '#B85D3E',
    iconBg: 'rgba(184, 93, 62, 0.12)',
  },
  {
    id: 'letters',
    badge: 'SLOW CORRESPONDENCE',
    title: 'Reflective Letters & Wax Seals',
    subtitle:
      'Mindful timestamped personal reflections sealed with collectible artisanal wax stamps.',
    image: require('../../../assets/illustrations/intro-letters.jpg'),
    icon: 'mail' as const,
    iconColor: '#C47D33',
    iconBg: 'rgba(196, 125, 51, 0.14)',
  },
  {
    id: 'vault',
    badge: '100% PRIVATE & ON-DEVICE',
    title: 'On-Device Memory Vault',
    subtitle:
      'Zero-knowledge AI coaching stored encrypted on your device. Zero trackers, zero cloud selling.',
    image: require('../../../assets/illustrations/intro-vault.jpg'),
    icon: 'shield-checkmark' as const,
    iconColor: '#5E826D',
    iconBg: 'rgba(94, 130, 109, 0.14)',
  },
];

const PROMISES = [
  { icon: 'phone-portrait-outline' as const, text: 'Health records stay on this device' },
  { icon: 'eye-off-outline' as const, text: 'Nothing is shared or sold' },
  { icon: 'trash-outline' as const, text: 'Export or erase any time in Settings' },
];

const AUTO_SLIDE_INTERVAL = 4000;

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useTheme();
  const setUser = useRootStore((s) => s.setUser);
  const continueAsGuest = useRootStore((s) => s.continueAsGuest);
  const [activeSlide, setActiveSlide] = useState(0);
  const [pseudonym, setPseudonym] = useState('');
  const [showForm, setShowForm] = useState(false);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  const name = pseudonym.trim();
  const tooLong = name.length > 24;

  // Auto-advancing intro slides
  useEffect(() => {
    autoSlideRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % INTRO_SLIDES.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, []);

  const handleDotPress = useCallback((idx: number) => {
    setActiveSlide(idx);
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % INTRO_SLIDES.length);
      }, AUTO_SLIDE_INTERVAL);
    }
  }, []);

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
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.hero}>
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
            Small, steady routines for your health
          </Text>
        </Animated.View>

        {/* Auto-sliding Intro Card */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)}>
          <View style={[styles.slideCard, { backgroundColor: colors.surface, borderColor: colors.borderStrong, marginTop: spacing.lg }]}>
            {/* Slide Hero Illustration */}
            <View style={styles.slideImageContainer}>
              <Image
                source={currentSlide.image}
                style={styles.slideImage}
                contentFit="cover"
                transition={200}
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
              <View style={[styles.slideIconBox, { backgroundColor: currentSlide.iconBg }]}>
                <Ionicons name={currentSlide.icon} size={20} color={currentSlide.iconColor} />
              </View>
              <View style={[styles.badgePill, { backgroundColor: currentSlide.iconBg, marginLeft: 10 }]}>
                <Text style={[typography.captionBold, { color: currentSlide.iconColor, fontSize: 10, letterSpacing: 0.5 }]}>
                  {currentSlide.badge}
                </Text>
              </View>
            </View>
            <Text style={[typography.heading, { color: colors.text.primary, marginTop: spacing.sm, fontSize: 18 }]}>
              {currentSlide.title}
            </Text>
            <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4, lineHeight: 20 }]}>
              {currentSlide.subtitle}
            </Text>

            {/* Animated Dots */}
            <View style={styles.dotsRow}>
              {INTRO_SLIDES.map((slide, idx) => (
                <Pressable
                  key={slide.id}
                  onPress={() => handleDotPress(idx)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Slide ${idx + 1} of ${INTRO_SLIDES.length}`}
                  accessibilityState={{ selected: idx === activeSlide }}
                >
                  <PaginationDot
                    active={idx === activeSlide}
                    activeColor={colors.primary}
                    idleColor={colors.surface2}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* CTA Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={{ marginTop: spacing.lg }}>
          {!showForm ? (
            <>
              <Button
                label="Get Started"
                size="lg"
                onPress={() => setShowForm(true)}
                style={{ marginBottom: spacing.sm }}
              />
              <Button
                label="Continue as Guest"
                variant="ghost"
                onPress={guest}
              />
            </>
          ) : (
            <Animated.View entering={FadeIn.duration(300)}>
              <TextField
                label="What should we call you?"
                placeholder="A first name or nickname (e.g. Alex)"
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
                Optional. No email or password needed.
              </Text>
              <Button
                label="Enter Sanctuary"
                size="lg"
                onPress={createProfile}
                disabled={tooLong}
                style={{ marginTop: spacing.md }}
              />
              <Button
                label="Back"
                variant="ghost"
                onPress={() => setShowForm(false)}
                style={{ marginTop: spacing.xs }}
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* On-device Promises */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)}>
          <View
            style={[
              styles.promise,
              { backgroundColor: colors.surface, borderColor: colors.borderStrong, marginTop: spacing.lg },
            ]}
          >
            {PROMISES.map((row) => (
              <View key={row.text} style={styles.promiseRow}>
                <Ionicons name={row.icon} size={16} color={colors.primary} />
                <Text style={[typography.caption, styles.promiseText, { color: colors.text.secondary }]}>
                  {row.text}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

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
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  markImage: { height: 72, width: 72 },
  slideCard: {
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  slideImageContainer: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3EFEA',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
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
    gap: 8,
    padding: 14,
  },
  promiseRow: { alignItems: 'center', flexDirection: 'row' },
  promiseText: { flex: 1, marginLeft: 8 },
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center' },
});

/** One intro pagination dot; widens when its slide is showing. */
function PaginationDot({ active, activeColor, idleColor }: { active: boolean; activeColor: string; idleColor: string }) {
  const width = useSharedValue(active ? 24 : 8);
  useEffect(() => {
    width.value = withSpring(active ? 24 : 8, { damping: 15, stiffness: 150 });
  }, [active, width]);
  const animatedStyle = useAnimatedStyle(() => ({ width: width.value }));
  return <Animated.View style={[styles.dot, { backgroundColor: active ? activeColor : idleColor }, animatedStyle]} />;
}
