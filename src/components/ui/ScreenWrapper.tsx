import React from 'react';
import { View, StyleSheet, StatusBar, ViewStyle, StyleProp } from 'react-native';
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
import { SanctuaryHeader, SanctuaryLargeTitle, Header } from './Header';

export interface ScreenWrapperProps {
  children?: React.ReactNode;
  /** Pinned or custom header node (Neev architecture) */
  header?: React.ReactNode;
  /** Enable scroll view with scroll-aware dock hide. Default: false */
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Disable scroll-aware dock hide (e.g. for screens without tabs). Default: false */
  disableScrollAwareDock?: boolean;
  /** Optional header title */
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  useLargeTitle?: boolean;
  footer?: React.ReactNode;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  header,
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
  footer,
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

  const hasTitleHeader = Boolean(title || showBack || rightAction);

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

  const renderedHeader = header ? (
    <View style={[styles.pinnedHeaderContainer, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {header}
    </View>
  ) : hasTitleHeader ? (
    <SanctuaryHeader
      title={title ?? ''}
      subtitle={subtitle}
      eyebrow={eyebrow}
      showBack={showBack}
      rightAction={rightAction}
      scrollY={scrollY}
    />
  ) : null;

  const headerPresent = Boolean(renderedHeader);

  return (
    <View style={[styles.wrapper, containerStyle, style]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {renderedHeader}

      {scrollable ? (
        <Animated.ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: headerPresent ? 8 : insets.top + 8,
              paddingBottom: tabBarInset + (footer ? 80 : 0),
            },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={!disableScrollAwareDock ? scrollProps.onScroll : onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
        >
          {hasTitleHeader && useLargeTitle && title ? (
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
              paddingTop: headerPresent ? 8 : insets.top + 8,
              paddingBottom: tabBarInset + (footer ? 80 : 0),
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </View>
      )}

      {footer ? (
        <View
          style={[
            styles.footerWrapper,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
};

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
  pinnedHeaderContainer: {
    width: '100%',
    zIndex: 10,
  },
  footerWrapper: {
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'absolute',
    right: 0,
    zIndex: 20,
  },
});

export default ScreenWrapper;
