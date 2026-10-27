import { Ionicons } from '@expo/vector-icons';
import { hapticSelection } from '../../services/haptics';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { APPROVED_CHIPS, type ChipCategory } from '../../domain/chips/catalog';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { PressableScale } from '../ui/PressableScale';
import { SquircleSurface } from '../ui/SquircleSurface';

export const DATING_CATEGORIES: { id: ChipCategory; label: string }[] = [
  { id: 'dating_hello', label: 'Hello' },
  { id: 'dating_reply', label: 'Reply' },
  { id: 'dating_reflection', label: 'About me' },
  { id: 'dating_playful', label: 'Playful' },
  { id: 'interests', label: 'Interests' },
  { id: 'gratitude', label: 'Thanks' },
  { id: 'boundaries', label: 'Pace' },
  { id: 'close_conversation', label: 'Goodbye' },
];

/**
 * Chip-only message composer (spec 18.2): pick up to `max` cards, see the composed message,
 * then send or discard. There is no text field anywhere.
 */
export function ChipComposer({
  categories = DATING_CATEGORIES,
  max = 6,
  sending,
  sendLabel = 'Send',
  onSend,
}: {
  categories?: { id: ChipCategory; label: string }[];
  max?: number;
  sending?: boolean;
  sendLabel?: string;
  onSend: (chipIds: string[]) => void;
}) {
  const { colors, typography, spacing } = useTheme();
  const [category, setCategory] = useState<ChipCategory>(categories[0].id);
  const [picked, setPicked] = useState<string[]>([]);
  const chips = APPROVED_CHIPS.filter((c) => c.category === category && c.riskClass !== 'contact_sensitive');
  const preview = picked.map((id) => APPROVED_CHIPS.find((c) => c.id === id)?.text).filter(Boolean).join(' ');

  const toggle = (id: string) => {
    hapticSelection();
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= max ? p : [...p, id]));
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.noGrow} contentContainerStyle={styles.row}>
        {categories.map((c) => (
          <Chip key={c.id} label={c.label} selected={category === c.id} onPress={() => setCategory(c.id)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.noGrow, { marginTop: spacing.sm }]} contentContainerStyle={styles.row}>
        {chips.map((c) => {
          const on = picked.includes(c.id);
          return (
            <PressableScale key={c.id} onPress={() => toggle(c.id)} scaleTo={0.96} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
              <SquircleSurface radius={18} fill={on ? colors.primaryAlpha : colors.surface1} style={styles.card}>
                <Text numberOfLines={4} style={[typography.subbody, { color: on ? colors.primary : colors.text.primary }]}>
                  {c.text}
                </Text>
              </SquircleSurface>
            </PressableScale>
          );
        })}
      </ScrollView>
      {picked.length > 0 ? (
        <SquircleSurface radius={18} fill={colors.surface1} style={[styles.preview, { marginTop: spacing.sm }]}>
          <Text style={[typography.caption, { color: colors.text.muted }]}>Your message</Text>
          <Text style={[typography.body, { color: colors.text.primary, marginTop: 4 }]}>{preview}</Text>
          <View style={[styles.row, { marginTop: spacing.sm }]}>
            <Button label="Discard" variant="secondary" size="sm" onPress={() => setPicked([])} style={styles.flex} />
            <Button
              label={sendLabel}
              size="sm"
              loading={sending}
              disabled={sending}
              onPress={() => {
                onSend(picked);
                setPicked([]);
              }}
              style={styles.flex}
              icon={<Ionicons name="send" size={14} color={colors.onPrimary} />}
            />
          </View>
        </SquircleSurface>
      ) : (
        <Text style={[typography.caption, { color: colors.text.muted, marginTop: spacing.sm }]}>
          Tap up to {max} cards to build a message.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  noGrow: { flexGrow: 0 },
  row: { flexDirection: 'row', gap: 8 },
  card: { justifyContent: 'center', minHeight: 72, padding: 12, width: 220 },
  preview: { padding: 14 },
});
