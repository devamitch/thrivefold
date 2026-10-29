import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { PressableScale } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  /** Replaces the chevron, e.g. a Switch. */
  right?: React.ReactNode;
  tone?: 'default' | 'danger';
  /** Set by SettingsGroup: the row sits inside the group's card instead of its own. */
  grouped?: boolean;
}

const GroupContext = React.createContext(false);

/**
 * A titled group of settings rows in one card, separated by hairlines (the Meta / iOS settings
 * pattern): small section label, then related rows together.
 */
export function SettingsGroup({ title, footer, children }: { title?: string; footer?: string; children: React.ReactNode }) {
  const { colors, typography, spacing } = useTheme();
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={{ marginTop: spacing.lg }}>
      {title ? (
        <Text style={[typography.captionBold, styles.groupTitle, { color: colors.text.muted }]}>{title.toUpperCase()}</Text>
      ) : null}
      <SquircleSurface radius={20} fill={colors.surface} style={styles.group}>
        <GroupContext.Provider value>
          {rows.map((row, i) => (
            <View key={i}>
              {i > 0 ? <View style={[styles.divider, { backgroundColor: colors.surface2 }]} /> : null}
              {row}
            </View>
          ))}
        </GroupContext.Provider>
      </SquircleSurface>
      {footer ? <Text style={[typography.caption, styles.groupFooter, { color: colors.text.muted }]}>{footer}</Text> : null}
    </View>
  );
}

/** One row in a settings list: squircle surface, icon, text, and a chevron or control. */
export function SettingsRow({ icon, title, subtitle, onPress, right, tone = 'default', grouped }: Props) {
  const { colors, typography, spacing } = useTheme();
  const inGroup = React.useContext(GroupContext) || grouped;
  const fg = tone === 'danger' ? colors.error : colors.text.primary;
  const inner = (
    <>
      <SquircleSurface radius={12} fill={tone === 'danger' ? colors.errorSurface : colors.primaryAlpha} style={styles.icon}>
        <Ionicons name={icon} size={18} color={tone === 'danger' ? colors.error : colors.primary} />
      </SquircleSurface>
      <View style={styles.flex}>
        <Text style={[typography.bodyBold, { color: fg }]}>{title}</Text>
        {subtitle ? <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.text.muted} /> : null)}
    </>
  );
  const body = inGroup ? (
    <View style={styles.row}>{inner}</View>
  ) : (
    <SquircleSurface radius={18} fill={colors.surface} style={[styles.row, { marginBottom: spacing.sm }]}>
      {inner}
    </SquircleSurface>
  );
  if (!onPress) return body;
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}>
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  icon: { alignItems: 'center', height: 36, justifyContent: 'center', width: 36 },
  group: { overflow: 'hidden' },
  groupTitle: { letterSpacing: 0.6, marginBottom: 8, marginLeft: 4 },
  groupFooter: { marginTop: 6, marginHorizontal: 4 },
  divider: { height: StyleSheet.hairlineWidth * 2, marginLeft: 62 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 64, paddingHorizontal: 14, paddingVertical: 10 },
});
