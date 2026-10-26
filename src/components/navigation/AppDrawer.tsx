import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { usePathname, useRouter, type Href } from 'expo-router';
import React, { memo, useCallback, useMemo, type ReactNode, type RefObject } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

import { DRAWER_SECTIONS } from '../../navigation/drawerItems';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import type { ThemeColors } from '../../theme/colors';
import type { ProductExperience } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';
import { drawerProgress, drawerWidthFor } from './drawerProgress';

/* -------------------------------------------------------------------------------------------------
 * The drawer is a deep, per-experience room behind the light screen: it takes the dock colours
 * (terracotta on warm umber, brass on slate, amethyst on plum) as one solid fill, so the
 * receded screen separates by fill alone: no shadows, no borders, no decorative glows.
 * Every colour derives from theme tokens.
 * ----------------------------------------------------------------------------------------------- */

type DrawerItem = (typeof DRAWER_SECTIONS)[number]['items'][number];

const SETTINGS_ROUTE = '/(app)/(tabs)/settings';

const QUICK: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}[] = [
  { label: 'Check in', icon: 'sunny-outline', route: '/(app)/check-in' },
  { label: 'Calendar', icon: 'calendar-outline', route: '/(app)/calendar' },
  { label: 'Train', icon: 'fitness-outline', route: '/(app)/train' },
];
const QUICK_ROUTES = new Set(QUICK.map((q) => q.route));

const AVATAR_ICON: Record<ProductExperience, keyof typeof Ionicons.glyphMap> = {
  women_health: 'flower-outline',
  men_health: 'shield-outline',
  pride_wellbeing: 'heart-outline',
};

const EXPERIENCE_LABEL: Record<ProductExperience, string> = {
  women_health: "Women's health",
  men_health: "Men's health",
  pride_wellbeing: 'LGBTQ+ wellbeing',
};

const withAlpha = (hex: string, a: number) => {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

function buildPalette(c: ThemeColors) {
  return {
    bg: c.dock,
    accent: c.dockActive,
    accentSecondary: c.accent,
    onAccent: c.dock,
    ink: c.callText,
    inkSoft: withAlpha(c.callText, 0.84),
    inkMuted: withAlpha(c.callText, 0.58),
    wash: withAlpha(c.callText, 0.08),
    washStrong: withAlpha(c.callText, 0.14),
    accentWash: withAlpha(c.dockActive, 0.2),
  };
}
type Palette = ReturnType<typeof buildPalette>;

/** Route matching that understands expo-router groups and index routes, and prefers the most specific item. */
const cleanRoute = (route: string) =>
  route.replace(/\/\([^)]+\)/g, '').replace(/\/index$/, '') || '/';
const matchScore = (path: string, route: string) => {
  const r = cleanRoute(route);
  if (path === r) return r.length + 2;
  if (r !== '/' && path.startsWith(`${r}/`)) return r.length;
  return 0;
};

const tick = () => {
  try {
    Haptics.selectionAsync().catch(() => undefined);
  } catch {}
};

/* ----------------------------------------------------------------------------------------------- */

/** Rows rise in one after another as the drawer opens, and follow the finger while it is dragged. */
const Reveal = memo(function Reveal({
  index,
  progress,
  style,
  children,
}: {
  index: number;
  progress: SharedValue<number>;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const start = Math.min(0.04 + index * 0.024, 0.4);
  const animated = useAnimatedStyle(() => {
    const t = interpolate(progress.value, [start, start + 0.45], [0, 1], Extrapolation.CLAMP);
    return { opacity: t, transform: [{ translateX: (1 - t) * -20 }] };
  });
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
});

const DrawerRow = memo(function DrawerRow({
  item,
  active,
  onPress,
  palette,
}: {
  item: DrawerItem;
  active: boolean;
  onPress: (route: string) => void;
  palette: Palette;
}) {
  const { typography } = useTheme();
  return (
    <PressableScale
      onPress={() => onPress(item.route)}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
    >
      <View style={[styles.row, active && { backgroundColor: palette.wash }]}>
        <Ionicons
          name={active ? (item.icon.replace('-outline', '') as typeof item.icon) : item.icon}
          size={20}
          color={active ? palette.accent : palette.ink}
          style={styles.rowIcon}
        />
        <Text
          numberOfLines={1}
          style={[
            active ? typography.bodyBold : typography.body,
            styles.rowLabel,
            { color: active ? palette.ink : palette.inkSoft },
          ]}
        >
          {item.label}
        </Text>
        {active ? (
          <View style={[styles.activeBar, { backgroundColor: palette.accent }]} />
        ) : null}
      </View>
    </PressableScale>
  );
});

/* ----------------------------------------------------------------------------------------------- */

type Row =
  | { kind: 'title'; key: string; title: string; index: number }
  | { kind: 'item'; key: string; item: DrawerItem; index: number };

export function AppDrawer({ blurTarget: _blurTarget }: { blurTarget?: RefObject<View | null> }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, typography, experience } = useTheme();

  const { open, setOpen, socialOpen, user, level, currentStreak, betaMode, setBetaMode } =
    useRootStore(
      useShallow((s) => ({
        open: s.drawerOpen,
        setOpen: s.setDrawerOpen,
        socialOpen: s.isSocialPathRevealed,
        user: s.user,
        level: s.level,
        currentStreak: s.currentStreak,
        betaMode: s.betaMode,
        setBetaMode: s.setBetaMode,
      })),
    );

  const palette = useMemo(() => buildPalette(colors), [colors]);
  const panelWidth = drawerWidthFor(width);
  const progress = drawerProgress;

  const panelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.12], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-32, 0], Extrapolation.CLAMP) }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.1, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const sections = useMemo(
    () =>
      DRAWER_SECTIONS.map((sec) => ({
        ...sec,
        items: sec.items.filter((it) => {
          if (QUICK_ROUTES.has(it.route)) return false;
          if (it.betaOnly) return betaMode;
          if (sec.betaOnly && !betaMode) return false;
          if (it.only && !it.only.includes(experience)) return false;
          if (it.social && !socialOpen) return false;
          if (it.minLevel && level < it.minLevel) return false;
          return true;
        }),
      })).filter((sec) => sec.items.length > 0),
    [experience, socialOpen, level, betaMode],
  );

  const activeRoute = useMemo(() => {
    let best = '';
    let bestScore = 0;
    const all = [...QUICK, ...sections.flatMap((s) => s.items)];
    for (const it of all) {
      const score = matchScore(pathname, it.route);
      if (score > bestScore) {
        best = it.route;
        bestScore = score;
      }
    }
    return best;
  }, [sections, pathname]);

  const rows = useMemo(() => {
    const out: Row[] = [];
    let i = 2; // you + quick reveal first
    for (const sec of sections) {
      out.push({ kind: 'title', key: `t:${sec.title}`, title: sec.title, index: i++ });
      for (const it of sec.items) out.push({ kind: 'item', key: it.route, item: it, index: i++ });
    }
    return out;
  }, [sections]);

  const close = useCallback(() => setOpen(false), [setOpen]);

  const go = useCallback(
    (route: string) => {
      tick();
      setOpen(false);
      if (cleanRoute(route) === pathname) return;
      setTimeout(() => router.push(route as Href), 160);
    },
    [pathname, router, setOpen],
  );

  const onToggleBeta = useCallback(
    (val: boolean) => {
      tick();
      setBetaMode(val);
    },
    [setBetaMode],
  );

  return (
    <View
      style={[styles.root, { backgroundColor: palette.bg }]}
      pointerEvents={open ? 'auto' : 'none'}
      importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
      accessibilityElementsHidden={!open}
    >
      {/* Ambient background glow — gives the deep room its warmth */}
      <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]}>
        <Svg width="420" height="420" viewBox="0 0 420 420">
          <Defs>
            <RadialGradient id="drawerGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={palette.accent} stopOpacity="0.28" />
              <Stop offset="60%" stopColor={palette.accent} stopOpacity="0.08" />
              <Stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="210" cy="210" r="210" fill="url(#drawerGlow)" />
        </Svg>
      </Animated.View>

      {/* Empty space beside the panel closes it too */}
      <Pressable style={StyleSheet.absoluteFill} onPress={close} accessible={false} />

      <Animated.View
        style={[
          styles.panel,
          {
            width: panelWidth,
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 12),
          },
          panelStyle,
        ]}
      >
        <View style={styles.inner}>
          {/* You — Profile Header */}
          <Reveal index={0} progress={progress} style={styles.headRow}>
            <PressableScale
              onPress={() => go(SETTINGS_ROUTE)}
              scaleTo={0.98}
              style={styles.flex}
              accessibilityRole="button"
              accessibilityLabel={`${user?.pseudonym || 'You'}, level ${level}, ${EXPERIENCE_LABEL[experience]}. Open profile`}
            >
              <View style={styles.profile}>
                <SquircleSurface shape="circle" fill={palette.accentWash} style={styles.avatar}>
                  {user?.photoUrl ? (
                    <Image
                      source={{ uri: user.photoUrl }}
                      style={styles.avatarPhoto}
                      contentFit="cover"
                      accessibilityIgnoresInvertColors
                    />
                  ) : (
                    <Ionicons name={AVATAR_ICON[experience]} size={22} color={palette.accent} />
                  )}
                </SquircleSurface>
                <View style={styles.flex}>
                  <Text numberOfLines={1} style={[typography.subheading, { color: palette.ink }]}>
                    {user?.pseudonym || 'You'}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[typography.caption, { color: palette.inkMuted, marginTop: 1 }]}
                  >
                    Level {level}
                    {currentStreak > 0 ? ` · ${currentStreak} day streak` : ''}
                  </Text>
                </View>
              </View>
            </PressableScale>
            <PressableScale
              onPress={close}
              hitSlop={8}
              scaleTo={0.9}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            >
              <SquircleSurface shape="circle" fill={palette.wash} style={styles.iconButton}>
                <Ionicons name="close" size={18} color={palette.ink} />
              </SquircleSurface>
            </PressableScale>
          </Reveal>

          {/* Quick tiles */}
          <Reveal index={1} progress={progress} style={styles.quickRow}>
            {QUICK.map((q) => {
              const on = q.route === activeRoute;
              return (
                <PressableScale
                  key={q.route}
                  onPress={() => go(q.route)}
                  scaleTo={0.95}
                  style={styles.flex}
                  accessibilityRole="button"
                  accessibilityLabel={q.label}
                  accessibilityState={{ selected: on }}
                >
                  <SquircleSurface
                    radius={20}
                    fill={on ? palette.accent : palette.wash}
                    style={styles.quick}
                  >
                    <Ionicons
                      name={q.icon}
                      size={20}
                      color={on ? palette.onAccent : palette.accent}
                    />
                    <Text
                      numberOfLines={1}
                      style={[
                        typography.captionBold,
                        {
                          color: on ? palette.onAccent : palette.ink,
                          marginTop: 6,
                        },
                      ]}
                    >
                      {q.label}
                    </Text>
                  </SquircleSurface>
                </PressableScale>
              );
            })}
          </Reveal>

          {/* Navigation */}
          <View style={styles.flex}>
            <ScrollView
              style={styles.flex}
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
              contentContainerStyle={styles.listContent}
            >
              {rows.map((r) =>
                r.kind === 'title' ? (
                  <Reveal key={r.key} index={r.index} progress={progress} style={styles.sectionTitle}>
                    <Text
                      accessibilityRole="header"
                      style={[typography.captionBold, { color: palette.inkMuted }]}
                    >
                      {r.title}
                    </Text>
                  </Reveal>
                ) : (
                  <Reveal key={r.key} index={r.index} progress={progress}>
                    <DrawerRow
                      item={r.item}
                      active={r.item.route === activeRoute}
                      onPress={go}
                      palette={palette}
                    />
                  </Reveal>
                ),
              )}

              {/* Beta Mode Toggle Row — perfectly integrated, minimal & sleek */}
              <Reveal index={rows.length + 2} progress={progress} style={styles.betaRowWrap}>
                <SquircleSurface
                  radius={18}
                  smoothing={1}
                  fill={betaMode ? palette.accentWash : palette.wash}
                  style={styles.betaCard}
                >
                  <View style={styles.betaCardLeft}>
                    <SquircleSurface
                      radius={12}
                      fill={betaMode ? palette.accent : palette.washStrong}
                      style={styles.betaIconSurface}
                    >
                      <Ionicons
                        name={betaMode ? 'flask' : 'flask-outline'}
                        size={17}
                        color={betaMode ? palette.onAccent : palette.inkSoft}
                      />
                    </SquircleSurface>
                    <View style={styles.betaTextCol}>
                      <View style={styles.betaHeadingRow}>
                        <Text style={[typography.bodyBold, { color: palette.ink }]}>
                          Beta Mode
                        </Text>
                        {betaMode ? (
                          <SquircleSurface radius={8} fill={palette.accent} style={styles.badge}>
                            <Text
                              style={[
                                typography.captionBold,
                                { color: palette.onAccent, fontSize: 10 },
                              ]}
                            >
                              ON
                            </Text>
                          </SquircleSurface>
                        ) : null}
                      </View>
                      <Text
                        numberOfLines={1}
                        style={[typography.caption, { color: palette.inkMuted, marginTop: 1 }]}
                      >
                        Experimental tech & Lab
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={betaMode}
                    onValueChange={onToggleBeta}
                    thumbColor={betaMode ? palette.accent : palette.inkMuted}
                    trackColor={{
                      false: palette.washStrong,
                      true: palette.accentWash,
                    }}
                    accessibilityLabel="Toggle Beta Mode"
                  />
                </SquircleSurface>
              </Reveal>
            </ScrollView>

            {/* The list dissolves into the footer instead of being cut off */}
            <LinearGradient
              pointerEvents="none"
              colors={[withAlpha(colors.dock, 0), colors.dock]}
              style={styles.fade}
            />
          </View>

          {/* Footer: Safety and Support */}
          <Reveal index={rows.length + 3} progress={progress} style={styles.footer}>
            <PressableScale
              onPress={() => go('/(app)/safety')}
              scaleTo={0.98}
              accessibilityRole="button"
              accessibilityLabel="Safety and support"
            >
              <SquircleSurface radius={18} fill={palette.wash} style={styles.footerButton}>
                <Ionicons name="shield-checkmark-outline" size={19} color={palette.accent} />
                <Text style={[typography.bodyBold, styles.flex, { color: palette.ink }]}>
                  Safety and support
                </Text>
                <Ionicons name="chevron-forward" size={17} color={palette.inkMuted} />
              </SquircleSurface>
            </PressableScale>
          </Reveal>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  panel: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 12,
  },
  flex: {
    flex: 1,
  },
  headRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    alignItems: 'center',
    height: 46,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 46,
  },
  avatarPhoto: {
    height: 46,
    width: 46,
  },
  iconButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  quick: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 14,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 4,
  },
  sectionTitle: {
    marginBottom: 4,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  row: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 14,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  rowIcon: {
    width: 22,
  },
  rowLabel: {
    flex: 1,
  },
  activeBar: {
    borderRadius: 2,
    height: 18,
    width: 3,
  },
  betaRowWrap: {
    marginTop: 18,
    paddingHorizontal: 4,
  },
  betaCard: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  betaCardLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    marginRight: 8,
  },
  betaIconSurface: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  betaTextCol: {
    flex: 1,
  },
  betaHeadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  glow: {
    height: 420,
    left: -170,
    position: 'absolute',
    top: -170,
    width: 420,
  },
  fade: {
    bottom: 0,
    height: 32,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  footer: {
    paddingTop: 6,
  },
  footerButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 14,
  },
});

export default AppDrawer;
