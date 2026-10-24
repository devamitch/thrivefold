import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter, type Href } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRootStore, useShallow } from '../../stores/useRootStore';
import { DRAWER_SECTIONS } from '../../navigation/drawerItems';
import { useTheme } from '../../theme/useTheme';

const WIDTH_RATIO = 0.82;

export function AppDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const { colors, typography, spacing, experience } = useTheme();
  const { open, setOpen, socialOpen, name } = useRootStore(
    useShallow((s) => ({
      open: s.drawerOpen,
      setOpen: s.setDrawerOpen,
      socialOpen: s.isSocialPathRevealed,
      name: s.user?.pseudonym,
    })),
  );
  const panelWidth = Math.min(360, width * WIDTH_RATIO);
  const x = useSharedValue(-panelWidth);

  useEffect(() => {
    x.value = reduceMotion ? (open ? 0 : -panelWidth) : withTiming(open ? 0 : -panelWidth, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [open, panelWidth, reduceMotion, x]);

  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setOpen(false);
      return true;
    });
    return () => sub.remove();
  }, [open, setOpen]);

  const panel = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const scrim = useAnimatedStyle(() => ({ opacity: (1 + x.value / panelWidth) * 1 }));

  const go = (route: string) => {
    setOpen(false);
    router.push(route as Href);
  };

  const sections = DRAWER_SECTIONS.map((sec) => ({
    ...sec,
    items: sec.items.filter((it) => (!it.only || it.only.includes(experience)) && (!it.social || socialOpen)),
  })).filter((sec) => sec.items.length > 0);

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, scrim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Close menu" />
      </Animated.View>
      <Animated.View
        style={[styles.panel, { width: panelWidth, backgroundColor: colors.background, paddingTop: insets.top + spacing.sm }, panel]}
        accessibilityViewIsModal
      >
        <View style={[styles.head, { paddingHorizontal: spacing.base }]}>
          <View style={styles.flex}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>{name && name !== 'Guest' ? name : 'Thrivefold'}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {experience === 'women_health' ? "Women's health" : experience === 'men_health' ? "Men's health" : 'LGBTQ+ wellbeing'}
            </Text>
          </View>
          <Pressable onPress={() => setOpen(false)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close menu">
            <Ionicons name="close" size={22} color={colors.text.primary} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}>
          {sections.map((sec) => (
            <View key={sec.title} style={{ marginTop: spacing.md }}>
              <Text style={[typography.captionBold, { color: colors.text.muted, paddingHorizontal: spacing.base, marginBottom: 4 }]}>
                {sec.title.toUpperCase()}
              </Text>
              {sec.items.map((it) => {
                const active = pathname === it.route.replace(/\/\([^)]+\)/g, '') || pathname === it.route;
                return (
                  <Pressable
                    key={it.route}
                    onPress={() => go(it.route)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.item,
                      { paddingHorizontal: spacing.base, backgroundColor: active ? colors.primaryAlpha : pressed ? colors.surface1 : 'transparent' },
                    ]}
                  >
                    <Ionicons name={it.icon} size={20} color={active ? colors.primary : colors.text.secondary} />
                    <Text style={[typography.body, { color: active ? colors.primary : colors.text.primary, marginLeft: 14 }]}>{it.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { alignItems: 'center', flexDirection: 'row', paddingBottom: 8 },
  item: { alignItems: 'center', flexDirection: 'row', minHeight: 48 },
  panel: { bottom: 0, left: 0, position: 'absolute', top: 0 },
});
