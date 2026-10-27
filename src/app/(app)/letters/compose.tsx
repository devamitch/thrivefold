import { Ionicons } from '@expo/vector-icons';
import { hapticSelection, hapticSuccess } from '../../../services/haptics';
import { Link, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Header } from '../../../components/ui/Header';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { APPROVED_CHIPS, type ChipCategory } from '../../../domain/chips/catalog';
import { STAMP_CATALOG } from '../../../domain/letters/stampCatalog';
import { letterErrorText, useSendLetter } from '../../../services/supabase/letters';
import { useRootStore } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

const MAX_CARDS = 5;

const CATEGORIES: { id: ChipCategory; label: string }[] = [
  { id: 'introduction', label: 'Hello' },
  { id: 'interests', label: 'Interests' },
  { id: 'daily_checkin', label: 'Daily life' },
  { id: 'wellbeing', label: 'Self-care' },
  { id: 'gratitude', label: 'Thanks' },
  { id: 'boundaries', label: 'Pacing' },
  { id: 'close_conversation', label: 'Closing' },
];

const STAMP_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  flower: 'rose-outline',
  sun: 'sunny-outline',
  wind: 'water-outline',
  mountain: 'trail-sign-outline',
};

const tick = () => hapticSelection();

/**
 * Compose a chip-only letter to one person. The server checks everything (verified adults,
 * consent, daily limit, blocks, approved chips) and sets the 12-hour delivery.
 */
export default function LetterComposeScreen() {
  const router = useRouter();
  const { to, name } = useLocalSearchParams<{ to?: string; name?: string }>();
  const { colors, typography, spacing } = useTheme();
  const showAlert = useRootStore((s) => s.showAlert);
  const send = useSendLetter();

  const [selected, setSelected] = useState<string[]>([]);
  const [category, setCategory] = useState<ChipCategory>('introduction');
  const stamps = useMemo(() => STAMP_CATALOG.filter((s) => s.unlocked), []);
  const [stampId, setStampId] = useState(stamps[0]?.id ?? 'standard');

  const chips = APPROVED_CHIPS.filter(
    (c) => c.category === category && c.allowedModes.includes('letters') && c.riskClass !== 'contact_sensitive',
  );
  const preview = selected.map((id) => APPROVED_CHIPS.find((c) => c.id === id)?.text).filter(Boolean).join(' ');

  const toggle = (id: string) => {
    tick();
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_CARDS) return prev;
      return [...prev, id];
    });
  };

  const onSend = () => {
    if (!to || selected.length === 0) return;
    send.mutate(
      { recipientId: to, chipIds: selected, stampId },
      {
        onSuccess: () => {
          hapticSuccess();
          showAlert({
            title: 'Letter sent',
            message: `It arrives for ${name ?? 'them'} in about 12 hours.`,
            confirmText: 'Done',
            cancelText: null,
            onConfirm: () => router.replace('/(app)/letters/outbox' as Href),
          });
        },
        onError: (e) =>
          showAlert({ title: 'Not sent', message: letterErrorText(e), confirmText: 'OK', cancelText: null }),
      },
    );
  };

  if (!to) {
    return (
      <ScreenWrapper scrollable>
        <Header title="Write a letter" showBack />
        <Card style={{ padding: spacing.lg }}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Choose who to write to</Text>
          <Text style={[typography.body, { color: colors.text.secondary, marginTop: 6 }]}>
            Letters go to one person: someone who wrote to you, or someone open to new pen pals.
          </Text>
          <Link href={'/(app)/letters/discover' as Href} asChild>
            <Button label="Find a pen pal" style={{ marginTop: spacing.md }} />
          </Link>
        </Card>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      scrollable
      footer={
        <Button
          label={selected.length === 0 ? 'Add at least one card' : 'Send letter'}
          onPress={onSend}
          loading={send.isPending}
          disabled={selected.length === 0 || send.isPending}
        />
      }
    >
      <Header
        title={`To ${name ?? 'your pen pal'}`}
        subtitle="Built from cards, delivered in about 12 hours"
        showBack
        rightAction={<Badge label={`${selected.length}/${MAX_CARDS}`} variant={selected.length ? 'primary' : 'neutral'} />}
      />

      <View>
        {preview ? (
          <Card variant="surface1" style={{ padding: spacing.base, marginBottom: spacing.md }}>
            <Text style={[typography.captionBold, { color: colors.text.muted }]}>Your letter</Text>
            <Text style={[typography.body, { color: colors.text.primary, marginTop: 6 }]}>{preview}</Text>
          </Card>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.noGrow} contentContainerStyle={styles.row}>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} label={c.label} selected={category === c.id} onPress={() => setCategory(c.id)} />
          ))}
        </ScrollView>

        <View style={{ gap: 8, marginTop: spacing.md }}>
          {chips.map((chip) => {
            const on = selected.includes(chip.id);
            const full = !on && selected.length >= MAX_CARDS;
            return (
              <PressableScale
                key={chip.id}
                onPress={() => toggle(chip.id)}
                disabled={full}
                scaleTo={0.98}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on, disabled: full }}
              >
                <SquircleSurface
                  radius={18}
                  fill={on ? colors.primaryAlpha : colors.surface}
                  style={[styles.chipCard, { opacity: full ? 0.5 : 1 }]}
                >
                  <View style={styles.flex}>
                    <Text style={[typography.body, { color: on ? colors.primary : colors.text.primary }]}>{chip.text}</Text>
                    {chip.subtext ? (
                      <Text style={[typography.caption, { color: colors.text.muted, marginTop: 3 }]}>{chip.subtext}</Text>
                    ) : null}
                  </View>
                  <Ionicons
                    name={on ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={on ? colors.primary : colors.text.muted}
                  />
                </SquircleSurface>
              </PressableScale>
            );
          })}
        </View>

        <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Stamp
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.noGrow} contentContainerStyle={styles.row}>
          {stamps.map((s) => {
            const on = stampId === s.id;
            return (
              <PressableScale
                key={s.id}
                onPress={() => {
                  tick();
                  setStampId(s.id);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={s.name}
              >
                <SquircleSurface radius={18} fill={on ? colors.primaryAlpha : colors.surface} style={styles.stamp}>
                  <Ionicons name={STAMP_ICON[s.icon] ?? 'mail-outline'} size={24} color={on ? colors.primary : colors.text.secondary} />
                  <Text numberOfLines={1} style={[typography.captionBold, { color: colors.text.primary, marginTop: 6 }]}>
                    {s.name}
                  </Text>
                </SquircleSurface>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  noGrow: { flexGrow: 0 },
  row: { flexDirection: 'row', gap: 8 },
  chipCard: { alignItems: 'center', flexDirection: 'row', gap: 12, padding: 14 },
  stamp: { alignItems: 'center', height: 88, justifyContent: 'center', paddingHorizontal: 8, width: 104 },
});
