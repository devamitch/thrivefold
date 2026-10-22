import React from 'react';
import { View, StyleSheet, StatusBar, ViewStyle, ScrollView, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import {
  useScrollAwareTabBar,
  useTabBarInset,
} from '../navigation/CustomTabBar';
import { SanctuaryHeader, SanctuaryLargeTitle } from './Header';

export interface ScreenWrapperProps {
  children?: React.ReactNode;
  /** Enable scroll view with scroll-aware dock hide. Default: false */
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Disable scroll-aware dock hide (e.g. for screens without tabs). Default: false */
  disableScrollAwareDock?: boolean;
  /** Optional large title for Neev Apple Large Title header architecture */
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  useLargeTitle?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  disableScrollAwareDock = false,
  title,
  subtitle,
  eyebrow,
  showBack = false,
  rightAction,
  useLargeTitle = false,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const tabBarInset = useTabBarInset();
  const scrollProps = useScrollAwareTabBar();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const hasHeader = Boolean(title || showBack || rightAction);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingLeft: insets.left,
    paddingRight: insets.right,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderWidth: 0,
  };

  return (
    <View style={[styles.wrapper, containerStyle, style]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {hasHeader && !useLargeTitle ? (
        <SanctuaryHeader
          title={title ?? ''}
          subtitle={subtitle}
          eyebrow={eyebrow}
          showBack={showBack}
          rightAction={rightAction}
          scrollY={scrollY}
        />
      ) : null}

      {hasHeader && useLargeTitle ? (
        <SanctuaryHeader
          title={title ?? ''}
          eyebrow={eyebrow}
          showBack={showBack}
          rightAction={rightAction}
          scrollY={scrollY}
        />
      ) : null}

      {scrollable ? (
        <Animated.ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: hasHeader ? 0 : insets.top,
              paddingBottom: tabBarInset,
            },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={!disableScrollAwareDock ? scrollProps.onScroll : onScroll}
          scrollEventThrottle={16}
        >
          {hasHeader && useLargeTitle && title ? (
            <SanctuaryLargeTitle
              title={title}
              subtitle={subtitle}
              eyebrow={eyebrow}
              rightAction={rightAction}
            />
          ) : null}
          {children}
        </Animated.ScrollView>
      ) : (
        <View
          style={[
            styles.content,
            {
              paddingTop: hasHeader ? 0 : insets.top,
              paddingBottom: tabBarInset,
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
};

export const ScreenContainer = ScreenWrapper;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderWidth: 0,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});

export default ScreenWrapper;
