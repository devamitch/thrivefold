import { SquircleSurface } from './SquircleSurface';
import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import {
  HEADER_BAR_HEIGHT,
  HEADER_BUTTON_SIZE,
  HeaderBackButton,
  HeaderLargeTitle,
  type AppHeaderProps,
} from './AppHeader';

const clamp = Extrapolation.CLAMP;

/** Where content starts below the status bar for a given header. */
export function headerContentTop(props: AppHeaderProps, statusInset: number): number {
  const hasControls = Boolean(props.showBack || props.rightAction);
  return statusInset + HEADER_BAR_HEIGHT + (hasControls ? 6 : 4);
}

export function useCollapsingHeader(scrollY: SharedValue<number>) {
  const titleHeight = useSharedValue(64);
  const progress = useDerivedValue(() => {
    const h = Math.max(titleHeight.value, 40);
    return interpolate(scrollY.value, [h * 0.25, h * 0.85], [0, 1], clamp);
  });
  return { titleHeight, progress };
}

/**
 * Large title rendered directly in the scroll view content.
 * Has generous room, never truncated on first view, fades smoothly on scroll.
 */
export function CollapsingLargeTitle({
  props,
  scrollY,
  titleHeight,
}: {
  props: AppHeaderProps;
  scrollY: SharedValue<number>;
  titleHeight?: SharedValue<number>;
}) {
  const onLayout = (e: LayoutChangeEvent) => {
    if (titleHeight) {
      titleHeight.value = e.nativeEvent.layout.height;
    }
  };

  const style = useAnimatedStyle(() => {
    const y = scrollY.value;
    return {
      opacity: interpolate(y, [0, 48], [1, 0], clamp),
      transform: [
        { translateY: interpolate(y, [0, 48], [0, -10], clamp) },
        { scale: interpolate(y, [-140, 0], [1.07, 1], clamp) },
      ],
    };
  });

  return (
    <Animated.View style={[styles.largeTitleWrapper, style]}>
      <View onLayout={onLayout}>
        <HeaderLargeTitle eyebrow={props.eyebrow} title={props.title} subtitle={props.subtitle} />
      </View>
    </Animated.View>
  );
}

export function CollapsingHeaderBar({
  props,
  progress,
  scrollY,
  statusInset,
  gutter,
}: {
  props: AppHeaderProps;
  progress: SharedValue<number>;
  scrollY?: SharedValue<number>;
  statusInset: number;
  gutter: number;
}) {
  const { colors, typography } = useTheme();
  const [rightWidth, setRightWidth] = useState(props.rightAction ? HEADER_BUTTON_SIZE : 0);

  // Top bar background: pristine flat surface with solid background opacity on scroll
  const barBg = useAnimatedStyle(() => {
    if (scrollY) {
      return { opacity: interpolate(scrollY.value, [0, 36], [0, 1], clamp) };
    }
    return { opacity: 1 };
  });

  // Compact title fades in on scroll
  const smallTitleStyle = useAnimatedStyle(() => {
    if (scrollY) {
      return {
        opacity: interpolate(scrollY.value, [28, 56], [0, 1], clamp),
        transform: [{ translateY: interpolate(scrollY.value, [28, 56], [6, 0], clamp) }],
      };
    }
    return {
      opacity: progress.value,
      transform: [{ translateY: (1 - progress.value) * 6 }],
    };
  });

  const hasLeft = Boolean(props.showBack);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.bar,
        {
          height: HEADER_BAR_HEIGHT + statusInset,
          paddingTop: statusInset,
        },
      ]}
    >
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, barBg]}>
        {/* Solid, square bar: scrolled content never shows through or behind rounded corners. */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
        <View style={[styles.hairline, { backgroundColor: colors.borderStrong }]} />
      </Animated.View>

      {/* Toolbar row with height locked to HEADER_BAR_HEIGHT */}
      <View style={[styles.toolbar, { paddingHorizontal: gutter }]} pointerEvents="box-none">
        {hasLeft ? (
          <View style={styles.leftAction} pointerEvents="box-none">
            <HeaderBackButton />
          </View>
        ) : (
          <View style={styles.zeroWidth} />
        )}

        {/* Compact center title that appears when scrolled */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.smallTitle,
            { left: gutter + (hasLeft ? HEADER_BUTTON_SIZE + 12 : 0), right: rightWidth + gutter + 8 },
            smallTitleStyle,
          ]}
        >
          <Text
            style={[
              typography.subheading,
              { color: colors.text.primary, textAlign: 'left' },
              props.titleStyle,
            ]}
            numberOfLines={1}
          >
            {props.title}
          </Text>
        </Animated.View>

        {props.rightAction ? (
          <View
            style={styles.right}
            onLayout={(e) => setRightWidth(Math.round(e.nativeEvent.layout.width))}
            pointerEvents="box-none"
          >
            {props.rightAction}
          </View>
        ) : (
          <View style={styles.zeroWidth} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100,
  },
  hairline: {
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  largeTitleWrapper: {
    marginBottom: 8,
    width: '100%',
  },
  leftAction: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: HEADER_BUTTON_SIZE,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: HEADER_BUTTON_SIZE,
  },
  smallTitle: {
    alignItems: 'flex-start',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: HEADER_BAR_HEIGHT,
    justifyContent: 'space-between',
    width: '100%',
  },
  zeroWidth: {
    width: 0,
  },
});
