/**
 * First-run intro slider (same interaction model as Neev and BlinkQuest).
 *
 * - Paged horizontal swipe; artwork lags the finger (parallax + scale), copy leads it.
 * - Pagination dots stretch and recolour with the swipe and can be tapped.
 * - "Skip" fades out and "Continue" cross-fades into "Get started" on the last slide.
 * - Android back steps to the previous slide before leaving the screen.
 * - Reduced motion: parallax and scale are off, fades remain.
 * - No worklet callbacks into JS: the exit fade is a timing animation plus a JS timer.
 */
import { Image } from 'expo-image';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '../ui/PressableScale';
import { useTheme } from '../../theme/useTheme';

interface IntroSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

const SLIDES: readonly IntroSlide[] = [
  {
    id: 'health',
    eyebrow: 'Yours, on your phone',
    title: 'Your health, kept close',
    description: 'Check-ins, sleep, cycle and symptoms are encrypted on this device. Nothing leaves it unless you choose.',
    image: require('../../../assets/illustrations/intro-cycle.jpg'),
  },
  {
    id: 'quests',
    eyebrow: 'Gentle daily quests',
    title: 'Small steps that fit your day',
    description: 'Quests follow your pace, your limits and the time of day. A hard day makes them lighter, never heavier.',
    image: require('../../../assets/illustrations/intro-quests.jpg'),
  },
  {
    id: 'coach',
    eyebrow: 'Camera coach',
    title: 'Move with a coach beside you',
    description: 'Follow a tutorial while your camera checks your form on the phone, and earn ten times the points for good form.',
    image: require('../../../assets/illustrations/workout-strength.jpg'),
  },
  {
    id: 'memory',
    eyebrow: 'Patterns, privately',
    title: 'See what helps you',
    description: 'How sleep, stress and energy connect for you, worked out on this phone. No ads, no selling, no guessing about you.',
    image: require('../../../assets/illustrations/intro-vault.jpg'),
  },
];

const LAST = SLIDES.length - 1;
const EXIT_MS = 240;
const DOT = 8;
const DOT_ACTIVE = 24;
const CTA_HEIGHT = 56;
const clampIndex = (i: number) => Math.max(0, Math.min(LAST, i));

export function IntroSlider({ onFinish }: { onFinish: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const { colors, typography, isDark } = useTheme();

  const scrollRef = useRef<ScrollView>(null);
  const activeRef = useRef(0);
  const finishedRef = useRef(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFinishRef = useRef(onFinish);

  const [active, setActive] = useState(0);
  const [pagerHeight, setPagerHeight] = useState(0);

  const scrollX = useSharedValue(0);
  const rootOpacity = useSharedValue(1);

  const isLast = active === LAST;
  const side = Math.max(24, insets.left, insets.right);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
      cancelAnimation(scrollX);
      cancelAnimation(rootOpacity);
    },
    [scrollX, rootOpacity],
  );

  // Stay on the current slide after rotation or split-screen resize.
  useEffect(() => {
    const x = activeRef.current * width;
    scrollRef.current?.scrollTo({ x, y: 0, animated: false });
    scrollX.value = x;
  }, [width, scrollX]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    rootOpacity.value = withTiming(0, { duration: EXIT_MS, easing: Easing.in(Easing.cubic) });
    exitTimer.current = setTimeout(() => onFinishRef.current(), EXIT_MS + 20);
  }, [rootOpacity]);

  const goTo = useCallback(
    (index: number) => {
      const next = clampIndex(index);
      activeRef.current = next;
      setActive(next);
      scrollRef.current?.scrollTo({ x: next * width, y: 0, animated: true });
    },
    [width],
  );

  const next = useCallback(() => {
    if (activeRef.current >= LAST) finish();
    else goTo(activeRef.current + 1);
  }, [finish, goTo]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (finishedRef.current) return true;
      if (activeRef.current > 0) {
        goTo(activeRef.current - 1);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [goTo]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const settle = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = clampIndex(Math.round(e.nativeEvent.contentOffset.x / Math.max(width, 1)));
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
      }
    },
    [width],
  );

  const rootStyle = useAnimatedStyle(() => ({ opacity: rootOpacity.value }));
  const fadeOnLast = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, [(LAST - 1) * width, LAST * width], [1, 0], Extrapolation.CLAMP),
  }));
  const fadeInLast = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, [(LAST - 1) * width, LAST * width], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <Animated.View style={[styles.root, rootStyle]}>
        <View style={[styles.header, { paddingTop: insets.top + 12, paddingHorizontal: side }]}>
          <Image
            source={require('../../../assets/brand/Minimalist-Terracotta-T-and-Leaf-Emblem.png')}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Thrivefold"
          />
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>Thrivefold</Text>
        </View>

        <Animated.ScrollView
          ref={scrollRef as never}
          horizontal
          pagingEnabled
          bounces={false}
          overScrollMode="never"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          onMomentumScrollEnd={settle}
          onScrollEndDrag={settle}
          onLayout={(e) => {
            const h = Math.round(e.nativeEvent.layout.height);
            setPagerHeight((prev) => (prev === h ? prev : h));
          }}
          style={styles.pager}
        >
          {SLIDES.map((slide, index) => (
            <SlidePage
              key={slide.id}
              slide={slide}
              index={index}
              width={width}
              height={pagerHeight}
              side={side}
              scrollX={scrollX}
              motion={reducedMotion ? 0 : 1}
              compact={height < 720}
            />
          ))}
        </Animated.ScrollView>

        <View style={{ paddingHorizontal: side, paddingBottom: insets.bottom + 16, paddingTop: 8 }}>
          <View style={styles.footerRow}>
            <View style={styles.dots} accessibilityRole="tablist">
              {SLIDES.map((slide, index) => (
                <Dot key={slide.id} index={index} width={width} scrollX={scrollX} selected={index === active} onPress={goTo} />
              ))}
            </View>
            <Animated.View style={fadeOnLast} pointerEvents={isLast ? 'none' : 'auto'}>
              <PressableScale
                onPress={finish}
                hitSlop={12}
                scaleTo={0.94}
                accessibilityRole="button"
                accessibilityLabel="Skip introduction"
                style={styles.skip}
              >
                <Text style={[typography.subbody, { color: colors.text.secondary }]}>Skip</Text>
              </PressableScale>
            </Animated.View>
          </View>

          <PressableScale
            onPress={next}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel={isLast ? 'Get started' : 'Continue'}
          >
            <View style={[styles.cta, { backgroundColor: colors.primary }]}>
              <Animated.View style={[styles.ctaLabel, fadeOnLast]}>
                <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>Continue</Text>
              </Animated.View>
              <Animated.View style={[styles.ctaLabel, fadeInLast]}>
                <Text style={[typography.bodyBold, { color: colors.onPrimary }]}>Get started</Text>
              </Animated.View>
            </View>
          </PressableScale>
        </View>
      </Animated.View>
    </View>
  );
}

interface SlidePageProps {
  slide: IntroSlide;
  index: number;
  width: number;
  height: number;
  side: number;
  scrollX: SharedValue<number>;
  /** 1 = parallax and scale; 0 = reduced motion (fades only). */
  motion: number;
  compact: boolean;
}

const SlidePage = memo(function SlidePage({ slide, index, width, height, side, scrollX, motion, compact }: SlidePageProps) {
  const { colors, typography } = useTheme();

  const artStyle = useAnimatedStyle(() => {
    const p = (scrollX.value - index * width) / Math.max(width, 1);
    const edge = 1 - 0.08 * motion;
    return {
      opacity: interpolate(p, [-1, 0, 1], [0, 1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: p * width * 0.26 * motion },
        { scale: interpolate(p, [-1, 0, 1], [edge, 1, edge], Extrapolation.CLAMP) },
      ],
    };
  });

  const copyStyle = useAnimatedStyle(() => {
    const p = (scrollX.value - index * width) / Math.max(width, 1);
    return {
      opacity: interpolate(p, [-0.6, 0, 0.6], [0, 1, 0], Extrapolation.CLAMP),
      transform: [{ translateX: -p * width * 0.1 * motion }],
    };
  });

  return (
    <View
      style={[styles.page, { width, height: height || undefined, paddingHorizontal: side }]}
      accessible
      accessibilityLabel={`${slide.title}. ${slide.description}`}
    >
      <Animated.View style={[styles.art, artStyle]}>
        <BreathingAura index={index} motion={motion} />
        <View style={[styles.artCard, { backgroundColor: colors.surface1 }]}>
          <Image source={slide.image} style={styles.artImage} contentFit="cover" priority="high" transition={0} accessible={false} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.copy, copyStyle]}>
        <Text style={[typography.label, styles.eyebrow, { color: colors.accentText }]} maxFontSizeMultiplier={1.2}>
          {slide.eyebrow}
        </Text>
        <Text
          style={[typography.display, { color: colors.text.primary }, compact && styles.titleCompact]}
          accessibilityRole="header"
          maxFontSizeMultiplier={1.2}
        >
          {slide.title}
        </Text>
        <Text style={[typography.body, { color: colors.text.secondary, marginTop: 10, maxWidth: 440 }]} maxFontSizeMultiplier={1.25}>
          {slide.description}
        </Text>
      </Animated.View>
    </View>
  );
});

const BREATH_MS = 4800;

/** A soft, slowly breathing halo behind each slide's artwork; tint differs per slide. */
function BreathingAura({ index, motion }: { index: number; motion: number }) {
  const { colors } = useTheme();
  const tints = [colors.primaryAlpha, colors.successSurface, colors.infoSurface, colors.warningSurface];
  const breath = useSharedValue(0);
  useEffect(() => {
    if (!motion) return;
    breath.value = withRepeat(withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(breath);
  }, [breath, motion]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.75 + 0.25 * breath.value,
    transform: [{ scale: 0.94 + 0.1 * breath.value }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.aura, { backgroundColor: tints[index % tints.length] }, style]}
    />
  );
}

function Dot({
  index,
  width,
  scrollX,
  selected,
  onPress,
}: {
  index: number;
  width: number;
  scrollX: SharedValue<number>;
  selected: boolean;
  onPress: (i: number) => void;
}) {
  const { colors } = useTheme();
  const idle = colors.surface2;
  const activeColor = colors.primary;
  const style = useAnimatedStyle(() => {
    const f = interpolate(scrollX.value, [(index - 1) * width, index * width, (index + 1) * width], [0, 1, 0], Extrapolation.CLAMP);
    return {
      width: DOT + (DOT_ACTIVE - DOT) * f,
      backgroundColor: interpolateColor(f, [0, 1], [idle, activeColor]),
    };
  });
  return (
    <PressableScale
      onPress={() => onPress(index)}
      hitSlop={{ top: 14, bottom: 14, left: 5, right: 5 }}
      accessibilityRole="tab"
      accessibilityLabel={`Slide ${index + 1} of ${SLIDES.length}`}
      accessibilityState={{ selected }}
      scaleTo={0.9}
    >
      <Animated.View style={[styles.dot, style]} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingBottom: 4 },
  logo: { width: 28, height: 28, borderRadius: 6 },
  pager: { flex: 1 },
  page: { paddingTop: 8 },
  art: { flex: 1, minHeight: 120, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  aura: { position: 'absolute', width: '92%', aspectRatio: 1, maxHeight: '100%', borderRadius: 999 },
  artCard: { aspectRatio: 1, height: '86%', maxWidth: '86%', borderRadius: 40, borderCurve: 'continuous', overflow: 'hidden' },
  artImage: { width: '100%', height: '100%' },
  copy: { paddingTop: 16, paddingBottom: 12 },
  eyebrow: { letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  titleCompact: { fontSize: 27, lineHeight: 33 },
  footerRow: { minHeight: 44, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { height: DOT, borderRadius: DOT / 2 },
  skip: { paddingVertical: 10, paddingLeft: 16 },
  cta: { height: CTA_HEIGHT, borderRadius: 18, borderCurve: 'continuous', overflow: 'hidden' },
  ctaLabel: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
