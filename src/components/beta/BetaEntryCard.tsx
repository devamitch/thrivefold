import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useBetaEnabled } from '../../hooks/useBetaEnabled';
import { useTheme } from '../../theme/useTheme';
import { BetaBadge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  route: string;
  /** Runs before navigating, e.g. to close the sheet the card sits in. */
  onBeforeNavigate?: () => void;
}

/**
 * A quiet entry to one beta product from the section it belongs to (Steps, Health, Exercise…).
 * Renders nothing unless Beta Mode is on for this person.
 */
export function BetaEntryCard({ icon, title, subtitle, route, onBeforeNavigate }: Props) {
  const enabled = useBetaEnabled();
  const router = useRouter();
  const { colors, typography } = useTheme();
  if (!enabled) return null;

  return (
    <Card
      onPress={() => {
        onBeforeNavigate?.();
        router.push(route as Href);
      }}
      accessibilityLabel={`${title}, beta. ${subtitle}`}
      style={styles.card}
    >
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.primaryAlpha }]}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={[typography.bodyBold, styles.shrink, { color: colors.text.primary }]}>
              {title}
            </Text>
            <BetaBadge />
          </View>
          <Text numberOfLines={2} style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            {subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
