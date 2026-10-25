import { SquircleSurface } from '@/components/ui';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PressableScale } from './PressableScale';
import { useTheme } from '../../theme/useTheme';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  sticky?: boolean;
  compact?: boolean;
  variant?: 'compact' | 'large';
}

/** Toolbar row height shared by the static and collapsing header. */
export const HEADER_BAR_HEIGHT = 52;
export const HEADER_BUTTON_SIZE = 40;

/** Round squircle toolbar button; back control and rightAction share it. */
export function HeaderIconButton({
  icon,
  label,
  onPress,
  iconSize = 20,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  iconSize?: number;
}) {
  const { colors } = useTheme();

  return (
    <PressableScale
      onPress={() => {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
        onPress();
      }}
      hitSlop={8}
      scaleTo={0.92}
      style={[
        styles.iconButton,
        {
          backgroundColor: colors.surface1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={iconSize} color={colors.text.primary} />
    </PressableScale>
  );
}

/** Back control: pops the stack with haptic feedback. */
export function HeaderBackButton() {
  const router = useRouter();
  return (
    <HeaderIconButton
      icon="chevron-back"
      iconSize={21}
      label="Go back"
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/(app)/(tabs)');
      }}
    />
  );
}

/** Eyebrow, large title, and subtitle block. */
export function HeaderLargeTitle({
  eyebrow,
  title,
  subtitle,
}: Pick<AppHeaderProps, 'eyebrow' | 'title' | 'subtitle'>) {
  const { colors, typography, spacing } = useTheme();
  return (
    <SquircleSurface style={styles.largeTitleBlock}>
      {eyebrow ? (
        <Text
          style={[
            typography.label,
            { color: colors.primary, letterSpacing: 0.9, marginBottom: spacing.xxs },
          ]}
        >
          {eyebrow.toUpperCase()}
        </Text>
      ) : null}
      <Text
        style={[typography.display, { color: colors.text.primary }]}
        accessibilityRole="header"
        numberOfLines={2}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      ) : null}
    </SquircleSurface>
  );
}

/**
 * Universal app header (Neev architecture).
 * - In compact mode: back button, left-aligned title and right action share one 52pt row.
 * - In large mode: Top action row with full-width large title below.
 */
export function AppHeader({
  title,
  subtitle,
  eyebrow,
  showBack = false,
  rightAction,
  style,
  titleStyle,
  compact,
  variant,
}: AppHeaderProps) {
  const { colors, typography } = useTheme();
  const isCompact = compact ?? (variant === 'compact' || (variant !== 'large' && !eyebrow));

  if (isCompact) {
    const hasLeft = showBack;
    return (
      <SquircleSurface style={[styles.compactToolbar, style]}>
        {hasLeft ? (
          <SquircleSurface style={styles.left}>
            <HeaderBackButton />
          </SquircleSurface>
        ) : null}

        <SquircleSurface
          style={[
            styles.compactCenter,
            hasLeft ? { paddingLeft: 12, paddingRight: 8 } : { paddingHorizontal: 0 },
          ]}
        >
          {eyebrow ? (
            <Text
              style={[
                typography.label,
                { color: colors.primary, fontSize: 10, letterSpacing: 0.8, marginBottom: 1 },
              ]}
              numberOfLines={1}
            >
              {eyebrow}
            </Text>
          ) : null}
          <Text
            style={[
              typography.subheading,
              { color: colors.text.primary, textAlign: 'left' },
              titleStyle,
            ]}
            numberOfLines={1}
            accessibilityRole="header"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                typography.caption,
                { color: colors.text.secondary, textAlign: 'left' },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </SquircleSurface>

        {rightAction ? (
          <SquircleSurface style={styles.right}>{rightAction}</SquircleSurface>
        ) : null}
      </SquircleSurface>
    );
  }

  return (
    <SquircleSurface style={[styles.container, style]}>
      {showBack || rightAction ? (
        <SquircleSurface style={[styles.toolbar, !showBack && { justifyContent: 'flex-end' }]}>
          {showBack ? <HeaderBackButton /> : null}
          {rightAction ? <SquircleSurface style={styles.right}>{rightAction}</SquircleSurface> : null}
        </SquircleSurface>
      ) : null}
      <HeaderLargeTitle eyebrow={eyebrow} title={title} subtitle={subtitle} />
    </SquircleSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    paddingTop: 4,
  },
  compactToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: HEADER_BAR_HEIGHT,
    justifyContent: 'space-between',
    minHeight: HEADER_BAR_HEIGHT,
    width: '100%',
  },
  left: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: HEADER_BUTTON_SIZE,
  },
  compactCenter: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: HEADER_BUTTON_SIZE,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: HEADER_BAR_HEIGHT,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  largeTitleBlock: {
    paddingVertical: 4,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 14,
    height: HEADER_BUTTON_SIZE,
    justifyContent: 'center',
    width: HEADER_BUTTON_SIZE,
  },
});
