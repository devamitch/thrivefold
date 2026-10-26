import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';
import { PressableScale } from './PressableScale';

export interface TabItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export interface AnimatedTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  const { colors, typography } = useTheme();
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  const tabWidth = useSharedValue(0);
  const indicatorTranslateX = useSharedValue(0);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const totalWidth = e.nativeEvent.layout.width - 8; // 4px padding each side
    const singleTabWidth = totalWidth / Math.max(1, tabs.length);
    tabWidth.value = singleTabWidth;
    indicatorTranslateX.value = safeIndex * singleTabWidth;
  };

  useEffect(() => {
    if (tabWidth.value > 0) {
      indicatorTranslateX.value = withTiming(safeIndex * tabWidth.value, {
        duration: 220,
        easing: Easing.bezier(0.2, 0.9, 0.25, 1),
      });
    }
  }, [safeIndex, tabWidth, indicatorTranslateX]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      width: tabWidth.value,
      transform: [{ translateX: indicatorTranslateX.value }],
    };
  });

  return (
    <View
      onLayout={onContainerLayout}
      style={[styles.container, { backgroundColor: colors.surface1 }]}
    >
      {/* Reanimated Interpolated Sliding Indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: colors.surface,
          },
          animatedIndicatorStyle,
        ]}
      />

      {/* Tabs Row */}
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <PressableScale
            key={tab.id}
            onPress={() => {
              if (tab.id !== activeTab) {
                try {
                  Haptics.selectionAsync();
                } catch {}
                onTabChange(tab.id);
              }
            }}
            scaleTo={0.96}
            style={styles.tabBtn}
            accessibilityRole="button"
            accessibilityLabel={`${tab.label} tab`}
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={tab.icon}
              size={14}
              color={isActive ? colors.primary : colors.text.secondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                typography.captionBold,
                {
                  color: isActive ? colors.primary : colors.text.secondary,
                  fontSize: 12,
                },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    position: 'relative',
    height: 44,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    zIndex: 1,
  },
});
