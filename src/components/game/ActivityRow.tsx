import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  meta?: string;
  done?: boolean;
  dimmed?: boolean;
  /** Label of the trailing action button; omitted shows a chevron. */
  action?: string;
  onPress: () => void;
  trailing?: React.ReactNode;
  highlight?: boolean;
}

/**
 * One row for anything you can do today: a quest, a workout plan, a logged session.
 * Quests, Train and Home share it, so activities look and behave the same everywhere.
 */
export function ActivityRow({ icon, title, meta, done, dimmed, action, onPress, trailing, highlight }: Props) {
  const { colors, typography, spacing } = useTheme();
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={meta ? `${title}. ${meta}` : title}>
      <SquircleSurface
        radius={18}
        fill={highlight ? colors.primaryAlpha : colors.surface}
        style={[styles.row, { marginBottom: spacing.sm, opacity: dimmed ? 0.6 : 1 }]}
      >
        <SquircleSurface radius={12} fill={done ? colors.successSurface : highlight ? colors.surface : colors.primaryAlpha} style={styles.tile}>
          <Ionicons name={done ? 'checkmark' : icon} size={20} color={done ? colors.success : colors.primary} />
        </SquircleSurface>
        <View style={styles.flex}>
          <Text
            style={[typography.bodyBold, { color: colors.text.primary, textDecorationLine: done ? 'line-through' : 'none' }]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {meta ? (
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]} numberOfLines={2}>
              {meta}
            </Text>
          ) : null}
        </View>
        {trailing ?? (action && !done ? <Button label={action} size="sm" onPress={onPress} /> : <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />)}
      </SquircleSurface>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 68, padding: 12 },
  tile: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
});
