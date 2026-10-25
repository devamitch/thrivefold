import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { hoursUntil, type ServerLetter } from '../../services/supabase/letters';
import { useTheme } from '../../theme/useTheme';
import { Badge } from '../ui/Badge';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';

/** One letter in the inbox or the sent list; opens the letter. */
export function LetterRow({ letter, who, direction }: { letter: ServerLetter; who: string; direction: 'in' | 'out' }) {
  const { colors, typography } = useTheme();
  const waiting = hoursUntil(letter.scheduled_delivery_at);
  const unread = direction === 'in' && letter.status !== 'opened';
  const status =
    direction === 'out'
      ? waiting > 0
        ? { label: `Arrives in ${waiting} h`, variant: 'warning' as const }
        : letter.status === 'opened'
          ? { label: 'Read', variant: 'success' as const }
          : letter.status === 'declined'
            ? { label: 'Declined', variant: 'neutral' as const }
            : { label: 'Delivered', variant: 'neutral' as const }
      : unread
        ? { label: 'New', variant: 'primary' as const }
        : { label: 'Read', variant: 'neutral' as const };

  return (
    <Link href={`/(app)/letters/delivery/${letter.id}` as Href} asChild>
      <PressableScale scaleTo={0.98} accessibilityRole="button" accessibilityLabel={`Letter ${direction === 'in' ? 'from' : 'to'} ${who}`}>
        <SquircleSurface radius={20} fill={colors.surface} style={styles.row}>
          <SquircleSurface shape="circle" fill={unread ? colors.primaryAlpha : colors.surface1} style={styles.icon}>
            <Ionicons name={unread ? 'mail-unread-outline' : 'mail-open-outline'} size={20} color={unread ? colors.primary : colors.text.secondary} />
          </SquircleSurface>
          <View style={styles.flex}>
            <Text numberOfLines={1} style={[unread ? typography.bodyBold : typography.body, { color: colors.text.primary }]}>
              {direction === 'in' ? `From ${who}` : `To ${who}`}
            </Text>
            <Text numberOfLines={1} style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              {letter.assembled_body}
            </Text>
          </View>
          <Badge label={status.label} variant={status.variant} />
        </SquircleSurface>
      </PressableScale>
    </Link>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 8, padding: 14 },
  icon: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
});
