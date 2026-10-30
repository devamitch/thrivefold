import { Image, type ImageProps } from 'expo-image';
import React, { memo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { PressableScale } from '../ui/PressableScale';

export type LettermarkCategoryKey =
  | 'womens-health'
  | 'mens-health'
  | 'pride-wellbeing'
  | 'adhd-support'
  | 'mind-mood'
  | 'fitness'
  | 'nutrition'
  | 'sleep'
  | 'community'
  | 'letters'
  | 'local-ai'
  | 'growth-quests';

export interface LettermarkMeta {
  letter: string;
  name: string;
  bgColor: string;
  fgColor: string;
  category: string;
  source: ImageProps['source'];
}

export const LETTERMARK_MAP: Record<LettermarkCategoryKey, LettermarkMeta> = {
  'womens-health': {
    letter: 'W',
    name: "Women's Health",
    bgColor: '#C86D51', // Terracotta
    fgColor: '#FFFFFF',
    category: 'womens_health',
    source: require('../../../assets/icons/categories/womens-health.png'),
  },
  'mens-health': {
    letter: 'M',
    name: "Men's Health",
    bgColor: '#7E9A82', // Pista / Sage green
    fgColor: '#FFFFFF',
    category: 'men_health',
    source: require('../../../assets/icons/categories/mens-health.png'),
  },
  'pride-wellbeing': {
    letter: 'P',
    name: 'Pride Wellbeing',
    bgColor: '#F7F4EE', // Warm Bone
    fgColor: '#1E2322',
    category: 'pride_wellbeing',
    source: require('../../../assets/icons/categories/pride-wellbeing.png'),
  },
  'adhd-support': {
    letter: 'A',
    name: 'ADHD Support',
    bgColor: '#1E2322', // Charcoal slate
    fgColor: '#FFFFFF',
    category: 'adhd_support',
    source: require('../../../assets/icons/categories/adhd-support.png'),
  },
  'mind-mood': {
    letter: 'M',
    name: 'Mind & Mood',
    bgColor: '#F7F4EE', // Warm Bone
    fgColor: '#1E2322',
    category: 'mind_mood',
    source: require('../../../assets/icons/categories/mind-mood.png'),
  },
  fitness: {
    letter: 'F',
    name: 'Fitness',
    bgColor: '#1E2322', // Charcoal slate
    fgColor: '#FFFFFF',
    category: 'fitness',
    source: require('../../../assets/icons/categories/fitness.png'),
  },
  nutrition: {
    letter: 'N',
    name: 'Nutrition',
    bgColor: '#C86D51', // Terracotta
    fgColor: '#FFFFFF',
    category: 'nutrition',
    source: require('../../../assets/icons/categories/nutrition.png'),
  },
  sleep: {
    letter: 'S',
    name: 'Sleep',
    bgColor: '#7E9A82', // Pista / Sage green
    fgColor: '#FFFFFF',
    category: 'sleep',
    source: require('../../../assets/icons/categories/sleep.png'),
  },
  community: {
    letter: 'C',
    name: 'Community',
    bgColor: '#7E9A82', // Pista / Sage green
    fgColor: '#FFFFFF',
    category: 'community',
    source: require('../../../assets/icons/categories/community.png'),
  },
  letters: {
    letter: 'L',
    name: 'Letters',
    bgColor: '#F7F4EE', // Warm Bone
    fgColor: '#1E2322',
    category: 'letters',
    source: require('../../../assets/icons/categories/letters.png'),
  },
  'local-ai': {
    letter: 'A',
    name: 'Local AI',
    bgColor: '#1E2322', // Charcoal slate
    fgColor: '#FFFFFF',
    category: 'local_ai',
    source: require('../../../assets/icons/categories/local-ai.png'),
  },
  'growth-quests': {
    letter: 'G',
    name: 'Growth & Quests',
    bgColor: '#C86D51', // Terracotta
    fgColor: '#FFFFFF',
    category: 'growth_quests',
    source: require('../../../assets/icons/categories/growth-quests.png'),
  },
};

const SIZE_PRESETS = {
  xs: 32,
  sm: 42,
  md: 52,
  lg: 64,
  xl: 80,
  xxl: 104,
};

export interface LettermarkIconProps {
  id: LettermarkCategoryKey;
  size?: keyof typeof SIZE_PRESETS | number;
  showLabel?: boolean;
  labelPosition?: 'bottom' | 'right';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const LettermarkIcon = memo(function LettermarkIcon({
  id,
  size = 'md',
  showLabel = false,
  labelPosition = 'bottom',
  onPress,
  style,
}: LettermarkIconProps) {
  const meta = LETTERMARK_MAP[id] ?? LETTERMARK_MAP['womens-health'];
  const pixelSize = typeof size === 'number' ? size : (SIZE_PRESETS[size] ?? 52);
  const radius = Math.round(pixelSize * 0.28); // Continuous squircle proportion

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withTiming(0.94, { duration: 90, easing: Easing.out(Easing.cubic) });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withTiming(1, { duration: 130, easing: Easing.out(Easing.cubic) });
    }
  };

  const iconElement = (
    <Animated.View style={animatedStyle}>
      <View
        style={[
          styles.squircleContainer,
          {
            width: pixelSize,
            height: pixelSize,
            borderRadius: radius,
          },
          style,
        ]}
      >
        <Image
          source={meta.source}
          style={{ width: pixelSize, height: pixelSize, borderRadius: radius }}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
          accessibilityLabel={`${meta.name} (${meta.letter}) icon`}
        />
      </View>
    </Animated.View>
  );

  if (!showLabel) {
    if (onPress) {
      return (
        <PressableScale
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={meta.name}
        >
          {iconElement}
        </PressableScale>
      );
    }
    return iconElement;
  }

  const isRow = labelPosition === 'right';

  return (
    <PressableScale
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      style={[isRow ? styles.rowWrapper : styles.colWrapper, { opacity: 1 }]}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={meta.name}
    >
      {iconElement}
      <Text
        style={[
          styles.label,
          isRow ? styles.rowLabel : styles.colLabel,
          { fontSize: Math.max(11, Math.round(pixelSize * 0.22)) },
        ]}
        numberOfLines={2}
      >
        {meta.name}
      </Text>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  squircleContainer: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  colWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontWeight: '600',
    color: '#1C2421',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  colLabel: {
    maxWidth: 90,
  },
  rowLabel: {
    textAlign: 'left',
  },
});
