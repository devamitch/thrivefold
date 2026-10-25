import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter, type Href } from 'expo-router';
import React, { memo, useCallback, useMemo, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { DRAWER_SECTIONS } from '../../navigation/drawerItems';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import type { ThemeColors } from '../../theme/colors';
import { getExperienceIcons } from '../../theme/icons';
import type { ProductExperience } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { PressableScale, SquircleSurface } from '../ui';
import { drawerProgress, drawerWidthFor } from './drawerProgress';

/* -------------------------------------------------------------------------------------------------
 * The drawer is a deep, per-experience room behind the light screen: it takes the dock colours
 * (terracotta on warm umber, brass on slate, amethyst on plum) as one solid fill, so the
 * receded screen separates by fill alone: no shadows, no borders, no decorative glows.
 * Every colour below derives from theme tokens.
 * ----------------------------------------------------------------------------------------------- */

type DrawerItem = (typeof DRAWER_SECTIONS)[number]['items'][number];

const SETTINGS_ROUTE = '/(app)/(tabs)/settings';

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
    wash: withAlpha(c.callText, 0.07),
    accentWash: withAlpha(c.dockActive, 0.17),
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
  const start = Math.min(0.05 + index * 0.028, 0.42);
  const animated = useAnimatedStyle(() => {
    const t = interpolate(progress.value, [start, start + 0.5], [0, 1], Extrapolation.CLAMP);
    return { opacity: t, transform: [{ translateX: (1 - t) * -22 }] };
  });
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
});

/** Lets the list dissolve into the footer instead of being cut off. */
const BottomFade = memo(function BottomFade({ color }: { color: string }) {
  return (
    <SquircleSurface pointerEvents="none" style={styles.fade}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="drawerFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0} />
            <Stop offset="1" stopColor={color} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#drawerFade)" />
      </Svg>
    </SquircleSurface>
  );
});

const StatChip = memo(function StatChip({
  icon,
  label,
  iconColor,
  palette,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor: string;
  palette: Palette;
}) {
  const { typography } = useTheme();
  return (
    <SquircleSurface radius={12} fill={palette.wash} style={styles.chip}>
      <Ionicons name={icon} size={14} color={iconColor} />
      <Text style={[typography.captionBold, { color: palette.inkSoft }]} numberOfLines={1}>
        {label}
      </Text>
    </SquircleSurface>
  );
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
      style={styles.rowWrap}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
    >
      <SquircleSurface
        radius={18}
        smoothing={1}
        fill={active ? palette.accentWash : 'transparent'}
        style={styles.row}
      >
        <SquircleSurface
          radius={12}
          smoothing={1}
          fill={active ? palette.accent : palette.wash}
          style={styles.rowIcon}
        >
          <Ionicons
            name={item.icon}
            size={18}
            color={active ? palette.onAccent : palette.inkSoft}
          />
        </SquircleSurface>
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
        {active ? <SquircleSurface style={[styles.activeDot, { backgroundColor: palette.accent }]} /> : null}
      </SquircleSurface>
    </PressableScale>
  );
});

/* ----------------------------------------------------------------------------------------------- */

type Row =
  | { kind: 'title'; key: string; title: string; index: number }
  | { kind: 'item'; key: string; item: DrawerItem; index: number };

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

  const palette = useMemo(() => buildPalette(colors), [colors]);
  const drawerWidth = drawerWidthFor(width);
  // Driven by DrawerSceneWrapper (state changes and drags), so panel and screen stay in step.
  const progress = drawerProgress;

  const panelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.12], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-32, 0], Extrapolation.CLAMP) }],
  }));

  const sections = useMemo(
    () =>
      DRAWER_SECTIONS.map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (it) =>
            (!it.only || it.only.includes(experience)) &&
            (!it.social || socialOpen) &&
            (!it.minLevel || level >= it.minLevel),
        ),
      })).filter((sec) => sec.items.length > 0),
    [experience, socialOpen, level],
  );

  const activeRoute = useMemo(() => {
    let best = '';
    let bestScore = 0;
    for (const sec of sections) {
      for (const it of sec.items) {
        const score = matchScore(pathname, it.route);
        if (score > bestScore) {
          best = it.route;
          bestScore = score;
        }
      }
    }
    return best;
  }, [sections, pathname]);

  const rows = useMemo(() => {
    const out: Row[] = [];
    let i = 2; // brand + profile reveal first
    for (const sec of sections) {
      out.push({ kind: 'title', key: `t:${sec.title}`, title: sec.title, index: i++ });
      for (const it of sec.items) out.push({ kind: 'item', key: it.route, item: it, index: i++ });
    }
    return out;
  }, [sections]);

  const close = useCallback(() => setOpen(false), [setOpen]);

  // Close first, then navigate once the screen has mostly settled, so the push
  // doesn't animate underneath a still-scaled scene.
  const go = useCallback(
    (route: string) => {
      tick();
      setOpen(false);
      if (cleanRoute(route) === pathname) return;
      setTimeout(() => router.push(route as Href), 180);
    },
    [pathname, router, setOpen],
  );

  const orbIcon = getExperienceIcons(experience).orb.icon;
  const hasStreak = currentStreak > 0;

  return (
    <SquircleSurface
      style={[styles.root, { backgroundColor: palette.bg }]}
      pointerEvents={open ? 'auto' : 'none'}
      importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
      accessibilityElementsHidden={!open}
    >
      {/* Empty space around the panel closes it too */}
      <PressableScale scaleTo={1} style={StyleSheet.absoluteFill} onPress={close} accessible={false} />

      <Animated.View
        style={[
          styles.panel,
          {
            width: drawerWidth,
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.md,
          },
          panelStyle,
        ]}
      >
        {/* Brand + close */}
        <Reveal index={0} progress={progress} style={styles.brandRow}>
          <SquircleSurface style={styles.brandLeft}>
            <SquircleSurface radius={11} fill={palette.accent} style={styles.brandMark}>
              <Ionicons name={orbIcon} size={16} color={palette.onAccent} />
            </SquircleSurface>
            <Text
              style={[typography.heading, { color: palette.ink, fontSize: 21, lineHeight: 27 }]}
            >
              Thrivefold
            </Text>
          </SquircleSurface>
          <PressableScale
            onPress={close}
            hitSlop={8}
            scaleTo={0.9}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          >
            <SquircleSurface radius={14} fill={palette.wash} style={styles.iconButton}>
              <Ionicons name="close" size={18} color={palette.ink} />
            </SquircleSurface>
          </PressableScale>
        </Reveal>

        {/* Profile */}
        <Reveal index={1} progress={progress}>
          <PressableScale
            onPress={() => go(SETTINGS_ROUTE)}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel="Open settings and profile"
          >
            <SquircleSurface
              radius={26}
              smoothing={1}
              fill={palette.wash}
              style={styles.profileCard}
            >
              <SquircleSurface style={styles.profileTop}>
                <SquircleSurface
                  radius={20}
                  smoothing={1}
                  fill={palette.accentWash}
                  style={styles.avatar}
                >
                  <Ionicons name={AVATAR_ICON[experience]} size={26} color={palette.accent} />
                </SquircleSurface>
                <SquircleSurface style={styles.profileText}>
                  <Text
                    numberOfLines={1}
                    style={[
                      typography.heading,
                      { color: palette.ink, fontSize: 21, lineHeight: 27 },
                    ]}
                  >
                    {user?.pseudonym || 'Thrivefold Friend'}
                  </Text>
                  <Text
                    style={[typography.caption, { color: palette.inkMuted, marginTop: 2 }]}
                    numberOfLines={1}
                  >
                    {EXPERIENCE_LABEL[experience]}
                  </Text>
                </SquircleSurface>
                <Ionicons name="chevron-forward" size={18} color={palette.inkMuted} />
              </SquircleSurface>
              <SquircleSurface style={styles.chipRow}>
                <StatChip
                  icon="ribbon-outline"
                  label={`Level ${level}`}
                  iconColor={palette.accent}
                  palette={palette}
                />
                <StatChip
                  icon={hasStreak ? 'flame' : 'flame-outline'}
                  label={hasStreak ? `${currentStreak} day streak` : 'Start a streak'}
                  iconColor={hasStreak ? palette.accent : palette.inkMuted}
                  palette={palette}
                />
              </SquircleSurface>
            </SquircleSurface>
          </PressableScale>
        </Reveal>

        {/* Navigation */}
        <SquircleSurface style={styles.listWrap}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
            contentContainerStyle={styles.listContent}
          >
            {rows.map((r) =>
              r.kind === 'title' ? (
                <Reveal key={r.key} index={r.index} progress={progress} style={styles.sectionTitle}>
                  <Text
                    accessibilityRole="header"
                    style={[
                      typography.captionBold,
                      { color: palette.inkMuted, letterSpacing: 0.3 },
                    ]}
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
          </ScrollView>
          <BottomFade color={palette.bg} />
        </SquircleSurface>

        {/* Footer */}
        <Reveal index={rows.length + 2} progress={progress} style={styles.footer}>
          <PressableScale
            onPress={() => go('/(app)/safety')}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel="Safety and support"
          >
            <SquircleSurface
              radius={18}
              smoothing={1}
              fill={palette.wash}
              style={styles.footerButton}
            >
              <Ionicons name="shield-checkmark-outline" size={19} color={palette.ink} />
              <Text style={[typography.bodyBold, styles.rowLabel, { color: palette.ink }]}>
                Safety and support
              </Text>
              <Ionicons name="chevron-forward" size={17} color={palette.inkMuted} />
            </SquircleSurface>
          </PressableScale>
        </Reveal>
      </Animated.View>
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  panel: {
    flex: 1,
    paddingHorizontal: 12,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  brandLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  brandMark: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  iconButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  profileCard: {
    padding: 16,
  },
  profileTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  avatar: {
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  profileText: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  listWrap: {
    flex: 1,
    marginTop: 6,
  },
  listContent: {
    paddingBottom: 28,
  },
  sectionTitle: {
    marginBottom: 6,
    marginTop: 18,
    paddingHorizontal: 10,
  },
  rowWrap: {
    marginBottom: 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rowIcon: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  rowLabel: {
    flex: 1,
  },
  activeDot: {
    borderRadius: 3,
    height: 6,
    marginRight: 4,
    width: 6,
  },
  fade: {
    bottom: 0,
    height: 28,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  footer: {
    paddingTop: 8,
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
