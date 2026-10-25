import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter, type Href } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRootStore, useShallow } from '../../stores/useRootStore';
import { DRAWER_SECTIONS } from '../../navigation/drawerItems';
import { drawerProgress, drawerWidthFor } from './drawerProgress';
import { useTheme } from '../../theme/useTheme';
import { Badge } from '../ui/Badge';

export function AppDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, typography, spacing, experience } = useTheme();

  const { open, setOpen, socialOpen, user, level, currentStreak } = useRootStore(
    useShallow((s) => ({
      open: s.drawerOpen,
      setOpen: s.setDrawerOpen,
      socialOpen: s.isSocialPathRevealed,
      user: s.user,
      level: s.level,
      currentStreak: s.currentStreak,
    })),
  );

  const drawerWidth = drawerWidthFor(width);
  // Driven by DrawerSceneWrapper (state changes and drags), so panel and screen stay in step.
  const progress = drawerProgress;

  const animatedDrawerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 0.25, 1],
      [0, 0.6, 1],
      Extrapolation.CLAMP,
    );
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [-36, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  const go = (route: string) => {
    setOpen(false);
    router.push(route as Href);
  };

  const sections = DRAWER_SECTIONS.map((sec) => ({
    ...sec,
    items: sec.items.filter(
      (it) =>
        (!it.only || it.only.includes(experience)) &&
        (!it.social || socialOpen) &&
        (!it.minLevel || level >= it.minLevel),
    ),
  })).filter((sec) => sec.items.length > 0);

  const experienceLabel =
    experience === 'women_health'
      ? "Women's health"
      : experience === 'men_health'
        ? "Men's health"
        : 'LGBTQ+ wellbeing';

  return (
    <View
      style={[
        styles.drawerContainer,
        {
          width: drawerWidth,
          backgroundColor: colors.surface1,
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + spacing.sm,
        },
      ]}
      pointerEvents={open ? 'auto' : 'none'}
    >
      <Animated.View style={[styles.innerAnimated, animatedDrawerStyle]}>
        {/* Profile Header */}
        <Pressable
          onPress={() => go('/(app)/(tabs)/settings')}
          style={[styles.profileHeader, { paddingHorizontal: spacing.base }]}
          accessibilityRole="button"
          accessibilityLabel="Open settings and profile"
        >
          <View style={[styles.avatarCircle, { backgroundColor: colors.primaryAlpha }]}>
            <Ionicons
              name={
                experience === 'men_health'
                  ? 'shield-outline'
                  : experience === 'women_health'
                    ? 'flower-outline'
                    : 'heart-outline'
              }
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              style={[typography.heading, { color: colors.text.primary, fontSize: 18 }]}
              numberOfLines={1}
            >
              {user?.pseudonym || 'Thrivefold Friend'}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 1 }]}>
              {experienceLabel}
            </Text>
            <View style={styles.badgeRow}>
              <Badge label={`Lvl ${level}`} variant="primary" />
              <Badge
                label={`${currentStreak}d Streak`}
                variant="neutral"
                style={{ marginLeft: 6 }}
              />
            </View>
          </View>
        </Pressable>

        {/* Navigation Sections */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
        >
          {sections.map((sec) => (
            <View key={sec.title} style={{ marginTop: spacing.md }}>
              <Text
                style={[typography.label, { color: colors.text.muted, paddingHorizontal: spacing.base, marginBottom: 4 }]}
              >
                {sec.title}
              </Text>
              {sec.items.map((it) => {
                const active =
                  pathname === it.route.replace(/\/\([^)]+\)/g, '') ||
                  pathname === it.route;
                return (
                  <Pressable
                    key={it.route}
                    onPress={() => go(it.route)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.item,
                      {
                        marginHorizontal: spacing.sm,
                        paddingHorizontal: spacing.sm,
                        borderRadius: 14,
                        backgroundColor: active ? colors.primaryAlpha : 'transparent',
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <View style={styles.itemIcon}>
                      <Ionicons
                        name={it.icon}
                        size={19}
                        color={active ? colors.primary : colors.text.secondary}
                      />
                    </View>
                    <Text
                      style={[
                        active ? typography.bodyBold : typography.body,
                        {
                          color: active ? colors.primary : colors.text.primary,
                          marginLeft: 12,
                          flex: 1,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {it.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>

        {/* Footer Quick Controls */}
        <View
          style={[
            styles.footerRow,
            {
              paddingHorizontal: spacing.base,
              paddingTop: spacing.sm,
            },
          ]}
        >
          <Pressable
            onPress={() => go('/(app)/(tabs)/settings')}
            style={[styles.footerBtn, { backgroundColor: colors.surface2 }]}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={18} color={colors.text.primary} />
            <Text style={[typography.captionBold, { color: colors.text.primary, marginLeft: 6 }]}>
              Settings
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setOpen(false)}
            style={[styles.closeBtn, { backgroundColor: colors.surface2 }]}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          >
            <Ionicons name="close" size={18} color={colors.text.primary} />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
  },
  innerAnimated: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44,
    paddingVertical: 4,
  },
  itemIcon: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
