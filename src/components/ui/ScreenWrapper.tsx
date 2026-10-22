import React from 'react';
import { View, StyleSheet, StatusBar, ViewStyle, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import {
  useScrollAwareTabBar,
  useTabBarInset,
} from '../navigation/CustomTabBar';

interface ScreenWrapperProps {
  children: React.ReactNode;
  /** Enable scroll view with scroll-aware dock hide. Default: false */
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  /** Disable scroll-aware dock hide (e.g. for screens without tabs). Default: false */
  disableScrollAwareDock?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  disableScrollAwareDock = false,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const tabBarInset = useTabBarInset();
  const scrollProps = useScrollAwareTabBar();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: insets.top,
    paddingLeft: insets.left,
    paddingRight: insets.right,
    // Don't apply bottom safeArea; content scrolls under the dock
  };

  return (
    <View style={[styles.wrapper, containerStyle, style]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: tabBarInset },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          {...(!disableScrollAwareDock ? scrollProps : {})}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { paddingBottom: tabBarInset }, contentContainerStyle]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
