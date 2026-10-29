import { Ionicons } from '@expo/vector-icons';
import React, { useState, type ReactNode } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, UIManager, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Card } from './Card';
import { PressableScale } from './PressableScale';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) UIManager.setLayoutAnimationEnabledExperimental(true);

interface Props {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Short status under the title, e.g. "3 of 5 filled". */
  summary?: string;
  /** True when the section has what it needs; shows a check. */
  done?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** A profile or settings group that opens and closes, so long forms stay calm and skippable. */
export function CollapsibleSection({ title, icon, summary, done, defaultOpen = false, children }: Props) {
  const { colors, typography } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
    setOpen((o) => !o);
  };
  return (
    <Card style={styles.card}>
      <PressableScale onPress={toggle} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`${title}${summary ? `, ${summary}` : ''}`} style={styles.head}>
        <View style={[styles.icon, { backgroundColor: colors.primaryAlpha }]}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{title}</Text>
          {summary ? <Text style={[typography.caption, { color: colors.text.muted }]}>{summary}</Text> : null}
        </View>
        {done ? <Ionicons name="checkmark-circle" size={20} color={colors.success} /> : null}
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text.muted} />
      </PressableScale>
      {open ? <View style={styles.body}>{children}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginTop: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  body: { marginTop: 8 },
});
