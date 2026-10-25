import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

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
}

/** One row in a settings list: squircle surface, icon, text, and a chevron or control. */
export function SettingsRow({ icon, title, subtitle, onPress, right, tone = 'default' }: Props) {
  const { colors, typography, spacing } = useTheme();
  const fg = tone === 'danger' ? colors.error : colors.text.primary;
  const body = (
    <SquircleSurface radius={18} fill={colors.surface} style={[styles.row, { marginBottom: spacing.sm }]}>
      <SquircleSurface radius={12} fill={tone === 'danger' ? colors.errorSurface : colors.primaryAlpha} style={styles.icon}>
        <Ionicons name={icon} size={18} color={tone === 'danger' ? colors.error : colors.primary} />
      </SquircleSurface>
      <SquircleSurface style={styles.flex}>
        <Text style={[typography.bodyBold, { color: fg }]}>{title}</Text>
        {subtitle ? <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{subtitle}</Text> : null}
      </SquircleSurface>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.text.muted} /> : null)}
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
  row: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 64, paddingHorizontal: 14, paddingVertical: 10 },
});
